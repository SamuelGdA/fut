/**
 * The player card, painted onto a canvas.
 *
 * The card is the thing people screenshot, so the shared image has to show the
 * card they were looking at and not an approximation of it. It cannot reuse
 * the DOM one, because an exported image is drawn rather than laid out, so the
 * drawing happens twice by necessity.
 *
 * What does not happen twice is the definition: the bands, the shield outline
 * and both palettes come from `./tiers`, so the two renderers cannot drift
 * apart. The note that used to sit here asked whoever changed one to remember
 * to change the other, which is the kind of instruction that works right up
 * until it does not.
 *
 * Attributes arrive already resolved, as label and value pairs. The painter
 * has no idea what a position is, which is what keeps this package free of the
 * simulation.
 */

import { angleGradient, drawContain, drawCover, drawText, ellipsize, type Box } from "../surface/canvas";
import { cardTier, tierProgress, TIER_CANVAS_STYLE, type TierCanvasStyle } from "./tiers";

/** One printed stat: the short label the card shows, and its value. */
export interface FcCardAttribute {
  label: string;
  value: number;
}

export interface FcCardPaint {
  overall: number;
  positionLabel: string;
  /** The six stats this position prints, in the order they are printed. */
  attributes: FcCardAttribute[];
  lastName: string;
  number: number | null;
  /** Portrait, already loaded. Serialised from the live avatar component. */
  avatar: HTMLImageElement | null;
  flag: HTMLImageElement | null;
  leagueLogo: HTMLImageElement | null;
  crest: HTMLImageElement | null;
}

/** The shield, as fractions of the box: square shoulders tapering to a point. */
function shieldPath(ctx: CanvasRenderingContext2D, b: Box): void {
  ctx.beginPath();
  ctx.moveTo(b.x + b.w * 0.5, b.y);
  ctx.lineTo(b.x + b.w, b.y + b.h * 0.045);
  ctx.lineTo(b.x + b.w, b.y + b.h * 0.78);
  ctx.lineTo(b.x + b.w * 0.5, b.y + b.h);
  ctx.lineTo(b.x, b.y + b.h * 0.78);
  ctx.lineTo(b.x, b.y + b.h * 0.045);
  ctx.closePath();
}

/**
 * Diagonal brushed-metal streaks, faded out towards the middle of the card so
 * they never fight the numbers. Painted on their own canvas because the fade
 * is an alpha mask, and masking in place would eat the plate underneath.
 */
function streakLayer(b: Box, style: TierCanvasStyle, opacity: number): HTMLCanvasElement {
  const layer = document.createElement("canvas");
  layer.width = Math.ceil(b.w);
  layer.height = Math.ceil(b.h);
  const lc = layer.getContext("2d");
  if (!lc) return layer;

  lc.save();
  lc.strokeStyle = style.streak;
  lc.lineWidth = b.w * 0.008;
  lc.globalAlpha = opacity;
  // 108deg in CSS: a shallow diagonal running down to the right.
  const step = b.w * 0.1;
  const slope = Math.tan((18 * Math.PI) / 180);
  for (let offset = -b.h; offset < b.w + b.h; offset += step) {
    lc.beginPath();
    lc.moveTo(offset, 0);
    lc.lineTo(offset + b.h * slope + b.h * 0.6, b.h);
    lc.stroke();
  }
  lc.restore();

  const fade = lc.createLinearGradient(0, 0, 0, b.h);
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(0.46, "rgba(0,0,0,1)");
  fade.addColorStop(0.66, "rgba(0,0,0,0)");
  lc.globalCompositeOperation = "destination-in";
  lc.fillStyle = fade;
  lc.fillRect(0, 0, b.w, b.h);
  return layer;
}

