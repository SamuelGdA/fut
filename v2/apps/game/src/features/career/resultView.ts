import { dramaAction, dramaHint, dramaText, matchOutcomeText } from "@craque/content";
import { decisionText, describeEffect, effectTone, eventOutcomeText } from "@craque/content";
import { type Career, FOCUS_SLOT, TRAINING } from "@craque/engine";
import { getClub, getCompetition, getLeague } from "@craque/world";
import { attributeText } from "../../i18n/attributes";
import { useT } from "../../i18n/useT";
import type { Tone } from "../../ui/tone";
import type { PlaySession } from "./play";

/**
 * A mensagem do resultado da escolha (D45), pronta para desenhar: o desenho
 * da animação (`mark`), o tom, a sobrelinha, o título, uma frase e os efeitos
 * em pílulas. Sai do lance que acabou de acontecer; temporada revista não tem
 * mensagem.
 */
export type ResultMark = "success" | "failure" | "done" | "move" | "stay" | "focus";

export interface ResultChip {
  readonly key: string;
  readonly text: string;
  readonly tone: Tone;
}

export interface ResultView {
  /** O id do lance: muda a cada escolha e reinicia a animação. */
  readonly id: number;
  readonly mark: ResultMark;
  readonly tone: Tone;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string | null;
  /** Escudo do clube envolvido (o novo, o de agora), se houver. */
  readonly club: string | null;
  readonly chips: readonly ResultChip[];
}

export function useResultView(career: Career | null, play: PlaySession | null): ResultView | null {
  const { t, tp, c, locale } = useT();
  const outcome = play?.fresh ? play.outcome : null;
  if (!career || !play || !outcome) return null;
  const clubName = (id: string) => getClub(id)?.name ?? id;
  const seasons = play.pages.filter((page) => page.kind === "season").length;

  switch (outcome.kind) {
    case "drama": {
      const copy = dramaText(locale);
      const result = outcome.result;
      const mark: ResultMark = result ? result.success ? "success" : "failure" : "done";
      const action = dramaAction(locale, outcome.action, career.player.position);
      const report = outcome.decision.kind === "promise" ? career.history.toReversed().find(record => record.promise?.year === outcome.decision.year)?.promise : undefined;
      const accepted = outcome.decision.promises?.find(promise => promise.level === outcome.action);
      const detail = result ? matchOutcomeText(locale, result, career.player.position)
        : report ? `${report.fulfilled ? copy.fulfilled : copy.failed} · ${report.actual} / ${report.target} ${copy[report.metric]}`
        : accepted ? `${accepted.target}+ ${copy[accepted.metric]} · ${accepted.year}${accepted.throughYear && accepted.throughYear !== accepted.year ? ` / ${accepted.throughYear}` : ""}`
        : dramaHint(locale, outcome.action, career.player.position);
      const ending = !result ? "" : result.match.stage === "league" ? result.score[0] === result.score[1] ? copy.draw : "" : result.match.stage === "final" ? result.won ? copy.champion : copy.runnerUp : result.won ? copy.advanced : copy.eliminated;
      const chips: ResultChip[] = result ? [{
        key: "fans",
        text: `${copy.fans} ${result.fans > 0 ? "+" : ""}${result.fans}`,
        tone: result.fans < 0 ? "bad" : result.fans > 0 ? "good" : "neutral",
      }] : [];
      if (result?.legacy) chips.push({ key: "legacy", text: `${copy.legacy} +${result.legacy}`, tone: "glory" });
      return {
        id: play.id, mark,
        tone: result ? result.success ? "good" : "bad" : "neutral",
        eyebrow: result ? result.success ? copy.success : copy.failure
          : outcome.decision.kind === "promise" ? copy.promiseAccepted : copy.veteranChosen,
        title: result ? `${copy.fullTime}: ${result.score.join(" × ")}${result.penalties ? ` (${copy.penalties} ${result.penalties.join(" × ")})` : ""}${ending ? ` · ${ending}` : ""}` : action,
        body: result ? `${getCompetition(result.match.competition)?.names[locale] ?? result.match.competition}: ${detail}` : detail,
        club: null, chips,
      };
    }
    case "event": {
      const { page } = outcome;
      const mark: ResultMark = page.success === null ? "done" : page.success ? "success" : "failure";
      const chips: ResultChip[] = page.effects.flatMap((effect, index) => {
        if (effect.kind === "injury" && effect.scale > 1) return [];
        const text = describeEffect(locale, effect, page.option.target);
        if (text === null) return [];
        const tone = effectTone(effect);
        return [{ key: `${effect.kind}-${index}`, text, tone: tone === "good" ? "good" : tone === "bad" ? "bad" : "neutral" } satisfies ResultChip];
      });
      return {
        id: play.id,
        mark,
        tone: mark === "success" ? "good" : mark === "failure" ? "bad" : "neutral",
        eyebrow: t(`career.result.${mark}`),
        title: decisionText(locale, page.before, page.decision).title,
        body: eventOutcomeText(locale, page.before, page.eventId, page.option, page.success) || null,
        club: outcome.club,
        chips: outcome.club ? [{ key: "club", text: clubName(outcome.club), tone: "info" }, ...chips] : chips,
      };
    }
    case "move": {
      const league = getLeague(outcome.league);
      return {
        id: play.id,
        mark: "move",
        tone: "glory",
        eyebrow: t(`career.result.${outcome.how}`),
        title: clubName(outcome.club),
        body: league ? league.name : null,
        club: outcome.club,
        chips: [{ key: "shirt", text: t("career.result.shirt", { number: outcome.shirt }), tone: "neutral" }],
      };
    }
    case "stay":
      return {
        id: play.id,
        mark: "stay",
        tone: "good",
        eyebrow: t("career.result.stay"),
        title: clubName(outcome.club),
        body: tp("career.result.staySeasons", Math.max(1, seasons)),
        club: outcome.club,
        chips: outcome.shirt === null ? [] : [{ key: "shirt", text: t("career.result.newShirt", { number: outcome.shirt }), tone: "glory" }],
      };
    case "focus": {
      const attribute = attributeText(t, career.player.position, FOCUS_SLOT[outcome.focus], "name");
      return {
        id: play.id,
        mark: "focus",
        tone: "good",
        eyebrow: t("career.result.focus"),
        title: c(`focus.${outcome.focus}.name`),
        body: c(`focus.${outcome.focus}.body`),
        club: null,
        chips: attribute ? [{ key: "attribute", text: `+${TRAINING.focus} ${attribute}`, tone: "good" }] : [],
      };
    }
  }
}
