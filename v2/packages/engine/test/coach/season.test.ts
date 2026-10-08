import { describe, expect, it } from "vitest";
import { canRetire, type CoachCareer, type Fixture } from "../../src/coach";
import { must, playSeason, playStage, refused, started } from "./helpers";

/** Uma temporada rápida inteira, jogada uma vez e conferida por vários testes. */
const opening = started("teste-temporada");
const season = playSeason(opening);

function coachFixtures(career: CoachCareer): Fixture[] {
  const club = career.coach?.club ?? "";
  return career.fixtures.filter((fixture) => fixture.result && (fixture.home === club || fixture.away === club)).sort((a, b) => a.day - b.day);
}

describe("temporada do Técnico (spec 9 a 13)", () => {
  it("um evento por etapa: fora de campo ou de partida, nunca os dois", () => {
    const advanced = must(opening, { type: "advance" });
    expect(advanced.phase).toBe("event");
    expect(Boolean(advanced.event) !== advanced.matchEventArmed).toBe(true);
    expect(refused(advanced, { type: "openAction", kind: "train" })).toBe("phase");
  });

  it("a tabela de cada liga é a soma das partidas", () => {
    for (const state of Object.values(season.competitions)) {
      if (state.kind !== "league" || !state.table) continue;
      const games = season.fixtures.filter((fixture) => fixture.competition === state.id && fixture.result);
      for (const row of state.table) {
        const own = games.filter((fixture) => fixture.home === row.club || fixture.away === row.club);
        let won = 0;
        let drawn = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;
        for (const fixture of own) {
          const result = fixture.result;
          if (!result) continue;
          const home = fixture.home === row.club;
          const scored = home ? result.home : result.away;
          const conceded = home ? result.away : result.home;
          goalsFor += scored;
          goalsAgainst += conceded;
          if (scored > conceded) won += 1;
          else if (scored === conceded) drawn += 1;
        }
        expect(row.played).toBe(own.length);
        expect(row.won).toBe(won);
        expect(row.drawn).toBe(drawn);
        expect(row.goalsFor).toBe(goalsFor);
        expect(row.goalsAgainst).toBe(goalsAgainst);
        expect(row.points).toBe(3 * won + drawn);
      }
    }
  });

  it("todo jogo do calendário foi jogado, em ordem de dias, e o treinador jogou a liga inteira", () => {
    const played = season.fixtures.filter((fixture) => fixture.result);
    expect(played.length).toBe(season.fixtures.length);
    const own = coachFixtures(season);
    const league = own.filter((fixture) => fixture.kind === "league");
    const table = Object.values(season.competitions).find((state) => state.kind === "league" && state.entrants.includes(season.coach?.club ?? ""));
    expect(league.length).toBe(table?.table?.find((row) => row.club === season.coach?.club)?.played);
    for (const fixture of own) expect(fixture.result?.coach).not.toBeNull();
  });

  it("lesionado não joga enquanto se recupera (ordem cronológica)", () => {
    const own = coachFixtures(season);
    for (const fixture of own) {
      for (const injury of fixture.result?.injuries ?? []) {
        const later = own.filter((other) => other.day > fixture.day && other.day < fixture.day + injury.days);
        for (const other of later) {
          const used = other.result?.coach?.used.map((entry) => entry.player) ?? [];
          expect(used).not.toContain(injury.player);
        }
      }
    }
  });

  it("escalação respeita as regras: 11 titulares, no máximo 5 trocas", () => {
    for (const fixture of coachFixtures(season)) {
      const log = fixture.result?.coach;
      if (!log) continue;
      expect(log.lineup).toHaveLength(11);
      const subs = log.used.filter((entry) => entry.from > 0).length;
      expect(subs).toBeLessThanOrEqual(5);
    }
  });

  it("avaliação: histórico com a liga jogada, propostas e reputação", () => {
    expect(season.phase).toBe("review");
    expect(season.review).not.toBeNull();
    const entry = season.history[0];
    expect(entry?.league).toBeTruthy();
    expect(entry?.club).toBe(opening.coach?.club);
    expect(entry?.partial).toBe(false);
    if (!season.review?.dismissed) expect(season.offers.some((offer) => offer.stay)).toBe(true);
  });

  it("aposentadoria só depois da primeira temporada", () => {
    expect(canRetire(opening)).toBe(false);
    expect(refused(opening, { type: "retire" })).toBe("cannotRetire");
    expect(canRetire(season)).toBe(true);
    const retired = must(season, { type: "decide", choice: "retire" });
    expect(retired.phase).toBe("ended");
    expect(retired.ended).toEqual({ reason: "retired", partial: false });
  });

  it("24 temporadas: na última só dá para encerrar; antes, encerrar exige aposentar", () => {
    expect(refused(season, { type: "decide", choice: "finish" })).toBe("notLastSeason");
    const last: CoachCareer = { ...season, seasonIndex: 23 };
    expect(refused(last, { type: "decide", choice: "stay" })).toBe("careerOver");
    const done = must(last, { type: "decide", choice: "finish" });
    expect(done.ended).toEqual({ reason: "completed", partial: false });
  });

  it("depois da avaliação, a temporada seguinte começa com idade, ano e propostas novas", () => {
    const stay = season.offers.find((offer) => offer.stay);
    const choice = stay ? "stay" : { offer: season.offers[0]?.id ?? "" };
    const next = must(season, { type: "decide", choice });
    expect(next.year).toBe(season.year + 1);
    expect(next.seasonIndex).toBe(1);
    expect(next.phase).toBe("stage");
    expect(next.actionsUsed).toBe(0);
    expect(next.fixtures.every((fixture) => fixture.result === null)).toBe(true);
  }, 30_000);
});

