import { useAccount } from "../account/store";
import { type AttemptEntry, attemptsOf } from "./model";
import { useHall } from "./store";

/**
 * As tentativas do Desafio de quem está jogando agora (D125): as da conta
 * logada ou, sem conta, as do visitante. Trocar de conta troca a lista.
 */
export function useOwnAttempts(): AttemptEntry[] {
  const attempts = useHall((state) => state.attempts);
  const account = useAccount((state) => (state.status === "member" ? (state.user?.id ?? null) : null));
  return attemptsOf(attempts, account);
}
