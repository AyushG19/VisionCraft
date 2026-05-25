import React, { useEffect, useRef, RefObject } from "react";
import { DrawElement } from "@repo/common";
import { MemberCursor } from "@repo/hooks";
import { Camera } from "./useCamera";
import { ActiveElementMapType, CanvasState, InteractionState } from "../types";
import { MarqueeState } from "../helper/selectInteraction.helper";
import useRafLoop from "./useRafLoop";

const useCanvasRenderer = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  canvasState: CanvasState,
  selectedElementsRef: RefObject<DrawElement[]>,
  marqueeStateRef: RefObject<MarqueeState | null>,
  cameraRef: RefObject<Camera>,
  cursorMapRef: RefObject<MemberCursor>,
  activeElementMapRef: RefObject<ActiveElementMapType>,
  staticDirtyRef: RefObject<boolean>,
  interactionState: React.RefObject<InteractionState>,
) => {
  const canvasStateRef = useRef(canvasState);
  const prevDrawnShapesRef = useRef(canvasState.drawnShapes);

  // track selection as joined id string — handles single, multi, and empty
  const prevSelectedKeyRef = useRef(
    selectedElementsRef.current.map((s) => s.id).join(","),
  );

  useEffect(() => {
    const shapesChanged =
      prevDrawnShapesRef.current !== canvasState.drawnShapes;

    const currentKey = selectedElementsRef.current.map((s) => s.id).join(",");
    const selectionChanged = prevSelectedKeyRef.current !== currentKey;

    if (shapesChanged || selectionChanged) {
      staticDirtyRef.current = true;
    }

    canvasStateRef.current = canvasState;
    prevDrawnShapesRef.current = canvasState.drawnShapes;
    prevSelectedKeyRef.current = currentKey;
  });

  const { scheduleRender } = useRafLoop({
    canvasRef,
    canvasStateRef,
    selectedElementsRef,
    marqueeStateRef,
    cameraRef,
    cursorMapRef,
    activeElementMapRef,
    staticDirtyRef,
    interactionState,
  });

  return { scheduleRender };
};

export default useCanvasRenderer;
