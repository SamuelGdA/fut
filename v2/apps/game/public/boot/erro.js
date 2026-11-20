// Páginas estáticas de erro (GDD 37): troca idioma e tema antes de pintar,
// pelos textos que a página traz num bloco de dados (#futeiros-textos). Fora
// do HTML desde a D114 (Content-Security-Policy sem script embutido). Sem
// este arquivo, a página continua em português escuro, com os links.
(function () {
  try {
    var data = document.getElementById("futeiros-textos");
    var t = data ? JSON.parse(data.textContent || "{}") : {};
    var raw = window.localStorage.getItem("craque.v2.prefs");
    var s = raw ? (JSON.parse(raw) || {}).state || {} : {};
    var r = document.documentElement;
    if (s.theme === "light") {
      r.setAttribute("data-theme", "light");
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", "#f3f0e8");
    }
    var l = t[s.locale] ? s.locale : null;
    if (!l) {
      var n = (navigator.language || "").slice(0, 2);
      l = t[n] ? n : "pt";
    }
    if (l !== "pt") {
      var x = t[l];
      r.setAttribute("lang", l === "es" ? "es" : "en");
      document.title = x.title + ": Futeiro";
      [].forEach.call(document.querySelectorAll("[data-t]"), function (e) {
        e.textContent = x[e.getAttribute("data-t")];
      });
    }
  } catch {
    /* armazenamento bloqueado ou texto corrompido: fica o português */
  }
})();
