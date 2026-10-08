# Relatório do Técnico

Técnico 1.0.0, semente `tecnico-m1`, 16 carreiras automáticas (384 temporadas). **22 de 22 metas atendidas.**

Gerado por `pnpm balance:tecnico`. As sondas fazem contas exatas sobre o modelo (sem sorteio); as carreiras
jogam o mundo inteiro com uma política fixa (GDD 56.12). As mesmas sondas aparecem no laboratório.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Propostas iniciais: cada sorteio independente, 95% segunda divisão | 95% ± 0,5 ponto em 60 mil sorteios | 95.14% (pelo menos uma de 1ª em 13.9% das carreiras; esperado 14,3%) |
| ✓ | Filosofias: cada uma é a melhor em alguma faixa de força, nenhuma em todas | as quatro aparecem como melhor | defensiva, contra-ataque, posse, ofensiva |
| ✓ | Filosofias em forças iguais: diferença entre a melhor e a pior | no máximo 0,2 ponto por jogo | 0.053 |
| ✓ | Só o elenco decide: trocar os elencos de dois clubes troca as chances (nenhum bônus de continente) | erro abaixo de 1e-9 | 2.2e-16 |
| ✓ | Elite europeia × melhores do Brasil e da Argentina, mata-mata de jogo único | favorito passa em média entre 60% e 85%, nunca acima de 90% (difícil, mas possível) | média 79.9%, máximo 87.8% |
| ✓ | Contratar acima do próprio nível: quanto maior a diferença, mais difícil | mediana cai a cada degrau (resolução de 0,01 ponto); +8 abaixo de 5%; +12 ou mais abaixo de 0,5% | curvas em queda em todos os clubes |
| ✓ | Mbappé no Flamengo: quase impossível, não impossível | entre 0,001% e 0,1% | 0.0497% |
| ✓ | Desenvolver em jovens: ganho a mais na próxima atualização | pelo menos +1 de nível até 21 e de 22 a 25 anos | até 21: +1.93; 22 a 25: +1.21 |
| ✓ | Desenvolver perto do auge (26 a 29 anos, com folga): chance de o OVR subir | pelo menos 90% e 15 pontos acima de não desenvolver | 90.8% contra 69.0% |
| ✓ | Rápido = lento: evolução média numa temporada sem ações | diferença de no máximo 0,15 de nível | rápido 0.82, lento 0.78 |
| ✓ | Verba de início dá para contratar sem pedir dinheiro (clubes de 2ª divisão) | pelo menos 90% com 3 alvos do nível ao alcance | 98.2% (sem: ceara, deportes-concepcion, jaguares-de-cordoba, palermo) |
| ✓ | Comandos válidos da política nunca são recusados pelo motor | nenhum | nenhum |
| ✓ | Campeão da primeira divisão é o clube mais forte do começo da temporada | entre 35% e 60% | 57.7% |
| ✓ | Mundial de Clubes ganho por europeu (só pelo elenco, como os 17 dos últimos 18 da vida real) | entre 85% e 99% | 99.0% em 96 edições; final com sul-americano em 8.3% |
| ✓ | Intercontinental ganho pelo campeão europeu | entre 60% e 95% | 85.6% em 381 edições |
| ✓ | Elencos da IA estáveis: tamanho entre 22 e 34 | pelo menos 95% dos clubes em todas as temporadas | 99.1% (menor 17, maior 40) |
| ✓ | Jogadores ativos no mundo depois de todas as temporadas | a no máximo 10% do começo | 12619 → 13302 (+5.4%) |
| ✓ | Força média das primeiras divisões no fim, contra o começo | todas a no máximo 3 pontos | pior: liga-uruguaya -2.8 |
| ✓ | Lesões no elenco do treinador por temporada | entre 4 e 15, no máximo 10% graves | 5.8 por temporada, 8.6% graves, 169 dias |
| ✓ | Demissões por temporada com a política equilibrada | entre 8% e 15% | 13.5% em 192 temporadas (na primeira: 0.0%) |
| ✓ | Usar as ações vale a pena: objetivo cumprido, equilibrada contra passiva | equilibrada à frente | 46.4% contra 34.4% |
| ✓ | Negócio disponível cabe na verba e na folha (contratando em toda etapa, sem pedir verba) | pelo menos 70% das respostas positivas | 94.2% (49 de 52; 175 alvos procurados) |

