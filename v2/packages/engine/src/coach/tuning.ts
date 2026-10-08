import type { CountryCode } from "@craque/world";

/**
 * Todos os números do Técnico (GDD 56), num lugar só. Cada bloco explica o
 * que o número faz na tela; o harness `pnpm balance:tecnico` mede as metas.
 *
 * Unidades: dinheiro em euros; salário sempre mensal; tempo em dias de
 * calendário (a temporada tem SEASON_DAYS dias de jogos e OFFSEASON_DAYS de
 * férias).
 */

export const COACH_VERSION = "1.0.0";

/** A carreira dura 24 temporadas, nos dois modos (spec 17). */
export const CAREER_SEASONS = 24;

/** Ações por etapa (spec 6). */
export const ACTIONS_PER_STAGE = 3;

/** Propostas iniciais: três sorteios independentes, 95% segunda divisão (spec 4). */
export const INITIAL_OFFERS = { count: 3, secondDivisionChance: 0.95 } as const;

/** Calendário: dias da temporada, metade do lento e férias. */
export const CALENDAR_DAYS = {
  season: 300,
  half: 150,
  offseason: 65,
  /** Primeira e última rodada de liga. */
  firstRound: 8,
  lastRound: 292,
} as const;

/** Meses de salário e receita por período: 12 no rápido, 6 + 6 no lento. */
export const MONTHS_PER_SEASON = 12;

// ------------------------------------------------------------- inscrição

export interface RegistrationRule {
  /** Teto da lista principal (jogadores acima de `youthAge`). */
  readonly senior: number;
  /** Jovens até esta idade no ano da temporada ficam fora do teto. */
  readonly youthAge: number;
}

/**
 * Inscrição (spec 10): o modelo da Premier League (25 + jovens fora) vale só
 * para a Inglaterra; os demais países usam um teto mais largo. A regra de
 * formados no país (homegrown) não é aplicada: é específica da inscrição
 * inglesa e complicaria sem criar escolha interessante (D53).
 */
export const REGISTRATION: { readonly default: RegistrationRule } & Partial<Record<CountryCode, RegistrationRule>> = {
  default: { senior: 30, youthAge: 21 },
  ENG: { senior: 25, youthAge: 21 },
};

/** Elenco viável: nenhuma operação pode deixar menos que isso. */
export const SQUAD_MINIMUM = { players: 18, goalkeepers: 2 } as const;

/** Jogadores no banco por país (regulamentos com 12 suplentes); o resto usa 9. */
export const BENCH_SIZE: { readonly default: number } & Partial<Record<CountryCode, number>> = {
  default: 9,
  BRA: 12,
  ITA: 12,
  ARG: 12,
};

/** Lei 3 da IFAB com cinco substituições: três paradas além do intervalo. */
export const SUBSTITUTIONS = { max: 5, windows: 3, minimumOnField: 7 } as const;

// ---------------------------------------------------------------- partidas

/**
 * Gols esperados de um lado (spec 9):
 *   λ = base × e^(ataque × (ATQ − DEF adv) + meio × (MEI − MEI adv) ± mando)
 * Com 6 pontos de vantagem em todos os setores (um europeu de elite contra o
 * melhor sul-americano), o favorito vence cerca de 60% a 65% num jogo único.
 */
export const MATCH = {
  base: 1.32,
  attackSlope: 0.055,
  midSlope: 0.025,
  home: 0.11,
  minLambda: 0.12,
  maxLambda: 4.2,
  /** Prorrogação: fração de um jogo. */
  extraTime: 1 / 3,
  /** Um jogador a menos em campo tira esta fração dos gols e aumenta os sofridos. */
  shortHanded: 0.1,
} as const;

/** Peso de cada setor na conta de ataque e de defesa. */
export const SECTOR_MIX = {
  attack: { att: 0.75, mid: 0.25 },
  defense: { def: 0.65, gk: 0.2, mid: 0.15 },
  /** Cada jogador a mais que a base (4 defensores, 4 meias, 2 atacantes) soma isto ao setor. */
  countBonus: 1.2,
} as const;

/** Penalidade de posição: mesma posição, alternativa, mesmo setor, outro setor, goleiro fora do gol. */
export const POSITION_FIT = { alternate: -1, sameSector: -3, otherSector: -7, goalkeeper: -25 } as const;

