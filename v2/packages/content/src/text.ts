import {
  type Career,
  type Decision,
  type DecisionOption,
  type Effect,
  eventContext,
  type EventTarget,
  getEvent,
  type Position,
} from "@craque/engine";
import { getClub, getCompetition, getCountry } from "@craque/world";
import { formatSigned, interpolate, type Locale, type Vars } from "./i18n";
import { type CareerKey, careerPlural, careerText } from "./careerText";
import type { CareerMessages } from "./locales/career.pt";
import { eventsEn } from "./locales/events.en";
import { eventsEs } from "./locales/events.es";
import { type EventsMessages, eventsPt } from "./locales/events.pt";

export { CAREER_TEXTS, type CareerKey, type CareerPluralKey, careerPlural, careerText } from "./careerText";

/**
 * Os textos da carreira prontos para a tela: decisão, opções, efeitos e o
 * resultado de cada evento. O jogo e o terminal usam as mesmas funções, então
 * o mesmo evento é contado do mesmo jeito nos dois.
 */

export const EVENT_TEXTS: Readonly<Record<Locale, EventsMessages>> = { pt: eventsPt, es: eventsEs, en: eventsEn };

// ---------------------------------------------------------------- nomes

/**
 * O sobrenome em caixa de nome, para a prosa: o setup guarda em maiúsculas,
 * que funcionam na carta e no placar, mas gritam no meio de uma frase. Cada
 * parte separada por espaço, hífen ou apóstrofo começa maiúscula.
 */
