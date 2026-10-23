import { dramaText } from "@craque/content";
import { COUNTRIES, type Competition, getClub, getCountry } from "@craque/world";
import { startTransition, useEffect, useState } from "react";
import { broadcastIdentity, broadcastStyle, kitStyle } from "../../../features/career/broadcast";
import type { TeamColors } from "../../../features/career/teamColors";
import { useT } from "../../../i18n/useT";
import { Crest, Flag } from "../../../ui/Media";
import { BroadcastEmblem } from "../../career/BroadcastEmblem";
import { BROADCAST_COMPETITIONS, sampleMatch } from "../broadcastSamples";
import { LabSection } from "../LabSection";

function Tile({ competition, nation }: { competition: Competition; nation: string | null }) {
  const { locale } = useT();
  const copy = dramaText(locale);
  const sample = sampleMatch(competition, nation);
  const identity = broadcastIdentity(sample);
  const side = (id: string, colors: TeamColors) => (
    <span data-kit={colors.kit} style={kitStyle(colors)}>
      {sample.national ? <Flag country={getCountry(id)!} language={locale} size={20} decorative /> : <Crest club={id} size={22} decorative />}
      <b>{sample.national ? getCountry(id)?.names[locale] ?? id : getClub(id)?.short ?? id}</b>
    </span>
  );
  return (
    <li className="bc-stage bc-tile" data-broadcast={identity.id} data-motif={identity.motif} style={broadcastStyle(identity)}>
      <div className="match-broadcast">
        <div className="match-broadcast-top"><span className="match-live"><i aria-hidden="true" />{copy.live}</span><span>{copy.stages.final}</span></div>
        <p className="match-competition"><BroadcastEmblem emblem={identity.emblem} /><span>{competition.names[locale]}</span></p>
        <div className="match-scoreboard">{side(sample.team, identity.team)}<strong>1 : 1</strong>{side(sample.opponent, identity.opponent)}</div>
        <i className="match-scarf" data-kit={identity.team.kit} style={kitStyle(identity.team)} aria-hidden="true" />
      </div>
      <p className="bc-tile-id">{identity.id} · {identity.motif} · {identity.emblem}</p>
    </li>
  );
}

/** Todas as competições com a transmissão de verdade, para conferir de uma vez (D83). */
export function BroadcastSection({ index }: { index: number }) {
  const { t, locale } = useT();
  const [nation, setNation] = useState<string | null>(null);
  // As 80 transmissões entram depois da primeira pintura: o resto da área Design aparece antes.
  const [ready, setReady] = useState(false);
  useEffect(() => startTransition(() => setReady(true)), []);
  const nations = [...COUNTRIES].sort((a, b) => a.names[locale].localeCompare(b.names[locale], locale));
  return (
    <LabSection id="transmissoes" index={index} title={t("lab.sections.broadcast")}>
      <p className="mb-4 max-w-3xl text-sm text-muted">{t("lab.broadcast.intro")}</p>
      <label className="flex max-w-xs flex-col gap-1 text-xs text-muted">
        {t("lab.broadcast.nation")}
        <select className="rounded-sm border border-line bg-panel px-2 py-2 text-sm text-fg" value={nation ?? ""} onChange={(event) => setNation(event.target.value || null)}>
          <option value="">{t("lab.broadcast.sampleNation")}</option>
          {nations.map((country) => <option key={country.code} value={country.code}>{country.names[locale]}</option>)}
        </select>
      </label>
      <ul className="bc-gallery" aria-label={t("lab.sections.broadcast")}>
        {ready ? BROADCAST_COMPETITIONS.map((competition) => <Tile key={competition.id} competition={competition} nation={nation} />) : null}
      </ul>
    </LabSection>
  );
}
