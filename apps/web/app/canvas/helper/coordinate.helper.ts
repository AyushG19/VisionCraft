import { PointType } from "@repo/common";
import { Camera } from "../../lib/math";

// Simple mouse position - no transform needed
export const getMousePos = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  pos: PointType,
): PointType => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  return {
    x: pos.x - rect.left,
    y: pos.y - rect.top,
  };
};

export const getMousePosOnWorld = (
  canvas: HTMLCanvasElement,
  pos: PointType,
  camera: Camera,
): PointType => {
  const rect = canvas.getBoundingClientRect();
  const x = pos.x - rect.left;
  const y = pos.y - rect.top;
  return {
    x: (x - camera.x) / camera.z,
    y: (y - camera.y) / camera.z,
  };
};
