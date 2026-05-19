import { RefObject, useCallback, useEffect, useRef } from "react";

export type Camera = { x: number; y: number; z: number };

const WORLD_LIMIT = 5000;
const PADDING = 50;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

function getInitialCamera(): Camera {
  if (typeof window === "undefined") return { x: 0, y: 0, z: 1 };
  return {
    x: window.innerWidth / 2 - WORLD_LIMIT / 2,
    y: window.innerHeight / 2 - WORLD_LIMIT / 2,
    z: 1,
  };
}

export function useCamera(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  currentTool: string,
  onCameraChange: () => void, // markStaticDirty from useCanvasRenderer
) {
  // ref instead of state — camera changes don't need React re-renders
  // RAF loop reads cameraRef.current directly every frame
  const cameraRef = useRef<Camera>(getInitialCamera());

  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const currentToolRef = useRef(currentTool);

  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  const updateCamera = useCallback(
    (updater: (prev: Camera) => Camera) => {
      cameraRef.current = updater(cameraRef.current);
      onCameraChange(); // mark static layer dirty
    },
    [onCameraChange],
  );

  const clampX = useCallback(
    (x: number, z: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return x;
      const minX = canvas.width - WORLD_LIMIT * z - PADDING;
      return Math.min(Math.max(x, minX), PADDING);
    },
    [canvasRef],
  );

  const clampY = useCallback(
    (y: number, z: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return y;
      const minY = canvas.height - WORLD_LIMIT * z - PADDING;
      return Math.min(Math.max(y, minY), PADDING);
    },
    [canvasRef],
  );

  const onPanStart = useCallback((e: MouseEvent) => {
    if (currentToolRef.current !== "hand") return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPanMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning.current) return;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      updateCamera((prev) => {
        const canvas = canvasRef.current;
        if (!canvas) return prev;

        const minX = canvas.width - WORLD_LIMIT * prev.z - PADDING;
        const maxX = PADDING;
        const minY = canvas.height - WORLD_LIMIT * prev.z - PADDING;
        const maxY = PADDING;
        const isOut =
          prev.x < minX || prev.x > maxX || prev.y < minY || prev.y > maxY;

        const friction = isOut ? 0.3 : 1;
        return {
          ...prev,
          x: prev.x + dx * friction,
          y: prev.y + dy * friction,
        };
      });
    },
    [canvasRef, updateCamera],
  );

  const onPanEnd = useCallback(() => {
    if (!isPanning.current) return;
    isPanning.current = false;

    // snap back to bounds if panned outside
    updateCamera((prev) => ({
      ...prev,
      x: clampX(prev.x, prev.z),
      y: clampY(prev.y, prev.z),
    }));
  }, [updateCamera, clampX, clampY]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // pinch / ctrl+scroll → zoom toward cursor
        const rect = canvas.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        updateCamera((prev) => {
          const delta = -e.deltaY * 0.001;
          const newZ = Math.min(Math.max(prev.z + delta, MIN_ZOOM), MAX_ZOOM);
          return {
            x: cursorX - ((cursorX - prev.x) / prev.z) * newZ,
            y: cursorY - ((cursorY - prev.y) / prev.z) * newZ,
            z: newZ,
          };
        });
      } else {
        // trackpad scroll → pan
        updateCamera((prev) => {
          const canvas = canvasRef.current;
          if (!canvas) return prev;

          const minX = canvas.width - WORLD_LIMIT * prev.z - PADDING;
          const maxX = PADDING;
          const minY = canvas.height - WORLD_LIMIT * prev.z - PADDING;
          const maxY = PADDING;
          const isOut =
            prev.x < minX || prev.x > maxX || prev.y < minY || prev.y > maxY;

          const friction = isOut ? 0.3 : 1;
          return {
            ...prev,
            x: prev.x - e.deltaX * friction,
            y: prev.y - e.deltaY * friction,
          };
        });
      }
    },
    [canvasRef, updateCamera],
  );

  return {
    cameraRef, // consumers read cameraRef.current, never a stale copy
    isPanning,
    onPanStart,
    onPanMove,
    onPanEnd,
    onWheel,
  };
}
