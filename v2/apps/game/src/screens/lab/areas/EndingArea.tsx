import { type AvatarConfig, DEFAULT_AVATAR } from "@craque/art";
import { biography } from "@craque/content";
import { autoplay, type Career, type CareerPolicy, type CareerSetup, createCareer } from "@craque/engine";
import { FileText, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigation } from "../../../app/navigation";
import { useCareer } from "../../../features/career/store";
import { POSTER_WIDTH } from "../../../features/summary/poster";
import { usePosterHeight } from "../../../lib/usePosterHeight";
import { useT } from "../../../i18n/useT";
import { useElementWidth } from "../../../lib/useElementWidth";
import { feedback } from "../../../services/feedback";
import { Button } from "../../../ui/Button";
import { SectionRule } from "../../../ui/Panel";
import { Segmented } from "../../../ui/Segmented";
import { Poster } from "../../summary/Poster";

/** Perfis de carreira automática para revisar o fim de carreira sem jogar 20 temporadas. */
const PROFILES = ["ambitious", "loyal", "keeper"] as const;
type Profile = (typeof PROFILES)[number];

const PROFILE_SETUP: Readonly<Record<Profile, { policy: CareerPolicy; identity: CareerSetup["identity"]; avatar: AvatarConfig }>> = {
  ambitious: {
    policy: "ambitious",
    identity: { surname: "MOREIRA", foot: "right", nationality: "BRA", position: "st", dreamNumber: 9 },
    avatar: { ...DEFAULT_AVATAR, skin: 4, hair: "curly", hairColor: 0 },
  },
  loyal: {
    policy: "loyal",
    identity: { surname: "ARRIETA", foot: "left", nationality: "ARG", position: "cam", dreamNumber: 10 },
    avatar: { ...DEFAULT_AVATAR, skin: 2, hair: "sidePart", hairColor: 2, beard: "full", beardColor: 2 },
  },
  keeper: {
    policy: "balanced",
    identity: { surname: "OKONKWO", foot: "right", nationality: "NGA", position: "gk", dreamNumber: 1 },
    avatar: { ...DEFAULT_AVATAR, skin: 6, hair: "afro", hairColor: 0 },
  },
};

function playCareer(profile: Profile, round: number): Career {
  const preset = PROFILE_SETUP[profile];
  return autoplay(
    createCareer({ seed: `lab-fim-${profile}-${round}`, startYear: 2026, pace: "intense", difficulty: "normal", identity: preset.identity }),
    preset.policy,
  );
}

/**
 * Área "Fim de carreira" (M6, GDD 38): uma carreira inteira jogada pela
 * política automática, com a prévia do pôster e a biografia. "Abrir no
 * resumo" consulta esta carreira de teste somente na sessão atual.
 */
export function EndingArea() {
  const { t, locale } = useT();
  const go = useNavigation((state) => state.go);
  const [profile, setProfile] = useState<Profile>("ambitious");
  const [round, setRound] = useState(1);
  const career = useMemo(() => playCareer(profile, round), [profile, round]);
  const avatar = PROFILE_SETUP[profile].avatar;
  const bio = biography(locale, career);
  const [frameRef, width] = useElementWidth(320);
  const posterRef = useRef<HTMLDivElement>(null);
  const posterHeight = usePosterHeight(posterRef, true);
  const scale = Math.min(1, width / POSTER_WIDTH);

  const openSummary = () => {
    useCareer.setState({ status: "ready", career, avatar, screen: "summary", stale: null, play: null, review: null, internalTesting: true });
    feedback("reveal");
    go("summary", { force: true });
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="max-w-2xl text-muted">{t("lab.ending.intro")}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label={t("lab.ending.profile")}
          value={profile}
          options={PROFILES.map((value) => ({ value, label: t(`lab.ending.profiles.${value}`) }))}
          onValueChange={(value) => {
            setProfile(value);
            feedback("tick");
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            feedback("select");
            setRound((value) => value + 1);
          }}
        >
          <RefreshCw size={16} aria-hidden="true" />
          {t("lab.ending.another")}
        </Button>
        <Button onClick={openSummary}>
          <FileText size={16} aria-hidden="true" />
          {t("lab.ending.open")}
        </Button>
      </div>
      <p className="text-sm text-muted">
        {t("lab.ending.facts", {
          seasons: career.history.length,
          age: career.end?.age ?? career.age,
          titles: career.history.reduce((total, record) => total + record.titles.length, 0),
        })}
      </p>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section>
          <SectionRule className="mb-3">{t("lab.ending.poster")}</SectionRule>
          <div ref={frameRef} className="poster-frame" style={{ height: posterHeight * scale }}>
            <div className="poster-scale" style={{ transform: `scale(${scale})` }}>
              <Poster ref={posterRef} career={career} avatar={avatar} showSurname />
            </div>
          </div>
        </section>
        <section>
          <SectionRule className="mb-3">{t("lab.ending.biography")}</SectionRule>
          <div className="bio">
            {bio.chapters.map((chapter) => (
              <section key={chapter.id} className="bio-chapter">
                <h3 className="bio-title">{chapter.title}</h3>
                <p className="bio-text">{chapter.lines.join(" ")}</p>
              </section>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