/**
 * Filosofias (spec 9): multiplicadores dos gols a favor e contra. Nenhuma é
 * sempre melhor: ofensiva aumenta os dois lados (boa para o mais forte),
 * defensiva diminui os dois (boa para o mais fraco), posse depende do meio,
 * contra-ataque pune quem se expõe e sofre contra quem se fecha.
 */
export const PHILOSOPHY = {
  attacking: { for: 1.15, against: 1.15, defenseRelief: 0.004 },
  defensive: { for: 0.82, against: 0.8 },
  possession: { perMidPoint: 0.02, cap: 0.1, against: 0.92 },
  counter: { vsOpen: 1.12, vsClosed: 0.88, against: 0.92, perFastPlayer: 0.02, fastCap: 0.06 },
} as const;

/**
 * Previsibilidade (spec 9): repetir o esquema deixa os rivais mais
 * preparados. p vai de 0 a 1; o adversário ganha até 6% de gols e o time
 * perde até 3%. Mudar reduz p por sorteio: às vezes funciona, às vezes não.
 */
export const PREDICTABILITY = {
  perMatch: 0.04,
  opponentBoost: 0.06,
  ownPenalty: 0.03,
  /** Fração de p que passa de uma temporada para a outra. */
  carryOver: 0.5,
  /** Faixas sorteadas do que sobra de p ao mudar, conforme o que os rivais leem mais. */
  formationChange: { read: [0.3, 0.9], unread: [0.6, 0.95] },
  philosophyChange: { read: [0.05, 0.45], unread: [0.3, 0.8] },
  lineupChange: [0.6, 0.95],
  /** Titulares trocados para contar como mudança de jogadores. */
  lineupChangeMinimum: 4,
  /** A partir daqui o jogo dá a pista. */
  hint: 0.5,
} as const;

/** Treinar um setor (spec 6.3): ganhos decrescentes, com teto, só no próximo período. */
export const TRAINING = { steps: [0.04, 0.025, 0.015], cap: 0.08 } as const;

/** Rendimento escondido: limite do efeito somado de fase, satisfação e características. */
export const OUTPUT_LIMITS = { min: -4, max: 3, moodAndForm: -4 } as const;

/** Efeito da satisfação no rendimento (spec 8): 75 insatisfeito rende como 72. */
export const MOOD_OUTPUT = { unhappy: -3, neutral: 0, happy: 1 } as const;

/** Características (spec 7): efeitos pequenos e fáceis de explicar. */
export const TRAIT_EFFECTS = {
  /** Decisivo: + em mata-mata, finais e clássicos decisivos. */
  clutch: 2,
  /** Clássico: + em jogos contra o rival. */
  derby: 2,
  /** Muralha: + no setor defensivo quando zagueiro ou volante. */
  aerial: 1,
  /** Bola parada: gols a favor do time por titular com a característica. */
  setPiece: 0.02,
  setPieceCap: 0.04,
  /** Incansável: menos risco de lesão. */
  tireless: 0.75,
  /** Líder: satisfação do grupo cai menos com resultados ruins. */
  leader: 0.6,
  /** Mentor: jovens do elenco evoluem um pouco mais. */
  mentor: 0.15,
} as const;

/** Nota do jogador na partida (base 6). */
export const RATING = { base: 6.2, goal: 0.9, assist: 0.45, win: 0.35, loss: -0.35, cleanSheet: 0.4, noise: 0.55 } as const;

/** Fase pelas notas dos últimos jogos (spec 7): temporária, de −2 a +2. */
export const FORM = { window: 6, thresholds: [5.8, 6.25, 6.85, 7.25] as const, decayWithoutGames: 0.5 } as const;

// ------------------------------------------------------------------ lesões

/**
 * Lesões (spec 10): risco por minuto jogado. 1,1% a cada 90 minutos aos 26
 * anos; mais com a idade. Duração: 70% leves, 25% médias, 5% graves (que
 * podem atravessar etapas).
 */
export const INJURY = {
  per90: 0.011,
  agePerYear: 0.04,
  ageFrom: 28,
  severity: [
    { kind: "light", weight: 70, days: [4, 14] },
    { kind: "medium", weight: 25, days: [15, 45] },
    { kind: "serious", weight: 5, days: [60, 180] },
  ],
} as const;

/** Rotação automática: descanso em jogos de menor peso e após sequência longa. */
export const ROTATION = { strengthGap: 5, cupRotations: 2, consecutiveStarts: 6, restChance: 0.2 } as const;

