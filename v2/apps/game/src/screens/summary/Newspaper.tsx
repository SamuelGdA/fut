import { useReducedMotion } from "../../lib/useReducedMotion";
import { dramaAction, dramaText, matchStory, type CareerHeadline, careerHeadlines, type SeasonCover, seasonCovers } from "@craque/content";
import { d74 } from "../../i18n/d74";
import { type Career, isGoalkeeper, movementOf, type SeasonRecord } from "@craque/engine";
import { AWARDS, compareHonours, getClub, getCompetition, getLeague } from "@craque/world";
import { animate } from "motion";

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../i18n/useT";
import { Crest } from "../../ui/Media";
import { HonourToken } from "../../ui/HonourToken";
import { Sheet } from "../../ui/Overlays";
import { Expand } from "lucide-react";
import type { CSSProperties } from "react";

/**
 * O jornal aberto da carreira (D77, GDD 24.6): duas páginas lado a lado por
 * temporada. A página da direita levanta pela dobra central
 * e gira para mostrar a de baixo; arrastar faz a folha seguir o dedo, e soltar
 * depois de um trecho completa a virada. Botões e setas só mudam o destino:
 * clicar rápido enfileira as viradas, e todas acontecem.
 *
 * A anatomia é a mesma do v1: nome do jornal, data, clube e liga, a manchete
 * com o tom, o escudo como foto ao lado da linha de apoio, os números numa
 * coluna, as taças e as notas da temporada na outra, e o acumulado da carreira
 * no rodapé. A fonte dos dados mudou: a manchete é a mesma capa da revelação
 * (as duas nunca discordam), e as notas são as manchetes da carreira.
 *
 * Papel nos dois temas, de propósito: é a imagem de um jornal.
 */

/** Uma meia-volta completa faz o verso pousar na página da esquerda. */
const TURN_DEGREES = 180;
/** Uma virada inteira: dá para ver a folha subir e descer sem arrastar a fila. */
const TURN_MS = 900;
/** Fração do arrasto que confirma a virada. */
const COMMIT_AT = 0.28;
/** Quanto da largura o arrasto precisa cruzar para virar a folha inteira. */
const DRAG_SWEEP_FRACTION = 0.55;
/** Piso da animação de soltar: a folha cai, nunca teleporta os últimos graus. */
const SETTLE_MIN_MS = 280;
/** Limites das listas da coluna da direita: a página tem altura fixa. */
const ALSO_ITEM_LIMIT = 4;
/** Altura de uma linha de nota, em px, e o espaço entre linhas. */
const ALSO_ROW_HEIGHT = 13;
const ALSO_ROW_GAP = 4;
const ALSO_HEADING_HEIGHT = 14;

interface Honour {
  readonly key: string;
  readonly name: string;
  readonly award: boolean;
  readonly art: { readonly kind: "title"; readonly id: string } | { readonly kind: "award"; readonly id: keyof typeof AWARDS; readonly competition?:string };
}

interface Edition {
  readonly surname: string;
  readonly veteranChosen: boolean;
  readonly cover: SeasonCover;
  readonly record: SeasonRecord;
  readonly index: number;
  readonly clubName: string;
  readonly leagueName: string | null;
  readonly ovrDelta: number | null;
  readonly honours: readonly Honour[];
  /** O resto do que o jornal noticiou no ano (sem as taças, que têm coluna própria). */
  readonly items: readonly CareerHeadline[];
  readonly toDate: { games: number; goals: number; assists: number; cleanSheets: number; titles: number };
}

