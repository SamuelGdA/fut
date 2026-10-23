import { dramaAction, dramaText } from "@craque/content";
import { choose, createCareer, resolveKeyMatch, matchChance, promiseOptions, VETERAN_PATHS, type Career, type Decision, type KeyMatch, type KeyMatchResult, type Position } from "@craque/engine";
import { getCompetition } from "@craque/world";
import { useState } from "react";
import { matchOptionText } from "../../../features/career/matchPresentation";
import { matchTheme } from "../../../features/career/matchTheme";
import { useT } from "../../../i18n/useT";
import { BROADCAST_COMPETITIONS, sampleMatch } from "../broadcastSamples";
import { DramaDecisionPanel } from "../../career/DramaDecisionPanel";
import { SeasonDecision } from "../../career/SeasonDecision";
import { PromiseSummary, SeasonDrama } from "../../career/SeasonDrama";

const MATCHES: readonly KeyMatch[] = [
  { competition: "cup:BRA", team: "flamengo", opponent: "palmeiras", national: false, stage: "final", minute: 88, score: [1, 1], scene: "decisivePenalty" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "corner" },
  { competition: "cont1:UEFA", team: "barcelona", opponent: "real-madrid", national: false, stage: "semi", minute: 86, score: [1, 1], scene: "penalty" },
  { competition: "cont1:CONMEBOL", team: "flamengo", opponent: "palmeiras", national: false, stage: "final", minute: 88, score: [1, 1], scene: "lastAttack" },
  { competition: "worldcup", team: "BRA", opponent: "ARG", national: true, stage: "quarter", minute: 120, score: [1, 1], scene: "shootout" },
  { competition: "nations:CONMEBOL", team: "BRA", opponent: "URU", national: true, stage: "final", minute: 84, score: [1, 1], scene: "counter" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "lowCross" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "recoveryRun" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "cutback" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [1, 1], scene: "halfTurn" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [0, 1], scene: "throughBall" },
  { competition: "cup:BRA", team: "flamengo", opponent: "palmeiras", national: false, stage: "quarter", minute: 94, score: [1, 2], scene: "keeperCorner" },
  { competition: "cup:BRA", team: "flamengo", opponent: "palmeiras", national: false, stage: "semi", minute: 86, score: [2, 2], scene: "bicycle" },
  { competition: "league:brasileirao", team: "flamengo", opponent: "palmeiras", national: false, stage: "league", minute: 86, score: [3, 3], scene: "goalLine" },
];
const ROLES: readonly Position[] = ["st", "cm", "st", "st", "st", "st", "gk", "cb", "rb", "cm", "st", "gk", "st", "cb"];
function sample(): Career {
  const base = createCareer({ seed: "lab-momento-d73", startYear: 2026, pace: "intense", difficulty: "normal", identity: { surname: "RIBEIRO", foot: "right", position: "st", nationality: "BRA", dreamNumber: 9 } });
  return choose(base, { decision: base.decision!.id, option: base.decision!.options[0]!.id }).career;
}
export function MatchLab() {
  const { locale, t } = useT();
  const copy = dramaText(locale);
  const [base] = useState(sample);
  const [broadcast, setBroadcast] = useState("");
  const [selected, setSelected] = useState(0);
  const [action, setAction] = useState("");
  const [result, setResult] = useState<KeyMatchResult | null>(null);
  const [success, setSuccess] = useState(true);
  const scene = MATCHES[selected];
  // Qualquer competição no lugar da da cena: os times de exemplo e a fase mudam junto (D83).
  const chosen = getCompetition(broadcast);
  const league = chosen?.kind === "league" || chosen?.kind === "second";
  const match: KeyMatch | undefined = scene && chosen ? { ...scene, ...sampleMatch(chosen, null), stage: league ? "league" : scene.stage === "league" ? "final" : scene.stage } : scene;
  const kind = selected === MATCHES.length ? "promise" : selected === MATCHES.length + 1 ? "veteran" : "match";
  const position = ROLES[selected] ?? "st";
  const actions = kind === "veteran" ? VETERAN_PATHS : kind === "promise" ? ["humble", "protagonist", "legend"] : match?.scene === "decisivePenalty" ? ["take", "leave"] : match?.scene === "penalty" || match?.scene === "shootout" ? ["left", "right"] : ["bold", "team", "safe"];
  const decision: Decision = { id: 100 + selected, age: kind === "veteran" ? 34 : 24, year: 2034, kind, event: null, reason: null, progress: { index: 2, total: 4 }, match, promises: kind === "promise" ? promiseOptions(base) : undefined, options: actions.map((value) => ({ id: `drama:${value}`, kind: "drama", action: value, chance: match ? matchChance(base, match, value) : null })) };
  const career = { ...base, age: decision.age, world: { ...base.world, year: decision.year }, player: { ...base.player, position }, decision };
  const record = base.history[0];
  return <div className="match-lab"><h3 className="display text-2xl font-bold">{copy.live} · {copy.promise} · {copy.veteran}</h3><div className="flex flex-wrap gap-2 my-3" role="group" aria-label={copy.match}>
    {[...MATCHES.map((item) => `${copy.scenes[item.scene][0]} · ${getCompetition(item.competition)?.names[locale] ?? item.competition}`), copy.promise, copy.veteran].map((label, index) => <button type="button" className="rounded-sm border border-line bg-panel px-3 py-2 text-xs" key={`${index}:${label}`} aria-pressed={selected === index} onClick={() => { setSelected(index); setAction(""); setResult(null); }}>{label}</button>)}
  </div><div className="flex flex-wrap items-end gap-2 mb-3"><button type="button" className="rounded-sm border border-line bg-panel px-3 py-2 text-xs" aria-pressed={success} onClick={() => { setSuccess(!success); setResult(null); }}>{success ? copy.success : copy.failure}</button><label className="flex flex-col gap-1 text-xs text-muted">{t("lab.broadcast.competition")}<select className="rounded-sm border border-line bg-panel px-2 py-2 text-xs text-fg" value={broadcast} onChange={(event) => { setBroadcast(event.target.value); setResult(null); }}><option value="">{t("lab.broadcast.sceneCompetition")}</option>{BROADCAST_COMPETITIONS.map((competition) => <option key={competition.id} value={competition.id}>{competition.names[locale]}</option>)}</select></label></div><div className="match-lab-preview" style={matchTheme(career)}><SeasonDecision career={career}><DramaDecisionPanel career={career} original={null} result={result} onContinue={() => setResult(null)} onChoose={(id) => { const chosen = id.slice(6); setAction(chosen); if (match) setResult(resolveKeyMatch(career, match, { id, kind: "drama", action: chosen, chance: success ? 1 : 0 })); return true; }} /></SeasonDecision></div><p role="status" className="text-sm text-muted mt-2">{action ? match ? matchOptionText(locale, match, action, position) : dramaAction(locale, action) : copy.simulated}</p>
  {record ? <div className="max-w-xl mt-6"><PromiseSummary record={{ ...record, promise: { ...promiseOptions(base)[1]!, actual: 5, fulfilled: false, fans: -3, legacy: 0, capacity: 0 } }} /><SeasonDrama matches={false} record={{ ...record, promise: { ...promiseOptions(base)[1]!, actual: 5, fulfilled: false, fans: -3, legacy: 0, capacity: 0 } }} /></div> : null}</div>;
}
