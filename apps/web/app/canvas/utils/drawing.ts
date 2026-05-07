import oklchToCSS from "../../lib/oklchToCss";
import { ImageType, PointType, TextType, type DrawElement } from "@repo/common";
import { drawHandles, drawLabel } from "../../canvas/helper/drawing.helpers";
import { Camera } from "../hooks/useCamera";
import { imageCache } from "./redrawPreviousShapes";
import {
  drawEnhancedArrow,
  drawRoundedRhombus,
  drawSmoothPencilPath,
} from "../helper/drawShape.helper";
import { measureText } from "../helper/canvas.helper";

// Type definitions for better type safety
interface Point {
  x: number;
  y: number;
}

interface ColorType {
  // Define the structure of your color type based on your actual implementation
  l: number;
  c: number;
  h: number;
  a?: number;
}

// Type guard to check if shape has points
const hasPoints = (
  shape: DrawElement,
): shape is DrawElement & { points: Point[] } => {
  return (
    "points" in shape && Array.isArray(shape.points) && shape.points.length > 0
  );
};

// Type guard to check if shape has fill color
const hasFillColor = (
  shape: DrawElement,
): shape is DrawElement & { fillColor: ColorType } => {
  return "fillColor" in shape && shape.fillColor != null;
};

// Typ
const hasLineWidth = (
  shape: DrawElement,
): shape is DrawElement & { lineWidth: number } => {
  return "lineWidth" in shape && typeof shape.lineWidth === "number";
};

const hasContent = (
  shape: DrawElement,
): shape is DrawElement & { content: string } => {
  return "content" in shape && typeof shape.content === "string";
};

const handleStrokeType = (
  ctx: CanvasRenderingContext2D,
  shape: DrawElement,
  zoom: number = 1,
) => {
  if (shape.type === "image" || shape.type === "text") return;
  switch (shape.strokeType) {
    case "dash": {
      const first = shape.strokeWidth > 5 ? shape.strokeWidth : 6;
      const second = shape.strokeWidth > 5 ? shape.strokeWidth * 2 : 6;
      ctx.setLineDash([first / zoom, second / zoom]);
      break;
    }
    case "dotted": {
      const first = shape.strokeWidth > 5 ? shape.strokeWidth / 3 : 2;
      const sedond = shape.strokeWidth > 5 ? shape.strokeWidth * 2 : 6;
      ctx.setLineDash([first / zoom, sedond / zoom]);
      break;
    }
    case "normal": {
      ctx.setLineDash([]);
      break;
    }
  }
};
// Highlight selected shape (outline + handles)
const highlightShape = (
  ctx: CanvasRenderingContext2D,
  shape: DrawElement,
  bounds: { x: number; y: number; width: number; height: number },
  zoom: number,
  highlightColor: string,
) => {
  ctx.save();
  ctx.beginPath();
  // ctx.setLineDash([6 / zoom, 2 / zoom]);
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1 / zoom;

  ctx.strokeRect(
    bounds.x - 5 / zoom,
    bounds.y - 5 / zoom,
    bounds.width + 10 / zoom,
    bounds.height + 10 / zoom,
  );

  // Draw resize handles
  drawHandles(
    ctx,
    {
      x: bounds.x - 5 / zoom,
      y: bounds.y - 5 / zoom,
      width: bounds.width + 10 / zoom,
      height: bounds.height + 10 / zoom,
    },
    undefined,
    zoom,
  );
  ctx.restore();
};

function drawText(ctx: CanvasRenderingContext2D, el: TextType) {
  // ctx.save();

  ctx.font = `${el.fontSize}px ${el.fontFamily}`;
  ctx.fillStyle = oklchToCSS(el.strokeColor);
  ctx.textAlign = el.textAlign;
  ctx.textBaseline = "top";

  ctx.fillText(el.text, el.startX, el.startY);
}

