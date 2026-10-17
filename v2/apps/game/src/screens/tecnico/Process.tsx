import { areRivals } from "@craque/world";
import { d66 } from "../../i18n/tecnico/d66";
import { resetProcessDraft, useProcessDraft } from "../../features/tecnico/processDraft";
import { InfoTip } from "../../ui/InfoTip";
import { coachPlayerName } from "@craque/content/coach";
import { useTecnico } from "../../features/tecnico/store";
import {
  chanceTier,
  isClubIdol,
  type CoachCareer,
  canAffordEvent,
  eventCost,
  type CoachCommand,
  type ConfirmPayload,
  DEVELOP,
  DECISION_TRADEOFFS,
  demandOf,
  developable,
  fundsPreview,
  wageBillOf,
  type Preview,
  purchaseChance,
  purchasePreview,
  PURCHASE,
  SALE,
  salePreview,
  squadOf,
  viableSquad,
  type Sector,
  SECTORS,
  TALK_EFFECTS,
  TRAINING,
  valueOf,
} from "@craque/engine/coach";
import type { Position } from "@craque/engine";
import { getClub } from "@craque/world";
import { Check, Info, Search, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { budgetSpent, playerRow, type PlayerRow, squadRows } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { foldText } from "../../i18n/format";
import { revisionText } from "../../i18n/tecnico/revision";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { PlayerPeek } from "./PlayerPeek";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { Sheet } from "../../ui/Overlays";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { DecisionPicker } from "./DecisionPicker";
import { RiskPreview, Resolution } from "./DecisionUX";
import { FinanceMeter } from "./FinanceMeter";
import { ClubTag, EffectChips, NationFlag, PlayerLine } from "./shared";
import { SortHeaders } from "./SortHeaders";
import { comparePlayers, type PlayerSort } from "../../features/tecnico/sorting";

type Run = (command: CoachCommand) => string | null;

const TIER_TONE: Readonly<Record<ReturnType<typeof chanceTier>, Tone>> = { veryHard: "bad", hard: "bad", possible: "neutral", likely: "good" };
const DEMAND_TONE: Readonly<Record<"low" | "medium" | "high", Tone>> = { low: "bad", medium: "neutral", high: "good" };

/**
 * O processo de uma ação (spec 6): escolher os alvos (livre), confirmar (usa
 * 1 de 3 ações), ver as respostas e aceitar ou recusar cada uma (não gasta),
 * concluir. Antes de confirmar, fechar cancela sem gastar; depois, fechar só
 * esconde a folha: as respostas continuam no motor até concluir.
 */
export function ProcessSheet({ career, open, onOpenChange, run }: { career: CoachCareer; open: boolean; onOpenChange(open: boolean): void; run: Run }) {
  const t = useTecnicoT();
  const { tt } = t;
  const flow = career.flow;
  if (!flow) return null;
  const kind = flow.kind;
  const titles: Readonly<Record<typeof kind, string>> = {
    sell: tt("sell.title"),
    buy: tt("buy.title"),
    train: tt("train.title"),
    develop: tt("develop.title"),
    youth: tt("youth.title"),
    locker: tt("locker.title"),
    funds: tt("funds.title"),
  };
  const leads: Readonly<Record<typeof kind, string>> = {
    sell: tt("sell.lead"),
    buy: tt("buy.lead"),
    train: tt("train.lead"),
    develop: tt("develop.lead"),
    youth: tt("youth.lead"),
    locker: tt("locker.lead"),
    funds: tt("funds.lead"),
  };

  const close = (next: boolean) => {
    if (next) return;
    if (flow.step === "select") {
      feedback("back");
      run({ type: "cancelAction" });
    } else run({ type: "closeAction" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={close} title={titles[kind]} description={leads[kind]} closeLabel={tt("common.close")} contained>
      {flow.step === "select" ? (
        <SelectStep key={`${kind}:${flow.number}`} career={career} kind={kind} run={run} t={t} />
      ) : (
        <ResponsesStep career={career} run={run} t={t} onDone={() => onOpenChange(false)} />
      )}
    </Sheet>
  );
}

// --------------------------------------------------------------- escolher

function SelectStep({ career, kind, run, t }: { career: CoachCareer; kind: NonNullable<CoachCareer["flow"]>["kind"]; run: Run; t: TecnicoTranslator }) {
  const { tt, ttp } = t;
  const [selected, setSelected] = useProcessDraft<string[]>(career, kind, "selected", []);
  const [sector, setSector] = useState<Sector | null>(null);
  const [candidate, setCandidate] = useState<string | null>(null);
  const [lockerMode, setLockerMode] = useState<"talk" | "meeting">("talk");
  const [meeting, setMeeting] = useState<"support" | "demand" | null>(null);

  const limits: Partial<Record<typeof kind, number>> = { sell: SALE.maxTargets, buy: PURCHASE.maxTargets, develop: DEVELOP.maxPlayers, locker: 3 };
  const max = limits[kind] ?? 0;
  const toggle = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= max) {
        feedback("back");
        return current;
      }
      feedback("tick");
      return [...current, id];
    });
  };

  let payload: ConfirmPayload | null = null;
  if ((kind === "sell" || kind === "buy" || kind === "develop") && selected.length > 0) payload = { kind, players: selected };
  if (kind === "train" && sector) payload = { kind: "train", sector };
  if (kind === "youth" && candidate) payload = { kind: "youth", candidate };
  if (kind === "locker" && lockerMode === "talk" && selected.length > 0) payload = { kind: "locker", mode: "talk", players: selected };
  if (kind === "locker" && lockerMode === "meeting" && meeting) payload = { kind: "locker", mode: "meeting", choice: meeting };
  if (kind === "funds") payload = { kind: "funds" };

  let body: ReactNode = null;
  if (kind === "sell") body = <SellPick career={career} selected={selected} toggle={toggle} t={t} />;
  else if (kind === "buy") body = <BuySearch career={career} selected={selected} toggle={toggle} t={t} />;
  else if (kind === "develop") body = <DevelopPick career={career} selected={selected} toggle={toggle} t={t} />;
  else if (kind === "train") body = <TrainPick career={career} value={sector} onChange={setSector} t={t} />;
  else if (kind === "youth") body = <YouthPick career={career} value={candidate} onChange={setCandidate} t={t} />;
  else if (kind === "funds") body = <FundsOdds career={career} t={t} />;
  else if (kind === "locker")
    body = (
      <LockerPick
        career={career}
        mode={lockerMode}
        onMode={(mode) => {
          setLockerMode(mode);
          setSelected([]);
        }}
        selected={selected}
        toggle={toggle}
        meeting={meeting}
        onMeeting={setMeeting}
        t={t}
      />
    );

  return (
    <div className="tec-process-select">
      {max > 0 && (kind !== "locker" || lockerMode === "talk") ? (
        <p className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>{ttp("process.selectUpTo", max)}</span>
          <span className="numeric font-semibold text-fg">{ttp("process.selected", selected.length)}</span>
        </p>
      ) : null}
      <div className="tec-process-body" data-buy={kind === "buy" || undefined}>{body}</div>
      <div className="tec-sheet-footer">
        <Chip tone="info">{tt("process.usesAction")}</Chip>
        <Button
          disabled={!payload}
          onClick={() => {
            if (!payload) return;
            feedback("confirm");
            const error = run({ type: "confirmAction", payload });
            if (!error && payload.kind === "youth") useTecnico.setState({ focusPlayer: payload.candidate });
          }}
        >
          <Check size={16} aria-hidden="true" />
          {tt("process.confirm")}
        </Button>
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, disabled, children, row }: { checked: boolean; onToggle(): void; disabled?: string | null; children: ReactNode; row?: PlayerRow }) {
  const hover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { tt } = useTecnicoT();
  const trigger = <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled ? true : undefined}
        className="tec-pick"
        data-checked={checked || undefined}
        onClick={(event) => {
          event.preventDefault();
          if (disabled) {
            feedback("back");
            return;
          }
          onToggle();
        }}
      >
        <span className="tec-check" aria-hidden="true">
          {checked ? <Check size={14} strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
      </button>;
  return (
    <li>
      <div className="tec-pick-wrap">
        {row && hover ? <PlayerPeek row={row} trigger={trigger} /> : trigger}
        {row && !hover ? <PlayerPeek row={row} trigger={<button type="button" className="tec-pick-inspect" aria-label={tt("ux.inspectPlayer", { name: row.name })}><Info size={15} aria-hidden="true" /></button>} /> : null}
      </div>
      {disabled ? <p className="px-3 pb-1 text-2xs text-faint">{disabled}</p> : null}
    </li>
  );
}

