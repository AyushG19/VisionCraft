import { DrawElement } from "@repo/common";
import { Bounds } from "../../lib/getHandles";
import { a } from "motion/react-m";

export const getOutlineBounds = (shape: DrawElement): Bounds => {
  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond"
  ) {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.endX - shape.startX,
      height: shape.endY - shape.startY,
    };
  } else if (shape.type === "line") {
  } else if (shape.type === "image") {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.width,
      height: shape.height,
    };
  } else if (shape.type === "text") {
  } else {
  }
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
};
export const getBoundsForHandles = (shape: DrawElement): Bounds => {
  if (
    shape.type === "rectangle" ||
    shape.type === "ellipse" ||
    shape.type === "diamond"
  ) {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.endX - shape.startX,
      height: shape.endY - shape.startY,
    };
  } else if (shape.type === "image") {
    return {
      x: shape.startX,
      y: shape.startY,
      width: shape.width,
      height: shape.height,
    };
  }
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
};
