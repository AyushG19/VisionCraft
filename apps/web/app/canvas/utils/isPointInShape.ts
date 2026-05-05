import { DrawElement, PointType, ShapeType } from "@repo/common";
import { Bounds, getHandles, HandleName } from "@/lib/getHandles";

// Helper function to check if point is near a line segment
const isPointNearLine = (
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  tol: number,
): boolean => {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const distSq = (px - ax) ** 2 + (py - ay) ** 2;
    return distSq <= tol * tol;
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;
  const distSq = (px - closestX) ** 2 + (py - closestY) ** 2;

  return distSq <= tol * tol;
};

export function isClickOnShape(
  points: PointType,
  shape: DrawElement,
  zoom: number = 1, // 👈 Pass your camera.z here!
): boolean {
  // no matter how zoomed in or out you are.
  const SCREEN_PADDING = 8;
  const hitTolerance = (shape.strokeWidth || 2) / 2 + SCREEN_PADDING / zoom;

  switch (shape.type) {
    case "line": {
      const endX = shape.startX + shape.points[2]!.x;
      const endY = shape.startY + shape.points[2]!.y;
      return isPointNearLine(
        points.x,
        points.y,
        shape.startX,
        shape.startY,
        endX,
        endY,
        hitTolerance,
      );
    }

    case "rectangle": {
      const minX = Math.min(shape.startX, shape.endX);
      const maxX = Math.max(shape.startX, shape.endX);
      const minY = Math.min(shape.startY, shape.endY);
      const maxY = Math.max(shape.startY, shape.endY);

      if (shape.backgroundColor || shape.fillColor) {
        return (
          points.x >= minX &&
          points.x <= maxX &&
          points.y >= minY &&
          points.y <= maxY
        );
      }

      // Check distance to the 4 edges
      return (
        isPointNearLine(
          points.x,
          points.y,
          minX,
          minY,
          maxX,
          minY,
          hitTolerance,
        ) || // Top
        isPointNearLine(
          points.x,
          points.y,
          maxX,
          minY,
          maxX,
          maxY,
          hitTolerance,
        ) || // Right
        isPointNearLine(
          points.x,
          points.y,
          maxX,
          maxY,
          minX,
          maxY,
          hitTolerance,
        ) || // Bottom
        isPointNearLine(
          points.x,
          points.y,
          minX,
          maxY,
          minX,
          minY,
          hitTolerance,
        ) // Left
      );
    }

    case "ellipse": {
      const centerX = (shape.startX + shape.endX) / 2;
      const centerY = (shape.startY + shape.endY) / 2;
      const rx = Math.abs(shape.endX - shape.startX) / 2;
      const ry = Math.abs(shape.endY - shape.startY) / 2;

      const dx = points.x - centerX;
      const dy = points.y - centerY;

      // Standard ellipse formula
      const distance = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);

      if (shape.backgroundColor || shape.fillColor) {
        return distance <= 1;
      }

      const tolRatio = hitTolerance / Math.max(rx, ry);
      return (
        distance >= Math.pow(1 - tolRatio, 2) &&
        distance <= Math.pow(1 + tolRatio, 2)
      );
    }

    case "diamond": {
      const width = Math.abs(shape.endX - shape.startX);
      const height = Math.abs(shape.endY - shape.startY);
      if (width === 0 || height === 0) return false;

      const cx = (shape.startX + shape.endX) / 2;
      const cy = (shape.startY + shape.endY) / 2;

      // 1. Is it filled? Use the fast Manhattan distance formula
      if (shape.backgroundColor || shape.fillColor) {
        const dx = Math.abs(points.x - cx);
        const dy = Math.abs(points.y - cy);
        return dx / (width / 2) + dy / (height / 2) <= 1;
      }

      // 2. If it's stroke only, check distance to the 4 diagonal lines
      const topX = cx,
        topY = Math.min(shape.startY, shape.endY);
      const rightX = Math.max(shape.startX, shape.endX),
        rightY = cy;
      const bottomX = cx,
        bottomY = Math.max(shape.startY, shape.endY);
      const leftX = Math.min(shape.startX, shape.endX),
        leftY = cy;

      return (
        isPointNearLine(
          points.x,
          points.y,
          topX,
          topY,
          rightX,
          rightY,
          hitTolerance,
        ) ||
        isPointNearLine(
          points.x,
          points.y,
          rightX,
          rightY,
          bottomX,
          bottomY,
          hitTolerance,
        ) ||
        isPointNearLine(
          points.x,
          points.y,
          bottomX,
          bottomY,
          leftX,
          leftY,
          hitTolerance,
        ) ||
        isPointNearLine(
          points.x,
          points.y,
          leftX,
          leftY,
          topX,
          topY,
          hitTolerance,
        )
      );
    }

    case "arrow": {
      const endX = shape.startX + shape.points[2]!.x;
      const endY = shape.startY + shape.points[2]!.y;
      const width = endX - shape.startX;
      const height = endY - shape.startY;

      const angle = Math.atan2(height, width);
      const length = Math.sqrt(width * width + height * height);
      const headLength = Math.min(20, length * 0.2);

      const leftX = endX - headLength * Math.cos(angle - Math.PI / 8);
      const leftY = endY - headLength * Math.sin(angle - Math.PI / 8);
      const rightX = endX - headLength * Math.cos(angle + Math.PI / 8);
      const rightY = endY - headLength * Math.sin(angle + Math.PI / 8);

      return (
        isPointNearLine(
          points.x,
          points.y,
          shape.startX,
          shape.startY,
          endX,
          endY,
          hitTolerance,
        ) || // Shaft
        isPointNearLine(
          points.x,
          points.y,
          endX,
          endY,
          leftX,
          leftY,
          hitTolerance,
        ) || // Left Head
        isPointNearLine(
          points.x,
          points.y,
          endX,
          endY,
          rightX,
          rightY,
          hitTolerance,
        ) // Right Head
      );
    }

    case "pencil": {
      if (!shape.points || shape.points.length < 2) return false;

      const getScreenPoint = (p: { x: number; y: number }) => {
        if (shape.isNormalized) {
          return {
            x: shape.startX + p.x * (shape.endX - shape.startX),
            y: shape.startY + p.y * (shape.endY - shape.startY),
          };
        }
        return { x: p.x, y: p.y };
      };

      for (let i = 0; i < shape.points.length - 1; i++) {
        const p1 = getScreenPoint(shape.points[i]!);
        const p2 = getScreenPoint(shape.points[i + 1]!);
        if (
          isPointNearLine(
            points.x,
            points.y,
            p1.x,
            p1.y,
            p2.x,
            p2.y,
            hitTolerance,
          )
        ) {
          return true;
        }
      }
      return false;
    }

    case "text": {
      // Text bounding box doesn't need to scale down with zoom as much, but we can add minor padding
      const padding = 5 / zoom;
      const minX = Math.min(shape.startX, shape.startX + shape.width) - padding;
      const maxX = Math.max(shape.startX, shape.startX + shape.width) + padding;
      const minY =
        Math.min(shape.startY, shape.startY + shape.height) - padding;
      const maxY =
        Math.max(shape.startY, shape.startY + shape.height) + padding;

      return (
        points.x >= minX &&
        points.x <= maxX &&
        points.y >= minY &&
        points.y <= maxY
      );
    }

    case "image": {
      const padding = 5 / zoom;
      const minX = Math.min(shape.startX, shape.startX + shape.width) - padding;
      const maxX = Math.max(shape.startX, shape.startX + shape.width) + padding;
      const minY =
        Math.min(shape.startY, shape.startY + shape.height) - padding;
      const maxY =
        Math.max(shape.startY, shape.startY + shape.height) + padding;

      return (
        points.x >= minX &&
        points.x <= maxX &&
        points.y >= minY &&
        points.y <= maxY
      );
    }
  }
  return false;
}

