import { DrawElement } from "@repo/common";
import { useCallback, useEffect, useRef } from "react";

const DynamicCanvas = ({
  draw,
  elements,
  getSize,
}: {
  draw: (
    ctx: CanvasRenderingContext2D,
    shape: DrawElement,
    camera: { x: number; y: number; z: number },
    multiselect: boolean,
    selectedShapeId?: string,
  ) => void;
  elements: DrawElement[];
  getSize: (elements: DrawElement[]) => {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}) => {
  const canvasRefCallback = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas || elements.length === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const size = getSize(elements);
      if (!size) return;

      const padding = 40;
      canvas.width = size.width + padding;
      canvas.height = size.height + padding;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const offsetX = -size.x + padding / 2;
      const offsetY = -size.y + padding / 2;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      elements.forEach((e) => draw(ctx, e, { x: 0, y: 0, z: 1 }, false));
      ctx.restore();
    },
    [elements, draw, getSize],
  );

  return <canvas className="m-auto block" ref={canvasRefCallback} />;
};
export default DynamicCanvas;
