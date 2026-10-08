import {
  type Club,
  CLUBS,
  clubsOf,
  CONFEDERATIONS,
  type Confederation,
  COUNTRIES,
  type CountryCode,
  type League,
  leaguesOf,
  PLAYABLE_COUNTRIES,
} from "@craque/world";
import { type CSSProperties, useState } from "react";
import { type Translator, useT } from "../../../i18n/useT";
import { Crest, Flag, LeagueBadge } from "../../../ui/Media";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Chip } from "../../../ui/Signals";
import { type ChoiceOption, ChoiceStrip } from "../ChoiceStrip";
import { CountryPicker } from "../CountryPicker";

/** Faixa de força do v2 (GDD 7.2). A barra começa no piso, não no zero. */
const STRENGTH_FLOOR = 40;
const STRENGTH_CEILING = 92;

function strengthRatio(strength: number): number {
  const ratio = (strength - STRENGTH_FLOOR) / (STRENGTH_CEILING - STRENGTH_FLOOR);
  return Math.min(1, Math.max(0, ratio));
}

function byStrength(a: { strength: number; name?: string }, b: { strength: number; name?: string }) {
  return b.strength - a.strength || (a.name ?? "").localeCompare(b.name ?? "");
}

function clubOrder(a: Club, b: Club): number {
  return b.strength - a.strength || b.prestige - a.prestige || a.name.localeCompare(b.name);
}

function StrengthBar({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="meter-track block w-10 sm:w-24">
      <span
        data-tone="good"
        className="meter-fill block"
        style={{ transform: `scaleX(${strengthRatio(value)})` }}
      />
    </span>
  );
}

/** Cinco gomos que enchem na proporção: prestígio 3,7 é três gomos e 70% do quarto. */
function PrestigePips({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="pips">
      {[0, 1, 2, 3, 4].map((step) => {
        const fill = Math.min(1, Math.max(0, value - step));
        return <i key={step} style={{ "--fill": `${fill * 100}%` } as CSSProperties} />;
      })}
    </span>
  );
}

