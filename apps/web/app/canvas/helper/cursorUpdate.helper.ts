import { AllToolTypes, DrawElement } from "@repo/common";
import {
  getBoundsForHandles,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { HandleName } from "../../lib/getHandles";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import {
  getCursorSvg,
  getEraserSvg,
  getPencilSvg,
} from "../utils/getCustonSvg";
import { CROSSHAIR_TOOLS, HANDLE_CURSORS } from "../utils/handleCursor";

export const updateCursor = (
  canvas: HTMLCanvasElement,
  tool: AllToolTypes,
  worldPos: { x: number; y: number },
  selectedElementRef: React.RefObject<DrawElement | undefined>,
  allShapes: DrawElement[],
  isPanning: boolean,
  spaceHeld: boolean,
  isDragging: boolean,
  isResizing: boolean,
) => {
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
      const hoveredHandle: HandleName | null = isPointInHandle(
        worldPos.x,
        worldPos.y,
        handleBounds,
        undefined,
        selectedElement,
      );

      if (hoveredHandle) {
        canvas.style.cursor = HANDLE_CURSORS[hoveredHandle];
        return;
      }

      // Check selected shape body
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
};
