"use client";
import React, { useCallback } from "react";
import { ClientShapeManipulation, DrawElement } from "@repo/common";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { CanvasState, Action, ActiveElementMapType } from "../types";
import {
  createDraggedShape,
  createResizedShape,
} from "../utils/createTempShapeHelper";
import { HandleName } from "../../lib/getHandles";
import useInteractionState from "./useInteractionState";
// import { markStaticDirty } from "../utils/offscreenCanvas";

type UseInteractionStateReturn = ReturnType<typeof useInteractionState>;

function isLockedByOther(
  shapeId: string,
  myUserId: string,
  activeMap: ActiveElementMapType,
) {
  for (const [userId, entry] of activeMap) {
    if (entry.element.id === shapeId && entry.userId !== myUserId) return true;
  }
  return false;
}

const useSelectInteraction = (
  interactionState: UseInteractionStateReturn,
  dispatchWithSocket: (action: Action) => void,
) => {
  const {
    interaction,
    startDrag,
    startResize,
    getDragState,
    getResizeState,
    resetDragAndResize,
  } = interactionState;

  // useSocketWithWhiteboard.ts
  // const { currentUser } = useUser(); // null when not logged in

  // const userId = useMemo(() => {
  //   if (currentUser) return currentUser.userId; // authenticated + in room

  //   // anonymous local session
  //   const stored = sessionStorage.getItem("guestId");
  //   if (stored) return stored;
  //   const fresh = crypto.randomUUID();
  //   sessionStorage.setItem("guestId", fresh);
  //   return fresh;
  // }, [currentUser]);

  // Determines what was clicked and sets up the interaction mode.

  const handleSelectMouseDown = useCallback(
    (
      worldPos: { x: number; y: number },
      canvasState: CanvasState,
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      activeElementMapRef: React.RefObject<ActiveElementMapType>,
      // sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
      // userId: string,
      // activeElementMap: ActiveElementMapType,
    ): DrawElement | undefined => {
      //Case 1: Something already selected
      if (selectedElementRef.current) {
        const outlineBounds = getOutlineBounds(selectedElementRef.current);
        const handleBounds = getBoundsForHandles(selectedElementRef.current);

        // Clicked inside selected shape body? → Start drag
        if (isInsideSelectBound(worldPos, outlineBounds!)) {
          startDrag(selectedElementRef.current.id, worldPos, {
            x: selectedElementRef.current.startX,
            y: selectedElementRef.current.startY,
          });
          return selectedElementRef.current;
        }

        // Clicked on resize handle? → Start resize
        const hitHandle: HandleName | null = isPointInHandle(
          worldPos.x,
          worldPos.y,
          handleBounds!,
          undefined,
          selectedElementRef.current,
        );
        if (hitHandle) {
          startResize(hitHandle);
          return selectedElementRef.current;
        }
        return undefined;
      }

      //  Case 2: Click on different shape
      // Search from end so topmost (last-drawn) wins
      const clickedShape = [...canvasState.drawnShapes]
        .reverse()
        .find((shape: DrawElement) => isClickOnShape(worldPos, shape));

      if (!clickedShape) {
        return undefined;
      }

      // Inside handleSelectMouseDown, before allowing selection of a shape:
      // const isLockedByOther = [...activeElementMap.values()].some(
      //   (entry) => entry.element.id === clickedShape.id,
      // );
      // pure function — no shape mutation needed
      const isLockedByOther = [...activeElementMapRef.current.values()].some(
        (entry) => entry.element.id === clickedShape.id,
      );
      if (isLockedByOther) {
        return undefined;
      } else {
        // Immediately set up drag so click+drag works in one motion
        startDrag(clickedShape.id, worldPos, {
          x: clickedShape.startX,
          y: clickedShape.startY,
        });
        return clickedShape;
      }

      //if currently selected shape,and no new shape,make if shape selected flase remove active element from socket for others too
      // if (selectedElementRef.current && !clickedShape) {
      //   dispatchWithSocket({
      //     type: "UPD_SHAPE",
      //     payload: { ...selectedElementRef.current, isSelected: false },
      //   });
      //   sendActiveElementUpdate({ type: "DESELECT", payload: {} });
      // } else if (selectedElementRef.current && clickedShape) {
      //   dispatchWithSocket({
      //     type: "UPD_SHAPE",
      //     payload: { ...selectedElementRef.current, isSelected: false },
      //   });
      //   dispatchWithSocket({
      //     type: "UPD_SHAPE",
      //     payload: { ...clickedShape, isSelected: true },
      //   });
      // } else if (!selectedElementRef.current && clickedShape) {
      //   dispatchWithSocket({
      //     type: "UPD_SHAPE",
      //     payload: { ...clickedShape, isSelected: true },
      //   });
      // }

      // return undefined;

      //  Case 3: Clicked empty space → Deselect
    },
    [startDrag, startResize],
  );

  //  MOUSEMOVE
  // Handles drag and resize previews.
  // Returns true if it consumed the event (did a redraw).

  const handleSelectMouseMove = useCallback(
    (
      worldPos: { x: number; y: number },
      // ctx: CanvasRenderingContext2D,
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // canvasState: CanvasState,
      // camera: Camera,
      sendActiveElementUpdate: (event: ClientShapeManipulation) => void,
      // setSelectedElement: (element?: DrawElement) => void,
    ): boolean => {
      if (!selectedElementRef.current) return false;

      //  Drag preview
      if (interaction.current.isDragging) {
        const dragState = getDragState();
        const previewShape = createDraggedShape(
          dragState,
          worldPos,
          selectedElementRef.current,
        );
        selectedElementRef.current = previewShape;

        // setSelectedElement(previewShape);
        // redrawPreviousShapes(
        //   ctx,
        //   canvasState.drawnShapes,
        //   camera,
        //   previewShape,
        //   selectedElementRef.current.id,
        // );
        sendActiveElementUpdate({ type: "DRAG", payload: previewShape });
        return true;
      }

      //  Resize preview
      if (
        interaction.current.isResizing &&
        interaction.current.resizeDirection !== null
      ) {
        const resizeState = getResizeState();
        const previewShape = createResizedShape(
          resizeState,
          worldPos,
          selectedElementRef.current,
        );
        selectedElementRef.current = previewShape;
        // setSelectedElement(previewShape);

        // redrawPreviousShapes(
        //   ctx,
        //   canvasState.drawnShapes,
        //   camera,
        //   previewShape,
        //   currentSelected.id,
        // );
        sendActiveElementUpdate({ type: "RESIZE", payload: previewShape });
        return true;
      }

      return false;
    },
    [interaction, getDragState, getResizeState],
  );

  //  MOUSEUP
  // Commits drag or resize, updates selected shape, resets flags.

  const handleSelectMouseUp = useCallback(
    (
      worldPos: { x: number; y: number },
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      // setSelectedElement: (element?: DrawElement) => void,
    ): boolean => {
      if (!selectedElementRef.current) {
        resetDragAndResize();
        return false;
      }

      // ─── Commit drag ──────────────────────────────────────────
      if (interaction.current.isDragging) {
        const dragState = getDragState();
        const tempElement = createDraggedShape(
          dragState,
          worldPos,
          selectedElementRef.current,
        );

        dispatchWithSocket({
          type: "UPD_SHAPE",
          payload: tempElement,
        });
        selectedElementRef.current = tempElement;
        resetDragAndResize();
        return true;
        // setSelectedElement(finalShape);
      }

      // ─── Commit resize ────────────────────────────────────────
      if (interaction.current.isResizing) {
        const resizeState = getResizeState();
        selectedElementRef.current = createResizedShape(
          resizeState,
          worldPos,
          selectedElementRef.current,
        );

        dispatchWithSocket({
          type: "UPD_SHAPE",
          payload: selectedElementRef.current,
        });
        resetDragAndResize();
        return true;
        // setSelectedElement(finalShape);
      }
      return false;
    },
    [
      interaction,
      getDragState,
      getResizeState,
      dispatchWithSocket,
      resetDragAndResize,
    ],
  );

  return {
    handleSelectMouseDown,
    handleSelectMouseMove,
    handleSelectMouseUp,
  };
};

export default useSelectInteraction;
