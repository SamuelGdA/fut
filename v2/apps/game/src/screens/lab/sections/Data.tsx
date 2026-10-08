import { useState } from "react";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Panel, SectionRule } from "../../../ui/Panel";
import { AttributeBar, Meter, OddsBar, StatTile } from "../../../ui/Stats";
import { Tab, TabList, TabPanel, TabsRoot } from "../../../ui/Tabs";
import { LabSection } from "../LabSection";

interface SectionProps {
  index: number;
}

const OUTFIELD_SAMPLE = [
  { key: "pace", value: 78 },
  { key: "shooting", value: 84 },
  { key: "passing", value: 71 },
  { key: "dribbling", value: 80 },
  { key: "defending", value: 38 },
  { key: "physical", value: 74 },
] as const;

export function DataSection({ index }: SectionProps) {
  const { t, number, money, percent } = useT();

  return (
    <LabSection id="numeros" index={index} title={t("lab.sections.data")}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label={t("lab.data.age")} value={number(19)} hint={t("lab.data.ageHint")} />
        <StatTile label={t("lab.data.value")} value={money(12_500_000)} delta={3} hint={t("lab.data.valueHint")} />
        <StatTile label={t("lab.data.games")} value={number(142)} delta={41} hint={t("lab.data.gamesHint")} />
        <StatTile label={t("lab.data.goals")} value={number(58)} delta={-2} hint={t("lab.data.goalsHint")} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel>
          <Meter
            label={t("lab.data.fans")}
            value={68}
            band={t("lab.data.fansBand")}
            tone="good"
            segments
          />
          <p className="mt-3 text-sm text-muted">{t("lab.data.fansHint")}</p>

          <SectionRule className="mb-3 mt-6">{t("lab.data.odds")}</SectionRule>
          <OddsBar
            success={0.65}
            goodLabel={t("lab.data.oddsGood")}
            badLabel={t("lab.data.oddsBad")}
            formatPercent={percent}
          />
        </Panel>

        <Panel title={t("lab.data.attributes")}>
          <div className="flex flex-col gap-2.5">
            {OUTFIELD_SAMPLE.map((attribute) => (
              <AttributeBar
                key={attribute.key}
                abbr={t(`attributes.outfield.${attribute.key}.abbr`)}
                name={t(`attributes.outfield.${attribute.key}.name`)}
                value={attribute.value}
              />
            ))}
          </div>
        </Panel>
      </div>
    </LabSection>
  );
}

const TAB_VALUES = ["season", "history", "trophies", "nation"] as const;
type LabTab = (typeof TAB_VALUES)[number];

export function TabsSection({ index }: SectionProps) {
  const { t } = useT();
  const [tab, setTab] = useState<LabTab>("season");

  return (
    <LabSection id="abas" index={index} title={t("lab.sections.tabs")}>
      <Panel flush>
        <TabsRoot
          value={tab}
          values={TAB_VALUES}
          onValueChange={(next) => {
            setTab(next);
            feedback("tick");
          }}
        >
          <TabList label={t("lab.sections.tabs")} className="px-2">
            {TAB_VALUES.map((value) => (
              <Tab key={value} value={value}>
                {t(`lab.tabs.${value}`)}
              </Tab>
            ))}
          </TabList>
          {TAB_VALUES.map((value) => (
            <TabPanel key={value} value={value} className="p-5">
              <p className="max-w-xl text-muted">{t(`lab.tabs.${value}Body`)}</p>
            </TabPanel>
          ))}
        </TabsRoot>
      </Panel>
    </LabSection>
  );
}
