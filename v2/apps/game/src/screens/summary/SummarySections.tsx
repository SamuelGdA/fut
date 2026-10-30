import { HonourGroups } from "../../ui/HonourGroups";
import { d71 } from "../../i18n/d71";
import { REAL_RECORDS, recordText, type RecordResult } from "@craque/content";
import { type Career, nationalLegacy, isGoalkeeper, KEEPER_ATTRIBUTES, OUTFIELD_ATTRIBUTES } from "@craque/engine";
import { getClub, getCountry } from "@craque/world";
import { m } from "motion/react";
import { useReducedMotion } from "../../lib/useReducedMotion";
import {
  ovrCurve,
  peakCard,
  summaryNumbers,
  nearRecords,
  summaryRecords,
  timeline,
  type TimelineItem,
} from "../../features/summary/summaryData";
import { attributeText } from "../../i18n/attributes";
import { useT } from "../../i18n/useT";
import { Crest, Flag } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import { AttributeBar } from "../../ui/Stats";
import { OvrCurve } from "./Poster";

const MONEY_KEYS = new Set(["peakValue"]);

/**
 * Os números (GDD 24.3): os totais da carreira, os atributos no auge, a curva
 * do OVR e os recordes reais (GDD 26) igualados ou superados. Sem recorde
 * batido, a lista não aparece.
 */
