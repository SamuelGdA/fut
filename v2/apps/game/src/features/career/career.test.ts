import { DEFAULT_AVATAR } from "@craque/art";
import { type CareerSetup, ENGINE_VERSION, PRESTIGE_NUMBERS } from "@craque/engine";
import { CLUBS } from "@craque/world";
import { beforeEach, describe, expect, it } from "vitest";
import { startScreen } from "../../app/startup";
import { STORAGE_KEYS, safeStorage } from "../../services/storage";
import { sanitizeAvatar } from "../appearance/avatarSchema";
import { clubPalette, contrastRatio, DARK_REFERENCE, LIGHT_REFERENCE } from "./clubColors";
import { EMPTY_DRAFT, isDraftComplete, sanitizeDraft } from "./draft";
import { currentStartYear, newSeed, quickDraft, setupFromDraft } from "./newCareer";
import { readSave, recordOf } from "./save";
import { peekSave, savedScreen, writeSave } from "./saveRecord";
import { useCareer } from "./store";

/**
 * A ponte entre o motor e as telas (M5): save, rascunho, estado da carreira,
 * o lance de cada jogada (D43) e onde o jogo abre. Roda em Node: o armazenamento cai para a
 * memória, como num navegador que bloqueia o localStorage.
 */

const SETUP: CareerSetup = {
  seed: "teste-m5",
  startYear: 2026,
  pace: "intense",
  difficulty: "normal",
  identity: { surname: "ROCHA", foot: "right", nationality: "BRA", position: "cam", dreamNumber: 10 },
};

function resetStore() {
  safeStorage.removeItem(STORAGE_KEYS.save);
  useCareer.setState({ status: "idle", career: null, avatar: null, screen: "career", stale: null, play: null, review: null });
}

/** Joga escolhendo sempre a primeira opção que não aposenta. */
function playTurns(turns: number) {
  for (let turn = 0; turn < turns; turn += 1) {
    const decision = useCareer.getState().career?.decision;
    if (!decision) return;
    const option = decision.options.find((candidate) => candidate.kind !== "retire") ?? decision.options[0];
    if (!option) return;
    expect(useCareer.getState().choose(option.id)).toBe(true);
  }
}

