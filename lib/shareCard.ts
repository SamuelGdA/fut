/**
 * Turns a live DOM node into a PNG without pulling in a screenshot library.
 *
 * The trick is SVG's <foreignObject>, which can host XHTML and render it
 * through a normal <img>. Two things make that work in practice and both are
 * easy to get wrong:
 *
 * 1. The clone is completely isolated from the page's stylesheets, so every
 *    computed style has to be inlined onto every node first. Tailwind classes
 *    mean nothing inside the SVG.
 * 2. The canvas is tainted by any external image, so every <img> has to be
 *    turned into a data: URI before rasterising. All the artwork is local
 *    (public/craque-assets), which is what makes this possible at all — the
 *    same code would fail against a remote CDN.
 */

const PROPERTIES_TO_INLINE = [
  "font", "font-family", "font-size", "font-weight", "font-style", "letter-spacing",
  "line-height", "text-align", "text-transform", "text-decoration", "white-space",
  "color", "background", "background-color", "background-image", "background-size",
  "background-position", "background-repeat", "background-clip",
  "border", "border-radius", "box-shadow", "opacity", "filter", "mix-blend-mode",
  "display", "position", "top", "right", "bottom", "left", "z-index",
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "margin", "padding", "box-sizing", "overflow",
  "flex", "flex-direction", "flex-wrap", "align-items", "justify-content", "gap",
  "grid-template-columns", "grid-template-rows",
  "transform", "transform-origin", "object-fit", "clip-path",
  // getComputedStyle returns nothing for the -webkit-text-stroke shorthand, so
  // the longhands have to be listed or the shirt number loses its outline.
  "-webkit-text-stroke-width", "-webkit-text-stroke-color",
  "paint-order", "-webkit-background-clip", "-webkit-text-fill-color",
];

async function toDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function inlineStyles(source: Element, clone: Element): void {
  const computed = window.getComputedStyle(source);
  const declarations: string[] = [];
  for (const property of PROPERTIES_TO_INLINE) {
    const value = computed.getPropertyValue(property);
    if (value && value !== "none" && value !== "normal" && value !== "auto") {
      declarations.push(`${property}:${value}`);
    }
  }
  (clone as HTMLElement).setAttribute("style", declarations.join(";"));

  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);
  for (let i = 0; i < sourceChildren.length; i += 1) {
    if (cloneChildren[i]) inlineStyles(sourceChildren[i], cloneChildren[i]);
  }
}

/** Renders `node` to a PNG blob at `scale`× its on-screen size. */
export async function nodeToPngBlob(node: HTMLElement, scale = 3): Promise<Blob> {
  const rect = node.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);

  const clone = node.cloneNode(true) as HTMLElement;
  inlineStyles(node, clone);

  // Controls that live inside the captured area but have no business being in
  // a shared image — the share buttons themselves, above all.
  for (const control of Array.from(clone.querySelectorAll("[data-share-exclude]"))) {
    control.remove();
  }

  // Any remaining http(s) image would taint the canvas and make toBlob throw.
  await Promise.all(
    Array.from(clone.querySelectorAll("img")).map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        img.setAttribute("src", await toDataUri(src));
      } catch {
        // A crest that won't load shouldn't cost the player their card.
        img.remove();
      }
    }),
  );

  // The source may be parked off-screen (that's how the export layout stays
  // invisible), but the clone has to sit at the origin of the SVG or it
  // renders outside the viewport and the PNG comes back blank.
  clone.style.margin = "0";
  clone.style.transform = "none";
  clone.style.position = "static";
  clone.style.top = "auto";
  clone.style.left = "auto";
  clone.style.right = "auto";
  clone.style.bottom = "auto";

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<foreignObject width="100%" height="100%">` +
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px">${serialized}</div>` +
    `</foreignObject></svg>`;

  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("failed to rasterise the card"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas unavailable");
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas produced no image"));
    }, "image/png");
  });
}

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
