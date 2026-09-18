import { createRng, nextInt } from "./rng";
import { getLeagueOfTeam, getTeam } from "@/lib/data/dataset";
import { isDefender, RETIREMENT_AGE } from "./constants";
import type { CareerState, SeasonSnapshot } from "./career";
import type { AwardKey, TrophyKey } from "@/lib/data/trophies";

/**
 * The back page of the morning after.
 *
 * The headline rail down the side is a log — every notable thing, small and
 * quiet, newest at the top. This is the other half: one splash about the season
 * that just finished, sitting where the player is about to make their next
 * decision, so a career reads like a run of front pages rather than a table
 * that occasionally grows a row.
 *
 * Two things make it worth having. It picks the *single most newsworthy* thing
 * that happened rather than listing everything, and every angle has several
 * phrasings drawn from the career's own seed — so two saves that both won the
 * league in year four do not print the same sentence.
 */

/** The story angles, roughly in the order a sports desk would rank them. */
export type BackPageAngle =
  | "continental_crown"
  | "clean_sweep"
  | "treble"
  | "trophy_haul"
  | "league_title"
  | "cup_run"
  | "super_cup"
  | "golden_boot"
  | "player_of_year"
  | "relegated"
  | "promoted"
  | "breakout"
  | "goal_haul"
  | "assist_king"
  | "clean_sheet_wall"
  | "first_call_up"
  | "wrecked_by_injury"
  | "frozen_out"
  | "fading"
  | "new_arrival"
  | "last_dance"
  | "steady";

export interface BackPage {
  angle: BackPageAngle;
  /** Which phrasing of the angle to print. */
  variant: number;
  /** Which standfirst to run under it, drawn separately from the headline. */
  lede: number;
  vars: Record<string, string>;
  tone: "good" | "bad" | "neutral";
  /** Index into the locale's masthead list — fixed for the whole save. */
  masthead: number;
  age: number;
  /** The season's line, printed under the splash. */
  line: { appearances: number; goals: number; assists: number; cleanSheets: number };
  isGoalkeeper: boolean;
  /**
   * The confederation of the club this season was played at — not of the
   * player's passport. A Brazilian winning the Champions League with Real
   * Madrid conquered Europe, and the headline that called it South America
   * was reading the wrong field.
   */
  confederation: string;
  /** A defender's line adds clean sheets to the goals and assists. */
  isDefender: boolean;
  /**
   * The club's standing moving up or down a whole star while the player was
   * there. Null unless it actually changed at the same club — the point is to
   * make "we grew because of you" visible, and it only lands if it is rare.
   */
  clubStars: { from: number; to: number } | null;
}

/**
 * How many phrasings exist per angle. Must match the locale bundle.
 *
 * Six each, up from three. With two standfirsts that gave six ways to write
 * a season, so a 24-year career hit the same words repeatedly — most visibly
 * on `steady`, which covers every unremarkable year. Six headlines against
 * four standfirsts is twenty-four, which holds up across a full archive.
 */
const VARIANTS: Record<BackPageAngle, number> = {
  continental_crown: 6,
  clean_sweep: 6,
  treble: 6,
  trophy_haul: 6,
  league_title: 6,
  cup_run: 6,
  super_cup: 6,
  golden_boot: 6,
  player_of_year: 6,
  relegated: 6,
  promoted: 6,
  breakout: 6,
  goal_haul: 6,
  assist_king: 6,
  clean_sheet_wall: 6,
  first_call_up: 6,
  wrecked_by_injury: 6,
  frozen_out: 6,
  fading: 6,
  new_arrival: 6,
  last_dance: 6,
  steady: 6,
};

/** Standfirsts written per angle, per locale. */
const LEDE_VARIANTS = 4;

/** How many mastheads each locale defines. */
export const MASTHEAD_COUNT = 8;

/**
 * Appearances below which nothing that happened is a story about the player.
 *
 * Ratings still climb in a season spent in the reserves, so without this the
 * splash could announce a breakout over a line reading 7 games, 0 goals,
 * 0 assists — the paper contradicting its own stat line.
 */
const PLAYED_A_SEASON = 15;

