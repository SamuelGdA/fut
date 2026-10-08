import {
  careerPlural,
  careerText,
  clubName,
  competitionName,
  countryName,
  decisionText,
  describeEffects,
  eventOutcomeText,
  formatDecimal,
  interpolate,
  type Locale,
  optionLabel,
  positionName,
  type Vars,
} from "@craque/content";
import {
  type Career,
  type CareerNotice,
  type ClubOffer,
  type Crown,
  currentDivision,
  type Decision,
  type DecisionOption,
  fanBand,
  isGoalkeeper,
  ovrAt,
  pressureTone,
  type SeasonRecord,
  type Step,
} from "@craque/engine";
import { AWARDS, getClub, getLeague, leagueAt } from "@craque/world";

/**
 * Tudo que o terminal escreve, como linhas de texto. Puro: recebe a carreira
 * e devolve linhas, sem tocar no console. As cores entram por `Paint`, que no
 * teste e fora de um terminal de verdade não faz nada.
 */

export interface Paint {
  readonly bold: (text: string) => string;
  readonly dim: (text: string) => string;
  readonly good: (text: string) => string;
  readonly bad: (text: string) => string;
  readonly accent: (text: string) => string;
}

export const PLAIN: Paint = {
  bold: (text) => text,
  dim: (text) => text,
  good: (text) => text,
  bad: (text) => text,
  accent: (text) => text,
};

/** Textos que só o terminal usa. */
const UI = {
  pt: {
    age: "{age} anos",
    shirt: "camisa {number}",
    fans: "torcida {value} ({band})",
    loanFrom: "emprestado por {club}",
    choose: "Escolha 1 a {max} (h histórico, s salvar, q sair): ",
    invalid: "Opção inválida.",
    saved: "Salvo em {path}.",
    noSavePath: "Para salvar, rode com --salvar arquivo.json.",
    loaded: "Carreira carregada: {count} escolhas refeitas por replay.",
    replayOk: "Replay conferido: o save refaz exatamente esta carreira.",
    replayFail: "ATENÇÃO: o replay deu outra carreira.",
    summary: "Resumo da carreira",
    history: "Histórico",
    noHistory: "Nenhuma temporada jogada ainda.",
    bye: "Carreira interrompida. Até a próxima.",
    period: "Período",
    clubs: "Clubes",
    titles: "Títulos",
    awards: "Prêmios",
    peak: "Melhor OVR: {value} aos {age} anos",
    totals: "{seasons} temporadas, {games} jogos, {goals} gols, {assists} assistências",
    keeperTotals: "{seasons} temporadas, {games} jogos, {cleanSheets} jogos sem sofrer gol",
    national: "Seleção ({country}): {games} jogos, {goals} gols",
    noTitles: "Nenhum título",
    noAwards: "Nenhum prêmio",
    event: "Evento",
    chance: "{value}% de chance",
    seasonOne: "{count} temporada",
    seasonMany: "{count} temporadas",
    traitor: "Traidor",
    topScorer: "Artilheiro ({competition})",
    bestPlayer: "Craque ({competition})",
  },
  es: {
    age: "{age} años",
    shirt: "camiseta {number}",
    fans: "hinchada {value} ({band})",
    loanFrom: "a préstamo de {club}",
    choose: "Elige de 1 a {max} (h historial, s guardar, q salir): ",
    invalid: "Opción inválida.",
    saved: "Guardado en {path}.",
    noSavePath: "Para guardar, ejecuta con --salvar archivo.json.",
    loaded: "Carrera cargada: {count} elecciones rehechas por replay.",
    replayOk: "Replay verificado: el guardado rehace exactamente esta carrera.",
    replayFail: "ATENCIÓN: el replay dio otra carrera.",
    summary: "Resumen de la carrera",
    history: "Historial",
    noHistory: "Todavía no se jugó ninguna temporada.",
    bye: "Carrera interrumpida. Hasta la próxima.",
    period: "Período",
    clubs: "Clubes",
    titles: "Títulos",
    awards: "Premios",
    peak: "Mejor OVR: {value} a los {age} años",
    totals: "{seasons} temporadas, {games} partidos, {goals} goles, {assists} asistencias",
    keeperTotals: "{seasons} temporadas, {games} partidos, {cleanSheets} vallas invictas",
    national: "Selección ({country}): {games} partidos, {goals} goles",
    noTitles: "Ningún título",
    noAwards: "Ningún premio",
    event: "Evento",
    chance: "{value}% de probabilidad",
    seasonOne: "{count} temporada",
    seasonMany: "{count} temporadas",
    traitor: "Traidor",
    topScorer: "Goleador ({competition})",
    bestPlayer: "Figura ({competition})",
  },
  en: {
    age: "age {age}",
    shirt: "shirt {number}",
    fans: "fans {value} ({band})",
    loanFrom: "on loan from {club}",
    choose: "Choose 1 to {max} (h history, s save, q quit): ",
    invalid: "Invalid option.",
    saved: "Saved to {path}.",
    noSavePath: "To save, run with --salvar file.json.",
    loaded: "Career loaded: {count} choices replayed.",
    replayOk: "Replay checked: the save rebuilds exactly this career.",
    replayFail: "WARNING: the replay produced a different career.",
    summary: "Career summary",
    history: "History",
    noHistory: "No season played yet.",
    bye: "Career paused. See you next time.",
    period: "Period",
    clubs: "Clubs",
    titles: "Titles",
    awards: "Awards",
    peak: "Best OVR: {value} at {age}",
    totals: "{seasons} seasons, {games} games, {goals} goals, {assists} assists",
    keeperTotals: "{seasons} seasons, {games} games, {cleanSheets} clean sheets",
    national: "National team ({country}): {games} games, {goals} goals",
    noTitles: "No titles",
    noAwards: "No awards",
    event: "Event",
    chance: "{value}% chance",
    seasonOne: "{count} season",
    seasonMany: "{count} seasons",
    traitor: "Traitor",
    topScorer: "Top scorer ({competition})",
    bestPlayer: "Best player ({competition})",
  },
} as const satisfies Readonly<Record<Locale, Readonly<Record<string, string>>>>;

