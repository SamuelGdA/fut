import {
  AWARD_KEYS,
  AWARDS,
  type Club,
  clubsOf,
  COMPETITIONS,
  type Competition,
  type CompetitionKind,
  type CountryCode,
  type Division,
  getCountry,
  LEAGUES,
  leaguesOf,
} from "@craque/world";
import { useState } from "react";
import { useT } from "../../../i18n/useT";
import { useAssetMode } from "../../../lib/assets";
import { feedback } from "../../../services/feedback";
import { AwardArt, Crest, Flag, LeagueBadge, TrophyArt } from "../../../ui/Media";
import { SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Chip } from "../../../ui/Signals";
import { AssetModeToggle } from "../AssetModeToggle";
import { CountryPicker } from "../CountryPicker";

type TrophyGroup = "leagues" | "cups" | "continental" | "world" | "nations";

const TROPHY_GROUPS: ReadonlyArray<{ key: TrophyGroup; kinds: readonly CompetitionKind[] }> = [
  { key: "leagues", kinds: ["league", "second"] },
  { key: "cups", kinds: ["cup", "leagueCup", "superCup"] },
  { key: "continental", kinds: ["continental1", "continental2", "continental3", "continentalSuper"] },
  { key: "world", kinds: ["intercontinental", "clubWorldCup"] },
  { key: "nations", kinds: ["nationsCup", "worldCup"] },
];

const BADGE_LADDER = [10, 14, 28, 96] as const;

function SizeLabel({ size }: { size: number }) {
  return <span className="numeric text-2xs font-semibold text-faint">{size} px</span>;
}

/** Um clube em todos os tamanhos em que o escudo aparece. */
function CrestCard({ club }: { club: Club }) {
  return (
    <li className="flex min-w-0 flex-col items-center gap-3 rounded-md border border-line bg-panel p-3">
      <Crest club={club} size={96} decorative />
      <div className="flex items-end gap-2" aria-hidden="true">
        <span className="hidden sm:block">
          <Crest club={club} size={48} decorative />
        </span>
        <Crest club={club} size={28} decorative />
        <Crest club={club} size={16} decorative />
        <Crest club={club} size={10} decorative />
      </div>
      <p className="w-full truncate text-center text-xs font-semibold text-muted">{club.name}</p>
    </li>
  );
}

