"use client";

import type { ReactNode } from "react";

/**
 * One line of the player-info panel: a label on the left, its reading on the
 * right, and optional detail underneath.
 *
 * The panel is pinned to the height of the card beside it, so its contents
 * have a hard budget — four or five of these plus the stat tiles. They used to
 * be centred two-line blocks, each roughly twice this tall, which overflowed
 * the moment a career picked up a rival and clipped the support meter off the
 * bottom. Reading label-and-value across is also simply easier to scan than a
 * stack of centred cards.
 */
export function MetaRow({
  label,
  value,
  valueClass = "",
  title,
  compact = false,
  children,
}: {
  label: string;
  value: ReactNode;
  /** Accent for the reading. The word carries the meaning; colour reinforces it. */
  valueClass?: string;
  title?: string;
  /** Squeezed for a short window, where the whole panel has 57 fewer pixels. */
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg bg-background/60 px-2.5 ${compact ? "py-1" : "py-1.5"}`}
      title={title}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-muted-2">
          {label}
        </span>
        <span className={`truncate font-display text-[11px] font-black ${valueClass}`}>{value}</span>
      </div>
      {children}
    </div>
  );
}
