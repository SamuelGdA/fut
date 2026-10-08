import { areRivals } from "@craque/world";
import { ovrAt } from "../player/player";
import { SEASONS_PER_PERIOD } from "../types";
import { arrivalFans } from "./fans";
import { MISSION_TERMS } from "./mission";
import type { Career, CareerNotice, ClubBond, ClubOffer, Contract } from "./types";

/**
 * A mudança de clube (GDD 15.3 a 15.7): contrato novo, camisa, missão,
 * torcida na chegada, empréstimo e traição.
 */

export function newBond(): ClubBond {
  return { fans: 50, peakFans: 50, seasons: 0, legacyPoints: 0, ovrWhenLeft: null, traitor: false };
}

export interface MoveOptions {
  /** Vai emprestado: o clube atual continua dono do passe. */
  readonly loan: boolean;
}

export interface Move {
  readonly career: Career;
  /** Trocou direto pelo rival histórico: virou Traidor. */
  readonly traitor: boolean;
}

/**
 * Leva o jogador a um clube. Na saída, o clube antigo guarda o OVR de quem
 * saiu (para a torcida da volta); trocar direto pelo rival histórico, sem ser
 * empréstimo, faz dele Traidor e o clube antigo nunca mais oferece nada.
 * Ser comprado pelo clube do empréstimo mantém a torcida que ele já tinha lá.
 */
export function moveTo(career: Career, offer: ClubOffer, notices: CareerNotice[], options: MoveOptions): Move {
  const previous = career.contract;
  const ovr = ovrAt(career.player, career.age);
  const bonds = { ...career.bonds };
  let blocked = career.blocked;
  let traitor = false;
  const sameClub = previous !== null && previous.club === offer.club;

  if (previous && !sameClub) {
    const old = bonds[previous.club] ?? newBond();
    traitor = !options.loan && previous.loan === null && areRivals(previous.club, offer.club);
    bonds[previous.club] = { ...old, ovrWhenLeft: ovr, traitor: old.traitor || traitor };
    if (traitor && !blocked.includes(previous.club)) blocked = [...blocked, previous.club];
  }

  const firstClub = previous === null && career.history.length === 0;
  const existing = bonds[offer.club];
  const fans = sameClub && existing ? existing.fans : arrivalFans(existing, offer.fansStart, firstClub, ovr);
  const base = existing ?? newBond();
  bonds[offer.club] = { ...base, fans, peakFans: Math.max(base.peakFans, fans), ovrWhenLeft: null };

  // A camisa é a da oferta: ele viu o número antes de escolher.
  const shirt = sameClub && previous ? previous.shirt : offer.shirt;

  const period = SEASONS_PER_PERIOD[career.setup.pace];
  const loan =
    options.loan && previous
      ? {
          owner: previous.loan?.owner ?? previous.club,
          ownerShirt: previous.loan?.ownerShirt ?? previous.shirt,
          untilAge: career.age + period,
        }
      : null;

  const contract: Contract = {
    club: offer.club,
    mission: offer.mission,
    pressure: offer.pressure,
    demand: MISSION_TERMS[offer.mission].demand,
    shirt,
    since: sameClub && previous ? previous.since : career.world.year,
    strengthAtArrival: offer.strength,
    benchSeasons: 0,
    loan,
  };

  notices.push({ kind: "transfer", from: previous?.club ?? null, to: offer.club, loan: options.loan, traitor });
  return {
    career: {
      ...career,
      contract,
      bonds,
      blocked,
      loans: career.loans + (options.loan ? 1 : 0),
      proving: false,
    },
    traitor,
  };
}
