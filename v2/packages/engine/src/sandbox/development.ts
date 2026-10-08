import { clamp, risingLogistic } from "../math";
import { evolveSeason } from "../evolution/evolve";
import type { FormKind } from "../evolution/form";
import { FOCUS_SLOT, focusDueAt, focusesFor, guaranteeFocus, type TrainingFocus } from "../evolution/training";
import { TRAINING_CAP } from "../player/attributes";
import { attributesAt, createPlayer, ovrAt, type Player } from "../player/player";
import { positionWeights, type Position } from "../player/positions";
import { stream } from "../rng";
import { rollBreakthrough, type SquadRole, squadRole } from "../season/role";
import { type Difficulty, FIRST_AGE, LAST_AGE, type Pace, SEASONS_PER_PERIOD, type Six } from "../types";

/**
 * Caixa de areia da evolução (M2).
 *
 * O mercado, as tabelas e os títulos de verdade chegam nos marcos M3 e M4.
 * Para calibrar a evolução antes disso, esta caixa de areia coloca o jogador
 * num clube escolhido por uma política fixa e sorteia títulos por um modelo
 * provisório, simples e declarado. Tudo continua puro e semeado: a mesma
 * entrada produz a mesma carreira.
 *
 * Quem lê os resultados: o harness `tools/balance` e a área Evolução do
 * laboratório. O jogo nunca usa a caixa de areia.
 */

/**
 * Onde o jogador escolhe jogar a cada período.
 * - `balanced`: um clube do nível dele, às vezes um pouco acima.
 * - `minutes`: sempre um clube abaixo, para jogar tudo.
 * - `ambitious`: sempre um clube acima, com treinador melhor e menos jogos.
 * - `random`: qualquer clube de oito abaixo a seis acima.
 */
export const CLUB_POLICIES = ["balanced", "minutes", "ambitious", "random"] as const;
export type ClubPolicy = (typeof CLUB_POLICIES)[number];

/** Como o foco de treino é escolhido a cada período. */
export const FOCUS_POLICIES = ["best", "first", "random", "none"] as const;
export type FocusPolicy = (typeof FOCUS_POLICIES)[number];

export interface DevelopmentInput {
  readonly seed: string;
  readonly position: Position;
  readonly difficulty: Difficulty;
  readonly pace: Pace;
  readonly clubPolicy: ClubPolicy;
  readonly focusPolicy: FocusPolicy;
  /** Ano da primeira temporada; só rotula os fluxos. */
  readonly startYear?: number;
  /** Torcida fixa da caixa de areia, de 0 a 100. */
  readonly fans?: number;
}

export interface DevelopmentSeason {
  readonly age: number;
  readonly year: number;
  readonly clubStrength: number;
  readonly role: SquadRole;
  readonly games: number;
  readonly titleImportance: number;
  readonly focus: TrainingFocus | null;
  readonly form: FormKind;
  readonly gain: number;
  readonly loss: number;
  readonly capacity: number;
  /** A carta do começo da temporada, antes dos jogos. */
  readonly startAttributes: Six;
  /** A carta do fim da temporada (invariante 8). */
  readonly attributes: Six;
  readonly ovr: number;
  /** Bônus de treino no fim da temporada. */
  readonly training: Six;
}

export interface DevelopmentRun {
  readonly input: DevelopmentInput;
  /** O jogador como nasceu, antes da primeira temporada. */
  readonly born: Player;
  /** O OVR que a carta mostra aos 16, antes de jogar. */
  readonly ovrAtStart: number;
  readonly seasons: readonly DevelopmentSeason[];
  readonly final: Player;
}

const STRENGTH_RANGE = { min: 45, max: 92 } as const;

function chooseClub(policy: ClubPolicy, ovr: number, roll: () => number): number {
  const between = (low: number, high: number) => low + (high - low) * roll();
  const offset =
    policy === "minutes"
      ? between(-5, -3)
      : policy === "ambitious"
        ? between(3, 7)
        : policy === "random"
          ? between(-8, 6)
          : between(-3, 1);
  return Math.round(clamp(ovr + offset, STRENGTH_RANGE.min, STRENGTH_RANGE.max));
}

