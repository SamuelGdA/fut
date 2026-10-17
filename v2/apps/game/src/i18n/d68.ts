const messages = {
  pt: {
    emptyDecisions: "Ainda não há uma decisão reproduzível para mudar nesta carreira.",
    scoringTitle: "Finalização e gols",
    scoringHint: "Acima de 80 de finalização, pontas e meias ganham mais oportunidades de gol, gradualmente até 99. A posição ainda limita quantas chances surgem: um MC finalizador marca mais que outros MCs, mas costuma marcar menos que um atacante. As taxas são médias, não promessas de resultado.",
    finishing: "Finalização", level: "OVR", expected: "Gols esperados em 50 jogos", valueHint: "No Craque, o valor cresce mais devagar acima de OVR 80 e nunca passa de €300 milhões. Só jogadores excepcionais e jovens chegam ao teto. A idade reduz o valor mesmo com OVR alto.",
  },
  en: {
    emptyDecisions: "There is no reproducible decision to change in this career yet.",
    scoringTitle: "Finishing and goals",
    scoringHint: "Above 80 finishing, wingers and midfielders gradually earn more scoring opportunities, up to 99. Position still limits chances: a finishing specialist in central midfield scores more than other central midfielders, but usually less than a forward. Rates are averages, not guaranteed results.",
    finishing: "Finishing", level: "OVR", expected: "Expected goals in 50 games", valueHint: "In Craque, value grows more slowly above 80 OVR and never exceeds €300 million. Only exceptional young players reach the ceiling. Age lowers value even at high OVR.",
  },
  es: {
    emptyDecisions: "Todavía no hay una decisión reproducible que cambiar en esta carrera.",
    scoringTitle: "Definición y goles",
    scoringHint: "Por encima de 80 de definición, extremos y mediocampistas ganan más oportunidades de gol, gradualmente hasta 99. La posición sigue limitando las ocasiones: un MC finalizador marca más que otros MC, pero normalmente menos que un delantero. Las tasas son promedios, no resultados garantizados.",
    finishing: "Definición", level: "OVR", expected: "Goles esperados en 50 partidos", valueHint: "En Craque, el valor crece más despacio por encima de 80 OVR y nunca supera €300 millones. Solo jugadores excepcionales y jóvenes llegan al techo. La edad reduce el valor incluso con OVR alto.",
  },
} as const;
export function d68(locale: keyof typeof messages, key: keyof typeof messages.pt): string { return messages[locale][key]; }
