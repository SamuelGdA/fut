import type { EventEffect } from "@craque/engine/coach";
import { getCountry } from "@craque/world";
import type { ReactNode } from "react";
import type { PlayerRow } from "../../features/tecnico/view";
import type { TecnicoTranslator } from "../../i18n/tecnico/useTecnicoT";
import { cn } from "../../ui/cn";
import { Crest, Flag } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { signed } from "../../ui/tone";
import { clubName } from "./text";

/** Peças pequenas das telas do Técnico, usadas em mais de uma vista. */

export function ClubTag({ club, size = 20, className }: { club: string; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <Crest club={club} size={size} decorative />
      <span className="truncate">{clubName(club)}</span>
    </span>
  );
}

export function NationFlag({ code, locale, size = 16 }: { code: string; locale: "pt" | "es" | "en"; size?: number }) {
  const country = getCountry(code);
  if (!country) return null;
  return <Flag country={country} size={size} language={locale} />;
}

/** Linha de jogador: posição, nome, idade, OVR e o que vier à direita. */
export function PlayerLine({
  row,
  t,
  right,
  children,
}: {
  row: PlayerRow;
  t: TecnicoTranslator;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <span className="tec-player">
      <span className="tec-pos numeric">{t.c(`positionAbbr.${row.position}`)}</span>
      <span className="tec-ovr numeric">{row.ovr}</span>
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <NationFlag code={row.nationality} locale={t.locale} size={14} />
          <span className="truncate font-semibold">{row.name}</span>
          {row.fictional ? (
            <span className="shrink-0 text-2xs text-faint" title={t.tt("common.fictionalHint")}>
              <span aria-hidden="true">◆</span>
              <span className="sr-only">{t.tt("common.fictional")}</span>
            </span>
          ) : null}
        </span>
        <span className="flex flex-wrap items-center gap-x-2 text-2xs text-muted">
          <span>{t.tt("common.years", { age: row.age })}</span>
          {children}
        </span>
      </span>
      {right}
    </span>
  );
}

/** Tom de uma variação: positivo é bom, negativo é ruim. Dinheiro de saída é ruim. */
function toneOf(value: number): Tone {
  return value > 0 ? "good" : value < 0 ? "bad" : "neutral";
}

/** Os efeitos de uma opção, em pílulas legíveis (o que a opção faz, sem esconder nada). */
export function EffectChips({ effects, t }: { effects: readonly EventEffect[]; t: TecnicoTranslator }) {
  const chips: Array<{ key: string; tone: Tone; text: string }> = [];
  effects.forEach((effect, index) => {
    const key = `${effect.type}:${index}`;
    switch (effect.type) {
      case "satisfaction":
        chips.push({ key, tone: toneOf(effect.amount), text: t.tt(`event.effects.satisfaction.${effect.target}`, { delta: signed(effect.amount) }) });
        break;
      case "form":
        chips.push({ key, tone: toneOf(effect.amount), text: t.tt(`event.effects.form.${effect.target}`, { delta: signed(effect.amount) }) });
        break;
      case "board":
      case "fans":
      case "reputation":
        chips.push({ key, tone: toneOf(effect.amount), text: t.tt(`event.effects.${effect.type}`, { delta: signed(effect.amount) }) });
        break;
      case "cash":
      case "budget":
        chips.push({ key, tone: toneOf(effect.amount), text: t.tt(`event.effects.${effect.type}`, { money: `${effect.amount >= 0 ? "+" : "−"}${t.money(Math.abs(effect.amount))}` }) });
        break;
      case "training":
        chips.push({ key, tone: "good", text: t.tt("event.effects.training", { sector: t.tt(`train.sectors.${effect.sector}.name`) }) });
        break;
      case "promise":
        chips.push({
          key,
          tone: "info",
          text: t.tt(`event.effects.promise.${effect.kind}`, { percent: t.percent(effect.target), count: effect.target }),
        });
        break;
      case "injury":
        chips.push({
          key,
          tone: effect.days < 0 ? "good" : "bad",
          text: effect.days < 0 ? t.tt("event.effects.injury.shorter", { days: Math.abs(effect.days) }) : t.tt("event.effects.injury.out", { days: effect.days }),
        });
        break;
      case "sell":
        chips.push({ key, tone: "info", text: t.tt("event.effects.sell", { price: t.money(effect.price) }) });
        break;
      case "listed":
        chips.push({ key, tone: "neutral", text: t.tt("event.effects.listed") });
        break;
      case "trait":
        chips.push({ key, tone: "good", text: t.tt("event.effects.trait", { trait: t.tt(`squad.traits.${effect.trait}.name`) }) });
        break;
      case "match":
        break;
    }
  });
  if (chips.length === 0) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {chips.map((chip) => (
        <Chip key={chip.key} tone={chip.tone} size="sm" glyph>
          {chip.text}
        </Chip>
      ))}
    </span>
  );
}

/** Uma linha "rótulo · valor" das fichas e resumos. */
export function Fact({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0", className)}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="numeric min-w-0 truncate text-right text-sm font-semibold">{children}</dd>
    </div>
  );
}
