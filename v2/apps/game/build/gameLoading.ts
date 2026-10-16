import type { Plugin } from "vite";

/** O cache inicial segue o grafo da casca, nunca todos os chunks do build. */
export function gameLoading() {
  const shell = new Set<string>();
  const plugin: Plugin = {
    name: "futeiros-game-loading",
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((item) => item.type === "chunk");
      const owns = (chunk: typeof chunks[number], suffix: string) => Object.keys(chunk.modules).some((id) => id.replaceAll("\\", "/").split("?")[0]?.endsWith(suffix));
      const closure = (seeds: string[], dynamic: boolean) => {
        const result = new Set<string>();
        const pending = [...seeds];
        while (pending.length) {
          const file = pending.pop()!;
          if (result.has(file)) continue;
          const chunk = bundle[file];
          if (!chunk || chunk.type !== "chunk") continue;
          result.add(file);
          pending.push(...chunk.imports);
          // A casca contém os loaders dos dois jogos: atravessá-los baixaria o outro modo.
          if (dynamic && !shell.has(file)) pending.push(...chunk.dynamicImports);
        }
        return result;
      };
      const shellSeeds = chunks.filter((chunk) => chunk.isEntry || owns(chunk, "/screens/hub/HubScreen.tsx") || owns(chunk, "/app/motion-features.ts") || Object.keys(chunk.modules).some((id) => id.includes("virtual:pwa-register"))).map((chunk) => chunk.fileName);
      for (const file of closure(shellSeeds, false)) shell.add(file);
      if (!shell.size || !chunks.some((chunk) => owns(chunk, "/screens/hub/HubScreen.tsx"))) throw new Error("Grafo da abertura não encontrado.");
      const commonAssets = Object.values(bundle).filter((item) => item.type === "asset" && (/\.css$/.test(item.fileName) || /-latin(?:-ext)?-.*\.woff2$/.test(item.fileName))).map((item) => item.fileName);
      const mode = (screens: string[]) => {
        const seeds = chunks.filter((chunk) => screens.some((name) => owns(chunk, `/screens/${name}`))).map((chunk) => chunk.fileName);
        return [...new Set([...closure(seeds, true), ...commonAssets])].sort();
      };
      this.emitFile({ type: "asset", fileName: "game-cache.json", source: JSON.stringify({ version: 1, shell: [...shell].sort(), craque: mode(["home/HomeScreen.tsx", "identity/IdentityScreen.tsx", "appearance/AppearanceScreen.tsx", "career/CareerScreen.tsx", "summary/SummaryScreen.tsx", "challenge/ChallengeScreen.tsx", "achievements/AchievementsScreen.tsx"]), tecnico: mode(["tecnico/TecnicoIdentityScreen.tsx", "tecnico/TecnicoAppearanceScreen.tsx", "tecnico/TecnicoScreen.tsx", "tecnico/TecnicoLegacyScreen.tsx", "tecnico/Guide.tsx", "achievements/AchievementsScreen.tsx"]) }) });
    },
  };
  return {
    plugin,
    initialAsset(url: string) {
      return shell.has(url) || /\.html$/.test(url) || /\.css$/.test(url) || /^icons\//.test(url) || /^favicon\./.test(url) || /(?:big-shoulders|schibsted-grotesk)-latin-(?:standard-normal|wght-normal).*\.woff2$/.test(url);
    },
  };
}
