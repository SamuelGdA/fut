# Relatório do mundo simulado

Motor 2.0.0-m8.2, semente `balanco-m2`, 60 mundos de 25 temporadas, sem jogador. **12 de 12 metas atendidas.**

Gerado por `pnpm balance`. Cada mundo começa com as forças e divisões reais dos dados e roda sozinho: tabelas,
acesso, copas, supercopas, continentais, Intercontinental, Mundial de Clubes, Copa do Mundo e continentais de seleções.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Pontos do campeão nas grandes ligas (mediana por liga) | entre 74 e 95 | Brasileirão 81, Premier League 85, LaLiga 93, Ligue 1 79, Bundesliga 79, Serie A 83 |
| ✓ | Campeões diferentes por primeira divisão em 25 temporadas (mediana das ligas) | pelo menos 4 | 5.0 |
| ✓ | Dinastia existe, monopólio não: fatia do maior campeão de cada mundo | mediana de no máximo 95% em todas as primeiras divisões (o Bayern ganhou 11 seguidos; o PSG, 11 de 13) | pior: Ligue 1 92% |
| ✓ | Quem sobe e se mantém na temporada seguinte (mediana das ligas) | entre 30% e 65% | 60% |
| ✓ | Tendência à média: força dos clubes depois de todas as temporadas, menos a base | 99% dos clubes a no máximo 6 pontos da base, nos dois sentidos | p1 -2.1, p99 +2.3 |
| ✓ | Libertadores com Brasil e Argentina à frente | pelo menos 70% dos títulos | 98% |
| ✓ | Champions League com Inglaterra e Espanha à frente | pelo menos 50% dos títulos | 62% |
| ✓ | Primária continental sem bola de neve: fatia do maior campeão de cada mundo | mediana de no máximo 45% (Flamengo e Palmeiras ganharam 5 das últimas 7 Libertadores) | Champions 28%, Libertadores 36% |
| ✓ | Intercontinental ganha pelo campeão europeu | entre 70% e 95% (clubes europeus ganharam 17 dos últimos 18 mundiais) | 92% |
| ✓ | Mundial de Clubes ganho por clube europeu | pelo menos 60% | 99% |
| ✓ | Copa do Mundo ganha por uma das 8 seleções mais fortes | pelo menos 70% das edições; fora de UEFA e CONMEBOL no máximo 10% | 96%; fora 1% |
| ✓ | Uma temporada do mundo inteiro (todas as ligas, copas e torneios) | no máximo 3 ms | 1.49 ms |

## Ligas

Pontos e campeões diferentes são medianas por mundo. O maior campeão soma todos os mundos.

