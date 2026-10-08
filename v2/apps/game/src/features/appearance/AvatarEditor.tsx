import {
  ACCESSORY_STYLES,
  type AvatarConfig,
  BEARD_STYLES,
  DEFAULT_AVATAR,
  EYE_COLORS,
  EYE_OFFSET_MAX,
  EYE_OFFSET_MIN,
  EYE_SHAPES,
  EYEBROW_OFFSET_MAX,
  EYEBROW_OFFSET_MIN,
  EYEBROW_STYLES,
  FEATURE_SIZE_MAX,
  FEATURE_SIZE_MIN,
  HAIR_COLORS,
  HAIR_STYLES,
  type KitDef,
  MOLE_SPOTS,
  MOUTH_OFFSET_MAX,
  MOUTH_OFFSET_MIN,
  MOUTH_STYLES,
  NOSE_OFFSET_MAX,
  NOSE_OFFSET_MIN,
  NOSE_SHAPES,
  randomAvatar,
  SKIN_TONES,
} from "@craque/art";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Dices, RotateCcw, Undo2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { cn } from "../../ui/cn";

interface AvatarEditorProps {
  /** `null` é a silhueta: o jogador ainda não personalizou. */
  value: AvatarConfig | null;
  onChange(next: AvatarConfig | null): void;
  /** Camisa do retrato. Sem clube, a cinza neutra. */
  kit?: KitDef | null;
  /** Roupa da prévia: camisa (Craque) ou terno (Técnico). */
  outfit?: "kit" | "coach";
  /** Rodapé com Voltar e Pronto, para quando o editor é uma tela própria. */
  onBack?(): void;
  onDone?(): void;
}

/** As abas do editor (D43): o rosto, o cabelo e a barba, e os detalhes. */
const TABS = ["face", "hair", "details"] as const;
type EditorTab = (typeof TABS)[number];

/** Quantas mudanças o "Desfazer" lembra. */
const UNDO_MAX = 30;

/**
 * O editor de aparência do v1, portado (D1, GDD 6.3): mesmas opções, mesma
 * ordem e as mesmas regras. Abrir o editor já cria um avatar para os
 * controles, mas a prévia segue mostrando a silhueta até a primeira mudança.
 *
 * A moldura foi refeita no D43 para ficar mais fácil de usar: a prévia grande
 * e fixa à esquerda (no celular, no alto), as opções divididas em três abas
 * (Rosto, Cabelo e barba, Detalhes) em vez de todas de uma vez, e um
 * "Desfazer" que volta as últimas mudanças, inclusive um sorteio sem querer.
 */
