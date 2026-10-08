// Ponte do trabalhador: registra o tsx nesta thread (os ganchos do processo
// principal não passam para as threads) e carrega o trabalhador em TypeScript.
import { register } from "tsx/esm/api";

register();
await import("./worker.ts");
