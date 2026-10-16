import type { CoachAward } from "@craque/engine/coach";
import { AWARDS, getCompetition } from "@craque/world";
import { useState } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { Sheet } from "../../ui/Overlays";
import { AwardArt, TrophyArt } from "../../ui/Media";
import { awardName, awardArtKey } from "./awardText";
import { compareCoachHonours } from "../../features/tecnico/honours";

export function CoachTrophies({ titles, awards = [] }: { titles: readonly { id: string; year: number }[]; awards?: readonly CoachAward[] }) {
  const t = useTecnicoT();
  const [selected, setSelected] = useState<{ name: string; years: number[] } | null>(null);
  const groups = new Map<string, { id: string; name: string; years: number[]; award?: CoachAward }>();
  for (const title of titles) {
    const group = groups.get(title.id) ?? { id: title.id, name: getCompetition(title.id)?.names[t.locale] ?? title.id, years: [] };
    group.years.push(title.year); groups.set(title.id, group);
  }
  for (const award of awards) {
    const key = `${award.kind}:${award.competition ?? "world"}`;
    const group = groups.get(key) ?? { id: key, name: awardName(award, t.locale), years: [], award };
    group.years.push(award.year); groups.set(key, group);
  }
  return <><ul className="tec-trophy-gallery">{[...groups.values()].sort(compareCoachHonours).map((item) => {
    const competition = getCompetition(item.id);
    return <li key={item.id}><button type="button" title={`${item.name}: ${item.years.join(", ")}`} aria-label={`${item.name}: ${item.years.join(", ")}, ×${item.years.length}`} onClick={() => setSelected(item)}><span className="tec-trophy-art">{item.award ? <AwardArt award={AWARDS[awardArtKey(item.award)]} size={82} language={t.locale} tooltip={`${item.name}: ${item.years.join(", ")}`} decorative /> : competition ? <TrophyArt competition={competition} size={82} language={t.locale} tooltip={`${item.name}: ${item.years.join(", ")}`} decorative /> : null}{item.years.length > 1 ? <strong className="tec-trophy-count">×{item.years.length}</strong> : null}</span><strong>{item.name}</strong><small>{item.years.length === 1 ? item.years[0] : `${item.years[0]} · ${item.years.at(-1)}`}</small></button></li>;
  })}</ul><Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }} title={selected?.name ?? ""} closeLabel={t.tt("common.close")}><p className="numeric text-glory">{selected?.years.join(" · ")}</p></Sheet></>;
}
