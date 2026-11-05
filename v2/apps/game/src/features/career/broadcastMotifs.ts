import type { BroadcastMotif } from "./broadcastPackages";

/**
 * Os padrões de fundo das transmissões (D83), como máscaras CSS: o desenho
 * recorta a cor, que vem do fundo do pseudo-elemento do palco. Ficam aqui, no
 * código da carreira (carregado sob demanda), e não no CSS global: a abertura
 * do site não baixa desenho de estádio nenhum.
 *
 * - `tint`: qual luz do pacote pinta o padrão;
 * - `edge` e `core`: a opacidade nas bordas e no centro, onde mora o texto.
 *   Padrões de áreas grandes (listras, mosaico) ficam mais discretos.
 */
export interface MotifMask {
  readonly mask: string;
  readonly tint: "light" | "light2" | "metal";
  readonly edge: number;
  readonly core: number;
}

const svg = (width: number, height: number, body: string) => `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>${body}</svg>")`;
const tile = (width: number, height: number, body: string) => `${svg(width, height, body)} 0 0 / ${width}px ${height}px`;

export const MOTIF_MASKS: Readonly<Record<BroadcastMotif, MotifMask>> = {
  // Noite europeia: estrelas soltas e duas curvas varrendo o alto.
  stars: {
    mask: `${tile(200, 200, "<path d='M34 35 35.2 38.3 38.8 38.5 36 40.6 36.9 44 34 42.1 31.1 44 32 40.6 29.2 38.5 32.8 38.3ZM132 22.6 132.8 24.8 135.2 24.9 133.4 26.4 134 28.8 132 27.4 130 28.8 130.6 26.4 128.8 24.9 131.2 24.8ZM176 113.8 177 116.6 180 116.7 177.7 118.5 178.5 121.4 176 119.8 173.5 121.4 174.3 118.5 172 116.7 175 116.6ZM96 165 96.7 167 98.9 167.1 97.2 168.4 97.8 170.4 96 169.3 94.2 170.4 94.8 168.4 93.1 167.1 95.3 167ZM20 147.4 20.6 149.1 22.5 149.2 21 150.3 21.5 152.1 20 151.1 18.5 152.1 19 150.3 17.5 149.2 19.4 149.1ZM150 67.8 150.5 69.3 152.1 69.3 150.9 70.3 151.3 71.8 150 70.9 148.7 71.8 149.1 70.3 147.9 69.3 149.5 69.3ZM78 85Q78 92 85 92Q78 92 78 99Q78 92 71 92Q78 92 78 85ZM186 177.5Q186 182 190.5 182Q186 182 186 186.5Q186 182 181.5 182Q186 182 186 177.5ZM58 4.5Q58 8 61.5 8Q58 8 58 11.5Q58 8 54.5 8Q58 8 58 4.5ZM109 60a1 1 0 1 0 2 0a1 1 0 1 0-2 0M11 96a1 1 0 1 0 2 0a1 1 0 1 0-2 0M159 160a1 1 0 1 0 2 0a1 1 0 1 0-2 0M69 130a1 1 0 1 0 2 0a1 1 0 1 0-2 0M189 34a1 1 0 1 0 2 0a1 1 0 1 0-2 0M123 120a1 1 0 1 0 2 0a1 1 0 1 0-2 0'/>")}, radial-gradient(circle at 50% -120%, transparent 0 64.6%, #000 64.75% 65%, transparent 65.15% 66.9%, #000 67% 67.15%, transparent 67.3%) 0 0 / 100% 100% no-repeat`,
    tint: "light2",
    edge: 28,
    core: 6,
  },
  // Arcos encadeados, como os gomos de uma bola.
  arcs: { mask: tile(80, 80, "<path d='M24 0A24 24 0 0 1 0 24M40 0A40 40 0 0 1 0 40M56 0A56 56 0 0 1 0 56M80 24A56 56 0 0 0 24 80M80 40A40 40 0 0 0 40 80M80 56A24 24 0 0 0 56 80' fill='none' stroke='black' stroke-width='2'/>"), tint: "metal", edge: 13, core: 3 },
  hatch: { mask: "repeating-linear-gradient(135deg, #000 0 2px, transparent 2px 7px, #000 7px 8px, transparent 8px 30px)", tint: "metal", edge: 13, core: 3 },
  // A glória eterna: raios de sol saindo do alto.
  rays: { mask: "repeating-conic-gradient(from 0deg at 50% -18%, #000 0 1.3deg, transparent 1.3deg 6deg)", tint: "metal", edge: 16, core: 5 },
  // Papel picado da arquibancada sul-americana.
  papelitos: {
    mask: tile(160, 140, "<rect x='14' y='12' width='2.6' height='7' transform='rotate(30 14 12)'/><rect x='58' y='22' width='3.2' height='8.5' transform='rotate(110 58 22)'/><rect x='98' y='8' width='2.4' height='6.5' transform='rotate(65 98 8)'/><rect x='138' y='26' width='3' height='8' transform='rotate(150 138 26)'/><rect x='30' y='52' width='2.8' height='7.5' transform='rotate(95 30 52)'/><rect x='76' y='60' width='3.4' height='6' transform='rotate(20 76 60)'/><rect x='118' y='48' width='2.4' height='8.6' transform='rotate(130 118 48)'/><rect x='150' y='70' width='3' height='7' transform='rotate(45 150 70)'/><rect x='12' y='92' width='3.2' height='8' transform='rotate(160 12 92)'/><rect x='54' y='100' width='2.6' height='6.4' transform='rotate(75 54 100)'/><rect x='96' y='86' width='3' height='8.2' transform='rotate(10 96 86)'/><rect x='132' y='110' width='2.4' height='7' transform='rotate(120 132 110)'/><rect x='36' y='128' width='3.2' height='6.6' transform='rotate(55 36 128)'/><rect x='84' y='126' width='2.8' height='8.4' transform='rotate(140 84 126)'/>"),
    tint: "light",
    edge: 20,
    core: 3,
  },
  // O mundo: um globo enorme nascendo do pé do palco.
  globe: {
    mask: `${svg(400, 400, "<g fill='none' stroke='black' stroke-width='1.1'><circle cx='200' cy='200' r='198'/><ellipse cx='200' cy='200' rx='140' ry='198'/><ellipse cx='200' cy='200' rx='70' ry='198'/><path d='M200 2v396M2 200h396M29 100h342M29 300h342M98.5 30h203M98.5 370h203'/></g>")} 50% 135% / max(118%, 560px) auto no-repeat`,
    tint: "metal",
    edge: 18,
    core: 7,
  },
  // Festival europeu: mosaico de formas geométricas.
  mosaic: { mask: tile(96, 96, "<path d='M0 0h48A48 48 0 0 1 0 48ZM48 48a24 24 0 0 1 48 0ZM48 96 96 48v48Z'/><circle cx='24' cy='72' r='13' fill='none' stroke='black' stroke-width='6'/>"), tint: "light", edge: 10, core: 2 },
  // Tecido andino: zigue-zague e losangos.
  aguayo: { mask: tile(72, 36, "<path d='M0 10l9-7 9 7 9-7 9 7 9-7 9 7 9-7 9 7' fill='none' stroke='black' stroke-width='2'/><path d='M9 20l5 5-5 5-5-5ZM27 20l5 5-5 5-5-5ZM45 20l5 5-5 5-5-5ZM63 20l5 5-5 5-5-5Z'/><path d='M0 34.5h72' stroke='black'/>"), tint: "light", edge: 15, core: 3 },
  // Trama de tecido africano: blocos que se cruzam.
  kente: { mask: tile(48, 48, "<path d='M0 3h22v4H0zM0 11h22v4H0zM0 19h22v4H0zM27 0h4v22h-4zM35 0h4v22h-4zM43 0h4v22h-4zM3 26h4v22H3zM11 26h4v22h-4zM19 26h4v22h-4zM26 27h22v4H26zM26 35h22v4H26zM26 43h22v4H26z'/>"), tint: "light", edge: 10, core: 2 },
  waves: { mask: tile(40, 20, "<path d='M0 10q10-7 20 0t20 0' fill='none' stroke='black' stroke-width='1.5'/>"), tint: "light", edge: 16, core: 3 },
  lattice: { mask: tile(42, 24.25, "<path d='M0 12.12 7 0h14l7 12.12-7 12.13H7ZM28 12.12h14' fill='none' stroke='black' stroke-width='1.2'/>"), tint: "light", edge: 15, core: 3 },
  // Facetas angulosas, como cortes de vidro.
  shards: { mask: tile(160, 160, "<path d='M0 150 118 0h10L10 150ZM44 160 160 40v10L54 160ZM90 0h14L60 54h-8ZM160 112v8l-36 40h-8ZM20 40l24-24v30Z'/>"), tint: "light", edge: 14, core: 3 },
  // Faixas arredondadas, em camadas.
  ribbons: { mask: tile(120, 48, "<rect x='4' y='6' width='52' height='9' rx='4.5'/><rect x='64' y='6' width='26' height='9' rx='4.5'/><rect x='98' y='6' width='14' height='9' rx='4.5'/><rect x='22' y='30' width='70' height='9' rx='4.5'/><rect x='100' y='30' width='16' height='9' rx='4.5'/>"), tint: "light", edge: 12, core: 3 },
  // Alfaiataria italiana: losangos finos.
  argyle: { mask: "repeating-linear-gradient(60deg, #000 0 1px, transparent 1px 26px), repeating-linear-gradient(-60deg, #000 0 1px, transparent 1px 26px)", tint: "metal", edge: 16, core: 3 },
  // Prancheta técnica: grade fina e grade mestra.
  blueprint: { mask: "linear-gradient(rgb(0 0 0 / 0.45) 0 1px, transparent 1px) 0 0 / 100% 22px, linear-gradient(90deg, rgb(0 0 0 / 0.45) 0 1px, transparent 1px) 0 0 / 22px 100%, linear-gradient(#000 0 2px, transparent 2px) 0 0 / 100% 88px, linear-gradient(90deg, #000 0 2px, transparent 2px) 0 0 / 88px 100%", tint: "light2", edge: 14, core: 3 },
  // Leques art déco.
  deco: { mask: tile(48, 48, "<g fill='none' stroke='black' stroke-width='1.2'><path d='M0 24a24 24 0 0 1 48 0M8 24a16 16 0 0 1 32 0M24 24V0M24 24 7 7M24 24 41 7'/><path d='M-24 48a24 24 0 0 1 48 0M-16 48a16 16 0 0 1 32 0M0 48V24M0 48-17 31M0 48 17 31M24 48a24 24 0 0 1 48 0M32 48a16 16 0 0 1 32 0M48 48V24M48 48 31 31M48 48 65 31'/></g>"), tint: "metal", edge: 15, core: 3 },
  // Arquibancada em retícula; o desvanecimento vertical fica em `broadcast.css`.
  stands: { mask: "radial-gradient(circle, #000 0 1.1px, transparent 1.6px) 0 0 / 8px 8px, radial-gradient(circle, #000 0 1.1px, transparent 1.6px) 4px 4px / 8px 8px", tint: "light", edge: 17, core: 2 },
  // Papel picado de festa, pendurado no barbante.
  pennants: {
    mask: tile(140, 72, "<path d='M0 6q35 14 70 0q35 14 70 0' fill='none' stroke='black' stroke-width='1.2'/><path fill-rule='evenodd' d='M6 8h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM13 11.5l3 3.6-3 3.6-3-3.6ZM26 12h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM33 15.5l3 3.6-3 3.6-3-3.6ZM46 11.5h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM53 15l3 3.6-3 3.6-3-3.6ZM76 8h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM83 11.5l3 3.6-3 3.6-3-3.6ZM96 12h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM103 15.5l3 3.6-3 3.6-3-3.6ZM116 11.5h14v14l-2.33 2-2.33-2-2.33 2-2.33-2-2.33 2-2.33-2ZM123 15l3 3.6-3 3.6-3-3.6Z'/>"),
    tint: "light2",
    edge: 15,
    core: 3,
  },
  // Copas: a chave do mata-mata, com a taça no meio.
  bracket: { mask: tile(120, 96, "<g fill='none' stroke='black' stroke-width='1.5'><path d='M0 12h20v24H0M20 24h18M0 60h20v24H0M20 72h18M38 24v48M38 48h16M120 12h-20v24h20M100 24H82M120 60h-20v24h20M100 72H82M82 24v48M82 48H66'/></g><circle cx='60' cy='48' r='3.2'/>"), tint: "metal", edge: 16, core: 3 },
  // A cordilheira, em duas linhas de cumes.
  peaks: { mask: tile(160, 64, "<path d='M0 54 18 30 28 39 46 14 60 32 72 22 92 50 108 26 122 38 140 18 160 54M0 62 20 50 36 58 58 42 80 60 102 46 124 56 144 44 160 62' fill='none' stroke='black' stroke-width='1.5' stroke-linejoin='round'/>"), tint: "light2", edge: 16, core: 3 },
  sweep: { mask: "repeating-linear-gradient(-58deg, #000 0 1.5px, transparent 1.5px 16px)", tint: "light", edge: 15, core: 3 },
  // Listras de bandeira e de camisa: largas, então bem mais discretas.
  stripes: { mask: "repeating-linear-gradient(180deg, #000 0 12px, transparent 12px 24px)", tint: "light", edge: 8, core: 2 },
  pinstripes: { mask: "repeating-linear-gradient(90deg, #000 0 10px, transparent 10px 20px)", tint: "light", edge: 8, core: 2 },
  // D117: a Elite asiática, cidades do continente ligadas como constelação.
  constellation: {
    mask: tile(160, 120, "<g fill='none' stroke='black' stroke-width='.8'><path d='M14 22 52 40 88 18 126 34 150 12M52 40 44 78 86 94 120 70 126 34M86 94 112 112M44 78 10 100'/></g><circle cx='14' cy='22' r='2'/><circle cx='52' cy='40' r='2.6'/><circle cx='88' cy='18' r='1.8'/><circle cx='126' cy='34' r='2.4'/><circle cx='150' cy='12' r='1.6'/><circle cx='44' cy='78' r='1.8'/><circle cx='86' cy='94' r='2.6'/><circle cx='120' cy='70' r='1.8'/><circle cx='112' cy='112' r='1.6'/><circle cx='10' cy='100' r='1.6'/>"),
    tint: "light",
    edge: 20,
    core: 4,
  },
  // Japão: as ondas em escamas do seigaiha.
  seigaiha: { mask: tile(40, 20, "<g fill='none' stroke='black' stroke-width='1.1'><path d='M1 20a19 19 0 0 1 38 0M6 20a14 14 0 0 1 28 0M11 20a9 9 0 0 1 18 0M-19 10a19 19 0 0 1 38 0M-14 10a14 14 0 0 1 28 0M-9 10a9 9 0 0 1 18 0M21 10a19 19 0 0 1 38 0M26 10a14 14 0 0 1 28 0M31 10a9 9 0 0 1 18 0'/></g>"), tint: "light", edge: 13, core: 3 },
  // Arábia Saudita: a estrela de oito pontas da geometria islâmica, em rede.
  girih: { mask: tile(48, 48, "<g fill='none' stroke='black' stroke-width='1.1'><path d='M14 14h20v20H14ZM24 10l14 14-14 14-14-14ZM24 0v10M24 38v10M0 24h10M38 24h10'/></g>"), tint: "metal", edge: 15, core: 3 },
  // China: as nuvens auspiciosas, em caracol.
  xiangyun: { mask: tile(96, 64, "<g fill='none' stroke='black' stroke-width='1.3' stroke-linecap='round'><path d='M8 30c-3-7 5-12 11-8 1-8 13-10 17-3 5-4 13 0 12 6 6 0 7 8 1 9H10c-4 0-5-2-2-4ZM20 26a3.4 3.4 0 1 1 5 3M38 24a3 3 0 1 1 4 3'/><path d='M56 58c-2-5 4-9 8-6 1-6 10-7 13-2 4-3 10 0 9 5 5 0 5 6 1 7H58c-3 0-4-2-2-4ZM66 55a2.6 2.6 0 1 1 4 2'/></g>"), tint: "metal", edge: 16, core: 3 },
  // Coreia do Sul: os trigramas da bandeira.
  gwae: { mask: tile(64, 64, "<path d='M6 8h16v2.6H6ZM6 13h16v2.6H6ZM6 18h16v2.6H6ZM42 8h6.5v2.6H42ZM51.5 8H58v2.6h-6.5ZM42 13h6.5v2.6H42ZM51.5 13H58v2.6h-6.5ZM42 18h6.5v2.6H42ZM51.5 18H58v2.6h-6.5ZM6 42h6.5v2.6H6ZM15.5 42H22v2.6h-6.5ZM6 47h16v2.6H6ZM6 52h6.5v2.6H6ZM15.5 52H22v2.6h-6.5ZM42 42h16v2.6H42ZM42 47h6.5v2.6H42ZM51.5 47H58v2.6h-6.5ZM42 52h16v2.6H42Z'/>"), tint: "light", edge: 12, core: 2 },
  // Indonésia: o batik kawung, quatro pétalas em torno de um ponto.
  kawung: { mask: tile(40, 40, "<g fill='none' stroke='black' stroke-width='1.1'><ellipse cx='11' cy='11' rx='8.5' ry='5' transform='rotate(45 11 11)'/><ellipse cx='29' cy='11' rx='8.5' ry='5' transform='rotate(-45 29 11)'/><ellipse cx='11' cy='29' rx='8.5' ry='5' transform='rotate(-45 11 29)'/><ellipse cx='29' cy='29' rx='8.5' ry='5' transform='rotate(45 29 29)'/></g><circle cx='20' cy='20' r='1.8'/><circle cx='0' cy='0' r='1.8'/><circle cx='40' cy='0' r='1.8'/><circle cx='0' cy='40' r='1.8'/><circle cx='40' cy='40' r='1.8'/>"), tint: "light", edge: 14, core: 3 },
};