export function AvatarEditor({ value, onChange, kit, outfit = "kit", onBack, onDone }: AvatarEditorProps) {
  const { t } = useT();
  const avatar: AvatarConfig = value ?? DEFAULT_AVATAR;
  const [tab, setTab] = useState<EditorTab>("face");
  const [history, setHistory] = useState<ReadonlyArray<AvatarConfig | null>>([]);

  const change = (next: AvatarConfig | null) => {
    setHistory((previous) => [...previous, value].slice(-UNDO_MAX));
    onChange(next);
  };

  const update = (patch: Partial<AvatarConfig>) => {
    change({ ...avatar, ...patch });
    feedback("tick");
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (previous === undefined) return;
    setHistory(history.slice(0, -1));
    onChange(previous);
    feedback("back");
  };

  return (
    <div className="avatar-shell">
      <div className="avatar-head">
        <div className="min-w-0">
          <p className="eyebrow text-good">{t("appearance.eyebrow")}</p>
          <h2 className="display mt-2 text-4xl font-black uppercase sm:text-5xl lg:text-4xl">{t("appearance.title")}</h2>
          <p className="mt-1.5 max-w-lg text-sm text-muted">{t("appearance.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              change(randomAvatar());
              feedback("select");
            }}
          >
            <Dices size={16} aria-hidden="true" />
            {t("appearance.random")}
          </Button>
          <Button size="sm" variant="ghost" onClick={undo} disabled={history.length === 0}>
            <Undo2 size={15} aria-hidden="true" />
            {t("appearance.undo")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              change(null);
              feedback("back");
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            {t("appearance.reset")}
          </Button>
        </div>
      </div>

      <div className="avatar-editor">
        <div className="avatar-editor-preview">
          <div className="avatar-portrait">
            <Avatar config={value} kit={kit} outfit={outfit} className="h-full w-full" />
          </div>
        </div>

        <BaseTabs.Root
          className="avatar-tabs"
          value={tab}
          onValueChange={(next) => {
            const match = TABS.find((candidate) => candidate === next);
            if (!match || match === tab) return;
            setTab(match);
            feedback("tick");
          }}
        >
          <BaseTabs.List className="explore-tabs avatar-tab-list" aria-label={t("appearance.title")}>
            {TABS.map((value) => (
              <BaseTabs.Tab key={value} value={value} className="explore-tab">
                {t(`appearance.tabs.${value}`)}
              </BaseTabs.Tab>
            ))}
          </BaseTabs.List>

          <BaseTabs.Panel value="face" className="avatar-panel" keepMounted>
            <div className="avatar-columns">
              <Section label={t("appearance.skin")}>
                <Swatches colors={SKIN_TONES} active={avatar.skin} onPick={(skin) => update({ skin })} />
              </Section>

              <Section label={t("appearance.eyebrowsSection")}>
                <Row label={t("appearance.eyebrows")}>
                  <Chips
                    items={EYEBROW_STYLES.map((style) => ({ value: style, label: t(`appearance.eyebrowStyles.${style}`) }))}
                    active={avatar.eyebrows}
                    onPick={(eyebrows) => update({ eyebrows })}
                  />
                </Row>
                <SliderRow label={t("appearance.eyebrowPosition")}>
                  <PositionSlider
                    label={t("appearance.eyebrowPosition")}
                    value={avatar.eyebrowOffset}
                    min={EYEBROW_OFFSET_MIN}
                    max={EYEBROW_OFFSET_MAX}
                    onChange={(eyebrowOffset) => update({ eyebrowOffset })}
                  />
                </SliderRow>
              </Section>

              <Section label={t("appearance.eyesSection")}>
                <Row label={t("appearance.eyeColor")}>
                  <Swatches colors={EYE_COLORS} active={avatar.eyes} onPick={(eyes) => update({ eyes })} />
                </Row>
                <Row label={t("appearance.eyeShape")}>
                  <Chips
                    items={EYE_SHAPES.map((shape) => ({ value: shape, label: t(`appearance.eyeShapes.${shape}`) }))}
                    active={avatar.eyeShape}
                    onPick={(eyeShape) => update({ eyeShape })}
                  />
                </Row>
                <SliderRow label={t("appearance.eyeSize")}>
                  <Range
                    label={t("appearance.eyeSize")}
                    value={avatar.eyeSize}
                    min={FEATURE_SIZE_MIN}
                    max={FEATURE_SIZE_MAX}
                    onChange={(eyeSize) => update({ eyeSize })}
                  />
                </SliderRow>
                <SliderRow label={t("appearance.eyePosition")}>
                  <PositionSlider
                    label={t("appearance.eyePosition")}
                    value={avatar.eyeOffset}
                    min={EYE_OFFSET_MIN}
                    max={EYE_OFFSET_MAX}
                    onChange={(eyeOffset) => update({ eyeOffset })}
                  />
                </SliderRow>
              </Section>

              <Section label={t("appearance.noseSection")}>
                <Row label={t("appearance.noseShape")}>
                  <Chips
                    items={NOSE_SHAPES.map((shape) => ({ value: shape, label: t(`appearance.noseShapes.${shape}`) }))}
                    active={avatar.nose}
                    onPick={(nose) => update({ nose })}
                  />
                </Row>
                <SliderRow label={t("appearance.noseSize")}>
                  <Range
                    label={t("appearance.noseSize")}
                    value={avatar.noseSize}
                    min={FEATURE_SIZE_MIN}
                    max={FEATURE_SIZE_MAX}
                    onChange={(noseSize) => update({ noseSize })}
                  />
                </SliderRow>
                <SliderRow label={t("appearance.nosePosition")}>
                  <PositionSlider
                    label={t("appearance.nosePosition")}
                    value={avatar.noseOffset}
                    min={NOSE_OFFSET_MIN}
                    max={NOSE_OFFSET_MAX}
                    onChange={(noseOffset) => update({ noseOffset })}
                  />
                </SliderRow>
              </Section>

              <Section label={t("appearance.mouthSection")}>
                <Row label={t("appearance.mouthShape")}>
                  <Chips
                    items={MOUTH_STYLES.map((style) => ({ value: style, label: t(`appearance.mouthStyles.${style}`) }))}
                    active={avatar.mouth}
                    onPick={(mouth) => update({ mouth })}
                  />
                </Row>
                <SliderRow label={t("appearance.mouthPosition")}>
                  <PositionSlider
                    label={t("appearance.mouthPosition")}
                    value={avatar.mouthOffset}
                    min={MOUTH_OFFSET_MIN}
                    max={MOUTH_OFFSET_MAX}
                    onChange={(mouthOffset) => update({ mouthOffset })}
                  />
                </SliderRow>
              </Section>
            </div>
          </BaseTabs.Panel>

          <BaseTabs.Panel value="hair" className="avatar-panel" keepMounted>
            <div className="avatar-columns">
              <Section label={t("appearance.hairSection")}>
                <Row label={t("appearance.hair")}>
                  <Chips
                    items={HAIR_STYLES.map((style) => ({ value: style, label: t(`appearance.hairStyles.${style}`) }))}
                    active={avatar.hair}
                    onPick={(hair) => update({ hair })}
                  />
                </Row>
                <Row label={t("appearance.hairColor")}>
                  <Swatches
                    colors={HAIR_COLORS}
                    active={avatar.hairColor}
                    onPick={(hairColor) =>
                      // A barba acompanha o cabelo, a menos que o jogador já tenha separado as duas.
                      update(avatar.beardColor === avatar.hairColor ? { hairColor, beardColor: hairColor } : { hairColor })
                    }
                  />
                </Row>
              </Section>

              <Section label={t("appearance.beardSection")}>
                <Row label={t("appearance.beard")}>
                  <Chips
                    items={BEARD_STYLES.map((style) => ({ value: style, label: t(`appearance.beardStyles.${style}`) }))}
                    active={avatar.beard}
                    onPick={(beard) => update({ beard })}
                  />
                </Row>
                {avatar.beard !== "none" ? (
                  <Row label={t("appearance.beardColor")}>
                    <Swatches colors={HAIR_COLORS} active={avatar.beardColor} onPick={(beardColor) => update({ beardColor })} />
                  </Row>
                ) : null}
              </Section>
            </div>
          </BaseTabs.Panel>

          <BaseTabs.Panel value="details" className="avatar-panel" keepMounted>
            <div className="avatar-columns">
              <Section label={t("appearance.marks")}>
                <Row label={t("appearance.freckles")}>
                  <Chips
                    items={[
                      { value: false, label: t("appearance.off") },
                      { value: true, label: t("appearance.on") },
                    ]}
                    active={avatar.freckles}
                    onPick={(freckles) => update({ freckles })}
                  />
                </Row>
                <Row label={t("appearance.mole")}>
                  <Chips
                    items={MOLE_SPOTS.map((spot) => ({ value: spot, label: t(`appearance.moleSpots.${spot}`) }))}
                    active={avatar.mole}
                    onPick={(mole) => update({ mole })}
                  />
                </Row>
              </Section>

              <Section label={t("appearance.accessorySection")}>
                <Row label={t("appearance.accessory")}>
                  <Chips
                    items={ACCESSORY_STYLES.map((style) => ({ value: style, label: t(`appearance.accessories.${style}`) }))}
                    active={avatar.accessory}
                    onPick={(accessory) => update({ accessory })}
                  />
                </Row>
                {avatar.accessory !== "none" ? (
                  <Row label={t("appearance.accessoryColor")}>
                    <Swatches colors={HAIR_COLORS} active={avatar.accessoryColor} onPick={(accessoryColor) => update({ accessoryColor })} />
                  </Row>
                ) : null}
              </Section>
            </div>
          </BaseTabs.Panel>
        </BaseTabs.Root>
      </div>

      {onBack || onDone ? (
        <div className="avatar-foot">
          {onBack ? (
            <Button
              variant="ghost"
              onClick={() => {
                onBack();
                feedback("back");
              }}
            >
              {t("appearance.back")}
            </Button>
          ) : (
            <span />
          )}
          {onDone ? (
            <Button
              className="min-w-40"
              onClick={() => {
                onDone();
                feedback("confirm");
              }}
            >
              {t("appearance.done")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="avatar-editor-section">
      <h3 className="eyebrow">{label}</h3>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-2xs font-semibold uppercase tracking-wider text-faint">{label}</span>
      {children}
    </div>
  );
}

/** Variante de uma linha para os deslizadores: rótulo e trilho lado a lado. */
function SliderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 text-2xs font-semibold uppercase tracking-wider text-faint">{label}</span>
      {children}
    </div>
  );
}

function Swatches({
  colors,
  active,
  onPick,
}: {
  colors: readonly string[];
  active: number;
  onPick(index: number): void;
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
          className={cn("avatar-swatch", active === index && "avatar-swatch-active")}
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
  items: ReadonlyArray<{ value: T; label: string }>;
  active: T;
  onPick(value: T): void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <button
          key={String(item.value)}
          type="button"
          onClick={() => onPick(item.value)}
          aria-pressed={active === item.value}
          className={cn("avatar-chip", active === item.value && "avatar-chip-active")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Deslizador de posição que corre como a pessoa espera: direita sobe a feição,
 * esquerda desce. O valor guardado mantém o sentido do SVG (maior é mais para
 * baixo), então a inversão mora só aqui, no controle.
 */
function PositionSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange(value: number): void;
}) {
  return <Range label={label} value={-value} min={-max} max={-min} onChange={(next) => onChange(-next)} />;
}

function Range({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange(value: number): void;
}) {
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="avatar-range"
    />
  );
}
