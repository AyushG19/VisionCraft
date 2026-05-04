type Annotation = {
  label: string;
  sub?: string;
  target: { x: number; y: number };
  origin: { x: number; y: number };
  flip?: boolean;
};
/**
 * drawSideToolkit
 * Renders a ghost/outline replica of the floating side toolkit panel.
 * Matches the HTML exactly: stroke color, background, stroke width slider,
 * stroke style buttons, and options (trash) button.
 *
 * @param ctx - CanvasRenderingContext2D
 * @param x   - left edge  (matches `left: 16px`)
 * @param y   - top edge   (matches `top: 80px`)
 */
export function drawSideToolkit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  const C_OUTLINE = "rgba(255,255,255,0.28)";
  const C_TEXT = "rgba(255,255,255,0.85)";
  const C_DIM = "rgba(255,255,255,0.40)";
  const C_SUBTLE = "rgba(255,255,255,0.12)";

  // panel dimensions — max-w-[250px], px-2 py-3, gap-3 between sections
  const PW = 230;
  const PAD_X = 8; // px-2
  const PAD_Y = 12; // py-3
  const GAP = 12; // gap-3

  // ── helpers ──────────────────────────────────────────────────────────────

  function rr(rx: number, ry: number, rw: number, rh: number, r: number) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, r);
  }

  function strokeRR(
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    r: number,
    color = C_OUTLINE,
    lw = 1,
  ) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    rr(rx, ry, rw, rh, r);
    ctx.stroke();
    ctx.restore();
  }

  function fillRR(
    rx: number,
    ry: number,
    rw: number,
    rh: number,
    r: number,
    color: string,
  ) {
    ctx.save();
    ctx.fillStyle = color;
    rr(rx, ry, rw, rh, r);
    ctx.fill();
    ctx.restore();
  }

  function txt(
    text: string,
    tx: number,
    ty: number,
    size = 16,
    align: CanvasTextAlign = "left",
    color = C_DIM,
  ) {
    ctx.save();
    ctx.font = `400 ${16}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, tx, ty);
    ctx.restore();
  }

  // Convert oklch to a rough hex for the swatch fills
  // (pre-converted from the HTML values)
  const STROKE_COLORS = [
    "#000000",
    "#ffffff",
    "#d93b2b", // oklch(0.6449 0.2236 21.34) ≈ vivid red
    "#e8d96a", // oklch(0.9336 0.0657 97.1)  ≈ warm yellow
    "#c4cfe8", // oklch(0.8673 0.0617 270.92) ≈ periwinkle
    "#d97b6a", // oklch(0.7901 0.1224 15.82)  ≈ salmon
    "#7dd9c0", // oklch(0.9048 0.1313 173.43) ≈ mint
    "#b89ee8", // oklch(0.8047 0.1032 295.3)  ≈ lavender
  ];

  // ── panel background + outer border ──────────────────────────────────────

  // Calculate total height first by summing sections
  const SECTION_LABEL_H = 16; // label line height
  const SWATCH_ROW_H = 28; // color swatch row
  const SWATCH_GAP = 8; // gap between label and swatches (gap-1.5)
  const SLIDER_H = 36; // slider row
  const STROKE_BTN_H = 36; // stroke style buttons
  const OPTIONS_BTN_H = 32; // trash button

  const SECTION_STROKE_COLOR_H =
    PAD_Y / 2 + SECTION_LABEL_H + SWATCH_GAP + SWATCH_ROW_H + PAD_Y / 2;
  const SECTION_BG_H = SECTION_STROKE_COLOR_H; // same structure
  const SECTION_WIDTH_H =
    PAD_Y / 2 + SECTION_LABEL_H + 4 + SLIDER_H + PAD_Y / 2;
  const SECTION_STYLE_H = SECTION_LABEL_H + 6 + STROKE_BTN_H + GAP;
  const SECTION_OPTIONS_H = SECTION_LABEL_H + 6 + OPTIONS_BTN_H + PAD_Y;

  const PH =
    PAD_Y +
    SECTION_STROKE_COLOR_H +
    SECTION_BG_H +
    SECTION_WIDTH_H +
    SECTION_STYLE_H +
    SECTION_OPTIONS_H;

  // panel bg
  fillRR(x, y, PW, PH, 8, "rgba(255,255,255,0.05)");
  strokeRR(x, y, PW, PH, 8);

  // ── layout cursor ─────────────────────────────────────────────────────────
  let cy = y + PAD_Y;
  const IX = x + PAD_X; // inner X
  const IW = PW - PAD_X * 2; // inner width

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 1 — Stroke Color
  // ─────────────────────────────────────────────────────────────────────────

  txt("stroke color", IX, cy + 8, 10, "left", C_DIM);
  cy += SECTION_LABEL_H + SWATCH_GAP;

  // swatch container bg
  fillRR(IX, cy, IW, SWATCH_ROW_H, 3, "rgba(255,255,255,0.07)");
  strokeRR(IX, cy, IW, SWATCH_ROW_H, 3);

  // swatches
  const SW = 16; // w-4 h-4
  const SWATCH_PAD = 6; // p-1.5
  let sx = IX + SWATCH_PAD;
  const sy = cy + (SWATCH_ROW_H - SW) / 2;

  STROKE_COLORS.forEach((color) => {
    ctx.save();
    ctx.fillStyle = color;
    rr(sx, sy, SW, SW, 2);
    ctx.fill();
    ctx.restore();
    strokeRR(sx, sy, SW, SW, 2);
    sx += SW + 4;
  });

  // divider line (tabler-icon-minus-vertical)
  ctx.save();
  ctx.strokeStyle = C_OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 1, cy + 4);
  ctx.lineTo(sx + 1, cy + SWATCH_ROW_H - 4);
  ctx.stroke();
  ctx.restore();
  sx += 8;

  // active color swatch (custom / current)
  const activeStrokeColor = "#a8d4f5"; // approx oklch(1 0.08089 247.192)
  fillRR(sx, sy, SW, SW, 2, activeStrokeColor);
  strokeRR(sx, sy, SW, SW, 2);

  cy += SWATCH_ROW_H + GAP;

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 2 — Background
  // ─────────────────────────────────────────────────────────────────────────

  txt("background", IX, cy + 8, 10, "left", C_DIM);
  cy += SECTION_LABEL_H + SWATCH_GAP;

  fillRR(IX, cy, IW, SWATCH_ROW_H, 3, "rgba(255,255,255,0.07)");
  strokeRR(IX, cy, IW, SWATCH_ROW_H, 3);

  sx = IX + SWATCH_PAD;
  const sy2 = cy + (SWATCH_ROW_H - SW) / 2;

  // "none" button — white with red diagonal slash
  fillRR(sx, sy2, SW, SW, 2, "#ffffff");
  strokeRR(sx, sy2, SW, SW, 2);
  ctx.save();
  ctx.strokeStyle = "#e53e3e";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(sx + SW * 0.2, sy2 + SW * 0.8);
  ctx.lineTo(sx + SW * 0.8, sy2 + SW * 0.2);
  ctx.stroke();
  ctx.restore();
  sx += SW + 4;

  // same palette as stroke
  STROKE_COLORS.forEach((color) => {
    ctx.save();
    ctx.fillStyle = color;
    rr(sx, sy2, SW, SW, 2);
    ctx.fill();
    ctx.restore();
    strokeRR(sx, sy2, SW, SW, 2);
    sx += SW + 4;
  });

  // divider
  ctx.save();
  ctx.strokeStyle = C_OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sx + 1, cy + 4);
  ctx.lineTo(sx + 1, cy + SWATCH_ROW_H - 4);
  ctx.stroke();
  ctx.restore();
  sx += 8;

  // active bg swatch
  const activeBgColor = "#8b7fd4"; // approx oklch(0.6232 0.1502 284.72)
  fillRR(sx, sy2, SW, SW, 2, activeBgColor);
  strokeRR(sx, sy2, SW, SW, 2);

  cy += SWATCH_ROW_H + GAP;

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 3 — Stroke Width
  // ─────────────────────────────────────────────────────────────────────────

  // label row: "stroke width" + value badge
  txt("stroke width", IX, cy + 8, 10, "left", C_DIM);

  // value badge — "2" — bg-primary px-1 py-0.5 rounded-sm
  const badge = "2";
  ctx.save();
  ctx.font = "600 10px 'Segoe UI', system-ui, sans-serif";
  const bw = ctx.measureText(badge).width + 8;
  const bh = 16;
  const bx = IX + IW - bw;
  const badgeCY = cy + 8;
  ctx.restore();

  fillRR(bx, badgeCY - bh / 2, bw, bh, 3, "rgba(255,255,255,0.10)");
  strokeRR(bx, badgeCY - bh / 2, bw, bh, 3);
  txt(badge, bx + bw / 2, badgeCY, 10, "center", C_TEXT);

  cy += SECTION_LABEL_H + 4;

  // slider track
  const TRACK_H = 4;
  const THUMB_R = 9;
  const sliderY = cy + SLIDER_H / 2;
  const sliderX1 = IX;
  const sliderX2 = IX + IW;

  // track background
  fillRR(
    sliderX1,
    sliderY - TRACK_H / 2,
    IW,
    TRACK_H,
    TRACK_H / 2,
    "rgba(255,255,255,0.15)",
  );
  strokeRR(sliderX1, sliderY - TRACK_H / 2, IW, TRACK_H, TRACK_H / 2);

  // filled portion (value=2, range 1–16 → ~7% filled)
  const fillFraction = (2 - 1) / (16 - 1);
  const fillW = IW * fillFraction;
  fillRR(
    sliderX1,
    sliderY - TRACK_H / 2,
    fillW,
    TRACK_H,
    TRACK_H / 2,
    "rgba(255,255,255,0.50)",
  );

  // thumb
  const thumbX = sliderX1 + fillW;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(thumbX, sliderY, THUMB_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C_OUTLINE;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  cy += SLIDER_H + GAP;

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 4 — Stroke Style
  // ─────────────────────────────────────────────────────────────────────────

  txt("stroke style", IX, cy + 8, 10, "left", C_DIM);
  cy += SECTION_LABEL_H + 6;

  const BTN_W = (IW - 8) / 3; // 3 buttons, gap-1.5 = 6px total
  const BTN_H = 36;
  const BTN_GAP = 4;

  // Button 1: solid line  ——
  const b1x = IX;
  fillRR(b1x, cy, BTN_W, BTN_H, 6, C_SUBTLE);
  strokeRR(b1x, cy, BTN_W, BTN_H, 6);
  ctx.save();
  ctx.strokeStyle = C_TEXT;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(b1x + BTN_W * 0.2, cy + BTN_H / 2);
  ctx.lineTo(b1x + BTN_W * 0.8, cy + BTN_H / 2);
  ctx.stroke();
  ctx.restore();

  // Button 2: dashed  - - -
  const b2x = IX + BTN_W + BTN_GAP;
  fillRR(b2x, cy, BTN_W, BTN_H, 6, C_SUBTLE);
  strokeRR(b2x, cy, BTN_W, BTN_H, 6);
  ctx.save();
  ctx.strokeStyle = C_TEXT;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(b2x + BTN_W * 0.15, cy + BTN_H / 2);
  ctx.lineTo(b2x + BTN_W * 0.85, cy + BTN_H / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Button 3: dotted  · · · · ·
  const b3x = IX + (BTN_W + BTN_GAP) * 2;
  fillRR(b3x, cy, BTN_W, BTN_H, 6, C_SUBTLE);
  strokeRR(b3x, cy, BTN_W, BTN_H, 6);
  ctx.save();
  ctx.fillStyle = C_TEXT;
  const dotCount = 5;
  const dotSpacing = (BTN_W * 0.7) / (dotCount - 1);
  for (let d = 0; d < dotCount; d++) {
    ctx.beginPath();
    ctx.arc(
      b3x + BTN_W * 0.15 + d * dotSpacing,
      cy + BTN_H / 2,
      1.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  cy += BTN_H + GAP;

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 5 — Options (trash button)
  // ─────────────────────────────────────────────────────────────────────────

  txt("options", IX, cy + 8, 10, "left", C_DIM);
  cy += SECTION_LABEL_H + 6;

  const TRASH_BTN = 32; // w-8 h-8
  fillRR(IX, cy, TRASH_BTN, TRASH_BTN, 6, "rgba(255,100,80,0.25)");
  strokeRR(IX, cy, TRASH_BTN, TRASH_BTN, 6, "rgba(255,100,80,0.5)");

  // trash icon
  const ti = 15; // icon size
  const tix = IX + (TRASH_BTN - ti) / 2;
  const tiy = cy + (TRASH_BTN - ti) / 2;

  ctx.save();
  ctx.strokeStyle = "rgba(255,140,120,0.90)";
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";

  // top bar
  ctx.beginPath();
  ctx.moveTo(tix, tiy + ti * 0.29);
  ctx.lineTo(tix + ti, tiy + ti * 0.29);
  ctx.stroke();

  // left inner line
  ctx.beginPath();
  ctx.moveTo(tix + ti * 0.42, tiy + ti * 0.46);
  ctx.lineTo(tix + ti * 0.42, tiy + ti * 0.75);
  ctx.stroke();

  // right inner line
  ctx.beginPath();
  ctx.moveTo(tix + ti * 0.58, tiy + ti * 0.46);
  ctx.lineTo(tix + ti * 0.58, tiy + ti * 0.75);
  ctx.stroke();

  // body outline
  ctx.beginPath();
  ctx.moveTo(tix + ti * 0.21, tiy + ti * 0.29);
  ctx.lineTo(tix + ti * 0.29, tiy + ti * 0.92);
  ctx.arcTo(tix + ti * 0.29, tiy + ti, tix + ti * 0.42, tiy + ti, 4);
  ctx.lineTo(tix + ti * 0.58, tiy + ti);
  ctx.arcTo(tix + ti * 0.71, tiy + ti, tix + ti * 0.71, tiy + ti * 0.92, 4);
  ctx.lineTo(tix + ti * 0.79, tiy + ti * 0.29);
  ctx.stroke();

  // lid handle
  ctx.beginPath();
  ctx.moveTo(tix + ti * 0.38, tiy + ti * 0.29);
  ctx.lineTo(tix + ti * 0.38, tiy + ti * 0.08);
  ctx.arcTo(tix + ti * 0.38, tiy, tix + ti * 0.45, tiy, 3);
  ctx.lineTo(tix + ti * 0.55, tiy);
  ctx.arcTo(tix + ti * 0.62, tiy, tix + ti * 0.62, tiy + ti * 0.08, 3);
  ctx.lineTo(tix + ti * 0.62, tiy + ti * 0.29);
  ctx.stroke();

  ctx.restore();
}

// ── Usage ─────────────────────────────────────────────────────────────────
// import { drawSideToolkit } from "./drawSideToolkit";
//
// const canvas = document.getElementById("overlay") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d")!;
//
// // matches the component's `style="top: 80px; left: 16px;"`
// drawSideToolkit(ctx, 16, 80);
/**
 * drawOptionsPanel
 * Renders a ghost/outline replica of the Options panel component onto a canvas.
 * Only outlines + text labels are drawn — no fills, no solid backgrounds.
 *
 * @param ctx   - CanvasRenderingContext2D to draw on
 * @param x     - left edge of the panel (mirrors `right-0` by passing canvas.width - panelWidth - margin)
 * @param y     - top edge of the panel  (mirrors `top-14` / `top-6`)
 */
export function drawOptionsPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  const COLOR_OUTLINE = "rgba(255,255,255,0.28)";
  const COLOR_TEXT = "rgba(255,255,255,0.6)";
  const COLOR_DIM = "rgba(255,255,255,0.45)";

  const PW = 160; // panel width  (w-32 = 8rem = 128px)
  const ROW_H = 60; // row height   (h-10 = 2.5rem = 40px)
  const PAD_X = 24; // px-6
  const PAD_Y = 12; // py-3
  const ICON = 16; // icon size

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR_OUTLINE;

  // ── helpers ──────────────────────────────────────────────────────────────

  function rr(rx: number, ry: number, rw: number, rh: number, r: number) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, r);
  }

  function strokeRR(rx: number, ry: number, rw: number, rh: number, r: number) {
    rr(rx, ry, rw, rh, r);
    ctx.stroke();
  }

  function txt(
    text: string,
    tx: number,
    ty: number,
    size = 20,
    align: CanvasTextAlign = "center",
    color = COLOR_TEXT,
  ) {
    ctx.save();
    ctx.font = `400 ${16}px 'sergio ui', system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, tx, ty);
    ctx.restore();
  }

  // Tiny SVG-like icon drawn with canvas paths ─────────────────────────────

  /** grid-dots (3×3) */
  function iconGridDots(ix: number, iy: number, size: number) {
    const gap = size / 2.5;
    const r = size / 10;
    ctx.save();
    ctx.fillStyle = COLOR_TEXT;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        ctx.beginPath();
        ctx.arc(ix + col * gap, iy + row * gap, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /** ＋ inside a rounded square (new room) */
  function iconPlus(ix: number, iy: number, size: number) {
    ctx.save();
    ctx.strokeStyle = COLOR_DIM;
    ctx.lineWidth = 1.4;
    strokeRR(ix, iy - size / 2, size, size, size * 0.28);
    ctx.beginPath();
    ctx.moveTo(ix + size / 2, iy - size / 2 + size * 0.3);
    ctx.lineTo(ix + size / 2, iy + size / 2 - size * 0.3);
    ctx.moveTo(ix + size * 0.3, iy);
    ctx.lineTo(ix + size * 0.7, iy);
    ctx.stroke();
    ctx.restore();
  }

  /** door with arrow (join room) */
  function iconDoor(ix: number, iy: number, size: number) {
    ctx.save();
    ctx.strokeStyle = COLOR_DIM;
    ctx.lineWidth = 1.4;
    // door frame (partial)
    ctx.beginPath();
    ctx.moveTo(ix + size * 0.2, iy - size * 0.45);
    ctx.lineTo(ix + size * 0.2, iy + size * 0.45);
    ctx.moveTo(ix, iy + size * 0.45);
    ctx.lineTo(ix + size, iy + size * 0.45);
    // arrow
    ctx.moveTo(ix + size * 0.45, iy);
    ctx.lineTo(ix + size, iy);
    ctx.moveTo(ix + size * 0.75, iy - size * 0.2);
    ctx.lineTo(ix + size, iy);
    ctx.lineTo(ix + size * 0.75, iy + size * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  /** sparkle / AI */
  function iconSparkle(ix: number, iy: number, size: number) {
    ctx.save();
    ctx.strokeStyle = COLOR_DIM;
    ctx.lineWidth = 1.2;
    const arms = 4;
    for (let i = 0; i < arms; i++) {
      const angle = (i / arms) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(ix + size / 2, iy);
      ctx.lineTo(
        ix + size / 2 + Math.cos(angle) * size * 0.5,
        iy + Math.sin(angle) * size * 0.5,
      );
      ctx.stroke();
    }
    // small center dot
    ctx.beginPath();
    ctx.arc(ix + size / 2, iy, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_DIM;
    ctx.fill();
    ctx.restore();
  }

  /** person silhouette (profile) */
  function iconUser(ix: number, iy: number, size: number) {
    ctx.save();
    ctx.strokeStyle = COLOR_DIM;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(ix + size / 2, iy - size * 0.2, size * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ix + size * 0.1, iy + size * 0.45);
    ctx.quadraticCurveTo(
      ix + size * 0.1,
      iy + size * 0.1,
      ix + size / 2,
      iy + size * 0.1,
    );
    ctx.quadraticCurveTo(
      ix + size * 0.9,
      iy + size * 0.1,
      ix + size * 0.9,
      iy + size * 0.45,
    );
    ctx.stroke();
    ctx.restore();
  }

  /** logout arrow */
  function iconLogout(ix: number, iy: number, size: number) {
    ctx.save();
    ctx.strokeStyle = COLOR_DIM;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ix + size * 0.4, iy - size * 0.45);
    ctx.lineTo(ix + size * 0.8, iy - size * 0.45);
    ctx.lineTo(ix + size * 0.8, iy + size * 0.45);
    ctx.lineTo(ix + size * 0.4, iy + size * 0.45);
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix + size * 0.6, iy);
    ctx.moveTo(ix + size * 0.38, iy - size * 0.22);
    ctx.lineTo(ix, iy);
    ctx.lineTo(ix + size * 0.38, iy + size * 0.22);
    ctx.stroke();
    ctx.restore();
  }

  // ── Header button (Options + grid-dots icon) ─────────────────────────────
  // rounded-l-xl rounded-bl-none → top-left + top-right rounded, bottom-right rounded, bottom-left sharp
  const HEADER_H = ROW_H;
  ctx.save();
  ctx.strokeStyle = COLOR_OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + HEADER_H); // bottom-left (sharp)
  ctx.lineTo(x, y + 12);
  ctx.arcTo(x, y, x + 12, y, 12); // top-left rounded
  ctx.lineTo(x + PW - 12, y);
  ctx.arcTo(x + PW, y, x + PW, y + 12, 12); // top-right rounded
  ctx.lineTo(x + PW, y + HEADER_H - 12);
  ctx.arcTo(x + PW, y + HEADER_H, x + PW - 12, y + HEADER_H, 12); // bottom-right rounded
  ctx.lineTo(x, y + HEADER_H);
  ctx.stroke();
  ctx.restore();

  // "Options" label (right-aligned, leaving room for icon)
  const labelCY = y + HEADER_H / 2;
  txt("Options", x + PAD_X, labelCY, 12, "left", COLOR_TEXT);
  iconGridDots(x + PW - PAD_X - ICON + 2, labelCY - ICON / 3, ICON);

  // ── Row definitions ───────────────────────────────────────────────────────
  type RowDef =
    | {
        kind: "button";
        label: string;
        icon: (ix: number, iy: number, s: number) => void;
      }
    | { kind: "themes" };

  const rows: RowDef[] = [
    { kind: "button", label: "New Room", icon: iconPlus },
    { kind: "button", label: "Join Room", icon: iconDoor },
    { kind: "button", label: "Ask AI", icon: iconSparkle },
    { kind: "themes" },
    { kind: "button", label: "Profile", icon: iconUser },
    { kind: "button", label: "Logout", icon: iconLogout },
  ];

  // Theme swatches data (colours from the HTML)
  const themes = [
    { bg: "#300b43", a: "#a2d2ff", b: "#bde0fe" },
    { bg: "#1a1a1a", a: "#4e6851", b: "#dcc9a9" },
    { bg: "#233d4d", a: "#fe7f3d", b: "#fff2df" },
    { bg: "#fafafa", a: "#868686", b: "#e7e6e6" },
    { bg: "#181818", a: "#e2e2e2", b: "#3f3f3f" },
    { bg: "#24150f", a: "#85431e", b: "#d39858" },
  ];

  let curY = y + HEADER_H; // top of first row (no gap — border-b separators only)

  for (const row of rows) {
    if (row.kind === "button") {
      // Row outline
      strokeRR(x, curY, PW, ROW_H, 0);

      // Separator line (border-b) — drawn as a subtle horizontal stroke
      ctx.save();
      ctx.strokeStyle = "rgba(0,0,0,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, curY + ROW_H);
      ctx.lineTo(x + PW, curY + ROW_H);
      ctx.stroke();
      ctx.restore();

      const cy = curY + ROW_H / 2;
      txt(row.label, x + PAD_X, cy, 12, "left", COLOR_TEXT);
      row.icon(x + PW - PAD_X - ICON, cy, ICON);

      curY += ROW_H;
    } else {
      // ── Themes row ─────────────────────────────────────────────────────
      const THEMES_ROW_H = ROW_H + 44; // taller to fit the 2×3 grid
      strokeRR(x, curY, PW, THEMES_ROW_H, 0);

      txt("themes", x + PW - PAD_X, curY + PAD_Y, 12, "right", COLOR_DIM);

      // 2 rows × 3 cols grid of theme swatches
      const SWATCH = 24;
      const GAP = 6;
      const gridW = 3 * SWATCH + 2 * GAP;
      const gridX = x + PW - PAD_X - gridW;
      const gridY = curY + PAD_Y + 18;

      themes.forEach((theme, i) => {
        const col = i % 3;
        const row2 = Math.floor(i / 3);
        const sx = gridX + col * (SWATCH + GAP);
        const sy = gridY + row2 * (SWATCH + GAP);

        // swatch outline + split preview (left half = bg, right-top = accent a, right-bottom = accent b)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(sx, sy, SWATCH, SWATCH, 3);
        ctx.clip();

        // left half
        ctx.fillStyle = theme.bg;
        ctx.fillRect(sx, sy, SWATCH / 2, SWATCH);

        // right-top
        ctx.fillStyle = theme.a;
        ctx.fillRect(sx + SWATCH / 2, sy, SWATCH / 2, SWATCH / 2);

        // right-bottom
        ctx.fillStyle = theme.b;
        ctx.fillRect(sx + SWATCH / 2, sy + SWATCH / 2, SWATCH / 2, SWATCH / 2);

        ctx.restore();

        // swatch border
        ctx.save();
        ctx.strokeStyle = COLOR_OUTLINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sx, sy, SWATCH, SWATCH, 3);
        ctx.stroke();
        ctx.restore();
      });

      curY += THEMES_ROW_H;
    }
  }

  // ── Bottom rounding on last row (last:rounded-bl-xl) ─────────────────────
  // Re-stroke just the bottom corners of the last row with a rounded-bl
  ctx.save();
  ctx.strokeStyle = COLOR_OUTLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + PW, curY - ROW_H);
  ctx.lineTo(x + PW, curY - 12);
  ctx.arcTo(x + PW, curY, x + PW - 12, curY, 12);
  ctx.lineTo(x + 12, curY);
  ctx.arcTo(x, curY, x, curY - 12, 12);
  ctx.lineTo(x, curY - ROW_H);
  ctx.stroke();
  ctx.restore();

  ctx.restore(); // restore initial save
}

