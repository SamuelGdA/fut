import { create } from "zustand";
import { safeStorage } from "../../services/storage";
import { TRACKERS_ENABLED } from "./config";

/**
 * O consentimento de cookies (D113, LGPD e GDPR). Duas escolhas, do mesmo
 * tamanho e no mesmo lugar: "Aceitar todos" (Analytics e anúncios
 * personalizados) e "Somente essenciais" (nada do Google é carregado). A
 * escolha fica no aparelho, com a versão do texto: se o texto mudar, o aviso
 * volta. Dá para mudar a qualquer hora nos Ajustes.
 */

export const CONSENT_KEY = "craque.v2.consent";
/** Sobe quando o que o aviso diz mudar: todo mundo escolhe de novo. */
export const CONSENT_VERSION = 1;

export type ConsentChoice = "all" | "essential";

interface StoredConsent {
  readonly v: number;
  readonly choice: ConsentChoice;
  readonly at: number;
}

export function readConsent(read: (key: string) => string | null): ConsentChoice | null {
  try {
    const parsed = JSON.parse(read(CONSENT_KEY) ?? "null") as Partial<StoredConsent> | null;
    if (!parsed || parsed.v !== CONSENT_VERSION) return null;
    return parsed.choice === "all" || parsed.choice === "essential" ? parsed.choice : null;
  } catch {
    return null;
  }
}

interface ConsentState {
  /** `null`: ainda não escolheu (o aviso aparece, se houver o que consentir). */
  choice: ConsentChoice | null;
  /** O aviso reaberto pelos Ajustes. */
  reopened: boolean;
  choose(choice: ConsentChoice): void;
  reopen(): void;
}

export const useConsent = create<ConsentState>()((set) => ({
  choice: readConsent((key) => safeStorage.getItem(key)),
  reopened: false,
  choose(choice) {
    safeStorage.setItem(CONSENT_KEY, JSON.stringify({ v: CONSENT_VERSION, choice, at: Date.now() } satisfies StoredConsent));
    set({ choice, reopened: false });
  },
  reopen() {
    set({ reopened: true });
  },
}));

/** O aviso aparece? Só se houver rastreador no build e a escolha ainda estiver em aberto. */
export function bannerVisible(choice: ConsentChoice | null, reopened: boolean, trackers: boolean = TRACKERS_ENABLED): boolean {
  return trackers && (choice === null || reopened);
}

/** Analytics e anúncios só com "Aceitar todos". */
export function trackingAllowed(choice: ConsentChoice | null): boolean {
  return choice === "all";
}
