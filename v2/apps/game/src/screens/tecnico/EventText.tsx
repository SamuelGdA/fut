import { eventTargets, type CoachCareer } from "@craque/engine/coach";
import { Popover } from "@base-ui/react/popover";
import { Fragment, useState, type ReactNode } from "react";
import { playerRow, squadRows, type PlayerRow } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { Sheet } from "../../ui/Overlays";
import { PlayerPeek } from "./PlayerPeek";

const GROUP_WORDS = {
  pt: { youth: ["garotos da base", "jogadores da base", "jovens", "garotos"], starters: ["titulares"], bench: ["reservas"], squad: ["elenco", "grupo"] },
  en: { youth: ["academy boys", "youngsters", "young players", "young lads"], starters: ["starters"], bench: ["reserves", "backups"], squad: ["squad", "group"] },
  es: { youth: ["chicos de la cantera", "jóvenes", "canteranos"], starters: ["titulares"], bench: ["suplentes"], squad: ["plantel", "grupo"] },
} as const;

/** Nomes reais da cena; grupos só viram links quando uma opção realmente os afeta. */
export function EventText({ text, career, subject = career.event?.subject ?? null }: { text: string; career: CoachCareer; subject?: string | null }) {
  const t = useTecnicoT();
  const rows = squadRows(career);
  const outside = subject && career.players[subject] && !rows.some((row) => row.id === subject) ? [playerRow(career, career.players[subject]!)] : [];
  const tokens: Array<{ word: string; render(key: number): ReactNode }> = [...rows, ...outside].map((row) => ({ word: row.name, render: (key) => <PlayerPeek key={key} row={row} trigger={<button type="button" className="tec-inline-person">{row.name}</button>} /> }));
  const effects = career.event?.options.flatMap((option) => [...option.success, ...option.failure]) ?? [];
  for (const target of ["youth", "starters", "bench", "squad"] as const) {
    if (!effects.some((effect) => (effect.type === "satisfaction" || effect.type === "form") && effect.target === target || effect.type === "promise" && effect.kind === "youth" && target === "youth")) continue;
    const members = eventTargets(career, target, subject).map((player) => playerRow(career, player));
    if (!members.length) continue;
    for (const word of GROUP_WORDS[t.locale][target]) tokens.push({ word, render: (key) => <GroupPeek key={key} label={word} rows={members} /> });
  }
  const result: ReactNode[] = [];
  let rest = text;
  while (rest) {
    const found = tokens.map((token) => ({ token, index: rest.toLocaleLowerCase(t.locale).indexOf(token.word.toLocaleLowerCase(t.locale)) })).filter((hit) => hit.index >= 0).sort((a, b) => a.index - b.index || b.token.word.length - a.token.word.length)[0];
    if (!found) { result.push(rest); break; }
    result.push(rest.slice(0, found.index), found.token.render(result.length));
    rest = rest.slice(found.index + found.token.word.length);
  }
  return <>{result.map((item, key) => <Fragment key={key}>{item}</Fragment>)}</>;
}

function GroupPeek({ label, rows }: { label: string; rows: PlayerRow[] }) {
  const { tt } = useTecnicoT();
  const hover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [open, setOpen] = useState(false);
  const list = <ul className="tec-group-peek">{rows.map((row) => <li key={row.id}><strong>{row.name}</strong><span className="numeric">{row.ovr} OVR · {tt("common.years", { age: row.age })}</span></li>)}</ul>;
  if (!hover) return <><button type="button" className="tec-inline-person" onClick={() => setOpen(true)}>{label}</button><Sheet open={open} onOpenChange={setOpen} title={label} closeLabel={tt("common.close")}>{list}</Sheet></>;
  return <Popover.Root><Popover.Trigger className="tec-inline-person" openOnHover delay={300}>{label}</Popover.Trigger><Popover.Portal><Popover.Positioner sideOffset={8} collisionPadding={12} className="layer-popover"><Popover.Popup className="popover-popup"><Popover.Title className="eyebrow mb-3">{label} · {rows.length}</Popover.Title>{list}</Popover.Popup></Popover.Positioner></Popover.Portal></Popover.Root>;
}
