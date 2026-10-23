import type { Career } from "@craque/engine";
import { AnimatePresence, m } from "motion/react";
import { broadcastIdentity, broadcastStyle } from "../../features/career/broadcast";
import { useReducedMotion } from "../../lib/useReducedMotion";

/** O estádio em volta das colunas no PC (D83): o mesmo pacote do card, em escala maior. */
export function MatchAtmosphere({ career }: { career: Career }) {
  const reduced = useReducedMotion();
  const match = career.decision?.match;
  const broadcast = match ? broadcastIdentity(match) : null;
  // Uma base escura fica por baixo enquanto houver partida: na troca de competição, os estádios se cruzam sem passar pela página clara.
  return <><AnimatePresence>{match ? <m.div key="base" className="match-atmosphere-base" aria-hidden="true" initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.65 }} /> : null}</AnimatePresence><AnimatePresence>{match && broadcast ? <m.div key={`${career.world.year}:${match.competition}`} className="match-atmosphere bc-stage" data-broadcast={broadcast.id} data-motif={broadcast.motif} aria-hidden="true" style={broadcastStyle(broadcast)} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.65 }} /> : null}</AnimatePresence></>;
}
