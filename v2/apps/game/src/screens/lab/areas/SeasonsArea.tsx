import {
  createWorld,
  type KnockoutResult,
  type MatchResult,
  type SeasonResults,
  simulateWorldSeason,
} from "@craque/engine";
import {
  type CountryCode,
  type Division,
  getClub,
  getCompetition,
  getCountry,
  type Language,
  leagueAt,
  leaguesOf,
} from "@craque/world";
import { Dices } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Translator, useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { StepSlider } from "../../../ui/Fields";
import { Crest, Flag, LeagueBadge } from "../../../ui/Media";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Chip } from "../../../ui/Signals";
import { CountryPicker } from "../CountryPicker";

/**
 * O mundo do M3 rodando sozinho. As 25 temporadas são simuladas de uma vez
 * para cada semente (cerca de 25 ms) e o ano só escolhe qual delas mostrar.
 */

const FIRST_YEAR = 2026;
const SEASONS = 25;

function simulateHistory(seed: string): SeasonResults[] {
  let world = createWorld(seed, FIRST_YEAR);
  const history: SeasonResults[] = [];
  for (let season = 0; season < SEASONS; season += 1) {
    const step = simulateWorldSeason(world, seed);
    history.push(step.results);
    world = step.next;
  }
  return history;
}

function competitionName(id: string, language: Language): string {
  return getCompetition(id)?.names[language] ?? id;
}

/** Um participante de torneio de clubes: clube dos dados ou campeão genérico. */
function Entrant({ id, t, size = 18 }: { id: string; t: Translator["t"]; size?: number }) {
  if (id.startsWith("generic:")) {
    const confederation = id.slice(8) as "AFC" | "CAF" | "OFC";
    return <span className="truncate text-muted">{t(`lab.seasons.generic.${confederation}`)}</span>;
  }
  const club = getClub(id);
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Crest club={id} size={size} decorative />
      <span className="truncate">{club?.short ?? id}</span>
    </span>
  );
}

function Nation({ code, language, size = 20 }: { code: string; language: Language; size?: number }) {
  const country = getCountry(code);
  if (!country) return <span>{code}</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Flag country={country} size={size} language={language} decorative />
      <span className="truncate">{country.names[language]}</span>
    </span>
  );
}

function Podium({ result, render, t }: { result: KnockoutResult; render(id: string): ReactNode; t: Translator["t"] }) {
  const [champion, runnerUp, ...rest] = result.order;
  const semis = rest.slice(0, 2);
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 text-sm">
      <dt className="eyebrow text-glory">{t("lab.seasons.champion")}</dt>
      <dd className="min-w-0 font-semibold text-fg">{champion ? render(champion) : "-"}</dd>
      <dt className="eyebrow">{t("lab.seasons.runnerUp")}</dt>
      <dd className="min-w-0">{runnerUp ? render(runnerUp) : "-"}</dd>
      {semis.length > 0 ? (
        <>
          <dt className="eyebrow">{t("lab.seasons.semifinals")}</dt>
          <dd className="flex min-w-0 flex-col gap-1">
            {semis.map((id) => (
              <span key={id} className="min-w-0">
                {render(id)}
              </span>
            ))}
          </dd>
        </>
      ) : null}
    </dl>
  );
}

function Match({ match, t }: { match: MatchResult; t: Translator["t"] }) {
  const loser = match.winner === match.home ? match.away : match.home;
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="font-semibold text-fg">
        <Entrant id={match.winner} t={t} />
      </span>
      <span className="text-faint">×</span>
      <span className="text-muted">
        <Entrant id={loser} t={t} />
      </span>
    </p>
  );
}

