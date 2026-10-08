import { DEFAULT_AVATAR } from "@craque/art";
import {
  autoplay,
  type Career,
  type CareerSetup,
  choose,
  challengeSetup,
  createCareer,
  dailyHand,
  ENGINE_VERSION,
  replay,
  policyChoice,
  retireNow,
  saveOf,
} from "@craque/engine";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEYS, safeStorage } from "../../services/storage";
import { readSave, recordOf } from "../career/save";
import { peekSave, writeSave } from "../career/saveRecord";
import { useCareer } from "../career/store";
import { decisionPoints } from "../career/whatIf";
import { archiveEntryOf, attemptOf, staleArchiveEntryOf } from "./build";
import {
  ARCHIVE_FORMAT,
  type ArchiveEntry,
  archiveId,
  type AttemptEntry,
  challengeStats,
  dayRanking,
  hallList,
  hasRankedAttempt,
  LEADERBOARD_FORMAT,
  personalRecords,
  placementOf,
  rankedDays,
  sanitizeAchievementRow,
  sanitizeArchiveEntry,
  sanitizeAttempt,
} from "./model";
import { archiveSavedCareer, challengeOf, recordFinished, recordInterrupted } from "./session";
import { useHall } from "./store";
import { useUnlocks } from "./unlocks";

/**
 * O Hall da Fama, o ranking do desafio e as conquistas (GDD 27.7, 28 e 34),
 * em Node: sem IndexedDB, o banco vive em memória, como numa aba anônima.
 */

const SETUP: CareerSetup = {
  seed: "teste-hall",
  startYear: 2026,
  pace: "intense",
  difficulty: "normal",
  identity: { surname: "LIMA", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9 },
};

const DAY = "2026-10-02";

/** Joga `count` decisões com a política equilibrada. */
function playN(start: Career, count: number): Career {
  let career = start;
  for (let step = 0; step < count; step += 1) {
    const choice = policyChoice(career, "balanced");
    if (!choice) break;
    career = choose(career, choice).career;
  }
  return career;
}
const challengeCareer = (surname: string, policy: "balanced" | "ambitious" | "loyal") =>
  autoplay(createCareer(challengeSetup(dailyHand(DAY), { surname, foot: "right", dreamNumber: null })), policy);

function attempt(partial: Partial<AttemptEntry> & Pick<AttemptEntry, "id" | "day" | "score">): AttemptEntry {
  return {
    format: LEADERBOARD_FORMAT,
    surname: "TESTE",
    topMission: "careerGoals",
    missionsDone: 1,
    edict: "noLoans",
    edictKept: true,
    erased: 0,
    peakOvr: 80,
    at: 0,
    ranked: false,
    ...partial,
  };
}

