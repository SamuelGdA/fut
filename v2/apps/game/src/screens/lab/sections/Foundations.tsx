import { type CSSProperties, useState } from "react";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { usePrefs } from "../../../store/prefs";
import { Button } from "../../../ui/Button";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Chip } from "../../../ui/Signals";
import { Tab, TabList, TabsRoot } from "../../../ui/Tabs";
import { LabSection } from "../LabSection";
import { CLUB_SWATCHES, type ClubSwatch, TOKEN_VALUES, type TokenName } from "../tokens";

interface SectionProps {
  index: number;
}

const WEIGHTS = [400, 600, 800, 900] as const;

export function TypeSection({ index }: SectionProps) {
  const { t, number, money } = useT();

  return (
    <LabSection id="tipografia" index={index} title={t("lab.sections.type")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="md:col-span-2">
          <p className="eyebrow">{t("lab.type.displayLabel")}</p>
          <p className="display mt-4 text-5xl font-black uppercase sm:text-7xl md:text-8xl">{t("lab.type.displaySample")}</p>
          <div className="mt-8 flex flex-wrap items-end gap-x-10 gap-y-6 border-t border-line pt-6">
            <div>
              <p className="eyebrow">{t("lab.type.scoreLabel")}</p>
              <p className="display numeric mt-2 text-score font-black">
                3 <span className="text-faint">×</span> 1
              </p>
            </div>
            <div>
              <p className="eyebrow">OVR</p>
              <p className="display numeric mt-1 text-7xl font-black text-glory">87</p>
            </div>
            <div className="flex items-end gap-4">
              {WEIGHTS.map((weight) => (
                <span key={weight} className="flex flex-col items-center gap-1">
                  <span className="display text-5xl" style={{ fontWeight: weight }}>
                    Aa
                  </span>
                  <span className="numeric text-2xs text-faint">{weight}</span>
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <p className="eyebrow">{t("lab.type.uiLabel")}</p>
          <p className="mt-4 text-lg font-medium leading-snug">{t("lab.type.uiSample")}</p>
          <p className="mt-3 text-sm text-muted">{t("lab.type.uiSample")}</p>
          <p className="mt-2 text-xs text-faint">{t("lab.type.uiSample")}</p>
        </Panel>

        <Panel>
          <p className="eyebrow">{t("lab.type.editorialLabel")}</p>
          <p className="editorial dropcap mt-4 text-lg leading-relaxed">{t("lab.type.editorialSample")}</p>
        </Panel>

        <Panel className="md:col-span-2">
          <p className="eyebrow">{t("lab.type.numbersLabel")}</p>
          <div className="display numeric mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-4xl font-extrabold sm:grid-cols-4">
            <span>{number(1391)}</span>
            <span>{number(950)}</span>
            <span>{money(180_000_000)}</span>
            <span>{money(12_500_000)}</span>
            <span>{number(73)}</span>
            <span>{number(8)}</span>
            <span>{money(850_000)}</span>
            <span>{money(4_200_000)}</span>
          </div>
        </Panel>
      </div>
    </LabSection>
  );
}

const TOKEN_GROUPS: ReadonlyArray<{
  key: "surfaces" | "text" | "signals";
  tokens: ReadonlyArray<{ name: TokenName; label: "canvas" | "panel" | "panel2" | "line" | "fg" | "muted" | "faint" | "good" | "glory" | "bad" | "info" }>;
}> = [
  {
    key: "surfaces",
    tokens: [
      { name: "canvas", label: "canvas" },
      { name: "panel", label: "panel" },
      { name: "panel-2", label: "panel2" },
      { name: "line", label: "line" },
    ],
  },
  {
    key: "text",
    tokens: [
      { name: "fg", label: "fg" },
      { name: "muted", label: "muted" },
      { name: "faint", label: "faint" },
    ],
  },
  {
    key: "signals",
    tokens: [
      { name: "good", label: "good" },
      { name: "glory", label: "glory" },
      { name: "bad", label: "bad" },
      { name: "info", label: "info" },
    ],
  },
];

const CLUB_ORDER: readonly ClubSwatch[] = ["green", "red", "sky", "maroon", "yellow"];

export function PaletteSection({ index }: SectionProps) {
  const { t } = useT();
  const theme = usePrefs((state) => state.theme);
  const [club, setClub] = useState<ClubSwatch>("maroon");
  const [tab, setTab] = useState<"season" | "history">("season");
  const swatch = CLUB_SWATCHES[club];
  const clubStyle = { "--club": swatch.club, "--on-club": swatch.onClub } as CSSProperties;

  return (
    <LabSection id="cores" index={index} title={t("lab.sections.palette")}>
      <div className="grid gap-4 md:grid-cols-3">
        {TOKEN_GROUPS.map((group) => (
          <Panel key={group.key} title={t(`lab.palette.${group.key}`)}>
            <ul className="flex flex-col gap-3">
              {group.tokens.map((token) => (
                <li key={token.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="size-11 shrink-0 rounded-sm border border-line"
                    style={{ background: `var(--${token.name})` }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{t(`lab.palette.tokens.${token.label}`)}</span>
                    <span className="numeric block text-xs uppercase text-faint">
                      {TOKEN_VALUES[theme][token.name]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>

      <Panel className="mt-4" style={clubStyle}>
        <SectionRule className="mb-3">{t("lab.palette.clubTitle")}</SectionRule>
        <p className="mb-4 max-w-2xl text-sm text-muted">{t("lab.palette.clubHint")}</p>
        <Segmented<ClubSwatch>
          label={t("lab.palette.clubTitle")}
          value={club}
          onValueChange={(next) => {
            setClub(next);
            feedback("tick");
          }}
          options={CLUB_ORDER.map((key) => ({
            value: key,
            tone: "club" as const,
            ariaLabel: t(`lab.palette.clubs.${key}`),
            label: (
              <>
                <span
                  aria-hidden="true"
                  className="size-3.5 rounded-xs border border-white/40"
                  style={{ background: CLUB_SWATCHES[key].club }}
                />
                <span className="hidden sm:inline">{t(`lab.palette.clubs.${key}`)}</span>
              </>
            ),
          }))}
        />
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 min-w-0 flex-1 items-stretch overflow-hidden rounded-sm border border-line">
            <span className="display grid w-16 place-items-center bg-club text-2xl font-black text-on-club">EXE</span>
            <span className="flex flex-1 items-center justify-between gap-3 bg-panel-2 px-3">
              <span className="display truncate text-2xl font-extrabold uppercase">SILVA</span>
              <span className="display numeric text-3xl font-black">81</span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="club" variant="solid">
              {t("lab.tones.roleStarter")}
            </Chip>
            <Button variant="club" size="sm">
              {t("lab.buttons.club")}
            </Button>
          </div>
        </div>
        <TabsRoot<"season" | "history"> value={tab} onValueChange={setTab} values={["season", "history"]} className="mt-5">
          <TabList label={t("lab.sections.tabs")} tone="club">
            <Tab value="season">{t("lab.tabs.season")}</Tab>
            <Tab value="history">{t("lab.tabs.history")}</Tab>
          </TabList>
        </TabsRoot>
      </Panel>
    </LabSection>
  );
}
