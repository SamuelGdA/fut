import { clamp } from "../math";
import { type Rng, stream } from "../rng";
import type { Difficulty, Six } from "../types";
import { ageProfile, ATTRIBUTE_MAX, ATTRIBUTE_MIN, REFERENCE_AGE } from "./attributes";
import { ovrOf, weightedLevel } from "./ovr";
import {
  GROUP_OF,
  isGoalkeeper,
  LONGEVITY,
  normalizedMold,
  PEAK_AGE_BASE,
  POSITIONS,
  type Position,
} from "./positions";
import {
  drawInitialCapacity,
  drawPotential,
  drawProdigy,
  drawTalent,
  type TalentBand,
} from "./talent";
import { drawTrait, type Trait } from "./traits";

/** Quando o corpo amadurece: muda a idade de pico (GDD 9.7). */
export type Maturity = "early" | "normal" | "late";

const MATURITY_SHIFT: Readonly<Record<Maturity, number>> = { early: -2, normal: 0, late: 2 };

/**
 * O jogador como o motor o vê. Imutável: toda mudança devolve um jogador novo.
 *
 * A capacidade `capacity` (L) e o potencial (P) nunca aparecem na tela. O que
 * aparece são os atributos e o OVR, sempre derivados daqui (`attributesAt`).
 */
export interface Player {
  readonly position: Position;
  readonly talent: TalentBand;
  /** P: o teto suave do nível total (capacidade mais treino). */
  readonly potential: number;
  /** L: habilidade natural, na escala do OVR, com casas decimais. */
  readonly capacity: number;
  /** Chegou pronto aos 16 (GDD 9.6). */
  readonly prodigy: boolean;
  readonly maturity: Maturity;
  readonly peakAge: number;
  /**
   * Anos a mais antes do declínio, além do que a posição já dá (D42). Zagueiro
   * e goleiro envelhecem tarde por natureza; um meia ou atacante de corpo
   * privilegiado tem uma chance pequena de durar como eles.
   */
  readonly longevity: number;
  readonly trait: Trait;
  /** O jeito individual de jogar: desvio por atributo, soma zero no peso da posição. */
  readonly dna: Six;
  /** Bônus permanentes de treino e eventos, de 0 a +8 por atributo. */
  readonly training: Six;
}

export interface NewPlayerInput {
  readonly seed: string;
  readonly position: Position;
  readonly difficulty: Difficulty;
}

/** Desvio do DNA por atributo antes de recentrar (GDD 9.4). */
const DNA_DEVIATION = 2.2;

/** Recentra o DNA para que ele não mude o OVR, só o desenho da carta. */
function recentreDna(raw: Six, position: Position): Six {
  const mean = weightedLevel(position, raw);
  return [raw[0] - mean, raw[1] - mean, raw[2] - mean, raw[3] - mean, raw[4] - mean, raw[5] - mean];
}

/**
 * O desenho da posição: o molde normalizado menos o efeito da idade na idade
 * de referência. Somado a L, aos 28 anos e sem treino, dá um OVR igual a L em
 * qualquer posição. Calculado uma vez por posição.
 */
const SHAPES: ReadonlyMap<Position, Six> = new Map(
  POSITIONS.map((position) => {
    const mold = normalizedMold(position);
    const reference = weightedLevel(position, ageProfile(position, REFERENCE_AGE));
    const shape: Six = [
      mold[0] - reference,
      mold[1] - reference,
      mold[2] - reference,
      mold[3] - reference,
      mold[4] - reference,
      mold[5] - reference,
    ];
    return [position, shape];
  }),
);

export function positionShape(position: Position): Six {
  const shape = SHAPES.get(position);
  if (!shape) throw new Error(`positionShape: posição desconhecida ${position}`);
  return shape;
}

/** Longevidade (D42): sempre um sorteio, para o fluxo não depender da posição. */
export function drawLongevity(rng: Rng, position: Position): number {
  const rule = LONGEVITY[GROUP_OF[position]];
  return rng.next() < rule.chance ? rule.years : 0;
}

/**
 * Cria o jogador aos 16 anos. Cada característica vem de um fluxo próprio do
 * nascimento: ajustar o sorteio do DNA nunca muda o talento de uma semente.
 */
export function createPlayer({ seed, position, difficulty }: NewPlayerInput): Player {
  const talent = drawTalent(stream(seed, "birth", "talent"), difficulty);
  const potential = drawPotential(stream(seed, "birth", "potential"), talent);
  const initial = drawInitialCapacity(stream(seed, "birth", "capacity"), talent);
  const prodigyCapacity = drawProdigy(stream(seed, "birth", "prodigy"), talent, potential, initial);

  const peakRng = stream(seed, "birth", "peak");
  const maturity: Maturity = isGoalkeeper(position)
    ? "normal"
    : peakRng.weighted<Maturity>([
        ["early", 15],
        ["normal", 70],
        ["late", 15],
      ]);
  const peakAge = PEAK_AGE_BASE[GROUP_OF[position]] + MATURITY_SHIFT[maturity] + peakRng.normal(0, 0.6);

  const trait = drawTrait(stream(seed, "birth", "trait"));
  const longevity = drawLongevity(stream(seed, "birth", "longevity"), position);

  const dnaRng = stream(seed, "birth", "dna");
  const rawDna: Six = [
    dnaRng.normal(0, DNA_DEVIATION),
    dnaRng.normal(0, DNA_DEVIATION),
    dnaRng.normal(0, DNA_DEVIATION),
    dnaRng.normal(0, DNA_DEVIATION),
    dnaRng.normal(0, DNA_DEVIATION),
    dnaRng.normal(0, DNA_DEVIATION),
  ];

  return {
    position,
    talent,
    potential,
    capacity: prodigyCapacity ?? initial,
    prodigy: prodigyCapacity !== null,
    maturity,
    peakAge,
    longevity,
    trait,
    dna: recentreDna(rawDna, position),
    training: [0, 0, 0, 0, 0, 0],
  };
}

/** Quanto o treino soma ao OVR: a média dos bônus pelos pesos da posição. */
export function trainingLevel(player: Pick<Player, "position" | "training">): number {
  return weightedLevel(player.position, player.training);
}

/**
 * O nível total que o potencial limita: a capacidade natural mais o que o
 * treino soma ao OVR. O treino acelera e molda, mas não fura o teto.
 */
export function overallLevel(player: Player): number {
  return player.capacity + trainingLevel(player);
}

/**
 * Os seis atributos numa idade (GDD 9.4):
 * `limitar(arredondar(L + desenho + DNA + idade + treino), 1, 99)`.
 */
export function attributesAt(player: Player, age: number): Six {
  const shape = positionShape(player.position);
  const aging = ageProfile(player.position, age);
  const value = (slot: 0 | 1 | 2 | 3 | 4 | 5) =>
    clamp(
      Math.round(player.capacity + shape[slot] + player.dna[slot] + aging[slot] + player.training[slot]),
      ATTRIBUTE_MIN,
      ATTRIBUTE_MAX,
    );
  return [value(0), value(1), value(2), value(3), value(4), value(5)];
}

/** O OVR numa idade, lido dos atributos (invariante 1). */
export function ovrAt(player: Player, age: number): number {
  return ovrOf(player.position, attributesAt(player, age));
}
