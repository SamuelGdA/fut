import { describe, expect, it } from "vitest";
import { ACCOUNTS_ENABLED } from "./config";
import { accountMode, announcesUnlocks } from "./sync";

/** Nos testes, a nuvem fica desligada (vite.config, test.env): o jogo se comporta como sem Supabase. */
describe("build sem nuvem", () => {
  it("joga só no aparelho e avisa as conquistas como sempre", () => {
    expect(ACCOUNTS_ENABLED).toBe(false);
    expect(accountMode()).toBe("local");
    expect(announcesUnlocks()).toBe(true);
  });
});
