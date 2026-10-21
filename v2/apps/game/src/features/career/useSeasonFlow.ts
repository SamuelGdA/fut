import type { Career, KeyMatchResult } from "@craque/engine";
import { useCallback, useEffect, useState } from "react";
import { useCareer } from "./store";
import type { PlaySession } from "./play";

const RESULT_READING_MS = 2100;

/** O motor resolve uma vez; a apresentação segura o mesmo ano até revelar o lance. */
export function useSeasonFlow(active: Career | null) {
  const [reveal, setReveal] = useState<{ career: Career; result: KeyMatchResult; play: PlaySession | null } | null>(null);
  const [outgoing, setOutgoing] = useState<{ career: Career; play: PlaySession | null } | null>(null);
  useEffect(() => {
    if (!outgoing) return;
    // Trocar para a aba Jogador desmonta o card: nesse caso não há callback de saída.
    const timer = window.setTimeout(() => setOutgoing(null), 1000);
    return () => window.clearTimeout(timer);
  }, [outgoing]);
  // A revista só ocupa espaço depois que o card anterior saiu por completo.
  const finish = useCallback(() => { if (reveal) { setOutgoing(reveal); setReveal(null); } }, [reveal]);
  useEffect(() => {
    if (!reveal) return;
    let remaining = RESULT_READING_MS, started = performance.now(), timer = 0;
    const resume = () => { started = performance.now(); timer = window.setTimeout(finish, remaining); };
    const visibility = () => {
      if (document.hidden) { window.clearTimeout(timer); remaining = Math.max(0, remaining - (performance.now() - started)); }
      else resume();
    };
    if (!document.hidden) resume();
    document.addEventListener("visibilitychange", visibility);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [reveal, finish]);
  const choose = (id: string) => {
    if (!active || reveal || outgoing) return false;
    const previousPlay = useCareer.getState().play;
    const ok = useCareer.getState().choose(id);
    const outcome = useCareer.getState().play?.outcome;
    if (ok && active.decision?.match && outcome?.kind === "drama" && outcome.result) setReveal({ career: active, result: outcome.result, play: previousPlay });
    return ok;
  };
  return { career: reveal?.career ?? active, presentation: reveal?.career ?? outgoing?.career ?? active, result: reveal?.result ?? null, previousPlay: reveal?.play ?? outgoing?.play ?? null, transitioning: outgoing !== null, choose, finish, settled: () => setOutgoing(null) };
}
