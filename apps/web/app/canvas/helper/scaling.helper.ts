import { Transform, DiagramBounds } from "../types";

// export const getDiagramBounds = (elements: ShapeType[] | LinearType[]) => {
//   let minX = Infinity,
//     minY = Infinity,
//     maxX = -Infinity,
//     maxY = -Infinity;

//   for (const e of elements) {
//     if (e.type === "arrow") {
//       e.points.forEach(([px, py]) => {
//         minX = Math.min(minX, e.x + px);
//         minY = Math.min(minY, e.y + py);
//         maxX = Math.max(maxX, e.x + px);
//         maxY = Math.max(maxY, e.y + py);
//       });
//     } else {
//       minX = Math.min(minX, e.x);
//       minY = Math.min(minY, e.y);
//       maxX = Math.max(maxX, e.x + e.width);
//       maxY = Math.max(maxY, e.y + e.height);
//     }
//   }

//   return {
//     minX,
//     minY,
//     width: maxX - minX,
//     height: maxY - minY,
//   };
// };
export function getScaleFactor(bounds: DiagramBounds) {
  const padding = 0.8;

  const scaleX = (window.innerWidth * padding) / bounds.width;

  const scaleY = (window.innerHeight * padding) / bounds.height;

  return Math.min(scaleX, scaleY);
}
export function createTransform(
  bounds: DiagramBounds,
  scale: number,
  targetX: number,
  targetY: number,
): Transform {
  return {
    bounds,
    scale,
    targetX,
    targetY,
  };
}
