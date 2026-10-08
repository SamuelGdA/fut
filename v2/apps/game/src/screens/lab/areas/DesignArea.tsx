import type { ComponentType, MouseEvent } from "react";
import { useT } from "../../../i18n/useT";
import { CompositionSection } from "../sections/Composition";
import { ButtonsSection, ControlsSection, TonesSection } from "../sections/Controls";
import { DataSection, TabsSection } from "../sections/Data";
import { FeedbackSection, OverlaysSection } from "../sections/Feedback";
import { PaletteSection, TypeSection } from "../sections/Foundations";

type SectionKey =
  | "type"
  | "palette"
  | "buttons"
  | "controls"
  | "tones"
  | "data"
  | "tabs"
  | "overlays"
  | "feedback"
  | "composition";

const SECTIONS: ReadonlyArray<{ key: SectionKey; id: string; Component: ComponentType<{ index: number }> }> = [
  { key: "type", id: "tipografia", Component: TypeSection },
  { key: "palette", id: "cores", Component: PaletteSection },
  { key: "buttons", id: "botoes", Component: ButtonsSection },
  { key: "controls", id: "controles", Component: ControlsSection },
  { key: "tones", id: "tons", Component: TonesSection },
  { key: "data", id: "numeros", Component: DataSection },
  { key: "tabs", id: "abas", Component: TabsSection },
  { key: "overlays", id: "janelas", Component: OverlaysSection },
  { key: "feedback", id: "som", Component: FeedbackSection },
  { key: "composition", id: "composicao", Component: CompositionSection },
];

/**
 * Pula para a seção sem mexer na URL: âncoras com # criariam entradas de
 * histórico e confundiriam o botão voltar entre telas.
 */
function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  const reduced =
    document.documentElement.dataset["motion"] === "reduced" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  target.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
}

/** O sistema de design inteiro: o que o marco 0 entregou. */
export function DesignArea() {
  const { t } = useT();

  return (
    <div className="lab-grid">
      <nav aria-label={t("lab.index")} className="lab-index">
        <p className="eyebrow mb-3">{t("lab.index")}</p>
        <ol className="flex flex-col">
          {SECTIONS.map((section, position) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(event) => jumpTo(event, section.id)}
                className="flex items-baseline gap-3 rounded-xs py-1.5 text-sm text-muted transition-colors hover:text-fg"
              >
                <span className="numeric w-5 text-xs text-faint">{String(position + 1).padStart(2, "0")}</span>
                {t(`lab.sections.${section.key}`)}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex min-w-0 flex-col gap-16">
        {SECTIONS.map(({ id, Component }, position) => (
          <Component key={id} index={position + 1} />
        ))}
      </div>
    </div>
  );
}
