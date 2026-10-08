import { challengeDayId, nextChallengeAt } from "@craque/engine/day";
import { useEffect, useState } from "react";

/**
 * O relógio do Desafio do dia (GDD 27.1). O motor nunca lê o relógio; quem lê
 * é a interface, aqui, e passa o instante. O dia é o de UTC: vira exatamente
 * na meia-noite UTC para todo mundo, e a tela troca de mão sozinha.
 */

export interface ChallengeClock {
  /** O dia de agora, `AAAA-MM-DD` em UTC. */
  readonly day: string;
  /** Milissegundos até a próxima virada. */
  readonly msLeft: number;
}

export function readChallengeClock(now: number = Date.now()): ChallengeClock {
  return { day: challengeDayId(now), msLeft: nextChallengeAt(now) - now };
}

/** O dia e a contagem regressiva, atualizados a cada segundo. */
export function useChallengeClock(): ChallengeClock {
  const [clock, setClock] = useState(readChallengeClock);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(readChallengeClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return clock;
}
