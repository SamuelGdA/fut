/**
 * Hand-authored identity for every club in the dataset.
 *
 * Each entry answers three questions about a club and nothing else:
 *
 *   colours  — what it actually wears, not what a stock palette says
 *   field    — the pattern that makes the shirt recognisable across a room
 *   device   — one thing the club is genuinely about: the animal it is named
 *              after, the industry that founded it, the mountain behind the
 *              ground, the saint on the old badge
 *
 * None of these reproduce a club's crest, wordmark or mascot. They are built
 * from the same public raw material those crests were drawn from — colours,
 * nicknames, cities, trades — which is exactly why they still read as the club.
 *
 * Two rules keep 399 badges apart:
 *   1. no two clubs share a device inside the same league
 *   2. clubs that genuinely look alike (four Argentine sides in sky-blue and
 *      white stripes) are separated by stripe count, rim colour and device
 *
 * Adding a club: append a line. Leaving it out is also fine — derive.ts gives
 * it a coherent badge automatically.
 */

import type { DeviceKey } from "./devices";
import type { FieldKind } from "./fields";
import type { CrestSpec } from "./render";

const c = (
  base: string,
  accent: string,
  field: FieldKind,
  device: DeviceKey,
  extra: Partial<CrestSpec> = {},
): CrestSpec => ({ base, accent, field, device, ...extra });

const W = "#ffffff";
const K = "#12161c";

