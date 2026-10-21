import { getClub, getCountry } from "@craque/world";
import type { Career } from "@craque/engine";
import type { CSSProperties } from "react";

export function matchTheme(career: Career): CSSProperties {
  const match = career.decision?.match;
  if (!match) return {};
  const europe = !match.national && match.competition.includes("UEFA");
  const america = !match.national && match.competition.includes("CONMEBOL");
  const nation = getCountry(career.nationality);
  const hue = match.national ? nation?.kit.base ?? "#197755" : getClub(match.team)?.color ?? "#135e65";
  const accent = match.national ? match.competition === "worldcup" ? "#efcf87" : "#dbe5ef" : europe ? "#b8cdff" : america ? "#e8c274" : "#d3f5e8";
  return { "--match-accent": accent, "--match-glow": europe ? "#2d58be" : america ? "#a36d26" : hue, "--match-bg-gradient": europe ? "radial-gradient(ellipse at 55% 0%, #182c66, #080f26 70%)" : america ? "radial-gradient(ellipse at 70% 0%, #3a2b19, #111317 70%)" : `radial-gradient(ellipse at 60% 0%, color-mix(in srgb, ${hue} 38%, #101827), #0b1421 70%)` } as CSSProperties;
}
