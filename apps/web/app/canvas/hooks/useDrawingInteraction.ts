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
) => {
  const { interaction, startDrawing, stopDrawing } = interactionState;

  // Initializes drawing. For pencil, creates the temp shape immediately.

  const handleDrawMouseDown = useCallback(
    (
      worldPos: PointType,
      toolKitState: ToolKitType,
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // setSelectedElement: (element: DrawElement) => void,
    ) => {
      startDrawing(worldPos);

      // for pendil create temp shape on mousedown so even
      // a single click (no drag) creates a dot
      if (toolKitState.currentTool === "pencil") {
        selectedElementRef.current = createNewPencil(
          worldPos,
          toolKitState.strokeSize,
          toolKitState.currentColor,
        );
        // setSelectedElement(initialShape);
      }
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
      sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
    ) => {
      if (!interaction.current.isDrawing) return;

      const tool = toolState.currentTool;

      // PENCIL tool
      if (tool === "pencil") {
        if (
          !selectedElementRef.current ||
          selectedElementRef.current.type !== "pencil"
        )
          return;

        const newPencilElement = updatePencil(
          worldPos,
          selectedElementRef.current,
        );
        sendActiveElementUpdate({ type: "DRAG", payload: newPencilElement });
        selectedElementRef.current = newPencilElement;

        // Redraw with the growing pencil shape appended
        // redrawPreviousShapes(
        //   ctx,
        //   [...drawnShapes, updatedPencil],
        //   camera,
        //   undefined,
        //   selectedShapeId,
        // );
        return;
      }

      // Regular shapes (preview from start→current)
      const newElement = createNewShape(
        toolState,
        sideToolKit,
        interaction.current.startPos,
        worldPos,
      );

      sendActiveElementUpdate({ type: "DRAG", payload: newElement });
      selectedElementRef.current = newElement;

      // setSelectedElement(previewElement);
      // redrawPreviousShapes(
      //   ctx,
      //   drawnShapes,
      //   camera,
      //   previewShape,
      //   selectedShapeId,
      // );
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
      if (!interaction.current.isDrawing) return;

      const tool = toolKitState.currentTool;

      // ─── PENCIL tool (finalize)
      if (tool === "pencil") {
        stopDrawing();
        if (
          selectedElementRef.current &&
          selectedElementRef.current.type === "pencil"
        ) {
          const finalShape = finishPencil(selectedElementRef.current);
          dispatchWithSocket({
            type: "ADD_SHAPE",
            payload: finalShape,
          });
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

      dispatchWithSocket({
        type: "ADD_SHAPE",
        payload: finalShape,
      });

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
