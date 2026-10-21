/** Ferramentas puras de teste. O app só importa este módulo em desenvolvimento. */
import type { Career } from "./career/types";
import { ovrAt, type Player } from "./player/player";
import { POTENTIAL_RANGE, type TalentBand } from "./player/talent";
import type { Trait } from "./player/traits";
import type { Position } from "./player/positions";
import { clamp } from "./math";
import { cloneCareer } from "./coach/career";
import type { CoachCareer } from "./coach/types";
import { debugEvent } from "./coach/events";
import { refreshStrength, squadOf } from "./coach/world";
import { attributesAt } from "./player/player";
import { EVENT_CATALOG } from "./events/catalog";
import { eventContext, marketContext } from "./career/context";
import { eventDecision } from "./career/events";
import { baseDecision, windowDecision, returnDecision, releaseDecision } from "./career/decisions";
import { buildOffer, loanOffers } from "./career/market";
import { matchChance, promiseOptions } from "./career/drama";
import { focusesFor } from "./evolution/training";
import { VETERAN_PATHS, type MatchScene } from "./career/dramaTypes";
import type { Decision, DecisionKind, DecisionOption } from "./career/types";
import { CLUBS, getClub, leagueAt } from "@craque/world";
import { clubIndex } from "./world/model";
import { stream } from "./rng";

/** Só o módulo de debug monta este cenário; nenhuma agenda ou sorteio normal o consulta. */
export function debugDecision(career: Career, key: string): Career {
  if (!key) return career;
  let next: Career = { ...career, end: null };
  if (!next.contract) {
    const offer = baseDecision(next).decision?.options.find(option => option.kind === "club");
    if (offer?.kind === "club") next = { ...next, contract: { club: offer.offer.club, shirt: offer.offer.shirt, mission: offer.offer.mission, pressure: offer.offer.pressure, demand: 0, since: next.world.year, strengthAtArrival: offer.offer.strength, benchSeasons: 0, loan: null }, bonds: { ...next.bonds, [offer.offer.club]: { fans: 50, peakFans: 50, seasons: 0, legacyPoints: 0, ovrWhenLeft: null, traitor: false } } };
  }
  const id = next.decisionCount + 1;
  const common = { id, age: next.age, year: next.world.year, event: null, reason: null } as const;
  const drama = { remaining: 1, startAge: next.age, startAttributes: attributesAt(next.player, next.age), event: null, traitor: false, prepared: true, queue: [], results: [], decisions: 1 } as const;
  let decision: Decision;
  if (key.startsWith("match:")) {
    const scene = key.slice(6) as MatchScene;
    const team = next.contract?.club ?? "flamengo";
    const club = getClub(team);
    const opponent = CLUBS.find(candidate => candidate.country === club?.country && candidate.id !== team)?.id ?? "palmeiras";
    const match = { competition: scene === "keeperCorner" || scene === "shootout" || scene === "decisivePenalty" ? `cup:${club?.country ?? "BRA"}` : `league:${leagueAt(club?.country ?? "BRA", next.world.division[clubIndex(team)] ?? 1)?.id ?? "brasileirao"}`, team, opponent, national: false, stage: scene === "keeperCorner" || scene === "shootout" || scene === "decisivePenalty" ? "quarter" as const : "league" as const, minute: scene === "shootout" ? 120 : scene === "keeperCorner" ? 94 : 86, score: [1, scene === "keeperCorner" ? 2 : 1] as const, scene };
    const actions = scene === "decisivePenalty" ? ["take", "leave"] : ["penalty", "shootout", "penaltySave"].includes(scene) ? ["left", "right"] : ["bold", "team", "safe"];
    decision = { ...common, kind: "match", match, options: actions.map(action => ({ id: `drama:${action}`, kind: "drama", action, chance: matchChance(next, match, action) })) };
    next = { ...next, drama: { ...drama, queue: [match] } };
  } else if (key === "promise" || key === "veteran") {
    const actions = key === "promise" ? ["humble", "protagonist", "legend"] : VETERAN_PATHS;
    decision = { ...common, kind: key, options: actions.map(action => ({ id: `drama:${action}`, kind: "drama", action, chance: null })), ...(key === "promise" ? { promises: promiseOptions(next) } : {}) };
    next = { ...next, drama };
  } else if (key.startsWith("event:")) {
    const event = EVENT_CATALOG.find(candidate => candidate.id === key.slice(6));
    if (!event) return career;
    const built = eventDecision(next, event, eventContext(next), id);
    // O teste pode ignorar pré-requisitos; alvos ausentes recebem dados reais do catálogo.
    const fallback: DecisionOption[] = event.options.map(option => {
      const effects = [...option.success, ...(option.failure ?? [])];
      const target = effects.find(effect => effect.kind === "transfer");
      const candidate = target ? CLUBS.find(club => club.id !== next.contract?.club && (target.to !== "home" || club.country === next.nationality)) : null;
      const club = candidate ? buildOffer(marketContext(next), clubIndex(candidate.id), stream(next.setup.seed, "events", "debugTarget", event.id)) : undefined;
      return { id: option.id, kind: "event", option: option.id, optionKind: option.kind, chance: option.kind === "risky" ? option.chance ?? 0.5 : null, preview: { success: option.success, failure: option.failure ?? [] }, target: { ...(club ? { club } : {}), number: 10, position: next.player.position === "cm" ? "cam" : "cm", country: next.nationality === "BRA" ? "POR" : "BRA" } };
    });
    decision = built ?? { ...common, kind: "event", event: event.id, options: fallback };
    next = { ...next, drama: undefined };
  } else {
    const kind = key as DecisionKind;
    if (kind === "return" && next.contract && !next.contract.loan) {
      const owner = CLUBS.find(club => club.id !== next.contract!.club)?.id ?? "palmeiras";
      next = { ...next, contract: { ...next.contract, loan: { owner, ownerShirt: 10, untilAge: next.age } } };
    }
    const generated = key === "base" ? baseDecision(next) : key === "return" ? returnDecision(next) : key === "release" ? releaseDecision(next) : windowDecision(next, null, true);
    const market = generated.decision ? generated : windowDecision(next, null, true);
    const loanRng = stream(next.setup.seed, "market", "debugLoan");
    const loans = kind === "loan" ? loanOffers(marketContext(next), 3, loanRng) : [];
    if (kind === "loan" && !loans.length) {
      for (const candidate of market.decision?.options ?? []) if (candidate.kind === "club") loans.push(buildOffer(marketContext(next), clubIndex(candidate.offer.club), loanRng, { loan: true }));
    }
    const options: readonly DecisionOption[] = kind === "focus" ? focusesFor(next.player.position).map(focus => ({ id: `focus:${focus}`, kind: "focus", focus })) : kind === "forced" ? [{ id: "retire", kind: "retire" }] : market.decision?.options ?? [];
    decision = { ...common, kind, reason: market.decision?.reason ?? null, options: loans.length ? loans.map(offer => ({ id: `club:${offer.club}`, kind: "club", offer })) : options };
    next = { ...next, drama: undefined };
  }
  return { ...next, decision, decisionCount: id };
}