## Filosofias

Pontos por jogo em campo neutro contra a mistura de abordagens que a IA escolhe pela força relativa.
A diferença de força vale para os quatro setores.

| Diferença | Ofensiva | Defensiva | Posse | Contra-ataque | Melhor |
|---:|---:|---:|---:|---:|---|
| -12 | 0.159 | 0.286 | 0.213 | 0.254 | Defensiva |
| -8 | 0.403 | 0.538 | 0.449 | 0.535 | Defensiva |
| -5 | 0.691 | 0.790 | 0.701 | 0.831 | Contra-ataque |
| -3 | 0.947 | 1.047 | 0.950 | 1.039 | Defensiva |
| 0 | 1.348 | 1.358 | 1.350 | 1.401 | Contra-ataque |
| +3 | 1.763 | 1.679 | 1.776 | 1.769 | Posse |
| +5 | 1.944 | 1.856 | 1.972 | 1.833 | Posse |
| +8 | 2.278 | 2.125 | 2.276 | 2.134 | Ofensiva |
| +12 | 2.623 | 2.441 | 2.601 | 2.475 | Ofensiva |

## Europa × América do Sul

Jogo de 90 minutos em campo neutro e chance de passar num mata-mata de jogo único (prorrogação e pênaltis).
A coluna "trocado" refaz a conta com os elencos trocados: o resultado inverte, porque só o elenco conta.

| Europeu | Força | Sul-americano | Força | Vitória | Empate | Derrota | Passa | Passa (trocado) |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| Barcelona | 86.7 | Flamengo | 80.9 | 56.2% | 23.6% | 20.3% | 70.1% | 29.9% |
| Barcelona | 86.7 | Palmeiras | 79.5 | 60.8% | 22.1% | 17.1% | 74.4% | 25.6% |
| Barcelona | 86.7 | River Plate | 76.9 | 73.9% | 16.6% | 9.5% | 85.1% | 14.9% |
| Barcelona | 86.7 | Boca Juniors | 76.3 | 74.2% | 16.4% | 9.3% | 85.4% | 14.6% |
| Real Madrid | 86.6 | Flamengo | 80.9 | 59.9% | 22.2% | 17.9% | 73.4% | 26.6% |
| Real Madrid | 86.6 | Palmeiras | 79.5 | 64.6% | 20.6% | 14.9% | 77.5% | 22.5% |
| Real Madrid | 86.6 | River Plate | 76.9 | 77.3% | 14.8% | 8.0% | 87.5% | 12.5% |
| Real Madrid | 86.6 | Boca Juniors | 76.3 | 77.6% | 14.6% | 7.8% | 87.8% | 12.2% |
| Arsenal | 86.4 | Flamengo | 80.9 | 58.1% | 23.3% | 18.6% | 72.1% | 27.9% |
| Arsenal | 86.4 | Palmeiras | 79.5 | 62.7% | 21.7% | 15.6% | 76.2% | 23.8% |
| Arsenal | 86.4 | River Plate | 76.9 | 75.3% | 16.0% | 8.6% | 86.3% | 13.7% |
| Arsenal | 86.4 | Boca Juniors | 76.3 | 75.7% | 15.9% | 8.4% | 86.6% | 13.4% |
| Manchester City | 85.7 | Flamengo | 80.9 | 56.2% | 23.5% | 20.3% | 70.1% | 29.9% |
| Manchester City | 85.7 | Palmeiras | 79.5 | 60.9% | 22.0% | 17.1% | 74.4% | 25.6% |
| Manchester City | 85.7 | River Plate | 76.9 | 74.3% | 16.3% | 9.4% | 85.3% | 14.7% |
| Manchester City | 85.7 | Boca Juniors | 76.3 | 74.6% | 16.2% | 9.2% | 85.6% | 14.4% |

## Dificuldade de contratar

Mediana da chance de o negócio existir (o jogador querer e o clube liberar), por diferença entre o OVR do alvo
e a força do comprador. Entre parênteses, quantos jogadores do mundo (até 31 anos) há naquele degrau.