export function paintFcCard(
  ctx: CanvasRenderingContext2D,
  b: Box,
  data: FcCardPaint,
  fonts: { display: string; body: string },
): void {
  const tier = cardTier(data.overall);
  const style: TierCanvasStyle = TIER_CANVAS_STYLE[tier];
  const climb = tierProgress(data.overall);

  ctx.save();

  // A soft drop shadow so the card sits on the poster rather than in it.
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = b.w * 0.14;
  ctx.shadowOffsetY = b.w * 0.05;
  shieldPath(ctx, b);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();

  shieldPath(ctx, b);
  ctx.clip();

  // Plate.
  ctx.fillStyle = angleGradient(ctx, b, 155, style.plate);
  ctx.fillRect(b.x, b.y, b.w, b.h);

  // Streaks.
  const streaks = streakLayer(b, style, 0.1 + climb * 0.22);
  ctx.drawImage(streaks, b.x, b.y);

  // One broad highlight sweeping the plate — what makes the metal read curved.
  ctx.save();
  ctx.globalAlpha = 0.18 + climb * 0.3;
  ctx.fillStyle = angleGradient(ctx, b, 105, [
    [0.34, "rgba(255,255,255,0)"],
    [0.5, style.sheen],
    [0.66, "rgba(255,255,255,0)"],
  ]);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.restore();

  // Pool of light behind the portrait.
  ctx.save();
  ctx.globalAlpha = 0.14 + climb * 0.1;
  const poolR = b.w * 0.58;
  const pool = ctx.createRadialGradient(
    b.x + b.w * 0.5,
    b.y + b.h * 0.383,
    0,
    b.x + b.w * 0.5,
    b.y + b.h * 0.383,
    poolR,
  );
  pool.addColorStop(0, style.streak);
  pool.addColorStop(0.7, "rgba(255,255,255,0)");
  ctx.fillStyle = pool;
  ctx.fillRect(b.x, b.y, b.w, b.h * 0.58);
  ctx.restore();

  // Portrait: bottom-aligned in a band from 6% to 53%, square.
  if (data.avatar) {
    const size = b.h * 0.47;
    drawContain(ctx, data.avatar, {
      x: b.x + (b.w - size) / 2,
      y: b.y + b.h * 0.06,
      w: size,
      h: size,
    });
  }

  // OVR and position, top-left.
  drawText(ctx, String(data.overall), b.x + b.w * 0.09, b.y + b.h * 0.08 + b.h * 0.075, {
    family: fonts.display,
    size: b.h * 0.098,
    weight: 900,
    colour: style.ink,
    baseline: "alphabetic",
  });
  drawText(ctx, data.positionLabel, b.x + b.w * 0.09, b.y + b.h * 0.08 + b.h * 0.115, {
    family: fonts.display,
    size: b.h * 0.031,
    weight: 700,
    colour: style.sub,
    tracking: b.h * 0.0025,
  });

  // Squad number on the shirt, outlined so it reads on any kit.
  if (data.number != null) {
    const size = b.h * 0.073;
    ctx.save();
    ctx.font = `900 ${size}px ${fonts.display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = size * 0.22;
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.strokeText(String(data.number), b.x + b.w / 2, b.y + b.h * 0.44);
    ctx.fillStyle = "#fff";
    ctx.fillText(String(data.number), b.x + b.w / 2, b.y + b.h * 0.44);
    ctx.restore();
  }

  // Name.
  const nameStyle = {
    family: fonts.display,
    size: b.h * 0.07,
    weight: 900,
    colour: style.ink,
    align: "center" as CanvasTextAlign,
    baseline: "top" as CanvasTextBaseline,
  };
  drawText(
    ctx,
    ellipsize(ctx, data.lastName || "-", b.w * 0.86, nameStyle),
    b.x + b.w / 2,
    b.y + b.h * 0.555,
    nameStyle,
  );

  // Six attributes: label over value, evenly spaced.
  const inner = b.w * 0.92;
  const cell = inner / Math.max(1, data.attributes.length);
  data.attributes.forEach((attribute, i) => {
    const cx = b.x + (b.w - inner) / 2 + cell * (i + 0.5);
    drawText(ctx, attribute.label, cx, b.y + b.h * 0.66, {
      family: fonts.body,
      size: b.h * 0.026,
      weight: 700,
      colour: style.sub,
      align: "center",
      baseline: "top",
    });
    drawText(ctx, String(Math.round(attribute.value)), cx, b.y + b.h * 0.688, {
      family: fonts.display,
      size: b.h * 0.042,
      weight: 900,
      colour: style.ink,
      align: "center",
      baseline: "top",
    });
  });

  // Flag, league, club — in the taper, like the reference.
  const badges: { image: HTMLImageElement | null; w: number; h: number; cover: boolean }[] = [
    { image: data.flag, w: b.h * 0.036, h: b.h * 0.025, cover: true },
    { image: data.leagueLogo, w: b.h * 0.028, h: b.h * 0.028, cover: false },
    { image: data.crest, w: b.h * 0.032, h: b.h * 0.032, cover: false },
  ].filter((entry) => entry.image);
  const gap = b.w * 0.025;
  const row = badges.reduce((n, entry) => n + entry.w, 0) + gap * Math.max(0, badges.length - 1);
  let cursor = b.x + (b.w - row) / 2;
  const rowY = b.y + b.h * 0.8;
  for (const entry of badges) {
    const box = { x: cursor, y: rowY - entry.h / 2, w: entry.w, h: entry.h };
    if (entry.cover) drawCover(ctx, entry.image, box, entry.h * 0.14);
    else drawContain(ctx, entry.image, box);
    cursor += entry.w + gap;
  }

  ctx.restore();
}
