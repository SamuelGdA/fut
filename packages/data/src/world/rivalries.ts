/**
 * Real, well-known derbies and classic rivalries between clubs in the
 * dataset — used only to decide the "Traidor" marker on the summary timeline
 * when a player signs directly for a rival. Deliberately conservative: a pair
 * not listed here is simply treated as not-rivals, since a wrong "no" is a
 * missed flourish but a wrong "yes" (like flagging two clubs with nothing
 * between them) reads as a bug. Every pair here is a genuine, recognisable
 * rivalry, not just "same league/country".
 */
export const CLUB_RIVALRIES: readonly (readonly [string, string])[] = [
  // Brazil — Rio "big four", state classics
  ["flamengo", "fluminense"],
  ["flamengo", "vasco-da-gama"],
  ["flamengo", "botafogo"],
  ["fluminense", "vasco-da-gama"],
  ["fluminense", "botafogo"],
  ["vasco-da-gama", "botafogo"],
  ["corinthians", "palmeiras"],
  ["corinthians", "sao-paulo"],
  ["corinthians", "santos"],
  ["palmeiras", "sao-paulo"],
  ["santos", "sao-paulo"],
  ["gremio", "internacional"],
  ["atletico-mg", "cruzeiro"],
  ["bahia", "vitoria"],
  ["atletico-paranaense", "coritiba"],

  // Argentina
  ["boca-juniors", "river-plate"],
  ["racing-club", "independiente"],
  ["san-lorenzo", "huracan"],
  ["estudiantes", "gimnasia-lp"],
  ["newells-old-boys", "rosario-central"],

  // England — the derbies, plus the three rivalries that are not local at all
  // (United/Liverpool, United/Leeds, Liverpool/Chelsea are all real and all
  // between clubs the game actually models).
  ["manchester-united", "manchester-city"],
  ["manchester-united", "liverpool"],
  ["manchester-united", "leeds"],
  ["liverpool", "everton"],
  ["liverpool", "chelsea"],
  ["arsenal", "tottenham"],
  ["chelsea", "tottenham"],
  ["arsenal", "chelsea"],
  ["newcastle", "sunderland"],
  ["aston-villa", "birmingham"],
  ["aston-villa", "west-brom"],
  ["west-ham", "millwall"],
  ["west-ham", "tottenham"],
  ["nottingham-forest", "derby"],
  ["crystal-palace", "brighton"],
  ["portsmouth", "southampton"],
  ["norwich", "ipswich"],
  ["bristol-city", "cardiff"],
  ["swansea", "cardiff"],
  ["stoke-city", "west-brom"],
  ["blackburn", "burnley"],
  ["sheffield-utd", "leeds"],
  ["middlesbrough", "sunderland"],
  ["middlesbrough", "newcastle"],
  ["wolves", "west-brom"],
  ["preston", "blackburn"],
  ["bolton", "burnley"],
  ["hull-city", "leeds"],
  ["qpr", "chelsea"],
  ["fulham", "chelsea"],
  ["brentford", "qpr"],
  ["charlton", "millwall"],

  // Spain
  ["real-madrid", "barcelona"],
  ["real-madrid", "atletico-madrid"],
  ["barcelona", "espanyol"],
  ["sevilla", "real-betis"],
  ["athletic-club", "real-sociedad"],
  ["deportivo-la-coruna", "celta-vigo"],

  // Italy
  ["inter", "ac-milan"],
  ["as-roma", "lazio"],
  ["juventus", "torino"],

  // Germany
  ["borussia-dortmund", "fc-schalke-04"],
  ["bayern-munchen", "borussia-dortmund"],
  ["borussia-monchengladbach", "1-fc-koln"],
  ["hamburger-sv", "werder-bremen"],

  // France
  ["paris-saint-germain", "olympique-de-marseille"],
  ["lens", "lille"],

  // Mexico
  ["club-america", "guadalajara-chivas"],
  ["club-america", "cruz-azul"],
  ["unam-pumas", "club-america"],
  ["atlas", "guadalajara-chivas"],

  // Colombia
  ["millonarios", "santa-fe"],
  ["atletico-nacional", "independiente-medellin"],
  ["america-de-cali", "deportivo-cali"],

  // Chile
  ["colo-colo", "universidad-de-chile"],
  ["u-catolica", "universidad-de-chile"],

  // Uruguay
  ["club-nacional", "penarol"],

  // Peru
  ["alianza-lima", "universitario"],

  // Ecuador
  ["barcelona-sc", "emelec"],

  // Paraguay
  ["cerro-porteno", "olimpia"],

  // Bolivia
  ["bolivar", "the-strongest"],

  // Venezuela
  ["caracas-fc", "deportivo-tachira-fc"],

  // USA
  ["los-angeles-galaxy", "los-angeles-fc"],
  ["seattle-sounders", "portland-timbers"],
  ["new-york-rb", "new-york-city-fc"],
];

const RIVAL_SET = new Set(CLUB_RIVALRIES.map(([a, b]) => `${a}:${b}`));

/** Whether two club ids are known real-world rivals — order doesn't matter. */
export function areRivals(teamIdA: string, teamIdB: string): boolean {
  if (teamIdA === teamIdB) return false;
  return RIVAL_SET.has(`${teamIdA}:${teamIdB}`) || RIVAL_SET.has(`${teamIdB}:${teamIdA}`);
}
