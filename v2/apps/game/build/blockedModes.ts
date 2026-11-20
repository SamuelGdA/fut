import type { Plugin } from "vite";

/**
 * D124: com `VITE_MODOS_BLOQUEADOS=tecnico` (o site no ar), nenhuma tela do
 * Técnico pode chegar ao navegador. O `ScreenOutlet` já troca os carregadores
 * pela tela "Em breve"; este plugin confere o resultado e derruba o build se
 * algum pedaço ainda trouxer `screens/tecnico/`. É o que garante que o modo
 * não dá para ser destravado mexendo no navegador.
 */
export function blockedModes(): Plugin {
  let blocked = false;
  return {
    name: "futeiro-blocked-modes",
    apply: "build",
    configResolved(config) {
      blocked = config.env["VITE_MODOS_BLOQUEADOS"] === "tecnico";
    },
    generateBundle(_options, bundle) {
      if (!blocked) return;
      const leaks = Object.values(bundle)
        .filter((item) => item.type === "chunk")
        .filter((chunk) => Object.keys(chunk.modules).some((id) => id.replaceAll("\\", "/").includes("/screens/tecnico/")))
        .map((chunk) => chunk.fileName);
      if (leaks.length > 0) throw new Error(`Técnico bloqueado (D124), mas as telas dele entraram no build: ${leaks.join(", ")}`);
    },
  };
}