// ------------------------------------------------------------- satisfação

/**
 * Satisfação 0–100 (spec 8), mostrada só como estado. O papel esperado vem do
 * posto na posição, definido na chegada e na virada da temporada.
 */
export const SATISFACTION = {
  initial: 62,
  happy: 66,
  unhappy: 40,
  /** Por jogo, conforme o papel e o que aconteceu. */
  perMatch: {
    star: { start: 0.5, bench: -1.6, out: -1.8 },
    starter: { start: 0.4, bench: -1.2, out: -1.4 },
    rotation: { start: 0.7, bench: -0.25, out: -0.45 },
    backup: { start: 0.8, bench: -0.05, out: -0.1 },
    prospect: { start: 1, bench: 0, out: -0.05 },
  },
  /** Quem aceita ser reserva não perde por ficar no banco até esta fatia de jogos. */
  acceptedBenchShare: 0.25,
  /** Resultados mexem no máximo isto por período. */
  resultsCap: 4,
  /** Reversão por período em direção ao alvo do papel. */
  reversion: 0.1,
  target: 60,
} as const;

/** Promessas (spec 13): consequências de cumprir e de quebrar. */
export const PROMISES = {
  startsShare: 0.6,
  minutesGames: 6,
  youthGames: 8,
  kept: { satisfaction: 12, squad: 2 },
  broken: { satisfaction: -22, squad: -4, board: -3 },
} as const;

// --------------------------------------------------------------- evolução

/**
 * Evolução do OVR por período (spec 7, 5): o ganho esperado por temporada
 * vezes a fração da temporada que passou. Duas metades somam uma temporada.
 */
export const EVOLUTION = {
  /** Ganho máximo esperado por temporada para um jovem com muita folga. */
  growthBase: 5,
  /** Idade de pico média por grupo de posição. */
  peakAge: { gk: 30, def: 28, mid: 27.5, att: 26.5 },
  noise: 0.6,
  performanceWeight: 0.15,
  /** Declínio por temporada: fração × (a·x + b·x²), x = idade − (início + longevidade). */
  declineStart: 31,
  declineLinear: 0.35,
  declineQuadratic: 0.08,
  longevitySpread: 1.5,
  /** Teto absoluto acima do potencial. */
  potentialTolerance: 1,
  /** Chance por período, com boa fase e estatística que combina, de ganhar uma característica. */
  traitChance: 0.06,
  maxTraits: 2,
} as const;

/** Desenvolver (spec 6.4): bônus aplicado inteiro na próxima atualização. */
export const DEVELOP = {
  maxPlayers: 3,
  gapShare: 0.25,
  minBonus: 0.8,
  maxBonus: 2.2,
  /** Fator por idade: até 21, até 25, até 29; depois só freia o declínio. */
  ageFactor: [
    [21, 1],
    [25, 0.8],
    [29, 0.5],
  ] as const,
  veteranDeclineCut: 0.5,
} as const;

/** Aposentadoria por idade, OVR e longevidade. */
export const RETIREMENT = { fromAge: 34, base: 0.15, perYear: 0.13, highOvr: 80, highOvrRelief: 0.5, maxAge: 41 } as const;

// ------------------------------------------------------------------- base

/**
 * Base (spec 6.5): cinco candidatos por etapa. A maioria é mediana; alguns
 * fracos; poucos bons; raros craques. A descrição acerta na maior parte das
 * vezes, mas não sempre.
 */
export const YOUTH = {
  candidates: 5,
  ageRange: [16, 19] as const,
  tiers: [
    { tier: "weak", weight: 25, ovr: [-22, -16], potential: [-12, -6] },
    { tier: "average", weight: 60, ovr: [-18, -12], potential: [-6, 1] },
    { tier: "good", weight: 12, ovr: [-14, -8], potential: [1, 6] },
    { tier: "star", weight: 3, ovr: [-10, -2], potential: [6, 14] },
  ],
  /** Chance de a descrição apontar a faixa vizinha. */
  descriptionNoise: 0.3,
  /** Custo de promover e salário, em fração do valor de um titular do clube. */
  signingShare: 0.02,
  wageShare: 0.25,
} as const;

/** Jovens que os clubes da IA sobem a cada temporada. */
export const AI_YOUTH = { perClub: [1, 3] as const, ovrBelowAnchor: 14, ovrSpread: 4, starChance: 0.03 } as const;