const CONTINENTAL: TrophyKey[] = ["continental_primary", "club_world_cup"];
/** The annual intercontinental night is a cup final, not a campaign. */
const ONE_OFF_FINALS: TrophyKey[] = ["intercontinental_cup"];
const MAJOR_DOMESTIC: TrophyKey[] = ["league", "cup"];
/**
 * Competitions that are actually a knockout run. The super cups are not:
 * they are a single match played before the season starts, so a headline
 * about surviving every round to lift it was simply untrue — and on a season
 * whose only trophy was one, the paper ran it anyway.
 */
const KNOCKOUT_CUPS: TrophyKey[] = ["cup", "league_cup"];
const SUPER_CUPS: TrophyKey[] = ["domestic_super_cup", "continental_super_cup"];

export interface BackPageContext {
  season: SeasonSnapshot;
  /** The season before it, for "did the player just move" and decline reads. */
  previous: SeasonSnapshot | null;
  teamName: string;
  /** Set only on the season the player was first called up. */
  firstCallUp: boolean;
  isGoalkeeper: boolean;
  isDefender: boolean;
  confederation: string;
  retirementAge: number;
  /** Last season's splash, so the paper never runs the same words twice running. */
  previousPage?: BackPage | null;
}

/**
 * Ranks what happened and returns the one story worth the splash.
 *
 * The order matters more than the thresholds: a relegation in a season that
 * also produced 20 goals is still a relegation story, and a Champions League
 * beats everything. Only the top hit is printed.
 */
