import type { Career } from "@craque/engine";
import { AnimatePresence, m } from "motion/react";
import { matchTheme } from "../../features/career/matchTheme";
import { useReducedMotion } from "../../lib/useReducedMotion";

export function MatchAtmosphere({ career }: { career: Career }) {
  const reduced = useReducedMotion();
  const match = career.decision?.match;
  return <AnimatePresence>{match ? <m.div key={`${career.world.year}:${match.competition}`} className="match-atmosphere" data-stars={!match.national && match.competition.includes("UEFA") || undefined} aria-hidden="true" style={matchTheme(career)} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.65 }} /> : null}</AnimatePresence>;
}
