import { describe, expect, it } from "vitest";
import { foldText, formatMoney, formatNumber, formatOrdinal, formatPercent, upperName } from "./format";

describe("formatMoney (GDD 9.10)", () => {
  it("milhões com uma casa abaixo de 100M e separador do idioma", () => {
    expect(formatMoney(12_500_000, "pt")).toBe("€12,5M");
    expect(formatMoney(12_500_000, "es")).toBe("€12,5M");
    expect(formatMoney(12_500_000, "en")).toBe("€12.5M");
  });

  it("some com o ,0 e arredonda a partir de 100M", () => {
    expect(formatMoney(4_000_000, "pt")).toBe("€4M");
    expect(formatMoney(180_400_000, "pt")).toBe("€180M");
  });

  it("abaixo de um milhão usa mil ou K", () => {
    expect(formatMoney(850_000, "pt")).toBe("€850 mil");
    expect(formatMoney(850_000, "es")).toBe("€850K");
    expect(formatMoney(850_000, "en")).toBe("€850K");
  });

  it("um valor que arredonda para mil milhares vira milhão", () => {
    expect(formatMoney(999_600, "pt")).toBe("€1M");
  });

  it("nunca imprime valor negativo", () => {
    expect(formatMoney(-50, "en")).toBe("€0K");
  });
});

describe("números e textos", () => {
  it("agrupa milhares pelo idioma", () => {
    expect(formatNumber(1391, "pt")).toBe("1.391");
    expect(formatNumber(1391, "en")).toBe("1,391");
  });

  it("formata porcentagem sem casas", () => {
    expect(formatPercent(0.65, "pt")).toMatch(/^65\s?%$/);
    expect(formatPercent(0.65, "en")).toBe("65%");
  });

  it("sobrenome em maiúsculas sem espaços nas pontas", () => {
    expect(upperName("  da silva ", "pt")).toBe("DA SILVA");
    expect(upperName("müller", "en")).toBe("MÜLLER");
  });

  it("busca ignora acento e caixa", () => {
    expect(foldText("São Tomé e Príncipe")).toBe("sao tome e principe");
    expect(foldText("  ÉQUATEUR")).toBe("equateur");
  });
});

describe("formatOrdinal", () => {
  it("º em português e espanhol, sufixo inglês com as exceções de 11 a 13", () => {
    expect(formatOrdinal(3, "pt")).toBe("3º");
    expect(formatOrdinal(1, "es")).toBe("1º");
    expect(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd", "103rd"]).toEqual(
      [1, 2, 3, 4, 11, 12, 13, 21, 22, 103].map((value) => formatOrdinal(value, "en")),
    );
  });
});
