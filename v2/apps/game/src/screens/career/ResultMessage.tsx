import type { Career } from "@craque/engine";
import { Dumbbell, Handshake } from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import type { PlaySession } from "../../features/career/play";
import { type ResultView, useResultView } from "../../features/career/resultView";
import { Crest } from "../../ui/Media";
import { Chip } from "../../ui/Signals";

const SPRING = { type: "spring", stiffness: 420, damping: 24 } as const;

/**
 * O resultado acompanha o último lance dentro do layout (D47). Fica até a
 * próxima escolha: desaparecer no pointerdown deslocava a opção antes do
 * click no celular. O leitor de tela já ouve o lance na região de aviso.
 */
export function ResultMessage({ career, play }: { career: Career | null; play: PlaySession | null }) {
  const view = useResultView(career, play);
  return <ResultLayer view={view} />;
}

/** Resultado mais recente, sem cobrir ou deslocar a decisão durante a leitura. */
export function ResultLayer({ view }: { view: ResultView | null }) {
  if (view === null) return null;
  return (
    <div className="result-layer" aria-hidden="true">
      <ResultCard key={view.id} view={view} />
    </div>
  );
}

function ResultCard({ view }: { view: ResultView }) {
  const reduced = useReducedMotion() === true;
  const shake = view.mark === "failure" && !reduced;
  return (
    <m.div
      className="result-msg club-scope"
      data-tone={view.tone}
      data-mark={view.mark}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.9 }}
      animate={shake ? { opacity: 1, y: 0, scale: 1, x: [0, -7, 7, -5, 5, -2, 0] } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.18 } }}
      transition={shake ? { ...SPRING, x: { delay: 0.25, duration: 0.45 } } : SPRING}
    >
      <Badge view={view} reduced={reduced} />
      <div className="result-text">
        <m.p className="result-eyebrow" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          {view.eyebrow}
        </m.p>
        <m.p className="result-title" initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {view.title}
        </m.p>
        {view.body ? (
          <m.p className="result-body" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {view.body}
          </m.p>
        ) : null}
        {view.chips.length > 0 ? (
          <p className="result-chips">
            {view.chips.map((chip, index) => (
              <m.span
                key={chip.key}
                className="inline-flex"
                initial={reduced ? false : { opacity: 0, y: 8, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...SPRING, delay: 0.4 + index * 0.08 }}
              >
                <Chip tone={chip.tone} glyph={chip.tone === "good" || chip.tone === "bad"} size="sm">
                  {chip.text}
                </Chip>
              </m.span>
            ))}
          </p>
        ) : null}
      </div>
    </m.div>
  );
}

/** O desenho do resultado, dentro do círculo. */
function Badge({ view, reduced }: { view: ResultView; reduced: boolean }) {
  const pop = reduced ? false : { scale: 0, rotate: -25 };
  const draw = (delay: number) => ({
    initial: reduced ? false : ({ pathLength: 0 } as const),
    animate: { pathLength: 1 },
    transition: { delay, duration: 0.32, ease: "easeOut" as const },
  });
  return (
    <m.span className="result-badge" initial={pop} animate={{ scale: 1, rotate: 0 }} transition={{ ...SPRING, delay: 0.05 }}>
      {view.mark === "success" ? (
        <svg viewBox="0 0 24 24" className="result-icon">
          <m.path d="M5.5 12.5l4.2 4.2L18.5 7.8" {...draw(0.22)} />
        </svg>
      ) : null}
      {view.mark === "failure" ? (
        <svg viewBox="0 0 24 24" className="result-icon">
          <m.path d="M7 7l10 10" {...draw(0.2)} />
          <m.path d="M17 7L7 17" {...draw(0.34)} />
        </svg>
      ) : null}
      {view.mark === "done" ? (
        <m.span
          className="result-glyph"
          initial={reduced ? false : { scale: 0.6 }}
          animate={reduced ? { scale: 1 } : { scale: [0.6, 1.15, 1] }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Handshake size={24} aria-hidden="true" />
        </m.span>
      ) : null}
      {view.mark === "focus" ? (
        <m.span
          className="result-glyph"
          animate={reduced ? undefined : { y: [0, -5, 0, -5, 0], rotate: [0, -8, 0, 8, 0] }}
          transition={{ delay: 0.25, duration: 0.9 }}
        >
          <Dumbbell size={26} aria-hidden="true" />
        </m.span>
      ) : null}
      {(view.mark === "move" || view.mark === "stay") && view.club ? (
        <m.span
          className="result-glyph"
          initial={reduced ? false : view.mark === "move" ? { x: 26, opacity: 0, rotate: 18 } : { scale: 0.5 }}
          animate={{ x: 0, opacity: 1, rotate: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 0.18 }}
        >
          <Crest club={view.club} size={36} decorative />
        </m.span>
      ) : null}
      {/* As faíscas do resultado bom: oito pontos que saem do círculo. */}
      {!reduced && (view.mark === "success" || view.mark === "move" || view.mark === "focus") ? (
        <span className="result-sparks">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} style={{ "--a": `${index * 45}deg` } as CSSProperties} />
          ))}
        </span>
      ) : null}
    </m.span>
  );
}
