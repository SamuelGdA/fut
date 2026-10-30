import { AWARDS, type AwardKey, getCompetition, type Language } from "@craque/world";
import {
  Award,
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  Flag,
  HeartHandshake,
  KeyRound,
  Map as MapIcon,
  Medal,
  Shirt,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { AwardArt, TrophyArt } from "../../ui/Media";
import { cn } from "../../ui/cn";

/**
 * O troféu de uma conquista (D112): a taça real nos títulos, o prêmio real
 * na Bola de Ouro, na Chuteira e companhia, e um ícone por grupo no resto,
 * dentro de uma medalha com a cor da raridade (D94). Bloqueado: cinza e meio
 * apagado. Liberado: colorido, com brilho leve no hover. A quantidade (em
 * quantas carreiras caiu) fica num selo no canto inferior direito. O nome
 * acessível diz tudo isso; a arte de dentro é decorativa.
 */

const AWARD_OF: Readonly<Record<string, AwardKey>> = {
  ballonDor: "ballonDor",
  fiveBallons: "ballonDor",
  ballonAbroad: "ballonDor",
  goldenShoe: "goldenShoe",
  goldenGlove: "goldenGlove",
  youngPlayer: "youngPlayer",
  scoringTitle: "topScorer",
  bestOfCompetition: "bestPlayer",
};

const GROUP_ICON: Readonly<Record<string, LucideIcon>> = {
  career: Flag,
  titles: Trophy,
  awards: Award,
  national: Shirt,
  loyalty: HeartHandshake,
  road: MapIcon,
  challenge: CalendarCheck,
  curious: Sparkles,
  records: Medal,
  secret: KeyRound,
  tecnico: ClipboardList,
};

export interface TrophyIconProps {
  id: string;
  group: string;
  rarity: string | null;
  unlocked: boolean;
  /** Em quantas carreiras caiu; o selo só aparece de 1 para cima. */
  quantity?: number;
  /** Nome acessível completo ("Libertadores: conquistada, em 3 carreiras"). */
  label: string;
  language: Language;
  size?: "md" | "lg";
  className?: string;
}

export function TrophyIcon({ id, group, rarity, unlocked, quantity = 0, label, language, size = "md", className }: TrophyIconProps) {
  const art = size === "lg" ? 46 : 34;
  const competition = id.startsWith("title:") ? getCompetition(id.slice(6)) : null;
  const award = AWARD_OF[id];
  const Icon = GROUP_ICON[group] ?? BadgeCheck;
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("trophy-icon", className)}
      data-size={size}
      data-unlocked={unlocked || undefined}
      data-rarity={rarity ?? undefined}
    >
      <span className="trophy-icon-art" aria-hidden="true">
        {competition ? (
          <TrophyArt competition={competition} size={art} language={language} decorative tooltip="" />
        ) : award ? (
          <AwardArt award={AWARDS[award]} size={art} language={language} decorative tooltip="" />
        ) : (
          <Icon size={size === "lg" ? 30 : 22} strokeWidth={2.2} />
        )}
      </span>
      {unlocked && quantity > 0 ? (
        <span className="trophy-count numeric" aria-hidden="true">
          ×{quantity}
        </span>
      ) : null}
    </span>
  );
}
