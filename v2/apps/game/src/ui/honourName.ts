import { AWARDS, getCompetition, type AwardKey, type Language } from "@craque/world";

/** O nome que a dica mostra: prêmio com a competição, ou só a competição. */
export function honourName(id: string, award: AwardKey | undefined, label: string | undefined, language: Language): string {
  const competition = getCompetition(id);
  return label ?? (award ? `${AWARDS[award].names[language]}${competition ? ` · ${competition.names[language]}` : ""}` : competition?.names[language] ?? id);
}