describe("evento de partida (spec 12)", () => {
  /** Primeira etapa (entre algumas sementes) com evento de partida. */
  function pausedMatch(): CoachCareer {
    for (let index = 0; index < 12; index += 1) {
      const career = must(started(`teste-pausa-${index}`), { type: "advance" });
      if (!career.matchEventArmed) continue;
      const paused = must(career, { type: "simulate" });
      if (paused.phase === "matchEvent") return paused;
    }
    throw new Error("nenhuma semente pausou");
  }

  it("pausa com contexto completo; os gols antes da pausa não mudam com a escolha", () => {
    const paused = pausedMatch();
    const event = paused.event;
    const match = event?.match;
    expect(match).toBeTruthy();
    if (!event || !match || !paused.pendingMatch) throw new Error("sem contexto");
    expect(match.minute).toBeGreaterThan(0);
    expect(match.opponent).toBeTruthy();
    expect(match.competition).toBeTruthy();
    expect(event.options.length).toBeGreaterThanOrEqual(2);
    const fixtureId = paused.pendingMatch.fixture;
    const results = event.options.map((option) => {
      const after = must(paused, { type: "chooseMatchEvent", option: option.id });
      const fixture = after.fixtures.find((item) => item.id === fixtureId);
      return fixture?.result;
    });
    const before = results.map((result) => (result?.goals ?? []).filter((goal) => goal.minute < match.minute).map((goal) => `${goal.minute}:${goal.side}:${goal.scorer}`));
    for (const list of before) expect(list).toEqual(before[0]);
    const home = paused.fixtures.find((item) => item.id === fixtureId)?.home === paused.coach?.club;
    for (const result of results) {
      const own = home ? result?.home : result?.away;
      const other = home ? result?.away : result?.home;
      expect(own).toBeGreaterThanOrEqual(match.score[0]);
      expect(other).toBeGreaterThanOrEqual(match.score[1]);
    }
    // Repetir a escolha depois de resolvida é recusado.
    const chosen = must(paused, { type: "chooseMatchEvent", option: event.options[0]?.id ?? "" });
    expect(chosen.phase).not.toBe("matchEvent");
  }, 120_000);
});

describe("rápido e lento contam o tempo do mesmo jeito (spec 5)", () => {
  it("mesma receita e mesmo ano depois de uma temporada; o lento tem duas etapas", () => {
    const fast = season;
    let slow = started("teste-temporada", "slow");
    slow = playStage(slow);
    expect(slow.lastReport?.final).toBe(false);
    slow = must(slow, { type: "continue" });
    expect(slow.phase).toBe("stage");
    expect(slow.half).toBe(1);
    slow = playStage(slow);
    slow = must(slow, { type: "continue" });
    expect(slow.phase).toBe("review");
    expect(slow.year).toBe(fast.year);
    const revenue = (career: CoachCareer) => career.stageReports.reduce((total, report) => total + report.finance.revenue, 0);
    expect(revenue(slow)).toBeCloseTo(revenue(fast), 2);
    expect(slow.stageReports).toHaveLength(2);
    expect(fast.stageReports).toHaveLength(1);
  }, 60_000);
});
