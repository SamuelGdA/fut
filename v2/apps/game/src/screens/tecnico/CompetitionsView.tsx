import { type CoachCareer, type CompetitionState, type Fixture, sortTable, type TableRow } from "@craque/engine/coach";
import { getLeague, leagueAt } from "@craque/world";
import { useState } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { cn } from "../../ui/cn";
import { SectionRule } from "../../ui/Panel";
import { ClubTag } from "./shared";
import { competitionName, roundName } from "./text";

/**
 * Competições (spec 15): só de clubes (D55), com tabela de verdade
 * atualizada jogo a jogo, chaves com ida, volta, agregado e pênaltis, e o
 * calendário do time. Nada de seleções neste modo.
 */
export function CompetitionsView({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt } = t;
  const coach = career.coach;
  const own = coach
    ? Object.values(career.competitions)
        .filter((state) => state.entrants.includes(coach.club))
        .sort((a, b) => (a.kind === "league" ? -1 : b.kind === "league" ? 1 : a.id.localeCompare(b.id)))
    : [];
  const [selected, setSelected] = useState<string>(own[0]?.id ?? "calendar");
  const current = own.find((state) => state.id === selected) ?? null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tec-comp-title">
      <SectionRule as="h2" aside={<span className="text-2xs text-faint">{tt("competitions.clubOnly")}</span>}>
        <span id="tec-comp-title">{tt("competitions.title")}</span>
      </SectionRule>
      <label className="tec-select">
        <span className="sr-only">{tt("competitions.title")}</span>
        <select
          value={selected}
          onChange={(event) => {
            feedback("tick");
            setSelected(event.target.value);
          }}
        >
          <option value="calendar">{tt("competitions.calendar")}</option>
          {own.map((state) => (
            <option key={state.id} value={state.id}>
              {competitionName(state.id, t.locale)}
            </option>
          ))}
        </select>
      </label>
      {selected === "calendar" || !current ? <Calendar career={career} /> : <CompetitionDetail career={career} state={current} />}
    </section>
  );
}

