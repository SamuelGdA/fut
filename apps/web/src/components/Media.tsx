"use client";

import { useState } from "react";
import { teamCrestUrl } from "@/lib/crests";

/**
 * Flags, league logos and trophies are served from /public/craque-assets — the
 * game owns its artwork rather than hotlinking it, so it keeps working offline
 * and doesn't break the day someone else's CDN changes a path.
 *
 * They are plain <img> so no Next image loader config is required, and each
 * one degrades to a neutral placeholder if the asset is missing (a fair number
 * of the smaller national sides simply have no crest in the set).
 *
 * Club badges are different: they are not files at all. `lib/crests` draws a
 * circular identity for every club from its colours, its kit pattern and one
 * symbol tied to the club — see that folder's README-in-comments. Pass
 * `teamId` and the badge is generated; pass `src` (league logos) and the file
 * is fetched as before.
 */

interface RemoteImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

function RemoteImage({ src, alt, className, style, fallback }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback ?? null}</>;
  // Loaded eagerly: these are small SVG/PNG assets and lazy-loading inside the
  // scrollable pickers kept them from ever being requested.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />
  );
}

export function ClubCrest({
  src,
  teamId,
  name,
  size = 40,
  className = "",
  dim = false,
}: {
  src?: string;
  /** A club id from the dataset — draws its generated circular identity. */
  teamId?: string;
  name: string;
  size?: number;
  className?: string;
  /** Greyed out and dimmed, used for the national team crest before the first cap. */
  dim?: boolean;
}) {
  const resolved = teamId ? teamCrestUrl(teamId) : src;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const placeholder = (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white/10 font-bold text-muted"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );

  if (!resolved) return placeholder;

  return (
    <RemoteImage
      src={resolved}
      alt={name}
      className={`shrink-0 object-contain transition-[filter,opacity] duration-500 ${dim ? "grayscale opacity-30" : ""} ${className}`}
      fallback={placeholder}
    />
  );
}

export function Flag({
  src,
  alt,
  className = "h-4 w-6",
  dim = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  dim?: boolean;
}) {
  const placeholder = <span className={`inline-block rounded-sm bg-white/10 ${className}`} aria-hidden />;
  if (!src) return placeholder;
  return (
    <RemoteImage
      src={src}
      alt={alt}
      className={`inline-block rounded-sm object-cover transition-[filter,opacity] duration-500 ${dim ? "grayscale opacity-30" : ""} ${className}`}
      fallback={placeholder}
    />
  );
}

export function TrophyImage({
  src,
  alt,
  size,
  className = "h-10 w-10",
}: {
  src?: string;
  alt: string;
  /**
   * Pixel box, when the caller computes it. Overrides `className` sizing.
   * A number is a square; a pair lets the caller give a wide silhouette less
   * width than a tall one — see the cabinet, where a flat salver at the same
   * square size as a slim cup reads as twice the trophy.
   */
  size?: number | { width: number; height: number };
  className?: string;
}) {
  const box =
    size === undefined
      ? undefined
      : typeof size === "number"
        ? { width: size, height: size }
        : size;
  const placeholder = (
    <span className={`flex items-center justify-center ${className}`} style={box}>
      🏆
    </span>
  );
  if (!src) return placeholder;
  return (
    <RemoteImage
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      style={box}
      fallback={placeholder}
    />
  );
}

/** The tiny pitch + ball icon pair the original shows next to every position label. */
export function PositionIcons({ size = 10, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-0.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/career-simulator/pitch.svg" alt="" style={{ width: size, height: size }} className="opacity-75" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/career-simulator/goal.svg" alt="" style={{ width: size, height: size }} className="opacity-75" />
    </span>
  );
}

/** Giant, near-invisible crest watermark decorating the player card. */
export function CrestWatermark({ src, teamId }: { src?: string; teamId?: string }) {
  const resolved = teamId ? teamCrestUrl(teamId) : src;
  if (!resolved) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolved}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 object-contain opacity-[0.04] grayscale sm:h-64 sm:w-64"
      />
    </div>
  );
}

// National sides are represented by their flag alone. The federation crests
// that used to sit alongside it were official artwork, and a flag is already
// the strongest, most recognisable identity a country has — nothing a drawn
// badge could add would beat it.
