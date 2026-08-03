"use client";

import { useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { Avatar } from "@/components/Avatar";
import { PositionField } from "@/components/PositionField";
import { NationalitySearch } from "@/components/NationalitySearch";
import { getCountryByIso } from "@/lib/data/dataset";
import { getKitForCountry } from "@/lib/kits";

const CUSTOMISE_LABEL = {
  pt: { edit: "Personalizar aparência", editing: "Editar aparência", hint: "Sem personalizar, você joga como silhueta" },
  es: { edit: "Personalizar apariencia", editing: "Editar apariencia", hint: "Sin personalizar, jugás como silueta" },
  en: { edit: "Customise appearance", editing: "Edit appearance", hint: "Skip it and you play as a silhouette" },
} as const;

export function IdentityScreen() {
  const { t, locale } = useI18n();
  const draft = useCareerStore((s) => s.draft);
  const updateDraft = useCareerStore((s) => s.updateDraft);
  const goToIntro = useCareerStore((s) => s.goToIntro);
  const goToAppearance = useCareerStore((s) => s.goToAppearance);
  const confirmIdentity = useCareerStore((s) => s.confirmIdentity);
  const sound = useSound();

  const copy = CUSTOMISE_LABEL[locale];
  const canConfirm = Boolean(draft.lastName.trim() && draft.countryIso && draft.position);
  const nationalKit = getKitForCountry(draft.countryIso ? getCountryByIso(draft.countryIso) : null);

  return (
    <div className="animate-fade-in mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">
          {t("identity.title")}
        </h1>
        <p className="text-sm text-muted">{t("identity.subtitle")}</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col gap-2.5">
          <div className="panel relative aspect-square overflow-hidden">
            <Avatar config={draft.avatar} kit={nationalKit} className="h-full w-full" />
            {draft.lastName.trim() && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-center">
                <p className="truncate font-display text-lg font-black uppercase tracking-tight">
                  {draft.lastName}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              goToAppearance();
              sound("select");
            }}
            className="w-full rounded-full border border-pitch/40 bg-pitch/10 px-4 py-2 text-sm font-bold text-pitch transition-all hover:bg-pitch/20 active:scale-[0.98]"
          >
            {draft.avatar ? copy.editing : copy.edit}
          </button>
          {!draft.avatar && (
            <p className="text-center text-xs leading-snug text-muted-2">{copy.hint}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <section className="panel p-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-2">
              {t("identity.personalizationTitle")}
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-2">
                {t("identity.lastName")}
                <input
                  type="text"
                  value={draft.lastName}
                  onChange={(e) => updateDraft({ lastName: e.target.value })}
                  placeholder={t("identity.lastNamePlaceholder")}
                  maxLength={16}
                  className="rounded-lg border border-line bg-background px-3.5 py-2.5 text-base font-normal normal-case tracking-normal text-foreground placeholder:text-muted-2 focus:border-pitch/60 focus:outline-none"
                />
              </label>
              <div className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-2">
                {t("identity.preferredFoot")}
                <div className="pill inline-flex p-1">
                  {(["left", "right"] as const).map((foot) => (
                    <button
                      key={foot}
                      type="button"
                      onClick={() => {
                        updateDraft({ foot });
                        sound("tick");
                      }}
                      className={`flex-1 rounded-full px-3 py-1.5 text-sm font-semibold normal-case tracking-normal transition-all active:scale-95 ${
                        draft.foot === foot ? "bg-foreground text-background" : "text-muted-2 hover:text-foreground"
                      }`}
                    >
                      {t(foot === "left" ? "identity.leftFoot" : "identity.rightFoot")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="panel p-4">
              <NationalitySearch
                value={draft.countryIso}
                onChange={(countryIso) => {
                  updateDraft({ countryIso });
                  sound("tick");
                }}
              />
            </section>

            <section className="panel p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-2">
                {t("identity.positionTitle")}
              </h2>
              <PositionField
                value={draft.position}
                onChange={(position) => {
                  updateDraft({ position });
                  sound("tick");
                }}
              />
            </section>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={() => {
            goToIntro();
            sound("back");
          }}
          className="rounded-full px-5 py-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          {t("identity.back")}
        </button>
        <button
          type="button"
          disabled={!canConfirm}
          onClick={() => {
            confirmIdentity();
            sound("whistle");
          }}
          className="min-w-44 rounded-full bg-pitch px-6 py-2.5 text-sm font-black uppercase tracking-wide text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          {t("identity.confirm")}
        </button>
      </div>
    </div>
  );
}
