"use client";

import { useState } from "react";

/**
 * Crests, flags and trophies are served from /public/craque-assets — the game
 * owns its artwork rather than hotlinking it, so it keeps working offline and
 * doesn't break the day someone else's CDN changes a path.
 *
 * They are plain <img> so no Next image loader config is required, and each
 * one degrades to a neutral placeholder if the asset is missing (a fair number
 * of the smaller national sides simply have no crest in the set).
 */

/** Club and competition logos ship in a light ("/L/") and dark ("/D/") variant. */
export function darkVariant(url: string): string {
  return url.replace("/L/", "/D/");
}

interface RemoteImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

function RemoteImage({ src, alt, className, fallback }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback ?? null}</>;
  // Loaded eagerly: these are small SVG/PNG assets and lazy-loading inside the
  // scrollable pickers kept them from ever being requested.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}

export function ClubCrest({
  src,
  name,
  size = 40,
  className = "",
  variant = "dark",
  dim = false,
}: {
  src?: string;
  name: string;
  size?: number;
  className?: string;
  /** The site ships light/dark crest variants; small inline badges use dark, the big card watermark uses light. */
  variant?: "dark" | "light";
  /** Greyed out and dimmed, used for the national team crest before the first cap. */
  dim?: boolean;
}) {
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

  if (!src) return placeholder;
  const resolved = variant === "dark" ? darkVariant(src) : src;

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
  className = "h-10 w-10",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const placeholder = <span className={`flex items-center justify-center ${className}`}>🏆</span>;
  if (!src) return placeholder;
  return (
    <RemoteImage
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
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
export function CrestWatermark({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 object-contain opacity-[0.04] grayscale sm:h-64 sm:w-64"
      />
    </div>
  );
}

/**
 * Only the larger footballing nations actually have a crest in the asset set —
 * the rest 404 and fall back to the flag, which is the same behaviour they had
 * when these were fetched remotely.
 */
export function nationalTeamCrestUrl(fifaCode: string): string {
  return `/craque-assets/logos/football/teams/international/L/${fifaCode.trim().toUpperCase()}.svg`;
}
