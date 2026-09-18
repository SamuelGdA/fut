import type { ReactNode } from "react";

/**
 * The shell every error page in the game shares.
 *
 * Football has its own vocabulary for things going wrong — a ball out of play,
 * a red card, a player down, a pitch being relaid — and each status code maps
 * onto one of them cleanly. That is the whole idea: the page tells you what
 * happened in the language of the thing you came here for, instead of showing
 * you a stack trace in a sans-serif.
 *
 * Deliberately server-renderable and dependency-free. `error.tsx` needs
 * interactivity and marks itself a client component; the rest are static, and
 * `global-error.tsx` renders when even the providers are gone, so nothing here
 * may reach for the i18n context or the store.
 */

export type ErrorTone = "danger" | "gold" | "muted";

const TONE: Record<ErrorTone, { text: string; glow: string; rule: string }> = {
  danger: { text: "text-danger", glow: "rgba(239,68,68,0.16)", rule: "bg-danger/40" },
  gold: { text: "text-gold", glow: "rgba(226,180,66,0.16)", rule: "bg-gold/40" },
  muted: { text: "text-muted", glow: "rgba(148,163,184,0.14)", rule: "bg-line" },
};

export function ErrorPage({
  code,
  eyebrow,
  title,
  description,
  tone = "danger",
  art,
  children,
}: {
  /** The HTTP status, printed as the scoreline. */
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: ErrorTone;
  /** A small piece of pitch iconography sitting above the code. */
  art?: ReactNode;
  /** The way out. */
  children?: ReactNode;
}) {
  const palette = TONE[tone];

  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-10">
      {/* Floodlight wash and pitch stripes, the same two textures the rest of
          the game uses, so an error still feels like part of the stadium. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(60% 55% at 50% 18%, ${palette.glow} 0%, transparent 70%)` }}
      />
      <div aria-hidden className="stripes pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative flex w-full max-w-md flex-col items-center text-center">
        {art && <div className={`mb-5 ${palette.text}`}>{art}</div>}

        <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${palette.text}`}>
          {eyebrow}
        </p>

        <p
          className={`mt-3 font-display text-[86px] font-black leading-none tracking-[-0.04em] tabular-nums ${palette.text}`}
        >
          {code}
        </p>

        <span aria-hidden className={`mt-5 block h-px w-16 ${palette.rule}`} />

        <h1 className="mt-5 font-display text-2xl font-black tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>

        {children && <div className="mt-7 flex flex-wrap justify-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

/** The primary way out, styled like the game's own confirm buttons. */
export function ErrorAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full bg-pitch px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
    >
      {children}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Pitch iconography. Line art at a single weight so the four pages read as a
// set rather than as four separate drawings.
// ---------------------------------------------------------------------------

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** A ball past the touchline. */
export function BallOutIcon() {
  return (
    <svg viewBox="0 0 64 48" className="h-14 w-auto" aria-hidden>
      <path d="M4 44h56" {...STROKE} strokeDasharray="4 5" opacity={0.5} />
      <circle cx="46" cy="20" r="11" {...STROKE} />
      <path d="M46 12.5 51 16l-2 6h-6l-2-6z" {...STROKE} />
      <path d="M46 9v3.5M55.5 17.5 51 16M36.5 17.5 41 16M40.5 28.5 43 22M51.5 28.5 49 22" {...STROKE} />
      <path d="M8 33c6 3 12 4.5 18 4.5" {...STROKE} opacity={0.55} />
      <path d="M6 27c5 2.5 10 4 15 4" {...STROKE} opacity={0.3} />
    </svg>
  );
}

/** A red card held up. */
export function RedCardIcon() {
  return (
    <svg viewBox="0 0 64 48" className="h-14 w-auto" aria-hidden>
      <rect x="24" y="6" width="20" height="28" rx="2.5" {...STROKE} transform="rotate(9 34 20)" />
      <path d="M20 40c3-2.5 6.5-4 10-4" {...STROKE} opacity={0.5} />
      <path d="M14 44c5-4 11-6 17-6" {...STROKE} opacity={0.3} />
    </svg>
  );
}

/** A player down, and the stretcher on its way. */
export function InjuryIcon() {
  return (
    <svg viewBox="0 0 64 48" className="h-14 w-auto" aria-hidden>
      <path d="M6 40h52" {...STROKE} strokeDasharray="4 5" opacity={0.5} />
      <rect x="16" y="27" width="32" height="7" rx="3.5" {...STROKE} />
      <path d="M12 30.5h4M48 30.5h4" {...STROKE} />
      <circle cx="24" cy="19" r="5" {...STROKE} />
      <path d="M29 22c4 1.5 8 3 12 5" {...STROKE} />
      <path d="M38 11h8M42 7v8" {...STROKE} />
    </svg>
  );
}

/** The pitch being relaid. */
export function GroundworkIcon() {
  return (
    <svg viewBox="0 0 64 48" className="h-14 w-auto" aria-hidden>
      <rect x="8" y="14" width="48" height="26" rx="2" {...STROKE} />
      <path d="M32 14v26" {...STROKE} opacity={0.55} />
      <circle cx="32" cy="27" r="5" {...STROKE} opacity={0.55} />
      <path d="M8 21h6v12H8M56 21h-6v12h6" {...STROKE} opacity={0.55} />
      <path d="M38 12 47 3l6 6-9 9z" {...STROKE} />
      <path d="M41 9l6 6" {...STROKE} opacity={0.5} />
    </svg>
  );
}
