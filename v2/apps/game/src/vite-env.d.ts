/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** Bytes das imagens que entram conforme aparecem (escudos e troféus), medidos no build. */
declare const __RUNTIME_IMAGE_BYTES__: number;

interface ImportMetaEnv {
  /** "real" (padrão) ou "gerado": ver .env.example e GDD 31.1. */
  readonly VITE_ASSETS?: string;
  /** Endereço público do jogo, impresso no pôster. Sem ele, vale o host atual. */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
