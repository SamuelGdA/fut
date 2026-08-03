import { chance, pickWeighted, type Rng } from "./rng";
import {
  BASE_MODIFIERS,
  SEVERE_INJURY_TYPES,
  SEVERE_INJURY_WEIGHT,
  INJURY_TYPES,
  TRAIT_EFFECTS,
  injuryOverallDelta,
  type Modifiers,
  type PersonalityTrait,
} from "./constants";

export type CareerEventKey =
  | "training_extra"
  | "personal_coach"
  | "mysterious_substance"
  | "season_load"
  | "position_change"
  | "position_competition"
  | "captain_armband"
  | "club_priority"
  | "rival_offer"
  | "club_crisis"
  | "iconic_number"
  | "return_home"
  | "giant_tattoo"
  | "tax_trouble"
  | "foreign_grandfather"
  | "finish_high_school"
  | "locker_room_clash"
  | "triumphant_return"
  | "club_national_team_conflict"
  | "injury_at_peak"
  | "injury"
  | "decisive_penalty"
  | "new_manager"
  | "derby_spotlight"
  | "testimonial_match"
  | "agent_ultimatum"
  | "wonderkid_signing"
  | "boot_deal"
  | "hometown_parade"
  | "podcast_interview"
  | "agent_change"
  | "packed_home_stadium"
  | "controversial_red_card"
  | "crowd_turns"
  | "rival_press"
  | "rival_milestone"
  | "rival_duel"
  | "shirt_upgrade"
  | "shirt_legend_tribute"
  | "severe_injury";

export type OutcomeKind = "positive" | "negative" | undefined;

export const CAREER_EVENT_KEYS: CareerEventKey[] = [
  "training_extra", "personal_coach", "mysterious_substance", "season_load",
  "position_change", "position_competition", "captain_armband", "club_priority",
  "rival_offer", "club_crisis", "iconic_number", "return_home", "giant_tattoo",
  "tax_trouble", "foreign_grandfather", "finish_high_school", "locker_room_clash",
  "triumphant_return", "club_national_team_conflict", "injury_at_peak", "injury",
  "decisive_penalty", "new_manager", "derby_spotlight", "testimonial_match",
  "agent_ultimatum", "wonderkid_signing", "boot_deal", "hometown_parade",
  "podcast_interview", "agent_change", "packed_home_stadium",
  "controversial_red_card", "crowd_turns",
  "rival_press", "rival_milestone", "rival_duel",
  "shirt_upgrade", "shirt_legend_tribute", "severe_injury",
];

/** Selection weights; anything unlisted defaults to 100. */
export const CAREER_EVENT_WEIGHTS: Partial<Record<CareerEventKey, number>> = {
  giant_tattoo: 35,
  finish_high_school: 35,
  captain_armband: 80,
  rival_offer: 80,
  club_crisis: 45,
  iconic_number: 45,
  return_home: 45,
  locker_room_clash: 45,
  tax_trouble: 25,
  foreign_grandfather: 25,
  mysterious_substance: 20,
  club_national_team_conflict: 20,
  injury_at_peak: 20,
  decisive_penalty: 20,
  triumphant_return: 50,
  new_manager: 55,
  derby_spotlight: 60,
  testimonial_match: 40,
  agent_ultimatum: 50,
  wonderkid_signing: 45,
  boot_deal: 35,
  hometown_parade: 30,
  podcast_interview: 50,
  agent_change: 40,
  packed_home_stadium: 55,
  controversial_red_card: 45,
  crowd_turns: 45,
  rival_press: 50,
  rival_milestone: 45,
  rival_duel: 40,
  // Being handed a marquee shirt is a milestone, not a yearly occurrence.
  shirt_upgrade: 18,
  shirt_legend_tribute: 12,
  // A career-defining injury has to stay a story, not a routine hazard.
  severe_injury: SEVERE_INJURY_WEIGHT,
};