//Draw line function
function drawLine(
  ctx: CanvasRenderingContext2D,
  startPos: PointType,
  points: readonly PointType[],
) {
  const { x: startX, y: startY } = startPos;
  const endPos = points[2]!;
  const endX = startX + endPos.x;
  const endY = startY + endPos.y;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  return;
}
// Main draw function
export const drawShape = (
  ctx: CanvasRenderingContext2D,
  shape: DrawElement,
  camera: Camera,
  selectedShapeId?: string,
  highlightColor: string = "#43D9FF",
): void => {
  if (!ctx || !shape || shape.isDeleted) return;
  const zoom = camera?.z ?? 1;
  const type = shape.type;

  ctx.save();
  // convert color
  ctx.strokeStyle = shape.strokeColor
    ? oklchToCSS(shape.strokeColor)
    : "#ffffff";
  ctx.lineWidth = shape.strokeWidth / zoom || 2 / zoom;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  handleStrokeType(ctx, shape, camera.z);

  try {
    if (type === "pencil") {
      ctx.beginPath();
      drawSmoothPencilPath(
        ctx,
        shape.points,
        {
          x: shape.startX,
          y: shape.startY,
        },
        shape.endX - shape.startX,
        shape.endY - shape.startY,
        shape.isNormalized,
      );
      ctx.stroke();
    }
    if (type === "arrow") {
      console.log(shape.startX, shape.points[2]!.x);
      drawEnhancedArrow(
        ctx,
        shape.points,
        { x: shape.startX, y: shape.startY },
        shape.strokeColor,
      );
    } else if (type === "ellipse") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const centerX = shape.startX + width / 2;
      const centerY = shape.startY + height / 2;
      const rx = Math.abs(width / 2);
      const ry = Math.abs(height / 2);

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
      if (shape.label) {
        ctx.fillStyle = oklchToCSS(shape.strokeColor);
        drawLabel(ctx, { x: centerX, y: centerY }, shape.label, width);
      }
      if (hasFillColor(shape))
        (ctx.fillStyle = oklchToCSS(shape.fillColor)), ctx.fill();
      ctx.stroke();
    } else if (type === "rectangle") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const radius = Math.min(8, Math.abs(width) / 8, Math.abs(height) / 8);

      ctx.beginPath();
      ctx.roundRect(shape.startX, shape.startY, width, height, 20);

      if (shape.label) {
        const centerY = shape.startY + height / 2;
        const centerX = shape.startX + width / 2;
        ctx.fillStyle = oklchToCSS(shape.strokeColor);
        drawLabel(ctx, { x: centerX, y: centerY }, shape.label, width);
      }

      if (hasFillColor(shape)) {
        console.log("has fill color");
        ctx.fillStyle = oklchToCSS(shape.fillColor);
        ctx.fill();
      }

      ctx.stroke();
    } else if (type === "diamond") {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const radius = Math.min(
        6 * camera.z,
        (Math.abs(width) * camera.z) / 10,
        (Math.abs(height) * camera.z) / 10,
      );
      drawRoundedRhombus(
        ctx,
        shape.startX,
        shape.startY,
        width,
        height,
        20,
        camera.z,
      );
      if (shape.label) {
        const centerY = shape.startY + height / 2;
        const centerX = shape.startX + width / 2;
        ctx.fillStyle = oklchToCSS(shape.strokeColor);
        drawLabel(ctx, { x: centerX, y: centerY }, shape.label, width);
      }
      if (hasFillColor(shape)) {
        ctx.fillStyle = oklchToCSS(shape.fillColor);
        ctx.fill();
      }
      ctx.stroke();
    } else if (type === "text") {
      drawText(ctx, shape);
    } else if (type === "line") {
      drawLine(ctx, { x: shape.startX, y: shape.startY }, shape.points);
    } else if (type === "image") {
      drawImageShape(ctx, shape, imageCache);
    }
  } finally {
    ctx.restore();
  }

  if (shape.id === selectedShapeId) {
    if (shape.type === "image") {
      const bounds = {
        x: shape.startX,
        y: shape.startY,
        width: shape.width,
        height: shape.height,
      };
      highlightShape(ctx, shape, bounds, zoom, highlightColor);
      return;
    }

    if (shape.type === "text") {
      const { width, height } = measureText(
        ctx,
        shape.text,
        shape.fontSize,
        shape.fontFamily,
      );
      const bounds = {
        x: shape.startX,
        y: shape.startY,
        width: width,
        height: height,
      };
      highlightShape(ctx, shape, bounds, zoom, highlightColor);
      return;
    }

    if (
      shape.type === "line" ||
      shape.type === "arrow" ||
      shape.type === "pencil"
    )
      return;

    if ("endX" in shape && "endY" in shape) {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const bounds = { x: shape.startX, y: shape.startY, width, height };
      highlightShape(ctx, shape, bounds, zoom, highlightColor);
    }
  }
};

export const drawImageShape = (
  ctx: CanvasRenderingContext2D,
  shape: ImageType,
  imageCache?: Map<string, ImageBitmap | Promise<ImageBitmap>>,
  onLoad?: () => void, // triggers re-render after bitmap loads
) => {
  if (!imageCache) return;

  const cached = imageCache.get(shape.id);
  ctx.lineWidth = shape.strokeWidth || 5;
  ctx.strokeStyle = oklchToCSS(shape.strokeColor) || "white";
  //Already ready — draw immediately
  if (cached instanceof ImageBitmap) {
    ctx.drawImage(
      cached,
      shape.startX,
      shape.startY,
      shape.width,
      shape.height,
    );
    return;
  }

  // Already loading — do nothing, wait for resolve
  if (cached instanceof Promise) return;

  // Not in cache yet — if has cloudinary link, load from URL
  if (shape.link) {
    const promise = fetch(shape.link)
      .then((r) => r.blob())
      .then((blob) => createImageBitmap(blob))
      .then((bm) => {
        imageCache.set(shape.id, bm);
        onLoad?.(); // trigger one redraw
        return bm;
      });
    imageCache.set(shape.id, promise); // block duplicate calls
    return;
  }
};
