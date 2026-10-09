import { coachPlayerName } from "@craque/content/coach";
import {
  affordability,
  COACH_COUNTRIES,
  eventWeights,
  financeLabel,
  FINANCE,
  initialDivisionShare,
  seasonBudget,
  STAGE_EVENTS,
  wageBillOf,
} from "@craque/engine/coach";
import { type CountryCode, getClub } from "@craque/world";
import { FREE_PLAYERS, SQUAD_PLAYERS, type SquadPlayer } from "@craque/world/squads";
import { Dices } from "lucide-react";
import { useMemo, useState } from "react";
import { useTecnicoT } from "../../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { Crest } from "../../../ui/Media";
import { Chip } from "../../../ui/Signals";
import { OfferCard } from "../../tecnico/Offers";
import { LabSection } from "../LabSection";
import { CountrySelect, LabTable } from "./LabControls";
import { labCareer, labStarted } from "./labCareer";

const ORIGINS = ["f", "e", "k", "g"] as const;

/** 01. De onde vem cada jogador, por clube. */
export function SourcesSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, number } = t;
  const [country, setCountry] = useState<CountryCode>("BRA");
  const [open, setOpen] = useState<string | null>(null);
  const career = labCareer("lab-tecnico");
  const all = [...SQUAD_PLAYERS, ...FREE_PLAYERS];
  const counts = (list: readonly SquadPlayer[]) => Object.fromEntries(ORIGINS.map((origin) => [origin, list.filter((player) => player.origin === origin).length])) as Record<(typeof ORIGINS)[number], number>;
  const total = counts(all);
  const clubs = Object.values(career.clubs)
    .filter((club) => club.country === country)
    .sort((a, b) => a.division - b.division || b.strength - a.strength);
  const byClub = useMemo(() => {
    const map = new Map<string, SquadPlayer[]>();
    for (const player of SQUAD_PLAYERS) map.set(player.club, [...(map.get(player.club) ?? []), player]);
    return map;
  }, []);
  const squad = open ? [...(byClub.get(open) ?? [])].sort((a, b) => b.ovr - a.ovr) : [];

  return (
    <LabSection id="tec-fontes" index={index} title={tt("lab.sources.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.sources.lead")}</p>
      <p className="mb-2 text-sm">
        {tt("lab.sources.totals", {
          players: number(all.length),
          clubs: number(byClub.size),
          fc: number(total.f),
          ef: number(total.e),
          kb: number(total.k),
          gen: number(total.g),
        })}
      </p>
      <p className="mb-4 max-w-3xl text-xs text-faint">{tt("lab.sources.calibration")}</p>
      <div className="mb-3 max-w-xs">
        <CountrySelect value={country} onChange={setCountry} label={tt("lab.sources.country")} />
      </div>
      <LabTable
        head={[tt("lab.sources.club"), tt("lab.sources.division"), tt("lab.sources.strength"), tt("lab.sources.fc"), tt("lab.sources.ef"), tt("lab.sources.kb"), tt("lab.sources.gen")]}
        rows={clubs.map((club) => {
          const c = counts(byClub.get(club.id) ?? []);
          return [
            <button key="club" type="button" className="flex items-center gap-1.5 text-left underline-offset-2 hover:underline" onClick={() => setOpen(open === club.id ? null : club.id)}>
              <Crest club={club.id} size={16} decorative />
              {getClub(club.id)?.name}
            </button>,
            club.division,
            club.strength.toFixed(1),
            c.f,
            c.e,
            c.k,
            c.g,
          ];
        })}
      />
      {open ? (
        <div className="mt-4">
          <p className="eyebrow mb-2">
            {tt("lab.sources.squad")}: {getClub(open)?.name}
          </p>
          <LabTable
            head={["", "OVR", tt("common.age"), ""]}
            rows={squad.map((player) => [
              `${t.c(`positionAbbr.${player.position}`)} · ${coachPlayerName("lab-tecnico", player)}`,
              player.ovr,
              2026 - player.birthYear,
              <Chip key="o" size="sm" tone={player.origin === "g" ? "neutral" : "info"}>
                {tt(`lab.sources.origin.${player.origin}`)}
              </Chip>,
            ])}
          />
        </div>
      ) : null}
    </LabSection>
  );
}

