import { Menu } from "@base-ui/react/menu";
import { canRetire, type CoachCareer, leaguePosition } from "@craque/engine/coach";
import { Flag as FlagIcon, Home, MoreVertical } from "lucide-react";
import { barTone, barWord, squadBar } from "../../features/tecnico/view";
import { useTecnicoT } from "../../i18n/tecnico/useTecnicoT";
import { feedback } from "../../services/feedback";
import { IconButton } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { PitchMark } from "../../ui/PitchMark";
import { clubName, periodLabel } from "./text";

interface HeaderProps {
  career: CoachCareer;
  onLeave(): void;
  onRetire(): void;
}

/**
 * O placar do técnico (GDD 56.11): a placa do clube, o nome, temporada e
 * período, dinheiro, e as três relações em palavra (diretoria, torcida,
 * elenco), sempre à vista. O menu leva de volta ao hub ou aposenta.
 */
export function Header({ career, onLeave, onRetire }: HeaderProps) {
  const t = useTecnicoT();
  const { tt, money, number } = t;
  const coach = career.coach;
  const club = coach ? career.clubs[coach.club] : null;
  const position = coach ? leaguePosition(career, coach.club) : null;
  const bars = coach
    ? ([
        ["board", coach.board],
        ["fans", coach.fans],
        ["squad", squadBar(career)],
      ] as const)
    : [];

  return (
    <header className="career-header">
      <div className="mx-auto flex max-w-[1280px] items-stretch">
        <div className="career-plate">
          {coach ? <Crest club={coach.club} size={38} decorative plain /> : <PitchMark className="h-8 w-6 opacity-80" accent="currentColor" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-1.5 pr-1.5 pl-3 lg:pr-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="display truncate text-[1.35rem] leading-none font-black uppercase lg:text-3xl">
                {coach ? clubName(coach.club) : career.setup.identity.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {career.setup.identity.name} · {tt("common.season", { year: number(career.year, { useGrouping: false }) })}
                {career.setup.mode === "slow" ? ` · ${periodLabel(career, tt)}` : ""}
                {position !== null && coach ? ` · ${tt("header.nowPosition", { position, size: coach.objective.tableSize })}` : ""}
              </p>
            </div>
            {club && coach ? (
              <dl className="tec-money hidden sm:flex">
                <div>
                  <dt>{tt("header.cash")}</dt>
                  <dd className={club.cash < 0 ? "text-bad" : undefined}>{money(club.cash)}</dd>
                </div>
                <div>
                  <dt>{tt("header.budget")}</dt>
                  <dd>{money(coach.budget)}</dd>
                </div>
                <div>
                  <dt>{tt("header.reputation")}</dt>
                  <dd>{Math.round(career.reputation)}</dd>
                </div>
              </dl>
            ) : null}
            <Menu.Root>
              <Menu.Trigger
                render={
                  <IconButton label={tt("header.leave")} size="iconSm">
                    <MoreVertical size={18} aria-hidden="true" />
                  </IconButton>
                }
                onClick={() => feedback("tick")}
              />
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="end" sideOffset={6} className="layer-popover">
                  <Menu.Popup className="popover-popup min-w-56 p-1.5">
                    <Menu.Item className="menu-item" onClick={onLeave}>
                      <Home size={16} aria-hidden="true" />
                      {tt("header.leave")}
                    </Menu.Item>
                    {canRetire(career) ? (
                      <Menu.Item className="menu-item" data-tone="bad" onClick={onRetire}>
                        <FlagIcon size={16} aria-hidden="true" />
                        {tt("header.retire")}
                      </Menu.Item>
                    ) : null}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
          {coach ? (
            <ul className="tec-bars" aria-label={tt("club.bars")}>
              {bars.map(([bar, value]) => {
                const word = barWord(value);
                return (
                  <li key={bar} className="tec-bar" data-tone={barTone(word)} title={t.g(`bars.${bar}.hint`)}>
                    <span className="tec-bar-name">{t.g(`bars.${bar}.name`)}</span>
                    <span className="tec-bar-track" aria-hidden="true">
                      <span style={{ transform: `scaleX(${Math.max(0.02, Math.min(1, value / 100))})` }} />
                    </span>
                    <span className="tec-bar-word text-tone">{tt(`bars.words.${bar}.${word}`)}</span>
                    <span className="sr-only">{value}</span>
                  </li>
                );
              })}
              {club ? (
                <li className="tec-bar sm:hidden">
                  <span className="tec-bar-name">{tt("header.cash")}</span>
                  <span className={club.cash < 0 ? "tec-bar-word text-bad" : "tec-bar-word"}>{money(club.cash)}</span>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </div>
    </header>
  );
}
