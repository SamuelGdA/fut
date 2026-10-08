import { randomAvatar } from "@craque/art";
import { getCountryKit } from "@craque/world";
import { ArrowLeft, ArrowRight, Dices, Pencil, Play } from "lucide-react";
import { type CSSProperties, type ReactNode, useId, useState } from "react";
import { useNavigation } from "../../app/navigation";
import { isDraftComplete, isSurnameValid, SURNAME_MAX, useDraft } from "../../features/career/draft";
import { useT } from "../../i18n/useT";
import { useMediaQuery } from "../../lib/useMediaQuery";
import { feedback } from "../../services/feedback";
import { usePrefs } from "../../store/prefs";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { TextField } from "../../ui/Fields";
import { SectionRule } from "../../ui/Panel";
import { PlayerCard } from "../../ui/PlayerCard";
import { Segmented } from "../../ui/Segmented";
import { NationalityPicker } from "./NationalityPicker";
import { PositionPitch } from "./PositionPitch";

const STEPS = ["name", "nation", "position", "review"] as const;
type Step = (typeof STEPS)[number];

/**
 * Identidade (GDD 6.2). No celular, um fluxo em etapas; no PC, a tela inteira
 * de uma vez, sem rolar a página (D43): a carta e a aparência à esquerda,
 * nome e posição no meio, o país à direita (a lista rola por dentro). A
 * carta acompanha cada escolha, e o último jogador montado volta pronto na
 * próxima carreira. Confirmar exige sobrenome, país e posição, toca o apito e
 * cria a carreira.
 */
