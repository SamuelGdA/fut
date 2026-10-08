import { DEFAULT_AVATAR } from "@craque/art";
import { autoplay, type Career, type CareerSetup, createCareer, parseSave, replay, saveOf } from "@craque/engine";
import { describe, expect, it } from "vitest";
import { startScreen } from "../../app/startup";
import { posterFileName } from "./poster";
import { readShareHash } from "./shareHash";
import { decodeShare, encodeShare, ShareError, shareUrl } from "./shareLink";
import { SHOWCASE_GAP, showcaseItems, showcaseLayout } from "./showcase";
import { posterNumbers, summaryNumbers, summaryRecords, timeline } from "./summaryData";

/** O resumo (M6): link compartilhado, pôster, vitrine e os dados que a tela mostra. */

function setup(seed: string, position: CareerSetup["identity"]["position"] = "st"): CareerSetup {
  return {
    seed,
    startYear: 2026,
    pace: "intense",
    difficulty: "normal",
    identity: { surname: "SOUSA", foot: "right", nationality: "POR", position, dreamNumber: 9 },
  };
}

const finished: Career = autoplay(createCareer(setup("resumo-1")), "ambitious");
const keeper: Career = autoplay(createCareer(setup("resumo-2", "gk")), "balanced");

describe("link da carreira (GDD 29.2)", () => {
  it("ida e volta: o link refaz exatamente a mesma carreira, com o avatar", async () => {
    const token = await encodeShare(saveOf(finished), DEFAULT_AVATAR);
    expect(token.startsWith("z")).toBe(true);
    // Um link curto o bastante para colar em qualquer conversa.
    expect(token.length).toBeLessThan(4000);
    const shared = await decodeShare(token);
    expect(shared.avatar).toEqual(DEFAULT_AVATAR);
    const again = replay(parseSave(shared.save));
    expect(JSON.stringify(again)).toBe(JSON.stringify(finished));
  });

  it("link quebrado ou sem carreira é recusado sem lançar outra coisa", async () => {
    await expect(decodeShare("x123")).rejects.toBeInstanceOf(ShareError);
    await expect(decodeShare("zAAAA")).rejects.toBeInstanceOf(ShareError);
    await expect(decodeShare(`j${btoa("[1,2]")}`)).rejects.toBeInstanceOf(ShareError);
  });

  it("o fragmento abre a tela do link; o resto segue como antes", async () => {
    const token = await encodeShare(saveOf(finished), null);
    expect(readShareHash(`#c=${token}`)).toBe(token);
    expect(readShareHash("#c=")).toBeNull();
    expect(readShareHash("#lab")).toBeNull();
    expect(startScreen(`#c=${token}`)).toBe("shared");
    expect(shareUrl(token, { origin: "https://exemplo.test", pathname: "/" })).toBe(`https://exemplo.test/#c=${token}`);
  });
});

describe("pôster (GDD 29)", () => {
  it("nome do arquivo sem acento nem espaço; sem sobrenome, o nome genérico", () => {
    expect(posterFileName("DA SILVA-ÁVILA", true)).toBe("craque-da-silva-avila.png");
    expect(posterFileName("Ÿngvar", true)).toBe("craque-yngvar.png");
    expect(posterFileName("SOUSA", false)).toBe("craque-carreira.png");
    expect(posterFileName("???", true)).toBe("craque-carreira.png");
  });

  it("seis números, os da posição", () => {
    expect(posterNumbers(finished).map((item) => item.key)).toEqual(["games", "goals", "assists", "titles", "awards", "nationalGames"]);
    expect(posterNumbers(keeper).map((item) => item.key)).toContain("cleanSheets");
    expect(posterNumbers(keeper)).toHaveLength(6);
  });
});

describe("vitrine (GDD 24.5)", () => {
  it("o maior tamanho em que a coleção inteira cabe, e as legendas saem antes de encolher demais", () => {
    const few = showcaseLayout(3, 360, 520);
    expect(few).toMatchObject({ labels: true, fits: true, art: 112 });
    const many = showcaseLayout(40, 360, 520);
    expect(many.labels).toBe(false);
    expect(many.rows * many.cellHeight + (many.rows - 1) * SHOWCASE_GAP).toBeLessThanOrEqual(520);
    // Tamanho cai devagar: mais peças nunca dão arte maior.
    let previous = Number.POSITIVE_INFINITY;
    for (const count of [1, 4, 8, 16, 24, 32, 48]) {
      const layout = showcaseLayout(count, 360, 520);
      expect(layout.art).toBeLessThanOrEqual(previous);
      previous = layout.art;
    }
    // Nem o menor coube: devolve o menor, avisando.
    expect(showcaseLayout(400, 360, 200)).toMatchObject({ fits: false, labels: false });
  });

  it("cada competição uma peça, com a contagem e os anos", () => {
    const items = showcaseItems(finished.history);
    const titles = finished.history.reduce((total, record) => total + record.titles.length, 0);
    const counted = items.filter((item) => item.kind === "title").reduce((total, item) => total + item.count, 0);
    expect(counted).toBe(titles);
    for (const item of items) expect(item.years).toHaveLength(item.count);
  });
});

describe("dados do resumo (GDD 24)", () => {
  it("números pela posição: goleiro com jogos sem sofrer e gols sofridos, sem gols", () => {
    const keys = summaryNumbers(keeper).map((item) => item.key);
    expect(keys).toContain("cleanSheets");
    expect(keys).toContain("conceded");
    expect(keys).not.toContain("goals");
    expect(summaryNumbers(finished).map((item) => item.key)).toContain("goals");
  });

  it("linha do tempo: passagens em ordem e a estreia na seleção no lugar da idade", () => {
    const items = timeline(finished);
    const ages = items.map((item) => (item.kind === "stint" ? item.stint.fromAge : item.age));
    expect([...ages].sort((a, b) => a - b)).toEqual(ages);
    expect(items.filter((item) => item.kind === "debut")).toHaveLength(finished.firstCapAge === null ? 0 : 1);
    const seasons = items.reduce((total, item) => total + (item.kind === "stint" ? item.stint.seasons : 0), 0);
    expect(seasons).toBe(finished.history.length);
  });

  it("recordes: alcançados primeiro, depois os mais perto; os muito longe ficam de fora", () => {
    const records = summaryRecords(finished.history);
    const reached = records.filter((result) => result.status !== "short").length;
    records.slice(0, reached).forEach((result) => expect(result.status).not.toBe("short"));
    for (const result of records.slice(reached)) expect(result.value / result.record.value).toBeGreaterThanOrEqual(0.25);
  });
});
