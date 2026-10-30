import {
  type Career,
  type CareerPolicy,
  choose,
  createCareer,
  createPlayer,
  createRng,
  MAX_DECISIONS,
  policyChoice,
  type Position,
  type SeasonRecord,
  type TalentBand,
} from "@craque/engine";
import { type CountryCode, getCompetition } from "@craque/world";

/**
 * Os recordes reais estão ao alcance? (D33 e D42.) Joga carreiras de verdade,
 * pelas decisões, com Fenômenos e uma política ambiciosa, e mede o melhor que
 * o motor produz em cada marca do GDD 26. Recorde não é para ser fácil: a meta
 * é que cada um seja batido em alguma carreira de um lote grande de jogadores
 * extraordinários, nunca que seja comum.
 */

/**
 * Faixas de raridade (D94): a chance de uma carreira de Fenômeno (simulada pelas
 * políticas automáticas) igualar ou passar a marca. Clássico ensina que o sistema
 * existe; lendário quase ninguém vê. Superar tem de ser possível em todas.
 */
export const RECORD_BANDS = {
  entry: [0.06, 0.15],
  rare: [0.02, 0.05],
  epic: [0.005, 0.015],
  legendary: [0.0008, 0.004],
} as const;
export type RecordTier = keyof typeof RECORD_BANDS;

export interface RecordTarget {
  readonly id: string;
  /** A faixa de raridade que a marca tem de cair (D94). */
  readonly tier: RecordTier;
  readonly label: string;
  /** A marca real. */
  readonly value: number;
  readonly measure: "sum" | "best" | "streak" | "career";
  readonly season: (record: SeasonRecord) => number;
  /** Com `measure: "career"`: o número lido da carreira inteira. */
  readonly career?: (history: readonly SeasonRecord[]) => number;
  /** Posições que disputam a marca (gols para atacantes, jogos sem sofrer gol para goleiros). */
  readonly positions: readonly Position[];
}

const kindOf = (id: string) => getCompetition(id)?.kind ?? null;
const countryOf = (id: string) => getCompetition(id)?.country ?? null;
const titlesWhere = (record: SeasonRecord, test: (id: string) => boolean) => record.titles.filter(test).length;
const leagueIn = (country: string) => (record: SeasonRecord) =>
  titlesWhere(record, (id) => kindOf(id) === "league" && countryOf(id) === country);
const BIG_FIVE = new Set(["ENG", "ESP", "ITA", "GER", "FRA"]);


const ATTACK: readonly Position[] = ["st", "lw", "rw", "cam"];
const ANY: readonly Position[] = ["st", "cam", "cm", "cb", "gk"];

