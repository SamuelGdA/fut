"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "motion";
import { useI18n } from "@/lib/i18n/context";
import { generateBiography } from "@/lib/bio/generate";
import { buildBioFacts } from "@/lib/bio/facts";
import { recordById } from "@/lib/bio/records";
import type { CareerState } from "@/lib/sim/career";

/**
 * The career told as prose. Every line is picked from the phrase library only
 * if this particular career earned it, then ordered chronologically — so the
 * text reads like a write-up of *this* player rather than a filled-in form.
 */
export function CareerBiography({ career }: { career: CareerState }) {
  const { t, locale } = useI18n();
  const listRef = useRef<HTMLDivElement>(null);

  const positionLabel = t(`positionsFull.${career.player.position}`);

  // Regenerating on every render would reshuffle the wording as the user
  // interacts with the page; the biography is part of the career's identity,
  // so it is derived once per career/locale and then held still.
  const bio = useMemo(
    () => generateBiography(career, locale, positionLabel),
    [career, locale, positionLabel],
  );
  const facts = useMemo(() => buildBioFacts(career, locale), [career, locale]);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("p"));
    if (rows.length === 0) return;
    animate(rows, { opacity: [0, 1], y: [8, 0] }, { duration: 0.45, delay: stagger(0.08), ease: "easeOut" });
  }, [bio]);

  return (
    <section className="panel flex min-h-0 flex-col p-4">
      <h2 className="mb-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
        {t("career.biographyTitle")}
      </h2>

      <div ref={listRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pr-1">
        {bio.paragraphs.map((paragraph) => (
          <p
            key={paragraph.chapter}
            className="mb-2.5 text-sm leading-relaxed text-muted last:mb-0"
          >
            {paragraph.sentences.join(" ")}
          </p>
        ))}

        {facts.brokenRecords.length > 0 && (
          <div className="mt-3 rounded-xl border border-gold/30 bg-gold/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
              {t("career.recordsTitle")}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {facts.brokenRecords.map((broken) => {
                const record = recordById(broken.id);
                return (
                  <li key={broken.key} className="text-xs leading-snug">
                    <span className="font-display font-black text-gold">{broken.achieved}</span>{" "}
                    <span className="text-foreground">{record.label[locale]}</span>
                    <span className="text-muted-2">
                      {": "}
                      {t(broken.equalled ? "career.recordEqualled" : "career.recordBeaten", {
                        holder: record.holder,
                        previous: String(broken.previous),
                      })}
                      {`. ${record.detail[locale]}.`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
