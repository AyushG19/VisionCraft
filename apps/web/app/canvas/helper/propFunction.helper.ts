import { DrawElement } from "@repo/common";
import { drawShape } from "../utils/drawing";

export const exportFunction = async (elements: DrawElement[]) => {
  if (elements.length === 0) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const e of elements) {
    switch (e.type) {
      case "rectangle":
      case "ellipse":
      case "diamond": {
        minX = Math.min(minX, e.startX, e.endX);
        minY = Math.min(minY, e.startY, e.endY);
        maxX = Math.max(maxX, e.startX, e.endX);
        maxY = Math.max(maxY, e.startY, e.endY);
        break;
      }

      //   {
      //   minX = Math.min(minX, e.startX);
      //   minY = Math.min(minY, e.startY);
      //   maxX = Math.max(maxX, e.startX + e.width);
      //   maxY = Math.max(maxY, e.startY + e.height);
      //   break;
      // }

      case "image":
      case "text": {
        minX = Math.min(minX, e.startX);
        minY = Math.min(minY, e.startY);
        maxX = Math.max(maxX, e.startX + e.width);
        maxY = Math.max(maxY, e.startY + e.height);
        break;
      }
      case "line":
      case "arrow": {
        const startPoint = e.points[0]!;
        const endPoint = e.points[2]!;
        minX = Math.min(minX, e.startX + startPoint.x);
        minY = Math.min(minY, e.startY + startPoint.y);
        maxX = Math.max(maxX, e.startX + endPoint.x);
        maxY = Math.max(maxY, e.startY + endPoint.y);
        break;
      }
      case "pencil": {
        for (const p of e.points) {
          minX = Math.min(minX, e.startX + p.x * (e.endX - e.startX));
          minY = Math.min(minY, e.startY + p.y * (e.endY - e.startY));
          maxX = Math.max(maxX, e.startX + p.x * (e.endX - e.startX));
          maxY = Math.max(maxY, e.startY + p.y * (e.endY - e.startY));
        }
        break;
      }
    }
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const canvas = document.createElement("canvas");
  const padX = w * 0.1;
  const padY = h * 0.1;

  // OffscreenCanvas(w + 2 * PADDING, h + 2 * PADDING);
  canvas.width = w + 2 * padX;
  canvas.height = h + 2 * padY;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.strokeStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(padX - minX, padY - minY);
    for (const e of elements) {
      if (e.isDeleted) continue;
      drawShape(ctx, e, { x: 0, y: 0, z: 1 }, false);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "drawing.png";
      a.click();

      requestAnimationFrame(() => {
        URL.revokeObjectURL(url);
        canvas.remove();
      });
    });
  }
};
