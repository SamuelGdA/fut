"use client";

import { useState } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useSound } from "@/lib/useSound";
import { useCareerStore } from "@/store/careerStore";
import { BRAND_COPY } from "@/lib/brandCopy";
import { canShareImage, downloadBlob, shareImage } from "@/lib/shareCard";
import { renderShareImage } from "@/lib/share/shareImage";
import type { CareerState } from "@/lib/sim/career";
import type { AvatarConfig } from "@craque/art";

type Status = "idle" | "working" | "error";

/**
 * Download or share the finished career as a PNG.
 *
 * This component now only decides *when*: the poster is painted entirely from
 * data, portrait included. It used to mount an invisible copy of the player's
 * avatar off-screen, find its `<svg>` in the DOM and serialise it back to a
 * string, because the avatar existed only as rendered markup. It exists as a
 * string now, so all of that is gone.
 *
 * The share button only appears where the browser can actually hand over a
 * file: desktop browsers report `navigator.share` but refuse image files, so
 * offering it there would just fail in the user's face.
 */
export function ShareCardButtons({
  career,
  avatar,
}: {
  career: CareerState;
  avatar: AvatarConfig | null;
}) {
  const { t, locale } = useI18n();
  const sound = useSound();
  const difficulty = useCareerStore((s) => s.difficulty);
  const challengeId = useCareerStore((s) => s.challengeId);
  const [status, setStatus] = useState<Status>("idle");
  const [shareable] = useState(() => canShareImage());

  const playerName = career.identity.lastName;
  const filename = `craque-${playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "carreira"}.png`;


  async function run(action: "download" | "share") {
    if (status === "working") return;
    setStatus("working");
    try {
      const blob = await renderShareImage({
        career,
        avatar,
        difficulty,
        challengeId,
        locale,
        t,
        countryLabel: countryName(career.player.nationality, locale),
        tagline: BRAND_COPY[locale].eyebrow,
      });
      if (action === "share") await shareImage(blob, filename, playerName);
      else downloadBlob(blob, filename);
      setStatus("idle");
      sound("confirm");
    } catch (error) {
      // A cancelled share dialog rejects too, and that isn't a failure.
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        return;
      }
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => run("download")}
        disabled={status === "working"}
        className="rounded-full border border-line px-4 py-1.5 text-xs font-bold text-muted transition-colors hover:text-foreground disabled:opacity-50"
      >
        {status === "working" ? t("career.shareWorking") : t("career.downloadCard")}
      </button>

      {shareable && (
        <button
          type="button"
          onClick={() => run("share")}
          disabled={status === "working"}
          className="rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 text-xs font-bold text-pitch transition-colors hover:bg-pitch/20 disabled:opacity-50"
        >
          {t("career.shareCard")}
        </button>
      )}

      {status === "error" && (
        <span className="text-[10px] text-danger">{t("career.shareFailed")}</span>
      )}
    </div>
  );
}

