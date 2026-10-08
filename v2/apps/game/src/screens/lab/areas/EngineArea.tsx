import {
  baseMarketValue,
  CLUB_POLICIES,
  type ClubPolicy,
  type DevelopmentRun,
  type Difficulty,
  FOCUS_POLICIES,
  type FocusPolicy,
  isGoalkeeper,
  KEEPER_ATTRIBUTES,
  OUTFIELD_ATTRIBUTES,
  type Pace,
  type Position,
  POSITIONS,
  scoutReading,
  TALENT_BANDS,
  type TalentBand,
} from "@craque/engine";
import { Dices } from "lucide-react";
import { type ReactNode, useState } from "react";
import { type Translator, useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { StepSlider } from "../../../ui/Fields";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Chip, Delta } from "../../../ui/Signals";
import { AttributeBar, StatTile } from "../../../ui/Stats";
import { type ChoiceOption, ChoiceStrip } from "../ChoiceStrip";
import { EvolutionChart } from "../engine/EvolutionChart";
import { developPlayer, type EngineSetup, findSeed, populationBand } from "../engine/population";

const FIRST_AGE = 16;

const INITIAL_SETUP: EngineSetup = {
  position: "st",
  band: "any",
  difficulty: "normal",
  pace: "intense",
  club: "balanced",
  focus: "best",
  draw: 1,
};

function peakOf(run: DevelopmentRun): { ovr: number; age: number } {
  let best = { ovr: Number.NEGATIVE_INFINITY, age: FIRST_AGE };
  for (const season of run.seasons) if (season.ovr > best.ovr) best = { ovr: season.ovr, age: season.age };
  return best;
}

function attributeLabels(position: Position, t: Translator["t"]) {
  return isGoalkeeper(position)
    ? KEEPER_ATTRIBUTES.map((key) => ({
        abbr: t(`attributes.keeper.${key}.abbr`),
        name: t(`attributes.keeper.${key}.name`),
      }))
    : OUTFIELD_ATTRIBUTES.map((key) => ({
        abbr: t(`attributes.outfield.${key}.abbr`),
        name: t(`attributes.outfield.${key}.name`),
      }));
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  );
}

/** Os controles: tudo que muda a carreira simulada. */
function Controls({ setup, onChange }: { setup: EngineSetup; onChange(next: Partial<EngineSetup>): void }) {
  const { t, c } = useT();

  const positions: ChoiceOption<Position>[] = POSITIONS.map((position) => ({
    value: position,
    label: c(`positionAbbr.${position}`),
    ariaLabel: c(`positions.${position}`),
  }));
  const bands: ChoiceOption<TalentBand | "any">[] = [
    { value: "any", label: t("lab.engine.talentAny") },
    ...TALENT_BANDS.map((band) => ({ value: band, label: c(`talents.${band}`) })),
  ];
  const clubs: ChoiceOption<ClubPolicy>[] = CLUB_POLICIES.map((policy) => ({
    value: policy,
    label: t(`lab.engine.policies.${policy}`),
  }));
  const focuses: ChoiceOption<FocusPolicy>[] = FOCUS_POLICIES.map((policy) => ({
    value: policy,
    label: t(`lab.engine.focusPolicies.${policy}`),
  }));

  return (
    <Panel title={t("lab.engine.setup")}>
      <div className="flex flex-col gap-5">
        <Field label={t("lab.engine.position")}>
          <ChoiceStrip<Position>
            value={setup.position}
            onValueChange={(position) => onChange({ position })}
            options={positions}
            label={t("lab.engine.position")}
          />
        </Field>
        <Field label={t("lab.engine.talent")}>
          <ChoiceStrip<TalentBand | "any">
            value={setup.band}
            onValueChange={(band) => onChange({ band })}
            options={bands}
            label={t("lab.engine.talent")}
          />
        </Field>
        <div className="flex flex-wrap gap-x-6 gap-y-5">
          <Field label={t("lab.engine.difficulty")}>
            <Segmented<Difficulty>
              value={setup.difficulty}
              onValueChange={(difficulty) => onChange({ difficulty })}
              label={t("lab.engine.difficulty")}
              size="sm"
              options={[
                { value: "normal", label: t("difficulty.normal.name") },
                { value: "hard", label: t("difficulty.hard.name"), tone: "bad" },
              ]}
            />
          </Field>
          <Field label={t("lab.engine.pace")}>
            <Segmented<Pace>
              value={setup.pace}
              onValueChange={(pace) => onChange({ pace })}
              label={t("lab.engine.pace")}
              size="sm"
              options={[
                { value: "normal", label: t("pace.normal.name") },
                { value: "intense", label: t("pace.intense.name") },
              ]}
            />
          </Field>
        </div>
        <Field label={t("lab.engine.club")}>
          <ChoiceStrip<ClubPolicy>
            value={setup.club}
            onValueChange={(club) => onChange({ club })}
            options={clubs}
            label={t("lab.engine.club")}
          />
        </Field>
        <Field label={t("lab.engine.focus")}>
          <ChoiceStrip<FocusPolicy>
            value={setup.focus}
            onValueChange={(focus) => onChange({ focus })}
            options={focuses}
            label={t("lab.engine.focus")}
          />
        </Field>
      </div>
    </Panel>
  );
}