export const CLUB_CRESTS: Record<string, CrestSpec> = {
  // The pairs the derivation put on the same badge, curated apart.
  //
  // Titanes and Atletico El Vigia both landed on halves + markX inside Liga
  // FUTVE 2. A titan gets the mountain, which is the name.
  titanes: c("#6A1B9A", W, "band", "mountain", { ink: W }),
  //
  // Union Magdalena and Boca Juniors de Cali came out byte for byte identical
  // in Torneo Dimayor, and the reason is worth writing down: they share a
  // primary colour and both landed on `bandV` with `crossHeraldic`. The hash
  // did give them different `n` and `flip` values, but a single centred
  // vertical band has no stripes to count and is symmetric, so both of the
  // remaining differentiators were inert. That weakness affects every field
  // that ignores those two, and fixing the derivation would re-roll badges
  // across the whole dataset, so the pair is curated instead and
  // `render.test.ts` now fails on any future clash.
  //
  // Boca Juniors de Cali takes the ball: it is the half of the pair whose name
  // has nothing local in it to draw.
  "boca-juniors-de-cali": c("#003DA5", "#F5C518", "diagonal", "ball", { ink: W }),
  // -------------------------------------------------------------------------
  // Premier League
  // -------------------------------------------------------------------------
  arsenal: c("#e31c24", W, "solid", "cannon", { ink: "#f4c860", rim: W }),
  chelsea: c("#0a4595", "#dba111", "solid", "lionRampant", { ink: "#dba111" }),
  liverpool: c("#c8102e", "#f6eb61", "solid", "flame", { ink: "#f6eb61" }),
  "manchester-city": c("#6cabdd", "#17255a", "solid", "ship", { ink: "#17255a" }),
  "manchester-united": c("#da020e", "#fbe122", "solid", "trident", { ink: "#fbe122", rim: K }),
  tottenham: c(W, "#131c4e", "solid", "rooster", { ink: "#131c4e" }),
  "aston-villa": c("#670e36", "#95bfe5", "halves", "lion", { ink: "#f5c63c" }),
  bournemouth: c("#da291c", K, "stripes", "cherries", { n: 9, ink: W }),
  brighton: c("#0057b8", W, "stripes", "gull", { n: 9, ink: W }),
  "crystal-palace": c("#1b458f", "#c4122e", "stripes", "eagle", { n: 7, ink: W }),
  everton: c("#003399", W, "solid", "tower", { ink: W }),
  newcastle: c(K, W, "stripes", "castle", { n: 9, ink: W, rim: K }),
  "nottingham-forest": c("#dd0000", W, "solid", "tree", { ink: W }),
  brentford: c("#e30613", W, "stripes", "bee", { n: 9, ink: "#ffd100" }),
  coventry: c("#6cace4", "#06215c", "solid", "elephant", { ink: "#06215c" }),
  fulham: c(W, K, "solid", "pavilion", { ink: K }),
  ipswich: c("#0044a9", W, "solid", "horse", { ink: W }),
  leeds: c(W, "#1d428a", "solid", "owl", { ink: "#1d428a", rim: "#ffcd00" }),
  sunderland: c("#eb172b", W, "stripes", "column", { n: 9, ink: K, rim: K }),
  "hull-city": c("#f5a12d", K, "stripes", "cat", { n: 7, ink: W, rim: K }),

  // -------------------------------------------------------------------------
  // Championship
  // -------------------------------------------------------------------------
  burnley: c("#6c1d45", "#99d6ea", "solid", "chimney", { ink: "#99d6ea" }),
  middlesbrough: c("#e01a2b", W, "band", "bridge", { ink: "#0b1b33" }),
  norwich: c("#fff200", "#00a650", "solid", "songbird", { ink: "#00a650" }),
  "sheffield-utd": c("#ee2737", W, "stripes", "swords", { n: 9, ink: K, rim: K }),
  southampton: c("#d71920", W, "stripes", "markRing", { n: 9, ink: "#ffd200" }),
  "west-ham": c("#7a263a", "#1bb1e7", "solid", "hammers", { ink: "#1bb1e7" }),
  wolves: c("#fdb913", K, "solid", "wolf", { ink: K }),
  birmingham: c("#1e3d8f", W, "solid", "globe", { ink: W }),
  millwall: c("#06214a", W, "solid", "lion", { ink: W }),
  "stoke-city": c("#d6172e", W, "stripes", "amphora", { n: 7, ink: W, rim: K }),
  swansea: c(W, K, "solid", "swan", { ink: K }),
  watford: c("#fbee23", "#ed2127", "band", "stag", { ink: K, rim: K }),
  wrexham: c("#e62e29", W, "solid", "dragon", { ink: W }),
  blackburn: c("#1e3d8f", W, "halves", "rose", { ink: "#d81e27" }),
  "bristol-city": c("#e21a23", W, "solid", "ship", { ink: W, rim: "#0b1b33" }),
  cardiff: c("#2b58ae", W, "solid", "birdFlight", { ink: W }),
  charlton: c("#e03a3e", W, "solid", "fish", { ink: W }),
  // Derby's ram has always been a white one on a dark shield, which also keeps
  // it off Swansea's white disc two rows up.
  derby: c(K, W, "solid", "ram", { ink: W }),
  portsmouth: c("#001489", W, "solid", "crescentStar", { ink: "#ffd100" }),
  preston: c(W, "#002156", "solid", "pennant", { ink: "#002156" }),
  qpr: c("#1d5ba4", W, "hoops", "crown", { n: 9, ink: "#ffd100" }),
  "west-brom": c("#091453", W, "stripes", "tree", { n: 9, ink: W }),
  bolton: c("#263c7e", W, "solid", "horseshoe", { ink: W }),
  lincoln: c("#e62831", W, "stripes", "dome", { n: 9, ink: W }),

  // -------------------------------------------------------------------------
  // LaLiga
  // -------------------------------------------------------------------------
  barcelona: c("#004d98", "#a50044", "stripes", "crossHeraldic", { n: 7, ink: "#ffed02", rim: "#a50044" }),
  "real-madrid": c(W, "#00529f", "solid", "crown", { ink: "#c8a44d", rim: "#c8a44d" }),
  "atletico-madrid": c("#cb3524", W, "stripes", "bear", { n: 7, ink: "#16276a", rim: "#16276a" }),
  "athletic-club": c("#ee2523", W, "stripes", "bridge", { n: 7, ink: K, rim: K }),
  "celta-vigo": c("#8ac3ee", W, "solid", "anchor", { ink: "#0b3d6b", rim: "#0b3d6b" }),
  espanyol: c("#0072ce", W, "stripes", "lionRampant", { n: 7, ink: W, rim: "#e4002b" }),
  "real-betis": c("#00954c", W, "stripes", "star", { n: 9, ink: "#ffd100" }),
  "real-sociedad": c("#143c8b", W, "stripes", "cannon", { n: 9, ink: W }),
  sevilla: c(W, "#d70f21", "solid", "swords", { ink: "#d70f21" }),
  valencia: c(W, "#f18e00", "solid", "bat", { ink: K }),
  villarreal: c("#ffe667", "#005187", "solid", "submarine", { ink: "#005187" }),
  alaves: c("#0232a0", W, "stripes", "castle", { n: 5, ink: W }),
  "deportivo-la-coruna": c("#0288d1", W, "stripes", "lighthouse", { n: 7, ink: W }),
  elche: c("#05642c", W, "stripes", "palm", { n: 7, ink: W }),
  getafe: c("#014f97", W, "solid", "plane", { ink: W }),
  levante: c("#005ca3", "#c8102e", "stripes", "sun", { n: 7, ink: "#ffd100" }),
  osasuna: c("#d70f27", "#0b2a5e", "solid", "bull", { ink: W }),
  "racing-santander": c("#2d9a29", W, "stripes", "wave", { n: 9, ink: W }),
  "rayo-vallecano": c(W, "#e3351c", "sash", "bolt", { flip: true, ink: "#e3351c" }),
  malaga: c("#7ec8f0", W, "stripes", "sailboat", { n: 5, ink: "#0c2340", rim: "#0c2340" }),

  // -------------------------------------------------------------------------
  // LaLiga 2
  // -------------------------------------------------------------------------
  girona: c("#cf0c29", W, "stripes", "dome", { n: 7, ink: W }),
  almeria: c("#e30511", W, "stripes", "sun", { n: 7, ink: "#ffd100" }),
  mallorca: c("#ed1b24", K, "stripes", "windmill", { n: 7, ink: "#ffd100", rim: K }),
  "las-palmas": c("#ffe400", "#005daa", "solid", "dog", { ink: "#005daa" }),
  oviedo: c("#094ca1", W, "solid", "crossHeraldic", { ink: W }),
  "sporting-gijon": c("#e2001a", W, "stripes", "anchor", { n: 9, ink: W, rim: "#0b2240" }),
  valladolid: c("#911c8f", W, "stripes", "wheat", { n: 9, ink: W }),
  "ad-ceuta-fc": c(W, K, "checks", "crescentStar", { n: 4, ink: "#c8102e", rim: K }),
  albacete: c(W, K, "solid", "swords", { ink: K }),
  burgos: c(W, K, "halves", "castle", { ink: K }),
  cadiz: c("#fde607", "#005aa7", "solid", "ship", { ink: "#005aa7" }),
  castellon: c(W, K, "solid", "tower", { ink: K, rim: "#c8102e" }),
  cordoba: c("#016139", W, "stripes", "arches", { n: 7, ink: W }),
  eibar: c("#02306b", "#c8102e", "stripes", "gear", { n: 7, ink: W, rim: "#c8102e" }),
  eldense: c("#043298", W, "stripes", "boot", { n: 7, ink: W }),
  "fc-andorra": c("#000d88", "#ffd100", "tricolor", "mountain", { third: "#d50032", ink: W, rim: W }),
  "granada-cf": c("#c31632", W, "hoops", "pomegranate", { n: 9, ink: W, rim: K }),
  leganes: c("#0b1f6f", W, "solid", "leaf", { ink: W }),
  sabadell: c("#3443a8", W, "stripes", "chimney", { n: 7, ink: W }),
  tenerife: c("#2d3997", W, "stripes", "volcano", { n: 7, ink: W }),

  // -------------------------------------------------------------------------
  // Serie A
  // -------------------------------------------------------------------------
  inter: c("#0a2896", K, "stripes", "snake", { n: 7, ink: W, rim: "#c9a227" }),
  juventus: c(K, W, "stripes", "zebra", { n: 7, ink: W }),
  "ac-milan": c("#e4002b", K, "stripes", "crossHeraldic", { n: 7, ink: W, rim: K }),
  "as-roma": c("#8e1f2f", "#f0b300", "solid", "wolf", { ink: "#f0b300" }),
  atalanta: c("#0067b2", K, "stripes", "mountain", { n: 7, ink: W, rim: W }),
  como: c(W, "#10416a", "solid", "sailboat", { ink: "#10416a" }),
  napoli: c("#01a7e1", W, "solid", "volcano", { ink: W }),
  bologna: c("#c8102e", "#1b2838", "stripes", "arches", { n: 7, ink: W, rim: W }),
  cagliari: c("#b01028", "#16276a", "halves", "moon", { ink: W }),
  fiorentina: c("#61358b", W, "solid", "fleur", { ink: W }),
  genoa: c("#ae1919", "#16276a", "halves", "lighthouse", { ink: W, rim: W }),
  lazio: c("#85d8f8", W, "solid", "eagleHead", { ink: W, rim: "#0b2a5e" }),
  parma: c("#ffd100", "#0b2a8c", "cross", "helmet", { ink: W }),
  sassuolo: c("#1ea451", K, "stripes", "amphora", { n: 7, ink: W, rim: K }),
  torino: c("#881f19", W, "solid", "bull", { ink: W }),
  udinese: c(K, W, "stripes", "eagle", { n: 9, ink: W, rim: W }),
  frosinone: c("#004393", "#ffdf1c", "stripes", "songbird", { n: 7, ink: "#ffdf1c" }),
  lecce: c("#ffdf1c", "#c8102e", "stripes", "tree", { n: 7, ink: K }),
  monza: c("#ed1639", W, "solid", "crown", { ink: "#ffd100" }),
  venezia: c(K, "#0e7c46", "tricolorH", "mask", { third: "#f07300", ink: W, rim: "#f07300" }),

  // -------------------------------------------------------------------------
  // Serie B
  // -------------------------------------------------------------------------
  cremonese: c("#c8102e", "#a9a9a9", "stripes", "violin", { n: 7, ink: W, rim: "#16276a" }),
  verona: c("#16276a", "#ffd100", "halves", "dog", { ink: W }),
  palermo: c("#f2b5c4", K, "solid", "eagle", { ink: K }),
  pisa: c("#16276a", K, "stripes", "tower", { n: 7, ink: W, rim: W }),
  catanzaro: c("#ffd100", "#c8102e", "halves", "birdFlight", { ink: W }),
  empoli: c("#1d4c90", W, "solid", "pine", { ink: W }),
  modena: c("#ffd100", "#16276a", "bandV", "songbird", { ink: "#16276a" }),
  avellino: c("#0b7a3b", W, "solid", "wolf", { ink: W }),
  bari: c(W, "#c8102e", "solid", "rooster", { ink: "#c8102e" }),
  carrarese: c("#1879bf", W, "solid", "column", { ink: W }),
  cesena: c(W, K, "hoops", "seahorse", { n: 7, ink: K }),
  "juve-stabia": c("#ffd100", "#16276a", "stripes", "bee", { n: 7, ink: K }),
  mantova: c("#c8102e", W, "solid", "laurel", { ink: W }),
  // Padua's arms are a red cross on white, which is also what pulls this one
  // clear of Bari's plain white disc.
  padova: c(W, "#c8102e", "cross", "dome", { ink: "#c8102e" }),
  pescara: c("#013765", W, "hoops", "dolphin", { n: 7, ink: W }),
  reggiana: c("#7a2b2b", W, "solid", "star", { ink: W }),
  sampdoria: c("#1b5aa8", W, "band", "anchor", { ink: K, rim: "#e32219" }),
  spezia: c(W, K, "solid", "wheelShip", { ink: K }),
  sudtirol: c("#c8102e", W, "halvesH", "stag", { ink: W }),
  "virtus-entella": c("#9bd3f3", "#16276a", "solid", "fish", { ink: "#16276a" }),

  // -------------------------------------------------------------------------
  // Bundesliga
  // -------------------------------------------------------------------------
  "bayern-munchen": c("#dc052d", W, "solid", "crown", { ink: "#f2c14e" }),
  "bayer-leverkusen": c("#e32219", K, "halves", "lion", { ink: W }),
  "borussia-dortmund": c("#fde100", K, "solid", "wall", { ink: K }),
  "rb-leipzig": c(W, "#dd0741", "solid", "bull", { ink: "#001f47" }),
  "vfb-stuttgart": c(W, "#d40723", "solid", "horse", { ink: K }),
  "1-fc-koln": c(W, "#e20613", "solid", "goat", { ink: "#e20613" }),
  "union-berlin": c("#eb1923", W, "solid", "hammers", { ink: W }),
  "1899-hoffenheim": c("#1961b5", W, "solid", "wheat", { ink: W }),
  "borussia-monchengladbach": c(W, K, "solid", "diamond", { ink: "#00a650", rim: "#00a650" }),
  "eintracht-frankfurt": c(K, "#e1020c", "solid", "eagle", { ink: W }),
  "fc-augsburg": c("#c8102e", "#0b7a3b", "halves", "pine", { ink: W }),
  "fsv-mainz-05": c("#c8102e", W, "solid", "gear", { ink: W }),
  "sc-freiburg": c("#c8102e", K, "solid", "tree", { ink: W }),
  "werder-bremen": c("#1d9053", W, "solid", "keys", { ink: W }),
  "fc-schalke-04": c("#004b9c", W, "solid", "picks", { ink: W }),
  "hamburger-sv": c(W, "#1e5cb3", "solid", "anchor", { ink: "#1e5cb3" }),
  "sc-paderborn-07": c("#005ca8", W, "solid", "wave", { ink: W }),
  "sv-elversberg": c(W, K, "solid", "chimney", { ink: K }),

  // -------------------------------------------------------------------------
  // 2. Bundesliga
  // -------------------------------------------------------------------------
  "vfl-wolfsburg": c("#65b32e", W, "solid", "wolf", { ink: W }),
  "fc-st-pauli": c("#614130", "#e30613", "solid", "lighthouse", { ink: W }),
  "1-fc-heidenheim": c("#003b79", "#c8102e", "solid", "castle", { ink: W }),
  "1-fc-kaiserslautern": c("#e30511", W, "solid", "trident", { ink: W }),
  "1-fc-nurnberg": c("#aa1124", K, "solid", "eagle", { ink: W }),
  "hannover-96": c("#e30613", "#0b7a3b", "solid", "horse", { ink: W }),
  "hertha-bsc": c("#0068b4", W, "solid", "bear", { ink: W }),
  "holstein-kiel": c("#00579c", W, "stripes", "sailboat", { n: 7, ink: W, rim: "#c8102e" }),
  // Karlsruhe fans out from the palace; the badge does the same.
  "karlsruher-sc": c("#004c94", W, "rays", "none", { n: 12, rim: W }),
  "1-fc-magdeburg": c("#0057b7", W, "solid", "dome", { ink: W }),
  "arminia-bielefeld": c("#005c9d", W, "solid", "helmet", { ink: W, rim: K }),
  "dynamo-dresden": c("#ffd100", K, "solid", "gate", { ink: K }),
  "eintracht-braunschweig": c("#fee71a", "#16276a", "solid", "lion", { ink: "#16276a" }),
  "energie-cottbus": c("#e61c02", W, "solid", "bolt", { ink: W }),
  "spvgg-greuther-furth": c("#2fa641", W, "solid", "trefoil", { ink: W }),
  "sv-darmstadt-98": c("#004f9f", W, "solid", "fleur", { ink: W }),
  "vfl-bochum": c("#005ba4", W, "solid", "picks", { ink: W }),
  "vfl-osnabruck": c("#572a86", W, "solid", "bell", { ink: W }),

  // -------------------------------------------------------------------------
  // Ligue 1
  // -------------------------------------------------------------------------
  "paris-saint-germain": c("#00184f", "#da020e", "bandV", "tower", { ink: W, rim: W }),
  monaco: c("#c8102e", W, "diagonal", "none", { rim: W }),
  "olympique-de-marseille": c(W, "#0097d7", "solid", "sailboat", { ink: "#0097d7" }),
  "olympique-lyonnais": c(W, "#0f23aa", "solid", "lion", { ink: "#0f23aa", rim: "#da020e" }),
  "rc-strasbourg": c("#009fe3", W, "solid", "swan", { ink: W }),
  lens: c("#ffd100", "#c8102e", "stripes", "picks", { n: 7, ink: K, rim: "#c8102e" }),
  lille: c("#c8102e", W, "solid", "fleur", { ink: W, rim: "#0b2a5e" }),
  nice: c("#c8102e", K, "halves", "eagle", { ink: W, rim: K }),
  "paris-fc": c("#0a0f2d", "#c8102e", "solid", "ship", { ink: W }),
  "stade-brestois": c("#c8102e", W, "solid", "anchor", { ink: W }),
  toulouse: c("#38284f", W, "solid", "crossHeraldic", { ink: W }),
  angers: c(K, W, "solid", "castle", { ink: W }),
  auxerre: c(W, "#004ea2", "solid", "grapes", { ink: "#004ea2" }),
  lorient: c("#f58113", K, "solid", "fish", { ink: K }),
  "stade-rennais": c("#c8102e", K, "stripes", "stag", { n: 7, ink: W, rim: K }),
  "estac-troyes": c("#006cb4", W, "solid", "helmet", { ink: W }),
  "le-havre": c("#16276a", "#7ab2e1", "stripes", "lighthouse", { n: 7, ink: W }),
  "le-mans": c("#16276a", "#ffd100", "solid", "gear", { ink: "#ffd100" }),

  // -------------------------------------------------------------------------
  // Ligue 2
  // -------------------------------------------------------------------------
  nantes: c("#ffdc00", "#0b7a3b", "solid", "songbird", { ink: "#0b7a3b" }),
  reims: c("#eb0000", W, "solid", "dome", { ink: W }),
  "saint-etienne": c("#0b7a3b", W, "solid", "cannon", { ink: W }),
  metz: c("#731013", W, "solid", "dragon", { ink: W }),
  annecy: c("#e30613", W, "solid", "mountain", { ink: W }),
  boulogne: c("#cd131d", K, "stripes", "fish", { n: 7, ink: W, rim: K }),
  "clermont-foot": c("#1f3561", "#c8102e", "halves", "volcano", { ink: W }),
  dijon: c("#d40028", W, "solid", "owl", { ink: W }),
  dunkerque: c("#1b2738", "#c8102e", "solid", "anchor", { ink: W }),
  grenoble: c("#005da3", W, "solid", "rose", { ink: W }),
  guingamp: c("#e30613", K, "stripes", "pennant", { n: 7, ink: W, rim: K }),
  laval: c("#eb680b", K, "solid", "castle", { ink: W }),
  montpellier: c("#003e7e", "#f58113", "halves", "sun", { ink: W }),
  nancy: c("#e93526", W, "solid", "crossLorraine", { ink: W }),
  pau: c("#1c1f42", "#c8102e", "solid", "crown", { ink: "#ffd100" }),
  "red-star-fc-93": c("#b21e28", W, "solid", "star", { ink: W }),
  rodez: c("#ac1028", W, "solid", "tower", { ink: W }),
  // The Peugeot lion, the town's other export.
  sochaux: c("#133578", "#ffd100", "stripes", "lion", { n: 7, ink: W }),

  // -------------------------------------------------------------------------
  // Brasileirão
  // -------------------------------------------------------------------------
  botafogo: c(K, W, "stripes", "star", { n: 9, ink: W }),
  corinthians: c(W, K, "solid", "anchor", { ink: K }),
  cruzeiro: c("#2f529e", W, "solid", "southernCross", { ink: W }),
  // Rubro-negro hoops need no help; anything in the middle just hides them.
  flamengo: c("#c52613", K, "hoops", "none", { n: 7, rim: K }),
  fluminense: c("#7a0c2e", "#0b7a3b", "stripes", "topHat", { n: 9, ink: W, rim: W }),
  gremio: c("#0d80bf", K, "stripes", "swords", { n: 9, ink: W, rim: W }),
  palmeiras: c("#006437", W, "solid", "palm", { ink: W }),
  // Alvinegro Praiano: the surf keeps the Peixe off Corinthians' plain white
  // disc without giving up the black and white either club actually wears.
  santos: c(W, K, "waves", "fish", { ink: K, rim: K }),
  "vasco-da-gama": c(K, W, "sash", "ship", { ink: W }),
  "atletico-paranaense": c("#cf181f", K, "stripes", "markSpiral", { n: 9, ink: W, rim: K }),
  // Broader stripes and a black ring keep the Galo apart from Botafogo, who
  // wear the same colours in the same league.
  "atletico-mg": c(K, W, "stripes", "rooster", { n: 7, ink: W, rim: K }),
  bahia: c(W, "#0057b8", "tricolorH", "lighthouse", { third: "#c8102e", ink: "#0b2240", rim: "#0057b8" }),
  internacional: c("#e5050f", W, "solid", "torch", { ink: W }),
  "rb-bragantino": c(W, "#c8102e", "solid", "bull", { ink: "#c8102e", rim: K }),
  "sao-paulo": c(W, "#c8102e", "bandDouble", "none", { third: K, rim: K }),
  coritiba: c("#005742", W, "stripes", "pine", { n: 9, ink: W }),
  mirassol: c("#0f7a3d", "#ffd400", "halves", "sun", { ink: W }),
  vitoria: c("#c8102e", K, "stripes", "lion", { n: 9, ink: W, rim: K }),
  chapecoense: c("#0b7a3b", W, "solid", "feather", { ink: W }),

  // -------------------------------------------------------------------------
  // Brasileirão Série B
  //
  // Each device is the thing the club is actually named for or known as —
  // Ponte Preta's black bridge, Ferroviária's railway, CRB's rowing oars,
  // Operário's hammers, Novo Horizonte's sunrise — so the badge reads as the
  // club without copying anybody's artwork. All twenty devices are distinct
  // inside the division, per the rule at the top of this file.
  // -------------------------------------------------------------------------
  "sport-recife": c("#c8102e", K, "stripes", "lionRampant", { n: 9, ink: "#f5c400", rim: K }),
  ceara: c(K, W, "stripes", "starTri", { n: 9, ink: W, rim: K }),
  goias: c("#0f7a3d", W, "solid", "diamond", { ink: W }),
  "america-mg": c("#1c7a3c", W, "solid", "laurel", { ink: W }),
  cuiaba: c("#0f7a3d", "#f5c400", "halves", "fish", { ink: W }),
  // Tigre: the yellow is the shirt, the black ring keeps it off Novorizontino.
  criciuma: c("#f5c400", K, "solid", "cat", { ink: K, rim: K }),
  avai: c("#0d80bf", W, "solid", "lion", { ink: W }),
  // Literal: Ponte Preta is "black bridge".
  "ponte-preta": c(K, W, "stripes", "bridge", { n: 9, ink: W, rim: K }),
  guarani: c("#0f7a3d", W, "solid", "feather", { ink: W }),
  nautico: c("#c8102e", W, "stripes", "sailboat", { n: 9, ink: W }),
  "vila-nova": c("#c8102e", W, "solid", "gate", { ink: W }),
  paysandu: c("#0b4ea2", W, "solid", "mask", { ink: W }),
  // O Fantasma, from Ponta Grossa — a workers' club, hence the hammers.
  "operario-pr": c(K, W, "solid", "hammers", { ink: W, rim: W }),
  // Novo Horizonte: a sunrise, and yellow-black to match the shirt.
  novorizontino: c("#f5c400", K, "halves", "sun", { ink: K }),
  // A Locomotiva de Araraquara.
  ferroviaria: c("#c8102e", W, "solid", "train", { ink: W, rim: K }),
  "botafogo-sp": c(K, W, "solid", "pennant", { ink: W, rim: W }),
  // Clube de Regatas Brasil: a rowing club before it was a football one.
  crb: c("#c8102e", W, "solid", "oars", { ink: W }),
  // The steel town: CSN's chimneys are the reason the club exists.
  "volta-redonda": c("#f5c400", K, "solid", "chimney", { ink: K }),
  amazonas: c("#0f8a4d", W, "solid", "leaf", { ink: W }),
  "athletic-mg": c(K, W, "sash", "markShield", { ink: W }),
  // Clube do *Remo* — an oar, which Flamengo just gave up.
  remo: c("#16276a", W, "hoops", "oars", { n: 9, ink: W }),

  // -------------------------------------------------------------------------
  // Liga Profesional (Argentina)
  // -------------------------------------------------------------------------
  "boca-juniors": c("#0a2e5c", "#ffd100", "band", "none"),
  "river-plate": c(W, "#ed192d", "sash", "none", { flip: true }),
  "estudiantes-de-rio-cuarto": c("#008bd0", W, "stripes", "owl", { n: 7, ink: W }),
  "racing-club": c("#7fbfe8", W, "stripes", "laurel", { n: 9, ink: "#16276a", rim: "#16276a" }),
  "rosario-central": c("#0a3d72", "#ffd100", "stripes", "wingedWheel", { n: 7, ink: W, rim: "#ffd100" }),
  "argentinos-jrs": c("#e32021", W, "stripes", "wheat", { n: 7, ink: W }),
  "atletico-tucuman": c("#6faedc", W, "stripes", "sun", { n: 5, ink: "#ffd100", rim: W }),
  belgrano: c("#00bbf1", W, "stripes", "swords", { n: 5, ink: "#16276a", rim: K }),
  "defensa-y-justicia": c("#00722d", "#ffd100", "halves", "eagleHead", { ink: W }),
  "gimnasia-m": c(K, W, "solid", "mountain", { ink: W }),
  huracan: c(W, "#e30613", "solid", "globe", { ink: "#e30613" }),
  independiente: c("#ed1c24", W, "solid", "crown", { ink: W }),
  "independiente-rivadavia": c("#13007c", W, "solid", "grapes", { ink: W }),
  lanus: c("#7c1f2c", W, "solid", "torch", { ink: W }),
  "newells-old-boys": c("#e30613", K, "halves", "feather", { ink: W, rim: W }),
  platense: c(W, "#6b4a2a", "stripes", "anchor", { n: 7, ink: "#6b4a2a" }),
  "san-lorenzo": c("#263a54", "#7c1f2c", "hoops", "crossHeraldic", { n: 7, ink: W, rim: "#7c1f2c" }),
  talleres: c("#040d2d", W, "stripes", "gear", { n: 9, ink: W }),
  tigre: c("#1e448d", "#c8102e", "stripes", "cat", { n: 7, ink: "#ffd100", rim: "#c8102e" }),
  union: c("#e30613", W, "stripes", "bridge", { n: 7, ink: W }),
  "velez-sarsfield": c(W, "#0a539c", "chevron", "none"),
  aldosivi: c("#f3db26", "#0b7a3b", "stripes", "shark", { n: 7, ink: K, rim: "#0b7a3b" }),
  banfield: c("#03953f", W, "stripes", "derrick", { n: 7, ink: W }),
  "barracas-central": c("#e30016", W, "stripes", "hat", { n: 7, ink: W }),
  "central-cordoba-de-santiago": c(K, W, "stripes", "train", { n: 9, ink: W }),
  "deportivo-riestra": c(K, W, "hoops", "boot", { n: 7, ink: W }),
  estudiantes: c("#e21919", W, "stripes", "book", { n: 9, ink: W }),
  "gimnasia-lp": c("#121a61", W, "stripes", "wolf", { n: 7, ink: W }),
  "instituto-cordoba": c("#d62027", W, "stripes", "star", { n: 5, ink: W }),
  "sarmiento-junin": c("#008349", W, "stripes", "tree", { n: 7, ink: W }),

  // -------------------------------------------------------------------------
  // Liga MX
  // -------------------------------------------------------------------------
  "guadalajara-chivas": c("#c8102e", W, "stripes", "goat", { n: 7, ink: "#16276a", rim: "#16276a" }),
  "club-america": c("#ffeb00", "#16276a", "solid", "eagle", { ink: "#16276a" }),
  "cruz-azul": c("#001f60", W, "solid", "crossHeraldic", { ink: W }),
  "tigres-uanl": c("#ffd100", "#16276a", "stripes", "volcano", { n: 7, ink: "#16276a" }),
  toluca: c("#d53741", W, "solid", "trident", { ink: W }),
  "cf-pachuca": c("#162577", W, "stripes", "picks", { n: 7, ink: W }),
  leon: c("#187b56", W, "solid", "lion", { ink: W }),
  "club-tijuana": c("#ed1b26", K, "solid", "dog", { ink: W }),
  monterrey: c("#0a2240", W, "stripes", "mountain", { n: 7, ink: W }),
  "unam-pumas": c("#132347", "#ffd100", "solid", "cat", { ink: "#ffd100" }),
  atlas: c("#ec1c24", K, "stripes", "fox", { n: 7, ink: W, rim: K }),
  "atletico-san-luis": c("#2a2f61", "#c8102e", "halves", "bell", { ink: W }),
  "fc-juarez": c("#21cb35", K, "solid", "horse", { ink: W }),
  necaxa: c("#e1001e", W, "solid", "bolt", { ink: W }),
  "santos-laguna": c("#008066", W, "solid", "helmet", { ink: W }),
  "atlante-fc": c("#111231", "#c8102e", "stripes", "hammers", { n: 7, ink: W }),
  "club-queretaro": c("#0056b3", K, "stripes", "rooster", { n: 7, ink: W, rim: W }),
  // La Franja is literally the club's nickname.
  puebla: c(W, "#16276a", "sash", "none"),

  // -------------------------------------------------------------------------
  // MLS
  // -------------------------------------------------------------------------
  "inter-miami": c("#f7b5cd", K, "solid", "palm", { ink: K }),
  "los-angeles-galaxy": c("#00245d", "#ffd100", "solid", "starTri", { ink: "#ffd100" }),
  "columbus-crew": c("#fedd00", K, "solid", "hammers", { ink: K }),
  "new-york-rb": c("#ed1e36", W, "solid", "bull", { ink: "#16276a" }),
  "fc-dallas": c("#bf0d3e", "#16276a", "hoops", "star", { n: 7, ink: W, rim: "#16276a" }),
  "sporting-kansas-city": c("#002f65", "#93b1d7", "checks", "none", { n: 4, rim: "#93b1d7" }),
  "dc-united": c(K, "#c8102e", "solid", "eagle", { ink: "#c8102e" }),
  "new-england-revolution": c("#0a2240", "#c8102e", "solid", "drum", { ink: W }),
  "chicago-fire-fc": c("#c8102e", "#16276a", "solid", "flame", { ink: W }),
  // Five stripes, because that is what Atlanta calls itself.
  "atlanta-united": c("#80000a", K, "stripes", "feather", { n: 5, ink: "#ffd100", rim: "#ffd100" }),
  "charlotte-fc": c("#0085ca", K, "solid", "crown", { ink: W }),
  "austin-fc": c("#00b140", K, "solid", "tree", { ink: K }),
  "fc-cincinnati": c("#fe5000", "#16276a", "solid", "bridge", { ink: W }),
  "colorado-rapids": c("#960a2c", "#7ccdef", "solid", "mountain", { ink: "#7ccdef" }),
  "houston-dynamo": c("#f4911e", "#16276a", "solid", "derrick", { ink: W }),
  "los-angeles-fc": c(K, "#c39e6d", "solid", "sun", { ink: "#c39e6d" }),
  "minnesota-united": c("#8cd2f4", K, "solid", "compass", { ink: K }),
  "cf-montreal": c("#003da5", K, "solid", "fleur", { ink: W, rim: W }),
  "nashville-sc": c("#ece83a", "#16276a", "solid", "guitar", { ink: "#16276a" }),
  "new-york-city-fc": c("#6cace4", "#16276a", "solid", "skyline", { ink: "#16276a", rim: "#f58113" }),
  "orlando-city": c("#633492", "#ffd100", "solid", "lion", { ink: "#ffd100" }),
  "philadelphia-union": c("#051c2c", "#b49759", "solid", "snake", { ink: "#b49759" }),
  "portland-timbers": c("#2c5234", "#d69a2d", "solid", "pine", { ink: "#d69a2d" }),
  "real-salt-lake": c("#b30838", "#16276a", "solid", "bee", { ink: "#ffd100" }),
  "san-diego-fc": c("#117db6", W, "solid", "sailboat", { ink: W, rim: "#0b2240" }),
  "san-jose-earthquakes": c("#0067b1", K, "solid", "markPulse", { ink: W }),
  "st-louis-city-sc": c("#e0004d", "#16276a", "solid", "arches", { ink: W }),
  "toronto-fc": c("#b81137", W, "solid", "leaf", { ink: W }),
  "vancouver-whitecaps": c("#00245e", W, "solid", "wave", { ink: W }),
  "seattle-sounders": c("#5d9741", "#16276a", "solid", "tower", { ink: W }),

  // -------------------------------------------------------------------------
  // Copa de Primera (Paraguay)
  // -------------------------------------------------------------------------
  "cerro-porteno": c("#081227", "#c8102e", "stripes", "markSpiral", { n: 7, ink: W }),
  "libertad-asuncion": c(K, W, "stripes", "torch", { n: 7, ink: W }),
  olimpia: c(W, K, "solid", "laurel", { ink: K }),
  "2-de-mayo": c("#203185", W, "stripes", "star", { n: 7, ink: W }),
  "club-guarani": c("#ffcc00", K, "stripes", "feather", { n: 7, ink: K }),
  "nacional-asuncion": c("#065697", W, "stripes", "sun", { n: 7, ink: W }),
  "deportivo-recoleta": c("#d4ab49", K, "solid", "crown", { ink: K }),
  "sportivo-trinidense": c("#251981", W, "stripes", "dome", { n: 7, ink: W }),

  // -------------------------------------------------------------------------
  // Liga Bolivia
  // -------------------------------------------------------------------------
  "always-ready": c("#e01913", K, "solid", "bolt", { ink: W }),
  blooming: c("#569bd0", W, "solid", "rose", { ink: W }),
  bolivar: c("#00a6dc", W, "solid", "swords", { ink: W }),
  guabira: c("#e70605", W, "solid", "wheat", { ink: W }),
  "independiente-petrolero": c("#e90914", W, "solid", "derrick", { ink: W }),
  "nacional-potosi": c("#f80907", W, "solid", "mountain", { ink: W }),
  "san-antonio-bulo-bulo": c("#01115b", W, "solid", "flame", { ink: W }),
  "the-strongest": c("#e2ab1c", K, "stripes", "cat", { n: 7, ink: K }),

  // -------------------------------------------------------------------------
  // Liga de Primera (Chile)
  // -------------------------------------------------------------------------
  cobresal: c("#db812e", K, "solid", "picks", { ink: W }),
  "colo-colo": c(W, K, "solid", "feather", { ink: K }),
  "coquimbo-unido": c(K, "#ffd100", "solid", "swords", { ink: "#ffd100" }),
  huachipato: c("#0084ca", K, "solid", "chimney", { ink: W }),
  ohiggins: c("#6fb7e8", W, "solid", "star", { ink: "#16276a", rim: "#16276a" }),
  // Green, white, red and black: the flag is the whole point of the club.
  palestino: c("#0b7a3b", W, "tricolorH", "none", { third: "#c8102e", rim: K }),
  "u-catolica": c(W, "#16276a", "solid", "crossHeraldic", { ink: "#16276a" }),
  "universidad-de-chile": c("#022f87", "#c8102e", "solid", "owl", { ink: W }),
  "a-italiano": c("#1f4794", W, "stripes", "wingedWheel", { n: 7, ink: W, rim: "#0b7a3b" }),

  // -------------------------------------------------------------------------
  // Liga Dimayor (Colombia)
  // -------------------------------------------------------------------------
  "atletico-nacional": c("#00953b", W, "stripes", "leaf", { n: 9, ink: W }),
  "america-de-cali": c("#c8102e", K, "solid", "trident", { ink: W }),
  bucaramanga: c("#f3e638", "#0b7a3b", "halves", "cat", { ink: K }),
  "deportes-tolima": c("#8d3031", "#ffd100", "stripes", "feather", { n: 7, ink: "#ffd100" }),
  "independiente-medellin": c("#252c5e", "#c8102e", "stripes", "crown", { n: 7, ink: W }),
  junior: c("#00309b", "#c8102e", "stripes", "shark", { n: 7, ink: W, rim: "#c8102e" }),
  "deportivo-cali": c("#0b7a3b", W, "halves", "wheat", { ink: W }),
  "once-caldas": c(W, "#16276a", "solid", "volcano", { ink: "#16276a" }),
  millonarios: c("#273479", W, "solid", "globe", { ink: W }),
  "santa-fe": c("#c32523", W, "solid", "train", { ink: W }),

  // -------------------------------------------------------------------------
  // Liga FUTVE (Venezuela)
  // -------------------------------------------------------------------------
  "carabobo-fc": c("#51100e", "#ffd100", "solid", "horse", { ink: "#ffd100" }),
  "caracas-fc": c("#ee3124", W, "stripes", "mountain", { n: 7, ink: W }),
  "deportivo-la-guaira": c("#1a0b3c", "#ffd100", "solid", "anchor", { ink: "#ffd100" }),
  "deportivo-tachira-fc": c("#fcc708", K, "solid", "condor", { ink: K }),
  "metropolitanos-fc": c("#342861", W, "solid", "skyline", { ink: W }),
  "monagas-sc": c("#15325a", W, "stripes", "derrick", { n: 7, ink: W }),
  "puerto-cabello": c("#272a83", W, "solid", "ship", { ink: W }),
  ucv: c("#ffc429", K, "solid", "book", { ink: K }),

  // -------------------------------------------------------------------------
  // Liga Uruguaya
  // -------------------------------------------------------------------------
  "club-nacional": c(W, "#16276a", "sash", "laurel", { third: "#c8102e", ink: "#16276a" }),
  penarol: c("#ffe600", K, "stripes", "wingedWheel", { n: 7, ink: K }),
  albion: c("#00306d", W, "stripes", "rose", { n: 7, ink: W }),
  "boston-river": c("#eb3236", W, "solid", "wave", { ink: W }),
  "defensor-sporting": c("#560090", W, "solid", "markShield", { ink: W }),
  juventud: c("#2e5099", W, "stripes", "wall", { n: 7, ink: W }),
  "liverpool-montevideo": c(K, "#16276a", "hoops", "anchor", { n: 7, ink: W, rim: W }),
  "atletico-torque": c("#6caddf", "#16276a", "solid", "gear", { ink: W }),
  "racing-montevideo": c("#27682e", W, "hoops", "horseshoe", { n: 7, ink: W }),

  // -------------------------------------------------------------------------
  // Liga1 (Peru)
  // -------------------------------------------------------------------------
  "alianza-lima": c("#16276a", W, "solid", "horseshoe", { ink: W }),
  "sporting-cristal": c("#56c7ed", W, "solid", "diamond", { ink: W, rim: "#16276a" }),
  universitario: c("#f0e3c0", "#7c1f2c", "solid", "book", { ink: "#7c1f2c" }),
  "alianza-atletico": c("#222677", W, "stripes", "sun", { n: 7, ink: "#ffd100", rim: W }),
  cienciano: c("#0a214e", "#c8102e", "stripes", "wall", { n: 7, ink: W }),
  cusco: c("#ca9a56", K, "solid", "condor", { ink: K }),
  "deportivo-garcilaso": c("#ed0103", W, "solid", "feather", { ink: W }),
  "fbc-melgar": c("#ec1c24", K, "stripes", "volcano", { n: 7, ink: W, rim: K }),

  // -------------------------------------------------------------------------
  // LigaPro Serie A (Ecuador)
  // -------------------------------------------------------------------------
  "barcelona-sc": c("#fff218", "#c8102e", "solid", "bull", { ink: "#c8102e" }),
  emelec: c("#054c94", W, "solid", "bolt", { ink: W }),
  "independiente-del-valle": c(K, "#16276a", "solid", "mountain", { ink: W }),
  "ldu-de-quito": c(W, "#c8102e", "solid", "torch", { ink: "#c8102e" }),
  "deportivo-cuenca": c("#09823a", W, "solid", "dome", { ink: W }),
  libertad: c("#dcb248", K, "solid", "star", { ink: K }),
  macara: c("#3397c4", W, "solid", "rose", { ink: W }),
  "orense-sc": c("#2a2086", "#ffd100", "solid", "leaf", { ink: "#ffd100" }),
  "universidad-catolica": c("#2fa6d9", W, "solid", "crossHeraldic", { ink: W, rim: "#16276a" }),

  // -------------------------------------------------------------------------
  // Primera Nacional (Argentina, second tier)
  // -------------------------------------------------------------------------
  acassuso: c("#33348e", W, "stripes", "star", { n: 7, ink: W }),
  agropecuario: c("#01994c", W, "solid", "wheat", { ink: W }),
  "all-boys": c(W, K, "solid", "ball", { ink: K }),
  almagro: c("#0241aa", K, "tricolorH", "bell", { third: W, ink: "#ffd100", rim: W }),
  "almirante-brown": c("#fde100", K, "solid", "anchor", { ink: K }),
  atlanta: c("#333399", "#ffd100", "stripes", "violin", { n: 7, ink: W }),
  "atletico-mitre": c("#ffcb00", K, "stripes", "train", { n: 7, ink: K }),
  "atletico-de-rafaela": c("#0084c9", W, "stripes", "gear", { n: 7, ink: W }),
  "central-norte": c(K, "#c8102e", "stripes", "magpie", { n: 9, ink: W, rim: K }),
  "chacarita-juniors": c("#c8102e", K, "sash", "crossHeraldic", { ink: W, rim: K }),
  "chaco-for-ever": c(K, W, "stripes", "tree", { n: 7, ink: W }),
  "ciudad-de-bolivar": c("#0f2ad6", W, "solid", "swords", { ink: W }),
  "club-atletico-guemes": c("#00438e", W, "stripes", "hat", { n: 7, ink: W }),
  colegiales: c("#213990", "#ffd100", "stripes", "book", { n: 7, ink: W }),
  "colon-santa-fe": c("#e30b12", K, "stripes", "ship", { n: 7, ink: W, rim: K }),
  "defensores-de-belgrano": c("#e92123", W, "solid", "markShield", { ink: W }),
  "deportivo-madryn": c("#fdca00", "#16276a", "stripes", "dolphin", { n: 7, ink: "#16276a" }),
  "deportivo-maipu": c("#e30613", W, "solid", "grapes", { ink: W }),
  "deportivo-moron": c("#c1102a", W, "solid", "rooster", { ink: W }),
  "ca-estudiantes": c(K, "#c8102e", "stripes", "owl", { n: 5, ink: W }),
  "ferro-carril-oeste": c("#156538", W, "solid", "wingedWheel", { ink: W }),
  "gimnasia-jujuy": c("#1aa3db", W, "stripes", "wolf", { n: 7, ink: W }),
  "gimnasia-y-tiro": c("#009fe3", W, "stripes", "markArrow", { n: 5, ink: W, rim: K }),
  "godoy-cruz": c("#0081c3", W, "stripes", "amphora", { n: 9, ink: W }),
  "los-andes": c("#e81419", W, "solid", "mountain", { ink: W }),
  midland: c("#010157", W, "stripes", "bridge", { n: 7, ink: W }),
  "nueva-chicago": c("#00a650", K, "solid", "bull", { ink: W }),
  patronato: c("#d40002", K, "stripes", "crown", { n: 7, ink: W, rim: K }),
  quilmes: c("#000755", W, "stripes", "wave", { n: 7, ink: W }),
  "racing-cordoba": c("#00a1df", W, "stripes", "laurel", { n: 9, ink: W }),
  "san-martin-sj": c("#40ab35", W, "stripes", "horse", { n: 7, ink: W }),
  "san-martin-tucuman": c("#ac0f17", W, "solid", "sun", { ink: "#ffd100" }),
  "san-miguel": c("#03933f", W, "stripes", "bolt", { n: 7, ink: W }),
  "san-telmo": c("#104185", W, "stripes", "drum", { n: 7, ink: W }),
  temperley: c("#00bcea", W, "solid", "flame", { ink: W }),
  "tristan-suarez": c("#1e1f41", "#ffd100", "stripes", "plane", { n: 7, ink: W }),
};

export type ClubCrestId = keyof typeof CLUB_CRESTS;

/** Every field/device combination in use, for the gallery page and QA. */
export function crestFieldOf(id: string): FieldKind | null {
  return CLUB_CRESTS[id]?.field ?? null;
}

export function crestDeviceOf(id: string): DeviceKey | null {
  return CLUB_CRESTS[id]?.device ?? null;
}
