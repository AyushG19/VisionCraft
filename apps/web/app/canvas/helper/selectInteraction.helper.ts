import React from "react";
import { DrawElement } from "@repo/common";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getGroupOutlineBounds,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { CanvasState, ActiveElementMapType } from "../types";
import {
  createDraggedGroup,
  createResizedElement,
} from "../utils/createTempShapeHelper";
import useInteractionState from "../hooks/useInteractionState";

export type MarqueeState = {
  isActive: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

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

  // marquee state lives here pure interaction concern
  const marqueeRef = { current: null as MarqueeState | null };

  const handleSelectMouseDown = (
    worldPos: { x: number; y: number },
    canvasState: CanvasState,
    currSelected: DrawElement[],
    activeElementMapRef: React.RefObject<ActiveElementMapType>,
    isShiftHeld: boolean,
  ): DrawElement[] => {
    //check handles first — only single select has handles
    if (currSelected.length === 1 && !isShiftHeld) {
      const handleBounds = getBoundsForHandles(currSelected[0]!);
      if (handleBounds?.type === "rect") {
        const hitHandle = isPointInHandle(
          worldPos.x,
          worldPos.y,
          handleBounds,
          undefined,
        );
        if (hitHandle) {
          startResize(hitHandle, currSelected[0]!);
          return currSelected;
        }
      }
    }

    // check if hit the body of current selection
    // but ONLY when not shift-held — shift always goes to find new shape
    if (currSelected.length > 0 && !isShiftHeld) {
      const groupBounds = getGroupOutlineBounds(currSelected);
      if (groupBounds && isInsideSelectBound(worldPos, groupBounds)) {
        startDrag(currSelected, worldPos);
        return currSelected;
      }
    }

    // find a shape under the cursor
    const clicked = [...canvasState.drawnShapes]
      .reverse()
      .find((s) => !s.isDeleted && isClickOnShape(worldPos, s));

    // shift+click on a shape — toggle it in/out of selection
    if (clicked && isShiftHeld) {
      const isLockedByOther = [...activeElementMapRef.current.values()].some(
        (e) => e.element.id === clicked.id,
      );
      if (isLockedByOther) return currSelected;

      const alreadySelected = currSelected.some((s) => s.id === clicked.id);
      if (alreadySelected) {
        // deselect just this one
        const next = currSelected.filter((s) => s.id !== clicked.id);
        if (next.length > 0) startDrag(next, worldPos);
        return next;
      }
      // add to selection
      const next = [...currSelected, clicked];
      startDrag(next, worldPos);
      return next;
    }

    // plain click on a shape — select only this one
    if (clicked) {
      const isLockedByOther = [...activeElementMapRef.current.values()].some(
        (e) => e.element.id === clicked.id,
      );
      if (isLockedByOther) return isShiftHeld ? currSelected : [];

      startDrag([clicked], worldPos);
      return [clicked];
    }

    // clicked empty space — start marquee
    marqueeRef.current = {
      isActive: true,
      startX: worldPos.x,
      startY: worldPos.y,
      endX: worldPos.x,
      endY: worldPos.y,
    };

    // shift+click empty = keep existing selection and add to it via marquee
    // plain click empty = clear selection, start fresh marquee
    return isShiftHeld ? currSelected : [];
  };

  const handleSelectMouseMove = (
    worldPos: { x: number; y: number },
    currSelected: DrawElement[],
    canvasState: CanvasState,
    isShiftHeld: boolean,
  ): { shapes: DrawElement[]; marquee: MarqueeState | null } | null => {
    if (marqueeRef.current?.isActive) {
      marqueeRef.current = {
        ...marqueeRef.current,
        endX: worldPos.x,
        endY: worldPos.y,
      };

      const { startX, startY, endX, endY } = marqueeRef.current;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      // select all shapes whose bounding box intersects the marquee
      const inMarquee = canvasState.drawnShapes.filter((s) => {
        if (s.isDeleted) return false;
        const b = getOutlineBounds(s);
        if (!b) return null;
        return (
          b.x <= maxX &&
          b.x + b.width >= minX &&
          b.y <= maxY &&
          b.y + b.height >= minY
        );
      });

      // shift marquee adds to existing, plain marquee replaces
      const next = isShiftHeld
        ? [
            ...new Map(
              [...currSelected, ...inMarquee].map((s) => [s.id, s]),
            ).values(),
          ]
        : inMarquee;

      return { shapes: next, marquee: marqueeRef.current };
    }

    // normal drag/resize
    if (currSelected.length === 0) return { shapes: [], marquee: null };

    if (interaction.current.isDragging) {
      return {
        shapes: createDraggedGroup(getDragState(), worldPos, currSelected),
        marquee: null,
      };
    }

    if (
      currSelected.length === 1 &&
      interaction.current.isResizing &&
      interaction.current.resizeDirection !== null
    ) {
      return {
        shapes: [
          createResizedElement(getResizeState(), worldPos, currSelected[0]!),
        ],
        marquee: null,
      };
    }

    return null;
  };

  const handleSelectMouseUp = (
    worldPos: { x: number; y: number },
    currSelected: DrawElement[],
    canvasState: CanvasState,
    isShiftHeld: boolean,
  ): { shapes: DrawElement[]; didCommit: boolean } => {
    // end marquee selection is already up to date from mousemove
    if (marqueeRef.current?.isActive) {
      marqueeRef.current = null;
      resetDragAndResize();
      return { shapes: currSelected, didCommit: false };
    }

    if (currSelected.length === 0) {
      resetDragAndResize();
      return { shapes: [], didCommit: false };
    }

    if (interaction.current.isDragging) {
      const finals = createDraggedGroup(getDragState(), worldPos, currSelected);
      resetDragAndResize();
      return { shapes: finals, didCommit: true };
    }

    if (currSelected.length === 1 && interaction.current.isResizing) {
      const final = createResizedElement(
        getResizeState(),
        worldPos,
        currSelected[0]!,
      );
      resetDragAndResize();
      return { shapes: [final], didCommit: true };
    }

    resetDragAndResize();
    return { shapes: currSelected, didCommit: false };
  };

  const getMarquee = () => marqueeRef.current;

  return {
    handleSelectMouseDown,
    handleSelectMouseMove,
    handleSelectMouseUp,
    getMarquee,
  };
};
