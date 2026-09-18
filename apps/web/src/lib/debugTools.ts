/**
 * Whether the developer mutators are live.
 *
 * They hand out overall, trophies, talent tier and transfers for free, so a
 * shipped build must not honour them. Gating only the panel was not enough:
 * the store actions stayed in the bundle and could still be called directly,
 * so the flag is checked inside every mutator as well as at the panel.
 *
 * `NEXT_PUBLIC_CRAQUE_DEBUG=1` opts a production build back in deliberately.
 */
export const DEBUG_TOOLS_ENABLED =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_CRAQUE_DEBUG === "1";