// ── Usage example ─────────────────────────────────────────────────────────
// import { drawOptionsPanel } from "./drawOptionsPanel";
//
// const canvas = document.getElementById("overlay") as HTMLCanvasElement;
// const ctx = canvas.getContext("2d")!;
//
// // mirrors `right-0 top-14` with a small margin
// const margin = 0;
// const panelWidth = 128;
// drawOptionsPanel(ctx, canvas.width - panelWidth - margin, 56);

export function drawOnboardingOverlay(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // wash
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  const COLOR_ARROW = "rgba(255,255,255,0.5)";
  const COLOR_TEXT = "rgba(255,255,255,0.95)";
  const COLOR_DIM = "rgba(255,255,255,0.70)";
  //   const COLOR_OUTLINE = "rgba(255,255,255,0.28)";
  const ARROWHEAD_R = 7; // size of arrowhead

  // --- primitives ---

  /**
   * Draws a dashed cubic-bezier curve with an arrowhead at (x2,y2).
   * cp1/cp2 are the two bezier control points for a smooth S-curve feel.
   * When flip=true the arrowhead wing direction is mirrored (for arrows
   * arriving from the right side).
   */
  function arrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cp1X: number,
    cp1Y: number,
    cp2X: number,
    cp2Y: number,
    flip = false,
  ) {
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = COLOR_ARROW;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 5]);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Tangent at end of cubic: direction from cp2 → (x2,y2)
    const tx = x2 - cp2X;
    const ty = y2 - cp2Y;
    const len = Math.hypot(tx, ty) || 1;
    const nx = tx / len;
    const ny = ty / len;
    const s = flip ? -1 : 1;
    const hw = ARROWHEAD_R; // half-width of arrowhead wings
    const hl = ARROWHEAD_R * 2.2; // length of arrowhead

    ctx.fillStyle = COLOR_ARROW;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - nx * hl + ny * hw * s, y2 - ny * hl - nx * hw * s);
    ctx.lineTo(x2 - nx * hl - ny * hw * s, y2 - ny * hl + nx * hw * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws a label block.
   * labelAnchorSide: "below" puts label below the origin point (default),
   *                  "above" puts label above – used when the arrow tail
   *                  exits upward so text never overlaps the line.
   */
  function label(
    x: number,
    y: number,
    main: string,
    sub?: string,
    align: CanvasTextAlign = "center",
    labelAnchorSide: "below" | "above" = "below",
  ) {
    if (!ctx) return;
    ctx.save();
    ctx.textAlign = align;

    const mainSize = 20;
    const subSize = 16;
    const lineGap = 22;
    const blockH = sub ? mainSize + lineGap : mainSize;

    // Offset so text never sits on the arrow tail
    const yMain =
      labelAnchorSide === "above" ? y - (sub ? blockH - mainSize : 4) : y + 6;
    const ySub = yMain + lineGap;

    ctx.font = `600 ${mainSize}px 'Segoe UI', system-ui, sans-serif`;
    ctx.fillStyle = COLOR_TEXT;
    ctx.fillText(main, x, yMain + 30);

    if (sub) {
      ctx.font = `400 ${subSize}px 'Segoe UI', system-ui, sans-serif`;
      ctx.fillStyle = COLOR_DIM;
      ctx.fillText(sub, x, ySub + 30);
    }
    ctx.restore();
  }

  //   function outlineRect(x: number, y: number, w: number, h: number, r = 8) {
  //     ctx.save();
  //     ctx.strokeStyle = COLOR_OUTLINE;
  //     ctx.lineWidth = 1;
  //     roundRect(x, y, w, h, r);
  //     ctx.stroke();
  //     ctx.restore();
  //   }

  // ─── mock options panel ──────────────────────────────────────────────────
  //   const PW = 180,
  //     PH = 330;
  //   const PX = W - PW - 18,
  //     PY = 18;

  //   ctx.save();
  //   ctx.fillStyle = "rgba(255,255,255,0.06)";
  //   roundRect(PX, PY, PW, PH, 14);
  //   ctx.fill();
  //   ctx.strokeStyle = COLOR_OUTLINE;
  //   ctx.lineWidth = 1;
  //   ctx.stroke();
  //   ctx.restore();

  //   outlineRect(PX + 9, PY + 11, PW - 18, 26, 7);
  //   ctx.save();
  //   ctx.font = "500 12px 'Segoe UI', system-ui, sans-serif";
  //   ctx.fillStyle = COLOR_DIM;
  //   ctx.textAlign = "center";
  //   ctx.fillText("Options", PX + PW / 2, PY + 29);
  //   ctx.restore();

  //   const rows = ["New Room", "Join Room", "Ask AI", "Profile", "Logout"];
  //   rows.forEach((row, i) => {
  //     const ry = PY + 53 + i * 40;
  //     outlineRect(PX + 11, ry, PW - 22, 29, 6);
  //     ctx.save();
  //     ctx.font = "400 20px 'Segoe UI', system-ui, sans-serif";
  //     ctx.fillStyle = COLOR_DIM;
  //     ctx.textAlign = "center";
  //     ctx.fillText(row, PX + PW / 2, ry + 19);
  //     ctx.restore();
  //   });

  //   const themeY = PY + PH - 58;
  //   ctx.save();
  //   ctx.font = "400 16px 'Segoe UI', system-ui, sans-serif";
  //   ctx.fillStyle = COLOR_DIM;
  //   ctx.textAlign = "left";
  //   ctx.fillText("Themes", PX + 13, themeY);
  //   ctx.restore();
  //   [0, 1, 2].forEach((i) => {
  //     outlineRect(PX + 13 + i * 24, themeY + 8, 20, 20, 5);
  //   });
  drawOptionsPanel(ctx, canvas.width - 148, 32);

  // ─── mock side toolkit (left) ────────────────────────────────────────────
  //   const TKW = 46,
  //     TKH = 220;
  //   const TKX = 18,
  //     TKY = H / 2 - TKH / 2;

  //   ctx.save();
  //   ctx.fillStyle = "rgba(255,255,255,0.06)";
  //   roundRect(TKX, TKY, TKW, TKH, 11);
  //   ctx.fill();
  //   ctx.strokeStyle = COLOR_OUTLINE;
  //   ctx.lineWidth = 1;
  //   ctx.stroke();
  //   ctx.restore();

  //   Array(6)
  //     .fill(COLOR_OUTLINE)
  //     .forEach((c, i) => {
  //       ctx.save();
  //       ctx.fillStyle = c;
  //       ctx.beginPath();
  //       ctx.arc(
  //         TKX + (i % 2 === 0 ? 14 : 26),
  //         TKY + 12 + Math.floor(i / 2) * 7,
  //         1.8,
  //         0,
  //         Math.PI * 2,
  //       );
  //       ctx.fill();
  //       ctx.restore();
  //     });

  //   [0, 1, 2, 3].forEach((i) => {
  //     outlineRect(TKX + 7, TKY + 32 + i * 42, TKW - 14, 32, 6);
  //   });
  drawSideToolkit(ctx, 16, 80);
  // ─── annotations ─────────────────────────────────────────────────────────
  const TOOLBAR_Y = 80;

  /**
   * Each annotation now carries two optional cubic control-point overrides
   * (cp1, cp2) and a labelAnchorSide to keep text clear of the arrow tail.
   *
   * Control-point strategy for a classy S-curve:
   *   cp1 departs the origin in the "away" direction,
   *   cp2 arrives at the target from the side opposite the tail.
   */
  type AnnotationExt = Annotation & {
    cp1?: { x: number; y: number };
    cp2?: { x: number; y: number };
    textAlign?: CanvasTextAlign;
    labelAnchorSide?: "below" | "above";
  };

  const annotations: AnnotationExt[] = [
    // ── Toolbar ──────────────────────────────────────────────────────────
    {
      label: "Resize",
      sub: "Resize it as you want.",
      target: { x: W / 2 + 340, y: TOOLBAR_Y - 30 },
      origin: { x: W / 2 + 220, y: 175 },
      cp1: { x: W * 0.6, y: 100 },
      cp2: { x: W * 0.8, y: 180 },
      textAlign: "center",
      labelAnchorSide: "below",
    },
    {
      label: "Drag",
      sub: "Drag it anywhere.",
      target: { x: W * 0.4, y: TOOLBAR_Y },
      origin: { x: W / 2 - 50, y: 175 },
      cp1: { x: W * 0.5, y: 100 },
      cp2: { x: W * 0.3, y: 180 },
      textAlign: "center",
      labelAnchorSide: "below",
    },
    // ── Options panel (arrives from the left, text sits LEFT of origin) ──
    {
      label: "Options",
      sub: "rooms · AI · themes · profile",
      target: { x: W - 50, y: 50 },
      origin: { x: W * 0.85, y: H * 0.25 },
      cp1: { x: W * 0.8, y: 30 },
      cp2: { x: W * 0.9, y: 40 },
      flip: true,
      textAlign: "center",
      labelAnchorSide: "below",
    },
    // ── Side toolkit (arrow goes right from toolkit edge) ────────────────
    {
      label: "Side toolkit ( dragable )",
      sub: "will be visible when you draw",
      target: { x: 250, y: H * 0.25 },
      origin: { x: 350, y: 500 },
      cp1: { x: 300, y: 400 },
      cp2: { x: 400, y: 100 },
      textAlign: "center",
      labelAnchorSide: "below",
    },
    // ── Undo/Redo (arrives from below-right, text above origin) ──────────
    {
      label: "Undo / Redo",
      sub: "or Ctrl+Z · Ctrl+Shift+Z",
      target: { x: 70, y: H - 70 },
      origin: { x: 240, y: H - 150 },
      cp1: { x: 190, y: H - 210 },
      cp2: { x: 80, y: H - 200 },
      flip: true,
      textAlign: "center",
      labelAnchorSide: "below",
    },
  ];

  for (const ann of annotations) {
    const {
      target: t,
      origin: o,
      label: main,
      sub,
      flip,
      cp1,
      cp2,
      textAlign = "center",
      labelAnchorSide = "below",
    } = ann;

    // Default control points produce a gentle S-curve if none supplied
    const c1x = cp1?.x ?? o.x + (t.x - o.x) * 0.25;
    const c1y = cp1?.y ?? o.y + (t.y - o.y) * 0.1;
    const c2x = cp2?.x ?? o.x + (t.x - o.x) * 0.75;
    const c2y = cp2?.y ?? t.y + (o.y - t.y) * 0.2;

    // Arrow tail exits from just below or above the label block
    const tailY = labelAnchorSide === "above" ? o.y - 48 : o.y + 6;

    arrow(o.x, tailY, t.x, t.y, c1x, c1y, c2x, c2y, flip);
    label(o.x, o.y, main, sub, textAlign, labelAnchorSide);
  }

  // ── dismiss hint ──────────────────────────────────────────────────────────
  ctx.save();
  ctx.font = "400 25px 'Segoe UI', system-ui, sans-serif";
  ctx.fillStyle = COLOR_DIM;
  ctx.textAlign = "center";
  ctx.fillText("[ Click anywhere or press any key to dismiss ]", W / 2, H / 2);
  ctx.restore();

  ctx.save();
  ctx.font = "400 20px handlee, system-ui, sans-serif";
  ctx.fillStyle = COLOR_DIM;
  ctx.textAlign = "center";
  ctx.fillText("--- If you like it let me know. --- ", W / 2, H / 2 + 30);
  ctx.restore();
}