export function IdentityScreen() {
  const { t, locale, upper } = useT();
  const go = useNavigation((state) => state.go);
  const draft = useDraft();
  const pace = usePrefs((state) => state.pace);
  const difficulty = usePrefs((state) => state.difficulty);
  const [step, setStep] = useState<Step>("name");
  const [dreamText, setDreamText] = useState(draft.dreamNumber === null ? "" : String(draft.dreamNumber));
  const [touched, setTouched] = useState(false);
  const [starting, setStarting] = useState(false);
  const dreamId = useId();
  const desktop = useMediaQuery("(min-width: 1024px)");

  const stepIndex = STEPS.indexOf(step);
  const dreamValid = dreamText.trim() === "" || (/^\d{1,2}$/.test(dreamText.trim()) && Number(dreamText) >= 1);
  const surnameOk = isSurnameValid(draft.surname);
  const missing = [
    surnameOk ? null : t("identity.missingSurname"),
    draft.nationality ? null : t("identity.missingNation"),
    draft.position ? null : t("identity.missingPosition"),
  ].filter((item): item is string => item !== null);

  const stepReady: Readonly<Record<Step, boolean>> = {
    name: surnameOk && dreamValid,
    nation: draft.nationality !== null,
    position: draft.position !== null,
    review: isDraftComplete(draft) && dreamValid,
  };

  const setDream = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 2);
    setDreamText(digits);
    const number = Number(digits);
    useDraft.getState().update({ dreamNumber: digits !== "" && number >= 1 && number <= 99 ? number : null });
  };

  const begin = async () => {
    setStarting(true);
    try {
      const [{ setupFromDraft }, { useCareer }] = await Promise.all([
        import("../../features/career/newCareer"),
        import("../../features/career/store"),
      ]);
      const current = useDraft.getState();
      useCareer.getState().start(setupFromDraft({ draft: current, pace, difficulty, locale }), current.avatar);
      feedback("whistle");
      go("career");
    } finally {
      setStarting(false);
    }
  };

  const confirm = () => {
    setTouched(true);
    if (!stepReady.review) {
      feedback("back");
      if (!surnameOk) setStep("name");
      else if (!draft.nationality) setStep("nation");
      else if (!draft.position) setStep("position");
      return;
    }
    // Começar é começar (D45): a carreira de antes entra no Hall sem pergunta.
    void begin();
  };

  const next = () => {
    setTouched(true);
    if (!stepReady[step]) {
      feedback("back");
      return;
    }
    const following = STEPS[stepIndex + 1];
    if (following) {
      setTouched(false);
      setStep(following);
      feedback("tick");
      window.scrollTo({ top: 0 });
    }
  };

  const previous = () => {
    const before = STEPS[stepIndex - 1];
    if (before) {
      setStep(before);
      feedback("back");
      window.scrollTo({ top: 0 });
    } else {
      feedback("back");
      go("home");
    }
  };

  const kit = draft.nationality ? getCountryKit(draft.nationality) : null;

  return (
    <div className="id-page">
      <div className="id-head">
        <div className="min-w-0">
          <p className="eyebrow text-glory">{t("identity.eyebrow")}</p>
          <h1 className="display mt-2 text-5xl font-black uppercase sm:text-6xl lg:text-5xl">{t("identity.title")}</h1>
        </div>
        <p className="eyebrow lg:hidden" aria-live="polite">
          {t("identity.stepOf", { current: stepIndex + 1, total: STEPS.length })} · {t(`identity.steps.${step}`)}
        </p>
        <div className="hidden items-center gap-3 lg:flex">
          {missing.length > 0 && touched ? (
            <p className="max-w-64 text-right text-sm text-bad">{t("identity.missing", { list: missing.join(", ") })}</p>
          ) : null}
          <Button variant="ghost" onClick={() => go("home")}>
            <ArrowLeft size={18} aria-hidden="true" />
            {t("identity.previous")}
          </Button>
          <Button size="lg" loading={starting} onClick={confirm}>
            <Play size={18} aria-hidden="true" />
            {t("identity.confirm")}
          </Button>
        </div>
      </div>
      <div className="id-stepper mb-5 lg:hidden" style={{ "--steps": STEPS.length } as CSSProperties} aria-hidden="true">
        {STEPS.map((item, index) => (
          <span key={item} data-done={index <= stepIndex || undefined} />
        ))}
      </div>

      <div className="id-grid">
        <div className="id-card-column">
          <div className="flex justify-center">
            <PlayerCard
              surname={draft.surname.trim() ? upper(draft.surname) : t("card.you")}
              position={draft.position ?? "st"}
              ovr={null}
              attributes={null}
              nationality={draft.nationality}
              club={null}
              league={null}
              shirt={draft.dreamNumber}
              avatar={draft.avatar}
              width={desktop ? "var(--id-card)" : 136}
            />
          </div>
          <StepSection step="review" active={step} title={t("identity.appearance")}>
            <div className="flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-3">
              <div className="size-28 shrink-0 overflow-hidden rounded-md border border-line bg-panel lg:hidden">
                <Avatar config={draft.avatar} kit={kit} className="h-full w-full" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <p className="text-sm text-muted">{t("identity.appearanceHint")}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      feedback("select");
                      go("appearance");
                    }}
                  >
                    <Pencil size={15} aria-hidden="true" />
                    {t("identity.appearanceEdit")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      useDraft.getState().update({ avatar: randomAvatar() });
                      feedback("select");
                    }}
                  >
                    <Dices size={15} aria-hidden="true" />
                    {t("identity.appearanceRandom")}
                  </Button>
                </div>
              </div>
            </div>
          </StepSection>
        </div>

        <div className="id-middle">
          <StepSection step="name" active={step} title={t("identity.steps.name")}>
            <div className="flex flex-col gap-4">
              <TextField
                label={t("identity.surname")}
                value={draft.surname}
                onValueChange={(value) => useDraft.getState().update({ surname: value.slice(0, SURNAME_MAX) })}
                maxLength={SURNAME_MAX}
                placeholder={t("identity.surnamePlaceholder")}
                counter={`${draft.surname.length}/${SURNAME_MAX}`}
                hint={t("identity.surnameHint", { max: SURNAME_MAX })}
                error={touched && !surnameOk ? t("identity.surnameMissing") : undefined}
              />
              <div className="grid gap-4 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] lg:grid-cols-1">
                <div>
                  <label htmlFor={dreamId} className="eyebrow mb-1.5 block text-fg">
                    {t("identity.dreamNumber")}
                  </label>
                  <input
                    id={dreamId}
                    className="field-input"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={dreamText}
                    onChange={(event) => setDream(event.target.value)}
                    placeholder={t("identity.dreamPlaceholder")}
                    aria-invalid={!dreamValid || undefined}
                    aria-describedby={`${dreamId}-note`}
                    autoComplete="off"
                  />
                </div>
                <div>
                  <p className="eyebrow mb-1.5 text-fg">{t("identity.foot")}</p>
                  <Segmented
                    label={t("identity.foot")}
                    value={draft.foot}
                    onValueChange={(foot) => {
                      useDraft.getState().update({ foot });
                      feedback("tick");
                    }}
                    options={[
                      { value: "right", label: t("identity.footRight") },
                      { value: "left", label: t("identity.footLeft") },
                    ]}
                  />
                </div>
              </div>
              <p id={`${dreamId}-note`} className={cn("-mt-2 text-xs", dreamValid ? "text-faint" : "text-bad")}>
                {dreamValid ? t("identity.dreamHint") : t("identity.dreamInvalid")}
              </p>
            </div>
          </StepSection>

          <StepSection step="position" active={step} title={t("identity.position")} grow>
            <PositionPitch value={draft.position} onValueChange={(position) => useDraft.getState().update({ position })} />
            {touched && step === "position" && !draft.position ? (
              <p className="mt-2 text-xs text-bad">{t("identity.missing", { list: t("identity.missingPosition") })}</p>
            ) : null}
          </StepSection>
        </div>

        <StepSection step="nation" active={step} title={t("identity.nationality")} grow>
          <NationalityPicker value={draft.nationality} onValueChange={(nationality) => useDraft.getState().update({ nationality })} />
          {touched && step === "nation" && !draft.nationality ? (
            <p className="mt-2 text-xs text-bad">{t("identity.missing", { list: t("identity.missingNation") })}</p>
          ) : null}
        </StepSection>
      </div>

      <nav className="id-step-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <Button variant="ghost" onClick={previous}>
            <ArrowLeft size={18} aria-hidden="true" />
            {t("identity.previous")}
          </Button>
          {step === "review" ? (
            <Button size="lg" loading={starting} onClick={confirm} className="flex-1">
              <Play size={18} aria-hidden="true" />
              {t("identity.confirm")}
            </Button>
          ) : (
            <Button size="lg" onClick={next} className="flex-1" aria-disabled={!stepReady[step] || undefined}>
              {t("identity.next")}
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          )}
        </div>
      </nav>

    </div>
  );
}

function StepSection({ step, active, title, children, grow = false }: { step: Step; active: Step; title: string; children: ReactNode; grow?: boolean }) {
  return (
    <section className="id-step" data-active={step === active || undefined} data-grow={grow || undefined} aria-label={title}>
      <SectionRule as="h2" className="mb-3">
        {title}
      </SectionRule>
      {children}
    </section>
  );
}
