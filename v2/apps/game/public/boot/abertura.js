// Nunca uma tela branca: se o jogo não desenhar em 12 segundos (o pacote não
// baixou), a abertura vira a mensagem de erro com o link de recarregar. Fora
// do HTML desde a D114 (Content-Security-Policy sem script embutido).
(function () {
  var texts = {
    es: {
      loading: "Abriendo Futeiro",
      failed: "No se pudo abrir el juego. Tu carrera sigue guardada; recarga para intentarlo de nuevo.",
      reload: "Recargar",
    },
    en: {
      loading: "Opening Futeiro",
      failed: "The game could not open. Your career is still saved; reload to try again.",
      reload: "Reload",
    },
  };
  var lang = document.documentElement.getAttribute("lang");
  var dict = texts[lang];
  if (dict) {
    [].forEach.call(document.querySelectorAll("[data-boot]"), function (element) {
      element.textContent = dict[element.getAttribute("data-boot")];
    });
  }
  window.setTimeout(function () {
    if (window.__craqueMounted) return;
    var boot = document.querySelector(".boot");
    if (boot) boot.setAttribute("data-failed", "");
  }, 12000);
})();
