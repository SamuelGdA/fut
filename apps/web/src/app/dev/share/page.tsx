"use client";

/**
 * Dev-only bench for the share image.
 *
 * Frozen careers, so the same change can be compared between runs, and the
 * three shapes that break a poster: a career with 56 trophies and eight clubs,
 * one with no trophies and one club, and a keeper (whose card counts clean
 * sheets rather than goals). Both seals are rendered too, since neither shows
 * up on a normal run.
 */

import { useEffect, useState } from "react";
import { renderShareImage } from "@/lib/share/shareImage";
import { countryName, useI18n } from "@/lib/i18n/context";
import { BRAND_COPY } from "@/lib/brandCopy";
import samples from "@/lib/dev/sampleCareers.json";
import type { CareerState } from "@/lib/sim/career";
import type { AvatarConfig } from "@craque/art";
import { DEFAULT_AVATAR } from "@craque/art";
import type { Difficulty } from "@/lib/sim/constants";

interface Subject {
  id: string;
  career: keyof typeof samples;
  avatar: AvatarConfig;
  difficulty: Difficulty;
  challengeId: string | null;
}

const SUBJECTS: Subject[] = [
  {
    id: "carregado · normal",
    career: "loaded",
    avatar: { ...DEFAULT_AVATAR, skin: 5, hair: "curly", hairColor: 1, beard: "chinstrap" },
    difficulty: "normal",
    challengeId: null,
  },
  {
    id: "carregado · difícil",
    career: "loaded",
    avatar: { ...DEFAULT_AVATAR, skin: 5, hair: "curly", hairColor: 1, beard: "chinstrap" },
    difficulty: "hard",
    challengeId: null,
  },
  {
    id: "magro · desafio",
    career: "thin",
    avatar: { ...DEFAULT_AVATAR, skin: 2, hair: "sidePart", hairColor: 3 },
    difficulty: "normal",
    challengeId: "2026-08-20",
  },
  {
    id: "goleiro · normal",
    career: "keeper",
    avatar: { ...DEFAULT_AVATAR, skin: 3, hair: "short", hairColor: 0, beard: "full" },
    difficulty: "normal",
    challengeId: null,
  },
];

function Bench({ subject }: { subject: Subject }) {
  const { t, locale } = useI18n();
  const career = samples[subject.career] as unknown as CareerState;
  const [png, setPng] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const blob = await renderShareImage({
          career,
          avatar: subject.avatar,
          difficulty: subject.difficulty,
          challengeId: subject.challengeId,
          locale,
          t,
          countryLabel: countryName(career.player.nationality, locale),
          tagline: BRAND_COPY[locale].eyebrow,
        });
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPng(url);
      } catch (e) {
        setError(String(e));
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject.id, locale]);

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] text-muted-2">{subject.id}</p>
      {error && <p className="max-w-[440px] text-[10px] text-danger">{error}</p>}
      {png ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={png} alt="" style={{ width: 460 }} className="rounded-lg border border-line" />
      ) : (
        <div style={{ width: 460, height: 575 }} className="rounded-lg border border-line" />
      )}
    </div>
  );
}

export default function ShareBench() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <h1 className="font-display text-2xl font-black">Imagem de compartilhamento</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        1080x1350, pintada no canvas. Carreiras congeladas, então a mesma mudança pode ser
        comparada entre execuções.
      </p>
      <div className="mt-8 flex flex-wrap gap-8">
        {SUBJECTS.map((subject) => (
          <Bench key={subject.id} subject={subject} />
        ))}
      </div>
    </main>
  );
}
