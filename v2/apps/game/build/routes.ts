import type { Plugin } from "vite";

/**
 * Endereços próprios (D112): `/login`, `/perfil`, `/termos` e `/privacidade`.
 * O build grava uma cópia do `index.html` em cada pasta, então qualquer
 * hospedagem estática abre esses endereços (e a volta do Google no `/login`)
 * sem regra de reescrita. Os mesmos caminhos de `SCREEN_PATHS` (um teste confere).
 */
export const ROUTE_PATHS = ["login", "perfil", "termos", "privacidade"] as const;

export function routeCopies(paths: readonly string[] = ROUTE_PATHS): Plugin {
  return {
    name: "futeiros-route-copies",
    enforce: "post",
    generateBundle(_options, bundle) {
      const index = bundle["index.html"];
      if (!index || index.type !== "asset") throw new Error("index.html não encontrado no build: as rotas próprias ficariam sem página.");
      for (const path of paths) this.emitFile({ type: "asset", fileName: `${path}/index.html`, source: index.source });
    },
  };
}
