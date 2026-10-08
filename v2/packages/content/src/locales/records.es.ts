import type { RecordsMessages } from "./records.pt";

/** Los récords reales (GDD 26), verificados en septiembre de 2026. */
export const recordsEs: RecordsMessages = {
  checked: "Verificado en {month} de {year}",
  months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  groups: {
    global: "Del mundo",
    continental: "Del continente",
    league: "De las ligas",
    streak: "Rachas",
  },
  status: {
    beaten: "Superado",
    matched: "Igualado",
    short: "Lejos",
  },
  records: {
    careerGoals: { name: "Goles en la carrera", holder: "Cristiano Ronaldo", detail: "Clubes y selección, todavía en activo" },
    ballonDor: { name: "Balones de Oro", holder: "Lionel Messi", detail: "De 2009 a 2023" },
    worldCups: { name: "Mundiales ganados", holder: "Pelé", detail: "1958, 1962 y 1970" },
    seasonGoals: { name: "Goles en una temporada", holder: "Lionel Messi", detail: "Barcelona, 2011-12, todas las competiciones" },
    careerTitles: { name: "Títulos en la carrera", holder: "Lionel Messi", detail: "Títulos oficiales con clubes y selección, todavía en activo" },
    goldenShoes: { name: "Botas de Oro", holder: "Lionel Messi", detail: "El máximo goleador de las ligas de Europa" },
    internationalGoals: { name: "Goles con la selección", holder: "Cristiano Ronaldo", detail: "Portugal, todavía en activo" },
    caps: { name: "Partidos con la selección", holder: "Cristiano Ronaldo", detail: "Portugal, todavía en activo" },
    careerGames: { name: "Partidos en la carrera", holder: "Peter Shilton", detail: "De 1966 a 1997, todas las competiciones" },
    championsLeague: { name: "Títulos de Champions League", holder: "Gento, Modrić, Kroos, Carvajal y Nacho", detail: "Seis cada uno; solo cuentan los títulos europeos" },
    libertadores: { name: "Títulos de Libertadores", holder: "Francisco Sá", detail: "Independiente y Boca Juniors, de 1972 a 1978" },
    leagueEngland: { name: "Títulos de la liga inglesa", holder: "Ryan Giggs", detail: "Manchester United, de 1993 a 2013" },
    leagueSpain: { name: "Títulos de la liga española", holder: "Francisco Gento", detail: "Real Madrid, de 1954 a 1969" },
    leagueItaly: { name: "Títulos de la liga italiana", holder: "Gianluigi Buffon", detail: "Juventus, títulos oficiales" },
    leagueGermany: { name: "Títulos de la liga alemana", holder: "Thomas Müller", detail: "Bayern de Múnich, de 2010 a 2025" },
    ballonStreak: { name: "Balones de Oro seguidos", holder: "Lionel Messi", detail: "De 2009 a 2012" },
    leagueStreak: { name: "Ligas seguidas en las cinco grandes de Europa", holder: "Thomas Müller y Manuel Neuer", detail: "Bayern de Múnich, de 2013 a 2023" },
    primaryStreak: { name: "Títulos continentales seguidos", holder: "Francisco Gento y Alfredo Di Stéfano", detail: "Real Madrid, Copa de Campeones de 1956 a 1960" },
  },
};
