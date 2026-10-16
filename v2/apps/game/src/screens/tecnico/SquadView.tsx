import { type CoachCareer, registrationRule } from "@craque/engine/coach";
import { PlayerPeek } from "./PlayerPeek";
import { useState } from "react";
import { type PlayerRow, squadRows } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { SectionRule } from "../../ui/Panel";
import { SortHeaders } from "./SortHeaders";
import { comparePlayers, type PlayerSort } from "../../features/tecnico/sorting";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { MoodChip } from "./Process";
import { PlayerLine } from "./shared";
import { revisionText } from "../../i18n/tecnico/revision";


const FORM_TONE: Readonly<Record<PlayerRow["form"], Tone>> = { great: "good", good: "good", normal: "neutral", poor: "bad", awful: "bad" };

/** Pílulas de estado de um jogador: lesão, promessa, à venda, desenvolvido, base. */
export function StatusChips({ row, t }: { row: PlayerRow; t: TecnicoTranslator }) {
  const { tt } = t;
  return (
    <>
      {row.injuryDays !== null ? (
        <Chip tone="bad" size="sm" glyph>
          {revisionText(t.locale, "injury", { count: row.injuryTurns ?? 1 })}
        </Chip>
      ) : null}
      {row.promised ? <Chip tone="info" size="sm">{tt("squad.promised")}</Chip> : null}
      {row.listed ? <Chip size="sm">{tt("squad.listed")}</Chip> : null}
      {row.developed ? <Chip tone="info" size="sm">{tt("develop.marked")}</Chip> : null}
      {row.youthProduct ? <Chip tone="glory" size="sm">{tt("squad.youthProduct")}</Chip> : null}
      {row.newSigning ? <Chip tone="info" size="sm">{tt("squad.newSigning")}</Chip> : null}
      {!row.registered ? <Chip tone="bad" size="sm">{tt("squad.notRegistered")}</Chip> : null}
    </>
  );
}

/**
 * O elenco (spec 7): cada jogador com nome, nacionalidade, posição, idade,
 * OVR, fase, valor estimado, salário, papel esperado, satisfação em palavra,
 * características e lesão. Tocar abre a ficha. Consultar é livre.
 */
export function SquadView({ career }: { career: CoachCareer }) {
  const t = useTecnicoT();
  const { tt, ttp, money } = t;
  const [sort, setSort] = useState<PlayerSort>({key:"position",descending:false});
  const coach = career.coach;
  if (!coach) return null;
  const club = career.clubs[coach.club];
  const rule = registrationRule(club?.country ?? "BRA");
  const rows = squadRows(career);
  const sorted=[...rows].sort((a,b)=>comparePlayers(a,b,sort));

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tec-squad-title">
      <SectionRule as="h2" aside={<span className="numeric text-xs text-muted">{ttp("squad.count", rows.length)}</span>}>
        <span id="tec-squad-title">{tt("squad.title")}</span>
      </SectionRule>
      <p className="text-2xs text-faint">{tt("squad.registeredHint", { senior: rule.senior, age: rule.youthAge })}</p>
      {rows.some((row) => row.fictional) ? <p className="text-2xs text-faint">◆ {tt("common.fictionalHint")}</p> : null}
      <SortHeaders sort={sort} onChange={(next)=>{setSort(next);feedback("tick");}} />
      <ul className="flex flex-col tec-table-list">
        {sorted.map((row) => (
          <li key={row.id} className="tec-reserve-row">
            <PlayerPeek row={row} trigger={<button
              type="button"
              className="tec-row"
            >
              <PlayerLine
                row={row}
                t={t}
                right={
                  <span className="flex flex-col items-end gap-1">
                    <MoodChip mood={row.mood} t={t} />
                    <span className="numeric text-2xs text-muted">{tt("common.estimate", { money: money(row.value) })}</span>
                  </span>
                }
              >
                <span>{tt(`squad.roles.${row.role}`)}</span>
                <span data-tone={FORM_TONE[row.form]} className="text-tone">
                  {tt(`squad.forms.${row.form}`)}
                </span>
                <StatusChips row={row} t={t} />
              </PlayerLine>
            </button>} />
          </li>
        ))}
      </ul>
    </section>
  );
}