| Comprador | Força | -2 | 0 | +2 | +4 | +6 | +8 | +10 | +12 | +15 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Real Madrid | 86.6 | 75.5% (22) | 67.7% (10) | 55.1% (5) | 32.1% (1) | - | - | - | - | - |
| Flamengo | 80.9 | 56.4% (111) | 72.3% (72) | 52.5% (35) | 27.8% (22) | 16.1% (11) | 0.869% (6) | 0.084% (2) | - | - |
| Mirassol | 76.2 | 40.3% (327) | 57.9% (267) | 27.7% (195) | 7.3% (101) | 1.8% (42) | 0.300% (31) | 0.006% (21) | 0.000% (8) | 0.000% (2) |
| Goiás | 67.4 | 37.4% (539) | 43.8% (576) | 17.2% (535) | 3.7% (406) | 0.812% (358) | 0.057% (285) | 0.007% (211) | 0.001% (116) | 0.000% (42) |
| Bolton Wanderers | 68.2 | 36.9% (503) | 50.3% (666) | 24.5% (554) | 7.2% (445) | 1.3% (330) | 0.143% (269) | 0.011% (196) | 0.000% (101) | 0.000% (35) |
| All Boys | 61.3 | 25.1% (409) | 9.8% (441) | 2.4% (454) | 0.525% (541) | 0.088% (581) | 0.011% (537) | 0.004% (406) | 0.007% (358) | 0.000% (269) |

| Jogador | OVR | De | Para | Chance |
|---|---:|---|---|---:|
| Kylian Mbappé | 91 | Real Madrid | Flamengo | 0.0497% |
| Kylian Mbappé | 91 | Real Madrid | Palmeiras | 0.0066% |
| Kylian Mbappé | 91 | Real Madrid | Goiás | 0.0001% |
| Kylian Mbappé | 91 | Real Madrid | Bayer Leverkusen | 0.0065% |
| Kylian Mbappé | 91 | Real Madrid | Manchester City | 23.6588% |
| Erling Haaland | 91 | Manchester City | Flamengo | 0.0838% |
| Erling Haaland | 91 | Manchester City | River Plate | 0.0004% |
| Erling Haaland | 91 | Manchester City | Arsenal | 31.4550% |

## Desenvolver

O mesmo jogador com a mesma sorte, com e sem a marca do Desenvolver (só jogadores com 3+ de folga até o potencial).

| Grupo | Jogadores | OVR sobe (com) | OVR sobe (sem) | Ganho médio (com) | Ganho médio (sem) |
|---|---:|---:|---:|---:|---:|
| até 21 anos, rápido | 2472 | 100.0% | 99.9% | 4.74 | 2.81 |
| 22 a 25 anos, rápido | 1742 | 99.7% | 95.5% | 3.19 | 1.98 |
| 26 a 29 anos, rápido | 239 | 90.8% | 69.0% | 1.58 | 0.93 |
| até 25 anos, uma metade do lento | 4214 | 99.4% | 88.5% | 2.86 | 1.23 |

Rápido × lento, sem ações, 12609 jogadores: 0.821 contra 0.775 de nível por temporada.

## Verba

- 2ª divisão: 222 de 226 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: Ceará, Deportes Concepción, Jaguares de Córdoba, Palermo (folha acima do teto, precisam vender antes).
- 1ª divisão: 259 de 263 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: Belgrano, Chicago Fire FC, Inter Miami, Los Angeles FC (folha acima do teto, precisam vender antes).

## Carreiras automáticas

| Política | Carreiras | Temporadas | Objetivo cumprido | Demissões | Demitido na 1ª | Acessos | Quedas | Títulos | Grandes títulos | Reputação final | Temporadas com contratação |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Equilibrada (treina, desenvolve, contrata ou sobe da base) | 8 | 192 | 46.4% | 13.5% | 0.0% | 8 | 8 | 7 | 7 | 28 | 25.5% |
| Passiva (nenhuma ação) | 4 | 96 | 34.4% | 17.7% | 25.0% | 5 | 4 | 5 | 4 | 7 | 0.0% |
| Gastadora (contrata em toda etapa) | 4 | 96 | 41.7% | 18.8% | 0.0% | 12 | 11 | 6 | 6 | 20 | 41.7% |

Tempo médio por temporada (Node, trabalhadores em paralelo): rápido 2178 ms, lento 3129 ms. Criar o mundo: 333 ms.

