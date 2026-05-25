import { useRef, useCallback } from "react";
import { DrawElement, PointType } from "@repo/common";
import { DragStateType, InteractionState, ResizeStateType } from "../types";
import { HandleName } from "../../lib/getHandles";

const useInteractionState = () => {
  const interactionRef = useRef<InteractionState>({
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    resizeDirection: null,
    startPos: { x: 0, y: 0 },
    originalShape: null,
    groupDragOffsets: [], // ← replaces dragOffset + draggedShapeId
  });

  const tempShapesRef = useRef<DrawElement[]>([]);

  const eraseStateRef = useRef<{
    isErasing: boolean;
    elementsToDelete: string[];
  }>({ isErasing: false, elementsToDelete: [] });

  // accepts single shape or array — single is just array of one
  const startDrag = useCallback(
    (
      shapes: DrawElement | DrawElement[],
      clickPos: { x: number; y: number },
    ) => {
      const arr = Array.isArray(shapes) ? shapes : [shapes];
      interactionRef.current = {
        ...interactionRef.current,
        isDragging: true,
        groupDragOffsets: arr.map((s) => ({
          id: s.id,
          dx: clickPos.x - s.startX,
          dy: clickPos.y - s.startY,
        })),
      };
    },
    [],
  );

  const startResize = useCallback(
    (direction: HandleName, shape: DrawElement) => {
      interactionRef.current = {
        ...interactionRef.current,
        isResizing: true,
        resizeDirection: direction,
        originalShape: { ...shape },
      };
    },
    [],
  );

  const startDrawing = useCallback((pos: PointType) => {
    interactionRef.current = {
      ...interactionRef.current,
      isDrawing: true,
      startPos: pos,
    };
  }, []);

  const resetDragAndResize = useCallback(() => {
    interactionRef.current.isDragging = false;
    interactionRef.current.isResizing = false;
    interactionRef.current.resizeDirection = null;
    interactionRef.current.originalShape = null;
    interactionRef.current.groupDragOffsets = [];
  }, []);

  const stopDrawing = useCallback(() => {
    interactionRef.current.isDrawing = false;
  }, []);

  const getDragState = useCallback(
    (): DragStateType => ({
      isDragging: interactionRef.current.isDragging,
      groupDragOffsets: interactionRef.current.groupDragOffsets,
    }),
    [],
  );

  const getResizeState = useCallback(
    (): ResizeStateType => ({
      isResizing: interactionRef.current.isResizing,
      resizeDirection: interactionRef.current.resizeDirection,
      originalShape: interactionRef.current.originalShape!,
    }),
    [],
  );

  return {
    interaction: interactionRef,
    tempShapesRef,
    startDrag,
    startResize,
    startDrawing,
    resetDragAndResize,
    stopDrawing,
    getDragState,
    getResizeState,
    eraseStateRef,
  };
};

export default useInteractionState;
