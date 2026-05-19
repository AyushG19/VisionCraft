import { useRef, useCallback } from "react";
import { DrawElement, PointType } from "@repo/common";
import { DragStateType, InteractionState, ResizeStateType } from "../types";
import { HandleName } from "../../lib/getHandles";

const useInteractionState = () => {
  const interactionRef = useRef<InteractionState>({
    isDrawing: false,
    isDragging: false,
    isResizing: false,
    draggedShapeId: null,
    resizeDirection: null,
    startPos: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
  });

  const tempShapeRef = useRef<DrawElement | undefined>(undefined);
  const eraseStateRef = useRef<{
    isErasing: boolean;
    elementsToDelete: string[];
  }>({ isErasing: false, elementsToDelete: [] });

  //here we write
  const startDrag = useCallback(
    (
      shapeId: string,
      clickPos: { x: number; y: number },
      shapeOrigin: { x: number; y: number },
    ) => {
      interactionRef.current = {
        ...interactionRef.current,
        isDragging: true,
        draggedShapeId: shapeId,
        dragOffset: {
          x: clickPos.x - shapeOrigin.x,
          y: clickPos.y - shapeOrigin.y,
        },
      };
    },
    [],
  );

  const startResize = useCallback((direction: HandleName) => {
    interactionRef.current = {
      ...interactionRef.current,
      isResizing: true,
      resizeDirection: direction,
    };
  }, []);

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
    interactionRef.current.draggedShapeId = null;
    interactionRef.current.resizeDirection = null;
  }, []);

  const stopDrawing = useCallback(() => {
    interactionRef.current.isDrawing = false;
  }, []);

  // raders
  const getDragState = useCallback(
    (): DragStateType => ({
      draggedShapeId: interactionRef.current.draggedShapeId,
      isDragging: interactionRef.current.isDragging,
      offsetX: interactionRef.current.dragOffset.x,
      offsetY: interactionRef.current.dragOffset.y,
    }),
    [],
  );

  const getResizeState = useCallback(
    (): ResizeStateType => ({
      isResizing: interactionRef.current.isResizing,
      resizeDirection: interactionRef.current.resizeDirection,
    }),
    [],
  );

  return {
    interaction: interactionRef,
    tempShapeRef,
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
