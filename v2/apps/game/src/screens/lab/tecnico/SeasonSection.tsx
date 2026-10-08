import { type CoachCareer, coachCommand, sortTable } from "@craque/engine/coach";
import { getClub, getCompetition, getLeague } from "@craque/world";
import { Play, Square } from "lucide-react";
import { useRef, useState } from "react";
import { useTecnicoT } from "../../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { Segmented } from "../../../ui/Segmented";
import { SeasonLine } from "../../tecnico/HistoryView";
import { LabSection } from "../LabSection";
import { LabTable } from "./LabControls";
import { breathe, labStarted, type LabPolicy, playSeason } from "./labCareer";

interface SeasonRow {
  readonly year: number;
  readonly champions: ReadonlyArray<readonly [string, string]>;
  readonly clubWorldCup: string | null;
  readonly intercontinental: string | null;
}

/** Campeões das primeiras divisões e dos torneios mundiais de uma temporada já avaliada. */
function seasonRow(career: CoachCareer): SeasonRow {
  const champions: Array<readonly [string, string]> = [];
  for (const state of Object.values(career.competitions)) {
    if (state.kind !== "league" || !state.table) continue;
    const league = getLeague(state.id.replace(/^league:/, ""));
    if (!league || league.division !== 1) continue;
    const top = sortTable(state.table, (club) => career.clubs[club]?.strength ?? 0)[0];
    if (top) champions.push([league.name, top.club]);
  }
  return {
    year: career.year,
    champions: champions.sort((a, b) => a[0].localeCompare(b[0])),
    clubWorldCup: career.competitions.clubworldcup?.champion ?? null,
    intercontinental: career.competitions.intercontinental?.champion ?? null,
  };
}

/**
 * O mundo inteiro jogado aqui, temporada por temporada, em pedaços (a página
 * não trava): campeões de cada primeira divisão, Intercontinental, Mundial de
 * Clubes e a carreira do técnico automático.
 */
export function SeasonSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, number } = t;
  const [seasons, setSeasons] = useState(3);
  const [policy, setPolicy] = useState<LabPolicy>("balanced");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<SeasonRow[]>([]);
  const [career, setCareer] = useState<CoachCareer | null>(null);
  const cancel = useRef(false);

  const run = async () => {
    feedback("whistle");
    cancel.current = false;
    setRunning(true);
    setRows([]);
    setProgress(0);
    let current = labStarted(`lab-temporada-${Date.now()}`);
    const collected: SeasonRow[] = [];
    for (let season = 0; season < seasons; season += 1) {
      if (cancel.current) break;
      await breathe();
      current = playSeason(current, policy, true);
      if (current.phase !== "review") break;
      collected.push(seasonRow(current));
      setRows([...collected]);
      setProgress(season + 1);
      setCareer(current);
      if (season === seasons - 1) break;
      const stay = current.offers.find((offer) => offer.stay);
      const choice = stay ? ("stay" as const) : current.offers[0] ? { offer: current.offers[0].id } : null;
      if (!choice) break;
      const result = coachCommand(current, { type: "decide", choice });
      if (result.error) break;
      current = result.career;
    }
    setRunning(false);
  };

  const leagues = rows[0]?.champions.map(([name]) => name) ?? [];

  return (
    <LabSection id="tec-temporada" index={index} title={tt("lab.season.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.season.lead")}</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="tec-select flex flex-col gap-1">
          <span className="eyebrow">{tt("lab.season.seasons")}</span>
          <select value={seasons} disabled={running} onChange={(event) => setSeasons(Number(event.target.value))}>
            {[1, 3, 6, 12, 24].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div>
          <p className="eyebrow mb-1">{tt("lab.season.policy")}</p>
          <Segmented<LabPolicy>
            size="sm"
            label={tt("lab.season.policy")}
            value={policy}
            onValueChange={setPolicy}
            options={[
              { value: "balanced", label: tt("lab.season.policies.balanced") },
              { value: "passive", label: tt("lab.season.policies.passive") },
            ]}
          />
        </div>
        {running ? (
          <Button
            variant="secondary"
            onClick={() => {
              cancel.current = true;
            }}
          >
            <Square size={15} aria-hidden="true" />
            {tt("lab.cancel")}
          </Button>
        ) : (
          <Button onClick={() => void run()}>
            <Play size={15} aria-hidden="true" />
            {tt("lab.run")}
          </Button>
        )}
        {running || progress > 0 ? (
          <p role="status" className="text-sm text-muted">
            {tt("lab.season.progress", { season: progress, total: seasons })}
          </p>
        ) : null}
      </div>
      {rows.length > 0 ? (
        <div className="mt-4">
          <p className="eyebrow mb-1">{tt("lab.season.champions")}</p>
          <LabTable
            head={["", ...rows.map((row) => number(row.year, { useGrouping: false }))]}
            rows={[
              ...leagues.map((league) => [league, ...rows.map((row) => getClub(row.champions.find(([name]) => name === league)?.[1] ?? "")?.short ?? "-")]),
              [getCompetition("intercontinental")?.names[t.locale] ?? tt("lab.season.intercontinental"), ...rows.map((row) => (row.intercontinental ? (getClub(row.intercontinental)?.short ?? row.intercontinental) : "-"))],
              [getCompetition("clubworldcup")?.names[t.locale] ?? tt("lab.season.clubWorldCup"), ...rows.map((row) => (row.clubWorldCup ? (getClub(row.clubWorldCup)?.short ?? row.clubWorldCup) : "-"))],
            ]}
          />
        </div>
      ) : null}
      {career && career.history.length > 0 ? (
        <div className="mt-4 max-w-2xl">
          <p className="eyebrow mb-1">{tt("lab.season.career")}</p>
          <ol className="flex flex-col">
            {career.history.map((entry) => (
              <SeasonLine key={`${entry.year}:${entry.club}`} entry={entry} />
            ))}
          </ol>
        </div>
      ) : null}
    </LabSection>
  );
}
