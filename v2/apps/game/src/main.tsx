import "@fontsource-variable/big-shoulders/standard.css";
import "@fontsource-variable/schibsted-grotesk/wght.css";
import "@fontsource-variable/newsreader/standard.css";
import "./styles/index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { useNavigation } from "./app/navigation";
import { startScreen } from "./app/startup";

const container = document.getElementById("root");
if (!container) throw new Error("CRAQUE: elemento #root não encontrado em index.html");

// A tela de abertura é decidida antes do primeiro desenho: nada pisca no Início
// antes de voltar para a carreira.
useNavigation.setState({ screen: startScreen() });

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// A abertura do `index.html` não precisa mais mostrar o erro de carregamento.
(window as Window & { __craqueMounted?: boolean }).__craqueMounted = true;
