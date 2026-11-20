import { isNetworkError } from "./client";
import { ACCOUNTS_ENABLED } from "./config";
import { careerResultSchema, craqueCareerSchema, tecnicoCareerSchema, unlockPayloadSchema } from "./schemas";
import { useAccount } from "./store";

/**
 * A ponte entre o jogo e a nuvem (D112). O jogo chama daqui sem saber se há
 * conta: visitante e build sem Supabase não enviam nada. Tudo passa pelo Zod
 * antes de sair, e sai direto para as funções `registrar_*` do banco, que
 * conferem de novo. Sem fila no aparelho (D116): um envio que falhar (sem
 * internet) não é repetido; o banco é idempotente pela chave da carreira,
 * então nada conta duas vezes.
 */

type Game = "craque" | "tecnico";

export function accountMode(): "local" | "guest" | "member" {
  const status = useAccount.getState().status;
  if (status === "off") return "local";
  return status === "member" || status === "checking" ? "member" : "guest";
}

/**
 * Avisa conquista na tela? Sem nuvem e logado, sim. O visitante continua
 * guardando no aparelho em silêncio (entram na conta no primeiro login), mas
 * não vê o aviso: colecionar é de quem tem conta (D112).
 */
export function announcesUnlocks(): boolean {
  return accountMode() !== "guest";
}

/** Os ids que a conta já tem na nuvem: somam aos do aparelho para não avisar de novo. */
export function cloudUnlockedIds(): ReadonlySet<string> {
  const { status, trophies } = useAccount.getState();
  return status === "member" ? new Set(trophies.map((trophy) => trophy.id_trophy)) : new Set();
}

/** Carreiras do Craque já terminadas na conta (para "Dez carreiras" valer entre aparelhos). */
export function cloudCareers(): number {
  const { status, profile } = useAccount.getState();
  return status === "member" && profile ? profile.carreiras : 0;
}

/** A conta que está jogando, para marcar as conquistas guardadas no aparelho. */
export function memberId(): string | undefined {
  const { status, user } = useAccount.getState();
  return status === "member" && user ? user.id : undefined;
}

/** Um envio por vez, na ordem em que o jogo pediu: as conquistas do fim chegam antes da carreira. */
let chain: Promise<unknown> = Promise.resolve();

function send(work: () => Promise<void>): void {
  chain = chain.then(work).catch((error: unknown) => {
    if (!isNetworkError(error)) console.warn("Futeiro: envio para a conta recusado", error);
  });
}

/** Conquistas que acabaram de cair numa carreira em andamento. */
export function sendUnlocks(game: Game, key: string, ids: readonly string[]): void {
  if (!ACCOUNTS_ENABLED || !memberId() || ids.length === 0) return;
  const parsed = unlockPayloadSchema.safeParse({ jogo: game, chave: key, ids: [...new Set(ids)] });
  if (!parsed.success) return;
  send(async () => {
    const client = await useAccount.getState().ensureClient();
    if (!client || !memberId()) return;
    const { error } = await client.rpc("registrar_conquistas", { p_jogo: parsed.data.jogo, p_chave: parsed.data.chave, p_ids: parsed.data.ids });
    if (error) throw error;
  });
}

/** O fim de uma carreira: números, conquistas e, no Desafio, a nota do dia. */
export function sendCareer(game: Game, key: string, data: Record<string, unknown>): boolean {
  if (!ACCOUNTS_ENABLED || !memberId() || !/^[a-z0-9]{6,32}$/.test(key)) return false;
  const parsed = game === "craque" ? craqueCareerSchema.safeParse(data) : tecnicoCareerSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("Futeiro: carreira fora dos limites, não enviada", parsed.error.issues);
    return false;
  }
  send(async () => {
    const client = await useAccount.getState().ensureClient();
    if (!client || !memberId()) return;
    const { data: result, error } = await client.rpc("registrar_carreira", { p_jogo: game, p_chave: key, p_dados: parsed.data });
    if (error) throw error;
    if (careerResultSchema.safeParse(result).success) await useAccount.getState().refresh();
  });
  return true;
}
