import { HandleName } from "../../lib/getHandles";

export const HANDLE_CURSORS: Record<HandleName, string> = {
  TOP: "n-resize",
  BOTTOM: "s-resize",
  LEFT: "w-resize",
  RIGHT: "e-resize",
  TOP_LEFT: "nw-resize",
  TOP_RIGHT: "ne-resize",
  BOTTOM_LEFT: "sw-resize",
  BOTTOM_RIGHT: "se-resize",
  POINT: "crosshair",
};

export const CROSSHAIR_TOOLS = [
  "arrow",
  "rectangle",
  "ellipse",
  "diamond",
  "line",
];
