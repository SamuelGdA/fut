/**
 * Small canvas helpers for the share image.
 *
 * The share card is painted straight onto a 2D context rather than rasterised
 * from the DOM. The DOM route (an SVG <foreignObject> holding a clone of a
 * laid-out React tree) needed every computed style copied onto every node, and
 * flex sizing does not survive that copy: the exported PNG came out with the
 * right column crushed, the cabinet clipped and the whole bottom half missing.
 * A canvas has no layout engine to disagree with, so what is drawn is what
 * ships.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  box: Box,
  r: number,
  fill: string | CanvasGradient,
): void {
  roundRect(ctx, box.x, box.y, box.w, box.h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/**
 * A CSS-style angular linear gradient.
 *
 * CSS measures the angle clockwise from "to top"; canvas wants two points. The
 * line runs through the centre of the box and far enough to cover it, so the
 * stops land where the CSS equivalent would put them.
 */
export function angleGradient(
  ctx: CanvasRenderingContext2D,
  box: Box,
  degrees: number,
  stops: [number, string][],
): CanvasGradient {
  const radians = (degrees * Math.PI) / 180;
  const dx = Math.sin(radians);
  const dy = -Math.cos(radians);
  const half = (Math.abs(box.w * dx) + Math.abs(box.h * dy)) / 2;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const gradient = ctx.createLinearGradient(
    cx - dx * half,
    cy - dy * half,
    cx + dx * half,
    cy + dy * half,
  );
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  return gradient;
}

/** Loads an image, resolving to null rather than throwing when it is missing. */
export function loadImage(src: string | undefined | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

/**
 * Draws an image scaled to fit inside a box without distorting it.
 *
 * SVG files that carry only a viewBox report a natural size of 0 in some
 * browsers, so a missing intrinsic size falls back to filling the box.
 */
export function drawContain(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  box: Box,
): void {
  if (!image) return;
  const iw = image.naturalWidth || image.width || box.w;
  const ih = image.naturalHeight || image.height || box.h;
  const scale = Math.min(box.w / iw, box.h / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
}

/** Draws an image cropped to fill a box, centred, optionally rounded. */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  box: Box,
  radius = 0,
): void {
  if (!image) return;
  const iw = image.naturalWidth || image.width || box.w;
  const ih = image.naturalHeight || image.height || box.h;
  const scale = Math.max(box.w / iw, box.h / ih);
  const w = iw * scale;
  const h = ih * scale;
  ctx.save();
  if (radius > 0) {
    roundRect(ctx, box.x, box.y, box.w, box.h, radius);
    ctx.clip();
  }
  ctx.drawImage(image, box.x + (box.w - w) / 2, box.y + (box.h - h) / 2, w, h);
  ctx.restore();
}

export interface TextStyle {
  family: string;
  size: number;
  weight?: number;
  colour?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Extra space between glyphs, in pixels. Canvas has no letter-spacing. */
  tracking?: number;
}

function applyFont(ctx: CanvasRenderingContext2D, style: TextStyle): void {
  ctx.font = `${style.weight ?? 400} ${style.size}px ${style.family}`;
  ctx.fillStyle = style.colour ?? "#ffffff";
  ctx.textAlign = style.align ?? "left";
  ctx.textBaseline = style.baseline ?? "alphabetic";
}

export function measure(ctx: CanvasRenderingContext2D, text: string, style: TextStyle): number {
  applyFont(ctx, style);
  const base = ctx.measureText(text).width;
  return style.tracking ? base + style.tracking * Math.max(0, [...text].length - 1) : base;
}

/**
 * Draws text, honouring a tracking value by placing each glyph itself.
 *
 * Canvas gained `letterSpacing` only recently and it is still missing in
 * enough browsers that the wide uppercase labels this design leans on cannot
 * depend on it.
 */
export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle,
): number {
  const width = measure(ctx, text, style);
  applyFont(ctx, style);

  if (!style.tracking) {
    ctx.fillText(text, x, y);
    return width;
  }

  const align = style.align ?? "left";
  ctx.textAlign = "left";
  let cursor = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  for (const glyph of [...text]) {
    ctx.fillText(glyph, cursor, y);
    cursor += ctx.measureText(glyph).width + style.tracking;
  }
  return width;
}

/** Shrinks the type until it fits, down to a floor. Returns the style to use. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  style: TextStyle,
  minSize: number,
): TextStyle {
  let size = style.size;
  while (size > minSize && measure(ctx, text, { ...style, size }) > maxWidth) size -= 1;
  return { ...style, size };
}

/** Cuts text with an ellipsis when it will not fit. */
export function ellipsize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  style: TextStyle,
): string {
  if (measure(ctx, text, style) <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && measure(ctx, cut + "…", style) > maxWidth) cut = cut.slice(0, -1);
  return cut + "…";
}

/**
 * The font families the page is actually using.
 *
 * next/font mangles the family name at build time, so it can only be read back
 * off a live element. Hard-coding "Archivo" would silently fall back to the
 * system sans in the exported image.
 */
export function pageFonts(): { display: string; body: string } {
  const fallback = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  if (typeof document === "undefined") return { display: fallback, body: fallback };
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
  probe.className = "font-display";
  document.body.appendChild(probe);
  const display = getComputedStyle(probe).fontFamily || fallback;
  probe.className = "";
  const body = getComputedStyle(probe).fontFamily || fallback;
  probe.remove();
  return { display, body };
}

/** Waits for the webfonts the card draws with, so the PNG is never a fallback. */
export async function ensureFonts(families: string[]): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const weights = [400, 600, 700, 900];
  await Promise.all(
    families.flatMap((family) => {
      // `fonts.load` takes one family; handing it a full CSS stack throws.
      const first = family.split(",")[0].trim();
      return weights.map((weight) =>
        document.fonts.load(`${weight} 64px ${first}`).catch(() => undefined),
      );
    }),
  );
  await document.fonts.ready;
}
