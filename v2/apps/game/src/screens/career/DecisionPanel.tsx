import {
  decisionText,
  describeEffect,
  effectTone,
  type EffectTone,
  optionLabel,
} from "@craque/content";
import {
  type Career,
  type ClubOffer,
  type Decision,
  type DecisionOption,
  type Effect,
  type EventTarget,
  FOCUS_SLOT,
  pressureTone,
  type SquadRole,
  TRAINING,
  type TrainingFocus,
} from "@craque/engine";
import { getClub, getCompetition, getCountry, getLeague } from "@craque/world";
import {
  ArrowRightLeft,
  Crosshair,
  Dumbbell,
  Eye,
  Feather,
  Flag,
  Footprints,
  Hand,
  House,
  type LucideIcon,
  Megaphone,
  Rocket,
  Send,
  Shield,
  Shirt,
  Swords,
  Zap,
} from "lucide-react";
import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { clubStyle } from "../../features/career/clubColors";
import { lastRecord } from "../../features/career/view";
import { attributeText } from "../../i18n/attributes";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";
import { Crest, Flag as CountryFlag, LeagueBadge } from "../../ui/Media";
import { Chip } from "../../ui/Signals";
import { OddsBar } from "../../ui/Stats";
import { TONE_GLYPH, type Tone } from "../../ui/tone";

interface DecisionPanelProps {
  career: Career;
  /** Devolve falso se a escolha não vale mais. */
  onChoose(optionId: string): boolean;
  /** Na linha alternativa (GDD 28.3), a opção que a original escolheu nesta decisão. */
  original?: string | null;
}

const ROLE_TONE: Readonly<Record<SquadRole, Tone>> = {
  star: "glory",
  starter: "good",
  rotation: "neutral",
  reserve: "bad",
  surplus: "bad",
  third: "bad",
};

const FOCUS_ICON: Readonly<Record<TrainingFocus, LucideIcon>> = {
  burst: Zap,
  finishing: Crosshair,
  vision: Eye,
  ballControl: Footprints,
  combat: Swords,
  power: Dumbbell,
  diving: Feather,
  handling: Hand,
  distribution: Send,
  reflexes: Shield,
  explosion: Rocket,
  command: Megaphone,
};

/**
 * A decisão atual (GDD 14.4), inteira na tela: o título, o texto e as opções
 * em linhas compactas. Tocar uma opção marca e abre os detalhes dela; o botão
 * confirma. Duas etapas de propósito: num celular, um toque sem querer não
 * pode mudar uma carreira.
 */