export const CAREER_EVENT_OPTIONS: Record<CareerEventKey, string[]> = {
  training_extra: ["accept", "reject"],
  personal_coach: ["accept", "reject"],
  mysterious_substance: ["consume", "reject"],
  season_load: ["accept", "stay_calm"],
  position_change: ["accept", "reject"],
  position_competition: ["compete"],
  captain_armband: ["wear_it", "pass_it"],
  club_priority: ["prioritize_league", "prioritize_continental"],
  rival_offer: ["accept", "reject"],
  club_crisis: ["stay_and_fight"],
  iconic_number: ["claim_it", "let_someone_else"],
  return_home: ["stay_abroad"],
  giant_tattoo: ["accept", "reject"],
  tax_trouble: ["stay_and_fight"],
  foreign_grandfather: ["switch_national_team", "keep_national_team"],
  finish_high_school: ["accept", "reject"],
  locker_room_clash: ["stand_your_ground", "keep_the_peace"],
  triumphant_return: [],
  club_national_team_conflict: ["go_anyway", "comply"],
  injury_at_peak: ["play_injured", "recover"],
  injury: ["continue"],
  decisive_penalty: ["left", "right"],
  new_manager: ["impress_in_training", "stay_patient"],
  derby_spotlight: ["embrace_the_pressure", "focus_on_process"],
  testimonial_match: ["hold_the_testimonial", "keep_it_low_key"],
  agent_ultimatum: ["reassure_the_club"],
  wonderkid_signing: ["rise_to_the_challenge", "welcome_and_mentor"],
  boot_deal: ["sign_exclusive", "stick_with_current_boots"],
  hometown_parade: ["enjoy_the_moment", "stay_grounded"],
  podcast_interview: ["speak_your_mind", "play_it_safe"],
  agent_change: ["switch_agent", "keep_agent"],
  packed_home_stadium: ["feed_off_the_crowd", "block_out_the_noise"],
  controversial_red_card: ["accept_the_ban", "appeal_publicly"],
  crowd_turns: ["win_them_back", "ignore_the_boos"],
  rival_press: ["provoke", "praise"],
  rival_milestone: ["use_as_fuel", "shrug_it_off"],
  rival_duel: ["take_the_weight", "let_the_team_carry_it"],
  // The shirts on offer are drawn at runtime, so only the decline option is
  // fixed here — decorateCareerEvent prepends one option per number offered.
  shirt_upgrade: ["keep_current"],
  shirt_legend_tribute: ["keep_current"],
  severe_injury: ["fight_back"],
};

/** Events that ship with a flavour variant chosen at random. */
export const CAREER_EVENT_VARIANTS: Partial<Record<CareerEventKey, { key: string; weight: number }[]>> = {
  training_extra: [{ key: "preseason_camp", weight: 100 }],
  personal_coach: [{ key: "nutrition_plan", weight: 100 }],
  season_load: [{ key: "double_session", weight: 100 }],
};

/**
 * Events that append an extra "leave the club" option alongside their
 * narrative choices, mirroring the original's option builder.
 */
export const CLUB_CHOICE_EVENTS = new Set<CareerEventKey>([
  "position_competition", "club_crisis",
  "return_home", "tax_trouble",
  "agent_ultimatum",
]);

export function pickInjury(rng: Rng): { rng: Rng; type: string } {
  const picked = pickWeighted(rng, INJURY_TYPES.map((i) => ({ item: i, weight: i.weight })));
  return { rng: picked.rng, type: picked.item.type };
}

export function pickSevereInjury(rng: Rng): { rng: Rng; type: string } {
  const picked = pickWeighted(
    rng,
    SEVERE_INJURY_TYPES.map((i) => ({ item: i, weight: i.weight })),
  );
  return { rng: picked.rng, type: picked.item.type };
}

export function severeInjuryPotentialLoss(type: string): number {
  return SEVERE_INJURY_TYPES.find((i) => i.type === type)?.potentialLoss ?? 5;
}

