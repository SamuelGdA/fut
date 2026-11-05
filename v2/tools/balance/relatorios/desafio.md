# Desafio do dia

Motor 2.0.0-m43, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.
Equilibrada, ambiciosa e fiel têm o mesmo peso na amostra e nas tentativas. Nenhuma consulta a missão ou o édito para escolher.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 157 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 1.09 |

## Tentativas de jogadores comuns

360 tentativas em 120 dias. Pontuação: mediana 442, percentil 90 776, máxima 877. Édito intacto em 55% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 1.09.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1215 | 132 | 400 | 1.14 |
| Promissor | 873 | 81 | 606 | 1.16 |
| Craque | 433 | 51 | 582 | 0.94 |
| Estrela | 133 | 18 | 408 | 1.11 |
| Fenômeno | 996 | 78 | 366 | 1.00 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 241 | 110 (33%) | 150 (31%) | 195 (30%) | 240 (38%) | 330 (37%) |
| seasonGoals | 198 | 18 (32%) | 21 (31%) | 25 (32%) | 30 (27%) | 38 (33%) |
| contributions | 313 | 170 (36%) | 220 (32%) | 280 (30%) | 350 (36%) | 480 (36%) |
| cleanSheets | 148 | 165 (32%) | 200 (37%) | 250 (36%) | 320 (31%) | 410 (37%) |
| totalTitles | 382 | 4 (24%) | 5 (28%) | 7 (33%) | 16 (26%) | 32 (37%) |
| leagueTitles | 361 | 1 (40%) | 2 (28%) | 3 (27%) | 5 (28%) | 9 (34%) |
| continentalTitles | 161 | fora | fora | 1 (20%) | 1 (38%) | 3 (34%) |
| cupTitles | 379 | 1 (28%) | 1 (43%) | 2 (33%) | 5 (23%) | 8 (33%) |
| longestStay | 327 | 13 (34%) | 13 (34%) | 13 (35%) | 14 (36%) | 17 (35%) |
| firstClubGames | 336 | 24 (36%) | 25 (28%) | 22 (36%) | 38 (32%) | 90 (32%) |
| clubLegend | 265 | 1 (34%) | 1 (42%) | 1 (45%) | fora | fora |
| twoClubIdol | 110 | fora | fora | fora | 2 (27%) | 2 (42%) |
| peakFans | 308 | 85 (30%) | 90 (37%) | 100 (29%) | 100 (44%) | fora |
| clubs | 296 | 5 (34%) | 5 (41%) | 6 (23%) | 6 (26%) | 5 (44%) |
| countries | 353 | 3 (54%) | 4 (30%) | 4 (43%) | 4 (44%) | 4 (41%) |
| seasonsAbroad | 405 | 16 (47%) | 17 (43%) | 18 (32%) | 18 (32%) | 18 (36%) |
| titleCountries | 365 | 1 (40%) | 1 (45%) | 2 (22%) | 2 (32%) | 2 (45%) |
| peakOvr | 436 | 70 (48%) | 80 (15%) | 85 (30%) | 90 (36%) | 95 (57%) |
| bestJump | 365 | 4 (26%) | 5 (11%) | 5 (28%) | 5 (50%) | 6 (19%) |
| ovrAt21 | 375 | 60 (50%) | 65 (31%) | 70 (14%) | 75 (20%) | 80 (33%) |
| eliteSeasons | 164 | fora | fora | 1 (30%) | 11 (25%) | 15 (35%) |
| underdogTitles | 383 | 3 (26%) | 4 (23%) | 3 (33%) | 3 (38%) | 4 (24%) |
| promotions | 390 | 2 (50%) | 2 (48%) | 2 (41%) | 2 (31%) | 2 (29%) |
| underdogStar | 389 | 11 (35%) | 11 (38%) | 10 (32%) | 8 (36%) | 6 (30%) |
| underdogPodiums | 384 | 2 (42%) | 3 (38%) | 3 (28%) | 3 (29%) | 3 (25%) |
| caps | 433 | 1 (10%) | 17 (30%) | 110 (28%) | 155 (30%) | 185 (36%) |
| nationalGoals | 158 | fora | 1 (29%) | 8 (32%) | 21 (37%) | 40 (35%) |
| tournaments | 278 | fora | 1 (30%) | 4 (40%) | 6 (36%) | 8 (39%) |
| worldCupRun | 259 | fora | 2 (19%) | 3 (38%) | 5 (31%) | 6 (39%) |
| seasons | 239 | 22 (32%) | 22 (46%) | fora | fora | fora |
| totalGames | 405 | 520 (33%) | 620 (34%) | 740 (28%) | 870 (28%) | 1020 (37%) |
| lateGames | 411 | 95 (38%) | 140 (28%) | 160 (26%) | 170 (28%) | 195 (29%) |
| lastAge | 217 | 37 (32%) | 37 (46%) | fora | fora | fora |
| ballonPodiums | 83 | fora | fora | fora | fora | 1 (26%) |
| awardsTotal | 421 | 3 (28%) | 5 (31%) | 9 (27%) | 17 (28%) | 32 (36%) |
| scoringAwards | 196 | 1 (27%) | 1 (32%) | 2 (26%) | 3 (28%) | 5 (35%) |
| goldenGloves | 16 | fora | 1 (29%) | 6 (43%) | 11 (38%) | 14 (29%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 74% |
| fourClubs | 366 | 43% |
| noRelegation | 365 | 61% |
| noGiants | 365 | 28% |
| minGames | 365 | 16% |
| stayThree | 365 | 29% |
| noBigFive | 365 | 45% |
| noLoans | 365 | 11% |
| noBench | 364 | 43% |
| noSecondDivision | 364 | 67% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
