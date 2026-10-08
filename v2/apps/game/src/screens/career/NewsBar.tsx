import { seasonCovers } from "@craque/content";
import type { Career } from "@craque/engine";
import { m, useReducedMotion } from "motion/react";
import { Newspaper } from "lucide-react";
import { useMemo } from "react";
import { useT } from "../../i18n/useT";

interface NewsBarProps {
  career: Career;
  /** Índice da temporada no histórico: a do lance, ou a revista. */
  index: number;
  /** Acabou de sair: entra com a dobra do papel. */
  fresh: boolean;
}

/**
 * O jornalzinho do pé da coluna (D43): a capa da temporada, impressa, sempre à
 * vista embaixo da decisão. O nome do jornal e a edição numa linha, a
 * manchete em letra de placar e a linha de apoio. O jornal inteiro, edição por
 * edição, fica no resumo.
 */
export function NewsBar({ career, index, fresh }: NewsBarProps) {
  const { t, locale } = useT();
  const reduced = useReducedMotion();
  const covers = useMemo(() => seasonCovers(locale, career), [locale, career]);
  const cover = covers[index];
  if (!cover) return null;
  const toneLabel = t(`tones.${cover.tone === "bad" ? "bad" : cover.tone === "good" ? "good" : "neutral"}`);
  return (
    <m.article
      key={`${cover.year}-${fresh ? "novo" : "visto"}`}
      className="cover news-bar"
      data-tone={cover.tone}
      aria-label={t("career.play.newspaper")}
      initial={fresh && reduced !== true ? { opacity: 0, y: 14, rotate: -0.8 } : false}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: fresh ? 0.45 : 0, type: "spring", stiffness: 240, damping: 24 }}
    >
      <p className="cover-masthead">
        <span className="flex min-w-0 items-center gap-1.5">
          <Newspaper size={13} aria-hidden="true" className="shrink-0" />
          <span className="cover-paper">{cover.paper}</span>
        </span>
        <span className="cover-dateline">{cover.dateline}</span>
      </p>
      <h3 className="cover-headline">
        <span className="sr-only">{toneLabel}: </span>
        {cover.headline}
      </h3>
      <p className="cover-support">{cover.support}</p>
    </m.article>
  );
}
