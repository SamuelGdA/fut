import type { CountryCode } from "@craque/world";

/**
 * Os pacotes de transmissão das decisões de partida (D83): a linguagem gráfica
 * que lembra cada competição, sem copiar marca nenhuma. As cores são as da
 * competição; o desenho só evoca o formato (estrelas na noite europeia, raios
 * de sol na Libertadores, chave de mata-mata nas copas).
 */

/** Padrão do fundo, sempre sutil. Os nomes são os seletores de `broadcast.css`. */
export const BROADCAST_MOTIFS = [
  "stars", "arcs", "hatch", "rays", "papelitos", "globe", "mosaic", "aguayo", "kente", "waves", "lattice",
  "shards", "ribbons", "argyle", "blueprint", "deco", "stands", "pennants", "bracket", "peaks", "sweep", "stripes", "pinstripes",
] as const;
export type BroadcastMotif = (typeof BROADCAST_MOTIFS)[number];

/** O selo ao lado do nome da competição no cabeçalho. */
export const BROADCAST_EMBLEMS = [
  "starball", "arcs", "diamond", "laurel", "compass", "globe", "cup", "crown", "plate", "scudetto",
  "sunstripes", "hexagon", "starsphere", "sun", "star", "pennant", "starshield", "shield", "mosaic",
] as const;
export type BroadcastEmblem = (typeof BROADCAST_EMBLEMS)[number];

export interface BroadcastPackage {
  /** O fundo mais escuro do palco. */
  readonly deep: string;
  /** O tom do alto do palco, sob o cabeçalho. */
  readonly mid: string;
  /** O refletor principal (alto, à esquerda). */
  readonly light: string;
  /** O segundo refletor (alto, à direita). */
  readonly light2: string;
  /** A luz no nível do gramado: grama, sinalizador, ouro. */
  readonly floor: string;
  /** O acento de leitura: ao vivo, minuto, filetes e a opção sob o cursor. */
  readonly accent: string;
  /** O metal do troféu: prata, ouro, bronze. Bordas, selo e padrão. */
  readonly metal: string;
  /** O filete de assinatura no alto do cabeçalho. */
  readonly rule: readonly [string, string, string];
  /** Os pontos acesos do placar. */
  readonly led: string;
  readonly motif: BroadcastMotif;
  readonly emblem: BroadcastEmblem;
}

export interface NamedPackage extends BroadcastPackage {
  readonly id: string;
}

