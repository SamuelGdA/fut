import { Menu } from "@base-ui/react/menu";
import { type Career, canRetireNow } from "@craque/engine";
import { getClub } from "@craque/world";
import { Flag as FlagIcon, Home, MoreVertical } from "lucide-react";
import { currentOvr, lastRecord } from "../../features/career/view";
import { useT } from "../../i18n/useT";
import { feedback } from "../../services/feedback";
import { IconButton } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { AnimatedNumber } from "../../ui/AnimatedNumber";
import { PitchMark } from "../../ui/PitchMark";
import { Delta } from "../../ui/Signals";

interface CareerHeaderProps {
  career: Career;
  /** Linha alternativa de um "E se...?" (GDD 28.3). */
  alternate?: boolean;
  onLeave(): void;
  onRetire(): void;
}

/**
 * O placar do jogador (GDD 32.5): uma linha só, logo abaixo da barra do jogo,
 * para a decisão caber na tela. A placa do clube na cor de verdade, o
 * sobrenome, a linha de posição, clube e idade, e o OVR grande, que conta
 * até o valor novo depois de cada lance (D43). Os ajustes ficam na barra de
 * cima; aqui, o menu da carreira.
 */
export function CareerHeader({ career, alternate = false, onLeave, onRetire }: CareerHeaderProps) {
  const { t, c } = useT();
  const ovr = currentOvr(career);
  const last = lastRecord(career);
  const delta = last ? last.ovrEnd - last.ovrStart : 0;
  const club = career.contract?.club ?? null;
  const age = Math.min(career.age, 40);

  return (
    <header className="career-header">
      <div className="mx-auto flex max-w-[1280px] items-stretch">
        <div className="career-plate">
          {club ? <Crest club={club} size={38} decorative plain /> : <PitchMark className="h-8 w-6 opacity-80" accent="currentColor" />}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3 py-2 pr-1.5 pl-3 lg:pr-4">
          <div className="min-w-0 flex-1">
            <p className="display truncate text-[1.55rem] leading-none font-black uppercase lg:text-4xl">
              {career.setup.identity.surname}
            </p>
            <p className="mt-1 truncate text-xs text-muted lg:text-sm">
              {c(`positionAbbr.${career.player.position}`)} · {club ? getClub(club)?.name : t("career.header.noClub")} ·{" "}
              {t("career.header.age", { age })}
              {alternate ? <span className="text-info"> · {t("career.alternate")}</span> : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <p className="career-ovr numeric">
              <span className="sr-only">OVR </span>
              <AnimatedNumber value={ovr} showDelta={false} />
            </p>
            {delta !== 0 ? <Delta value={delta} className="text-2xs leading-none" /> : <span className="eyebrow text-2xs leading-none">OVR</span>}
          </div>
          <div className="flex shrink-0 items-center">
            <Menu.Root>
              <Menu.Trigger
                render={
                  <IconButton label={t("career.menu")} size="iconSm">
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
                      {t("career.leave")}
                    </Menu.Item>
                    {!canRetireNow(career) ? null : (
                      <Menu.Item className="menu-item" data-tone="bad" onClick={onRetire}>
                        <FlagIcon size={16} aria-hidden="true" />
                        {t("career.retire")}
                      </Menu.Item>
                    )}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
