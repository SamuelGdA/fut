import { type Career, saveOf } from "@craque/engine";
import { useEffect } from "react";
import { archiveId, placementOf } from "../../features/hall/model";
import { challengeOf } from "../../features/hall/session";
import { useHall } from "../../features/hall/store";
import { formatChallengeDay } from "../../i18n/format";
import { useT } from "../../i18n/useT";
import { Chip } from "../../ui/Signals";
import { EdictBand, MissionLine } from "../challenge/MissionViews";

/**
 * O resultado do desafio no resumo (GDD 27.6): a pontuação sobre 1000, as três
 * missões (a sacrificada em cinza, à vista), ranqueada ou amistosa, o bônus de
 * pico, o édito, a penalidade de apagadas e uma linha com a colocação do dia.
 * Num link compartilhado, a colocação fica de fora: o ranking é do aparelho de
 * quem jogou.
 */
export function ChallengeChapter({ career, shared }: { career: Career; shared: boolean }) {
  const { t, tp, locale, number, ordinal, percent } = useT();
  const status = challengeOf(career);
  const attempts = useHall((state) => state.attempts);

  useEffect(() => {
    if (!shared) void useHall.getState().load();
  }, [shared]);

  if (!status) return null;
  const id = archiveId(saveOf(career));
  const attempt = shared ? null : (attempts.find((item) => item.id === id) ?? null);
  const placement = attempt ? placementOf(attempts, id) : null;
  const date = formatChallengeDay(status.hand.id, locale, true);
  const kept = status.edict.state === "intact" || status.edict.state === "met";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-glory">{t("challenge.summary.title", { date })}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="display numeric text-[clamp(4rem,16vw,6rem)] leading-none font-black">{status.total}</span>
            <span className="text-lg text-muted">{t("challenge.summary.of")}</span>
          </p>
        </div>
        {attempt ? (
          <Chip tone={attempt.ranked ? "glory" : "neutral"} variant={attempt.ranked ? "solid" : "soft"}>
            {attempt.ranked ? t("challenge.ranked") : t("challenge.friendly")}
          </Chip>
        ) : null}
      </div>

      <div className="grid gap-3">
        {status.missions.map((item) => (
          <MissionLine
            key={item.id}
            id={item.id}
            target={item.target}
            value={item.value}
            muted={!item.counted}
            points={t("challenge.points", { score: Math.round(item.points) })}
            note={item.counted ? t("challenge.summary.counted") : t("challenge.summary.sacrificed")}
          />
        ))}
      </div>

      <EdictBand id={status.edict.id} state={status.edict.state} value={status.edict.value} />

      <dl className="grid gap-2 rounded-sm border border-line bg-panel p-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t("challenge.summary.raw")}</dt>
          <dd className="numeric font-bold">{number(Math.round(status.raw))}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">{t("challenge.summary.peakBonus", { ovr: status.peakOvr })}</dt>
          <dd className="numeric font-bold">+{number(Math.round(status.peak))}</dd>
        </div>
        <div className="flex justify-between gap-3" data-tone={kept ? "good" : "bad"}>
          <dt className="text-tone">{kept ? t("challenge.summary.edictKept") : t("challenge.summary.edictBroken")}</dt>
          <dd className="numeric font-bold">×{number(kept ? 1 : 0.5)}</dd>
        </div>
        <div className="flex justify-between gap-3" data-tone={status.erased > 0 ? "bad" : "neutral"}>
          <dt className={status.erased > 0 ? "text-tone" : "text-muted"}>
            {status.erased > 0
              ? tp("challenge.summary.erased", status.erased, { percent: percent(1 - 0.97 ** status.erased) })
              : t("challenge.summary.erasedNone")}
          </dt>
          <dd className="numeric font-bold">×{number(0.97 ** status.erased, { maximumFractionDigits: 2 })}</dd>
        </div>
      </dl>

      {shared ? (
        <p className="text-sm text-faint">{t("challenge.summary.shared")}</p>
      ) : placement ? (
        <p className="text-base">
          {placement.of > 1
            ? t("challenge.summary.placement", { place: ordinal(placement.place), of: placement.of, date })
            : t("challenge.summary.placementAlone", { date })}
        </p>
      ) : null}
    </div>
  );
}
