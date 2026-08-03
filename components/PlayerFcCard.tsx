"use client";

import { useI18n } from "@/lib/i18n/context";
import { Avatar } from "./Avatar";
import { ClubCrest, Flag } from "./Media";
import { getLeagueOfTeam, getTeam } from "@/lib/data/dataset";
import { getKitForTeam } from "@/lib/kits";
import { ATTRIBUTE_ABBR, attributeKeysFor, type Attributes } from "@/lib/sim/attributes";
import type { PositionCode } from "@/lib/sim/constants";
import type { AvatarConfig } from "@/lib/avatar/config";
import type { Country } from "@/lib/data/dataset";

export type CardTier = "bronze" | "silver" | "gold" | "elite" | "legend";

export function cardTier(overall: number): CardTier {
  if (overall >= 92) return "legend";
  if (overall >= 85) return "elite";
  if (overall >= 75) return "gold";
  if (overall >= 65) return "silver";
  return "bronze";
}

/** Frame gradients, ink colour and glow per tier. */
const TIER_STYLE: Record<CardTier, { frame: string; ink: string; sub: string; glow: string; ray: string }> = {
  bronze: {
    frame: "linear-gradient(160deg,#8a5a2b 0%,#c98f4e 28%,#e0b077 46%,#b4753a 62%,#7a4c22 100%)",
    ink: "#3b2410",
    sub: "rgba(59,36,16,0.62)",
    glow: "rgba(201,143,78,0.35)",
    ray: "rgba(255,231,196,0.5)",
  },
  silver: {
    frame: "linear-gradient(160deg,#8d97a4 0%,#c9d2dc 28%,#eef3f8 46%,#aab4c0 62%,#79838f 100%)",
    ink: "#242b33",
    sub: "rgba(36,43,51,0.62)",
    glow: "rgba(201,210,220,0.35)",
    ray: "rgba(255,255,255,0.6)",
  },
  gold: {
    frame: "linear-gradient(160deg,#a97b17 0%,#e3b64c 26%,#f7dd8f 46%,#dcae42 62%,#9a6d12 100%)",
    ink: "#3a2a05",
    sub: "rgba(58,42,5,0.62)",
    glow: "rgba(245,196,81,0.42)",
    ray: "rgba(255,246,214,0.62)",
  },
  elite: {
    frame: "linear-gradient(160deg,#1b2440 0%,#33456f 22%,#7f8fc4 44%,#2b3a5e 62%,#141b30 100%)",
    ink: "#eaf0ff",
    sub: "rgba(234,240,255,0.66)",
    glow: "rgba(127,143,196,0.45)",
    ray: "rgba(190,208,255,0.4)",
  },
  legend: {
    frame: "linear-gradient(160deg,#3d1d5c 0%,#7b3fa8 22%,#d9a2f0 44%,#6a32a0 62%,#2a1240 100%)",
    ink: "#fbeeff",
    sub: "rgba(251,238,255,0.68)",
    glow: "rgba(217,162,240,0.5)",
    ray: "rgba(238,205,255,0.45)",
  },
};

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
  /** Plays the flip-in + light sweep, used when a fresh card appears. */
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

  const small = size === "sm" || size === "xs";
  const width = size === "xs" ? "w-[124px]" : size === "sm" ? "w-[164px]" : size === "lg" ? "w-[300px]" : "w-[232px]";
  const nameSize = size === "xs" ? "text-sm" : size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-2xl";
  const ovrSize = size === "xs" ? "text-2xl" : size === "sm" ? "text-3xl" : size === "lg" ? "text-6xl" : "text-5xl";

  return (
    <div
      className={`relative ${width} aspect-[7/10] shrink-0 select-none ${reveal ? "animate-card-in" : ""} ${className}`}
      style={{ filter: `drop-shadow(0 18px 34px ${style.glow})` }}
    >
      <div
        className={`relative h-full w-full overflow-hidden ${reveal ? "sheen" : ""}`}
        style={{
          background: style.frame,
          // Shield silhouette, the same read as an FC card. Flat zone runs to
          // 80% so the attribute row never lands in the tapered point.
          clipPath:
            "polygon(50% 0%, 100% 6%, 100% 80%, 50% 100%, 0% 80%, 0% 6%)",
        }}
      >
        {/* Sunburst rays behind the portrait. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[62%]"
          style={{
            background: `conic-gradient(from 180deg at 50% 78%, transparent 0deg, ${style.ray} 8deg, transparent 16deg, transparent 24deg, ${style.ray} 32deg, transparent 40deg, transparent 48deg, ${style.ray} 56deg, transparent 64deg, transparent 116deg, ${style.ray} 124deg, transparent 132deg, transparent 140deg, ${style.ray} 148deg, transparent 156deg, transparent 164deg, ${style.ray} 172deg, transparent 180deg)`,
            opacity: 0.5,
            maskImage: "radial-gradient(70% 80% at 50% 78%, black 40%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(70% 80% at 50% 78%, black 40%, transparent 78%)",
          }}
        />

        {/* OVR + position block */}
        <div className="absolute left-[9%] top-[9%] leading-none" style={{ color: style.ink }}>
          <div className={`font-display font-black ${ovrSize}`}>{data.overall}</div>
          <div className={`font-display font-bold tracking-wide ${small ? "text-[10px]" : "text-sm"}`}>
            {t(`positions.${data.position}`)}
          </div>
        </div>

        {/* Portrait */}
        <div className="absolute inset-x-0 top-[7%] flex h-[46%] items-end justify-center">
          <Avatar
            config={data.avatar}
            kit={kit}
            showBackground={false}
            className="h-full w-auto drop-shadow-[0_6px_10px_rgba(0,0,0,0.28)]"
          />
        </div>

        {/* Squad number, printed on the shirt itself — just below the collar,
            white with a hard black outline so it reads on every kit colour. */}
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
              // Thick enough to survive a white kit, where a thin outline
              // leaves white-on-white and the number disappears.
              WebkitTextStroke:
                size === "xs" ? "1.2px #000" : size === "sm" ? "1.6px #000" : size === "lg" ? "3px #000" : "2.2px #000",
              paintOrder: "stroke fill",
            }}
          >
            {data.number}
          </div>
        )}

        {/* Name */}
        <div
          className="absolute inset-x-0 top-[55%] px-3 text-center"
          style={{ color: style.ink }}
        >
          <div className={`truncate font-display font-black tracking-tight ${nameSize}`}>
            {data.lastName || "—"}
          </div>
        </div>

        {/* Six attributes */}
        <div
          className={`absolute inset-x-0 top-[64%] grid grid-cols-6 px-2 text-center ${
            small ? "text-[9px]" : "text-[11px]"
          }`}
          style={{ color: style.ink }}
        >
          {keys.map((key) => (
            <div key={key} className="leading-tight">
              <div className="font-bold opacity-70">{ATTRIBUTE_ABBR[key]}</div>
              <div className={`font-display font-black ${small ? "text-xs" : "text-base"}`}>
                {Math.round(data.attributes[key])}
              </div>
            </div>
          ))}
        </div>

        {/* Flag / league / club strip */}
        <div className="absolute inset-x-0 top-[77%] flex items-center justify-center gap-2">
          <Flag
            src={data.country.flag_url}
            alt={data.country.name_en}
            className={small ? "h-2.5 w-4" : "h-3.5 w-5"}
          />
          {league?.logo_url && (
            <ClubCrest
              src={league.logo_url}
              name={league.name}
              size={small ? 10 : 14}
              className={small ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}
            />
          )}
          {team && (
            <ClubCrest
              src={team.logo_url}
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