export interface ResolvedEvent {
  rng: Rng;
  modifiers: Modifiers;
  outcomeKind: OutcomeKind;
}

/**
 * Applies the chosen option of a career event, rolling for probabilistic
 * outcomes and returning the season modifiers it produces.
 */
export function resolveCareerEvent(
  rng: Rng,
  eventKey: CareerEventKey,
  optionKey: string,
  injuryType?: string,
  variantKey?: string,
  trait?: PersonalityTrait,
): ResolvedEvent {
  const modifiers: Modifiers = { ...BASE_MODIFIERS };
  let cur = rng;
  let outcomeKind: OutcomeKind;

  // Personality tilts every gamble a little: a determined player converts risky
  // calls more often than a fragile one, without ever guaranteeing the outcome.
  const gamble = trait ? TRAIT_EFFECTS[trait].gambleOdds : 1;

  const roll = (probability: number) => {
    const r = chance(cur, Math.min(0.95, probability * gamble));
    cur = r.rng;
    return r.success;
  };

  if (eventKey === "training_extra" && optionKey === "accept") {
    const camp = variantKey === "preseason_camp";
    const success = roll(camp ? 0.65 : 0.7);
    modifiers.immediateOverallDelta = success ? (camp ? 4 : 3) : camp ? -3 : -2;
    outcomeKind = success ? "positive" : "negative";
  }

  if (eventKey === "personal_coach" && optionKey === "accept") {
    const nutrition = variantKey === "nutrition_plan";
    const success = roll(nutrition ? 0.6 : 0.5);
    modifiers.permanentOverallDelta = success ? (nutrition ? 3 : 2) : -2;
    outcomeKind = success ? "positive" : "negative";
  }

  if (eventKey === "mysterious_substance" && optionKey === "consume") {
    const caught = roll(0.25);
    outcomeKind = caught ? "negative" : "positive";
    modifiers.immediateOverallDelta = caught ? 0 : 5;
    if (caught) modifiers.suspended = true;
  }

  // The one injury a career never fully comes back from. The overall hit is
  // heavy, the period is written off, and — uniquely — the ceiling itself
  // drops, so the player can never regrow to who they were going to be.
  if (eventKey === "severe_injury" && optionKey === "fight_back") {
    const loss = severeInjuryPotentialLoss(injuryType ?? "acl_rupture");
    modifiers.potentialDelta = -loss;
    modifiers.immediateOverallDelta = -Math.round(loss * 0.8);
    modifiers.roleOverride = "substitute";
    modifiers.statsMultiplier = 0.35;
    outcomeKind = "negative";
  }

  if (eventKey === "injury" && optionKey === "continue") {
    modifiers.immediateOverallDelta = injuryOverallDelta(injuryType ?? "hamstring");
    modifiers.roleOverride = "substitute";
    outcomeKind = "negative";
  }

  if (eventKey === "season_load" && optionKey === "accept") {
    const success = roll(variantKey === "double_session" ? 0.65 : 0.7);
    modifiers.roleOverride = success ? "starter" : "substitute";
    outcomeKind = success ? "positive" : "negative";
  }

  if (eventKey === "season_load" && optionKey === "stay_calm") {
    modifiers.roleShift = -1;
  }

  if (eventKey === "position_change" && optionKey === "accept") {
    modifiers.roleOverride = "starter";
    modifiers.immediateOverallDelta = -2;
    modifiers.deferredOverallDelta = 2;
  }

  if (eventKey === "position_change" && optionKey === "reject") {
    modifiers.roleShift = -1;
    outcomeKind = "negative";
  }

  if (eventKey === "position_competition" && optionKey === "compete") {
    const success = roll(0.5);
    modifiers.roleOverride = success ? "starter" : "low_rotation";
    outcomeKind = success ? "positive" : "negative";
  }

  if (eventKey === "captain_armband" && optionKey === "wear_it") {
    const earns_it = roll(0.55);
    outcomeKind = earns_it ? "positive" : "negative";
    if (earns_it) {
      modifiers.permanentOverallDelta = 2;
      modifiers.fanSupportDelta = 5;
    } else {
      modifiers.immediateOverallDelta = -1;
      modifiers.fanSupportDelta = -6;
    }
  }
  // captain_armband / pass_it: staying out of the spotlight, deliberately risk-free.

  if (eventKey === "club_priority" && optionKey === "prioritize_league") {
    modifiers.leagueTrophyProbabilityMultiplier = 2;
    modifiers.continentalPrimaryTrophyProbabilityMultiplier = 0.5;
  }

  if (eventKey === "club_priority" && optionKey === "prioritize_continental") {
    modifiers.leagueTrophyProbabilityMultiplier = 0.5;
    modifiers.continentalPrimaryTrophyProbabilityMultiplier = 2;
  }

  if (eventKey === "rival_offer" && optionKey === "accept") {
    modifiers.roleOverride = "high_rotation";
    setAllTrophyMultipliers(modifiers, 2);
  }

  if (eventKey === "club_crisis" && optionKey === "stay_and_fight") {
    setAllTrophyMultipliers(modifiers, 0.1);
    outcomeKind = "negative";
  }

  if (eventKey === "iconic_number" && optionKey === "claim_it") {
    const honors_it = roll(0.5);
    outcomeKind = honors_it ? "positive" : "negative";
    if (honors_it) {
      modifiers.permanentOverallDelta = 1;
      modifiers.fanSupportDelta = 10;
    } else {
      modifiers.fanSupportDelta = -8;
    }
  }
  // iconic_number / let_someone_else: no modifiers, deliberately risk-free.

  if (eventKey === "return_home" && optionKey === "stay_abroad") {
    modifiers.immediateOverallDelta = -5;
    modifiers.deferredOverallDelta = 5;
    outcomeKind = "negative";
  }

  if (eventKey === "giant_tattoo" && optionKey === "accept") {
    const success = roll(0.7);
    outcomeKind = success ? "positive" : "negative";
    if (success) modifiers.permanentOverallDelta = 2;
    else modifiers.roleOverride = "substitute";
  }

  if (eventKey === "tax_trouble" && optionKey === "stay_and_fight") {
    modifiers.immediateOverallDelta = -3;
    modifiers.deferredOverallDelta = 3;
    outcomeKind = "negative";
  }

  if (eventKey === "finish_high_school" && optionKey === "accept") {
    modifiers.permanentOverallDelta = 1;
    modifiers.roleShift = -1;
  }

  if (eventKey === "locker_room_clash") {
    if (optionKey === "stand_your_ground") {
      const respected = roll(0.5);
      outcomeKind = respected ? "positive" : "negative";
      modifiers.roleShift = respected ? 1 : -1;
      modifiers.fanSupportDelta = respected ? 4 : -5;
    }
    // locker_room_clash / keep_the_peace: no modifiers, deliberately risk-free.
  }

  if (eventKey === "club_national_team_conflict") {
    if (optionKey === "go_anyway") {
      modifiers.roleOverride = "substitute";
      modifiers.nationalTournamentParticipation = "force";
    }
    if (optionKey === "comply") {
      modifiers.nationalTournamentParticipation = "skip";
    }
  }

  if (eventKey === "injury_at_peak") {
    const success = roll(optionKey === "play_injured" ? 0.8 : 0.3);
    outcomeKind = success ? "positive" : "negative";
    if (optionKey === "play_injured") modifiers.immediateOverallDelta = -1;
  }

  if (eventKey === "decisive_penalty") {
    const success = roll(0.5);
    outcomeKind = success ? "positive" : "negative";
  }

  if (eventKey === "new_manager" && optionKey === "impress_in_training") {
    const success = roll(0.55);
    modifiers.roleShift = success ? 1 : -1;
    outcomeKind = success ? "positive" : "negative";
  }
  // new_manager / stay_patient: wait and see, deliberately risk-free.

  if (eventKey === "derby_spotlight" && optionKey === "embrace_the_pressure") {
    const success = roll(0.55);
    modifiers.statsMultiplier = success ? 1.25 : 0.75;
    if (success) modifiers.leagueTrophyProbabilityMultiplier = 1.3;
    outcomeKind = success ? "positive" : "negative";
  }
  // derby_spotlight / focus_on_process: no swing either way.

  if (eventKey === "testimonial_match" && optionKey === "hold_the_testimonial") {
    modifiers.permanentOverallDelta = 1;
    outcomeKind = "positive";
  }
  // testimonial_match / keep_it_low_key: no modifiers.

  if (eventKey === "agent_ultimatum" && optionKey === "reassure_the_club") {
    modifiers.immediateOverallDelta = -1;
    modifiers.deferredOverallDelta = 1;
    outcomeKind = "negative";
  }
  // The engine appends a "leave" club-choice option automatically for CLUB_CHOICE_EVENTS.

  if (eventKey === "wonderkid_signing" && optionKey === "rise_to_the_challenge") {
    const success = roll(0.5);
    outcomeKind = success ? "positive" : "negative";
    if (success) {
      modifiers.permanentOverallDelta = 2;
      modifiers.roleShift = 1;
    } else {
      modifiers.roleShift = -1;
    }
  }
  if (eventKey === "wonderkid_signing" && optionKey === "welcome_and_mentor") {
    setAllTrophyMultipliers(modifiers, 1.15);
  }

  if (eventKey === "boot_deal" && optionKey === "sign_exclusive") {
    const success = roll(0.65);
    modifiers.immediateOverallDelta = success ? 2 : -1;
    outcomeKind = success ? "positive" : "negative";
  }
  // boot_deal / stick_with_current_boots: no modifiers.

  if (eventKey === "podcast_interview" && optionKey === "speak_your_mind") {
    const wellReceived = roll(0.5);
    outcomeKind = wellReceived ? "positive" : "negative";
    modifiers.fanSupportDelta = wellReceived ? 12 : -14;
    if (!wellReceived) modifiers.roleShift = -1;
  }
  // podcast_interview / play_it_safe: nothing gained, nothing lost.

  if (eventKey === "agent_change" && optionKey === "switch_agent") {
    // A sharper agent finds better moves, but the transition costs you a season's focus.
    const worksOut = roll(0.6);
    outcomeKind = worksOut ? "positive" : "negative";
    if (worksOut) modifiers.deferredOverallDelta = 2;
    else modifiers.immediateOverallDelta = -2;
  }

  if (eventKey === "packed_home_stadium" && optionKey === "feed_off_the_crowd") {
    const rises = roll(0.6);
    outcomeKind = rises ? "positive" : "negative";
    modifiers.statsMultiplier = rises ? 1.3 : 0.8;
    modifiers.fanSupportDelta = rises ? 10 : -5;
  }
  // packed_home_stadium / block_out_the_noise: steady, no swing.

  if (eventKey === "controversial_red_card") {
    if (optionKey === "accept_the_ban") {
      modifiers.roleShift = -1;
      outcomeKind = "negative";
    }
    if (optionKey === "appeal_publicly") {
      // Going to the press either clears your name or buys you a longer ban.
      const overturned = roll(0.45);
      outcomeKind = overturned ? "positive" : "negative";
      if (overturned) modifiers.fanSupportDelta = 8;
      else {
        modifiers.roleOverride = "substitute";
        modifiers.fanSupportDelta = -8;
      }
    }
  }

  if (eventKey === "crowd_turns") {
    if (optionKey === "win_them_back") {
      const wonBack = roll(0.55);
      outcomeKind = wonBack ? "positive" : "negative";
      modifiers.fanSupportDelta = wonBack ? 20 : -6;
      if (wonBack) modifiers.statsMultiplier = 1.15;
    }
    if (optionKey === "ignore_the_boos") {
      modifiers.fanSupportDelta = -5;
    }
  }

  if (eventKey === "rival_press") {
    if (optionKey === "provoke") {
      const landed = roll(0.5);
      outcomeKind = landed ? "positive" : "negative";
      modifiers.fanSupportDelta = landed ? 8 : -10;
      if (landed) modifiers.immediateOverallDelta = 1;
      else modifiers.roleShift = -1;
    }
    if (optionKey === "praise") {
      modifiers.fanSupportDelta = 3;
      outcomeKind = "positive";
    }
  }

  if (eventKey === "rival_milestone") {
    if (optionKey === "use_as_fuel") {
      const channeled = roll(0.55);
      outcomeKind = channeled ? "positive" : "negative";
      if (channeled) modifiers.permanentOverallDelta = 2;
      else modifiers.immediateOverallDelta = -1;
    }
    // rival_milestone / shrug_it_off: no modifiers, deliberately risk-free.
  }

  if (eventKey === "rival_duel") {
    if (optionKey === "take_the_weight") {
      const delivered = roll(0.55);
      outcomeKind = delivered ? "positive" : "negative";
      modifiers.statsMultiplier = delivered ? 1.2 : 0.85;
      modifiers.fanSupportDelta = delivered ? 6 : -4;
    }
    if (optionKey === "let_the_team_carry_it") {
      setAllTrophyMultipliers(modifiers, 1.1);
    }
  }

  if (eventKey === "hometown_parade" && optionKey === "enjoy_the_moment") {
    modifiers.permanentOverallDelta = 2;
    outcomeKind = "positive";
  }
  if (eventKey === "hometown_parade" && optionKey === "stay_grounded") {
    modifiers.roleShift = 1;
    outcomeKind = "positive";
  }

  // Taking a marquee shirt is a statement the terraces notice. There's no
  // gamble here — the number was offered because it was already earned, so
  // accepting simply pays, and turning it down costs nothing but the moment.
  if (eventKey === "shirt_upgrade" && optionKey === "take_number") {
    modifiers.fanSupportDelta = 5;
    outcomeKind = "positive";
  }
  if (eventKey === "shirt_legend_tribute" && optionKey === "take_number") {
    modifiers.fanSupportDelta = 8;
    outcomeKind = "positive";
  }

  return { rng: cur, modifiers, outcomeKind };
}

