import { useT } from "../../i18n/useT";
import { cn } from "../../ui/cn";

/**
 * O aviso legal sobre nomes, escudos e marcas (D113), em letra miúda no pé
 * das telas onde uma carreira começa (quem é você, Técnico e Desafio do dia).
 * Fica no fluxo da página: nunca cobre uma decisão nem o laço (D23).
 */
export function LegalFinePrint({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <p className={cn("legal-fine", className)}>
      <span className="legal-fine-label">{t("account.legalNotice.eyebrow")}.</span> {t("account.legalNotice.body")}
    </p>
  );
}
