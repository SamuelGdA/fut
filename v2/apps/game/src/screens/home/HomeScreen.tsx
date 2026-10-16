import { CLUBS, COUNTRIES, LEAGUES } from "@craque/world";
import { ArrowRight, Award, Crosshair, Dices, FlaskConical, Pencil, Play, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { useDraft } from "../../features/career/draft";
import { useChallengeClock } from "../../features/challenge/clock";
import { dayRanking } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatCountdown } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { IS_DEV } from "../../lib/env";
import { feedback } from "../../services/feedback";
import { type Difficulty, type Pace, usePrefs } from "../../store/prefs";
import { Button } from "../../ui/Button";
import { Panel } from "../../ui/Panel";
import { PlayerCard } from "../../ui/PlayerCard";
import { Segmented } from "../../ui/Segmented";

/**
 * Início (GDD 6.1): marca, o Desafio do dia com a contagem até a virada, ritmo
 * e dificuldade, começar, jogo rápido, a carta com o último jogador montado, o
 * Hall da Fama, as conquistas e os números do mundo. No PC, tudo numa tela
 * só, em três colunas, sem rolar a página (D43). O Início é para começar: a
 * carreira em andamento não aparece aqui, e começar outra não pergunta nada
 * (D45); a de antes, com ao menos uma temporada, entra no Hall da Fama como
 * interrompida. O motor só é baixado quando o jogador começa uma carreira.
 */
export function HomeScreen() {
  const { t, locale, number } = useT();
  const go = useNavigation((state) => state.go);
  const pace = usePrefs((state) => state.pace);
  const difficulty = usePrefs((state) => state.difficulty);
  const draft = useDraft();
  const [starting, setStarting] = useState(false);

  const startQuick = async () => {
    setStarting(true);
    try {
      const [{ quickDraft, setupFromDraft }, { useCareer }] = await Promise.all([
        import("../../features/career/newCareer"),
        import("../../features/career/store"),
      ]);
      // O jogo rápido sorteia um jogador só para esta carreira: o último jogador
      // montado continua guardado para a próxima (D43).
      const next = quickDraft(locale);
      useCareer.getState().start(setupFromDraft({ draft: next, pace, difficulty, locale }), next.avatar);
      feedback("whistle");
      go("career");
    } finally {
      setStarting(false);
    }
  };

  const onQuick = () => {
    feedback("select");
    void startQuick();
  };

  const card = (width: number) => (
    <PlayerCard
      surname={draft.surname.trim().toLocaleUpperCase() || t("card.you")}
      position={draft.position ?? "st"}
      ovr={null}
      attributes={null}
      nationality={draft.nationality}
      club={null}
      league={null}
      shirt={draft.dreamNumber}
      avatar={draft.avatar}
      width={width}
    />
  );

  return (
    <div className="home-board pitch-stripes">
      <section className="home-hero">
        <p className="eyebrow text-glory">{t("app.tagline")}</p>
        <h1 className="home-title mt-3">{t("app.name")}</h1>
        <p className="mt-4 max-w-xl text-base text-muted">{t("home.lead")}</p>
        <div className="home-card">
          {card(210)}
          {draft.surname.trim() ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                feedback("select");
                go("identity");
              }}
            >
              <Pencil size={15} aria-hidden="true" />
              {t("home.editPlayer")}
            </Button>
          ) : null}
        </div>
      </section>

      <div className="home-main">
        <Panel title={t("home.setup")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="eyebrow mb-2.5">{t("pace.label")}</p>
              <Segmented<Pace>
                block
                label={t("pace.label")}
                value={pace}
                onValueChange={(next) => {
                  usePrefs.getState().setPace(next);
                  feedback("tick");
                }}
                options={[
                  { value: "normal", label: t("pace.normal.name") },
                  { value: "intense", label: t("pace.intense.name") },
                ]}
              />
              <p className="mt-2 text-xs text-faint">{t(`pace.${pace}.hint`)}</p>
            </div>
            <div>
              <p className="eyebrow mb-2.5">{t("difficulty.label")}</p>
              <Segmented<Difficulty>
                block
                label={t("difficulty.label")}
                value={difficulty}
                onValueChange={(next) => {
                  usePrefs.getState().setDifficulty(next);
                  feedback("tick");
                }}
                options={[
                  { value: "normal", label: t("difficulty.normal.name") },
                  { value: "hard", label: t("difficulty.hard.name"), tone: "bad" },
                ]}
              />
              <p className="mt-2 text-xs text-faint">{t(`difficulty.${difficulty}.hint`)}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button
              size="lg"
              block
              onClick={() => {
                feedback("confirm");
                go("identity");
              }}
            >
              <Play size={18} aria-hidden="true" />
              {t("home.start")}
            </Button>
            <div>
              <Button size="lg" block variant="secondary" loading={starting} onClick={onQuick}>
                <Dices size={18} aria-hidden="true" />
                {t("home.quick")}
              </Button>
              <p className="mt-2 text-xs text-faint">{t("home.quickHint")}</p>
            </div>
          </div>
        </Panel>

        <div className="flex justify-center lg:hidden">{card(220)}</div>
      </div>

      <aside className="home-side">
        <DailyChallengeCard />
        <MemoryPanel />
        <Panel title={t("home.world")}>
          <dl className="grid grid-cols-3 divide-x divide-line">
            {[
              { label: t("home.worldClubs"), value: CLUBS.length },
              { label: t("home.worldLeagues"), value: LEAGUES.length },
              { label: t("home.worldNations"), value: COUNTRIES.length },
            ].map((item) => (
              <div key={item.label} className="flex flex-col-reverse items-center gap-1 px-1">
                <dt className="eyebrow">{item.label}</dt>
                <dd className="display numeric text-3xl font-black">{number(item.value)}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        {IS_DEV ? (
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              feedback("tick");
              go("lab");
            }}
          >
            <FlaskConical size={16} aria-hidden="true" />
            {t("home.lab")}
          </Button>
        ) : null}
      </aside>

    </div>
  );
}

