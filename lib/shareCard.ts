/**
 * Handing the finished PNG to the player.
 *
 * The image itself is painted in `lib/share/shareImage.ts`. This file is only
 * the delivery: a download on desktop, the native share sheet on a phone.
 *
 * It used to also contain a DOM-to-PNG rasteriser built on SVG
 * <foreignObject>, which cloned the on-screen layout and copied every computed
 * style onto the clone. Flex sizing does not survive that copy and the export
 * came out mangled, so the card is drawn onto a canvas now and none of that
 * machinery is needed.
 */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Revoking synchronously races the download: some browsers haven't started
  // reading the blob by the time click() returns, and the file arrives empty.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * True when the browser can share an actual image file, which is mostly
 * phones. Desktop browsers usually report `share` but refuse files, so the
 * file support has to be checked separately or the share silently fails.
 */
export function canShareImage(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  const probe = new File([new Blob()], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

export async function shareImage(blob: Blob, filename: string, title: string): Promise<void> {
  const file = new File([blob], filename, { type: "image/png" });
  await navigator.share({ files: [file], title });
}
