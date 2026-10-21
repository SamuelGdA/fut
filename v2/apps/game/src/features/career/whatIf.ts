import { getClub } from "@craque/world";
import { decisionText, type Locale, optionLabel } from "@craque/content";
import { type Career, type CareerSave, type Choice, choose, createCareer, type DecisionKind, type Decision, type DecisionOption, saveOf } from "@craque/engine";

// Só memória desta sessão: preserva o estado verdadeiro antes de cada escolha,
// inclusive intervenções de teste, sem inventar escolhas para um replay divergente.
const checkpoints = new WeakMap<Career, readonly Career[]>();

function originalCheckpoints(career: Career): readonly Career[] {
  const known = checkpoints.get(career);
  if (known) return known;
  const result: Career[] = [];
  let current = createCareer(career.setup);
  for (const choice of career.choices) {
    if (current.decision?.id !== choice.decision || !current.decision.options.some(option => option.id === choice.option)) break;
    result.push(current);
    current = choose(current, choice).career;
  }
  if(result.length===career.choices.length) checkpoints.set(career,result);
  return result;
}

export function rememberDecision(before: Career, after: Career, choice: Choice): void {
  if (before.decision?.id !== choice.decision) return;
  checkpoints.set(after, [...originalCheckpoints(before), before]);
}

export function carryDecisionMemory(before: Career, after: Career): void {
  checkpoints.set(after, originalCheckpoints(before));
}

export function decisionCheckpoint(career: Career, index: number): Career | undefined {
  return originalCheckpoints(career)[index];
}

export function actualDecisionPoints(career: Career, locale: Locale): DecisionPoint[] {
  const states = originalCheckpoints(career);
  if (states.length !== career.choices.length) return decisionPoints(saveOf(career), locale);
  return states.flatMap((state, index) => {
    const decision = state.decision;
    const option = decision?.options.find(candidate => candidate.id === career.choices[index]?.option);
    return decision && option ? [{ index, kind: decision.kind, age: decision.age, year: decision.year, title: decisionText(locale,state,decision).title, chose: choiceDescription(locale,state,decision,option) }] : [];
  });
}

/**
 * Os pontos de virada de uma carreira, para o "E se...?" (GDD 28.3): cada
 * decisão tomada, com a idade, o título e o que foi escolhido. Sai de refazer
 * a carreira passo a passo; só os textos ficam guardados.
 */
export interface DecisionPoint {
  /** Índice da escolha no save: seguir daqui refaz as escolhas antes dela. */
  readonly index: number;
  readonly kind: DecisionKind;
  readonly age: number;
  readonly year: number;
  readonly title: string;
  readonly chose: string;
}

/** Uma entrada por ano, conservando o índice real de onde o replay pode divergir. */
export function principalDecisionPoints(points: readonly DecisionPoint[]): DecisionPoint[] {
  const seen = new Set<number>();
  return points.filter((point) => {
    if (["match", "promise", "veteran"].includes(point.kind) || seen.has(point.year)) return false;
    seen.add(point.year);
    return true;
  });
}

export function decisionPoints(save: CareerSave, locale: Locale): DecisionPoint[] {
  let career = createCareer(save.setup);
  const points: DecisionPoint[] = [];
  for (const [index, choice] of save.choices.entries()) {
    const decision = career.decision;
    if (!decision || decision.id !== choice.decision) break;
    const option = decision.options.find((candidate) => candidate.id === choice.option);
    // Ajustes de teste podem ter criado ofertas que não existem no replay original.
    // Conserva os pontos válidos, sem derrubar o capítulo inteiro.
    if (!option) break;
    points.push({
      index,
      kind: decision.kind,
      age: decision.age,
      year: decision.year,
      title: decisionText(locale, career, decision).title,
      chose: choiceDescription(locale, career, decision, option),
    });
    career = choose(career, choice).career;
  }
  return points;
}

function choiceDescription(locale: Locale, career: Career, decision: Decision, option: DecisionOption): string {
  const label = optionLabel(locale, career, decision, option);
  const club = option.kind === "club" ? option.offer.club : option.kind === "event" ? option.target?.club?.club : undefined;
  return club ? `${label}: ${getClub(club)?.name ?? club}` : label;
}
