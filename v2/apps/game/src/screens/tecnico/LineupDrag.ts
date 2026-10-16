import { useEffect, useRef, useState, type PointerEvent, type DragEvent } from "react";

/** Arrasto por ponteiro nos dois dispositivos; só emite setTactics. */
export function useLineupDrag(lineup: readonly string[], apply: (lineup: string[]) => void, allowed: boolean, available: ReadonlySet<string>) {
  const pointer = useRef<{ id: string; x: number; y: number; latestX: number; latestY: number; moved: boolean; panel: HTMLElement | null } | null>(null);
  const moved = useRef(false);
  const frame = useRef<number | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const drop = (id: string, index: number) => {
    if (!allowed || !available.has(id) || index < 0 || index >= lineup.length) return;
    const source = lineup.indexOf(id);
    if (source === index) return;
    const next = [...lineup];
    if (source >= 0) next[source] = next[index] ?? "";
    next[index] = id;
    apply(next);
  };
  const dropOn = (id: string, destination: string) => {
    if (destination.startsWith("slot:")) { drop(id, Number(destination.slice(5))); return; }
    const reserve = destination.slice(6);
    const index = lineup.indexOf(id);
    if (index >= 0 && !lineup.includes(reserve) && available.has(reserve)) drop(reserve, index);
  };
  const slotAt = (x: number, y: number) => {
    const node = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-lineup-drop]");
    return node?.dataset["lineupDrop"] ?? null;
  };
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);
  const clear = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null; pointer.current = null; setDrag(null); setTarget(null);
  };
  // O banco pode estar abaixo do campo: segurar o jogador junto à borda revela as vagas.
  const scrollDuringDrag = () => {
    const current = pointer.current;
    if (!current?.moved) { frame.current = null; return; }
    const panel = current.panel;
    if (panel) {
      const box = panel.getBoundingClientRect();
      const edge = 44;
      // Rolagem suave para não atravessar uma linha do banco entre mover e soltar.
      const speed = current.latestY < box.top + edge ? -Math.min(6, (box.top + edge - current.latestY) / 3)
        : current.latestY > box.bottom - edge ? Math.min(6, (current.latestY - box.bottom + edge) / 3) : 0;
      if (speed !== 0) {
        panel.scrollTop += speed;
        setTarget(slotAt(current.latestX, current.latestY));
      }
    }
    frame.current = requestAnimationFrame(scrollDuringDrag);
  };
  const grip = (id: string) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (!allowed || !available.has(id) || event.button !== 0) return;
      moved.current = false;
      const handle = (event.target as HTMLElement).closest<HTMLElement>("button") ?? event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      pointer.current = { id, x: event.clientX, y: event.clientY, latestX: event.clientX, latestY: event.clientY, moved: false, panel: event.currentTarget.closest<HTMLElement>(".scroll-panel") };
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const current = pointer.current;
      if (!current) return;
      current.moved ||= Math.hypot(event.clientX - current.x, event.clientY - current.y) >= 8;
      if (!current.moved) return;
      moved.current = true;
      event.preventDefault();
      current.latestX = event.clientX; current.latestY = event.clientY;
      setDrag({ id, x: event.clientX, y: event.clientY });
      setTarget(slotAt(event.clientX, event.clientY));
      if (frame.current === null) frame.current = requestAnimationFrame(scrollDuringDrag);
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const current = pointer.current;
      const index = slotAt(event.clientX, event.clientY);
      if (current?.moved && index !== null) dropOn(current.id, index);
      clear();
    },
    onPointerCancel: clear,
    onLostPointerCapture: clear,
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => { if (moved.current) { event.preventDefault(); event.stopPropagation(); moved.current = false; } },
  });
  const source = (id: string) => {
    const handlers = grip(id);
    return {
      draggable: allowed && available.has(id),
      // A rolagem automática nativa deslocava a vaga entre mover e soltar.
      // O mesmo gesto controlado do toque mantém a borda e o destino estáveis.
      onDragStart: (event: DragEvent<HTMLElement>) => event.preventDefault(),
      onPointerDown: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === "mouse" && !(event.target as HTMLElement).closest(".tec-pitch-inspect,.tec-inspect")) handlers.onPointerDown(event); },
      onPointerMove: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === "mouse") handlers.onPointerMove(event); },
      onPointerUp: (event: PointerEvent<HTMLElement>) => { if (event.pointerType === "mouse") handlers.onPointerUp(event); },
      onPointerCancel: clear,
      onLostPointerCapture: clear,
      onClickCapture: handlers.onClickCapture,
    };
  };
  const destination = (index: number | string) => {
    const key = typeof index === "number" ? `slot:${index}` : `bench:${index}`;
    return {
    "data-lineup-slot": typeof index === "number" ? index : undefined,
    "data-lineup-drop": key,
    "data-drop-target": target === key || undefined,
    onDragOver: (event: DragEvent<HTMLElement>) => { if (allowed) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setTarget(key); } },
    onDragLeave: () => setTarget(null),
    onDrop: (event: DragEvent<HTMLElement>) => { event.preventDefault(); dropOn(event.dataTransfer.getData("application/x-futeiros-player"), key); clear(); },
  }; };
  return { drag, grip, source, destination };
}