describe("estado da carreira", () => {
  beforeEach(resetStore);

  it("começar cria a carreira, grava o save e abre na decisão da base", () => {
    useCareer.getState().start(SETUP, DEFAULT_AVATAR);
    const state = useCareer.getState();
    expect(state.status).toBe("ready");
    expect(state.career?.decision?.kind).toBe("base");
    const peek = peekSave();
    expect(peek.kind === "present" && peek.current && peek.screen === "career").toBe(true);
  });

  it("cada escolha grava o save e monta o lance; recarregar refaz a carreira e mostra só a última temporada, sem comemorar", () => {
    useCareer.getState().start(SETUP, DEFAULT_AVATAR);
    // Antes da primeira temporada não há lance.
    expect(useCareer.getState().play).toBeNull();
    const first = useCareer.getState().career?.decision?.options[0];
    if (!first) throw new Error("sem opção");
    useCareer.getState().choose(first.id);
    const play = useCareer.getState().play;
    expect(play?.fresh).toBe(true);
    expect(play?.pages.some((page) => page.kind === "season")).toBe(true);
    playTurns(6);
    const played = useCareer.getState().career;

    // Recarregar: o estado some, o save fica.
    useCareer.setState({ status: "idle", career: null, play: null, review: null });
    useCareer.getState().hydrate();
    const again = useCareer.getState();
    expect(again.status).toBe("ready");
    expect(JSON.stringify(again.career)).toBe(JSON.stringify(played));
    expect(again.avatar).toEqual(DEFAULT_AVATAR);
    // O lance da tela recarregada é a última temporada, sem evento e sem comemoração (invariante 23).
    expect(again.play?.fresh).toBe(false);
    expect(again.play?.pages).toHaveLength(1);
    const page = again.play?.pages[0];
    expect(page?.kind === "season" && page.index).toBe((played?.history.length ?? 0) - 1);
  });

  it("escolha velha (clique duplo, aba antiga) é recusada sem quebrar nada", () => {
    useCareer.getState().start(SETUP, null);
    const first = useCareer.getState().career?.decision?.options[0];
    if (!first) throw new Error("sem opção");
    expect(useCareer.getState().choose(first.id)).toBe(true);
    expect(useCareer.getState().choose("opcao-que-nao-existe")).toBe(false);
  });

  it("ritmo Rápida (duas temporadas por decisão): uma linha por temporada, e a transferência entra na primeira", () => {
    useCareer.getState().start({ ...SETUP, pace: "normal" }, null);
    const first = useCareer.getState().career?.decision?.options[0];
    if (!first) throw new Error("sem opção");
    useCareer.getState().choose(first.id);
    const pages = useCareer.getState().play?.pages ?? [];
    const seasons = pages.filter((page) => page.kind === "season");
    expect(seasons).toHaveLength(2);
    expect(seasons[0]?.kind === "season" && seasons[0].transfer !== null).toBe(true);
    expect(seasons[1]?.kind === "season" && seasons[1].transfer).toBeNull();
  });

  it("a mensagem do resultado (D45) sabe o que a escolha fez: assinar, ficar, treinar ou o evento", () => {
    useCareer.getState().start(SETUP, null);
    const seen = new Set<string>();
    for (let turn = 0; turn < 40 && seen.size < 3; turn += 1) {
      const state = useCareer.getState();
      const decision = state.career?.decision;
      if (!decision) break;
      const option = decision.options.find((item) => item.kind !== "retire" && !seen.has(item.kind)) ?? decision.options.find((item) => item.kind !== "retire");
      if (!option) break;
      useCareer.getState().choose(option.id);
      const outcome = useCareer.getState().play?.outcome ?? null;
      if (option.kind === "club") {
        expect(outcome?.kind).toBe("move");
        if (outcome?.kind === "move") {
          expect(outcome.club).toBe(option.offer.club);
          expect(outcome.shirt).toBe(option.offer.shirt);
        }
      } else if (option.kind === "stay") {
        expect(outcome?.kind).toBe("stay");
        if (outcome?.kind === "stay") expect(outcome.shirt).toBe(option.shirt);
      } else if (option.kind === "focus") {
        expect(outcome).toEqual({ kind: "focus", focus: option.focus });
      } else if (option.kind === "event") {
        expect(outcome?.kind).toBe("event");
      }
      seen.add(option.kind);
    }
    expect(seen.size).toBeGreaterThanOrEqual(2);
  });

  it("temporada revista e tela recarregada não têm mensagem: só o lance que acabou de acontecer", () => {
    useCareer.getState().start(SETUP, null);
    playTurns(2);
    useCareer.getState().reviewSeason(0);
    expect(useCareer.getState().review?.outcome ?? null).toBeNull();
    useCareer.setState({ status: "idle", career: null, play: null, review: null });
    useCareer.getState().hydrate();
    expect(useCareer.getState().play?.fresh).toBe(false);
    expect(useCareer.getState().play?.outcome ?? null).toBeNull();
  });

  it("encerrar carreira aposenta na hora e o save abre no resumo", () => {
    useCareer.getState().start(SETUP, null);
    playTurns(3);
    useCareer.getState().retire();
    const state = useCareer.getState();
    expect(state.career?.end?.reason).toBe("voluntary");
    expect(state.screen).toBe("summary");
    // O jogo abre no hub (D50); o cartão do Craque continua de onde parou.
    expect(startScreen("")).toBe("hub");
    expect(savedScreen()).toBe("summary");
    useCareer.setState({ status: "idle", career: null });
    useCareer.getState().hydrate();
    expect(useCareer.getState().career?.end?.reason).toBe("voluntary");
  });

  it("rever uma temporada já jogada mostra ela no lugar do lance, e fechar volta ao lance", () => {
    useCareer.getState().start(SETUP, null);
    playTurns(4);
    const latest = useCareer.getState().play;
    useCareer.getState().reviewSeason(0);
    const pages = useCareer.getState().review?.pages ?? [];
    expect(pages).toHaveLength(1);
    expect(pages[0]?.kind === "season" && pages[0].index).toBe(0);
    expect(useCareer.getState().review?.fresh).toBe(false);
    useCareer.getState().closeReview();
    expect(useCareer.getState().review).toBeNull();
    expect(useCareer.getState().play).toBe(latest);
    // Escolher de novo fecha a revisão sozinho.
    useCareer.getState().reviewSeason(0);
    const option = useCareer.getState().career?.decision?.options.find((item) => item.kind !== "retire");
    if (option) useCareer.getState().choose(option.id);
    expect(useCareer.getState().review).toBeNull();
  });

  it("save com escolha adulterada é descartado e o jogo avisa", () => {
    useCareer.getState().start(SETUP, null);
    playTurns(2);
    const raw = JSON.parse(safeStorage.getItem(STORAGE_KEYS.save) ?? "{}") as { choices: Array<{ option: string }> };
    const firstChoice = raw.choices[0];
    if (firstChoice) firstChoice.option = "club:time-que-nao-existe";
    safeStorage.setItem(STORAGE_KEYS.save, JSON.stringify(raw));
    useCareer.setState({ status: "idle", career: null });
    useCareer.getState().hydrate();
    expect(useCareer.getState().status).toBe("invalid");
    expect(peekSave().kind).toBe("none");
  });
});