function SellPick({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt, money } = t;
  const stage = `${career.year}:${career.half}`;
  const [query, setQuery] = useProcessDraft(career, "sell", "query", "");
  const [position, setPosition] = useProcessDraft<Position | "any">(career, "sell", "position", "any");
  const [sort, setSort] = useProcessDraft<PlayerSort>(career,"sell","columnSort",{key:"value",descending:true});
  const rows = squadRows(career).filter((row) => (!query || foldText(row.name).includes(foldText(query))) && (position === "any" || row.position === position || row.alternates.includes(position))).sort((a,b)=>comparePlayers(a,b,sort));
  return (
    <div className="tec-sell-search"><input type="search" className="search-input" aria-label={revisionText(t.locale,"search")} placeholder={revisionText(t.locale,"search")} value={query} onChange={(event)=>setQuery(event.target.value)} /><SortHeaders sort={sort} onChange={setSort} position={position} onPosition={setPosition} selection /><ul className="tec-pick-list tec-table-list">
      {rows.map((row) => {
        const player = career.players[row.id];
        if (!player) return null;
        const demand = demandOf(career, player);
        const offered = player.offeredAt === stage;
        const idol = isClubIdol(career, player);
        const outgoing=new Set([...selected.filter((id)=>id!==row.id),row.id]);
        const blocked=!viableSquad(squadOf(career,career.coach?.club ?? "").filter((entry)=>!outgoing.has(entry.id)));
        return (
          <CheckRow row={row} key={row.id} checked={selected.includes(row.id)} onToggle={()=>toggle(row.id)} disabled={selected.includes(row.id)?null:offered?tt("process.blockers.notPending"):blocked?tt("process.blockers.squad"):null}>
            <PlayerLine
              row={row}
              t={t}
              right={
                <span className="flex flex-col items-end gap-1">
                  <span className="numeric text-xs font-semibold">{tt("common.estimate", { money: money(row.value) })}</span>
                  <Chip tone={DEMAND_TONE[demand]} size="sm">
                    {tt(`sell.demand.${demand}`)}
                  </Chip>
                </span>
              }
            >
              {row.promised ? <span className="text-info">{tt("squad.promised")}</span> : null}
              {idol ? <span className="text-glory">{tt("sell.idolWarning")}</span> : null}
            </PlayerLine>
          </CheckRow>
        );
      })}
    </ul></div>
  );
}

