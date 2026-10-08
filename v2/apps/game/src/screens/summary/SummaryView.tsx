import type { AvatarConfig } from "@craque/art";
import { type Career, careerTotals, isGoalkeeper, saveOf } from "@craque/engine";
import { getCountry } from "@craque/world";
import {
  ArrowLeft,
  BookOpen,
  Crosshair,
  GitBranch,
  Hash,
  History,
  Home,
  Image,
  Link2,
  Newspaper as NewspaperIcon,
  Play,
  RotateCcw,
  Share2,
  Trophy,
} from "lucide-react";
import { m, useReducedMotion } from "motion/react";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { SectionBoundary } from "../../app/ErrorBoundary";
import { clubStyle } from "../../features/career/clubColors";
import { challengeOf } from "../../features/hall/session";
import { encodeShare, shareUrl } from "../../features/summary/shareLink";
import { peakCard } from "../../features/summary/summaryData";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { Flag } from "../../ui/Media";
import { PlayerCard } from "../../ui/PlayerCard";
import { Chip } from "../../ui/Signals";
import { notify } from "../../ui/toast/notify";
import { Newspaper } from "./Newspaper";
import { PosterSheet } from "./PosterSheet";
import { Showcase } from "./Showcase";
import { ChallengeChapter } from "./ChallengeChapter";
import { BiographySection, NumbersSection, TimelineSection } from "./SummarySections";
import { WhatIfChapter } from "./WhatIfChapter";

const CHAPTERS = ["challenge", "biography", "numbers", "timeline", "trophies", "newspaper", "whatIf"] as const;
type ChapterKey = (typeof CHAPTERS)[number];

const CHAPTER_ICONS: Readonly<Record<ChapterKey, typeof BookOpen>> = {
  challenge: Crosshair,
  biography: BookOpen,
  numbers: Hash,
  timeline: History,
  trophies: Trophy,
  newspaper: NewspaperIcon,
  whatIf: GitBranch,
};

const chapterId = (key: ChapterKey) => `capitulo-${key}`;

interface SummaryViewProps {
  career: Career;
  avatar: AvatarConfig | null;
  /**
   * `own`: a carreira deste navegador. `shared`: aberta por link, só leitura.
   * `archived`: uma carreira do Hall da Fama, só leitura.
   */
  mode: "own" | "shared" | "archived";
  /** Linha alternativa de um "E se...?" (GDD 28.3). */
  alternate?: boolean;
  onAgain?(): void;
  onHome(): void;
  /** "E se...?": seguir por outro caminho a partir da escolha de índice `index`. */
  onBranch?(index: number): void;
}

/**
 * O resumo da carreira (GDD 24). É a tela de exploração do jogo: aqui a rolagem
 * é bem-vinda. No topo, a carta do auge (vira para mostrar os totais), o nome,
 * o motivo do fim e as ações; depois, os capítulos com navegação fixa:
 * Desafio do dia (quando é desafio), Biografia, Números, Linha do tempo,
 * Troféus, Jornal e "E se...?" (carreira comum, deste navegador).
 */
