import { d66 } from "../../i18n/tecnico/d66";
import {
  benchSize,
  type CoachCareer,
  type CoachCommand,
  FORMATION_SLOTS,
  FORMATIONS,
  type FormationId,
  PHILOSOPHIES,
  type Philosophy,
} from "@craque/engine/coach";
import type { Position } from "@craque/engine";
import { ArrowLeftRight, GripVertical, Info, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLineupDrag } from "./LineupDrag";
import { type PlayerRow, squadRows } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { SectionRule } from "../../ui/Panel";
import { PlayerPeek } from "./PlayerPeek";
import { InfoTip } from "../../ui/InfoTip";
import { PlayerLine } from "./shared";
import { useTecnico } from "../../features/tecnico/store";
import { revisionText } from "../../i18n/tecnico/revision";


type Run = (command: CoachCommand) => string | null;

/** Linha do campo de cada posição (de baixo para cima) e o lado (esquerda para direita). */
const LINE: Readonly<Record<Position, number>> = { gk: 0, lb: 1, cb: 1, rb: 1, cdm: 2, lm: 3, cm: 3, rm: 3, cam: 4, lw: 5, st: 5, rw: 5 };
const SIDE: Readonly<Record<Position, number>> = { gk: 1, lb: 0, cb: 1, rb: 2, cdm: 1, lm: 0, cm: 1, rm: 2, cam: 1, lw: 0, st: 1, rw: 2 };

/** Onde cada vaga da formação fica no desenho do campo (em %). */
function slotPositions(formation: FormationId): Array<{ x: number; y: number }> {
  const slots = FORMATION_SLOTS[formation];
  const lines = new Map<number, number[]>();
  slots.forEach((slot, index) => {
    const line = formation === "4-2-3-1" && index >= 5 && index <= 6 ? 2
      : formation === "4-2-3-1" && index >= 7 && index <= 9 ? 4
      : (formation === "4-3-3" || formation === "5-3-2") && index >= (formation === "4-3-3" ? 5 : 6) && index <= (formation === "4-3-3" ? 7 : 8) ? 3 : LINE[slot];
    lines.set(line, [...(lines.get(line) ?? []), index]);
  });
  const used = [...lines.keys()].sort((a, b) => a - b);
  const result: Array<{ x: number; y: number }> = slots.map(() => ({ x: 50, y: 50 }));
  used.forEach((line, row) => {
    const members = (lines.get(line) ?? []).sort((a, b) => (SIDE[slots[a] as Position] ?? 1) - (SIDE[slots[b] as Position] ?? 1) || a - b);
    const y = 90 - (row / Math.max(1, used.length - 1)) * 78;
    members.forEach((index, order) => {
      const spread = members.length === 2 ? 38 : members.length === 3 ? 56 : 72;
      const x = members.length === 1 ? 50 : 50 - spread / 2 + (order / (members.length - 1)) * spread;
      const slot = slots[index];
      const advancedFullback = (slot === "lb" || slot === "rb") ? 6 : 0;
      const wideForward = formation === "4-3-3" || formation === "3-4-3" ? (slot === "lw" || slot === "rw" ? 6 : 0) : 0;
      result[index] = { x, y: y - advancedFullback + wideForward };
    });
  });
  return result;
}

/**
 * Time (spec 9 e 10): formação, filosofia e escalação, livres a qualquer
 * momento da etapa. Escalar é por toque: toque numa vaga e depois em quem
 * entra (outra vaga troca as duas). O banco é completado sozinho; promessas
 * de minutos entram primeiro. Não há barra de encaixe tático: o efeito da
 * filosofia está na dica e nos resultados.
 */
