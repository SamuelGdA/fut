import { createRng, nextInt, type Rng } from "@/lib/sim/rng";
import type { Locale } from "@/lib/i18n/context";
import type { CareerState } from "@/lib/sim/career";
import { buildBioFacts, type BioFacts } from "./facts";
import { BIO_CHAPTER_ORDER, BIO_TOPICS, type BioChapter, type BioTopic, type BioVars } from "./phrases";
import { recordById } from "./records";

/**
 * How many lines each chapter may print. Kept tight on purpose: a biography
 * that says everything says nothing, and the cap is what forces two similar
 * careers to surface *different* details rather than the same exhaustive list.
 */
const CHAPTER_LIMITS: Record<BioChapter, number> = {
  origins: 3,
  rise: 3,
  peak: 4,
  twilight: 3,
  legacy: 3,
};

export interface BioParagraph {
  chapter: BioChapter;
  sentences: string[];
}

export interface Biography {
  paragraphs: BioParagraph[];
  /** Every line in order, for callers that just want the prose. */
  sentences: string[];
}

function formatList(items: string[], locale: Locale): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  const conjunction = locale === "en" ? "and" : locale === "es" ? "y" : "e";
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items[items.length - 1]}`;
}

/**
 * Turns broken records into a readable clause naming the old mark and holder,
 * which is the part that makes the achievement land — "73, Messi's" says far
 * more than "a record".
 */
function recordClause(facts: BioFacts, locale: Locale): string {
  const parts = facts.brokenRecords.map((broken) => {
    const record = recordById(broken.id);
    const label = record.label[locale];
    if (locale === "en") {
      return broken.equalled
        ? `matched ${record.holder}'s ${broken.previous} ${label}`
        : `${broken.achieved} ${label}, past ${record.holder}'s ${broken.previous}`;
    }
    if (locale === "es") {
      return broken.equalled
        ? `igualó los ${broken.previous} ${label} de ${record.holder}`
        : `${broken.achieved} ${label}, superando los ${broken.previous} de ${record.holder}`;
    }
    return broken.equalled
      ? `igualou os ${broken.previous} ${label} de ${record.holder}`
      : `${broken.achieved} ${label}, superando os ${broken.previous} de ${record.holder}`;
  });
  return formatList(parts, locale);
}

function buildVars(facts: BioFacts, locale: Locale, positionLabel: string): BioVars {
  return {
    lastName: facts.lastName,
    position: positionLabel,
    nation: facts.nationality,
    number: facts.shirtNumber !== null ? String(facts.shirtNumber) : "",
    firstClub: facts.firstClub?.name ?? "",
    lastClub: facts.lastClub?.name ?? "",
    bigClub: facts.biggestClub?.name ?? "",
    longestClub: facts.longestSpell?.name ?? "",
    breakoutClub: facts.breakoutClub?.name ?? "",
    homecomingAge: String(facts.homecomingAge ?? ""),
    giantMoveAge: String(facts.giantMoveAge ?? ""),
    severeInjuryAge: String(facts.severeInjuryAge ?? ""),
    giantClub: facts.giantMove?.name ?? "",
    idolClub: facts.idolClubs[0] ?? "",
    legendClub: facts.legendClubs[0] ?? "",
    rival: facts.rivalName ?? "",
    peakAge: String(facts.peakAge),
    retireAge: String(facts.retirementAge),
    firstLeagueAge: String(facts.firstLeagueAge ?? ""),
    firstCupAge: String(facts.firstCupAge ?? ""),
    firstContinentalAge: String(facts.firstContinentalAge ?? ""),
    firstCallUpAge: String(facts.firstCallUpAge ?? ""),
    goals: String(facts.totalGoals),
    assists: String(facts.totalAssists),
    apps: String(facts.totalAppearances),
    cleanSheets: String(facts.totalCleanSheets),
    caps: String(facts.caps),
    trophies: String(facts.totalTrophies),
    bestAge: String(facts.bestSeason?.age ?? ""),
    bestClub: facts.bestSeason?.teamName ?? "",
    bestGoals: String(facts.bestSeason?.goals ?? ""),
    bestAssists: String(facts.bestSeason?.assists ?? ""),
    bestApps: String(facts.bestSeason?.appearances ?? ""),
    recordList: recordClause(facts, locale),
  };
}