export type UiKey = keyof (typeof UI)["pt"];

export function ui(locale: Locale, key: UiKey, vars?: Vars): string {
  return interpolate(UI[locale][key], vars);
}

const RULE = "─".repeat(64);
const HEAVY = "═".repeat(64);

function stars(count: number): string {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
}

function leagueName(id: string | null): string {
  return getLeague(id)?.name ?? "";
}

// ------------------------------------------------------------- cabeçalho

/** Quem é, onde está e como está: a linha que abre cada decisão. */
export function header(career: Career, locale: Locale, paint: Paint = PLAIN): string[] {
  const { setup, contract } = career;
  const ovr = Math.round(ovrAt(career.player, career.age));
  const who = [
    String(career.world.year),
    ui(locale, "age", { age: career.age }),
    setup.identity.surname,
    positionName(career.player.position, locale),
    `OVR ${ovr}`,
  ].join(" · ");
  const lines = [paint.dim(HEAVY), paint.bold(` ${who}`)];
  if (contract) {
    const bond = career.bonds[contract.club];
    const fans = bond ? Math.round(bond.fans) : 0;
    const band = careerText(locale, `fans.${fanBand(fans, bond?.peakFans ?? fans)}`);
    const parts = [
      `${clubName(contract.club)} (${currentLeague(career, contract.club)})`,
      ui(locale, "shirt", { number: contract.shirt }),
      ui(locale, "fans", { value: fans, band }),
      careerText(locale, `missions.${contract.mission}.name`),
      careerText(locale, `pressure.${pressureTone(contract.pressure)}`),
    ];
    if (contract.loan) parts.push(ui(locale, "loanFrom", { club: clubName(contract.loan.owner) }));
    lines.push(` ${parts.join(" · ")}`);
  }
  return lines;
}

/** A liga em que o clube joga agora (a divisão muda com acesso e rebaixamento). */
function currentLeague(career: Career, club: string): string {
  const country = getClub(club)?.country;
  return country ? (leagueAt(country, currentDivision(career.world, club))?.name ?? "") : "";
}

// ------------------------------------------------------------- ofertas

