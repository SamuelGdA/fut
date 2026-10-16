/** D67: propostas recebidas e cobrança por conquistas nos clubes grandes. */
const messages = {
  pt: {
    saleOffers: "Propostas de compra", buyer: "Clube interessado", offerValue: "Valor da proposta",
    ambitionTitle: "Cobrança por títulos",
    ambitionHint: "Este clube cobra conquistas além da colocação. O jejum aumenta a pressão a cada temporada: liga, principal continental ou Mundial zeram a cobrança acumulada; copa nacional e segundo continental aliviam parcialmente. Supercopas não encerram o jejum. Cumprir a meta da liga sozinho não garante a renovação.",
    ambitionWarning: "A colocação foi alcançada, mas a diretoria cobra títulos. O jejum está pesando na sua permanência.",
  },
  en: {
    saleOffers: "Purchase offers", buyer: "Interested club", offerValue: "Offer value",
    ambitionTitle: "Demand for trophies",
    ambitionHint: "This club demands trophies as well as league position. Pressure grows each season without a major title. The league, main continental cup or Club World Cup reset it; the national cup and second continental cup provide partial relief. Supercups do not end the drought. Meeting the league target alone does not guarantee renewal.",
    ambitionWarning: "The league target was met, but the board demands trophies. The drought is putting your job under pressure.",
  },
  es: {
    saleOffers: "Ofertas de compra", buyer: "Club interesado", offerValue: "Valor de la oferta",
    ambitionTitle: "Exigencia de títulos",
    ambitionHint: "Este club exige títulos además de la clasificación. La presión crece cada temporada sin un gran título. La liga, el principal continental o el Mundial reinician la cuenta; la copa nacional y el segundo continental alivian parcialmente. Las supercopas no acaban con la sequía. Cumplir la meta de liga por sí solo no garantiza renovar.",
    ambitionWarning: "Se alcanzó la posición, pero la directiva exige títulos. La sequía está poniendo en riesgo tu continuidad.",
  },
} as const;
export function d67(locale: keyof typeof messages, key: keyof typeof messages.pt): string { return messages[locale][key]; }
