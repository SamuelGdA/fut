# Desafio do dia

Motor 2.0.0-m8.2, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 36 de 36 | 36 de 36 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 156 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 0.98 |

## Tentativas de jogadores comuns

240 tentativas em 120 dias. Pontuação: mediana 410, percentil 90 788, máxima 875. Édito intacto em 53% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 0.98.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1695 | 112 | 428 | 0.96 |
| Promissor | 1244 | 68 | 401 | 1.07 |
| Craque | 537 | 42 | 373 | 0.83 |
| Estrela | 135 | 16 | 532 | 1.13 |
| Fenômeno | 39 | 2 | 632 | 1.50 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 265 | 85 (31%) | 100 (30%) | 110 (34%) | 155 (34%) | 230 (33%) |
| seasonGoals | 217 | 14 (29%) | 16 (31%) | 17 (34%) | 23 (33%) | 27 (40%) |
| contributions | 360 | 135 (34%) | 170 (34%) | 180 (35%) | 240 (34%) | 340 (35%) |
| cleanSheets | 180 | 145 (25%) | 170 (35%) | 200 (39%) | 270 (28%) | 370 (34%) |
| totalTitles | 426 | 3 (40%) | 4 (37%) | 5 (35%) | 10 (28%) | 21 (39%) |
| leagueTitles | 432 | 1 (34%) | 2 (30%) | 2 (35%) | 3 (38%) | 7 (38%) |
| continentalTitles | 68 | fora | fora | 1 (20%) | 1 (28%) | 2 (40%) |
| cupTitles | 418 | 1 (37%) | 1 (42%) | 2 (23%) | 3 (28%) | 6 (39%) |
| longestStay | 372 | 10 (45%) | 10 (37%) | 10 (41%) | 10 (40%) | 12 (28%) |
| firstClubGames | 362 | 35 (33%) | 39 (30%) | 43 (28%) | 80 (32%) | 115 (37%) |
| idolSeasons | 446 | 5 (33%) | 5 (34%) | 5 (38%) | 7 (27%) | 10 (33%) |
| peakFans | 429 | 80 (31%) | 80 (36%) | 85 (30%) | 90 (30%) | 100 (39%) |
| clubs | 330 | 4 (43%) | 5 (26%) | 5 (27%) | 5 (28%) | 5 (23%) |
| countries | 374 | 3 (42%) | 3 (54%) | 4 (21%) | 4 (22%) | 4 (23%) |
| seasonsAbroad | 459 | 14 (29%) | 14 (36%) | 14 (41%) | 16 (27%) | 16 (35%) |
| titleCountries | 373 | 1 (34%) | 1 (49%) | 1 (51%) | 2 (18%) | 2 (41%) |
| peakOvr | 521 | 70 (20%) | 75 (31%) | 80 (34%) | 85 (35%) | 90 (44%) |
| bestJump | 182 | fora | 4 (33%) | fora | 5 (29%) | 5 (34%) |
| ovrAt21 | 313 | 60 (27%) | fora | 65 (39%) | 70 (31%) | 75 (31%) |
| eliteSeasons | 23 | fora | fora | fora | 3 (33%) | 12 (33%) |
| underdogTitles | 447 | 3 (34%) | 3 (36%) | 3 (35%) | 2 (38%) | 2 (40%) |
| promotions | 439 | 2 (33%) | 2 (39%) | 2 (31%) | 2 (29%) | 2 (17%) |
| underdogStar | 417 | 7 (38%) | 9 (30%) | 8 (34%) | 7 (32%) | 6 (38%) |
| underdogPodiums | 419 | 3 (33%) | 3 (39%) | 3 (35%) | 2 (42%) | 2 (43%) |
| caps | 217 | fora | 1 (26%) | 37 (33%) | 120 (34%) | 155 (34%) |
| nationalGoals | 148 | fora | 1 (16%) | 1 (33%) | 8 (33%) | 20 (33%) |
| tournaments | 209 | fora | 1 (18%) | 2 (32%) | 5 (24%) | 6 (34%) |
| worldCupRun | 61 | fora | fora | 2 (24%) | 4 (22%) | 5 (27%) |
| seasons | 189 | fora | 22 (25%) | 22 (23%) | 22 (30%) | 22 (33%) |
| totalGames | 455 | 450 (35%) | 530 (33%) | 590 (40%) | 740 (32%) | 910 (33%) |
| lateGames | 486 | 75 (38%) | 90 (35%) | 100 (33%) | 115 (38%) | 140 (32%) |
| lastAge | 192 | fora | 37 (25%) | 37 (23%) | 37 (30%) | 37 (33%) |
| ballonPodiums | 5 | fora | fora | fora | fora | 1 (33%) |
| awardsTotal | 490 | 1 (43%) | 2 (36%) | 3 (38%) | 8 (28%) | 21 (33%) |
| scoringAwards | 223 | 1 (16%) | 1 (17%) | 1 (18%) | 1 (31%) | 2 (32%) |
| goldenGloves | 3 | fora | fora | fora | 5 (10%) | 10 (30%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 67% |
| fourClubs | 366 | 23% |
| noRelegation | 365 | 62% |
| noGiants | 365 | 23% |
| minGames | 365 | 32% |
| stayThree | 365 | 45% |
| noBigFive | 365 | 67% |
| noLoans | 365 | 22% |
| noBench | 364 | 64% |
| noSecondDivision | 364 | 75% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