function Table({ career, rows, highlight, zones }: { career: CoachCareer; rows: readonly TableRow[]; highlight: string; zones?: { up: number; down: number } }) {
  const { tt } = useTecnicoT();
  const sorted = sortTable(rows as TableRow[], (club) => career.clubs[club]?.strength ?? 0);
  return (
    <table className="tec-table">
      <thead>
        <tr>
          <th scope="col">{tt("competitions.pos")}</th>
          <th scope="col" className="text-left">
            {tt("competitions.club")}
          </th>
          <th scope="col">{tt("competitions.played")}</th>
          <th scope="col">{tt("competitions.won")}</th>
          <th scope="col">{tt("competitions.drawn")}</th>
          <th scope="col">{tt("competitions.lost")}</th>
          <th scope="col">{tt("competitions.goalDiff")}</th>
          <th scope="col">{tt("competitions.points")}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, index) => (
          <tr
            key={row.club}
            data-own={row.club === highlight || undefined}
            data-zone={zones ? (index < zones.up ? "up" : index >= sorted.length - zones.down ? "down" : undefined) : undefined}
          >
            <td className="numeric">{index + 1}</td>
            <td className="text-left">
              <ClubTag club={row.club} size={16} />
            </td>
            <td className="numeric">{row.played}</td>
            <td className="numeric">{row.won}</td>
            <td className="numeric">{row.drawn}</td>
            <td className="numeric">{row.lost}</td>
            <td className="numeric">{row.goalsFor - row.goalsAgainst}</td>
            <td className="numeric font-bold">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CompetitionDetail({ career, state }: { career: CoachCareer; state: CompetitionState }) {
  const t = useTecnicoT();
  const { tt } = t;
  const club = career.coach?.club ?? "";
  if (state.kind === "league" && state.table) {
    const league = getLeague(state.id.replace(/^league:/, ""));
    const up = league && league.division === 2 ? (leagueAt(league.country, 1)?.promotionSlots ?? 0) : 0;
    const down = league && league.division === 1 && leagueAt(league.country, 2) ? league.promotionSlots : 0;
    return <Table career={career} rows={state.table} highlight={club} zones={{ up, down }} />;
  }
  const fixtures = career.fixtures.filter((fixture) => fixture.competition === state.id);
  const rounds = [...new Set(fixtures.map((fixture) => fixture.round))];
  return (
    <div className="flex flex-col gap-4">
      {state.groups?.map((group) => (
        <div key={group.name}>
          <p className="eyebrow mb-1">{tt("competitions.group", { name: group.name })}</p>
          <Table career={career} rows={group.rows} highlight={club} />
        </div>
      ))}
      {rounds
        .filter((round) => !round.startsWith("group"))
        .map((round) => (
          <div key={round}>
            <p className="eyebrow mb-1">{roundName(tt, round)}</p>
            <ul className="flex flex-col gap-1">
              {fixtures
                .filter((fixture) => fixture.round === round)
                .map((fixture) => (
                  <FixtureLine key={fixture.id} fixture={fixture} highlight={club} />
                ))}
            </ul>
          </div>
        ))}
      {state.knockoutPlan.some((plan) => !plan.drawn) ? (
        <p className="text-xs text-faint">
          {state.knockoutPlan
            .filter((plan) => !plan.drawn)
            .map((plan) => roundName(tt, plan.label))
            .join(", ")}
          : {tt("competitions.notDrawn")}
        </p>
      ) : null}
      {state.champion ? (
        <p className="text-sm text-glory">
          {tt("results.champion")}: <ClubTag club={state.champion} size={16} />
        </p>
      ) : null}
    </div>
  );
}

function FixtureLine({ fixture, highlight }: { fixture: Fixture; highlight: string }) {
  const { tt } = useTecnicoT();
  const result = fixture.result;
  const own = fixture.home === highlight || fixture.away === highlight;
  return (
    <li className={cn("tec-fixture", own && "tec-fixture-own")}>
      <ClubTag club={fixture.home} size={14} className="flex-1" />
      <span className="numeric shrink-0 px-1 text-sm font-bold">{result ? `${result.home} × ${result.away}` : "×"}</span>
      <ClubTag club={fixture.away} size={14} className="flex-1 justify-end text-right" />
      {result?.penalties ? (
        <span className="w-full text-center text-2xs text-muted">{tt("competitions.penalties", { score: `${result.penalties[0]} × ${result.penalties[1]}` })}</span>
      ) : result?.extraTime ? (
        <span className="w-full text-center text-2xs text-muted">{tt("competitions.extraTime")}</span>
      ) : null}
    </li>
  );
}

/** Os jogos do time na temporada: jogados (com placar) e os próximos. */
function Calendar({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt } = t;
  const club = career.coach?.club ?? "";
  const games = career.fixtures.filter((fixture) => fixture.home === club || fixture.away === club).sort((a, b) => a.day - b.day);
  const played = games.filter((fixture) => fixture.result);
  const upcoming = games.filter((fixture) => !fixture.result).slice(0, 12);
  const line = (fixture: Fixture) => {
    const home = fixture.home === club;
    const opponent = home ? fixture.away : fixture.home;
    const result = fixture.result;
    const own = result ? (home ? result.home : result.away) : null;
    const other = result ? (home ? result.away : result.home) : null;
    const tone = own === null || other === null ? "neutral" : own > other ? "good" : own < other ? "bad" : "neutral";
    return (
      <li key={fixture.id} className="tec-fixture">
        <span className="w-24 shrink-0 truncate text-2xs text-muted">{competitionName(fixture.competition, t.locale)}</span>
        <ClubTag club={opponent} size={14} className="flex-1" />
        <span className="text-2xs text-faint">{fixture.neutral ? tt("competitions.neutral") : home ? tt("competitions.home") : tt("competitions.away")}</span>
        <span data-tone={tone} className="numeric text-tone w-12 shrink-0 text-right text-sm font-bold">
          {own === null ? "-" : `${own} × ${other}`}
        </span>
      </li>
    );
  };
  return (
    <div className="flex flex-col gap-3">
      {upcoming.length > 0 ? (
        <div>
          <p className="eyebrow mb-1">{tt("competitions.upcoming")}</p>
          <ul className="flex flex-col gap-1">{upcoming.map(line)}</ul>
        </div>
      ) : null}
      {played.length > 0 ? (
        <div>
          <p className="eyebrow mb-1">{tt("competitions.played_")}</p>
          <ul className="flex flex-col gap-1">{[...played].reverse().map(line)}</ul>
        </div>
      ) : null}
    </div>
  );
}
