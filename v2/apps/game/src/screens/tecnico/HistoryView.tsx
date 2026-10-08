import { canRetire, type CoachCareer, type SeasonHistory } from "@craque/engine/coach";
import { Flag as FlagIcon, Trophy } from "lucide-react";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { Button } from "../../ui/Button";
import { SectionRule } from "../../ui/Panel";
import { Chip } from "../../ui/Signals";
import { ClubTag } from "./shared";
import { competitionName } from "./text";

export function SeasonLine({ entry }: { entry: SeasonHistory }) {
  const t = useTecnicoT();
  const { tt, number, ordinal } = t;
  return (
    <li className="tec-season">
      <span className="numeric w-12 shrink-0 text-sm font-bold">{number(entry.year, { useGrouping: false })}</span>
      <span className="min-w-0 flex-1">
        <ClubTag club={entry.club} size={16} className="font-semibold" />
        <span className="flex flex-wrap items-center gap-1.5 text-2xs text-muted">
          {entry.position !== null ? <span>{`${ordinal(entry.position)} / ${entry.tableSize}`}</span> : null}
          <span>{t.g(`objectives.${entry.objective.kind}.name`)}</span>
          {entry.partial ? <Chip size="sm">{tt("history.partial")}</Chip> : null}
          {entry.objectiveMet === true ? <Chip tone="good" size="sm" glyph>{tt("history.objectiveMet")}</Chip> : null}
          {entry.objectiveMet === false ? <Chip tone="bad" size="sm" glyph>{tt("history.objectiveMissed")}</Chip> : null}
          {entry.promoted ? <Chip tone="good" size="sm">{tt("review.promoted")}</Chip> : null}
          {entry.relegated ? <Chip tone="bad" size="sm">{tt("review.relegated")}</Chip> : null}
          {entry.dismissed ? <Chip tone="bad" size="sm">{tt("history.dismissed")}</Chip> : null}
        </span>
        {entry.titles.length > 0 ? (
          <span className="mt-0.5 flex flex-wrap gap-1">
            {entry.titles.map((title) => (
              <Chip key={title} tone="glory" size="sm">
                <Trophy size={11} aria-hidden="true" />
                {competitionName(title, t.locale)}
              </Chip>
            ))}
          </span>
        ) : null}
      </span>
    </li>
  );
}

/** A carreira até aqui (spec 16): temporada a temporada, e o botão de aposentar. */
export function HistoryView({ career, onRetire }: { career: CoachCareer; onRetire(): void }) {
  const { tt } = useTecnicoT();
  const retire = canRetire(career);
  return (
    <section className="flex flex-col gap-3" aria-labelledby="tec-history-title">
      <SectionRule as="h2">
        <span id="tec-history-title">{tt("history.title")}</span>
      </SectionRule>
      {career.history.length === 0 ? (
        <p className="text-sm text-muted">{tt("history.empty")}</p>
      ) : (
        <ol className="flex flex-col">
          {[...career.history].reverse().map((entry) => (
            <SeasonLine key={`${entry.year}:${entry.club}`} entry={entry} />
          ))}
        </ol>
      )}
      <div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!retire}
          onClick={() => {
            feedback("select");
            onRetire();
          }}
        >
          <FlagIcon size={15} aria-hidden="true" />
          {tt("header.retire")}
        </Button>
        {!retire ? <p className="mt-1 text-2xs text-faint">{tt("history.retireLocked")}</p> : null}
      </div>
    </section>
  );
}
