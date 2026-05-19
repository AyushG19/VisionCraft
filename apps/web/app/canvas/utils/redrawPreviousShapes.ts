import { DrawElement } from "@repo/common";
import { drawShape } from "./drawing";
import { Camera } from "../hooks/useCamera";
import { drawGrid } from "../../lib/drawGrid";
import { markStaticDirty, getOffscreenCtx } from "./offscreenCanvas";
import { ActiveElementMapType } from "../types";
import { getUserColor } from "../helper/color.helper";

export const imageCache = new Map<string, ImageBitmap | Promise<ImageBitmap>>();

export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: DrawElement[],
  camera: Camera,
  activeElements: ActiveElementMapType,
  currentShape?: DrawElement,
  selectedShapeId?: string,
  highlightColor?: string,
) {
  const dpr = window.devicePixelRatio || 1;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  const { offscreen, offscreenCtx, staticDirty } = getOffscreenCtx(
    width,
    height,
  );

  // Only redraw static layer when persisted shapes or active keys change
  if (staticDirty) {
    offscreenCtx.setTransform(1, 0, 0, 1, 0, 0);
    offscreenCtx.clearRect(0, 0, width, height);
    offscreenCtx.setTransform(
      camera.z * dpr,
      0,
      0,
      camera.z * dpr,
      camera.x * dpr,
      camera.y * dpr,
    );
    drawGrid(offscreenCtx as any, camera, width / dpr, height / dpr);

    for (const shape of drawnShapes) {
      if (activeElements.has(shape.id)) continue; // skip — drawn live below
      drawShape(offscreenCtx as any, shape, camera, selectedShapeId);
    }

    markStaticDirty(); // reset — will be set externally when needed
    (offscreen as any)._clean = true;
  }

  // Composite static layer
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreen, 0, 0);

  // Draw active (live) elements on top — these change every frame
  ctx.setTransform(
    camera.z * dpr,
    0,
    0,
    camera.z * dpr,
    camera.x * dpr,
    camera.y * dpr,
  );

  for (const [, { element, userId }] of activeElements) {
    drawShape(ctx, element, camera, selectedShapeId, getUserColor(userId));
  }

  if (currentShape) {
    drawShape(ctx, currentShape, camera, selectedShapeId, highlightColor);
  }
}
