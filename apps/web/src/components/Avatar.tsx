import { renderAvatarSvg, type AvatarConfig } from "@craque/art";
import type { KitDef } from "@craque/data";

/**
 * The portrait, on the page.
 *
 * The drawing itself lives in `@craque/art` and comes back as a string of SVG,
 * which this does nothing to except put it in the document. That split is what
 * lets the share poster paint the same face without mounting an invisible copy
 * of this component off-screen and scraping the DOM for it, which is exactly
 * what it used to do.
 *
 * The wrapper is `display: contents`, so it disappears from layout entirely
 * and the `<svg>` inside behaves as if it were this component's own root. That
 * keeps every existing `className` working unchanged: `h-full w-auto` on the
 * card, `h-full w-full` in the customiser.
 */
export function Avatar({
  config,
  className = "",
  showBackground = true,
  kit,
}: {
  config: AvatarConfig | null;
  className?: string;
  showBackground?: boolean;
  kit?: KitDef | null;
}) {
  const markup = renderAvatarSvg(config, { kit, showBackground, className });
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: markup }} />;
}
