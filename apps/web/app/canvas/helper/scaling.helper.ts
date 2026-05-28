import { ExcalidrawElementSkeleton } from "@workspace/ui/components/types";
import { Transform, DiagramBounds, AIResultType } from "../types";
import { DrawElement, LinearType, ShapeType } from "@repo/common";

function getScalingFactors(elements: ExcalidrawElementSkeleton[]): number {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  elements.forEach((el) => {
    console.log(el);
    if (el.width) {
      minX = Math.min(el.x, minX);
      minY = Math.min(el.y, minY);
      maxX = Math.max(el.x + el.width, maxX);
      maxY = Math.max(el.y + el.height, maxY);
    }
  });
  const w = maxX - minX;
  const h = maxY - minY;

  if (w > window.innerWidth) {
    console.log(minX, minY, maxX, maxY);
    return (window.innerWidth * 0.8) / w;
  } else {
    console.log(minX, minY, maxX, maxY);
    return (window.innerHeight * 0.8) / h;
  }
}

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
