import type { CountryCode } from "@craque/world";
import type { Position } from "../player/positions";
import { ageOf, output, positionPenalty } from "./players";
import { bestEleven, FORMATION_SLOTS, type OnField } from "./tactics";
import type { CoachPlayer, CoachPromise, Fixture, Tactics } from "./types";
import { BENCH_SIZE, REGISTRATION, ROTATION, SQUAD_MINIMUM } from "./tuning";

/**
 * Escalação, inscrição e rotação (spec 10). O usuário escolhe titulares e
 * reservas; o jogo troca quem não pode jogar, descansa alguns em jogos de
 * menor peso e completa o banco. Promessas de minutos entram primeiro.
 */

export function registrationRule(country: CountryCode) {
  return REGISTRATION[country] ?? REGISTRATION.default;
}

export function benchSize(country: CountryCode): number {
  return BENCH_SIZE[country] ?? BENCH_SIZE.default;
}

/**
 * Inscrição automática: os jovens até a idade-limite ficam fora do teto; dos
 * demais, entram os de maior OVR até o teto do país. A elegibilidade dos
 * jovens muda com a temporada (é a idade no ano).
 */
export function registered(squad: readonly CoachPlayer[], country: CountryCode, year: number): Set<string> {
  const rule = registrationRule(country);
  const ids = new Set<string>();
  const seniors = squad.filter((player) => ageOf(player, year) > rule.youthAge).sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id));
  for (const player of squad) if (ageOf(player, year) <= rule.youthAge) ids.add(player.id);
  for (const player of seniors.slice(0, rule.senior)) ids.add(player.id);
  return ids;
}

export function isAvailable(player: CoachPlayer, day: number): boolean {
  return !player.injury || player.injury.until <= day;
}

/** Elenco viável: goleiros e jogadores mínimos (spec 10, "evite operações que deixem o clube sem escalação"). */
export function viableSquad(squad: readonly CoachPlayer[]): boolean {
  const keepers = squad.filter((player) => player.position === "gk").length;
  return squad.length >= SQUAD_MINIMUM.players && keepers >= SQUAD_MINIMUM.goalkeepers;
}

/** Escalação inicial sugerida: o melhor time na formação, banco com os melhores restantes. */
export function suggestTactics(squad: readonly CoachPlayer[], tactics: Pick<Tactics, "formation" | "philosophy">, country: CountryCode, year: number, day: number): Tactics {
  const allowed = registered(squad, country, year);
  const pool = squad.filter((player) => allowed.has(player.id) && isAvailable(player, day));
  const eleven = bestEleven(pool, tactics.formation, (player, slot) => player.level - 0 + positionPenalty(player, slot));
  const lineup = FORMATION_SLOTS[tactics.formation].map((_, index) => eleven[index]?.player.id ?? "");
  const chosen = new Set(lineup);
  const bench = pool
    .filter((player) => !chosen.has(player.id))
    .sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id))
    .slice(0, benchSize(country))
    .map((player) => player.id);
  return { formation: tactics.formation, philosophy: tactics.philosophy, lineup, bench };
}

export interface MatchSheet {
  readonly onField: OnField[];
  readonly bench: CoachPlayer[];
  /** Quem foi poupado ou entrou no lugar de um indisponível. */
  readonly rested: string[];
  readonly replaced: string[];
}

export interface SheetContext {
  readonly fixture: Fixture;
  readonly day: number;
  readonly year: number;
  readonly country: CountryCode;
  readonly opponentStrength: number;
  readonly ownStrength: number;
  readonly big: boolean;
  readonly derby: boolean;
  readonly promises: readonly CoachPromise[];
  readonly rotationRoll: () => number;
}

