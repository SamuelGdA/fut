import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useId, useState } from "react";
import { cn } from "../../ui/cn";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id" | "prefix"> {
  label: string;
  value: string;
  onValueChange(value: string): void;
  hint?: string;
  error?: string;
  /** Algo antes do texto, como o "@". */
  prefix?: ReactNode;
  /** Mostra o botão de ver a senha (com os rótulos dados). */
  reveal?: { show: string; hide: string };
  /** Linha de estado embaixo (disponibilidade do @), anunciada com educação. */
  status?: { text: string; tone: "good" | "bad" | "muted" } | null;
}

/**
 * Campo das telas de conta (D112): rótulo de placar, dica e erro ligados ao
 * campo, `autocomplete` certo para o gerenciador de senhas e, na senha, o
 * botão de mostrar.
 */
export function AuthField({ label, value, onValueChange, hint, error, prefix, reveal, status, type = "text", className, ...rest }: AuthFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const noteId = `${id}-nota`;
  const statusId = `${id}-estado`;
  const describedBy = [error ?? hint ? noteId : null, status ? statusId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-1.5 block text-fg">
        {label}
      </label>
      <div className="auth-input" data-invalid={error ? true : undefined}>
        {prefix ? <span className="auth-input-prefix" aria-hidden="true">{prefix}</span> : null}
        <input
          id={id}
          className="auth-input-field"
          type={reveal && visible ? "text" : type}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          spellCheck={false}
          {...rest}
        />
        {reveal ? (
          <button
            type="button"
            className="auth-input-reveal"
            aria-label={visible ? reveal.hide : reveal.show}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {error ?? hint ? (
        <p id={noteId} className={cn("mt-1.5 text-xs", error ? "text-bad" : "text-faint")}>
          {error ?? hint}
        </p>
      ) : null}
      {status ? (
        <p id={statusId} role="status" className={cn("mt-1 text-xs font-semibold", status.tone === "good" ? "text-good" : status.tone === "bad" ? "text-bad" : "text-faint")}>
          {status.text}
        </p>
      ) : null}
    </div>
  );
}

/** O "G" do Google nas cores oficiais, para o botão de entrar com Google. */
export function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
