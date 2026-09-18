import { notFound } from "next/navigation";
import { DEBUG_TOOLS_ENABLED } from "@/lib/debugTools";

/**
 * Everything under /dev is internal QA tooling — the crest gallery, the card
 * contact sheet, the timeline stress page. They carry no secrets, but they are
 * not part of the game and should not be reachable on a public build, so the
 * whole branch 404s unless the debug flag is on.
 *
 * Gating here rather than page by page means a new dev page is covered the
 * moment it is added, without anyone having to remember.
 */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (!DEBUG_TOOLS_ENABLED) notFound();
  return <>{children}</>;
}
