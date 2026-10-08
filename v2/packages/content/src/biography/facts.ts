import {
  type Career,
  careerTotals,
  type CareerTotals,
  type EndReason,
  type InjuryType,
  isGoalkeeper,
  type LegacyLevel,
  movementOf,
  peakSeason,
  type Position,
  type SeasonRecord,
  type TalentBand,
} from "@craque/engine";
import { getClub, getCompetition } from "@craque/world";
import { careerRecords, type RecordId } from "../records";

/**
 * Os fatos da biografia (GDD 25): um objeto achatado, tirado do histórico e
 * do diário da carreira, nunca do interior da simulação. Os temas da
 * biografia só leem daqui.
 */

export interface Stint {
  readonly club: string;
  readonly fromAge: number;
  readonly toAge: number;
  readonly fromYear: number;
  readonly toYear: number;
  readonly seasons: number;
  readonly loan: boolean;
  /** Legado no clube ao fim da passagem. */
  readonly legacy: LegacyLevel;
  readonly traitor: boolean;
  /** Força do clube na primeira temporada da passagem. */
  readonly strength: number;
}

export interface AgedClub {
  readonly club: string;
  readonly age: number;
}

export interface AgedTitle {
  readonly competition: string;
  readonly age: number;
}

export interface BioFacts {
  readonly seed: string;
  readonly surname: string;
  readonly position: Position;
  readonly keeper: boolean;
  readonly talent: TalentBand;
  readonly prodigy: boolean;
  readonly firstAge: number;
  readonly lastAge: number;
  readonly end: { readonly reason: EndReason; readonly age: number } | null;
  readonly totals: CareerTotals;
  readonly stints: readonly Stint[];
  readonly countries: number;
  readonly peak: { readonly ovr: number; readonly age: number; readonly club: string } | null;
  /** Primeira e última idade com OVR a até 2 pontos do pico. */
  readonly peakWindow: readonly [number, number] | null;
  readonly lastOvr: number;
  /** Primeira temporada como titular ou craque do time, com 20 jogos ou mais, no clube dono do passe. */
  readonly breakthrough: AgedClub | null;
  /** Titular com 18 anos ou menos, no clube dono do passe (no empréstimo, quem conta é `earlyLoan`). */
  readonly earlyStarter: AgedClub | null;
  /** Temporadas com menos de 10 jogos antes dos 20. */
  readonly quietYouth: number;
  /** A primeira transferência foi um empréstimo, antes dos 20; `starter` diz se ele foi titular lá. */
  readonly earlyLoan: (AgedClub & { readonly starter: boolean }) | null;
  /** A maior subida de patamar (força do clube) numa transferência definitiva. */
  readonly bigMove: (AgedClub & { readonly gap: number }) | null;
  readonly explosion: { readonly age: number; readonly delta: number } | null;
  readonly firstTitle: AgedTitle | null;
  /** Título com 33 anos ou mais (o último deles). */
  readonly veteranTitle: AgedTitle | null;
  readonly perfectSeason: number | null;
  readonly bestGoals: { readonly goals: number; readonly age: number } | null;
  readonly titlesByKind: Readonly<Record<string, number>>;
  readonly firstContinental: AgedTitle | null;
  readonly worldCupAge: number | null;
  readonly ballonDors: number;
  readonly firstBallonAge: number | null;
  readonly podiums: number;
  readonly goldenShoes: number;
  readonly goldenGloves: number;
  readonly firstCapAge: number | null;
  readonly promotion: AgedClub | null;
  readonly relegation: AgedClub | null;
  readonly released: AgedClub | null;
  readonly suspension: number | null;
  /** A lesão mais longa (10 jogos ou mais). O texto cita só a lesão, nunca os jogos. */
  readonly worstInjury: { readonly type: InjuryType; readonly lostGames: number; readonly age: number } | null;
  /** O ano da queda: a primeira temporada depois do pico com o OVR 6 ou mais abaixo dele. */
  readonly decline: { readonly age: number; readonly ovr: number } | null;
  readonly homecoming: AgedClub | null;
  readonly classicShirt: { readonly number: number; readonly age: number } | null;
  readonly roadNotTaken: AgedClub | null;
  /** Artilharias de competição (D42), na ordem em que vieram. */
  readonly topScorer: readonly AgedTitle[];
  /** Prêmios de craque da competição (D42), na ordem em que vieram. */
  readonly bestPlayer: readonly AgedTitle[];
  readonly legends: readonly string[];
  readonly idols: readonly string[];
  readonly traitorClubs: readonly string[];
  readonly recordsBeaten: readonly RecordId[];
  readonly recordsMatched: readonly RecordId[];
}

