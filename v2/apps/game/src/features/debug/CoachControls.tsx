import { coachPlayerName } from "@craque/content/coach";
import { useState } from "react";
import { debugCoach } from "@craque/engine/debug";
import { eventWeights } from "@craque/engine/coach";
import { useTecnico } from "../tecnico/store";
import { useT } from "../../i18n/useT";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { Button } from "../../ui/Button";
import { COPY } from "./copy";

export function CoachControls({ done }: { done(): void }) {
  const { locale } = useT();
  const { g } = useTecnicoT();
  const text = COPY[locale];
  const career = useTecnico((state) => state.career);
  const [board, setBoard] = useState(career?.coach?.board ?? 60);
  const [fans, setFans] = useState(career?.coach?.fans ?? 60);
  const [reputation, setRep] = useState(career?.reputation ?? 15);
  const [budget, setBudget] = useState(career?.coach?.budget ?? 5000000);
  const [squadDelta, setDelta] = useState(0);
  const [player,setPlayer]=useState("");
  const [playerOvr,setPlayerOvr]=useState(80);
  const [heal, setHeal] = useState(false);
  const [event, setEvent] = useState("");
  if (!career?.coach) return <p>{text.start}</p>;
  return <div className="debug-fields">{[{ name: text.board, value: board, set: setBoard, max: 100 }, { name: text.fans, value: fans, set: setFans, max: 100 }, { name: text.rep, value: reputation, set: setRep, max: 100 }, { name: text.budget, value: budget, set: setBudget, max: 500000000 }, { name: text.squad, value: squadDelta, set: setDelta, max: 15 }].map((field) => <label key={field.name}>{field.name}<input type="number" min={field.set === setDelta ? -15 : 0} max={field.max} value={Math.round(field.value)} onChange={(e) => field.set(e.target.valueAsNumber || 0)} /></label>)}
    <label>{locale==="pt"?"Jogador":locale==="es"?"Jugador":"Player"}<select value={player} onChange={e=>{setPlayer(e.target.value);setPlayerOvr(career.players[e.target.value]?.ovr ?? 80);}}><option value="">{text.current}</option>{Object.values(career.players).filter(p=>p.club===career.coach?.club).map(p=><option key={p.id} value={p.id}>{coachPlayerName(career.setup.seed,p)} · {p.ovr}</option>)}</select></label>{player ? <label>OVR<input type="number" min={30} max={99} value={playerOvr} onChange={e=>setPlayerOvr(e.target.valueAsNumber || 30)} /></label> : null}
    <label className="debug-check"><input type="checkbox" checked={heal} onChange={(e) => setHeal(e.target.checked)} />{text.heal}</label>
    <label>{text.event}<select aria-label={text.event} value={event} onChange={(e) => setEvent(e.target.value)} disabled={career.phase !== "stage" && career.phase !== "event" || career.flow !== null}><option value="">{text.current}</option>{eventWeights(career).map((entry) => <option key={entry.id} value={entry.id} disabled={entry.weight === 0}>{g(`events.${entry.id}.title`)}</option>)}</select></label>
    <Button onClick={() => { useTecnico.setState({ career: debugCoach(career, { board, fans, reputation, budget, squadDelta, player, playerOvr, heal, event: event || null }), internalTesting: true }); done(); }}>{text.apply}</Button>
  </div>;
}