function buildEditions(career: Career, locale: "pt" | "es" | "en"): Edition[] {
  const covers = seasonCovers(locale, career);
  const headlines = careerHeadlines(locale, career);
  const running = { games: 0, goals: 0, assists: 0, cleanSheets: 0, titles: 0 };
  return career.history.flatMap((record, index) => {
    const cover = covers[index];
    if (!cover) return [];
    const previous = career.history[index - 1];
    running.games += record.games;
    running.goals += record.production.goals;
    running.assists += record.production.assists;
    running.cleanSheets += record.production.cleanSheets;
    running.titles += record.titles.length;
    const titles = [...record.titles]
      .map(
        (id): Honour => ({
          key: `t-${id}`,
          name: getCompetition(id)?.names[locale] ?? id,
          award: false,
          art: { kind: "title", id },
        }),
      );
    const awards = record.awards.won.filter(id=>id!=="bestPlayer" && id!=="topScorer").map(
      (id): Honour => ({ key: `a-${id}`, name: AWARDS[id].names[locale], award: true, art: { kind: "award", id } }),
    );
    const crowns=record.awards.crowns.map((crown):Honour=>({key:`a-${crown.award}-${crown.competition}`,name:`${AWARDS[crown.award].names[locale]} · ${getCompetition(crown.competition)?.names[locale] ?? crown.competition}`,award:true,art:{kind:"award",id:crown.award,competition:crown.competition}}));
    const edition = {
        surname: career.setup.identity.surname,
        veteranChosen: Boolean(record.veteran && record.veteran !== previous?.veteran),
        cover,
        record,
        index,
        clubName: getClub(record.club)?.name ?? record.club,
        leagueName: getLeague(record.league)?.name ?? null,
        ovrDelta: previous ? record.ovrEnd - previous.ovrEnd : null,
        honours: [...titles, ...awards,...crowns].sort((a,b)=>compareHonours(a.art,b.art)),
        items: headlines.filter((headline) => headline.year === record.year && headline.key !== "title" && headline.key !== "award"),
        toDate: { ...running },
      };
    return [edition];
  });
}

