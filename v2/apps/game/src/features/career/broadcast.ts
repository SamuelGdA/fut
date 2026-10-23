import { mix } from "@craque/art";
import type { KeyMatch } from "@craque/engine";
import { type CountryCode, getCompetition } from "@craque/world";
import type { CSSProperties } from "react";
import { MOTIF_MASKS } from "./broadcastMotifs";
import { CLUB_TOURNAMENTS, CUP_DNA, GENERIC, LEAGUE_DNA, NATION_TOURNAMENTS, type BroadcastEmblem, type BroadcastMotif, type BroadcastPackage } from "./broadcastPackages";
import { contrastRatio, relativeLuminance } from "./clubColors";
import { nationColors, teamColors, type TeamColors } from "./teamColors";

/**
 * A identidade de transmissão de uma decisão de partida (D83): o pacote da
 * competição fundido com o time de quem joga. Clube em liga ou copa leva o
 * DNA do país e o cachecol do clube; seleção leva o palco do torneio tingido
 * pela camisa e a bandeira na faixa.
 */
export interface BroadcastIdentity {
  /** "ucl", "libertadores", "worldcup", "league:BRA", "cup:ESP"... */
  readonly id: string;
  readonly motif: BroadcastMotif;
  readonly emblem: BroadcastEmblem;
  readonly palette: BroadcastPalette;
  readonly team: TeamColors;
  readonly opponent: TeamColors;
}

export interface BroadcastPalette extends Omit<BroadcastPackage, "motif" | "emblem"> {
  /** A placa do cabeçalho. */
  readonly plate: string;
  /** A superfície das opções: escura o bastante para qualquer texto. */
  readonly panel: string;
  /** O quadro do ícone e a opção sob o cursor. */
  readonly panel2: string;
  /** A borda das opções. */
  readonly line: string;
  /** O nome da competição, no metal do troféu clareado. */
  readonly title: string;
  /** O texto secundário, levemente tingido pela luz da competição. */
  readonly muted: string;
}

/** Texto principal do palco, igual em todas as competições. */
export const STAGE_INK = "#f5f7fb";

/** Teto de luminância de cada superfície: acima disso, o texto perde a régua. */
const CEILING = { deep: 0.02, mid: 0.045, plate: 0.035, panel: 0.04, panel2: 0.07 } as const;

/** Escurece em passos até a luminância caber no teto. */
function under(color: string, ceiling: number): string {
  let current = color;
  for (let step = 0; step < 24 && relativeLuminance(current) > ceiling; step += 1) current = mix(current, "#000000", 0.12);
  return current;
}

/** Clareia em passos até o contraste com o fundo chegar ao mínimo. */
function over(color: string, background: string, minimum: number): string {
  let current = color;
  for (let step = 0; step < 24 && contrastRatio(current, background) < minimum; step += 1) current = mix(current, "#ffffff", 0.12);
  return current;
}

function finish(pkg: BroadcastPackage): BroadcastPalette {
  const deep = under(pkg.deep, CEILING.deep);
  const mid = under(pkg.mid, CEILING.mid);
  const plate = under(mix(deep, mid, 0.6), CEILING.plate);
  const panel = under(mix(deep, mid, 0.5), CEILING.panel);
  const panel2 = under(mix(panel, pkg.light, 0.1), CEILING.panel2);
  return {
    ...pkg,
    deep,
    mid,
    plate,
    panel,
    panel2,
    line: mix(panel, pkg.metal, 0.22),
    // 4,8:1 sobre o quadro mais claro vale para todas as superfícies mais escuras.
    accent: over(pkg.accent, panel2, 4.8),
    title: over(mix(pkg.metal, "#ffffff", 0.55), plate, 9),
    muted: over(mix("#c7cfda", pkg.light, 0.12), panel2, 5.2),
  };
}

/**
 * A seleção entra nas luzes do torneio: o segundo refletor e o brilho lateral
 * vestem a camisa de quem joga. O fundo continua do torneio, só com um toque
 * da cor mais escura da camisa (amarelo misturado no escuro vira lama; o
 * verde da mesma bandeira vira noite).
 */
function fuse(pkg: BroadcastPackage, fusion: number, team: TeamColors): BroadcastPackage {
  const tints = [team.neutral ? null : team.glow, team.neutral2 ? null : team.glow2].filter((color): color is string => color !== null);
  const tint = tints.sort((a, b) => relativeLuminance(a) - relativeLuminance(b))[0];
  return { ...pkg, mid: tint ? mix(pkg.mid, tint, fusion) : pkg.mid, light2: team.glow2 };
}

