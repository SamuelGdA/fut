import type { Widen } from "../i18n";

/**
 * Os recordes reais (GDD 26): nome da marca, detentor e detalhe. Os números
 * ficam em `records.ts`; aqui só o texto. Conferido em setembro de 2026.
 */
export const recordsPt = {
  checked: "Conferido em {month} de {year}",
  months: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
  groups: {
    global: "Do mundo",
    continental: "Do continente",
    league: "Das ligas",
    streak: "Sequências",
  },
  status: {
    beaten: "Superado",
    matched: "Igualado",
    short: "Longe",
  },
  records: {
    careerGoals: { name: "Gols na carreira", holder: "Cristiano Ronaldo", detail: "Clubes e seleção, ainda em atividade" },
    ballonDor: { name: "Bolas de Ouro", holder: "Lionel Messi", detail: "De 2009 a 2023" },
    worldCups: { name: "Copas do Mundo ganhas", holder: "Pelé", detail: "1958, 1962 e 1970" },
    seasonGoals: { name: "Gols numa temporada", holder: "Lionel Messi", detail: "Barcelona, 2011-12, todas as competições" },
    careerTitles: { name: "Títulos na carreira", holder: "Lionel Messi", detail: "Títulos oficiais por clubes e seleção, ainda em atividade" },
    goldenShoes: { name: "Chuteiras de Ouro", holder: "Lionel Messi", detail: "A artilharia das ligas da Europa" },
    internationalGoals: { name: "Gols por seleção", holder: "Cristiano Ronaldo", detail: "Portugal, ainda em atividade" },
    caps: { name: "Jogos por seleção", holder: "Cristiano Ronaldo", detail: "Portugal, ainda em atividade" },
    careerGames: { name: "Jogos na carreira", holder: "Peter Shilton", detail: "De 1966 a 1997, todas as competições" },
    championsLeague: { name: "Títulos da Champions League", holder: "Gento, Modrić, Kroos, Carvajal e Nacho", detail: "Seis cada um; só contam os títulos europeus" },
    libertadores: { name: "Títulos da Libertadores", holder: "Francisco Sá", detail: "Independiente e Boca Juniors, de 1972 a 1978" },
    leagueEngland: { name: "Títulos da liga inglesa", holder: "Ryan Giggs", detail: "Manchester United, de 1993 a 2013" },
    leagueSpain: { name: "Títulos da liga espanhola", holder: "Francisco Gento", detail: "Real Madrid, de 1954 a 1969" },
    leagueItaly: { name: "Títulos da liga italiana", holder: "Gianluigi Buffon", detail: "Juventus, títulos oficiais" },
    leagueGermany: { name: "Títulos da liga alemã", holder: "Thomas Müller", detail: "Bayern de Munique, de 2010 a 2025" },
    ballonStreak: { name: "Bolas de Ouro seguidas", holder: "Lionel Messi", detail: "De 2009 a 2012" },
    leagueStreak: { name: "Ligas seguidas nas cinco grandes da Europa", holder: "Thomas Müller e Manuel Neuer", detail: "Bayern de Munique, de 2013 a 2023" },
    primaryStreak: { name: "Títulos continentais seguidos", holder: "Francisco Gento e Alfredo Di Stéfano", detail: "Real Madrid, Copa dos Campeões de 1956 a 1960" },
  },
} as const;

export type RecordsMessages = Widen<typeof recordsPt>;
