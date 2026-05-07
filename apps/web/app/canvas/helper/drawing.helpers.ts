import { Labeltype, PointType } from "@repo/common";
import { Bounds, getHandles, Handle } from "../../lib/getHandles";

/** helper for label drawing */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  startPos: PointType,
  label: Labeltype,
  maxWidth: number,
) {
  ctx.font = `${label.fontSize}px ${label.fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label.text, startPos.x, startPos.y);
}

/** Draw all handles */
export const drawHandles = (
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  handleSize: number = 6,
  zoom: number,
): Handle[] => {
  const handles = getHandles(bounds, handleSize / zoom);

  ctx.setLineDash([]);
  handles.forEach(({ x, y, size }) => {
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, 1);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
  });

  return handles;
};

/** Helper function to create rounded rectangle path */
export const createRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 8,
): void => {
  const left = Math.abs(Math.min(x, x + width));
  const right = Math.abs(Math.max(x, x + width));
  const top = Math.abs(Math.min(y, y + height));
  const bottom = Math.abs(Math.max(y, y + height));

  const actualWidth = right - left;
  const actualHeight = bottom - top;

  const r = Math.min(radius, actualWidth / 2, actualHeight / 2);

  ctx.beginPath();
  ctx.moveTo(left + r, top);
  ctx.lineTo(right - r, top);
  ctx.quadraticCurveTo(right, top, right, top + r);
  ctx.lineTo(right, bottom - r);
  ctx.quadraticCurveTo(right, bottom, right - r, bottom);
  ctx.lineTo(left + r, bottom);
  ctx.quadraticCurveTo(left, bottom, left, bottom - r);
  ctx.lineTo(left, top + r);
  ctx.quadraticCurveTo(left, top, left + r, top);
  ctx.closePath();
};
