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
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { type PlayerRow, squadRows } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { SectionRule } from "../../ui/Panel";
import { PlayerLine } from "./shared";

type Run = (command: CoachCommand) => string | null;

/** Linha do campo de cada posição (de baixo para cima) e o lado (esquerda para direita). */
const LINE: Readonly<Record<Position, number>> = { gk: 0, lb: 1, cb: 1, rb: 1, cdm: 2, lm: 3, cm: 3, rm: 3, cam: 4, lw: 5, st: 5, rw: 5 };
const SIDE: Readonly<Record<Position, number>> = { gk: 1, lb: 0, cb: 1, rb: 2, cdm: 1, lm: 0, cm: 1, rm: 2, cam: 1, lw: 0, st: 1, rw: 2 };

/** Onde cada vaga da formação fica no desenho do campo (em %). */
function slotPositions(formation: FormationId): Array<{ x: number; y: number }> {
  const slots = FORMATION_SLOTS[formation];
  const lines = new Map<number, number[]>();
  slots.forEach((slot, index) => {
    const line = LINE[slot];
    lines.set(line, [...(lines.get(line) ?? []), index]);
  });
  const used = [...lines.keys()].sort((a, b) => a - b);
  const result: Array<{ x: number; y: number }> = slots.map(() => ({ x: 50, y: 50 }));
  used.forEach((line, row) => {
    const members = (lines.get(line) ?? []).sort((a, b) => (SIDE[slots[a] as Position] ?? 1) - (SIDE[slots[b] as Position] ?? 1) || a - b);
    const y = 90 - (row / Math.max(1, used.length - 1)) * 78;
    members.forEach((index, order) => {
      const x = members.length === 1 ? 50 : 14 + (order / (members.length - 1)) * 72;
      result[index] = { x, y };
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
  const [slot, setSlot] = useState<number | null>(null);
  if (!coach) return null;
  const editable = career.phase === "stage" || career.phase === "event";
  const tactics = coach.tactics;
  const rows = squadRows(career);
  const byId = new Map(rows.map((row) => [row.id, row]));
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
  const wanted = slot !== null ? slots[slot] : null;
  const ordered = wanted ? [...reserves].sort((a, b) => fit(b, wanted) - fit(a, wanted) || b.ovr - a.ovr) : reserves;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="tec-team-title">
      <SectionRule as="h2">
        <span id="tec-team-title">{tt("team.title")}</span>
      </SectionRule>
      {!editable ? <p className="rounded-sm border border-line bg-panel-2 p-2 text-xs text-muted">{tt("team.locked")}</p> : null}

      <div>
        <p className="eyebrow mb-2">{tt("team.formation")}</p>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={tt("team.formation")}>
          {FORMATIONS.map((formation) => (
            <button
              key={formation}
              type="button"
              role="radio"
              aria-checked={tactics.formation === formation}
              disabled={!editable}
              className="tec-pill numeric"
              data-checked={tactics.formation === formation || undefined}
              onClick={() => {
                if (formation === tactics.formation) return;
                feedback("tick");
                setSlot(null);
                run({ type: "setTactics", formation });
              }}
            >
              {formation}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-2">{tt("team.philosophy")}</p>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={tt("team.philosophy")}>
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
              <span className="text-xs text-muted">{tt(`team.philosophies.${philosophy}.hint`)}</span>
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
      <p className="text-2xs text-faint">{tt("team.swapHint")}</p>
      <div className="tec-pitch" role="group" aria-label={tt("team.lineup")}>
        {slots.map((position, index) => {
          const row = byId.get(tactics.lineup[index] ?? "");
          const place = places[index] ?? { x: 50, y: 50 };
          return (
            <button
              key={`${position}:${index}`}
              type="button"
              className="tec-slot-btn"
              data-selected={slot === index || undefined}
              data-empty={row ? undefined : true}
              style={{ left: `${place.x}%`, top: `${place.y}%` }}
              aria-pressed={slot === index}
              aria-label={`${c(`positionAbbr.${position}`)}: ${row ? `${row.name}, OVR ${row.ovr}` : tt("team.empty")}`}
              onClick={() => tapSlot(index)}
            >
              <span className="tec-slot-ovr numeric">{row ? row.ovr : "?"}</span>
              <span className="tec-slot-name">{row ? row.short : tt("team.empty")}</span>
              <span className="tec-slot-pos">{c(`positionAbbr.${position}`)}</span>
            </button>
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
              <button
                type="button"
                className={cn("tec-row", slot !== null && "tec-row-target")}
                disabled={!editable || slot === null || row.injuryDays !== null || !row.registered}
                onClick={() => tapPlayer(row.id)}
              >
                <PlayerLine row={row} t={t}>
                  <span>{tt(`squad.roles.${row.role}`)}</span>
                  {row.injuryDays !== null ? <span className="text-bad">{tt("squad.injured", { days: t.ttp("common.days", row.injuryDays) })}</span> : null}
                  {row.promised ? <span className="text-info">{tt("squad.promised")}</span> : null}
                </PlayerLine>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-2xs text-faint">{tt("team.rules")}</p>
      <p className="text-2xs text-faint">{tt("team.rotation")}</p>
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
