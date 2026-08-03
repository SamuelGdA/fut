"use client";

import { useI18n } from "@/lib/i18n/context";
import { TrophyImage } from "./Media";
import { PlayerFcCard } from "./PlayerFcCard";
import { allAwards, allTrophies, careerTotals, type CareerState } from "@/lib/sim/career";
import { resolveTrophy, formatMarketValue } from "@/lib/trophyDisplay";
import { AWARD_IMAGES, type AwardKey, type TrophyKey } from "@/lib/data/trophies";
import { scoutedTalent } from "@/lib/sim/engine";
import { FanSupportMeter } from "./FanSupportMeter";
import type { PersonalityTrait, TalentTier } from "@/lib/sim/constants";
import type { AvatarConfig } from "@/lib/avatar/config";

export function PlayerCard({ career, avatar }: { career: CareerState; avatar: AvatarConfig | null }) {
  const { t } = useI18n();
  const totals = careerTotals(career);
  const isGk = career.player.role === "goalkeeper";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
      <div className="flex justify-center lg:justify-start">
        <PlayerFcCard
          key={career.player.overall}
          reveal
          size="sm"
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
        <div className="panel flex flex-col gap-2 p-2.5 lg:w-56 lg:shrink-0 lg:justify-center">
          <div className="grid grid-cols-4 gap-1.5 lg:grid-cols-2 lg:gap-2.5">
            <Stat label={t("career.age")} value={career.player.age} />
            <Stat label={t("career.marketValue")} value={formatMarketValue(career.player.marketValue)} />
            <Stat label={t("career.appearances")} value={totals.appearances} />
            {isGk ? (
              <Stat label={t("career.cleanSheets")} value={totals.cleanSheets} />
            ) : (
              <Stat label={t("career.goals")} value={totals.goals} />
            )}
          </div>
          <TalentBadge talentTier={career.player.talentTier} careerAppearances={totals.appearances} />
          <TraitBadge trait={career.player.trait} />
          <FanSupportMeter support={career.fanSupport} />
        </div>

        <div className="flex-1">
          <TrophyShowcase career={career} />
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
  talentTier,
  careerAppearances,
}: {
  talentTier: TalentTier;
  careerAppearances: number;
}) {
  const { t } = useI18n();
  const scouted = scoutedTalent(talentTier, careerAppearances);

  const text =
    scouted.certainty === "unknown"
      ? t("career.talentUnknown")
      : scouted.tiers.map((tier) => t(`career.talentTiers.${tier}`)).join(" – ");

  const accent = scouted.certainty === "unknown" ? "text-muted-2" : TALENT_ACCENT[talentTier];

  return (
    <div className="rounded-xl bg-background/60 px-2 py-1.5 text-center">
      <p className={`font-display text-[13px] font-black leading-tight ${accent}`}>
        {text}
        {scouted.certainty === "approximate" && <span className="text-muted-2">?</span>}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">{t("career.talentLabel")}</p>
    </div>
  );
}

/** Personality, the second axis of what makes one career feel unlike another. */
function TraitBadge({ trait }: { trait: PersonalityTrait }) {
  const { t } = useI18n();
  return (
    <div
      className="rounded-xl bg-background/60 px-2 py-1.5 text-center"
      title={t(`career.traitDescriptions.${trait}`)}
    >
      <p className="font-display text-[13px] font-black leading-tight text-flood">
        {t(`career.traits.${trait}`)}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">
        {t("career.traitLabel")}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-background/60 px-2 py-2 text-center">
      <p className="font-display text-base font-black">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-2">{label}</p>
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
    <div className="panel h-full overflow-y-auto p-3.5">
      {trophies.length > 0 && (
        <>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-2">
            {t("career.trophies")}
          </p>
          <ul className="flex flex-wrap gap-3">
            {trophies.map((trophy) => (
              <li
                key={`${trophy.key}-${trophy.name}`}
                className="group relative flex animate-pop-in flex-col items-center gap-1"
                title={trophy.name}
              >
                <div className="relative">
                  <TrophyImage src={trophy.imageUrl} alt={trophy.name} className="h-11 w-11" />
                  {trophy.count > 1 && (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-gold px-1.5 text-[10px] font-black text-[#1a1206]">
                      {trophy.count}
                    </span>
                  )}
                </div>
                <span className="max-w-[72px] truncate text-[9px] text-muted-2">{trophy.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {awards.length > 0 && (
        <>
          <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-wider text-muted-2">
            {t("career.awards")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {awards.map(([key, count]) => (
              <li
                key={key}
                className="flex animate-pop-in items-center gap-1.5 rounded-full bg-gold/15 py-1 pl-1.5 pr-2.5 text-xs text-gold"
              >
                <TrophyImage src={AWARD_IMAGES[key]} alt={t(`awards.${key}`)} className="h-4 w-4" />
                <span className="font-bold">{t(`awards.${key}`)}</span>
                {count > 1 && <span className="font-black">×{count}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