function DevelopPick({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt } = t;
  const allowed = new Set(developable(career).map((player) => player.id));
  const filters = usePickFilters(career, "develop");
  const rows = filters.rows;
  return (
    <div><PickFilters filters={filters} t={t} /><ul className="tec-pick-list tec-table-list">
      {rows.map((row) => (
        <CheckRow row={row} key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)} disabled={allowed.has(row.id) ? null : tt("develop.marked")}>
          <PlayerLine row={row} t={t}>
            <span>{tt(`squad.potential.${row.potentialHint}`)}</span>
          </PlayerLine>
        </CheckRow>
      ))}
    </ul></div>
  );
}

function BuySearch({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt, money } = t;
  const coach = career.coach;
  const [query, setQuery] = useProcessDraft(career, "buy", "query", "");
  const [position, setPosition] = useProcessDraft<Position | "any">(career, "buy", "position", "any");
  const [minOvr, setMinOvr] = useProcessDraft(career, "buy", "minOvr", "");
  const [maxOvr, setMaxOvr] = useProcessDraft(career, "buy", "maxOvr", "");
  const [minAge, setMinAge] = useProcessDraft(career, "buy", "minAge", "");
  const [maxAge, setMaxAge] = useProcessDraft(career, "buy", "maxAge", "");
  const [affordable, setAffordable] = useProcessDraft(career, "buy", "affordable", true);
  const [impossible, setImpossible] = useProcessDraft(career, "buy", "impossible", false);
  const [sort,setSort]=useProcessDraft<PlayerSort>(career,"buy","columnSort",{key:"chance",descending:true});
  const [limit,setLimit]=useState(120);

  const pool = useMemo(
    () =>
      Object.values(career.players)
        .filter((player) => player.club !== coach?.club)
        .sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id)),
    [career.players, coach?.club],
  );
  const folded = foldText(query);
  // Por padrão, só alvos possíveis: quem é quase impossível de trazer fica
  // escondido até o jogador pedir para ver (a chance continua na etiqueta).
  const rows: Array<{ row: PlayerRow; tier: ReturnType<typeof chanceTier> }> = [];
  for (const player of pool) {
    const age = career.year - player.birthYear;
    if (minAge !== "" && age < Number(minAge)) continue;
    if (maxAge !== "" && age > Number(maxAge)) continue;
    if (maxOvr !== "" && player.ovr > Number(maxOvr)) continue;
    if (minOvr !== "" && player.ovr < Number(minOvr)) continue;
    if (position !== "any" && player.position !== position && !player.alternates.includes(position)) continue;
    if (affordable && coach && valueOf(player, career.year) > coach.budget) continue;
    if (!coach) break;
    const rawTier = chanceTier(purchaseChance(career, player, coach.club).total);
    if (!impossible && rawTier === "veryHard") continue;
    const tier = areRivals(coach.club,player.club) ? "hard" : rawTier;
    const row = playerRow(career, player);
    if (folded && !foldText(row.name).includes(folded) && !foldText(getClub(player.club)?.name ?? "").includes(folded)) continue;
    rows.push({ row, tier });
  }
  // Primeiro quem tem chance de verdade, depois o OVR, depois os mais novos.
  const tierScore = { likely: 3, possible: 2, hard: 1, veryHard: 0 };
  rows.sort((a,b)=>sort.key === "chance" ? (sort.descending ? -1 : 1) * (tierScore[a.tier]-tierScore[b.tier]) || b.row.ovr-a.row.ovr || a.row.age-b.row.age : comparePlayers(a.row,b.row,sort));
  const chosen = selected.map((id) => career.players[id]).filter((player) => player !== undefined);

  return (
    <div className="tec-buy-search">
      {coach ? <div className="tec-market-budget"><FinanceMeter label={tt("header.budget")} used={budgetSpent(career)} pending={chosen.reduce((sum, player) => sum + valueOf(player, career.year), 0)} limit={coach.budget + budgetSpent(career)} t={t} /></div> : null}
      <div className="relative">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
        <input
          type="search"
          className="search-input"
          value={query}
          placeholder={tt("process.search")}
          aria-label={tt("process.search")}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="tec-buy-filters">
        <button type="button" className="tec-toggle" aria-pressed={affordable} onClick={() => setAffordable((value) => !value)}>
          {affordable ? <Check size={13} aria-hidden="true" /> : null}
          {tt("buy.filters.affordable")}
        </button>
        <button type="button" className="tec-toggle" aria-pressed={impossible} onClick={() => setImpossible((value) => !value)}>
          {impossible ? <Check size={13} aria-hidden="true" /> : null}
          {tt("buy.filters.showImpossible")}
        </button>
      </div>
      {chosen.length > 0 ? (
        <div className="tec-buy-chosen">
          {chosen.map((player) => (
            <button key={player.id} type="button" className="tec-chosen" onClick={() => toggle(player.id)}>
              {playerRow(career, player).short}
              <X size={12} aria-label={tt("common.close")} />
            </button>
          ))}
        </div>
      ) : null}
      <span className="flex items-center gap-2 text-xs text-muted">{tt("buy.chance")}<InfoTip label={tt("buy.chance")}>{tt("buy.tierHint")}</InfoTip></span>
      <SortHeaders sort={sort} onChange={setSort} position={position} onPosition={setPosition} minOvr={minOvr} onMinOvr={setMinOvr} maxOvr={maxOvr} onMaxOvr={setMaxOvr} minAge={minAge} onMinAge={setMinAge} maxAge={maxAge} onMaxAge={setMaxAge} chance selection />
      {rows.length === 0 ? (
        <p className="p-3 text-sm text-muted">{tt("process.emptySearch")}</p>
      ) : (
        <ul className="tec-pick-list tec-table-list">
          {rows.slice(0,limit).map(({ row, tier }) => {
            const player = career.players[row.id];
            if (!player) return null;
            return (
              <CheckRow row={row} key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)}>
                <PlayerLine row={row} t={t} right={<span className="numeric text-2xs font-semibold">{tt("common.estimate",{money:money(row.value)})}</span>} extra={<span className="tec-chance-cell"><Chip tone={TIER_TONE[tier]} size="sm" glyph>{tt(`buy.tiers.${tier}`)}</Chip></span>}>
                  {player.club ? <ClubTag club={player.club} size={14} /> : <span>{tt("buy.free")}</span>}
                </PlayerLine>
              </CheckRow>
            );
          })}
        </ul>
      )}
      {rows.length>limit?<button type="button" className="tec-toggle" onClick={()=>setLimit(limit+120)}>{d66(t.locale,"showMore")}</button>:null}
    </div>
  );
}

