import { Share2 } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { type Difficulty, type Pace, usePrefs } from "../../../store/prefs";
import { Button, IconButton } from "../../../ui/Button";
import { Switch, TextField } from "../../../ui/Fields";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Chip, Delta, Glyph } from "../../../ui/Signals";
import { TONES } from "../../../ui/tone";
import { LabSection } from "../LabSection";

interface SectionProps {
  index: number;
}

export function ButtonsSection({ index }: SectionProps) {
  const { t } = useT();

  return (
    <LabSection id="botoes" index={index} title={t("lab.sections.buttons")}>
      <Panel>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => feedback("confirm")}>{t("lab.buttons.primary")}</Button>
          <Button variant="secondary" onClick={() => feedback("select")}>
            {t("lab.buttons.secondary")}
          </Button>
          <Button variant="ghost" onClick={() => feedback("back")}>
            {t("lab.buttons.ghost")}
          </Button>
          <Button variant="danger" onClick={() => feedback("back")}>
            {t("lab.buttons.danger")}
          </Button>
          <Button variant="alert" onClick={() => feedback("confirm")}>
            {t("lab.buttons.alert")}
          </Button>
          <Button variant="glory" onClick={() => feedback("reveal")}>
            {t("lab.buttons.glory")}
          </Button>
          <Button variant="club" onClick={() => feedback("confirm")}>
            {t("lab.buttons.club")}
          </Button>
        </div>

        <SectionRule className="mb-4 mt-7">{t("lab.buttons.sizes")}</SectionRule>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">{t("lab.buttons.small")}</Button>
          <Button size="md">{t("lab.buttons.medium")}</Button>
          <Button size="lg">{t("lab.buttons.large")}</Button>
          <IconButton label={t("lab.buttons.iconLabel")} variant="secondary">
            <Share2 size={18} aria-hidden="true" />
          </IconButton>
          <IconButton label={t("lab.buttons.iconLabel")} size="iconSm">
            <Share2 size={16} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button variant="secondary" loading>
            {t("lab.buttons.loading")}
          </Button>
          <Button disabled>{t("lab.buttons.disabled")}</Button>
        </div>
      </Panel>
    </LabSection>
  );
}

const SURNAME_MAX = 16;

export function ControlsSection({ index }: SectionProps) {
  const { t, upper } = useT();
  const pace = usePrefs((state) => state.pace);
  const difficulty = usePrefs((state) => state.difficulty);
  const haptics = usePrefs((state) => state.haptics);
  const actions = usePrefs.getState();
  const [surname, setSurname] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = surname.trim();
  const surnameError = touched && trimmed.length === 0 ? t("lab.controls.surnameError") : undefined;

  return (
    <LabSection id="controles" index={index} title={t("lab.sections.controls")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={t("pace.label")}>
          <Segmented<Pace>
            block
            label={t("pace.label")}
            value={pace}
            onValueChange={(next) => {
              actions.setPace(next);
              feedback("tick");
            }}
            options={[
              { value: "normal", label: t("pace.normal.name") },
              { value: "intense", label: t("pace.intense.name") },
            ]}
          />
          <p className="mt-3 min-h-10 text-sm text-muted">{t(`pace.${pace}.hint`)}</p>

          <SectionRule className="mb-3 mt-5">{t("difficulty.label")}</SectionRule>
          <Segmented<Difficulty>
            block
            label={t("difficulty.label")}
            value={difficulty}
            onValueChange={(next) => {
              actions.setDifficulty(next);
              feedback("tick");
            }}
            options={[
              { value: "normal", label: t("difficulty.normal.name") },
              { value: "hard", label: t("difficulty.hard.name"), tone: "bad" },
            ]}
          />
          <p className="mt-3 min-h-10 text-sm text-muted">{t(`difficulty.${difficulty}.hint`)}</p>
          <p className="mt-4 text-xs text-faint">{t("lab.controls.rememberNote")}</p>
        </Panel>

        <Panel>
          <TextField
            label={t("lab.controls.surname")}
            value={surname}
            onValueChange={(next) => {
              setSurname(next);
              setTouched(true);
            }}
            maxLength={SURNAME_MAX}
            placeholder={t("lab.controls.surnamePlaceholder")}
            hint={t("lab.controls.surnameHint", { max: SURNAME_MAX })}
            error={surnameError}
            counter={t("lab.controls.surnameCount", { count: surname.length, max: SURNAME_MAX })}
          />
          <p className="display mt-4 min-h-10 truncate text-4xl font-black uppercase text-glory">
            {trimmed ? upper(trimmed) : ""}
          </p>

          <div className="mt-2 border-t border-line pt-3">
            <Switch
              label={t("settings.haptics")}
              checked={haptics}
              onCheckedChange={(next) => {
                actions.setHaptics(next);
                feedback("tick");
              }}
            />
          </div>
        </Panel>
      </div>
    </LabSection>
  );
}

export function TonesSection({ index }: SectionProps) {
  const { t } = useT();

  return (
    <LabSection id="tons" index={index} title={t("lab.sections.tones")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title={t("lab.tones.pressure")}>
          <div className="flex flex-wrap gap-2">
            <Chip tone="bad" glyph>
              {t("lab.tones.pressureHigh")}
            </Chip>
            <Chip tone="neutral" glyph>
              {t("lab.tones.pressureMid")}
            </Chip>
            <Chip tone="good" glyph>
              {t("lab.tones.pressureLow")}
            </Chip>
          </div>

          <SectionRule className="mb-3 mt-6">{t("lab.tones.roles")}</SectionRule>
          <div className="flex flex-wrap gap-2">
            <Chip tone="glory" variant="solid">
              {t("lab.tones.roleStar")}
            </Chip>
            <Chip tone="good" variant="outline">
              {t("lab.tones.roleStarter")}
            </Chip>
            <Chip tone="info" variant="outline">
              {t("lab.tones.roleRotation")}
            </Chip>
            <Chip tone="neutral" variant="outline">
              {t("lab.tones.roleBench")}
            </Chip>
          </div>
        </Panel>

        <Panel title={t("lab.tones.glyphs")}>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
            {TONES.map((tone) => (
              <li key={tone} className="flex items-center gap-2 text-sm">
                <Glyph tone={tone} className="w-4 text-center" />
                {t(`tones.${tone}`)}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4">
            <Delta value={3} suffix={t("attributes.outfield.shooting.abbr")} />
            <Delta value={-2} suffix={t("attributes.outfield.pace.abbr")} />
            <Delta value={0} />
            <Chip tone="glory" variant="solid" glyph>
              {t("lab.tones.title")}
            </Chip>
          </div>
          <p className="mt-4 text-sm text-muted">{t("lab.tones.glyphHint")}</p>
        </Panel>
      </div>
    </LabSection>
  );
}
