/**
 * O conteúdo do CRAQUE: tudo que é texto de jogo. O motor fala em ids
 * (`rivalSigned`, `academyBet`, `fixStarter`); aqui eles viram frases em
 * português, espanhol e inglês. Nada aqui muda resultado de carreira.
 */

export * from "./i18n";
export {
  baseOptionId,
  CAREER_TEXTS,
  careerPlural,
  careerText,
  clubName,
  competitionName,
  countryName,
  decisionText,
  displayName,
  describeEffect,
  describeEffects,
  effectTone,
  EVENT_TEXTS,
  eventOutcomeText,
  eventVars,
  hasEventText,
  optionLabel,
  positionName,
  type CareerKey,
  type CareerPluralKey,
  type DecisionText,
  type EffectTone,
} from "./text";
export {
  COVER_ANGLES,
  COVER_TEXTS,
  coverAngle,
  coverTone,
  paperName,
  seasonCovers,
  type CoverAngle,
  type CoverFacts,
  type CoverPick,
  type CoverTone,
  type SeasonCover,
} from "./cover";
export {
  careerRecords,
  compareRecord,
  REAL_RECORDS,
  RECORD_IDS,
  RECORD_TEXTS,
  RECORDS_CHECKED,
  recordsBeatenIn,
  recordText,
  type RealRecord,
  type RecordGroup,
  type RecordId,
  type RecordResult,
  type RecordStatus,
  type RecordText,
} from "./records";
export {
  careerHeadlines,
  HEADLINE_KEYS,
  HEADLINE_TEXTS,
  HEADLINES_MAX,
  seasonHeadlines,
  type CareerHeadline,
  type HeadlineKey,
  type HeadlineTone,
} from "./headlines";
export {
  ACHIEVEMENT_GROUPS,
  ACHIEVEMENT_IDS,
  ACHIEVEMENT_TEXTS,
  achievementGroupName,
  achievementMet,
  achievementProgress,
  achievementProgressText,
  ACHIEVEMENTS,
  achievementText,
  careerAchievementCounts,
  getAchievement,
  newAchievements,
  type Achievement,
  type AchievementContext,
  type AchievementGroup,
  type AchievementProgress,
} from "./achievements";
export {
  axisName,
  CHALLENGE_TEXTS,
  edictName,
  edictRule,
  edictStateName,
  missionGoal,
  missionHint,
  missionName,
  missionValue,
} from "./challenge";
export { BIO_TEXTS, biography, type BioChapter, type Biography } from "./biography/generate";
export { bioFacts, stintsOf, type BioFacts, type Stint } from "./biography/facts";
export { CHAPTER_CAPS, CHAPTERS, THEME_IDS, THEMES, type ChapterId, type ThemeId } from "./biography/themes";
export type { CoverMessages } from "./locales/cover.pt";
export type { HeadlinesMessages } from "./locales/headlines.pt";
export type { BioMessages } from "./locales/bio.pt";
export type { RecordsMessages } from "./locales/records.pt";
export type { AchievementsMessages } from "./locales/achievements.pt";
export type { ChallengeMessages } from "./locales/challenge.pt";
export type { CareerMessages } from "./locales/career.pt";
export type { EventsMessages } from "./locales/events.pt";
export { contenderName, culturesOf, generatedName, generatedParts, type ContenderNameInput, type NameParts } from "./names/generate";
export { CONFEDERATION_CULTURES, COUNTRY_CULTURES, FAMOUS_NAMES, NAME_POOLS, type NameCulture, type NamePool } from "./names/pools";
