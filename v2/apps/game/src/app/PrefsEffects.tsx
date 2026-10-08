import { useEffect } from "react";
import { HTML_LANG } from "../i18n/format";
import { translate } from "../i18n/translate";
import { safeStorage } from "../services/storage";
import { readPrefs, usePrefs } from "../store/prefs";
import { notify } from "../ui/toast/notify";

const THEME_COLOR = { dark: "#0d1110", light: "#f3f0e8" } as const;

/**
 * Espelha as preferências no documento: tema, idioma, movimento e título.
 * Não desenha nada.
 */
export function PrefsEffects() {
  const theme = usePrefs((state) => state.theme);
  const locale = usePrefs((state) => state.locale);
  const motion = usePrefs((state) => state.motion);

  useEffect(() => {
    document.documentElement.dataset["theme"] = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
    document.title = `${translate(locale, "brand.name")}: ${translate(locale, "hub.eyebrow").toLowerCase()}`;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset["motion"] = motion;
  }, [motion]);

  useEffect(() => {
    if (safeStorage.persistent) return;
    const current = readPrefs().locale;
    notify({
      id: "storage-unavailable",
      tone: "bad",
      title: translate(current, "storage.unavailableTitle"),
      description: translate(current, "storage.unavailableBody"),
      timeout: 9000,
    });
  }, []);

  return null;
}
