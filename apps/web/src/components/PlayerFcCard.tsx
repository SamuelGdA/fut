"use client";

import { useI18n } from "@/lib/i18n/context";
import { Avatar } from "./Avatar";
import { ClubCrest, Flag } from "./Media";
import { getLeagueOfTeam, getTeam } from "@/lib/data/dataset";
import { leagueLogoUrl } from "@/lib/leagueBadges";
import { getKitForTeam } from "@/lib/kits";
import { ATTRIBUTE_ABBR, attributeKeysFor, type Attributes } from "@/lib/sim/attributes";
import type { PositionCode } from "@/lib/sim/constants";
import type { AvatarConfig } from "@/lib/avatar/config";
import type { Country } from "@/lib/data/dataset";

export type CardTier = "bronze" | "silver" | "gold" | "icon";

/**
 * Rarity bands.
 *
 * Four, not five: bronze to 64, silver through 74, a long gold stretch to 93,
 * and a white ICON card reserved for the last six points. The gold band is
 * deliberately the widest — it is where almost every real career lives, and
 * splitting it further made two cards a single point apart look like different
 * classes of player.
 */
const TIER_BANDS: { tier: CardTier; min: number; max: number }[] = [
  { tier: "icon", min: 94, max: 99 },
  { tier: "gold", min: 75, max: 93 },
  { tier: "silver", min: 65, max: 74 },
  { tier: "bronze", min: 0, max: 64 },
];

export function cardTier(overall: number): CardTier {
  return TIER_BANDS.find((b) => overall >= b.min)?.tier ?? "bronze";
}

/**
 * How far up its own band a rating sits, 0 at the floor and 1 at the ceiling.
 *
 * This drives the polish on the plate: a 93 is the best gold there is and
 * should look it, while a 75 has only just arrived. Kept as a ratio within the
 * band rather than an absolute so every tier has its own full range of
 * brilliance to climb.
 */
export function tierProgress(overall: number): number {
  const band = TIER_BANDS.find((b) => overall >= b.min) ?? TIER_BANDS[TIER_BANDS.length - 1];
  const span = band.max - band.min;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (overall - band.min) / span));
}

interface TierStyle {
  /** The metal itself, top-left to bottom-right. */
  plate: string;
  /** A brighter band swept across the middle of the plate. */
  sheen: string;
  ink: string;
  sub: string;
  /** Hairline separating the name from the numbers. */
  rule: string;
  /** Colour of the diagonal streaks. */
  streak: string;
}

const TIER_STYLE: Record<CardTier, TierStyle> = {
  bronze: {
    plate: "linear-gradient(155deg,#6f4520 0%,#9c6531 22%,#c68a4c 46%,#a06a34 68%,#6b421e 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,228,190,0.55) 50%,transparent 66%)",
    ink: "#33200d",
    sub: "rgba(51,32,13,0.66)",
    rule: "rgba(51,32,13,0.28)",
    streak: "rgba(255,226,186,0.55)",
  },
  silver: {
    plate: "linear-gradient(155deg,#7e8894 0%,#aab4c0 22%,#dfe6ee 46%,#b3bdc9 68%,#7a838f 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,255,255,0.72) 50%,transparent 66%)",
    ink: "#20262e",
    sub: "rgba(32,38,46,0.66)",
    rule: "rgba(32,38,46,0.26)",
    streak: "rgba(255,255,255,0.7)",
  },
  gold: {
    plate: "linear-gradient(155deg,#9a6d12 0%,#caa032 22%,#f2d271 46%,#d3a839 68%,#8f6410 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,246,214,0.7) 50%,transparent 66%)",
    ink: "#3a2905",
    sub: "rgba(58,41,5,0.66)",
    rule: "rgba(58,41,5,0.26)",
    streak: "rgba(255,247,219,0.75)",
  },
  // The ICON plate: near-white platinum with warm gold ink, so the last six
  // points of a career read as something else entirely.
  icon: {
    plate: "linear-gradient(155deg,#cfc8ba 0%,#efe9dd 20%,#fffdf7 46%,#e6dfd0 70%,#c6bdac 100%)",
    sheen: "linear-gradient(105deg,transparent 34%,rgba(255,255,255,0.9) 50%,transparent 66%)",
    ink: "#4a3a16",
    sub: "rgba(74,58,22,0.62)",
    rule: "rgba(74,58,22,0.24)",
    streak: "rgba(255,252,242,0.85)",
  },
};

