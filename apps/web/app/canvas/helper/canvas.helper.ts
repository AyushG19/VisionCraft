export const measureText = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string,
): { width: number; height: number } => {
  const lines = text.split("\n");

  let maxWidth = 0;
  ctx.font = `${fontSize}px ${fontFamily}`;
  for (const line of lines) {
    maxWidth = Math.max(maxWidth, ctx.measureText(line).width);
  }

  const lineHeight = fontSize * 1.2; // Excalidraw-style
  const height = lines.length * lineHeight;
  return { width: maxWidth, height: height };
};
