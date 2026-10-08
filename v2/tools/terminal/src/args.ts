import { isLocale, type Locale } from "@craque/content";
import { CAREER_POLICIES, type CareerPolicy, type CareerSetup, DEFAULT_START_YEAR, type Difficulty, type Pace, type Position, POSITIONS } from "@craque/engine";
import { getCountry } from "@craque/world";

/**
 * Os argumentos do terminal, em português como os do harness:
 *
 *   pnpm carreira [--semente texto] [--posicao st] [--pais BRA] [--ritmo normal|rapida]
 *                 [--dificuldade normal|dificil] [--idioma pt|es|en] [--sobrenome SILVA]
 *                 [--numero 9] [--ano 2026] [--auto [balanced|ambitious|loyal|random]]
 *                 [--resumo] [--salvar arquivo.json] [--carregar arquivo.json] [--ajuda]
 */

export interface TerminalArgs {
  readonly setup: CareerSetup;
  readonly locale: Locale;
  /** Política automática, ou `null` para jogar no teclado. */
  readonly auto: CareerPolicy | null;
  /** Só o resumo final (com `--auto`). */
  readonly summaryOnly: boolean;
  readonly savePath: string | null;
  readonly loadPath: string | null;
  readonly help: boolean;
}

export class ArgsError extends Error {}

/**
 * Os nomes da tela (D43): "normal" é uma temporada por decisão (o `intense`
 * do motor, o padrão), "rapida" são duas (o `normal` do motor). "intensa" é o
 * nome antigo do padrão e continua valendo.
 */
const PACE_NAMES: Readonly<Record<string, Pace>> = {
  normal: "intense",
  intensa: "intense",
  rapida: "normal",
  "rápida": "normal",
};
const DIFFICULTY_NAMES: Readonly<Record<string, Difficulty>> = {
  normal: "normal",
  dificil: "hard",
  "difícil": "hard",
  hard: "hard",
};

const FLAGS_WITH_VALUE = new Set([
  "--semente",
  "--posicao",
  "--pais",
  "--ritmo",
  "--dificuldade",
  "--idioma",
  "--sobrenome",
  "--numero",
  "--ano",
  "--salvar",
  "--carregar",
]);
const FLAGS_ALONE = new Set(["--auto", "--resumo", "--ajuda", "-h", "--help"]);

/** `defaultSeed` vem de fora: a semente aleatória usa o relógio, e isto é puro. */
export function parseArgs(argv: readonly string[], defaultSeed: string): TerminalArgs {
  const values = new Map<string, string>();
  const flags = new Set<string>();
  let auto: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index] ?? "";
    if (arg === "--") continue;
    if (FLAGS_WITH_VALUE.has(arg)) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) throw new ArgsError(`${arg} precisa de um valor`);
      values.set(arg, value);
      index += 1;
    } else if (arg === "--auto") {
      const next = argv[index + 1];
      if (next !== undefined && !next.startsWith("--")) {
        auto = next;
        index += 1;
      } else {
        auto = "balanced";
      }
    } else if (FLAGS_ALONE.has(arg)) {
      flags.add(arg);
    } else {
      throw new ArgsError(`argumento desconhecido: ${arg}`);
    }
  }

  const position = (values.get("--posicao") ?? "st").toLowerCase();
  if (!(POSITIONS as readonly string[]).includes(position)) {
    throw new ArgsError(`posição inválida: ${position}. Use uma de: ${POSITIONS.join(", ")}`);
  }
  const nationality = (values.get("--pais") ?? "BRA").toUpperCase();
  if (!getCountry(nationality)) throw new ArgsError(`país desconhecido: ${nationality}. Use o código de três letras (BRA, ARG, ENG).`);
  const pace = PACE_NAMES[(values.get("--ritmo") ?? "normal").toLowerCase()];
  if (!pace) throw new ArgsError("ritmo inválido: use normal ou rapida");
  const difficulty = DIFFICULTY_NAMES[(values.get("--dificuldade") ?? "normal").toLowerCase()];
  if (!difficulty) throw new ArgsError("dificuldade inválida: use normal ou dificil");
  const locale = values.get("--idioma") ?? "pt";
  if (!isLocale(locale)) throw new ArgsError("idioma inválido: use pt, es ou en");
  if (auto !== null && !(CAREER_POLICIES as readonly string[]).includes(auto)) {
    throw new ArgsError(`política inválida: ${auto}. Use uma de: ${CAREER_POLICIES.join(", ")}`);
  }
  const numberText = values.get("--numero");
  const dreamNumber = numberText === undefined ? null : Number(numberText);
  if (dreamNumber !== null && (!Number.isInteger(dreamNumber) || dreamNumber < 1 || dreamNumber > 99)) {
    throw new ArgsError("número dos sonhos: um inteiro de 1 a 99");
  }
  const startYear = Number(values.get("--ano") ?? DEFAULT_START_YEAR);
  if (!Number.isInteger(startYear) || startYear < 1990 || startYear > 2100) throw new ArgsError("ano inválido");
  const surname = (values.get("--sobrenome") ?? "SILVA").trim().toUpperCase().slice(0, 16);
  if (surname.length === 0) throw new ArgsError("sobrenome vazio");

  return {
    setup: {
      seed: values.get("--semente") ?? defaultSeed,
      startYear,
      pace,
      difficulty,
      identity: { surname, foot: "right", nationality, position: position as Position, dreamNumber },
    },
    locale,
    auto: auto as CareerPolicy | null,
    summaryOnly: flags.has("--resumo"),
    savePath: values.get("--salvar") ?? null,
    loadPath: values.get("--carregar") ?? null,
    help: flags.has("--ajuda") || flags.has("-h") || flags.has("--help"),
  };
}

export const HELP = `CRAQUE v2: uma carreira inteira no terminal

  pnpm carreira [opções]

Opções
  --semente texto        Semente da carreira (a mesma semente e as mesmas escolhas dão a mesma carreira)
  --posicao st           gk, cb, lb, rb, cdm, cm, cam, lm, rm, lw, rw, st
  --pais BRA             Código de três letras do país (BRA, ARG, ENG, ESP, JPN...)
  --ritmo normal         normal (uma temporada por decisão) ou rapida (duas)
  --dificuldade normal   normal ou dificil
  --idioma pt            pt, es ou en
  --sobrenome SILVA      Nome na camisa
  --numero 9             Número dos sonhos (1 a 99)
  --ano 2026             Ano da primeira temporada
  --auto [política]      Joga sozinho: balanced, ambitious, loyal ou random (padrão balanced)
  --resumo               Com --auto, mostra só o resumo final
  --salvar arquivo.json  Grava o save (setup e escolhas) a cada decisão
  --carregar arquivo.json  Continua uma carreira salva (refeita por replay)
  --ajuda                Esta ajuda

Durante o jogo
  1, 2, 3...  escolhe a opção
  h           histórico de temporadas
  s           salva agora (precisa de --salvar)
  q           sai (com --salvar, a carreira fica guardada)
`;