// --------------------------------------------------------------- finanças

/**
 * Finanças (spec 12): receita anual = 30% do valor do elenco inicial ×
 * fator da divisão; folha ideal até 55% da receita, teto de 70%.
 */
export const FINANCE = {
  revenueShare: 0.3,
  divisionFactor: { 1: 1, 2: 0.8 },
  wageTarget: 0.55,
  wageCap: 0.7,
  budgetShare: 0.15,
  /** Caixa inicial entre estes múltiplos da receita, fixo por clube. */
  cashRange: [-0.08, 0.3] as const,
  /** Dívida máxima aceita antes de bloquear operações. */
  debtLimit: 0.25,
  /** Parte de uma venda que volta para a verba de contratações. */
  saleToBudget: 0.6,
  /** Salário anual como fração do valor de base (idade 27) do jogador. */
  wageOfValue: 0.11,
  /** Premiação: título da liga, posição, acesso, rebaixamento (fração da receita). */
  prize: { leagueTitle: 0.12, cupTitle: 0.06, continentalTitle: 0.2, perPositionAbove: 0.006, promotion: 0.25, relegation: -0.2 },
  /** Ajuste da receita da temporada seguinte pela campanha. */
  nextRevenue: { promotion: 1.25, relegation: 0.8, titleBonus: 1.05, reversion: 0.2 },
} as const;

/** Vender (spec 6.1). */
export const SALE = {
  maxTargets: 3,
  offerChance: { low: 0.3, medium: 0.6, high: 0.85 },
  priceRange: [0.75, 1.25] as const,
  demandFactor: { low: 0.9, medium: 1, high: 1.08 },
} as const;

/** Contratar (spec 6.2). */
export const PURCHASE = {
  maxTargets: 3,
  /** Chance de o clube aceitar vender, pelo papel do jogador lá. */
  clubWilling: { star: 0.25, starter: 0.55, rotation: 0.8, backup: 0.92, prospect: 0.7 },
  /** Preço pedido sobre o valor, pelo papel. */
  askFactor: { star: [1.35, 1.6], starter: [1.15, 1.35], rotation: [1, 1.15], backup: [0.85, 1], prospect: [1.1, 1.4] },
  wageRaise: [1.05, 1.3] as const,
} as const;

/** Pedir verba (spec 6.7). */
export const FUNDS = { large: 0.35, small: 0.12, maxGrants: 2, repeatFactor: 0.6 } as const;

// ------------------------------------------------- avaliação e reputação

/**
 * Avaliação anual (spec 14): nota da temporada s, crédito acumulado C com
 * memória decrescente, confiança = 50 + 18s + 15C; abaixo de 35, dispensa.
 */
export const EVALUATION = {
  creditStart: 0.3,
  creditMemory: 0.6,
  creditRange: [-1.5, 1.5] as const,
  confidenceBase: 50,
  seasonWeight: 18,
  creditWeight: 15,
  dismissBelow: 35,
  financePenalty: -0.6,
  financeBonus: 0.2,
  promiseWeight: 0.2,
  promiseCap: 0.6,
  cupWeight: 0.4,
} as const;

export const REPUTATION = { start: 15, maxChange: 12, perScore: 3.2, title: 4, minorTitle: 2, promotion: 3, rescue: 2, revelation: 1 } as const;

/**
 * Propostas depois da primeira temporada (spec 14). A reputação aponta uma
 * faixa de clubes pelo percentil de força no mundo (0 = mais fraco, 1 = mais
 * forte): 15% com reputação zero, 95% com reputação 100.
 */
export const OFFERS = {
  kept: [1, 3] as const,
  dismissed: [2, 4] as const,
  percentileBase: 0.15,
  percentilePerReputation: 0.008,
  percentileSpread: 0.12,
  abroadFromReputation: 35,
  abroadChance: 0.35,
  abroadLowReputation: 0.1,
  dismissedDrop: 0.08,
  banSeasons: 3,
} as const;

// ------------------------------------------------------------ mercado IA

/** Mercado dos clubes da IA na virada (spec 15). */
export const AI_MARKET = {
  squadTarget: [24, 30] as const,
  buysPerClub: 2,
  upgradeMargin: 2,
  anchorDrift: { reversion: 0.3, noise: 0.6, title: 0.4, continental: 0.6, promotion: 0.5, relegation: -0.8, range: 10 },
} as const;