export function debugPlayer(career: Career, patch: { talent: TalentBand; age: number; ovr: number; position: Position; trait: Trait; loanOwner: string | null }): Career {
  const age = clamp(Math.round(patch.age), 16, 39);
  const range = POTENTIAL_RANGE[patch.talent];
  let player: Player = { ...career.player, talent: patch.talent, position: patch.position, potential: (range[0] + range[1]) / 2, trait: patch.trait, capacity: 40 };
  for (let step = 0; step < 1400 && ovrAt(player, age) < clamp(patch.ovr, 40, 99); step++) player = { ...player, capacity: player.capacity + 0.05 };
  const contract = career.contract ? { ...career.contract, loan: patch.loanOwner && patch.loanOwner !== career.contract.club ? { owner: patch.loanOwner, ownerShirt: 10, untilAge: age + 2 } : null } : null;
  return { ...career, player, age, contract, decision: career.decision ? { ...career.decision, age } : null };
}

export function debugCoach(career: CoachCareer, patch: { board: number; fans: number; reputation: number; budget: number; squadDelta: number; player?: string; playerOvr?: number; heal: boolean; event: string | null }): CoachCareer {
  const next = cloneCareer(career);
  next.reputation = clamp(patch.reputation, 0, 100);
  if (!next.coach) return next;
  next.coach.board = clamp(patch.board, 0, 100);
  next.coach.fans = clamp(patch.fans, 0, 100);
  next.coach.budget = Math.max(0, patch.budget);
  for (const player of Object.values(next.players)) {
    if (player.club !== next.coach.club) continue;
    player.level = clamp(player.level + patch.squadDelta, 40, 99);
    player.ovr = Math.round(player.level);
    next.players[player.id] = { ...player, potential: Math.max(player.potential, player.level), injury: patch.heal ? null : player.injury };
  }
  const selected = patch.player ? next.players[patch.player] : null;
  if(selected && selected.club===next.coach.club && patch.playerOvr!==undefined) {
    selected.level=clamp(Math.round(patch.playerOvr),30,99);selected.ovr=Math.round(selected.level);
    next.players[selected.id]={...selected,potential:Math.max(selected.potential,selected.level)};
  }
  const club=next.clubs[next.coach.club];
  if(club)refreshStrength(club,squadOf(next,club.id));
  if (patch.event && (next.phase === "stage" || next.phase === "event") && !next.flow) {
    const event = debugEvent(next, patch.event);
    if (event) { next.event = event; next.phase = "event"; next.matchEventArmed = false; }
  }
  return next;
}
