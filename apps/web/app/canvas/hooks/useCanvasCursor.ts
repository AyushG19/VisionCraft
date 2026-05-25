import { useCallback } from "react";
import { AllToolTypes, DrawElement } from "@repo/common";
import { HandleName } from "../../lib/getHandles";
import {
  isInsideSelectBound,
  isPointInHandle,
  isClickOnShape,
} from "../utils/isPointInShape";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import {
  getCursorSvg,
  getEraserSvg,
  getPencilSvg,
} from "../utils/getCustonSvg";

const HANDLE_CURSORS: Record<HandleName, string> = {
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

const CROSSHAIR_TOOLS = ["arrow", "rectangle", "ellipse", "diamond", "line"];

const useCanvasCursor = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) => {
  const updateCursor = useCallback(
    (
      tool: AllToolTypes,
      worldPos: { x: number; y: number },
      selectedElementRef: React.RefObject<DrawElement | undefined>,
      allShapes: DrawElement[],
      isPanning: boolean,
      spaceHeld: boolean,
      isDragging: boolean,
      isResizing: boolean,
    ) => {
      const canvas = canvasRef.current;
      const selectedElement = selectedElementRef.current;
      if (!canvas) return;

      if (isPanning) {
        canvas.style.cursor = "grabbing";
        return;
      }
      if (tool === "hand") {
        canvas.style.cursor = "grab";
        return;
      }

      // During drag/resize, keep the appropriate cursor
      if (isDragging) {
        canvas.style.cursor = "move";
        return;
      }
      if (isResizing) {
        // Cursor already set by handle detection, keep it
        return;
      }

      if (tool === "select") {
        // Check selected shape first (higher priority)
        if (selectedElement && !selectedElement.isDeleted) {
          const outlineBounds = getOutlineBounds(selectedElement);
          const handleBounds = getBoundsForHandles(selectedElement);
          // Check resize handles
          if (!handleBounds) return;
          const hoveredHandle: HandleName | null = isPointInHandle(
            worldPos.x,
            worldPos.y,
            handleBounds,
            undefined,
          );

          if (hoveredHandle) {
            canvas.style.cursor = HANDLE_CURSORS[hoveredHandle];
            return;
          }

          // Check selected shape body
          if (!outlineBounds) return;
          if (isInsideSelectBound(worldPos, outlineBounds)) {
            canvas.style.cursor = "move";
            return;
          }
        }

        // Check other shapes
        const hoveredShape = allShapes.find((shape: DrawElement) =>
          isClickOnShape(worldPos, shape),
        );
        if (hoveredShape) {
          canvas.style.cursor = "move";
          return;
        }

        // Nothing hovered
        canvas.style.cursor = `${getCursorSvg()} 20 3, auto`;
        return;
      }

      // Drawing tool cursors
      if (CROSSHAIR_TOOLS.includes(tool)) {
        canvas.style.cursor = "crosshair";
        return;
      }

      if (tool === "eraser") {
        canvas.style.cursor = `${getEraserSvg()} 5 20, auto`;
        return;
      }

      if (tool === "pencil") {
        canvas.style.cursor = `${getPencilSvg()} 0 24, auto`;
        return;
      }

      if (tool === "text") {
        canvas.style.cursor = "text";
        return;
      }

      canvas.style.cursor = "default";
    },
    [canvasRef],
  );

  return { updateCursor };
};

export default useCanvasCursor;
