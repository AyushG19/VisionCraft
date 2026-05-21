import { useEffect, useRef, RefObject } from "react";
import { DrawElement } from "@repo/common";
import { MemberCursor } from "@repo/hooks";
import { Camera } from "./useCamera";
import { ActiveElementMapType, CanvasState } from "../types";
import { drawShape } from "../utils/drawing";
import { drawGrid } from "../../lib/drawGrid";
import { getUserColor } from "../helper/color.helper";
import { worldToScreen } from "../../lib/math";

type Props = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasStateRef: RefObject<CanvasState>; // always fresh via ref
  selectedElementRef: RefObject<DrawElement | undefined>;
  cameraRef: RefObject<Camera>;
  cursorMapRef: RefObject<MemberCursor>;
  activeElementMapRef: RefObject<ActiveElementMapType>;
  staticDirtyRef: RefObject<boolean>; // written by useCanvasRenderer
};

const useRafLoop = ({
  canvasRef,
  canvasStateRef,
  selectedElementRef,
  cameraRef,
  cursorMapRef,
  activeElementMapRef,
  staticDirtyRef,
}: Props) => {
  const offscreenRef = useRef<OffscreenCanvas | null>(null);
  const offscreenCtxRef = useRef<OffscreenCanvasRenderingContext2D | null>(
    null,
  );

  useEffect(() => {
    let frameId: number;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");

      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas!.width;
        const h = canvas!.height;
        const cam = cameraRef.current;

        // Recreate offscreen if canvas resized
        if (
          !offscreenRef.current ||
          offscreenRef.current.width !== w ||
          offscreenRef.current.height !== h
        ) {
          offscreenRef.current = new OffscreenCanvas(w, h);
          offscreenCtxRef.current = offscreenRef.current.getContext("2d")!;
          staticDirtyRef.current = true;
        }

        // Repaint static layer only when dirty
        if (staticDirtyRef.current) {
          console.log("dirty canvas");
          const oc = offscreenCtxRef.current!;
          oc.setTransform(1, 0, 0, 1, 0, 0);
          oc.clearRect(0, 0, w, h);
          oc.setTransform(
            cam.z * dpr,
            0,
            0,
            cam.z * dpr,
            cam.x * dpr,
            cam.y * dpr,
          );

          drawGrid(oc as any, cam, w / dpr, h / dpr);

          for (const shape of canvasStateRef.current.drawnShapes) {
            if (
              selectedElementRef.current &&
              shape.id === selectedElementRef.current.id
            )
              continue;

            if (activeElementMapRef.current.has(shape.id)) continue;
            drawShape(oc as any, shape, cam, selectedElementRef.current?.id);
          }

          staticDirtyRef.current = false; // reset after drawing
        }

        // Composite static layer onto main canvas
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(offscreenRef.current!, 0, 0);

        // Draw live elements on top
        ctx.setTransform(
          cam.z * dpr,
          0,
          0,
          cam.z * dpr,
          cam.x * dpr,
          cam.y * dpr,
        );

        for (const [, { element, userId }] of activeElementMapRef.current) {
          drawShape(ctx, element, cam, element.id, getUserColor(userId));
        }

        if (selectedElementRef.current) {
          drawShape(
            ctx,
            selectedElementRef.current,
            cam,
            selectedElementRef.current?.id,
          );
        }
      }

      // DOM cursor updates — touches no canvas API
      for (const [userId, cursor] of cursorMapRef.current) {
        const el = document.getElementById(`cursor:${userId}`);
        if (!el) continue;
        const pos = worldToScreen(cursor.x, cursor.y, cameraRef.current);
        el.style.transform = `translate(${pos.x - 20}px, ${pos.y - 3}px)`;
      }

      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(frameId);
  }, []); // safe — everything read through refs
};

export default useRafLoop;