/** Card geometry per size, in pixels. Fixed on purpose — see the note below. */
export const FC_CARD_SIZES = {
  xs: { w: 124, h: 177 },
  sm: { w: 164, h: 234 },
  md: { w: 232, h: 331 },
  lg: { w: 300, h: 429 },
} as const;

/**
 * The shield. Square shoulders, straight sides, a foot tapering to a point —
 * the same read as the cards this is modelled on.
 */
const SHIELD = "polygon(50% 0%, 100% 4.5%, 100% 78%, 50% 100%, 0% 78%, 0% 4.5%)";

export interface FcCardData {
  overall: number;
  position: PositionCode;
  attributes: Attributes;
  lastName: string;
  /** Squad number worn at the moment this card depicts; null before a first club. */
  number?: number | null;
  country: Country;
  teamId: string | null;
  avatar: AvatarConfig | null;
}

export function PlayerFcCard({
  data,
  size = "md",
  reveal = false,
  className = "",
}: {
  data: FcCardData;
  size?: "xs" | "sm" | "md" | "lg";
  /** Plays the flip-in, used when a fresh card appears. */
  reveal?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const tier = cardTier(data.overall);
  const style = TIER_STYLE[tier];
  const team = data.teamId ? getTeam(data.teamId) : null;
  const league = team ? getLeagueOfTeam(team.id) : null;
  const keys = attributeKeysFor(data.position);
  const kit = getKitForTeam(data.teamId);
  const { w, h } = FC_CARD_SIZES[size];

  const small = size === "sm" || size === "xs";
  const nameSize = size === "xs" ? "text-sm" : size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-2xl";
  const ovrSize = size === "xs" ? "text-2xl" : size === "sm" ? "text-3xl" : size === "lg" ? "text-6xl" : "text-5xl";

  // How far up its own band the rating sits, and everything the plate does
  // with light follows it. The top of a band is meant to be noticeably
  // brighter than the bottom without becoming hard to read: the six numbers
  // on the front are the point of the card.
  const climb = tierProgress(data.overall);
  const streakOpacity = 0.1 + climb * 0.3;
  const sheenOpacity = 0.16 + climb * 0.42;
  const rimOpacity = 0.1 + climb * 0.45;
  const bloomOpacity = climb * 0.34;

  return (
    <div
      // Explicit width AND height rather than a width plus `aspect-ratio`.
      // The card is often a flex item inside a stretching row, and a stretched
      // cross-size beats `aspect-ratio`, so the old card silently grew taller
      // than 7:10 depending on what happened to sit next to it. Fixed pixels
      // cannot be stretched, so the card is now the same shape everywhere.
      className={`relative shrink-0 grow-0 self-start select-none ${reveal ? "animate-card-in" : ""} ${className}`}
      style={{ width: w, height: h }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          background: style.plate,
          // The flat zone runs to 78% so the stat grid never lands inside the
          // taper.
          clipPath: SHIELD,
        }}
      >
        {/* Diagonal streaks across the plate — the brushed-metal read of the
            reference, and the thing that brightens as the rating climbs its
            band. Masked away from the lower half so it never fights the
            numbers. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `repeating-linear-gradient(108deg, transparent 0 14px, ${style.streak} 14px 16px, transparent 16px 30px)`,
            opacity: streakOpacity,
            maskImage: "linear-gradient(180deg, black 0%, black 46%, transparent 66%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, black 46%, transparent 66%)",
          }}
        />

        {/* A single broad highlight sweeping the plate, which is what makes
            the metal look curved rather than flat. Static: the old card ran a
            looping light sweep that read as a rendering glitch. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: style.sheen, opacity: sheenOpacity }}
        />

        {/* Soft pool of light behind the portrait so the avatar sits on the
            plate instead of floating over it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[58%]"
          style={{
            background: `radial-gradient(58% 62% at 50% 66%, ${style.streak} 0%, transparent 70%)`,
            opacity: 0.14 + climb * 0.16,
          }}
        />

        {/* Rim light. An inset shadow in the plate's own highlight colour, so
            the edge of the shield catches the light instead of ending flat.
            Inset means the clip contains it, which is what the old outside
            glow could never manage. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 0 ${Math.round(w * 0.12)}px ${style.streak}, inset 0 0 ${Math.round(w * 0.03)}px ${style.streak}`,
            opacity: rimOpacity,
          }}
        />

        {/* Bloom behind the rating, which is where the eye lands first. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(38% 26% at 22% 16%, ${style.streak} 0%, transparent 72%)`,
            opacity: bloomOpacity,
          }}
        />

        {/* OVR + position, top-left. */}
        <div className="absolute left-[9%] top-[8%] leading-none" style={{ color: style.ink }}>
          <div className={`font-display font-black ${ovrSize}`}>{data.overall}</div>
          <div
            className={`mt-0.5 font-display font-bold tracking-[0.08em] ${small ? "text-[10px]" : "text-sm"}`}
            style={{ color: style.sub }}
          >
            {t(`positions.${data.position}`)}
          </div>
        </div>

        {/* Portrait */}
        <div className="absolute inset-x-0 top-[6%] flex h-[47%] items-end justify-center">
          <Avatar
            config={data.avatar}
            kit={kit}
            showBackground={false}
            className="h-full w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]"
          />
        </div>

        {/* Squad number, printed on the shirt just below the collar. White with
            a hard outline so it reads on every kit colour. */}
        {data.number != null && (
          <div
            className={`pointer-events-none absolute inset-x-0 top-[44%] text-center font-display font-black leading-none text-white ${
              size === "xs"
                ? "text-[13px]"
                : size === "sm"
                  ? "text-[17px]"
                  : size === "lg"
                    ? "text-[32px]"
                    : "text-[24px]"
            }`}
            style={{
              WebkitTextStroke:
                size === "xs" ? "1.2px #000" : size === "sm" ? "1.6px #000" : size === "lg" ? "3px #000" : "2.2px #000",
              paintOrder: "stroke fill",
            }}
          >
            {data.number}
          </div>
        )}

        {/* Name */}
        <div className="absolute inset-x-0 top-[55.5%] px-3 text-center" style={{ color: style.ink }}>
          <div className={`truncate font-display font-black tracking-tight ${nameSize}`}>
            {data.lastName || "-"}
          </div>
        </div>

        {/* Six attributes: labels over values, evenly spaced. Padding and the
            label's letter-spacing tighten on the small cards, where six
            three-letter labels across 124px otherwise run into each other. */}
        <div
          className={`absolute inset-x-0 top-[66%] grid grid-cols-6 text-center ${
            size === "xs" ? "px-0.5 text-[7px]" : small ? "px-1.5 text-[8px]" : "px-2 text-[10px]"
          }`}
        >
          {keys.map((key) => (
            <div key={key} className="leading-tight">
              <div
                className={`font-bold ${size === "xs" ? "tracking-normal" : "tracking-[0.04em]"}`}
                style={{ color: style.sub }}
                title={t(`attributes.${key}`)}
              >
                {ATTRIBUTE_ABBR[key]}
              </div>
              <div
                className={`font-display font-black ${small ? "text-xs" : "text-base"}`}
                style={{ color: style.ink }}
              >
                {Math.round(data.attributes[key])}
              </div>
            </div>
          ))}
        </div>

        {/* Flag / league / club, sitting in the taper like the reference. */}
        <div className="absolute inset-x-0 top-[80%] flex items-center justify-center gap-2">
          <Flag
            src={data.country.flag_url}
            alt={data.country.name_en}
            className={small ? "h-2.5 w-4" : "h-3.5 w-5"}
          />
          {league && (
            <ClubCrest
              src={leagueLogoUrl(league)}
              name={league.name}
              size={small ? 10 : 14}
              className={small ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}
            />
          )}
          {team && (
            <ClubCrest
              teamId={team.id}
              name={team.name}
              size={small ? 12 : 16}
              className={small ? "h-3 w-3" : "h-4 w-4"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
