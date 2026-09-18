/**
 * The shareable career poster.
 *
 * Rebuilt from nothing. The previous version cloned the on-screen summary into
 * an SVG <foreignObject> and copied every computed style onto the clone; flex
 * sizing does not survive that copy, and the exported PNG came out with the
 * right column crushed to a strip, the trophy cabinet clipped off the edge and
 * the whole lower half of the layout missing. There is no way to make that
 * approach reliable, because the browser is being asked to re-run a layout it
 * has already thrown away.
 *
 * So nothing is laid out here: every element is placed at a known pixel. The
 * canvas is 1080x1350, which is 4:5 — the portrait size Instagram, WhatsApp,
 * Facebook and X all show without cropping. What the code draws is exactly
 * what ships, on every browser, every time.
 *
 * The seals are the one conditional piece: a red DIFICIL stamp for a hard-mode
 * career, a gold DESAFIO stamp for a daily challenge, nothing at all for a
 * normal run.
 */

import { getLeagueOfTeam, getTeam, type Country } from "@craque/data";
import { leagueLogoUrl } from "@craque/art";
import { teamCrestUrl } from "@craque/art";
import { getKitForTeam } from "@craque/data";
import { ATTRIBUTE_ABBR, attributeKeysFor, computeOverall } from "@/lib/sim/attributes";
import { allAwards, allTrophies, peakMarketValue, type CareerState } from "@/lib/sim/career";
import { AWARD_IMAGES, type AwardKey, type TrophyKey } from "@craque/data";
import { formatMarketValue, resolveTrophy } from "@/lib/trophyDisplay";
import type { AvatarConfig } from "@craque/art";
import { isDefender, type Difficulty } from "@/lib/sim/constants";
import {
  angleGradient,
  drawContain,
  drawCover,
  drawText,
  ellipsize,
  ensureFonts,
  fillRoundRect,
  fitText,
  loadImage,
  measure,
  pageFonts,
  roundRect,
  type Box,
  type TextStyle,
} from "@craque/art";
import { avatarDataUri, paintFcCard } from "@craque/art";

export const SHARE_W = 1080;
export const SHARE_H = 1350;

/** Fixed dark palette: a poster is not themed, whatever the site is set to. */
const INK = {
  bg: "#070b12",
  deep: "#040711",
  night: "#0c1726",
  fore: "#f2f6fb",
  muted: "#9aa8bd",
  faint: "#5f6e85",
  pitch: "#2fbf62",
  gold: "#f5c451",
  danger: "#f2555a",
  panel: "rgba(255,255,255,0.055)",
  panelLine: "rgba(255,255,255,0.09)",
};

const PAD = 60;

export type SealKind = "hard" | "challenge" | null;

export interface ShareImageInput {
  career: CareerState;
  avatar: AvatarConfig | null;
  difficulty: Difficulty;
  /** Set when the run was a daily challenge. */
  challengeId: string | null;
  locale: string;
  t: (key: string) => string;
  countryLabel: string;
  /** Brand line for the footer, e.g. "Simulador de carreira". */
  tagline: string;
}

interface Spell {
  teamId: string;
  from: number;
  to: number;
  trophies: TrophyKey[];
}

function buildSpells(career: CareerState): Spell[] {
  const spells: Spell[] = [];
  for (const season of career.seasons) {
    const last = spells[spells.length - 1];
    if (last && last.teamId === season.teamId) {
      last.to = season.age;
      last.trophies.push(...season.trophies);
      continue;
    }
    spells.push({ teamId: season.teamId, from: season.age, to: season.age, trophies: [...season.trophies] });
  }
  return spells;
}

// ---------------------------------------------------------------------------
// Background
// ---------------------------------------------------------------------------

