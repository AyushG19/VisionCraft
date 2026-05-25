export type Bounds = { x: number; y: number; width: number; height: number };
export type HandleName =
  | "TOP"
  | "RIGHT"
  | "BOTTOM"
  | "LEFT"
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "POINT";

export interface Handle {
  name: HandleName;
  x: number;
  y: number;
  size: number;
}

// Helper to compute handles once
export const getHandles = (
  bounds: Bounds,
  handleSize: number = 6,
): Handle[] => {
  const { x, y, width, height } = bounds;
  const left = Math.min(x, x + width);
  const right = Math.max(x, x + width);
  const top = Math.min(y, y + height);
  const bottom = Math.max(y, y + height);
  const half = handleSize / 2;

  return [
    { name: "TOP_LEFT", x: left - half, y: top - half, size: handleSize },
    { name: "TOP_RIGHT", x: right - half, y: top - half, size: handleSize },
    { name: "BOTTOM_LEFT", x: left - half, y: bottom - half, size: handleSize },
    {
      name: "BOTTOM_RIGHT",
      x: right - half,
      y: bottom - half,
      size: handleSize,
    },
  ];
};
