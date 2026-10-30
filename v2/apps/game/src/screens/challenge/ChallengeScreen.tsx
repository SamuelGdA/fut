import { missionName } from "@craque/content";
import { getCountry, getCountryKit } from "@craque/world";
import { ArrowLeft, Pencil, Play, Timer } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { useAppearanceContext } from "../../features/appearance/context";
import { isSurnameValid, SURNAME_MAX, useDraft } from "../../features/career/draft";
import { useChallengeClock } from "../../features/challenge/clock";
import { challengeCareerSetup, handOf } from "../../features/challenge/start";
import { type AttemptEntry, challengeStats, dayRanking } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatChallengeDay, formatCountdown } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { TextField } from "../../ui/Fields";
import { Flag } from "../../ui/Media";
import { Panel, SectionRule } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { EdictBand, RecordTarget, MissionLine } from "./MissionViews";

/**
 * A entrada do Desafio do dia (GDD 27.6): a mão do dia (bandeira, nação,
 * posição e as regras fixas em selos curtos), as missões, o recorde do dia
 * quando houver, o édito, o jogador (nome, número, aparência), o botão Jogar e
 * o ranking do dia ao lado. Vira sozinha à meia-noite UTC. Desde a D96 tem
 * menos texto: nada de avisos repetidos nem notas de rodapé.
 */
export function ChallengeScreen() {
  const { t, c, locale } = useT();
  const go = useNavigation((state) => state.go);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const clock = useChallengeClock();
  const hand = handOf(clock.day);
  const draft = useDraft();
  const attempts = useHall((state) => state.attempts);
  const [touched, setTouched] = useState(false);
  const [starting, setStarting] = useState(false);
  const [dreamText, setDreamText] = useState(draft.dreamNumber === null ? "" : String(draft.dreamNumber));
  const dreamId = useId();

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  const country = getCountry(hand.nationality);
  const rankedToday = dayRanking(attempts, clock.day).find((attempt) => attempt.ranked) ?? null;
  const surnameOk = isSurnameValid(draft.surname);
  const dreamValid = dreamText.trim() === "" || (/^\d{1,2}$/.test(dreamText.trim()) && Number(dreamText) >= 1);
  const date = formatChallengeDay(clock.day, locale);

  const setDream = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    setDreamText(digits);
    const number = Number(digits);
    useDraft.getState().update({ dreamNumber: digits !== "" && number >= 1 && number <= 99 ? number : null });
  };

  const begin = async () => {
    setStarting(true);
    try {
      const { useCareer } = await import("../../features/career/store");
      useCareer.getState().start(challengeCareerSetup(clock.day, useDraft.getState(), locale), useDraft.getState().avatar);
      feedback("whistle");
      go("career");
    } finally {
      setStarting(false);
    }
  };

  const play = () => {
    setTouched(true);
    if (!surnameOk || !dreamValid) {
      feedback("back");
      return;
    }
    // Começar é começar (D45): a carreira de antes entra no Hall sem pergunta.
    void begin();
  };

  const rules = [t("challenge.ruleHard"), t("challenge.rulePace"), t("challenge.ruleRetire"), t("challenge.ruleBest")];

  return (
    <div className="ch-page">
      <div className="ch-head">
        <div className="min-w-0">
          <p className="eyebrow text-glory">{t("challenge.eyebrow")}</p>
          <h1 className="display mt-1 text-4xl font-black uppercase sm:text-5xl">{t("challenge.title", { date })}</h1>
        </div>
        <p className="ch-clock numeric">
          <Timer size={15} aria-hidden="true" />
          {t("challenge.nextIn", { time: formatCountdown(clock.msLeft) })}
        </p>
      </div>

      <div className="ch-grid">
        <div className="flex min-w-0 flex-col gap-5 lg:contents">
          <Panel className="ch-hand">
            <div className="ch-hand-top">
              {country ? <Flag country={country} size={52} language={locale} decorative /> : null}
              <div className="min-w-0">
                <p className="display truncate text-3xl leading-none font-black uppercase">{country?.names[locale] ?? hand.nationality}</p>
                <p className="mt-1 text-sm font-semibold text-muted">{c(`positions.${hand.position}`)}</p>
              </div>
            </div>
            <ul className="ch-rules" aria-label={t("challenge.hand")}>
              {rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>

            <SectionRule className="mt-5 mb-3">{t("challenge.missions")}</SectionRule>
            <div className="grid gap-2.5">
              {hand.missions.map((id, index) => (
                <MissionLine key={id} id={id} target={hand.targets[index] ?? 0} hidden={index === hand.hidden} compact={desktop} />
              ))}
            </div>

            {hand.record ? (
              <>
                <RecordTarget id={hand.record.id} mark={hand.record.mark} className="mt-4" />
                <p className="mt-2 text-xs text-muted">{t("challenge.record.rule")}</p>
              </>
            ) : null}
            <EdictBand id={hand.edict} className="mt-4" />
          </Panel>

          <Panel title={t("challenge.you")} className="ch-you">
            <div className="ch-you-face">
              <div className="size-20 shrink-0 overflow-hidden rounded-md border border-line bg-panel">
                <Avatar config={draft.avatar} kit={getCountryKit(hand.nationality)} className="h-full w-full" />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  feedback("select");
                  useAppearanceContext.getState().open("challenge", hand.nationality);
                  go("appearance");
                }}
              >
                <Pencil size={15} aria-hidden="true" />
                {t("challenge.appearanceEdit")}
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              <TextField
                label={t("identity.surname")}
                value={draft.surname}
                onValueChange={(value) => useDraft.getState().update({ surname: value.slice(0, SURNAME_MAX) })}
                maxLength={SURNAME_MAX}
                placeholder={t("identity.surnamePlaceholder")}
                counter={`${draft.surname.length}/${SURNAME_MAX}`}
                error={touched && !surnameOk ? t("identity.surnameMissing") : undefined}
              />
              <div>
                <label htmlFor={dreamId} className="eyebrow mb-1.5 block text-fg">
                  {t("identity.dreamNumber")}
                </label>
                <input
                  id={dreamId}
                  className="field-input max-w-32"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={dreamText}
                  onChange={(event) => setDream(event.target.value)}
                  placeholder={t("identity.dreamPlaceholder")}
                  aria-invalid={!dreamValid || undefined}
                  aria-describedby={dreamValid ? undefined : `${dreamId}-note`}
                  autoComplete="off"
                />
                {dreamValid ? null : <p id={`${dreamId}-note`} className="mt-1.5 text-xs text-bad">{t("identity.dreamInvalid")}</p>}
              </div>
            </div>
          </Panel>

          <div className="ch-play">
            <Button size="lg" variant="glory" block loading={starting} onClick={play}><Play size={18} aria-hidden="true" />{t("challenge.play")}</Button>
            <p className={cn("text-sm", rankedToday ? "text-glory" : "text-muted")}>
              {rankedToday ? t("challenge.rankedDone", { score: rankedToday.score }) : t("challenge.rankedFirst")}
            </p>
            <Button variant="ghost" size="sm" className="self-start" onClick={() => go("home")}>
              <ArrowLeft size={16} aria-hidden="true" />
              {t("common.back")}
            </Button>
          </div>
        </div>

        <aside className="ch-side">
          <DayRanking attempts={attempts} day={clock.day} />
          <StatsPanel attempts={attempts} />
        </aside>
      </div>
    </div>
  );
}

