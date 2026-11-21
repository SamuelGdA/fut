import { create } from "zustand";

/**
 * A prévia dos espaços de anúncio (D134): molduras no lugar e no tamanho
 * exatos de cada anúncio, para avaliar o layout. Existe no desenvolvimento
 * (`pnpm dev`, ligada por padrão) e no build da suíte ponta a ponta
 * (`VITE_ADS_PREVIEW=1`, desligada até o teste ligar). Em produção não existe:
 * o jogador nunca vê moldura.
 *
 * Liga e desliga pelo botão "Ads" no canto, por Alt + Shift + A ou pela URL
 * (`?ads=on`, `?ads=off`). A escolha fica no aparelho.
 */
export const ADS_PREVIEW_AVAILABLE: boolean = import.meta.env.DEV || import.meta.env.VITE_ADS_PREVIEW === "1";

const KEY = "futeiro.ads-preview";

function readStored(): boolean | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "on" ? true : value === "off" ? false : null;
  } catch {
    return null;
  }
}

function store(on: boolean): void {
  try {
    window.localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* Armazenamento bloqueado: a escolha vale só nesta aba. */
  }
}

/** Ligada? A URL vence o que está guardado; sem nada, ligada só no desenvolvimento. */
function initial(): boolean {
  if (!ADS_PREVIEW_AVAILABLE || typeof window === "undefined") return false;
  const param = new URLSearchParams(window.location.search).get("ads");
  if (param === "on" || param === "off") {
    store(param === "on");
    return param === "on";
  }
  return readStored() ?? import.meta.env.DEV;
}

interface AdPreviewState {
  on: boolean;
  toggle(): void;
}

export const useAdPreview = create<AdPreviewState>((set, get) => ({
  on: initial(),
  toggle() {
    if (!ADS_PREVIEW_AVAILABLE) return;
    const on = !get().on;
    store(on);
    set({ on });
  },
}));
