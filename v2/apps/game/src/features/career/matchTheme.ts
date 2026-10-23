import type { Career } from "@craque/engine";
import type { CSSProperties } from "react";
import { broadcastIdentity, broadcastStyle } from "./broadcast";

/** As variáveis da transmissão da decisão de partida em curso (D83); vazio fora dela. */
export function matchTheme(career: Career): CSSProperties {
  const match = career.decision?.match;
  return match ? broadcastStyle(broadcastIdentity(match)) : {};
}
