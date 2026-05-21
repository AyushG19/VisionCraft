import React, { useCallback } from "react";
import { Action, SideToolKitState } from "../types";
import {
  createNewPencil,
  createNewShape,
  finishPencil,
  updatePencil,
} from "../utils/createNewShape";
import {
  ClientShapeManipulation,
  DrawElement,
  PointType,
  ToolKitType,
} from "@repo/common";
import useInteractionState from "./useInteractionState";

type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;

const useDrawInteraction = (
  interactionState: UseInteractionStateReturn,
  dispatchWithSocket: (action: Action) => void,
  sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
) => {
  const { interaction, startDrawing, stopDrawing } = interactionState;

  const updateAndSend = (
    currentElement: DrawElement,
    newElement: DrawElement,
    type: "ADD_SHAPE" | "RESIZE",
  ) => {
    Object.assign(currentElement, newElement);
    if (type === "ADD_SHAPE")
      dispatchWithSocket({ type, payload: currentElement });
    else sendActiveElementUpdate({ type, payload: currentElement });
  };

  // Initializes drawing. For pencil, creates the temp shape immediately.

  const handleDrawMouseDown = useCallback(
    (
      worldPos: PointType,
      toolState: ToolKitType,
      sideToolKit: SideToolKitState,
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // setSelectedElement: (element: DrawElement) => void,
    ) => {
      startDrawing(worldPos);

      // for pendil create temp shape on mousedown so even
      // a single click (no drag) creates a dot
      if (toolState.currentTool === "pencil") {
        selectedElementRef.current = createNewPencil(
          worldPos,
          toolState.strokeSize,
          toolState.currentColor,
        );
        // setSelectedElement(initialShape);
      }
      selectedElementRef.current = createNewShape(
        toolState,
        sideToolKit,
        interaction.current.startPos,
        worldPos,
      );
    },
    [startDrawing],
  );

  //  MOUSEMOVE Updates preview for regular shapes or streams points for pencil.

  const handleDrawMouseMove = useCallback(
    (
      worldPos: PointType,
      // ctx: CanvasRenderingContext2D,
      toolState: ToolKitType,
      sideToolKit: SideToolKitState,
      // drawnShapes: DrawElement[],
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // camera: Camera,
      // sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
    ) => {
      if (!interaction.current.isDrawing || !selectedElementRef.current) return;

      const tool = toolState.currentTool;

      // PENCIL tool
      if (tool === "pencil") {
        if (selectedElementRef.current.type !== "pencil") return;

        const newPencilElement = updatePencil(
          worldPos,
          selectedElementRef.current,
        );

        updateAndSend(selectedElementRef.current, newPencilElement, "RESIZE");

        return;
      }

      // Regular shapes (preview from start→current)
      const newElement = createNewShape(
        toolState,
        sideToolKit,
        interaction.current.startPos,
        worldPos,
      );

      updateAndSend(selectedElementRef.current, newElement, "RESIZE");
    },
    [interaction],
  );

  // ---- MOUSEUP
  // Finalizes and commits the shape.

  const handleDrawMouseUp = useCallback(
    (
      worldPos: PointType,
      toolKitState: ToolKitType,
      sideTookKitState: SideToolKitState,
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // setSelectedElement: (element?: DrawElement) => void,
    ) => {
      if (!interaction.current.isDrawing || !selectedElementRef.current) return;

      const tool = toolKitState.currentTool;

      // ─── PENCIL tool (finalize)
      if (tool === "pencil") {
        stopDrawing();
        if (selectedElementRef.current.type === "pencil") {
          const finalShape = finishPencil(selectedElementRef.current);
          updateAndSend(selectedElementRef.current, finalShape, "ADD_SHAPE");
        }
        return;
      }

      //  Regular shapes (finalize from start→end)
      const finalShape = createNewShape(
        toolKitState,
        sideTookKitState,
        interaction.current.startPos,
        worldPos,
      );

      updateAndSend(selectedElementRef.current, finalShape, "ADD_SHAPE");

      stopDrawing();

      // setSelectedElement();
    },
    [interaction, stopDrawing, dispatchWithSocket],
  );

  return {
    handleDrawMouseDown,
    handleDrawMouseMove,
    handleDrawMouseUp,
  };
};

export default useDrawInteraction;
