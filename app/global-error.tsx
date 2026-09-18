"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * When the root layout itself throws.
 *
 * Nothing above this survived, so it has to bring its own `<html>` and its own
 * markup: no providers, no top bar, and no shared components, because the
 * failure may well be in one of them. Deliberately plain and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt" className="dark h-full">
      <body className="flex h-full flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-danger">
          Partida interrompida
        </p>
        <p className="mt-3 font-display text-[86px] font-black leading-none tracking-[-0.04em] text-danger">
          500
        </p>
        <span aria-hidden className="mt-5 block h-px w-16 bg-danger/40" />
        <h1 className="mt-5 font-display text-2xl font-black tracking-tight">
          O jogo não conseguiu carregar
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          Algo falhou antes mesmo da tela abrir. Recarregar costuma resolver, e sua carreira
          continua guardada no navegador.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 rounded-full bg-pitch px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Recarregar
        </button>
      </body>
    </html>
  );
}
