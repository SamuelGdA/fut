import { decisionText, type Locale, optionLabel } from "@craque/content";
import { type CareerSave, choose, createCareer, type DecisionKind } from "@craque/engine";

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

export function decisionPoints(save: CareerSave, locale: Locale): DecisionPoint[] {
  let career = createCareer(save.setup);
  const points: DecisionPoint[] = [];
  for (const [index, choice] of save.choices.entries()) {
    const decision = career.decision;
    if (!decision || decision.id !== choice.decision) break;
    const option = decision.options.find((candidate) => candidate.id === choice.option);
    points.push({
      index,
      kind: decision.kind,
      age: decision.age,
      year: decision.year,
      title: decisionText(locale, career, decision).title,
      chose: option ? optionLabel(locale, career, decision, option) : choice.option,
    });
    career = choose(career, choice).career;
  }
  return points;
}
