import { useEffect, useState } from "react";
import { useT } from "../../../i18n/useT";
import { renderEmail } from "./emailRender";

/** Os modelos de e-mail da conta (D118), lidos dos mesmos arquivos que o Supabase usa. */
const TEMPLATES = import.meta.glob<string>("../../../../../../supabase/templates/*.html", { query: "?raw", import: "default" });

const KINDS = [
  "confirmation",
  "recovery",
  "magic_link",
  "invite",
  "email_change",
  "reauthentication",
  "password_changed_notification",
  "email_changed_notification",
] as const;

type Kind = (typeof KINDS)[number];

export function EmailPreview() {
  const { t, locale } = useT();
  const [kind, setKind] = useState<Kind>("confirmation");
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    const load = Object.entries(TEMPLATES).find(([path]) => path.endsWith(`/${kind}.html`))?.[1];
    void load?.().then((source) => { if (alive) setHtml(renderEmail(source, locale)); });
    return () => { alive = false; };
  }, [kind, locale]);
  return (
    <div className="grid max-w-3xl gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("lab.account.emails")}>
        {KINDS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === kind}
            className="rounded-md border border-line px-3 py-1.5 text-sm aria-pressed:border-fg aria-pressed:bg-panel-2"
            onClick={() => setKind(item)}
          >
            {t(`lab.account.emailKinds.${item}`)}
          </button>
        ))}
      </div>
      <iframe
        title={t(`lab.account.emailKinds.${kind}`)}
        srcDoc={html ?? ""}
        sandbox=""
        className="h-[640px] w-full rounded-md border border-line bg-white"
      />
    </div>
  );
}