// ---------------------------------------------------------------------------
// Effect previews (display only)
// ---------------------------------------------------------------------------

/**
 * What an option's outcome actually does, in the same terms the player can
 * see on their card — OVR, Torcida (fan support), a squad-role nudge, or a
 * one-season performance swing. Purely for the decision UI: it mirrors
 * `resolveCareerEvent` above but never drives the RNG. Keep the two in sync
 * when either changes — they sit right next to each other on purpose.
 */
export interface EventEffectPreview {
  ovr?: number;
  fan?: number;
  /** Multiplier on this season's stats (goals/assists/clean sheets), shown as a % swing. */
  stats?: number;
  role?: -1 | 1;
}

type EventPreviewEntry = EventEffectPreview | { positive: EventEffectPreview; negative: EventEffectPreview };

export const EVENT_OPTION_PREVIEW: Partial<Record<CareerEventKey, Partial<Record<string, EventPreviewEntry>>>> = {
  training_extra: { accept: { positive: { ovr: 4 }, negative: { ovr: -3 } } },
  personal_coach: { accept: { positive: { ovr: 3 }, negative: { ovr: -2 } } },
  mysterious_substance: { consume: { positive: { ovr: 5 }, negative: {} } },
  season_load: {
    accept: { positive: { role: 1 }, negative: { role: -1 } },
    stay_calm: { role: -1 },
  },
  position_change: {
    accept: { ovr: -2, role: 1 },
    reject: { role: -1 },
  },
  position_competition: { compete: { positive: { role: 1 }, negative: { role: -1 } } },
  captain_armband: { wear_it: { positive: { ovr: 2, fan: 5 }, negative: { ovr: -1, fan: -6 } } },
  rival_offer: { accept: { role: 1 } },
  iconic_number: { claim_it: { positive: { ovr: 1, fan: 10 }, negative: { fan: -8 } } },
  return_home: { stay_abroad: { ovr: -5 } },
  giant_tattoo: { accept: { positive: { ovr: 2 }, negative: { role: -1 } } },
  tax_trouble: { stay_and_fight: { ovr: -3 } },
  finish_high_school: { accept: { ovr: 1, role: -1 } },
  locker_room_clash: { stand_your_ground: { positive: { role: 1, fan: 4 }, negative: { role: -1, fan: -5 } } },
  injury_at_peak: { play_injured: { ovr: -1 } },
  new_manager: { impress_in_training: { positive: { role: 1 }, negative: { role: -1 } } },
  derby_spotlight: { embrace_the_pressure: { positive: { stats: 1.25 }, negative: { stats: 0.75 } } },
  testimonial_match: { hold_the_testimonial: { ovr: 1 } },
  agent_ultimatum: { reassure_the_club: { ovr: -1 } },
  wonderkid_signing: {
    rise_to_the_challenge: { positive: { ovr: 2, role: 1 }, negative: { role: -1 } },
  },
  boot_deal: { sign_exclusive: { positive: { ovr: 2 }, negative: { ovr: -1 } } },
  podcast_interview: {
    speak_your_mind: { positive: { fan: 12 }, negative: { fan: -14, role: -1 } },
  },
  agent_change: { switch_agent: { positive: { ovr: 2 }, negative: { ovr: -2 } } },
  packed_home_stadium: {
    feed_off_the_crowd: { positive: { fan: 10, stats: 1.3 }, negative: { fan: -5, stats: 0.8 } },
  },
  controversial_red_card: {
    accept_the_ban: { role: -1 },
    appeal_publicly: { positive: { fan: 8 }, negative: { fan: -8, role: -1 } },
  },
  crowd_turns: {
    win_them_back: { positive: { fan: 20, stats: 1.15 }, negative: { fan: -6 } },
    ignore_the_boos: { fan: -5 },
  },
  rival_press: {
    provoke: { positive: { fan: 8, ovr: 1 }, negative: { fan: -10, role: -1 } },
    praise: { fan: 3 },
  },
  rival_milestone: {
    use_as_fuel: { positive: { ovr: 2 }, negative: { ovr: -1 } },
  },
  rival_duel: {
    take_the_weight: { positive: { fan: 6, stats: 1.2 }, negative: { fan: -4, stats: 0.85 } },
  },
  hometown_parade: {
    enjoy_the_moment: { ovr: 2 },
    stay_grounded: { role: 1 },
  },
  shirt_upgrade: {
    take_number: { fan: 5 },
  },
  shirt_legend_tribute: {
    take_number: { fan: 8 },
  },
};

export function eventOptionPreview(eventKey: CareerEventKey, optionKey: string): EventPreviewEntry | null {
  return EVENT_OPTION_PREVIEW[eventKey]?.[optionKey] ?? null;
}

function setAllTrophyMultipliers(modifiers: Modifiers, factor: number): void {
  modifiers.leagueTrophyProbabilityMultiplier = factor;
  modifiers.domesticCupTrophyProbabilityMultiplier = factor;
  modifiers.continentalPrimaryTrophyProbabilityMultiplier = factor;
  modifiers.continentalSecondaryTrophyProbabilityMultiplier = factor;
  modifiers.clubWorldCupTrophyProbabilityMultiplier = factor;
}
