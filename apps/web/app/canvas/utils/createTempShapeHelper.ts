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

type ResizableShape =
  | ShapeType // rectangle, ellipse, triangle
  | PencilType // pencil (has endX/endY in your model)
  | ImageType;

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
  shape: DrawElement,
): DrawElement => {
  if (!isResizableShape(shape)) return shape;

  if (shape.type === "image") {
    // Prevent division by zero errors if width/height are corrupted
    if (shape.width === 0 || shape.height === 0) return shape;

    // 1. Calculate the original aspect ratio
    const ratio = shape.width / shape.height;

    // 2. Find the "Anchor Point" (the corner directly opposite to the one you are dragging)
    let anchorX = 0;
    let anchorY = 0;

    switch (resizeState.resizeDirection) {
      case "TOP_LEFT":
        anchorX = shape.startX + shape.width;
        anchorY = shape.startY + shape.height;
        break;
      case "TOP_RIGHT":
        anchorX = shape.startX;
        anchorY = shape.startY + shape.height;
        break;
      case "BOTTOM_LEFT":
        anchorX = shape.startX + shape.width;
        anchorY = shape.startY;
        break;
      case "BOTTOM_RIGHT":
        anchorX = shape.startX;
        anchorY = shape.startY;
        break;
      default:
        // If it's a side handle (TOP, BOTTOM, LEFT, RIGHT), you usually either
        // ignore aspect ratio, or just return the shape.
        return shape;
    }

    // 3. Calculate the raw distance from the anchor to the mouse
    const dx = currPos.x - anchorX;
    const dy = currPos.y - anchorY;

    const rawW = Math.abs(dx);
    const rawH = Math.abs(dy);

    // 4. Pick the axis that the user is pulling the furthest to drive the scale
    let finalW, finalH;
    if (rawW / ratio > rawH) {
      finalW = rawW;
      finalH = rawW / ratio; // Force height to match ratio
    } else {
      finalH = rawH;
      finalW = rawH * ratio; // Force width to match ratio
    }

    // 5. Calculate new start positions.
    // If dx/dy are negative, the mouse was dragged past the anchor (inverting the shape).
    const newStartX = dx < 0 ? anchorX - finalW : anchorX;
    const newStartY = dy < 0 ? anchorY - finalH : anchorY;

    return {
      ...shape,
      startX: newStartX,
      startY: newStartY,
      width: finalW,
      height: finalH,
    };
  }
  let newStartX = shape.startX;
  let newStartY = shape.startY;
  let newEndX = shape.endX;
  let newEndY = shape.endY;

  switch (resizeState.resizeDirection) {
    case "TOP":
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "BOTTOM":
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;

    case "LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      break;

    case "RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      break;

    case "TOP_LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "TOP_RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      newStartY = Math.min(currPos.y, shape.endY);
      newEndY = Math.max(currPos.y, shape.endY);
      break;

    case "BOTTOM_LEFT":
      newStartX = Math.min(currPos.x, shape.endX);
      newEndX = Math.max(currPos.x, shape.endX);
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;

    case "BOTTOM_RIGHT":
      newStartX = Math.min(shape.startX, currPos.x);
      newEndX = Math.max(shape.startX, currPos.x);
      newStartY = Math.min(shape.startY, currPos.y);
      newEndY = Math.max(shape.startY, currPos.y);
      break;
  }

  return {
    ...shape,
    startX: newStartX,
    startY: newStartY,
    endX: newEndX,
    endY: newEndY,
  };
};
