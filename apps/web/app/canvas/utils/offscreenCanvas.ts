// offscreenCanvas.ts
let offscreen: OffscreenCanvas | null = null;
let offscreenCtx: OffscreenCanvasRenderingContext2D | null = null;
let staticDirty = false;

export function markStaticDirty() {
  staticDirty = true;
}

export function clearStaticDirty() {}

export function getOffscreenCtx(width: number, height: number) {
  if (!offscreen || offscreen.width !== width || offscreen.height !== height) {
    offscreen = new OffscreenCanvas(width, height);
    offscreenCtx = offscreen.getContext("2d")!;
    staticDirty = true;
  }
  return { offscreen, offscreenCtx: offscreenCtx!, staticDirty };
}