export function DecisionPanel({ career, onChoose, original = null }: DecisionPanelProps) {
  const { t, c, locale } = useT();
  const decision = career.decision;
  const [picked, setPicked] = useState<{ decision: number; option: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const decisionId = decision?.id ?? null;

  // Decisão nova (a tela abriu, ou o jogador acabou de confirmar a de antes):
  // o foco vai para o título, e o leitor de tela lê a pergunta nova. Quem está
  // com o foco fora da decisão (no menu, no histórico) não perde o lugar.
  useEffect(() => {
    if (decisionId === null) return;
    const active = document.activeElement;
    const inside = active !== null && sectionRef.current?.contains(active) === true;
    if (active && active !== document.body && document.contains(active) && !inside) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [decisionId]);

  if (!decision) return null;

  const selected = picked && picked.decision === decision.id ? picked.option : null;
  const text = decisionText(locale, career, decision);
  // Rádio com foco itinerante (GDD 36): Tab entra no grupo pela marcada (ou pela
  // primeira) e as setas andam entre as opções, marcando.
  const focusIndex = Math.max(0, decision.options.findIndex((option) => option.id === selected));
  const selectedOption = decision.options.find((option) => option.id === selected) ?? null;
  // A legenda sob o título explica a opção marcada; sem marca, o texto da decisão.
  const caption = (selectedOption ? optionCaption(selectedOption) : null) ?? text.body;

  const select = (id: string) => {
    if (id !== selected) feedback("select");
    setPicked({ decision: decision.id, option: id });
  };

  const onOptionsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Readonly<Record<string, (index: number) => number>> = {
      ArrowDown: (index) => index + 1,
      ArrowRight: (index) => index + 1,
      ArrowUp: (index) => index - 1,
      ArrowLeft: (index) => index - 1,
      Home: () => 0,
      End: () => decision.options.length - 1,
    };
    const move = keys[event.key];
    if (!move) return;
    event.preventDefault();
    const count = decision.options.length;
    const next = (move(focusIndex) + count) % count;
    const option = decision.options[next];
    if (!option) return;
    select(option.id);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='radio']");
    buttons[next]?.focus();
  };

  function optionCaption(option: DecisionOption): string | null {
    switch (option.kind) {
      case "club":
        return c(`missions.${option.offer.mission}.hint`);
      case "stay":
        return career.contract ? c(`renewals.${career.contract.mission}.hint`) : null;
      case "focus":
        return c(`focus.${option.focus}.body`);
      case "retire":
        return t("career.retireHint");
      case "event":
        return null;
    }
  }

  const confirm = () => {
    if (!selectedOption) {
      feedback("back");
      return;
    }
    feedback(selectedOption.kind === "retire" ? "back" : selectedOption.kind === "focus" ? "rise" : "confirm");
    onChoose(selectedOption.id);
  };

  return (
    <section ref={sectionRef} className="decision" aria-labelledby={`decisao-${decision.id}`}>
      <div className="flex shrink-0 flex-col gap-1.5">
        <p className="eyebrow">
          {decision.kind === "event"
            ? t("career.decisionMeta", { kind: t("career.kinds.event"), year: decision.year, age: decision.age })
            : t("career.decisionWhen", { year: decision.year, age: decision.age })}
        </p>
        <h2 id={`decisao-${decision.id}`} ref={headingRef} tabIndex={-1} className="decision-title outline-none">
          {text.title}
        </h2>
        {caption ? (
          <p className="decision-body" aria-live="polite">
            {caption}
          </p>
        ) : null}
      </div>

      <div
        className="decision-options"
        data-layout={decision.kind === "focus" ? "grid" : undefined}
        role="radiogroup"
        aria-labelledby={`decisao-${decision.id}`}
        onKeyDown={onOptionsKeyDown}
      >
        {decision.options.map((option, index) => (
          <OptionRow
            key={option.id}
            career={career}
            decision={decision}
            option={option}
            checked={option.id === selected}
            tabIndex={index === focusIndex ? 0 : -1}
            original={option.id === original ? t("career.originalChoice") : null}
            onSelect={() => select(option.id)}
          />
        ))}
      </div>

      <div className="decision-confirm">
        <Button
          size="lg"
          block
          variant={!selectedOption ? "secondary" : selectedOption.kind === "retire" ? "danger" : "primary"}
          onClick={confirm}
          aria-disabled={!selectedOption || undefined}
          className={cn(!selectedOption && "bg-panel text-muted")}
        >
          {selectedOption ? t("career.confirm") : t("career.pick")}
        </Button>
      </div>
    </section>
  );
}

interface OptionRowProps {
  career: Career;
  decision: Decision;
  option: DecisionOption;
  checked: boolean;
  /** Rótulo "escolha da original", na decisão onde a linha alternativa se separou. */
  original: string | null;
  /** Foco itinerante: só uma opção do grupo entra no Tab. */
  tabIndex: number;
  onSelect(): void;
}

function OptionRow({ career, decision, option, checked, original, tabIndex, onSelect }: OptionRowProps) {
  const { locale } = useT();
  const label = optionLabel(locale, career, decision, option);
  const clubId = option.kind === "club" ? option.offer.club : option.kind === "stay" ? (career.contract?.club ?? null) : null;
  const style = clubId ? (clubStyle(clubId) as CSSProperties) : undefined;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={tabIndex}
      className={cn("option", clubId && "club-scope")}
      data-tone={option.kind === "retire" ? "bad" : undefined}
      data-original={original ?? undefined}
      style={style}
      onClick={onSelect}
    >
      {option.kind === "club" ? <OfferRow label={label} offer={option.offer} checked={checked} loanDecision={decision.kind === "loan"} /> : null}
      {option.kind === "stay" ? <StayRow label={label} career={career} checked={checked} shirt={option.shirt} /> : null}
      {option.kind === "retire" ? <RetireRow label={label} /> : null}
      {option.kind === "focus" ? <FocusRow label={label} focus={option.focus} career={career} /> : null}
      {option.kind === "event" ? <EventRow label={label} option={option} checked={checked} career={career} /> : null}
    </button>
  );
}

/** As três colunas de uma linha: imagem, texto e a marca de escolha. */
function RowFrame({ lead, title, meta, wrap = false }: { lead: ReactNode; title: string; meta?: ReactNode; wrap?: boolean }) {
  return (
    <>
      <span className="option-lead">{lead}</span>
      <span className="option-main">
        <span className="option-title" data-wrap={wrap || undefined}>
          {title}
        </span>
        {meta ? <span className="option-meta">{meta}</span> : null}
      </span>
      <span className="option-mark" aria-hidden="true" />
    </>
  );
}

function Stars({ count }: { count: number }) {
  const { cp } = useT();
  return (
    <span className="option-stars text-glory" role="img" aria-label={cp("offer.stars", count)}>
      {"★".repeat(count)}
      <span className="text-faint">{"☆".repeat(5 - count)}</span>
    </span>
  );
}