/** Continentais e mundiais de clubes, por id de competição. */
export const CLUB_TOURNAMENTS: Readonly<Record<string, NamedPackage>> = {
  // Noite de gala europeia: azul abissal, prata cromada, ciano estelar.
  "cont1:UEFA": { id: "ucl", deep: "#03071e", mid: "#0a194e", light: "#8fb0ff", light2: "#59d8ff", floor: "#1f4fd8", accent: "#c9d8ff", metal: "#e7edf7", rule: ["#7f8db0", "#ffffff", "#59d8ff"], led: "#dff1ff", motif: "stars", emblem: "starball" },
  // Laranja e preto, arcos que lembram a bola da Europa League.
  "cont2:UEFA": { id: "uel", deep: "#0b0a0c", mid: "#2a1508", light: "#ff7a1a", light2: "#ffb15c", floor: "#ff6900", accent: "#ffa060", metal: "#f3c9a3", rule: ["#ff6900", "#ffc48a", "#ff6900"], led: "#ff8a2b", motif: "arcs", emblem: "arcs" },
  // Verde elétrico sobre preto, linhas cortadas.
  "cont3:UEFA": { id: "uecl", deep: "#040907", mid: "#0b2414", light: "#2bf06a", light2: "#b9ffcf", floor: "#00be14", accent: "#6ef59a", metal: "#d3f8de", rule: ["#00be14", "#b9ffcf", "#00be14"], led: "#57ff86", motif: "hatch", emblem: "diamond" },
  "contsuper:UEFA": { id: "usuper", deep: "#041026", mid: "#0c2c63", light: "#a9d8ff", light2: "#ffffff", floor: "#2f7bff", accent: "#d3e6ff", metal: "#f4f8ff", rule: ["#9fb4d6", "#ffffff", "#9fb4d6"], led: "#dff1ff", motif: "stars", emblem: "cup" },
  // La Gloria Eterna: obsidiana, ouro derretido, âmbar e a fumaça dos sinalizadores.
  "cont1:CONMEBOL": { id: "libertadores", deep: "#0b0805", mid: "#24180a", light: "#ffb347", light2: "#ff6a2b", floor: "#ff4d1a", accent: "#ecc76f", metal: "#d4af37", rule: ["#8a5a1c", "#f6dc8c", "#d4af37"], led: "#ffb547", motif: "rays", emblem: "laurel" },
  // Azul profundo e celeste, papel picado da arquibancada.
  "cont2:CONMEBOL": { id: "sudamericana", deep: "#030b1b", mid: "#0a2552", light: "#4fbfff", light2: "#ffcf5a", floor: "#1f7bff", accent: "#8fd3ff", metal: "#e0c27a", rule: ["#0d3b84", "#4fbfff", "#e0c27a"], led: "#7fd0ff", motif: "papelitos", emblem: "compass" },
  "contsuper:CONMEBOL": { id: "recopa", deep: "#0f0507", mid: "#2e0c13", light: "#ffcf7a", light2: "#ff8a5c", floor: "#b3122e", accent: "#f0c97a", metal: "#d4af37", rule: ["#7a1020", "#f0c97a", "#7a1020"], led: "#ffc061", motif: "rays", emblem: "cup" },
  "cont1:CONCACAF": { id: "concacaf", deep: "#04070e", mid: "#0f1b33", light: "#36c3ff", light2: "#e9f3ff", floor: "#00a3e0", accent: "#86d6ff", metal: "#dfe6ee", rule: ["#00a3e0", "#ffffff", "#00a3e0"], led: "#7fd8ff", motif: "sweep", emblem: "diamond" },
  clubworldcup: { id: "clubworld", deep: "#070604", mid: "#1d170a", light: "#ffd98a", light2: "#fff3d1", floor: "#d9a521", accent: "#f2cf7a", metal: "#e9c46a", rule: ["#8a6a1c", "#f7e2a4", "#8a6a1c"], led: "#ffd36b", motif: "globe", emblem: "globe" },
  intercontinental: { id: "intercontinental", deep: "#040b18", mid: "#0e2547", light: "#9ccaff", light2: "#ffe2a1", floor: "#326295", accent: "#c4dcff", metal: "#e8c97a", rule: ["#326295", "#e8c97a", "#326295"], led: "#dff1ff", motif: "globe", emblem: "globe" },
};

/**
 * Torneios de seleções. `fusion` é quanto da cor da seleção entra no fundo:
 * o palco do torneio, tingido pela camisa de quem joga.
 */
