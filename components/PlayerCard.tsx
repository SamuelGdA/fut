"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { useI18n } from "@/lib/i18n/context";
import { TrophyImage } from "./Media";
import { FC_CARD_SIZES, PlayerFcCard } from "./PlayerFcCard";
import { CareerTable } from "./CareerTable";
import {
  allAwards,
  allTrophies,
  careerTotals,
  type CareerState,
} from "@/lib/sim/career";
import { resolveTrophy, formatMarketValue } from "@/lib/trophyDisplay";
import { AWARD_IMAGES, type AwardKey, type TrophyKey } from "@/lib/data/trophies";
import { scoutedTalent } from "@/lib/sim/engine";
import { FanSupportMeter } from "./FanSupportMeter";
import { RivalTracker } from "./RivalTracker";
import { MetaRow } from "./MetaRow";
import { isDefender, type PersonalityTrait, type TalentTier } from "@/lib/sim/constants";
import type { AvatarConfig } from "@/lib/avatar/config";

/**
 * The height below which the card gives up a size so the decision fits.
 *
 * The whole top row is as tall as the card, so on a short window those 57
 * pixels are the difference between reading a decision and scrolling for it.
 * A laptop at 1280x800 was 41 short; this covers it with room over.
 */
const SHORT_VIEWPORT = "(max-height: 860px)";

