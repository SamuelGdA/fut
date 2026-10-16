# Desafio do dia

Motor 2.0.0-m13, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 162 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 0.98 |

## Tentativas de jogadores comuns

240 tentativas em 120 dias. Pontuação: mediana 426, percentil 90 793, máxima 993. Édito intacto em 50% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 0.98.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1621 | 106 | 406 | 0.79 |
| Promissor | 1216 | 74 | 548 | 1.20 |
| Craque | 570 | 40 | 392 | 0.80 |
| Estrela | 179 | 18 | 469 | 1.56 |
| Fenômeno | 64 | 2 | 641 | 1.00 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 247 | 80 (35%) | 95 (38%) | 125 (33%) | 185 (31%) | 260 (38%) |
| seasonGoals | 208 | 14 (36%) | 15 (38%) | 18 (27%) | 24 (28%) | 29 (43%) |
| contributions | 331 | 145 (32%) | 165 (37%) | 210 (34%) | 290 (35%) | 420 (39%) |
| cleanSheets | 156 | 145 (41%) | 185 (46%) | 230 (35%) | 330 (33%) | 390 (35%) |
| totalTitles | 417 | 4 (35%) | 4 (43%) | 7 (35%) | 20 (35%) | 36 (42%) |
| leagueTitles | 381 | 1 (46%) | 2 (35%) | 2 (38%) | 6 (35%) | 9 (43%) |
| continentalTitles | 78 | fora | fora | 1 (33%) | 2 (37%) | 3 (51%) |
| cupTitles | 401 | 1 (42%) | 1 (49%) | 2 (37%) | 5 (39%) | 8 (45%) |
| longestStay | 345 | 10 (40%) | 10 (37%) | 10 (33%) | 10 (45%) | 12 (36%) |
| firstClubGames | 339 | 34 (35%) | 46 (29%) | 46 (35%) | 85 (35%) | 130 (35%) |
| clubLegend | 169 | fora | 1 (19%) | 1 (32%) | 1 (54%) | fora |
| twoClubIdol | 56 | fora | fora | 2 (26%) | 2 (49%) | fora |
| peakFans | 421 | 80 (31%) | 80 (43%) | 85 (41%) | 100 (36%) | 100 (63%) |
| clubs | 318 | 4 (45%) | 5 (26%) | 5 (25%) | 5 (32%) | 5 (29%) |
| countries | 355 | 3 (45%) | 4 (24%) | 4 (22%) | 4 (30%) | 4 (30%) |
| seasonsAbroad | 412 | 14 (30%) | 14 (32%) | 14 (36%) | 16 (29%) | 16 (38%) |
| titleCountries | 367 | 1 (46%) | 1 (51%) | 2 (24%) | 2 (44%) | 2 (58%) |
| peakOvr | 428 | 70 (43%) | 80 (25%) | 85 (32%) | 95 (37%) | fora |
| bestJump | 379 | 4 (50%) | 5 (30%) | 5 (46%) | 6 (30%) | 6 (45%) |
| ovrAt21 | 386 | 60 (43%) | 65 (25%) | 65 (51%) | 70 (40%) | 75 (38%) |
| eliteSeasons | 71 | fora | fora | 1 (32%) | 11 (33%) | 14 (35%) |
| underdogTitles | 391 | 3 (40%) | 3 (42%) | 3 (29%) | 2 (46%) | 2 (46%) |
| promotions | 400 | 2 (38%) | 2 (39%) | 2 (34%) | 2 (29%) | 2 (23%) |
| underdogStar | 393 | 8 (30%) | 8 (34%) | 8 (26%) | 6 (42%) | 6 (35%) |
| underdogPodiums | 397 | 3 (40%) | 3 (41%) | 3 (33%) | 2 (42%) | 2 (44%) |
| caps | 453 | 1 (15%) | 12 (35%) | 95 (37%) | 140 (35%) | 170 (31%) |
| nationalGoals | 130 | fora | 1 (31%) | 6 (33%) | 14 (31%) | 25 (36%) |
| tournaments | 227 | fora | 1 (33%) | 4 (31%) | 6 (27%) | 7 (31%) |
| worldCupRun | 205 | fora | 2 (20%) | 3 (33%) | 4 (42%) | 5 (38%) |
| seasons | 397 | 22 (16%) | 22 (27%) | 22 (30%) | 22 (40%) | 22 (48%) |
| totalGames | 397 | 480 (32%) | 570 (36%) | 680 (36%) | 850 (34%) | 1010 (34%) |
| lateGames | 410 | 85 (35%) | 105 (36%) | 125 (33%) | 160 (34%) | 185 (39%) |
| lastAge | 386 | 37 (16%) | 37 (27%) | 37 (30%) | 37 (40%) | 37 (48%) |
| ballonPodiums | 21 | fora | fora | fora | 1 (25%) | 4 (29%) |
| awardsTotal | 439 | 2 (30%) | 3 (35%) | 5 (32%) | 18 (36%) | 37 (38%) |
| scoringAwards | 38 | fora | fora | 1 (22%) | 1 (28%) | 2 (32%) |
| goldenGloves | 1 | fora | fora | 4 (35%) | 10 (30%) | 12 (25%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 73% |
| fourClubs | 366 | 26% |
| noRelegation | 365 | 56% |
| noGiants | 365 | 38% |
| minGames | 365 | 26% |
| stayThree | 365 | 45% |
| noBigFive | 365 | 76% |
| noLoans | 365 | 23% |
| noBench | 364 | 58% |
| noSecondDivision | 364 | 66% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