export const NATION_TOURNAMENTS: Readonly<Record<string, NamedPackage & { readonly fusion: number }>> = {
  // O maior palco: ouro de troféu e luz monumental, na cor da seleção.
  worldcup: { id: "worldcup", deep: "#060503", mid: "#16110a", light: "#ffe2a1", light2: "#fff4d6", floor: "#e0a92a", accent: "#efcf87", metal: "#e9c46a", rule: ["#8a6a1c", "#f7e2a4", "#8a6a1c"], led: "#ffd36b", motif: "globe", emblem: "globe", fusion: 0.2 },
  // Festival europeu: geometria limpa, prata e um filete multicolorido.
  "nations:UEFA": { id: "euro", deep: "#040a1c", mid: "#0c1c44", light: "#e3ecff", light2: "#8fb0ff", floor: "#3a6bff", accent: "#dbe5ef", metal: "#e6ebf2", rule: ["#ff5a6e", "#ffc145", "#3d8bff"], led: "#e6f2ff", motif: "mosaic", emblem: "mosaic", fusion: 0.16 },
  // Calor latino numa noite índigo: tecido andino, luz âmbar e a prata do troféu.
  "nations:CONMEBOL": { id: "copaamerica", deep: "#07061a", mid: "#1b1240", light: "#ffb35c", light2: "#ff6f91", floor: "#ff7a3d", accent: "#dbe5ef", metal: "#e6ebf2", rule: ["#ffb703", "#e63946", "#2a9df4"], led: "#ffcf6b", motif: "aguayo", emblem: "sun", fusion: 0.16 },
  "nations:CONCACAF": { id: "goldcup", deep: "#070604", mid: "#17120a", light: "#ffd98a", light2: "#fff3d1", floor: "#d9a521", accent: "#f2cf7a", metal: "#e9c46a", rule: ["#8a6a1c", "#f7e2a4", "#8a6a1c"], led: "#ffd36b", motif: "sweep", emblem: "cup", fusion: 0.2 },
  "nations:CAF": { id: "afcon", deep: "#050803", mid: "#101c0b", light: "#ffd23f", light2: "#3fd06a", floor: "#e0a100", accent: "#f2cf5a", metal: "#e9c46a", rule: ["#009a44", "#ffd23f", "#e03c31"], led: "#ffd23f", motif: "kente", emblem: "star", fusion: 0.2 },
  "nations:AFC": { id: "asiancup", deep: "#030a14", mid: "#0b1f3a", light: "#8fd8ff", light2: "#ffcf7a", floor: "#00a3a3", accent: "#a9dcff", metal: "#e9c46a", rule: ["#00a3a3", "#e9c46a", "#8d1b3d"], led: "#8fd8ff", motif: "lattice", emblem: "cup", fusion: 0.2 },
  "nations:OFC": { id: "ofc", deep: "#021019", mid: "#06304a", light: "#7fe3ff", light2: "#e8fbff", floor: "#00a6d6", accent: "#9be7ff", metal: "#dfe6ee", rule: ["#00a6d6", "#ffffff", "#00a6d6"], led: "#9be7ff", motif: "waves", emblem: "cup", fusion: 0.18 },
};

