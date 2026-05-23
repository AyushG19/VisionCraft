import { SideToolKitState } from "../types";
import {
  createNewPencil,
  createNewShape,
  finishPencil,
  updatePencil,
} from "../utils/createNewShape";
import { DrawElement, PointType, ToolKitType } from "@repo/common";
import useInteractionState from "../hooks/useInteractionState";

type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;

const createDrawInteraction = (interactionState: UseInteractionStateReturn) => {
  const { interaction, startDrawing, stopDrawing } = interactionState;

  // Initializes drawing. For pencil, creates the temp shape immediately.

  const handleDrawMouseDown = (
    worldPos: PointType,
    toolState: ToolKitType,
    sideToolKit: SideToolKitState,
  ): DrawElement | undefined => {
    startDrawing(worldPos);

    // for pendil create temp shape on mousedown so even
    // a single click (no drag) creates a dot
    if (toolState.currentTool === "pencil") {
      const preview = createNewPencil(
        worldPos,
        toolState.strokeSize,
        toolState.currentColor,
      );
      return preview;
    }
    const preview = createNewShape(
      toolState,
      sideToolKit,
      interaction.current.startPos,
      worldPos,
    );
    return preview;
  };

  const handleDrawMouseMove = (
    worldPos: PointType,
    toolState: ToolKitType,
    sideToolKit: SideToolKitState,
    currSelected: DrawElement,
  ): DrawElement | undefined => {
    if (!interaction.current.isDrawing) return;

    const tool = toolState.currentTool;

    if (tool === "pencil") {
      if (currSelected.type !== "pencil") return;

      const pencilPreview = updatePencil(worldPos, currSelected);

      return pencilPreview;
    }

    // Regular shapes
    const preview = createNewShape(
      toolState,
      sideToolKit,
      interaction.current.startPos,
      worldPos,
    );

    return preview;
  };

  // Finalizes and commits the shape.
  const handleDrawMouseUp = (
    worldPos: PointType,
    toolKitState: ToolKitType,
    sideTookKitState: SideToolKitState,
    currSelected: DrawElement | undefined,
    // setSelectedElement: (element?: DrawElement) => void,
  ) => {
    if (!interaction.current.isDrawing || !currSelected) return;

    const tool = toolKitState.currentTool;

    // ─── PENCIL tool (finalize)
    if (tool === "pencil") {
      if (currSelected.type !== "pencil") {
        stopDrawing();
        return;
      }
      const finalPencil = finishPencil(currSelected);

      stopDrawing();
      return finalPencil;
    }

    //  Regular shapes (finalize from start→end)
    const finalElement = createNewShape(
      toolKitState,
      sideTookKitState,
      interaction.current.startPos,
      worldPos,
    );

    stopDrawing();
    return finalElement;
  };

  return {
    handleDrawMouseDown,
    handleDrawMouseMove,
    handleDrawMouseUp,
  };
};

export default createDrawInteraction;