## Ligas

Campeão pelo posto de força no começo da temporada; força média dos clubes na primeira e na última temporada.

| Liga | Div. | Temporadas | Campeão foi o mais forte | Entre os 3 mais fortes | Pontos do campeão | Campeões diferentes por carreira | Força no começo | Força no fim |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2. Bundesliga | 2ª | 384 | 54% | 83% | 70 | 13.4 | 69.8 | 67.5 |
| Brasileirão | 1ª | 384 | 51% | 78% | 80 | 6.5 | 76.9 | 75.4 |
| Brasileirão Série B | 2ª | 384 | 67% | 100% | 92 | 12.5 | 66.2 | 63.7 |
| Bundesliga | 1ª | 384 | 85% | 98% | 82 | 2.7 | 77.0 | 76.0 |
| Championship | 2ª | 384 | 59% | 86% | 98 | 14.2 | 71.7 | 69.9 |
| Copa de Primera | 1ª | 384 | 63% | 99% | 93 | 2.6 | 67.5 | 65.1 |
| Copa Simón Bolívar | 2ª | 384 | 43% | 82% | 43 | 9.6 | 57.1 | 54.8 |
| División Intermedia | 2ª | 384 | 49% | 82% | 57 | 9.4 | 59.2 | 57.0 |
| LaLiga | 1ª | 384 | 61% | 99% | 94 | 2.8 | 78.1 | 77.1 |
| LaLiga 2 | 2ª | 384 | 49% | 83% | 87 | 13.3 | 70.3 | 68.2 |
| Liga Bolivia | 1ª | 384 | 69% | 96% | 62 | 3.5 | 64.4 | 62.0 |
| Liga de Primera | 1ª | 384 | 51% | 90% | 70 | 4.1 | 71.1 | 70.1 |
| Liga Dimayor | 1ª | 384 | 57% | 86% | 79 | 4.8 | 72.3 | 72.1 |
| Liga FUTVE | 1ª | 384 | 31% | 72% | 56 | 6.3 | 66.2 | 63.7 |
| Liga FUTVE 2 | 2ª | 384 | 64% | 88% | 50 | 9.8 | 58.0 | 55.7 |
| Liga MX | 1ª | 384 | 31% | 66% | 70 | 7.2 | 71.8 | 70.1 |
| Liga Profesional | 1ª | 384 | 58% | 88% | 66 | 5.3 | 71.5 | 69.5 |
| Liga Uruguaya | 1ª | 384 | 61% | 98% | 85 | 3.0 | 67.4 | 64.5 |
| Liga1 | 1ª | 384 | 52% | 90% | 67 | 4.7 | 67.7 | 65.1 |
| Liga 2 | 2ª | 384 | 70% | 94% | 61 | 8.0 | 57.4 | 54.9 |
| LigaPro Serie A | 1ª | 384 | 59% | 96% | 66 | 3.7 | 66.9 | 64.3 |
| LigaPro Serie B | 2ª | 384 | 76% | 92% | 66 | 7.9 | 56.4 | 54.0 |
| Ligue 1 | 1ª | 384 | 99% | 100% | 92 | 1.1 | 75.8 | 74.5 |
| Ligue 2 | 2ª | 384 | 51% | 90% | 72 | 12.2 | 67.7 | 65.3 |
| Premier League | 1ª | 384 | 48% | 86% | 85 | 4.8 | 80.2 | 79.6 |
| Primera B | 2ª | 384 | 79% | 94% | 65 | 8.1 | 61.0 | 57.9 |
| Primera Nacional | 2ª | 384 | 55% | 85% | 76 | 14.4 | 60.7 | 58.5 |
| Segunda División | 2ª | 384 | 58% | 83% | 63 | 10.0 | 58.2 | 56.3 |
| Serie A | 1ª | 384 | 50% | 85% | 87 | 5.0 | 77.2 | 76.1 |
| Serie B | 2ª | 384 | 43% | 78% | 78 | 13.9 | 69.5 | 67.5 |
| Torneo Dimayor | 2ª | 384 | 54% | 100% | 85 | 10.0 | 63.5 | 60.0 |
| MLS | 1ª | 384 | 51% | 66% | 72 | 9.3 | 71.1 | 69.2 |
