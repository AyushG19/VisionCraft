import { DrawElement } from "@repo/common";
import { AIResultType } from "../types";

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// for line/arrow/pencil — endpoints instead of a bounding box
export type PointHandles = {
  type: "points";
  points: { x: number; y: number }[];
};

export type ShapeBounds =
  | (Bounds & { type: "rect" | "marquee" | "none" })
  | PointHandles;

// used for selection hit testing and marquee intersection
export const getOutlineBounds = (shape: DrawElement): Bounds | null => {
  switch (shape.type) {
    case "rectangle":
    case "ellipse":
    case "diamond":
    case "pencil": {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      return {
        x,
        y,
        width: Math.abs(shape.endX - shape.startX),
        height: Math.abs(shape.endY - shape.startY),
      };
    }

    case "image":
    case "text": {
      return {
        x: shape.startX,
        y: shape.startY,
        width: shape.width,
        height: shape.height,
      };
    }

    case "arrow":
    case "line": {
      const endX = shape.startX + shape.points[2]!.x;
      const endY = shape.startY + shape.points[2]!.y;

      const x = Math.min(shape.startX, endX);
      const y = Math.min(shape.startY, endY);

      return {
        x,
        y,
        width: Math.abs(endX - shape.startX),
        height: Math.abs(endY - shape.startY),
      };
    }

    default:
      return null;
  }
};

// used for drawing handles on selected shapes
// line/arrow/pencil get endpoint dots, not a resize box
export const getBoundsForHandles = (shape: DrawElement): ShapeBounds | null => {
  switch (shape.type) {
    case "rectangle":
    case "ellipse":
    case "diamond":
    case "pencil": {
      const x = Math.min(shape.startX, shape.endX);
      const y = Math.min(shape.startY, shape.endY);
      return {
        type: "rect",
        x,
        y,
        width: Math.abs(shape.endX - shape.startX),
        height: Math.abs(shape.endY - shape.startY),
      };
    }

    case "image":
    case "text": {
      return {
        type: "rect",
        x: shape.startX,
        y: shape.startY,
        width: shape.width,
        height: shape.height,
      };
    }

    case "arrow":
    case "line": {
      // endpoint dots at start and end — no box
      return {
        type: "points",
        points: [
          { x: shape.startX, y: shape.startY },
          {
            x: shape.startX + shape.points[2]!.x,
            y: shape.startY + shape.points[2]!.y,
          },
        ],
      };
    }

    default:
      return null;
  }
};

// convenience — callers that only need marquee intersection
// use this instead of getOutlineBounds directly
export const getGroupOutlineBounds = (
  shapes: DrawElement[] | AIResultType[],
): Bounds | null => {
  if (shapes.length === 0) return null;

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  for (const shape of shapes) {
    const b = getOutlineBounds(shape);
    if (!b) continue;
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }

  if (!isFinite(minX)) return null;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
