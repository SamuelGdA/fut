import type { ShareNetwork } from "../features/summary/shareTargets";
import { BRAND_ICONS } from "./brandIcons";

export function BrandIcon({ network, size = 22 }: { network: ShareNetwork; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" fill="currentColor">
      <path d={BRAND_ICONS[network].path} />
    </svg>
  );
}
