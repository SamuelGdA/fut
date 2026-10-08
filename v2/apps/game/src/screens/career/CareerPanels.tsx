import { type AvatarConfig } from "@craque/art";
import { competitionName } from "@craque/content";
import {
  bondLegacy,
  type Career,
  careerTotals,
  isGoalkeeper,
  leagueEntry,
  type LegacyLevel,
  movementOf,
  playedTournaments,
  pressureTone,
} from "@craque/engine";
import { AWARDS, getClub, getCompetition, getCountry } from "@craque/world";
import { History } from "lucide-react";
import { currentFans, currentOvr, currentAttributes, currentValue, lastRecord } from "../../features/career/view";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { AnimatedNumber } from "../../ui/AnimatedNumber";
import { Button } from "../../ui/Button";
import { AwardArt, Crest, Flag, TrophyArt } from "../../ui/Media";
import { PlayerCard } from "../../ui/PlayerCard";
import { Chip, Delta } from "../../ui/Signals";
import { Meter } from "../../ui/Stats";
import type { Tone } from "../../ui/tone";
import { Showcase } from "../summary/Showcase";

const FAN_TONE: Readonly<Record<string, Tone>> = {
  unknown: "neutral",
  hostile: "bad",
  cold: "bad",
  warm: "neutral",
  loved: "good",
  idolized: "glory",
};

const LEGACY_TONE: Readonly<Record<LegacyLevel, Tone>> = { none: "neutral", respected: "info", idol: "good", legend: "glory" };

/** A carta do jogador agora, com o clube e o número desta temporada. Os números contam quando mudam. */
export function CurrentCard({ career, avatar, width = 260 }: { career: Career; avatar: AvatarConfig | null; width?: number | string }) {
  const last = lastRecord(career);
  const club = career.contract?.club ?? last?.club ?? null;
  return (
    <PlayerCard
      surname={career.setup.identity.surname}
      position={career.player.position}
      ovr={currentOvr(career)}
      attributes={currentAttributes(career)}
      nationality={career.nationality}
      club={club}
      league={last && last.club === club ? last.league : null}
      shirt={career.contract?.shirt ?? last?.shirt ?? null}
      avatar={avatar}
      width={width}
      animate
    />
  );
}

/**
 * O painel do jogador (a leitura de status do laço): carta, totais, contrato
 * com a torcida e o legado no clube, e a seleção. Cabe inteiro na tela; a
 * carta mede a altura que sobra. Depois de cada lance, os números contam até
 * os valores novos (D43).
 */