/** True while the window is too short to afford the full-size card. */
function useShortViewport(): boolean {
  const [short, setShort] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(SHORT_VIEWPORT);
    const sync = () => setShort(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return short;
}
export function PlayerCard({ career, avatar }: { career: CareerState; avatar: AvatarConfig | null }) {
  const { t } = useI18n();
  const totals = careerTotals(career);
  const isGk = career.player.role === "goalkeeper";
  const showCleanSheets = isDefender(career.player.position);
  // A short window buys the decision below its space by taking a size off
  // the card — and the panel beside it has to live in the same row, so it
  // tightens by the same amount.
  const compact = useShortViewport();
  const cardSize = compact ? "xs" : "sm";

  return (
    // The whole row is exactly as tall as the card and no taller.
    //
    // The info panel and the cabinet used to size themselves freely, so a
    // decorated save pushed this block down the page and squeezed the
    // decision underneath into a scrolling sliver. Pinning the row to the
    // card's own height means the space below is constant from the first
    // season to the last, and the decision never has to scroll.
    <div
      className="row-card-height flex flex-col gap-3 lg:flex-row lg:items-stretch"
      style={{ "--fc-card-h": `${FC_CARD_SIZES[cardSize].h}px` } as CSSProperties}
    >
      <div className="flex justify-center lg:justify-start">
        <PlayerFcCard
          key={career.player.overall}
          reveal
          size={cardSize}
          data={{
            overall: career.player.overall,
            position: career.player.position,
            attributes: career.player.attributes,
            lastName: career.identity.lastName,
            number: career.shirtNumber,
            country: career.player.nationality,
            teamId: career.currentTeamId,
            avatar,
          }}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 lg:flex-row">
        {/* Everything here is sized to the height budget the row imposes:
            one strip of stat tiles and four single-line readings. Spread
            with `justify-between` rather than packed at the top, so the
            panel reads as a filled block whether or not this career picked
            up a rival. */}
        <div
          className={`panel flex flex-col justify-between lg:w-72 lg:shrink-0 ${
            compact ? "gap-1 p-2" : "gap-1.5 p-2.5"
          }`}
        >
          {/* Five tiles in the same width as four, so the readings shrink a
              step — without it a market value of €12.5M was cut to "€12...". */}
          <div
            className={`grid gap-1.5 ${showCleanSheets ? "grid-cols-5 text-xs" : "grid-cols-4 text-sm"}`}
          >
            <Stat
              label={t("career.age")}
              value={career.player.age}
              hint={t("career.hints.age")}
              dense={showCleanSheets}
              compact={compact}
            />
            <Stat
              label={t("career.marketValue")}
              value={formatMarketValue(career.player.marketValue)}
              hint={t("career.hints.marketValue")}
              dense={showCleanSheets}
              compact={compact}
            />
            <Stat
              label={t("career.appearances")}
              value={totals.appearances}
              hint={t("career.hints.appearances")}
              dense={showCleanSheets}
              compact={compact}
            />
            {isGk ? (
              <Stat
                label={t("career.cleanSheets")}
                value={totals.cleanSheets}
                hint={t("career.hints.cleanSheets")}
                dense={showCleanSheets}
                compact={compact}
              />
            ) : (
              <Stat
                label={t("career.goals")}
                value={totals.goals}
                hint={t("career.hints.goals")}
                dense={showCleanSheets}
                compact={compact}
              />
            )}
            {/* A defender's season is not read off goals, so the number they
                are actually judged on gets a tile of its own. */}
            {showCleanSheets && (
              <Stat
                label={t("career.cleanSheets")}
                value={totals.cleanSheets}
                hint={t("career.hints.cleanSheets")}
                dense={showCleanSheets}
                compact={compact}
              />
            )}
          </div>
          <TalentBadge
            seed={career.seed}
            talentTier={career.player.talentTier}
            age={career.player.age}
            careerAppearances={totals.appearances}
            compact={compact}
          />
          <TraitBadge trait={career.player.trait} compact={compact} />
          <FanSupportMeter
            support={career.fanSupport}
            peakSupport={career.clubFanPeak ?? career.fanSupport}
            brief={career.clubBrief}
            position={career.player.position}
            compact={compact}
          />
          <RivalTracker career={career} compact={compact} />
        </div>

        {/* The season table lives here now: it is wide and short, which fits
            across the top far better than it did in the tall rail, where it
            could only ever show two rows. The cabinet took its place there. */}
        <div className="hidden min-w-0 flex-1 lg:block">
          <CareerTable career={career} />
        </div>
      </div>
    </div>
  );
}

/** Warmer as the ceiling gets higher, so a good roll reads at a glance. */
const TALENT_ACCENT: Record<TalentTier, string> = {
  prospect: "text-muted",
  talent: "text-sky-300",
  star: "text-pitch",
  phenomenon: "text-amber-300",
  generational: "text-fuchsia-300",
};

/**
 * The scouting verdict on how far this player can go. Hidden potential is only
 * interesting if it eventually becomes actionable, so the read-out sharpens
 * from blank, to a two-tier band, to a firm call as the career builds up.
 */
function TalentBadge({
  seed,
  talentTier,
  age,
  careerAppearances,
  compact,
}: {
  seed: string;
  talentTier: TalentTier;
  age: number;
  careerAppearances: number;
  compact: boolean;
}) {
  const { t } = useI18n();
  const scouted = scoutedTalent(seed, talentTier, age, careerAppearances);

  const text =
    scouted.certainty === "unknown"
      ? t("career.talentUnknown")
      : scouted.tiers.map((tier) => t(`career.talentTiers.${tier}`)).join(" ou ");

  // Colour the *reported* band, never the true tier. Keying the accent off
  // `talentTier` leaked the answer outright: a hedged "Craque ou Fenômeno"
  // printed in the phenomenon colour told you exactly which of the two it was.
  const reported = scouted.tiers[scouted.tiers.length - 1] ?? null;
  const accent = scouted.certainty === "unknown" || !reported ? "text-muted-2" : TALENT_ACCENT[reported];
  const hedged = scouted.certainty === "rumour" || scouted.certainty === "approximate";

  return (
    <MetaRow
      compact={compact}
      label={scouted.certainty === "rumour" ? t("career.talentRumourLabel") : t("career.talentLabel")}
      valueClass={`${accent} ${scouted.certainty === "rumour" ? "opacity-70" : ""}`}
      value={
        <>
          {text}
          {hedged && <span className="text-muted-2">?</span>}
        </>
      }
    />
  );
}

/** Personality, the second axis of what makes one career feel unlike another. */
function TraitBadge({ trait, compact }: { trait: PersonalityTrait; compact: boolean }) {
  const { t } = useI18n();
  return (
    <MetaRow
      compact={compact}
      label={t("career.traitLabel")}
      value={t(`career.traits.${trait}`)}
      valueClass="text-flood"
      title={t(`career.traitDescriptions.${trait}`)}
    />
  );
}

function Stat({
  label,
  value,
  hint,
  dense = false,
  compact = false,
}: {
  label: string;
  value: string | number;
  /** Plain-language explanation shown on hover — these tiles are bare numbers otherwise. */
  hint?: string;
  /** Five tiles in the width of four: every pixel of padding counts. */
  dense?: boolean;
  /** Short window: the whole strip loses a few pixels of height. */
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-lg bg-background/60 text-center ${dense ? "px-0.5" : "px-1"} ${
        compact ? "py-1" : "py-1.5"
      }`}
      title={hint}
    >
      <p className="truncate font-display font-black">{value}</p>
      <p className="truncate text-[9px] font-bold uppercase tracking-wider text-muted-2">{label}</p>
    </div>
  );
}

interface TrophyGroup {
  key: TrophyKey;
  name: string;
  imageUrl?: string;
  count: number;
}

export function TrophyShowcase({ career }: { career: CareerState }) {
  const { t } = useI18n();
  const confederation = career.player.nationality.confederation;

  // Group identical competitions so repeat wins show as "×3".
  const groups = new Map<string, TrophyGroup>();
  for (const { key, teamId, leagueTier } of allTrophies(career)) {
    const resolved = resolveTrophy(key, teamId, confederation, t, leagueTier);
    const id = `${key}:${resolved.name}`;
    const existing = groups.get(id);
    if (existing) existing.count += 1;
    else groups.set(id, { key, name: resolved.name, imageUrl: resolved.imageUrl, count: 1 });
  }

  const awardGroups = new Map<AwardKey, number>();
  for (const { key } of allAwards(career)) {
    awardGroups.set(key, (awardGroups.get(key) ?? 0) + 1);
  }

  const trophies = [...groups.values()];
  const awards = [...awardGroups.entries()];

  // The cabinet is sized to the rail rather than the other way round: it
  // picks the largest tile that still lets the whole collection fit. A player
  // with two trophies gets them shown big and named; one who won everything
  // gets them packed small but still all visible, which is the point of a
  // cabinet. A fixed tile size could only ever be right for one of those.
  const { boxRef, plan } = useCabinetLayout(`${trophies.length}:${awards.length}`);

  if (trophies.length === 0 && awards.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line p-4 text-center">
        <p className="text-2xl opacity-40">🏆</p>
        <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-muted-2">
          {t("career.emptyTrophyShowcase")}
        </p>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="panel scrollbar-thin h-full overflow-y-auto p-3.5">
      {trophies.length > 0 && (
        <>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-2">
            {t("career.trophies")}
          </p>
          {/* A shelf of equal cells rather than a row of free-floating art.

              The images are wildly different shapes — a tall two-handled cup,
              a flat salver, a round medal — and left to size themselves each
              tile came out a different width, so no two rows lined up and the
              plates read as twice the size of the cups. Fixed square cells fix
              both: the grid is a grid, and the cell is the unit the eye
              measures rather than the artwork inside it. */}
          <ul
            className="grid"
            style={{
              gap: plan.gap,
              gridTemplateColumns: `repeat(auto-fill, minmax(${plan.cell}px, 1fr))`,
            }}
          >
            {trophies.map((trophy) => (
              <li
                key={`${trophy.key}-${trophy.name}`}
                className="flex animate-pop-in flex-col items-center gap-1"
                title={trophy.count > 1 ? `${trophy.name} ×${trophy.count}` : trophy.name}
              >
                <div
                  className="relative flex w-full items-center justify-center rounded-lg bg-background/50 ring-1 ring-inset ring-line/70"
                  style={{ height: plan.cell }}
                >
                  {/* Narrower than it is tall on purpose. A round medal or a
                      flat salver fills a square box corner to corner and reads
                      as far bigger than a slim two-handled cup at the same
                      size; capping the width evens out how much trophy the eye
                      actually sees, and leaves the tall ones untouched. */}
                  <TrophyImage
                    src={trophy.imageUrl}
                    alt={trophy.name}
                    size={{ width: Math.round(plan.icon * 0.8), height: plan.icon }}
                  />
                  {trophy.count > 1 && (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-gold px-1.5 text-[10px] font-black leading-tight text-[#1a1206]">
                      {trophy.count}
                    </span>
                  )}
                </div>
                {plan.names && (
                  <span className="w-full truncate text-center text-[9px] text-muted-2">
                    {trophy.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {awards.length > 0 && (
        <>
          <p className="mb-2 mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-2">
            {t("career.awards")}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {awards.map(([key, count]) => (
              <li
                key={key}
                className="flex animate-pop-in items-center gap-1.5 rounded-full bg-gold/15 py-1 pl-1.5 pr-2.5 text-xs text-gold"
                title={t(`awards.${key}`)}
              >
                <TrophyImage src={AWARD_IMAGES[key]} alt={t(`awards.${key}`)} className="h-4 w-4" />
                {/* The name only while there is room for it. Packed, the medal
                    and its count carry the meaning and the tooltip has the rest. */}
                {plan.awardNames && <span className="font-bold">{t(`awards.${key}`)}</span>}
                {count > 1 && <span className="font-black">×{count}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * How the cabinet may be laid out, roomiest first.
 *
 * Captions are given up before the tiles get really small: a trophy you can
 * still make out beats a bigger one whose collection has to be scrolled to be
 * seen at all. Sizes repeat across the caption boundary on purpose — dropping
 * the caption frees more width than it does height, because a captioned tile
 * is as wide as its longest word.
 */
const CABINET_LEVELS = [
  { cell: 68, icon: 52, gap: 10, names: true, awardNames: true },
  { cell: 60, icon: 46, gap: 10, names: true, awardNames: true },
  { cell: 54, icon: 42, gap: 8, names: true, awardNames: true },
  { cell: 48, icon: 36, gap: 8, names: true, awardNames: true },
  { cell: 54, icon: 42, gap: 8, names: false, awardNames: true },
  { cell: 48, icon: 36, gap: 8, names: false, awardNames: true },
  { cell: 42, icon: 32, gap: 6, names: false, awardNames: true },
  { cell: 36, icon: 28, gap: 6, names: false, awardNames: false },
  { cell: 30, icon: 24, gap: 4, names: false, awardNames: false },
] as const;

/**
 * Picks the roomiest cabinet layout that still fits the rail, by measuring.
 *
 * Estimating the height from the counts was close but never right: a captioned
 * tile is as wide as its caption, pill widths depend on the translated award
 * names, and both change with the font. Measuring the real box after each
 * attempt is both simpler and correct in every language. It converges in at
 * most one pass per level because it only ever steps down, and starts over at
 * the top whenever the rail or the collection changes so the tiles can grow
 * back.
 */
function useCabinetLayout(signature: string) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    if (box.scrollHeight > box.clientHeight && level < CABINET_LEVELS.length - 1) {
      setLevel(level + 1);
    }
  }, [level, signature]);

  // Back to the top on a resize, so widening the window puts the big tiles
  // back rather than leaving the cabinet stuck at whatever the narrowest
  // layout of the session was.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => setLevel(0));
    observer.observe(box);
    return () => observer.disconnect();
  }, [signature]);

  return { boxRef, plan: CABINET_LEVELS[level] };
}
