"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate } from "motion";
import { useI18n } from "@/lib/i18n/context";
import { injuryName } from "@/lib/data/injuryNames";
import { getLeagueOfTeamAtTier, getTeam } from "@craque/data";
import { resolveTrophy } from "@/lib/trophyDisplay";
import { AWARD_IMAGES, singleTrophyImportance, type Confederation } from "@craque/data";
import { ClubCrest, TrophyImage } from "./Media";
import { formatMarketValue } from "@/lib/trophyDisplay";
import { buildCareerBackPages, type BackPage } from "@/lib/sim/backPage";
import type { CareerState, Headline, SeasonSnapshot } from "@/lib/sim/career";

/**
 * The career as a newspaper you actually leaf through.
 *
 * The previous version was a row of pages you scrolled sideways, which reads as
 * a gallery of cards rather than as a paper — you can see four editions at
 * once, so nothing is ever *the* page you are on. This shows exactly one, and
 * turning it is a hinged flip: the sheet lifts on its left edge and swings away
 * to reveal the next one underneath, the same motion as a hand turning a page.
 * Drag it and the sheet follows your finger; let go past halfway and it
 * completes, short of it and it falls back.
 *
 * Each page is a full front page rather than a caption: nameplate, dateline,
 * the season's splash and standfirst, the crest set as the photograph, the
 * numbers boxed as a sidebar, everything won that year, the other news, and a
 * career-to-date footer so the page knows where it sits in the whole story.
 *
 * It stays paper-coloured in both themes on purpose: it is a depiction of
 * newsprint, and newsprint is not dark.
 */

/** How far the sheet swings. Short of 180° so it never shows a flat back. */
const TURN_DEGREES = 166;
/**
 * How long a full swing takes. Was 620ms, which read as a jump-cut rather than
 * a page actually turning — there wasn't enough time to see the sheet lift and
 * come back down. Long enough now to watch, short enough that working through
 * a real backlog of queued turns still doesn't drag.
 */
const TURN_MS = 900;
/** Fraction of the swept distance a drag must cover to commit the turn. */
const COMMIT_AT = 0.28;
/**
 * How much of the stage's width a drag has to cross to sweep the sheet all the
 * way over. Well under 1 on purpose: at full width you had to haul the pointer
 * across the entire paper to turn one page, and going *back* felt worse still
 * because the sheet starts already flipped, so the first half of that travel
 * bought no visible progress. Just over half the width is enough to feel
 * physical without becoming a workout.
 */
const DRAG_SWEEP_FRACTION = 0.55;
/**
 * Floor on the release animation.
 *
 * The settle used to be timed purely off the remaining angle, so letting go
 * near the end of the sweep left a handful of degrees to travel and the page
 * snapped over in a couple of frames — a flash rather than a page falling.
 * With a floor, a release always reads as the sheet completing its arc.
 */
const SETTLE_MIN_MS = 280;
/**
 * Caps on the two variable-length lists in the right-hand column.
 *
 * The page is a fixed 620px, so anything that can grow without limit steals
 * room from whatever sits below it. Bounding both means the column's height
 * has a known worst case and the last line can never be sliced in half.
 */
const HONOUR_LIMIT = 5;
const ALSO_ITEM_LIMIT = 4;
/** One line of the "also this season" column, in pixels. */
const ALSO_ROW_HEIGHT = 13;
const ALSO_ROW_GAP = 4;
/** The column's own label plus its bottom margin. */
const ALSO_HEADING_HEIGHT = 14;

interface Edition {
  page: BackPage;
  season: SeasonSnapshot;
  /** Everything else the paper reported that year. */
  items: Headline[];
  teamId: string | null;
  teamName: string;
  leagueName: string | null;
  tier: number;
  /** Rating movement against the previous season, for the arrow beside OVR. */
  ovrDelta: number | null;
  trophies: { name: string; imageUrl?: string }[];
  awards: { name: string; imageUrl?: string }[];
  /** Career totals as they stood at the end of this season. */
  toDate: { appearances: number; goals: number; assists: number; cleanSheets: number; trophies: number };
  index: number;
}

