import { d67 } from "../../i18n/tecnico/d67";
import { d66 } from "../../i18n/tecnico/d66";
import { d64 } from "../../i18n/tecnico/d64";
import { revisionText } from "../../i18n/tecnico/revision";
import { COACH_TRAITS } from "@craque/engine/coach";
import { CircleHelp } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { IconButton } from "../../ui/Button";
import { Sheet } from "../../ui/Overlays";
import { Segmented } from "../../ui/Segmented";

const PAGES = ["play", "players", "money", "commitments"] as const;
type Page = typeof PAGES[number];

export function Guide() {
  const { tt, locale } = useTecnicoT();
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<Page>("play");
  const reduced = useReducedMotion();
  return <><IconButton size="iconSm" label={tt("guide.title")} onClick={() => setOpen(true)}><CircleHelp size={15} aria-hidden="true" /></IconButton>
    <Sheet open={open} onOpenChange={setOpen} title={tt("guide.title")} description={tt("guide.lead")} closeLabel={tt("common.close")}>
      <Segmented<Page> block size="sm" label={tt("guide.title")} value={page} onValueChange={setPage} options={PAGES.map((value) => ({ value, label: tt(`guide.tabs.${value}`) }))} />
      <m.div key={page} className="tec-guide-page" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {page === "play" ? <><div className="tec-guide-hero"><span>01 → 02 → 03</span><h3 className="display text-3xl">{tt("guide.playTitle")}</h3></div>{(["plan", "act", "resolve"] as const).map((key, index) => <article key={key} className="tec-guide-item"><strong className="numeric">0{index + 1}</strong><p>{tt(`guide.steps.${key}`)}</p></article>)}</> : null}
        {page === "players" ? <><p className="text-sm leading-relaxed">{d66(locale,"positionRule")}</p><p className="text-sm text-muted">{tt("guide.players")}</p><p className="text-sm leading-relaxed mt-3">{revisionText(locale, "injuryRule")} {d64(locale,"awardRule")}</p><div className="tec-guide-traits">{COACH_TRAITS.map((trait) => <article key={trait}><span className="text-glory">★</span><div><h3>{tt(`squad.traits.${trait}.name`)}</h3><p>{tt(`squad.traits.${trait}.hint`)}</p></div></article>)}</div></> : null}
        {page === "money" ? <p className="text-sm leading-relaxed">{d66(locale,"financeRule")}</p> : null}
        {page === "play" ? <><p className="text-sm leading-relaxed">{d66(locale,"championsFormat")}</p><p className="text-sm leading-relaxed">{d66(locale,"tacticalRule")}</p></> : null}
        {page === "money" ? (["budget", "wages", "state"] as const).map((key, index) => <article key={key} className="tec-guide-item"><strong>{["€", "●", "▲"][index]}</strong><div><h3>{tt(`guide.moneyTitles.${key}`)}</h3><p>{tt(`guide.money.${key}`)}</p></div></article>) : null}
        {page === "commitments" ? <><div className="tec-guide-hero"><span>● → ★</span><h3 className="display text-3xl">{tt("guide.tabs.commitments")}</h3></div><p className="text-sm leading-relaxed">{d64(locale,"promiseRule")}</p><p className="text-sm text-muted">{tt("guide.relations")}</p><h3 className="display text-2xl font-bold uppercase">{d67(locale,"ambitionTitle")}</h3><p className="text-sm leading-relaxed">{d67(locale,"ambitionHint")}</p></> : null}
      </m.div>
    </Sheet></>;
}
