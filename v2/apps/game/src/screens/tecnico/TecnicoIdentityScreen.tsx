import { randomAvatar } from "@craque/art";
import { getCountry, getCountryKit } from "@craque/world";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { ArrowLeft, ArrowRight, Dices, Pencil, Play, ShieldAlert } from "lucide-react";
import { useId, useState } from "react";
import { useNavigation } from "../../app/navigation";
import {
  COACH_NAME_MAX,
  COACH_NATIONS,
  COMPLETED_SECOND_DIVISIONS,
  type CoachModeChoice,
  isCoachNameValid,
  useCoachDraft,
} from "../../features/tecnico/draft";
import { useTecnicoPresence } from "../../features/tecnico/presence";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { TextField } from "../../ui/Fields";
import { Flag } from "../../ui/Media";
import { ConfirmDialog } from "../../ui/Overlays";
import { Panel } from "../../ui/Panel";
import { Segmented } from "../../ui/Segmented";

type Step = "who" | "how";

/**
 * Identidade do treinador (GDD 42.2): nome, país de origem (só os 15 com
 * segunda divisão, D53), ritmo e aparência de terno. No celular, duas etapas
 * para caber na tela; no PC, tudo de uma vez. Começar avisa que não há save
 * (D51) e, se já houver uma carreira nesta aba, pede confirmação.
 */