function LeagueTable({ season, country, division }: { season: SeasonResults; country: CountryCode; division: Division }) {
  const { t } = useT();
  const league = leagueAt(country, division);
  const table = league ? season.leagues[league.id] : undefined;
  if (!league || !table) return null;
  const promoted = new Set(season.promoted[country] ?? []);
  const relegated = new Set(season.relegated[country] ?? []);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <LeagueBadge league={league} size={32} decorative />
        <h4 className="display text-2xl font-extrabold uppercase">{league.name}</h4>
      </div>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{league.name}</caption>
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="w-8 pb-2 font-normal">
              <span aria-hidden="true" className="eyebrow">
                #
              </span>
              <span className="sr-only">{t("lab.seasons.position")}</span>
            </th>
            <th scope="col" className="pb-2 font-normal">
              <span className="eyebrow">{t("lab.seasons.club")}</span>
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              <span className="eyebrow">{t("lab.seasons.points")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => {
            const up = division === 2 && promoted.has(row.club);
            const down = division === 1 && relegated.has(row.club);
            return (
              <tr key={row.club} className="border-b border-line">
                <td className="numeric py-1.5 text-xs text-faint">{row.position}</td>
                <td className="w-full max-w-0 py-1.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <Entrant id={row.club} t={t} />
                    {row.position === 1 ? (
                      <span data-tone="glory" className="text-tone text-xs" aria-label={t("lab.seasons.champion")}>
                        ★
                      </span>
                    ) : null}
                    {up ? (
                      <span data-tone="good" className="text-tone text-xs whitespace-nowrap">
                        ▲ <span className="sr-only sm:not-sr-only">{t("lab.seasons.promoted")}</span>
                      </span>
                    ) : null}
                    {down ? (
                      <span data-tone="bad" className="text-tone text-xs whitespace-nowrap">
                        ▼ <span className="sr-only sm:not-sr-only">{t("lab.seasons.relegated")}</span>
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="numeric py-1.5 text-right font-bold text-fg">{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Campeões de cada ano: liga, copa e a primária da confederação do país. */
function History({ history, country }: { history: readonly SeasonResults[]; country: CountryCode }) {
  const { t } = useT();
  const league = leagueAt(country, 1);
  const confederation = getCountry(country)?.confederation ?? "UEFA";
  return (
    <section aria-labelledby="temporadas-historia" className="flex flex-col gap-4">
      <SectionRule as="h3">
        <span id="temporadas-historia">{t("lab.seasons.history")}</span>
      </SectionRule>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="w-14 pb-2 font-normal">
              <span className="eyebrow">{t("lab.seasons.year")}</span>
            </th>
            <th scope="col" className="pb-2 font-normal">
              <span className="eyebrow block truncate">{t("lab.seasons.historyLeague")}</span>
            </th>
            <th scope="col" className="pb-2 font-normal">
              <span className="eyebrow block truncate">{t("lab.seasons.historyCup")}</span>
            </th>
            <th scope="col" className="pb-2 font-normal">
              <span className="eyebrow block truncate">{t("lab.seasons.historyContinental")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((season) => {
            const champion = league ? season.leagues[league.id]?.rows[0]?.club : undefined;
            const cup = season.cups[`cup:${country}`]?.order[0];
            const continental = season.continental[`cont1:${confederation}`]?.order[0];
            return (
              <tr key={season.year} className="border-b border-line">
                <td className="numeric py-1.5 text-xs text-faint">{season.year}</td>
                <td className="py-1.5 pr-2">{champion ? <Entrant id={champion} t={t} size={16} /> : "-"}</td>
                <td className="py-1.5 pr-2">{cup ? <Entrant id={cup} t={t} size={16} /> : "-"}</td>
                <td className="py-1.5">{continental ? <Entrant id={continental} t={t} size={16} /> : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export function SeasonsArea() {
  const { t, locale } = useT();
  const [draw, setDraw] = useState(1);
  const [year, setYear] = useState(FIRST_YEAR);
  const [country, setCountry] = useState<CountryCode>("BRA");
  const [division, setDivision] = useState<Division>(1);

  const seed = `lab-mundo:${draw}`;
  const history = simulateHistory(seed);
  const season = history[year - FIRST_YEAR] ?? history[0];
  if (!season) return null;

  const hasSecond = leaguesOf(country).some((league) => league.division === 2);
  const shownDivision: Division = hasSecond ? division : 1;
  const confederation = getCountry(country)?.confederation ?? "UEFA";
  const render = (id: string) => <Entrant id={id} t={t} />;
  const continental = Object.values(season.continental).filter((result) =>
    result.competition.endsWith(`:${confederation}`),
  );
  const otherContinental = Object.values(season.continental).filter(
    (result) => !result.competition.endsWith(`:${confederation}`) && result.competition.startsWith("cont1:"),
  );
  const superCups = Object.values(season.superCups).filter(
    (match) => match.competition === `super:${country}` || match.competition === `contsuper:${confederation}`,
  );
  const nations = Object.values(season.nations).sort((a, b) => (a.competition === "worldcup" ? -1 : b.competition === "worldcup" ? 1 : 0));

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-base text-muted">{t("lab.seasons.intro")}</p>

      <div className="lab-toolbar">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="eyebrow">{t("lab.seasons.yearValue", { year })}</span>
          <StepSlider
            value={year}
            min={FIRST_YEAR}
            max={FIRST_YEAR + SEASONS - 1}
            label={t("lab.seasons.year")}
            valueText={t("lab.seasons.yearValue", { year })}
            onValueChange={setYear}
          />
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setDraw((current) => current + 1);
            feedback("select");
          }}
        >
          <Dices size={16} aria-hidden="true" />
          {t("lab.seasons.another")}
        </Button>
      </div>

      <section aria-labelledby="temporadas-tabelas" className="flex flex-col gap-5">
        <SectionRule as="h2" aside={<Chip variant="outline">{t("lab.seasons.seed")}: {seed}</Chip>}>
          <span id="temporadas-tabelas">{t("lab.seasons.tables")}</span>
        </SectionRule>
        <CountryPicker value={country} onValueChange={setCountry} />
        {hasSecond ? (
          <Segmented<"1" | "2">
            value={shownDivision === 1 ? "1" : "2"}
            onValueChange={(next) => setDivision(next === "1" ? 1 : 2)}
            label={t("lab.seasons.tables")}
            size="sm"
            className="self-start"
            options={[
              { value: "1", label: t("lab.world.division1") },
              { value: "2", label: t("lab.world.division2") },
            ]}
          />
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
          <LeagueTable season={season} country={country} division={shownDivision} />
          <div className="flex flex-col gap-4">
            <Panel title={t("lab.seasons.cups")}>
              <div className="flex flex-col gap-5">
                {Object.values(season.cups)
                  .filter((cup) => getCompetition(cup.competition)?.country === country)
                  .map((cup) => (
                    <div key={cup.competition} className="flex flex-col gap-2">
                      <p className="text-sm font-semibold">{competitionName(cup.competition, locale)}</p>
                      <Podium result={cup} render={render} t={t} />
                    </div>
                  ))}
                {superCups.map((match) => (
                  <div key={match.competition} className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">{competitionName(match.competition, locale)}</p>
                    <Match match={match} t={t} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section aria-labelledby="temporadas-continentais" className="flex flex-col gap-5">
        <SectionRule as="h2">
          <span id="temporadas-continentais">{t("lab.seasons.continental")}</span>
        </SectionRule>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...continental, ...otherContinental].map((result) => (
            <li key={result.competition}>
              <Panel
                title={competitionName(result.competition, locale)}
                aside={<span className="numeric text-xs text-faint">{t("lab.seasons.participants", { count: result.order.length })}</span>}
              >
                <Podium result={result} render={render} t={t} />
              </Panel>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="temporadas-mundiais" className="flex flex-col gap-5">
        <SectionRule as="h2">
          <span id="temporadas-mundiais">{t("lab.seasons.worlds")}</span>
        </SectionRule>
        <div className="grid gap-3 sm:grid-cols-2">
          {season.intercontinental ? (
            <Panel title={competitionName("intercontinental", locale)}>
              <Match match={season.intercontinental.final} t={t} />
              <p className="mt-3 text-xs text-muted">
                {t("lab.seasons.intercontinentalPath", {
                  path: season.intercontinental.bracket
                    .map((id) =>
                      id.startsWith("generic:")
                        ? t(`lab.seasons.generic.${id.slice(8) as "AFC" | "CAF" | "OFC"}`)
                        : (getClub(id)?.short ?? id),
                    )
                    .join(", "),
                })}
              </p>
            </Panel>
          ) : null}
          <Panel title={competitionName("clubworldcup", locale)}>
            {season.clubWorldCup ? (
              <Podium result={season.clubWorldCup} render={render} t={t} />
            ) : (
              <p className="text-sm text-muted">{t("lab.seasons.noClubWorldCup")}</p>
            )}
          </Panel>
        </div>
      </section>

      <section aria-labelledby="temporadas-selecoes" className="flex flex-col gap-5">
        <SectionRule as="h2">
          <span id="temporadas-selecoes">{t("lab.seasons.nations")}</span>
        </SectionRule>
        {nations.length === 0 ? (
          <p className="text-sm text-muted">{t("lab.seasons.noNations", { year })}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nations.map((result) => (
              <li key={result.competition}>
                <Panel
                  title={competitionName(result.competition, locale)}
                  aside={<span className="numeric text-xs text-faint">{t("lab.seasons.participants", { count: result.order.length })}</span>}
                >
                  <Podium result={result} render={(code) => <Nation code={code} language={locale} />} t={t} />
                </Panel>
              </li>
            ))}
          </ul>
        )}
      </section>

      <History history={history} country={country} />
    </div>
  );
}
