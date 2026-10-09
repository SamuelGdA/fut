import { coachPlayerName } from "@craque/content/coach";
import {
  attractiveness,
  chanceTier,
  clubDuel,
  clubRatings,
  type CoachPlayer,
  developCandidates,
  developTrial,
  matchOdds,
  output,
  PHILOSOPHIES,
  type Philosophy,
  paceTrial,
  philosophyGrid,
  purchaseChance,
  purchaseCurve,
  SATISFACTION,
} from "@craque/engine/coach";
import { foldText } from "../../../i18n/format";
import { getClub } from "@craque/world";
import { useState } from "react";
import { useTecnicoT } from "../../../i18n/tecnico/useTecnicoT";
import { Button } from "../../../ui/Button";
import { StepSlider } from "../../../ui/Fields";
import { Segmented } from "../../../ui/Segmented";
import { Chip } from "../../../ui/Signals";
import { MoodChip } from "../../tecnico/Process";
import { LabSection } from "../LabSection";
import { ClubSelect, LabTable } from "./LabControls";
import { labCareer } from "./labCareer";

const SEED = "lab-tecnico";

/** Simulador exato de partida, com o teste dos elencos trocados e a Europa contra a América do Sul. */
export function MatchSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, percent } = t;
  const career = labCareer(SEED);
  const [home, setHome] = useState("flamengo");
  const [away, setAway] = useState("real-madrid");
  const [venue, setVenue] = useState<"home" | "away" | "neutral">("neutral");
  const [philosophies, setPhilosophies] = useState<[Philosophy, Philosophy]>(["possession", "possession"]);
  const a = clubRatings(career, home);
  const b = clubRatings(career, away);
  const odds = matchOdds(a, b, philosophies, venue);
  const swapped = matchOdds(b, a, philosophies, venue);
  const top = (country: string, count: number) =>
    Object.values(career.clubs)
      .filter((club) => club.country === country && club.division === 1)
      .sort((x, y) => y.strength - x.strength)
      .slice(0, count)
      .map((club) => club.id);
  const europe = [...top("ESP", 2), ...top("ENG", 2)];
  const south = [...top("BRA", 2), ...top("ARG", 1)];
  const duels = europe.flatMap((x) => south.map((y) => clubDuel(career, x, y)));
  const sectors = (ratings: typeof a) => [ratings.gk, ratings.def, ratings.mid, ratings.att].map((value) => value.toFixed(1)).join(" · ");
  const philosophyOptions = PHILOSOPHIES.map((value) => ({ value, label: tt(`team.philosophies.${value}.name`) }));

  return (
    <LabSection id="tec-partida" index={index} title={tt("lab.match.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.match.lead")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <ClubSelect value={home} onChange={setHome} label={tt("lab.match.home")} />
          <Segmented<Philosophy> size="sm" label={tt("team.philosophy")} value={philosophies[0]} onValueChange={(value) => setPhilosophies([value, philosophies[1]])} options={philosophyOptions} />
          <p className="text-2xs text-faint">
            {tt("lab.match.sectors")}: {sectors(a)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <ClubSelect value={away} onChange={setAway} label={tt("lab.match.away")} />
          <Segmented<Philosophy> size="sm" label={tt("team.philosophy")} value={philosophies[1]} onValueChange={(value) => setPhilosophies([philosophies[0], value])} options={philosophyOptions} />
          <p className="text-2xs text-faint">
            {tt("lab.match.sectors")}: {sectors(b)}
          </p>
        </div>
      </div>
      <div className="mt-3 max-w-md">
        <Segmented<"home" | "away" | "neutral">
          size="sm"
          label={tt("lab.match.venue")}
          value={venue}
          onValueChange={setVenue}
          options={[
            { value: "home", label: tt("competitions.home") },
            { value: "neutral", label: tt("competitions.neutral") },
            { value: "away", label: tt("competitions.away") },
          ]}
        />
      </div>
      <LabTable
        className="mt-3"
        head={["", tt("lab.match.win"), tt("lab.match.draw"), tt("lab.match.loss"), tt("lab.match.advance"), tt("lab.match.xg")]}
        rows={[
          [getClub(home)?.name ?? home, percent(odds.win), percent(odds.draw), percent(odds.loss), percent(odds.advance), `${odds.goalsFor.toFixed(2)} × ${odds.goalsAgainst.toFixed(2)}`],
          [tt("lab.match.swapped"), percent(swapped.win), percent(swapped.draw), percent(swapped.loss), percent(swapped.advance), `${swapped.goalsFor.toFixed(2)} × ${swapped.goalsAgainst.toFixed(2)}`],
        ]}
      />
      <p className="eyebrow mt-6 mb-1">{tt("lab.match.continents")}</p>
      <p className="mb-2 max-w-3xl text-xs text-muted">{tt("lab.match.continentsLead")}</p>
      <LabTable
        head={["", tt("lab.sources.strength"), "", tt("lab.sources.strength"), tt("lab.match.win"), tt("lab.match.draw"), tt("lab.match.loss"), tt("lab.match.advance")]}
        rows={duels.map((duel) => [
          getClub(duel.a)?.name ?? duel.a,
          duel.strengthA.toFixed(1),
          getClub(duel.b)?.name ?? duel.b,
          duel.strengthB.toFixed(1),
          percent(duel.odds.win),
          percent(duel.odds.draw),
          percent(duel.odds.loss),
          percent(duel.odds.advance),
        ])}
      />
    </LabSection>
  );
}

/** Quadro das filosofias por faixa de força. */
export function PhilosophySection({ index }: { index: number }) {
  const { tt } = useTecnicoT();
  const grid = philosophyGrid([-12, -8, -5, -3, 0, 3, 5, 8, 12]);
  return (
    <LabSection id="tec-filosofias" index={index} title={tt("lab.philosophies.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.philosophies.lead")}</p>
      <LabTable
        head={[tt("lab.philosophies.gap"), ...PHILOSOPHIES.map((value) => tt(`team.philosophies.${value}.name`)), tt("lab.philosophies.best")]}
        rows={grid.map((row) => [
          `${row.gap > 0 ? "+" : ""}${row.gap}`,
          ...PHILOSOPHIES.map((value) => (
            <span key={value} className={value === row.best ? "font-bold text-good" : undefined}>
              {row.points[value].toFixed(3)}
            </span>
          )),
          tt(`team.philosophies.${row.best}.name`),
        ])}
      />
    </LabSection>
  );
}

/** A conta da contratação com cada fator, e a curva do comprador. */
export function PurchaseSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, percent } = t;
  const career = labCareer(SEED);
  const [buyer, setBuyer] = useState("flamengo");
  const [query, setQuery] = useState("Mbappé");
  const [target, setTarget] = useState<string | null>(null);
  const folded = foldText(query);
  const matches: CoachPlayer[] =
    folded.length >= 3
      ? Object.values(career.players)
          .filter((player) => player.name && foldText(player.name).includes(folded))
          .sort((a, b) => b.ovr - a.ovr)
          .slice(0, 8)
      : [];
  const player = target ? career.players[target] : matches[0];
  const breakdown = player ? purchaseChance(career, player, buyer) : null;
  const appeal = attractiveness(career, buyer, false);
  const curve = purchaseCurve(career, buyer, [-2, 0, 2, 4, 6, 8, 10, 12, 15]);
  const fmt = (value: number) => (value < 0.01 ? `${(value * 100).toFixed(3)}%` : percent(value));

  return (
    <LabSection id="tec-contratacao" index={index} title={tt("lab.purchase.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.purchase.lead")}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ClubSelect value={buyer} onChange={setBuyer} label={tt("lab.purchase.buyer")} />
        <label className="flex flex-col gap-1">
          <span className="eyebrow">{tt("lab.purchase.target")}</span>
          <input
            type="search"
            className="search-input"
            value={query}
            placeholder={tt("lab.purchase.search")}
            onChange={(event) => {
              setQuery(event.target.value);
              setTarget(null);
            }}
          />
        </label>
      </div>
      {matches.length > 1 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((item) => (
            <button key={item.id} type="button" className="tec-chosen" data-active={item.id === player?.id || undefined} onClick={() => setTarget(item.id)}>
              {item.name} · {item.ovr}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid max-w-3xl gap-x-6 sm:grid-cols-2">
        <div>
          <p className="eyebrow mb-1">{tt("lab.purchase.attractiveness")}</p>
          <LabTable
            head={["", ""]}
            rows={[
              [tt("lab.purchase.parts.strength"), appeal.strength.toFixed(1)],
              [tt("lab.purchase.parts.prestige"), appeal.prestige.toFixed(1)],
              [tt("lab.purchase.parts.league"), appeal.league.toFixed(1)],
              [tt("lab.purchase.parts.continental"), appeal.continental.toFixed(1)],
              [tt("lab.purchase.parts.reputation"), appeal.reputation.toFixed(1)],
              [<strong key="t">Total</strong>, <strong key="v">{appeal.total.toFixed(1)}</strong>],
            ]}
          />
        </div>
        {player && breakdown ? (
          <div>
            <p className="eyebrow mb-1">
              {coachPlayerName(SEED, player)} · OVR {player.ovr} · {getClub(player.club)?.name ?? "-"}
            </p>
            <LabTable
              head={["", ""]}
              rows={[
                [tt("lab.purchase.expectation"), breakdown.expectation.toFixed(1)],
                [tt("lab.purchase.gap"), breakdown.gap.toFixed(1)],
                [tt("lab.purchase.levelFactor"), fmt(breakdown.levelFactor)],
                [tt("lab.purchase.stepDown"), breakdown.stepDown.toFixed(1)],
                [tt("lab.purchase.stepFactor"), fmt(breakdown.stepFactor)],
                [tt("lab.purchase.starFactor"), fmt(breakdown.starFactor)],
                [tt("lab.purchase.roleFactor"), `× ${breakdown.roleFactor}`],
                [tt("lab.purchase.playerChance"), fmt(breakdown.playerChance)],
                [tt("lab.purchase.clubChance"), fmt(breakdown.clubChance)],
                [<strong key="t">{tt("lab.purchase.total")}</strong>, <strong key="v">{fmt(breakdown.total)}</strong>],
                [tt("lab.purchase.tier"), tt(`buy.tiers.${chanceTier(breakdown.total)}`)],
              ]}
            />
          </div>
        ) : null}
      </div>
      <p className="eyebrow mt-6 mb-1">{tt("lab.purchase.curve")}</p>
      <p className="mb-2 text-xs text-muted">{tt("lab.purchase.curveLead")}</p>
      <LabTable
        head={curve.map((point) => `${point.gap > 0 ? "+" : ""}${point.gap}`)}
        rows={[curve.map((point) => (point.players ? fmt(point.median) : "-")), curve.map((point) => `(${point.players})`)]}
      />
    </LabSection>
  );
}

/** Desenvolver contra não desenvolver, e rápido contra lento. */
export function DevelopSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt, percent } = t;
  const career = labCareer(SEED);
  const [rows, setRows] = useState<Array<{ label: string; trial: ReturnType<typeof developTrial> }> | null>(null);
  const [pace, setPace] = useState<ReturnType<typeof paceTrial> | null>(null);
  const run = () => {
    const band = (min: number, max: number) => developCandidates(career, max, 3).filter((player) => career.year - player.birthYear >= min);
    setRows([
      { label: "≤ 21", trial: developTrial(career, band(0, 21), 1) },
      { label: "22-25", trial: developTrial(career, band(22, 25), 1) },
      { label: "26-29", trial: developTrial(career, band(26, 29), 1) },
    ]);
    setPace(paceTrial(career, Object.values(career.players).filter((player) => player.club).slice(0, 4000)));
  };
  return (
    <LabSection id="tec-desenvolver" index={index} title={tt("lab.develop.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.develop.lead")}</p>
      <Button variant="secondary" onClick={run}>
        {tt("lab.run")}
      </Button>
      {rows ? (
        <LabTable
          className="mt-3"
          head={[tt("lab.develop.group"), `${tt("lab.develop.up")} (${tt("lab.develop.with")})`, `${tt("lab.develop.up")} (${tt("lab.develop.without")})`, `${tt("lab.develop.gain")} (${tt("lab.develop.with")})`, `${tt("lab.develop.gain")} (${tt("lab.develop.without")})`]}
          rows={rows.map((row) => [
            `${row.label} (${row.trial.players})`,
            percent(row.trial.treated),
            percent(row.trial.control),
            row.trial.gainTreated.toFixed(2),
            row.trial.gainControl.toFixed(2),
          ])}
        />
      ) : null}
      {pace ? <p className="mt-2 text-sm">{tt("lab.develop.pace", { fast: pace.fast.toFixed(2), slow: pace.slow.toFixed(2) })}</p> : null}
    </LabSection>
  );
}

