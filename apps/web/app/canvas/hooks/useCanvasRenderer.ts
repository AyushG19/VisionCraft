import { useEffect, useRef, RefObject } from "react";
import { DrawElement } from "@repo/common";
import { MemberCursor } from "@repo/hooks";
import { Camera } from "./useCamera";
import { ActiveElementMapType, CanvasState } from "../types";
import useRafLoop from "./useRafLoop";

const useCanvasRenderer = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasState: CanvasState,
  selectedElementRef: RefObject<DrawElement | undefined>,
  cameraRef: RefObject<Camera>, // ← ref directly from useCamera
  cursorMapRef: RefObject<MemberCursor>,
  activeElementMapRef: RefObject<ActiveElementMapType>,
  staticDirtyRef: RefObject<boolean>, // ← owned by useCanvasInteraction
) => {
  const canvasStateRef = useRef(canvasState);
  const prevDrawnShapesRef = useRef(canvasState.drawnShapes);
  const prevSelectedIdRef = useRef(selectedElementRef.current?.id);

  // Sync canvasState ref + detect static layer changes every render
  useEffect(() => {
    const shapesChanged =
      prevDrawnShapesRef.current !== canvasState.drawnShapes;
    const selectionChanged =
      prevSelectedIdRef.current !== selectedElementRef.current?.id;

    if (shapesChanged || selectionChanged) {
      staticDirtyRef.current = true;
    }

    canvasStateRef.current = canvasState;
    prevDrawnShapesRef.current = canvasState.drawnShapes;
    prevSelectedIdRef.current = selectedElementRef.current?.id;
  }); // no deps — runs every render

  const { scheduleRender } = useRafLoop({
    canvasRef,
    canvasStateRef,
    selectedElementRef,
    cameraRef,
    cursorMapRef,
    activeElementMapRef,
    staticDirtyRef,
  });
  return { scheduleRender };
};

export default useCanvasRenderer;