describe("formato do Hall (GDD 28.1)", () => {
  const career = autoplay(createCareer(SETUP), "balanced");
  const entry = archiveEntryOf(career, DEFAULT_AVATAR, { status: "finished", alternate: false, challenge: null, now: 1000 });

  it("o id é o hash do replay: a mesma carreira dá o mesmo id, outra escolha dá outro", () => {
    expect(archiveId(saveOf(career))).toBe(entry.id);
    expect(archiveId(saveOf(replay(saveOf(career))))).toBe(entry.id);
    const shorter = { ...saveOf(career), choices: saveOf(career).choices.slice(0, -1) };
    expect(archiveId(shorter)).not.toBe(entry.id);
    expect(archiveId({ ...saveOf(career), setup: { ...SETUP, seed: "outra" } })).not.toBe(entry.id);
  });

  it("a entrada passa no schema de ida e volta, e o retrato confere com a carreira", () => {
    const round = sanitizeArchiveEntry(JSON.parse(JSON.stringify(entry)));
    expect(round).toEqual(entry);
    expect(entry.snapshot.surname).toBe("LIMA");
    expect(entry.snapshot.seasons).toBe(career.history.length);
    expect(entry.snapshot.clubs.length).toBeGreaterThan(0);
    expect(entry.counts["clubThreeHundred"]).toBeGreaterThanOrEqual(0);
  });

  it("o que vem do disco sem confiança: formato antigo, campo estranho ou faltando", () => {
    expect(sanitizeArchiveEntry({ ...entry, format: 0 })).toBeNull();
    expect(sanitizeArchiveEntry({ ...entry, id: "" })).toBeNull();
    expect(sanitizeArchiveEntry({ ...entry, save: { v: 1 } })).toBeNull();
    expect(sanitizeArchiveEntry({ ...entry, snapshot: { ...entry.snapshot, surname: "" } })).toBeNull();
    const odd = sanitizeArchiveEntry({ ...entry, status: "perdida", snapshot: { ...entry.snapshot, peakOvr: 500, position: "zagueiro" }, counts: { a: -1, b: "x", c: 3.4 } });
    expect(odd?.status).toBe("finished");
    expect(odd?.snapshot.peakOvr).toBe(99);
    expect(odd?.snapshot.position).toBe("st");
    expect(odd?.counts).toEqual({ c: 3 });
    expect(sanitizeAttempt({ ...attempt({ id: "a", day: DAY, score: 10 }), format: 0 })).toBeNull();
    expect(sanitizeAttempt({ ...attempt({ id: "a", day: "ontem", score: 10 }) })).toBeNull();
    expect(sanitizeAttempt(attempt({ id: "a", day: DAY, score: 5000 }))?.score).toBe(1000);
    expect(sanitizeAchievementRow({ id: "ovr90", at: -5, by: 3 })).toEqual({ id: "ovr90", at: 0, by: "" });
  });

  it("a tentativa do desafio guarda o que o ranking mostra (GDD 27.7)", () => {
    const challenge = challengeCareer("RANKING", "balanced");
    const status = challengeOf(challenge);
    if (!status) throw new Error("sem desafio");
    const row = attemptOf(challenge, status, true, 7);
    expect(row.id).toBe(archiveId(saveOf(challenge)));
    expect(row).toMatchObject({ day: DAY, surname: "RANKING", score: status.total, ranked: true, at: 7, edict: status.edict.id });
    expect(status.missions.map((item) => item.id)).toContain(row.topMission);
    expect(sanitizeAttempt(JSON.parse(JSON.stringify(row)))).toEqual(row);
  });

  it("save de outra versão do motor entra pelo retrato", () => {
    const record = { ...recordOf(career, null, "career"), engine: "0.0.1" };
    const stale = staleArchiveEntryOf(record, 5);
    expect(stale.status).toBe("interrupted");
    expect(stale.save.engine).toBe("0.0.1");
    expect(stale.snapshot.surname).toBe("LIMA");
    expect(sanitizeArchiveEntry(stale)).not.toBeNull();
  });
});

describe("lista, recordes pessoais e ranking", () => {
  const base = (id: string, at: number, snapshot: Partial<ArchiveEntry["snapshot"]>): ArchiveEntry => {
    const career = autoplay(createCareer(SETUP), "balanced");
    const entry = archiveEntryOf(career, null, { status: "finished", alternate: false, challenge: null, now: at });
    return { ...entry, id, snapshot: { ...entry.snapshot, ...snapshot } };
  };
  const entries = [
    base("a", 1, { peakOvr: 80, titles: 3, awards: 0, goals: 100, ballons: 0, difficulty: "normal" }),
    base("b", 2, { peakOvr: 92, titles: 1, awards: 4, goals: 300, ballons: 2, difficulty: "hard", challenge: { day: DAY, score: 700, ranked: true } }),
    base("c", 3, { peakOvr: 85, titles: 9, awards: 1, goals: 50, ballons: 0, difficulty: "hard" }),
  ];

  it("ordena por recentes, pico, títulos e prêmios, e filtra desafio e difícil", () => {
    const ids = (list: ArchiveEntry[]) => list.map((entry) => entry.id);
    expect(ids(hallList(entries, "recent", { challenge: false, hard: false }))).toEqual(["c", "b", "a"]);
    expect(ids(hallList(entries, "peak", { challenge: false, hard: false }))).toEqual(["b", "c", "a"]);
    expect(ids(hallList(entries, "titles", { challenge: false, hard: false }))).toEqual(["c", "a", "b"]);
    expect(ids(hallList(entries, "awards", { challenge: false, hard: false }))).toEqual(["b", "c", "a"]);
    expect(ids(hallList(entries, "recent", { challenge: true, hard: false }))).toEqual(["b"]);
    expect(ids(hallList(entries, "recent", { challenge: false, hard: true }))).toEqual(["c", "b"]);
  });

  it("recordes pessoais: maior pico, mais gols, mais títulos, mais Bolas; zero não é recorde", () => {
    const records = new Map(personalRecords(entries).map((record) => [record.key, record.entry.id]));
    expect(records.get("peak")).toBe("b");
    expect(records.get("goals")).toBe("b");
    expect(records.get("titles")).toBe("c");
    expect(records.get("ballons")).toBe("b");
    expect(personalRecords(entries.map((entry) => ({ ...entry, snapshot: { ...entry.snapshot, ballons: 0 } }))).some((record) => record.key === "ballons")).toBe(false);
  });

  it("ranking do dia, colocação e estatísticas só das ranqueadas (GDD 27.7)", () => {
    const attempts = [
      attempt({ id: "1", day: DAY, score: 600, ranked: true, at: 1 }),
      attempt({ id: "2", day: DAY, score: 820, ranked: false, at: 2 }),
      attempt({ id: "3", day: "2026-10-01", score: 900, ranked: true, at: 0, edictKept: false }),
      attempt({ id: "4", day: "2026-09-30", score: 450, ranked: true, at: 0 }),
    ];
    expect(dayRanking(attempts, DAY).map((item) => item.id)).toEqual(["2", "1"]);
    expect(placementOf(attempts, "1")).toEqual({ place: 2, of: 2 });
    expect(placementOf(attempts, "nenhuma")).toBeNull();
    expect(challengeStats(attempts)).toEqual({ played: 3, best: 900, average: 650, clean: 2 });
    expect(rankedDays(attempts)).toBe(3);
    expect(hasRankedAttempt(attempts, DAY)).toBe(true);
    expect(hasRankedAttempt(attempts, "2026-10-03")).toBe(false);
  });
});

