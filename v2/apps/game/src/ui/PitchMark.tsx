interface PitchMarkProps {
  className?: string;
  /** Cor do círculo central. Padrão: dourado. */
  accent?: string;
}

/** A marca do CRAQUE: um campo visto de cima, com o círculo central em ouro. */
export function PitchMark({ className, accent = "var(--glory)" }: PitchMarkProps) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden="true" focusable="false">
      <rect x="2" y="1.5" width="20" height="29" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="16" r="4.2" fill="none" stroke={accent} strokeWidth="2.2" />
      <rect x="8" y="1.5" width="8" height="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8" y="26.5" width="8" height="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