function ClubTable({ league, clubs }: { league: League; clubs: readonly Club[] }) {
  const { t, number } = useT();
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">{league.name}</caption>
      <thead>
        <tr className="border-b border-rule text-left">
          <th scope="col" className="w-7 pb-2 pr-1 font-normal">
            <span aria-hidden="true" className="eyebrow">
              #
            </span>
            <span className="sr-only">{t("lab.world.rank")}</span>
          </th>
          <th scope="col" className="pb-2 font-normal">
            <span className="eyebrow">{t("lab.world.club")}</span>
          </th>
          <th scope="col" className="pb-2 pl-2 text-right font-normal">
            <span className="eyebrow">{t("lab.world.strength")}</span>
          </th>
          <th scope="col" className="pb-2 pl-3 text-right font-normal">
            <span className="eyebrow">{t("lab.world.prestige")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {clubs.map((club, position) => (
          <tr key={club.id} className="border-b border-line">
            <td className="numeric py-2 pr-1 text-xs text-faint">{position + 1}</td>
            <td className="w-full max-w-0 py-2">
              <span className="flex min-w-0 items-center gap-2">
                <Crest club={club} size={20} decorative />
                <span className="truncate font-semibold text-fg">{club.name}</span>
              </span>
            </td>
            <td className="py-2 pl-2">
              <span className="flex items-center justify-end gap-2">
                <StrengthBar value={club.strength} />
                <span className="numeric w-6 text-right font-bold text-fg">{club.strength}</span>
              </span>
            </td>
            <td className="py-2 pl-3 text-right">
              <PrestigePips value={club.prestige} />
              <span className="sr-only">
                {t("lab.world.prestigeValue", { value: number(club.prestige, { maximumFractionDigits: 1 }) })}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function promotionText(league: League, { t, tp }: Translator): string {
  return league.promotionSlots > 0
    ? tp("lab.world.promotion", league.promotionSlots)
    : t("lab.world.noPromotion");
}

function LeagueBlock({ league }: { league: League }) {
  const translator = useT();
  const { t, tp } = translator;
  const clubs = [...clubsOf(league.country, league.division)].sort(clubOrder);

  return (
    <section aria-labelledby={`liga-${league.id}`} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <LeagueBadge league={league} size={44} decorative />
        <div className="min-w-0">
          <p className="eyebrow">{league.division === 1 ? t("lab.world.division1") : t("lab.world.division2")}</p>
          <h3 id={`liga-${league.id}`} className="display text-2xl font-extrabold uppercase sm:text-3xl">
            {league.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {tp("units.games", league.games)}
            <span aria-hidden="true"> · </span>
            {promotionText(league, translator)}
          </p>
        </div>
      </div>
      <ClubTable league={league} clubs={clubs} />
    </section>
  );
}

function CsvNote() {
  const { t, number } = useT();
  const rows: ReadonlyArray<readonly [string, string]> = [
    ["pnpm notas:exportar", t("lab.world.csvExport")],
    ["pnpm notas:importar", t("lab.world.csvImport")],
  ];
  return (
    <Panel title={t("lab.world.csvTitle")}>
      <p className="max-w-2xl text-sm text-muted">{t("lab.world.csvBody", { count: number(CLUBS.length) })}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-6">
        {rows.map(([command, meaning]) => (
          <div key={command} className="contents">
            <dt>
              <code className="code-pill">{command}</code>
            </dt>
            <dd className="-mt-2 text-muted sm:mt-0 sm:self-center">{meaning}</dd>
          </div>
        ))}
        <div className="contents">
          <dt className="eyebrow sm:self-center">{t("lab.world.csvFile")}</dt>
          <dd className="-mt-2 min-w-0 sm:mt-0">
            <code className="code-pill break-all">packages/world/data/clubes.csv</code>
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-faint">{t("lab.world.csvRun")}</p>
    </Panel>
  );
}

function Nations() {
  const { t, locale, number } = useT();
  const [confederation, setConfederation] = useState<Confederation>("CONMEBOL");
  const nations = COUNTRIES.filter((country) => country.confederation === confederation)
    .map((country) => ({ country, strength: country.strength, name: country.names[locale] }))
    .sort(byStrength);

  const options: ChoiceOption<Confederation>[] = CONFEDERATIONS.map((value) => ({
    value,
    label: (
      <>
        {value}
        <span className="pick-chip-count numeric">
          {COUNTRIES.filter((country) => country.confederation === value).length}
        </span>
      </>
    ),
  }));

  return (
    <section aria-labelledby="mundo-selecoes" className="flex flex-col gap-5">
      <SectionRule as="h2">
        <span id="mundo-selecoes">{t("lab.world.nations")}</span>
      </SectionRule>
      <p className="max-w-2xl text-sm text-muted">
        {t("lab.world.nationsIntro", { count: number(COUNTRIES.length) })}
      </p>
      <ChoiceStrip<Confederation>
        value={confederation}
        onValueChange={setConfederation}
        options={options}
        label={t("lab.world.confederation")}
      />
      <ol className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {nations.map(({ country, name }, position) => (
          <li key={country.code} className="flex items-center gap-2.5 border-b border-line py-2 text-sm">
            <span className="numeric w-6 shrink-0 text-xs text-faint">{position + 1}</span>
            <Flag country={country} size={24} language={locale} decorative />
            <span className="min-w-0 flex-1 truncate font-semibold">{name}</span>
            <StrengthBar value={country.strength} />
            <span className="numeric w-6 shrink-0 text-right font-bold">
              <span className="sr-only">{t("lab.world.strength")}: </span>
              {country.strength}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** O mundo com as notas do v2: clubes por país e divisão, e as seleções. */
export function WorldArea() {
  const { t, number } = useT();
  const [country, setCountry] = useState<CountryCode>("BRA");
  const leagues = [...leaguesOf(country)].sort((a, b) => a.division - b.division);
  const clubs = clubsOf(country);
  const real = clubs.filter((club) => club.crest !== null).length;

  return (
    <div className="flex flex-col gap-14">
      <p className="max-w-2xl text-base text-muted">
        {t("lab.world.intro", { clubs: number(CLUBS.length), countries: PLAYABLE_COUNTRIES.length })}
      </p>

      <section aria-labelledby="mundo-clubes" className="flex flex-col gap-6">
        <SectionRule
          as="h2"
          aside={
            <Chip variant="outline" tone="info">
              {t("lab.world.crestsReal", { real, generated: clubs.length - real })}
            </Chip>
          }
        >
          <span id="mundo-clubes">{t("lab.world.clubs")}</span>
        </SectionRule>
        <CountryPicker value={country} onValueChange={setCountry} />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-8">
          {leagues.map((league) => (
            <LeagueBlock key={league.id} league={league} />
          ))}
        </div>
      </section>

      <CsvNote />

      <Nations />
    </div>
  );
}
