import { clubIndex } from "../world/model";
import type { Career, CareerLogEntry, CareerNotice, Decision, DecisionOption } from "./types";

/**
 * O diário da carreira (GDD 21.1). Cada jogada vira entradas com idade e ano,
 * tiradas dos avisos da própria jogada: o que acontece na escolha leva a idade
 * da temporada que vai começar; o que acontece dentro de uma temporada (rival,
 * primeira convocação) leva a idade daquela temporada.
 */

/** Teto do diário: uma carreira de 24 temporadas fica bem abaixo disto. */
export const LOG_MAX = 300;

interface Moment {
  readonly age: number;
  readonly year: number;
}

/** A maior oferta recusada, com o que ele escolheu no lugar. */
function refusedEntry(career: Career, decision: Decision, option: DecisionOption, at: Moment): CareerLogEntry | null {
  let best: { club: string; strength: number } | null = null;
  for (const candidate of decision.options) {
    if (candidate.kind !== "club" || candidate.id === option.id) continue;
    if (!best || candidate.offer.strength > best.strength) best = { club: candidate.offer.club, strength: candidate.offer.strength };
  }
  if (!best) return null;
  let chosen: string | null = null;
  let chosenStrength: number | null = null;
  if (option.kind === "club") {
    chosen = option.offer.club;
    chosenStrength = option.offer.strength;
  } else if (option.kind === "stay" && career.contract) {
    chosen = career.contract.club;
    chosenStrength = career.world.strength[clubIndex(career.contract.club)] ?? null;
  }
  return { kind: "refused", ...best, chosen, chosenStrength, ...at };
}

/** As entradas de uma jogada: `before` é a carreira na hora da escolha, `after` depois do período. */
export function stepLog(
  before: Career,
  after: Career,
  decision: Decision,
  option: DecisionOption,
  notices: readonly CareerNotice[],
): CareerLogEntry[] {
  const at: Moment = { age: before.age, year: decision.year };
  const entries: CareerLogEntry[] = [];

  if (decision.kind === "release" && before.contract) entries.push({ kind: "released", club: before.contract.club, ...at });
  const refused = refusedEntry(before, decision, option, at);
  if (refused) entries.push(refused);

  let current = at;
  for (const notice of notices) {
    switch (notice.kind) {
      case "season": {
        const record = after.history.find((candidate) => candidate.year === notice.year);
        current = { age: record?.age ?? current.age, year: notice.year };
        break;
      }
      case "eventOutcome":
        entries.push({ kind: "event", event: notice.event, option: notice.option, success: notice.success, ...current });
        break;
      case "transfer":
        entries.push({ kind: "transfer", from: notice.from, to: notice.to, loan: notice.loan, traitor: notice.traitor, ...current });
        break;
      case "shirt":
        entries.push({ kind: "shirt", number: notice.number, ...current });
        break;
      case "focus":
        entries.push({ kind: "focus", focus: notice.focus, ...current });
        break;
      case "firstCap":
        entries.push({ kind: "firstCap", age: notice.age, year: current.year });
        break;
      case "retired":
        // A aposentadoria entra pelo fim da carreira, logo abaixo, venha da escolha ou da idade.
        break;
    }
  }

  if (!before.end && after.end) entries.push({ kind: "retired", reason: after.end.reason, age: after.end.age, year: after.world.year });
  return entries;
}

/** Acrescenta entradas ao diário, respeitando o teto. */
export function appendLog(career: Career, entries: readonly CareerLogEntry[]): Career {
  if (entries.length === 0) return career;
  return { ...career, log: [...career.log, ...entries].slice(-LOG_MAX) };
}
