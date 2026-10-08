import { EVENT_TEXTS } from "@craque/content";
import { CLUBS } from "@craque/world";
import { Vibrate } from "lucide-react";
import { useState } from "react";
import type { ResultView } from "../../../features/career/resultView";
import { useT } from "../../../i18n/useT";
import { CUES } from "../../../services/audio";
import { feedback } from "../../../services/feedback";
import { canVibrate, vibrate } from "../../../services/haptics";
import { Button } from "../../../ui/Button";
import { InfoTip } from "../../../ui/InfoTip";
import { ConfirmDialog, Sheet } from "../../../ui/Overlays";
import { Panel, SectionRule } from "../../../ui/Panel";
import { Chip } from "../../../ui/Signals";
import { notify } from "../../../ui/toast/notify";
import { ResultLayer } from "../../career/ResultMessage";
import { LabSection } from "../LabSection";

interface SectionProps {
  index: number;
}

type ResultSample = "success" | "failure" | "done" | "move" | "stay" | "focus";

const RESULT_SAMPLES: readonly ResultSample[] = ["success", "failure", "done", "move", "stay", "focus"];

/** Um clube de verdade para as amostras: o primeiro da primeira divisão brasileira. */
const SAMPLE_CLUB = CLUBS.find((club) => club.country === "BRA" && club.division === 1)?.id ?? CLUBS[0]?.id ?? "";