/** A liga do clube, com o selo: é o que diz o tamanho do passo (a força fica para o motor). */
function LeagueLine({ league }: { league: string | null }) {
  const data = getLeague(league);
  if (!data) return null;
  return (
    <span className="option-league">
      <LeagueBadge league={data} size={14} decorative />
      <span className="truncate">{data.name}</span>
    </span>
  );
}

/** Numa proposta de empréstimo toda opção é empréstimo: o título já diz, o selo sairia repetido. */
function OfferRow({ label, offer, checked, loanDecision }: { label: string; offer: ClubOffer; checked: boolean; loanDecision: boolean }) {
  const { c, locale } = useT();
  const club = getClub(offer.club);
  const country = getCountry(club?.country);
  const tone = pressureTone(offer.pressure);
  const pressureChip: Tone = tone === "high" ? "bad" : tone === "low" ? "good" : "neutral";
  const competitions = offer.competitions.map((id) => getCompetition(id)?.names[locale] ?? id);
  // Volta de empréstimo e compra pelo clube do empréstimo: o rótulo diz o que a opção faz.
  const special = offer.back || offer.buyout;
  const title = special ? label : (club?.name ?? offer.club);

  return (
    <>
      <RowFrame
        lead={<Crest club={offer.club} size={36} decorative />}
        title={title}
        meta={
          <>
            <span className="sr-only">{label}.</span>
            {special ? <span className="truncate font-semibold text-fg">{club?.name ?? offer.club}</span> : null}
            {country ? <CountryFlag country={country} size={16} language={locale} decorative /> : null}
            <LeagueLine league={offer.league} />
            <Stars count={offer.stars} />
            <Chip tone={ROLE_TONE[offer.role]} glyph={ROLE_TONE[offer.role] !== "neutral"} size="sm">
              {c(`roles.${offer.role}`)}
            </Chip>
            <span className="option-shirt">
              <Shirt size={12} aria-hidden="true" />
              {c("offer.shirt", { number: offer.shirt })}
            </span>
            {offer.loan && !loanDecision ? (
              <Chip tone="info" size="sm">
                {c("offer.loan")}
              </Chip>
            ) : null}
          </>
        }
      />
      {checked ? (
        <span className="option-detail">
          <span className="flex flex-wrap gap-1.5">
            <Chip tone="neutral" variant="outline">
              {c(`missions.${offer.mission}.name`)}
            </Chip>
            <Chip tone={pressureChip} glyph={pressureChip !== "neutral"}>
              {c(`pressure.${tone}`)}
            </Chip>
          </span>
          {/* Só quando há torneio continental: a ausência é o caso comum e não vale uma linha. */}
          {competitions.length > 0 ? (
            <span className="truncate text-xs text-faint">{c("offer.competitions", { list: competitions.join(", ") })}</span>
          ) : null}
        </span>
      ) : null}
    </>
  );
}

function StayRow({ label, career, checked, shirt }: { label: string; career: Career; checked: boolean; shirt: number | null }) {
  const { t, c } = useT();
  const club = career.contract?.club;
  const contract = career.contract;
  const last = lastRecord(career);
  const role = last && last.club === club ? last.role : null;
  const tone = contract ? pressureTone(contract.pressure) : null;
  return (
    <>
      <RowFrame
        lead={club ? <Crest club={club} size={36} decorative /> : <House size={24} aria-hidden="true" />}
        title={label}
        meta={
          <>
            {club ? <span className="truncate">{getClub(club)?.name}</span> : null}
            {role ? (
              <Chip tone={ROLE_TONE[role]} glyph={ROLE_TONE[role] !== "neutral"} size="sm">
                {c(`roles.${role}`)}
              </Chip>
            ) : null}
            {role ? <span className="sr-only">{t("career.stayRole", { role: c(`roles.${role}`) })}</span> : null}
            {/* O clube deu outro número a quem ganhou a posição: a opção já mostra (GDD 19.1). */}
            {shirt !== null ? (
              <Chip tone="club" glyph size="sm">
                {c("offer.newShirt", { number: shirt })}
              </Chip>
            ) : null}
          </>
        }
      />
      {checked && contract && tone ? (
        <span className="option-detail">
          <span className="flex flex-wrap gap-1.5">
            <Chip tone="neutral" variant="outline">
              {c(`renewals.${contract.mission}.name`)}
            </Chip>
            <Chip tone={tone === "high" ? "bad" : tone === "low" ? "good" : "neutral"} glyph={tone !== "neutral"}>
              {c(`pressure.${tone}`)}
            </Chip>
            <Chip tone="club">{t("career.player.shirt", { number: shirt ?? contract.shirt })}</Chip>
          </span>
        </span>
      ) : null}
    </>
  );
}

