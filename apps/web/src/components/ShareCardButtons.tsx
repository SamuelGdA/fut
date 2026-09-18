"use client";

import { useRef, useState } from "react";
import { countryName, useI18n } from "@/lib/i18n/context";
import { useSound } from "@/lib/useSound";
import { useCareerStore } from "@/store/careerStore";
import { Avatar } from "@/components/Avatar";
import { getKitForTeam } from "@/lib/kits";
import { BRAND_COPY } from "@/lib/brandCopy";
import { canShareImage, downloadBlob, shareImage } from "@/lib/shareCard";
import { renderShareImage } from "@/lib/share/shareImage";
import type { CareerState } from "@/lib/sim/career";
import type { AvatarConfig } from "@/lib/avatar/config";

type Status = "idle" | "working" | "error";

/**
 * Download or share the finished career as a PNG.
 *
 * The poster is painted onto a canvas, so the only thing this component has to
 * provide from the DOM is the portrait: the avatar is an inline SVG with every
 * fill written on the element, which makes it the one piece of the design that
 * can be lifted out of the page and rasterised as-is. It is mounted off-screen
 * rather than hidden, because a `display: none` subtree has no layout and
 * nothing to serialise.
 *
 * The share button only appears where the browser can actually hand over a
 * file — desktop browsers report `navigator.share` but refuse image files, so
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
  const portraitRef = useRef<HTMLDivElement>(null);

  const playerName = career.identity.lastName;
  const filename = `craque-${playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "carreira"}.png`;

  // The card depicts the player at their peak, so the shirt is the one they
  // wore that season.
  const peakSeason = career.seasons.reduce(
    (best, s) => (best && best.overall >= s.overall ? best : s),
    career.seasons[0] ?? null,
  );
  const kit = getKitForTeam(peakSeason?.teamId ?? career.currentTeamId);

  async function run(action: "download" | "share") {
    if (status === "working") return;
    setStatus("working");
    try {
      const blob = await renderShareImage({
        career,
        avatar,
        avatarSvg: serialisePortrait(portraitRef.current),
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
      <div
        ref={portraitRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-[-300vw] h-[200px] w-[200px]"
      >
        <Avatar config={avatar} kit={kit} showBackground={false} className="h-[200px] w-[200px]" />
      </div>

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

/**
 * Lifts the portrait out of the page as standalone SVG markup.
 *
 * The clone gets explicit pixel dimensions: an SVG that carries only a viewBox
 * has no intrinsic size, and a browser asked to load one through an <img> can
 * report it as 0x0.
 */
export function serialisePortrait(host: HTMLElement | null): string | null {
  const svg = host?.querySelector("svg");
  if (!svg) return null;
  const clone = svg.cloneNode(true) as SVGElement;
  clone.setAttribute("width", "400");
  clone.setAttribute("height", "400");
  clone.removeAttribute("class");
  return new XMLSerializer().serializeToString(clone);
}