export function buildBackPage(seed: string, ctx: BackPageContext): BackPage {
  const {
    season,
    previous,
    teamName,
    firstCallUp,
    isGoalkeeper,
    isDefender,
    confederation,
    retirementAge,
  } = ctx;
  const s = season.stats;
  const trophies = season.trophies;
  const has = (k: TrophyKey) => trophies.includes(k);
  const award = (k: AwardKey) => season.awards.includes(k);

  const vars: Record<string, string> = {
    team: teamName,
    age: String(season.age),
    goals: String(s.goals),
    assists: String(s.assists),
    apps: String(s.appearances),
    cleanSheets: String(s.cleanSheets),
    ovr: String(season.overall),
    trophies: String(trophies.length),
  };

  let angle: BackPageAngle = "steady";
  let tone: BackPage["tone"] = "neutral";

  const movedClub = previous !== null && previous.teamId !== season.teamId;
  const ovrJump = previous ? season.overall - previous.overall : 0;
  const played = s.appearances >= PLAYED_A_SEASON;

  // Ranked the way a desk would rank it. Individual honours sit above the
  // league title on purpose: this is one player's paper, and a Ballon d'Or is
  // the bigger story even in a season the team also won everything.
  // "Won everything" has to be true to print. The old rule was simply three
  // trophies of any kind, so a league plus two super cups — with the domestic
  // cup lost — ran under "nothing was left". A real sweep is the league, the
  // cup and a continental; anything else is a haul, and a haul says how many.
  const cleanSweep = MAJOR_DOMESTIC.every(has) && CONTINENTAL.some(has);

  if (cleanSweep) {
    angle = "clean_sweep";
    tone = "good";
  } else if (trophies.length === 3) {
    angle = "treble";
    tone = "good";
  } else if (trophies.length > 3) {
    angle = "trophy_haul";
    tone = "good";
  } else if (CONTINENTAL.some(has)) {
    angle = "continental_crown";
    tone = "good";
  } else if (award("ballon_dor")) {
    angle = "player_of_year";
    tone = "good";
  } else if (award("golden_boot")) {
    angle = "golden_boot";
    tone = "good";
  } else if (award("golden_glove")) {
    angle = "clean_sheet_wall";
    tone = "good";
  } else if (has("league")) {
    angle = "league_title";
    tone = "good";
  } else if (season.relegated) {
    angle = "relegated";
    tone = "bad";
  } else if (season.promoted) {
    angle = "promoted";
    tone = "good";
  } else if (s.appearances === 0) {
    // A whole year without a game — either frozen out or wrecked.
    angle = season.knock ? "wrecked_by_injury" : "frozen_out";
    tone = "bad";
  } else if (firstCallUp) {
    // Once in a career, and the kind of thing a hometown paper leads with.
    angle = "first_call_up";
    tone = "good";
  } else if (KNOCKOUT_CUPS.some(has)) {
    angle = "cup_run";
    tone = "good";
  } else if (SUPER_CUPS.some(has) || ONE_OFF_FINALS.some(has) || trophies.length > 0) {
    angle = "super_cup";
    tone = "good";
  } else if (season.knock && season.knock.matchesMissed >= 5 && s.appearances < 22) {
    angle = "wrecked_by_injury";
    tone = "bad";
    vars.missed = String(season.knock.matchesMissed);
  } else if (ovrJump >= 4 && played) {
    angle = "breakout";
    tone = "good";
  } else if ((isGoalkeeper || isDefender) && s.cleanSheets >= 12) {
    angle = "clean_sheet_wall";
    tone = "good";
  } else if (!isGoalkeeper && s.goals >= 16) {
    angle = "goal_haul";
    tone = "good";
  } else if (!isGoalkeeper && s.assists >= 10) {
    angle = "assist_king";
    tone = "good";
  } else if (s.appearances < 12) {
    angle = "frozen_out";
    tone = "bad";
  } else if (season.age >= retirementAge - 2) {
    angle = "last_dance";
    tone = "neutral";
  } else if (ovrJump <= -3 && played) {
    // A rating that slipped while the player was not being picked is a
    // benching story, and `frozen_out` above has already claimed that one.
    angle = "fading";
    tone = "bad";
  } else if (movedClub) {
    angle = "new_arrival";
    tone = "neutral";
  }

  // The phrasing is drawn per season but the masthead per save, so the paper
  // stays the same all career while the writing keeps changing.
  const count = VARIANTS[angle];
  let variant = nextInt(createRng(`${seed}:backpage:${season.id}:${angle}`), 0, count - 1).value;
  // Two identical splashes in consecutive years reads like a bug even when the
  // seasons really were identical, so a repeat is nudged to the next phrasing.
  if (ctx.previousPage && ctx.previousPage.angle === angle && ctx.previousPage.variant === variant) {
    variant = (variant + 1) % count;
  }
  // Drawn off its own stream, so a repeated headline does not drag the same
  // paragraph along with it.
  const lede = nextInt(createRng(`${seed}:lede:${season.id}:${angle}`), 0, LEDE_VARIANTS - 1).value;
  const masthead = nextInt(createRng(`${seed}:masthead`), 0, MASTHEAD_COUNT - 1).value;

  // Only a move at the same club counts: changing clubs changes the badge, and
  // that is a transfer, not the club growing.
  const starsNow = season.clubStars;
  const starsBefore = previous && previous.teamId === season.teamId ? previous.clubStars : undefined;
  const clubStars =
    starsNow !== undefined && starsBefore !== undefined && starsNow !== starsBefore
      ? { from: starsBefore, to: starsNow }
      : null;

  return {
    angle,
    variant,
    lede,
    vars,
    tone,
    masthead,
    age: season.age,
    clubStars,
    line: {
      appearances: s.appearances,
      goals: s.goals,
      assists: s.assists,
      cleanSheets: s.cleanSheets,
    },
    isGoalkeeper,
    isDefender,
    confederation,
  };
}

/**
 * Every season's splash, in order.
 *
 * Built as a run rather than one at a time because each page needs to know
 * what the one before it printed — that is what stops the paper running the
 * same words two years in a row. Both the in-play splash and the end-of-career
 * archive read from this, so they can never disagree about what a season's
 * story was.
 */
export function buildCareerBackPages(career: CareerState): BackPage[] {
  const pages: BackPage[] = [];
  for (let i = 0; i < career.seasons.length; i++) {
    const season = career.seasons[i];
    const team = getTeam(season.teamId);
    if (!team) continue;
    pages.push(
      buildBackPage(career.seed, {
        season,
        previous: career.seasons[i - 1] ?? null,
        teamName: team.name,
        firstCallUp: career.firstCallUpAge === season.age,
        isGoalkeeper: career.player.position === "GK",
        isDefender: isDefender(career.player.position),
        confederation: getLeagueOfTeam(team.id)?.confederation ?? career.player.nationality.confederation,
        retirementAge: RETIREMENT_AGE,
        previousPage: pages[pages.length - 1] ?? null,
      }),
    );
  }
  return pages;
}
