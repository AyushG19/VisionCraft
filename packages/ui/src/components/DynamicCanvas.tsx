import { DrawElement } from "@repo/common";
import { useEffect, useRef } from "react";

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
  const popupCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = popupCanvasRef.current;
    if (elements.length === 0 || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = getSize(elements);
    if (!size) return;
    canvas.width = size.width + 10;
    canvas.height = size.height + 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((e) => draw(ctx, e, { x: 1, y: 1, z: 1 }, false));
  }, [elements]);
  return <canvas className="m-auto block" ref={popupCanvasRef} />;
};
export default DynamicCanvas;