function paintBackground(ctx: CanvasRenderingContext2D, accent: string, crest: HTMLImageElement | null): void {
  const full: Box = { x: 0, y: 0, w: SHARE_W, h: SHARE_H };

  ctx.fillStyle = angleGradient(ctx, full, 180, [
    [0, "#0a1524"],
    [0.42, INK.night],
    [1, INK.deep],
  ]);
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);

  // Mown pitch: vertical bands, barely there, so the ground has a texture.
  ctx.save();
  ctx.globalAlpha = 0.028;
  ctx.fillStyle = "#ffffff";
  for (let x = 0; x < SHARE_W; x += 180) ctx.fillRect(x, 0, 90, SHARE_H);
  ctx.restore();

  // Floodlight from behind the card, tinted with the club's own colour.
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(300, 400, 0, 300, 400, 780);
  glow.addColorStop(0, hexAlpha(accent, 0.3));
  glow.addColorStop(0.5, hexAlpha(accent, 0.08));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SHARE_W, SHARE_H);
  ctx.restore();

  // The club badge, huge and almost invisible, behind the numbers.
  if (crest) {
    ctx.save();
    ctx.globalAlpha = 0.05;
    drawContain(ctx, crest, { x: 610, y: 240, w: 520, h: 520 });
    ctx.restore();
  }

  // A gold hairline frame, which is what makes the whole thing look printed.
  ctx.save();
  ctx.strokeStyle = "rgba(245,196,81,0.16)";
  ctx.lineWidth = 2;
  roundRect(ctx, 26, 26, SHARE_W - 52, SHARE_H - 52, 26);
  ctx.stroke();
  ctx.restore();
}

/** #rrggbb plus an alpha, for the places a gradient needs to fade to nothing. */
function hexAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full.slice(0, 6) || "888888", 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// ---------------------------------------------------------------------------
// Wordmark and seal
// ---------------------------------------------------------------------------

function paintWordmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  size: number,
  display: string,
): number {
  const style: TextStyle = {
    family: display,
    size,
    weight: 900,
    tracking: size * 0.05,
    colour: INK.fore,
  };
  let cursor = x;
  cursor += drawText(ctx, "CRA", cursor, baseline, style) + style.tracking!;
  cursor += drawText(ctx, "Q", cursor, baseline, { ...style, colour: INK.pitch }) + style.tracking!;
  cursor += drawText(ctx, "UE", cursor, baseline, style);
  return cursor - x;
}

/**
 * The stamp.
 *
 * A rubber-stamp read rather than a badge: rotated off true, a double rule, a
 * hairline of the word repeated small underneath, and the ink broken up by a
 * few scratches so it does not look like a UI chip that wandered in.
 */
function paintSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  word: string,
  colour: string,
  display: string,
): void {
  const style: TextStyle = {
    family: display,
    size: 46,
    weight: 900,
    tracking: 6,
    colour,
    align: "center",
    baseline: "middle",
  };
  const textWidth = measure(ctx, word, style);
  const w = textWidth + 76;
  const h = 96;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-8 * Math.PI) / 180);

  ctx.globalAlpha = 0.92;
  // Wash of colour inside the frame.
  fillRoundRect(ctx, { x: -w / 2, y: -h / 2, w, h }, 12, hexAlpha(colour, 0.1));

  ctx.strokeStyle = colour;
  ctx.lineWidth = 5;
  roundRect(ctx, -w / 2, -h / 2, w, h, 12);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  roundRect(ctx, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 7);
  ctx.stroke();

  ctx.globalAlpha = 1;
  drawText(ctx, word, 0, -8, style);
  drawText(ctx, "• • •", 0, 26, {
    family: display,
    size: 15,
    weight: 700,
    tracking: 4,
    colour,
    align: "center",
    baseline: "middle",
  });

  // Distress: fixed scratches, so the same career always stamps the same way.
  ctx.globalCompositeOperation = "destination-out";
  const scratches: [number, number, number, number][] = [
    [-0.42, -0.3, 0.35, 0.06],
    [0.1, 0.22, 0.4, 0.05],
    [-0.2, 0.36, 0.3, 0.04],
    [0.28, -0.4, 0.22, 0.05],
  ];
  for (const [fx, fy, fw, fh] of scratches) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(fx * w, fy * h, fw * w, fh * h);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

function paintFigure(
  ctx: CanvasRenderingContext2D,
  box: Box,
  value: string,
  label: string,
  fonts: { display: string; body: string },
  accent = false,
): void {
  fillRoundRect(ctx, box, 18, INK.panel);
  ctx.strokeStyle = INK.panelLine;
  ctx.lineWidth = 1.5;
  roundRect(ctx, box.x, box.y, box.w, box.h, 18);
  ctx.stroke();

  const valueStyle = fitText(
    ctx,
    value,
    box.w - 32,
    {
      family: fonts.display,
      size: 52,
      weight: 900,
      colour: accent ? INK.gold : INK.fore,
      align: "center",
      baseline: "alphabetic",
    },
    28,
  );
  drawText(ctx, value, box.x + box.w / 2, box.y + box.h * 0.58, valueStyle);

  const labelStyle: TextStyle = {
    family: fonts.body,
    size: 17,
    weight: 700,
    colour: INK.faint,
    align: "center",
    baseline: "alphabetic",
    tracking: 1.6,
  };
  drawText(
    ctx,
    ellipsize(ctx, label.toUpperCase(), box.w - 18, labelStyle),
    box.x + box.w / 2,
    box.y + box.h - 20,
    labelStyle,
  );
}

