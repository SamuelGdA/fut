"use client";

import { useState, type RefObject } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useSound } from "@/lib/useSound";
import { canShareImage, downloadBlob, nodeToPngBlob, shareImage } from "@/lib/shareCard";

type Status = "idle" | "working" | "error";

/**
 * Download or share the finished card as a PNG. The share button only appears
 * where the browser can actually hand over a file — desktop browsers report
 * `navigator.share` but refuse image files, so offering it there would just
 * fail in the user's face.
 */
export function ShareCardButtons({
  target,
  playerName,
}: {
  target: RefObject<HTMLElement | null>;
  playerName: string;
}) {
  const { t } = useI18n();
  const sound = useSound();
  const [status, setStatus] = useState<Status>("idle");
  const [shareable] = useState(() => canShareImage());

  const filename = `craque-${playerName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "carreira"}.png`;

  async function run(action: "download" | "share") {
    const node = target.current;
    if (!node || status === "working") return;
    setStatus("working");
    try {
      const blob = await nodeToPngBlob(node);
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
