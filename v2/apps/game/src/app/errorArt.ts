/**
 * As ilustrações das telas de erro (GDD 37): quatro lances de futebol no traço
 * da marca, linhas de campo e um ponto de ouro ou de vermelho. São texto SVG
 * puro, sem React, porque servem a duas casas: a tela de erro do jogo e as
 * páginas estáticas 404, 403, 500 e 503, geradas no build com o mesmo
 * desenho. As cores vêm das variáveis do tema (`--fg`, `--glory`, `--bad`,
 * `--line`), então valem nos dois temas.
 */

export const ERROR_ART_KINDS = ["out", "offside", "post", "postponed"] as const;
export type ErrorArtKind = (typeof ERROR_ART_KINDS)[number];

const OPEN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 150" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">`;

/** Uma bola de futebol simples: o pentágono do meio e as costuras. */
function ball(cx: number, cy: number, r: number): string {
  const point = (angle: number, radius: number): [string, string] => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return [(cx + radius * Math.cos(rad)).toFixed(1), (cy + radius * Math.sin(rad)).toFixed(1)];
  };
  const angles = [0, 72, 144, 216, 288];
  const inner = angles.map((angle) => point(angle, r * 0.42).join(",")).join(" ");
  const seams = angles
    .map((angle) => {
      const [x1, y1] = point(angle, r * 0.42);
      const [x2, y2] = point(angle, r);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    })
    .join("");
  return `<g stroke="var(--fg)" stroke-width="2.4"><circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--canvas)"/><polygon points="${inner}" fill="var(--fg)"/>${seams}</g>`;
}

const ART: Readonly<Record<ErrorArtKind, string>> = {
  // 404, bola fora: o canto do campo, a bandeirinha e a bola passando da linha.
  out: [
    OPEN,
    `<g stroke="var(--line)" stroke-width="3">`,
    `<path d="M20 128 H150 V20"/>`,
    `<path d="M150 104 A24 24 0 0 0 126 128"/>`,
    `<path d="M20 92 H96 V128"/>`,
    `</g>`,
    `<g stroke="var(--fg)" stroke-width="2.6"><line x1="150" y1="128" x2="150" y2="92"/></g>`,
    `<path d="M150 92 L172 99 L150 106 Z" fill="var(--glory)" stroke="var(--glory)" stroke-width="2"/>`,
    `<g stroke="var(--glory)" stroke-width="2.4" opacity="0.75"><line x1="160" y1="58" x2="176" y2="52"/><line x1="162" y1="70" x2="180" y2="66"/><line x1="166" y1="82" x2="182" y2="80"/></g>`,
    ball(204, 56, 17),
    `</svg>`,
  ].join(""),

  // 403, impedimento: a bandeira do assistente levantada e a linha da jogada.
  offside: [
    OPEN,
    `<g stroke="var(--line)" stroke-width="3"><path d="M18 128 H222"/></g>`,
    `<g stroke="var(--glory)" stroke-width="2.4" stroke-dasharray="7 7"><line x1="132" y1="128" x2="132" y2="18"/></g>`,
    `<g stroke="var(--fg)" stroke-width="3"><line x1="72" y1="128" x2="92" y2="22"/></g>`,
    `<path d="M92 22 L138 31 L130 66 L84 57 Z" fill="var(--bad)" stroke="var(--bad)" stroke-width="2"/>`,
    `<path d="M115 26.5 L111 61.5 M88 39.5 L134 48.5" stroke="var(--glory)" stroke-width="5"/>`,
    ball(176, 112, 15),
    `</svg>`,
  ].join(""),

  // 500, bateu na trave: o gol de frente, a rede e a bola no poste.
  post: [
    OPEN,
    `<g stroke="var(--line)" stroke-width="1.6" opacity="0.9">`,
    `<path d="M58 40 V128 M80 40 V128 M102 40 V128 M124 40 V128 M146 40 V128 M168 40 V128"/>`,
    `<path d="M40 62 H182 M40 84 H182 M40 106 H182"/>`,
    `</g>`,
    `<g stroke="var(--fg)" stroke-width="5"><path d="M40 130 V30 H184 V130"/></g>`,
    `<g stroke="var(--line)" stroke-width="3"><path d="M14 130 H226"/></g>`,
    `<g stroke="var(--glory)" stroke-width="2.6"><line x1="190" y1="58" x2="200" y2="50"/><line x1="192" y1="72" x2="206" y2="72"/><line x1="190" y1="86" x2="200" y2="94"/></g>`,
    ball(207, 72, 13),
    `</svg>`,
  ].join(""),

  // 503, jogo adiado: nuvem de chuva sobre o círculo central.
  postponed: [
    OPEN,
    `<g stroke="var(--line)" stroke-width="3"><path d="M14 128 H226"/><path d="M120 128 V104"/><path d="M84 128 A36 24 0 0 1 156 128"/></g>`,
    `<path d="M70 70 A20 20 0 0 1 92 46 A28 28 0 0 1 146 42 A22 22 0 0 1 172 70 Z" fill="var(--panel)" stroke="var(--fg)" stroke-width="2.6"/>`,
    `<g stroke="var(--glory)" stroke-width="2.6"><line x1="88" y1="80" x2="82" y2="96"/><line x1="110" y1="80" x2="104" y2="96"/><line x1="132" y1="80" x2="126" y2="96"/><line x1="154" y1="80" x2="148" y2="96"/><line x1="99" y1="102" x2="95" y2="112"/><line x1="143" y1="102" x2="139" y2="112"/></g>`,
    `</svg>`,
  ].join(""),
};

export function errorArt(kind: ErrorArtKind): string {
  return ART[kind];
}
