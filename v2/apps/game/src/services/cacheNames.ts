/**
 * Nomes que o service worker e o jogo precisam combinar (GDD 37). Este arquivo
 * não importa nada: o `vite.config.ts` lê daqui para montar o service worker, e
 * o jogo lê daqui para guardar as imagens no mesmo lugar.
 */

/** Código e fontes guardados depois de escolher o modo. */
export const CODE_CACHE = "futeiros-codigo";

/** Imagens guardadas ao aparecer ou por pedido nos ajustes. */
export const IMAGE_CACHE = "craque-imagens";

/** As imagens de public/assets que entram ao aparecer ou por Guardar todas (D62). */
export const RUNTIME_IMAGE_DIRS = ["clubs", "trophies", "federations", "flags", "leagues", "awards"] as const;

/** O endereço de uma imagem desse cache, em qualquer base. */
export const RUNTIME_IMAGE_PATTERN = new RegExp(`/assets/(?:${RUNTIME_IMAGE_DIRS.join("|")})/`);
