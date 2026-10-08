import type { Career } from "@craque/engine";
import { Dumbbell, Handshake } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import type { PlaySession } from "../../features/career/play";
import { type ResultView, useResultView } from "../../features/career/resultView";
import { Crest } from "../../ui/Media";
import { Chip } from "../../ui/Signals";

/** Quanto tempo a mensagem fica na tela: um pouco mais para quem tem texto longo. */
function durationOf(view: ResultView): number {
  return Math.min(7000, 3400 + (view.body?.length ?? 0) * 22);
}

const SPRING = { type: "spring", stiffness: 420, damping: 24 } as const;

/**
 * A mensagem do resultado da escolha (D45): um cartão que salta no alto da
 * tela logo depois de confirmar, com o desenho do resultado (o certo se
 * desenhando, o errado tremendo, o escudo do clube novo entrando, o haltere do
 * treino), a frase e os efeitos caindo um a um. Some sozinha (no PC, para
 * enquanto o ponteiro está em cima) ou assim que o jogador segue jogando:
 * qualquer toque ou tecla, em qualquer lugar. Não bloqueia nada: no celular o
 * toque atravessa o cartão e chega à opção de baixo. O leitor de tela ouve o
 * lance na região de aviso da carreira, então o cartão fica fora da árvore de
 * acessibilidade.
 */
export function ResultMessage({ career, play }: { career: Career | null; play: PlaySession | null }) {
  const view = useResultView(career, play);
  return <ResultLayer view={view} />;
}

/** A camada da mensagem: mostra cada resultado novo uma vez e o tira de cena. */
export function ResultLayer({ view }: { view: ResultView | null }) {
  const [closed, setClosed] = useState<number | null>(null);
  const visible = view !== null && closed !== view.id;
  return (
    <div className="result-layer" aria-hidden="true">
      <AnimatePresence>{visible ? <ResultCard key={view.id} view={view} onDone={() => setClosed(view.id)} /> : null}</AnimatePresence>
    </div>
  );
}

function ResultCard({ view, onDone }: { view: ResultView; onDone(): void }) {
  const reduced = useReducedMotion() === true;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(durationOf(view));

  // O relógio da mensagem: para com o ponteiro em cima e continua de onde parou.
  useEffect(() => {
    if (paused) return;
    const started = performance.now();
    const timer = window.setTimeout(onDone, Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - started;
    };
  }, [paused, onDone]);

  // Seguiu jogando (tocou, clicou ou apertou uma tecla em qualquer lugar): a mensagem sai.
  useEffect(() => {
    const leave = () => onDone();
    window.addEventListener("pointerdown", leave, true);
    window.addEventListener("keydown", leave, true);
    return () => {
      window.removeEventListener("pointerdown", leave, true);
      window.removeEventListener("keydown", leave, true);
    };
  }, [onDone]);

  const shake = view.mark === "failure" && !reduced;
  return (
    <m.div
      className="result-msg club-scope"
      data-tone={view.tone}
      data-mark={view.mark}
      data-paused={paused || undefined}
      style={{ "--result-ms": `${durationOf(view)}ms` } as CSSProperties}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.9 }}
      animate={shake ? { opacity: 1, y: 0, scale: 1, x: [0, -7, 7, -5, 5, -2, 0] } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.18 } }}
      transition={shake ? { ...SPRING, x: { delay: 0.25, duration: 0.45 } } : SPRING}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
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
      {reduced ? null : <span className="result-clock" />}
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
