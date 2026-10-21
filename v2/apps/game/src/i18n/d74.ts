import type { Locale } from "@craque/content";
const pt = {
  readPaper: "Ampliar jornal", paperCover: "Capa", paperInside: "Bastidores",
  progress: "Decisão {index} de {total} · {year}", continue: "Continuar", goal: "GOL!", assist: "PASSE DE GOL", victory: "VITÓRIA", defeat: "DERROTA", outcome: "O lance que decidiu", promiseGoal: "A marca que você buscou", promiseMiss: "A meta ficou pelo caminho", promiseKept: "Palavra cumprida", backPage: "Por dentro da temporada", backDeck: "As escolhas, os lances e o que ficou do ano", benefit: "Seu novo papel", cost: "A concessão", shot: "Bater para o gol", pass: "Quebrar as linhas", defensive: "Antecipar a jogada", keeper: "Atacar a bola", team: "Encontrar o apoio", safe: "Proteger o espaço",
};
type Copy = { [K in keyof typeof pt]: string };
const en: Copy = {
  readPaper: "Enlarge newspaper", paperCover: "Front page", paperInside: "Inside story",
  progress: "Decision {index} of {total} · {year}", continue: "Continue", goal: "GOAL!", assist: "THE FINAL PASS", victory: "VICTORY", defeat: "DEFEAT", outcome: "The decisive moment", promiseGoal: "The mark you aimed for", promiseMiss: "The target slipped away", promiseKept: "A promise kept", backPage: "Inside the season", backDeck: "The choices, the moments and what the year left behind", benefit: "Your new role", cost: "The trade-off", shot: "Go for goal", pass: "Break the lines", defensive: "Read the play", keeper: "Attack the ball", team: "Find support", safe: "Protect the space",
};
const es: Copy = {
  readPaper: "Ampliar periódico", paperCover: "Portada", paperInside: "Entre bastidores",
  progress: "Decisión {index} de {total} · {year}", continue: "Continuar", goal: "¡GOL!", assist: "PASE DE GOL", victory: "VICTORIA", defeat: "DERROTA", outcome: "La jugada decisiva", promiseGoal: "La marca que buscabas", promiseMiss: "La meta quedó en el camino", promiseKept: "Palabra cumplida", backPage: "Por dentro de la temporada", backDeck: "Las decisiones, las jugadas y lo que dejó el año", benefit: "Tu nuevo papel", cost: "La concesión", shot: "Buscar el gol", pass: "Romper líneas", defensive: "Anticipar la jugada", keeper: "Atacar el balón", team: "Encontrar apoyo", safe: "Proteger el espacio",
};
export const D74_TEXTS = { pt, en, es };
export function d74(locale: Locale) { return D74_TEXTS[locale]; }