export function NumbersSection({ career }: { career: Career }) {
  const { t, number, money } = useT();
  const numbers = summaryNumbers(career);
  const peak = peakCard(career);
  const curve = ovrCurve(career.history);
  const records = summaryRecords(career.history);
  const near = nearRecords(career.history);
  const keeper = isGoalkeeper(career.player.position);
  const keys = keeper ? KEEPER_ATTRIBUTES : OUTFIELD_ATTRIBUTES;

  return (
    <div className="flex flex-col gap-6">
      <dl className="summary-numbers">
        {numbers.map((item) => (
          <div key={item.key}>
            <dt>{t(`summary.numbers.${item.key}`)}</dt>
            <dd className="numeric">{MONEY_KEYS.has(item.key) ? money(item.value) : number(item.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 md:grid-cols-2">
        {peak ? (
          <section>
            <h3 className="eyebrow mb-3">{t("summary.peakAttributes", { year: peak.year })}</h3>
            <div className="flex flex-col gap-2">
              {keys.map((key, slot) => (
                <AttributeBar
                  key={key}
                  abbr={attributeText(t, peak.position, slot, "abbr")}
                  name={attributeText(t, peak.position, slot, "name")}
                  value={Math.round(peak.attributes[slot] ?? 0)}
                />
              ))}
            </div>
          </section>
        ) : null}
        {curve.length >= 2 && peak ? (
          <section>
            <h3 className="eyebrow mb-3">{t("summary.poster.curve")}</h3>
            <div className="summary-curve">
              <OvrCurve points={curve.map((point) => point.ovr)} peak={peak.ovrEnd} width={480} height={150} />
              <p className="mt-2 flex justify-between text-xs text-muted">
                <span className="numeric">{curve[0]?.year}</span>
                <span>{t("summary.poster.peak", { ovr: peak.ovrEnd, age: peak.age })}</span>
                <span className="numeric">{curve[curve.length - 1]?.year}</span>
              </p>
            </div>
          </section>
        ) : null}
      </div>

      {records.length > 0 || near.length > 0 ? <RecordsList records={[...records, ...near]} reached={records.length} /> : null}
    </div>
  );
}

const RECORD_TONE = { beaten: "glory", matched: "good", short: "neutral" } as const;

/**
 * Os recordes igualados ou superados e, depois, os que ficaram perto (D94):
 * "faltaram 2" vale mais que a lista vazia para fazer jogar de novo. Cada um
 * mostra a faixa de raridade.
 */
function RecordsList({ records, reached }: { records: readonly RecordResult[]; reached: number }) {
  const { t, number, locale } = useT();
  return (
    <section>
      <h3 className="eyebrow mb-3 flex flex-wrap items-baseline justify-between gap-2">{t("summary.records.title")}<span className="numeric normal-case tracking-normal text-muted">{t("summary.records.collection", { count: reached, total: REAL_RECORDS.length })}</span></h3>
      <ul className="summary-records">
        {records.map((result) => {
          const text = recordText(locale, result.record);
          const ratio = Math.min(1, result.value / result.record.value);
          return (
            <li key={result.record.id} data-tier={result.record.tier} data-status={result.status}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{text.name}</p>
                  <p className="text-xs text-muted">
                    {t("summary.records.holder", { holder: text.holder, value: number(result.record.value) })} · {text.detail}
                    {text.checked ? ` · ${text.checked}` : ""}
                  </p>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Chip tone={RECORD_TONE[result.status]} glyph={result.status !== "short"} variant={result.status === "beaten" ? "solid" : "soft"}>
                    {result.status === "short" ? t("summary.records.near", { missing: number(result.record.value - result.value) }) : t(`summary.records.status.${result.status}`)}
                  </Chip>
                  <span className="record-tier" data-tier={result.record.tier}>{t(`summary.records.tiers.${result.record.tier}`)}</span>
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="meter-track flex-1" aria-hidden="true">
                  <div className="meter-fill" data-tone={result.status === "short" ? "neutral" : "good"} style={{ transform: `scaleX(${ratio})` }} />
                </div>
                <span className="numeric text-sm font-bold">
                  {t("summary.records.yours", { value: number(result.value) })}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const LEGACY_TONE = { none: "neutral", respected: "info", idol: "good", legend: "glory" } as const;

/**
 * A linha do tempo (GDD 24.4): passagens por clube e a estreia na seleção,
 * por idade. Marcador vermelho para traidor, dourado para lenda, verde para
 * ídolo. As entradas descem em cascata quando chegam na tela; com movimento
 * reduzido, aparecem prontas (MotionConfig na raiz).
 */
export function TimelineSection({ career }: { career: Career }) {
  const { t, c, locale } = useT();
  const items = timeline(career);
  const reduced = useReducedMotion();
  return (
    <ol className="timeline">
      {items.map((item, index) => (
        <m.li
          layout={reduced ? false : "position"}
          key={item.kind === "stint" ? `${item.stint.club}-${item.stint.fromAge}` : `debut-${item.age}`}
          className="timeline-item"
          data-marker={markerOf(item)}
          initial={reduced ? false : { opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : Math.min(index, 6) * 0.05 }}
        >
          {item.kind === "stint" ? (
            <div className="timeline-card">
              <Crest club={item.stint.club} size={40} decorative />
              <div className="min-w-0 flex-1">
                <p className="display truncate text-xl font-extrabold uppercase">{getClub(item.stint.club)?.name ?? item.stint.club}</p>
                <p className="numeric text-xs text-muted">
                  {item.stint.fromYear === item.stint.toYear ? item.stint.fromYear : t("summary.years", { from: item.stint.fromYear, to: item.stint.toYear })}
                  {" · "}
                  {item.stint.fromAge === item.stint.toAge
                    ? t("summary.timeline.age", { age: item.stint.fromAge })
                    : t("summary.timeline.ages", { from: item.stint.fromAge, to: item.stint.toAge })}
                  {item.stint.loan ? ` · ${t("career.history.loan")}` : ""}
                </p>
                <StintNumbers career={career} stint={item.stint} />
                {item.legacy !== "none" || item.traitor ? (
                  <p className="mt-1.5 flex flex-wrap gap-1">
                    {item.legacy !== "none" ? (
                      <Chip tone={LEGACY_TONE[item.legacy]} glyph size="sm">
                        {t("career.player.legacy", { level: c(`legacy.${item.legacy}`) })}
                      </Chip>
                    ) : null}
                    {item.traitor ? (
                      <Chip tone="bad" glyph variant="solid" size="sm">
                        {t("reveal.traitor")}
                      </Chip>
                    ) : null}
                  </p>
                ) : null}
                {item.honours.length > 0 ? (
                  <p className="timeline-honours">
                    <HonourGroups language={locale} items={item.honours.map(honour => ({id:honour.kind === "award" ? honour.competition ?? honour.id : honour.id, award:honour.kind === "award" ? honour.id : undefined, year:honour.year}))} />
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <DebutCard career={career} age={item.age} year={item.year} />
          )}
        </m.li>
      ))}
    </ol>
  );
}

/**
 * Os números do jogador em cada clube (D96), como os da seleção: jogos, gols e
 * assistências; jogos sem sofrer gol entram se ele jogou no gol ou na defesa
 * nessa passagem, e o goleiro puro mostra só jogos e jogos sem sofrer gol.
 */
function StintNumbers({ career, stint }: { career: Career; stint: Extract<TimelineItem, { kind: "stint" }>["stint"] }) {
  const seasons = career.history.filter((record) => record.club === stint.club && record.year >= stint.fromYear && record.year <= stint.toYear);
  if (!seasons.length) return null;
  const sum = (pick: (record: (typeof seasons)[number]) => number) => seasons.reduce((total, record) => total + pick(record), 0);
  const keeperOnly = seasons.every((record) => record.position === "gk");
  const backLine = seasons.some((record) => ["gk", "cb", "lb", "rb"].includes(record.position));
  return <NumbersLine keeperOnly={keeperOnly} backLine={backLine} games={sum((record) => record.games)} goals={sum((record) => record.production.goals)} assists={sum((record) => record.production.assists)} cleanSheets={sum((record) => record.production.cleanSheets)} />;
}

/** Jogos · gols · assistências (e jogos sem sofrer gol para quem jogou atrás): a mesma linha para clube e seleção. */
function NumbersLine({ keeperOnly, backLine, games, goals, assists, cleanSheets, className = "mt-1" }: { keeperOnly: boolean; backLine: boolean; games: number; goals: number; assists: number; cleanSheets: number; className?: string }) {
  const { t, number } = useT();
  const parts = [`${number(games)} ${t("summary.numbers.games")}`];
  if (!keeperOnly) parts.push(`${number(goals)} ${t("summary.numbers.goals")}`, `${number(assists)} ${t("summary.numbers.assists")}`);
  if (backLine) parts.push(`${number(cleanSheets)} ${t("summary.numbers.cleanSheets")}`);
  return <p className={`numeric text-xs font-semibold text-muted ${className}`}>{parts.join(" · ")}</p>;
}

function markerOf(item: TimelineItem): "traitor" | "legend" | "idol" | "debut" | "plain" {
  if (item.kind === "debut") return "debut";
  if (item.traitor) return "traitor";
  if (item.legacy === "legend") return "legend";
  if (item.legacy === "idol") return "idol";
  return "plain";
}

function DebutCard({ career, age, year }: { career: Career; age: number; year: number }) {
  const { t, c, locale } = useT();
  const country = getCountry(career.nationality);
  const legacy = nationalLegacy(career.history, career.nationality, country?.strength ?? 75);
  const seasons = career.history.filter((record) => record.nationality === career.nationality && record.national.games > 0);
  return (
    <div className="timeline-card">
      {country ? <Flag country={country} size={40} language={locale} decorative /> : null}
      <div className="min-w-0 flex-1">
        <p className="display text-xl font-extrabold uppercase">{t("summary.timeline.debut")}</p>
        <p className="text-xs text-muted">{t("summary.timeline.debutAt", { age, year })}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2"><Chip tone={LEGACY_TONE[legacy.level]} size="sm">{d71(locale,"nationalLegacy")}: {legacy.level === "none" ? d71(locale,"common") : c(`legacy.${legacy.level}`)}</Chip></div>
        {/* D106: quando os números davam lenda, mas faltou o título que o país cobra, a tela diz por quê. */}
        {legacy.capped ? <p className="mt-1.5 text-xs text-muted">{d71(locale, legacy.tradition === "worldCup" ? "capWorldCup" : "capContinental")}</p> : null}
        <NumbersLine className="mt-1.5" keeperOnly={seasons.every((record) => record.position === "gk")} backLine={seasons.some((record) => ["gk", "cb", "lb", "rb"].includes(record.position))} games={legacy.games} goals={legacy.goals} assists={legacy.assists} cleanSheets={legacy.cleanSheets} />
      </div>
    </div>
  );
}
