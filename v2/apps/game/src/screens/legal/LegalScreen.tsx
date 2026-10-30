import { ArrowLeft } from "lucide-react";
import { screenUrl, useNavigation } from "../../app/navigation";
import { CONTACT_EMAIL, TRACKERS_ENABLED } from "../../features/consent/config";
import { useConsent } from "../../features/consent/store";
import { formatShortDate } from "../../i18n/format";
import { legalSections, useContaT } from "../../i18n/conta/useContaT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";

/** A data da versão atual dos dois textos. Mudou o texto, muda a data (e o CONSENT_VERSION, se o aviso de cookies mudar). */
// Meio-dia UTC: a data é a mesma em qualquer fuso (meia-noite viraria o dia anterior nas Américas).
const LEGAL_UPDATED = Date.UTC(2026, 9, 30, 12);

type Doc = "terms" | "privacy";

/**
 * Termos de Serviço e Política de Privacidade (D113), em `/termos` e
 * `/privacidade`: a tipografia de jornal do jogo, um índice no topo, seções
 * curtas e diretas. O Google exige essas páginas num endereço público para o
 * login com Google e para o AdSense.
 */
function LegalDocument({ doc }: { doc: Doc }) {
  const { ct, locale } = useContaT();
  const go = useNavigation((state) => state.go);
  const previous = useNavigation((state) => state.previous);
  const sections = legalSections(locale, doc);
  const other: Doc = doc === "terms" ? "privacy" : "terms";
  const otherTitle = ct(`${other}.title`);

  return (
    <article className="legal-page" aria-labelledby="legal-title">
      <header className="legal-head">
        <p className="eyebrow text-glory">{ct(`${doc}.eyebrow`)}</p>
        <h1 id="legal-title" className="legal-title">{ct(`${doc}.title`)}</h1>
        <p className="legal-lead">{ct(`${doc}.lead`)}</p>
        <p className="mt-3 text-xs text-faint">{ct("legalPage.updated", { date: formatShortDate(LEGAL_UPDATED, locale) })}</p>
      </header>

      <nav className="legal-toc" aria-label={ct("legalPage.contents")}>
        <p className="eyebrow mb-2">{ct("legalPage.contents")}</p>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <a href={`#${doc}-${section.id}`} onClick={(event) => {
                event.preventDefault();
                document.getElementById(`${doc}-${section.id}`)?.scrollIntoView({ block: "start" });
                document.getElementById(`${doc}-${section.id}`)?.focus({ preventScroll: true });
              }}>{section.title}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="legal-body">
        {sections.map((section, index) => (
          <section key={section.id} id={`${doc}-${section.id}`} tabIndex={-1} className="legal-section" aria-labelledby={`${doc}-${section.id}-titulo`}>
            <h2 id={`${doc}-${section.id}-titulo`} className="legal-section-title">
              <span className="legal-section-number numeric" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {section.title}
            </h2>
            {section.body.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
            {doc === "privacy" && section.id === "cookies" && TRACKERS_ENABLED ? <CookieButton /> : null}
          </section>
        ))}
      </div>

      <footer className="legal-foot">
        <p className="text-sm text-muted">{CONTACT_EMAIL ? ct("legalPage.contact", { email: CONTACT_EMAIL }) : ct("legalPage.contactMissing")}</p>
        <p className="mt-2 text-sm">
          <a
            href={screenUrl(other)}
            className="auth-link"
            onClick={(event) => {
              event.preventDefault();
              go(other);
            }}
          >
            {ct("legalPage.otherDoc", { name: otherTitle })}
          </a>
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => {
            feedback("back");
            go(previous && previous !== "terms" && previous !== "privacy" && previous !== "notFound" ? previous : "hub");
          }}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {ct("legalPage.back")}
        </Button>
      </footer>
    </article>
  );
}

/** Na Política, o atalho para mudar a escolha de cookies (quando há o que escolher). */
function CookieButton() {
  const { t } = useContaT();
  const choice = useConsent((state) => state.choice);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => useConsent.getState().reopen()}>
        {t("consent.settings")}
      </Button>
      {choice ? <span className="text-xs text-faint">{t(choice === "all" ? "consent.current.all" : "consent.current.essential")}</span> : null}
    </div>
  );
}

export function TermsScreen() {
  return <LegalDocument doc="terms" />;
}

export function PrivacyScreen() {
  return <LegalDocument doc="privacy" />;
}
