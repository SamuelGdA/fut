import { mix } from "@craque/art";
import { CLUBS, COMPETITIONS, COUNTRIES, getCountry } from "@craque/world";
import { describe, expect, it } from "vitest";
import { broadcastIdentity, broadcastStyle, kitStyle, STAGE_INK, type BroadcastIdentity } from "./broadcast";
import { MOTIF_MASKS } from "./broadcastMotifs";
import { BROADCAST_EMBLEMS, BROADCAST_MOTIFS, LEAGUE_DNA } from "./broadcastPackages";
import { contrastRatio, relativeLuminance } from "./clubColors";
import { SILVER_GLOW } from "./teamColors";

const NATIONAL = new Set(["worldCup", "nationsCup"]);
const club = (competition: string, team = "flamengo", opponent = "palmeiras") => broadcastIdentity({ competition, team, opponent, national: false });
const nation = (competition: string, team = "BRA", opponent = "ARG") => broadcastIdentity({ competition, team, opponent, national: true });
const of = (competition: (typeof COMPETITIONS)[number]) => (NATIONAL.has(competition.kind) ? nation(competition.id) : club(competition.id));
const style = (identity: BroadcastIdentity) => broadcastStyle(identity) as Record<string, string>;

/**
 * O ponto do palco atrás do título e do texto do lance: o alto do degradê
 * cruzado por um feixe de refletor (até 10% da luz mais forte no centro do
 * feixe). O brilho do time e o círculo do refletor terminam antes dessa
 * altura (`broadcast.css`).
 */
const behindHeading = (identity: BroadcastIdentity) => {
  const { mid, light, light2 } = identity.palette;
  return mix(mid, relativeLuminance(light2) > relativeLuminance(light) ? light2 : light, 0.1);
};

function expectReadable(identity: BroadcastIdentity) {
  const { palette: p } = identity;
  expect(contrastRatio(STAGE_INK, p.panel), `${identity.id}: texto na opção`).toBeGreaterThanOrEqual(10);
  expect(contrastRatio(p.muted, p.panel2), `${identity.id}: texto secundário`).toBeGreaterThanOrEqual(5.2);
  expect(contrastRatio(p.accent, p.panel2), `${identity.id}: acento`).toBeGreaterThanOrEqual(4.8);
  expect(contrastRatio(p.title, p.plate), `${identity.id}: nome da competição`).toBeGreaterThanOrEqual(9);
  expect(contrastRatio(STAGE_INK, behindHeading(identity)), `${identity.id}: título do lance`).toBeGreaterThanOrEqual(7);
  expect(contrastRatio(p.muted, behindHeading(identity)), `${identity.id}: texto do lance`).toBeGreaterThanOrEqual(4.5);
}

