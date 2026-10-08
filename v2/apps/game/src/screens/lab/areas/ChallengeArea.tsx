import { axisName, edictName, missionGoal, missionName } from "@craque/content";
import { autoplay, CAREER_POLICIES, type CareerPolicy, challengeSetup, challengeStatus, createCareer, getMission, shiftChallengeDay } from "@craque/engine";
import { getCountry } from "@craque/world";
import { Play } from "lucide-react";
import { useState } from "react";
import { readChallengeClock } from "../../../features/challenge/clock";
import { handOf } from "../../../features/challenge/start";
import { formatChallengeDay } from "../../../i18n/format";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { Flag } from "../../../ui/Media";
import { Chip } from "../../../ui/Signals";

/** Quantos dias a área mostra, a partir de hoje (UTC). */
const DAYS = 14;

/**
 * As mãos do Desafio do dia dos próximos dias (GDD 27.2), para revisar
 * variedade e justiça sem esperar o calendário: nação, posição, talento do
 * jogador do dia, as três missões com o alvo, a escondida e o édito. "Simular"
 * joga o dia com as políticas automáticas e mostra a pontuação de cada uma.
 */
export function ChallengeArea() {
  const { t, c, locale } = useT();
  const [today] = useState(() => readChallengeClock().day);
  const [scores, setScores] = useState<Readonly<Record<string, Readonly<Record<CareerPolicy, number>>>>>({});
  const days = Array.from({ length: DAYS }, (_, index) => shiftChallengeDay(today, index));

  const simulate = (day: string) => {
    feedback("tick");
    const hand = handOf(day);
    const result = {} as Record<CareerPolicy, number>;
    for (const policy of CAREER_POLICIES) {
      const career = autoplay(createCareer(challengeSetup(hand, { surname: "LAB", foot: "right", dreamNumber: null })), policy);
      result[policy] = challengeStatus(hand, career).total;
    }
    setScores((current) => ({ ...current, [day]: result }));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-sm text-muted">{t("lab.challenge.intro")}</p>
      <ol className="grid gap-3 lg:grid-cols-2">
        {days.map((day) => {
          const hand = handOf(day);
          const country = getCountry(hand.nationality);
          const result = scores[day];
          return (
            <li key={day} className="flex flex-col gap-2 rounded-sm border border-line bg-panel p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="display text-xl font-black uppercase">{formatChallengeDay(day, locale)}</span>
                {day === today ? <Chip tone="glory" size="sm">{t("lab.challenge.today")}</Chip> : null}
                <span className="ml-auto flex items-center gap-1.5 text-sm">
                  {country ? <Flag country={country} size={18} language={locale} decorative /> : null}
                  {country?.names[locale] ?? hand.nationality} · {c(`positionAbbr.${hand.position}`)} · {c(`talents.${hand.talent}`)}
                </span>
              </div>
              <ul className="flex flex-col gap-1 text-sm">
                {hand.missions.map((id, index) => {
                  const mission = getMission(id);
                  return (
                    <li key={id} className="flex gap-2">
                      <span className="w-24 shrink-0 text-2xs font-bold tracking-wider text-glory uppercase">
                        {mission ? axisName(locale, mission.axis) : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="font-semibold">{missionName(locale, id)}</span>
                        {index === hand.hidden ? <span className="text-faint"> ({t("challenge.hiddenTitle")})</span> : null}
                        <span className="block text-xs text-muted">{missionGoal(locale, id, hand.targets[index] ?? 0)}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm">
                <span className="mr-2 text-2xs font-bold tracking-wider text-bad uppercase">{t("challenge.edict")}</span>
                {edictName(locale, hand.edict)}
              </p>
              <div className="flex flex-wrap items-center gap-2 border-t border-line pt-2">
                {result ? (
                  CAREER_POLICIES.map((policy) => (
                    <span key={policy} className="text-xs text-muted">
                      {t(`lab.challenge.policies.${policy}`)} <strong className="numeric text-fg">{result[policy]}</strong>
                    </span>
                  ))
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => simulate(day)}>
                    <Play size={14} aria-hidden="true" />
                    {t("lab.challenge.simulate")}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