/** O jogador sorteado: o que o jogo esconde e o laboratório mostra. */
function Identity({ run, seed, onAnother }: { run: DevelopmentRun; seed: string; onAnother(): void }) {
  const { t, c, number } = useT();
  const { born } = run;
  const peak = peakOf(run);
  return (
    <Panel
      title={t("lab.engine.player")}
      aside={
        <Button size="sm" variant="secondary" onClick={onAnother}>
          <Dices size={16} aria-hidden="true" />
          {t("lab.engine.another")}
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone="glory" variant="solid">
          {c(`talents.${born.talent}`)}
        </Chip>
        <Chip variant="outline">{c(`traits.${born.trait}`)}</Chip>
        <Chip variant="outline">
          {t("lab.engine.maturity")}: {t(`lab.engine.maturities.${born.maturity}`)}
        </Chip>
        {born.prodigy ? (
          <Chip tone="good" variant="soft" glyph>
            {t("lab.engine.prodigy")}
          </Chip>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatTile
          label={t("lab.engine.potential")}
          value={number(born.potential, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          hint={t("lab.engine.potentialHint")}
        />
        <StatTile label={t("lab.engine.peakAt", { age: peak.age })} value={peak.ovr} />
        <StatTile label="OVR 16" value={run.ovrAtStart} className="col-span-2 sm:col-span-1" />
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-faint">
        {t("lab.engine.seed")} <code className="code-pill break-all">{seed}</code>
      </p>
    </Panel>
  );
}

/** A carta numa idade escolhida, com o contexto daquela temporada. */
function SeasonCard({ run, seed, age }: { run: DevelopmentRun; seed: string; age: number }) {
  const { t, c, tp, money } = useT();
  const index = age - FIRST_AGE;
  const season = run.seasons[index];
  if (!season) return null;
  const previous = index === 0 ? run.ovrAtStart : (run.seasons[index - 1]?.ovr ?? season.ovr);
  const labels = attributeLabels(run.input.position, t);
  const careerGames = run.seasons.slice(0, index + 1).reduce((total, item) => total + item.games, 0);
  const reading = scoutReading(seed, run.born.talent, age, careerGames);
  const readingText =
    reading.bands.length === 0
      ? t("lab.engine.scoutLevels.observing")
      : `${t(`lab.engine.scoutLevels.${reading.level}`)}: ${reading.bands.map((band) => c(`talents.${band}`)).join(" / ")}${
          reading.level === "certain" ? "" : "?"
        }`;

  return (
    <Panel title={t("lab.engine.atAge", { age })}>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <span className="display numeric text-score leading-none font-black">{season.ovr}</span>
        <Delta value={season.ovr - previous} className="mb-2" />
        <div className="mb-1.5 flex flex-wrap gap-2">
          <Chip variant="outline">{c(`roles.${season.role}`)}</Chip>
          {season.form === "normal" ? null : (
            <Chip tone={season.form === "explosion" ? "good" : "bad"} glyph>
              {t(`forms.${season.form}`)}
            </Chip>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">
        {t("lab.engine.clubStrength", { value: season.clubStrength })}
        <span aria-hidden="true"> · </span>
        {tp("units.games", season.games)}
        <span aria-hidden="true"> · </span>
        {t("lab.engine.value")} {money(baseMarketValue(season.ovr, age))}
      </p>
      <div className="mt-5 flex flex-col gap-2.5">
        {season.attributes.map((value, slot) => (
          <AttributeBar key={slot} abbr={labels[slot]?.abbr ?? ""} name={labels[slot]?.name ?? ""} value={value} />
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        <span className="eyebrow mr-2">{t("lab.engine.scout", { age })}</span>
        {readingText}
      </p>
    </Panel>
  );
}

function SeasonTable({ run, selectedAge, onSelect }: { run: DevelopmentRun; selectedAge: number; onSelect(age: number): void }) {
  const { t, c } = useT();
  return (
    <section aria-labelledby="motor-temporadas" className="flex flex-col gap-4">
      <SectionRule as="h3">
        <span id="motor-temporadas">{t("lab.engine.seasons")}</span>
      </SectionRule>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="pb-2 pr-3 font-normal">
              <span className="eyebrow">{t("lab.engine.columns.age")}</span>
            </th>
            <th scope="col" className="pb-2 font-normal">
              <span className="eyebrow">{t("lab.engine.columns.club")}</span>
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              <span className="eyebrow">{t("lab.engine.columns.games")}</span>
            </th>
            <th scope="col" className="pb-2 pl-3 font-normal">
              <span className="eyebrow">{t("lab.engine.columns.form")}</span>
            </th>
            <th scope="col" className="pb-2 text-right font-normal">
              <span className="eyebrow">{t("lab.engine.columns.ovr")}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {run.seasons.map((season, index) => {
            const previous = index === 0 ? run.ovrAtStart : (run.seasons[index - 1]?.ovr ?? season.ovr);
            const active = season.age === selectedAge;
            return (
              <tr
                key={season.age}
                className="border-b border-line"
                data-active={active || undefined}
                aria-current={active || undefined}
              >
                <td className="py-1.5 pr-3">
                  <button
                    type="button"
                    onClick={() => onSelect(season.age)}
                    className="numeric rounded-xs font-semibold text-fg underline-offset-4 hover:underline"
                  >
                    {season.age}
                  </button>
                </td>
                <td className="py-1.5 text-muted">
                  <span className="numeric text-fg">{season.clubStrength}</span>{" "}
                  <span className="text-xs">{c(`roles.${season.role}`)}</span>
                </td>
                <td className="numeric py-1.5 text-right">{season.games}</td>
                <td className="py-1.5 pl-3 whitespace-nowrap">
                  {/* No celular só o glifo; o nome fica para o leitor de tela. */}
                  {season.form === "normal" ? (
                    <span className="text-faint">
                      <span aria-hidden="true" className="sm:hidden">
                        ·
                      </span>
                      <span className="sr-only sm:not-sr-only">{t("forms.normal")}</span>
                    </span>
                  ) : (
                    <span data-tone={season.form === "explosion" ? "good" : "bad"} className="text-tone text-xs font-semibold">
                      <span aria-hidden="true">{season.form === "explosion" ? "▲" : "▼"}</span>
                      <span className="sr-only sm:not-sr-only sm:ml-1">{t(`forms.${season.form}`)}</span>
                    </span>
                  )}
                </td>
                <td className="py-1.5 text-right">
                  <span className="inline-flex items-center justify-end gap-2">
                    <Delta value={season.ovr - previous} className="text-xs" />
                    <span className="display numeric w-7 text-lg font-extrabold">{season.ovr}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

/**
 * O motor do M2 ao vivo: escolha a montagem, veja a carreira inteira de um
 * jogador e a faixa de 120 jogadores parecidos. Tudo roda no navegador, com
 * as mesmas funções puras que o harness usa.
 */
export function EngineArea() {
  const { t } = useT();
  const [setup, setSetup] = useState<EngineSetup>(INITIAL_SETUP);
  const [chosenAge, setChosenAge] = useState<number | null>(null);

  const seed = findSeed(setup);
  const run = developPlayer(setup, seed);
  const band = populationBand(setup, run.born.talent);
  const peak = peakOf(run);
  const selectedAge = chosenAge ?? peak.age;
  const last = run.seasons[run.seasons.length - 1];

  const change = (next: Partial<EngineSetup>) => {
    setSetup((current) => ({ ...current, ...next }));
    setChosenAge(null);
    feedback("tick");
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-base text-muted">{t("lab.engine.intro")}</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <Controls setup={setup} onChange={change} />
          <Identity
            run={run}
            seed={seed}
            onAnother={() => {
              change({ draw: setup.draw + 1 });
              feedback("select");
            }}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title={t("lab.engine.curve")}>
            <EvolutionChart
              seasons={run.seasons}
              band={band}
              selectedAge={selectedAge}
              onSelectAge={setChosenAge}
              label={t("lab.engine.chartLabel", {
                start: run.seasons[0]?.ovr ?? run.ovrAtStart,
                peak: peak.ovr,
                peakAge: peak.age,
                end: last?.ovr ?? peak.ovr,
              })}
              legend={{
                player: t("lab.engine.legendPlayer"),
                band: t("lab.engine.legendBand"),
                median: t("lab.engine.legendMedian"),
              }}
            />
            <div className="mt-5">
              <StepSlider
                value={selectedAge}
                min={FIRST_AGE}
                max={39}
                label={t("lab.engine.age")}
                valueText={t("lab.engine.ageValue", { age: selectedAge })}
                onValueChange={setChosenAge}
              />
            </div>
            <p className="mt-4 text-xs text-faint">{t("lab.engine.sandbox")}</p>
          </Panel>
          <SeasonCard run={run} seed={seed} age={selectedAge} />
        </div>
      </div>

      <SeasonTable run={run} selectedAge={selectedAge} onSelect={setChosenAge} />
    </div>
  );
}
