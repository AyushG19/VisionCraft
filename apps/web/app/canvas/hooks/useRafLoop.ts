import { useEffect, useRef, RefObject, useCallback } from "react";
import { DrawElement } from "@repo/common";
import { MemberCursor } from "@repo/hooks";
import { Camera } from "./useCamera";
import { ActiveElementMapType, CanvasState, InteractionState } from "../types";
import { MarqueeState } from "../helper/selectInteraction.helper";
import { drawImageShape, drawShape, highlightShape } from "../utils/drawing";
import { drawGrid } from "../../lib/drawGrid";
import { getUserColor } from "../helper/color.helper";
import { worldToScreen } from "../../lib/math";
import { getGroupOutlineBounds } from "../utils/getBoundsHelpers";
import { drawGroupBoundingBox } from "../utils/drawing";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasStateRef: RefObject<CanvasState>;
  selectedElementsRef: RefObject<DrawElement[]>;
  marqueeStateRef: RefObject<MarqueeState | null>; // ← add
  cameraRef: RefObject<Camera>;
  cursorMapRef: RefObject<MemberCursor>;
  activeElementMapRef: RefObject<ActiveElementMapType>;
  staticDirtyRef: RefObject<boolean>;
  interactionState: React.RefObject<InteractionState>;
};

const useRafLoop = ({
  canvasRef,
  canvasStateRef,
  selectedElementsRef,
  marqueeStateRef, // ← add
  cameraRef,
  cursorMapRef,
  activeElementMapRef,
  staticDirtyRef,
  interactionState,
}: Props) => {
  const offscreenRef = useRef<OffscreenCanvas | null>(null);
  const offscreenCtxRef = useRef<OffscreenCanvasRenderingContext2D | null>(
    null,
  );
  const cursorElCache = useRef<Map<string, HTMLElement>>(new Map());
  const isRenderPending = useRef(false);
  const frameIdRef = useRef<number>(0);

  // all the refs needed inside renderLoop never change
  const propsRef = useRef({
    canvasRef,
    canvasStateRef,
    selectedElementsRef,
    marqueeStateRef,
    cameraRef,
    cursorMapRef,
    activeElementMapRef,
    staticDirtyRef,
  });

  // renderLoop always reads latest refs without needing useEffect
  propsRef.current = {
    canvasRef,
    canvasStateRef,
    selectedElementsRef,
    marqueeStateRef,
    cameraRef,
    cursorMapRef,
    activeElementMapRef,
    staticDirtyRef,
  };

  // everything through propsRef so it's always fresh
  const renderLoop = useCallback(() => {
    isRenderPending.current = false;

    const {
      canvasRef,
      canvasStateRef,
      selectedElementsRef,
      marqueeStateRef,
      cameraRef,
      cursorMapRef,
      activeElementMapRef,
      staticDirtyRef,
    } = propsRef.current;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width;
    const h = canvas.height;
    const cam = cameraRef.current!;

    if (
      !offscreenRef.current ||
      offscreenRef.current.width !== w ||
      offscreenRef.current.height !== h
    ) {
      offscreenRef.current = new OffscreenCanvas(w, h);
      offscreenCtxRef.current = offscreenRef.current.getContext("2d")!;
      staticDirtyRef.current = true;
    }

    if (staticDirtyRef.current) {
      const oc = offscreenCtxRef.current!;
      const selectedIds = new Set(selectedElementsRef.current.map((s) => s.id));

      oc.setTransform(1, 0, 0, 1, 0, 0);
      oc.clearRect(0, 0, w, h);
      oc.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, cam.x * dpr, cam.y * dpr);
      drawGrid(oc as any, cam, w / dpr, h / dpr);

      for (const shape of canvasStateRef.current!.drawnShapes) {
        if (selectedIds.has(shape.id)) continue;
        if (activeElementMapRef.current!.has(shape.id)) continue;
        if (shape.type === "image") {
          drawImageShape(oc as any, shape, () => {
            staticDirtyRef.current = true;
            scheduleRender();
          });
          continue;
        }
        drawShape(oc as any, shape, cam, false);
      }

      staticDirtyRef.current = false;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offscreenRef.current!, 0, 0);

    ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, cam.x * dpr, cam.y * dpr);

    for (const [, { element, userId }] of activeElementMapRef.current!) {
      drawShape(ctx, element, cam, true, element.id, getUserColor(userId));
    }

    for (const shape of selectedElementsRef.current) {
      let shapeId = interactionState.current.isDrawing ? undefined : shape.id;
      let multiselect = selectedElementsRef.current.length > 1 ? true : false;
      drawShape(ctx, shape, cam, multiselect, shapeId);
    }

    if (
      selectedElementsRef.current.length > 1 &&
      !marqueeStateRef.current?.isActive
    ) {
      const bounds = getGroupOutlineBounds(selectedElementsRef.current);
      if (bounds)
        highlightShape(ctx, { ...bounds, type: "marquee" }, cam.z, "#43D9FF");
    }

    const marquee = marqueeStateRef.current;
    if (marquee?.isActive) {
      const x = Math.min(marquee.startX, marquee.endX);
      const y = Math.min(marquee.startY, marquee.endY);
      const mw = Math.abs(marquee.endX - marquee.startX);
      const mh = Math.abs(marquee.endY - marquee.startY);

      highlightShape(
        ctx,
        { x, y, width: mw, height: mh, type: "marquee" },
        cameraRef.current.z,
        "#43D9FF",
      );
    }

    for (const [userId, cursor] of cursorMapRef.current!) {
      let el = cursorElCache.current.get(userId);

      if (el && !el.isConnected) {
        cursorElCache.current.delete(userId);
        el = undefined;
      }
      if (!el) {
        el = document.getElementById(`cursor:${userId}`) ?? undefined;
        // console.log("Cursor:", el);
        if (el) cursorElCache.current.set(userId, el);
      }
      if (!el) continue;
      const pos = worldToScreen(cursor.x, cursor.y, cam);
      el.style.transform = `translate(${pos.x - 20}px, ${pos.y - 3}px)`;
      console.log("Pos update: ", pos);
    }
  }, []);

  const scheduleRender = useCallback(() => {
    if (isRenderPending.current) return;
    isRenderPending.current = true;
    frameIdRef.current = requestAnimationFrame(renderLoop);
  }, [renderLoop]);

  // cleanup only
  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      isRenderPending.current = false;
    };
  }, []);

  return { scheduleRender };
};
export default useRafLoop;