function RetireRow({ label }: { label: string }) {
  return (
    <RowFrame
      lead={
        <span className="option-icon">
          <Flag size={18} aria-hidden="true" />
        </span>
      }
      title={label}
    />
  );
}

/** Um foco, um atributo (D42): o chip diz qual e quanto ele sobe, no mínimo. */
function FocusRow({ label, focus, career }: { label: string; focus: TrainingFocus; career: Career }) {
  const { t } = useT();
  const Icon = FOCUS_ICON[focus];
  const name = attributeText(t, career.player.position, FOCUS_SLOT[focus], "name");
  return (
    <RowFrame
      lead={
        <span className="option-icon">
          <Icon size={18} aria-hidden="true" />
        </span>
      }
      title={label}
      meta={
        name ? (
          <Chip tone="good" glyph size="sm" className="max-w-full">
            <span className="truncate">
              +{TRAINING.focus} {name}
            </span>
          </Chip>
        ) : null
      }
    />
  );
}

const EFFECT_TONE: Readonly<Record<EffectTone, Tone>> = { good: "good", bad: "bad", neutral: "neutral" };

function EffectList({ effects, target }: { effects: readonly Effect[]; target: EventTarget | null }) {
  const { c, locale } = useT();
  const items = effects.flatMap((effect, index) => {
    const text = describeEffect(locale, effect, target);
    return text === null ? [] : [{ key: `${effect.kind}-${index}`, text, tone: EFFECT_TONE[effectTone(effect)] }];
  });
  if (items.length === 0) return <span className="text-xs text-faint">{c("event.noEffect")}</span>;
  return (
    <span className="flex flex-col gap-1">
      {items.map((item) => (
        <span key={item.key} data-tone={item.tone} className="flex items-start gap-1.5 text-xs leading-snug">
          <span className="text-tone mt-px" aria-hidden="true">
            {TONE_GLYPH[item.tone]}
          </span>
          <span className="text-fg">{item.text}</span>
        </span>
      ))}
    </span>
  );
}

function EventRow({
  label,
  option,
  checked,
  career,
}: {
  label: string;
  option: Extract<DecisionOption, { kind: "event" }>;
  checked: boolean;
  career: Career;
}) {
  const { t, c, percent } = useT();
  const target = option.target?.club ?? null;
  const moves = [...option.preview.success, ...option.preview.failure].some((effect) => effect.kind === "transfer");
  const destination = moves && target && target.club !== career.contract?.club ? target : null;
  const chance = option.chance;
  const chanceTone: Tone = chance === null ? "neutral" : chance >= 0.6 ? "good" : chance >= 0.4 ? "neutral" : "bad";
  return (
    <>
      <RowFrame
        lead={
          destination ? (
            <Crest club={destination.club} size={36} decorative />
          ) : (
            <span className="option-icon">
              <ArrowRightLeft size={18} aria-hidden="true" />
            </span>
          )
        }
        title={label}
        wrap
        meta={
          <>
            {/* O clube de destino aparece na própria opção: nome, liga e papel (D42). */}
            {destination ? (
              <>
                <span className="truncate font-semibold text-fg">{getClub(destination.club)?.name ?? destination.club}</span>
                <LeagueLine league={destination.league} />
                <Chip tone={ROLE_TONE[destination.role]} glyph={ROLE_TONE[destination.role] !== "neutral"} size="sm">
                  {c(`roles.${destination.role}`)}
                </Chip>
              </>
            ) : null}
            {chance === null ? (
              <Chip tone="neutral" variant="outline" size="sm" className="option-norisk">
                {t("career.noRisk")}
              </Chip>
            ) : (
              <Chip tone={chanceTone} glyph={chanceTone !== "neutral"} size="sm">
                {t("career.chance", { value: percent(chance) })}
              </Chip>
            )}
          </>
        }
      />
      {checked ? (
        <span className="option-detail">
          {chance !== null ? (
            <>
              <OddsBar success={chance} goodLabel={c("event.ifSuccess")} badLabel={c("event.ifFailure")} formatPercent={percent} />
              <span className="grid gap-2 sm:grid-cols-2">
                <span className="flex flex-col gap-1">
                  <span className="eyebrow text-good">{c("event.ifSuccess")}</span>
                  <EffectList effects={option.preview.success} target={option.target} />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="eyebrow text-bad">{c("event.ifFailure")}</span>
                  <EffectList effects={option.preview.failure} target={option.target} />
                </span>
              </span>
            </>
          ) : (
            <EffectList effects={option.preview.success} target={option.target} />
          )}
        </span>
      ) : null}
    </>
  );
}
