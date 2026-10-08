/**
 * A arte gerada do CRAQUE, portada do v1 (D1, GDD 31.2): avatar, escudos de
 * clube, troféus e selos de liga. Tudo sai como texto SVG ou data URI, sem
 * framework, para que a página e o pôster desenhem a mesma arte.
 *
 * O desenho é o do v1 sem alteração; `data.ts` liga o código ao mundo do v2,
 * e `trophy/extra.ts` acrescenta as peças que só o v2 precisa.
 */

export { contrastInk, darken, isLight, lighten, mix, separates, temper } from "./palette";

export {
  CLUB_CRESTS,
  getCrestSpec,
  isCuratedCrest,
  teamCrestSvg,
  teamCrestUrl,
  type CrestSpec,
  type DeviceKey,
  type FieldKind,
} from "./crest";

export {
  generatedTrophyUrl,
  isPlaceholderArt,
  renderTrophySvg,
  TROPHY_ART,
  trophyDataUri,
  type TrophyArtCategory,
  type TrophyShape,
  type TrophySpec,
} from "./trophy";

export { EXTRA_TROPHY_ART, trophyArtUrl } from "./trophy/extra";

export { generatedLeagueBadge, leagueLogoUrl, type LeagueBadgeSpec } from "./leagueBadge";

export { avatarDataUri, renderAvatarSvg, type AvatarSvgOptions } from "./avatar/toSvg";

export * from "./avatar/config";

export { toArtLeague, type KitDef, type KitPattern, type League as ArtLeague } from "./data";
