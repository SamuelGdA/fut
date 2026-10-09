import {
  chanceTier,
  type CoachCareer,
  type CoachCommand,
  type ConfirmPayload,
  DEVELOP,
  demandOf,
  developable,
  fundsPreview,
  type Preview,
  purchaseChance,
  purchasePreview,
  PURCHASE,
  SALE,
  salePreview,
  type Sector,
  SECTORS,
  TALK_EFFECTS,
  TRAINING,
  valueOf,
} from "@craque/engine/coach";
import type { Position } from "@craque/engine";
import { getClub } from "@craque/world";
import { Check, Search, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { playerRow, type PlayerRow, squadRows } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { foldText } from "../../i18n/format";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { Sheet } from "../../ui/Overlays";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { ClubTag, EffectChips, NationFlag, PlayerLine } from "./shared";

type Run = (command: CoachCommand) => string | null;

const POSITIONS: readonly Position[] = ["gk", "rb", "cb", "lb", "cdm", "cm", "lm", "rm", "cam", "lw", "rw", "st"];
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
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={close} title={titles[kind]} description={leads[kind]} closeLabel={tt("common.close")}>
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
  const [selected, setSelected] = useState<string[]>([]);
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
    <div className="flex flex-col gap-4">
      {max > 0 && (kind !== "locker" || lockerMode === "talk") ? (
        <p className="flex items-center justify-between gap-2 text-xs text-muted">
          <span>{ttp("process.selectUpTo", max)}</span>
          <span className="numeric font-semibold text-fg">{ttp("process.selected", selected.length)}</span>
        </p>
      ) : null}
      {body}
      <div className="tec-sheet-footer">
        <Chip tone="info">{tt("process.usesAction")}</Chip>
        <Button
          disabled={!payload}
          onClick={() => {
            if (!payload) return;
            feedback("confirm");
            run({ type: "confirmAction", payload });
          }}
        >
          <Check size={16} aria-hidden="true" />
          {tt("process.confirm")}
        </Button>
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, disabled, children }: { checked: boolean; onToggle(): void; disabled?: string | null; children: ReactNode }) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled ? true : undefined}
        className="tec-pick"
        data-checked={checked || undefined}
        onClick={() => {
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
      </button>
      {disabled ? <p className="px-3 pb-1 text-2xs text-faint">{disabled}</p> : null}
    </li>
  );
}

function SellPick({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt, money } = t;
  const stage = `${career.year}:${career.half}`;
  const rows = squadRows(career);
  return (
    <ul className="tec-pick-list">
      {rows.map((row) => {
        const player = career.players[row.id];
        if (!player) return null;
        const demand = demandOf(career, player);
        const offered = player.offeredAt === stage;
        const legacy = career.legacy[row.id];
        const idol = (legacy?.apps ?? 0) >= 60;
        return (
          <CheckRow key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)} disabled={offered ? tt("process.blockers.notPending") : null}>
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
    </ul>
  );
}

function DevelopPick({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt } = t;
  const allowed = new Set(developable(career).map((player) => player.id));
  const rows = squadRows(career).sort((a, b) => a.age - b.age || b.ovr - a.ovr);
  return (
    <ul className="tec-pick-list">
      {rows.map((row) => (
        <CheckRow key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)} disabled={allowed.has(row.id) ? null : tt("develop.marked")}>
          <PlayerLine row={row} t={t}>
            <span>{tt(`squad.potential.${row.potentialHint}`)}</span>
          </PlayerLine>
        </CheckRow>
      ))}
    </ul>
  );
}