export function SummaryView({ career, avatar, mode, alternate = false, onAgain, onHome, onBranch }: SummaryViewProps) {
  const { t, c, locale } = useT();
  const peak = peakCard(career);
  const challenge = typeof career.setup.challengeId === "string";
  const chapters = CHAPTERS.filter((key) => (key === "challenge" ? challenge : key === "whatIf" ? !challenge && onBranch !== undefined : true));
  const country = getCountry(career.nationality);
  const [posterOpen, setPosterOpen] = useState(false);
  const canShareLink = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const linkFor = async () => shareUrl(await encodeShare(saveOf(career), avatar));

  const copyLink = async () => {
    try {
      const url = await linkFor();
      await navigator.clipboard.writeText(url);
      feedback("confirm");
      notify({ tone: "good", title: t("summary.link.copied"), description: t("summary.link.copiedBody") });
    } catch {
      notify({ tone: "bad", title: t("summary.link.failed") });
    }
  };

  const shareLink = async () => {
    try {
      const url = await linkFor();
      await navigator.share({ title: t("app.name"), text: t("summary.link.shareText", { surname: career.setup.identity.surname }), url });
      feedback("confirm");
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) notify({ tone: "bad", title: t("summary.link.failed") });
    }
  };

  return (
    <div className="summary club-scope" style={clubStyle(peak?.club ?? null) as CSSProperties}>
      <section className="summary-hero home-hero pitch-stripes">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 pb-10 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
          {peak ? <PeakCard career={career} avatar={avatar} /> : null}
          <div className="min-w-0">
            <p className="eyebrow text-glory">
              {mode === "shared" ? t("summary.sharedEyebrow") : mode === "archived" ? t("summary.archivedEyebrow") : t("summary.eyebrow")}
            </p>
            <h1 className="home-title mt-3 truncate">{career.setup.identity.surname}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-muted">
              {country ? <Flag country={country} size={24} language={locale} decorative /> : null}
              <span>{country?.names[locale]}</span>
              <span aria-hidden="true">·</span>
              <span>{c(`positions.${career.player.position}`)}</span>
              {challenge ? (
                <Chip tone="glory" variant="solid">
                  {t("challenge.eyebrow")}
                </Chip>
              ) : career.setup.difficulty === "hard" ? (
                <Chip tone="bad" variant="solid">
                  {t("summary.poster.hard")}
                </Chip>
              ) : null}
              {alternate ? (
                <Chip tone="info" variant="solid">
                  {t("summary.alternate")}
                </Chip>
              ) : null}
              {/* Do Hall, uma carreira deixada no meio: o resumo conta até onde ela foi. */}
              {mode === "archived" && !career.end ? (
                <Chip tone="neutral" variant="outline">
                  {t("hall.interrupted")}
                </Chip>
              ) : null}
            </p>
            {career.end ? <p className="mt-3 text-lg">{c(`end.${career.end.reason}`)}</p> : null}

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2.5">
                <Button
                  size="lg"
                  onClick={() => {
                    feedback("select");
                    setPosterOpen(true);
                  }}
                >
                  <Image size={18} aria-hidden="true" />
                  {t("summary.actions.poster")}
                </Button>
                {canShareLink ? (
                  <Button size="lg" variant="secondary" onClick={() => void shareLink()}>
                    <Share2 size={18} aria-hidden="true" />
                    {t("summary.actions.share")}
                  </Button>
                ) : null}
                <Button size="lg" variant="secondary" onClick={() => void copyLink()}>
                  <Link2 size={18} aria-hidden="true" />
                  {t("summary.actions.copyLink")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {mode === "own" && onAgain ? (
                  <Button
                    variant="alert"
                    onClick={() => {
                      feedback("confirm");
                      onAgain();
                    }}
                  >
                    <RotateCcw size={17} aria-hidden="true" />
                    {t("summary.playAgain")}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  onClick={() => {
                    feedback("back");
                    onHome();
                  }}
                >
                  {mode === "shared" ? (
                    <Play size={17} aria-hidden="true" />
                  ) : mode === "archived" ? (
                    <ArrowLeft size={17} aria-hidden="true" />
                  ) : (
                    <Home size={17} aria-hidden="true" />
                  )}
                  {mode === "shared" ? t("summary.playYourOwn") : mode === "archived" ? t("summary.backToHall") : t("summary.home")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChapterNav chapters={chapters} />

      <div className="mx-auto flex max-w-4xl flex-col gap-14 px-4 pt-8 pb-20">
        {challenge ? (
          <Chapter id="challenge" title={t("summary.chapters.challenge")}>
            <ChallengeChapter career={career} shared={mode === "shared"} />
          </Chapter>
        ) : null}
        <Chapter id="biography" title={t("summary.chapters.biography")}>
          <BiographySection career={career} />
        </Chapter>
        <Chapter id="numbers" title={t("summary.chapters.numbers")}>
          <NumbersSection career={career} />
        </Chapter>
        <Chapter id="timeline" title={t("summary.chapters.timeline")}>
          <TimelineSection career={career} />
        </Chapter>
        <Chapter id="trophies" title={t("summary.chapters.trophies")}>
          <Showcase history={career.history} maxHeight={640} maxArt={72} />
        </Chapter>
        <Chapter id="newspaper" title={t("summary.chapters.newspaper")}>
          <Newspaper career={career} />
        </Chapter>
        {chapters.includes("whatIf") && onBranch ? (
          <Chapter id="whatIf" title={t("summary.chapters.whatIf")}>
            <WhatIfChapter career={career} onBranch={onBranch} />
          </Chapter>
        ) : null}
      </div>

      <PosterSheet open={posterOpen} onOpenChange={setPosterOpen} career={career} avatar={avatar} />
    </div>
  );
}

/** Um capítulo. Se o conteúdo falhar, o aviso fica no lugar dele e o resto do resumo segue. */
function Chapter({ id, title, children }: { id: ChapterKey; title: string; children: ReactNode }) {
  return (
    <section id={chapterId(id)} className="summary-chapter" aria-labelledby={`${chapterId(id)}-titulo`}>
      <h2 id={`${chapterId(id)}-titulo`} className="summary-chapter-title">
        {title}
      </h2>
      <SectionBoundary label={`capítulo ${id}`}>{children}</SectionBoundary>
    </section>
  );
}

/**
 * A navegação dos capítulos, presa abaixo da barra do topo. Marca o capítulo
 * que está na tela (observador de interseção) e leva até ele ao toque.
 */
function ChapterNav({ chapters }: { chapters: readonly ChapterKey[] }) {
  const { t } = useT();
  const reduced = useReducedMotion() === true;
  const [active, setActive] = useState<ChapterKey>(chapters[0] ?? "biography");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set<ChapterKey>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = chapters.find((candidate) => chapterId(candidate) === entry.target.id);
          if (!key) continue;
          if (entry.isIntersecting) visible.add(key);
          else visible.delete(key);
        }
        const first = chapters.find((key) => visible.has(key));
        if (first) setActive(first);
      },
      // A faixa útil começa abaixo das duas barras e vai até perto do meio da tela.
      { rootMargin: "-130px 0px -55% 0px" },
    );
    for (const key of chapters) {
      const element = document.getElementById(chapterId(key));
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav className="chapter-nav" aria-label={t("summary.chapters.label")}>
      <ul className="mx-auto grid max-w-4xl" style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}>
        {chapters.map((key) => {
          const Icon = CHAPTER_ICONS[key];
          return (
            <li key={key}>
              <a
                href={`#${chapterId(key)}`}
                className="chapter-link"
                aria-current={active === key ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  feedback("tick");
                  setActive(key);
                  document.getElementById(chapterId(key))?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
                }}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t(`summary.chapters.short.${key}`)}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * A carta do auge (GDD 24.2) que vira para mostrar o verso com os totais. É um
 * botão: toque, clique, Enter ou espaço viram a carta.
 */
function PeakCard({ career, avatar }: { career: Career; avatar: AvatarConfig | null }) {
  const { t, number } = useT();
  const peak = peakCard(career);
  const [flipped, setFlipped] = useState(false);
  const reduced = useReducedMotion() === true;
  if (!peak) return null;
  const totals = careerTotals(career.history);
  const keeper = isGoalkeeper(career.player.position);
  const back = [
    { label: t("summary.numbers.seasons"), value: totals.seasons },
    { label: t("summary.numbers.games"), value: totals.games },
    keeper ? { label: t("summary.numbers.cleanSheets"), value: totals.cleanSheets } : { label: t("summary.numbers.goals"), value: totals.goals },
    { label: t("summary.numbers.titles"), value: totals.titles },
    { label: t("summary.numbers.awards"), value: totals.awards },
    { label: t("summary.numbers.nationalGames"), value: totals.nationalGames },
  ];

  // O selo de Difícil ou Desafio vai na carta que se compartilha (D43); no Normal, nada.
  const challenge = challengeOf(career);
  const seal = challenge
    ? { kind: "challenge" as const, label: t("summary.poster.challenge", { score: challenge.total }) }
    : career.setup.difficulty === "hard"
      ? { kind: "hard" as const, label: t("summary.poster.hard") }
      : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className="peak-flip"
        aria-pressed={flipped}
        aria-label={flipped ? t("summary.peakFront") : t("summary.peakBack")}
        onClick={() => {
          feedback("tick");
          setFlipped((value) => !value);
        }}
      >
        <m.span
          className="pcard-flip-inner"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <span className="pcard-flip-face">
            <PlayerCard
              surname={career.setup.identity.surname}
              position={peak.position}
              ovr={peak.ovrEnd}
              attributes={peak.attributes}
              nationality={peak.nationality}
              club={peak.club}
              league={peak.league}
              shirt={peak.shirt}
              avatar={avatar}
              width={250}
              seal={seal}
            />
          </span>
          <span className="pcard-flip-face pcard-flip-back">
            <span className="peak-back">
              <span className="peak-back-title">{t("summary.peakTotals")}</span>
              <span className="peak-back-grid">
                {back.map((item) => (
                  <span key={item.label}>
                    <strong className="numeric">{number(item.value)}</strong>
                    <small>{item.label}</small>
                  </span>
                ))}
              </span>
              <span className="peak-back-peak">{t("summary.poster.peak", { ovr: peak.ovrEnd, age: peak.age })}</span>
            </span>
          </span>
        </m.span>
      </button>
      <p className="eyebrow">{t("summary.peak")}</p>
      <p className="text-xs text-muted">{t("summary.peakSeason", { year: peak.year, age: peak.age })}</p>
      <p className="text-2xs text-faint">{t("summary.peakHint")}</p>
    </div>
  );
}
