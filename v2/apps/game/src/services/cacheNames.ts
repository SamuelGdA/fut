/**
 * Nomes que o service worker e o jogo precisam combinar (GDD 37). Este arquivo
 * não importa nada: o `vite.config.ts` lê daqui para montar o service worker, e
 * o jogo lê daqui para guardar as imagens no mesmo lugar.
 */

/** O cache das imagens que entram conforme aparecem: escudos e troféus. */
export const IMAGE_CACHE = "craque-imagens";

/** As pastas de `public/assets/` que vão para esse cache (as outras entram na instalação). */
export const RUNTIME_IMAGE_DIRS = ["clubs", "trophies", "federations"] as const;

/** O endereço de uma imagem desse cache, em qualquer base. */
export const RUNTIME_IMAGE_PATTERN = new RegExp(`/assets/(?:${RUNTIME_IMAGE_DIRS.join("|")})/`);
