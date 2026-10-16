# Relatório do mundo simulado

Motor 2.0.0-m14, semente `balanco-m2`, 20 mundos de 25 temporadas, sem jogador. **12 de 12 metas atendidas.**

Gerado por `pnpm balance`. Cada mundo começa com as forças e divisões reais dos dados e roda sozinho: tabelas,
acesso, copas, supercopas, continentais, Intercontinental, Mundial de Clubes, Copa do Mundo e continentais de seleções.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Pontos do campeão nas grandes ligas (mediana por liga) | entre 74 e 95 | Brasileirão 81, Premier League 86, LaLiga 94, Ligue 1 80, Bundesliga 79, Serie A 83 |
| ✓ | Campeões diferentes por primeira divisão em 25 temporadas (mediana das ligas) | pelo menos 4 | 5.0 |
| ✓ | Dinastia existe, monopólio não: fatia do maior campeão de cada mundo | mediana de no máximo 95% em todas as primeiras divisões (o Bayern ganhou 11 seguidos; o PSG, 11 de 13) | pior: Ligue 1 92% |
| ✓ | Quem sobe e se mantém na temporada seguinte (mediana das ligas) | entre 30% e 65% | 62% |
| ✓ | Tendência à média: força dos clubes depois de todas as temporadas, menos a base | 99% dos clubes a no máximo 6 pontos da base, nos dois sentidos | p1 -2.3, p99 +2.4 |
| ✓ | Libertadores com Brasil e Argentina à frente | pelo menos 70% dos títulos | 98% |
| ✓ | Champions League com Inglaterra e Espanha à frente | pelo menos 50% dos títulos | 63% |
| ✓ | Primária continental sem bola de neve: fatia do maior campeão de cada mundo | mediana de no máximo 45% (Flamengo e Palmeiras ganharam 5 das últimas 7 Libertadores) | Champions 26%, Libertadores 36% |
| ✓ | Intercontinental ganha pelo campeão europeu | entre 70% e 95% (clubes europeus ganharam 17 dos últimos 18 mundiais) | 90% |
| ✓ | Mundial de Clubes ganho por clube europeu | pelo menos 60% | 100% |
| ✓ | Copa do Mundo ganha por uma das 8 seleções mais fortes | pelo menos 70% das edições; fora de UEFA e CONMEBOL no máximo 10% | 94%; fora 2% |
| ✓ | Uma temporada do mundo inteiro (todas as ligas, copas e torneios) | no máximo 3 ms | 1.00 ms |

## Ligas

Pontos e campeões diferentes são medianas por mundo. O maior campeão soma todos os mundos.

