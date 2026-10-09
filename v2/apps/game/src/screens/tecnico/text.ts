import type { ClubOffer, CoachCareer, Moment } from "@craque/engine/coach";
import { getClub, getCompetition } from "@craque/world";
import { playerRow } from "../../features/tecnico/view";
import type { TecnicoTranslator } from "../../i18n/tecnico/useTecnicoT";

/** Textos montados das telas do Técnico (sem componentes, para o recarregamento rápido do Vite). */

export function clubName(id: string | null | undefined): string {
  if (!id) return "";
  return getClub(id)?.name ?? id;
}

/** Nome de uma competição do Técnico (mesmos ids do mundo do Craque). */
export function competitionName(id: string, locale: "pt" | "es" | "en"): string {
  return getCompetition(id)?.names[locale] ?? id;
}

/** Rótulo de uma fase ou rodada ("R16", "group:3", "12"). */
export function roundName(tt: TecnicoTranslator["tt"], round: string): string {
  if (/^\d+$/.test(round)) return tt("competitions.rounds.league", { round });
  if (round.startsWith("group")) return tt("competitions.rounds.group");
  const known = ["F", "FF", "SF", "QF", "R16", "R32", "R64", "R128", "P1", "G", "prelim", "entered", "champion"] as const;
  const match = known.find((item) => item === round);
  return match ? tt(`competitions.rounds.${match}`) : round;
}

/** Rótulo do período: temporada inteira no rápido, turno no lento. */
export function periodLabel(career: CoachCareer, tt: TecnicoTranslator["tt"]): string {
  if (career.setup.mode === "fast") return tt("common.half.full");
  return career.half === 0 ? tt("common.half.first") : tt("common.half.second");
}

/** Objetivo da proposta em palavras: o nome e a meta de posição. */
export function objectiveText(t: TecnicoTranslator, offer: Pick<ClubOffer, "objective">): string {
  return `${t.g(`objectives.${offer.objective.kind}.name`)} · ${t.g(`objectives.${offer.objective.kind}.target`, { target: offer.objective.target })}`;
}

export function playerName(career: CoachCareer, id: string): string {
  const player = career.players[id];
  if (player) return playerRow(career, player).name;
  return career.legacy[id]?.name || id;
}

/** Um momento do período em uma frase. */
export function momentText(career: CoachCareer, moment: Moment, t: TecnicoTranslator): string {
  const club = (id: string) => getClub(id)?.name ?? id;
  switch (moment.kind) {
    case "derbyWin":
    case "derbyLoss":
    case "bigWin":
    case "bigLoss":
      return t.g(`moments.${moment.kind}`, { opponent: club(moment.opponent), score: `${moment.score[0]} × ${moment.score[1]}` });
    case "title":
      return t.g("moments.title", { competition: competitionName(moment.competition, t.locale) });
    case "eliminated":
      return t.g("moments.eliminated", { competition: competitionName(moment.competition, t.locale), round: roundName(t.tt, moment.round) });
    case "promotion":
    case "relegation":
      return t.g(`moments.${moment.kind}`);
    case "hatTrick":
    case "debut":
      return t.g(`moments.${moment.kind}`, { player: playerName(career, moment.player) });
    case "matchEvent":
      return t.g(moment.outcome === "success" ? "moments.matchEventSuccess" : "moments.matchEventFailure");
    case "signing":
      return t.g("moments.signing", { player: playerName(career, moment.player), fee: t.money(moment.fee) });
    case "sale":
      return t.g("moments.sale", { player: playerName(career, moment.player), fee: t.money(moment.fee), buyer: club(moment.buyer) });
  }
}