function offerLines(offer: ClubOffer, locale: Locale, paint: Paint): string[] {
  const competitions =
    offer.competitions.length > 0
      ? careerText(locale, "offer.competitions", { list: offer.competitions.map((id) => competitionName(id, locale)).join(", ") })
      : careerText(locale, "offer.noCompetitions");
  const division = careerText(locale, offer.division === 1 ? "offer.division1" : "offer.division2");
  const tone = pressureTone(offer.pressure);
  const pressure = careerText(locale, `pressure.${tone}`);
  const paintedPressure = tone === "high" ? paint.bad(pressure) : tone === "low" ? paint.good(pressure) : pressure;
  const club = getClub(offer.club);
  return [
    `${paint.bold(clubName(offer.club))} · ${countryName(club?.country, locale)} · ${offer.league ? leagueName(offer.league) : division} · ${stars(offer.stars)}`,
    `${careerText(locale, "offer.role", { role: careerText(locale, `roles.${offer.role}`) })} · ${careerText(locale, `missions.${offer.mission}.name`)} (${paintedPressure}) · ${careerText(locale, "offer.shirt", { number: offer.shirt })}`,
    competitions,
    ...(offer.loan ? [careerText(locale, "offer.loan")] : []),
    ...(offer.buyout ? [careerText(locale, "offer.buyout")] : []),
    ...(offer.back ? [careerText(locale, "offer.back")] : []),
  ];
}

function eventOptionLines(option: Extract<DecisionOption, { kind: "event" }>, locale: Locale, paint: Paint): string[] {
  const success = describeEffects(locale, option.preview.success, option.target);
  const failure = describeEffects(locale, option.preview.failure, option.target);
  const noEffect = careerText(locale, "event.noEffect");
  if (option.chance === null) return [success.length > 0 ? success.join(" · ") : paint.dim(noEffect)];
  return [
    paint.good(`${careerText(locale, "event.ifSuccess")}: ${success.length > 0 ? success.join(" · ") : noEffect}`),
    paint.bad(`${careerText(locale, "event.ifFailure")}: ${failure.length > 0 ? failure.join(" · ") : noEffect}`),
  ];
}

/** A decisão atual, com as opções numeradas e o que cada uma muda. */
export function decisionBlock(career: Career, locale: Locale, paint: Paint = PLAIN): string[] {
  const decision = career.decision;
  if (!decision) return [];
  const text = decisionText(locale, career, decision);
  const lines = [paint.dim(RULE), paint.accent(` ${text.title.toUpperCase()}`), ` ${text.body}`, ""];
  decision.options.forEach((option, index) => {
    let label = optionLabel(locale, career, decision, option);
    if (option.kind === "event" && option.chance !== null) {
      label += paint.dim(`  [${ui(locale, "chance", { value: Math.round(option.chance * 100) })}]`);
    }
    lines.push(` ${paint.bold(`${index + 1})`)} ${label}`);
    const details =
      option.kind === "club"
        ? offerLines(option.offer, locale, paint)
        : option.kind === "event"
          ? eventOptionLines(option, locale, paint)
          : option.kind === "focus"
            ? [careerText(locale, `focus.${option.focus}.body`)]
            : [];
    for (const detail of details) lines.push(`    ${detail}`);
  });
  return lines;
}

// -------------------------------------------------------------- temporada

function titleList(record: SeasonRecord, locale: Locale): string {
  return record.titles.map((id) => competitionName(id, locale)).join(", ");
}

/** "Artilheiro (LaLiga)", "Craque (Champions League)". */
function crownName(crown: Crown, locale: Locale): string {
  return ui(locale, crown.award, { competition: competitionName(crown.competition, locale) });
}

/** Os prêmios de nome próprio e, depois, a artilharia e o craque de cada competição. */
function awardList(record: SeasonRecord, locale: Locale): string {
  const named = record.awards.won.filter((key) => key !== "topScorer" && key !== "bestPlayer").map((key) => AWARDS[key].names[locale]);
  return [...named, ...record.awards.crowns.map((crown) => crownName(crown, locale))].join(", ");
}

