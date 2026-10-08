import { decisionText, describeEffect, effectTone, eventOutcomeText } from "@craque/content";
import { type Career, FOCUS_SLOT, TRAINING } from "@craque/engine";
import { getClub, getLeague } from "@craque/world";
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
    case "event": {
      const { page } = outcome;
      const mark: ResultMark = page.success === null ? "done" : page.success ? "success" : "failure";
      const chips: ResultChip[] = page.effects.flatMap((effect, index) => {
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
