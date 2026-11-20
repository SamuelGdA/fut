// Abertura do Futeiro, antes da primeira pintura (D114: fora do HTML, para a
// Content-Security-Policy não precisar liberar script embutido).
//
// 1. Aplica tema, movimento e idioma salvos: a página nunca pisca no tema
//    errado. Qualquer falha cai no padrão (claro, português).
// 2. Contra clickjacking em hospedagem sem cabeçalhos: aberto dentro de um
//    iframe de outro site, o jogo sai do quadro (ou some, se não puder sair).
//    Onde os cabeçalhos valem, `frame-ancestors 'none'` já bloqueia antes.
(function () {
  if (window.top !== window.self) {
    try {
      window.top.location.replace(window.self.location.href);
    } catch {
      document.documentElement.style.display = "none";
    }
  }
  try {
    var raw = window.localStorage.getItem("craque.v2.prefs");
    if (!raw) return;
    var state = (JSON.parse(raw) || {}).state || {};
    var root = document.documentElement;
    if (state.theme === "dark") {
      root.setAttribute("data-theme", "dark");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#0d1110");
    }
    if (state.motion === "reduced") root.setAttribute("data-motion", "reduced");
    if (state.locale === "es") root.setAttribute("lang", "es");
    if (state.locale === "en") root.setAttribute("lang", "en");
  } catch {
    /* armazenamento bloqueado ou corrompido: fica o padrão */
  }
})();