/** O rendimento escondido de um jogador pela satisfação e pela fase. */
export function OutputSection({ index }: { index: number }) {
  const t = useTecnicoT();
  const { tt } = t;
  const career = labCareer(SEED);
  const [ovr, setOvr] = useState(75);
  const [satisfaction, setSatisfaction] = useState(35);
  const [form, setForm] = useState(0);
  const base = Object.values(career.players).find((player) => player.position === "st" && player.traits.length === 0);
  if (!base) return null;
  const player: CoachPlayer = { ...base, level: ovr, ovr, satisfaction, form };
  const plays = output(player, { slot: "st", big: false, derby: false });
  const mood = satisfaction >= SATISFACTION.happy ? "happy" : satisfaction < SATISFACTION.unhappy ? "unhappy" : "neutral";
  return (
    <LabSection id="tec-rendimento" index={index} title={tt("lab.output.title")}>
      <p className="mb-3 max-w-3xl text-sm text-muted">{tt("lab.output.lead")}</p>
      <div className="grid max-w-3xl gap-5 sm:grid-cols-3">
        <div>
          <p className="eyebrow mb-2">
            {tt("lab.output.ovr")}: {ovr}
          </p>
          <StepSlider value={ovr} min={60} max={90} label={tt("lab.output.ovr")} valueText={String(ovr)} onValueChange={setOvr} />
        </div>
        <div>
          <p className="eyebrow mb-2">
            {tt("lab.output.satisfaction")}: {satisfaction}
          </p>
          <StepSlider value={Math.round(satisfaction / 5)} min={0} max={20} label={tt("lab.output.satisfaction")} valueText={String(satisfaction)} onValueChange={(value) => setSatisfaction(value * 5)} />
        </div>
        <div>
          <p className="eyebrow mb-2">
            {tt("lab.output.form")}: {form > 0 ? `+${form}` : form}
          </p>
          <StepSlider value={form + 2} min={0} max={4} label={tt("lab.output.form")} valueText={String(form)} onValueChange={(value) => setForm(value - 2)} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="eyebrow">{tt("lab.output.mood")}</span>
        <MoodChip mood={mood} t={t} />
        <span className="eyebrow">{tt("lab.output.plays")}</span>
        <Chip tone={plays < ovr ? "bad" : plays > ovr ? "good" : "neutral"}>{plays}</Chip>
      </div>
    </LabSection>
  );
}
