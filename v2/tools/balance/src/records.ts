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
} from "@craque/engine";
import { type CountryCode, getCompetition } from "@craque/world";

/**
 * Os recordes reais estão ao alcance? (D33 e D42.) Joga carreiras de verdade,
 * pelas decisões, com Fenômenos e uma política ambiciosa, e mede o melhor que
 * o motor produz em cada marca do GDD 26. Recorde não é para ser fácil: a meta
 * é que cada um seja batido em alguma carreira de um lote grande de jogadores
 * extraordinários, nunca que seja comum.
 */

export interface RecordTarget {
  readonly id: string;
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
/** Os países com recorde de liga na lista do GDD 26. */
const LISTED_LEAGUES = new Set(["ENG", "ESP", "ITA", "GER"]);

/** Mais títulos numa liga só, entre os países sem recorde na lista. */
function otherLeagueBest(history: readonly SeasonRecord[]): number {
  const counts = new Map<string, number>();
  for (const record of history) {
    for (const id of record.titles) {
      const country = countryOf(id);
      if (kindOf(id) !== "league" || !country || LISTED_LEAGUES.has(country)) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return Math.max(0, ...counts.values());
}

const ATTACK: readonly Position[] = ["st", "lw", "rw", "cam"];
const ANY: readonly Position[] = ["st", "cam", "cm", "cb", "gk"];

export const RECORD_TARGETS: readonly RecordTarget[] = [
  { id: "seasonGoals", label: "Gols numa temporada pelo clube (Messi, 73)", value: 73, measure: "best", season: (r) => r.production.goals, positions: ATTACK },
  { id: "careerGoals", label: "Gols na carreira (Cristiano Ronaldo, 979)", value: 979, measure: "sum", season: (r) => r.production.goals + r.national.goals, positions: ATTACK },
  { id: "internationalGoals", label: "Gols pela seleção (Cristiano Ronaldo, 146)", value: 146, measure: "sum", season: (r) => r.national.goals, positions: ATTACK },
  { id: "seasonAssists", label: "Assistências numa temporada (referência: 35)", value: 35, measure: "best", season: (r) => r.production.assists, positions: ATTACK },
  { id: "caps", label: "Jogos pela seleção (Cristiano Ronaldo, 234)", value: 234, measure: "sum", season: (r) => r.national.games, positions: ANY },
  { id: "careerGames", label: "Jogos na carreira (Peter Shilton, 1390)", value: 1390, measure: "sum", season: (r) => r.games + r.national.games, positions: ANY },
  { id: "keeperCleanSheets", label: "Jogos sem sofrer gol numa temporada, goleiro (referência: 34)", value: 34, measure: "best", season: (r) => r.production.cleanSheets, positions: ["gk"] },
  { id: "ballonDor", label: "Bolas de Ouro (Messi, 8)", value: 8, measure: "sum", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0), positions: ATTACK },
  { id: "ballonStreak", label: "Bolas de Ouro seguidas (Messi, 4)", value: 4, measure: "streak", season: (r) => (r.awards.won.includes("ballonDor") ? 1 : 0), positions: ATTACK },
  { id: "goldenShoes", label: "Chuteiras de Ouro (Messi, 6)", value: 6, measure: "sum", season: (r) => (r.awards.won.includes("goldenShoe") ? 1 : 0), positions: ATTACK },
  { id: "careerTitles", label: "Títulos na carreira (46)", value: 46, measure: "sum", season: (r) => r.titles.length, positions: ANY },
  { id: "worldCups", label: "Copas do Mundo (Pelé, 3)", value: 3, measure: "sum", season: (r) => titlesWhere(r, (id) => kindOf(id) === "worldCup"), positions: ANY },
  { id: "championsLeague", label: "Champions League (Gento, 6)", value: 6, measure: "sum", season: (r) => titlesWhere(r, (id) => id === "cont1:UEFA"), positions: ANY },
  { id: "libertadores", label: "Libertadores (Francisco Sá, 6)", value: 6, measure: "sum", season: (r) => titlesWhere(r, (id) => id === "cont1:CONMEBOL"), positions: ANY },
  { id: "leagueEngland", label: "Premier League (Giggs, 13)", value: 13, measure: "sum", season: leagueIn("ENG"), positions: ANY },
  { id: "leagueSpain", label: "LaLiga (Gento, 12)", value: 12, measure: "sum", season: leagueIn("ESP"), positions: ANY },
  { id: "leagueItaly", label: "Serie A (Buffon, 10)", value: 10, measure: "sum", season: leagueIn("ITA"), positions: ANY },
  { id: "leagueGermany", label: "Bundesliga (Müller, 13)", value: 13, measure: "sum", season: leagueIn("GER"), positions: ANY },
  {
    id: "leagueStreak",
    label: "Ligas grandes seguidas (11)",
    value: 11,
    measure: "streak",
    season: (r) => (r.titles.some((id) => kindOf(id) === "league" && BIG_FIVE.has(countryOf(id) ?? "")) ? 1 : 0),
    positions: ANY,
  },
  { id: "primaryStreak", label: "Continentais seguidos (Real Madrid, 5)", value: 5, measure: "streak", season: (r) => (r.titles.some((id) => kindOf(id) === "continental1") ? 1 : 0), positions: ANY },
  {
    id: "otherLeague",
    label: "Liga de outro país, uma só (referência: 12)",
    value: 12,
    measure: "career",
    season: () => 0,
    career: otherLeagueBest,
    positions: ANY,
  },
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
export function runRecordCareers(seed: string, perPosition: number): Map<Position, Career[]> {
  const positions = [...new Set(RECORD_TARGETS.flatMap((target) => target.positions))];
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
        if (createPlayer({ seed: careerSeed, position, difficulty: "normal" }).talent !== "phenom") continue;
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
    };
  });
}