/** Uma temporada em duas ou três linhas. */
export function seasonLines(record: SeasonRecord, locale: Locale, paint: Paint = PLAIN): string[] {
  const keeper = isGoalkeeper(record.position);
  const t = (key: Parameters<typeof careerText>[1], vars?: Vars) => careerText(locale, key, vars);
  const plural = (key: Parameters<typeof careerPlural>[1], value: number) => careerPlural(locale, key, value);
  const production = record.suspended
    ? paint.bad(t("stats.suspended"))
    : keeper
      ? `${plural("stats.gamesCount", record.games)} · ${plural("stats.cleanSheetsCount", record.production.cleanSheets)}`
      : `${plural("stats.gamesCount", record.games)} · ${plural("stats.goalsCount", record.production.goals)} · ${plural("stats.assistsCount", record.production.assists)}`;
  const ovrChange = record.ovrEnd - record.ovrStart;
  const ovrText = `OVR ${Math.round(record.ovrStart)}→${Math.round(record.ovrEnd)}`;
  const ovr = ovrChange >= 0.5 ? paint.good(ovrText) : ovrChange <= -0.5 ? paint.bad(ovrText) : ovrText;
  const first = [
    paint.bold(String(record.year)),
    String(record.age),
    `${clubName(record.club)}${record.loan ? "*" : ""}`,
    t(`roles.${record.role}`),
    production,
    ovr,
    `${t("stats.fans")} ${Math.round(record.fans)}`,
  ].join(" · ");
  const lines = [` ${first}`];
  const extras: string[] = [];
  if (record.titles.length > 0) extras.push(paint.accent(`${t("stats.titles")}: ${titleList(record, locale)}`));
  if (record.awards.won.length > 0) extras.push(paint.accent(`${t("stats.awards")}: ${awardList(record, locale)}`));
  if (record.injury) extras.push(paint.bad(t("stats.injury", { injury: t(`injuries.${record.injury.type}`) })));
  if (record.national.games > 0) {
    const goals = keeper ? "" : `, ${plural("stats.goalsCount", record.national.goals)}`;
    extras.push(`${t("stats.national")}: ${plural("stats.gamesCount", record.national.games)}${goals}`);
  }
  if (record.traitor) extras.push(paint.bad(ui(locale, "traitor")));
  if (extras.length > 0) lines.push(`    ${extras.join(" · ")}`);
  return lines;
}

// ----------------------------------------------------------------- avisos

/**
 * O que aconteceu depois da escolha: resultado do evento, transferência,
 * temporadas, camisa e primeira convocação. `before` é a carreira de antes da
 * escolha, para o evento ser contado no clube onde aconteceu.
 */
export function stepLines(before: Career, decision: Decision, option: DecisionOption, step: Step, locale: Locale, paint: Paint = PLAIN): string[] {
  const lines: string[] = [""];
  let seasonIndex = before.history.length;
  for (const notice of step.notices) {
    lines.push(...noticeLines(notice, before, decision, option, step, locale, paint, () => seasonIndex++));
  }
  return lines;
}

function noticeLines(
  notice: CareerNotice,
  before: Career,
  decision: Decision,
  option: DecisionOption,
  step: Step,
  locale: Locale,
  paint: Paint,
  nextSeason: () => number,
): string[] {
  switch (notice.kind) {
    case "eventOutcome": {
      if (option.kind !== "event" || !decision.event) return [];
      const headline =
        notice.success === null ? "" : notice.success ? paint.good(careerText(locale, "event.success")) : paint.bad(careerText(locale, "event.failure"));
      const text = eventOutcomeText(locale, before, decision.event, option, notice.success);
      const effects = describeEffects(locale, notice.effects, option.target);
      return [
        ` ${[headline, text].filter((part) => part.length > 0).join(" ")}`,
        ...(effects.length > 0 ? [paint.dim(`    ${effects.join(" · ")}`)] : []),
      ];
    }
    case "transfer": {
      // Volta ao dono do empréstimo, ou a um clube onde já jogou: "recebe você de volta".
      const returning =
        !notice.loan && notice.from !== notice.to && (before.contract?.loan?.owner === notice.to || before.bonds[notice.to] !== undefined);
      const key = notice.loan ? "notice.loaned" : returning ? "notice.backHome" : "notice.signed";
      const lines = [` ${paint.accent(careerText(locale, key, { club: clubName(notice.to) }))}`];
      if (notice.traitor && notice.from) lines.push(` ${paint.bad(careerText(locale, "notice.traitor", { club: clubName(notice.from) }))}`);
      return lines;
    }
    case "season": {
      const record = step.career.history[nextSeason()];
      return record ? seasonLines(record, locale, paint) : [];
    }
    case "firstCap":
      return [` ${paint.good(careerText(locale, "notice.firstCap", { age: notice.age }))}`];
    case "focus":
      return [` ${careerText(locale, "notice.focus", { focus: careerText(locale, `focus.${notice.focus}.name`) })}`];
    case "shirt":
      return [` ${paint.accent(careerText(locale, "notice.shirt", { number: notice.number }))}`];
    case "retired":
      return [];
  }
}