describe("transmissões das decisões de partida (D83)", () => {
  it("toda competição do jogo tem um pacote próprio, com padrão e selo conhecidos", () => {
    for (const competition of COMPETITIONS) {
      const identity = of(competition);
      expect(identity.id, competition.id).not.toBe("generic");
      expect(BROADCAST_MOTIFS, competition.id).toContain(identity.motif);
      expect(BROADCAST_EMBLEMS, competition.id).toContain(identity.emblem);
    }
  });

  it("cada torneio continental, mundial e de seleções tem identidade distinta", () => {
    const tournaments = COMPETITIONS.filter((competition) => !competition.country).map(of);
    const signatures = tournaments.map((identity) => `${identity.palette.deep}|${identity.palette.accent}|${identity.motif}`);
    expect(new Set(tournaments.map((identity) => identity.id)).size).toBe(tournaments.length);
    expect(new Set(signatures).size).toBe(tournaments.length);
  });

  it("a Champions é a noite estrelada; a Libertadores, os raios de ouro", () => {
    expect(club("cont1:UEFA", "barcelona", "real-madrid")).toMatchObject({ id: "ucl", motif: "stars", emblem: "starball" });
    expect(club("cont1:CONMEBOL")).toMatchObject({ id: "libertadores", motif: "rays", emblem: "laurel" });
    expect(club("cont1:CONMEBOL").palette.metal).toBe("#d4af37");
  });

  it("o céu estrelado fica com os clubes europeus: seleção nenhuma herda as estrelas", () => {
    for (const competition of COMPETITIONS.filter((item) => NATIONAL.has(item.kind))) {
      for (const country of COUNTRIES) expect(nation(competition.id, country.code).motif, `${competition.id} ${country.code}`).not.toBe("stars");
    }
    const starred = COMPETITIONS.filter((competition) => of(competition).motif === "stars").map((competition) => competition.id);
    expect(starred.sort()).toEqual(["cont1:UEFA", "contsuper:UEFA"]);
  });

  it("Mundial em ouro; Euro e Copa América em prata (D73), cada um no seu palco", () => {
    for (const code of ["BRA", "ARG", "FRA", "GER", "JPN"]) {
      expect(nation("worldcup", code).palette.accent, code).toBe("#efcf87");
      expect(nation("nations:UEFA", code).palette.accent, code).toBe("#dbe5ef");
      expect(nation("nations:CONMEBOL", code).palette.accent, code).toBe("#dbe5ef");
    }
    expect(nation("worldcup").motif).toBe("globe");
    expect(nation("nations:UEFA").motif).toBe("mosaic");
    expect(nation("nations:CONMEBOL").motif).toBe("aguayo");
  });

  it("a seleção entra nas luzes, no brilho e na bandeira da faixa", () => {
    const brazil = nation("worldcup", "BRA");
    const france = nation("worldcup", "FRA", "GER");
    expect(brazil.team.kit).toBe("flag");
    expect(brazil.team.band).toEqual(["#009c3b", "#ffdf00", "#2f6fd6"]);
    expect(brazil.palette.light2).toBe(brazil.team.glow2);
    expect(brazil.palette.mid).not.toBe(france.palette.mid);
    expect(style(brazil)["--match-bg-gradient"]).toContain("color-mix");
    expect(style(brazil)["--match-bg-gradient"]).toContain(brazil.team.glow);
    // Argentina: celeste, branco e o sol de Maio no meio da faixa.
    expect(nation("nations:CONMEBOL", "ARG").team.mark).toBe("#f6b40e");
    // Seleção sem identidade conferida: a faixa sai do uniforme dos dados.
    const derived = nation("nations:AFC", "AFG", "IRN").team;
    expect(derived.band).toHaveLength(3);
    expect(derived.band.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
  });

  it("ligas e copas levam o DNA do país; a copa troca o padrão pela chave do mata-mata", () => {
    expect(club("league:premier-league", "liverpool", "arsenal")).toMatchObject({ id: "league:ENG", motif: "shards", emblem: "crown" });
    expect(club("league:championship", "leeds", "sunderland").id).toBe("league:ENG");
    expect(club("cup:ENG", "liverpool", "arsenal")).toMatchObject({ id: "cup:ENG", motif: "bracket", emblem: "cup" });
    expect(club("cup:ESP", "real-madrid", "barcelona").emblem).toBe("crown");
    expect(club("league:serie-a", "ac-milan", "inter").emblem).toBe("scudetto");
    expect(club("league:brasileirao").motif).toBe("stands");
    expect(club("cup:BRA").palette.deep).not.toBe(club("league:brasileirao").palette.deep);
    const dna = Object.values(LEAGUE_DNA).map((pkg) => `${pkg.deep}|${pkg.accent}|${pkg.motif}`);
    expect(new Set(dna).size).toBe(dna.length);
  });

  it("o clube do jogador entra no brilho lateral e na faixa do placar", () => {
    const flamengo = club("league:brasileirao", "flamengo", "palmeiras");
    const palmeiras = club("league:brasileirao", "palmeiras", "flamengo");
    expect(flamengo.team.glow).not.toBe(palmeiras.team.glow);
    expect(flamengo.team.kit).toBe("horizontal_stripes");
    expect(style(flamengo)["--team-glow"]).toBe(flamengo.team.glow);
    expect(club("cont1:CONMEBOL", "boca-juniors", "river-plate").team.band).toContain("#ffd900");
    // Preto e branco brilham como prata, mais baixo.
    const juventus = club("league:serie-a", "juventus", "ac-milan");
    expect(juventus.team.glow).toBe(SILVER_GLOW);
    expect(style(juventus)["--team-glow-a"]).toBe("16%");
    // A faixa nunca some no escuro: preto vira grafite, marinho clareia.
    expect(juventus.team.band).toContain("#3b414b");
    expect(kitStyle(juventus.team)).toMatchObject({ "--k1": juventus.team.band[0], "--kmark": "transparent" });
  });

  it("a leitura tem contraste em toda competição, com qualquer clube ou seleção", () => {
    for (const competition of COMPETITIONS) {
      if (NATIONAL.has(competition.kind)) {
        for (const country of COUNTRIES) expectReadable(nation(competition.id, country.code, country.code === "BRA" ? "ARG" : "BRA"));
        continue;
      }
      // Em competição de clubes, o clube muda só o brilho e as faixas: as cores de leitura são as do pacote.
      const reference = club(competition.id).palette;
      expectReadable(club(competition.id));
      for (const team of CLUBS) expect(club(competition.id, team.id, team.id === "flamengo" ? "palmeiras" : "flamengo").palette, `${competition.id} ${team.id}`).toEqual(reference);
    }
  }, 30_000);

  it("o desenho do padrão viaja pela variável do palco, com a luz do próprio pacote", () => {
    for (const motif of BROADCAST_MOTIFS) {
      expect(MOTIF_MASKS[motif].mask, motif).toMatch(/url\(|gradient\(/);
      expect(MOTIF_MASKS[motif].edge, motif).toBeGreaterThan(MOTIF_MASKS[motif].core);
      expect(MOTIF_MASKS[motif].edge, motif).toBeLessThanOrEqual(28);
    }
    const ucl = style(club("cont1:UEFA", "barcelona", "real-madrid"));
    expect(ucl["--bc-mask"]).toBe(MOTIF_MASKS.stars.mask);
    expect(ucl["--bc-motif"]).toBe(club("cont1:UEFA", "barcelona", "real-madrid").palette.light2);
    expect(ucl["--bc-motif-a"]).toBe("28%");
  });

  it("a mesma partida dá sempre a mesma transmissão", () => {
    expect(club("cont1:UEFA", "barcelona", "real-madrid")).toBe(club("cont1:UEFA", "barcelona", "real-madrid"));
    expect(getCountry("BRA")).not.toBeNull();
  });
});