/** O foco que mais sobe o OVR da posição, pulando os que já bateram +8. */
function bestFocus(player: Player): TrainingFocus {
  const weights = positionWeights(player.position);
  const options = focusesFor(player.position);
  const score = (focus: TrainingFocus) => {
    const slot = FOCUS_SLOT[focus];
    return player.training[slot] < TRAINING_CAP ? weights[slot] : 0;
  };
  return [...options].sort((a, b) => score(b) - score(a))[0] ?? (options[0] as TrainingFocus);
}

/** O foco do período pela política. Exportado para a caixa de areia da carreira. */
export function chooseFocus(policy: FocusPolicy, player: Player, roll: () => number): TrainingFocus | null {
  const options = focusesFor(player.position);
  if (policy === "none") return null;
  if (policy === "first") return options[0] ?? null;
  if (policy === "random") return options[Math.floor(roll() * options.length)] ?? null;
  return bestFocus(player);
}

/**
 * Títulos provisórios: um clube forte ganha mais. Só existe para a moral de
 * título (GDD 10.4) ter efeito na calibragem; o M3 troca por tabelas reais.
 */
function provisionalTitles(clubStrength: number, roll: () => number): number {
  let importance = 0;
  if (roll() < 0.04 + 0.5 * risingLogistic(clubStrength, 84, 2.5)) importance += 1;
  if (roll() < 0.08 + 0.15 * risingLogistic(clubStrength, 80, 4)) importance += 0.5;
  if (roll() < 0.35 * risingLogistic(clubStrength, 87, 2)) importance += 2.5;
  return importance;
}

/** Jogos do clube na temporada: liga e algumas copas. */
function clubGames(roll: () => number): number {
  return 38 + Math.floor(roll() * 11);
}

export function runDevelopment(input: DevelopmentInput): DevelopmentRun {
  const startYear = input.startYear ?? 2026;
  const fans = input.fans ?? 60;
  const born = createPlayer({ seed: input.seed, position: input.position, difficulty: input.difficulty });
  const policyRng = stream(input.seed, "policy", "development");
  const roll = () => policyRng.next();
  const periodLength = SEASONS_PER_PERIOD[input.pace];

  const seasons: DevelopmentSeason[] = [];
  let player = born;
  let clubStrength = 0;
  let focus: TrainingFocus | null = null;
  let focusAge: number | null = null;
  let periodStart: { age: number; attributes: Six } | null = null;

  for (let age = FIRST_AGE; age <= LAST_AGE; age += 1) {
    const index = age - FIRST_AGE;
    const year = startYear + index;
    const startsPeriod = index % periodLength === 0;
    if (startsPeriod) {
      clubStrength = chooseClub(input.clubPolicy, ovrAt(player, age), roll);
      // O foco segue a regra do jogo: dos 17 aos 31, a cada quatro anos ou mais.
      const chosen = chooseFocus(input.focusPolicy, player, roll);
      focus = chosen !== null && focusDueAt(input.seed, age, focusAge) ? chosen : null;
      if (focus) focusAge = age;
      periodStart = { age, attributes: attributesAt(player, age) };
    }

    const startAttributes = attributesAt(player, age);
    const seasonRng = stream(input.seed, "season", year);
    const role = rollBreakthrough(seasonRng, player.position, squadRole(player.position, ovrAt(player, age), clubStrength));
    const games = Math.max(0, Math.round(clubGames(() => seasonRng.next()) * role.participation * seasonRng.normal(1, 0.06)));
    const titlesRng = stream(input.seed, "titles", year);
    const titleImportance = provisionalTitles(clubStrength, () => titlesRng.next());

    const evolution = evolveSeason(
      player,
      { age, games, clubStrength, fans, difficulty: input.difficulty, titleImportance, focus: startsPeriod ? focus : null },
      stream(input.seed, "growth", year),
    );
    player = evolution.player;

    const endsPeriod = (index + 1) % periodLength === 0 || age === LAST_AGE;
    if (endsPeriod && focus && periodStart) player = guaranteeFocus(player, focus, periodStart.attributes, age);

    const attributes = attributesAt(player, age);
    seasons.push({
      age,
      year,
      clubStrength,
      role: role.role,
      games,
      titleImportance,
      focus,
      form: evolution.report.form.kind,
      gain: evolution.report.gain,
      loss: evolution.report.loss,
      capacity: player.capacity,
      startAttributes,
      attributes,
      ovr: ovrAt(player, age),
      training: player.training,
    });
  }

  return { input, born, ovrAtStart: ovrAt(born, FIRST_AGE), seasons, final: player };
}