/** Um país sem DNA próprio usa o estádio neutro com a bandeira no filete. */
function countryDna(country: CountryCode): BroadcastPackage {
  return LEAGUE_DNA[country] ?? { ...GENERIC, rule: nationColors(country).band };
}

function resolve(competition: string, team: TeamColors): { id: string; pkg: BroadcastPackage } {
  const club = CLUB_TOURNAMENTS[competition];
  if (club) return { id: club.id, pkg: club };
  const nations = NATION_TOURNAMENTS[competition];
  if (nations) return { id: nations.id, pkg: fuse(nations, nations.fusion, team) };
  const meta = getCompetition(competition);
  const country = meta?.country;
  if (!meta || !country) return { id: GENERIC.id, pkg: GENERIC };
  const dna = countryDna(country);
  switch (meta.kind) {
    case "league":
    case "second":
      return { id: `league:${country}`, pkg: dna };
    case "cup":
      return { id: `cup:${country}`, pkg: { ...dna, motif: "bracket", emblem: "cup", ...CUP_DNA[country] } };
    case "leagueCup":
      return { id: `leaguecup:${country}`, pkg: { ...dna, motif: "bracket", emblem: "cup" } };
    case "superCup":
      return { id: `super:${country}`, pkg: { ...dna, emblem: "cup" } };
    default:
      return { id: GENERIC.id, pkg: GENERIC };
  }
}

const cache = new Map<string, BroadcastIdentity>();

export function broadcastIdentity(match: Pick<KeyMatch, "competition" | "team" | "opponent" | "national">): BroadcastIdentity {
  const key = `${match.competition}|${match.team}|${match.opponent}|${match.national ? 1 : 0}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const team = teamColors(match.team, match.national);
  const { id, pkg } = resolve(match.competition, team);
  const identity: BroadcastIdentity = { id, motif: pkg.motif, emblem: pkg.emblem, palette: finish(pkg), team, opponent: teamColors(match.opponent, match.national) };
  // Uma carreira vê poucas dezenas de partidas; o limite só protege o laboratório.
  if (cache.size >= 512) cache.clear();
  cache.set(key, identity);
  return identity;
}

/** As variáveis CSS do palco, do cabeçalho, do padrão e do brilho do time. */
export function broadcastStyle(identity: BroadcastIdentity): CSSProperties {
  const { palette: p, team } = identity;
  const motif = MOTIF_MASKS[identity.motif];
  return {
    "--bc-mask": motif.mask,
    "--bc-motif": p[motif.tint],
    "--bc-motif-a": `${motif.edge}%`,
    "--bc-motif-core": `${motif.core}%`,
    "--bc-deep": p.deep,
    "--bc-mid": p.mid,
    "--bc-light": p.light,
    "--bc-light-2": p.light2,
    "--bc-floor": p.floor,
    "--bc-accent": p.accent,
    "--bc-metal": p.metal,
    "--bc-title": p.title,
    "--bc-muted": p.muted,
    "--bc-plate": p.plate,
    "--bc-panel": p.panel,
    "--bc-panel-2": p.panel2,
    "--bc-line": p.line,
    "--bc-rule-1": p.rule[0],
    "--bc-rule-2": p.rule[1],
    "--bc-rule-3": p.rule[2],
    "--bc-led": p.led,
    "--team-glow": team.glow,
    "--team-glow-2": team.glow2,
    // Preto, branco e cinza brilham como prata, mais baixo que uma cor viva.
    "--team-glow-a": team.neutral ? "16%" : "30%",
    "--team-glow-2-a": team.neutral2 ? "12%" : "20%",
    "--match-accent": p.accent,
    "--match-glow": team.glow,
    "--match-bg-gradient": `radial-gradient(ellipse at 14% 104%, color-mix(in srgb, ${team.glow} 22%, transparent), transparent 60%), radial-gradient(ellipse at 55% 0%, color-mix(in srgb, ${p.light} 18%, ${p.mid}), ${p.deep} 72%)`,
  } as CSSProperties;
}

/** As cores de uma faixa (cachecol do clube, bandeira da seleção) para `[data-kit]`. */
export function kitStyle(colors: TeamColors): CSSProperties {
  return { "--k1": colors.band[0], "--k2": colors.band[1], "--k3": colors.band[2], "--kmark": colors.mark ?? "transparent" } as CSSProperties;
}