| Liga | Div. | Pontos do campeão | Pontos do lanterna | Campeões diferentes | Maior campeão | Quem sobe e fica |
|---|---|---:|---:|---:|---|---:|
| Liga Profesional | 1ª | 63 | 18 | 6 | River Plate 45% | 70% |
| Primera Nacional | 2ª | 70 | 25 | 19 | Godoy Cruz 7% | - |
| Liga Bolivia | 1ª | 56 | 26 | 5 | Bolívar 48% | 73% |
| Copa Simón Bolívar | 2ª | 39 | 21 | 11 | Wilstermann 14% | - |
| Brasileirão | 1ª | 81 | 20 | 6 | Palmeiras 40% | 40% |
| Brasileirão Série B | 2ª | 76 | 31 | 16 | Vitoria 8% | - |
| Liga de Primera | 1ª | 55 | 26 | 7 | Colo Colo 34% | 63% |
| Primera B | 2ª | 55 | 28 | 13 | Cobreloa 13% | - |
| Liga Dimayor | 1ª | 72 | 34 | 8 | Nacional 34% | 54% |
| Torneo Dimayor | 2ª | 66 | 34 | 14 | Once Caldas 9% | - |
| LigaPro Serie A | 1ª | 58 | 24 | 5 | LDU 39% | 60% |
| LigaPro Serie B | 2ª | 55 | 28 | 11 | El Nacional 16% | - |
| Premier League | 1ª | 85 | 23 | 5 | Liverpool 31% | 57% |
| Championship | 2ª | 91 | 37 | 16 | West Ham 7% | - |
| LaLiga | 1ª | 93 | 25 | 3 | Real Madrid 59% | 64% |
| LaLiga 2 | 2ª | 82 | 33 | 17 | Girona 7% | - |
| Ligue 1 | 1ª | 79 | 23 | 3 | PSG 91% | 60% |
| Ligue 2 | 2ª | 67 | 28 | 15 | Nantes 8% | - |
| Bundesliga | 1ª | 79 | 22 | 3 | Bayern München 85% | 57% |
| 2. Bundesliga | 2ª | 66 | 28 | 15 | St. Pauli 8% | - |
| Serie A | 1ª | 83 | 23 | 6 | Inter 44% | 55% |
| Serie B | 2ª | 74 | 31 | 16 | Hellas Verona 7% | - |
| Liga MX | 1ª | 67 | 26 | 7 | Monterrey 22% | - |
| Copa de Primera | 1ª | 83 | 37 | 4 | Olimpia 32% | 68% |
| División Intermedia | 2ª | 53 | 29 | 11 | Luqueño 12% | - |
| Liga1 | 1ª | 62 | 30 | 5 | Universitario 40% | 58% |
| Liga 2 | 2ª | 55 | 28 | 11 | C. Vallejo 17% | - |
| Liga Uruguaya | 1ª | 71 | 30 | 4 | Nacional 43% | 64% |
| Segunda División | 2ª | 53 | 29 | 12 | D. Maldonado 10% | - |
| MLS | 1ª | 67 | 27 | 11 | Inter Miami 33% | - |
| Liga FUTVE | 1ª | 53 | 28 | 7 | Caracas 33% | 63% |
| Liga FUTVE 2 | 2ª | 47 | 25 | 12 | Mineros 14% | - |

## Torneios continentais (títulos por país)

- **Champions League**: Espanha 36%, Inglaterra 26%, Alemanha 19%, França 13%, Itália 6%
- **Europa League**: Inglaterra 39%, Itália 23%, Espanha 15%, Alemanha 13%, França 10%
- **Libertadores**: Brasil 80%, Argentina 17%, Equador 1%, Colômbia 1%, Chile 0%, Paraguai 0%, Uruguai 0%
- **Sul-Americana**: Brasil 77%, Argentina 17%, Colômbia 3%, Chile 1%, Equador 1%, Uruguai 0%, Paraguai 0%, Peru 0%
- **Copa dos Campeões da Concacaf**: México 73%, Estados Unidos 27%

- **Intercontinental**: campeão europeu vence 92%.
- **Mundial de Clubes**: clube europeu vence 99%.

## Seleções

- **Copa do Mundo**: Espanha 21%, França 21%, Argentina 19%, Inglaterra 13%, Brasil 9%, Portugal 7%, Alemanha 4%, Itália 2%, Países Baixos 2%, Marrocos 1%.
- **Continental UEFA**: Espanha 31%, França 29%, Inglaterra 16%, Portugal 11%, Alemanha 6%.
- **Continental CONMEBOL**: Argentina 66%, Brasil 33%, Colômbia 1%, Uruguai 1%.
- **Continental CONCACAF**: Estados Unidos 39%, México 38%, Canadá 21%, Panamá 1%, Costa Rica 1%.
- **Continental CAF**: Marrocos 51%, Senegal 20%, Nigéria 10%, Costa do Marfim 7%, Egito 4%.
- **Continental AFC**: Japão 51%, Coreia do Sul 26%, Irã 12%, Austrália 8%, Uzbequistão 2%.
- **Continental OFC**: Nova Zelândia 100%.

## Força dos clubes

Depois de 25 temporadas, a diferença para a força base fica entre -2.1 e +2.3 (1% e 99% dos clubes), com média absoluta de 0.74. Sucesso puxa para cima, a volta à média puxa de volta.

## Desempenho

Uma temporada do mundo inteiro leva 1.49 ms (média, já aquecido). Uma carreira de 24 temporadas, com o jogador, fica perto de 30 ms.
