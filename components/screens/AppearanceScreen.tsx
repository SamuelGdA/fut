"use client";

import { useI18n } from "@/lib/i18n/context";
import { useCareerStore } from "@/store/careerStore";
import { useSound } from "@/lib/useSound";
import { Avatar } from "@/components/Avatar";
import {
  ACCESSORY_STYLES,
  BEARD_STYLES,
  DEFAULT_AVATAR,
  EYEBROW_OFFSET_MAX,
  EYEBROW_OFFSET_MIN,
  EYEBROW_STYLES,
  EYE_COLORS,
  EYE_OFFSET_MAX,
  EYE_OFFSET_MIN,
  EYE_SHAPES,
  FEATURE_SIZE_MAX,
  FEATURE_SIZE_MIN,
  HAIR_COLORS,
  HAIR_STYLES,
  MOLE_SPOTS,
  MOUTH_OFFSET_MAX,
  MOUTH_OFFSET_MIN,
  MOUTH_STYLES,
  NOSE_OFFSET_MAX,
  NOSE_OFFSET_MIN,
  NOSE_SHAPES,
  SKIN_TONES,
  randomAvatar,
  type AvatarConfig,
} from "@/lib/avatar/config";

const COPY = {
  pt: {
    eyebrow: "Aparência",
    title: "Monte seu jogador",
    subtitle: "Tudo opcional: sem personalizar, seu jogador entra em campo como silhueta.",
    skin: "Pele",
    eyebrowsSection: "Sobrancelha",
    eyesSection: "Olhos",
    noseSection: "Nariz",
    mouthSection: "Boca",
    hairSection: "Cabelo",
    beardSection: "Barba",
    marks: "Marcas",
    accessorySection: "Acessório",
    hair: "Estilo",
    hairColor: "Cor",
    eyebrows: "Formato",
    eyebrowPosition: "Posição",
    eyeColor: "Cor",
    eyeShape: "Formato",
    eyeSize: "Tamanho",
    eyePosition: "Posição",
    noseShape: "Formato",
    noseSize: "Tamanho",
    nosePosition: "Posição",
    mouthShape: "Formato",
    mouthPosition: "Posição",
    beard: "Barba",
    beardColor: "Cor da barba",
    freckles: "Sardas",
    mole: "Pinta",
    accessory: "Item",
    accessoryColor: "Cor do item",
    random: "Surpreenda-me",
    reset: "Voltar ao cinza",
    done: "Pronto",
    back: "Voltar",
    on: "Com",
    off: "Sem",
    hairStyles: {
      bald: "Careca", short: "Curto", sidePart: "Repartido", wavy: "Ondulado",
      curly: "Cacheado", afro: "Black power", bun: "Coque", long: "Comprido",
    },
    beardStyles: {
      none: "Sem barba", moustache: "Bigode",
      soulPatch: "Pingente", chinstrap: "Barba fina", full: "Cheia",
    },
    eyebrowStyles: { straight: "Reta", arched: "Arqueada", thick: "Grossa", thin: "Fina", angled: "Inclinada" },
    eyeShapes: { round: "Padrão", almond: "Amendoado", sleepy: "Sonolento", closed: "Fechado" },
    noseShapes: { small: "Pequeno", straight: "Reto", button: "Arrebitado", wide: "Largo" },
    mouthStyles: { smile: "Sorriso", grin: "Sorrisão", smirk: "Sorriso torto", neutral: "Neutra", small: "Discreta" },
    moleSpots: { none: "Nenhuma", leftCheek: "Bochecha esq.", rightCheek: "Bochecha dir.", chin: "Queixo", aboveLip: "Acima do lábio" },
    accessories: { none: "Nenhum", headband: "Faixa de cabelo", glasses: "Óculos esportivo", beret: "Boina" },
  },
  es: {
    eyebrow: "Apariencia",
    title: "Armá tu jugador",
    subtitle: "Todo opcional: sin personalizar, tu jugador sale a la cancha como silueta.",
    skin: "Piel",
    eyebrowsSection: "Cejas",
    eyesSection: "Ojos",
    noseSection: "Nariz",
    mouthSection: "Boca",
    hairSection: "Pelo",
    beardSection: "Barba",
    marks: "Marcas",
    accessorySection: "Accesorio",
    hair: "Estilo",
    hairColor: "Color",
    eyebrows: "Forma",
    eyebrowPosition: "Posición",
    eyeColor: "Color",
    eyeShape: "Forma",
    eyeSize: "Tamaño",
    eyePosition: "Posición",
    noseShape: "Forma",
    noseSize: "Tamaño",
    nosePosition: "Posición",
    mouthShape: "Forma",
    mouthPosition: "Posición",
    beard: "Barba",
    beardColor: "Color de barba",
    freckles: "Pecas",
    mole: "Lunar",
    accessory: "Ítem",
    accessoryColor: "Color del ítem",
    random: "Sorprendeme",
    reset: "Volver al gris",
    done: "Listo",
    back: "Volver",
    on: "Con",
    off: "Sin",
    hairStyles: {
      bald: "Pelado", short: "Corto", sidePart: "Con raya", wavy: "Ondulado",
      curly: "Enrulado", afro: "Afro", bun: "Rodete", long: "Largo",
    },
    beardStyles: {
      none: "Sin barba", moustache: "Bigote",
      soulPatch: "Mosca", chinstrap: "Barba fina", full: "Completa",
    },
    eyebrowStyles: { straight: "Recta", arched: "Arqueada", thick: "Gruesa", thin: "Fina", angled: "Inclinada" },
    eyeShapes: { round: "Estándar", almond: "Almendrado", sleepy: "Somnoliento", closed: "Cerrado" },
    noseShapes: { small: "Pequeña", straight: "Recta", button: "Respingona", wide: "Ancha" },
    mouthStyles: { smile: "Sonrisa", grin: "Sonrisa amplia", smirk: "Sonrisa ladeada", neutral: "Neutra", small: "Discreta" },
    moleSpots: { none: "Ninguno", leftCheek: "Mejilla izq.", rightCheek: "Mejilla der.", chin: "Mentón", aboveLip: "Sobre el labio" },
    accessories: { none: "Ninguno", headband: "Vincha", glasses: "Lentes deportivos", beret: "Boina" },
  },
  en: {
    eyebrow: "Appearance",
    title: "Build your player",
    subtitle: "All optional: skip it and your player takes the pitch as a silhouette.",
    skin: "Skin",
    eyebrowsSection: "Eyebrows",
    eyesSection: "Eyes",
    noseSection: "Nose",
    mouthSection: "Mouth",
    hairSection: "Hair",
    beardSection: "Beard",
    marks: "Marks",
    accessorySection: "Accessory",
    hair: "Style",
    hairColor: "Colour",
    eyebrows: "Shape",
    eyebrowPosition: "Position",
    eyeColor: "Colour",
    eyeShape: "Shape",
    eyeSize: "Size",
    eyePosition: "Position",
    noseShape: "Shape",
    noseSize: "Size",
    nosePosition: "Position",
    mouthShape: "Shape",
    mouthPosition: "Position",
    beard: "Beard",
    beardColor: "Beard colour",
    freckles: "Freckles",
    mole: "Mole",
    accessory: "Item",
    accessoryColor: "Item colour",
    random: "Surprise me",
    reset: "Back to grey",
    done: "Done",
    back: "Back",
    on: "On",
    off: "Off",
    hairStyles: {
      bald: "Bald", short: "Short", sidePart: "Side part", wavy: "Wavy",
      curly: "Curly", afro: "Afro", bun: "Top knot", long: "Long",
    },
    beardStyles: {
      none: "Clean shaven", moustache: "Moustache",
      soulPatch: "Soul patch", chinstrap: "Chinstrap", full: "Full",
    },
    eyebrowStyles: { straight: "Straight", arched: "Arched", thick: "Thick", thin: "Thin", angled: "Angled" },
    eyeShapes: { round: "Standard", almond: "Almond", sleepy: "Sleepy", closed: "Closed" },
    noseShapes: { small: "Small", straight: "Straight", button: "Button", wide: "Wide" },
    mouthStyles: { smile: "Smile", grin: "Grin", smirk: "Smirk", neutral: "Neutral", small: "Subtle" },
    moleSpots: { none: "None", leftCheek: "Left cheek", rightCheek: "Right cheek", chin: "Chin", aboveLip: "Above lip" },
    accessories: { none: "None", headband: "Headband", glasses: "Sport glasses", beret: "Beret" },
  },
} as const;