export function Newspaper({ career }: { career: Career }) {
  const { t, locale } = useT();
  const editions = buildEditions(career, locale);
  const keeper = isGoalkeeper(career.player.position);
  const copy = d74(locale);
  const [reading, setReading] = useState(false);
  const [leaf, setLeaf] = useState<"cover" | "inside">("cover");
  const [paperWidth, setPaperWidth] = useState(0);
  // Respeita o sistema e o ajuste "movimento reduzido" do jogo (MotionConfig na raiz).
  const reduced = useReducedMotion() === true;

  /** A página que está por cima da pilha. */
  const [index, setIndex] = useState(0);
  /**
   * Para onde o leitor pediu para ir. Corre à frente de `index`: cada clique
   * conta, e o contador responde na hora enquanto o papel alcança.
   */
  const [desired, setDesired] = useState(0);
  /**
   * Não nulo enquanto uma folha gira. Só a virada `auto` é tocada pelo efeito
   * abaixo; soltar um arrasto começa a própria animação (`settling`).
   */
  const [turn, setTurn] = useState<{ dir: 1 | -1; target: number; mode: "auto" | "drag" | "settling" } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(() => setPaperWidth(stage.clientWidth));
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  const dragRef = useRef<{ startX: number; width: number; dir: 1 | -1; angle: number } | null>(null);
  // Espelhos do estado para os timers: uma virada termina num setTimeout, bem
  // depois do fechamento que a começou.
  const indexRef = useRef(0);
  const desiredRef = useRef(0);
  const turningRef = useRef(false);
  const stopTurn = useRef<(() => void) | null>(null);
  useEffect(() => () => stopTurn.current?.(), []);

  // Para a frente, gira a página que sai; para trás, a que entra.
  const baseIndex = turn?.target ?? index;

  /** Põe a próxima folha em movimento, se o leitor ainda não chegou. */
  const beginTurn = useCallback((from: number) => {
    const want = desiredRef.current;
    if (want === from) return;
    const dir: 1 | -1 = want > from ? 1 : -1;
    turningRef.current = true;
    setTurn({ dir, target: from + dir, mode: "auto" });
  }, []);

  const commit = useCallback(
    (target: number) => {
      stopTurn.current?.();
      stopTurn.current = null;
      indexRef.current = target;
      turningRef.current = false;
      dragRef.current = null;
      setIndex(target);
      setTurn(null);
      const element = sheetRef.current;
      if (element) element.style.transform = "";
      // Continua a fila que o leitor fez enquanto esta folha estava no ar.
      beginTurn(target);
    },
    [beginTurn],
  );

  /** Um arrasto cai direto numa página: a fila precisa saber. */
  const syncDesired = useCallback(
    (target: number) => {
      desiredRef.current = target;
      setDesired(target);
      commit(target);
    },
    [commit],
  );

  /**
   * Gira a folha de onde está até `to` graus. Quem fecha a virada é um timer,
   * não a promessa da animação: se o nó sumir ou a animação cair, o timer
   * dispara mesmo assim e a página nunca trava no meio.
   */
  const swing = useCallback(
    (from: number, to: number, onDone: () => void, settling = false) => {
      stopTurn.current?.();
      const proportional = TURN_MS * (Math.abs(to - from) / TURN_DEGREES);
      // Movimento reduzido: a mesma máquina de estados, chegando na hora.
      const ms = reduced ? 0 : settling ? Math.max(SETTLE_MIN_MS, proportional) : proportional;
      const element = sheetRef.current;
      const animation = element && ms > 0 ? animate(element, { rotateY: [`${from}deg`, `${to}deg`] }, { duration: ms / 1000, ease: settling ? [0.22, 1, 0.36, 1] : [0.36, 0, 0.24, 1] }) : null;
      if (element && ms === 0) {
        element.style.transform = `rotateY(${to}deg)`;
      }
      const timer = window.setTimeout(() => { stopTurn.current = null; onDone(); }, ms);
      stopTurn.current = () => { window.clearTimeout(timer); animation?.stop(); };
    },
    [reduced],
  );

  // Botões e setas só mudam o destino; nada é recusado por ser rápido demais.
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

  // Uma virada da fila: a folha é montada no render, então gira no commit seguinte.
  const auto = turn?.mode === "auto" ? turn : null;
  useEffect(() => {
    if (!auto) return;
    const from = auto.dir === 1 ? 0 : -TURN_DEGREES;
    const to = auto.dir === 1 ? -TURN_DEGREES : 0;
    swing(from, to, () => commit(auto.target));
  }, [auto, swing, commit]);

  // Arrastar para virar: o ângulo vai direto no nó, na taxa de quadros do navegador.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const down = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest("button, a")) return;
      const width = stage.clientWidth || 1;
      // Pegar a folha sempre vale, mesmo no meio de uma virada: o que estava
      // no ar termina na hora e a fila que sobrou é descartada.
      if (turn) {
        desiredRef.current = turn.target;
        setDesired(turn.target);
        commit(turn.target);
      }
      dragRef.current = { startX: event.clientX, width, dir: 1, angle: 0 };
    };

    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      if (Math.abs(dx) < 3) return;
      // A direção é decidida pelo primeiro movimento de verdade e fica.
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
      event.preventDefault();
      const sweep = Math.max(1, drag.width * DRAG_SWEEP_FRACTION);
      const progress = Math.min(1, Math.max(0, (drag.dir === 1 ? -dx : dx) / sweep));
      drag.angle = drag.dir === 1 ? -TURN_DEGREES * progress : -TURN_DEGREES * (1 - progress);
      const element = sheetRef.current;
      if (element) element.style.transform = `rotateY(${drag.angle}deg)`;
    };

    const up = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag || !turn || turn.mode !== "drag") return;
      const progress = drag.dir === 1 ? -drag.angle / TURN_DEGREES : 1 + drag.angle / TURN_DEGREES;
      const committed = progress >= COMMIT_AT;
      const from = drag.angle;
      const to = drag.dir === 1 ? (committed ? -TURN_DEGREES : 0) : committed ? 0 : -TURN_DEGREES;
      const target = turn.target;
      setTurn({ ...turn, mode: "settling" });
      swing(
        from,
        to,
        () => {
          if (committed) syncDesired(target);
          else {
            // Faltou: a folha volta a descansar e a página não mudou.
            turningRef.current = false;
            setTurn(null);
            const element = sheetRef.current;
            if (element) element.style.transform = "";
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

  if (editions.length === 0) return null;
  const base = editions[baseIndex];
  const current = editions[index];

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      turnTo(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      turnTo(-1);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{t("summary.newspaper.hint")}</p>
        <button type="button" className="paper-read-button" onClick={() => { syncDesired(desiredRef.current); setReading(true); }}><Expand size={14} aria-hidden="true" />{copy.readPaper}</button>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="numeric text-xs text-muted" aria-live="polite">
            {t("summary.newspaper.counter", { current: desired + 1, total: editions.length })}
          </span>
          <TurnButton direction="prev" label={t("summary.newspaper.prev")} disabled={desired === 0} onClick={() => turnTo(-1)} />
          <TurnButton direction="next" label={t("summary.newspaper.next")} disabled={desired === editions.length - 1} onClick={() => turnTo(1)} />
        </div>
      </div>

      <div
        ref={stageRef}
        className="paper-stage"
        data-compact={paperWidth > 0 && paperWidth < 640 || undefined}
        style={{ "--paper-scale": paperWidth > 0 && paperWidth < 640 ? paperWidth / 800 : 1 } as CSSProperties}
        tabIndex={0}
        role="region"
        aria-roledescription={t("summary.newspaper.roleDescription")}
        aria-label={t("summary.chapters.newspaper")}
        onKeyDown={onKeyDown}
      >
        <div className="paper-canvas">
        {base ? <div className="paper-spread" data-year={base.record.year}><FrontPage edition={base} total={editions.length} keeper={keeper} /><InsidePage edition={base} /></div> : null}
        {turn && current && base ? <>
          <div aria-hidden="true" className="paper-static-leaf" data-side={turn.dir === 1 ? "left" : "right"}>{turn.dir === 1 ? <FrontPage edition={current} total={editions.length} keeper={keeper} /> : <InsidePage edition={current} />}</div>
          <div ref={sheetRef} aria-hidden="true" className="paper-sheet" style={{ transform: turn.dir === 1 ? undefined : `rotateY(-${TURN_DEGREES}deg)` }}>
            <div className="paper-sheet-front"><InsidePage edition={turn.dir === 1 ? current : base} /></div>
            <div className="paper-sheet-back"><FrontPage edition={turn.dir === 1 ? base : current} total={editions.length} keeper={keeper} /></div>
          </div></>
        : null}
        </div>
      </div>
      <Sheet open={reading} onOpenChange={setReading} title={copy.readPaper} closeLabel={t("common.close")} headerActions={<>
        <TurnButton direction="prev" label={t("summary.newspaper.prev")} disabled={index === 0} onClick={() => syncDesired(Math.max(0, indexRef.current - 1))} />
        <TurnButton direction="next" label={t("summary.newspaper.next")} disabled={index === editions.length - 1} onClick={() => syncDesired(Math.min(editions.length - 1, indexRef.current + 1))} />
      </>}>
        <p className="paper-reading-position" aria-live="polite">{t("summary.newspaper.counter", { current: index + 1, total: editions.length })}{current ? ` · ${current.record.year}` : ""}</p>
        <div className="paper-reading-tabs" role="group" aria-label={copy.readPaper}><button type="button" aria-pressed={leaf === "cover"} onClick={() => setLeaf("cover")}>{copy.paperCover}</button><button type="button" aria-pressed={leaf === "inside"} onClick={() => setLeaf("inside")}>{copy.paperInside}</button></div>
        <div className="paper-reading paper-stage">{current ? leaf === "cover" ? <FrontPage edition={current} total={editions.length} keeper={keeper} /> : <InsidePage edition={current} /> : null}</div>
      </Sheet>
    </div>
  );
}

function TurnButton({ direction, label, disabled, onClick }: { direction: "prev" | "next"; label: string; disabled: boolean; onClick(): void }) {
  return (
    <button type="button" className="paper-turn" onClick={onClick} disabled={disabled} aria-label={label} title={label}>
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}

const TONE_GLYPH = { good: "▲", bad: "▼", neutral: "●" } as const;

function FrontPage({ edition, total, keeper }: { edition: Edition; total: number; keeper: boolean }) {
  const { t, tp, c, cp, money, locale } = useT();
  const { cover, record, honours, items, toDate, index } = edition;
  // Manchete longa encolhe: a página tem a mesma altura em toda edição.
  const size = cover.headline.length > 46 ? "small" : cover.headline.length > 30 ? "medium" : "large";
  const tags = seasonTags(record).map((tag) => ({ ...tag, text: tagText(tag.kind, record, t, c) }));

  return (
    <article className="paper-page" data-tone={cover.tone} data-leaf="cover" data-year={record.year}>
      <div className="paper-nameplate">
        <h3>{cover.paper}</h3>
      </div>
      <div className="paper-dateline">
        <span>{t("summary.newspaper.edition", { current: index + 1, total })} · 1/2</span>
        <span>{t("summary.newspaper.at", { age: record.age, year: record.year })}</span>
      </div>
      <p className="paper-club">
        {edition.clubName}
        {edition.leagueName ? (
          <span>
            {" · "}
            {edition.leagueName}
          </span>
        ) : null}
      </p>
      <h4 className="paper-headline" data-size={size}>
        <span className="paper-tone" aria-hidden="true">
          {TONE_GLYPH[cover.tone]}
        </span>
        <span className="sr-only">{t(`tones.${cover.tone}`)}: </span>
        {cover.headline}
      </h4>

      <div className="paper-lede">
        <figure>
          <div className="paper-photo">
            <Crest club={record.club} size={64} decorative plain fill />
          </div>
          <figcaption>{edition.clubName}</figcaption>
        </figure>
        <p>{cover.support}</p>
      </div>

      <div className="paper-columns">
        <div className="paper-box">
          <p className="paper-section">{t("summary.newspaper.numbers")}</p>
          <dl className="paper-stats">
            <Stat label={t("summary.numbers.games")} value={String(record.games)} />
            <Stat
              label={keeper ? t("summary.numbers.cleanSheets") : t("summary.numbers.goals")}
              value={String(keeper ? record.production.cleanSheets : record.production.goals)}
            />
            <Stat
              label={keeper ? t("summary.numbers.conceded") : t("summary.numbers.assists")}
              value={String(keeper ? record.production.conceded : record.production.assists)}
            />
            <Stat label="OVR" value={String(record.ovrEnd)} delta={edition.ovrDelta} />
            <Stat label={t("summary.newspaper.value")} value={money(record.marketValue)} />
          </dl>
        </div>

        <div className="paper-side">
          {honours.length > 0 ? (
            <div className="paper-box">
              <p className="paper-section">{honours.some((honour) => !honour.award) ? t("summary.newspaper.trophies") : t("summary.newspaper.awards")}</p>
              <ul className="paper-honours" data-compact={honours.length>5 || undefined}>
                {honours.map((honour) => (
                  <li key={honour.key} data-award={honour.award || undefined}>
                    <HonourToken id={honour.art.kind==="award" ? honour.art.competition ?? honour.art.id : honour.art.id} award={honour.art.kind==="award" ? honour.art.id : undefined} language={locale} size={20} label={`${honour.name} · ${record.year}`} />
                    <span>{honour.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {tags.length > 0 ? (
            <div className="paper-tags">
              {tags.map((tag) => (
                <span key={tag.kind} data-tone={tag.tone}>
                  {tag.text}
                </span>
              ))}
            </div>
          ) : null}
          {items.length > 0 ? <AlsoThisSeason items={items} /> : null}
        </div>
      </div>

      <div className="paper-todate">
        <p className="paper-section-flat">{t("summary.newspaper.toDate")}</p>
        <p className="numeric">
          {cp("stats.gamesCount", toDate.games)}
          {" · "}
          {keeper ? cp("stats.cleanSheetsCount", toDate.cleanSheets) : cp("stats.goalsCount", toDate.goals)}
          {keeper ? "" : ` · ${cp("stats.assistsCount", toDate.assists)}`}
          {" · "}
          {tp("summary.newspaper.titlesCount", toDate.titles)}
        </p>
      </div>
      <p className="paper-brand">{t("app.name")}</p>
    </article>
  );
}



function InsidePage({ edition }: { edition: Edition }) {
  const { locale, t, c } = useT(); const copy = d74(locale); const drama = dramaText(locale);
  const record = edition.record;
  const moments = [...(record.keyMatches ?? [])].sort((a, b) => Number(b.match.stage === "final") - Number(a.match.stage === "final") || Number(b.match.national) - Number(a.match.national)).slice(0, 2);
  if (!moments.length && !record.promise && !edition.veteranChosen) return <article className="paper-page paper-blank" data-leaf="blank" data-year={record.year} aria-label={t("summary.newspaper.blank")} />;
  return <article className="paper-page paper-inside" data-leaf="inside" data-year={record.year}>
    <div className="paper-nameplate"><h3>{edition.cover.paper}</h3></div><div className="paper-dateline"><span>{t("summary.newspaper.at", { age: record.age, year: record.year })}</span><span>2 / 2</span></div>
    <p className="paper-club">{edition.clubName}</p><h4 className="paper-headline" data-size="small">{copy.backPage}</h4><p className="paper-inside-deck">{copy.backDeck}</p>
    <div className="paper-inside-body">
      {moments.length ? <ol className="paper-moments">{moments.map((result) => <li key={result.match.competition} data-won={result.won}>
        <div className="paper-moment-top"><span>{getCompetition(result.match.competition)?.names[locale]} · {drama.stages[result.match.stage]}</span><strong>{result.score.join(" × ")}</strong></div>
        <h5>{matchStory(locale, result, record.position, edition.surname).title}</h5>
        <p className="paper-moment-story">{matchStory(locale, result, record.position, edition.surname).body}</p>
      </li>)}</ol> : null}
      <div className="paper-inside-notes">
        {record.promise ? <section><p className="paper-section-flat">{drama.active}</p><h5>{record.promise.fulfilled ? copy.promiseKept : copy.promiseMiss}</h5><p><b>{record.promise.actual} / {record.promise.target}</b> {drama[record.promise.metric]}</p></section> : null}

        {edition.veteranChosen && record.veteran ? <section><p className="paper-section-flat">{copy.benefit}</p><h5>{dramaAction(locale, record.veteran, record.position)}</h5></section> : null}
      </div>
    </div>
    <div className="paper-todate"><p className="numeric">{record.games} {c("stats.games")} · {record.production.goals} {c("stats.goals")} · {record.production.assists} {c("stats.assists")} · {record.ovrEnd} OVR</p></div><p className="paper-brand">{t("app.name")}</p>
  </article>;
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div className="paper-stat">
      <dt>{label}</dt>
      <dd>
        {value}
        {delta !== null && delta !== undefined && delta !== 0 ? (
          <span data-tone={delta > 0 ? "good" : "bad"}>
            {delta > 0 ? "▲" : "▼"}
            {Math.abs(delta)}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

type TagKind = "promoted" | "relegated" | "suspended" | "loan" | "injury";

function seasonTags(record: SeasonRecord): Array<{ kind: TagKind; tone: "good" | "bad" | "neutral" }> {
  const tags: Array<{ kind: TagKind; tone: "good" | "bad" | "neutral" }> = [];
  const movement = movementOf(record);
  if (movement === "promoted") tags.push({ kind: "promoted", tone: "good" });
  if (movement === "relegated") tags.push({ kind: "relegated", tone: "bad" });
  if (record.suspended) tags.push({ kind: "suspended", tone: "bad" });
  if (record.loan) tags.push({ kind: "loan", tone: "neutral" });
  if (record.injury) tags.push({ kind: "injury", tone: "neutral" });
  return tags;
}

function tagText(
  kind: TagKind,
  record: SeasonRecord,
  t: ReturnType<typeof useT>["t"],
  c: ReturnType<typeof useT>["c"],
): string {
  switch (kind) {
    case "promoted":
      return t("reveal.promoted");
    case "relegated":
      return t("reveal.relegated");
    case "suspended":
      return t("reveal.suspended");
    case "loan":
      return t("reveal.loan");
    case "injury":
      return record.injury ? `${c("stats.injury", { injury: c(`injuries.${record.injury.type}`) })} · −${record.injury.lostGames} ${c("stats.games")}` : "";
  }
}

/**
 * "Também nesta temporada", cortado em linhas inteiras: o espaço que sobra
 * muda a cada página (de nada a cinco taças acima), então o número de linhas
 * vem da medida, nunca de uma constante. O observador avisa na primeira medida
 * e a cada mudança de tamanho.
 */
function AlsoThisSeason({ items }: { items: readonly CareerHeadline[] }) {
  const { t } = useT();
  const boxRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(ALSO_ITEM_LIMIT);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const available = box.clientHeight - ALSO_HEADING_HEIGHT;
      const fits = Math.floor((available + ALSO_ROW_GAP) / (ALSO_ROW_HEIGHT + ALSO_ROW_GAP));
      setRows(Math.max(0, Math.min(ALSO_ITEM_LIMIT, fits)));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const shown = items.slice(0, rows);
  return (
    <div ref={boxRef} className="paper-also">
      {shown.length > 0 ? (
        <>
          <p className="paper-section-flat">{t("summary.newspaper.also")}</p>
          <ul>
            {shown.map((item) => (
              <li key={`${item.key}-${item.text}`} data-tone={item.tone} title={item.text}>
                <span aria-hidden="true" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