export function TeamView({ career, run }: { career: CoachCareer; run: Run }) {
  const t = useTecnicoT();
  const { tt, c } = t;
  const coach = career.coach;
  const focusPlayer = useTecnico((state) => state.focusPlayer);
  const closeFocus = () => useTecnico.setState({ focusPlayer: null });
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => { if (focusPlayer) document.querySelector<HTMLElement>(`[data-team-player="${CSS.escape(focusPlayer)}"]`)?.scrollIntoView({ block: "center", behavior: "instant" }); }, [focusPlayer]);
  const editable = career.phase === "stage" || career.phase === "event";
  const tactics = coach?.tactics;
  const rows = squadRows(career);
  const byId = new Map(rows.map((row) => [row.id, row]));
  const drag = useLineupDrag(tactics?.lineup ?? [], (lineup) => { feedback("tick"); run({ type: "setTactics", lineup }); }, editable,
    new Set(rows.filter((row) => row.injuryDays === null && row.registered).map((row) => row.id)));
  if (!coach || !tactics) return null;
  const slots = FORMATION_SLOTS[tactics.formation];
  const places = slotPositions(tactics.formation);
  const club = career.clubs[coach.club];
  const country = club?.country ?? "BRA";

  const setLineup = (lineup: string[]) => {
    feedback("tick");
    run({ type: "setTactics", lineup });
  };

  const tapSlot = (index: number) => {
    if (!editable) return;
    if (slot === null) {
      feedback("select");
      setSlot(index);
      return;
    }
    if (slot === index) {
      setSlot(null);
      return;
    }
    const lineup = [...tactics.lineup];
    const a = lineup[slot] ?? "";
    lineup[slot] = lineup[index] ?? "";
    lineup[index] = a;
    setLineup(lineup);
    setSlot(null);
  };

  const tapPlayer = (id: string) => {
    if (!editable || slot === null) return;
    const lineup = tactics.lineup.map((current) => (current === id ? "" : current));
    lineup[slot] = id;
    setLineup(lineup);
    setSlot(null);
  };

  const reserves = rows.filter((row) => !tactics.lineup.includes(row.id));
  const wanted = slot !== null ? slots[slot] ?? null : null;
  const ordered = wanted ? [...reserves].sort((a, b) => fit(b, wanted) - fit(a, wanted) || b.ovr - a.ovr) : reserves;

  return (
    <section className="tec-team flex flex-col gap-4" aria-labelledby="tec-team-title">
      {drag.drag ? createPortal(<div className="tec-drag-preview" style={{ left: drag.drag.x + 14, top: drag.drag.y - 24 }}><strong>{byId.get(drag.drag.id)?.ovr}</strong> {byId.get(drag.drag.id)?.short}</div>, document.body) : null}
      <SectionRule as="h2">
        <span id="tec-team-title">{tt("team.title")}</span>
      </SectionRule>
      {!editable ? <p className="rounded-sm border border-line bg-panel-2 p-2 text-xs text-muted">{tt("team.locked")}</p> : null}

      <div>
        <p className="eyebrow mb-2">{tt("team.formation")}</p>
        <div className="tec-formations" role="radiogroup" aria-label={tt("team.formation")}>
          {FORMATIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              role="radio"
              aria-checked={tactics.formation === formation}
              disabled={!editable}
              className="tec-formation numeric"
              data-checked={tactics.formation === formation || undefined}
              onClick={() => {
                if (formation === tactics.formation) return;
                feedback("tick");
                setSlot(null);
                run({ type: "setTactics", formation });
              }}
            >
              <svg viewBox="0 0 100 112" aria-hidden="true">{slotPositions(formation).map((place, index) => <circle key={index} cx={place.x} cy={place.y + 6} r={4} />)}</svg><span>{formation}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-2 flex items-center gap-2">{tt("team.philosophy")}<InfoTip label={tt("team.philosophy")}>{PHILOSOPHIES.map((item) => <p key={item}><strong>{tt(`team.philosophies.${item}.name`)}</strong>: {tt(`team.philosophies.${item}.hint`)}</p>)}</InfoTip></p>
        <div className="tec-philosophies" role="radiogroup" aria-label={tt("team.philosophy")}>
          {PHILOSOPHIES.map((philosophy: Philosophy) => (
            <button
              key={philosophy}
              type="button"
              role="radio"
              aria-checked={tactics.philosophy === philosophy}
              disabled={!editable}
              className="tec-choice"
              data-checked={tactics.philosophy === philosophy || undefined}
              onClick={() => {
                if (philosophy === tactics.philosophy) return;
                feedback("tick");
                run({ type: "setTactics", philosophy });
              }}
            >
              <span className="font-semibold">{tt(`team.philosophies.${philosophy}.name`)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow">{tt("team.lineup")}</p>
        <Button
          variant="secondary"
          size="sm"
          disabled={!editable}
          onClick={() => {
            feedback("select");
            setSlot(null);
            run({ type: "autoLineup" });
          }}
        >
          <Wand2 size={15} aria-hidden="true" />
          {tt("team.auto")}
        </Button>
      </div>
      <div className="tec-pitch" role="group" aria-label={tt("team.lineup")}>
        {slots.map((position, index) => {
          const row = byId.get(tactics.lineup[index] ?? "");
          const place = places[index] ?? { x: 50, y: 50 };
          return (
            <div key={row?.id ?? `empty:${index}`} {...drag.destination(index)} {...(row ? drag.source(row.id) : {})} data-team-player={row?.id} className="tec-pitch-player" style={{ left: `${place.x}%`, top: `${place.y}%` }}>
            {row ? <PlayerPeek paused={drag.drag !== null} row={row} openInitially={focusPlayer === row.id} onClose={closeFocus} trigger={<button type="button" {...drag.grip(row.id)} className="tec-slot-btn" data-selected={slot === index || undefined}>
              <span className="tec-slot-ovr numeric">{row.ovr}{row.position!==position && !row.alternates.includes(position) ? <span className="tec-position-warning" title={d66(t.locale,"outOfPosition")} aria-label={d66(t.locale,"outOfPosition")}>!</span> : null}{row.traits.length ? <span className="tec-trait-star" aria-label={row.traits.map((trait) => tt(`squad.traits.${trait}.name`)).join(", ")}>★</span> : null}</span>
              <span className="tec-slot-name">{row.short}</span>
              <span className="tec-slot-pos">{c(`positionAbbr.${position}`)}</span>
            </button>} /> : <button type="button" className="tec-slot-btn" data-empty aria-label={tt("team.empty")} onClick={() => tapSlot(index)}><span className="tec-slot-ovr">?</span><span className="tec-slot-pos">{c(`positionAbbr.${position}`)}</span></button>}
            {editable && row ? <button type="button" className="tec-pitch-inspect" aria-label={`${tt("ux.swap")}: ${row.name}`} aria-pressed={slot === index} onClick={() => tapSlot(index)}><ArrowLeftRight size={13} aria-hidden="true" /></button> : null}
            </div>
          );
        })}
      </div>

      <div>
        <p className="eyebrow mb-1">
          {tt("team.reserves")} · <span className="text-faint normal-case">{tt("team.benchSize", { count: benchSize(country) })}</span>
        </p>
        <ul className="flex flex-col">
          {ordered.map((row) => (
            <li key={row.id}>
              <div data-team-player={row.id} className="tec-reserve-row" {...drag.destination(row.id)} {...drag.source(row.id)}>
              {editable && row.injuryDays === null && row.registered ? <button type="button" className="tec-drag-grip" aria-label={tt("ux.dragPlayer", { name: row.name })} {...drag.grip(row.id)}><GripVertical size={16} aria-hidden="true" /></button> : null}
              {(!editable || row.injuryDays !== null || !row.registered) ? <span className="tec-grip-space" aria-hidden="true" /> : null}
              {slot === null ? <PlayerPeek paused={drag.drag !== null} row={row} openInitially={focusPlayer === row.id} onClose={closeFocus} trigger={<button
                type="button"
                className={cn("tec-row", slot !== null && "tec-row-target")}
                                              >
                <PlayerLine row={row} t={t}>
                  <span>{tt(`squad.roles.${row.role}`)}</span>
                  {row.injuryDays !== null ? <span className="text-bad">{revisionText(t.locale, "injury", { count: row.injuryTurns ?? 1 })}</span> : null}
                  {row.promised ? <span className="text-info">{tt("squad.promised")}</span> : null}
                </PlayerLine>
              </button>} /> : (<button
                type="button"
                className={cn("tec-row", wanted && fit(row, wanted) >= 2 && "tec-row-target")}
                disabled={!editable || slot === null || row.injuryDays !== null || !row.registered}
                onClick={() => tapPlayer(row.id)}
              >
                <PlayerLine row={row} t={t}>
                  <span>{tt(`squad.roles.${row.role}`)}</span>
                  {row.injuryDays !== null ? <span className="text-bad">{revisionText(t.locale, "injury", { count: row.injuryTurns ?? 1 })}</span> : null}
                  {row.promised ? <span className="text-info">{tt("squad.promised")}</span> : null}
                </PlayerLine>
              </button>)}
              <PlayerPeek paused={drag.drag !== null} row={row} trigger={<button type="button" className="tec-inspect"><Info size={16} aria-hidden="true" /></button>} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">{tt("ux.details")}<InfoTip label={tt("team.title")}>{tt("team.rules")} {tt("team.rotation")}</InfoTip></div>
    </section>
  );
}

/** Quanto o jogador combina com a vaga (só para ordenar a lista; nunca mostrado como número). */
function fit(row: PlayerRow, slot: Position): number {
  if (row.position === slot) return 3;
  if (row.alternates.includes(slot)) return 2;
  if (LINE[row.position] === LINE[slot]) return 1;
  return 0;
}