export function AppearanceScreen() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const draft = useCareerStore((s) => s.draft);
  const setAvatar = useCareerStore((s) => s.setAvatar);
  const goToIdentity = useCareerStore((s) => s.goToIdentity);
  const sound = useSound();

  // Opening the editor immediately gives the player a real face to tweak.
  const avatar: AvatarConfig = draft.avatar ?? DEFAULT_AVATAR;

  const update = (patch: Partial<AvatarConfig>) => {
    setAvatar({ ...avatar, ...patch });
    sound("tick");
  };

  return (
    <div className="animate-fade-in scrollbar-thin h-full min-h-0 overflow-y-auto mx-auto flex w-full max-w-7xl flex-col px-4 py-2.5 sm:px-6 lg:overflow-hidden">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-pitch">{copy.eyebrow}</p>
          <h1 className="font-display text-2xl font-black tracking-tight sm:text-3xl">{copy.title}</h1>
          <p className="hidden max-w-lg text-sm text-muted sm:block">{copy.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAvatar(randomAvatar());
              sound("select");
            }}
            className="pill px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground sm:text-sm"
          >
            🎲 {copy.random}
          </button>
          <button
            type="button"
            onClick={() => {
              setAvatar(null);
              sound("back");
            }}
            className="pill px-3.5 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground sm:text-sm"
          >
            {copy.reset}
          </button>
        </div>
      </div>

      {/* Scoped to `lg:` for the same reason as CareerScreen's grid: below
          `lg` the shell above already owns the page scroll, and this pane
          has no bounded height to flex into. */}
      <div className="scrollbar-thin mt-1.5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-0 lg:self-start">
          <div className="panel aspect-square w-full max-w-[300px] overflow-hidden p-0 mx-auto lg:mx-0">
            <Avatar config={draft.avatar} className="h-full w-full" />
          </div>
        </div>

        <div className="columns-2 gap-2.5 sm:columns-3 lg:columns-4">
          <Section label={copy.skin}>
            <Swatches colors={SKIN_TONES} active={avatar.skin} onPick={(skin) => update({ skin })} />
          </Section>

          <Section label={copy.eyebrowsSection}>
            <Row label={copy.eyebrows}>
              <Chips
                items={EYEBROW_STYLES.map((s) => ({ value: s, label: copy.eyebrowStyles[s] }))}
                active={avatar.eyebrows}
                onPick={(eyebrows) => update({ eyebrows })}
              />
            </Row>
            <SliderRow label={copy.eyebrowPosition}>
              <PositionSlider
                value={avatar.eyebrowOffset}
                min={EYEBROW_OFFSET_MIN}
                max={EYEBROW_OFFSET_MAX}
                onChange={(eyebrowOffset) => update({ eyebrowOffset })}
              />
            </SliderRow>
          </Section>

          <Section label={copy.eyesSection}>
            <Row label={copy.eyeColor}>
              <Swatches colors={EYE_COLORS} active={avatar.eyes} onPick={(eyes) => update({ eyes })} />
            </Row>
            <Row label={copy.eyeShape}>
              <Chips
                items={EYE_SHAPES.map((s) => ({ value: s, label: copy.eyeShapes[s] }))}
                active={avatar.eyeShape}
                onPick={(eyeShape) => update({ eyeShape })}
              />
            </Row>
            <SliderRow label={copy.eyeSize}>
              <Slider value={avatar.eyeSize} min={FEATURE_SIZE_MIN} max={FEATURE_SIZE_MAX} onChange={(eyeSize) => update({ eyeSize })} />
            </SliderRow>
            <SliderRow label={copy.eyePosition}>
              <PositionSlider
                value={avatar.eyeOffset}
                min={EYE_OFFSET_MIN}
                max={EYE_OFFSET_MAX}
                onChange={(eyeOffset) => update({ eyeOffset })}
              />
            </SliderRow>
          </Section>

          <Section label={copy.beardSection}>
            <Row label={copy.beard}>
              <Chips
                items={BEARD_STYLES.map((s) => ({ value: s, label: copy.beardStyles[s] }))}
                active={avatar.beard}
                onPick={(beard) => update({ beard })}
              />
            </Row>
            {avatar.beard !== "none" && (
              <Row label={copy.beardColor}>
                <Swatches colors={HAIR_COLORS} active={avatar.beardColor} onPick={(beardColor) => update({ beardColor })} />
              </Row>
            )}
          </Section>

          <Section label={copy.noseSection}>
            <Row label={copy.noseShape}>
              <Chips
                items={NOSE_SHAPES.map((s) => ({ value: s, label: copy.noseShapes[s] }))}
                active={avatar.nose}
                onPick={(nose) => update({ nose })}
              />
            </Row>
            <SliderRow label={copy.noseSize}>
              <Slider value={avatar.noseSize} min={FEATURE_SIZE_MIN} max={FEATURE_SIZE_MAX} onChange={(noseSize) => update({ noseSize })} />
            </SliderRow>
            <SliderRow label={copy.nosePosition}>
              <PositionSlider
                value={avatar.noseOffset}
                min={NOSE_OFFSET_MIN}
                max={NOSE_OFFSET_MAX}
                onChange={(noseOffset) => update({ noseOffset })}
              />
            </SliderRow>
          </Section>

          <Section label={copy.mouthSection}>
            <Row label={copy.mouthShape}>
              <Chips
                items={MOUTH_STYLES.map((s) => ({ value: s, label: copy.mouthStyles[s] }))}
                active={avatar.mouth}
                onPick={(mouth) => update({ mouth })}
              />
            </Row>
            <SliderRow label={copy.mouthPosition}>
              <PositionSlider
                value={avatar.mouthOffset}
                min={MOUTH_OFFSET_MIN}
                max={MOUTH_OFFSET_MAX}
                onChange={(mouthOffset) => update({ mouthOffset })}
              />
            </SliderRow>
          </Section>

          <Section label={copy.hairSection}>
            <Row label={copy.hair}>
              <Chips
                items={HAIR_STYLES.map((s) => ({ value: s, label: copy.hairStyles[s] }))}
                active={avatar.hair}
                onPick={(hair) => update({ hair })}
              />
            </Row>
            <Row label={copy.hairColor}>
              <Swatches
                colors={HAIR_COLORS}
                active={avatar.hairColor}
                onPick={(hairColor) =>
                  // Beard follows the hair unless it was deliberately unmatched.
                  update(avatar.beardColor === avatar.hairColor ? { hairColor, beardColor: hairColor } : { hairColor })
                }
              />
            </Row>
          </Section>

          <Section label={copy.marks}>
            <Row label={copy.freckles}>
              <Chips
                items={[
                  { value: false, label: copy.off },
                  { value: true, label: copy.on },
                ]}
                active={avatar.freckles}
                onPick={(freckles) => update({ freckles })}
              />
            </Row>
            <Row label={copy.mole}>
              <Chips
                items={MOLE_SPOTS.map((s) => ({ value: s, label: copy.moleSpots[s] }))}
                active={avatar.mole}
                onPick={(mole) => update({ mole })}
              />
            </Row>
          </Section>

          <Section label={copy.accessorySection}>
            <Row label={copy.accessory}>
              <Chips
                items={ACCESSORY_STYLES.map((s) => ({ value: s, label: copy.accessories[s] }))}
                active={avatar.accessory}
                onPick={(accessory) => update({ accessory })}
              />
            </Row>
            {avatar.accessory !== "none" && (
              <Row label={copy.accessoryColor}>
                <Swatches
                  colors={HAIR_COLORS}
                  active={avatar.accessoryColor}
                  onPick={(accessoryColor) => update({ accessoryColor })}
                />
              </Row>
            )}
          </Section>
        </div>
      </div>
      </div>

      <div className="mt-1.5 shrink-0 flex items-center justify-between gap-4 border-t border-line pt-1.5">
        <button
          type="button"
          onClick={() => {
            goToIdentity();
            sound("back");
          }}
          className="rounded-full px-5 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          {copy.back}
        </button>
        <button
          type="button"
          onClick={() => {
            goToIdentity();
            sound("confirm");
          }}
          className="min-w-40 rounded-full bg-pitch px-6 py-2 text-sm font-bold text-[#04220f] transition-all hover:brightness-110 active:scale-[0.98]"
        >
          {copy.done}
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="panel mb-1.5 flex break-inside-avoid flex-col gap-1.5 p-2">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-2">{label}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-2/80">{label}</span>
      {children}
    </div>
  );
}

