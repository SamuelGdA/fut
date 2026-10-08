import { Crosshair, Footprints, type LucideIcon, Zap } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { cn } from "../../../ui/cn";
import { Chip } from "../../../ui/Signals";
import { Tab, TabList, TabsRoot } from "../../../ui/Tabs";
import { signed } from "../../../ui/tone";
import { LabSection } from "../LabSection";
import { CLUB_SWATCHES } from "../tokens";

interface SectionProps {
  index: number;
}

type FocusKey = "burst" | "touch" | "aim";
type OutfieldKey = "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";

/** Cada foco treina um atributo só (D42). */
const FOCUS_OPTIONS: ReadonlyArray<{
  key: FocusKey;
  icon: LucideIcon;
  gains: ReadonlyArray<{ attribute: OutfieldKey; amount: number }>;
}> = [
  { key: "burst", icon: Zap, gains: [{ attribute: "pace", amount: 2 }] },
  { key: "touch", icon: Footprints, gains: [{ attribute: "dribbling", amount: 2 }] },
  { key: "aim", icon: Crosshair, gains: [{ attribute: "shooting", amount: 2 }] },
];

const TAB_VALUES = ["season", "history", "trophies", "nation"] as const;
type ComposeTab = (typeof TAB_VALUES)[number];

/**
 * Esboço da tela de carreira no celular, só com as peças do sistema de design.
 * Dados de exemplo; a tela de verdade chega no marco 5.
 */
export function CompositionSection({ index }: SectionProps) {
  const { t, c, number, money } = useT();
  const [focus, setFocus] = useState<FocusKey | null>(null);
  const [tab, setTab] = useState<ComposeTab>("season");
  const swatch = CLUB_SWATCHES.maroon;
  const clubStyle = { "--club": swatch.club, "--on-club": swatch.onClub } as CSSProperties;

  const miniStats = [
    { label: t("lab.data.games"), value: number(142) },
    { label: t("lab.data.goals"), value: number(58) },
    { label: t("lab.data.value"), value: money(4_200_000) },
    { label: t("lab.data.fans"), value: number(68) },
  ];

  return (
    <LabSection id="composicao" index={index} title={t("lab.sections.composition")}>
      <p className="mb-5 max-w-2xl text-sm text-muted">{t("lab.composition.intro")}</p>

      <div
        className="mx-auto w-full max-w-[390px] overflow-hidden rounded-lg border border-rule bg-canvas shadow-[var(--lift)]"
        style={clubStyle}
      >
        <div className="flex items-stretch border-b border-line">
          <div className="display grid w-16 shrink-0 place-items-center bg-club text-2xl font-black text-on-club">
            EXE
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="display truncate text-3xl font-extrabold uppercase">
                {t("lab.composition.playerName")}
              </p>
              <p className="mt-1 truncate text-xs text-muted">
                {c("positionAbbr.cam")} · {t("lab.composition.clubName")} · {t("lab.composition.age", { age: 19 })}
              </p>
            </div>
            <div className="text-right">
              <p className="display numeric text-5xl font-black">67</p>
              <p className="eyebrow mt-1">OVR</p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-4 divide-x divide-line border-b border-line">
          {miniStats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse items-center gap-1 px-1 py-2.5">
              <dt className="eyebrow max-w-full truncate tracking-wider">{stat.label}</dt>
              <dd className="display numeric text-xl font-extrabold">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="p-4">
          <p className="eyebrow">{t("lab.composition.decisionEyebrow")}</p>
          <h3 className="display mt-2 border-l-4 border-club pl-3 text-3xl font-extrabold uppercase">
            {t("lab.composition.decisionTitle")}
          </h3>
          <p className="mt-2 text-sm text-muted">{t("lab.composition.decisionBody")}</p>

          <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label={t("lab.composition.decisionTitle")}>
            {FOCUS_OPTIONS.map((option) => {
              const Icon = option.icon;
              const selected = focus === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setFocus(option.key);
                    feedback("rise");
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-sm border bg-panel p-3 text-left transition-[border-color,transform] duration-150 active:translate-y-px",
                    selected ? "border-club ring-1 ring-club" : "border-line hover:border-rule",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-sm bg-panel-2 text-fg">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-2xl font-extrabold uppercase">
                      {t(`lab.composition.focus.${option.key}.name`)}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {t(`lab.composition.focus.${option.key}.body`)}
                    </span>
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {option.gains.map((gain) => (
                        <Chip key={gain.attribute} tone="good" glyph>
                          {t(`attributes.outfield.${gain.attribute}.abbr`)} {signed(gain.amount)}
                        </Chip>
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <TabsRoot
          value={tab}
          values={TAB_VALUES}
          onValueChange={(next) => {
            setTab(next);
            feedback("tick");
          }}
          className="border-t border-line bg-panel"
        >
          <TabList label={t("lab.sections.composition")} tone="club">
            {TAB_VALUES.map((value) => (
              <Tab key={value} value={value}>
                {t(`lab.tabs.${value}`)}
              </Tab>
            ))}
          </TabList>
        </TabsRoot>
      </div>
    </LabSection>
  );
}
