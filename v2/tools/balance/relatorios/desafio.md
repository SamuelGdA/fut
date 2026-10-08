# Desafio do dia

Motor 2.0.0-m8.4, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 160 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 1.00 |

## Tentativas de jogadores comuns

240 tentativas em 120 dias. Pontuação: mediana 403, percentil 90 781, máxima 906. Édito intacto em 53% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 1.00.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1695 | 112 | 389 | 0.89 |
| Promissor | 1244 | 68 | 405 | 1.16 |
| Craque | 537 | 42 | 408 | 0.79 |
| Estrela | 135 | 16 | 697 | 1.50 |
| Fenômeno | 39 | 2 | 648 | 1.50 |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 262 | 80 (34%) | 100 (30%) | 115 (35%) | 160 (36%) | 240 (33%) |
| seasonGoals | 215 | 14 (28%) | 16 (31%) | 18 (33%) | 22 (36%) | 28 (38%) |
| contributions | 342 | 135 (37%) | 165 (35%) | 195 (32%) | 270 (32%) | 370 (32%) |
| cleanSheets | 165 | 150 (24%) | 170 (38%) | 210 (28%) | 290 (18%) | 370 (33%) |
| totalTitles | 430 | 3 (38%) | 4 (35%) | 6 (29%) | 11 (24%) | 25 (35%) |
| leagueTitles | 394 | 1 (37%) | 2 (29%) | 2 (32%) | 4 (28%) | 7 (39%) |
| continentalTitles | 67 | fora | fora | 1 (20%) | 1 (33%) | 3 (30%) |
| cupTitles | 418 | 1 (38%) | 1 (43%) | 2 (24%) | 3 (26%) | 6 (40%) |
| longestStay | 358 | 10 (45%) | 10 (38%) | 10 (41%) | 10 (43%) | 12 (29%) |
| firstClubGames | 355 | 34 (34%) | 38 (32%) | 40 (30%) | 80 (38%) | 110 (37%) |
| clubLegend | 168 | fora | 1 (18%) | 1 (18%) | 1 (33%) | fora |
| twoClubIdol | 19 | fora | fora | fora | 2 (29%) | 2 (53%) |
| peakFans | 440 | 80 (33%) | 80 (36%) | 85 (29%) | 90 (29%) | 100 (39%) |
| clubs | 329 | 4 (42%) | 5 (24%) | 5 (28%) | 5 (28%) | 5 (27%) |
| countries | 370 | 3 (45%) | 3 (56%) | 4 (25%) | 4 (26%) | 4 (25%) |
| seasonsAbroad | 423 | 14 (29%) | 14 (35%) | 14 (48%) | 16 (30%) | 16 (33%) |
| titleCountries | 379 | 1 (37%) | 1 (47%) | 1 (46%) | 2 (20%) | 2 (45%) |
| peakOvr | 469 | 70 (25%) | 75 (37%) | 80 (38%) | 85 (39%) | 95 (33%) |
| bestJump | 403 | 4 (25%) | 4 (52%) | 5 (23%) | 5 (39%) | 5 (48%) |
| ovrAt21 | 402 | 60 (32%) | 65 (15%) | 65 (43%) | 70 (34%) | 75 (32%) |
| eliteSeasons | 11 | fora | fora | fora | 5 (30%) | 12 (34%) |
| underdogTitles | 410 | 3 (33%) | 3 (34%) | 3 (33%) | 2 (41%) | 2 (40%) |
| promotions | 411 | 2 (32%) | 2 (38%) | 2 (35%) | 2 (28%) | 2 (20%) |
| underdogStar | 406 | 7 (41%) | 9 (30%) | 8 (30%) | 7 (30%) | 6 (38%) |
| underdogPodiums | 413 | 3 (37%) | 3 (34%) | 4 (25%) | 3 (29%) | 2 (43%) |
| caps | 241 | fora | 1 (29%) | 47 (35%) | 130 (29%) | 160 (33%) |
| nationalGoals | 132 | fora | 1 (19%) | 1 (37%) | 9 (32%) | 21 (36%) |
| tournaments | 232 | fora | 1 (19%) | 2 (35%) | 5 (25%) | 6 (35%) |
| worldCupRun | 68 | fora | fora | 2 (25%) | 4 (25%) | 5 (29%) |
| seasons | 410 | 22 (15%) | 22 (26%) | 22 (28%) | 22 (35%) | 22 (35%) |
| totalGames | 420 | 460 (35%) | 540 (28%) | 610 (34%) | 770 (28%) | 930 (31%) |
| lateGames | 428 | 80 (33%) | 90 (38%) | 105 (35%) | 125 (35%) | 155 (31%) |
| lastAge | 402 | 37 (15%) | 37 (26%) | 37 (28%) | 37 (35%) | 37 (35%) |
| ballonPodiums | 3 | fora | fora | fora | fora | 1 (35%) |
| awardsTotal | 457 | 1 (44%) | 2 (35%) | 4 (28%) | 9 (31%) | 24 (34%) |
| scoringAwards | 97 | fora | 1 (18%) | 1 (18%) | 1 (36%) | 2 (32%) |
| goldenGloves | 1 | fora | fora | 1 (20%) | 6 (5%) | 11 (30%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 69% |
| fourClubs | 366 | 24% |
| noRelegation | 365 | 60% |
| noGiants | 365 | 24% |
| minGames | 365 | 30% |
| stayThree | 365 | 45% |
| noBigFive | 365 | 69% |
| noLoans | 365 | 23% |
| noBench | 364 | 64% |
| noSecondDivision | 364 | 73% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
