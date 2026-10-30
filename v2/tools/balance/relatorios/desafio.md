# Desafio do dia

Motor 2.0.0-m25, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.
Equilibrada, ambiciosa e fiel têm o mesmo peso na amostra e nas tentativas. Nenhuma consulta a missão ou o édito para escolher.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 161 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 0.94 |

## Tentativas de jogadores comuns

360 tentativas em 120 dias. Pontuação: mediana 592, percentil 90 778, máxima 885. Édito intacto em 57% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 0.94.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1621 | 159 | 620 | 0.92 |
| Promissor | 1216 | 111 | 555 | 0.95 |
| Craque | 570 | 60 | 539 | 0.80 |
| Estrela | 179 | 27 | 634 | 1.26 |
| Fenômeno | 64 | 3 | 355 | 1.33 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 239 | 90 (33%) | 115 (32%) | 145 (32%) | 180 (33%) | 250 (37%) |
| seasonGoals | 203 | 14 (37%) | 17 (34%) | 19 (30%) | 22 (33%) | 30 (33%) |
| contributions | 323 | 160 (34%) | 210 (34%) | 260 (32%) | 310 (34%) | 410 (36%) |
| cleanSheets | 154 | 160 (29%) | 195 (31%) | 230 (48%) | 300 (38%) | 400 (26%) |
| totalTitles | 400 | 4 (32%) | 5 (35%) | 6 (38%) | 13 (38%) | 29 (33%) |
| leagueTitles | 373 | 1 (41%) | 2 (30%) | 2 (39%) | 4 (38%) | 8 (34%) |
| continentalTitles | 84 | fora | fora | 1 (19%) | 1 (39%) | 2 (43%) |
| cupTitles | 390 | 1 (36%) | 2 (27%) | 2 (36%) | 4 (37%) | 8 (32%) |
| longestStay | 324 | 13 (30%) | 13 (33%) | 12 (35%) | 14 (33%) | 16 (33%) |
| firstClubGames | 330 | 24 (38%) | 24 (34%) | 25 (30%) | 34 (31%) | 95 (35%) |
| clubLegend | 334 | 1 (35%) | 1 (40%) | 1 (43%) | fora | fora |
| twoClubIdol | 22 | fora | fora | fora | 2 (25%) | 2 (40%) |
| peakFans | 408 | 85 (35%) | 90 (38%) | 95 (34%) | 100 (51%) | fora |
| clubs | 298 | 5 (24%) | 5 (37%) | 5 (46%) | 6 (24%) | 5 (46%) |
| countries | 348 | 3 (47%) | 4 (26%) | 4 (35%) | 4 (40%) | 4 (40%) |
| seasonsAbroad | 407 | 16 (28%) | 16 (42%) | 17 (33%) | 17 (38%) | 17 (33%) |
| titleCountries | 362 | 1 (41%) | 1 (51%) | 2 (18%) | 2 (33%) | 2 (47%) |
| peakOvr | 436 | 70 (46%) | 80 (17%) | 85 (31%) | 90 (40%) | 95 (54%) |
| bestJump | 358 | 4 (28%) | 5 (18%) | 5 (42%) | fora | 6 (19%) |
| ovrAt21 | 320 | 60 (48%) | 65 (30%) | fora | 70 (47%) | 80 (27%) |
| eliteSeasons | 77 | fora | fora | 1 (31%) | 10 (32%) | 14 (31%) |
| underdogTitles | 381 | 3 (43%) | 4 (30%) | 4 (32%) | 3 (42%) | 4 (33%) |
| promotions | 392 | 2 (44%) | 3 (19%) | 2 (43%) | 2 (34%) | 2 (25%) |
| underdogStar | 386 | 10 (34%) | 11 (35%) | 9 (35%) | 8 (36%) | 6 (38%) |
| underdogPodiums | 390 | 3 (30%) | 3 (40%) | 3 (37%) | 3 (38%) | 3 (35%) |
| caps | 441 | 1 (15%) | 21 (34%) | 105 (35%) | 145 (30%) | 170 (32%) |
| nationalGoals | 131 | fora | 1 (35%) | 7 (35%) | 16 (33%) | 27 (33%) |
| tournaments | 225 | fora | 1 (34%) | 4 (38%) | 6 (33%) | 7 (35%) |
| worldCupRun | 203 | fora | 2 (18%) | 3 (40%) | 5 (26%) | 6 (33%) |
| seasons | 395 | 21 (24%) | 21 (40%) | 22 (22%) | 22 (25%) | 22 (25%) |
| totalGames | 394 | 520 (31%) | 610 (31%) | 720 (34%) | 840 (35%) | 980 (33%) |
| lateGames | 403 | 95 (35%) | 120 (36%) | 135 (37%) | 150 (37%) | 170 (31%) |
| lastAge | 380 | 36 (24%) | 36 (40%) | 37 (22%) | 37 (25%) | 37 (25%) |
| ballonPodiums | 6 | fora | fora | fora | fora | 1 (29%) |
| awardsTotal | 418 | 3 (30%) | 5 (40%) | 8 (37%) | 16 (38%) | 29 (33%) |
| scoringAwards | 201 | 1 (18%) | 1 (20%) | 1 (24%) | 1 (26%) | 2 (33%) |
| goldenGloves | 14 | fora | 1 (19%) | 5 (52%) | 10 (43%) | 13 (29%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 65% |
| fourClubs | 366 | 40% |
| noRelegation | 365 | 60% |
| noGiants | 365 | 29% |
| minGames | 365 | 18% |
| stayThree | 365 | 28% |
| noBigFive | 365 | 50% |
| noLoans | 365 | 10% |
| noBench | 364 | 37% |
| noSecondDivision | 364 | 70% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