export function displayName(surname: string, locale: Locale): string {
  return surname
    .toLocaleLowerCase(locale)
    .split(/([\s'’-])/)
    .map((part) => (part.length > 0 ? part.charAt(0).toLocaleUpperCase(locale) + part.slice(1) : part))
    .join("");
}

export function clubName(id: string | null | undefined): string {
  return getClub(id)?.name ?? id ?? "";
}

export function countryName(code: string | null | undefined, locale: Locale): string {
  return getCountry(code)?.names[locale] ?? code ?? "";
}

export function competitionName(id: string, locale: Locale): string {
  return getCompetition(id)?.names[locale] ?? id;
}

export function positionName(position: Position, locale: Locale): string {
  return careerText(locale, `positions.${position}`);
}

// --------------------------------------------------------------- eventos

interface OptionText {
  readonly label: string;
  readonly success?: string;
  readonly failure?: string;
  readonly result?: string;
}

interface EventEntry {
  readonly title: string;
  readonly body: string;
  readonly options: Readonly<Record<string, OptionText>>;
}

function eventEntry(locale: Locale, id: string): EventEntry | null {
  const own = (EVENT_TEXTS[locale] as Readonly<Record<string, EventEntry>>)[id];
  return own ?? (EVENT_TEXTS.pt as Readonly<Record<string, EventEntry>>)[id] ?? null;
}

/** Id da opção no catálogo: `number:10` vem da opção `number`. */
export function baseOptionId(optionId: string): string {
  const colon = optionId.indexOf(":");
  return colon < 0 ? optionId : optionId.slice(0, colon);
}

/**
 * Os marcadores de um evento: clube atual, rival histórico do clube e, para a
 * opção, o destino, a posição, o país e o número.
 */
export function eventVars(locale: Locale, career: Career, target: EventTarget | null = null): Vars {
  const context = career.contract ? eventContext(career) : null;
  return {
    club: clubName(career.contract?.club),
    rivalClub: clubName(context?.rivalClub),
    target: target?.club ? clubName(target.club.club) : "",
    position: target?.position ? positionName(target.position, locale) : "",
    country: target?.country ? countryName(target.country, locale) : "",
    number: target?.number ?? "",
  };
}

/** O primeiro destino entre as opções, para o corpo do evento poder citar o clube ou o país. */
function decisionTarget(decision: Decision): EventTarget | null {
  for (const option of decision.options) {
    if (option.kind === "event" && option.target) return option.target;
  }
  return null;
}

export interface DecisionText {
  readonly title: string;
  readonly body: string;
}

/** Título e texto de uma decisão. */
export function decisionText(locale: Locale, career: Career, decision: Decision): DecisionText {
  if (decision.kind === "event" && decision.event) {
    const entry = eventEntry(locale, decision.event);
    const vars = eventVars(locale, career, decisionTarget(decision));
    return entry
      ? { title: interpolate(entry.title, vars), body: interpolate(entry.body, vars) }
      : { title: decision.event, body: "" };
  }
  const loanOwner = career.contract?.loan?.owner;
  const vars: Vars = { club: clubName(career.contract?.club), owner: clubName(loanOwner), age: decision.age };
  const key = ((): keyof CareerMessages["decision"] => {
    switch (decision.kind) {
      case "return":
        return decision.options.some((option) => option.kind === "club" && option.offer.back) ? "returnRetained" : "returnReleased";
      case "window":
      case "event":
        return decision.reason === "suspended" ? "suspended" : "window";
      default:
        return decision.kind;
    }
  })();
  return {
    title: careerText(locale, `decision.${key}.title`, vars),
    body: careerText(locale, `decision.${key}.body`, vars),
  };
}

/** O rótulo de uma opção. */
export function optionLabel(locale: Locale, career: Career, decision: Decision, option: DecisionOption): string {
  switch (option.kind) {
    case "club":
      if (option.offer.back) return careerText(locale, "option.back");
      if (option.offer.buyout) return careerText(locale, "option.buyout");
      return careerText(locale, decision.kind === "loan" ? "option.loan" : "option.sign");
    case "stay":
      if (decision.kind === "loan") return careerText(locale, "option.refuseLoan");
      return careerText(locale, "option.stay");
    case "retire":
      return careerText(locale, "option.retire");
    case "focus":
      return careerText(locale, `focus.${option.focus}.name`);
    case "event": {
      const entry = decision.event ? eventEntry(locale, decision.event) : null;
      const text = entry?.options[baseOptionId(option.id)];
      return text ? interpolate(text.label, eventVars(locale, career, option.target)) : option.id;
    }
  }
}

/**
 * O texto do resultado de uma opção de evento: o de sucesso ou fracasso nas
 * arriscadas, o único nas outras. Use a carreira de *antes* da escolha, para
 * o clube atual ainda ser o de onde ele saiu.
 */
export function eventOutcomeText(
  locale: Locale,
  career: Career,
  eventId: string,
  option: Extract<DecisionOption, { kind: "event" }>,
  success: boolean | null,
): string {
  const text = eventEntry(locale, eventId)?.options[baseOptionId(option.id)];
  if (!text) return "";
  const template = success === null ? text.result : success ? text.success : text.failure;
  return template ? interpolate(template, eventVars(locale, career, option.target)) : "";
}

// --------------------------------------------------------------- efeitos

/** Porcentagem com sinal a partir de um multiplicador: 0,8 vira "-20". */
function percent(scale: number, locale: Locale): string {
  return formatSigned(Math.round((scale - 1) * 100), locale, 0);
}

/**
 * Um efeito em uma linha, para a prévia da opção e o resultado. `story` não
 * aparece (é só biografia) e devolve `null`.
 */
export function describeEffect(locale: Locale, effect: Effect, target: EventTarget | null = null): string | null {
  const t = (key: CareerKey, vars?: Vars) => careerText(locale, key, vars);
  switch (effect.kind) {
    case "capacity": {
      const value = formatSigned(effect.amount, locale);
      if (effect.when === "now") return t("effect.capacityNow", { value });
      return t(effect.when === "period" ? "effect.capacityPeriod" : "effect.capacityLater", { value });
    }
    case "potential":
      return t("effect.potential", { value: formatSigned(effect.amount, locale) });
    case "attributes":
      return t("effect.attributes", { value: formatSigned(effect.amount, locale) });
    case "fans":
      return t("effect.fans", { value: formatSigned(effect.amount, locale, 0) });
    case "pressure":
      return t(effect.amount >= 0 ? "effect.pressureUp" : "effect.pressureDown");
    case "role":
      return t(effect.change === "up" ? "effect.roleUp" : effect.change === "down" ? "effect.roleDown" : "effect.roleFixStarter");
    case "games":
      return t("effect.games", { value: percent(effect.scale, locale) });
    case "injury":
      return t("effect.injury", { value: percent(effect.scale, locale) });
    case "production":
      return t("effect.production", { value: percent(effect.scale, locale) });
    case "growth":
      return t("effect.growth", { value: percent(effect.scale, locale) });
    case "boost": {
      const value = formatSigned(effect.amount, locale);
      if (effect.target === "league") return t("effect.boostLeague", { value });
      return t(effect.target === "cup" ? "effect.boostCup" : "effect.boostContinental", { value });
    }
    case "final":
      return t(effect.result === "win" ? "effect.finalWin" : "effect.finalLose");
    case "national":
      return t(effect.mode === "force" ? "effect.nationalForce" : "effect.nationalSkip");
    case "suspension":
      return effect.seasons < 1
        ? t("effect.suspensionHalf")
        : careerPlural(locale, "effect.suspension", effect.seasons);
    case "transfer":
      return t("effect.transfer", { club: target?.club ? clubName(target.club.club) : "" });
    case "position":
      return t("effect.position", { position: target?.position ? positionName(target.position, locale) : "" });
    case "nationality":
      return t("effect.nationality", { country: target?.country ? countryName(target.country, locale) : "" });
    case "shirt":
      return effect.number === "ten" ? t("effect.shirtTen") : t("effect.shirt", { number: target?.number ?? "" });
    case "block":
      return t("effect.block");
    case "market":
      return t(effect.amount >= 0 ? "effect.marketUp" : "effect.marketDown");
    case "clubStrength":
      return t("effect.clubStrength", { value: formatSigned(effect.amount, locale) });
    case "award":
      return t(effect.amount >= 0 ? "effect.awardUp" : "effect.awardDown");
    case "story":
      return null;
  }
}

export type EffectTone = "good" | "bad" | "neutral";

/**
 * Se um efeito é bom ou ruim para o jogador, para o glifo ao lado do texto
 * (▲ ▼ ●, GDD 36). Pressão sobe a cobrança, então conta como ruim; trocas de
 * clube, posição e seleção são neutras: quem decide se é bom é o jogador.
 */
export function effectTone(effect: Effect): EffectTone {
  const sign = (value: number): EffectTone => (value > 0 ? "good" : value < 0 ? "bad" : "neutral");
  switch (effect.kind) {
    case "capacity":
    case "potential":
    case "attributes":
    case "fans":
    case "market":
    case "clubStrength":
    case "award":
      return sign(effect.amount);
    case "boost":
      return sign(effect.amount);
    case "pressure":
      return sign(-effect.amount);
    case "role":
      return effect.change === "down" ? "bad" : "good";
    case "games":
    case "production":
    case "growth":
      return sign(effect.scale - 1);
    case "injury":
      return sign(1 - effect.scale);
    case "final":
      return effect.result === "win" ? "good" : "bad";
    case "national":
      return effect.mode === "force" ? "good" : "neutral";
    case "suspension":
    case "block":
      return "bad";
    case "shirt":
      return "good";
    case "transfer":
    case "position":
    case "nationality":
    case "story":
      return "neutral";
  }
}

/** Todos os efeitos visíveis de uma lista, na ordem. */
export function describeEffects(locale: Locale, effects: readonly Effect[], target: EventTarget | null = null): string[] {
  return effects.flatMap((effect) => {
    const text = describeEffect(locale, effect, target);
    return text === null ? [] : [text];
  });
}

/** O evento existe no catálogo e tem texto. Para os testes e para o laboratório. */
export function hasEventText(locale: Locale, id: string): boolean {
  return getEvent(id) !== null && eventEntry(locale, id) !== null;
}