/** Temporadas seguidas no mesmo clube viram uma passagem (GDD 24.4). */
export function stintsOf(history: readonly SeasonRecord[]): Stint[] {
  const stints: Stint[] = [];
  for (const record of history) {
    const previous = stints[stints.length - 1];
    if (previous && previous.club === record.club) {
      stints[stints.length - 1] = {
        ...previous,
        toAge: record.age,
        toYear: record.year,
        seasons: previous.seasons + 1,
        legacy: record.legacy,
        traitor: previous.traitor || record.traitor,
      };
    } else {
      stints.push({
        club: record.club,
        fromAge: record.age,
        toAge: record.age,
        fromYear: record.year,
        toYear: record.year,
        seasons: 1,
        loan: record.loan,
        legacy: record.legacy,
        traitor: record.traitor,
        strength: record.clubStrength,
      });
    }
  }
  return stints;
}

const CLASSIC_NUMBERS = new Set([1, 7, 9, 10, 11]);

export function bioFacts(career: Career): BioFacts {
  const history = career.history;
  const first = history[0];
  const last = history[history.length - 1];
  const stints = stintsOf(history);
  const peak = peakSeason(history);
  const kind = (id: string) => getCompetition(id)?.kind ?? "";

  const titleList: AgedTitle[] = history.flatMap((record) => record.titles.map((competition) => ({ competition, age: record.age })));
  const titlesByKind: Record<string, number> = {};
  for (const title of titleList) titlesByKind[kind(title.competition)] = (titlesByKind[kind(title.competition)] ?? 0) + 1;

  const peakWindow: [number, number] | null = peak
    ? [
        history.find((record) => record.ovrEnd >= peak.ovrEnd - 2)?.age ?? peak.age,
        [...history].reverse().find((record) => record.ovrEnd >= peak.ovrEnd - 2)?.age ?? peak.age,
      ]
    : null;

  // Titular no clube dono do passe: o empréstimo tem a própria linha, e as duas
  // juntas não podem se contradizer ("titular aos 18" e "precisou sair para jogar").
  const starter = (record: SeasonRecord) => (record.role === "star" || record.role === "starter") && record.games >= 20;
  const breakthroughRecord = history.find((record) => starter(record) && !record.loan);
  const earlyRecord = history.find((record) => record.age <= 18 && starter(record) && !record.loan);

  // Transferências definitivas, comparando a força do clube novo com a do anterior.
  let bigMove: (AgedClub & { gap: number }) | null = null;
  for (const [index, stint] of stints.entries()) {
    const previous = stints[index - 1];
    if (!previous || stint.loan) continue;
    if (stints.slice(0, index).some((earlier) => earlier.club === stint.club)) continue;
    const gap = stint.strength - previous.strength;
    if (gap >= 6 && (!bigMove || gap > bigMove.gap)) bigMove = { club: stint.club, age: stint.fromAge, gap };
  }

  const firstTransfer = career.log.find((entry) => entry.kind === "transfer" && entry.from !== null);
  const loanSeason = firstTransfer && firstTransfer.kind === "transfer" ? history.find((record) => record.loan && record.club === firstTransfer.to) : undefined;
  const earlyLoan =
    firstTransfer && firstTransfer.kind === "transfer" && firstTransfer.loan && firstTransfer.age < 20
      ? { club: firstTransfer.to, age: firstTransfer.age, starter: loanSeason !== undefined && starter(loanSeason) }
      : null;

  let explosion: { age: number; delta: number } | null = null;
  for (const record of history) {
    const delta = record.ovrEnd - record.ovrStart;
    if (record.games >= 15 && delta >= 4 && (!explosion || delta > explosion.delta)) explosion = { age: record.age, delta };
  }

  const perfect = history.find((record) => {
    const kinds = new Set(record.titles.map(kind));
    return kinds.has("league") && kinds.has("cup") && kinds.has("continental1");
  });

  let bestGoals: { goals: number; age: number } | null = null;
  for (const record of history) {
    if (!bestGoals || record.production.goals > bestGoals.goals) bestGoals = { goals: record.production.goals, age: record.age };
  }

  const ballonAges = history.filter((record) => record.awards.won.includes("ballonDor")).map((record) => record.age);
  const podiums = history.filter((record) => {
    const rank = record.awards.ballonDor.playerRank;
    return rank !== null && rank >= 2 && rank <= 3;
  }).length;

  const movementAge = (wanted: "promoted" | "relegated"): AgedClub | null => {
    const record = history.find((candidate) => movementOf(candidate) === wanted);
    return record ? { club: record.club, age: record.age } : null;
  };

  const releasedEntry = career.log.find((entry) => entry.kind === "released");
  const suspended = history.find((record) => record.suspended);

  let worstInjury: BioFacts["worstInjury"] = null;
  for (const record of history) {
    if (record.injury && record.injury.lostGames >= 10 && (!worstInjury || record.injury.lostGames > worstInjury.lostGames)) {
      worstInjury = { type: record.injury.type, lostGames: record.injury.lostGames, age: record.age };
    }
  }

  const decline = peak ? history.find((record) => record.age > peak.age && record.ovrEnd <= peak.ovrEnd - 6) : undefined;

  // Volta a um clube onde já jogou de verdade, depois de sair em definitivo. Voltar de um
  // empréstimo para o clube dono não conta: a passagem anterior foi o empréstimo.
  let homecoming: AgedClub | null = null;
  for (const [index, stint] of stints.entries()) {
    const previous = stints[index - 1];
    if (stint.loan || !previous || previous.loan) continue;
    const before = stints.slice(0, index - 1).some((earlier) => earlier.club === stint.club && !earlier.loan);
    if (before) {
      homecoming = { club: stint.club, age: stint.fromAge };
      break;
    }
  }

  const shirtEntry = career.log.find((entry) => entry.kind === "shirt" && CLASSIC_NUMBERS.has(entry.number));

  // Estrada não tomada: recusou um clube bem mais forte do que o escolhido.
  let roadNotTaken: (AgedClub & { gap: number }) | null = null;
  for (const entry of career.log) {
    if (entry.kind !== "refused" || entry.chosenStrength === null) continue;
    const gap = entry.strength - entry.chosenStrength;
    if (gap >= 8 && (!roadNotTaken || gap > roadNotTaken.gap)) roadNotTaken = { club: entry.club, age: entry.age, gap };
  }

  const crowns = (award: "topScorer" | "bestPlayer"): AgedTitle[] =>
    history.flatMap((record) =>
      record.awards.crowns.filter((crown) => crown.award === award).map((crown) => ({ competition: crown.competition, age: record.age })),
    );

  const lastLegacy = new Map<string, { legacy: LegacyLevel; traitor: boolean }>();
  for (const record of history) lastLegacy.set(record.club, { legacy: record.legacy, traitor: record.traitor || (lastLegacy.get(record.club)?.traitor ?? false) });
  const legends = [...lastLegacy].filter(([, value]) => value.legacy === "legend").map(([club]) => club);
  const idols = [...lastLegacy].filter(([, value]) => value.legacy === "idol").map(([club]) => club);
  const traitorClubs = Object.entries(career.bonds)
    .filter(([, bond]) => bond.traitor)
    .map(([club]) => club);

  const records = careerRecords(history);
  const continental = titleList.find((title) => kind(title.competition) === "continental1") ?? null;
  const worldCup = titleList.find((title) => kind(title.competition) === "worldCup");
  const veteran = [...titleList].reverse().find((title) => title.age >= 33) ?? null;

  return {
    seed: career.setup.seed,
    surname: career.setup.identity.surname,
    position: career.player.position,
    keeper: isGoalkeeper(career.player.position),
    talent: career.player.talent,
    prodigy: career.player.prodigy,
    firstAge: first?.age ?? career.age,
    lastAge: last?.age ?? career.age,
    end: career.end,
    totals: careerTotals(history),
    stints,
    countries: new Set(stints.map((stint) => getClub(stint.club)?.country ?? stint.club)).size,
    peak: peak ? { ovr: peak.ovrEnd, age: peak.age, club: peak.club } : null,
    peakWindow,
    lastOvr: last?.ovrEnd ?? 0,
    breakthrough: breakthroughRecord ? { club: breakthroughRecord.club, age: breakthroughRecord.age } : null,
    earlyStarter: earlyRecord ? { club: earlyRecord.club, age: earlyRecord.age } : null,
    quietYouth: history.filter((record) => record.age < 20 && record.games < 10).length,
    earlyLoan,
    bigMove,
    explosion,
    firstTitle: titleList[0] ?? null,
    veteranTitle: veteran,
    perfectSeason: perfect?.age ?? null,
    bestGoals,
    titlesByKind,
    firstContinental: continental,
    worldCupAge: worldCup?.age ?? null,
    ballonDors: ballonAges.length,
    firstBallonAge: ballonAges[0] ?? null,
    podiums,
    goldenShoes: history.filter((record) => record.awards.won.includes("goldenShoe")).length,
    goldenGloves: history.filter((record) => record.awards.won.includes("goldenGlove")).length,
    firstCapAge: career.firstCapAge,
    promotion: movementAge("promoted"),
    relegation: movementAge("relegated"),
    released: releasedEntry && releasedEntry.kind === "released" ? { club: releasedEntry.club, age: releasedEntry.age } : null,
    suspension: suspended?.age ?? null,
    worstInjury,
    decline: decline ? { age: decline.age, ovr: decline.ovrEnd } : null,
    homecoming,
    classicShirt: shirtEntry && shirtEntry.kind === "shirt" ? { number: shirtEntry.number, age: shirtEntry.age } : null,
    roadNotTaken: roadNotTaken ? { club: roadNotTaken.club, age: roadNotTaken.age } : null,
    topScorer: crowns("topScorer"),
    bestPlayer: crowns("bestPlayer"),
    legends,
    idols,
    traitorClubs,
    recordsBeaten: records.filter((result) => result.status === "beaten").map((result) => result.record.id),
    recordsMatched: records.filter((result) => result.status === "matched").map((result) => result.record.id),
  };
}
