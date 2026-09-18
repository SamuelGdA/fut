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
  rise: 4,
  peak: 6,
  twilight: 3,
  legacy: 4,
};

export interface BioParagraph {
  chapter: BioChapter;
  sentences: string[];
}

export interface Biography {
  paragraphs: BioParagraph[];
  /** Every line in order, for callers that just want the prose. */
  sentences: string[];
  /**
   * Which topics produced those lines, in the same order. Nothing in the UI
   * reads this — it exists so the phrase library can be audited against real
   * careers without having to reverse-engineer the prose.
   */
  topicIds: string[];
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
/**
 * Feminine plural nouns the record labels start with, per language. The clause
 * puts a definite article in front of the label, and "os assistências" is
 * simply wrong — Portuguese and Spanish disagree on `partidas`/`partidos`, so
 * the two lists are kept apart rather than guessed from the ending.
 */
const FEMININE_LABEL_HEADS: Record<Locale, string[]> = {
  // "bolas" for the Ballon d'Or streak label ("Bolas de Ouro seguidas") — "a
  // bola", feminine, unlike the masculine "balón" the Spanish label already
  // defaults to correctly.
  pt: ["copas", "assistências", "partidas", "bolas"],
  es: ["copas", "asistencias"],
  en: [],
};

function definiteArticle(label: string, locale: Locale): string {
  const head = label.trim().split(/\s+/)[0].toLowerCase();
  const feminine = FEMININE_LABEL_HEADS[locale].includes(head);
  if (locale === "es") return feminine ? "las" : "los";
  return feminine ? "as" : "os";
}

function recordClause(facts: BioFacts, locale: Locale): string {
  const parts = facts.brokenRecords.map((broken) => {
    const record = recordById(broken.id);
    const label = record.label[locale];
    if (locale === "en") {
      return broken.equalled
        ? `matched ${record.holder}'s ${broken.previous} ${label}`
        : `${broken.achieved} ${label}, past ${record.holder}'s ${broken.previous}`;
    }
    const article = definiteArticle(label, locale);
    if (locale === "es") {
      return broken.equalled
        ? `igualó ${article} ${broken.previous} ${label} de ${record.holder}`
        : `${broken.achieved} ${label}, superando ${article} ${broken.previous} de ${record.holder}`;
    }
    return broken.equalled
      ? `igualou ${article} ${broken.previous} ${label} de ${record.holder}`
      : `${broken.achieved} ${label}, superando ${article} ${broken.previous} de ${record.holder}`;
  });
  return formatList(parts, locale);
}

/**
 * "{superCups} supercopas e {leagueCups} copas da liga" prints "1 copas" and,
 * worse, "0 copas" whenever one of the two is missing. Building the clause
 * from only the categories the player actually won fixes both.
 */
function secondaryTrophyClause(facts: BioFacts, locale: Locale): string {
  const label = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const parts: string[] = [];
  if (facts.superCupTitles > 0) {
    parts.push(
      locale === "en"
        ? label(facts.superCupTitles, "super cup", "super cups")
        : locale === "es"
          ? label(facts.superCupTitles, "supercopa", "supercopas")
          : label(facts.superCupTitles, "supercopa", "supercopas"),
    );
  }
  if (facts.leagueCupTitles > 0) {
    parts.push(
      locale === "en"
        ? label(facts.leagueCupTitles, "league cup", "league cups")
        : locale === "es"
          ? label(facts.leagueCupTitles, "copa de la liga", "copas de la liga")
          : label(facts.leagueCupTitles, "copa da liga", "copas da liga"),
    );
  }
  return formatList(parts, locale);
}

function buildVars(facts: BioFacts, locale: Locale, positionLabel: string): BioVars {
  return {
    lastName: facts.lastName,
    position: positionLabel,
    nation: facts.nationality,
    birthNation: facts.birthNationality,
    number: facts.shirtNumber !== null ? String(facts.shirtNumber) : "",
    firstClub: facts.firstClub?.name ?? "",
    lastClub: facts.lastClub?.name ?? "",
    bigClub: facts.biggestClub?.name ?? "",
    longestClub: facts.longestSpell?.name ?? "",
    promotionClub: facts.promotionClub ?? "",
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
    // Named, not generic: "the Sudamericana" and "the Libertadores" are very
    // different sentences and the bio used to print the same one for both.
    continentalPrimary: facts.firstContinentalPrimary?.name ?? "",
    continentalPrimaryAge: String(facts.firstContinentalPrimary?.age ?? ""),
    continentalSecondary: facts.firstContinentalSecondary?.name ?? "",
    continentalSecondaryAge: String(facts.firstContinentalSecondary?.age ?? ""),
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

    // Where the career actually went, and the spell that defined it.
    itinerary: formatList(facts.itinerary.map((s) => s.name), locale),
    keyClub: facts.keySpell?.name ?? "",
    keySeasons: String(facts.keySpell?.seasons ?? ""),
    keyApps: String(facts.keySpell?.appearances ?? ""),
    keyGoals: String(facts.keySpell?.goals ?? ""),
    keyAssists: String(facts.keySpell?.assists ?? ""),
    keyFrom: String(facts.keySpell?.from ?? ""),
    keyTo: String(facts.keySpell?.to ?? ""),
    // The offer that got away.
    turnedDownClub: facts.roadNotTaken?.club ?? "",
    turnedDownAge: String(facts.roadNotTaken?.age ?? ""),
    tookInstead: facts.roadNotTaken?.joinedInstead ?? "",
    returnClub: facts.returns[facts.returns.length - 1]?.name ?? "",
    returnAge: String(facts.returns[facts.returns.length - 1]?.age ?? ""),

    // Repeat counts, so a serial winner never reads like a one-off.
    topFlightTitles: String(facts.topFlightTitles),
    secondTierTitles: String(facts.secondTierTitles),
    secondTierAge: String(facts.firstSecondTierTitleAge ?? ""),
    contPrimary: String(facts.continentalPrimaryTitles),
    contSecondary: String(facts.continentalSecondaryTitles),
    contTertiary: String(facts.continentalTertiaryTitles),
    tertiaryAge: String(facts.firstTertiaryAge ?? ""),
    cupTitles: String(facts.cupTitles),
    leagueCups: String(facts.leagueCupTitles),
    superCups: String(facts.superCupTitles),
    secondaryTrophies: secondaryTrophyClause(facts, locale),
    clubWorldCups: String(facts.clubWorldCups),
    worldCups: String(facts.worldCups),
    natTitles: String(facts.nationalContinentalTitles),
    trophySeasons: String(facts.trophySeasons),
    bestTrophyAge: String(facts.bestTrophySeason?.age ?? ""),
    bestTrophyCount: String(facts.bestTrophySeason?.count ?? ""),
    bestTrophyClub: facts.bestTrophySeason?.teamName ?? "",

    suspensionSpan:
      facts.suspendedSeasons === 1
        ? locale === "en"
          ? "a season"
          : locale === "es"
            ? "una temporada"
            : "uma temporada"
        : `${facts.suspendedSeasons} ${locale === "en" ? "seasons" : "temporadas"}`,
    peakPlateau: String(facts.peakPlateauSeasons),
    declineDrop: String(facts.declineDrop),
    nationalGoals: String(facts.nationalGoals),
    ballonDors: String(facts.ballonDors),
    goldenBoots: String(facts.goldenBoots),
    clubCount: String(facts.clubCount),
    loanCount: String(facts.loanCount),
    countries: String(facts.countriesPlayedIn),
    seasonsPlayed: String(facts.spells.reduce((n, s) => n + s.seasons, 0)),
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
  usedGroups: Set<string>,
  facts: BioFacts,
): { rng: Rng; picked: BioTopic[] } {
  const remaining = candidates.filter((t) => !t.group || !usedGroups.has(t.group));
  const picked: BioTopic[] = [];
  let cur = rng;
  const rank = (t: BioTopic) => (typeof t.priority === "function" ? t.priority(facts) : t.priority);

  while (picked.length < limit && remaining.length > 0) {
    const best = Math.max(...remaining.map(rank));
    const tier = remaining.filter((t) => rank(t) === best);
    const choice = pickIndex(cur, tier.length);
    cur = choice.rng;
    const chosen = tier[choice.index];
    picked.push(chosen);
    remaining.splice(remaining.indexOf(chosen), 1);
    // Anything that would repeat this point is out for the whole article, not
    // just for this chapter.
    if (chosen.group) {
      usedGroups.add(chosen.group);
      for (let i = remaining.length - 1; i >= 0; i -= 1) {
        if (remaining[i].group === chosen.group) remaining.splice(i, 1);
      }
    }
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
/**
 * Words too ordinary for their presence to make two lines sound alike. Not a
 * full stop-word list — only the ones long enough to survive the length
 * filter below, in all three languages at once.
 */
const ECHO_FILLER = new Set([
  "mais", "menos", "muito", "ainda", "depois", "quando", "onde", "entre", "sobre", "como",
  "para", "pelo", "pela", "esse", "essa", "isso", "aquilo", "seus", "suas", "cada",
  "mas", "aun", "cuando", "donde", "sobre", "como", "cada", "sus", "eso",
  "more", "less", "very", "still", "after", "when", "where", "between", "about", "each",
  "their", "there", "then", "than", "with", "that", "this", "into", "over", "just",
]);

/**
 * The three-word runs in a line that a reader would notice hearing twice.
 *
 * Placeholders collapse to a single token, so "{giantClub} bateu à porta" and
 * "o futebol estrangeiro bater à porta" line up on the half that matters. A
 * run counts only if at least two of its words carry meaning, which keeps
 * connective tissue like "o tipo de" from looking like an echo. Club and
 * country names never reach this: it reads the template, not the finished
 * sentence, and naming the same club twice in one profile is not repetition.
 */
function echoKeys(template: string): string[] {
  const tokens = template
    .replace(/\{[^}]+\}/g, " ¤ ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9¤\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const keys: string[] = [];
  for (let i = 0; i + 3 <= tokens.length; i += 1) {
    const run = tokens.slice(i, i + 3);
    const meaty = run.filter((w) => w.length >= 4 && w !== "¤" && !ECHO_FILLER.has(w));
    if (meaty.length >= 2) keys.push(run.join(" "));
  }
  return keys;
}

/**
 * The variant that repeats the least of what this article has already said.
 * Ties are broken at random, so an article with nothing to avoid still varies
 * exactly as much as it did before.
 */
function pickFreshestVariant(
  rng: Rng,
  variants: string[],
  spent: Set<string>,
): { rng: Rng; index: number } {
  let best = Number.POSITIVE_INFINITY;
  const freshest: number[] = [];
  for (let i = 0; i < variants.length; i += 1) {
    const echoes = echoKeys(variants[i]).filter((key) => spent.has(key)).length;
    if (echoes < best) {
      best = echoes;
      freshest.length = 0;
    }
    if (echoes === best) freshest.push(i);
  }
  const choice = pickIndex(rng, freshest.length);
  return { rng: choice.rng, index: freshest[choice.index] };
}
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
  const usedGroups = new Set<string>();
  for (const chapter of BIO_CHAPTER_ORDER) {
    const eligible = BIO_TOPICS.filter((t) => t.chapter === chapter && t.when(facts));
    const selection = selectTopics(eligible, CHAPTER_LIMITS[chapter], rng, usedGroups, facts);
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
  //
  // Only lines that describe something that *happened* on a date declare `at`.
  // A line describing a standing state ("reached elite level") must not, or it
  // gets carried out of its chapter and printed inside the decline paragraph.
  // A chapter decides *which* lines a career has earned. It must not decide
  // where a dated line is printed, because the phrase library groups lines by
  // theme and a career does not: a continental title can land at 17 and a
  // first league title at 37.
  //
  // So every line that names an age is re-filed into the chapter whose age
  // band actually contains it, and the whole article is then in order. The
  // bands come from this career — its own start, peak and retirement — rather
  // than from fixed ages, because a peak at 24 and a peak at 33 are both real.
  //
  // Two earlier attempts failed and are worth not repeating: sorting globally
  // while keeping the authored chapter printed "reached elite level at 28"
  // inside the decline paragraph, and sorting only within a chapter left a
  // return at 28 printing after a spell that ran from 34 to 39.
  const startAge = facts.spells[0]?.from ?? facts.peakAge;
  const bands: { chapter: BioChapter; until: number }[] = [
    { chapter: "origins", until: Math.min(startAge + 3, facts.peakAge - 1) },
    { chapter: "rise", until: Math.max(facts.peakAge - 2, startAge + 4) },
    { chapter: "peak", until: facts.peakAge + 3 },
    { chapter: "twilight", until: facts.retirementAge - 1 },
    { chapter: "legacy", until: Number.POSITIVE_INFINITY },
  ];
  const chapterForAge = (age: number): BioChapter =>
    bands.find((b) => age <= b.until)?.chapter ?? "legacy";

  const buckets = new Map<BioChapter, { topic: BioTopic; sort: number; authored: number }[]>();
  for (const chapter of BIO_CHAPTER_ORDER) buckets.set(chapter, []);
  let authoredIndex = 0;
  for (const { chapter, topics } of perChapter) {
    for (const topic of topics) {
      const age = topic.at?.(facts) ?? null;
      // Retirement lines are summary statements; they belong at the end even
      // though they carry the final age.
      const target = age === null || chapter === "legacy" ? chapter : chapterForAge(age);
      const band = bands.find((b) => b.chapter === target);
      buckets.get(target)!.push({
        topic,
        // Undated lines open their chapter, in the order they were authored;
        // dated lines follow in age order.
        sort: age ?? -Infinity,
        authored: authoredIndex++,
      });
      void band;
    }
  }
  for (const list of buckets.values()) {
    list.sort((a, b) => (a.sort === b.sort ? a.authored - b.authored : a.sort - b.sort));
  }
  perChapter.length = 0;
  for (const chapter of BIO_CHAPTER_ORDER) {
    perChapter.push({ chapter, topics: buckets.get(chapter)!.map((e) => e.topic) });
  }

  const paragraphs: BioParagraph[] = [];
  const all: string[] = [];
  const topicIds: string[] = [];
  // Phrasing already spent on this article. Two topics written months apart
  // can reach for the same turn of phrase — six of them open with "aos {age}
  // anos veio..." — and a career that earns both then reads as if the writer
  // ran out of words. Every topic has four ways of saying its line, so the
  // fix is to spend them: pick the variant that echoes the least of what has
  // already been printed.
  const spentPhrasing = new Set<string>();
  for (const { chapter, topics } of perChapter) {
    const sentences: string[] = [];
    for (const chosen of topics) {
      const variants = chosen.variants[locale];
      if (!variants || variants.length === 0) continue;
      const choice = pickFreshestVariant(rng, variants, spentPhrasing);
      rng = choice.rng;
      for (const key of echoKeys(variants[choice.index])) spentPhrasing.add(key);
      sentences.push(interpolate(variants[choice.index], vars));
      topicIds.push(chosen.id);
    }
    if (sentences.length > 0) {
      paragraphs.push({ chapter, sentences });
      all.push(...sentences);
    }
  }

  return { paragraphs, sentences: all, topicIds };
}
