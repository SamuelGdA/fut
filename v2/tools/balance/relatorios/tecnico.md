# Relatório do Técnico

Técnico 1.8.0, semente `tecnico-m1`, 16 carreiras automáticas (384 temporadas). **23 de 23 metas atendidas.**

Gerado por `pnpm balance:tecnico`. As sondas usam as contas do modelo; o Mundial amostra 20 mil
chaveamentos, com desempate por força. As carreiras jogam o mundo inteiro com uma política definida
(GDD 42.12). As mesmas sondas aparecem no laboratório.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Propostas iniciais: cada sorteio independente, 95% segunda divisão | 95% ± 0,5 ponto em 60 mil sorteios | 95.14% (pelo menos uma de 1ª em 13.9% das carreiras; esperado 14,3%) |
| ✓ | Filosofias: cada uma é a melhor em alguma faixa de força, nenhuma em todas | as quatro aparecem como melhor | defensiva, contra-ataque, posse, ofensiva |
| ✓ | Filosofias em forças iguais: diferença entre a melhor e a pior | no máximo 0,2 ponto por jogo | 0.053 |
| ✓ | Só o elenco decide: trocar os elencos de dois clubes troca as chances (nenhum bônus de continente) | erro abaixo de 1e-9 | 2.2e-16 |
| ✓ | Elite europeia × melhores do Brasil e da Argentina, mata-mata de jogo único | favorito passa em média entre 60% e 85%, nunca acima de 90% (difícil, mas possível) | média 74.7%, máximo 83.6% |
| ✓ | Mundial de Clubes: difícil, mas possível para quem não é europeu (sonda de 20 mil chaveamentos, chances por partida) | fora da Europa entre 1% e 15% dos títulos; o melhor sul-americano com pelo menos 0,5% | 5.1% fora da Europa; melhor sul-americano flamengo 2.83% (12 europeus em 32) |
| ✓ | Contratar acima do próprio nível: quanto maior a diferença, mais difícil | mediana cai a cada degrau (resolução de 0,01 ponto); +8 abaixo de 5%; +12 ou mais abaixo de 0,5% | curvas em queda em todos os clubes |
| ✓ | Mbappé no Flamengo: quase impossível, não impossível | entre 0,001% e 0,1% | 0.0499% |
| ✓ | Desenvolver em jovens: ganho a mais na próxima atualização | pelo menos +1 de nível até 21 e de 22 a 25 anos | até 21: +1.92; 22 a 25: +1.21 |
| ✓ | Desenvolver perto do auge (26 a 29 anos, com folga): chance de o OVR subir | pelo menos 90% e 15 pontos acima de não desenvolver | 90.8% contra 69.1% |
| ✓ | Rápido = lento: evolução média numa temporada sem ações | diferença de no máximo 0,15 de nível | rápido 1.02, lento 0.98 |
| ✓ | Verba de início dá para contratar sem pedir dinheiro (clubes de 2ª divisão) | pelo menos 90% com 3 alvos do nível ao alcance | 95.6% (sem: albacete, ceara, deportes-concepcion, jaguares-de-cordoba, laval, padova, palermo, paysandu, sport-recife, vfl-bochum) |
| ✓ | Comandos válidos da política nunca são recusados pelo motor | nenhum | nenhum |
| ✓ | Campeão da primeira divisão é o clube mais forte do começo da temporada | entre 35% e 60% | 57.7% |
| ✓ | Mundial de Clubes ganho por europeu nas carreiras (só pelo elenco, como os 17 dos últimos 18 da vida real) | pelo menos 85% (a chance exata de quem não é europeu está na sonda) | 95.8% em 96 edições; final com sul-americano em 11.5% |
| ✓ | Intercontinental ganho pelo campeão europeu | entre 60% e 95% | 89.8% em 383 edições |
| ✓ | Elencos da IA estáveis: tamanho entre 22 e 34 | pelo menos 95% dos clubes em todas as temporadas | 98.6% (menor 18, maior 48) |
| ✓ | Jogadores ativos no mundo depois de todas as temporadas | a no máximo 10% do começo | 13099 → 13868 (+5.9%) |
| ✓ | Força média das primeiras divisões no fim, contra o começo | todas a no máximo 3 pontos | pior: liga-futve -2.6 |
| ✓ | Lesões por turno no elenco do treinador, por temporada | entre 0,3 e 2,5; afastamento por 1 ou 2 turnos (D63) | 1.1 por temporada, 0.0% graves, 240 dias |
| ✓ | Demissões por temporada com a política equilibrada | entre 1% e 12% | 5.7% em 192 temporadas (na primeira: 0.0%) |
| ✓ | Usar as ações vale a pena: mesmas sementes, país e ritmo, com escalação atualizada | equilibrada à frente | 34.4% contra 21.9% (4 pares) |
| ✓ | Negócio disponível cabe na verba e na folha (contratando em toda etapa, sem pedir verba) | pelo menos 70% das respostas positivas | 100.0% (41 de 41; 113 alvos procurados) |

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
| Barcelona | 86.7 | Flamengo | 80.9 | 51.7% | 24.8% | 23.5% | 65.8% | 34.2% |
| Barcelona | 86.7 | Palmeiras | 79.6 | 56.1% | 23.7% | 20.2% | 70.1% | 29.9% |
| Barcelona | 86.7 | River Plate | 76.9 | 68.6% | 19.1% | 12.3% | 81.0% | 19.0% |
| Barcelona | 86.7 | Boca Juniors | 76.3 | 69.6% | 18.7% | 11.7% | 81.8% | 18.2% |
| Real Madrid | 86.6 | Flamengo | 80.9 | 54.1% | 23.8% | 22.1% | 68.0% | 32.0% |
| Real Madrid | 86.6 | Palmeiras | 79.6 | 58.6% | 22.6% | 18.8% | 72.3% | 27.7% |
| Real Madrid | 86.6 | River Plate | 76.9 | 71.1% | 17.8% | 11.2% | 82.9% | 17.1% |
| Real Madrid | 86.6 | Boca Juniors | 76.3 | 72.0% | 17.4% | 10.6% | 83.6% | 16.4% |
| Arsenal | 86.4 | Flamengo | 80.9 | 51.1% | 25.3% | 23.5% | 65.6% | 34.4% |
| Arsenal | 86.4 | Palmeiras | 79.6 | 55.5% | 24.3% | 20.2% | 69.8% | 30.2% |
| Arsenal | 86.4 | River Plate | 76.9 | 67.8% | 19.7% | 12.4% | 80.6% | 19.4% |
| Arsenal | 86.4 | Boca Juniors | 76.3 | 68.8% | 19.4% | 11.9% | 81.4% | 18.6% |
| Manchester City | 85.7 | Flamengo | 80.9 | 49.5% | 25.3% | 25.2% | 63.7% | 36.3% |
| Manchester City | 85.7 | Palmeiras | 79.6 | 54.1% | 24.3% | 21.6% | 68.2% | 31.8% |
| Manchester City | 85.7 | River Plate | 76.9 | 66.9% | 19.9% | 13.3% | 79.7% | 20.3% |
| Manchester City | 85.7 | Boca Juniors | 76.3 | 67.9% | 19.5% | 12.6% | 80.5% | 19.5% |