export function TecnicoIdentityScreen() {
  const { tt } = useTecnicoT();
  const go = useNavigation((state) => state.go);
  const draft = useCoachDraft();
  const active = useTecnicoPresence((state) => state.active);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const [step, setStep] = useState<Step>("who");
  const [touched, setTouched] = useState(false);
  const [starting, setStarting] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const nameOk = isCoachNameValid(draft.name);
  const ready = nameOk && draft.nationality !== null;

  const begin = async () => {
    const nationality = draft.nationality;
    if (!nationality) return;
    setStarting(true);
    try {
      const { useTecnico } = await import("../../features/tecnico/store");
      useTecnico.getState().abandon();
      useTecnico.getState().start({ name: draft.name, nationality, mode: draft.mode, avatar: draft.avatar });
      feedback("whistle");
      go("tecnico");
    } finally {
      setStarting(false);
    }
  };

  const confirm = () => {
    setTouched(true);
    if (!ready) {
      feedback("back");
      setStep("who");
      return;
    }
    if (active) {
      setConfirmReplace(true);
      return;
    }
    void begin();
  };

  const who = (
    <>
      <Panel>
        <TextField
          label={tt("identity.name")}
          value={draft.name}
          maxLength={COACH_NAME_MAX}
          placeholder={tt("identity.namePlaceholder")}
          counter={`${draft.name.length}/${COACH_NAME_MAX}`}
          onValueChange={(value) => useCoachDraft.getState().update({ name: value.slice(0, COACH_NAME_MAX) })}
          error={touched && !nameOk ? tt("identity.missingName") : undefined}
        />
      </Panel>
      <Panel title={tt("identity.nationality")} aside={<span className="text-xs text-faint">{tt("identity.nationalityHint")}</span>}>
        <NationGrid />
        <p className="mt-3 flex items-center gap-1.5 text-2xs text-faint">
          <span aria-hidden="true">◆</span>
          {tt("identity.completed")}
        </p>
        {touched && !draft.nationality ? <p className="mt-2 text-sm text-bad">{tt("identity.missingNation")}</p> : null}
      </Panel>
    </>
  );

  const how = (
    <>
      <Panel title={tt("identity.mode")}>
        <Segmented<CoachModeChoice>
          block
          label={tt("identity.mode")}
          value={draft.mode}
          onValueChange={(mode) => {
            useCoachDraft.getState().update({ mode });
            feedback("tick");
          }}
          options={[
            { value: "fast", label: tt("identity.modes.fast.name") },
            { value: "slow", label: tt("identity.modes.slow.name") },
          ]}
        />
        <p className="mt-2 text-xs text-faint">{tt(`identity.modes.${draft.mode}.hint`)}</p>
      </Panel>
      <Panel title={tt("identity.appearance")}>
        <div className="flex items-center gap-4">
          <div className="coach-portrait">
            <Avatar config={draft.avatar} kit={draft.nationality ? getCountryKit(draft.nationality) : null} outfit="coach" className="h-full w-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                feedback("select");
                go("tecnicoAppearance");
              }}
            >
              <Pencil size={15} aria-hidden="true" />
              {tt("identity.editAppearance")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                feedback("tick");
                useCoachDraft.getState().update({ avatar: randomAvatar() });
              }}
            >
              <Dices size={15} aria-hidden="true" />
              {tt("identity.randomize")}
            </Button>
          </div>
        </div>
      </Panel>
      <Panel data-tone="bad" className="border-l-4 border-l-bad">
        <p className="eyebrow flex items-center gap-2 text-tone">
          <ShieldAlert size={14} aria-hidden="true" />
          {tt("identity.noSaveTitle")}
        </p>
        <p className="mt-2 text-sm text-muted">{tt("identity.noSaveBody")}</p>
      </Panel>
    </>
  );

  const startButton = (
    <Button size="lg" block loading={starting} onClick={confirm}>
      <Play size={18} aria-hidden="true" />
      {tt("identity.start")}
    </Button>
  );

  return (
    <div className="tecnico-identity mx-auto max-w-6xl px-4 pt-6 pb-10">
      <div className="mb-5">
        <p className="eyebrow text-glory">{tt("identity.eyebrow")}</p>
        <h1 className="display mt-2 text-4xl font-black uppercase sm:text-5xl">{tt("identity.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">{tt("identity.lead")}</p>
      </div>

      {desktop ? (
        <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-5">
          <div className="flex flex-col gap-4">{who}</div>
          <div className="flex flex-col gap-4">
            {how}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  feedback("back");
                  go("hub");
                }}
              >
                <ArrowLeft size={16} aria-hidden="true" />
                {tt("identity.back")}
              </Button>
              <div className="flex-1">{startButton}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {step === "who" ? who : how}
          {/* Abaixo de 400 px os dois botões não cabem lado a lado: o principal vai em cima. */}
          <div className="flex flex-col-reverse gap-2 min-[400px]:flex-row min-[400px]:gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                feedback("back");
                if (step === "how") setStep("who");
                else go("hub");
              }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              {tt("identity.back")}
            </Button>
            <div className="min-w-0 flex-1">
              {step === "who" ? (
                <Button
                  size="lg"
                  block
                  onClick={() => {
                    setTouched(true);
                    if (!ready) {
                      feedback("back");
                      return;
                    }
                    feedback("tick");
                    setTouched(false);
                    setStep("how");
                    window.scrollTo({ top: 0 });
                  }}
                >
                  {tt("common.continue")}
                  <ArrowRight size={18} aria-hidden="true" />
                </Button>
              ) : (
                startButton
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReplace}
        onOpenChange={setConfirmReplace}
        title={tt("identity.replaceTitle")}
        description={tt("identity.replaceBody")}
        confirmLabel={tt("identity.replaceConfirm")}
        cancelLabel={tt("common.cancel")}
        onConfirm={() => void begin()}
      />
    </div>
  );
}

/** Os 15 países com segunda divisão, em grade de bandeiras (radiogroup). */
function NationGrid() {
  const { tt, locale } = useTecnicoT();
  const value = useCoachDraft((state) => state.nationality);
  const labelId = useId();
  const collator = new Intl.Collator(locale);
  const nations = COACH_NATIONS.map((code) => getCountry(code))
    .filter((country) => country !== undefined && country !== null)
    .sort((a, b) => collator.compare(a.names[locale], b.names[locale]));
  return (
    <>
      <span id={labelId} className="sr-only">
        {tt("identity.nationality")}
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        value={value ?? ""}
        onValueChange={(next) => {
          const code = COACH_NATIONS.find((nation) => nation === next);
          if (!code) return;
          feedback("select");
          useCoachDraft.getState().update({ nationality: code });
        }}
        className="nation-grid"
      >
        {nations.map((country) => (
          <Radio.Root key={country.code} value={country.code} className="nation-cell">
            <Flag country={country} size={28} language={locale} decorative />
            <span className="min-w-0 truncate">{country.names[locale]}</span>
            {COMPLETED_SECOND_DIVISIONS.has(country.code) ? (
              <span aria-hidden="true" className="nation-mark">
                ◆
              </span>
            ) : null}
          </Radio.Root>
        ))}
      </RadioGroup>
    </>
  );
}