export function PlayerPanel({ career, avatar }: { career: Career; avatar: AvatarConfig | null }) {
  const { t, c, number, money, locale } = useT();
  const totals = careerTotals(career.history);
  const keeper = isGoalkeeper(career.player.position);
  const fans = currentFans(career);
  const contract = career.contract;
  const country = getCountry(career.nationality);
  const last = lastRecord(career);
  const pressure = contract ? pressureTone(contract.pressure) : null;
  const legacy = contract ? bondLegacy(career, contract.club) : "none";

  const stats = [
    { key: "games", label: t("career.header.games"), value: totals.games, format: number },
    keeper
      ? { key: "cleanSheets", label: t("career.header.cleanSheets"), value: totals.cleanSheets, format: number }
      : { key: "goals", label: t("career.header.goals"), value: totals.goals, format: number },
    { key: "titles", label: t("career.header.titles"), value: totals.titles, format: number },
    { key: "value", label: t("career.header.value"), value: currentValue(career), format: money },
  ];

  return (
    <div className="player-panel flex min-h-0 flex-col gap-3">
      <div className="player-top">
        <CurrentCard career={career} avatar={avatar} width="var(--card-fit)" />
        <dl className="player-stats">
          {stats.map((stat) => (
            <div key={stat.key}>
              <dt className="eyebrow truncate text-[10px]">{stat.label}</dt>
              <dd className="display numeric truncate text-[clamp(1.05rem,4.8vw,1.25rem)] whitespace-nowrap font-extrabold">
                <AnimatedNumber value={stat.value} format={stat.format} showDelta={stat.key !== "value"} />
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {contract && fans && pressure ? (
        <div className="player-box">
          <Meter label={t("career.player.fans")} value={fans.value} band={c(`fans.${fans.band}`)} tone={FAN_TONE[fans.band] ?? "neutral"} segments showValue />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {/* O legado no clube (GDD 17.4): a Lenda do clube, que nada tem a ver com o OVR. */}
            {legacy !== "none" ? (
              <Chip tone={LEGACY_TONE[legacy]} glyph>
                {t("career.player.legacy", { level: c(`legacy.${legacy}`) })}
              </Chip>
            ) : null}
            <Chip tone="neutral" variant="outline">
              {c(`missions.${contract.mission}.name`)}
            </Chip>
            <Chip tone={pressure === "high" ? "bad" : pressure === "low" ? "good" : "neutral"} glyph={pressure !== "neutral"}>
              {c(`pressure.${pressure}`)}
            </Chip>
            <Chip tone="club">{t("career.player.shirt", { number: contract.shirt })}</Chip>
            {contract.loan ? (
              <Chip tone="info">{t("career.player.loanFrom", { club: getClub(contract.loan.owner)?.name ?? contract.loan.owner })}</Chip>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="player-box text-sm text-muted">{t("career.player.noContract")}</div>
      )}

      <div className="player-box flex items-center gap-3">
        {country ? <Flag country={country} size={30} language={locale} decorative /> : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{country?.names[locale] ?? career.nationality}</p>
          <p className="truncate text-xs text-muted">{last ? c(`national.${last.national.status}`) : c("national.out")}</p>
        </div>
        <p className="shrink-0 text-right text-xs text-muted">
          {totals.nationalGames > 0
            ? keeper
              ? t("career.player.capsShort", { games: number(totals.nationalGames) })
              : t("career.player.capsGoalsShort", { games: number(totals.nationalGames), goals: number(totals.nationalGoals) })
            : t("career.nation.uncapped")}
        </p>
      </div>
    </div>
  );
}

/**
 * O histórico, da mais recente para a mais antiga. Tocar revê a temporada no
 * lugar do lance. Acesso e queda em selo; títulos e prêmios em miniaturas,
 * lado a lado (D43).
 */
export function HistoryPanel({ career, onReplay }: { career: Career; onReplay(index: number): void }) {
  const { t, c, cp, locale, ordinal } = useT();
  if (career.history.length === 0) {
    return <p className="text-sm text-muted">{t("career.history.empty")}</p>;
  }
  const rows = career.history.map((record, index) => ({ record, index })).reverse();
  return (
    <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-md border border-line bg-panel">
      {rows.map(({ record, index }) => {
        const keeper = isGoalkeeper(record.position);
        const entry = leagueEntry(record);
        const movement = movementOf(record);
        const awards = record.awards.won.filter((key) => key !== "topScorer" && key !== "bestPlayer");
        const honours = record.titles.length + awards.length;
        return (
          <li key={record.year}>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-panel-2"
              onClick={() => {
                feedback("select");
                onReplay(index);
              }}
            >
              <span className="flex w-12 shrink-0 flex-col">
                <span className="display numeric text-xl leading-none font-extrabold">{record.year}</span>
                <span className="numeric text-2xs text-faint">{record.age}</span>
              </span>
              <Crest club={record.club} size={28} decorative />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">
                  {getClub(record.club)?.name ?? record.club}
                  {record.loan ? <span className="text-faint"> · {t("career.history.loan")}</span> : null}
                </span>
                <span className="text-xs leading-snug text-muted">
                  {c(`roles.${record.role}`)} · {cp("stats.gamesCount", record.games)} ·{" "}
                  {keeper
                    ? cp("stats.cleanSheetsCount", record.production.cleanSheets)
                    : cp("stats.goalsCount", record.production.goals)}
                  {entry?.position ? ` · ${ordinal(entry.position)}` : ""}
                </span>
                {entry?.champion || movement !== null ? (
                  <span className="flex flex-wrap gap-1">
                    {entry?.champion ? (
                      <Chip tone="glory" glyph variant="solid" size="sm">
                        {t("reveal.champion")}
                      </Chip>
                    ) : null}
                    {movement === "promoted" ? (
                      <Chip tone="good" glyph variant="solid" size="sm">
                        {t("reveal.promoted")}
                      </Chip>
                    ) : null}
                    {movement === "relegated" ? (
                      <Chip tone="bad" glyph variant="solid" size="sm">
                        {t("reveal.relegated")}
                      </Chip>
                    ) : null}
                  </span>
                ) : null}
                {honours > 0 ? (
                  <span className="history-honours" title={[...record.titles.map((id) => competitionName(id, locale)), ...awards.map((key) => AWARDS[key].names[locale])].join(", ")}>
                    {record.titles.map((id) => {
                      const competition = getCompetition(id);
                      return competition ? <TrophyArt key={id} competition={competition} size={24} language={locale} /> : null;
                    })}
                    {awards.map((key) => (
                      <AwardArt key={key} award={AWARDS[key]} size={24} language={locale} />
                    ))}
                  </span>
                ) : null}
              </span>
              <span className="flex flex-col items-end">
                <span className="display numeric text-xl leading-none font-extrabold">{record.ovrEnd}</span>
                <Delta value={record.ovrEnd - record.ovrStart} className="text-2xs" />
              </span>
              <History size={14} aria-hidden="true" className="shrink-0 text-faint" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** A estante da carreira em andamento: a mesma vitrine do resumo (GDD 24.5). */
export function TrophiesPanel({ career }: { career: Career }) {
  return <Showcase history={career.history} />;
}

/** A seleção: situação, jogos, gols, estreia e torneios. */
export function NationPanel({ career }: { career: Career }) {
  const { t, c, number, locale } = useT();
  const country = getCountry(career.nationality);
  const last = lastRecord(career);
  const games = career.history.reduce((total, record) => total + record.national.games, 0);
  const goals = career.history.reduce((total, record) => total + record.national.goals, 0);
  // Só os torneios que ele disputou (no grupo do torneio e com jogos), não a campanha da seleção sem ele.
  const tournaments = career.history.flatMap((record) => playedTournaments(record).map((entry) => ({ year: record.year, entry })));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {country ? <Flag country={country} size={44} language={locale} decorative /> : null}
        <div className="min-w-0">
          <p className="display truncate text-3xl leading-none font-extrabold uppercase">{country?.names[locale] ?? career.nationality}</p>
          <p className="mt-1 text-xs text-muted">{last ? c(`national.${last.national.status}`) : c("national.out")}</p>
        </div>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line rounded-sm border border-line bg-panel">
        <div className="flex flex-col-reverse items-center gap-1 py-3">
          <dt className="eyebrow">{t("career.nation.caps")}</dt>
          <dd className="display numeric text-3xl font-black">{number(games)}</dd>
        </div>
        <div className="flex flex-col-reverse items-center gap-1 py-3">
          <dt className="eyebrow">{t("career.nation.goals")}</dt>
          <dd className="display numeric text-3xl font-black">{number(goals)}</dd>
        </div>
        <div className="flex flex-col-reverse items-center gap-1 px-1 py-3 text-center">
          <dt className="eyebrow">{t("career.nation.debut")}</dt>
          <dd className="text-sm font-semibold">
            {career.firstCapAge !== null ? t("career.nation.debutAt", { age: career.firstCapAge }) : t("career.nation.uncapped")}
          </dd>
        </div>
      </dl>
      <section>
        <h3 className="eyebrow mb-2">{t("career.nation.tournaments")}</h3>
        {tournaments.length === 0 ? (
          <p className="text-sm text-muted">{t("career.nation.noTournaments")}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line rounded-sm border border-line bg-panel">
            {tournaments
              .slice()
              .reverse()
              .map(({ year, entry }) => (
                <li key={`${year}-${entry.competition}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                  <span className="min-w-0 truncate font-semibold">
                    {competitionName(entry.competition, locale)} {year}
                  </span>
                  <Chip tone={entry.champion ? "glory" : "neutral"} glyph={entry.champion}>
                    {t(`career.nation.stage.${entry.champion ? "champion" : (entry.stage ?? "groups")}`)}
                  </Chip>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Intervalo de fim de carreira (GDD 23). */
export function EndPanel({ career, onSummary }: { career: Career; onSummary(): void }) {
  const { t, c } = useT();
  if (!career.end) return null;
  return (
    <section className="end-panel rounded-md border border-line border-t-4 border-t-glory bg-panel p-5" aria-live="polite">
      <p className="eyebrow text-glory">{t("career.ended.eyebrow")}</p>
      <h2 className="display mt-2 text-4xl font-black uppercase">{t("career.ended.title")}</h2>
      <p className="mt-2 text-muted">{c(`end.${career.end.reason}`)}</p>
      <Button className="mt-5" size="lg" onClick={onSummary}>
        {t("career.ended.summary")}
      </Button>
    </section>
  );
}
