import { getTeam } from "../lookups";
import type { Country } from "../types";

/**
 * Home-kit look for the in-game card portrait. Researched by hand for the
 * clubs a player is actually likely to represent (major leagues across the
 * dataset); everything else falls back to a solid shirt derived from the
 * club's `primary_color`, which is close enough for lesser-known sides.
 */
export type KitPattern = "solid" | "vertical_stripes" | "horizontal_stripes" | "diagonal_sash" | "checkerboard";

export interface KitDef {
  base: string;
  accent: string;
  pattern: KitPattern;
}

export const NEUTRAL_KIT: KitDef = { base: "#4b5563", accent: "#4b5563", pattern: "solid" };

const solid = (base: string, accent = "#f5f5f5"): KitDef => ({ base, accent, pattern: "solid" });
const vStripes = (base: string, accent: string): KitDef => ({ base, accent, pattern: "vertical_stripes" });
const hStripes = (base: string, accent: string): KitDef => ({ base, accent, pattern: "horizontal_stripes" });
const sash = (base: string, accent: string): KitDef => ({ base, accent, pattern: "diagonal_sash" });

/** Keyed by team id from lib/data/leagues.json. */
export const KIT_DATABASE: Record<string, KitDef> = {
  // Brasileirão
  botafogo: vStripes("#0a0a0a", "#ffffff"),
  corinthians: solid("#ffffff", "#0a0a0a"),
  cruzeiro: solid("#2F529E", "#ffffff"),
  flamengo: hStripes("#C52613", "#0a0a0a"),
  fluminense: hStripes("#92062A", "#006437"),
  gremio: vStripes("#0D80BF", "#0a0a0a"),
  palmeiras: solid("#006437", "#ffffff"),
  santos: solid("#ffffff", "#0a0a0a"),
  "vasco-da-gama": sash("#0a0a0a", "#ffffff"),
  "atletico-paranaense": solid("#CF181F", "#0a0a0a"),
  "atletico-mg": hStripes("#ffffff", "#0a0a0a"),
  bahia: vStripes("#0057B8", "#C8102E"),
  internacional: solid("#E5050F", "#ffffff"),
  "rb-bragantino": solid("#ffffff", "#C8102E"),
  "sao-paulo": solid("#ffffff", "#C8102E"),
  coritiba: vStripes("#006437", "#ffffff"),
  mirassol: solid("#166F3D", "#FFD400"),
  vitoria: vStripes("#C8102E", "#0a0a0a"),
  chapecoense: solid("#00A329", "#ffffff"),
  remo: vStripes("#0057B8", "#C8102E"),

  // LaLiga
  barcelona: vStripes("#004D98", "#A50044"),
  "real-madrid": solid("#ffffff", "#0a2f6b"),
  "atletico-madrid": vStripes("#C8102E", "#ffffff"),
  "athletic-club": vStripes("#EE2523", "#ffffff"),
  "celta-vigo": solid("#8AC3EE", "#ffffff"),
  espanyol: hStripes("#0085CC", "#ffffff"),
  "real-betis": hStripes("#00954C", "#ffffff"),
  "real-sociedad": solid("#143C8B", "#ffffff"),
  sevilla: solid("#ffffff", "#D70F21"),
  valencia: solid("#ffffff", "#0a0a0a"),
  villarreal: solid("#FFDF1C", "#005187"),
  alaves: solid("#0232A0", "#ffffff"),
  "deportivo-la-coruna": hStripes("#0085CC", "#ffffff"),
  elche: vStripes("#05642C", "#ffffff"),
  getafe: solid("#014F97", "#ffffff"),
  levante: solid("#005CA3", "#C8102E"),
  osasuna: solid("#D70F27", "#0a2f6b"),
  "racing-santander": vStripes("#2D9A29", "#ffffff"),
  "rayo-vallecano": sash("#ffffff", "#E3351C"),
  malaga: solid("#0085CC", "#ffffff"),

  // Serie A
  inter: vStripes("#00239C", "#0a0a0a"),
  juventus: vStripes("#0a0a0a", "#ffffff"),
  "ac-milan": vStripes("#E4002B", "#0a0a0a"),
  "as-roma": solid("#970A2C", "#F0B300"),
  atalanta: vStripes("#0067B2", "#0a0a0a"),
  como: solid("#10416A", "#ffffff"),
  napoli: solid("#01A7E1", "#ffffff"),
  bologna: vStripes("#C8102E", "#0a2f6b"),
  cagliari: vStripes("#C8102E", "#0a2f6b"),
  fiorentina: solid("#61358B", "#ffffff"),
  genoa: vStripes("#C8102E", "#0a2f6b"),
  lazio: solid("#85D8F8", "#ffffff"),
  parma: solid("#ffffff", "#24338A"),
  sassuolo: vStripes("#0a0a0a", "#1EA451"),
  torino: solid("#881F19", "#ffffff"),
  udinese: vStripes("#0a0a0a", "#ffffff"),
  frosinone: solid("#FFDF1C", "#004393"),
  lecce: vStripes("#FFDF1C", "#C8102E"),
  monza: vStripes("#C8102E", "#ffffff"),
  venezia: solid("#0a0a0a", "#ED6B00"),

  // Premier League
  arsenal: solid("#E20613", "#ffffff"),
  chelsea: solid("#153D8A", "#ffffff"),
  liverpool: solid("#DC0714", "#ffffff"),
  "manchester-city": solid("#7AB2E1", "#ffffff"),
  "manchester-united": solid("#DA020E", "#ffffff"),
  tottenham: solid("#ffffff", "#000A3C"),
  "aston-villa": vStripes("#7A003C", "#7AB2E1"),
  bournemouth: vStripes("#C8102E", "#0a0a0a"),
  brighton: vStripes("#0057B8", "#ffffff"),
  "crystal-palace": vStripes("#C8102E", "#0057B8"),
  everton: solid("#014593", "#ffffff"),
  newcastle: vStripes("#0a0a0a", "#ffffff"),
  "nottingham-forest": solid("#DC0D15", "#ffffff"),
  brentford: vStripes("#C8102E", "#ffffff"),
  coventry: solid("#7AB2E1", "#ffffff"),
  fulham: solid("#ffffff", "#0a0a0a"),
  ipswich: solid("#3A64A3", "#ffffff"),
  leeds: solid("#ffffff", "#FFDF00"),
  sunderland: vStripes("#C8102E", "#ffffff"),
  "hull-city": vStripes("#0a0a0a", "#F18A01"),

  // Bundesliga
  "bayern-munchen": solid("#ED0038", "#ffffff"),
  "bayer-leverkusen": vStripes("#E22726", "#0a0a0a"),
  "borussia-dortmund": solid("#FFD900", "#0a0a0a"),
  "rb-leipzig": solid("#ffffff", "#DD0741"),
  "vfb-stuttgart": solid("#ffffff", "#D40723"),
  "1-fc-koln": solid("#ffffff", "#E20613"),
  "union-berlin": solid("#7A0C1E", "#ffffff"),
  "1899-hoffenheim": solid("#1961B5", "#ffffff"),
  "borussia-monchengladbach": solid("#ffffff", "#0a0a0a"),
  "eintracht-frankfurt": vStripes("#0a0a0a", "#E1020C"),
  "fc-augsburg": solid("#C8102E", "#ffffff"),
  "fsv-mainz-05": solid("#AE0F0A", "#ffffff"),
  "sc-freiburg": solid("#C8102E", "#ffffff"),
  "werder-bremen": solid("#1D9053", "#ffffff"),
  "fc-schalke-04": vStripes("#004B9C", "#ffffff"),
  "hamburger-sv": solid("#ffffff", "#1E5CB3"),
  "sc-paderborn-07": solid("#005CA8", "#ffffff"),
  "sv-elversberg": solid("#ffffff", "#0a0a0a"),

  // Ligue 1
  "paris-saint-germain": solid("#04174b", "#DA020E"),
  monaco: hStripes("#C8102E", "#ffffff"),
  "olympique-de-marseille": solid("#ffffff", "#0097D7"),
  "olympique-lyonnais": solid("#ffffff", "#0F23AA"),
  "rc-strasbourg": solid("#009FE3", "#ffffff"),
  lens: vStripes("#C8102E", "#FFD900"),
  lille: solid("#C8102E", "#ffffff"),
  nice: solid("#C8102E", "#0a0a0a"),
  "paris-fc": solid("#0A0F2D", "#C8102E"),
  "stade-brestois": solid("#C8102E", "#ffffff"),
  toulouse: solid("#38284F", "#ffffff"),
  angers: solid("#0a0a0a", "#ffffff"),
  auxerre: solid("#ffffff", "#004EA2"),
  lorient: vStripes("#ED6B00", "#0a0a0a"),
  "stade-rennais": vStripes("#C8102E", "#0a0a0a"),
  "estac-troyes": solid("#006CB4", "#ffffff"),
  "le-havre": vStripes("#193260", "#7AB2E1"),
  "le-mans": solid("#193260", "#FFD900"),

  // Argentina
  "boca-juniors": hStripes("#103F79", "#FFD900"),
  "river-plate": sash("#ffffff", "#ED192D"),
  "racing-club": vStripes("#8AC3EE", "#ffffff"),
  independiente: solid("#C8102E", "#ffffff"),
  "san-lorenzo": hStripes("#0057B8", "#7C1F2C"),
  "velez-sarsfield": solid("#ffffff", "#0A539C"),
  huracan: solid("#ffffff", "#C8102E"),
  "newells-old-boys": solid("#0a0a0a", "#C8102E"),
  "rosario-central": vStripes("#0A3D72", "#FFD900"),
  "argentinos-jrs": vStripes("#C8102E", "#ffffff"),
  estudiantes: vStripes("#C8102E", "#ffffff"),
  talleres: solid("#0A2FA3", "#ffffff"),

  // Liga MX
  "club-america": solid("#FFEB00", "#04174b"),
  "guadalajara-chivas": vStripes("#C8102E", "#ffffff"),
  "cruz-azul": solid("#001F60", "#ffffff"),
  "tigres-uanl": solid("#0a2f6b", "#FFD900"),
  monterrey: solid("#0A2240", "#ffffff"),

  // MLS
  "inter-miami": solid("#F7B5CD", "#0a0a0a"),
  "los-angeles-galaxy": solid("#ffffff", "#00245D"),
  "seattle-sounders": solid("#2CC84D", "#0a0a0a"),

  // Uruguay
  "club-nacional": sash("#ffffff", "#003362"),
  penarol: vStripes("#0a0a0a", "#FFE600"),

  // Ecuador
  "barcelona-sc": solid("#FFF218", "#0a0a0a"),
  "ldu-de-quito": solid("#ffffff", "#B70000"),

  // Peru
  "alianza-lima": solid("#0057B8", "#ffffff"),
  universitario: solid("#F1E4C3", "#7C1F2C"),
  "sporting-cristal": sash("#56C7ED", "#ffffff"),
};

/** Rough light/dark contrast pick when a club has no curated entry. */
function contrastAccent(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#f5f5f5";
}

/** Grey kit whenever there's no club yet (intro teaser, identity, appearance). */
export function getKitForTeam(teamId: string | null | undefined): KitDef {
  if (!teamId) return NEUTRAL_KIT;
  const curated = KIT_DATABASE[teamId];
  if (curated) return curated;
  const team = getTeam(teamId);
  if (!team?.primary_color) return NEUTRAL_KIT;
  return solid(team.primary_color, contrastAccent(team.primary_color));
}

/** National-team kit, straight from the dataset's own kit fields. */
export function getKitForCountry(country: Country | null | undefined): KitDef {
  if (!country?.kit_primary_color) return NEUTRAL_KIT;
  const base = country.kit_primary_color;
  const accent = country.kit_secondary_color || contrastAccent(base);
  const pattern: KitPattern = country.kit_type ?? "solid";
  return { base, accent, pattern };
}
