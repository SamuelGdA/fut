import type { EventDefinition } from "./model";

/**
 * O catálogo de eventos (GDD 18.3). Só dados: quando cada evento pode
 * aparecer, as opções e o efeito de cada resultado. Os textos estão no pacote
 * de conteúdo pela mesma chave (`events.<id>`).
 *
 * Números de capacidade são pequenos de propósito: um evento empurra a
 * carreira, não a reescreve. O teto suave e o orçamento do potencial (GDD 10)
 * valem depois de qualquer evento.
 */
export const EVENT_CATALOG: readonly EventDefinition[] = [
  {
    id: "extraTraining",
    weight: 100,
    tags: ["training"],
    when: [],
    options: [
      { id: "push", kind: "risky", chance: 0.6, success: [{ kind: "capacity", amount: 1, when: "now" }], failure: [{ kind: "games", scale: 0.8 }, { kind: "story", tag: "overtraining" }] },
      { id: "routine", kind: "safe", success: [] },
    ],
  },
  {
    id: "personalCoach",
    weight: 90,
    tags: ["training"],
    when: [{ kind: "age", max: 30 }],
    options: [
      {
        id: "hire",
        kind: "risky",
        chance: 0.65,
        success: [{ kind: "capacity", amount: 1, when: "now" }, { kind: "attributes", amount: 1 }],
        // Deu errado é só perda: o técnico do clube não aceita o trabalho por fora.
        failure: [{ kind: "role", change: "down" }],
      },
      { id: "decline", kind: "safe", success: [] },
    ],
  },
  {
    id: "supplement",
    weight: 18,
    tags: ["scandal"],
    when: [{ kind: "age", min: 19, max: 33 }],
    options: [
      {
        id: "take",
        kind: "risky",
        chance: 0.55,
        success: [{ kind: "capacity", amount: 2, when: "now" }],
        failure: [{ kind: "suspension", seasons: 1 }, { kind: "fans", amount: -15 }, { kind: "story", tag: "doping" }],
      },
      { id: "refuse", kind: "safe", success: [{ kind: "story", tag: "clean" }] },
    ],
  },
  {
    id: "loadManagement",
    weight: 90,
    tags: ["fitness"],
    when: [{ kind: "lastGames", min: 12 }],
    options: [
      { id: "rest", kind: "choice", success: [{ kind: "games", scale: 0.82 }, { kind: "injury", scale: 0.5 }, { kind: "growth", scale: 0.92 }] },
      { id: "playAll", kind: "choice", success: [{ kind: "games", scale: 1.08 }, { kind: "production", scale: 1.08 }, { kind: "injury", scale: 1.6 }] },
    ],
  },
  {
    id: "newRole",
    weight: 80,
    tags: ["tactics"],
    when: [{ kind: "neighbourPosition" }],
    options: [
      { id: "accept", kind: "change", success: [{ kind: "position" }, { kind: "role", change: "fixStarter" }] },
      { id: "refuse", kind: "safe", success: [{ kind: "role", change: "down" }] },
    ],
  },
  {
    id: "rivalSigned",
    weight: 90,
    tags: ["squad"],
    when: [{ kind: "role", in: ["starter", "star"] }],
    options: [
      { id: "fight", kind: "risky", chance: 0.5, success: [{ kind: "fans", amount: 3 }], failure: [{ kind: "role", change: "down" }] },
      { id: "leave", kind: "change", success: [{ kind: "transfer", to: "offer" }] },
    ],
  },
  {
    id: "captaincy",
    weight: 70,
    tags: ["leadership"],
    when: [{ kind: "age", min: 24 }, { kind: "seasonsAtClub", min: 3 }],
    options: [
      { id: "accept", kind: "choice", success: [{ kind: "fans", amount: 10 }, { kind: "pressure", amount: 0.2 }, { kind: "story", tag: "captain" }] },
      { id: "decline", kind: "safe", success: [] },
    ],
  },
  {
    id: "seasonPriority",
    weight: 80,
    tags: ["tactics"],
    when: [{ kind: "continental" }],
    options: [
      { id: "league", kind: "choice", success: [{ kind: "boost", target: "league", amount: 3 }, { kind: "boost", target: "continental", amount: -3 }] },
      { id: "continent", kind: "choice", success: [{ kind: "boost", target: "continental", amount: 3 }, { kind: "boost", target: "league", amount: -3 }] },
    ],
  },
  {
    id: "rivalCalls",
    weight: 70,
    tags: ["transfer", "loyalty"],
    when: [{ kind: "rivalClubInterested" }],
    options: [
      { id: "sign", kind: "change", success: [{ kind: "transfer", to: "rivalClub" }] },
      { id: "stay", kind: "safe", success: [{ kind: "fans", amount: 8 }] },
    ],
  },
  {
    id: "financialCrisis",
    weight: 45,
    tags: ["transfer"],
    when: [{ kind: "clubDecline", min: 3 }],
    options: [
      { id: "accept", kind: "change", success: [{ kind: "transfer", to: "offer" }] },
      { id: "stay", kind: "safe", success: [{ kind: "clubStrength", amount: -2 }, { kind: "fans", amount: 6 }] },
    ],
  },
  {
    id: "numberTen",
    weight: 45,
    tags: ["shirt"],
    when: [{ kind: "tenFree" }],
    options: [
      { id: "wear", kind: "choice", success: [{ kind: "shirt", number: "ten" }, { kind: "pressure", amount: 0.15 }, { kind: "fans", amount: 4 }] },
      { id: "keep", kind: "safe", success: [] },
    ],
  },
  {
    id: "homesick",
    weight: 45,
    tags: ["transfer", "personal"],
    when: [{ kind: "abroad", min: 3 }],
    options: [
      { id: "goHome", kind: "change", success: [{ kind: "transfer", to: "home" }] },
      { id: "stay", kind: "safe", success: [{ kind: "capacity", amount: -1, when: "period" }] },
    ],
  },
  {
    id: "tattoo",
    weight: 35,
    tags: ["personal"],
    when: [{ kind: "age", max: 30 }],
    options: [
      { id: "doIt", kind: "risky", chance: 0.8, success: [{ kind: "fans", amount: 6 }], failure: [{ kind: "games", scale: 0.5 }, { kind: "story", tag: "infection" }] },
      { id: "skip", kind: "safe", success: [] },
    ],
  },
  {
    id: "taxes",
    weight: 25,
    tags: ["scandal"],
    when: [{ kind: "value", min: 20_000_000 }],
    options: [
      { id: "settle", kind: "safe", success: [{ kind: "fans", amount: -6 }] },
      {
        id: "fight",
        kind: "risky",
        chance: 0.5,
        success: [{ kind: "fans", amount: 4 }, { kind: "story", tag: "acquitted" }],
        failure: [{ kind: "suspension", seasons: 0.5 }, { kind: "fans", amount: -8 }],
      },
    ],
  },
  {
    id: "passport",
    weight: 25,
    tags: ["national"],
    when: [{ kind: "nationWeakOrUncapped" }],
    options: [
      { id: "switch", kind: "change", success: [{ kind: "nationality" }] },
      { id: "keep", kind: "safe", success: [] },
    ],
  },
  {
    id: "diploma",
    weight: 30,
    tags: ["personal"],
    when: [{ kind: "age", max: 19 }],
    options: [
      { id: "study", kind: "choice", success: [{ kind: "growth", scale: 0.9 }, { kind: "story", tag: "diploma" }] },
      { id: "football", kind: "safe", success: [] },
    ],
  },
  {
    id: "dressingRoomRift",
    weight: 45,
    tags: ["squad"],
    when: [],
    options: [
      { id: "takeSide", kind: "risky", chance: 0.5, success: [{ kind: "fans", amount: 6 }, { kind: "role", change: "up" }], failure: [{ kind: "role", change: "down" }, { kind: "fans", amount: -4 }] },
      { id: "neutral", kind: "safe", success: [] },
    ],
  },
  {
    id: "comeback",
    weight: 50,
    tags: ["transfer", "loyalty"],
    when: [{ kind: "legacyElsewhere" }],
    options: [
      { id: "return", kind: "change", success: [{ kind: "transfer", to: "legacy" }, { kind: "role", change: "fixStarter" }, { kind: "fans", amount: 10 }] },
      { id: "stay", kind: "safe", success: [] },
    ],
  },
  {
    id: "clubOrCountry",
    weight: 20,
    tags: ["national"],
    when: [{ kind: "tournamentSquad" }],
    options: [
      {
        id: "tournament",
        kind: "risky",
        chance: 0.75,
        success: [{ kind: "national", mode: "force" }],
        failure: [{ kind: "national", mode: "force" }, { kind: "games", scale: 0.8 }],
      },
      { id: "club", kind: "choice", success: [{ kind: "national", mode: "skip" }, { kind: "fans", amount: 5 }] },
    ],
  },
  {
    id: "painBeforeFinal",
    weight: 20,
    tags: ["final", "injury-risk"],
    when: [{ kind: "knockout" }],
    options: [
      {
        id: "sacrifice",
        kind: "risky",
        chance: 0.6,
        success: [{ kind: "final", result: "win" }, { kind: "fans", amount: 6 }],
        failure: [{ kind: "final", result: "lose" }, { kind: "games", scale: 0.6 }, { kind: "capacity", amount: -1, when: "now" }],
      },
      { id: "rest", kind: "safe", success: [{ kind: "final", result: "lose" }] },
    ],
  },
  {
    id: "muscleInjury",
    weight: 100,
    tags: ["injury"],
    when: [{ kind: "lastGames", min: 20 }],
    options: [
      {
        id: "rushBack",
        kind: "risky",
        chance: 0.6,
        success: [{ kind: "games", scale: 0.9 }],
        failure: [{ kind: "games", scale: 0.6 }, { kind: "capacity", amount: -1, when: "now" }],
      },
      { id: "fullRecovery", kind: "safe", success: [{ kind: "games", scale: 0.78 }] },
    ],
  },
  {
    id: "decisivePenalty",
    weight: 20,
    tags: ["final"],
    when: [{ kind: "knockout" }],
    options: [
      { id: "take", kind: "risky", chance: 0.7, success: [{ kind: "final", result: "win" }, { kind: "fans", amount: 8 }], failure: [{ kind: "final", result: "lose" }, { kind: "fans", amount: -6 }] },
      // Quem bate é outro, mas a final existe: metade das vezes ele converte.
      { id: "leave", kind: "risky", chance: 0.5, success: [{ kind: "final", result: "win" }], failure: [{ kind: "final", result: "lose" }] },
    ],
  },
  {
    id: "newCoach",
    weight: 55,
    tags: ["squad"],
    when: [],
    options: [
      { id: "impress", kind: "risky", chance: 0.6, success: [{ kind: "role", change: "up" }], failure: [{ kind: "role", change: "down" }] },
      { id: "leave", kind: "change", success: [{ kind: "transfer", to: "offer" }] },
    ],
  },
  {
    id: "derby",
    weight: 60,
    tags: ["fans"],
    when: [{ kind: "derby" }],
    options: [
      { id: "provoke", kind: "risky", chance: 0.55, success: [{ kind: "fans", amount: 12 }], failure: [{ kind: "fans", amount: -10 }] },
      { id: "fairPlay", kind: "safe", success: [{ kind: "fans", amount: 2 }] },
    ],
  },
  {
    id: "idolFarewell",
    weight: 40,
    tags: ["leadership"],
    when: [{ kind: "seasonsAtClub", min: 5 }],
    options: [
      { id: "honor", kind: "choice", success: [{ kind: "fans", amount: 8 }, { kind: "pressure", amount: 0.15 }] },
      { id: "discreet", kind: "safe", success: [] },
    ],
  },
  {
    id: "agentUltimatum",
    weight: 50,
    tags: ["transfer"],
    when: [{ kind: "age", min: 21, max: 30 }],
    options: [
      { id: "force", kind: "change", success: [{ kind: "fans", amount: -12 }, { kind: "transfer", to: "bigger" }] },
      { id: "stay", kind: "safe", success: [{ kind: "fans", amount: 4 }] },
    ],
  },
  {
    id: "academyJewel",
    weight: 45,
    tags: ["leadership"],
    when: [{ kind: "age", min: 28 }],
    options: [
      { id: "mentor", kind: "choice", success: [{ kind: "fans", amount: 8 }, { kind: "growth", scale: 0.9 }, { kind: "story", tag: "mentor" }] },
      { id: "compete", kind: "safe", success: [] },
    ],
  },
  {
    id: "bootDeal",
    weight: 35,
    tags: ["fame"],
    when: [{ kind: "ovr", min: 75 }],
    options: [
      { id: "flashy", kind: "choice", success: [{ kind: "fans", amount: 6 }, { kind: "pressure", amount: 0.15 }] },
      { id: "discreet", kind: "safe", success: [] },
    ],
  },
  {
    id: "podcast",
    weight: 50,
    tags: ["fame"],
    when: [{ kind: "age", min: 20 }],
    options: [
      { id: "speak", kind: "risky", chance: 0.5, success: [{ kind: "fans", amount: 10 }], failure: [{ kind: "fans", amount: -10 }] },
      { id: "decline", kind: "safe", success: [] },
    ],
  },
  {
    id: "newAgent",
    weight: 40,
    tags: ["transfer"],
    when: [{ kind: "age", min: 20, max: 32 }],
    options: [
      { id: "change", kind: "risky", chance: 0.6, success: [{ kind: "market", amount: 2 }], failure: [{ kind: "market", amount: -2 }] },
      { id: "keep", kind: "safe", success: [] },
    ],
  },
  {
    id: "packedStadium",
    weight: 55,
    tags: ["fans"],
    when: [],
    options: [
      { id: "showboat", kind: "risky", chance: 0.5, success: [{ kind: "production", scale: 1.3 }, { kind: "fans", amount: 5 }], failure: [{ kind: "production", scale: 0.8 }, { kind: "fans", amount: -3 }] },
      { id: "focused", kind: "safe", success: [] },
    ],
  },
  {
    id: "redCard",
    weight: 45,
    tags: ["discipline"],
    when: [{ kind: "any", of: [{ kind: "trait", in: ["hothead"] }, { kind: "lastGames", min: 30 }] }],
    options: [
      { id: "appeal", kind: "risky", chance: 0.5, success: [{ kind: "games", scale: 0.97 }], failure: [{ kind: "games", scale: 0.85 }] },
      { id: "accept", kind: "safe", success: [{ kind: "games", scale: 0.93 }] },
    ],
  },
  {
    id: "boos",
    weight: 45,
    tags: ["fans"],
    when: [{ kind: "fans", max: 35 }],
    options: [
      { id: "fight", kind: "choice", success: [{ kind: "capacity", amount: -1, when: "period" }, { kind: "fans", amount: 6 }] },
      { id: "leave", kind: "change", success: [{ kind: "transfer", to: "offer" }] },
    ],
  },
  {
    id: "rowCoach",
    weight: 16,
    tags: ["discipline"],
    when: [],
    options: [
      { id: "standGround", kind: "risky", chance: 0.4, success: [{ kind: "fans", amount: 6 }], failure: [{ kind: "role", change: "down" }, { kind: "fans", amount: -3 }] },
      { id: "apologize", kind: "safe", success: [{ kind: "fans", amount: -2 }] },
    ],
  },
  {
    id: "rowBoard",
    weight: 12,
    tags: ["discipline", "transfer"],
    when: [],
    options: [
      { id: "standGround", kind: "risky", chance: 0.35, success: [{ kind: "fans", amount: 8 }], failure: [{ kind: "block" }, { kind: "transfer", to: "offer" }] },
      { id: "apologize", kind: "safe", success: [{ kind: "fans", amount: -2 }] },
    ],
  },
  {
    id: "rowFans",
    weight: 10,
    tags: ["discipline", "fans"],
    when: [{ kind: "fans", max: 50 }],
    options: [
      {
        id: "provoke",
        kind: "risky",
        chance: 0.3,
        success: [{ kind: "fans", amount: 5 }],
        failure: [{ kind: "fans", amount: -25 }, { kind: "block" }, { kind: "transfer", to: "offer" }],
      },
      { id: "apologize", kind: "safe", success: [{ kind: "fans", amount: 3 }] },
    ],
  },
  {
    id: "prestigeShirt",
    weight: 18,
    tags: ["shirt"],
    when: [{ kind: "prestigeNumberFree" }],
    expand: "prestigeNumbers",
    options: [
      { id: "number", kind: "choice", success: [{ kind: "shirt", number: "chosen" }, { kind: "pressure", amount: 0.15 }] },
      { id: "keep", kind: "safe", success: [] },
    ],
  },
  {
    id: "homage",
    weight: 12,
    tags: ["shirt", "legacy"],
    when: [{ kind: "homage" }],
    expand: "homageNumbers",
    options: [
      { id: "number", kind: "choice", success: [{ kind: "shirt", number: "chosen" }, { kind: "pressure", amount: 0.1 }, { kind: "fans", amount: 4 }] },
    ],
  },
  {
    id: "seriousInjury",
    weight: 26,
    tags: ["injury"],
    when: [{ kind: "age", min: 20, max: 34 }],
    options: [
      { id: "aggressive", kind: "choice", success: [{ kind: "games", scale: 0.6 }, { kind: "potential", amount: -3, floor: 60 }] },
      { id: "conservative", kind: "choice", success: [{ kind: "games", scale: 0.35 }, { kind: "potential", amount: -2, floor: 60 }] },
    ],
  },
];

/** Eventos de lesão: no máximo dois por carreira (GDD 18.1). */
export const INJURY_TAG = "injury";
export const MAX_INJURY_EVENTS = 2;

const byId = new Map(EVENT_CATALOG.map((event) => [event.id, event]));

export function getEvent(id: string): EventDefinition | null {
  return byId.get(id) ?? null;
}
