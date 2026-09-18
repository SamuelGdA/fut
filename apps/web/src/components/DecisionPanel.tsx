"use client";

import { countryName, useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { leagueLogoUrl } from "@craque/art";
import { ClubCrest, Flag } from "./Media";
import {
  getCountryByFifa,
  getLeagueOfTeam,
  getLeagueOfTeamAtTier,
  getTeam,
} from "@craque/data";
import { injuryName } from "@/lib/data/injuryNames";
import { injuryOverallDelta } from "@/lib/sim/constants";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { useSound } from "@/lib/useSound";
import { TRAINING_EVENT_COPY, trainingFocusesFor } from "@/lib/sim/training";
import { ATTRIBUTE_ABBR } from "@/lib/sim/attributes";
import { eventOptionPreview, type EventEffectPreview } from "@/lib/sim/careerEvents";
import { teamTier, type CareerState, type DecisionEvent, type DecisionOption } from "@/lib/sim/career";
import { briefPositionKey, type ClubBrief } from "@/lib/sim/clubBrief";

const TITLE_BY_TYPE: Record<string, { title: string; description: string }> = {
  academy_offer: { title: "career.academyOfferTitle", description: "career.academyOfferDescription" },
  transfer: { title: "career.transferTitle", description: "career.transferDescription" },
  loan_offer: { title: "career.loanOfferTitle", description: "career.loanOfferDescription" },
  post_loan_retained: { title: "career.postLoanReturnTitle", description: "career.postLoanRetainedDescription" },
  post_loan_not_retained: { title: "career.postLoanReturnTitle", description: "career.postLoanNotRetainedDescription" },
  post_loan_aged_out: { title: "career.postLoanAgedOutTitle", description: "career.postLoanAgedOutDescription" },
  contract_non_renewal: { title: "career.contractNonRenewalTitle", description: "career.contractNonRenewalDescription" },
  no_offers_retirement: { title: "career.noOffersRetirementTitle", description: "career.noOffersRetirementDescription" },
};

export function DecisionPanel({ career }: { career: CareerState }) {
  const event = career.currentEvent;
  if (!event) return null;
  if (event.type === "training_focus") return <TrainingFocusPanel career={career} event={event} />;
  if (event.type === "career_event") return <CareerEventPanel career={career} event={event} />;
  return <ClubOfferPanel event={event} />;
}

// ---------------------------------------------------------------------------
// Training focus
// ---------------------------------------------------------------------------

function TrainingFocusPanel({ career, event }: { career: CareerState; event: DecisionEvent }) {
  const { locale } = useI18n();
  const choose = useCareerStore((s) => s.choose);
  const sound = useSound();
  const copy = TRAINING_EVENT_COPY[locale];
  const focuses = trainingFocusesFor(career.player.position);

  return (
    // Half a step tighter than the other decision panels. Five focus cards is
    // the tallest decision the game can show, and on a 900px-high window it was
    // landing a single pixel over its box — which is still a scrollbar.
    <section className="panel animate-fade-in-up p-3.5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-pitch">{copy.eyebrow}</p>
      <h2 className="mt-0.5 font-display text-xl font-black">{copy.title}</h2>
      <p className="mt-1 text-sm text-muted">{copy.description}</p>

      {/* Three across on a wide screen. Five focuses stacked two-up ran to six
          rows of card and pushed the decision into a scroll on any laptop-height
          window; three-up fits them in two. */}
      <div className="stagger mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {event.options.map((option) => {
          const focus = focuses.find((f) => f.key === option.optionKey);
          if (!focus) return null;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                choose(option.id);
                sound("statUp");
              }}
              className="group rounded-xl border border-line bg-surface-2/60 p-3 text-left transition-all hover:border-pitch/60 hover:bg-surface-2 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{focus.icon}</span>
                <p className="font-display text-sm font-black">{focus.label[locale]}</p>
              </div>
              <p className="mt-1 text-xs leading-snug text-muted">{focus.description[locale]}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {Object.keys(focus.shares).map((key) => (
                  <span
                    key={key}
                    className="rounded-md bg-pitch/15 px-2 py-1 text-xs font-black tracking-wide text-pitch"
                  >
                    {ATTRIBUTE_ABBR[key as keyof typeof ATTRIBUTE_ABBR]} ↑
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Club offers
// ---------------------------------------------------------------------------

function ClubOfferPanel({ event }: { event: DecisionEvent }) {
  const { t } = useI18n();
  const choose = useCareerStore((s) => s.choose);
  const sound = useSound();
  const copy = TITLE_BY_TYPE[event.type];

  return (
    <section className="panel animate-fade-in-up p-4">
      <h2 className="font-display text-xl font-black">{copy ? t(copy.title) : t("career.decision")}</h2>
      {copy && <p className="mt-1 text-sm text-muted">{t(copy.description)}</p>}

      <div className="stagger mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {event.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            onSelect={() => {
              choose(option.id);
              sound(option.type === "retire" ? "back" : "select");
            }}
          />
        ))}
      </div>
    </section>
  );
}