/**
 * O Desafio do dia no Início (GDD 27): a mesma carreira para todo mundo, a
 * contagem até a virada da meia-noite UTC e, se já jogou hoje, a ranqueada.
 */
function DailyChallengeCard() {
  const { t } = useT();
  const go = useNavigation((state) => state.go);
  const clock = useChallengeClock();
  const attempts = useHall((state) => state.attempts);
  const ranked = dayRanking(attempts, clock.day).find((attempt) => attempt.ranked) ?? null;

  return (
    <section className="home-challenge p-5" aria-labelledby="desafio-do-dia">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-2 text-glory">
            <Crosshair size={14} aria-hidden="true" />
            {t("home.challengeEyebrow")}
          </p>
          <h2 id="desafio-do-dia" className="display mt-2 text-3xl leading-none font-black uppercase">
            {t("home.challengeTitle")}
          </h2>
        </div>
        <p className="numeric flex items-center gap-1.5 text-sm font-semibold">
          <Timer size={15} aria-hidden="true" className="text-glory" />
          {t("home.challengeNext", { time: formatCountdown(clock.msLeft) })}
        </p>
      </div>
      <p className="mt-3 max-w-xl text-sm text-muted">{t("home.challengeBody")}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {ranked ? (
            <span className="text-glory">{t("home.challengeRanked", { score: ranked.score })}</span>
          ) : null}
        </p>
        <Button
          variant="glory"
          onClick={() => {
            feedback("select");
            go("challenge");
          }}
        >
          {t("home.challengeOpen")}
          <ArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

/** O Hall da Fama e as conquistas: a memória entre carreiras (GDD 28). */
function MemoryPanel() {
  const { t, tp } = useT();
  const go = useNavigation((state) => state.go);
  const unlocked = useHall((state) => state.achievements.filter((row) => !row.id.startsWith("tecnico:")).length);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  return (
    <Panel title={t("home.memory")}>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="option"
          onClick={() => {
            feedback("select");
            go("achievements");
          }}
        >
          <span className="option-lead text-glory">
            <Award size={22} aria-hidden="true" />
          </span>
          <span className="option-main">
            <span className="option-title">{t("home.achievements")}</span>
            <span className="option-meta text-xs text-muted">{tp("home.achievementsCount", unlocked)}</span>
          </span>
          <ArrowRight size={18} aria-hidden="true" className="text-faint" />
        </button>
      </div>
    </Panel>
  );
}
