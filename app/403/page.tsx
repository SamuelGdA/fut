import { ErrorAction, ErrorPage, RedCardIcon } from "@/components/ErrorPage";

export const metadata = { title: "403 | CRAQUE" };

/**
 * Reachable as a real route so the host can point its own 403 at a page that
 * looks like the game. Nothing inside CRAQUE throws it: there is no account and
 * no server-side data, so the only way here is a server or proxy saying no.
 */
export default function Forbidden() {
  return (
    <ErrorPage
      code="403"
      tone="danger"
      eyebrow="Cartão vermelho"
      title="Sem acesso a esta parte do gramado"
      description="Você não tem permissão para abrir esta página. Se chegou aqui por um link, ele provavelmente aponta para algo que não é público."
      art={<RedCardIcon />}
    >
      <ErrorAction href="/">Voltar ao início</ErrorAction>
    </ErrorPage>
  );
}
