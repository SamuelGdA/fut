import { useTecnicoT } from "../../../i18n/tecnico/useTecnicoT";
import { DrawSection, EventsSection, FinanceSection, SourcesSection } from "../tecnico/DataSections";
import { DevelopSection, MatchSection, OutputSection, PhilosophySection, PurchaseSection } from "../tecnico/ModelSections";
import { SeasonSection } from "../tecnico/SeasonSection";

/**
 * O Técnico no laboratório (GDD 42.12): as mesmas contas que o harness
 * (`pnpm balance:tecnico`) mede, com controles para mexer. Nada aqui é
 * sorteado à parte: são as funções do motor, com os elencos de verdade.
 */
export function TecnicoArea() {
  const { tt } = useTecnicoT();
  const sections = [SourcesSection, DrawSection, MatchSection, PhilosophySection, PurchaseSection, DevelopSection, OutputSection, EventsSection, FinanceSection, SeasonSection];
  return (
    <div className="flex flex-col gap-16">
      <header>
        <p className="eyebrow text-glory">{tt("lab.eyebrow")}</p>
        <h2 className="display mt-2 text-4xl font-black uppercase">{tt("lab.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm text-muted">{tt("lab.intro")}</p>
      </header>
      {sections.map((Section, index) => (
        <Section key={Section.name} index={index + 1} />
      ))}
    </div>
  );
}
