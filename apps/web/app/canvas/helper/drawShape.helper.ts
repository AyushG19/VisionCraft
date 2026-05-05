import { ColorType, PointType, TextType } from "@repo/common";
import oklchToCSS from "@/lib/oklchToCss";
import { Point } from "motion";

export const drawSmoothPencilPath = (
  ctx: CanvasRenderingContext2D,
  points: readonly Point[],
  startPos: PointType,
  width: number,
  height: number,
  isNormalized: boolean,
): void => {
  if (points.length < 2) return;

  const getScreenPoint = (p: Point) => {
    if (isNormalized) {
      return {
        x: startPos.x + p.x * width,
        y: startPos.y + p.y * height,
      };
    }
    return { x: p.x, y: p.y };
  };

  const p0 = getScreenPoint(points[0]!);
  const p1 = getScreenPoint(points[1]!);

  ctx.moveTo(p0.x, p0.y);

  if (points.length === 2) {
    ctx.lineTo(p1.x, p1.y);
    return;
  }

  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = getScreenPoint(points[i]!);
    const nextPoint = getScreenPoint(points[i + 1]!);

    const controlX = currentPoint.x;
    const controlY = currentPoint.y;

    const endX = (currentPoint.x + nextPoint.x) / 2;
    const endY = (currentPoint.y + nextPoint.y) / 2;

    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  }

  const lastPoint = getScreenPoint(points[points.length - 1]!);
  ctx.lineTo(lastPoint.x, lastPoint.y);
};

export const drawEnhancedArrow = (
  ctx: CanvasRenderingContext2D,
  points: readonly PointType[],
  startPos: PointType,
  fillColor?: ColorType | null,
): void => {
  const { x: startX, y: startY } = startPos;
  const secondEndX = startX + points[points.length - 2]!.x;
  const secondEndY = startY + points[points.length - 2]!.y;
  const endX = startX + points[points.length - 1]!.x;
  const endY = startY + points[points.length - 1]!.y;

  const width = endX - startX;
  const height = endY - startY;
  const length = Math.sqrt(width * width + height * height);

  const dx = endX - secondEndX;
  const dy = endY - secondEndY;
  const angle = Math.atan2(dy, dx);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(startX, startY);

  points.forEach((p) => {
    ctx.lineTo(startX + p.x, startY + p.y);
  });

  ctx.stroke();

  const headLength = Math.min(20, length * 0.2);

  const leftX = endX - headLength * Math.cos(angle - Math.PI / 8);
  const leftY = endY - headLength * Math.sin(angle - Math.PI / 8);
  const rightX = endX - headLength * Math.cos(angle + Math.PI / 8);
  const rightY = endY - headLength * Math.sin(angle + Math.PI / 8);

  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(leftX, leftY);
  ctx.moveTo(rightX, rightY);
  ctx.lineTo(endX, endY);
  ctx.closePath();

  if (fillColor) {
    // ctx.fillStyle = oklchToCSS(fillColor);
    // ctx.fill();
  }
  ctx.stroke();
};

export const drawRoundedRhombus = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 10,
  zoom: number = 1,
  isSelectionUI: boolean = false,
) => {
  const cx = x + width / 2;
  const cy = y + height / 2;

  const top = { x: cx, y };
  const right = { x: x + width, y: cy };
  const bottom = { x: cx, y: y + height };
  const left = { x, y: cy };

  // 1. Calculate desired radius based on zoom (grows huge when zooming out)
  const targetRadius = isSelectionUI ? radius / zoom : radius;

  // 2. THE FIX: Protect the shape's geometry!
  // The radius can safely be at most 25% of the shortest side.
  // If we exceed this, arcTo() will glitch and turn inside out.
  const maxSafeRadius = Math.min(width, height) * 0.25;
  const activeRadius = Math.min(radius, maxSafeRadius); // Clamp it

  const activeLineWidth = isSelectionUI ? 2 / zoom : 2;

  ctx.save();
  ctx.beginPath();

  // Start EXACTLY at the midpoint of the top-right edge
  ctx.moveTo(x + width * 0.75, y + height * 0.25);

  // Draw the corners safely
  ctx.arcTo(right.x, right.y, bottom.x, bottom.y, activeRadius);
  ctx.arcTo(bottom.x, bottom.y, left.x, left.y, activeRadius);
  ctx.arcTo(left.x, left.y, top.x, top.y, activeRadius);
  ctx.arcTo(top.x, top.y, right.x, right.y, activeRadius);

  ctx.closePath();

  ctx.lineWidth = activeLineWidth;
  ctx.lineJoin = "round"; // Hides sharp glitches if they somehow happen
  ctx.stroke();
  ctx.restore();
};

function drawText(ctx: CanvasRenderingContext2D, el: TextType) {
  ctx.save();

  ctx.font = `${el.fontSize}px ${el.fontFamily}`;
  ctx.fillStyle = oklchToCSS(el.strokeColor);
  ctx.textAlign = el.textAlign;
  ctx.textBaseline = "top";

  ctx.fillText(el.text, el.startX, el.startY);
}