/** As chances e os valores do pedido de verba, antes de gastar a ação. */
function FundsOdds({ career, t }: { career: CoachCareer; t: TecnicoTranslator }) {
  const { tt, money, percent } = t;
  const preview = fundsPreview(career);
  const rows = [
    { key: "large", chance: preview.large, amount: preview.largeAmount, tone: "good" },
    { key: "small", chance: preview.small, amount: preview.smallAmount, tone: "neutral" },
    { key: "refused", chance: preview.refused, amount: null, tone: "bad" },
  ] as const;
  return (
    <div className="flex flex-col gap-2">
      <p className="eyebrow">{tt("funds.odds")}</p>
      <ul className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <li key={row.key} className="tec-response flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0">
              <span className="block font-semibold">{tt(`funds.outcomes.${row.key}`)}</span>
              {row.amount !== null ? <span className="numeric text-xs text-muted">{money(row.amount)}</span> : null}
            </span>
            <span data-tone={row.tone} className="numeric text-tone shrink-0 font-semibold">
              {percent(row.chance)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-2xs text-faint">{tt("funds.conditionHint")}</p>
    </div>
  );
}

function TrainPick({ career, value, onChange, t }: { career: CoachCareer; value: Sector | null; onChange(sector: Sector): void; t: TecnicoTranslator }) {
  const { tt, ttp, percent } = t;
  const coach = career.coach;
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={tt("train.title")}>
      {SECTORS.map((sector) => {
        const times = coach?.training[sector] ?? 0;
        const gain = TRAINING.steps[Math.min(times, TRAINING.steps.length - 1)] ?? 0;
        const capped = times >= TRAINING.steps.length;
        return (
          <button
            key={sector}
            type="button"
            role="radio"
            aria-checked={value === sector}
            className="tec-choice"
            data-checked={value === sector || undefined}
            disabled={capped}
            onClick={() => {
              feedback("tick");
              onChange(sector);
            }}
          >
            <span className="font-semibold">{tt(`train.sectors.${sector}.name`)}</span>
            <span className="text-xs text-muted">{tt(`train.sectors.${sector}.hint`)}</span>
            <span className="text-xs text-good">{capped ? tt("process.blockers.notPending") : tt("train.gain", { percent: percent(gain) })}</span>
            <span className="text-2xs text-faint">{ttp("train.level", times)}</span>
          </button>
        );
      })}
    </div>
  );
}