export const RECORD_TARGETS: readonly RecordTarget[] = [
  { id: "seasonGoals", tier: "rare", label: "Gols numa temporada pelo clube (Messi, 73)", value: 73, measure: "best", season: (r) => r.production.goals, positions: ATTACK },
  { id: "careerGoals", tier: "epic", label: "Gols na carreira (Cristiano Ronaldo, 979)", value: 979, measure: "sum", season: (r) => r.production.goals + r.national.goals, positions: ATTACK },
  { id: "internationalGoals", tier: "legendary", label: "Gols pela seleção (Cristiano Ronaldo, 146)", value: 146, measure: "sum", season: (r) => r.national.goals, positions: ATTACK },
  { id: "seasonAssists", tier: "rare", label: "Assistências numa temporada (Messi, 32)", value: 32, measure: "best", season: (r) => r.production.assists, positions: ATTACK },
  { id: "caps", tier: "entry", label: "Jogos pela seleção (Cristiano Ronaldo, 234)", value: 234, measure: "sum", season: (r) => r.national.games, positions: ANY },
  { id: "careerGames", tier: "rare", label: "Jogos na carreira (Peter Shilton, 1390)", value: 1390, measure: "sum", season: (r) => r.games + r.national.games, positions: ANY },
  { id: "keeperCleanSheets", tier: "entry", label: "Jogos sem sofrer gol numa temporada de liga (ter Stegen e Liaño, 26)", value: 26, measure: "best", season: (r) => r.production.lines.filter((line) => line.kind === "league").reduce((sum, line) => sum + line.cleanSheets, 0), positions: ["gk"] },
  { id: "ballonDor", tier: "legendary", label: "Bolas de Ouro (Messi, 8)", value: 8, measure: "sum", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0), positions: ATTACK },
  { id: "ballonStreak", tier: "legendary", label: "Bolas de Ouro seguidas (Messi, 4)", value: 4, measure: "streak", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0), positions: ATTACK },
  { id: "goldenShoes", tier: "legendary", label: "Chuteiras de Ouro (Messi, 6)", value: 6, measure: "sum", season: (r) => (r.awards.won.includes("goldenShoe") ? 1 : 0), positions: ATTACK },
  { id: "careerTitles", tier: "entry", label: "Títulos na carreira (46)", value: 46, measure: "sum", season: (r) => r.titles.length, positions: ANY },
  { id: "worldCups", tier: "epic", label: "Copas do Mundo (Pelé, 3)", value: 3, measure: "sum", season: (r) => titlesWhere(r, (id) => kindOf(id) === "worldCup"), positions: ANY },
  { id: "championsLeague", tier: "rare", label: "Champions League (Gento, 6)", value: 6, measure: "sum", season: (r) => titlesWhere(r, (id) => id === "cont1:UEFA"), positions: ANY },
  { id: "libertadores", tier: "legendary", label: "Libertadores (Francisco Sá, 6)", value: 6, measure: "sum", season: (r) => titlesWhere(r, (id) => id === "cont1:CONMEBOL"), positions: ANY },
  { id: "leagueEngland", tier: "legendary", label: "Premier League (Giggs, 13)", value: 13, measure: "sum", season: leagueIn("ENG"), positions: ANY },
  { id: "leagueSpain", tier: "epic", label: "LaLiga (Gento, 12)", value: 12, measure: "sum", season: leagueIn("ESP"), positions: ANY },
  { id: "leagueItaly", tier: "epic", label: "Serie A (Buffon, 10)", value: 10, measure: "sum", season: leagueIn("ITA"), positions: ANY },
  { id: "leagueGermany", tier: "epic", label: "Bundesliga (Müller, 13)", value: 13, measure: "sum", season: leagueIn("GER"), positions: ANY },
  {
    id: "leagueStreak", tier: "rare",
    label: "Ligas grandes seguidas (11)",
    value: 11,
    measure: "streak",
    season: (r) => (r.titles.some((id) => kindOf(id) === "league" && BIG_FIVE.has(countryOf(id) ?? "")) ? 1 : 0),
    positions: ANY,
  },
  { id: "primaryStreak", tier: "epic", label: "Continentais seguidos (Real Madrid, 5)", value: 5, measure: "streak", season: (r) => (r.titles.some((id) => kindOf(id) === "continental1") ? 1 : 0), positions: ANY },
  { id: "leagueFrance", tier: "rare", label: "Ligue 1 (Marquinhos, 11)", value: 11, measure: "sum", season: leagueIn("FRA"), positions: ANY },
  { id: "championsGames", tier: "entry", label: "Jogos de Champions League (Cristiano Ronaldo, 183)", value: 183, measure: "sum", season: (r) => r.production.lines.filter((line) => line.competition === "cont1:UEFA").reduce((sum, line) => sum + line.games, 0), positions: ANY },
];

export function careerValue(target: RecordTarget, history: readonly SeasonRecord[]): number {
  if (target.measure === "career") return target.career ? target.career(history) : 0;
  let total = 0;
  let best = 0;
  let streak = 0;
  let longest = 0;
  for (const season of history) {
    const amount = target.season(season);
    total += amount;
    best = Math.max(best, amount);
    streak = amount > 0 ? streak + 1 : 0;
    longest = Math.max(longest, streak);
  }
  return target.measure === "sum" ? total : target.measure === "best" ? best : longest;
}

export interface RecordRow {
  readonly target: RecordTarget;
  readonly careers: number;
  /** O melhor que o lote fez. */
  readonly best: number;
  /** Mediana do lote. */
  readonly median: number;
  /** Carreiras que igualaram ou passaram a marca. */
  readonly reached: number;
  /** Carreiras que passaram a marca por 1, 2 e 3: cada passo a mais tem de ser mais raro (D44). */
  readonly beyond: readonly [number, number, number];
  /** A fração que alcançou está dentro da faixa e alguém passou da marca. */
  readonly inBand: boolean;
}

/** Força a partir da qual o fiel ao gigante para de trocar de clube. */
const GIANT = 84;

/** A força do clube atual: a da última temporada nele, ou a da chegada. */
function currentClubStrength(career: Career): number {
  const contract = career.contract;
  if (!contract) return 0;
  const last = career.history[career.history.length - 1];
  return last && last.club === contract.club ? last.clubStrength : contract.strengthAtArrival;
}

/** A política do momento: o fiel ao gigante é ambicioso até chegar a um gigante, e fiel dali em diante. */
function policyNow(career: Career, policy: RecordPolicy): CareerPolicy {
  if (policy !== "giant") return policy;
  return currentClubStrength(career) >= GIANT ? "loyal" : "ambitious";
}

