import { axisName, edictName, edictRule, edictStateName, missionGoal, missionHint, missionName, missionValue } from "@craque/content";
import { type EdictState, getEdict, getMission, HIDDEN_REVEAL_AGE } from "@craque/engine";
import { EyeOff } from "lucide-react";
import { useT } from "../../i18n/useT";
import { cn } from "../../ui/cn";
import { InfoTip } from "../../ui/InfoTip";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";

/**
 * As peças do Desafio do dia (GDD 27.6), iguais na entrada, no painel em
 * jogo, na revelação e no resumo: a missão com meta, progresso e barra; a
 * escondida tracejada com a idade de abertura; o édito em vermelho, faixa de
 * perigo (teto) ou barra (piso).
 */

interface MissionLineProps {
  id: string;
  target: number;
  /** Progresso agora; sem ele, só a meta (a entrada do desafio). */
  value?: number;
  /** A escondida ainda fechada. */
  hidden?: boolean;
  /** No resumo: fora da conta (a sacrificada), em cinza. */
  muted?: boolean;
  /** No resumo: pontos da missão, à direita do nome. */
  points?: string;
  /** No resumo: "Na conta" ou "Fora da conta", embaixo da barra. */
  note?: string;
  /** Linha mais justa, para o painel em jogo. */
  compact?: boolean;
  className?: string;
}

export function MissionLine({ id, target, value, hidden = false, muted = false, points, note, compact = false, className }: MissionLineProps) {
  const { t, locale } = useT();
  const mission = getMission(id);

  if (hidden) {
    return (
      <div className={cn("mission mission-hidden", compact && "mission-compact", className)}>
        <div className="mission-head">
          <EyeOff size={15} aria-hidden="true" className="shrink-0 text-faint" />
          <span className="mission-name">{t("challenge.hiddenTitle")}</span>
        </div>
        <p className="mission-goal">{t("challenge.hiddenBody", { age: HIDDEN_REVEAL_AGE })}</p>
      </div>
    );
  }

  const ratio = value === undefined ? null : target > 0 ? value / target : 0;
  const done = ratio !== null && ratio >= 1;
  const hint = missionHint(locale, id);
  const count =
    value === undefined
      ? null
      : t("challenge.progress", { value: missionValue(locale, id, value), target: missionValue(locale, id, target) });

  return (
    <div
      className={cn("mission", compact && "mission-compact", className)}
      data-done={done || undefined}
      data-muted={muted || undefined}
    >
      <div className="mission-head">
        {mission ? <span className="mission-axis">{axisName(locale, mission.axis)}</span> : null}
        <span className="mission-name">{missionName(locale, id)}</span>
        {points ? <span className="mission-points numeric">{points}</span> : null}
        {count && !points ? (
          <span className="mission-count numeric" aria-label={count}>
            {count}
          </span>
        ) : null}
      </div>
      <p className="mission-goal">
        {missionGoal(locale, id, target)}
        {hint ? (
          <span className="ml-1 inline-block align-middle">
            <InfoTip label={missionName(locale, id)}>{hint}</InfoTip>
          </span>
        ) : null}
      </p>
      {ratio !== null ? (
        <div
          className="mission-bar"
          role="meter"
          aria-label={missionName(locale, id)}
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={Math.min(value ?? 0, target)}
          aria-valuetext={count ?? undefined}
        >
          <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, ratio))})` }} />
        </div>
      ) : null}
      {note || (points && count) ? (
        <p className="mission-note">
          <span>{note}</span>
          {points && count ? <span className="numeric">{count}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

const STATE_TONE: Readonly<Record<EdictState, Tone>> = {
  intact: "neutral",
  met: "good",
  pending: "neutral",
  broken: "bad",
};

interface EdictBandProps {
  id: string;
  /** Sem estado: só a regra (a entrada do desafio). */
  state?: EdictState;
  value?: number;
  compact?: boolean;
  className?: string;
}

export function EdictBand({ id, state, value, compact = false, className }: EdictBandProps) {
  const { t, locale, number } = useT();
  const edict = getEdict(id);
  if (!edict) return null;
  const floor = edict.kind === "floor";
  const showValue = value !== undefined && (floor || edict.limit > 0);

  return (
    <div className={cn("edict", compact && "edict-compact", className)} data-kind={edict.kind} data-state={state}>
      <div className="edict-head">
        <span className="edict-label">{t("challenge.edict")}</span>
        <span className="edict-name">{edictName(locale, id)}</span>
        {state ? (
          <Chip tone={STATE_TONE[state]} variant={state === "broken" ? "solid" : "soft"} size="sm" glyph={state === "broken" || state === "met"}>
            {edictStateName(locale, state)}
          </Chip>
        ) : null}
      </div>
      <p className="edict-rule">{edictRule(locale, id)}</p>
      {showValue ? (
        floor ? (
          <div
            className="mission-bar edict-bar"
            role="meter"
            aria-label={edictName(locale, id)}
            aria-valuemin={0}
            aria-valuemax={edict.limit}
            aria-valuenow={Math.min(value, edict.limit)}
          >
            <span style={{ transform: `scaleX(${Math.min(1, value / edict.limit)})` }} />
          </div>
        ) : null
      ) : null}
      {showValue ? (
        <p className="edict-value numeric">{t("challenge.hud.edictValue", { value: number(value), limit: number(edict.limit) })}</p>
      ) : null}
      {!state && !compact ? <p className="edict-note">{floor ? t("challenge.edictFloor") : t("challenge.edictCeiling")}</p> : null}
    </div>
  );
}
