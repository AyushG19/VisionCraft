import React from "react";
import { DrawElement } from "@repo/common";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { CanvasState, ActiveElementMapType } from "../types";
import {
  createDragedElement,
  createResizedElement,
} from "../utils/createTempShapeHelper";
import useInteractionState from "../hooks/useInteractionState";
export const createSelectInteraction = (
  interactionState: ReturnType<typeof useInteractionState>,
) => {
  const {
    interaction,
    startDrag,
    startResize,
    getDragState,
    getResizeState,
    resetDragAndResize,
  } = interactionState;

  const handleSelectMouseDown = (
    worldPos: { x: number; y: number },
    canvasState: CanvasState,
    selectedElementRef: React.RefObject<DrawElement | undefined>,
    activeElementMapRef: React.RefObject<ActiveElementMapType>,
  ): DrawElement | undefined => {
    if (selectedElementRef.current) {
      const outlineBounds = getOutlineBounds(selectedElementRef.current);
      if (outlineBounds && isInsideSelectBound(worldPos, outlineBounds)) {
        startDrag(selectedElementRef.current, worldPos, {
          x: selectedElementRef.current.startX,
          y: selectedElementRef.current.startY,
        });
        return selectedElementRef.current;
      }

      const hitHandle = isPointInHandle(
        worldPos.x,
        worldPos.y,
        getBoundsForHandles(selectedElementRef.current)!,
        undefined,
        selectedElementRef.current,
      );
      if (hitHandle) {
        startResize(hitHandle, selectedElementRef.current);
        return selectedElementRef.current;
      }
      return undefined;
    }

    const clicked = [...canvasState.drawnShapes]
      .reverse()
      .find((s) => !s.isDeleted && isClickOnShape(worldPos, s));

    if (!clicked) return undefined;

    const isLockedByOther = [...activeElementMapRef.current.values()].some(
      (entry) => entry.element.id === clicked.id,
    );

    if (isLockedByOther) return undefined;

    startDrag(clicked, worldPos, { x: clicked.startX, y: clicked.startY });
    return clicked;
  };

  const handleSelectMouseMove = (
    worldPos: { x: number; y: number },
    currSelected: DrawElement | undefined,
  ): DrawElement | undefined => {
    if (!currSelected) return;

    if (interaction.current.isDragging) {
      const preview = createDragedElement(
        getDragState(),
        worldPos,
        currSelected,
      );
      // Object.assign(selectedElementRef.current, preview);
      // sendActiveElementUpdate({
      //   type: "DRAG",
      //   payload: { ...selectedElementRef.current },
      // });
      return preview;
    }

    if (
      interaction.current.isResizing &&
      interaction.current.resizeDirection !== null
    ) {
      const preview = createResizedElement(
        getResizeState(),
        worldPos,
        currSelected,
      );
      // Object.assign(selectedElementRef.current, preview);
      // sendActiveElementUpdate({
      //   type: "RESIZE",
      //   payload: { ...selectedElementRef.current },
      // });
      return preview;
    }

    return;
  };

  const handleSelectMouseUp = (
    worldPos: { x: number; y: number },
    currSelected: DrawElement | undefined,
  ): DrawElement | undefined => {
    if (!currSelected) {
      resetDragAndResize();
      return;
    }

    if (interaction.current.isDragging) {
      const final = createDragedElement(getDragState(), worldPos, currSelected);
      // Object.assign(selectedElementRef.current, final);
      // dispatchWithSocket({
      //   type: "UPD_SHAPE",
      //   payload: { ...selectedElementRef.current },
      // });
      resetDragAndResize();
      return final;
    }

    if (interaction.current.isResizing) {
      const final = createResizedElement(
        getResizeState(),
        worldPos,
        currSelected,
      );
      // Object.assign(selectedElementRef.current, final);
      // dispatchWithSocket({
      //   type: "UPD_SHAPE",
      //   payload: { ...selectedElementRef.current },
      // });
      resetDragAndResize();
      return final;
    }

    resetDragAndResize();
    return;
  };

  return { handleSelectMouseDown, handleSelectMouseMove, handleSelectMouseUp };
};
