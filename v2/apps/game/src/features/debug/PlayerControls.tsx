import { useMemo, useState } from "react";
import { TALENT_BANDS, TRAITS, POSITIONS, EVENT_CATALOG, matchScenes, createCareer, ovrAt, type TalentBand, type Trait, type Position, type DecisionKind } from "@craque/engine";
import { debugPlayer, debugDecision } from "@craque/engine/debug";
import { decisionText, dramaText } from "@craque/content";
import { CLUBS } from "@craque/world";
import { useCareer } from "../career/store";
import { carryDecisionMemory } from "../career/whatIf";
import { useDraft } from "../career/draft";
import { useT } from "../../i18n/useT";
import { usePrefs } from "../../store/prefs";
import { useNavigation } from "../../app/navigation";
import { Button } from "../../ui/Button";
import { COPY } from "./copy";

export function PlayerControls({ done }: { done(): void }) {
  const { locale, c } = useT();
  const text = COPY[locale];
  const current = useCareer((state) => state.career);
  const [talent, setTalent] = useState<TalentBand>(current?.player.talent ?? "phenom");
  const [age, setAge] = useState(current?.age ?? 16);
  const [ovr, setOvr] = useState(current ? ovrAt(current.player, current.age) : 62);
  const [position, setPosition] = useState<Position>(current?.player.position ?? "st");
  const [trait, setTrait] = useState<Trait>(current?.player.trait ?? "professional");
  const [owner, setOwner] = useState(current?.contract?.loan?.owner ?? "");
  const [forced, setForced] = useState("");
  const forceLabel = { pt: "Forçar decisão", en: "Force a decision", es: "Forzar decisión" }[locale];
  const groups = useMemo(() => {
    const career = current ?? createCareer({ seed: "debug-catalog", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "TESTE", position: "st", nationality: "BRA", foot: "right", dreamNumber: 9 } });
    const normal: DecisionKind[] = ["base", "window", "loan", "return", "release", "forced", "focus", "promise", "veteran"];
    const label = (kind: DecisionKind, event: string | null = null) => decisionText(locale, career, { id: 0, kind, age: career.age, year: career.world.year, options: [], event, reason: null }).title;
    return [
      { label: { pt: "Decisões da carreira", en: "Career decisions", es: "Decisiones de carrera" }[locale], options: normal.map(key => ({ key, label: label(key) })) },
      { label: { pt: "Acontecimentos", en: "Events", es: "Acontecimientos" }[locale], options: EVENT_CATALOG.map(event => ({ key: `event:${event.id}`, label: label("event", event.id) })) },
      { label: { pt: "Decisões de partida", en: "Match decisions", es: "Decisiones de partido" }[locale], options: [...new Set(POSITIONS.flatMap(position => matchScenes(position, true)))].map(scene => ({ key: `match:${scene}`, label: dramaText(locale).scenes[scene][0] })) },
    ];
  }, [current, locale]);
  return <div className="debug-fields">
    <label>{forceLabel}<select aria-label={forceLabel} value={forced} onChange={event => setForced(event.target.value)}><option value="">{text.current}</option>{groups.map(group => <optgroup label={group.label} key={group.label}>{group.options.map(option => <option key={option.key} value={option.key}>{option.label}</option>)}</optgroup>)}</select></label>
    <label>{text.profile}<select aria-label={text.profile} value={talent} onChange={(e) => setTalent(e.target.value as TalentBand)}>{TALENT_BANDS.map((band) => <option key={band} value={band}>{c(`talents.${band}`)}</option>)}</select></label>
    <label>{text.position}<select aria-label={text.position} value={position} onChange={(e) => setPosition(e.target.value as Position)}>{POSITIONS.map((p) => <option key={p} value={p}>{c(`positionAbbr.${p}`)}</option>)}</select></label>
    <label>{text.trait}<select aria-label={text.trait} value={trait} onChange={(e) => setTrait(e.target.value as Trait)}>{TRAITS.map((p) => <option key={p} value={p}>{c(`traits.${p}`)}</option>)}</select></label>
    <label>{text.age}<input type="number" min={16} max={39} value={age} onChange={(e) => setAge(e.target.valueAsNumber || 16)} /></label>
    <label>OVR<input type="number" min={40} max={99} value={ovr} onChange={(e) => setOvr(e.target.valueAsNumber || 40)} /></label>
    {current?.contract ? <label>{text.loan}<select aria-label={text.loan} value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">{text.none}</option>{CLUBS.filter((club) => club.id !== current.contract?.club).map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}</select></label> : null}
    <Button onClick={() => {
      const draft = useDraft.getState();
      const prefs = usePrefs.getState();
      const career = current ?? createCareer({ seed: "debug-player", startYear: 2026, pace: prefs.pace, difficulty: prefs.difficulty, identity: { surname: draft.surname || "TESTE", position, nationality: draft.nationality ?? "BRA", foot: draft.foot, dreamNumber: draft.dreamNumber } });
      const adjusted = debugDecision(debugPlayer(career, { talent, age, ovr, position, trait, loanOwner: owner || null }), forced);
      carryDecisionMemory(career, adjusted);
      useCareer.setState({ career: adjusted, status: "ready", avatar: useCareer.getState().avatar ?? draft.avatar, internalTesting: true, play: null, review: null });
      done(); useNavigation.getState().go("career", { force: true });
    }}>{text.apply}</Button>
  </div>;
}