/** Compact single-line variant for sliders — label and track share a row. */
function SliderRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-2/80">{label}</span>
      {children}
    </div>
  );
}

function Swatches({
  colors,
  active,
  onPick,
}: {
  colors: string[];
  active: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, index) => (
        <button
          key={color + index}
          type="button"
          onClick={() => onPick(index)}
          aria-label={color}
          aria-pressed={active === index}
          style={{ background: color }}
          className={`h-7 w-7 rounded-full transition-all hover:scale-110 ${
            active === index
              ? "ring-2 ring-pitch ring-offset-1 ring-offset-surface"
              : "ring-1 ring-white/10"
          }`}
        />
      ))}
    </div>
  );
}

function Chips<T extends string | boolean>({
  items,
  active,
  onPick,
}: {
  items: { value: T; label: string }[];
  active: T;
  onPick: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={String(item.value)}
          type="button"
          onClick={() => onPick(item.value)}
          aria-pressed={active === item.value}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all active:scale-95 ${
            active === item.value
              ? "bg-foreground text-background"
              : "bg-surface-2 text-muted hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A position slider, which runs the way a person expects a position slider
 * to run: right raises the feature, left lowers it.
 *
 * The stored offset keeps its SVG meaning, where a larger number is further
 * *down* the face, because that is what the drawing code wants. Flipping it
 * here rather than there keeps every saved avatar looking exactly as it did,
 * and puts the inversion in the one place it is about: the control.
 */
function PositionSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <Slider value={-value} min={-max} max={-min} onChange={(next) => onChange(-next)} />
  );
}

function Slider({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ accentColor: "var(--pitch)" }}
      className="h-1.5 w-full max-w-[220px] cursor-pointer"
    />
  );
}
