import { competitionName, decisionText, describeEffect, effectTone, eventOutcomeText, missionGoal, missionName } from "@craque/content";
import { type Career, isGoalkeeper, leagueEntry, movementOf, type SeasonRecord } from "@craque/engine";
import { AWARDS, getClub, getCompetition, getLeague } from "@craque/world";
import { m, useReducedMotion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { clubStyle } from "../../features/career/clubColors";
import type { ChallengePage, EventPage, PlaySession, SeasonPage } from "../../features/career/play";
import { attributeDeltas } from "../../features/career/view";
import { attributeText } from "../../i18n/attributes";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { IconButton } from "../../ui/Button";
import { cardTier } from "../../ui/cardTier";
import { cn } from "../../ui/cn";
import { Confetti } from "../../ui/Confetti";
import { CountUp } from "../../ui/CountUp";
import { AwardArt, Crest, LeagueBadge, TrophyArt } from "../../ui/Media";
import { Chip, Delta, Glyph } from "../../ui/Signals";
import { TONE_GLYPH, type Tone } from "../../ui/tone";

interface PlayFeedProps {
  career: Career;
  play: PlaySession;
  /** Uma temporada do histórico revista: mostra o aviso e o botão de voltar ao lance. */
  reviewing: boolean;
  onCloseReview(): void;
  /**
   * Celular: uma faixa de duas linhas (resultado, clube, posição, OVR e os
   * números) que abre o lance inteiro com um toque, para a decisão caber.
   */
  compact?: boolean;
}

/**
 * O lance (D43): o que a última escolha produziu, na própria tela, sem janela
 * para fechar. O resultado do evento numa faixa; a temporada com escudo, liga,
 * posição, acesso ou queda, os números contando, o OVR e os atributos que
 * mudaram e os títulos em miniatura; no desafio, o que mudou nas missões.
 * Quando a decisão jogou duas temporadas, os anos viram abas. No PC fica no
 * alto da coluna da direita; no celular, é uma faixa que abre com um toque. O
 * que não couber numa tela baixa sai pelas regras de altura do CSS, nunca
 * empurra a decisão.
 */
export function PlayFeed({ career, play, reviewing, onCloseReview, compact = false }: PlayFeedProps) {
  const { t } = useT();
  const reduced = useReducedMotion();
  const seasons = play.pages.filter((page): page is SeasonPage => page.kind === "season");
  const event = play.pages.find((page): page is EventPage => page.kind === "event") ?? null;
  const challenge = play.pages.find((page): page is ChallengePage => page.kind === "challenge") ?? null;
  const [picked, setPicked] = useState<{ session: number; index: number } | null>(null);
  const selected = picked && picked.session === play.id ? picked.index : (seasons[seasons.length - 1]?.index ?? null);
  const page = seasons.find((item) => item.index === selected) ?? seasons[seasons.length - 1] ?? null;
  const record = page ? career.history[page.index] : undefined;
  const animate = play.fresh && reduced !== true;
  const celebrated = useRef<number | null>(null);
  const [opened, setOpened] = useState<number | null>(null);
  const open = !compact || opened === play.id;
  const honours = seasons.some((item) => {
    const season = career.history[item.index];
    return season !== undefined && (season.titles.length > 0 || season.awards.won.length > 0);
  });

  // Som uma vez por lance: o troféu quando houve título ou prêmio, o apito da revelação nos outros.
  useEffect(() => {
    if (!play.fresh || celebrated.current === play.id) return;
    celebrated.current = play.id;
    feedback(honours ? "trophy" : event?.success === false ? "back" : "reveal");
  }, [play.id, play.fresh, honours, event?.success]);

  if (!page || !record) {
    return event ? (
      <section className="play" aria-label={t("career.play.label")}>
        <EventLine page={event} animate={animate} />
      </section>
    ) : null;
  }

  const toggle = compact ? (
    <button
      type="button"
      className="play-toggle"
      aria-expanded={open}
      onClick={() => {
        feedback("tick");
        setOpened(open ? null : play.id);
      }}
    >
      <PlayStrip page={page} record={record} event={event} animate={animate && !open} />
      <ChevronDown size={18} aria-hidden="true" className="play-chevron" />
    </button>
  ) : null;

  return (
    <section
      className={cn("play club-scope", compact && "play-compact")}
      style={clubStyle(record.club) as CSSProperties}
      aria-label={t("career.play.label")}
      data-review={reviewing || undefined}
      data-open={open || undefined}
    >
      {toggle}
      {open && event ? <EventLine page={event} animate={animate} /> : null}
      {open ? <SeasonLine
        key={`${play.id}-${page.index}`}
        page={page}
        record={record}
        animate={animate}
        tabs={
          seasons.length > 1 ? (
            <span className="play-years" role="group" aria-label={t("career.play.seasons")}>
              {seasons.map((item) => {
                const year = career.history[item.index]?.year;
                return (
                  <button
                    key={item.index}
                    type="button"
                    className="play-year-tab numeric"
                    aria-pressed={item.index === page.index}
                    onClick={() => {
                      feedback("tick");
                      setPicked({ session: play.id, index: item.index });
                    }}
                  >
                    {year}
                  </button>
                );
              })}
            </span>
          ) : null
        }
        review={
          reviewing ? (
            <span className="flex items-center gap-1">
              <Chip tone="info" size="sm">
                {t("career.play.reviewing")}
              </Chip>
              <IconButton label={t("career.play.backToLatest")} size="iconSm" onClick={onCloseReview}>
                <X size={15} aria-hidden="true" />
              </IconButton>
            </span>
          ) : null
        }
      /> : null}
      {challenge && (open || !compact) ? <ChallengeLine page={challenge} /> : null}

      {challenge && compact && !open ? (
        <p className="play-chips px-0.5">
          <Chip tone="glory" glyph size="sm">
            {t("challenge.reveal.eyebrow")}
          </Chip>
        </p>
      ) : null}
      {animate && honours ? <Confetti burst={play.id} count={46} /> : null}
    </section>
  );
}

/**
 * A faixa fechada do celular: o resultado do evento, o ano, o clube, a posição
 * na liga, acesso, queda ou título, e o OVR contando; embaixo, os números.
 */
function PlayStrip({ page, record, event, animate }: { page: SeasonPage; record: SeasonRecord; event: EventPage | null; animate: boolean }) {
  const { t, c, cp, ordinal } = useT();
  const entry = leagueEntry(record);
  const movement = movementOf(record);
  const keeper = isGoalkeeper(record.position);
  const eventTone: Tone = event ? (event.success === null ? "neutral" : event.success ? "good" : "bad") : "neutral";
  const deltas = attributeDeltas(page.previousAttributes, record.attributes).filter((value) => value !== 0);
  const up = deltas.filter((value) => value > 0).length;
  const down = deltas.filter((value) => value < 0).length;
  const numbers = [
    cp("stats.gamesCount", record.games),
    keeper ? cp("stats.cleanSheetsCount", record.production.cleanSheets) : cp("stats.goalsCount", record.production.goals),
    keeper ? null : cp("stats.assistsCount", record.production.assists),
  ].filter((item): item is string => item !== null);
  // Numa linha de 300 px cabem o ano, o clube, a posição, os selos e o OVR:
  // título, acesso e queda viram selos (★ ▲ ▼) e o evento vira o glifo. As
  // palavras ficam para o leitor de tela e para o cartão aberto.
  return (
    <span className="play-strip">
      <span className="play-strip-row">
        {event ? (
          <Glyph
            tone={eventTone}
            label={event.success === null ? t("reveal.eventDone") : event.success ? t("reveal.eventSuccess") : t("reveal.eventFailure")}
            className="shrink-0 text-xs"
          />
        ) : null}
        <span className="display numeric shrink-0 text-lg leading-none font-black">{record.year}</span>
        <Crest club={record.club} size={20} decorative />
        <span className="min-w-0 truncate text-sm font-semibold">{getClub(record.club)?.name ?? record.club}</span>
        {entry?.position ? <span className="numeric shrink-0 text-xs text-muted">{ordinal(entry.position)}</span> : null}
        {entry?.champion ? <StripSeal tone="glory" label={t("reveal.champion")} /> : null}
        {movement === "promoted" ? <StripSeal tone="good" label={t("reveal.promoted")} /> : null}
        {movement === "relegated" ? <StripSeal tone="bad" label={t("reveal.relegated")} /> : null}
        <span className="ml-auto flex shrink-0 items-baseline gap-1">
          <span className="display numeric text-lg leading-none font-black text-glory">
            <CountUp from={page.previousOvr} to={record.ovrEnd} play={animate} duration={900} delay={300} />
          </span>
          <Delta value={record.ovrEnd - page.previousOvr} className="text-2xs" />
        </span>
      </span>
      <span className="play-strip-row text-xs text-muted">
        <span className="min-w-0 truncate">{numbers.join(" · ")}</span>
        {record.titles.length > 0 ? <span className="shrink-0 text-glory">★ {record.titles.length}</span> : null}
        {up > 0 ? <span className="text-good shrink-0">▲ {up} {c("stats.attributesShort")}</span> : null}
        {down > 0 ? <span className="text-bad shrink-0">▼ {down}</span> : null}
      </span>
    </span>
  );
}

/** O selo da faixa fechada: só o glifo, na cor do tom; a palavra vai para o leitor de tela. */
function StripSeal({ tone, label }: { tone: Tone; label: string }) {
  return (
    <Chip tone={tone} glyph variant="solid" size="sm" className="shrink-0 px-1">
      <span className="sr-only">{label}</span>
    </Chip>
  );
}

/** O resultado do evento numa faixa: ▲ deu certo, ▼ não deu, o que aconteceu e os números. */
function EventLine({ page, animate }: { page: EventPage; animate: boolean }) {
  const { t, locale } = useT();
  const tone: Tone = page.success === null ? "neutral" : page.success ? "good" : "bad";
  const title = decisionText(locale, page.before, page.decision).title;
  const outcome = eventOutcomeText(locale, page.before, page.eventId, page.option, page.success);
  const effects = page.effects.flatMap((effect, index) => {
    const text = describeEffect(locale, effect, page.option.target);
    return text === null ? [] : [{ key: `${effect.kind}-${index}`, text, tone: effectTone(effect) as Tone }];
  });
  const headline = page.success === null ? t("reveal.eventDone") : page.success ? t("reveal.eventSuccess") : t("reveal.eventFailure");
  return (
    <m.div
      className="play-event"
      data-tone={tone}
      initial={animate ? { opacity: 0, y: -6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <p className="play-event-head">
        <span className="text-tone font-bold uppercase">
          <span aria-hidden="true">{TONE_GLYPH[tone]} </span>
          {headline}
        </span>
        <span className="truncate text-muted">{title}</span>
      </p>
      {outcome ? <p className="play-event-text">{outcome}</p> : null}
      {effects.length > 0 ? (
        <p className="play-chips">
          {effects.map((effect) => (
            <Chip key={effect.key} tone={effect.tone} glyph={effect.tone !== "neutral"} size="sm">
              {effect.text}
            </Chip>
          ))}
        </p>
      ) : null}
    </m.div>
  );
}

interface SeasonLineProps {
  page: SeasonPage;
  record: SeasonRecord;
  animate: boolean;
  tabs: ReactNode;
  review: ReactNode;
}

/** Uma temporada jogada: quem, onde, como terminou, os números e o que mudou no jogador. */
function SeasonLine({ page, record, animate, tabs, review }: SeasonLineProps) {
  const { t, c, locale, ordinal, number } = useT();
  const club = getClub(record.club);
  const league = getLeague(record.league);
  const entry = leagueEntry(record);
  const movement = movementOf(record);
  const keeper = isGoalkeeper(record.position);
  const ovrDelta = record.ovrEnd - page.previousOvr;
  const newTier = cardTier(record.ovrEnd);
  const tierChanged = cardTier(page.previousOvr) !== newTier;
  const deltas = attributeDeltas(page.previousAttributes, record.attributes).flatMap((value, slot) =>
    value === 0 ? [] : [{ key: `slot-${slot}`, value, label: attributeText(t, record.position, slot, "abbr") }],
  );

  const stats = [
    { key: "games", label: c("stats.games"), value: record.games },
    keeper
      ? { key: "cleanSheets", label: c("stats.cleanSheets"), value: record.production.cleanSheets }
      : { key: "goals", label: c("stats.goals"), value: record.production.goals },
    keeper
      ? { key: "national", label: t("reveal.national"), value: record.national.games }
      : { key: "assists", label: t("career.play.assists"), value: record.production.assists },
  ];

  const chips: Array<{ key: string; tone: Tone | "club"; solid: boolean; text: string }> = [];
  if (entry?.champion) chips.push({ key: "champion", tone: "glory", solid: true, text: t("reveal.champion") });
  if (movement === "promoted") chips.push({ key: "promoted", tone: "good", solid: true, text: t("reveal.promoted") });
  if (movement === "relegated") chips.push({ key: "relegated", tone: "bad", solid: true, text: t("reveal.relegated") });
  if (page.transfer) chips.push({ key: "transfer", tone: "club", solid: false, text: page.transfer.loan ? t("reveal.loan") : t("reveal.newClub") });
  if (page.transfer?.traitor) chips.push({ key: "traitor", tone: "bad", solid: true, text: t("reveal.traitor") });
  if (record.suspended) chips.push({ key: "suspended", tone: "bad", solid: true, text: t("reveal.suspended") });

  const notes: Array<{ key: string; tone: Tone; text: string }> = [];
  if (tierChanged) notes.push({ key: "tier", tone: "glory", text: t("reveal.newTier", { tier: t(`card.tiers.${newTier}`) }) });
  for (const crown of record.awards.crowns) {
    const name = competitionName(crown.competition, locale);
    notes.push({
      key: `${crown.award}-${crown.competition}`,
      tone: "glory",
      text: crown.award === "topScorer" ? t("career.play.topScorer", { competition: name }) : t("career.play.bestPlayer", { competition: name }),
    });
  }
  if (record.injury) notes.push({ key: "injury", tone: "bad", text: c("stats.injury", { injury: c(`injuries.${record.injury.type}`) }) });
  if (!keeper && record.national.games > 0) {
    notes.push({ key: "national", tone: "info", text: t("career.play.national", { games: record.national.games, goals: record.national.goals }) });
  }
  for (const moment of page.moments) {
    notes.push({
      key: moment.kind,
      tone: moment.kind === "firstCap" ? "glory" : "info",
      text:
        moment.kind === "firstCap"
          ? t("reveal.moments.firstCap", { age: moment.age })
          : moment.kind === "shirt"
            ? t("reveal.moments.shirt", { number: moment.number })
            : t("reveal.moments.focus", { focus: c(`focus.${moment.focus}.name`) }),
    });
  }

  const awards = record.awards.won.filter((key) => key !== "topScorer" && key !== "bestPlayer");
  const enter = (delay: number) =>
    animate ? { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.28 } } : {};

  return (
    <div className="play-season">
      <div className="play-head">
        <p className="play-when">
          <span className="display numeric play-year">{record.year}</span>
          <span className="eyebrow">{t("reveal.age", { age: record.age })}</span>
        </p>
        {tabs}
        <span className="ml-auto">{review}</span>
      </div>

      <m.div className="play-club" {...enter(0.05)}>
        <Crest club={record.club} size={34} decorative />
        <div className="min-w-0 flex-1">
          <p className="display truncate text-[1.15rem] leading-none font-extrabold uppercase">{club?.name ?? record.club}</p>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
            {league ? <LeagueBadge league={league} size={14} decorative /> : null}
            <span className="truncate">{league?.name}</span>
            {entry?.position ? (
              <span className="display numeric shrink-0 text-sm font-extrabold text-fg">{t("reveal.position", { position: ordinal(entry.position) })}</span>
            ) : null}
          </p>
        </div>
        {chips.length > 0 ? (
          <span className="play-club-chips">
            {chips.map((chip) => (
              <Chip key={chip.key} tone={chip.tone} glyph={chip.tone !== "club"} variant={chip.solid ? "solid" : "soft"} size="sm">
                {chip.text}
              </Chip>
            ))}
          </span>
        ) : null}
      </m.div>

      <m.dl className="play-stats" {...enter(0.12)}>
        {stats.map((stat) => (
          <div key={stat.key}>
            <dt className="eyebrow">{stat.label}</dt>
            <dd className="display numeric">
              <CountUp to={stat.value} play={animate} duration={800} delay={150} format={(value) => number(value)} />
            </dd>
          </div>
        ))}
        <div className="play-ovr">
          <dt className="eyebrow">OVR</dt>
          <dd className="display numeric">
            <CountUp from={page.previousOvr} to={record.ovrEnd} play={animate} duration={900} delay={350} />
            <Delta value={ovrDelta} className="text-xs" />
          </dd>
        </div>
      </m.dl>

      {deltas.length > 0 || notes.length > 0 ? (
        <m.ul className="play-chips play-notes" aria-label={t("reveal.attributes")} {...enter(0.2)}>
          {deltas.map((item) => (
            <li key={item.key}>
              <Chip tone={item.value > 0 ? "good" : "bad"} glyph size="sm">
                {item.value > 0 ? "+" : "−"}
                {Math.abs(item.value)} {item.label}
              </Chip>
            </li>
          ))}
          {notes.map((note) => (
            <li key={note.key}>
              <Chip tone={note.tone} glyph={note.tone !== "info"} size="sm">
                {note.text}
              </Chip>
            </li>
          ))}
        </m.ul>
      ) : null}

      {record.titles.length > 0 || awards.length > 0 ? (
        <m.div className={cn("play-honours", animate && "play-honours-fresh")} {...enter(0.3)}>
          <span className="play-honours-art" aria-hidden="true">
            {record.titles.slice(0, 6).map((id) => {
              const competition = getCompetition(id);
              return competition ? <TrophyArt key={id} competition={competition} size={30} language={locale} decorative /> : null;
            })}
            {awards.slice(0, 3).map((key) => (
              <AwardArt key={key} award={AWARDS[key]} size={30} language={locale} decorative />
            ))}
          </span>
          <span className="min-w-0 truncate text-xs font-semibold text-glory">
            {[...record.titles.map((id) => competitionName(id, locale)), ...awards.map((key) => AWARDS[key].names[locale])].join(" · ")}
          </span>
        </m.div>
      ) : null}
    </div>
  );
}

/** O desafio no lance: missão surpresa à vista, missão cumprida, édito quebrado, temporada apagada. */
function ChallengeLine({ page }: { page: ChallengePage }) {
  const { t, tp, locale } = useT();
  const opened = page.opened === null ? null : page.after.missions[page.opened];
  return (
    <div className="play-challenge">
      <span className="eyebrow text-glory">{t("challenge.reveal.eyebrow")}</span>
      <p className="play-chips">
        {opened ? (
          <Chip tone="glory" glyph size="sm">
            {t("challenge.reveal.opened")}: {missionName(locale, opened.id)} · {missionGoal(locale, opened.id, opened.target)}
          </Chip>
        ) : null}
        {page.completed.map((index) => {
          const item = page.after.missions[index];
          return item ? (
            <Chip key={item.id} tone="good" glyph size="sm">
              {t("challenge.reveal.completed")}: {missionName(locale, item.id)}
            </Chip>
          ) : null;
        })}
        {page.broke ? (
          <Chip tone="bad" glyph size="sm">
            {t("challenge.reveal.broke")}
          </Chip>
        ) : null}
        {page.erased > 0 ? (
          <Chip tone="bad" glyph size="sm">
            {tp("challenge.reveal.erased", page.erased)}
          </Chip>
        ) : null}
      </p>
      <span className="ml-auto flex items-baseline gap-1">
        <CountUp className="display numeric text-xl font-black" from={page.before.total} to={page.after.total} />
        <span className="text-2xs text-muted">{t("challenge.hud.of")}</span>
      </span>
    </div>
  );
}

