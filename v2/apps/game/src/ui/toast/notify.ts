import { Toast } from "@base-ui/react/toast";
import type { Tone } from "../tone";

/**
 * Um único trilho de avisos para o app inteiro (GDD 18.2 e 22). O gerenciador
 * é global para que o motor de jogo, os sons e as telas possam avisar sem
 * depender de onde estão na árvore.
 */
export const toastManager = Toast.createToastManager();

export interface NoticeData {
  eyebrow?: string;
}

export interface NoticeOptions {
  tone?: Tone;
  /** Sobrelinha em caixa alta: "Deu certo", "Título conquistado". */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Milissegundos na tela. Padrão: 5200 (GDD 18.2). Zero: fica até o jogador fechar. */
  timeout?: number;
  /** Mesmo id atualiza o aviso existente em vez de empilhar outro. */
  id?: string;
  /** Um botão de ação no aviso ("Atualizar"). Tocar nele também fecha o aviso. */
  action?: { label: string; onClick(): void };
  /** `high` anuncia na hora para leitor de tela; o padrão é educado. */
  priority?: "low" | "high";
}

export const DEFAULT_NOTICE_MS = 5200;

export function notify(options: NoticeOptions): string {
  return toastManager.add<NoticeData>({
    id: options.id,
    title: options.title,
    description: options.description,
    type: options.tone ?? "neutral",
    timeout: options.timeout ?? DEFAULT_NOTICE_MS,
    priority: options.priority ?? "low",
    data: { eyebrow: options.eyebrow },
    ...(options.action ? { actionProps: { children: options.action.label, onClick: options.action.onClick } } : {}),
  });
}

/** Lê a sobrelinha guardada no aviso sem confiar no formato. */
export function readEyebrow(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const value = (data as NoticeData).eyebrow;
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
