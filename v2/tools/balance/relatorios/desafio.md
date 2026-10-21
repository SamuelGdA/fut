# Desafio do dia

Motor 2.0.0-m23, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.
Equilibrada, ambiciosa e fiel têm o mesmo peso na amostra e nas tentativas. Nenhuma consulta a missão ou o édito para escolher.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 161 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 0.97 |

## Tentativas de jogadores comuns

360 tentativas em 120 dias. Pontuação: mediana 592, percentil 90 779, máxima 918. Édito intacto em 58% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 0.97.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1621 | 159 | 614 | 0.93 |
| Promissor | 1216 | 111 | 621 | 1.09 |
| Craque | 570 | 60 | 492 | 0.80 |
| Estrela | 179 | 27 | 638 | 1.07 |
| Fenômeno | 64 | 3 | 426 | 1.00 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 250 | 85 (34%) | 110 (33%) | 135 (33%) | 165 (35%) | 250 (32%) |
| seasonGoals | 205 | 14 (32%) | 16 (38%) | 18 (32%) | 21 (34%) | 29 (36%) |
| contributions | 329 | 155 (32%) | 195 (36%) | 240 (31%) | 290 (34%) | 380 (35%) |
| cleanSheets | 160 | 155 (26%) | 185 (39%) | 230 (43%) | 280 (40%) | 380 (31%) |
| totalTitles | 412 | 3 (43%) | 4 (44%) | 5 (43%) | 11 (33%) | 27 (35%) |
| leagueTitles | 385 | 1 (35%) | 1 (46%) | 2 (38%) | 4 (33%) | 8 (33%) |
| continentalTitles | 82 | fora | fora | 1 (16%) | 1 (31%) | 2 (40%) |
| cupTitles | 404 | 1 (33%) | 1 (50%) | 2 (32%) | 4 (28%) | 7 (36%) |
| longestStay | 326 | 13 (31%) | 13 (35%) | 12 (36%) | 14 (35%) | 17 (35%) |
| firstClubGames | 327 | 24 (38%) | 24 (36%) | 26 (28%) | 34 (32%) | 85 (36%) |
| clubLegend | 342 | 1 (35%) | 1 (42%) | 1 (45%) | fora | fora |
| twoClubIdol | 64 | fora | fora | 2 (14%) | 2 (27%) | 2 (39%) |
| peakFans | 417 | 85 (29%) | 90 (24%) | 95 (29%) | 100 (38%) | fora |
| clubs | 303 | 5 (25%) | 5 (37%) | 5 (47%) | 6 (29%) | 6 (30%) |
| countries | 364 | 4 (17%) | 4 (25%) | 4 (37%) | 4 (40%) | 4 (38%) |
| seasonsAbroad | 420 | 16 (28%) | 16 (38%) | 16 (41%) | 17 (38%) | 17 (33%) |
| titleCountries | 372 | 1 (35%) | 1 (46%) | 1 (56%) | 2 (31%) | 2 (42%) |
| peakOvr | 310 | 70 (36%) | fora | 85 (20%) | 90 (26%) | 95 (49%) |
| bestJump | 395 | 4 (24%) | 5 (14%) | 5 (33%) | 5 (46%) | 6 (18%) |
| ovrAt21 | 340 | 60 (48%) | 65 (28%) | fora | 70 (43%) | 75 (38%) |
| eliteSeasons | 76 | fora | fora | 1 (20%) | 9 (32%) | 13 (34%) |
| underdogTitles | 396 | 3 (36%) | 4 (32%) | 3 (41%) | 3 (41%) | 3 (40%) |
| promotions | 405 | 2 (45%) | 2 (50%) | 2 (42%) | 2 (36%) | 2 (26%) |
| underdogStar | 396 | 10 (32%) | 11 (35%) | 9 (38%) | 8 (36%) | 6 (37%) |
| underdogPodiums | 402 | 2 (39%) | 3 (41%) | 3 (36%) | 3 (39%) | 3 (37%) |
| caps | 235 | fora | 10 (31%) | 90 (34%) | 140 (30%) | 165 (33%) |
| nationalGoals | 131 | fora | 1 (27%) | 5 (31%) | 13 (34%) | 25 (34%) |
| tournaments | 233 | fora | 1 (27%) | 4 (31%) | 6 (25%) | 7 (32%) |
| worldCupRun | 205 | fora | 2 (13%) | 3 (32%) | 4 (40%) | 5 (41%) |
| seasons | 405 | 21 (21%) | 21 (37%) | 21 (48%) | 22 (21%) | 22 (21%) |
| totalGames | 403 | 500 (35%) | 590 (32%) | 680 (39%) | 810 (33%) | 950 (35%) |
| lateGames | 421 | 85 (34%) | 110 (36%) | 120 (39%) | 135 (40%) | 160 (31%) |
| lastAge | 389 | 36 (21%) | 36 (37%) | 36 (48%) | 37 (21%) | 37 (21%) |
| ballonPodiums | 6 | fora | fora | fora | fora | 1 (21%) |
| awardsTotal | 430 | 2 (33%) | 4 (36%) | 7 (35%) | 14 (35%) | 27 (38%) |
| scoringAwards | 208 | 1 (16%) | 1 (21%) | 1 (21%) | 1 (29%) | 2 (30%) |
| goldenGloves | 2 | fora | fora | 1 (48%) | 6 (29%) | 11 (38%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 62% |
| fourClubs | 366 | 41% |
| noRelegation | 365 | 60% |
| noGiants | 365 | 26% |
| minGames | 365 | 21% |
| stayThree | 365 | 38% |
| noBigFive | 365 | 45% |
| noLoans | 365 | 10% |
| noBench | 364 | 38% |
| noSecondDivision | 364 | 71% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