/** 02. O sorteio 95/5 e as propostas de uma semente. */
export function DrawSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, percent, number } = t;
  const [careers, setCareers] = useState(20000);
  const [result, setResult] = useState<ReturnType<typeof initialDivisionShare> | null>(null);
  const [nation, setNation] = useState<CountryCode>("BRA");
  const [seed, setSeed] = useState("lab-ofertas-1");
  const career = labCareer(seed, nation);
  return (
    <LabSection id="tec-sorteio" index={index} title={tt("lab.draw.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.draw.lead")}</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="tec-select flex flex-col gap-1">
          <span className="eyebrow">{tt("lab.draw.careers")}</span>
          <select value={careers} onChange={(event) => setCareers(Number(event.target.value))}>
            {[1000, 5000, 20000, 50000].map((value) => (
              <option key={value} value={value}>
                {number(value)}
              </option>
            ))}
          </select>
        </label>
        <Button
          onClick={() => {
            feedback("tick");
            setResult(initialDivisionShare(`lab:${Date.now()}`, careers));
          }}
        >
          <Dices size={16} aria-hidden="true" />
          {tt("lab.run")}
        </Button>
      </div>
      {result ? (
        <dl className="mt-4 grid max-w-2xl grid-cols-3 gap-3">
          <div>
            <dt className="eyebrow">{tt("lab.draw.second")}</dt>
            <dd className="display numeric text-3xl font-black">{percent(result.second)}</dd>
            <dd className="text-2xs text-faint">{tt("lab.draw.expected", { value: "95%" })}</dd>
          </div>
          <div>
            <dt className="eyebrow">{tt("lab.draw.first")}</dt>
            <dd className="display numeric text-3xl font-black">{percent(1 - result.second)}</dd>
            <dd className="text-2xs text-faint">{tt("lab.draw.expected", { value: "5%" })}</dd>
          </div>
          <div>
            <dt className="eyebrow">{tt("lab.draw.anyFirst")}</dt>
            <dd className="display numeric text-3xl font-black">{percent(result.anyFirst)}</dd>
            <dd className="text-2xs text-faint">{tt("lab.draw.expected", { value: "14,3%" })}</dd>
          </div>
        </dl>
      ) : null}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <CountrySelect value={nation} onChange={setNation} label={tt("identity.nationality")} only={COACH_COUNTRIES} />
        <Button variant="secondary" onClick={() => setSeed(`lab-ofertas-${Date.now()}`)}>
          <Dices size={16} aria-hidden="true" />
          {tt("identity.randomize")}
        </Button>
      </div>
      <p className="eyebrow mt-4 mb-2">{tt("lab.draw.offers")}</p>
      <div className="grid gap-3 lg:grid-cols-3">
        {career.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} career={career} busy={false} onAccept={() => feedback("tick")} />
        ))}
      </div>
    </LabSection>
  );
}

/** Finanças por clube de um país, com a verba e os alvos ao alcance. */
export function FinanceSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, money } = t;
  const [country, setCountry] = useState<CountryCode>("BRA");
  const [rows, setRows] = useState<ReturnType<typeof affordability>[] | null>(null);
  const career = labCareer("lab-tecnico");
  const clubs = Object.values(career.clubs)
    .filter((club) => club.country === country)
    .sort((a, b) => a.division - b.division || b.strength - a.strength);
  return (
    <LabSection id="tec-financas" index={index} title={tt("lab.finance.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.finance.lead")}</p>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <CountrySelect
          value={country}
          onChange={(next) => {
            setCountry(next);
            setRows(null);
          }}
          label={tt("lab.sources.country")}
        />
        <Button variant="secondary" onClick={() => setRows(clubs.map((club) => affordability(career, club.id)))}>
          {tt("lab.finance.affordable")}
        </Button>
      </div>
      <LabTable
        head={[tt("lab.sources.club"), tt("club.revenue"), tt("club.wages"), tt("club.wageCap"), tt("club.budget"), tt("club.financeState"), tt("lab.finance.affordable")]}
        rows={clubs.map((club) => {
          const wages = wageBillOf(career, club.id);
          const reach = rows?.find((row) => row.club === club.id);
          return [
            `${getClub(club.id)?.name} (${club.division}ª)`,
            money(club.revenue),
            money(wages),
            money((club.revenue * FINANCE.wageCap) / 12),
            money(seasonBudget(club, 0)),
            t.g(`finance.${financeLabel(club, wages)}`),
            reach ? `${reach.affordable} / ${reach.targets}` : "-",
          ];
        })}
      />
    </LabSection>
  );
}

/** O catálogo de eventos com o peso de cada um no clube de referência. */
export function EventsSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt } = t;
  const career = labStarted("lab-tecnico");
  const weights = eventWeights(career);
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0);
  return (
    <LabSection id="tec-eventos" index={index} title={tt("lab.events.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.events.lead", { share: t.percent(STAGE_EVENTS.matchShare) })}</p>
      <LabTable
        head={["", tt("lab.events.kind"), tt("lab.events.weight")]}
        rows={weights.map((entry) => [
          <span key="n">
            <strong>{t.g(`events.${entry.id}.title`, { player: "…", buyer: "…", rival: "…", price: "…", amount: "…", raise: "…", cost: "…", injured: "…" })}</strong>
            <span className="block text-2xs text-muted">{t.g(`events.${entry.id}.body`, { player: "…", buyer: "…", rival: "…", price: "…", amount: "…", raise: "…", cost: "…", injured: "…" })}</span>
          </span>,
          tt(`event.kinds.${entry.kind}`),
          total > 0 ? t.percent((entry.weight / total) * (1 - STAGE_EVENTS.matchShare)) : "-",
        ])}
      />
    </LabSection>
  );
}
