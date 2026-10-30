import { isScreen, type Screen, useNavigation } from "../../app/navigation";
import { safeStorage } from "../../services/storage";
import { AUTH_RETURN_KEY } from "./config";

/** Telas para onde não faz sentido voltar depois de entrar. */
const NO_RETURN: ReadonlySet<Screen> = new Set(["login", "notFound", "lab", "shared"]);

/** Abre o login lembrando de onde o jogador veio: depois de entrar (até pelo Google), ele volta para lá. */
export function openLogin(from: Screen = useNavigation.getState().screen): void {
  if (!NO_RETURN.has(from)) safeStorage.setItem(AUTH_RETURN_KEY, from);
  useNavigation.getState().go("login");
}

/** Para onde voltar, lido uma vez. Sem lugar guardado, o hub. */
export function takeLoginReturn(): Screen {
  const value = safeStorage.getItem(AUTH_RETURN_KEY);
  safeStorage.removeItem(AUTH_RETURN_KEY);
  return isScreen(value) && !NO_RETURN.has(value) ? value : "hub";
}
