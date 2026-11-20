/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/** Bytes das imagens que entram conforme aparecem (escudos e troféus), medidos no build. */

interface ImportMetaEnv {
  /** "real" (padrão) ou "gerado": ver .env.example e GDD 31.1. */
  readonly VITE_ASSETS?: string;
  /** Endereço público do jogo, impresso no pôster. Sem ele, vale o host atual. */
  readonly VITE_SITE_URL?: string;
  /** Supabase (D112): endereço do projeto e chave PUBLICÁVEL. Ver .env.example. */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Google Analytics 4 e AdSense (D113): genéricos até a monetização ser ligada. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT_PERFIL?: string;
  readonly VITE_ADSENSE_SLOT_RESUMO?: string;
  readonly VITE_ADSENSE_SLOT_CONQUISTAS?: string;
  readonly VITE_ADSENSE_SLOT_CARREIRA?: string;
  /** E-mail de contato das páginas legais (D113). */
  readonly VITE_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
