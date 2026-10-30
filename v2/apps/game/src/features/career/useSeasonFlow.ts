import type { Career, KeyMatchResult } from "@craque/engine";
import { useCallback, useEffect, useState } from "react";
import { usePrefs } from "../../store/prefs";
import { useCareer } from "./store";
import type { PlaySession } from "./play";

// D106: 3 s de leitura (eram 2,5 s na D98), o bastante para a tabela assentar e o resultado ser lido.
const RESULT_READING_MS = 3000;

/**
 * Uma decisão já respondida nesta temporada (D106): a carreira de antes da
 * escolha, a opção marcada e o que ela deu. As bolinhas do progresso abrem
 * essa memória só para leitura; nada volta no tempo.
 */
export interface DecisionRecall {
  readonly year: number;
  readonly index: number;
  readonly total: number;
  readonly career: Career;
  readonly after: Career | null;
  readonly choice: string;
  readonly result: KeyMatchResult | null;
  readonly play: PlaySession | null;
}

/** O motor resolve uma vez; a apresentação segura o mesmo ano até revelar o lance. */
export function useSeasonFlow(active: Career | null) {
  const [recalls, setRecalls] = useState<readonly DecisionRecall[]>([]);
  const [recallIndex, setRecallIndex] = useState<number | null>(null);
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
  // D99: sem o avanço automático, só o botão Continuar segue.
  const autoAdvance = usePrefs((state) => state.autoAdvance);
  useEffect(() => {
    if (!reveal || !autoAdvance) return;
    // O relógio para com a aba escondida e enquanto o jogador segura o clique
    // (ou o dedo) em qualquer ponto do card da decisão; ao soltar, retoma de onde parou.
    let remaining = RESULT_READING_MS, started = performance.now(), timer = 0, running = false, holding = false;
    const pause = () => { if (!running) return; running = false; window.clearTimeout(timer); remaining = Math.max(0, remaining - (performance.now() - started)); };
    const resume = () => { if (running || document.hidden || holding) return; running = true; started = performance.now(); timer = window.setTimeout(finish, remaining); };
    const visibility = () => (document.hidden ? pause() : resume());
    const press = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(".season-decision-window")) return;
      holding = true;
      pause();
    };
    const release = () => { if (!holding) return; holding = false; resume(); };
    resume();
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("pointerdown", press, true);
    window.addEventListener("pointerup", release, true);
    window.addEventListener("pointercancel", release, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("pointerdown", press, true);
      window.removeEventListener("pointerup", release, true);
      window.removeEventListener("pointercancel", release, true);
    };
  }, [reveal, finish, autoAdvance]);
  const choose = (id: string) => {
    if (!active || reveal || outgoing) return false;
    const previousPlay = useCareer.getState().play;
    const ok = useCareer.getState().choose(id);
    const outcome = useCareer.getState().play?.outcome;
    if (ok && active.decision?.match && outcome?.kind === "drama" && outcome.result) setReveal({ career: active, result: outcome.result, play: previousPlay });
    const state = useCareer.getState();
    const following = state.career?.decision;
    // A decisão principal não leva número no motor: é a primeira do ano quando a seguinte, no mesmo ano, é a segunda.
    const progress = active.decision?.progress ?? (following?.year === active.decision?.year && following?.progress?.index === 2 ? { index: 1, total: following.progress.total } : undefined);
    if (ok && active.decision && progress) {
      const year = active.decision.year;
      const entry: DecisionRecall = { year, index: progress.index, total: progress.total, career: active, after: state.career, choice: id, result: outcome?.kind === "drama" ? outcome.result ?? null : null, play: state.play };
      // Só a temporada em curso fica na memória: o ano novo começa do zero.
      setRecalls((list) => [...list.filter((item) => item.year === year && item.index !== progress.index), entry]);
    }
    setRecallIndex(null);
    return ok;
  };
  const year = active?.decision?.year ?? null;
  const progress = active?.decision?.progress;
  // As bolinhas abrem as decisões já respondidas desta temporada; durante o resultado do lance, não.
  const recallable = reveal || outgoing || !progress ? [] : recalls.filter((item) => item.year === year && item.index < progress.index).map((item) => item.index);
  const recall = recallIndex === null ? null : recalls.find((item) => item.year === year && item.index === recallIndex && recallable.includes(item.index)) ?? null;
  return { career: reveal?.career ?? active, presentation: reveal?.career ?? outgoing?.career ?? active, result: reveal?.result ?? null, previousPlay: reveal?.play ?? outgoing?.play ?? null, transitioning: outgoing !== null, choose, finish, settled: () => setOutgoing(null), recall, recallable, openRecall: setRecallIndex };
}
