import type { Widen } from "../i18n";

/**
 * O Desafio do dia (GDD 27): eixos, missões e éditos. Os alvos e limites
 * vêm do motor; aqui só o texto. `{n}` é o alvo da missão; `{limit}`, `{age}`
 * e `{strength}` vêm das constantes do édito.
 */
export const challengePt = {
  axes: {
    goals: "Gols",
    titles: "Troféus",
    loyalty: "Lealdade",
    road: "Estrada",
    evolution: "Evolução",
    underdog: "Azarão",
    national: "Seleção",
    longevity: "Longevidade",
    awards: "Prêmios",
  },
  missions: {
    careerGoals: { name: "Artilheiro", goal: { one: "{n} gol na carreira, por clube e seleção", other: "{n} gols na carreira, por clube e seleção" } },
    seasonGoals: { name: "Temporada de artilheiro", goal: { one: "{n} gol por clube numa só temporada", other: "{n} gols por clube numa só temporada" } },
    contributions: { name: "Participação em gol", goal: { one: "{n} gol ou assistência na carreira", other: "{n} gols e assistências somados na carreira" } },
    cleanSheets: { name: "Muralha", goal: { one: "{n} jogo sem sofrer gol", other: "{n} jogos sem sofrer gol" } },
    totalTitles: { name: "Colecionador", goal: { one: "{n} título na carreira", other: "{n} títulos na carreira" } },
    leagueTitles: { name: "Campeão da liga", goal: { one: "{n} título de liga", other: "{n} títulos de liga" } },
    continentalTitles: { name: "Rei do continente", goal: { one: "{n} título do principal torneio continental", other: "{n} títulos do principal torneio continental" } },
    cupTitles: { name: "Copeiro", goal: { one: "{n} título de copa nacional", other: "{n} títulos de copa nacional" } },
    longestStay: { name: "Raiz", goal: { one: "{n} temporada num mesmo clube", other: "{n} temporadas num mesmo clube" } },
    firstClubGames: { name: "Cria da casa", goal: { one: "{n} jogo pelo clube onde começou", other: "{n} jogos pelo clube onde começou" } },
    idolSeasons: {
      name: "Ídolo",
      goal: { one: "{n} temporada como ídolo ou lenda", other: "{n} temporadas como ídolo ou lenda" },
      hint: "Ídolo e lenda são os dois degraus mais altos do legado num clube.",
    },
    peakFans: {
      name: "Xodó da torcida",
      goal: { one: "Apoio da torcida em {n} num clube", other: "Apoio da torcida em {n} num clube" },
      hint: "O apoio vai de 0 a 100 e sobe com temporadas boas no mesmo clube.",
    },
    clubs: { name: "Andarilho", goal: { one: "{n} clube na carreira", other: "{n} clubes na carreira" } },
    countries: { name: "Cidadão do mundo", goal: { one: "Clubes em {n} país", other: "Clubes em {n} países" } },
    seasonsAbroad: { name: "Expatriado", goal: { one: "{n} temporada fora do seu país", other: "{n} temporadas fora do seu país" } },
    titleCountries: { name: "Campeão em toda parte", goal: { one: "Liga ganha em {n} país", other: "Liga ganha em {n} países" } },
    peakOvr: { name: "Auge", goal: { one: "Chegar a {n} de OVR", other: "Chegar a {n} de OVR" } },
    bestJump: { name: "Salto", goal: { one: "Subir {n} de OVR numa temporada", other: "Subir {n} de OVR numa temporada" } },
    ovrAt21: { name: "Precoce", goal: { one: "{n} de OVR até os 21 anos", other: "{n} de OVR até os 21 anos" } },
    eliteSeasons: { name: "Elite", goal: { one: "{n} temporada com OVR 85 ou mais", other: "{n} temporadas com OVR 85 ou mais" } },
    underdogTitles: {
      name: "Azarão campeão",
      goal: { one: "{n} título por clube modesto", other: "{n} títulos por clubes modestos" },
      hint: "Clube modesto: força até {strength} no começo da temporada.",
    },
    promotions: { name: "Elevador", goal: { one: "{n} acesso de divisão", other: "{n} acessos de divisão" } },
    underdogStar: {
      name: "Estrela do pequeno",
      goal: { one: "{n} temporada como estrela de clube modesto", other: "{n} temporadas como estrela de clube modesto" },
      hint: "Clube modesto: força até {strength} no começo da temporada.",
    },
    underdogPodiums: {
      name: "Intruso no pódio",
      goal: { one: "{n} pódio na primeira divisão com clube modesto", other: "{n} pódios na primeira divisão com clube modesto" },
      hint: "Clube modesto: força até {strength} no começo da temporada.",
    },
    caps: { name: "Convocado", goal: { one: "{n} jogo pela seleção", other: "{n} jogos pela seleção" } },
    nationalGoals: { name: "Artilheiro da seleção", goal: { one: "{n} gol pela seleção", other: "{n} gols pela seleção" } },
    tournaments: { name: "Torneios", goal: { one: "{n} torneio de seleção disputado", other: "{n} torneios de seleção disputados" } },
    worldCupRun: { name: "Campanha de Copa", goal: { one: "{stage}", other: "{stage}" } },
    seasons: { name: "Carreira longa", goal: { one: "{n} temporada jogada", other: "{n} temporadas jogadas" } },
    totalGames: { name: "Incansável", goal: { one: "{n} jogo na carreira, por clube e seleção", other: "{n} jogos na carreira, por clube e seleção" } },
    lateGames: { name: "Veterano", goal: { one: "{n} jogo por clube a partir dos 33", other: "{n} jogos por clube a partir dos 33" } },
    lastAge: { name: "Até quando der", goal: { one: "Jogar até os {n} anos", other: "Jogar até os {n} anos" } },
    ballonPodiums: { name: "Pódio da Bola de Ouro", goal: { one: "{n} vez entre os três da Bola de Ouro", other: "{n} vezes entre os três da Bola de Ouro" } },
    awardsTotal: { name: "Galeria", goal: { one: "{n} prêmio individual", other: "{n} prêmios individuais" } },
    scoringAwards: {
      name: "Faro de gol",
      goal: { one: "{n} prêmio de artilharia", other: "{n} prêmios de artilharia" },
      hint: "Vale a Chuteira de Ouro e a artilharia de qualquer competição.",
    },
    goldenGloves: { name: "Paredão", goal: { one: "{n} Luva de Ouro", other: "{n} Luvas de Ouro" } },
  },
  /** A meta da Campanha de Copa, pela fase: o primeiro é a fase 1, o último a 8. */
  worldCupGoals: [
    "Entrar em campo numa Copa do Mundo",
    "Jogar a fase de grupos de uma Copa do Mundo",
    "Passar da fase de grupos numa Copa do Mundo",
    "Chegar às oitavas de uma Copa do Mundo",
    "Chegar às quartas de uma Copa do Mundo",
    "Chegar à semifinal de uma Copa do Mundo",
    "Chegar à final de uma Copa do Mundo",
    "Ganhar uma Copa do Mundo",
  ],
  /** A melhor fase até agora, curta, para o progresso (0 a 8). */
  worldCupStages: ["Nenhuma", "Em campo", "Grupos", "Fase de 32", "Oitavas", "Quartas", "Semifinal", "Final", "Campeão"],
  edicts: {
    fourClubs: { name: "Quatro camisas", rule: "No máximo {limit} clubes na carreira." },
    noLoans: { name: "Sem empréstimo", rule: "Nunca jogar emprestado." },
    noBigFive: { name: "Longe das cinco grandes", rule: "Nunca jogar na Inglaterra, na Espanha, na Itália, na Alemanha ou na França." },
    noRelegation: { name: "Nunca cair", rule: "Nenhum rebaixamento com o seu clube." },
    noBench: {
      name: "Titular sempre",
      rule: { one: "A partir dos {age} anos, no máximo {limit} temporada terminada no banco.", other: "A partir dos {age} anos, no máximo {limit} temporadas terminadas no banco." },
    },
    noSecondDivision: { name: "Primeira classe", rule: "A partir dos {age} anos, nunca na segunda divisão." },
    stayThree: { name: "Raízes", rule: "Nunca sair de um clube antes de três temporadas. Empréstimo não conta." },
    homeContinent: { name: "Casa no continente", rule: "Nunca jogar fora do seu continente." },
    noGiants: { name: "Sem gigantes", rule: "Nunca jogar num clube gigante, de força {strength} ou mais." },
    minGames: { name: "Operário", rule: "Pelo menos {limit} jogos por clube na carreira." },
  },
  edictStates: {
    intact: "Intacto",
    broken: "Quebrado",
    pending: "Pendente",
    met: "Cumprido",
  },
} as const;

export type ChallengeMessages = Widen<typeof challengePt>;
