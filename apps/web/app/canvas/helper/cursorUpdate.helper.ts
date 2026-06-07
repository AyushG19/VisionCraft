import { AllToolTypes, DrawElement } from "@repo/common";
import {
  getBoundsForHandles,
  getGroupOutlineBounds,
  getOutlineBounds,
} from "../utils/getBoundsHelpers";
import { HandleName } from "../../lib/getHandles";
import {
  isClickOnShape,
  isInsideSelectBound,
  isPointInHandle,
} from "../utils/isPointInShape";
import { CROSSHAIR_TOOLS, HANDLE_CURSORS } from "../utils/handleCursor";

export const updateCursor = async (
  canvas: HTMLCanvasElement,
  tool: AllToolTypes,
  worldPos: { x: number; y: number },
  selectedElementsRef: React.RefObject<DrawElement[]>,
  allShapes: DrawElement[],
  isPanning: boolean,
  spaceHeld: boolean,
  isDragging: boolean,
  isResizing: boolean,
) => {
  if (!canvas) return;
  const { getCursorSvg, getEraserSvg, getPencilSvg } = await import(
    "../utils/getCustonSvg"
  );
  if (isPanning) {
    canvas.style.cursor = "grabbing";
    return;
  }
  if (tool === "hand") {
    canvas.style.cursor = "grab";
    return;
  }
  if (isDragging) {
    canvas.style.cursor = "move";
    return;
  }
  if (isResizing) return; // cursor already set by handle detection

  if (tool === "select") {
    const selected = selectedElementsRef.current;

    if (selected.length === 1) {
      const shape = selected[0]!;
      if (!shape.isDeleted) {
        const handleBounds = getBoundsForHandles(shape);

        // check resize handles — only available on single select
        if (handleBounds) {
          if (handleBounds.type === "rect") {
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
          } else if (handleBounds.type === "points") {
            // point handles (line/arrow/pencil) endpoint dots no resize cursor, just move when hovering near endpoints
            for (const point of handleBounds.points) {
              const dist = Math.hypot(
                worldPos.x - point.x,
                worldPos.y - point.y,
              );
              if (dist < 8) {
                canvas.style.cursor = "crosshair";
                return;
              }
            }
          }
        }

        // check shape body
        const outlineBounds = getOutlineBounds(shape);
        if (outlineBounds && isInsideSelectBound(worldPos, outlineBounds)) {
          canvas.style.cursor = "move";
          return;
        }
      }
    }

    if (selected.length > 1) {
      // handles not shown for multi select
      const groupBounds = getGroupOutlineBounds(selected);
      if (groupBounds && isInsideSelectBound(worldPos, groupBounds)) {
        canvas.style.cursor = "move";
        return;
      }
    }

    // not hovering over selection check all shapes
    const hoveredShape = allShapes.find(
      (s) => !s.isDeleted && isClickOnShape(worldPos, s),
    );
    if (hoveredShape) {
      canvas.style.cursor = "move";
      return;
    }

    canvas.style.cursor = `${getCursorSvg()} 20 3, auto`;
    return;
  }

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