// ----------------------------------------------------------------- resumo

/** O histórico inteiro, uma temporada por bloco. */
export function historyLines(career: Career, locale: Locale, paint: Paint = PLAIN): string[] {
  if (career.history.length === 0) return [` ${ui(locale, "noHistory")}`];
  return [paint.accent(` ${ui(locale, "history").toUpperCase()}`), ...career.history.flatMap((record) => seasonLines(record, locale, paint))];
}

function count<T extends string>(values: readonly T[]): Array<[T, number]> {
  const map = new Map<T, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map].sort((a, b) => b[1] - a[1]);
}

/** O fim: motivo, números, clubes, títulos e prêmios. */
export function summaryLines(career: Career, locale: Locale, paint: Paint = PLAIN): string[] {
  const history = career.history;
  const sum = (pick: (record: SeasonRecord) => number) => history.reduce((total, record) => total + pick(record), 0);
  const keeper = isGoalkeeper(career.player.position);
  const lines = [paint.dim(HEAVY), paint.accent(` ${ui(locale, "summary").toUpperCase()}`)];
  if (career.end) lines.push(` ${careerText(locale, `end.${career.end.reason}`)}`);

  const totals = keeper
    ? ui(locale, "keeperTotals", { seasons: history.length, games: sum((r) => r.games), cleanSheets: sum((r) => r.production.cleanSheets) })
    : ui(locale, "totals", {
        seasons: history.length,
        games: sum((r) => r.games),
        goals: sum((r) => r.production.goals),
        assists: sum((r) => r.production.assists),
      });
  lines.push(` ${totals}`);

  const peak = history.reduce<SeasonRecord | null>((best, record) => (best === null || record.ovrEnd > best.ovrEnd ? record : best), null);
  if (peak) lines.push(` ${ui(locale, "peak", { value: formatDecimal(peak.ovrEnd, locale, 0), age: peak.age })}`);

  const nationalGames = sum((r) => r.national.games);
  if (nationalGames > 0) {
    lines.push(
      ` ${ui(locale, "national", { country: countryName(career.nationality, locale), games: nationalGames, goals: sum((r) => r.national.goals) })}`,
    );
  }

  // Clubes na ordem, com temporadas e legado.
  lines.push("", paint.bold(` ${ui(locale, "clubs")}`));
  const stints: Array<{ club: string; seasons: number; loan: boolean }> = [];
  for (const record of history) {
    const last = stints[stints.length - 1];
    if (last && last.club === record.club) last.seasons += 1;
    else stints.push({ club: record.club, seasons: 1, loan: record.loan });
  }
  for (const stint of stints) {
    const bond = career.bonds[stint.club];
    const level = history.filter((record) => record.club === stint.club).at(-1)?.legacy ?? "none";
    const seasons = ui(locale, stint.seasons === 1 ? "seasonOne" : "seasonMany", { count: stint.seasons });
    const traitor = bond?.traitor ? ` · ${paint.bad(ui(locale, "traitor"))}` : "";
    lines.push(`  ${clubName(stint.club)}${stint.loan ? "*" : ""} · ${seasons} · ${careerText(locale, `legacy.${level}`)}${traitor}`);
  }

  lines.push("", paint.bold(` ${ui(locale, "titles")}`));
  const titles = count(history.flatMap((record) => record.titles));
  if (titles.length === 0) lines.push(`  ${ui(locale, "noTitles")}`);
  for (const [id, times] of titles) lines.push(`  ${times}x ${competitionName(id, locale)}`);

  lines.push("", paint.bold(` ${ui(locale, "awards")}`));
  const awards = count([
    ...history.flatMap((record) =>
      record.awards.won.filter((key) => key !== "topScorer" && key !== "bestPlayer").map((key) => AWARDS[key].names[locale]),
    ),
    ...history.flatMap((record) => record.awards.crowns.map((crown) => crownName(crown, locale))),
  ]);
  if (awards.length === 0) lines.push(`  ${ui(locale, "noAwards")}`);
  for (const [name, times] of awards) lines.push(`  ${times}x ${name}`);
  return lines;
}