/** O DNA do futebol de cada país: vale para as duas divisões da liga. */
export const LEAGUE_DNA: Readonly<Record<CountryCode, BroadcastPackage>> = {
  // Roxo real, ciano e magenta, facetas angulosas.
  ENG: { deep: "#0d0014", mid: "#2b0636", light: "#04f5ff", light2: "#e90052", floor: "#7a1fa2", accent: "#3cf6ff", metal: "#f4f0ff", rule: ["#04f5ff", "#e90052", "#00ff85"], led: "#00ff85", motif: "shards", emblem: "crown" },
  // Coral quente sobre grafite.
  ESP: { deep: "#121013", mid: "#2d1a1c", light: "#ff6a4d", light2: "#ffb37a", floor: "#ff4b44", accent: "#ff9a82", metal: "#f6dccd", rule: ["#ff4b44", "#ff9a82", "#ffd2a8"], led: "#ff7a59", motif: "ribbons", emblem: "sunstripes" },
  // Azul-safira, ouro e o tricolore; o scudetto no selo.
  ITA: { deep: "#020a1c", mid: "#0a2456", light: "#7fb0ff", light2: "#e8c872", floor: "#1f5fd6", accent: "#e8c872", metal: "#e8c872", rule: ["#009246", "#f4f5f0", "#ce2b37"], led: "#9cc2ff", motif: "argyle", emblem: "scudetto" },
  // Vermelho vivo, antracito e linhas técnicas; a salva de prata no selo.
  GER: { deep: "#0b0c0f", mid: "#26191c", light: "#ff3b3b", light2: "#f2f4f7", floor: "#d20515", accent: "#ff9a9a", metal: "#cdd3db", rule: ["#d20515", "#f2f4f7", "#5b616b"], led: "#ff3b30", motif: "blueprint", emblem: "plate" },
  // Azul de Paris, tricolor e leques art déco; o Hexágono no selo.
  FRA: { deep: "#040a1a", mid: "#102552", light: "#9fbaff", light2: "#ff7a7a", floor: "#2a4bd7", accent: "#b9ceff", metal: "#e9d8a6", rule: ["#2a4bd7", "#f5f5f5", "#e1000f"], led: "#e8eeff", motif: "deco", emblem: "hexagon" },
  // Gramado noturno, ouro canarinho e a arquibancada em retícula.
  BRA: { deep: "#02130a", mid: "#073c22", light: "#fff1b8", light2: "#2fd27a", floor: "#1fbf5f", accent: "#ffd84a", metal: "#ffd84a", rule: ["#009c3b", "#ffdf00", "#2f6fd6"], led: "#ffd84a", motif: "stands", emblem: "starsphere" },
  // Celeste, branco, o sol de Maio e os papelitos.
  ARG: { deep: "#03101e", mid: "#0b2c50", light: "#bfe3ff", light2: "#f6b40e", floor: "#74acdf", accent: "#95cdf5", metal: "#f6b40e", rule: ["#74acdf", "#ffffff", "#f6b40e"], led: "#f6c24a", motif: "papelitos", emblem: "sun" },
  // Celeste das nove listras e o sol.
  URU: { deep: "#03131f", mid: "#0a3550", light: "#a8e1ff", light2: "#fcd116", floor: "#5cbfeb", accent: "#8fd6f5", metal: "#fcd116", rule: ["#5cbfeb", "#ffffff", "#fcd116"], led: "#8fd6f5", motif: "stripes", emblem: "sun" },
  // La Roja, a estrela solitária e a cordilheira.
  CHI: { deep: "#10070a", mid: "#3a0f15", light: "#ff8f80", light2: "#8fb0ff", floor: "#d52b1e", accent: "#ffa194", metal: "#e9edf3", rule: ["#0039a6", "#ffffff", "#d52b1e"], led: "#ff5a4a", motif: "peaks", emblem: "star" },
  // Amarelo, azul e vermelho; ondas dos dois oceanos.
  COL: { deep: "#070a1a", mid: "#18205a", light: "#ffd23f", light2: "#ff5a5f", floor: "#003893", accent: "#ffd84a", metal: "#ffd84a", rule: ["#fcd116", "#003893", "#ce1126"], led: "#ffd84a", motif: "waves", emblem: "shield" },
  // Amarelo e azul sob os vulcões.
  ECU: { deep: "#070b17", mid: "#1a2252", light: "#ffe14d", light2: "#5aa0ff", floor: "#034ea2", accent: "#ffe066", metal: "#ffe066", rule: ["#ffdd00", "#034ea2", "#ed1c24"], led: "#ffe066", motif: "peaks", emblem: "shield" },
  // A albirroja listrada.
  PAR: { deep: "#0b0d1f", mid: "#2a0e1c", light: "#ff8f8f", light2: "#7fa6ff", floor: "#d52b1e", accent: "#ffa8a8", metal: "#f2f2f2", rule: ["#d52b1e", "#ffffff", "#0038a8"], led: "#ff5a4a", motif: "pinstripes", emblem: "star" },
  // Vermelho e branco, tecido andino.
  PER: { deep: "#12070a", mid: "#3b0c12", light: "#ffb0a8", light2: "#ffe0d6", floor: "#d91023", accent: "#ffa59c", metal: "#f2f2f2", rule: ["#d91023", "#ffffff", "#d91023"], led: "#ff5a4a", motif: "aguayo", emblem: "shield" },
  // Vermelho, amarelo e verde do aguayo.
  BOL: { deep: "#07120a", mid: "#14361f", light: "#ffe066", light2: "#ff6a5a", floor: "#007934", accent: "#ffd84a", metal: "#ffd84a", rule: ["#d52b1e", "#f9e300", "#007934"], led: "#ffd84a", motif: "aguayo", emblem: "star" },
  // Vinotinto e ouro, o arco de estrelas da bandeira.
  VEN: { deep: "#12040a", mid: "#3a0a1b", light: "#ffcf66", light2: "#ff7a8a", floor: "#8b1e3f", accent: "#f5c84a", metal: "#f5c84a", rule: ["#ffcc00", "#00247d", "#cf142b"], led: "#ffc947", motif: "arcs", emblem: "star" },
  // Verde, branco e vermelho, papel picado de festa.
  MEX: { deep: "#03130c", mid: "#0b3a24", light: "#ff7a7a", light2: "#ffffff", floor: "#006847", accent: "#7fe3a8", metal: "#e9edf3", rule: ["#006847", "#ffffff", "#ce1126"], led: "#5df59a", motif: "pennants", emblem: "pennant" },
  // Azul-marinho, branco e vermelho, linhas modernas.
  USA: { deep: "#050a18", mid: "#13254a", light: "#e6eeff", light2: "#ff6b7a", floor: "#0a3161", accent: "#a9c8ff", metal: "#e9edf3", rule: ["#0a3161", "#ffffff", "#b31942"], led: "#e8eeff", motif: "sweep", emblem: "starshield" },
};