| Liga | Div. | Pontos do campeão | Pontos do lanterna | Campeões diferentes | Maior campeão | Quem sobe e fica |
|---|---|---:|---:|---:|---|---:|
| Liga Profesional | 1ª | 63 | 18 | 6 | River Plate 46% | 70% |
| Primera Nacional | 2ª | 70 | 25 | 19 | Godoy Cruz 9% | - |
| Liga Bolivia | 1ª | 56 | 26 | 5 | Bolívar 53% | 75% |
| Copa Simón Bolívar | 2ª | 39 | 21 | 12 | Wilstermann 14% | - |
| Brasileirão | 1ª | 81 | 20 | 6 | Flamengo 39% | 40% |
| Brasileirão Série B | 2ª | 76 | 30 | 15 | Athletico Paranaense 9% | - |
| Liga de Primera | 1ª | 55 | 26 | 6 | Colo Colo 39% | 68% |
| Primera B | 2ª | 55 | 29 | 13 | Cobreloa 13% | - |
| Liga Dimayor | 1ª | 73 | 35 | 7 | Nacional 40% | 60% |
| Torneo Dimayor | 2ª | 66 | 34 | 14 | Dep. Cali 10% | - |
| LigaPro Serie A | 1ª | 58 | 25 | 5 | LDU 40% | 66% |
| LigaPro Serie B | 2ª | 55 | 28 | 12 | El Nacional 16% | - |
| Premier League | 1ª | 86 | 23 | 5 | Liverpool 32% | 58% |
| Championship | 2ª | 91 | 37 | 16 | Wolves 6% | - |
| LaLiga | 1ª | 94 | 25 | 3 | Real Madrid 60% | 62% |
| LaLiga 2 | 2ª | 83 | 33 | 17 | Mallorca 8% | - |
| Ligue 1 | 1ª | 80 | 23 | 2 | PSG 91% | 59% |
| Ligue 2 | 2ª | 68 | 27 | 15 | Saint Étienne 8% | - |
| Bundesliga | 1ª | 79 | 22 | 3 | Bayern München 87% | 57% |
| 2. Bundesliga | 2ª | 66 | 28 | 17 | St. Pauli 9% | - |
| Serie A | 1ª | 83 | 23 | 5 | Inter 48% | 55% |
| Serie B | 2ª | 74 | 31 | 17 | Hellas Verona 8% | - |
| Liga MX | 1ª | 67 | 26 | 7 | Tigres UANL 23% | - |
| Copa de Primera | 1ª | 83 | 36 | 4 | Olimpia 35% | 70% |
| División Intermedia | 2ª | 53 | 29 | 11 | Sportivo Trinidense 13% | - |
| Liga1 | 1ª | 62 | 30 | 5 | Universitario 42% | 61% |
| Liga 2 | 2ª | 54 | 28 | 11 | C. Vallejo 19% | - |
| Liga Uruguaya | 1ª | 71 | 31 | 5 | Peñarol 43% | 67% |
| Segunda División | 2ª | 54 | 29 | 13 | Juventud 11% | - |
| MLS | 1ª | 67 | 27 | 11 | Inter Miami 33% | - |
| Liga FUTVE | 1ª | 53 | 28 | 7 | Caracas 33% | 65% |
| Liga FUTVE 2 | 2ª | 47 | 25 | 12 | Mineros 12% | - |

## Torneios continentais (títulos por país)

- **Champions League**: Espanha 37%, Inglaterra 26%, Alemanha 19%, França 10%, Itália 8%
- **Europa League**: Inglaterra 37%, Itália 26%, Alemanha 16%, Espanha 13%, França 9%
- **Libertadores**: Brasil 82%, Argentina 16%, Colômbia 1%, Equador 1%, Paraguai 0%, Chile 0%, Uruguai 0%
- **Sul-Americana**: Brasil 73%, Argentina 21%, Colômbia 2%, Chile 2%, Equador 1%, Uruguai 0%, Paraguai 0%, Venezuela 0%
- **Copa dos Campeões da Concacaf**: México 76%, Estados Unidos 24%

- **Intercontinental**: campeão europeu vence 90%.
- **Mundial de Clubes**: clube europeu vence 100%.

## Seleções

- **Copa do Mundo**: França 24%, Espanha 22%, Argentina 19%, Inglaterra 13%, Brasil 6%, Portugal 6%, Alemanha 3%, Marrocos 2%, Itália 1%, Países Baixos 1%.
- **Continental UEFA**: Espanha 33%, França 31%, Inglaterra 17%, Portugal 9%, Alemanha 4%.
- **Continental CONMEBOL**: Argentina 68%, Brasil 30%, Uruguai 2%, Colômbia 1%.
- **Continental CONCACAF**: Estados Unidos 38%, México 35%, Canadá 23%, Panamá 2%, Costa Rica 1%.
- **Continental CAF**: Marrocos 48%, Senegal 20%, Nigéria 9%, Costa do Marfim 8%, Egito 5%.
- **Continental AFC**: Japão 45%, Coreia do Sul 28%, Irã 16%, Austrália 11%.
- **Continental OFC**: Nova Zelândia 100%.

## Força dos clubes

Depois de 25 temporadas, a diferença para a força base fica entre -2.3 e +2.4 (1% e 99% dos clubes), com média absoluta de 0.78. Sucesso puxa para cima, a volta à média puxa de volta.

## Desempenho

Uma temporada do mundo inteiro leva 1.00 ms (média, já aquecido). Uma carreira de 24 temporadas, com o jogador, fica perto de 30 ms.