function BuySearch({ career, selected, toggle, t }: { career: CoachCareer; selected: string[]; toggle(id: string): void; t: TecnicoTranslator }) {
  const { tt, money, c } = t;
  const coach = career.coach;
  const club = coach ? career.clubs[coach.club] : null;
  const strength = Math.round(club?.strength ?? 60);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<Position | "any">("any");
  const [maxOvr, setMaxOvr] = useState(Math.min(99, strength + 4));
  const [affordable, setAffordable] = useState(true);
  const [impossible, setImpossible] = useState(false);

  const pool = useMemo(
    () =>
      Object.values(career.players)
        .filter((player) => player.club !== coach?.club && player.ovr >= strength - 12 && player.ovr <= strength + 20)
        .sort((a, b) => b.ovr - a.ovr || a.id.localeCompare(b.id)),
    [career.players, coach?.club, strength],
  );
  const folded = foldText(query);
  // Por padrão, só alvos possíveis: quem é quase impossível de trazer fica
  // escondido até o jogador pedir para ver (a chance continua na etiqueta).
  const rows: Array<{ row: PlayerRow; tier: ReturnType<typeof chanceTier> }> = [];
  for (const player of pool) {
    if (rows.length >= 120) break;
    if (player.ovr > maxOvr) continue;
    if (position !== "any" && player.position !== position && !player.alternates.includes(position)) continue;
    if (affordable && coach && valueOf(player, career.year) > coach.budget) continue;
    if (!coach) break;
    const tier = chanceTier(purchaseChance(career, player, coach.club).total);
    if (!impossible && tier === "veryHard") continue;
    const row = playerRow(career, player);
    if (folded && !foldText(row.name).includes(folded) && !foldText(getClub(player.club)?.name ?? "").includes(folded)) continue;
    rows.push({ row, tier });
  }
  // Primeiro quem tem chance de verdade, depois o OVR, depois os mais novos.
  const TIER_ORDER: Readonly<Record<ReturnType<typeof chanceTier>, number>> = { likely: 0, possible: 1, hard: 2, veryHard: 3 };
  rows.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || b.row.ovr - a.row.ovr || a.row.age - b.row.age);
  const chosen = selected.map((id) => career.players[id]).filter((player) => player !== undefined);

  return (
    <div className="flex flex-col gap-3">
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
      <div className="flex flex-wrap items-center gap-2">
        <label className="tec-select">
          <span className="sr-only">{tt("buy.filters.position")}</span>
          <select value={position} onChange={(event) => setPosition(event.target.value as Position | "any")}>
            <option value="any">
              {tt("buy.filters.position")}: {tt("buy.filters.any")}
            </option>
            {POSITIONS.map((item) => (
              <option key={item} value={item}>
                {c(`positionAbbr.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="tec-select">
          <span className="sr-only">{tt("buy.filters.maxOvr", { ovr: maxOvr })}</span>
          <select value={maxOvr} onChange={(event) => setMaxOvr(Number(event.target.value))}>
            {Array.from({ length: 21 }, (_, index) => strength - 4 + index).map((value) => (
              <option key={value} value={value}>
                {tt("buy.filters.maxOvr", { ovr: value })}
              </option>
            ))}
          </select>
        </label>
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
        <div className="flex flex-wrap gap-1.5">
          {chosen.map((player) => (
            <button key={player.id} type="button" className="tec-chosen" onClick={() => toggle(player.id)}>
              {playerRow(career, player).short}
              <X size={12} aria-label={tt("common.close")} />
            </button>
          ))}
        </div>
      ) : null}
      <p className="text-2xs text-faint">{tt("buy.tierHint")}</p>
      {rows.length === 0 ? (
        <p className="p-3 text-sm text-muted">{tt("process.emptySearch")}</p>
      ) : (
        <ul className="tec-pick-list">
          {rows.map(({ row, tier }) => {
            const player = career.players[row.id];
            if (!player) return null;
            return (
              <CheckRow key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)}>
                <PlayerLine row={row} t={t}>
                  {player.club ? <ClubTag club={player.club} size={14} /> : <span>{tt("buy.free")}</span>}
                  <span className="flex w-full flex-wrap items-center gap-2">
                    <Chip tone={TIER_TONE[tier]} size="sm" glyph>
                      {tt(`buy.tiers.${tier}`)}
                    </Chip>
                    <span className="numeric text-2xs font-semibold text-fg">{tt("common.estimate", { money: money(row.value) })}</span>
                  </span>
                </PlayerLine>
              </CheckRow>
            );
          })}
        </ul>
      )}
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
                {tt(`youth.descriptions.${candidate.description}`)}
              </span>
              <span className="text-2xs text-muted">
                {tt("common.years", { age })}
                {candidate.trait ? ` · ${tt(`squad.traits.${candidate.trait}.name`)}` : ""}
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
  const rows = squadRows(career).sort((a, b) => ["unhappy", "neutral", "happy"].indexOf(a.mood) - ["unhappy", "neutral", "happy"].indexOf(b.mood));
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
        <ul className="tec-pick-list">
          {rows.map((row) => (
            <CheckRow key={row.id} checked={selected.includes(row.id)} onToggle={() => toggle(row.id)}>
              <PlayerLine row={row} t={t} right={<MoodChip mood={row.mood} t={t} />}>
                <span>{tt(`squad.roles.${row.role}`)}</span>
              </PlayerLine>
            </CheckRow>
          ))}
        </ul>
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

function Impact({ preview, t }: { preview: Preview; t: TecnicoTranslator }) {
  const { tt, money } = t;
  return (
    <dl className="tec-impact">
      <div>
        <dt>{tt("process.impact.budget")}</dt>
        <dd className={preview.budgetAfter < 0 ? "text-bad" : undefined}>{money(preview.budgetAfter)}</dd>
      </div>
      <div>
        <dt>{tt("process.impact.cash")}</dt>
        <dd className={preview.cashAfter < 0 ? "text-bad" : undefined}>{money(preview.cashAfter)}</dd>
      </div>
      <div>
        <dt>{tt("process.impact.wages")}</dt>
        <dd className={preview.wageBillAfter > preview.wageCap ? "text-bad" : undefined}>{tt("common.perMonth", { money: money(preview.wageBillAfter) })}</dd>
      </div>
      <p className="col-span-full text-2xs text-faint">{tt("process.impact.cap", { money: money(preview.wageCap) })}</p>
    </dl>
  );
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
  const flow = career.flow;
  if (!flow) return null;
  const respond = (item: string, decision: "accept" | "decline" | string) => {
    feedback(decision === "decline" ? "back" : "confirm");
    run({ type: "respond", item, decision });
  };
  const playerName = (id: string) => {
    const player = career.players[id];
    return player ? playerRow(career, player).name : id;
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
                  <Impact preview={preview} t={t} />
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
                  <Impact preview={preview} t={t} />
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
    body = (
      <ul className="flex flex-col gap-2">
        {flow.talks.map((talk) => (
          <li key={talk.id} className="tec-response">
            <p className="font-semibold">{playerName(talk.player)}</p>
            <p className="text-sm">
              <span className="text-muted">{tt("locker.concern")}: </span>
              {t.g(`talks.concerns.${talk.concern}`)}
            </p>
            {talk.immediate > 0 ? <p className="text-xs text-good">{t.g("talks.immediate")}</p> : null}
            {talk.chosen ? (
              <p className={cn("mt-1 text-sm", talk.outcome === "good" ? "text-good" : "text-bad")}>
                {t.g(`talks.options.${talk.chosen}.${talk.outcome === "good" ? "good" : "bad"}`)}
              </p>
            ) : (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="eyebrow">{tt("locker.choose")}</p>
                {talk.options.map((option) => {
                  const effect = TALK_EFFECTS[option];
                  return (
                    <button key={option} type="button" className="tec-choice tec-choice-row" onClick={() => respond(talk.id, option)}>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block font-semibold">{t.g(`talks.options.${option}.label`)}</span>
                        {effect ? <EffectChips effects={effect.success} t={t} /> : null}
                      </span>
                      <span className="text-2xs text-muted">
                        {effect?.chance === null || effect?.chance === undefined ? tt("event.noRisk") : tt("event.chance", { percent: t.percent(effect.chance) })}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  } else if (flow.kind === "locker" && flow.meeting) {
    const meeting = flow.meeting;
    body = (
      <p className={cn("tec-response text-sm", meeting.outcome === "good" ? "text-good" : "text-bad")}>
        {meeting.choice ? t.g(`meeting.${meeting.choice}.${meeting.outcome === "good" ? "good" : "bad"}`) : null}
      </p>
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
    <div className="flex flex-col gap-4">
      <p className="eyebrow">{tt("process.responses")}</p>
      {body}
      <div className="tec-sheet-footer">
        <span className="text-xs text-faint">{pending ? tt("process.concludeHint") : null}</span>
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
