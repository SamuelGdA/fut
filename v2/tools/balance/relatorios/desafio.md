# Desafio do dia

Motor 2.0.0-m15, semente `balanco-m2`. 3650 dias a partir de 2026-01-01.

O alvo de cada missão depende da faixa de talento do jogador do dia e é o percentil 65 de carreiras comuns com as regras do desafio (Difícil, Normal, aposentar a partir dos 27): o jogo comum cumpre cerca de um terço, e quem persegue a missão cumpre bem mais. Recalibrar: `pnpm desafio:calibrar`.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Mão do dia válida em 3650 dias seguidos (invariante 21) | 100% | 100.0% |
| ✓ | Toda missão aparece em alguma mão | 37 de 37 | 37 de 37 |
| ✓ | Missões cumpridas pelo jogo comum, por faixa de talento (alvo no percentil 65) | 15% a 55% em toda célula com 30+ carreiras (mais a tolerância da amostra) | 162 células, todas dentro |
| ✓ | Todo édito tem dente e dá para cumprir: quebra pelo jogo comum | 10% a 75% | 10 éditos dentro |
| ✓ | Missões cheias por tentativa típica (perto de uma cheia e uma parcial) | 0,6 a 1,6 | 0.96 |

## Tentativas de jogadores comuns

80 tentativas em 40 dias. Pontuação: mediana 457, percentil 90 765, máxima 993. Édito intacto em 49% (o jogo comum não presta atenção nele). Missões cheias por tentativa: 0.96.

| Faixa do dia | Dias em 10 anos | Tentativas | Pontuação (mediana) | Missões cheias |
|---|---:|---:|---:|---:|
| Operário | 1621 | 32 | 400 | 0.94 |
| Promissor | 1216 | 24 | 486 | 1.13 |
| Craque | 570 | 12 | 618 | 0.33 |
| Estrela | 179 | 12 | 469 | 1.33 |
| Fenômeno | 64 | 0 | n/d | n/d |

## Alvos e cumprimento por missão

| Missão | Mãos | Operário | Promissor | Craque | Estrela | Fenômeno |
|---|---:|---:|---:|---:|---:|---:|
| careerGoals | 247 | 80 (31%) | 95 (40%) | 125 (30%) | 185 (35%) | 260 (44%) |
| seasonGoals | 208 | 14 (30%) | 15 (45%) | 18 (27%) | 24 (38%) | 29 (48%) |
| contributions | 331 | 145 (35%) | 165 (41%) | 210 (32%) | 290 (34%) | 420 (39%) |
| cleanSheets | 156 | 145 (38%) | 185 (48%) | 230 (38%) | 330 (35%) | 390 (33%) |
| totalTitles | 417 | 4 (29%) | 4 (46%) | 7 (35%) | 20 (35%) | 36 (44%) |
| leagueTitles | 381 | 1 (42%) | 2 (37%) | 2 (40%) | 6 (34%) | 9 (43%) |
| continentalTitles | 78 | fora | fora | 1 (31%) | 2 (38%) | 3 (55%) |
| cupTitles | 401 | 1 (40%) | 1 (52%) | 2 (38%) | 5 (37%) | 8 (45%) |
| longestStay | 345 | 10 (39%) | 10 (37%) | 10 (36%) | 10 (46%) | 12 (36%) |
| firstClubGames | 339 | 34 (33%) | 46 (26%) | 46 (34%) | 85 (33%) | 130 (32%) |
| clubLegend | 169 | fora | 1 (21%) | 1 (28%) | 1 (55%) | fora |
| twoClubIdol | 56 | fora | fora | 2 (28%) | 2 (49%) | fora |
| peakFans | 421 | 80 (30%) | 80 (40%) | 85 (37%) | 100 (38%) | 100 (64%) |
| clubs | 318 | 4 (47%) | 5 (32%) | 5 (28%) | 5 (32%) | 5 (27%) |
| countries | 355 | 3 (52%) | 4 (22%) | 4 (24%) | 4 (28%) | 4 (32%) |
| seasonsAbroad | 412 | 14 (33%) | 14 (28%) | 14 (37%) | 16 (28%) | 16 (35%) |
| titleCountries | 367 | 1 (42%) | 1 (56%) | 2 (22%) | 2 (43%) | 2 (57%) |
| peakOvr | 428 | 70 (43%) | 80 (28%) | 85 (32%) | 95 (38%) | fora |
| bestJump | 379 | 4 (50%) | 5 (31%) | 5 (48%) | 6 (33%) | 6 (41%) |
| ovrAt21 | 386 | 60 (46%) | 65 (27%) | 65 (50%) | 70 (39%) | 75 (40%) |
| eliteSeasons | 71 | fora | fora | 1 (32%) | 11 (33%) | 14 (38%) |
| underdogTitles | 391 | 3 (34%) | 3 (48%) | 3 (32%) | 2 (43%) | 2 (49%) |
| promotions | 400 | 2 (33%) | 2 (35%) | 2 (32%) | 2 (34%) | 2 (22%) |
| underdogStar | 393 | 8 (28%) | 8 (35%) | 8 (25%) | 6 (43%) | 6 (36%) |
| underdogPodiums | 397 | 3 (40%) | 3 (46%) | 3 (36%) | 2 (42%) | 2 (43%) |
| caps | 453 | 1 (14%) | 12 (35%) | 95 (38%) | 140 (34%) | 170 (33%) |
| nationalGoals | 130 | fora | 1 (29%) | 6 (33%) | 14 (29%) | 25 (45%) |
| tournaments | 227 | fora | 1 (33%) | 4 (33%) | 6 (25%) | 7 (33%) |
| worldCupRun | 205 | fora | 2 (18%) | 3 (36%) | 4 (39%) | 5 (40%) |
| seasons | 397 | 22 (20%) | 22 (28%) | 22 (28%) | 22 (40%) | 22 (47%) |
| totalGames | 397 | 480 (31%) | 570 (41%) | 680 (39%) | 850 (34%) | 1010 (33%) |
| lateGames | 410 | 85 (37%) | 105 (39%) | 125 (31%) | 160 (32%) | 185 (38%) |
| lastAge | 386 | 37 (20%) | 37 (28%) | 37 (28%) | 37 (40%) | 37 (47%) |
| ballonPodiums | 21 | fora | fora | fora | 1 (25%) | 4 (30%) |
| awardsTotal | 439 | 2 (29%) | 3 (39%) | 5 (30%) | 18 (37%) | 37 (41%) |
| scoringAwards | 38 | fora | fora | 1 (25%) | 1 (30%) | 2 (42%) |
| goldenGloves | 1 | fora | fora | 4 (20%) | 10 (40%) | 12 (30%) |

Cada célula: o alvo e, entre parênteses, quanto o jogo comum cumpriu. "fora": a missão não entra nas mãos daquela faixa.

## Éditos

| Édito | Mãos em 10 anos | Quebrado pelo jogo comum |
|---|---:|---:|
| homeContinent | 366 | 73% |
| fourClubs | 366 | 28% |
| noRelegation | 365 | 56% |
| noGiants | 365 | 38% |
| minGames | 365 | 27% |
| stayThree | 365 | 47% |
| noBigFive | 365 | 77% |
| noLoans | 365 | 23% |
| noBench | 364 | 59% |
| noSecondDivision | 364 | 65% |

A quebra é medida em todas as carreiras da amostra, contra todos os éditos: o jogo comum não presta atenção em édito nenhum.
