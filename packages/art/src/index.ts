/**
 * Everything the game draws that is not a photograph.
 *
 * Club crests, competition trophies, league badges, the player's portrait and
 * the player card. All of it generated from the dataset rather than shipped as
 * files, so a club added tomorrow gets a badge that belongs to the same set
 * without anyone opening a drawing program.
 *
 * Framework-free by rule. Vector art leaves here as a string or a data URI and
 * the card leaves as instructions for a canvas; nothing in this package knows
 * what a component is. That is what lets the share poster and the page draw
 * the same art without one of them having to render first so the other can
 * scrape it.
 */

// Palette helpers, shared by every generator here.
export {
  contrastInk,
  darken,
  isLight,
  lighten,
  mix,
  separates,
  temper,
} from "./palette";

// Club crests.
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

// Competition trophies.
export {
  TROPHY_ART,
  generatedTrophyUrl,
  isPlaceholderArt,
  renderTrophySvg,
  trophyDataUri,
  type TrophyShape,
  type TrophySpec,
  type TrophyArtCategory,
} from "./trophy";

// League badges.
export {
  generatedLeagueBadge,
  leagueLogoUrl,
  type LeagueBadgeSpec,
} from "./leagueBadge";

// The player's portrait.
export {
  avatarDataUri,
  renderAvatarSvg,
  type AvatarSvgOptions,
} from "./avatar/toSvg";

export * from "./avatar/config";

// The player card: one definition, two renderers.
export {
  FC_CARD_SIZES,
  SHIELD_CLIP_PATH,
  SHIELD_POINTS,
  TIER_BANDS,
  TIER_CANVAS_STYLE,
  TIER_DOM_STYLE,
  cardTier,
  tierProgress,
  type CardTier,
  type FcCardSize,
  type TierCanvasStyle,
  type TierDomStyle,
} from "./card/tiers";

export { paintFcCard, type FcCardAttribute, type FcCardPaint } from "./card/toCanvas";

// The 2D drawing surface the canvas renderers share.
export * from "./surface/canvas";
