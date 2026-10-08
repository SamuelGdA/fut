/**
 * Elencos iniciais do Técnico (D52), montados por `pnpm elencos:montar` a
 * partir do EA FC 27, do eFootball (carta base + 4), do conhecimento escrito à
 * mão e de jogadores gerados onde faltou dado.
 *
 * Fica num subcaminho próprio (`@craque/world/squads`) e fora do `index.ts`:
 * são mais de 12 mil jogadores, e o Craque não precisa de nenhum. A tela do
 * Técnico importa este módulo sob demanda.
 */

import arg from "../data/squads/arg";
import bol from "../data/squads/bol";
import bra from "../data/squads/bra";
import chi from "../data/squads/chi";
import col from "../data/squads/col";
import ecu from "../data/squads/ecu";
import eng from "../data/squads/eng";
import esp from "../data/squads/esp";
import fra from "../data/squads/fra";
import ger from "../data/squads/ger";
import ita from "../data/squads/ita";
import livres from "../data/squads/livres";
import mex from "../data/squads/mex";
import par from "../data/squads/par";
import per from "../data/squads/per";
import uru from "../data/squads/uru";
import usa from "../data/squads/usa";
import ven from "../data/squads/ven";
import type { CountryCode } from "./types";
import { getClub, getCountry } from "./world";

/** De onde veio o jogador: FC 27, eFootball, conhecimento ou gerado. */
export const SQUAD_ORIGINS = ["f", "e", "k", "g"] as const;
export type SquadOrigin = (typeof SQUAD_ORIGINS)[number];

/** As 12 posições, na mesma grafia do motor (`player/positions.ts`). */
export const SQUAD_POSITIONS = ["gk", "cb", "lb", "rb", "cdm", "cm", "cam", "lm", "rm", "lw", "rw", "st"] as const;
export type SquadPosition = (typeof SQUAD_POSITIONS)[number];

/** Características iniciais possíveis (as que a montagem sabe derivar das fontes). */
export const SQUAD_TRAITS = ["fast", "setPiece", "clutch", "aerial", "tireless", "versatile", "leader"] as const;
export type SquadTrait = (typeof SQUAD_TRAITS)[number];

export interface SquadPlayer {
  /** `fc:<id>`, `ef:<id>`, `k:<clube>:<nome>` ou `g:<clube>:<n>`: estável entre carreiras. */
  readonly id: string;
  /** Clube no início; vazio para quem começa sem clube. */
  readonly club: string;
  /** Nome real; vazio para gerados (o jogo dá o nome pelo id e pela nacionalidade). */
  readonly name: string;
  readonly position: SquadPosition;
  readonly alternates: readonly SquadPosition[];
  /** OVR da fonte (eFootball já com +4; conhecimento e gerados estimados). */
  readonly ovr: number;
  readonly birthYear: number;
  readonly nationality: CountryCode;
  readonly origin: SquadOrigin;
  readonly traits: readonly SquadTrait[];
}

type Row = [string, string, string, string, string, number, number, string, string, string];

function fail(message: string): never {
  throw new Error(`@craque/world/squads: ${message}`);
}

function isPosition(value: string): value is SquadPosition {
  return (SQUAD_POSITIONS as readonly string[]).includes(value);
}

function isOrigin(value: string): value is SquadOrigin {
  return (SQUAD_ORIGINS as readonly string[]).includes(value);
}

function isTrait(value: string): value is SquadTrait {
  return (SQUAD_TRAITS as readonly string[]).includes(value);
}

function parse(text: string): SquadPlayer[] {
  const rows = JSON.parse(text) as Row[];
  return rows.map(([id, club, name, position, alternates, ovr, birthYear, nationality, origin, traits]) => {
    if (!isPosition(position)) fail(`posição inválida em ${id}`);
    if (!isOrigin(origin)) fail(`origem inválida em ${id}`);
    if (club && !getClub(club)) fail(`clube desconhecido em ${id}: ${club}`);
    if (!getCountry(nationality)) fail(`nacionalidade desconhecida em ${id}`);
    if (!Number.isInteger(ovr) || ovr < 40 || ovr > 95) fail(`OVR inválido em ${id}`);
    const alt = alternates ? alternates.split(",") : [];
    const traitList = traits ? traits.split(",") : [];
    return {
      id,
      club,
      name,
      position,
      alternates: alt.map((value) => (isPosition(value) ? value : fail(`alternativa inválida em ${id}`))),
      ovr,
      birthYear,
      nationality,
      origin,
      traits: traitList.map((value) => (isTrait(value) ? value : fail(`característica inválida em ${id}`))),
    };
  });
}

/** Todos os jogadores com clube no início, país por país. */
export const SQUAD_PLAYERS: readonly SquadPlayer[] = [arg, bol, bra, chi, col, ecu, eng, esp, fra, ger, ita, mex, par, per, uru, usa, ven].flatMap(
  parse,
);

/** Quem começa sem clube (cortados pelo teto de veteranos na montagem). */
export const FREE_PLAYERS: readonly SquadPlayer[] = parse(livres);