/** Unresolved tokens are left visible on purpose — a silent blank hides bugs. */
function interpolate(template: string, vars: BioVars): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}

function pickIndex(rng: Rng, length: number): { rng: Rng; index: number } {
  const roll = nextInt(rng, 0, length - 1);
  return { rng: roll.rng, index: roll.value };
}

/**
 * Chooses which eligible topics actually make the cut. Priority decides who is
 * in contention, but the tie-break is seeded randomness, so two careers with
 * an identical fact profile still don't produce an identical article.
 */
function selectTopics(
  candidates: BioTopic[],
  limit: number,
  rng: Rng,
): { rng: Rng; picked: BioTopic[] } {
  if (candidates.length <= limit) return { rng, picked: candidates };

  const remaining = [...candidates];
  const picked: BioTopic[] = [];
  let cur = rng;

  while (picked.length < limit && remaining.length > 0) {
    const best = Math.max(...remaining.map((t) => t.priority));
    const tier = remaining.filter((t) => t.priority === best);
    const choice = pickIndex(cur, tier.length);
    cur = choice.rng;
    const chosen = tier[choice.index];
    picked.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
  }

  return { rng: cur, picked };
}

/**
 * Assembles a career's biography: keeps only the lines this career actually
 * earned, orders them by chapter so the result reads chronologically, and
 * picks a different phrasing each time from the variants available.
 *
 * Deterministic per career — the same save always produces the same article,
 * because it is seeded off the career seed rather than Math.random.
 */
export function generateBiography(
  career: CareerState,
  locale: Locale,
  positionLabel: string,
): Biography {
  const facts = buildBioFacts(career, locale);
  const vars = buildVars(facts, locale, positionLabel);

  let rng = createRng(`${career.seed}:bio:${locale}`);

  // Pick each chapter's lines first, keeping the author's declared order
  // within a chapter — that ordering is what makes consecutive lines flow.
  const perChapter: { chapter: BioChapter; topics: BioTopic[] }[] = [];
  for (const chapter of BIO_CHAPTER_ORDER) {
    const eligible = BIO_TOPICS.filter((t) => t.chapter === chapter && t.when(facts));
    const selection = selectTopics(eligible, CHAPTER_LIMITS[chapter], rng);
    rng = selection.rng;
    perChapter.push({
      chapter,
      topics: selection.picked.sort((a, b) => BIO_TOPICS.indexOf(a) - BIO_TOPICS.indexOf(b)),
    });
  }

  // Then sort every line that names a specific age chronologically across the
  // *whole* article, not just inside its own chapter. A chapter is a rough
  // stage of a career, not a hard age bracket: a continental title won at 18
  // would otherwise sit in "peak" and print after a first league title at 37.
  // Dated lines are redistributed into the dated slots in document order, so
  // undated lines never move and each paragraph keeps its length.
  const flat = perChapter.flatMap((c, chapterIndex) =>
    c.topics.map((topic, slot) => ({ chapterIndex, slot, topic })),
  );
  const datedPositions: { chapterIndex: number; slot: number }[] = [];
  const datedTopics: { topic: BioTopic; age: number }[] = [];
  for (const entry of flat) {
    const age = entry.topic.at?.(facts);
    if (age === null || age === undefined) continue;
    datedPositions.push({ chapterIndex: entry.chapterIndex, slot: entry.slot });
    datedTopics.push({ topic: entry.topic, age });
  }
  datedTopics.sort((a, b) => a.age - b.age);
  datedPositions.forEach((pos, i) => {
    perChapter[pos.chapterIndex].topics[pos.slot] = datedTopics[i].topic;
  });

  const paragraphs: BioParagraph[] = [];
  const all: string[] = [];
  for (const { chapter, topics } of perChapter) {
    const sentences: string[] = [];
    for (const chosen of topics) {
      const variants = chosen.variants[locale];
      if (!variants || variants.length === 0) continue;
      const choice = pickIndex(rng, variants.length);
      rng = choice.rng;
      sentences.push(interpolate(variants[choice.index], vars));
    }
    if (sentences.length > 0) {
      paragraphs.push({ chapter, sentences });
      all.push(...sentences);
    }
  }

  return { paragraphs, sentences: all };
}
