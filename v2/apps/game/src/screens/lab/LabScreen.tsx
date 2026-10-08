import { type ComponentType, lazy, Suspense, useEffect, useRef, useState } from "react";
import { SectionBoundary } from "../../app/ErrorBoundary";
import { useT } from "../../i18n/useT";
import { useAssetMode } from "../../lib/assets";
import { feedback } from "../../services/feedback";
import { usePrefs } from "../../store/prefs";
import { Bars } from "../../ui/Button";
import { Chip } from "../../ui/Signals";
import { Tab, TabList, TabPanel, TabsRoot } from "../../ui/Tabs";

const AREAS = ["design", "world", "art", "avatar", "cards", "engine", "seasons", "ending", "challenge"] as const;
type Area = (typeof AREAS)[number];

const AREA_COMPONENTS: Readonly<Record<Area, ComponentType>> = {
  design: lazy(() => import("./areas/DesignArea").then((module) => ({ default: module.DesignArea }))),
  world: lazy(() => import("./areas/WorldArea").then((module) => ({ default: module.WorldArea }))),
  art: lazy(() => import("./areas/ArtArea").then((module) => ({ default: module.ArtArea }))),
  avatar: lazy(() => import("./areas/AvatarArea").then((module) => ({ default: module.AvatarArea }))),
  cards: lazy(() => import("./areas/CardsArea").then((module) => ({ default: module.CardsArea }))),
  engine: lazy(() => import("./areas/EngineArea").then((module) => ({ default: module.EngineArea }))),
  seasons: lazy(() => import("./areas/SeasonsArea").then((module) => ({ default: module.SeasonsArea }))),
  ending: lazy(() => import("./areas/EndingArea").then((module) => ({ default: module.EndingArea }))),
  challenge: lazy(() => import("./areas/ChallengeArea").then((module) => ({ default: module.ChallengeArea }))),
};

function AreaLoading() {
  const { t } = useT();
  return (
    <div role="status" className="flex min-h-80 items-center justify-center gap-3 text-muted">
      <Bars />
      <span className="eyebrow">{t("common.loading")}</span>
    </div>
  );
}

/**
 * Bastidores do v2: o sistema de design (M0), o mundo com as notas novas, a
 * arte nos tamanhos reais e o criador de personagem portado (M1).
 */
export function LabScreen() {
  const { t } = useT();
  const locale = usePrefs((state) => state.locale);
  const theme = usePrefs((state) => state.theme);
  const assetMode = useAssetMode((state) => state.mode);
  const trophyMode = useAssetMode((state) => state.trophyMode);
  // Abre na área do marco mais recente.
  const [area, setArea] = useState<Area>("challenge");
  const headerRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Em tela estreita a lista de áreas rola de lado: a aba ativa entra na tela.
  useEffect(() => {
    tabsRef.current
      ?.querySelector<HTMLElement>("[role=tab][data-active]")
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [area]);

  /**
   * Trocar de área com a barra grudada deixaria a página rolada no meio do
   * conteúdo novo. Volta para o começo da área, logo abaixo das barras.
   */
  const changeArea = (next: Area) => {
    setArea(next);
    feedback("tick");
    const header = headerRef.current;
    if (!header) return;
    const topbar = document.querySelector<HTMLElement>(".topbar")?.offsetHeight ?? 56;
    const areaStart = header.getBoundingClientRect().bottom + window.scrollY - topbar;
    if (window.scrollY > areaStart) window.scrollTo({ top: areaStart, behavior: "auto" });
  };

  return (
    <div className="lab-root">
      <header ref={headerRef} className="pitch-stripes border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-9 sm:pt-14">
          <p className="eyebrow text-glory">{t("lab.eyebrow")}</p>
          <h1 className="display mt-4 text-5xl font-black uppercase sm:text-6xl md:text-hero">{t("lab.title")}</h1>
          <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg">{t("lab.intro")}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip tone="info" variant="outline">
              {t("lab.assetMode", {
                mode: assetMode !== trophyMode ? t("lab.art.modeDefault") : assetMode === "gerado" ? t("lab.assetGenerated") : t("lab.assetReal"),
              })}
            </Chip>
            <Chip variant="outline">{t(`languages.${locale}`)}</Chip>
            <Chip variant="outline">{theme === "dark" ? t("settings.themeDark") : t("settings.themeLight")}</Chip>
          </div>
        </div>
      </header>

      <TabsRoot
        value={area}
        values={AREAS}
        onValueChange={changeArea}
      >
        <div ref={tabsRef} className="lab-areas">
          <div className="mx-auto max-w-6xl px-4">
            <TabList label={t("lab.areas.label")} className="border-b-0">
              {AREAS.map((value) => (
                <Tab key={value} value={value}>
                  {t(`lab.areas.${value}`)}
                </Tab>
              ))}
            </TabList>
          </div>
        </div>

        {AREAS.map((value) => {
          const Area = AREA_COMPONENTS[value];
          return (
            <TabPanel key={value} value={value} className="mx-auto max-w-6xl px-4 pb-24 pt-10">
              <SectionBoundary label={`laboratório ${value}`}>
                <Suspense fallback={<AreaLoading />}>
                  <Area />
                </Suspense>
              </SectionBoundary>
            </TabPanel>
          );
        })}
      </TabsRoot>
    </div>
  );
}
