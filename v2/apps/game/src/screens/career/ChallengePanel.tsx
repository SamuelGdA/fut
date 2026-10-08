import type { Career } from "@craque/engine";
import { challengeOf } from "../../features/hall/session";
import { formatChallengeDay } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { EdictBand, MissionLine } from "../challenge/MissionViews";

/** "Temporada apagada" passa a valer depois do pico; o aviso aparece a partir desta idade (GDD 27.6). */
export const ERASED_WARNING_AGE = 27;

/**
 * O painel do desafio em jogo (GDD 27.6): as missões com progresso `N de M` e
 * barra, a escondida tracejada até abrir, o édito como faixa ou barra, a
 * pontuação se a carreira parasse agora e, dos 27 em diante, o aviso de
 * temporadas apagadas. O painel nunca diz quais duas missões estão contando.
 * Cabe na tela, como o resto do laço.
 */
export function ChallengePanel({ career }: { career: Career }) {
  const { t, tp, locale, percent } = useT();
  const status = challengeOf(career);
  if (!status) return null;
  const age = Math.min(career.age, 40);
  const erasedFrom = Math.max(0, status.peakOvr - 5);

  return (
    <div className="challenge-panel flex min-h-0 flex-col gap-2.5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-glory">{t("challenge.hud.title", { date: formatChallengeDay(status.hand.id, locale) })}</p>
          <p className="mt-0.5 text-2xs text-faint">{t("challenge.hud.peakBonus", { ovr: status.peakOvr, points: Math.round(status.peak) })}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="eyebrow text-2xs">{t("challenge.hud.now")}</p>
          <p className="flex items-baseline justify-end gap-1">
            <span className="display numeric text-3xl leading-none font-black">{status.total}</span>
            <span className="text-2xs text-muted">{t("challenge.hud.of")}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {status.missions.map((item) => (
          <MissionLine key={item.id} id={item.id} target={item.target} value={item.value} hidden={item.hidden} compact />
        ))}
      </div>

      <EdictBand id={status.edict.id} state={status.edict.state} value={status.edict.value} compact />

      {age >= ERASED_WARNING_AGE ? (
        <div className="rounded-sm border border-line bg-panel px-3 py-2" data-tone={status.erased > 0 ? "bad" : "neutral"}>
          <p className={status.erased > 0 ? "text-tone text-sm font-bold" : "text-sm text-muted"}>
            {status.erased > 0
              ? tp("challenge.hud.erased", status.erased, { percent: percent(1 - 0.97 ** status.erased) })
              : t("challenge.hud.erasedNone")}
          </p>
          <p className="text-2xs text-faint">{t("challenge.hud.erasedRule", { limit: erasedFrom })}</p>
        </div>
      ) : null}
    </div>
  );
}