Mundial de Clubes (32 clubes, 12 europeus), chaveamento jogado 20 mil vezes com as chances exatas: UEFA 94.9%, CONMEBOL 4.7%, CONCACAF 0.3%, CAF 0.1%, AFC 0.0%. Melhor sul-americano: Flamengo 2.83% por edição.

## Dificuldade de contratar

Mediana da chance de o negócio existir (o jogador querer e o clube liberar), por diferença entre o OVR do alvo
e a força do comprador. Entre parênteses, quantos jogadores do mundo (até 31 anos) há naquele degrau.

| Comprador | Força | -2 | 0 | +2 | +4 | +6 | +8 | +10 | +12 | +15 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Real Madrid | 86.6 | 70.6% (22) | 68.2% (10) | 54.1% (5) | 32.1% (1) | - | - | - | - | - |
| Flamengo | 80.9 | 54.7% (124) | 71.4% (81) | 52.5% (35) | 27.8% (22) | 11.1% (11) | 0.872% (6) | 0.084% (2) | - | - |
| Mirassol | 76.2 | 39.5% (383) | 62.4% (286) | 27.2% (214) | 7.3% (109) | 1.8% (47) | 0.242% (31) | 0.007% (21) | 0.000% (8) | 0.000% (2) |
| Goiás | 70.5 | 36.3% (723) | 54.2% (603) | 27.4% (495) | 6.8% (387) | 1.1% (288) | 0.062% (215) | 0.005% (109) | 0.001% (47) | 0.000% (22) |
| Bolton Wanderers | 68.3 | 37.0% (553) | 52.9% (719) | 24.6% (608) | 7.0% (496) | 1.1% (386) | 0.111% (288) | 0.004% (215) | 0.000% (109) | 0.000% (35) |
| All Boys | 61.3 | 23.7% (390) | 10.8% (445) | 2.8% (533) | 0.535% (588) | 0.074% (636) | 0.009% (592) | 0.002% (475) | 0.001% (397) | 0.000% (288) |