export const isPointInHandle = (
  px: number,
  py: number,
  bounds: Bounds,
  handleSize: number = 15,
  selectedShape?: ShapeType | undefined,
  zoom: number = 1, // 👈 ADD ZOOM
): HandleName | null => {
  // 1. HIT TEST THE CORNER HAND
  const handleHitBoxSize = (handleSize + 10) / zoom;

  const handles = getHandles(bounds, handleSize / zoom);

  for (const h of handles) {
    // Calculate the center of the handle
    const cx = h.x + h.size / 2;
    const cy = h.y + h.size / 2;
    const halfHitBox = handleHitBoxSize / 2;

    // Check if mouse is within the generous hit box around the center
    if (
      px >= cx - halfHitBox &&
      px <= cx + halfHitBox &&
      py >= cy - halfHitBox &&
      py <= cy + halfHitBox
    ) {
      return h.name;
    }
  }

  // 2. HIT TEST THE EDGES (LEFT, RIGHT, TOP, BOTTOM)
  if (!selectedShape) return null;

  const minX = Math.min(selectedShape.startX, selectedShape.endX);
  const maxX = Math.max(selectedShape.startX, selectedShape.endX);
  const minY = Math.min(selectedShape.startY, selectedShape.endY);
  const maxY = Math.max(selectedShape.startY, selectedShape.endY);

  const SCREEN_PADDING = 5;
  const tol = (selectedShape.strokeWidth || 2) / 2 + SCREEN_PADDING / zoom;

  if (Math.abs(px - minX) <= tol && py >= minY - tol && py <= maxY + tol)
    return "LEFT";
  if (Math.abs(px - maxX) <= tol && py >= minY - tol && py <= maxY + tol)
    return "RIGHT";
  if (Math.abs(py - minY) <= tol && px >= minX - tol && px <= maxX + tol)
    return "TOP";
  if (Math.abs(py - maxY) <= tol && px >= minX - tol && px <= maxX + tol)
    return "BOTTOM";

  return null;
};

export const isInsideSelectBound = (
  points: { x: number; y: number },
  bounds: Bounds,
  zoom: number = 1,
): boolean => {
  // tiny 2px screen buffer so selections is easy
  const padding = 2 / zoom;

  const minX = bounds.x - padding;
  const maxX = bounds.x + bounds.width + padding;
  const minY = bounds.y - padding;
  const maxY = bounds.y + bounds.height + padding;

  return (
    points.x >= minX && points.x <= maxX && points.y >= minY && points.y <= maxY
  );
};