/** Monta o time do treinador para um jogo a partir da escalação escolhida. */
export function coachSheet(squad: readonly CoachPlayer[], tactics: Tactics, context: SheetContext): MatchSheet {
  const byId = new Map(squad.map((player) => [player.id, player]));
  const allowed = registered(squad, context.country, context.year);
  const usable = (player: CoachPlayer | undefined): player is CoachPlayer =>
    Boolean(player) && allowed.has((player as CoachPlayer).id) && isAvailable(player as CoachPlayer, context.day);
  const slots = FORMATION_SLOTS[tactics.formation];
  const used = new Set<string>();
  const rested: string[] = [];
  const replaced: string[] = [];
  const promised = new Set(context.promises.filter((promise) => promise.status === "active" && promise.player).map((promise) => promise.player as string));

  const minor = !context.big && context.fixture.kind !== "league" && context.fixture.roundKind !== "group" && context.ownStrength - context.opponentStrength >= ROTATION.strengthGap;
  let rotations = 0;
  const lineup = honorStartPromises(tactics, slots, byId, usable, context.promises, rested);

  const onField: OnField[] = [];
  slots.forEach((slot, index) => {
    const chosen = byId.get(lineup[index] ?? "");
    let player: CoachPlayer | undefined = usable(chosen) && !used.has(chosen.id) ? chosen : undefined;
    if (player && !context.big && player.role !== "star") {
      const tired = player.consecutiveStarts >= ROTATION.consecutiveStarts && context.rotationRoll() < ROTATION.restChance;
      const cupRest = minor && rotations < ROTATION.cupRotations && context.rotationRoll() < 0.5;
      if ((tired || cupRest) && !promised.has(player.id)) {
        const alternative = pickReplacement(squad, slot, used, usable, promised, tactics.bench, player.id);
        if (alternative && alternative.level >= player.level - 8) {
          rested.push(player.id);
          rotations += 1;
          player = alternative;
        }
      }
    }
    if (!player) {
      if (chosen) replaced.push(chosen.id);
      player = pickReplacement(squad, slot, used, usable, promised, tactics.bench, null) ?? undefined;
    }
    if (player) {
      used.add(player.id);
      onField.push({ player, slot });
    }
  });

  const benchIds = [...tactics.bench];
  const bench: CoachPlayer[] = [];
  for (const id of benchIds) {
    const player = byId.get(id);
    if (usable(player) && !used.has(player.id) && bench.length < benchSize(context.country)) {
      bench.push(player);
      used.add(player.id);
    }
  }
  // Completa o banco: promessas primeiro, depois os melhores.
  const rest = squad
    .filter((player) => usable(player) && !used.has(player.id))
    .sort((a, b) => Number(promised.has(b.id)) - Number(promised.has(a.id)) || b.ovr - a.ovr || a.id.localeCompare(b.id));
  for (const player of rest) {
    if (bench.length >= benchSize(context.country)) break;
    bench.push(player);
    used.add(player.id);
  }
  return { onField, bench, rested, replaced };
}

/**
 * Promessa de titularidade (spec 12): enquanto a parte prometida dos jogos
 * não foi cumprida, a rotação automática dá a vaga ao prometido no lugar do
 * titular mais fraco da mesma posição (ou do mesmo setor), nunca de uma
 * estrela. Custa força em campo nesses jogos: é o preço da promessa.
 */
function honorStartPromises(
  tactics: Tactics,
  slots: readonly Position[],
  byId: ReadonlyMap<string, CoachPlayer>,
  usable: (player: CoachPlayer | undefined) => player is CoachPlayer,
  promises: readonly CoachPromise[],
  rested: string[],
): string[] {
  const lineup = [...tactics.lineup];
  for (const promise of promises) {
    if (promise.status !== "active" || promise.kind !== "starts" || !promise.player) continue;
    const player = byId.get(promise.player);
    if (!usable(player) || lineup.includes(player.id)) continue;
    const starts = player.season.starts - promise.baseline.starts;
    const available = player.season.available - promise.baseline.available + 1;
    if (starts >= promise.target * available) continue;
    let bestIndex = -1;
    let bestScore = -Infinity;
    slots.forEach((slot, index) => {
      const current = byId.get(lineup[index] ?? "");
      if (current?.role === "star") return;
      if ((slot === "gk") !== (player.position === "gk")) return;
      const fit = positionPenalty(player, slot);
      if (fit <= -7) return;
      // Prefere a vaga natural dele e, entre elas, quem rende menos.
      const score = fit * 10 - (current ? current.level : 0);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    if (bestIndex < 0) continue;
    const replaced = lineup[bestIndex];
    if (replaced) rested.push(replaced);
    lineup[bestIndex] = player.id;
  }
  return lineup;
}

function pickReplacement(
  squad: readonly CoachPlayer[],
  slot: Position,
  used: Set<string>,
  usable: (player: CoachPlayer | undefined) => player is CoachPlayer,
  promised: Set<string>,
  bench: readonly string[],
  excluding: string | null,
): CoachPlayer | null {
  let best: CoachPlayer | null = null;
  let bestValue = -Infinity;
  for (const player of squad) {
    if (player.id === excluding || used.has(player.id) || !usable(player)) continue;
    let value = output(player, { slot, big: false, derby: false });
    if (bench.includes(player.id)) value += 1.5;
    if (promised.has(player.id)) value += 4;
    if (value > bestValue || (value === bestValue && best && player.id < best.id)) {
      best = player;
      bestValue = value;
    }
  }
  return best;
}

/** Normaliza a escolha do usuário: só gente do elenco, sem repetição, banco no limite. */
export function sanitizeTactics(tactics: Tactics, squad: readonly CoachPlayer[], country: CountryCode): Tactics {
  const ids = new Set(squad.map((player) => player.id));
  const slots = FORMATION_SLOTS[tactics.formation];
  const seen = new Set<string>();
  const lineup = slots.map((_, index) => {
    const id = tactics.lineup[index] ?? "";
    if (!ids.has(id) || seen.has(id)) return "";
    seen.add(id);
    return id;
  });
  const bench = tactics.bench.filter((id) => ids.has(id) && !seen.has(id) && (seen.add(id), true)).slice(0, benchSize(country));
  return { ...tactics, lineup, bench };
}