/** Section heading: a gold tick, then wide small caps. */
function paintSectionLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  text: string,
  body: string,
): void {
  ctx.fillStyle = INK.gold;
  ctx.fillRect(x, baseline - 15, 5, 18);
  drawText(ctx, text.toUpperCase(), x + 16, baseline, {
    family: body,
    size: 19,
    weight: 700,
    colour: INK.muted,
    tracking: 3.6,
  });
}

interface CabinetEntry {
  image: HTMLImageElement | null;
  count: number;
}

function paintCabinet(ctx: CanvasRenderingContext2D, top: number, entries: CabinetEntry[], fonts: { display: string; body: string }): number {
  const inner = SHARE_W - PAD * 2;
  const gap = 14;
  const columns = Math.min(entries.length, 10);
  if (columns === 0) return top;
  const size = Math.min(88, (inner - gap * (columns - 1)) / columns);
  // Left-aligned rather than centred: the heading sits at the left margin,
  // and four badges floating in the middle of the page under a left-hand
  // label read as a mistake.
  let x = PAD;

  for (const entry of entries.slice(0, columns)) {
    drawContain(ctx, entry.image, { x, y: top, w: size, h: size });
    if (entry.count > 1) {
      const label = `${entry.count}`;
      const style: TextStyle = {
        family: fonts.display,
        size: 22,
        weight: 900,
        colour: "#1a1206",
        align: "center",
        baseline: "middle",
      };
      const pillW = Math.max(34, measure(ctx, label, style) + 18);
      const pillX = x + size - pillW * 0.72;
      const pillY = top + size - 26;
      fillRoundRect(ctx, { x: pillX, y: pillY, w: pillW, h: 30 }, 15, INK.gold);
      drawText(ctx, label, pillX + pillW / 2, pillY + 16, style);
    }
    x += size + gap;
  }
  return top + size;
}

/** A tiny trophy, drawn rather than fetched, for the spell pills. */
function paintCup(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, colour: string): void {
  const w = size * 0.62;
  const h = size;
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1, size * 0.12);
  // Bowl.
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy - h / 2);
  ctx.lineTo(cx + w / 2, cy - h / 2);
  ctx.quadraticCurveTo(cx + w / 2, cy + h * 0.16, cx, cy + h * 0.18);
  ctx.quadraticCurveTo(cx - w / 2, cy + h * 0.16, cx - w / 2, cy - h / 2);
  ctx.fill();
  // Handles.
  ctx.beginPath();
  ctx.arc(cx - w / 2, cy - h * 0.24, h * 0.2, Math.PI * 0.5, Math.PI * 1.5, true);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + w / 2, cy - h * 0.24, h * 0.2, Math.PI * 1.5, Math.PI * 0.5, true);
  ctx.stroke();
  // Stem and base.
  ctx.fillRect(cx - w * 0.1, cy + h * 0.14, w * 0.2, h * 0.2);
  ctx.fillRect(cx - w * 0.42, cy + h * 0.32, w * 0.84, h * 0.16);
  ctx.restore();
}

/**
 * The career as a line: overall against season, inside its own panel.
 *
 * It exists to fill space, and it earns the space. A career with two clubs
 * and a full cabinet used to leave a third of the poster empty, and the
 * shape of a rise, a plateau and a decline is the one thing about a career
 * that no single number on the page conveys.
 *
 * The caption lives inside the panel instead of above it, because how much
 * room is left over varies by 150px between careers and every pixel spent
 * on a heading is a pixel the curve does not get.
 */