describe("a sessão: terminar, interromper, ranquear e conquistar", () => {
  beforeEach(() => {
    safeStorage.removeItem(STORAGE_KEYS.save);
    useUnlocks.setState({ queue: [], held: false });
  });

  it("a primeira tentativa terminada do dia é a ranqueada; a segunda é amistosa; arquivar de novo não muda nada", async () => {
    await useHall.getState().load();
    expect(useHall.getState().persistent).toBe(false);
    const first = challengeCareer("PRIMEIRO", "balanced");
    const second = challengeCareer("SEGUNDO", "ambitious");
    expect(archiveId(saveOf(first))).not.toBe(archiveId(saveOf(second)));

    await recordFinished(first, null, false, 100);
    await recordFinished(second, null, false, 200);
    await recordFinished(first, null, false, 300);

    const attempts = useHall.getState().attempts.filter((item) => item.day === DAY);
    expect(attempts).toHaveLength(2);
    expect(attempts.find((item) => item.surname === "PRIMEIRO")?.ranked).toBe(true);
    expect(attempts.find((item) => item.surname === "SEGUNDO")?.ranked).toBe(false);
    const entry = useHall.getState().entries.find((item) => item.id === archiveId(saveOf(first)));
    expect(entry?.archivedAt).toBe(100);
    expect(entry?.snapshot.challenge).toEqual({ day: DAY, score: challengeOf(first)?.total, ranked: true });
    expect(useHall.getState().entries.filter((item) => item.id === entry?.id)).toHaveLength(1);

    // Conquistas: a primeira carreira e o primeiro desafio caíram, uma vez só.
    const unlocked = new Set(useHall.getState().achievements.map((row) => row.id));
    expect(unlocked.has("firstCareer")).toBe(true);
    expect(unlocked.has("challengeFirst")).toBe(true);
    expect(useUnlocks.getState().queue.filter((notice) => notice.id === "firstCareer")).toHaveLength(1);
    expect(useHall.getState().achievements.find((row) => row.id === "challengeFirst")?.by).toBe("PRIMEIRO");
  });

  it("interrompida só com ao menos uma temporada; terminada não vira interrompida", async () => {
    const fresh = createCareer({ ...SETUP, seed: "sem-temporada" });
    await recordInterrupted(fresh, null, false, 1);
    expect(useHall.getState().entries.some((item) => item.id === archiveId(saveOf(fresh)))).toBe(false);

    let playing = createCareer({ ...SETUP, seed: "no-meio" });
    useCareer.setState({ status: "ready", career: playing, avatar: null, alternate: null, play: null, review: null });
    for (let turn = 0; turn < 3; turn += 1) {
      const option = useCareer.getState().career?.decision?.options.find((item) => item.kind !== "retire");
      if (option) useCareer.getState().choose(option.id);
    }
    playing = useCareer.getState().career ?? playing;
    expect(playing.history.length).toBeGreaterThan(0);
    // Começar outra deixa esta no Hall como interrompida.
    useCareer.getState().start({ ...SETUP, seed: "a-nova" }, null);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const left = useHall.getState().entries.find((item) => item.id === archiveId(saveOf(playing)));
    expect(left?.status).toBe("interrupted");
  });

  it("o save em disco, trocado ou descartado, vai para o Hall antes de sumir", async () => {
    const career = createCareer({ ...SETUP, seed: "em-disco" });
    let played = career;
    for (let turn = 0; turn < 2 && played.decision; turn += 1) {
      const option = played.decision.options.find((item) => item.kind !== "retire");
      if (!option) break;
      played = replay({ ...saveOf(played), choices: [...played.choices, { decision: played.decision.id, option: option.id }] });
    }
    writeSave(recordOf(played, DEFAULT_AVATAR, "career"));
    await archiveSavedCareer(42);
    const entry = useHall.getState().entries.find((item) => item.id === archiveId(saveOf(played)));
    expect(entry?.status).toBe("interrupted");
    expect(entry?.archivedAt).toBe(42);
  });
});

