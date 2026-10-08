import { biography, recordText, type RecordResult } from "@craque/content";
import { type Career, isGoalkeeper, KEEPER_ATTRIBUTES, OUTFIELD_ATTRIBUTES } from "@craque/engine";
import { AWARDS, getClub, getCompetition, getCountry } from "@craque/world";
import { m } from "motion/react";
import {
  ovrCurve,
  peakCard,
  summaryNumbers,
  summaryRecords,
  TIMELINE_HONOURS,
  timeline,
  type TimelineItem,
} from "../../features/summary/summaryData";
import { attributeText } from "../../i18n/attributes";
import { useT } from "../../i18n/useT";
import { AwardArt, Crest, Flag, TrophyArt } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import { AttributeBar } from "../../ui/Stats";
import { OvrCurve } from "./Poster";

/** A biografia (GDD 25): cinco capítulos, cada um um parágrafo. */
export function BiographySection({ career }: { career: Career }) {
  const { locale } = useT();
  const bio = biography(locale, career);
  return (
    <div className="bio">
      {bio.chapters.map((chapter) => (
        <section key={chapter.id} className="bio-chapter">
          <h3 className="bio-title">{chapter.title}</h3>
          <p className="bio-text">{chapter.lines.join(" ")}</p>
        </section>
      ))}
    </div>
  );
}

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

      {records.length > 0 ? <RecordsList records={records} /> : null}
    </div>
  );
}

const RECORD_TONE = { beaten: "glory", matched: "good", short: "neutral" } as const;

function RecordsList({ records }: { records: readonly RecordResult[] }) {
  const { t, number, locale } = useT();
  return (
    <section>
      <h3 className="eyebrow mb-3">{t("summary.records.title")}</h3>
      <ul className="summary-records">
        {records.map((result) => {
          const text = recordText(locale, result.record);
          const ratio = Math.min(1, result.value / result.record.value);
          return (
            <li key={result.record.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{text.name}</p>
                  <p className="text-xs text-muted">
                    {t("summary.records.holder", { holder: text.holder, value: number(result.record.value) })} · {text.detail}
                    {text.checked ? ` · ${text.checked}` : ""}
                  </p>
                </div>
                <Chip tone={RECORD_TONE[result.status]} glyph={result.status !== "short"} variant={result.status === "beaten" ? "solid" : "soft"}>
                  {t(`summary.records.status.${result.status}`)}
                </Chip>
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
  return (
    <ol className="timeline">
      {items.map((item, index) => (
        <m.li
          key={item.kind === "stint" ? `${item.stint.club}-${item.stint.fromAge}` : `debut-${item.age}`}
          className="timeline-item"
          data-marker={markerOf(item)}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.05 }}
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
                {item.legacy !== "none" || item.traitor ? (
                  <p className="mt-1.5 flex flex-wrap gap-1">
                    {item.legacy !== "none" ? (
                      <Chip tone={LEGACY_TONE[item.legacy]} glyph size="sm">
                        {c(`legacy.${item.legacy}`)}
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
                    {item.honours.slice(0, TIMELINE_HONOURS).map((honour, honourIndex) => {
                      const competition = honour.kind === "title" ? getCompetition(honour.id) : null;
                      const name = honour.kind === "title" ? (competition?.names[locale] ?? honour.id) : AWARDS[honour.id].names[locale];
                      return (
                        <span key={`${honour.kind}-${honour.id}-${honour.year}-${honourIndex}`} title={`${name} ${honour.year}`}>
                          {honour.kind === "award" ? (
                            <AwardArt award={AWARDS[honour.id]} size={30} language={locale} />
                          ) : competition ? (
                            <TrophyArt competition={competition} size={30} language={locale} />
                          ) : null}
                        </span>
                      );
                    })}
                    {item.honours.length > TIMELINE_HONOURS ? <span className="timeline-more">+{item.honours.length - TIMELINE_HONOURS}</span> : null}
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

function markerOf(item: TimelineItem): "traitor" | "legend" | "idol" | "debut" | "plain" {
  if (item.kind === "debut") return "debut";
  if (item.traitor) return "traitor";
  if (item.legacy === "legend") return "legend";
  if (item.legacy === "idol") return "idol";
  return "plain";
}

function DebutCard({ career, age, year }: { career: Career; age: number; year: number }) {
  const { t, locale } = useT();
  const country = getCountry(career.nationality);
  return (
    <div className="timeline-card">
      {country ? <Flag country={country} size={40} language={locale} decorative /> : null}
      <div className="min-w-0 flex-1">
        <p className="display text-xl font-extrabold uppercase">{t("summary.timeline.debut")}</p>
        <p className="text-xs text-muted">{t("summary.timeline.debutAt", { age, year })}</p>
      </div>
    </div>
  );
}
