import type { CoachAward } from "@craque/engine/coach";
import { getCompetition } from "@craque/world";
import type { ReactNode } from "react";
import { compareCoachHonours, coachAwardArt } from "../../features/tecnico/honours";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { HonourToken } from "../../ui/HonourToken";
import { awardName } from "./awardText";

/** Todas as taças e reconhecimentos do ano, com a mesma ordem da vitrine. */
export function SeasonHonours({ titles, awards = [], year, compact = false, mention }: { titles: readonly string[]; awards?: readonly CoachAward[]; year: number; compact?: boolean; mention?: (id: string) => ReactNode }) {
  const t = useTecnicoT();
  const entries: { id: string; award?: CoachAward }[] = [...titles.map(id => ({ id })), ...awards.map((award, index) => ({ id: `${award.kind}:${award.competition}:${index}`, award }))];
  entries.sort(compareCoachHonours);
  if (!entries.length) return null;
  return <ul className={compact ? "tec-season-tokens" : "tec-season-honours"}>{entries.map(item => {
    const name = item.award ? awardName(item.award, t.locale) : getCompetition(item.id)?.names[t.locale] ?? item.id;
    const recipient = item.award?.player ? mention?.(item.award.player) ?? null : null;
    return <li key={item.id}><HonourToken id={item.award?.competition ?? item.id} award={item.award ? coachAwardArt(item.award) : undefined} label={name} year={year} language={t.locale} size={compact ? 24 : 50} />{compact ? null : <><strong>{name}</strong>{recipient ? <span>{recipient}</span> : null}</>}</li>;
  })}</ul>;
}
