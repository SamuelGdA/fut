import type { ReactNode } from "react";

interface LabSectionProps {
  id: string;
  index: number;
  title: string;
  children: ReactNode;
}

/** Seção numerada do laboratório, com título de placar e régua. */
export function LabSection({ id, index, title, children }: LabSectionProps) {
  const headingId = `${id}-titulo`;
  return (
    <section id={id} aria-labelledby={headingId} className="lab-anchor">
      <div className="mb-5 flex items-end gap-3">
        <span className="display numeric text-2xl font-bold text-faint">{String(index).padStart(2, "0")}</span>
        <h2 id={headingId} tabIndex={-1} className="display text-4xl font-extrabold uppercase outline-none">
          {title}
        </h2>
        <span aria-hidden="true" className="mb-2 h-px flex-1 bg-rule" />
      </div>
      {children}
    </section>
  );
}