export function NewspaperArchive({ career }: { career: CareerState }) {
  const { t, locale } = useI18n();
  const confederation = career.player.nationality.confederation;
  const isGk = career.player.position === "GK";

  const editions = useMemo<Edition[]>(() => {
    const byAge = new Map<number, Headline[]>();
    for (const h of career.headlines) {
      const list = byAge.get(h.age);
      if (list) list.push(h);
      else byAge.set(h.age, [h]);
    }

    const running = { appearances: 0, goals: 0, assists: 0, cleanSheets: 0, trophies: 0 };
    return buildCareerBackPages(career).map((page, i) => {
      const season = career.seasons[i];
      const previous = career.seasons[i - 1];
      const team = season ? getTeam(season.teamId) : null;
      const league = season ? getLeagueOfTeamAtTier(season.teamId, season.leagueTier) : null;

      running.appearances += season?.stats.appearances ?? 0;
      running.goals += season?.stats.goals ?? 0;
      running.assists += season?.stats.assists ?? 0;
      running.cleanSheets += season?.stats.cleanSheets ?? 0;
      running.trophies += season?.trophies.length ?? 0;

      return {
        page,
        season,
        items: byAge.get(page.age) ?? [],
        teamId: season?.teamId ?? null,
        teamName: team?.name ?? page.vars.team,
        leagueName: league?.name ?? null,
        tier: season?.leagueTier ?? 1,
        ovrDelta: season && previous ? season.overall - previous.overall : null,
        // Ordered by what each one is worth to *this* club, so the page leads
        // with the season's real prize. The club's confederation, not the
        // player's: the intercontinental is the night a South American side is
        // remembered for and a footnote to a European treble, and the
        // importance table already knows that.
        trophies: (season?.trophies ?? [])
          .map((key) => {
            const r = resolveTrophy(key, season.teamId, confederation, t, season.leagueTier);
            return {
              name: r.name,
              imageUrl: r.imageUrl,
              weight: singleTrophyImportance(key, league?.confederation as Confederation | undefined),
            };
          })
          .sort((a, b) => b.weight - a.weight)
          .map(({ name, imageUrl }) => ({ name, imageUrl })),
        awards: (season?.awards ?? []).map((key) => ({
          name: t(`awards.${key}`),
          imageUrl: AWARD_IMAGES[key],
        })),
        toDate: { ...running },
        index: i,
      };
    });
  }, [career, confederation, t]);

  /** The page currently resting on top of the stack. */
  const [index, setIndex] = useState(0);
  /**
   * Where the reader has asked to be.
   *
   * Turns take just over half a second, and a reader flipping quickly clicks
   * again well inside that. Disabling the button for the duration made those
   * clicks vanish, so `desired` runs ahead of `index` and the effect below
   * works through the backlog one sheet at a time — every click lands, and the
   * counter answers immediately even though the paper is still catching up.
   */
  const [desired, setDesired] = useState(0);
  /**
   * Non-null while a sheet is mid-turn.
   *
   * `mode` matters: only an `auto` turn is driven by the effect below. Without
   * it, releasing a drag — which starts its own swing — would be picked up as
   * a fresh turn and animated a second time on top of itself.
   */
  const [turn, setTurn] = useState<{ dir: 1 | -1; target: number; mode: "auto" | "drag" | "settling" } | null>(
    null,
  );
  const sheetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /** Live during a drag so pointer handlers never re-render per frame. */
  const dragRef = useRef<{ startX: number; width: number; dir: 1 | -1; angle: number } | null>(null);

  const calm = useCallback(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // The sheet that is turning: forward it is the page being left behind, back
  // it is the page coming in. Everything else about the two directions is the
  // same, which is why one piece of state covers both.
  const flipIndex = turn ? (turn.dir === 1 ? index : turn.target) : index;
  const baseIndex = turn ? (turn.dir === 1 ? turn.target : index) : index;

  // Mirrors of the two pieces of state the timer callbacks need to read. A
  // turn finishes on a `setTimeout`, long after the closure that started it was
  // created, so reading `index` or `turn` from that closure would see whatever
  // they were when the turn began.
  const indexRef = useRef(0);
  const desiredRef = useRef(0);
  const turningRef = useRef(false);

  /** Starts the next sheet moving, if the reader is not already there. */
  const beginTurn = useCallback((from: number) => {
    const want = desiredRef.current;
    if (want === from) return;
    const dir: 1 | -1 = want > from ? 1 : -1;
    turningRef.current = true;
    setTurn({ dir, target: from + dir, mode: "auto" });
  }, []);

  const commit = useCallback(
    (target: number) => {
      indexRef.current = target;
      turningRef.current = false;
      dragRef.current = null;
      setIndex(target);
      setTurn(null);
      const el = sheetRef.current;
      if (el) el.style.transform = "";
      // Keep working through whatever the reader queued up while this sheet
      // was still in the air. Batched with the reset above, so a run of turns
      // is continuous rather than stuttering back to rest between each one.
      beginTurn(target);
    },
    [beginTurn],
  );

  /** A drag lands on a page directly, so the queue has to be told about it. */
  const syncDesired = useCallback(
    (target: number) => {
      desiredRef.current = target;
      setDesired(target);
      commit(target);
    },
    [commit],
  );

  /**
   * Runs the swing from wherever the sheet currently is to `to` degrees.
   *
   * The commit is driven by a timer rather than by the animation's own
   * `finished` promise. The promise is the obvious choice and the wrong one:
   * if the sheet node is not there yet, or the animation is dropped for any
   * reason, the promise simply never settles and the turn hangs half-done with
   * the page stuck. A timer always fires, so the reader can always turn the
   * page; the animation is decoration on top of it.
   */
  const swing = useCallback(
    (from: number, to: number, onDone: () => void, settling = false) => {
      // Reduced motion keeps the identical state machine and simply arrives
      // instantly, so the page still turns for a reader who asked for less.
      const proportional = TURN_MS * (Math.abs(to - from) / TURN_DEGREES);
      // A release is given a floor and an ease-out, so the sheet always looks
      // like it is falling the rest of the way under its own weight rather
      // than being teleported the last few degrees.
      const ms = calm() ? 0 : settling ? Math.max(SETTLE_MIN_MS, proportional) : proportional;
      const el = sheetRef.current;
      if (el && ms > 0) {
        animate(
          el,
          { rotateY: [`${from}deg`, `${to}deg`] },
          { duration: ms / 1000, ease: settling ? [0.22, 1, 0.36, 1] : [0.36, 0, 0.24, 1] },
        );
      } else if (el) {
        el.style.transform = `rotateY(${to}deg)`;
      }
      window.setTimeout(onDone, ms);
    },
    [calm],
  );

  // Buttons and keys only move the target. Nothing is ever rejected for being
  // too soon, which is what makes flipping quickly through twenty seasons feel
  // like a newspaper rather than a form.
  const turnTo = useCallback(
    (dir: 1 | -1) => {
      const want = Math.min(editions.length - 1, Math.max(0, desiredRef.current + dir));
      if (want === desiredRef.current) return;
      desiredRef.current = want;
      setDesired(want);
      if (!turningRef.current) beginTurn(indexRef.current);
    },
    [editions.length, beginTurn],
  );

  // A queued turn. The sheet is mounted by the render below, so the swing has
  // to wait a commit for the node to exist.
  const auto = turn?.mode === "auto" ? turn : null;
  useEffect(() => {
    if (!auto) return;
    const from = auto.dir === 1 ? 0 : -TURN_DEGREES;
    const to = auto.dir === 1 ? -TURN_DEGREES : 0;
    swing(from, to, () => commit(auto.target));
  }, [auto, swing, commit]);

  // Drag-to-turn. The angle is written straight to the node rather than through
  // state so a drag stays at the browser's frame rate.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      const width = stage.clientWidth || 1;
      // A manual grab always wins, even mid-turn. This used to bail out
      // whenever `turn` was non-null, which meant grabbing the page right
      // after flipping through several editions quickly — while the queue was
      // still working through the backlog, up to a few seconds — did nothing
      // at all: no drag state was ever created, so every subsequent pointer
      // move was a no-op and the page looked frozen under the reader's finger.
      // Instead, whatever was in flight now finishes instantly and anything
      // still queued behind it is dropped, so a hold is never blocked.
      if (turn) {
        desiredRef.current = turn.target;
        setDesired(turn.target);
        commit(turn.target);
      }
      dragRef.current = { startX: e.clientX, width, dir: 1, angle: 0 };
    };

    const move = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      if (Math.abs(dx) < 3) return;

      // The direction is decided by the first real movement and then held, so a
      // wobble mid-drag cannot flip which page is being turned.
      if (!turn) {
        const dir: 1 | -1 = dx < 0 ? 1 : -1;
        const target = index + dir;
        if (target < 0 || target >= editions.length) return;
        drag.dir = dir;
        turningRef.current = true;
        setTurn({ dir, target, mode: "drag" });
        return;
      }
      if (turn.mode !== "drag") return;

      e.preventDefault();
      const sweep = Math.max(1, drag.width * DRAG_SWEEP_FRACTION);
      const progress = Math.min(1, Math.max(0, (drag.dir === 1 ? -dx : dx) / sweep));
      drag.angle = drag.dir === 1 ? -TURN_DEGREES * progress : -TURN_DEGREES * (1 - progress);
      const el = sheetRef.current;
      if (el) el.style.transform = `rotateY(${drag.angle}deg)`;
    };

    const up = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || !turn || turn.mode !== "drag") return;

      const progress = drag.dir === 1 ? -drag.angle / TURN_DEGREES : 1 + drag.angle / TURN_DEGREES;
      const committed = progress >= COMMIT_AT;
      const from = drag.angle;
      const to = drag.dir === 1
        ? (committed ? -TURN_DEGREES : 0)
        : (committed ? 0 : -TURN_DEGREES);
      const target = turn.target;

      // Marked as settling so the auto effect leaves this swing alone.
      setTurn({ ...turn, mode: "settling" });
      swing(
        from,
        to,
        () => {
          if (committed) syncDesired(target);
          else {
            // Fell short: the sheet returns to rest and the page never changed.
            turningRef.current = false;
            setTurn(null);
            const el = sheetRef.current;
            if (el) el.style.transform = "";
          }
        },
        true,
      );
    };

    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [turn, index, editions.length, swing, commit, syncDesired]);

  // The sim stores an injury as its raw key, since it has no idea what
  // language the page is in — resolve it to a readable name here.
  const localise = useCallback(
    (headline: Headline): Record<string, string> =>
      headline.vars.injury
        ? { ...headline.vars, injury: injuryName(locale, headline.vars.injury) }
        : headline.vars,
    [locale],
  );

  if (editions.length === 0) return null;

  return (
    <section className="panel p-3 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-2">
            {t("career.newspaperTitle")}
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-2/80">{t("career.newspaperHint")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="font-mono text-[11px] tabular-nums text-muted-2">
            {desired + 1} / {editions.length}
          </span>
          <TurnButton
            direction="prev"
            label={t("career.newspaperPrev")}
            disabled={desired === 0}
            onClick={() => turnTo(-1)}
          />
          <TurnButton
            direction="next"
            label={t("career.newspaperNext")}
            disabled={desired === editions.length - 1}
            onClick={() => turnTo(1)}
          />
        </div>
      </div>

      <div
        ref={stageRef}
        // `perspective` here is what makes the flip read as a sheet lifting off
        // the page rather than as a flat squash.
        className="relative mx-auto w-full max-w-[560px] cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ perspective: "2200px" }}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={t("career.newspaperTitle")}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); turnTo(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); turnTo(-1); }
        }}
      >
        {/* The sheet underneath — revealed as the one on top swings away. */}
        <FrontPage
          edition={editions[baseIndex]}
          total={editions.length}
          isGk={isGk}
          t={t}
          localise={localise}
        />

        {/* The sheet doing the turning. Only mounted mid-turn, hinged on its
            left edge, and hidden once past 90° so its mirrored back never
            shows. */}
        {turn && (
          <div
            ref={sheetRef}
            aria-hidden
            className="absolute inset-0"
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: turn.dir === 1 ? undefined : `rotateY(-${TURN_DEGREES}deg)`,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.65)",
            }}
          >
            <FrontPage
              edition={editions[flipIndex]}
              total={editions.length}
              isGk={isGk}
              t={t}
              localise={localise}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function TurnButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-[13px] font-black text-muted transition-colors hover:border-pitch/60 hover:text-pitch disabled:cursor-default disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted"
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