interface RankingProps {
  attempts: readonly AttemptEntry[];
  day: string;
}

/** O ranking do dia (GDD 27.7): todas as tentativas terminadas no dia, da maior para a menor. */
function DayRanking({ attempts, day }: RankingProps) {
  const { t, locale } = useT();
  const list = dayRanking(attempts, day);
  return (
    <Panel title={t("challenge.ranking")}>
      {list.length === 0 ? (
        <p className="text-sm text-muted">{t("challenge.rankingEmpty")}</p>
      ) : (
        <ol className="flex flex-col divide-y divide-line">
          {list.map((attempt, index) => (
            <li key={attempt.id} className="flex items-center gap-3 py-2.5">
              <span className="numeric w-6 shrink-0 text-right text-sm font-bold text-faint">{index + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="display block truncate text-lg leading-tight font-extrabold uppercase">{attempt.surname}</span>
                <span className="block truncate text-2xs text-faint">{missionName(locale, attempt.topMission)}</span>
              </span>
              <Chip tone={attempt.ranked ? "glory" : "neutral"} size="sm">
                {attempt.ranked ? t("challenge.ranked") : t("challenge.friendly")}
              </Chip>
              <span className="numeric w-12 shrink-0 text-right text-lg font-black">{attempt.score}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

/** Estatísticas só das ranqueadas (GDD 27.7). */
function StatsPanel({ attempts }: { attempts: readonly AttemptEntry[] }) {
  const { t } = useT();
  const stats = challengeStats(attempts);
  const items = [
    { label: t("challenge.stats.played"), value: stats.played },
    { label: t("challenge.stats.best"), value: stats.best },
    { label: t("challenge.stats.average"), value: stats.average },
    { label: t("challenge.stats.clean"), value: stats.clean, hint: t("challenge.stats.cleanHint") },
  ];
  return (
    <Panel title={t("challenge.stats.title")}>
      <dl className="grid grid-cols-4 divide-x divide-line">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col-reverse items-center gap-1 px-1">
            <dt className="eyebrow text-center text-2xs" title={item.hint}>{item.label}</dt>
            <dd className="display numeric text-3xl font-black">{item.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
