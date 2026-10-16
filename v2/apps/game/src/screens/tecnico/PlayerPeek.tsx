import { Popover } from "@base-ui/react/popover";
import { cloneElement, useState, type ComponentProps, type ReactElement } from "react";
import type { PlayerRow } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { Sheet } from "../../ui/Overlays";
import { Chip } from "../../ui/Signals";
import { Fact, NationFlag } from "./shared";
import { revisionText } from "../../i18n/tecnico/revision";
import { awardName } from "./awardText";

/** Mesmo retrato público em hover, teclado e toque; nunca lê o jogador do motor. */
export function PlayerPeek({ row, trigger, openInitially = false, onClose, paused = false }: { row: PlayerRow; trigger: ReactElement<ComponentProps<"button">>; openInitially?: boolean; onClose?(): void; paused?: boolean }) {
  const { tt } = useTecnicoT();
  const hover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [open, setOpen] = useState(openInitially);
  if (paused && open) setOpen(false);
  const change = (value: boolean) => { if (paused && value) return; setOpen(value); if (!value) onClose?.(); };
  if (!hover) return <>{cloneElement(trigger, { onClick: () => change(true), "aria-label": tt("ux.inspectPlayer", { name: row.name }), "aria-haspopup": "dialog", "aria-expanded": open })}<Sheet open={open} onOpenChange={change} title={row.name} closeLabel={tt("common.close")}><PlayerQuickCard row={row} /></Sheet></>;
  return (
    <Popover.Root open={open && !paused} onOpenChange={change}>
      <Popover.Trigger render={trigger} openOnHover={!paused} delay={300} aria-label={tt("ux.inspectPlayer", { name: row.name })} />
      <Popover.Portal><Popover.Positioner side="left" sideOffset={10} collisionPadding={12} className="layer-popover"><Popover.Popup className="popover-popup tec-player-peek"><Popover.Title className="display text-2xl font-black uppercase">{row.name}</Popover.Title><PlayerQuickCard row={row} /></Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>
  );
}

export function PlayerQuickCard({ row }: { row: PlayerRow }) {
  const t = useTecnicoT();
  const { tt } = t;
  const formTone = row.form === "great" || row.form === "good" ? "good" : row.form === "normal" ? "neutral" : "bad";
  return (
    <div className="tec-player-details">
      <div className="tec-player-hero"><strong className="display numeric">{row.ovr}</strong><div><span className="eyebrow">OVR · {t.c(`positionAbbr.${row.position}`)}</span><p><NationFlag code={row.nationality} locale={t.locale} /> {tt("common.years", { age: row.age })}</p></div></div>
      <div className="flex flex-wrap gap-1"><Chip tone={row.mood === "happy" ? "good" : row.mood === "unhappy" ? "bad" : "neutral"} glyph>{tt(`squad.moods.${row.mood}`)}</Chip><Chip tone={formTone} glyph>{tt(`squad.forms.${row.form}`)}</Chip></div>
      <dl><Fact label={tt("player.positions")}>{[row.position, ...row.alternates].map((position) => t.c(`positionAbbr.${position}`)).join(" / ")}</Fact><Fact label={tt("ux.role")}>{tt(`squad.roles.${row.role}`)}</Fact><Fact label={tt("common.wage")}>{tt("common.perMonth", { money: t.money(row.wage) })}</Fact><Fact label={tt("common.value")}>{tt("common.estimate", { money: t.money(row.value) })}</Fact></dl>
      <p className="text-xs text-muted">{tt(`squad.potential.${row.potentialHint}`)}</p>
      {row.injuryDays !== null ? <Chip tone="bad" glyph>{revisionText(t.locale, "injury", { count: row.injuryTurns ?? 1 })}</Chip> : null}
      {row.promised ? <Chip tone="info">{tt("squad.promised")}</Chip> : null}
      {!row.registered ? <Chip tone="bad">{tt("squad.notRegistered")}</Chip> : null}
      {row.developed ? <Chip tone="info">{tt("develop.marked")}</Chip> : null}
      {row.listed ? <Chip>{tt("squad.listed")}</Chip> : null}
      {row.fictional ? <Chip>{tt("common.fictional")}</Chip> : null}
      {row.traits.map((trait) => <p key={trait} className="text-xs"><strong><span className="text-glory">★</span> {tt(`squad.traits.${trait}.name`)}</strong><br /><span className="text-muted">{tt(`squad.traits.${trait}.hint`)}</span></p>)}
      {row.awards.length ? <div className="tec-player-awards"><p className="eyebrow">{revisionText(t.locale, "awards")}</p>{row.awards.map((award) => <p key={`${award.year}:${award.kind}:${award.competition}`} className="text-xs text-glory">★ {awardName(award, t.locale)} · {award.year}</p>)}</div> : null}
      <p className="numeric text-xs text-muted">{tt("player.season")}: {row.season.apps} {tt("squad.stats.apps")} · {row.season.goals} {tt("squad.stats.goals")} · {row.season.assists} {tt("squad.stats.assists")} · {tt("squad.stats.rating")} {row.season.rating ?? "-"}</p>
    </div>
  );
}
