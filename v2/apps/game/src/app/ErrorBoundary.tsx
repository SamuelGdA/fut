import { RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { useT } from "../i18n/useT";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { type ErrorArtKind, errorArt } from "./errorArt";
import { errorKind, errorMessage, isOffline } from "./errorKinds";
import { clearSaveAndReload } from "./recovery";

/**
 * As barreiras de erro (GDD 34.4 e 37). O jogador nunca vê uma página em
 * branco: um erro de desenho é pego no nível mais baixo que dá conta dele.
 *
 * - **Raiz** (`ErrorBoundary`): a última rede, tela inteira.
 * - **Tela** (`ScreenBoundary`): uma tela quebrada não derruba a casca; o topo
 *   e os ajustes continuam, e dá para voltar ao Início.
 * - **Trecho** (`SectionBoundary`): um capítulo do resumo ou uma área do
 *   laboratório que falhe vira um aviso no lugar dele; o resto da tela segue.
 *
 * Pedaço do jogo que não baixou (versão nova no ar, ou sem internet com a
 * tela ainda fora do aparelho) tem conversa própria: recarregar resolve.
 */

interface BoundaryProps {
  children: ReactNode;
  fallback(error: Error, reset: () => void): ReactNode;
  /** Mudou a chave, a barreira esquece o erro (trocar de tela, por exemplo). */
  resetKey?: unknown;
  /** Onde a barreira está, para o log. */
  label: string;
}

interface BoundaryState {
  error: Error | null;
  key: unknown;
}

export class Boundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { error: error instanceof Error ? error : new Error(errorMessage(error)) };
  }

  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): Partial<BoundaryState> | null {
    if (props.resetKey !== state.key) return { error: null, key: props.resetKey };
    return null;
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`CRAQUE: erro (${this.props.label})`, error, info.componentStack);
  }

  private readonly reset = () => {
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}

/** O desenho da tela de erro, do mesmo arquivo das páginas estáticas. */
export function ErrorArt({ kind, className }: { kind: ErrorArtKind; className?: string }) {
  return <span className={cn("error-art", className)} dangerouslySetInnerHTML={{ __html: errorArt(kind) }} />;
}

interface ErrorPanelProps {
  error: Error;
  /** `page`: tela inteira (raiz). `screen`: dentro da casca. */
  layout: "page" | "screen";
  onRetry(): void;
  /** Voltar ao Início sem recarregar (só dentro da casca). */
  onHome?: () => void;
  /** Oferece limpar o save (telas que leem a carreira). */
  offerReset: boolean;
}

/** A tela de erro: o lance, o que aconteceu, e o que fazer. */
export function ErrorPanel({ error, layout, onRetry, onHome, offerReset }: ErrorPanelProps) {
  const { t } = useT();
  const chunk = errorKind(error) === "chunk";
  const title = chunk ? t("errors.chunkTitle") : layout === "page" ? t("errors.title") : t("errors.screenTitle");
  const body = chunk
    ? isOffline()
      ? t("errors.chunkOffline")
      : t("errors.chunkUpdate")
    : layout === "page"
      ? t("errors.body")
      : t("errors.screenBody");

  return (
    <div
      role="alert"
      className={cn("grid place-items-center px-4 py-10", layout === "page" ? "pitch-stripes min-h-dvh" : "min-h-[70dvh]")}
      data-tone="bad"
    >
      <div className="w-full max-w-md">
        <ErrorArt kind="post" className="mb-6 block w-56 max-w-full" />
        <p className="eyebrow text-tone">{t("errors.eyebrow")}</p>
        <h1 className="display mt-3 text-5xl font-black uppercase">{title}</h1>
        <p className="mt-4 text-muted">{body}</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {chunk ? (
            <Button onClick={() => window.location.reload()}>
              <RefreshCw size={17} aria-hidden="true" />
              {t("errors.reload")}
            </Button>
          ) : (
            <Button onClick={onRetry}>
              <RotateCcw size={17} aria-hidden="true" />
              {t("errors.retry")}
            </Button>
          )}
          {onHome ? (
            <Button variant="secondary" onClick={onHome}>
              {t("errors.home")}
            </Button>
          ) : null}
          {offerReset && !chunk ? (
            <Button variant="danger" onClick={clearSaveAndReload}>
              <Trash2 size={17} aria-hidden="true" />
              {t("errors.reset")}
            </Button>
          ) : null}
        </div>
        <details className="mt-8 text-xs text-faint">
          <summary className="cursor-pointer">{t("errors.details")}</summary>
          <pre className="mt-2 overflow-x-auto rounded-sm bg-panel p-3 whitespace-pre-wrap">{errorMessage(error)}</pre>
        </details>
      </div>
    </div>
  );
}

/** A barreira da raiz: tela inteira, com tentar de novo e limpar o save. */
export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary label="raiz" fallback={(error, reset) => <ErrorPanel error={error} layout="page" onRetry={reset} offerReset />}>
      {children}
    </Boundary>
  );
}

/** Um trecho que falhou: um aviso no lugar dele, o resto da tela segue. */
export function SectionBoundary({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Boundary label={label} fallback={(error, reset) => <SectionError error={error} onRetry={reset} />}>
      {children}
    </Boundary>
  );
}

function SectionError({ error, onRetry }: { error: Error; onRetry(): void }) {
  const { t } = useT();
  const chunk = errorKind(error) === "chunk";
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-sm border border-line bg-panel p-4" data-tone="bad">
      <p className="text-tone font-bold">
        <span aria-hidden="true">▼ </span>
        {chunk ? t("errors.chunkTitle") : t("errors.sectionTitle")}
      </p>
      <p className="text-sm text-muted">{chunk ? (isOffline() ? t("errors.chunkOffline") : t("errors.chunkUpdate")) : t("errors.sectionBody")}</p>
      <Button size="sm" variant="secondary" onClick={chunk ? () => window.location.reload() : onRetry}>
        {chunk ? t("errors.reload") : t("errors.retry")}
      </Button>
    </div>
  );
}
