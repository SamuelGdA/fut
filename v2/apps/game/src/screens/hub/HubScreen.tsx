import { getClub, getCountryKit } from "@craque/world";
import { ArrowRight, Award, BookOpen, FlaskConical, Play, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useNavigation } from "../../app/navigation";
import { useDraft } from "../../features/career/draft";
import { useHall } from "../../features/hall/store";
import { useCoachDraft } from "../../features/tecnico/draft";
import { useTecnicoPresence } from "../../features/tecnico/presence";
import { useT } from "../../i18n/useT";
import { IS_DEV } from "../../lib/env";
import { feedback } from "../../services/feedback";
import { Avatar } from "../../ui/Avatar";
import { Button } from "../../ui/Button";
import { Crest } from "../../ui/Media";
import { PlayerCard } from "../../ui/PlayerCard";

/**
 * O hub do Futeiros (D50): a primeira tela. Dois cartões, um por jogo, cada
 * um com o que o jogo é em três linhas e o botão de jogar. O Craque continua
 * apenas nesta sessão; o Técnico retoma a última carreira em andamento (D61). No PC, os dois lado a lado sem rolar; no celular,
 * empilhados. Nenhum motor é baixado aqui.
 */
export function HubScreen() {
  const { t, tp } = useT();
  const go = useNavigation((state) => state.go);
  const unlocked = useHall((state) => state.achievements);

  useEffect(() => {
    void useHall.getState().load();
  }, []);

  const craqueCount = unlocked.filter((row) => !row.id.startsWith("tecnico:")).length;
  const tecnicoCount = unlocked.length - craqueCount;

  return (
    <div className="hub pitch-stripes">
      <header className="hub-header">
        <p className="eyebrow text-glory">{t("hub.eyebrow")}</p>
        <h1 className="hub-title">{t("hub.title")}</h1>
        <p className="hub-lead">{t("hub.lead")}</p>
      </header>

      <div className="hub-games">
        <CraqueCard achievements={craqueCount} />
        <TecnicoCard achievements={tecnicoCount} />
      </div>

      <footer className="hub-footer">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            feedback("select");
            go("achievements");
          }}
        >
          <Award size={16} aria-hidden="true" />
          {t("hub.achievements")}
          <span className="text-muted">· {tp("hub.achievementsCount", unlocked.length)}</span>
        </Button>
        {IS_DEV ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              feedback("tick");
              go("lab");
            }}
          >
            <FlaskConical size={16} aria-hidden="true" />
            {t("home.lab")}
          </Button>
        ) : null}
      </footer>
    </div>
  );
}

function CraqueCard({ achievements }: { achievements: number }) {
  const { t, tp } = useT();
  const go = useNavigation((state) => state.go);
  const draft = useDraft();

  return (
    <article className="hub-card" data-game="craque" aria-labelledby="hub-craque">
      <div className="hub-card-art">
        <PlayerCard
          surname={draft.surname.trim().toLocaleUpperCase() || t("card.you")}
          position={draft.position ?? "st"}
          ovr={null}
          attributes={null}
          nationality={draft.nationality}
          club={null}
          league={null}
          shirt={draft.dreamNumber}
          avatar={draft.avatar}
          width={150}
        />
      </div>
      <div className="hub-card-body">
        <p className="eyebrow text-glory">{t("hub.craque.eyebrow")}</p>
        <h2 id="hub-craque" className="hub-card-title">
          {t("hub.craque.title")}
        </h2>
        <p className="text-sm text-muted">{t("hub.craque.lead")}</p>
        <ul className="hub-points">
          <li>{t("hub.craque.points.first")}</li>
          <li>{t("hub.craque.points.second")}</li>
          <li>{t("hub.craque.points.third")}</li>
        </ul>
        <div className="hub-actions"><Button onClick={() => { feedback("confirm"); go("home"); }}><Play size={17} aria-hidden="true" />{t("hub.craque.play")}</Button></div>
        <p className="hub-meta">{tp("hub.achievementsCount", achievements)}</p>
      </div>
    </article>
  );
}

function TecnicoCard({ achievements }: { achievements: number }) {
  const { t, tp, number } = useT();
  const go = useNavigation((state) => state.go);
  const draft = useCoachDraft();
  const presence = useTecnicoPresence();
  const club = presence.club ? getClub(presence.club) : null;

  return (
    <article className="hub-card" data-game="tecnico" aria-labelledby="hub-tecnico">
      <div className="hub-card-art">
        <div className="hub-coach">
          <Avatar config={draft.avatar} kit={club ? null : draft.nationality ? getCountryKit(draft.nationality) : null} outfit="coach" className="h-full w-full" />
        </div>
      </div>
      <div className="hub-card-body">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow text-glory">{t("hub.tecnico.eyebrow")}</p>

        </div>
        <h2 id="hub-tecnico" className="hub-card-title">
          {t("hub.tecnico.title")}
        </h2>
        <p className="text-sm text-muted">{t("hub.tecnico.lead")}</p>
        <ul className="hub-points">
          <li>{t("hub.tecnico.points.first")}</li>
          <li>{t("hub.tecnico.points.second")}</li>
          <li>{t("hub.tecnico.points.third")}</li>
        </ul>
        {presence.active && club ? (
          <p className="flex items-center gap-2 text-xs text-info">
            <Crest club={club} size={18} decorative />
            {presence.ended ? t("hub.tecnico.ended") : t("hub.tecnico.inProgress")}: {club.name}
            {presence.year ? ` · ${number(presence.year, { useGrouping: false })}` : ""}
          </p>
        ) : (
          <p className="text-xs text-faint">{t("hub.tecnico.noSaveHint")}</p>
        )}
        <div className="hub-actions">
          {presence.active ? (
            <>
              <Button
                onClick={() => {
                  feedback("confirm");
                  go(presence.ended ? "tecnicoLegacy" : "tecnico");
                }}
              >
                {presence.ended ? <BookOpen size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
                {t("hub.tecnico.resume")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  feedback("select");
                  go("tecnicoIdentity");
                }}
              >
                <RotateCcw size={16} aria-hidden="true" />
                {t("hub.tecnico.play")}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => {
                feedback("confirm");
                go("tecnicoIdentity");
              }}
            >
              <Play size={17} aria-hidden="true" />
              {t("hub.tecnico.play")}
            </Button>
          )}
        </div>
        <p className="hub-meta">{tp("hub.achievementsCount", achievements)}</p>
      </div>
    </article>
  );
}