describe("save (GDD 34)", () => {
  beforeEach(resetStore);

  it("save de outra versão do motor abre em modo leitura, e o jogo abre no Início", () => {
    useCareer.getState().start(SETUP, null);
    const raw = JSON.parse(safeStorage.getItem(STORAGE_KEYS.save) ?? "{}") as Record<string, unknown>;
    safeStorage.setItem(STORAGE_KEYS.save, JSON.stringify({ ...raw, engine: "2.0.0-m1" }));
    const read = readSave();
    expect(read.kind).toBe("stale");
    expect(startScreen("")).toBe("hub");
    expect(savedScreen()).toBeNull();
    const peek = peekSave();
    expect(peek.kind === "present" && !peek.current).toBe(true);
  });

  it("JSON quebrado é inválido, sem lançar", () => {
    safeStorage.setItem(STORAGE_KEYS.save, "{quebrado");
    expect(readSave().kind).toBe("invalid");
    expect(peekSave().kind).toBe("invalid");
    expect(startScreen("")).toBe("hub");
    expect(savedScreen()).toBeNull();
  });

  it("o registro guarda o retrato da carreira para o Início não precisar do motor", () => {
    useCareer.getState().start(SETUP, DEFAULT_AVATAR);
    const career = useCareer.getState().career;
    if (!career) throw new Error("sem carreira");
    const record = recordOf(career, DEFAULT_AVATAR, "career");
    expect(record.engine).toBe(ENGINE_VERSION);
    expect(record.snapshot).toMatchObject({ surname: "ROCHA", age: 16, seasons: 0, end: null });
    writeSave(record);
    const peek = peekSave();
    expect(peek.kind === "present" && peek.snapshot.surname).toBe("ROCHA");
  });

  it("#lab só abre o laboratório em desenvolvimento", () => {
    expect(startScreen("#lab")).toBe("lab");
  });
});

describe("rascunho e avatar (GDD 34.3)", () => {
  it("campo desconhecido volta ao padrão daquele campo, sem derrubar os outros", () => {
    const draft = sanitizeDraft({ surname: "Silva", dreamNumber: 200, foot: "ambos", nationality: "XXX", position: "libero", avatar: 3 });
    expect(draft).toEqual({ ...EMPTY_DRAFT, surname: "Silva" });
    expect(isDraftComplete(draft)).toBe(false);
    expect(isDraftComplete({ ...draft, nationality: "BRA", position: "st" })).toBe(true);
    expect(isDraftComplete({ ...draft, surname: "   ", nationality: "BRA", position: "st" })).toBe(false);
  });

  it("avatar com valor estranho cai no padrão do campo; sem objeto, silhueta", () => {
    expect(sanitizeAvatar(null)).toBeNull();
    expect(sanitizeAvatar("rosto")).toBeNull();
    const avatar = sanitizeAvatar({ ...DEFAULT_AVATAR, skin: 99, hair: "moicano", freckles: "sim" });
    expect(avatar).toEqual({ ...DEFAULT_AVATAR });
  });
});

describe("criar carreira", () => {
  it("o setup sai do rascunho com o sobrenome em maiúsculas e a semente única", () => {
    const setup = setupFromDraft({
      draft: { ...EMPTY_DRAFT, surname: " ÿngvar ", nationality: "NOR", position: "gk", dreamNumber: 1 },
      pace: "normal",
      difficulty: "hard",
      locale: "pt",
    });
    expect(setup.identity.surname).toBe("ŸNGVAR");
    expect(setup.pace).toBe("normal");
    expect(newSeed()).not.toBe(newSeed());
    expect(currentStartYear(new Date(2031, 3, 1))).toBe(2031);
    expect(currentStartYear(new Date(2019, 3, 1))).toBe(2026);
  });

  it("jogo rápido: rascunho completo, só sobrenome, número clássico ou nenhum", () => {
    for (let index = 0; index < 40; index += 1) {
      const draft = quickDraft("pt");
      expect(isDraftComplete(draft)).toBe(true);
      expect(draft.surname.length).toBeGreaterThan(1);
      expect(draft.surname.length).toBeLessThanOrEqual(16);
      if (draft.dreamNumber !== null && draft.position) expect(PRESTIGE_NUMBERS[draft.position]).toContain(draft.dreamNumber);
    }
  });
});

describe("cor do clube como acento (GDD 32.2 e 36)", () => {
  it("o acento de todo clube passa de 4,5:1 nos dois temas, e a faixa da carta difere da cor do clube", () => {
    for (const club of CLUBS) {
      const palette = clubPalette(club.id);
      expect(contrastRatio(palette.darkAccent, DARK_REFERENCE), club.id).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(palette.lightAccent, LIGHT_REFERENCE), club.id).toBeGreaterThanOrEqual(4.5);
      expect(palette.band).not.toBe(palette.solid);
    }
  });

  it("a conta de contraste é a da WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 2);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });
});