| Jogador | OVR | De | Para | Chance |
|---|---:|---|---|---:|
| Kylian Mbappé | 91 | Real Madrid | Flamengo | 0.0499% |
| Kylian Mbappé | 91 | Real Madrid | Palmeiras | 0.0074% |
| Kylian Mbappé | 91 | Real Madrid | Goiás | 0.0001% |
| Kylian Mbappé | 91 | Real Madrid | Bayer Leverkusen | 0.0058% |
| Kylian Mbappé | 91 | Real Madrid | Manchester City | 23.6698% |
| Erling Haaland | 91 | Manchester City | Flamengo | 0.0843% |
| Erling Haaland | 91 | Manchester City | River Plate | 0.0004% |
| Erling Haaland | 91 | Manchester City | Arsenal | 31.4550% |

## Desenvolver

O mesmo jogador com a mesma sorte, com e sem a marca do Desenvolver (só jogadores com 3+ de folga até o potencial).

| Grupo | Jogadores | OVR sobe (com) | OVR sobe (sem) | Ganho médio (com) | Ganho médio (sem) |
|---|---:|---:|---:|---:|---:|
| até 21 anos, rápido | 2541 | 100.0% | 99.8% | 4.73 | 2.81 |
| 22 a 25 anos, rápido | 1832 | 99.7% | 95.6% | 3.19 | 1.98 |
| 26 a 29 anos, rápido | 249 | 90.8% | 69.1% | 1.59 | 0.94 |
| até 25 anos, uma metade do lento | 4373 | 99.5% | 88.5% | 2.85 | 1.23 |

Rápido × lento, sem ações, 13089 jogadores: 1.024 contra 0.977 de nível por temporada.

## Verba

- 2ª divisão: 216 de 226 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: Albacete, Ceará, Deportes Concepción, Jaguares de Córdoba, Laval, Padova, Palermo, Paysandu, Sport Recife, VfL Bochum (folha acima do teto, precisam vender antes).
- 1ª divisão: 179 de 283 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: 1899 Hoffenheim, 2 de Mayo, AC Milan, Alianza Lima, Always Ready, Angers, Atalanta, Atlanta United, Atlético Madrid, Atlético Nacional, Atlético Tucuman, Austin FC, Auxerre, Banfield, Barcelona SC, Bayern München, Belgrano, Boca Juniors, Bolívar, Borussia Dortmund, Botafogo, Brighton, Cagliari, Caracas FC, Central Córdoba de Santiago del Estero, Cerro Porteño, CF Pachuca, Chapecoense, Charlotte FC, Chicago Fire FC, Cienciano, Club América, Club Guaraní, Club Tijuana, Colorado Rapids, Coquimbo Unido, Cruzeiro, Deportes Tolima, Deportivo Riestra, Deportivo Táchira FC, Elche, Emelec, Espanyol, Estudiantes de La Plata, FC Dallas, FC Juárez, FC Schalke 04, FSV Mainz 05, Fulham, Gimnasia y Esgrima La Plata, Gimnasia de Mendoza, Grêmio, CD Guadalajara, Independiente Rivadavia, Inter, Inter Miami, Juventud, Lanús, Lecce, Los Angeles FC, Los Angeles Galaxy, Millonarios, Mirassol, Monterrey, Napoli, Necaxa, Olympique Lyonnais, Once Caldas, Orlando City, Osasuna, Paris FC, Parma, Peñarol, Racing de Montevideo, Racing de Santander, Rayo Vallecano, RC Strasbourg, Real Madrid, Real Sociedad, San Diego FC, Santa Fe, Santos, Sarmiento de Junin, SC Freiburg, Seattle Sounders, Sporting Cristal, Sportivo Trinidense, Sunderland, SV Elversberg, Toulouse, Unión de Santa Fe, 1. FC Union Berlin, Universidad de Chile, Universitario, Valencia, Vancouver Whitecaps, Vasco da Gama, Vélez Sarsfield, Vitoria, guest:UEFA:POR:0, guest:UEFA:POR:1, guest:UEFA:NED:2, guest:UEFA:NED:3, guest:UEFA:TUR:6 (folha acima do teto, precisam vender antes).

## Carreiras automáticas

| Política | Carreiras | Temporadas | Objetivo cumprido | Demissões | Demitido na 1ª | Acessos | Quedas | Títulos | Grandes títulos | Reputação final | Temporadas com contratação |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Passiva (nenhuma ação) | 4 | 96 | 21.9% | 6.3% | 0.0% | 3 | 3 | 2 | 2 | 5 | 0.0% |
| Equilibrada (treina, desenvolve, contrata ou sobe da base e adapta o plano) | 8 | 192 | 42.2% | 5.7% | 0.0% | 22 | 20 | 12 | 11 | 28 | 21.4% |
| Gastadora (contrata em toda etapa) | 4 | 96 | 27.1% | 9.4% | 0.0% | 10 | 11 | 3 | 3 | 17 | 36.5% |

