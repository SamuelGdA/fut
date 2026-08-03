"use client";

import { useEffect } from "react";

/**
 * Last line of defence. The whole game runs client-side off a single persisted
 * store, so an unexpected throw anywhere in the tree would otherwise leave a
 * blank page with no way back — and the player would have no idea their save
 * is still intact. This gives them a way out that doesn't destroy it.
 */
export default function Error({
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
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-danger">Erro inesperado</p>
      <h1 className="font-display text-2xl font-black tracking-tight">Algo quebrou por aqui</h1>
      <p className="max-w-md text-sm text-muted">
        A partida atual pode ter sido perdida, mas suas preferências continuam salvas. Tente
        recarregar — se o erro voltar, comece uma nova carreira.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-pitch px-6 py-2 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Tentar de novo
        </button>
        <button
          type="button"
          onClick={() => {
            // Only the persisted preferences are cleared; nothing else in the
            // page owns state that survives a reload.
            try {
              window.localStorage.removeItem("craque-save");
            } catch {
              // Storage can be unavailable (private mode, blocked cookies) —
              // reloading is still worth trying.
            }
            window.location.reload();
          }}
          className="rounded-full border border-line px-6 py-2 text-sm font-bold text-muted transition-colors hover:text-foreground"
        >
          Limpar dados e recarregar
        </button>
      </div>
    </main>
  );
}
