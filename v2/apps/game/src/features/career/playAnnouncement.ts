import { dramaAction, dramaText, matchResultText } from "@craque/content";
import { competitionName } from "@craque/content";
import { type Career, isGoalkeeper, leagueEntry } from "@craque/engine";
import { getClub } from "@craque/world";
import { useT } from "../../i18n/useT";
import type { EventPage, PlaySession, SeasonPage } from "./play";
import { useResultView } from "./resultView";

/**
 * O lance numa frase só, para o leitor de tela (D43): o resultado do evento, o
 * ano, o clube, a posição, os números, o OVR e os títulos da última temporada.
 * A tela da carreira lê isto numa região de aviso que fica sempre lá, então a
 * frase nova é anunciada a cada jogada.
 */
export function usePlayAnnouncement(career: Career | null, play: PlaySession | null): string {
  const resultView = useResultView(career, play);
  const { t, cp, ordinal, locale } = useT();
  if (!career || !play?.fresh) return "";
  if (play.outcome?.kind === "drama") {
    const copy = dramaText(locale);
    const result = play.outcome.result;
    return result ? `${result.success ? copy.success : copy.failure} ${matchResultText(locale, result)} ${copy.fans} ${result.fans}. ${copy.legacy} ${result.legacy}.` : `${dramaAction(locale, play.outcome.action)}. ${play.outcome.decision.kind === "promise" ? copy.promiseAccepted : copy.veteranChosen}.`;
  }
  const seasons = play.pages.filter((page): page is SeasonPage => page.kind === "season");
  const page = seasons[seasons.length - 1];
  const season = page ? career.history[page.index] : undefined;
  const outcome = play.pages.find((item): item is EventPage => item.kind === "event") ?? null;
  if (!page || !season) return resultView ? [resultView.eyebrow, resultView.title, resultView.body, ...resultView.chips.map(chip=>chip.text)].filter(Boolean).join(". ") : "";
  const entry = leagueEntry(season);
  const keeper = isGoalkeeper(season.position);
  const delta = season.ovrEnd - page.previousOvr;
  return [
    outcome ? (outcome.success === null ? t("reveal.eventDone") : outcome.success ? t("reveal.eventSuccess") : t("reveal.eventFailure")) : null,
    String(season.year),
    getClub(season.club)?.name ?? season.club,
    entry?.position ? t("reveal.position", { position: ordinal(entry.position) }) : null,
    cp("stats.gamesCount", season.games),
    keeper ? cp("stats.cleanSheetsCount", season.production.cleanSheets) : cp("stats.goalsCount", season.production.goals),
    `OVR ${season.ovrEnd} (${delta >= 0 ? "+" : ""}${delta})`,
    season.titles.length > 0 ? season.titles.map((id) => competitionName(id, locale)).join(", ") : null,
  ]
    .filter((part): part is string => part !== null)
    .join(". ");
}