function YouthPick({ career, value, onChange, t }: { career: CoachCareer; value: string | null; onChange(id: string): void; t: TecnicoTranslator }) {
  const { tt, money, c, locale } = t;
  return (
    <div className="flex flex-col gap-2" role="radiogroup" aria-label={tt("youth.title")}>
      {career.youth.map((candidate) => {
        const age = career.year - candidate.birthYear;
        return (
          <button
            key={candidate.id}
            type="button"
            role="radio"
            aria-checked={value === candidate.id}
            className="tec-choice tec-choice-row"
            data-checked={value === candidate.id || undefined}
            disabled={candidate.promoted}
            onClick={() => {
              feedback("tick");
              onChange(candidate.id);
            }}
          >
            <span className="tec-pos numeric">{c(`positionAbbr.${candidate.position}`)}</span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1.5 font-semibold">
                <NationFlag code={candidate.nationality} locale={locale} size={14} />
                {coachPlayerName(career.setup.seed, { ...candidate, name: "" })}
              </span>
              <span className="text-2xs text-muted">
                {tt("common.years", { age })}
                {` · ${tt(`youth.descriptions.${candidate.description}`)}`}
                {candidate.promoted ? ` · ${tt("youth.promoted")}` : ""}
              </span>
            </span>
            <span className="text-right text-2xs">
              <span className="block">
                {tt("youth.fee")}: {money(candidate.fee)}
              </span>
              <span className="block text-muted">{tt("common.perMonth", { money: money(candidate.wage) })}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LockerPick({
  career,
  mode,
  onMode,
  selected,
  toggle,
  meeting,
  onMeeting,
  t,
}: {
  career: CoachCareer;
  mode: "talk" | "meeting";
  onMode(mode: "talk" | "meeting"): void;
  selected: string[];
  toggle(id: string): void;
  meeting: "support" | "demand" | null;
  onMeeting(choice: "support" | "demand"): void;
  t: TecnicoTranslator;
}) {
  const { tt } = t;
  const filters = usePickFilters(career, "locker");
  const rows = filters.rows;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={tt("locker.title")}>
        {(["talk", "meeting"] as const).map((item) => (
          <button key={item} type="button" role="radio" aria-checked={mode === item} className="tec-choice" data-checked={mode === item || undefined} onClick={() => onMode(item)}>
            <span className="font-semibold">{tt(`locker.${item}`)}</span>
            {item === "meeting" ? <span className="text-xs text-muted">{tt("locker.meetingHint")}</span> : null}
          </button>
        ))}
      </div>
      {mode === "talk" ? (
        <div><PickFilters filters={filters} t={t} /><ul className="tec-pick-list tec-table-list">
          {rows.map((row) => (
            <CheckRow row={row} key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)}>
              <PlayerLine row={row} t={t} right={<MoodChip mood={row.mood} t={t} />}>
                <span>{tt(`squad.roles.${row.role}`)}</span>
              </PlayerLine>
            </CheckRow>
          ))}
        </ul></div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={tt("locker.meeting")}>
          {(["support", "demand"] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={meeting === choice}
              className="tec-choice"
              data-checked={meeting === choice || undefined}
              onClick={() => {
                feedback("tick");
                onMeeting(choice);
              }}
            >
              <span className="font-semibold">{t.g(`meeting.${choice}.label`)}</span>
              <span className="text-xs text-muted">{t.g(`meeting.${choice}.good`)}</span>
              {choice === "support" ? <EffectChips effects={[{ type: "board", amount: DECISION_TRADEOFFS.supportBoard }, { type: "satisfaction", target: "squad", amount: career.coach && (career.coach.fans < 50 || career.coach.board < 50) ? 4 : 2 }]} t={t} /> : <RiskPreview chance={career.coach && (career.coach.fans < 50 || career.coach.board < 50) ? 0.55 : 0.35} success={[{ type: "form", target: "starters", amount: 0.5 }, { type: "board", amount: 2 }]} failure={[{ type: "satisfaction", target: "squad", amount: -4 }]} t={t} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MoodChip({ mood, t }: { mood: PlayerRow["mood"]; t: TecnicoTranslator }) {
  const tone: Tone = mood === "happy" ? "good" : mood === "unhappy" ? "bad" : "neutral";
  return (
    <Chip tone={tone} size="sm" glyph>
      {t.tt(`squad.moods.${mood}`)}
    </Chip>
  );
}

// -------------------------------------------------------------- respostas

function Impact({ preview, career, t }: { preview: Preview; career: CoachCareer; t: TecnicoTranslator }) {
  const coach = career.coach;
  const club = coach ? career.clubs[coach.club] : null;
  if (!coach || !club) return null;
  const wages = wageBillOf(career, coach.club);
  return <div className="tec-impact-bars">
    <FinanceMeter label={t.tt("header.budget")} used={budgetSpent(career)} pending={Math.max(0, coach.budget - preview.budgetAfter)} limit={coach.budget + budgetSpent(career)} t={t} />
    <FinanceMeter label={t.tt("club.wages")} used={wages} pending={preview.wageBillAfter - wages} limit={preview.wageCap} t={t} />
  </div>;
}

function Blockers({ preview, t }: { preview: Preview; t: TecnicoTranslator }) {
  const known = ["budget", "cash", "wages", "registration", "squad", "promise", "gone", "notPending"] as const;
  const shown = preview.blockers.map((code) => known.find((item) => item === code)).filter((code) => code !== undefined && code !== "notPending");
  if (shown.length === 0) return null;
  return (
    <ul className="mt-1 flex flex-wrap gap-1">
      {shown.map((code) => (
        <li key={code}>
          <Chip tone="bad" size="sm" glyph>
            {t.tt(`process.blockers.${code}`)}
          </Chip>
        </li>
      ))}
    </ul>
  );
}

function StatusChip({ status, t }: { status: string; t: TecnicoTranslator }) {
  if (status === "accepted") return <Chip tone="good" size="sm" glyph>{t.tt("process.accepted")}</Chip>;
  if (status === "declined") return <Chip size="sm">{t.tt("process.declined")}</Chip>;
  if (status === "unavailable" || status === "none") return <Chip tone="bad" size="sm">{t.tt("process.unavailable")}</Chip>;
  return <Chip tone="info" size="sm">{t.tt("process.pending")}</Chip>;
}

function Decide({ onAccept, onDecline, disabled, t }: { onAccept(): void; onDecline(): void; disabled: boolean; t: TecnicoTranslator }) {
  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" disabled={disabled} onClick={onAccept}>
        <Check size={15} aria-hidden="true" />
        {t.tt("common.accept")}
      </Button>
      <Button size="sm" variant="secondary" onClick={onDecline}>
        {t.tt("common.decline")}
      </Button>
    </div>
  );
}

function ResponsesStep({ career, run, t, onDone }: { career: CoachCareer; run: Run; t: TecnicoTranslator; onDone(): void }) {
  const { tt, money } = t;
  const [selectedTalk, setSelectedTalk] = useState("");
  const flow = career.flow;
  if (!flow) return null;
  const respond = (item: string, decision: "accept" | "decline" | string) => {
    feedback(decision === "decline" ? "back" : "confirm");
    run({ type: "respond", item, decision });
  };
  const playerName = (id: string) => {
    const player = career.players[id];
    return player ? <PlayerPeek row={playerRow(career, player)} trigger={<button type="button" className="tec-inline-person">{playerRow(career, player).name}</button>} /> : id;
  };

  let body: ReactNode = null;
  if (flow.kind === "sell") {
    body = (
      <ul className="flex flex-col gap-2">
        {flow.offers.map((offer) => {
          const preview = offer.status === "pending" ? salePreview(career, offer) : null;
          return (
            <li key={offer.id} className="tec-response">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{playerName(offer.player)}</p>
                <StatusChip status={offer.status} t={t} />
              </div>
              <p className="text-sm text-muted">
                {offer.buyer ? tt("sell.offer", { buyer: getClub(offer.buyer)?.name ?? offer.buyer, price: money(offer.price) }) : tt("sell.noOffer")}
              </p>
              {preview ? (
                <>
                  <Impact preview={preview} career={career} t={t} />
                  <Blockers preview={preview} t={t} />
                  <Decide disabled={!preview.ok} onAccept={() => respond(offer.id, "accept")} onDecline={() => respond(offer.id, "decline")} t={t} />
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  } else if (flow.kind === "buy") {
    body = (
      <ul className="flex flex-col gap-2">
        {flow.responses.map((response) => {
          const preview = response.status === "pending" ? purchasePreview(career, response) : null;
          const club = getClub(response.from)?.name ?? tt("buy.free");
          const text =
            response.outcome === "available"
              ? tt("buy.responses.available", { club, price: money(response.price), wage: money(response.wage) })
              : response.outcome === "clubRefused"
                ? tt("buy.responses.clubRefused", { club })
                : tt("buy.responses.playerRefused");
          return (
            <li key={response.id} className="tec-response">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{playerName(response.player)}</p>
                <StatusChip status={response.status} t={t} />
              </div>
              <p className="text-sm text-muted">{text}</p>
              {preview ? (
                <>
                  <Impact preview={preview} career={career} t={t} />
                  <Blockers preview={preview} t={t} />
                  <Decide disabled={!preview.ok} onAccept={() => respond(response.id, "accept")} onDecline={() => respond(response.id, "decline")} t={t} />
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  } else if (flow.kind === "locker" && flow.mode === "talk") {
    const talk = flow.talks.find(item => item.id === selectedTalk) ?? flow.talks[0];
    body = talk ? <div className="tec-talk-scene">
      {flow.talks.length > 1 ? <div className="tec-talk-tabs" role="group" aria-label={tt("locker.title")}>{flow.talks.map((item, index) => <button key={item.id} type="button" aria-pressed={item.id === talk.id} onClick={() => setSelectedTalk(item.id)}><span>{item.chosen ? "✓" : `0${index + 1}`}</span>{career.players[item.player] ? playerRow(career, career.players[item.player]!).short : item.player}</button>)}</div> : null}
      <div className="tec-talk-context"><p className="font-semibold">{playerName(talk.player)}</p><p className="text-sm text-muted">{t.g(`talks.concerns.${talk.concern}`)}</p>{talk.immediate > 0 ? <p className="text-xs text-good">{t.g("talks.immediate")}</p> : null}</div>
      {talk.chosen ? <Resolution key={`${talk.id}:${talk.chosen}`} good={talk.outcome === "good"} title={tt("event.outcome")}><p className="text-sm">{t.g(`talks.options.${talk.chosen}.${talk.outcome === "good" ? "good" : "bad"}`)}</p><EffectChips effects={(talk.outcome === "good" ? TALK_EFFECTS[talk.chosen]?.success : TALK_EFFECTS[talk.chosen]?.failure) ?? []} t={t} /></Resolution>
      : <DecisionPicker key={talk.id} label={tt("locker.choose")} onChoose={(option) => respond(talk.id, option)} options={talk.options.map(option => {
        const effect = TALK_EFFECTS[option]!;
        const priced = { id: option, chance: effect.chance, success: effect.success, failure: effect.failure };
        const affordable = canAffordEvent(career, priced);
        return { id: option, title: t.g(`talks.options.${option}.label`), canConfirm: affordable, detail: <><RiskPreview chance={effect.chance} success={effect.success} failure={effect.failure} t={t} />{effect.acceptBench || effect.releasePromise ? <p className="mt-1 text-xs text-info">{t.g(`talks.options.${option}.good`)}</p> : null}{!affordable ? <p className="mt-1 text-xs text-bad">{tt("ux.excess", { money: money(eventCost(priced) - (career.coach?.budget ?? 0)) })}</p> : null}</> };
      })} />}
    </div> : null;
  } else if (flow.kind === "locker" && flow.meeting) {
    const meeting = flow.meeting;
    body = (
      <Resolution good={meeting.outcome === "good"} title={tt("event.outcome")}><p className="text-sm">{meeting.choice ? t.g(`meeting.${meeting.choice}.${meeting.outcome === "good" ? "good" : "bad"}`) : null}</p></Resolution>
    );
  } else if (flow.kind === "funds") {
    const response = flow.response;
    body = (
      <div className="tec-response">
        <p className="text-sm">{t.g(`funds.${response.outcome}`, { amount: money(response.amount) })}</p>
        {response.condition ? <p className="mt-1 text-sm text-glory">{t.g("funds.condition", { objective: t.g(`objectives.${response.condition}.name`) })}</p> : null}
        <div className="mt-1">
          <StatusChip status={response.status} t={t} />
        </div>
        {response.status === "pending" ? (
          <Decide disabled={false} onAccept={() => respond("funds", "accept")} onDecline={() => respond("funds", "decline")} t={t} />
        ) : null}
      </div>
    );
  }

  const pending =
    (flow.kind === "sell" && flow.offers.some((offer) => offer.status === "pending")) ||
    (flow.kind === "buy" && flow.responses.some((response) => response.status === "pending")) ||
    (flow.kind === "locker" && flow.talks.some((talk) => !talk.chosen)) ||
    (flow.kind === "funds" && flow.response.status === "pending");

  return (
    <div className="tec-process-responses" data-talk={flow.kind === "locker" || undefined}>
      {flow.kind !== "locker" ? <p className="eyebrow">{tt("process.responses")}</p> : null}
      <div className="tec-response-body">{body}</div>
      <div className="tec-sheet-footer">
        <span className="text-xs text-faint">{pending ? flow.kind === "buy" || flow.kind === "sell" ? revisionText(t.locale, "saved") : tt("process.concludeHint") : null}</span>
        {flow.kind === "buy" || flow.kind === "sell" ? <Button variant="secondary" size="sm" disabled={career.actionsUsed >= 3} onClick={() => { const kind = flow.kind; resetProcessDraft(career,kind); run({ type: "closeAction" }); run({ type: "openAction", kind, fresh: true }); }}>{revisionText(t.locale, flow.kind === "buy" ? "freshBuy" : "freshSell")}</Button> : null}
        <Button
          onClick={() => {
            feedback("confirm");
            if (!run({ type: "closeAction" })) onDone();
          }}
        >
          {tt("process.conclude")}
        </Button>
      </div>
    </div>
  );
}

function usePickFilters(career: CoachCareer, kind: "develop" | "locker") {
  const [query,setQuery]=useProcessDraft(career,kind,"query","");
  const [position,setPosition]=useProcessDraft<Position | "any">(career,kind,"position","any");
  const [sort,setSort]=useProcessDraft<PlayerSort>(career,kind,"columnSort",{key:"age",descending:false});
  const rows=squadRows(career).filter(row=>(!query || foldText(row.name).includes(foldText(query))) && (position==="any" || row.position===position || row.alternates.includes(position))).sort((a,b)=>comparePlayers(a,b,sort));
  return {query,setQuery,position,setPosition,sort,setSort,rows};
}
function PickFilters({filters,t}:{filters:ReturnType<typeof usePickFilters>;t:TecnicoTranslator}) {
  return <><input type="search" className="search-input" value={filters.query} onChange={event=>filters.setQuery(event.target.value)} aria-label={revisionText(t.locale,"search")} placeholder={revisionText(t.locale,"search")} /><SortHeaders sort={filters.sort} onChange={filters.setSort} position={filters.position} onPosition={filters.setPosition} selection /></>;
}