function optionLabelKey(option: DecisionOption): string {
  if (option.type === "stay") return "career.stayOptionLabel";
  if (option.type === "join_loan") return "career.joinLoanLabel";
  if (option.type === "permanent_transfer") return "career.permanentTransferLabel";
  if (option.type === "retire") return "career.retireOptionLabel";
  return "career.joinClubLabel";
}

function optionDescriptionKey(option: DecisionOption): string {
  if (option.type === "stay") return "career.stayOptionDescription";
  if (option.type === "join_loan") return "career.joinLoanDescription";
  if (option.type === "permanent_transfer") return "career.permanentTransferDescription";
  if (option.type === "retire") return "career.retireOptionDescription";
  return "career.joinClubDescription";
}

/** Splits "Assinar com {team}" into the action prefix so the club name can sit under the crest. */
function actionPrefix(template: string): string {
  return template.replace("{team}", "").trim();
}

/**
 * The club's pitch, shown on the offer itself.
 *
 * Two clubs of the same size are otherwise the same choice; what each one wants
 * from the player is the part worth reading. The pill is tinted by how much
 * rope the move comes with, so the trade-off — a bigger welcome for a shorter
 * fuse — is legible at a glance rather than only felt three seasons later.
 *
 * `squad_depth` is the "nothing in particular" outcome and renders nothing.
 *
 * Text only: each brief used to carry an emoji (🌱 for the prospect, 🛟 for
 * the rescue job, and so on). At 10px beside uppercase type they read as
 * clip-art rather than as part of the badge, and the tint already carries the
 * same "how much rope" signal the icon was doubling up on.
 */
function BriefPill({ brief }: { brief: ClubBrief }) {
  const { t } = useI18n();
  const position = useCareerStore((s) => s.career?.player.position);
  if (!position) return null;
  if (brief.key === "squad_depth") return null;

  const pressure =
    brief.patience >= 1.3 ? "high" : brief.patience <= 0.85 ? "low" : "medium";
  const tone =
    pressure === "high"
      ? "border-danger/40 bg-danger/10 text-danger"
      : pressure === "low"
        ? "border-pitch/40 bg-pitch/10 text-pitch"
        : "border-line bg-surface-2 text-muted";

  const role = t(`career.brief.roles.${briefPositionKey(position)}`);
  return (
    <span
      title={t(`career.brief.briefs.${brief.key}.detail`, { role })}
      className={`mt-0.5 inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-tight ${tone}`}
    >
      <span className="truncate">{t(`career.brief.briefs.${brief.key}.tag`)}</span>
    </span>
  );
}

