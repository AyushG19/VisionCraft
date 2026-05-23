import {
  DrawElement,
  PencilType,
  PointType,
  ShapeType,
  type ImageType,
} from "@repo/common";
import { DragStateType, ResizeStateType } from "../types";

export const createDragedElement = (
  dragState: DragStateType,
  currMousePos: { x: number; y: number },
  shape: DrawElement,
): DrawElement => {
  const newX = currMousePos.x - dragState.offsetX;
  const newY = currMousePos.y - dragState.offsetY;

  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond" ||
    shape.type === "pencil"
  ) {
    const dx = shape.endX - shape.startX;
    const dy = shape.endY - shape.startY;
    return {
      ...shape,
      startX: newX,
      startY: newY,
      endX: newX + dx,
      endY: newY + dy,
    };
  }

  if (shape.type === "text" || shape.type === "image") {
    return { ...shape, startX: newX, startY: newY };
  }

  if (shape.type === "arrow" || shape.type === "line") {
    const dx = shape.points[2]!.x - shape.startX;
    const dy = shape.points[2]!.y - shape.startY;
    return {
      ...shape,
      startX: newX,
      startY: newY,
      points: shape.points.map((p, i) =>
        i === 2 ? { x: newX + dx, y: newY + dy } : p,
      ),
    };
  }

  return shape;
};
// const dx = shape.endX - shape.startX;
// const dy = shape.endY - shape.startY;
// const clampedX = Math.max(
//   0,
//   Math.min(window.innerWidth - dx, currMousePos.x - dragState.offsetX),
// );
// const clampedY = Math.max(
//   0,
//   Math.min(window.innerHeight - dy, currMousePos.y - dragState.offsetY),
// );

// // if (shape.type === "PENCIL" && Array.isArray(shape.points)) {
// //   const newPointsArray = shape.points.map((point) => ({
// //     x: point.x - dragState.offsetX,
// //     y: point.y - dragState.offsetY,
// //   }));

// //   return {
// //     ...shape,
// //     points: newPointsArray,
// //   };
// // }

// return {
//   ...shape,
//   startX: clampedX,
//   startY: clampedY,
//   endX: clampedX + dx,
//   endY: clampedY + dy,
// };

type ResizableShape = ShapeType | PencilType | ImageType;

function isResizableShape(shape: DrawElement): shape is ResizableShape {
  return (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond" ||
    shape.type === "pencil" ||
    shape.type === "image"
  );
}

export const createResizedElement = (
  resizeState: ResizeStateType,
  currPos: PointType,
  liveShape: DrawElement, // ← rename parameter to avoid redeclaration conflict
): DrawElement => {
  if (
    !isResizableShape(liveShape) ||
    !isResizableShape(resizeState.originalShape)
  )
    return liveShape;

  const original = resizeState.originalShape; // snapshot for ALL branches

  if (liveShape.type === "image") {
    if (original.type !== "image") return liveShape;
    if (original.width === 0 || original.height === 0) return liveShape;

    const ratio = original.width / original.height; // ← from snapshot

    let anchorX = 0;
    let anchorY = 0;
    switch (resizeState.resizeDirection) {
      case "TOP_LEFT":
        anchorX = original.startX + original.width;
        anchorY = original.startY + original.height;
        break;
      case "TOP_RIGHT":
        anchorX = original.startX;
        anchorY = original.startY + original.height;
        break;
      case "BOTTOM_LEFT":
        anchorX = original.startX + original.width;
        anchorY = original.startY;
        break;
      case "BOTTOM_RIGHT":
        anchorX = original.startX;
        anchorY = original.startY;
        break;
      default:
        return liveShape;
    }

    const dx = currPos.x - anchorX;
    const dy = currPos.y - anchorY;
    const rawW = Math.abs(dx);
    const rawH = Math.abs(dy);

    let finalW: number, finalH: number;
    if (rawW / ratio > rawH) {
      finalW = rawW;
      finalH = rawW / ratio;
    } else {
      finalH = rawH;
      finalW = rawH * ratio;
    }

    const newStartX = dx < 0 ? anchorX - finalW : anchorX;
    const newStartY = dy < 0 ? anchorY - finalH : anchorY;

    return {
      ...liveShape,
      startX: newStartX,
      startY: newStartY,
      width: finalW,
      height: finalH,
    };
  }
  if (!("endX" in original) || !("endY" in original)) return liveShape;

  // All other resizable shapes — read anchors from snapshot
  let newStartX = original.startX;
  let newStartY = original.startY;
  let newEndX = original.endX;
  let newEndY = original.endY;

  switch (resizeState.resizeDirection) {
    case "TOP":
      newStartY = Math.min(currPos.y, original.endY);
      newEndY = Math.max(currPos.y, original.endY);
      break;

    case "BOTTOM":
      newStartY = Math.min(original.startY, currPos.y);
      newEndY = Math.max(original.startY, currPos.y);
      break;

    case "LEFT":
      newStartX = Math.min(currPos.x, original.endX);
      newEndX = Math.max(currPos.x, original.endX);
      break;

    case "RIGHT":
      newStartX = Math.min(original.startX, currPos.x);
      newEndX = Math.max(original.startX, currPos.x);
      break;

    case "TOP_LEFT":
      newStartX = Math.min(currPos.x, original.endX);
      newEndX = Math.max(currPos.x, original.endX);
      newStartY = Math.min(currPos.y, original.endY);
      newEndY = Math.max(currPos.y, original.endY);
      break;

    case "TOP_RIGHT":
      newStartX = Math.min(original.startX, currPos.x);
      newEndX = Math.max(original.startX, currPos.x);
      newStartY = Math.min(currPos.y, original.endY);
      newEndY = Math.max(currPos.y, original.endY);
      break;

    case "BOTTOM_LEFT":
      newStartX = Math.min(currPos.x, original.endX);
      newEndX = Math.max(currPos.x, original.endX);
      newStartY = Math.min(original.startY, currPos.y);
      newEndY = Math.max(original.startY, currPos.y);
      break;

    case "BOTTOM_RIGHT":
      newStartX = Math.min(original.startX, currPos.x);
      newEndX = Math.max(original.startX, currPos.x);
      newStartY = Math.min(original.startY, currPos.y);
      newEndY = Math.max(original.startY, currPos.y);
      break;
  }

  return {
    ...original,
    startX: newStartX,
    startY: newStartY,
    endX: newEndX,
    endY: newEndY,
  };
};
