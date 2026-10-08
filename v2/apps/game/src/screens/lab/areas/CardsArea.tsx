import { type AvatarConfig, DEFAULT_AVATAR } from "@craque/art";
import type { Position, Six } from "@craque/engine";
import { getClub } from "@craque/world";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { cardTier } from "../../../ui/cardTier";
import { SectionRule } from "../../../ui/Panel";
import { PlayerCard } from "../../../ui/PlayerCard";

/**
 * Folha de contato das cartas (GDD 30, 38 e D43): as cinco faixas no desenho
 * novo, clubes de cor difícil (preto, branco, azul-marinho, amarelo), goleiro,
 * carta sem clube, os números que contam quando mudam (o placar do lance) e
 * os selos de Difícil e de Desafio da carta de compartilhar.
 */

const FACES: readonly AvatarConfig[] = [
  DEFAULT_AVATAR,
  { ...DEFAULT_AVATAR, skin: 6, hair: "afro", hairColor: 0, beard: "chinstrap", beardColor: 0 },
  { ...DEFAULT_AVATAR, skin: 1, hair: "wavy", hairColor: 3, eyes: 2 },
  { ...DEFAULT_AVATAR, skin: 4, hair: "curly", hairColor: 0, accessory: "headband", accessoryColor: 4 },
  { ...DEFAULT_AVATAR, skin: 2, hair: "sidePart", hairColor: 2, beard: "full", beardColor: 2 },
];

function attributesFor(ovr: number, position: Position): Six {
  const shape: Six = position === "gk" ? [3, 1, -6, 4, -4, 2] : [4, 2, 1, 5, -18, 0];
  return shape.map((offset) => Math.max(10, Math.min(99, ovr + offset))) as unknown as Six;
}

const LADDER = [58, 70, 80, 88, 94] as const;

const CLUBS = [
  "juventus",
  "real-madrid",
  "chelsea",
  "boca-juniors",
  "borussia-dortmund",
  "paris-saint-germain",
  "barcelona",
  "flamengo",
  "corinthians",
  "ajax",
].filter((id) => getClub(id) !== null);

export function CardsArea() {
  const { t } = useT();
  const [grown, setGrown] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <p className="max-w-2xl text-sm text-muted">{t("lab.cards.intro")}</p>

      <section>
        <SectionRule as="h2" className="mb-5">
          {t("lab.cards.tiers")}
        </SectionRule>
        <div className="flex flex-wrap gap-6">
          {LADDER.map((ovr, index) => (
            <figure key={ovr} className="flex flex-col items-center gap-2">
              <PlayerCard
                surname="ROCHA"
                position="st"
                ovr={ovr}
                attributes={attributesFor(ovr, "st")}
                nationality="BRA"
                club="flamengo"
                league="brasileirao"
                shirt={9}
                avatar={FACES[index % FACES.length] ?? null}
                width={180}
              />
              <figcaption className="eyebrow">
                {t(`card.tiers.${cardTier(ovr)}`)} · {ovr}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <SectionRule as="h2" className="mb-5">
          {t("lab.cards.colors")}
        </SectionRule>
        <div className="flex flex-wrap gap-5">
          {CLUBS.map((club, index) => (
            <PlayerCard
              key={club}
              surname={getClub(club)?.short ?? club}
              position={index % 4 === 3 ? "gk" : "cm"}
              ovr={78 + (index % 3) * 4}
              attributes={attributesFor(78 + (index % 3) * 4, index % 4 === 3 ? "gk" : "cm")}
              nationality="ARG"
              club={club}
              league={null}
              shirt={index % 4 === 3 ? 1 : 8}
              avatar={FACES[index % FACES.length] ?? null}
              width={150}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionRule as="h2" className="mb-5">
          {t("lab.cards.noClub")}
        </SectionRule>
        <div className="flex flex-wrap gap-5">
          {(["BRA", "ARG", "ENG", "NED", "JPN"] as const).map((nation, index) => (
            <PlayerCard
              key={nation}
              surname={index === 0 ? "" : "SILVA"}
              position="st"
              ovr={null}
              attributes={null}
              nationality={nation}
              club={null}
              league={null}
              shirt={index === 0 ? null : 10}
              avatar={index === 0 ? null : (FACES[index % FACES.length] ?? null)}
              width={150}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionRule as="h2" className="mb-5">
          {t("lab.cards.flip")}
        </SectionRule>
        <div className="flex flex-wrap items-center gap-6">
          <PlayerCard
            surname="ROCHA"
            position="cam"
            ovr={grown ? 86 : 84}
            attributes={attributesFor(grown ? 86 : 84, "cam")}
            nationality="BRA"
            club="fluminense"
            league="brasileirao"
            shirt={10}
            avatar={FACES[2] ?? null}
            width={200}
            animate
          />
          <Button
            variant="secondary"
            onClick={() => {
              setGrown((value) => !value);
              feedback("rise");
            }}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {t("lab.cards.flipButton")}
          </Button>
        </div>
      </section>

      <section>
        <SectionRule as="h2" className="mb-5">
          {t("lab.cards.seals")}
        </SectionRule>
        <div className="flex flex-wrap gap-6">
          <PlayerCard
            surname="ROCHA"
            position="st"
            ovr={91}
            attributes={attributesFor(91, "st")}
            nationality="BRA"
            club="flamengo"
            league="brasileirao"
            shirt={9}
            avatar={FACES[1] ?? null}
            width={200}
            seal={{ kind: "hard", label: t("summary.poster.hard") }}
          />
          <PlayerCard
            surname="ROCHA"
            position="cdm"
            ovr={83}
            attributes={attributesFor(83, "cdm")}
            nationality="MEX"
            club="club-america"
            league="liga-mx"
            shirt={5}
            avatar={FACES[3] ?? null}
            width={200}
            seal={{ kind: "challenge", label: t("summary.poster.challenge", { score: 742 }) }}
          />
        </div>
      </section>
    </div>
  );
}
