import { type CoachCareer, registrationRule } from "@craque/engine/coach";
import { getCountry } from "@craque/world";
import { useState } from "react";
import { type PlayerRow, squadRows } from "../../features/tecnico/view";
import { type TecnicoTranslator, useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Sheet } from "../../ui/Overlays";
import { SectionRule } from "../../ui/Panel";
import { Segmented } from "../../ui/Segmented";
import { Chip } from "../../ui/Signals";
import type { Tone } from "../../ui/tone";
import { MoodChip } from "./Process";
import { Fact, PlayerLine } from "./shared";

type Sort = "position" | "ovr" | "age" | "value";

const FORM_TONE: Readonly<Record<PlayerRow["form"], Tone>> = { great: "good", good: "good", normal: "neutral", poor: "bad", awful: "bad" };

/** Pílulas de estado de um jogador: lesão, promessa, à venda, desenvolvido, base. */
export function StatusChips({ row, t }: { row: PlayerRow; t: TecnicoTranslator }) {
  const { tt, ttp } = t;
  return (
    <>
      {row.injuryDays !== null ? (
        <Chip tone="bad" size="sm" glyph>
          {tt("squad.injured", { days: ttp("common.days", row.injuryDays) })}
        </Chip>
      ) : null}
      {row.promised ? <Chip tone="info" size="sm">{tt("squad.promised")}</Chip> : null}
      {row.listed ? <Chip size="sm">{tt("squad.listed")}</Chip> : null}
      {row.developed ? <Chip tone="info" size="sm">{tt("develop.marked")}</Chip> : null}
      {row.youthProduct ? <Chip tone="glory" size="sm">{tt("squad.youthProduct")}</Chip> : null}
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
  const [sort, setSort] = useState<Sort>("position");
  const [open, setOpen] = useState<string | null>(null);
  const coach = career.coach;
  if (!coach) return null;
  const club = career.clubs[coach.club];
  const rule = registrationRule(club?.country ?? "BRA");
  const rows = squadRows(career);
  const sorted =
    sort === "position"
      ? rows
      : [...rows].sort((a, b) => (sort === "ovr" ? b.ovr - a.ovr : sort === "age" ? a.age - b.age : b.value - a.value) || a.name.localeCompare(b.name));
  const selected = rows.find((row) => row.id === open) ?? null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="tec-squad-title">
      <SectionRule as="h2" aside={<span className="numeric text-xs text-muted">{ttp("squad.count", rows.length)}</span>}>
        <span id="tec-squad-title">{tt("squad.title")}</span>
      </SectionRule>
      <p className="text-2xs text-faint">{tt("squad.registeredHint", { senior: rule.senior, age: rule.youthAge })}</p>
      {rows.some((row) => row.fictional) ? <p className="text-2xs text-faint">◆ {tt("common.fictionalHint")}</p> : null}
      <Segmented<Sort>
        size="sm"
        label={tt("squad.title")}
        value={sort}
        onValueChange={(next) => {
          setSort(next);
          feedback("tick");
        }}
        options={(["position", "ovr", "age", "value"] as const).map((value) => ({ value, label: tt(`squad.sort.${value}`) }))}
      />
      <ul className="flex flex-col">
        {sorted.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              className="tec-row"
              onClick={() => {
                feedback("select");
                setOpen(row.id);
              }}
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
            </button>
          </li>
        ))}
      </ul>
      {selected ? <PlayerSheet career={career} row={selected} open onOpenChange={(next) => !next && setOpen(null)} /> : null}
    </section>
  );
}

/** A ficha completa de um jogador (spec 7). */
export function PlayerSheet({ career, row, open, onOpenChange }: { career: CoachCareer; row: PlayerRow; open: boolean; onOpenChange(open: boolean): void }) {
  const t = useTecnicoT();
  const { tt, ttp, money, c, locale } = t;
  const country = getCountry(row.nationality);
  const legacy = career.legacy[row.id];
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={row.name} description={`${c(`positionAbbr.${row.position}`)} · OVR ${row.ovr}`} closeLabel={tt("common.close")}>
      <div className="flex flex-wrap gap-1.5">
        <Chip tone="info">{tt(`squad.roles.${row.role}`)}</Chip>
        <MoodChip mood={row.mood} t={t} />
        <Chip tone={FORM_TONE[row.form]} glyph>
          {tt(`squad.forms.${row.form}`)}
        </Chip>
        <StatusChips row={row} t={t} />
        {row.fictional ? <Chip>{tt("common.fictional")}</Chip> : null}
      </div>
      <dl className="mt-3">
        <Fact label={tt("player.nationality")}>{country?.names[locale] ?? row.nationality}</Fact>
        <Fact label={tt("player.positions")}>{[row.position, ...row.alternates].map((position) => c(`positionAbbr.${position}`)).join(", ")}</Fact>
        <Fact label={tt("common.age")}>{tt("common.years", { age: row.age })}</Fact>
        <Fact label={tt("common.value")}>{tt("common.estimate", { money: money(row.value) })}</Fact>
        <Fact label={tt("common.wage")}>{tt("common.perMonth", { money: money(row.wage) })}</Fact>
        <Fact label={tt("squad.roleHint")}>{tt(`squad.roles.${row.role}`)}</Fact>
        <Fact label={tt("develop.title")}>{tt(`squad.potential.${row.potentialHint}`)}</Fact>
        <Fact label={tt("player.contract", { year: row.joinedYear })}>{row.registered ? tt("squad.registered") : tt("squad.notRegistered")}</Fact>
      </dl>
      <p className="mt-1 text-2xs text-faint">{tt("player.estimateHint")}</p>
      {row.traits.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {row.traits.map((trait) => (
            <li key={trait} className="text-sm">
              <strong>{tt(`squad.traits.${trait}.name`)}</strong>: <span className="text-muted">{tt(`squad.traits.${trait}.hint`)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <SectionRule className="mt-4">{tt("player.season")}</SectionRule>
      <dl className="mt-1 grid grid-cols-5 gap-2 text-center">
        {(["apps", "starts", "goals", "assists"] as const).map((key) => (
          <div key={key}>
            <dt className="eyebrow">{tt(`squad.stats.${key}`)}</dt>
            <dd className="numeric text-lg font-bold">{row.season[key]}</dd>
          </div>
        ))}
        <div>
          <dt className="eyebrow">{tt("squad.stats.rating")}</dt>
          <dd className="numeric text-lg font-bold">{row.season.rating ?? "-"}</dd>
        </div>
      </dl>
      {legacy ? (
        <>
          <SectionRule className="mt-4">{tt("player.career")}</SectionRule>
          <p className="mt-1 text-sm">
            {legacy.apps} {tt("squad.stats.apps").toLowerCase()} · {legacy.goals} {tt("squad.stats.goals").toLowerCase()} · {ttp("player.seasons", legacy.seasons)}
          </p>
        </>
      ) : null}
    </Sheet>
  );
}
