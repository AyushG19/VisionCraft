import { DrawElement } from "@repo/common";
import { drawShape } from "./drawing";
import { Camera } from "../hooks/useCamera";
import { drawGrid } from "@/lib/drawGrid";

export const imageCache = new Map<string, ImageBitmap | Promise<ImageBitmap>>();
export default function redrawPreviousShapes(
  ctx: CanvasRenderingContext2D,
  drawnShapes: DrawElement[],
  camera: Camera,
  currentShape?: DrawElement,
  selectedShapeId?: string,
  highlightColor?: string,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(
    camera.z * dpr,
    0,
    0,
    camera.z * dpr,
    camera.x * dpr,
    camera.y * dpr,
  );
  drawGrid(ctx, camera, ctx.canvas.width / dpr, ctx.canvas.height / dpr);
  for (const shape of drawnShapes) {
    if (currentShape?.id === shape.id) continue;
    console.log("no check");
    drawShape(ctx, shape, camera, selectedShapeId);
  }
  if (currentShape) {
    drawShape(ctx, currentShape, camera, selectedShapeId, highlightColor);
  }
}
