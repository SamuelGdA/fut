import type { Locale } from "@craque/content";

const pt = {
  selected: "Sua escolha", shot: "GOL DECISIVO!", shootout: "COBRANÇA CONVERTIDA", pass: "PASSE DE CRAQUE!",
  save: "DEFESA DECISIVA!", tackle: "NO TEMPO CERTO", hold: "DECISÃO CERTEIRA",
  holdWin: "VITÓRIA SEGURADA", holdDraw: "EMPATE SEGURADO", holdAdvance: "VAGA GARANTIDA", holdTitle: "TAÇA GARANTIDA", holdShort: "NÃO FOI O SUFICIENTE",
  missedShot: "POR POUCO!", missedPass: "PASSE INTERCEPTADO", missedDefence: "O ADVERSÁRIO LEVOU A MELHOR", missedHold: "JOGADA ADVERSÁRIA",
};
type Copy = { [K in keyof typeof pt]: string };
const en: Copy = {
  selected: "Your choice", shot: "DECISIVE GOAL!", shootout: "PENALTY CONVERTED", pass: "BRILLIANT PASS!",
  save: "DECISIVE SAVE!", tackle: "PERFECTLY TIMED", hold: "THE RIGHT CALL",
  holdWin: "WIN SEEN OUT", holdDraw: "DRAW HELD", holdAdvance: "PLACE SECURED", holdTitle: "TROPHY SECURED", holdShort: "NOT ENOUGH",
  missedShot: "SO CLOSE!", missedPass: "PASS INTERCEPTED", missedDefence: "THE OPPONENT CAME OUT ON TOP", missedHold: "OPPOSITION MOVE",
};
const es: Copy = {
  selected: "Tu elección", shot: "¡GOL DECISIVO!", shootout: "PENALTI CONVERTIDO", pass: "¡PASE DE CRACK!",
  save: "¡PARADA DECISIVA!", tackle: "EN EL MOMENTO JUSTO", hold: "DECISIÓN ACERTADA",
  holdWin: "VICTORIA ASEGURADA", holdDraw: "EMPATE AGUANTADO", holdAdvance: "PASE ASEGURADO", holdTitle: "COPA ASEGURADA", holdShort: "NO ALCANZÓ",
  missedShot: "¡POR POCO!", missedPass: "PASE INTERCEPTADO", missedDefence: "EL RIVAL SE IMPUSO", missedHold: "JUGADA RIVAL",
};
export const DECISION_FEEDBACK = { pt, en, es };
export function decisionFeedback(locale: Locale) { return DECISION_FEEDBACK[locale]; }