/**
 * Joga a carreira pela política, mas sem aposentar por vontade própria: quem
 * persegue recorde joga até onde o mercado deixar (ou até os 39).
 */
function playToTheEnd(start: Career, policy: RecordPolicy): Career {
  let career = start;
  for (let count = 0; count < MAX_DECISIONS; count += 1) {
    const decision = career.decision;
    if (career.end || !decision) return career;
    const options = decision.options.filter((option) => option.kind !== "retire");
    const view = options.length > 0 ? { ...career, decision: { ...decision, options } } : career;
    const choice = policyChoice(view, policyNow(career, policy));
    if (!choice) return career;
    career = choose(career, choice).career;
  }
  return career;
}

/** As políticas do motor e mais uma: `giant`, o fiel ao gigante (Giggs, Müller, Gento). */
export type RecordPolicy = CareerPolicy | "giant";

/** Um lote: política e seleções de onde saem os Fenômenos. */
export interface RecordBatch {
  readonly name: string;
  readonly policy: RecordPolicy;
  readonly nations: ReadonlyArray<readonly [CountryCode, number]>;
}

/**
 * Três jeitos de perseguir recorde: o ambicioso, que troca sempre pelo clube
 * mais forte que ainda lhe dá minutos (gols, prêmios, Champions); o fiel, que
 * fica no clube enquanto joga (a Libertadores, o clube de casa); e o fiel ao
 * gigante, que sobe até um clube grande e não sai mais (as ligas de um país só).
 */
export const RECORD_BATCHES: readonly RecordBatch[] = [
  {
    name: "ambicioso",
    policy: "ambitious",
    nations: [
      ["BRA", 25],
      ["ARG", 15],
      ["FRA", 15],
      ["ESP", 15],
      ["ENG", 10],
      ["GER", 10],
      ["POR", 10],
    ],
  },
  {
    name: "fiel",
    policy: "loyal",
    nations: [
      ["ENG", 20],
      ["ESP", 15],
      ["ITA", 20],
      ["GER", 15],
      ["BRA", 15],
      ["ARG", 15],
    ],
  },
  {
    name: "gigante",
    policy: "giant",
    nations: [
      ["ENG", 30],
      ["ITA", 25],
      ["ESP", 15],
      ["GER", 15],
      ["FRA", 15],
    ],
  },
];

/** Fenômenos por posição e por lote, jogados pelas decisões até o fim. */
export function runRecordCareers(seed: string, perPosition: number, only?: readonly Position[], talent: TalentBand = "phenom"): Map<Position, Career[]> {
  // `only` mede só algumas posições (para calibrar uma delas sem jogar todas).
  const positions = only ?? [...new Set(RECORD_TARGETS.flatMap((target) => target.positions))];
  const byPosition = new Map<Position, Career[]>();
  for (const batch of RECORD_BATCHES) {
    const nationRng = createRng(`${seed}:${batch.name}:nacoes`);
    for (const position of positions) {
      const careers = byPosition.get(position) ?? [];
      let attempt = 0;
      let played = 0;
      while (played < perPosition) {
        const careerSeed = `${seed}:${batch.name}:${position}:${attempt}`;
        attempt += 1;
        // `talent` mede outras faixas (D105: Craque e Estrela também precisam ver recorde, mais raro).
        if (createPlayer({ seed: careerSeed, position, difficulty: "normal" }).talent !== talent) continue;
        const nationality = nationRng.weighted(batch.nations);
        const start = createCareer({
          seed: careerSeed,
          startYear: 2026,
          pace: "intense",
          difficulty: "normal",
          identity: { surname: "Teste", foot: "right", nationality, position, dreamNumber: null },
        });
        careers.push(playToTheEnd(start, batch.policy));
        played += 1;
      }
      byPosition.set(position, careers);
    }
  }
  return byPosition;
}

export function recordRows(byPosition: ReadonlyMap<Position, readonly Career[]>): RecordRow[] {
  return RECORD_TARGETS.map((target) => {
    const values = target.positions
      .flatMap((position) => byPosition.get(position) ?? [])
      .map((career) => careerValue(target, career.history))
      .sort((a, b) => a - b);
    return {
      target,
      careers: values.length,
      best: values[values.length - 1] ?? 0,
      median: values[Math.floor(values.length / 2)] ?? 0,
      reached: values.filter((value) => value >= target.value).length,
      beyond: [1, 2, 3].map((extra) => values.filter((value) => value >= target.value + extra).length) as unknown as readonly [number, number, number],
      inBand: (() => {
        const share = values.filter((value) => value >= target.value).length / Math.max(1, values.length);
        const [low, high] = RECORD_BANDS[target.tier];
        return share >= low && share <= high && values.some((value) => value > target.value);
      })(),
    };
  });
}
