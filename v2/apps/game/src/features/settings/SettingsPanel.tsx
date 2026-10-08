import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "../../i18n/useT";
import { LOCALES, type Locale } from "../../i18n/types";
import { feedback } from "../../services/feedback";
import { canVibrate } from "../../services/haptics";
import { type MotionMode, type Theme, usePrefs, VOLUME_STEPS } from "../../store/prefs";
import { IconButton } from "../../ui/Button";
import { StepSlider, Switch } from "../../ui/Fields";
import { Segmented } from "../../ui/Segmented";
import { OfflineImagesRow } from "./OfflineImagesRow";

const LOCALE_SHORT: Readonly<Record<Locale, string>> = { pt: "PT", es: "ES", en: "EN" };

function SettingRow({ label, children, note }: { label: string; children: ReactNode; note?: string }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="eyebrow mb-2.5">{label}</p>
      {children}
      {note ? <p className="mt-2 text-xs text-faint">{note}</p> : null}
    </div>
  );
}

/** Conteúdo do painel de ajustes. Carregado só quando o painel abre. */
export function SettingsPanel() {
  const { t } = useT();
  const locale = usePrefs((state) => state.locale);
  const theme = usePrefs((state) => state.theme);
  const volume = usePrefs((state) => state.volume);
  const muted = usePrefs((state) => state.muted);
  const motion = usePrefs((state) => state.motion);
  const haptics = usePrefs((state) => state.haptics);
  const actions = usePrefs.getState();

  const vibration = canVibrate();
  const volumeLabel = muted
    ? t("settings.volumeMuted")
    : t("settings.volumeValue", { value: Math.round((volume / VOLUME_STEPS) * 100) });

  const toggleMute = () => {
    if (muted) {
      if (volume === 0) actions.setVolume(3);
      actions.setMuted(false);
      feedback("confirm");
    } else {
      actions.setMuted(true);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      <SettingRow label={t("settings.language")}>
        <Segmented<Locale>
          block
          label={t("settings.language")}
          value={locale}
          onValueChange={(next) => {
            actions.setLocale(next);
            feedback("tick");
          }}
          options={LOCALES.map((code) => ({
            value: code,
            label: LOCALE_SHORT[code],
            ariaLabel: t(`languages.${code}`),
          }))}
        />
      </SettingRow>

      <SettingRow label={t("settings.theme")}>
        <Segmented<Theme>
          block
          label={t("settings.theme")}
          value={theme}
          onValueChange={(next) => {
            actions.setTheme(next);
            feedback("tick");
          }}
          options={[
            {
              value: "dark",
              label: (
                <>
                  <Moon size={15} aria-hidden="true" />
                  {t("settings.themeDark")}
                </>
              ),
            },
            {
              value: "light",
              label: (
                <>
                  <Sun size={15} aria-hidden="true" />
                  {t("settings.themeLight")}
                </>
              ),
            },
          ]}
        />
      </SettingRow>

      <SettingRow label={t("settings.sound")}>
        <div className="flex items-center gap-3">
          <IconButton
            label={muted ? t("settings.unmute") : t("settings.mute")}
            size="iconSm"
            variant="secondary"
            aria-pressed={muted}
            onClick={toggleMute}
          >
            {muted ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
          </IconButton>
          <div className="flex-1">
            <StepSlider
              value={volume}
              min={0}
              max={VOLUME_STEPS}
              label={t("settings.volume")}
              valueText={volumeLabel}
              dimmed={muted}
              onValueChange={(next) => actions.setVolume(next)}
              onValueCommitted={() => feedback("tick")}
            />
          </div>
          <span className="numeric w-12 text-right text-sm font-semibold text-muted">{volumeLabel}</span>
        </div>
      </SettingRow>

      <SettingRow label={t("settings.motion")} note={t("settings.motionHint")}>
        <Segmented<MotionMode>
          block
          size="sm"
          label={t("settings.motion")}
          value={motion}
          onValueChange={(next) => {
            actions.setMotion(next);
            feedback("tick");
          }}
          options={[
            { value: "system", label: t("settings.motionSystem") },
            { value: "reduced", label: t("settings.motionReduced") },
          ]}
        />
      </SettingRow>

      <div className="border-t border-line pt-2">
        <Switch
          label={t("settings.haptics")}
          description={vibration ? undefined : t("settings.hapticsUnsupported")}
          checked={haptics && vibration}
          disabled={!vibration}
          onCheckedChange={(next) => {
            actions.setHaptics(next);
            feedback("tick");
          }}
        />
      </div>

      <SettingRow label={t("settings.offlineTitle")}>
        <OfflineImagesRow />
      </SettingRow>
    </div>
  );
}
