import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { openLogin } from "../../features/account/openLogin";
import type { RankingRow } from "../../features/account/schemas";
import { useAccount } from "../../features/account/store";
import { useT } from "../../i18n/useT";
import { Panel } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { Skeleton } from "../../ui/Skeleton";

type State = { kind: "loading" } | { kind: "offline" } | { kind: "unavailable" } | { kind: "ready"; rows: RankingRow[] };

/**
 * O ranking mundial do Desafio do dia (D112): as ranqueadas de todo mundo, da
 * maior nota para a menor, só com posição, @ e pontos (a função
 * `ranking_desafio` do banco não devolve mais nada). A linha de quem está
 * logado aparece mesmo fora do topo. Sem internet, um aviso no lugar; com
 * internet e o servidor sem responder (banco fora, migração por aplicar),
 * outro, para não culpar a conexão de quem joga.
 */
export function WorldRanking({ day }: { day: string }) {
  const { t, number } = useT();
  const status = useAccount((state) => state.status);
  // A resposta guarda o pedido de onde veio: dia ou conta novos voltam a "carregando" sem apagar nada à mão.
  const request = `${day}|${status}`;
  const [answer, setAnswer] = useState<{ request: string; state: State } | null>(null);
  const state: State = answer?.request === request ? answer.state : { kind: "loading" };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = await useAccount.getState().ensureClient();
        if (!client) throw new Error("sem cliente");
        const [{ data, error }, { rankingRowSchema }] = await Promise.all([client.rpc("ranking_desafio", { p_dia: day, p_limite: 10 }), import("../../features/account/schemas")]);
        const parsed = rankingRowSchema.array().safeParse(data ?? []);
        const failed: State = { kind: navigator.onLine ? "unavailable" : "offline" };
        if (!cancelled) setAnswer({ request, state: error || !parsed.success ? failed : { kind: "ready", rows: parsed.data } });
      } catch {
        if (!cancelled) setAnswer({ request, state: { kind: navigator.onLine ? "unavailable" : "offline" } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [day, request]);

  const total = state.kind === "ready" ? (state.rows[0]?.total ?? 0) : 0;
  const mine = state.kind === "ready" ? state.rows.find((row) => row.voce) : undefined;

  return (
    <Panel title={t("account.ranking.title")} aside={mine ? <span className="numeric text-xs text-glory">{t("account.ranking.place", { place: number(mine.posicao), total: number(total) })}</span> : null}>
      {state.kind === "loading" ? (
        <div role="status" aria-label={t("account.ranking.loading")} className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((row) => (
            <span key={row} className="flex items-center gap-3">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-10" />
            </span>
          ))}
        </div>
      ) : state.kind === "offline" || state.kind === "unavailable" ? (
        <p className="text-sm text-muted">{t(state.kind === "offline" ? "account.ranking.offline" : "account.ranking.unavailable")}</p>
      ) : state.rows.length === 0 ? (
        <p className="text-sm text-muted">{t("account.ranking.empty")}</p>
      ) : (
        <ol className="flex flex-col divide-y divide-line" aria-label={t("account.ranking.title")}>
          {state.rows.map((row) => (
            <li key={`${row.posicao}-${row.username}`} className="world-rank-row" data-you={row.voce || undefined}>
              <span className="numeric w-7 shrink-0 text-right text-sm font-bold text-faint">{number(row.posicao)}</span>
              <span className="display min-w-0 flex-1 truncate text-lg leading-tight font-extrabold">@{row.username}</span>
              {row.voce ? <Chip tone="glory" size="sm">{t("account.ranking.you")}</Chip> : null}
              <span className="numeric w-12 shrink-0 text-right text-lg font-black">{number(row.pontos)}</span>
            </li>
          ))}
        </ol>
      )}
      {status === "guest" ? (
        <button type="button" className="guest-notice-action mt-4" onClick={() => openLogin("challenge")}>
          <LogIn size={14} aria-hidden="true" />
          {t("account.ranking.visitor")}
        </button>
      ) : null}
    </Panel>
  );
}
