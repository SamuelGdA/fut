import type { Widen } from "../i18n";

/**
 * As manchetes pequenas de cada temporada (GDD 21.1), a coluna "Também nesta
 * temporada" do jornal. Uma linha cada, em tom de nota de jornal. Nome de
 * clube e competição sempre depois de dois-pontos.
 */
export const headlinesPt = {
  title: "Campeão: {competition}",
  award: "Prêmio: {award}",
  topScorer: "Artilheiro: {competition}, {goals} gols",
  bestPlayer: "Craque da competição: {competition}",
  ballonPodium: "Bola de Ouro: {rank} lugar",
  record: "Recorde superado: {record}",
  firstCap: "Estreia na seleção aos {age}",
  promoted: "Acesso: {club}",
  relegated: "Rebaixamento: {club}",
  explosion: "Salto de rendimento: OVR {ovr}",
  transfer: "Contratado: {club}",
  transferTraitor: "Contratado pelo rival: {club}",
  loan: "Emprestado: {club}",
  released: "Dispensado: {club}",
  shirt: "Camisa nova: {number}",
  injury: "Lesão: {injury}",
} as const;

export type HeadlinesMessages = Widen<typeof headlinesPt>;
