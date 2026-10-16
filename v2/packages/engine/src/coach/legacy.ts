import type { CoachCareer, CoachPlayer } from "./types";
import { squadOf } from "./world";

/** O auge continua consultável mesmo depois de uma venda ou aposentadoria. */
export function rememberSquad(career: CoachCareer): void {
  if (!career.coach) return;
  for (const player of squadOf(career, career.coach.club)) {
    const legacy = career.legacy[player.id] ??= { player: player.id, name: player.name, nationality: player.nationality, position: player.position, apps: 0, goals: 0, seasons: 0, bestOvr: player.ovr, firstOvr: player.ovr, revealed: player.youthClub === career.coach.club, signed: player.arrival?.kind === "board" || player.arrival?.kind === "purchase" };
    if (!legacy.peak || player.ovr > legacy.bestOvr || (player.ovr === legacy.bestOvr && player.season.apps > legacy.peak.season.apps)) {
      legacy.peak = { ...player, traits: [...player.traits], alternates: [...player.alternates], recentRatings: [], season: { ...player.season } };
      legacy.peakYear = career.year;
    }
    legacy.bestOvr = Math.max(legacy.bestOvr, player.ovr);
    legacy.byClub ??= {};
    const local = legacy.byClub[player.club] ??= { apps: 0, goals: 0, assists: 0, seasons: 0, ratingSum: 0, rated: 0, bestOvr: player.ovr };
    local.bestOvr = Math.max(local.bestOvr, player.ovr);
  }
}

/** Tempo sozinho não faz um ídolo: volume, rendimento e relevância para este elenco. */
export function isClubIdol(career: CoachCareer, player: CoachPlayer): boolean {
  const legacy = career.legacy[player.id], club = career.coach?.club;
  const local = club ? legacy?.byClub?.[club] : null;
  if (!local || !club || local.seasons < 4 || local.apps < 120 || career.year - player.joinedYear < 3) return false;
  const attacking = ["st", "lw", "rw", "cam"].includes(player.position);
  const expected = attacking ? 0.25 : ["cm", "lm", "rm"].includes(player.position) ? 0.12 : 0;
  const rating = local.rated ? local.ratingSum / local.rated : 0;
  return local.bestOvr >= (career.clubs[club]?.strength ?? 70) - 2 && rating >= 6.8 && (local.goals + local.assists) / local.apps >= expected;
}
