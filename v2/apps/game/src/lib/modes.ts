/**
 * Modos bloqueados (D124). O site no ar (`.env.production`) tem
 * `VITE_MODOS_BLOQUEADOS=tecnico`: o Técnico aparece com a faixa "Em breve" e
 * não abre. No computador (`pnpm dev`) e na suíte ponta a ponta a variável
 * fica vazia e o Técnico funciona inteiro, para continuar sendo feito.
 *
 * Não dá para contornar pelo navegador: com o modo bloqueado, as telas do
 * Técnico nem entram no build (`ScreenOutlet` troca os carregadores, e o
 * plugin `blockedModes` derruba o build se alguma sobrar). Endereço `/tecnico`,
 * carreira salva no aparelho e atalhos caem todos na tela "Em breve".
 */
export const TECNICO_BLOCKED = import.meta.env.VITE_MODOS_BLOQUEADOS === "tecnico";

/** Conquista do Técnico (o id começa por `tecnico:`): some da tela com o modo bloqueado. */
export function isBlockedAchievement(id: string): boolean {
  return TECNICO_BLOCKED && id.startsWith("tecnico:");
}
