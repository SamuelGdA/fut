import { leagueAfter, leagueSnapshot, type Career, type KeyMatch, type LeagueSnapshot } from "@craque/engine";
import { getClub } from "@craque/world";
import { m } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "../../i18n/useT";
import { useReducedMotion } from "../../lib/useReducedMotion";
import { Crest } from "../../ui/Media";

/**
 * A tabela da liga no jogo decisivo de liga (D96). Antes do lance, a tabela ao
 * entrar na rodada, com o clube do jogador em destaque e o adversário marcado;
 * no resultado, a rodada inteira fecha: todos os clubes somam os pontos e a
 * tabela se reordena. A lista rola sozinha até o clube do jogador; se ele já
 * aparece com a tabela no topo, ela fica no topo, do primeiro para baixo.
 *
 * D98: é uma peça só, do lance ao resultado, com altura fixa e presa ao pé do
 * card, então nunca muda de tamanho nem de lugar com as opções ou o texto do
 * resultado. Por ser a mesma peça, a troca de lugar das linhas aparece. Em tela
 * baixa, ela fica com o espaço que sobra (no mínimo três linhas) ou não aparece.
 *
 * A foto da rodada é tirada uma vez por lance e guardada aqui: entre o lance e
 * o resultado a carreira muda (a torcida do jogo), e a tabela não pode mudar
 * junto.
 */
const SNAPSHOTS = new Map<string, LeagueSnapshot | null>();

/** Quanto o resultado espera antes de fechar a rodada, e quanto as linhas levam para trocar de lugar. */
const SETTLE_DELAY_MS = 450;
const SETTLE_MS = 900;
/** A tabela inteira; com menos espaço, no mínimo cabeçalho, colunas e três linhas. */
const FULL_HEIGHT = 150;
const MIN_HEIGHT = 112;
/** Sem espaço para a tabela, a faixa: uma linha de clubes em volta do jogador. */
const STRIP_HEIGHT = 46;

function snapshotFor(career: Career, match: KeyMatch, decision: number): LeagueSnapshot | null {
  const key = `${career.setup.seed}|${career.world.year}|${decision}|${match.competition}`;
  if (!SNAPSHOTS.has(key)) {
    if (SNAPSHOTS.size > 24) SNAPSHOTS.clear();
    SNAPSHOTS.set(key, leagueSnapshot(career, match));
  }
  return SNAPSHOTS.get(key) ?? null;
}

/** Os pontos sobem contando, do que o clube tinha ao que fechou a rodada. */
function CountUp({ from, to, run, format }: { from: number; to: number; run: boolean; format(value: number): string }) {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    if (!run || from === to) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / SETTLE_MS);
      setValue(Math.round(from + (to - from) * (1 - (1 - k) ** 3)));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [from, to, run]);
  return <>{format(run && from !== to ? (value ?? from) : to)}</>;
}