export function OptionCard({
  option,
  onSelect,
}: {
  option: DecisionOption;
  onSelect: () => void;
}) {
  const { t, locale } = useI18n();
  const career = useCareerStore((s) => s.career);

  if (option.type === "retire") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-4 text-center transition-colors hover:border-danger/60"
      >
        <span className="text-2xl">🎬</span>
        <p className="font-display font-bold">{t("career.retireOptionLabel")}</p>
        <p className="text-xs text-muted-2">{t("career.retireOptionDescription")}</p>
      </button>
    );
  }

  const team = option.teamId ? getTeam(option.teamId) : null;
  if (!team) return null;
  // The division the club is in *right now*, not the one it is listed under in
  // the dataset. Winning Série B with a club and then being offered to stay
  // still printed "Série B" on the stay card, because a plain
  // `getLeagueOfTeam` ignores the promotion/relegation overrides the career
  // has been accumulating.
  const league = career
    ? getLeagueOfTeamAtTier(team.id, teamTier(career, team.id))
    : getLeagueOfTeam(team.id);
  const country = league ? getCountryByFifa(league.country_fifa_code) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={t(optionDescriptionKey(option), { team: team.name })}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 p-4 text-center transition-all hover:scale-[1.02] hover:border-pitch/60 active:scale-[0.98]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
        {actionPrefix(t(optionLabelKey(option), { team: "" }))}
      </p>
      <ClubCrest teamId={team.id} name={team.name} size={48} className="h-12 w-12" />
      <p className="font-display text-sm font-bold leading-tight">{team.name}</p>
      {option.brief && <BriefPill brief={option.brief} />}
      <div className="flex items-center gap-1.5 text-xs text-muted-2">
        {country && (
          <Flag src={country.flag_url} alt={countryName(country, locale)} className="h-3 w-4" />
        )}
        {league && <ClubCrest src={leagueLogoUrl(league)} name={league.name} size={10} className="h-2.5 w-2.5" />}
        <span className="truncate">{league?.name}</span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Career events
// ---------------------------------------------------------------------------

export interface EventOptionCopy {
  label?: string;
  outcome?: string;
  positiveOutcome?: { probability?: number; description?: string };
  negativeOutcome?: { probability?: number; description?: string };
  neutralOutcome?: { probability?: number; description?: string };
}

/** Every interpolation var a career event's copy might reference, built once so
 *  both the live decision panel and the after-the-fact outcome reveal agree. */
export function careerEventVars(
  career: CareerState,
  event: DecisionEvent,
  t: (key: string, vars?: Record<string, string>) => string,
  locale: "pt" | "es" | "en",
): Record<string, string> {
  const rivalTeam = event.rivalTeamId ? getTeam(event.rivalTeamId) : null;
  const altCountry = event.alternativeNationalityFifaCode
    ? getCountryByFifa(event.alternativeNationalityFifaCode)
    : null;
  const currentTeam = career.currentTeamId ? getTeam(career.currentTeamId) : null;
  // Same reason as the offer cards: honour promotion/relegation rather than the
  // division the club is statically listed under.
  const league = currentTeam
    ? getLeagueOfTeamAtTier(currentTeam.id, teamTier(career, currentTeam.id))
    : null;
  const country = league ? getCountryByFifa(league.country_fifa_code) : null;

  const targetTrophyKey = event.targetTrophy ?? event.targetClubTrophy;
  const championship = targetTrophyKey
    ? resolveTrophy(
        targetTrophyKey,
        currentTeam?.id ?? "",
        career.player.nationality.confederation,
        t,
        currentTeam ? teamTier(career, currentTeam.id) : 1,
      ).name
    : "";
  const tournament = event.nationalTournament
    ? resolveTrophy(event.nationalTournament.trophy, "", career.player.nationality.confederation, t).name
    : "";

  return {
    rival: rivalTeam?.name ?? "",
    rivalName: career.rival?.name ?? "",
    team: currentTeam?.name ?? "",
    country: country ? countryName(country, locale) : "",
    nationality: altCountry ? countryName(altCountry, locale) : "",
    injury: injuryName(locale, event.injuryType),
    ovr: String(Math.abs(injuryOverallDelta(event.injuryType ?? "hamstring"))),
    championship,
    tournament,
  };
}

