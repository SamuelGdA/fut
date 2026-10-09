import { coachPlayerName } from "@craque/content/coach";
import { getClubKit } from "@craque/world";
import { Home, RotateCcw, Trophy } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "../../app/navigation";
import { useTecnico } from "../../features/tecnico/store";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Loading } from "../../ui/Loading";
import { Panel } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { StatTile } from "../../ui/Stats";
import { SeasonLine } from "./HistoryView";
import { competitionName } from "./text";

/**
 * O legado (spec 17): clubes, temporadas, títulos, acessos, quedas,
 * demissões, reputação, a sala de troféus, temporada a temporada e os
 * jogadores marcantes. Carreira encerrada no meio da temporada aparece como
 * parcial. Nada disto é salvo (D51): ao sair, some.
 */
export function TecnicoLegacyScreen() {
  const t = useTecnicoT();
  const { tt, ttp, number } = t;
  const go = useNavigation((state) => state.go);
  const career = useTecnico((state) => state.career);
  const avatar = useTecnico((state) => state.avatar);

  useEffect(() => {
    if (!career || career.phase !== "ended") go("hub", { replace: true, force: true });
  }, [career, go]);

  if (!career || career.phase !== "ended") return <Loading label={tt("common.loading")} className="min-h-[60dvh]" />;

  const history = career.history;
  const seasons = history.filter((entry) => !entry.partial).length;
  const clubs = [...new Set(history.map((entry) => entry.club))];
  const titles = history.flatMap((entry) => entry.titles.map((title) => ({ title, year: entry.year, club: entry.club })));
  const byTitle = new Map<string, number>();
  for (const item of titles) byTitle.set(item.title, (byTitle.get(item.title) ?? 0) + 1);
  const legacies = Object.values(career.legacy);
  const nameOf = (id: string) => {
    const legacy = career.legacy[id];
    return legacy ? coachPlayerName(career.setup.seed, { id, name: legacy.name, nationality: legacy.nationality }) : id;
  };
  const revealed = legacies.filter((legacy) => legacy.revealed).sort((a, b) => b.bestOvr - a.bestOvr).slice(0, 6);
  const signed = legacies.filter((legacy) => legacy.signed).sort((a, b) => b.apps - a.apps).slice(0, 6);
  const trusted = [...legacies].sort((a, b) => b.apps - a.apps).slice(0, 6);
  const lastClub = history[history.length - 1]?.club ?? null;
  const ended = career.ended;

  return (
    <div className="tec-legacy mx-auto max-w-6xl px-4 pt-6 pb-16">
      <div className="flex flex-wrap items-center gap-5">
        <div className="coach-portrait coach-portrait-lg">
          <Avatar config={avatar} kit={lastClub ? getClubKit(lastClub) : null} outfit="coach" className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-glory">{tt("legacy.eyebrow")}</p>
          <h1 className="display mt-1 text-4xl leading-none font-black uppercase sm:text-5xl">{tt("legacy.title", { name: career.setup.identity.name })}</h1>
          <p className="mt-2 text-sm text-muted">
            {ended?.partial ? tt("legacy.partial") : ended?.reason === "completed" ? tt("legacy.completed") : tt("legacy.retired", { count: seasons })}
          </p>
          <p className="mt-1 text-xs text-bad">{tt("legacy.notSaved")}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile label={tt("legacy.seasons")} value={number(seasons)} />
        <StatTile label={tt("legacy.clubs")} value={number(clubs.length)} />
        <StatTile label={tt("legacy.titles")} value={number(titles.length)} />
        <StatTile label={tt("legacy.promotions")} value={number(history.filter((entry) => entry.promoted).length)} />
        <StatTile label={tt("legacy.relegations")} value={number(history.filter((entry) => entry.relegated).length)} />
        <StatTile label={tt("legacy.dismissals")} value={number(history.filter((entry) => entry.dismissed).length)} />
        <StatTile label={tt("legacy.reputation")} value={number(Math.round(career.reputation))} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title={tt("legacy.trophyCase")}>
          {byTitle.size === 0 ? (
            <p className="text-sm text-muted">{tt("legacy.noTitles")}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {[...byTitle].map(([title, count]) => (
                <li key={title}>
                  <Chip tone="glory">
                    <Trophy size={12} aria-hidden="true" />
                    {competitionName(title, t.locale)}
                    {count > 1 ? ` ×${count}` : ""}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title={tt("legacy.players")}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [tt("legacy.trusted"), trusted],
              [tt("legacy.revealed"), revealed],
              [tt("legacy.signings"), signed],
            ].map(([label, list]) => (
              <div key={label as string}>
                <p className="eyebrow mb-1">{label as string}</p>
                <ul className="flex flex-col gap-0.5 text-sm">
                  {(list as typeof legacies).length === 0 ? <li className="text-muted">-</li> : null}
                  {(list as typeof legacies).map((legacy) => (
                    <li key={legacy.player} className="truncate">
                      {nameOf(legacy.player)}{" "}
                      <span className="numeric text-2xs text-muted">
                        · {ttp("legacy.games", legacy.apps)} · {tt("legacy.bestOvr", { ovr: legacy.bestOvr })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title={tt("legacy.timeline")} className="mt-5">
        <ol className="flex flex-col">
          {history.map((entry) => (
            <SeasonLine key={`${entry.year}:${entry.club}`} entry={entry} />
          ))}
        </ol>
        <p className="mt-2 text-2xs text-faint">{ttp("player.seasons", seasons)}</p>
      </Panel>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          onClick={() => {
            feedback("confirm");
            useTecnico.getState().abandon();
            go("tecnicoIdentity", { force: true });
          }}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {tt("legacy.newCareer")}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            feedback("back");
            go("hub");
          }}
        >
          <Home size={16} aria-hidden="true" />
          {tt("legacy.backHub")}
        </Button>
      </div>
    </div>
  );
}
