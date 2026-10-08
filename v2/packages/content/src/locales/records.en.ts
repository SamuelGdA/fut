import type { RecordsMessages } from "./records.pt";

/** Real-world records (GDD 26), checked in September 2026. */
export const recordsEn: RecordsMessages = {
  checked: "Checked {month} {year}",
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  groups: {
    global: "World",
    continental: "Continental",
    league: "Leagues",
    streak: "Streaks",
  },
  status: {
    beaten: "Beaten",
    matched: "Matched",
    short: "Short",
  },
  records: {
    careerGoals: { name: "Career goals", holder: "Cristiano Ronaldo", detail: "Club and country, still playing" },
    ballonDor: { name: "Ballon d'Or wins", holder: "Lionel Messi", detail: "2009 to 2023" },
    worldCups: { name: "World Cups won", holder: "Pelé", detail: "1958, 1962 and 1970" },
    seasonGoals: { name: "Goals in a season", holder: "Lionel Messi", detail: "Barcelona, 2011-12, all competitions" },
    careerTitles: { name: "Career titles", holder: "Lionel Messi", detail: "Official club and international titles, still playing" },
    goldenShoes: { name: "Golden Shoes", holder: "Lionel Messi", detail: "Top scorer across Europe's leagues" },
    internationalGoals: { name: "International goals", holder: "Cristiano Ronaldo", detail: "Portugal, still playing" },
    caps: { name: "International caps", holder: "Cristiano Ronaldo", detail: "Portugal, still playing" },
    careerGames: { name: "Career appearances", holder: "Peter Shilton", detail: "1966 to 1997, all competitions" },
    championsLeague: { name: "Champions League titles", holder: "Gento, Modrić, Kroos, Carvajal and Nacho", detail: "Six each; only European titles count" },
    libertadores: { name: "Libertadores titles", holder: "Francisco Sá", detail: "Independiente and Boca Juniors, 1972 to 1978" },
    leagueEngland: { name: "English league titles", holder: "Ryan Giggs", detail: "Manchester United, 1993 to 2013" },
    leagueSpain: { name: "Spanish league titles", holder: "Francisco Gento", detail: "Real Madrid, 1954 to 1969" },
    leagueItaly: { name: "Italian league titles", holder: "Gianluigi Buffon", detail: "Juventus, official titles" },
    leagueGermany: { name: "German league titles", holder: "Thomas Müller", detail: "Bayern Munich, 2010 to 2025" },
    ballonStreak: { name: "Ballon d'Ors in a row", holder: "Lionel Messi", detail: "2009 to 2012" },
    leagueStreak: { name: "League titles in a row in Europe's big five", holder: "Thomas Müller and Manuel Neuer", detail: "Bayern Munich, 2013 to 2023" },
    primaryStreak: { name: "Continental titles in a row", holder: "Francisco Gento and Alfredo Di Stéfano", detail: "Real Madrid, European Cup 1956 to 1960" },
  },
};
