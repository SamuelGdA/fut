import {
  BENCH_FROM_AGE,
  type ChallengeAxis,
  type EdictState,
  getEdict,
  GIANT_STRENGTH,
  SECOND_DIVISION_FROM_AGE,
  UNDERDOG_STRENGTH,
} from "@craque/engine";
import { formatDecimal, interpolate, isPlural, type Locale, type Plural, pluralForm, type Vars } from "./i18n";
import { challengeEn } from "./locales/challenge.en";
import { challengeEs } from "./locales/challenge.es";
import { type ChallengeMessages, challengePt } from "./locales/challenge.pt";

/**
 * O texto do Desafio do dia (GDD 27): o nome de cada missão e a meta com o
 * alvo do dia, o progresso na unidade certa e a regra de cada édito com os
 * limites do motor. Nada aqui decide pontuação.
 */

export const CHALLENGE_TEXTS: Readonly<Record<Locale, ChallengeMessages>> = { pt: challengePt, es: challengeEs, en: challengeEn };

interface MissionTexts {
  readonly name: string;
  readonly goal: Plural;
  readonly hint?: string;
}

const missionTexts = (locale: Locale, id: string): MissionTexts | null =>
  (CHALLENGE_TEXTS[locale].missions as Readonly<Record<string, MissionTexts>>)[id] ?? null;

/** Os números que as dicas das missões citam. */
const MISSION_VARS: Readonly<Record<string, Vars>> = {
  underdogTitles: { strength: UNDERDOG_STRENGTH },
  underdogStar: { strength: UNDERDOG_STRENGTH },
  underdogPodiums: { strength: UNDERDOG_STRENGTH + 2 },
};

/** A fase da Copa, de 0 (nenhuma) a 8 (campeão), dentro dos limites. */
const stageIndex = (value: number) => Math.max(0, Math.min(8, Math.round(value)));

export function missionName(locale: Locale, id: string): string {
  return missionTexts(locale, id)?.name ?? id;
}

/** A meta com o alvo: "120 gols na carreira, por clube e seleção". */
export function missionGoal(locale: Locale, id: string, target: number): string {
  const texts = missionTexts(locale, id);
  if (!texts) return id;
  const stage = id === "worldCupRun" ? (CHALLENGE_TEXTS[locale].worldCupGoals[stageIndex(target) - 1] ?? "") : "";
  return interpolate(pluralForm(locale, texts.goal, target), { n: formatDecimal(target, locale, 0), stage });
}

/** O progresso na unidade da missão: um número, ou a fase da Copa. */
export function missionValue(locale: Locale, id: string, value: number): string {
  if (id === "worldCupRun") return CHALLENGE_TEXTS[locale].worldCupStages[stageIndex(value)] ?? String(value);
  return formatDecimal(value, locale, 0);
}

export function missionHint(locale: Locale, id: string): string | null {
  const hint = missionTexts(locale, id)?.hint;
  return hint ? interpolate(hint, MISSION_VARS[id] ?? {}) : null;
}

export function axisName(locale: Locale, axis: ChallengeAxis): string {
  return CHALLENGE_TEXTS[locale].axes[axis];
}

interface EdictTexts {
  readonly name: string;
  readonly rule: string | Plural;
}

const edictTexts = (locale: Locale, id: string): EdictTexts | null =>
  (CHALLENGE_TEXTS[locale].edicts as Readonly<Record<string, EdictTexts>>)[id] ?? null;

/** As idades e forças que as regras citam. */
const EDICT_VARS: Readonly<Record<string, Vars>> = {
  noBench: { age: BENCH_FROM_AGE },
  noSecondDivision: { age: SECOND_DIVISION_FROM_AGE },
  noGiants: { strength: GIANT_STRENGTH },
};

export function edictName(locale: Locale, id: string): string {
  return edictTexts(locale, id)?.name ?? id;
}

/** A regra com os números do motor: "No máximo 4 clubes na carreira." */
export function edictRule(locale: Locale, id: string): string {
  const texts = edictTexts(locale, id);
  const edict = getEdict(id);
  if (!texts || !edict) return id;
  const template = isPlural(texts.rule) ? pluralForm(locale, texts.rule, edict.limit) : texts.rule;
  return interpolate(template, { limit: formatDecimal(edict.limit, locale, 0), ...EDICT_VARS[id] });
}

export function edictStateName(locale: Locale, state: EdictState): string {
  return CHALLENGE_TEXTS[locale].edictStates[state];
}