/** Newsprint, not the app's palette — the colours belong to the object. */
const PAPER = {
  sheet: "#f0ede3",
  ink: "#15130e",
  soft: "#443f36",
  faint: "#6f6a5c",
  rule: "#c2bba7",
  spot: "#9b2617",
  win: "#1c6640",
} as const;

const TONE = {
  good: { glyph: "▲", color: PAPER.win },
  bad: { glyph: "▼", color: PAPER.spot },
  neutral: { glyph: "●", color: PAPER.faint },
} as const;

function FrontPage({
  edition,
  total,
  isGk,
  t,
  localise,
}: {
  edition: Edition;
  total: number;
  isGk: boolean;
  t: (key: string, vars?: Record<string, string | number>) => string;
  localise: (h: Headline) => Record<string, string>;
}) {
  const { page, season, items, teamId, teamName, leagueName, tier, ovrDelta, trophies, awards, toDate, index } =
    edition;

  // The confederation becomes a word here rather than in the simulation,
  // which has no translator of its own.
  const pageVars = { ...page.vars, continent: t(`backPage.continents.${page.confederation}`) };
  const headline = t(`backPage.angles.${page.angle}.${page.variant}`, pageVars);
  const lede = t(`backPage.ledes.${page.angle}.${page.lede}`, pageVars);
  const masthead = t(`backPage.mastheads.${page.masthead}`);
  const tone = TONE[page.tone];
  const rose = page.clubStars ? page.clubStars.to > page.clubStars.from : false;

  // Silverware and individual honours share one bounded list. Kept as a single
  // list so the column's height depends on one number rather than two, which
  // is what makes the block below it fit predictably.
  const honours: { name: string; imageUrl?: string; kind: "trophy" | "award" }[] = [
    ...trophies.map((tr) => ({ ...tr, kind: "trophy" as const })),
    ...awards.map((aw) => ({ ...aw, kind: "award" as const })),
  ];

  // Long headlines give way, or the nameplate and the photo get pushed off a
  // page that has to stay the same height as every other one.
  const headlineSize = headline.length > 46 ? "text-[26px]" : headline.length > 30 ? "text-[30px]" : "text-[34px]";

  return (
    <article
      className="flex h-[620px] w-full flex-col rounded-[3px] px-6 py-5 shadow-2xl"
      style={{
        background: PAPER.sheet,
        color: PAPER.ink,
        // A faint fibre wash so the sheet does not read as flat card stock.
        backgroundImage:
          "radial-gradient(circle at 18% 12%, rgba(0,0,0,0.035) 0 1px, transparent 1px), radial-gradient(circle at 72% 61%, rgba(0,0,0,0.028) 0 1px, transparent 1px)",
        backgroundSize: "13px 13px, 19px 19px",
      }}
    >
      {/* Nameplate. A heavy rule above and a hairline below is the single
          strongest signal that a block of text is a newspaper. */}
      <div
        className="shrink-0 py-2"
        style={{ borderTop: `4px double ${PAPER.ink}`, borderBottom: `1px solid ${PAPER.ink}` }}
      >
        <h3
          className="text-center font-display text-[26px] font-black uppercase leading-none"
          style={{ letterSpacing: "0.08em" }}
        >
          {masthead}
        </h3>
      </div>

      <div
        className="flex shrink-0 items-baseline justify-between gap-2 py-1.5 text-[9px] font-bold uppercase"
        style={{ letterSpacing: "0.14em", color: PAPER.faint, borderBottom: `1px solid ${PAPER.rule}` }}
      >
        <span>{t("career.newspaperEdition", { n: index + 1, total })}</span>
        <span>{t("career.celebrationAt", { age: page.age })}</span>
      </div>

      {/* Club and competition — where this season actually happened. */}
      <p
        className="shrink-0 truncate pt-2.5 text-[10px] font-black uppercase"
        style={{ letterSpacing: "0.16em", color: PAPER.spot }}
      >
        {teamName}
        {leagueName && (
          <span style={{ color: PAPER.faint }}>
            {" · "}
            {leagueName}
            {tier > 1 ? ` (${t("career.secondTierShort")})` : ""}
          </span>
        )}
      </p>

      <h4
        className={`mt-1 shrink-0 break-words font-display ${headlineSize} font-black uppercase leading-[1.02]`}
        style={{ letterSpacing: "-0.02em", textWrap: "balance" }}
      >
        <span style={{ color: tone.color }} className="mr-1.5 align-middle text-[14px]" aria-hidden>
          {tone.glyph}
        </span>
        {headline}
      </h4>

      {/* Crest as the page's photograph, with the standfirst set beside it the
          way a picture and its copy sit on a printed page. */}
      <div className="mt-3 flex shrink-0 items-start gap-4">
        {teamId && (
          <figure className="shrink-0">
            <div style={{ border: `1px solid ${PAPER.rule}`, padding: 4, background: "#fff" }}>
              <ClubCrest teamId={teamId} name={teamName} size={68} className="h-[68px] w-[68px]" />
            </div>
            <figcaption
              className="mt-1 w-[76px] text-center text-[7px] font-bold uppercase leading-tight"
              style={{ letterSpacing: "0.08em", color: PAPER.faint }}
            >
              {teamName}
            </figcaption>
          </figure>
        )}
        <p className="text-[13px] leading-[1.5]" style={{ color: PAPER.soft, textWrap: "pretty" }}>
          {lede}
        </p>
      </div>

      {/* Two columns below the fold: the numbers on the left, what was won on
          the right. */}
      <div className="mt-3.5 grid min-h-0 flex-1 grid-cols-[1fr_1fr] gap-3">
        <div style={{ border: `1px solid ${PAPER.rule}` }} className="flex flex-col">
          <SectionHead label={t("career.newspaperNumbers")} />
          <dl className="flex flex-1 flex-col justify-center gap-1.5 px-3 py-2">
            <Stat label={t("career.appearances")} value={String(page.line.appearances)} />
            <Stat
              label={isGk ? t("career.cleanSheets") : t("career.goals")}
              value={String(isGk ? page.line.cleanSheets : page.line.goals)}
            />
            <Stat
              label={isGk ? t("career.goalsConceded") : t("career.assists")}
              value={String(isGk ? season?.stats.goalsConceded ?? 0 : page.line.assists)}
            />
            <Stat
              label={t("career.overall")}
              value={page.vars.ovr}
              delta={ovrDelta}
            />
            <Stat
              label={t("career.marketValue")}
              value={season ? formatMarketValue(season.marketValue) : "-"}
            />
          </dl>
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          {honours.length > 0 && (
            <div style={{ border: `1px solid ${PAPER.rule}` }} className="min-h-0 shrink-0">
              <SectionHead label={t(trophies.length > 0 ? "career.trophies" : "career.awards")} />
              <ul className="flex flex-col gap-1.5 px-2.5 py-2">
                {honours.slice(0, HONOUR_LIMIT).map((h, i) => (
                  <li key={`h-${i}`} className="flex items-center gap-1.5">
                    <TrophyImage src={h.imageUrl} alt={h.name} className="h-5 w-5 shrink-0" />
                    <span
                      className="truncate text-[10.5px] font-bold"
                      style={{ color: h.kind === "award" ? PAPER.spot : PAPER.ink }}
                    >
                      {h.name}
                    </span>
                  </li>
                ))}
                {honours.length > HONOUR_LIMIT && (
                  <li
                    className="text-[9.5px] font-bold"
                    style={{ color: PAPER.faint }}
                    title={honours.slice(HONOUR_LIMIT).map((h) => h.name).join(" · ")}
                  >
                    {t("career.newspaperMoreHonours", { count: honours.length - HONOUR_LIMIT })}
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Status marks that explain the numbers above without a sentence. */}
          <SeasonTags season={season} t={t} />

          {page.clubStars && (
            <p
              className="text-[10px] font-bold leading-snug"
              style={{ color: rose ? PAPER.win : PAPER.spot }}
            >
              {rose ? "▲" : "▼"}{" "}
              {t(rose ? "backPage.clubRose" : "backPage.clubFell", { team: teamName })}
            </p>
          )}

          {/* The page is a fixed height, so this block gets whatever the
              trophy list above it leaves behind — which is different on every
              season. Bounding the item count alone was never enough: three
              two-line items need 78px and a decorated season can leave 40,
              so the last one was sliced horizontally through the middle of a
              word. It now counts how many whole rows the gap actually holds
              and prints that many. */}
          {items.length > 0 && (
            <AlsoThisSeason items={items} t={t} localise={localise} />
          )}
        </div>
      </div>

      {/* Where the career stands as of this edition — the running total that
          turns a stack of seasons into one story. */}
      <div
        className="mt-3 shrink-0 pt-2"
        style={{ borderTop: `1px solid ${PAPER.rule}` }}
      >
        <p
          className="text-[7.5px] font-black uppercase"
          style={{ letterSpacing: "0.18em", color: PAPER.faint }}
        >
          {t("career.newspaperToDate")}
        </p>
        <p className="mt-1 font-mono text-[11px] font-bold tabular-nums" style={{ color: PAPER.soft }}>
          {toDate.appearances} {t("career.appearances")}
          {" · "}
          {isGk ? `${toDate.cleanSheets} ${t("career.cleanSheets")}` : `${toDate.goals} ${t("career.goals")}`}
          {" · "}
          {isGk ? "" : `${toDate.assists} ${t("career.assists")} · `}
          {toDate.trophies} {t("career.trophies")}
        </p>
      </div>

      <p
        className="mt-2 shrink-0 pt-1.5 text-center text-[7px] font-black uppercase"
        style={{ letterSpacing: "0.32em", color: PAPER.faint, borderTop: `1px solid ${PAPER.rule}` }}
      >
        CRAQUE
      </p>
    </article>
  );
}

/**
 * The "also this season" column, cut to whole lines.
 *
 * Every row is one line of fixed height, and the number of rows comes from
 * measuring the gap left over rather than from a constant — the block above
 * it can be anything from nothing to five trophies plus an overflow note, so
 * there is no constant that is right on every page.
 */
function AlsoThisSeason({
  items,
  t,
  localise,
}: {
  items: Headline[];
  t: ReturnType<typeof useI18n>["t"];
  localise: (item: Headline) => Record<string, string>;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(ALSO_ITEM_LIMIT);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const available = box.clientHeight - ALSO_HEADING_HEIGHT;
      const fits = Math.floor((available + ALSO_ROW_GAP) / (ALSO_ROW_HEIGHT + ALSO_ROW_GAP));
      setRows(Math.max(0, Math.min(ALSO_ITEM_LIMIT, fits)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const shown = items.slice(0, rows);

  return (
    <div ref={boxRef} className="min-h-0 flex-1 overflow-hidden">
      {shown.length > 0 && (
        <>
          <p
            className="mb-1 text-[7.5px] font-black uppercase"
            style={{ letterSpacing: "0.18em", color: PAPER.faint }}
          >
            {t("career.newspaperAlso")}
          </p>
          <ul className="flex flex-col" style={{ gap: ALSO_ROW_GAP }}>
            {shown.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-1.5 text-[10px]"
                style={{ color: PAPER.soft, height: ALSO_ROW_HEIGHT }}
                title={t(`headlines.${item.key}`, localise(item))}
              >
                <span
                  aria-hidden
                  className="mt-[4px] h-[3px] w-[3px] shrink-0 rounded-full"
                  style={{
                    background:
                      item.tone === "bad" ? PAPER.spot : item.tone === "good" ? PAPER.win : PAPER.rule,
                  }}
                />
                <span className="truncate">{t(`headlines.${item.key}`, localise(item))}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
function SectionHead({ label }: { label: string }) {
  return (
    <p
      className="px-2 py-1 text-center text-[7.5px] font-black uppercase"
      style={{ letterSpacing: "0.18em", color: PAPER.faint, borderBottom: `1px solid ${PAPER.rule}` }}
    >
      {label}
    </p>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-[8.5px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: PAPER.faint }}>
        {label}
      </dt>
      <dd className="flex items-baseline gap-1 font-display text-[17px] font-black leading-none tabular-nums">
        {value}
        {delta !== null && delta !== undefined && delta !== 0 && (
          <span
            className="text-[9px] font-black"
            style={{ color: delta > 0 ? PAPER.win : PAPER.spot }}
          >
            {delta > 0 ? "▲" : "▼"}
            {Math.abs(delta)}
          </span>
        )}
      </dd>
    </div>
  );
}

/** Loan, promotion, relegation, ban, knock — the year's small print. */
function SeasonTags({
  season,
  t,
}: {
  season: SeasonSnapshot | undefined;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  if (!season) return null;
  const tags: { text: string; tone: "good" | "bad" | "neutral" }[] = [];
  if (season.promoted) tags.push({ text: t("career.promotion"), tone: "good" });
  if (season.relegated) tags.push({ text: t("career.relegation"), tone: "bad" });
  if (season.suspended) tags.push({ text: t("career.suspended"), tone: "bad" });
  if (season.onLoan) tags.push({ text: t("career.loanTag"), tone: "neutral" });
  if (season.knock) {
    tags.push({ text: t("career.knockTag", { matches: season.knock.matchesMissed }), tone: "neutral" });
  }
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="rounded-[2px] px-1.5 py-0.5 text-[8px] font-black uppercase leading-tight"
          style={{
            letterSpacing: "0.08em",
            border: `1px solid ${tag.tone === "bad" ? PAPER.spot : tag.tone === "good" ? PAPER.win : PAPER.rule}`,
            color: tag.tone === "bad" ? PAPER.spot : tag.tone === "good" ? PAPER.win : PAPER.faint,
          }}
        >
          {tag.text}
        </span>
      ))}
    </div>
  );
}
