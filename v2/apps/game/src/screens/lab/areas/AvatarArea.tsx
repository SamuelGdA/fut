import { type AvatarConfig, type KitDef, randomAvatar } from "@craque/art";
import {
  CLUBS,
  COUNTRIES,
  getClub,
  getClubKit,
  getCountry,
  getCountryKit,
} from "@craque/world";
import { Dices } from "lucide-react";
import { type ReactNode, useState } from "react";
import { AvatarEditor } from "../../../features/appearance/AvatarEditor";
import { useT } from "../../../i18n/useT";
import { feedback } from "../../../services/feedback";
import { Avatar } from "../../../ui/Avatar";
import { Button } from "../../../ui/Button";
import { Crest, Flag } from "../../../ui/Media";
import { SectionRule } from "../../../ui/Panel";
import { ChoiceStrip, type ChoiceOption } from "../ChoiceStrip";

/** De onde vem a camisa: nenhum clube, um clube ou uma seleção. */
type KitSource = "none" | `club:${string}` | `nation:${string}`;

const KIT_SOURCES: readonly KitSource[] = [
  "none",
  "club:flamengo",
  "club:boca-juniors",
  "club:real-madrid",
  "club:juventus",
  "club:liverpool",
  "nation:BRA",
  "nation:ARG",
  "nation:NED",
];

function kitOf(source: KitSource): KitDef | null {
  if (source.startsWith("club:")) return getClubKit(source.slice(5));
  if (source.startsWith("nation:")) return getCountryKit(source.slice(7));
  return null;
}

interface Face {
  config: AvatarConfig;
  source: KitSource;
}

const GALLERY_SIZE = 12;

function pick<T>(list: readonly T[]): T | undefined {
  return list[Math.floor(Math.random() * list.length)];
}

/** Doze rostos sorteados: dois terços com camisa de clube, o resto de seleção. */
function drawGallery(): Face[] {
  return Array.from({ length: GALLERY_SIZE }, (_, index) => {
    const nation = index % 3 === 2;
    const club = nation ? undefined : pick(CLUBS);
    const country = nation ? pick(COUNTRIES) : undefined;
    const source: KitSource = club ? `club:${club.id}` : country ? `nation:${country.code}` : "none";
    return { config: randomAvatar(), source };
  });
}

/** Nome e ícone de uma origem de camisa, no idioma atual. */
function useSourceLabel() {
  const { t, locale } = useT();
  return (source: KitSource, iconSize: number): { name: string; icon: ReactNode } => {
    if (source.startsWith("club:")) {
      const club = getClub(source.slice(5));
      if (club) return { name: club.short, icon: <Crest club={club} size={iconSize} decorative /> };
    }
    if (source.startsWith("nation:")) {
      const country = getCountry(source.slice(7));
      if (country) {
        return {
          name: country.names[locale],
          icon: <Flag country={country} size={Math.round(iconSize * 1.2)} language={locale} decorative />,
        };
      }
    }
    return { name: t("lab.avatar.kitNone"), icon: null };
  };
}

function Gallery() {
  const { t } = useT();
  const label = useSourceLabel();
  const [faces, setFaces] = useState(drawGallery);

  return (
    <section aria-labelledby="avatar-galeria" className="flex flex-col gap-5">
      <SectionRule
        as="h2"
        aside={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setFaces(drawGallery());
              feedback("select");
            }}
          >
            <Dices size={16} aria-hidden="true" />
            {t("lab.avatar.shuffle")}
          </Button>
        }
      >
        <span id="avatar-galeria">{t("lab.avatar.gallery")}</span>
      </SectionRule>
      <p className="max-w-2xl text-sm text-muted">{t("lab.avatar.galleryHint")}</p>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {faces.map((face, index) => {
          const { name, icon } = label(face.source, 14);
          return (
            <li key={index} className="flex min-w-0 flex-col gap-1.5">
              <div aria-hidden="true" className="aspect-square overflow-hidden rounded-md border border-line">
                <Avatar config={face.config} kit={kitOf(face.source)} className="h-full w-full" />
              </div>
              <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted">
                {icon}
                <span className="truncate">{name}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** O criador de personagem portado, com camisa trocável e uma galeria. */
export function AvatarArea() {
  const { t } = useT();
  const label = useSourceLabel();
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);
  const [source, setSource] = useState<KitSource>("none");

  const options: ChoiceOption<KitSource>[] = KIT_SOURCES.map((value) => {
    const { name, icon } = label(value, 16);
    return { value, label: name, icon };
  });

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-4">
        <p className="max-w-2xl text-base text-muted">{t("lab.avatar.intro")}</p>
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{t("lab.avatar.kit")}</span>
          <ChoiceStrip
            value={source}
            onValueChange={(next) => {
              setSource(next);
              feedback("tick");
            }}
            options={options}
            label={t("lab.avatar.kit")}
          />
        </div>
      </div>

      <AvatarEditor value={avatar} onChange={setAvatar} kit={kitOf(source)} />

      <Gallery />
    </div>
  );
}
