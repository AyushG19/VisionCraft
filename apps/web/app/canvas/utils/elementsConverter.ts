import { ExcalidrawElementSkeleton } from "@repo/ui/components/types";
import { AIResultType } from "../types";
import { LinearType, DrawElement, ColorType, ShapeType } from "@repo/common";

function getFittedFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  maxFontSize: number = 20,
  fontFamily: string = DEFAULT_FONT,
): number {
  const avgCharWidth = 0.6;
  const lineHeight = 1.2;
  let lo = 1,
    hi = maxFontSize;

  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const estimatedWidth = text.length * mid * avgCharWidth;
    const estimatedHeight = mid * lineHeight;
    if (estimatedWidth <= boxWidth - 16 && estimatedHeight <= boxHeight - 8) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

const DEFAULT_STROKE: ColorType = { l: 100, c: 0, h: 0 };
const DEFAULT_BG: ColorType = { l: 100, c: 0, h: 0 };
const DEFAULT_FONT = "google sans code";

function baseFields(e: ExcalidrawElementSkeleton) {
  return {
    id: crypto.randomUUID(),
    strokeWidth: e.strokeWidth ?? 2,
    strokeColor: DEFAULT_STROKE,
    backgroundColor: DEFAULT_BG,
    isDeleted: false,
    isSelected: false,
    opacity: 1,
  };
}
function getArrowLength(points: [number, number][]): number {
  const last = points[points.length - 1]!;
  const first = points[0]!;
  return Math.sqrt(
    Math.pow(last[0] - first[0], 2) + Math.pow(last[1] - first[1], 2),
  );
}
export function convertExcalidrawToShape(
  e: ExcalidrawElementSkeleton,
  fontFamily: string = DEFAULT_FONT,
): DrawElement | null {
  switch (e.type) {
    case "rectangle":
    case "ellipse":
    case "diamond": {
      const w = e.width;
      const h = e.height;
      const shape: ShapeType = {
        ...baseFields(e),
        type: e.type,
        startX: e.x,
        startY: e.y,
        endX: e.x + w,
        endY: e.y + h,
        strokeType: "normal",
        ...(e.label && {
          label: {
            text: e.label.text,
            fontFamily,
            fontSize: getFittedFontSize(
              e.label.text,
              w,
              h,
              e.label.fontSize,
              fontFamily,
            ),
          },
        }),
      };
      return shape;
    }

    case "arrow":
    case "line": {
      const arrowLength = getArrowLength(e.points);
      const linear: LinearType = {
        ...baseFields(e),
        type: e.type,
        startX: e.x,
        startY: e.y,
        points: e.points.map(([px, py]: [number, number]) => ({
          x: px,
          y: py,
        })),
        strokeType: "normal",
        ...(e.label && {
          label: {
            text: e.label.text,
            fontFamily,
            // use half arrow length as max width — label shouldn't span full arrow
            fontSize: getFittedFontSize(
              e.label.text,
              arrowLength * 0.8,
              30,
              e.label.fontSize,
              fontFamily,
            ),
          },
        }),
      };
      return linear;
    }

    default: {
      console.warn("Unsupported excalidraw type:", (e as any).type);
      return null;
    }
  }
}

export function convertAllElements(
  elements: ExcalidrawElementSkeleton[],
  fontFamily?: string,
): AIResultType[] {
  return elements
    .map((e) => convertExcalidrawToShape(e, fontFamily))
    .filter((e): e is AIResultType => e !== null);
}
