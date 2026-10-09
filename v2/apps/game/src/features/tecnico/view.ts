import { coachPlayerName, coachShortName } from "@craque/content/coach";
import {
  ageOf,
  type CoachCareer,
  type CoachPlayer,
  type CoachTrait,
  formLabelOf,
  type FormLabel,
  type Mood,
  moodOf,
  potentialHint,
  type PotentialHint,
  registered,
  type Role,
  squadOf,
  valueOf,
} from "@craque/engine/coach";
import type { Position } from "@craque/engine";
import type { CountryCode } from "@craque/world";

/**
 * A tela do Técnico só enxerga isto (GDD 42.8): o OVR mostrado, o estado de
 * satisfação em palavra, a fase em palavra e o potencial como faixa. Nível
 * oculto, potencial, satisfação em número e rendimento efetivo nunca saem
 * daqui; um teste serializa as vistas e reprova se aparecerem.
 */

export interface PlayerRow {
  readonly id: string;
  readonly name: string;
  readonly short: string;
  readonly nationality: CountryCode;
  readonly position: Position;
  readonly alternates: readonly Position[];
  readonly age: number;
  readonly ovr: number;
  readonly form: FormLabel;
  readonly mood: Mood;
  readonly role: Role;
  readonly value: number;
  readonly wage: number;
  readonly traits: readonly CoachTrait[];
  /** Dias até voltar, ou `null` sem lesão. */
  readonly injuryDays: number | null;
  readonly potentialHint: PotentialHint;
  readonly listed: boolean;
  readonly promised: boolean;
  readonly developed: boolean;
  /** Gerado pelo jogo para completar um elenco sem dado real. */
  readonly fictional: boolean;
  readonly youthProduct: boolean;
  readonly registered: boolean;
  readonly club: string;
  readonly joinedYear: number;
  readonly season: { readonly apps: number; readonly starts: number; readonly goals: number; readonly assists: number; readonly rating: number | null };
}

const POSITION_ORDER: readonly Position[] = ["gk", "rb", "cb", "lb", "cdm", "cm", "lm", "rm", "cam", "lw", "rw", "st"];

export function positionRank(position: Position): number {
  return POSITION_ORDER.indexOf(position);
}

export function playerRow(career: CoachCareer, player: CoachPlayer, registeredIds?: ReadonlySet<string>): PlayerRow {
  const coachClub = career.coach?.club ?? "";
  const stage = `${career.year}:${career.half}`;
  const promised = career.promises.some((promise) => promise.status === "active" && promise.player === player.id);
  const injuryDays = player.injury ? Math.max(1, player.injury.until - career.day) : null;
  const season = player.season;
  return {
    id: player.id,
    name: coachPlayerName(career.setup.seed, player),
    short: coachShortName(career.setup.seed, player),
    nationality: player.nationality,
    position: player.position,
    alternates: player.alternates,
    age: ageOf(player, career.year),
    ovr: player.ovr,
    form: formLabelOf(player.form),
    mood: moodOf(player.satisfaction),
    role: player.role,
    value: valueOf(player, career.year),
    wage: player.wage,
    traits: player.traits,
    injuryDays,
    potentialHint: potentialHint(player, career.year),
    listed: player.listed,
    promised,
    developed: player.developedAt === stage,
    fictional: player.origin === "g",
    youthProduct: player.youthClub !== null && player.youthClub === coachClub,
    registered: registeredIds ? registeredIds.has(player.id) : true,
    club: player.club,
    joinedYear: player.joinedYear,
    season: {
      apps: season.apps,
      starts: season.starts,
      goals: season.goals,
      assists: season.assists,
      rating: season.rated > 0 ? Math.round((season.ratingSum / season.rated) * 10) / 10 : null,
    },
  };
}

/** O elenco do treinador, ordenado por posição e OVR. */
export function squadRows(career: CoachCareer): PlayerRow[] {
  const coach = career.coach;
  if (!coach) return [];
  const club = career.clubs[coach.club];
  const squad = squadOf(career, coach.club);
  const ids = club ? registered(squad, club.country, career.year) : new Set<string>();
  return squad
    .map((player) => playerRow(career, player, ids))
    .sort((a, b) => positionRank(a.position) - positionRank(b.position) || b.ovr - a.ovr || a.name.localeCompare(b.name));
}

/** Palavra de uma barra de 0 a 100 (diretoria, torcida, elenco). */
export type BarWord = "high" | "mid" | "low" | "critical";

export function barWord(value: number): BarWord {
  if (value >= 65) return "high";
  if (value >= 45) return "mid";
  if (value >= 30) return "low";
  return "critical";
}

/** Barra do elenco: média das satisfações, só em número inteiro (a média, nunca a de um jogador). */
export function squadBar(career: CoachCareer): number {
  const coach = career.coach;
  if (!coach) return 50;
  const squad = squadOf(career, coach.club);
  if (squad.length === 0) return 50;
  return Math.round(squad.reduce((total, player) => total + player.satisfaction, 0) / squad.length);
}

/** Tom de uma palavra de barra, para a cor e o glifo. */
export function barTone(word: BarWord): "good" | "neutral" | "bad" {
  if (word === "high") return "good";
  if (word === "mid") return "neutral";
  return "bad";
}