describe("linha alternativa e E se...? (GDD 28.3)", () => {
  beforeEach(() => {
    safeStorage.removeItem(STORAGE_KEYS.save);
    useCareer.setState({ status: "idle", career: null, avatar: null, screen: "career", stale: null, alternate: null, play: null, review: null });
  });

  it("a linha do tempo tem uma decisão por escolha, com título e o que foi escolhido", () => {
    const career = autoplay(createCareer(SETUP), "balanced");
    const points = decisionPoints(saveOf(career), "pt");
    expect(points).toHaveLength(career.choices.length);
    expect(points.every((point) => point.title.length > 0 && point.chose.length > 0)).toBe(true);
    expect(points.map((point) => point.index)).toEqual(career.choices.map((_, index) => index));
  });

  it("seguir de uma decisão refaz até ali, marca a linha alternativa e guarda no save", () => {
    const original = retireNow(playN(createCareer(SETUP), 6));
    const source = saveOf(original);
    expect(useCareer.getState().branch(source, DEFAULT_AVATAR, 3)).toBe(true);
    const state = useCareer.getState();
    expect(state.career?.choices).toEqual(source.choices.slice(0, 3));
    expect(state.career?.decision?.id).toBe(source.choices[3]?.decision);
    expect(state.alternate).toEqual({ from: archiveId(source), decision: source.choices[3]?.decision, original: source.choices[3]?.option });

    const read = readSave();
    expect(read.kind === "ok" ? read.record.alternate : null).toEqual(state.alternate);
    const peek = peekSave();
    expect(peek.kind === "present" ? peek.alternate : null).toBe(true);
    expect(peek.kind === "present" ? peek.current : null).toBe(read.kind === "ok" && read.record.engine === ENGINE_VERSION);
  });

  it("a linha alternativa é só para se divertir: não entra no Hall, nem terminada nem interrompida (D43)", async () => {
    const original = retireNow(playN(createCareer({ ...SETUP, seed: "original-e-se" }), 6));
    const source = saveOf(original);
    expect(useCareer.getState().branch(source, null, 2)).toBe(true);
    const before = useHall.getState().entries.length;
    // Joga a linha alternativa até o fim.
    let guard = 0;
    while (useCareer.getState().career?.decision && guard < 80) {
      const decision = useCareer.getState().career?.decision;
      const option = decision?.options.find((item) => item.kind !== "retire") ?? decision?.options[0];
      if (!option) break;
      useCareer.getState().choose(option.id);
      guard += 1;
    }
    const alternate = useCareer.getState().career;
    expect(alternate?.end).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(useHall.getState().entries.some((item) => alternate && item.id === archiveId(saveOf(alternate)))).toBe(false);
    expect(useHall.getState().entries.length).toBe(before);
    // Interrompida por outra carreira: também não entra.
    expect(useCareer.getState().branch(source, null, 4)).toBe(true);
    const option = useCareer.getState().career?.decision?.options.find((item) => item.kind !== "retire");
    if (option) useCareer.getState().choose(option.id);
    const interrupted = useCareer.getState().career;
    useCareer.getState().start({ ...SETUP, seed: "depois-do-e-se" }, null);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(useHall.getState().entries.some((item) => interrupted && item.id === archiveId(saveOf(interrupted)))).toBe(false);
  });

  it("desafio não tem E se...?, e escolha que não existe recusa", () => {
    const challenge = challengeCareer("DESAFIO", "balanced");
    expect(useCareer.getState().branch(saveOf(challenge), null, 1)).toBe(false);
    const career = autoplay(createCareer(SETUP), "balanced");
    expect(useCareer.getState().branch(saveOf(career), null, 999)).toBe(false);
    const peek = peekSave();
    expect(peek.kind).toBe("none");
  });

  it("o save do desafio diz o dia, sem precisar do motor", () => {
    const career = createCareer(challengeSetup(dailyHand(DAY), { surname: "DIA", foot: "left", dreamNumber: 7 }));
    writeSave(recordOf(career, null, "career"));
    const peek = peekSave();
    expect(peek.kind === "present" ? peek.challengeId : null).toBe(DAY);
    expect(sanitizeArchiveEntry({ id: "x", format: ARCHIVE_FORMAT })).toBeNull();
  });
});