export function LeagueLive({ career, match, decision, score }: { career: Career; match: KeyMatch; decision: number; score: readonly [number, number] | null }) {
  const { t, number } = useT();
  const reduced = useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const [snapshot] = useState(() => snapshotFor(career, match, decision));
  // No resultado, a tabela fica como estava por um instante e só então a
  // rodada fecha: as linhas trocam de lugar à vista (D97). Sem animação, fecha direto.
  const [closed, setClosed] = useState(() => Boolean(score));
  useEffect(() => {
    if (!score || closed) return undefined;
    const timer = window.setTimeout(() => setClosed(true), reduced ? 0 : SETTLE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [score, closed, reduced]);
  const done = Boolean(score) && closed;
  // O tamanho é medido com as opções na tela (o estado mais alto do card) e
  // fica o mesmo até o resultado: a tabela nunca cresce, encolhe nem muda de
  // lugar. Com pouco espaço vira a faixa; sem nem isso, não aparece no jogo.
  const box = useRef<HTMLElement>(null);
  const [fit, setFit] = useState<{ mode: "table" | "strip"; height: number } | "none">({ mode: "table", height: FULL_HEIGHT });
  useLayoutEffect(() => {
    if (score) return undefined;
    const measure = () => {
      const table = box.current;
      const card = table?.closest<HTMLElement>(".decision");
      if (!table || !card) return;
      // Espaço livre: a folga acima da tabela (ela fica presa ao pé) mais a altura dela, menos o que transborda.
      const above = table.previousElementSibling?.getBoundingClientRect().bottom ?? card.getBoundingClientRect().top;
      const gap = parseFloat(getComputedStyle(card).rowGap) || 0;
      const slack = Math.max(0, table.getBoundingClientRect().top - above - gap);
      // O transbordo conta o respiro de baixo do card, que a rolagem não conta.
      const floor = card.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(card).paddingBottom) || 0);
      const free = slack + table.offsetHeight - Math.max(0, table.getBoundingClientRect().bottom - floor);
      const next = free >= FULL_HEIGHT ? { mode: "table" as const, height: FULL_HEIGHT }
        : free >= MIN_HEIGHT ? { mode: "table" as const, height: Math.floor(free) }
        : free >= STRIP_HEIGHT ? { mode: "strip" as const, height: STRIP_HEIGHT } : "none" as const;
      setFit((current) => (current !== "none" && next !== "none" && current.mode === next.mode && current.height === next.height ? current : next));
    };
    measure();
    // O card muda de tamanho com a janela e com avisos que entram e saem no topo da tela.
    const card = box.current?.closest<HTMLElement>(".decision");
    if (!card || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [score]);
  const rows = snapshot ? (score && done ? leagueAfter(snapshot, score) : snapshot.before) : [];

  const strip = fit !== "none" && fit.mode === "strip";
  // Foco no clube do jogador: no topo se ele já cabe ali; senão, centralizado.
  // Na faixa, o mesmo de lado: no começo se ele cabe, senão no meio.
  useLayoutEffect(() => {
    const box = list.current;
    if (!box || !snapshot) return;
    const focus = () => {
      const row = box.querySelector<HTMLElement>("[data-me]");
      if (!row) return;
      const behavior = done && !reduced ? "smooth" : "auto";
      if (strip) {
        const right = row.offsetLeft + row.offsetWidth;
        const left = right <= box.clientWidth ? 0 : row.offsetLeft - (box.clientWidth - row.offsetWidth) / 2;
        box.scrollTo({ left: Math.max(0, left), behavior });
        return;
      }
      const bottom = row.offsetTop + row.offsetHeight;
      const top = bottom <= box.clientHeight ? 0 : row.offsetTop - (box.clientHeight - row.offsetHeight) / 2;
      box.scrollTo({ top: Math.max(0, top), behavior });
    };
    focus();
    // Depois de reordenar, a linha muda de lugar: foca de novo quando a animação assenta.
    if (done) {
      const timer = window.setTimeout(focus, reduced ? 0 : SETTLE_MS + 60);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [done, snapshot, reduced, strip]);

  if (!snapshot || !rows.length) return null;
  // Sem espaço: só o marcador, para medir de novo se o card crescer.
  if (fit === "none") return <section ref={box} className="league-live-none" aria-hidden="true" />;
  const was = new Map(snapshot.before.map((row) => [row.club, row]));
  const name = (club: string) => getClub(club)?.short ?? getClub(club)?.name ?? club;
  return (
    <section ref={box} className="league-live" style={{ height: fit.height }} data-mode={fit.mode} data-done={done || undefined} data-waiting={(score && !done) || undefined} aria-label={t("career.play.leagueTable")}>
      <header className="league-live-head">
        <span className="eyebrow league-live-title">
          <i className="league-live-dot" aria-hidden="true" />
          {t("career.play.leagueTable")}
        </span>
        <span key={done ? "fim" : "rodada"} className="numeric league-live-round">
          <span className="league-live-round-long">{t(done ? "career.play.leagueRoundDone" : "career.play.leagueRound", { round: snapshot.round, rounds: snapshot.rounds })}</span>
          <span className="league-live-round-short" aria-hidden="true">{snapshot.round}/{snapshot.rounds}</span>
        </span>
      </header>
      <div className="league-live-cols" aria-hidden="true">
        <span>#</span><span>{t("career.play.leagueClub")}</span><span>{t("career.play.leaguePlayed")}</span><span>{t("career.play.leaguePoints")}</span>
      </div>
      {/* Rola por dentro: o teclado precisa alcançar (foco com as setas). */}
      <ol ref={list} className="league-live-rows" tabIndex={0} aria-label={t("career.play.leagueTable")}>
        {rows.map((row, index) => {
          const before = was.get(row.club);
          const moved = done && before ? before.position - row.position : 0;
          const gained = done && before ? row.points - before.points : null;
          const me = row.club === snapshot.team;
          const rival = row.club === snapshot.opponent;
          return (
            <m.li
              key={row.club}
              layout={reduced ? false : "position"}
              initial={reduced ? false : { opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ layout: { duration: SETTLE_MS / 1000, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3, delay: Math.min(index, 12) * 0.025 }, x: { duration: 0.35, delay: Math.min(index, 12) * 0.025 } }}
              className="league-live-row"
              title={strip ? name(row.club) : undefined}
              data-me={me || undefined}
              data-rival={rival || undefined}
              data-move={moved > 0 ? "up" : moved < 0 ? "down" : undefined}
              data-gain={gained ?? undefined}
              aria-current={me ? "true" : undefined}
            >
              <span className="numeric league-live-pos">{row.position}</span>
              <span className="league-live-club">
                <Crest club={row.club} size={18} decorative />
                <span className="truncate">{name(row.club)}</span>
                {moved !== 0 ? <span className="league-live-move" data-up={moved > 0 || undefined}>{moved > 0 ? "▲" : "▼"}{Math.abs(moved)}</span> : null}
              </span>
              <span className="numeric league-live-played">{row.played}</span>
              <span className="numeric league-live-points">
                <CountUp from={before?.points ?? row.points} to={row.points} run={done && !reduced} format={number} />
                {gained !== null ? <small data-gain={gained}>+{gained}</small> : null}
              </span>
            </m.li>
          );
        })}
      </ol>
    </section>
  );
}
