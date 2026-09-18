"use client";

import { useEffect } from "react";
import { ErrorPage, InjuryIcon } from "@/components/ErrorPage";

/**
 * Last line of defence. The whole game runs client-side off a single persisted
 * store, so an unexpected throw anywhere in the tree would otherwise leave a
 * blank page with no way back, and the player would have no idea their save is
 * still intact. This gives them a way out that doesn't destroy it.
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
    <ErrorPage
      code="500"
      tone="danger"
      eyebrow="Jogador no chão"
      title="Alguma coisa quebrou por aqui"
      description="A partida atual pode ter sido perdida, mas sua carreira continua salva no navegador. Tente recarregar; se o erro voltar, limpe os dados e comece de novo."
      art={<InjuryIcon />}
    >
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-pitch px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
      >
        Tentar de novo
      </button>
      <button
        type="button"
        onClick={() => {
          // Only the persisted save is cleared; nothing else in the page owns
          // state that survives a reload.
          try {
            window.localStorage.removeItem("craque-save");
          } catch {
            // Storage can be unavailable (private mode, blocked cookies) and
            // reloading is still worth trying.
          }
          window.location.reload();
        }}
        className="rounded-full border border-line px-6 py-2.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
      >
        Limpar dados e recarregar
      </button>
    </ErrorPage>
  );
}