function paintArcPanel(
  ctx: CanvasRenderingContext2D,
  panel: Box,
  seasons: { age: number; overall: number }[],
  caption: string,
  fonts: { display: string; body: string },
): void {
  if (seasons.length < 3) return;
  fillRoundRect(ctx, panel, 18, INK.panel);

  drawText(ctx, caption.toUpperCase(), panel.x + 24, panel.y + 30, {
    family: fonts.body,
    size: 17,
    weight: 700,
    colour: INK.faint,
    tracking: 2.8,
  });

  const box: Box = {
    x: panel.x + 24,
    y: panel.y + 46,
    w: panel.w - 48,
    h: panel.h - 46 - 30,
  };
  if (box.h < 40) return;

  const values = seasons.map((season) => season.overall);
  const lo = Math.max(0, Math.min(...values) - 3);
  const hi = Math.min(99, Math.max(...values) + 3);
  const span = Math.max(1, hi - lo);
  const px = (i: number) => box.x + (box.w * i) / (seasons.length - 1);
  const py = (v: number) => box.y + box.h - ((v - lo) / span) * box.h;

  // Hairlines, so the climb has something to be measured against.
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 1;
  for (const fraction of [0, 0.5, 1]) {
    const y = box.y + box.h * fraction;
    ctx.beginPath();
    ctx.moveTo(box.x, y);
    ctx.lineTo(box.x + box.w, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(px(0), box.y + box.h);
  seasons.forEach((season, i) => ctx.lineTo(px(i), py(season.overall)));
  ctx.lineTo(px(seasons.length - 1), box.y + box.h);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  fill.addColorStop(0, "rgba(245,196,81,0.32)");
  fill.addColorStop(1, "rgba(245,196,81,0)");
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  seasons.forEach((season, i) =>
    i === 0 ? ctx.moveTo(px(i), py(season.overall)) : ctx.lineTo(px(i), py(season.overall)),
  );
  ctx.strokeStyle = INK.gold;
  ctx.lineWidth = 4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();

  // The peak, marked.
  const peakIndex = values.indexOf(Math.max(...values));
  const peakX = px(peakIndex);
  const peakY = py(values[peakIndex]);
  ctx.beginPath();
  ctx.arc(peakX, peakY, 8, 0, Math.PI * 2);
  ctx.fillStyle = INK.gold;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(peakX, peakY, 3.4, 0, Math.PI * 2);
  ctx.fillStyle = INK.deep;
  ctx.fill();
  // The label goes under the dot when the peak is high enough to collide
  // with the caption, which on a good career it almost always is.
  const peakAbove = peakY - 18 >= box.y + 24;
  drawText(ctx, String(values[peakIndex]), peakX, peakAbove ? peakY - 18 : peakY + 32, {
    family: fonts.display,
    size: 26,
    weight: 900,
    colour: INK.gold,
    align: peakIndex > seasons.length * 0.85 ? "right" : "center",
  });

  // Ages at each end.
  const axis: TextStyle = { family: fonts.body, size: 17, weight: 700, colour: INK.faint };
  drawText(ctx, String(seasons[0].age), box.x, panel.y + panel.h - 12, axis);
  drawText(ctx, String(seasons[seasons.length - 1].age), box.x + box.w, panel.y + panel.h - 12, {
    ...axis,
    align: "right",
  });
}
// ---------------------------------------------------------------------------
// The poster
// ---------------------------------------------------------------------------

export async function renderShareImage(input: ShareImageInput): Promise<Blob> {
  const { career, t } = input;
  const fonts = pageFonts();
  await ensureFonts([fonts.display, fonts.body]);

  const isGk = career.player.position === "GK";
  const confederation = career.player.nationality.confederation;
  const peakSeason = career.seasons.reduce(
    (best, s) => (best && best.overall >= s.overall ? best : s),
    career.seasons[0] ?? null,
  );
  const peakAttributes = peakSeason?.attributes ?? career.player.attributes;
  const peakOvr = peakSeason
    ? Math.round(computeOverall(peakAttributes, career.player.position))
    : career.player.overall;
  const cardTeamId = peakSeason?.teamId ?? career.currentTeamId ?? null;
  const country: Country = career.player.nationality;

  const totals = career.seasons.reduce(
    (acc, s) => ({
      appearances: acc.appearances + s.stats.appearances,
      goals: acc.goals + s.stats.goals,
      assists: acc.assists + s.stats.assists,
      cleanSheets: acc.cleanSheets + s.stats.cleanSheets,
    }),
    { appearances: 0, goals: 0, assists: 0, cleanSheets: 0 },
  );

  const spells = buildSpells(career);
  const clubCount = new Set(career.seasons.map((s) => s.teamId)).size;

  // Repeat wins collapse into one badge with a count, or the cabinet is a wall
  // of the same trophy.
  const groups = new Map<string, { name: string; imageUrl?: string; count: number }>();
  for (const { key, teamId, leagueTier } of allTrophies(career)) {
    const resolved = resolveTrophy(key, teamId, confederation, t, leagueTier);
    const id = `${key}:${resolved.name}`;
    const existing = groups.get(id);
    if (existing) existing.count += 1;
    else groups.set(id, { name: resolved.name, imageUrl: resolved.imageUrl, count: 1 });
  }
  const totalTrophies = [...groups.values()].reduce((n, g) => n + g.count, 0);

  const awardCounts = new Map<AwardKey, number>();
  for (const { key } of allAwards(career)) awardCounts.set(key, (awardCounts.get(key) ?? 0) + 1);

  const cabinetSources = [
    ...[...groups.values()].sort((a, b) => b.count - a.count).map((g) => ({ src: g.imageUrl, count: g.count })),
    ...[...awardCounts.entries()].map(([key, count]) => ({ src: AWARD_IMAGES[key], count })),
  ].slice(0, 10);

  const league = cardTeamId ? getLeagueOfTeam(cardTeamId) : null;
  const kit = getKitForTeam(cardTeamId);

  // Everything that has to be a bitmap before a single pixel is drawn.
  const [avatarImage, flagImage, leagueImage, crestImage, watermark, ...rest] = await Promise.all([
    loadImage(avatarDataUri(input.avatar, { kit })),
    loadImage(country.flag_url),
    loadImage(leagueLogoUrl(league)),
    loadImage(teamCrestUrl(cardTeamId)),
    loadImage(teamCrestUrl(cardTeamId)),
    ...cabinetSources.map((entry) => loadImage(entry.src)),
    ...spells.slice(0, 8).map((spell) => loadImage(teamCrestUrl(spell.teamId))),
  ]);
  const cabinetImages = rest.slice(0, cabinetSources.length);
  const spellCrests = rest.slice(cabinetSources.length);

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_W;
  canvas.height = SHARE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");

  paintBackground(ctx, kit.base, watermark);

  // --- header -------------------------------------------------------------
  paintWordmark(ctx, PAD, 100, 40, fonts.display);

  const seal: SealKind = input.challengeId ? "challenge" : input.difficulty === "hard" ? "hard" : null;
  if (seal) {
    const word = seal === "hard" ? t("career.shareSealHard") : t("career.shareSealChallenge");
    const colour = seal === "hard" ? INK.danger : INK.gold;
    const probe: TextStyle = { family: fonts.display, size: 46, weight: 900, tracking: 6 };
    const sealWidth = measure(ctx, word, probe) + 76;
    paintSeal(ctx, SHARE_W - PAD - sealWidth / 2, 92, word, colour, fonts.display);
  }

  // --- hero ---------------------------------------------------------------
  const card: Box = { x: PAD, y: 170, w: 386, h: 551 };
  paintFcCard(
    ctx,
    card,
    {
      overall: peakOvr,
      positionLabel: t(`positions.${career.player.position}`),
      attributes: attributeKeysFor(career.player.position).map((key) => ({
        label: ATTRIBUTE_ABBR[key],
        value: peakAttributes[key],
      })),
      lastName: career.identity.lastName,
      number: peakSeason?.shirtNumber ?? career.shirtNumber ?? null,
      avatar: avatarImage,
      flag: flagImage,
      leagueLogo: leagueImage,
      crest: crestImage,
    },
    fonts,
  );

  const colX = 486;
  const colW = SHARE_W - PAD - colX;

  drawText(ctx, t("career.summaryTitle").toUpperCase(), colX, 200, {
    family: fonts.body,
    size: 19,
    weight: 700,
    colour: INK.gold,
    tracking: 4.4,
  });

  const nameStyle = fitText(
    ctx,
    career.identity.lastName,
    colW,
    { family: fonts.display, size: 82, weight: 900, colour: INK.fore },
    42,
  );
  drawText(ctx, career.identity.lastName, colX, 276, nameStyle);

  // Nationality and position.
  drawCover(ctx, flagImage, { x: colX, y: 296, w: 46, h: 31 }, 5);
  const positionLong = t(`positionsFull.${career.player.position}`);
  const positionLabel = positionLong.charAt(0).toUpperCase() + positionLong.slice(1);
  drawText(ctx, `${input.countryLabel}  ·  ${positionLabel}`, colX + 60, 320, {
    family: fonts.body,
    size: 24,
    weight: 600,
    colour: INK.muted,
  });

  // Six numbers, three across.
  const figureGap = 15;
  const figureW = (colW - figureGap * 2) / 3;
  const figureH = 112;
  const secondFigure: [string, string, boolean] = isGk
    ? [String(totals.cleanSheets), t("career.cleanSheets"), false]
    : [String(totals.goals), t("career.goals"), false];
  // A keeper never registers an assist, so that cell would always be a
  // zero; a defender is judged on shutouts before anything he does at the
  // other end.
  const thirdFigure: [string, string, boolean] = isGk
    ? [String(clubCount), t("career.clubsLabel"), false]
    : isDefender(career.player.position)
      ? [String(totals.cleanSheets), t("career.cleanSheets"), false]
      : [String(totals.assists), t("career.assists"), false];
  const figures: [string, string, boolean][] = [
    [String(totals.appearances), t("career.appearances"), false],
    secondFigure,
    thirdFigure,
    [String(totalTrophies), t("career.trophies"), true],
    [String(career.seasons.length), t("career.seasonsLabel"), false],
    [String(career.nationalTeamStats.caps), t("career.capsLabel"), false],
  ];
  figures.forEach(([value, label, accent], i) => {
    const box: Box = {
      x: colX + (i % 3) * (figureW + figureGap),
      y: 350 + Math.floor(i / 3) * (figureH + 14),
      w: figureW,
      h: figureH,
    };
    paintFigure(ctx, box, value, label, fonts, accent);
  });

  // Peak valuation, as a wide strip that closes the column.
  const valueBox: Box = { x: colX, y: 602, w: colW, h: 66 };
  fillRoundRect(ctx, valueBox, 18, "rgba(245,196,81,0.09)");
  ctx.strokeStyle = "rgba(245,196,81,0.24)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, valueBox.x, valueBox.y, valueBox.w, valueBox.h, 18);
  ctx.stroke();
  drawText(ctx, t("career.shareValueLabel").toUpperCase(), valueBox.x + 22, valueBox.y + 42, {
    family: fonts.body,
    size: 17,
    weight: 700,
    colour: INK.faint,
    tracking: 2.2,
  });
  drawText(ctx, formatMarketValue(peakMarketValue(career)), valueBox.x + valueBox.w - 22, valueBox.y + 46, {
    family: fonts.display,
    size: 38,
    weight: 900,
    colour: INK.gold,
    align: "right",
  });

  // The card's own caption, tucked under the point of the shield.
  drawText(ctx, `${peakOvr} · ${t("career.shareBestCard").toUpperCase()}`, card.x + card.w / 2, 756, {
    family: fonts.body,
    size: 17,
    weight: 700,
    colour: INK.faint,
    tracking: 2.4,
    align: "center",
  });

  // --- the lower half ------------------------------------------------
  // Three optional blocks share whatever is left between the card and the
  // footer, and how much that is depends entirely on the career: two clubs
  // and a full cabinet leaves room to spare, ten clubs and four trophies
  // leaves none. So the heights are decided here rather than written down,
  // and the blocks give way in order: the journey list drops rows before it
  // will overrun, and the arc chart only appears if there is genuinely
  // space for it.
  const footerTop = SHARE_H - PAD - 72;
  const floor = footerTop - 26;
  let cursorY = 796;

  if (cabinetSources.length > 0) {
    paintSectionLabel(ctx, PAD, cursorY, t("career.trophies"), fonts.body);
    const bottom = paintCabinet(
      ctx,
      cursorY + 20,
      cabinetSources.map((entry, i) => ({ image: cabinetImages[i] ?? null, count: entry.count })),
      fonts,
    );
    cursorY = bottom + 44;
  }

  // --- the road taken -----------------------------------------------------
  paintSectionLabel(ctx, PAD, cursorY, t("career.shareJourney"), fonts.body);
  const rowsTop = cursorY + 20;
  const rowH = 54;
  const rowGap = 9;
  const colGap = 24;
  const rowBlock = (n: number) => n * rowH + (n - 1) * rowGap;
  const spellW = (SHARE_W - PAD * 2 - colGap) / 2;

  const wantRows = Math.ceil(Math.min(spells.length, 8) / 2);
  let rows = Math.max(1, Math.min(wantRows, Math.floor((floor - rowsTop + rowGap) / (rowH + rowGap))));
  // The overflow note needs a line of its own.
  while (rows > 1 && rows * 2 < spells.length && rowsTop + rowBlock(rows) + 30 > floor) rows -= 1;
  const shown = spells.slice(0, rows * 2);
  const hidden = spells.length - shown.length;

  shown.forEach((spell, i) => {
    const team = getTeam(spell.teamId);
    const box: Box = {
      x: PAD + (i % 2) * (spellW + colGap),
      y: rowsTop + Math.floor(i / 2) * (rowH + rowGap),
      w: spellW,
      h: rowH,
    };
    fillRoundRect(ctx, box, 14, INK.panel);

    drawContain(ctx, spellCrests[i] ?? null, { x: box.x + 14, y: box.y + 10, w: 34, h: 34 });

    const years = spell.from === spell.to ? `${spell.from}` : `${spell.from}-${spell.to}`;
    const yearStyle: TextStyle = {
      family: fonts.body,
      size: 20,
      weight: 700,
      colour: INK.faint,
      align: "right",
    };
    const yearW = measure(ctx, years, yearStyle);
    drawText(ctx, years, box.x + box.w - 16, box.y + 35, yearStyle);

    // Trophies won during the spell: a gold count, not a row of tiny badges,
    // because at this size a badge is a smudge.
    let tail = box.x + box.w - 16 - yearW - 14;
    if (spell.trophies.length > 0) {
      const label = `${spell.trophies.length}`;
      const style: TextStyle = {
        family: fonts.display,
        size: 21,
        weight: 900,
        colour: "#1a1206",
        align: "center",
        baseline: "middle",
      };
      const pillW = Math.max(52, measure(ctx, label, style) + 40);
      const pillX = tail - pillW;
      fillRoundRect(ctx, { x: pillX, y: box.y + 13, w: pillW, h: 28 }, 14, INK.gold);
      // A drawn cup rather than the emoji: emoji glyphs carry their own
      // colour, so one on a gold pill comes out as a muddy sticker.
      paintCup(ctx, pillX + 17, box.y + 27, 15, "#1a1206");
      drawText(ctx, label, pillX + pillW / 2 + 9, box.y + 28, style);
      tail -= pillW + 12;
    }

    const clubStyle: TextStyle = { family: fonts.display, size: 24, weight: 700, colour: INK.fore };
    const name = ellipsize(ctx, team?.name ?? "?", tail - (box.x + 60), clubStyle);
    drawText(ctx, name, box.x + 60, box.y + 36, clubStyle);
  });

  cursorY = rowsTop + rowBlock(rows);
  if (hidden > 0) {
    drawText(
      ctx,
      `+${hidden} ${t("career.clubsLabel").toLowerCase()}`,
      SHARE_W - PAD,
      cursorY + 24,
      { family: fonts.body, size: 19, weight: 700, colour: INK.faint, align: "right" },
    );
    cursorY += 30;
  }

  // --- the arc, if the career left room for it ----------------------------
  const arcTop = cursorY + 26;
  const arcSpace = floor - arcTop;
  if (arcSpace >= 116) {
    paintArcPanel(
      ctx,
      { x: PAD, y: arcTop, w: SHARE_W - PAD * 2, h: Math.min(arcSpace, 214) },
      career.seasons.map((season) => ({ age: season.age, overall: season.overall })),
      t("career.shareArc"),
      fonts,
    );
  }

  // --- footer -------------------------------------------------------------
  const footer: Box = { x: PAD, y: SHARE_H - PAD - 72, w: SHARE_W - PAD * 2, h: 72 };
  fillRoundRect(ctx, footer, 20, "rgba(255,255,255,0.04)");
  ctx.strokeStyle = "rgba(245,196,81,0.2)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, footer.x, footer.y, footer.w, footer.h, 20);
  ctx.stroke();

  const markW = paintWordmark(ctx, footer.x + 26, footer.y + 47, 28, fonts.display);
  drawText(ctx, input.tagline, footer.x + 26 + markW + 20, footer.y + 46, {
    family: fonts.body,
    size: 20,
    weight: 600,
    colour: INK.faint,
  });
  drawText(ctx, t("career.shareCallToAction"), footer.x + footer.w - 26, footer.y + 46, {
    family: fonts.display,
    size: 24,
    weight: 900,
    colour: INK.pitch,
    align: "right",
    tracking: 0.6,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas produced no image"));
    }, "image/png");
  });
}