function Crests() {
  const { t } = useT();
  const [country, setCountry] = useState<CountryCode>("BRA");
  const [division, setDivision] = useState<Division>(1);
  const leagues = leaguesOf(country);
  const hasSecond = leagues.some((league) => league.division === 2);
  const current = hasSecond ? division : 1;
  const league = leagues.find((item) => item.division === current) ?? leagues[0];
  const clubs = league ? clubsOf(country, league.division) : [];

  return (
    <section aria-labelledby="arte-escudos" className="flex flex-col gap-5">
      <SectionRule as="h2">
        <span id="arte-escudos">{t("lab.art.crests")}</span>
      </SectionRule>
      <p className="max-w-2xl text-sm text-muted">{t("lab.art.crestsHint")}</p>
      <CountryPicker value={country} onValueChange={setCountry} />
      {hasSecond ? (
        <Segmented<"1" | "2">
          value={current === 1 ? "1" : "2"}
          onValueChange={(next) => {
            setDivision(next === "1" ? 1 : 2);
            feedback("tick");
          }}
          label={t("lab.art.league")}
          size="sm"
          className="self-start"
          options={[
            { value: "1", label: t("lab.world.division1") },
            { value: "2", label: t("lab.world.division2") },
          ]}
        />
      ) : null}

      {league ? (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-panel-2 p-4">
          <p className="eyebrow">{t("lab.art.ladder")}</p>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
            {BADGE_LADDER.map((size) => (
              <div key={size} className="flex flex-col items-center gap-1.5">
                <LeagueBadge league={league} size={size} decorative={size !== 96} />
                <SizeLabel size={size} />
              </div>
            ))}
            <p className="display min-w-0 text-2xl font-extrabold uppercase">{league.name}</p>
          </div>
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {clubs.map((club) => (
          <CrestCard key={club.id} club={club} />
        ))}
      </ul>
    </section>
  );
}

function Badges() {
  const { t, locale } = useT();
  return (
    <section aria-labelledby="arte-selos" className="flex flex-col gap-5">
      <SectionRule as="h2">
        <span id="arte-selos">{t("lab.art.badges")}</span>
      </SectionRule>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {LEAGUES.map((league) => {
          const country = getCountry(league.country);
          return (
            <li
              key={league.id}
              className="flex min-w-0 flex-col items-center gap-2 rounded-md border border-line bg-panel px-2 py-3"
            >
              <LeagueBadge league={league} size={56} decorative />
              <span className="flex w-full min-w-0 items-center justify-center gap-1.5">
                {country ? <Flag country={country} size={14} language={locale} decorative /> : null}
                <span className="truncate text-xs font-semibold">{league.name}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function TrophyGrid({ competitions }: { competitions: readonly Competition[] }) {
  const { locale } = useT();
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {competitions.map((competition) => (
        <li
          key={competition.id}
          className="flex min-w-0 flex-col items-center gap-2 rounded-md border border-line bg-panel px-2 pb-2.5 pt-3"
        >
          <TrophyArt competition={competition} size={80} language={locale} decorative />
          <span className="line-clamp-2 text-center text-2xs font-semibold leading-snug text-muted">
            {competition.names[locale]}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Trophies() {
  const { t } = useT();
  const mode = useAssetMode((state) => state.mode);

  return (
    <section aria-labelledby="arte-trofeus" className="flex flex-col gap-8">
      <SectionRule as="h2">
        <span id="arte-trofeus">{t("lab.art.trophies")}</span>
      </SectionRule>
      {TROPHY_GROUPS.map((group) => {
        const competitions = COMPETITIONS.filter((competition) => group.kinds.includes(competition.kind));
        const real = competitions.filter((competition) => competition.trophy !== null).length;
        return (
          <section key={group.key} aria-labelledby={`trofeus-${group.key}`} className="flex flex-col gap-3">
            <SectionRule
              aside={
                mode === "real" ? (
                  <Chip variant="outline">
                    {t("lab.art.realCount", { real, total: competitions.length })}
                  </Chip>
                ) : null
              }
            >
              <span id={`trofeus-${group.key}`}>{t(`lab.art.groups.${group.key}`)}</span>
            </SectionRule>
            <TrophyGrid competitions={competitions} />
          </section>
        );
      })}
    </section>
  );
}

function Awards() {
  const { t, locale } = useT();
  return (
    <section aria-labelledby="arte-premios" className="flex flex-col gap-5">
      <SectionRule as="h2">
        <span id="arte-premios">{t("lab.art.awards")}</span>
      </SectionRule>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {AWARD_KEYS.map((key) => {
          const award = AWARDS[key];
          return (
            <li
              key={key}
              className="flex min-w-0 flex-col items-center gap-3 rounded-md border border-line bg-panel px-3 pb-3 pt-4"
            >
              <AwardArt award={award} size={120} language={locale} decorative />
              <span className="display text-center text-lg font-extrabold uppercase leading-tight">
                {award.names[locale]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Toda a arte nos tamanhos em que ela aparece no jogo. A barra do modo de
 * imagens é filha direta da raiz para continuar grudada até o fim da página.
 */
export function ArtArea() {
  const { t } = useT();
  return (
    <div className="flex flex-col">
      <p className="max-w-2xl text-base text-muted">{t("lab.art.intro")}</p>
      <div className="lab-toolbar mt-5">
        <span className="eyebrow">{t("lab.art.mode")}</span>
        <AssetModeToggle />
      </div>
      <p className="mt-3 max-w-2xl text-xs text-faint">{t("lab.art.modeNote")}</p>
      <div className="mt-12 flex flex-col gap-14">
        <Crests />
        <Badges />
        <Trophies />
        <Awards />
      </div>
    </div>
  );
}