export function OverlaysSection({ index }: SectionProps) {
  const { t, tp, c, locale } = useT();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [result, setResult] = useState<ResultView | null>(null);

  // As amostras usam os textos do jogo: o treino extra, o treinador particular, a braçadeira.
  const showResult = (sample: ResultSample) => {
    const events = EVENT_TEXTS[locale];
    const club = CLUBS.find((item) => item.id === SAMPLE_CLUB);
    const id = (result?.id ?? 0) + 1;
    const views: Record<ResultSample, ResultView> = {
      success: {
        id,
        mark: "success",
        tone: "good",
        eyebrow: t("career.result.success"),
        title: events.extraTraining.title,
        body: events.extraTraining.options.push.success,
        club: null,
        chips: [{ key: "capacity", text: c("effect.capacityNow", { value: "+1" }), tone: "good" }],
      },
      failure: {
        id,
        mark: "failure",
        tone: "bad",
        eyebrow: t("career.result.failure"),
        title: events.personalCoach.title,
        body: events.personalCoach.options.hire.failure,
        club: null,
        chips: [{ key: "role", text: c("effect.roleDown"), tone: "bad" }],
      },
      done: {
        id,
        mark: "done",
        tone: "neutral",
        eyebrow: t("career.result.done"),
        title: events.captaincy.title,
        body: events.captaincy.options.accept.result,
        club: null,
        chips: [],
      },
      move: {
        id,
        mark: "move",
        tone: "glory",
        eyebrow: t("career.result.signed"),
        title: club?.name ?? "",
        body: null,
        club: SAMPLE_CLUB,
        chips: [{ key: "shirt", text: t("career.result.shirt", { number: 9 }), tone: "neutral" }],
      },
      stay: {
        id,
        mark: "stay",
        tone: "good",
        eyebrow: t("career.result.stay"),
        title: club?.name ?? "",
        body: tp("career.result.staySeasons", 1),
        club: SAMPLE_CLUB,
        chips: [{ key: "shirt", text: t("career.result.newShirt", { number: 10 }), tone: "glory" }],
      },
      focus: {
        id,
        mark: "focus",
        tone: "good",
        eyebrow: t("career.result.focus"),
        title: c("focus.finishing.name"),
        body: c("focus.finishing.body"),
        club: null,
        chips: [{ key: "attribute", text: `+2 ${t("attributes.outfield.shooting.name")}`, tone: "good" }],
      },
    };
    setResult(views[sample]);
    feedback(sample === "failure" ? "back" : sample === "move" ? "whistle" : "reveal");
  };

  const openSheet = () => {
    setSheetOpen(true);
    feedback("select");
  };

  const openDialog = () => {
    setDialogOpen(true);
    feedback("select");
  };

  return (
    <LabSection id="janelas" index={index} title={t("lab.sections.overlays")}>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={openSheet}>
              {t("lab.overlays.sheetOpen")}
            </Button>
            <Button variant="secondary" onClick={openDialog}>
              {t("lab.overlays.dialogOpen")}
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold">
            {t("lab.overlays.tipLabel")}
            <InfoTip label={t("lab.overlays.tipLabel")}>{t("lab.overlays.tipBody")}</InfoTip>
          </div>
        </Panel>

        <Panel title={t("lab.overlays.toasts")}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                feedback("rise");
                notify({
                  tone: "good",
                  eyebrow: t("lab.overlays.toastGoodEyebrow"),
                  title: t("lab.overlays.toastGoodBody"),
                });
              }}
            >
              {t("lab.overlays.toastGood")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                feedback("back");
                notify({
                  tone: "bad",
                  eyebrow: t("lab.overlays.toastBadEyebrow"),
                  title: t("lab.overlays.toastBadBody"),
                });
              }}
            >
              {t("lab.overlays.toastBad")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                feedback("tick");
                notify({
                  tone: "neutral",
                  eyebrow: t("lab.overlays.toastNeutralEyebrow"),
                  title: t("lab.overlays.toastNeutralBody"),
                });
              }}
            >
              {t("lab.overlays.toastNeutral")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                feedback("trophy");
                notify({
                  tone: "glory",
                  eyebrow: t("lab.overlays.toastGloryEyebrow"),
                  title: t("lab.overlays.toastGloryBody"),
                  timeout: 6800,
                });
              }}
            >
              {t("lab.overlays.toastGlory")}
            </Button>
          </div>
        </Panel>

        <Panel title={t("lab.overlays.result")} className="md:col-span-2">
          <p className="mb-4 max-w-2xl text-sm text-muted">{t("lab.overlays.resultIntro")}</p>
          <div className="flex flex-wrap gap-2">
            {RESULT_SAMPLES.map((sample) => (
              <Button key={sample} size="sm" variant="secondary" onClick={() => showResult(sample)}>
                {t(`lab.overlays.result${sample.charAt(0).toUpperCase()}${sample.slice(1)}` as "lab.overlays.resultSuccess")}
              </Button>
            ))}
          </div>
          <div className="mt-4 max-w-lg"><ResultLayer view={result} /></div>
        </Panel>
      </div>

      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={t("lab.overlays.sheetTitle")}
        closeLabel={t("common.close")}
        footer={
          <Button
            block
            onClick={() => {
              setSheetOpen(false);
              feedback("confirm");
            }}
          >
            {t("common.confirm")}
          </Button>
        }
      >
        <p className="text-muted">{t("lab.overlays.sheetBody")}</p>
        <div className="mt-5 flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-sm border border-line bg-panel-2 px-3 py-3">
            <span className="display text-2xl font-extrabold uppercase">{t("lab.composition.clubName")}</span>
            <Chip tone="good" variant="outline">
              {t("lab.tones.roleStarter")}
            </Chip>
          </div>
          <div className="flex items-center justify-between rounded-sm border border-line bg-panel-2 px-3 py-3">
            <span className="display text-2xl font-extrabold uppercase">{t("lab.composition.clubName")} B</span>
            <Chip tone="info" variant="outline">
              {t("lab.tones.roleRotation")}
            </Chip>
          </div>
        </div>
      </Sheet>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={t("lab.overlays.dialogTitle")}
        description={t("lab.overlays.dialogBody")}
        confirmLabel={t("lab.overlays.dialogConfirm")}
        cancelLabel={t("common.cancel")}
        onConfirm={() => feedback("back")}
      />
    </LabSection>
  );
}

export function FeedbackSection({ index }: SectionProps) {
  const { t } = useT();
  const vibration = canVibrate();

  return (
    <LabSection id="som" index={index} title={t("lab.sections.feedback")}>
      <Panel>
        <p className="mb-5 max-w-2xl text-sm text-muted">{t("lab.feedback.intro")}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CUES.map((cue) => (
            <Button key={cue} size="sm" variant="secondary" onClick={() => feedback(cue)}>
              {t(`lab.feedback.cues.${cue}`)}
            </Button>
          ))}
        </div>
        <SectionRule className="mb-3 mt-6">{t("settings.haptics")}</SectionRule>
        <Button size="sm" variant="ghost" disabled={!vibration} onClick={() => vibrate("trophy")}>
          <Vibrate size={16} aria-hidden="true" />
          {vibration ? t("lab.feedback.vibrate") : t("lab.feedback.vibrateUnsupported")}
        </Button>
      </Panel>
    </LabSection>
  );
}
