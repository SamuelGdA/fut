import { CLUBS, COUNTRIES, LEAGUES } from "@craque/world";
import { ArrowRight, Award, Crosshair, Dices, FlaskConical, Timer } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "../../app/navigation";
import type { QuickStart } from "../../features/career/useQuickStart";
import { useChallengeClock } from "../../features/challenge/clock";
import { dayRanking } from "../../features/hall/model";
import { useHall } from "../../features/hall/store";
import { formatCountdown } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { IS_DEV } from "../../lib/env";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Panel } from "../../ui/Panel";

/**
 * D110: o Início do Craque saiu. "Jogar" abre direto a tela de quem é você,
 * que traz o que ficava aqui: jogo rápido, o Desafio do dia, as conquistas,
 * os números do mundo e o laboratório. Este arquivo guarda essas peças.
 */

/** O que acompanha a tela de quem é você: Desafio do dia, conquistas, mundo e laboratório. */
export function CraqueExtras({ quick }: { quick: QuickStart }) {
  const { t, number } = useT();
  const go = useNavigation((state) => state.go);
  return (
    <div className="craque-extras">
      {/* No celular, o jogo rápido fica aqui; no PC, ao lado de Começar carreira. */}
      <div className="lg:hidden">
        <Button size="lg" block variant="secondary" loading={quick.starting} onClick={quick.start}>
          <Dices size={18} aria-hidden="true" />
          {t("home.quick")}
        </Button>
        <p className="mt-2 text-xs text-faint">{t("home.quickHint")}</p>
      </div>
      <DailyChallengeCard />
      <div className="flex flex-col gap-4">
        <AchievementsPanel />
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
      </div>
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

/** As conquistas, a memória entre carreiras (GDD 28). D106: sem o título "Memória" em cima. */
function AchievementsPanel() {
  const { t, tp } = useT();
  const go = useNavigation((state) => state.go);
  const unlocked = useHall((state) => state.achievements.filter((row) => !row.id.startsWith("tecnico:")).length);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  return (
    <Panel>
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
    </Panel>
  );
}
