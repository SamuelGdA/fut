import { STORAGE_KEYS, safeStorage } from "../services/storage";

/**
 * "Limpar dados e recarregar" (GDD 34.4): apaga só o save da carreira e
 * recarrega. Preferências, rascunho, Hall da Fama e conquistas ficam.
 */
export function clearSaveAndReload(): void {
  safeStorage.removeItem(STORAGE_KEYS.save);
  window.location.reload();
}
