import oklchToCSS from "../../lib/oklchToCss";
import { ImageType, PointType, TextType, type DrawElement } from "@repo/common";
import { drawHandles, drawLabel } from "../../canvas/helper/drawing.helpers";
import { Camera } from "../hooks/useCamera";
import {
  drawEnhancedArrow,
  drawRoundedRhombus,
  drawSmoothPencilPath,
} from "../helper/drawShape.helper";
import { measureText } from "../helper/canvas.helper";
import { ShapeBounds } from "./getBoundsHelpers";
import { getImage, setImage } from "./imageCache";

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

export const drawGroupBoundingBox = (
  ctx: CanvasRenderingContext2D,
  bounds: { x: number; y: number; width: number; height: number },
  cam: Camera,
) => {
  ctx.save();
  ctx.strokeStyle = "#6965db";
  ctx.lineWidth = 1 / cam.z; // stays 1px regardless of zoom
  ctx.setLineDash([5 / cam.z, 3 / cam.z]);
  ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  ctx.restore();
};

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
export const highlightShape = (
  ctx: CanvasRenderingContext2D,
  bounds: ShapeBounds,
  zoom: number,
  highlightColor: string,
) => {
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = 1 / zoom;
  bounds.type === "marquee" && ctx.setLineDash([6 / zoom, 2 / zoom]);

  // if (bounds.type === "marquee" || bounds.type === "rect") {
  if (bounds.type === "points") {
    bounds.points.forEach((p) => {
      ctx.moveTo(p.x + 5 / zoom, p.y);

      ctx.ellipse(p.x, p.y, 5 / zoom, 5 / zoom, 0, 0, Math.PI * 2);
    });

    ctx.stroke();
  } else {
    ctx.strokeRect(
      bounds.x - 5 / zoom,
      bounds.y - 5 / zoom,
      bounds.width + 10 / zoom,
      bounds.height + 10 / zoom,
    );
  }
  // Draw resize handles
  if (bounds.type === "rect")
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
  multiselect: boolean,
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
  ctx.globalAlpha = shape.opacity ?? 1;

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
      drawImageShape(ctx, shape);
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
      highlightShape(ctx, { ...bounds, type: "rect" }, zoom, highlightColor);
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
      highlightShape(ctx, { ...bounds, type: "rect" }, zoom, highlightColor);
      return;
    }

    if (
      shape.type === "line" ||
      shape.type === "arrow"
      // shape.type === "pencil"
    ) {
      const points: PointType[] = shape.points.map((s) => ({
        x: shape.startX + s.x,
        y: shape.startY + s.y,
      }));
      highlightShape(ctx, { type: "points", points }, zoom, highlightColor);
      return;
    }

    if ("endX" in shape && "endY" in shape) {
      const width = shape.endX - shape.startX;
      const height = shape.endY - shape.startY;
      const bounds = { x: shape.startX, y: shape.startY, width, height };
      highlightShape(
        ctx,
        { ...bounds, type: multiselect ? "none" : "rect" },
        zoom,
        highlightColor,
      );
    }
  }
};

export const drawImageShape = (
  ctx: CanvasRenderingContext2D,
  shape: ImageType,
  onLoad?: () => void, // triggers re-render after bitmap loads
) => {
  const cached = getImage(shape.id);
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
        setImage(shape.id, bm);
        onLoad?.(); // trigger one redraw
        return bm;
      });
    setImage(shape.id, promise); // block duplicate calls
    return;
  }
};
