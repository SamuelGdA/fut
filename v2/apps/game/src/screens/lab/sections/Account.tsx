import { GuestNotice } from "../../../features/account/GuestNotice";
import { LegalFinePrint } from "../../../features/account/LegalFinePrint";
import { AdSlot } from "../../../features/consent/AdSlot";
import { CookieBanner } from "../../../features/consent/CookieBanner";
import { useT } from "../../../i18n/useT";
import { Skeleton } from "../../../ui/Skeleton";
import { TrophyIcon } from "../../achievements/TrophyIcon";
import { LabSection } from "../LabSection";
import { EmailPreview } from "./EmailPreview";

/** Um troféu de cada tipo de arte: taça real, prêmio real e ícone de grupo. */
const SAMPLES = [
  { id: "title:cont1:CONMEBOL", group: "titles", rarity: "epic" },
  { id: "ballonDor", group: "awards", rarity: "epic" },
  { id: "record:careerGoals", group: "records", rarity: "legendary" },
  { id: "firstCareer", group: "career", rarity: "common" },
  { id: "tenClubs", group: "road", rarity: "rare" },
] as const;

/**
 * Conta e privacidade (D112 e D113): o troféu nos três estados, os
 * esqueletos, a faixa do visitante, o aviso de cookies em prévia, o espaço de
 * anúncio genérico e o aviso legal em letra miúda das telas de começo.
 */
export function AccountSection({ index }: { index: number }) {
  const { t, locale } = useT();
  const states = [
    { key: "locked", unlocked: false, quantity: 0 },
    { key: "unlocked", unlocked: true, quantity: 0 },
    { key: "counted", unlocked: true, quantity: 3 },
  ] as const;
  return (
    <LabSection id="conta" index={index} title={t("lab.sections.account")}>
      <p className="mb-6 max-w-2xl text-sm text-muted">{t("lab.account.lead")}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {states.map((state) => (
          <div key={state.key} className="rounded-md border border-line bg-panel p-4">
            <p className="eyebrow mb-4">{t(`lab.account.${state.key}`)}</p>
            <div className="flex flex-wrap gap-4">
              {SAMPLES.map((sample) => (
                <TrophyIcon
                  key={sample.id}
                  id={sample.id}
                  group={sample.group}
                  rarity={sample.rarity}
                  unlocked={state.unlocked}
                  quantity={state.quantity}
                  label={`${sample.id}: ${t(`lab.account.${state.key}`)}`}
                  language={locale}
                />
              ))}
            </div>
            <div className="mt-4">
              <TrophyIcon id={SAMPLES[0].id} group="titles" rarity="epic" unlocked={state.unlocked} quantity={state.quantity} label={t(`lab.account.${state.key}`)} language={locale} size="lg" />
            </div>
          </div>
        ))}
      </div>

      <p className="eyebrow mt-8 mb-3">{t("lab.account.skeleton")}</p>
      <div className="flex max-w-md items-center gap-4 rounded-md border border-line bg-panel p-4" aria-hidden="true">
        <Skeleton round className="size-16 shrink-0" />
        <span className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-32" />
        </span>
      </div>

      <p className="eyebrow mt-8 mb-3">{t("lab.account.guest")}</p>
      <GuestNotice preview className="max-w-2xl" />

      <p className="eyebrow mt-8 mb-3">{t("lab.account.cookies")}</p>
      <CookieBanner preview />

      <p className="eyebrow mt-8 mb-3">{t("lab.account.ads")}</p>
      <AdSlot placement="perfil" className="max-w-2xl" />

      <p className="eyebrow mt-8 mb-3">{t("lab.account.legal")}</p>
      <LegalFinePrint />

      <p className="eyebrow mt-8 mb-3">{t("lab.account.emails")}</p>
      <p className="mb-4 max-w-2xl text-sm text-muted">{t("lab.account.emailsLead")}</p>
      <EmailPreview />
    </LabSection>
  );
}