Tempo médio por temporada (Node, trabalhadores em paralelo): rápido 7074 ms, lento 9534 ms. Criar o mundo: 307 ms.

## Ligas

Campeão pelo posto de força no começo da temporada; força média dos clubes na primeira e na última temporada.

| Liga | Div. | Temporadas | Campeão foi o mais forte | Entre os 3 mais fortes | Pontos do campeão | Campeões diferentes por carreira | Força no começo | Força no fim |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2. Bundesliga | 2ª | 384 | 60% | 83% | 73 | 13.8 | 69.8 | 67.6 |
| Brasileirão | 1ª | 384 | 44% | 73% | 82 | 7.9 | 77.0 | 76.7 |
| Brasileirão Série B | 2ª | 384 | 61% | 94% | 88 | 13.7 | 68.9 | 66.6 |
| Bundesliga | 1ª | 384 | 83% | 96% | 81 | 3.3 | 77.0 | 77.0 |
| Championship | 2ª | 384 | 59% | 86% | 101 | 13.6 | 71.6 | 70.3 |
| Copa de Primera | 1ª | 384 | 63% | 99% | 96 | 2.7 | 67.6 | 65.9 |
| Copa Simón Bolívar | 2ª | 384 | 44% | 85% | 45 | 9.8 | 57.9 | 55.7 |
| División Intermedia | 2ª | 384 | 39% | 74% | 57 | 10.3 | 61.6 | 59.5 |
| LaLiga | 1ª | 384 | 59% | 100% | 93 | 2.6 | 78.1 | 78.1 |
| LaLiga 2 | 2ª | 384 | 53% | 87% | 91 | 14.0 | 70.3 | 68.5 |
| Liga Bolivia | 1ª | 384 | 56% | 96% | 64 | 3.8 | 64.3 | 62.3 |
| Liga de Primera | 1ª | 384 | 61% | 95% | 72 | 3.7 | 71.2 | 71.2 |
| Liga Dimayor | 1ª | 384 | 51% | 86% | 81 | 4.9 | 72.3 | 73.0 |
| Liga FUTVE | 1ª | 384 | 40% | 79% | 59 | 5.8 | 66.3 | 63.7 |
| Liga FUTVE 2 | 2ª | 384 | 51% | 83% | 51 | 10.7 | 60.2 | 58.4 |
| Liga MX | 1ª | 384 | 38% | 67% | 73 | 7.2 | 71.9 | 70.8 |
| Liga Profesional | 1ª | 384 | 60% | 86% | 69 | 5.5 | 71.5 | 70.1 |
| Liga Uruguaya | 1ª | 384 | 70% | 99% | 91 | 2.4 | 67.4 | 65.2 |
| Liga1 | 1ª | 384 | 63% | 95% | 71 | 4.0 | 67.7 | 65.4 |
| Liga 2 | 2ª | 384 | 76% | 96% | 65 | 7.9 | 57.9 | 56.0 |
| LigaPro Serie A | 1ª | 384 | 58% | 95% | 68 | 3.9 | 67.1 | 64.9 |
| LigaPro Serie B | 2ª | 384 | 57% | 85% | 64 | 9.6 | 59.5 | 57.4 |
| Ligue 1 | 1ª | 384 | 97% | 99% | 88 | 1.5 | 75.9 | 75.4 |
| Ligue 2 | 2ª | 384 | 55% | 89% | 75 | 12.3 | 67.7 | 65.3 |
| Premier League | 1ª | 384 | 43% | 78% | 83 | 6.1 | 80.2 | 80.9 |
| Primera B | 2ª | 384 | 68% | 92% | 63 | 8.6 | 62.3 | 59.4 |
| Primera Nacional | 2ª | 384 | 51% | 79% | 79 | 15.6 | 60.7 | 58.5 |
| Segunda División | 2ª | 384 | 43% | 74% | 62 | 12.1 | 61.6 | 59.5 |
| Serie A | 1ª | 384 | 45% | 76% | 87 | 6.1 | 77.2 | 77.2 |
| Serie B | 2ª | 384 | 40% | 76% | 81 | 14.4 | 69.5 | 67.5 |
| Torneo Dimayor | 2ª | 384 | 58% | 94% | 75 | 10.6 | 67.5 | 63.8 |
| MLS | 1ª | 384 | 48% | 70% | 74 | 8.7 | 71.1 | 69.7 |