/**
 * Copas nacionais com identidade própria. As outras herdam o DNA da liga do
 * país; toda copa troca o padrão pela chave do mata-mata e o selo pela taça.
 */
export const CUP_DNA: Readonly<Record<CountryCode, Partial<BroadcastPackage>>> = {
  // FA Cup: tradição, azul real e a prata da taça mais antiga.
  ENG: { deep: "#050b1f", mid: "#13244f", light: "#e9eefc", light2: "#ff6b6b", floor: "#1d2a5b", accent: "#d7e1ff", metal: "#e2e8f0", rule: ["#1d2a5b", "#ffffff", "#ce1124"], led: "#e8eeff" },
  // Copa del Rey: vermelho e ouro reais, a coroa no selo.
  ESP: { deep: "#14060a", mid: "#3d0d17", light: "#ffcf6b", light2: "#ff6a4d", floor: "#aa151b", accent: "#f2c66d", metal: "#f1bf00", rule: ["#aa151b", "#f1bf00", "#aa151b"], led: "#ffc94a", emblem: "crown" },
  // DFB-Pokal: preto, vermelho e ouro.
  GER: { deep: "#0b0b0b", mid: "#241a0a", light: "#ffce00", light2: "#ff3b3b", floor: "#dd0000", accent: "#ffd34d", metal: "#e8e8e8", rule: ["#3a3a3a", "#dd0000", "#ffce00"], led: "#ffce00" },
  // Copa do Brasil: o azul da noite de mata-mata, com verde e amarelo.
  BRA: { deep: "#031024", mid: "#0b2c5e", light: "#ffe680", light2: "#34d27a", floor: "#002776", accent: "#ffd84a", metal: "#ffd84a", rule: ["#002776", "#ffdf00", "#009c3b"], led: "#ffd84a" },
};

/** Sem identidade conhecida: um estádio à noite, neutro. Só por segurança. */
export const GENERIC: NamedPackage = { id: "generic", deep: "#06120c", mid: "#0f2e1d", light: "#e8f3ea", light2: "#9fe0b8", floor: "#1f8a4c", accent: "#bfe9cf", metal: "#e1e8e3", rule: ["#1f8a4c", "#e1e8e3", "#1f8a4c"], led: "#ff796f", motif: "stripes", emblem: "shield" };
