import type { AvatarConfig } from "@craque/art";
import type { CoachCareer } from "@craque/engine/coach";
import { coachTotals, coachPeak } from "../../features/tecnico/legacy";
import { d64 } from "../../i18n/tecnico/d64";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { PlayerCard } from "../../ui/PlayerCard";

/** Mesma moldura e hierarquia da carta do Craque, com retrato de treinador. */
export function CoachCard({ career, avatar, width = 250 }: { career: CoachCareer; avatar: AvatarConfig | null; width?: number }) {
  const t = useTecnicoT(), totals = coachTotals(career), peak = coachPeak(career);
  const stats = ([ ["gamesAbbr", totals.games], ["winsAbbr", totals.won], ["titlesAbbr", totals.titles], ["clubsAbbr", totals.clubs], ["rateAbbr", Math.round(totals.rate * 100)], ["seasonsAbbr", totals.seasons] ] as const)
    .map(([key,value]) => ({ label: d64(t.locale,key), value }));
  return <PlayerCard className="pcard-coach" surname={career.setup.identity.name} position="st" ovr={Math.round(peak?.reputationAfter ?? career.reputation)} attributes={null} nationality={career.setup.identity.nationality} club={peak?.club ?? career.coach?.club ?? null} league={peak?.league ?? null} shirt={null} avatar={avatar} width={width} coach={{ label: d64(t.locale,"coach"), ratingLabel: t.tt("header.reputation"), formation: peak?.formation ?? career.coach?.tactics.formation, stats }} />;
}