/**
 * Some events (personal_coach, training_extra) always resolve through a single
 * always-active "variant" with its own title/description/options and its own
 * (different!) numbers. The base copy is only ever a fallback for events with
 * no variant at all — showing it instead of the variant is what let a
 * decision's on-screen number silently disagree with what it actually paid out.
 */
export function careerEventCopyBase(
  key: string,
  variantKey: string | undefined,
  raw: <T = unknown>(path: string) => T | undefined,
): string {
  if (variantKey && raw(`careerEvents.${key}.variants.${variantKey}`) !== undefined) {
    return `careerEvents.${key}.variants.${variantKey}`;
  }
  return `careerEvents.${key}`;
}

function CareerEventPanel({ career, event }: { career: CareerState; event: DecisionEvent }) {
  const { t, raw, locale } = useI18n();
  const choose = useCareerStore((s) => s.choose);
  const sound = useSound();
  const key = event.eventKey!;

  const vars = careerEventVars(career, event, t, locale);
  const altCountry = event.alternativeNationalityFifaCode
    ? getCountryByFifa(event.alternativeNationalityFifaCode)
    : null;

  const basePath = careerEventCopyBase(key, event.variantKey, raw);
  const title = t(`${basePath}.title`, vars);
  const description = t(`${basePath}.description`, vars);
  const options = raw<Record<string, EventOptionCopy>>(`${basePath}.options`) ?? {};

  return (
    <section className="panel animate-fade-in-up p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-pitch">
        {t("career.decision")}
      </p>
      <h2 className="mt-1 font-display text-xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <div
        className={`mt-3 grid grid-cols-1 gap-3 ${
          event.options.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"
        }`}
      >
        {event.options.map((option) => {
          // A club move is always drawn as a club card, whatever else it
          // carries. Routing on "has no optionKey" was close but not quite:
          // the dressing-room fallout attaches `optionKey: "move"` to its
          // destinations so the event's own modifiers still resolve, and that
          // sent an ordinary transfer down the narrative branch, where it
          // rendered the raw key ("move") as the label with "Sem efeito"
          // underneath instead of the club it was offering.
          const isClubMove =
            option.type === "join_club" ||
            option.type === "stay" ||
            option.type === "permanent_transfer" ||
            option.type === "join_loan";
          if (isClubMove || !option.optionKey) {
            return (
              <OptionCard
                key={option.id}
                option={option}
                onSelect={() => {
                  choose(option.id);
                  sound("select");
                }}
              />
            );
          }

          const copy = options[option.optionKey] ?? {};
          const team = option.teamId ? getTeam(option.teamId) : null;
          // Shirt options are generated per number, so the number they'd put on
          // the player's back has to reach their own copy — the shared event
          // vars can't carry it, since each option offers a different one.
          const optionVars =
            option.shirtNumber !== undefined
              ? { ...vars, number: String(option.shirtNumber) }
              : vars;
          const label = copy.label
            ? `${interpolate(copy.label, optionVars)}${team ? ` ${team.name}` : ""}`
            : option.optionKey;
          const preview = eventOptionPreview(key, option.optionKey);
          const previewSplit = preview && "positive" in preview ? preview : null;
          const previewFlat = preview && !("positive" in preview) ? (preview as EventEffectPreview) : null;
          const hasAnyOutcomeCopy = Boolean(copy.outcome || copy.positiveOutcome || copy.negativeOutcome || copy.neutralOutcome);

          // foreign_grandfather / club_national_team_conflict show a nationality flag instead of a crest.
          const optionFlagCountry =
            key === "foreign_grandfather"
              ? option.optionKey === "switch_national_team"
                ? altCountry
                : career.player.nationality
              : key === "club_national_team_conflict"
                ? career.player.nationality
                : null;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                choose(option.id);
                sound("select");
              }}
              className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface-2/60 p-3.5 text-left transition-all hover:scale-[1.02] hover:border-pitch/60 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                {team && <ClubCrest teamId={team.id} name={team.name} size={28} className="h-7 w-7" />}
                {optionFlagCountry && (
                  <Flag src={optionFlagCountry.flag_url} alt={countryName(optionFlagCountry, locale)} className="h-5 w-7" />
                )}
                <p className="font-semibold leading-tight">{label}</p>
              </div>

              {copy.outcome && (
                <p className="text-xs text-muted">
                  {interpolate(copy.outcome, optionVars)}
                  {previewFlat && <EffectChips preview={previewFlat} t={t} />}
                </p>
              )}

              {/* The ▲/▼ carries the good-or-bad read on its own: these two
                  lines were otherwise separated by text colour alone, which is
                  precisely the green/red pair a colour-blind player cannot
                  split. */}
              {copy.positiveOutcome && (
                <p className="text-xs text-pitch">
                  <span className="mr-0.5 font-black" aria-hidden>▲</span>
                  {copy.positiveOutcome.probability !== undefined && (
                    <span className="font-bold">{copy.positiveOutcome.probability}% </span>
                  )}
                  {interpolate(copy.positiveOutcome.description ?? "", optionVars)}
                  {previewSplit && <EffectChips preview={previewSplit.positive} t={t} />}
                </p>
              )}
              {copy.negativeOutcome && (
                <p className="text-xs text-danger">
                  <span className="mr-0.5 font-black" aria-hidden>▼</span>
                  {copy.negativeOutcome.probability !== undefined && (
                    <span className="font-bold">{copy.negativeOutcome.probability}% </span>
                  )}
                  {interpolate(copy.negativeOutcome.description ?? "", optionVars)}
                  {previewSplit && <EffectChips preview={previewSplit.negative} t={t} />}
                </p>
              )}
              {copy.neutralOutcome && (
                <p className="text-xs text-muted-2">
                  {copy.neutralOutcome.probability !== undefined && (
                    <span className="font-bold">{copy.neutralOutcome.probability}% </span>
                  )}
                  {interpolate(copy.neutralOutcome.description ?? "", optionVars)}
                </p>
              )}
              {/* No outcome copy and no mechanical preview: this branch is the
                  deliberate safe/no-op choice, so say so rather than leaving
                  the card looking unfinished. */}
              {!hasAnyOutcomeCopy && !preview && (
                <p className="text-xs italic text-muted-2">{t("career.noEffectLabel")}</p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, k) => vars[k] ?? match);
}

/**
 * Turns a preview into short chips like "+2 OVR" / "-14 Torcida" — the exact
 * mechanical stakes behind an outcome's flavour text, so a percentage is never
 * shown without saying what it's a percentage *of*.
 */
export function EffectChips({ preview, t }: { preview: EventEffectPreview; t: (key: string) => string }) {
  const chips: string[] = [];
  if (preview.ovr) chips.push(`${preview.ovr > 0 ? "+" : ""}${preview.ovr} OVR`);
  if (preview.fan) chips.push(`${preview.fan > 0 ? "+" : ""}${preview.fan} ${t("career.fanSupportLabel")}`);
  if (preview.stats) {
    const pct = Math.round((preview.stats - 1) * 100);
    chips.push(`${t("career.performanceLabel")} ${pct > 0 ? "+" : ""}${pct}%`);
  }
  if (preview.role) chips.push(preview.role > 0 ? "▲" : "▼");
  // Not a number: the cost is that every season after this one is judged
  // more harshly, which no single figure would honestly convey.
  if (preview.pressure) chips.push(t("career.pressureLabel"));
  if (chips.length === 0) return null;
  return (
    <span
      className="font-bold"
      title={preview.role ? t(preview.role > 0 ? "career.roleImproveHint" : "career.roleWorsenHint") : undefined}
    >
      {" "}
      ({chips.join(" · ")})
    </span>
  );
}
