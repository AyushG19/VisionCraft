import { useEffect, useRef, RefObject, useCallback } from "react";
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
  canvasStateRef: RefObject<CanvasState>;
  selectedElementRef: RefObject<DrawElement | undefined>;
  cameraRef: RefObject<Camera>;
  cursorMapRef: RefObject<MemberCursor>;
  activeElementMapRef: RefObject<ActiveElementMapType>;
  staticDirtyRef: RefObject<boolean>;
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
  const cursorElCache = useRef<Map<string, HTMLElement>>(new Map());
  const isRenderPending = useRef(false);
  const frameIdRef = useRef<number>(0);

  // scheduleRender is the single entry point for anything that needs a repaint.
  // Multiple callers coalesce into one frame — if a frame is already queued,
  // calling this again is a no-op.
  const scheduleRender = useCallback(() => {
    if (isRenderPending.current) return;
    isRenderPending.current = true;
    frameIdRef.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      isRenderPending.current = false;
    };
  }, []);

  const renderLoop = () => {
    isRenderPending.current = false; // reset first so any write during draw can schedule next frame

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width;
    const h = canvas.height;
    const cam = cameraRef.current!;

    // recreate offscreen canvas on resize
    if (
      !offscreenRef.current ||
      offscreenRef.current.width !== w ||
      offscreenRef.current.height !== h
    ) {
      offscreenRef.current = new OffscreenCanvas(w, h);
      offscreenCtxRef.current = offscreenRef.current.getContext("2d")!;
      staticDirtyRef.current = true;
    }

    // static layer — only repaints when explicitly marked dirty
    if (staticDirtyRef.current) {
      const oc = offscreenCtxRef.current!;
      const selected = selectedElementRef.current;

      oc.setTransform(1, 0, 0, 1, 0, 0);
      oc.clearRect(0, 0, w, h);
      oc.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, cam.x * dpr, cam.y * dpr);
      drawGrid(oc as any, cam, w / dpr, h / dpr);

      for (const shape of canvasStateRef.current!.drawnShapes) {
        if (selected && shape.id === selected.id) continue;
        if (activeElementMapRef.current.has(shape.id)) continue;
        drawShape(oc as any, shape, cam, selected?.id);
      }

      staticDirtyRef.current = false;
    }

    // composite static layer — single drawImage call
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(offscreenRef.current!, 0, 0);

    // dynamic layer — remote active elements
    ctx.setTransform(cam.z * dpr, 0, 0, cam.z * dpr, cam.x * dpr, cam.y * dpr);
    for (const [, { element, userId }] of activeElementMapRef.current!) {
      drawShape(ctx, element, cam, element.id, getUserColor(userId));
    }

    // dynamic layer — local selected/in-progress shape
    if (selectedElementRef.current) {
      drawShape(
        ctx,
        selectedElementRef.current,
        cam,
        selectedElementRef.current.id,
      );
    }

    // cursor DOM updates — no canvas API, just CSS transforms
    for (const [userId, cursor] of cursorMapRef.current!) {
      let el = cursorElCache.current.get(userId);
      if (!el) {
        el = document.getElementById(`cursor:${userId}`) ?? undefined;
        if (el) cursorElCache.current.set(userId, el);
      }
      if (!el) continue;
      const pos = worldToScreen(cursor.x, cursor.y, cam);
      el.style.transform = `translate(${pos.x - 20}px, ${pos.y - 3}px)`;
    }

    // loop does NOT reschedule itself — it sleeps until scheduleRender() is called
  };

  return { scheduleRender };
};

export default useRafLoop;
