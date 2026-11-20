import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { readGoogleClientId } from "./config";
import { makeNonce } from "./googleOneTap";

/** Login com Google pela janelinha do navegador (D123). */

describe("ID do cliente Google", () => {
  it("aceita só o formato do Google; o resto desliga a janelinha", () => {
    expect(readGoogleClientId(" 123-abc9.apps.googleusercontent.com ")).toBe("123-abc9.apps.googleusercontent.com");
    expect(readGoogleClientId("")).toBe("");
    expect(readGoogleClientId(undefined)).toBe("");
    // O segredo nunca serve no lugar do ID.
    expect(readGoogleClientId("GOCSPX-segredo")).toBe("");
    expect(readGoogleClientId("123-abc.apps.googleusercontent.com.exemplo.com")).toBe("");
  });

  it("o build do site traz um ID válido", () => {
    // Lido como texto: o .env.production é versionado e só tem valores públicos.
    const env = readFileSync(new URL("../../../.env.production", import.meta.url), "utf8");
    const id = /VITE_GOOGLE_CLIENT_ID=(.*)/.exec(env)?.[1];
    expect(readGoogleClientId(id)).not.toBe("");
  });
});

describe("nonce", () => {
  it("o Google recebe o SHA-256 do nonce cru que vai para o Supabase", async () => {
    const { raw, hashed } = await makeNonce();
    expect(raw).toMatch(/^[0-9a-f]{64}$/);
    expect(hashed).toBe(createHash("sha256").update(raw).digest("hex"));
  });

  it("cada tentativa tem um nonce novo", async () => {
    const [a, b] = await Promise.all([makeNonce(), makeNonce()]);
    expect(a.raw).not.toBe(b.raw);
  });
});
