# Relatório do Técnico

Técnico 1.12.0, semente `tecnico-m1`, 16 carreiras automáticas (384 temporadas). **23 de 23 metas atendidas.**

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
| ✓ | Mundial de Clubes: difícil, mas possível para quem não é europeu (sonda de 20 mil chaveamentos, chances por partida) | fora da Europa entre 1% e 15% dos títulos; o melhor sul-americano com pelo menos 0,5% | 6.6% fora da Europa; melhor sul-americano flamengo 2.77% (12 europeus em 32) |
| ✓ | Contratar acima do próprio nível: quanto maior a diferença, mais difícil | mediana cai a cada degrau (resolução de 0,01 ponto); +8 abaixo de 5%; +12 ou mais abaixo de 0,5% | curvas em queda em todos os clubes |
| ✓ | Mbappé no Flamengo: quase impossível, não impossível | entre 0,001% e 0,1% | 0.0499% |
| ✓ | Desenvolver em jovens: ganho a mais na próxima atualização | pelo menos +1 de nível até 21 e de 22 a 25 anos | até 21: +1.93; 22 a 25: +1.21 |
| ✓ | Desenvolver perto do auge (26 a 29 anos, com folga): chance de o OVR subir | pelo menos 90% e 15 pontos acima de não desenvolver | 90.8% contra 68.6% |
| ✓ | Rápido = lento: evolução média numa temporada sem ações | diferença de no máximo 0,15 de nível | rápido 1.04, lento 0.99 |
| ✓ | Verba de início dá para contratar sem pedir dinheiro (clubes de 2ª divisão) | pelo menos 90% com 3 alvos do nível ao alcance | 91.0% (sem: adhyaksa-bekasi, albacete, barito-putera, ceara, de-red, deltras, deportes-concepcion, jaguares-de-cordoba, kendal-tornado, laval, padova, palermo, paysandu, persela, persiba, persikad, persiku, persipura, persiraja, persis-solo, psbs-biak, psgc-ciamis, psis-semarang, psms-medan, psps-pekanbaru, rans-nusantara, semen-padang, sport-recife, sumsel-united, vfl-bochum) |
| ✓ | Comandos válidos da política nunca são recusados pelo motor | nenhum | nenhum |
| ✓ | Campeão da primeira divisão é o clube mais forte do começo da temporada | entre 35% e 60% | 54.2% |
| ✓ | Mundial de Clubes ganho por europeu nas carreiras (só pelo elenco, como os 17 dos últimos 18 da vida real) | pelo menos 85% (a chance exata de quem não é europeu está na sonda) | 94.7% em 95 edições; final com sul-americano em 13.7% |
| ✓ | Intercontinental ganho pelo campeão europeu | entre 60% e 95% | 82.1% em 380 edições |
| ✓ | Elencos da IA estáveis: tamanho entre 22 e 34 | pelo menos 95% dos clubes em todas as temporadas | 99.0% (menor 18, maior 52) |
| ✓ | Jogadores ativos no mundo depois de todas as temporadas | a no máximo 10% do começo | 18157 → 19545 (+7.6%) |
| ✓ | Força média das primeiras divisões no fim, contra o começo | todas a no máximo 3 pontos | pior: chinese-super-league -2.2 |
| ✓ | Lesões por turno no elenco do treinador, por temporada | entre 0,3 e 2,5; afastamento por 1 ou 2 turnos (D63) | 1.2 por temporada, 0.0% graves, 254 dias |
| ✓ | Demissões por temporada com a política equilibrada | entre 1% e 12% | 9.4% em 192 temporadas (na primeira: 0.0%) |
| ✓ | Usar as ações vale a pena: mesmas sementes, país e ritmo, com escalação atualizada | equilibrada à frente | 19.8% contra 11.5% (4 pares) |
| ✓ | Negócio disponível cabe na verba e na folha (contratando em toda etapa, sem pedir verba) | pelo menos 70% das respostas positivas | 100.0% (35 de 35; 154 alvos procurados) |

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

Mundial de Clubes (32 clubes, 12 europeus), chaveamento jogado 20 mil vezes com as chances exatas: UEFA 93.4%, CONMEBOL 4.2%, AFC 2.1%, CONCACAF 0.2%, CAF 0.1%. Melhor sul-americano: Flamengo 2.77% por edição.

## Dificuldade de contratar

Mediana da chance de o negócio existir (o jogador querer e o clube liberar), por diferença entre o OVR do alvo
e a força do comprador. Entre parênteses, quantos jogadores do mundo (até 31 anos) há naquele degrau.

| Comprador | Força | -2 | 0 | +2 | +4 | +6 | +8 | +10 | +12 | +15 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Real Madrid | 86.6 | 70.6% (23) | 68.2% (10) | 54.1% (5) | 32.1% (1) | - | - | - | - | - |
| Flamengo | 80.9 | 44.7% (129) | 71.4% (85) | 44.7% (40) | 27.8% (23) | 11.1% (11) | 0.872% (6) | 0.084% (2) | - | - |
| Mirassol | 76.2 | 39.5% (414) | 62.2% (300) | 27.5% (233) | 7.3% (120) | 1.8% (57) | 0.273% (34) | 0.007% (22) | 0.000% (8) | 0.000% (2) |
| Goiás | 70.5 | 36.2% (816) | 54.8% (687) | 27.5% (540) | 7.0% (418) | 1.1% (302) | 0.063% (234) | 0.004% (120) | 0.001% (57) | 0.000% (23) |
| Bolton Wanderers | 68.3 | 37.4% (683) | 53.4% (812) | 25.3% (692) | 7.2% (541) | 1.2% (417) | 0.111% (302) | 0.007% (234) | 0.000% (120) | 0.000% (40) |
| All Boys | 61.3 | 26.8% (626) | 12.1% (684) | 3.1% (721) | 0.583% (741) | 0.079% (738) | 0.009% (671) | 0.002% (534) | 0.001% (429) | 0.000% (302) |

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
| até 21 anos, rápido | 3613 | 100.0% | 99.8% | 4.75 | 2.82 |
| 22 a 25 anos, rápido | 2528 | 99.8% | 95.8% | 3.20 | 1.99 |
| 26 a 29 anos, rápido | 338 | 90.8% | 68.6% | 1.58 | 0.93 |
| até 25 anos, uma metade do lento | 6141 | 99.6% | 88.7% | 2.87 | 1.24 |

Rápido × lento, sem ações, 18140 jogadores: 1.043 contra 0.990 de nível por temporada.

## Verba

- 2ª divisão: 305 de 335 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: Adhyaksa Bekasi, Albacete, Barito Putera, Ceará, de Red FC, Deltras FC, Deportes Concepción, Jaguares de Córdoba, Kendal Tornado, Laval, Padova, Palermo, Paysandu, Persela Lamongan, Persiba Balikpapan, Persikad Depok, Persiku Kudus, Persipura Jayapura, Persiraja Banda Aceh, Persis Solo, PSBS Biak, PSGC Ciamis, PSIS Semarang, PSMS Medan, PSPS Pekanbaru, RANS Nusantara, Semen Padang, Sport Recife, Sumsel United, VfL Bochum (folha acima do teto, precisam vender antes).
- 1ª divisão: 241 de 385 clubes têm 3 ou mais alvos do próprio nível ao alcance da verba e da folha. Sem: 1899 Hoffenheim, 2 de Mayo, Abha Club, AC Milan, Al-Ahli, Al-Diriyah, Al-Ettifaq, Al-Faisaly, Al-Hazem, Al-Hilal, Al-Khaleej, Al-Nassr, Al-Qadsiah, Al-Riyadh, Al-Shabab, Alianza Lima, Always Ready, Angers, Atalanta, Atlanta United, Atlético Madrid, Atlético Nacional, Atlético Tucuman, Austin FC, Auxerre, Avispa Fukuoka, Banfield, Barcelona SC, Bayern München, Beijing Guoan, Belgrano, SL Benfica, Boca Juniors, Bolívar, Borussia Dortmund, Botafogo, Brighton, Cagliari, Caracas FC, Central Córdoba de Santiago del Estero, Cerro Porteño, CF Pachuca, Chapecoense, Charlotte FC, Chengdu Rongcheng, Chicago Fire FC, Cienciano, Club América, Club Guaraní, Club Tijuana, Colorado Rapids, Coquimbo Unido, Cruzeiro, Daejeon Hana Citizen, Dalian Yingbo, Deportes Tolima, Deportivo Riestra, Deportivo Táchira FC, Elche, Emelec, Espanyol, Estrela da Amadora, Estudiantes de La Plata, Fagiano Okayama, FC Anyang, FC Dallas, FC Juárez, FC Porto, FC Schalke 04, FSV Mainz 05, Fulham, Garudayaksa FC, Gimnasia y Esgrima La Plata, Gimnasia de Mendoza, Grêmio, CD Guadalajara, Incheon United, Independiente Rivadavia, Inter, Inter Miami, Java United, Juventud, Kashima Antlers, Kyoto Sanga, Lanús, Lecce, Liaoning Tieren, Los Angeles FC, Los Angeles Galaxy, FC Machida Zelvia, Madura United, Millonarios, Mirassol, Monterrey, Napoli, Necaxa, Olympique Lyonnais, Once Caldas, Orlando City, Osasuna, Paris FC, Parma, Peñarol, Persib Bandung, Persik Kediri, Pohang Steelers, PSS Sleman, Qingdao West Coast, Racing de Santander, Rayo Vallecano, RC Strasbourg, Real Madrid, Real Sociedad, Rio Ave FC, San Diego FC, Santa Fe, Santos, Sarmiento de Junin, SC Freiburg, Seattle Sounders, Shandong Taishan, Shanghai Shenhua, Sporting Cristal, Sportivo Trinidense, Sunderland, SV Elversberg, Toulouse, Unión de Santa Fe, 1. FC Union Berlin, Universidad de Chile, Universitario, Valencia, Vancouver Whitecaps, Vasco da Gama, Vélez Sarsfield, Vitoria, Wuhan Three Towns, Yunnan Yukun, Zhejiang FC, guest:UEFA:POR:0, guest:UEFA:POR:1, guest:UEFA:NED:2, guest:UEFA:NED:3, guest:UEFA:TUR:6 (folha acima do teto, precisam vender antes).

## Carreiras automáticas

| Política | Carreiras | Temporadas | Objetivo cumprido | Demissões | Demitido na 1ª | Acessos | Quedas | Títulos | Grandes títulos | Reputação final | Temporadas com contratação |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Passiva (nenhuma ação) | 4 | 96 | 11.5% | 7.3% | 0.0% | 3 | 3 | 2 | 2 | 7 | 0.0% |
| Equilibrada (treina, desenvolve, contrata ou sobe da base e adapta o plano) | 8 | 192 | 26.6% | 9.4% | 0.0% | 9 | 9 | 4 | 4 | 12 | 18.8% |
| Gastadora (contrata em toda etapa) | 4 | 96 | 22.9% | 8.3% | 0.0% | 3 | 3 | 0 | 0 | 6 | 30.2% |

Tempo médio por temporada (Node, trabalhadores em paralelo): rápido 4931 ms, lento 6416 ms. Criar o mundo: 329 ms.

## Ligas

Campeão pelo posto de força no começo da temporada; força média dos clubes na primeira e na última temporada.

| Liga | Div. | Temporadas | Campeão foi o mais forte | Entre os 3 mais fortes | Pontos do campeão | Campeões diferentes por carreira | Força no começo | Força no fim |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 2. Bundesliga | 2ª | 384 | 55% | 80% | 72 | 13.3 | 69.8 | 67.7 |
| Brasileirão | 1ª | 384 | 47% | 73% | 82 | 7.1 | 77.0 | 76.9 |
| Brasileirão Série B | 2ª | 384 | 61% | 96% | 87 | 12.5 | 68.9 | 66.6 |
| Bundesliga | 1ª | 384 | 78% | 96% | 81 | 3.4 | 77.0 | 77.4 |
| Championship | 2ª | 384 | 58% | 88% | 101 | 12.9 | 71.6 | 70.4 |
| Championship Indonesia | 2ª | 384 | 27% | 55% | 45 | 16.6 | 49.5 | 49.1 |
| China League One | 2ª | 384 | 52% | 76% | 63 | 15.4 | 56.8 | 54.8 |
| Chinese Super League | 1ª | 384 | 33% | 67% | 63 | 8.3 | 65.8 | 63.5 |
| Copa de Primera | 1ª | 384 | 60% | 98% | 95 | 2.9 | 67.6 | 66.1 |
| Copa Simón Bolívar | 2ª | 384 | 41% | 81% | 44 | 9.6 | 57.9 | 55.6 |
| División Intermedia | 2ª | 384 | 37% | 77% | 57 | 10.6 | 61.6 | 59.4 |
| J1 League | 1ª | 384 | 51% | 82% | 84 | 6.0 | 67.1 | 65.0 |
| J2 League | 2ª | 384 | 45% | 76% | 80 | 15.1 | 59.3 | 57.1 |
| K League 1 | 1ª | 384 | 44% | 83% | 78 | 6.7 | 67.9 | 65.8 |
| K League 2 | 2ª | 384 | 43% | 75% | 69 | 12.5 | 58.7 | 56.8 |
| LaLiga | 1ª | 384 | 59% | 100% | 93 | 2.5 | 78.1 | 78.2 |
| LaLiga 2 | 2ª | 384 | 50% | 83% | 91 | 13.8 | 70.3 | 68.7 |
| Liga Bolivia | 1ª | 384 | 58% | 94% | 63 | 3.9 | 64.3 | 62.4 |
| Liga de Primera | 1ª | 384 | 62% | 95% | 72 | 3.8 | 71.2 | 71.3 |
| Liga Dimayor | 1ª | 384 | 52% | 85% | 81 | 5.1 | 72.3 | 73.1 |
| Liga FUTVE | 1ª | 384 | 45% | 76% | 59 | 5.6 | 66.3 | 64.1 |
| Liga FUTVE 2 | 2ª | 384 | 49% | 80% | 51 | 10.6 | 60.2 | 58.4 |
| Liga MX | 1ª | 384 | 32% | 66% | 72 | 7.3 | 71.9 | 71.2 |
| Liga Portugal 2 | 2ª | 384 | 50% | 76% | 70 | 15.1 | 62.4 | 60.3 |
| Liga Profesional | 1ª | 384 | 59% | 87% | 69 | 4.8 | 71.5 | 70.3 |
| Liga Uruguaya | 1ª | 384 | 73% | 99% | 91 | 2.5 | 67.4 | 65.4 |
| Liga1 | 1ª | 384 | 58% | 93% | 70 | 4.1 | 67.7 | 65.6 |
| Liga 2 | 2ª | 384 | 75% | 95% | 63 | 8.2 | 57.9 | 55.9 |
| LigaPro Serie A | 1ª | 384 | 62% | 95% | 68 | 3.9 | 67.1 | 65.1 |
| LigaPro Serie B | 2ª | 384 | 54% | 88% | 64 | 9.6 | 59.5 | 57.5 |
| Ligue 1 | 1ª | 384 | 98% | 100% | 87 | 1.6 | 75.9 | 75.6 |
| Ligue 2 | 2ª | 384 | 53% | 86% | 74 | 13.1 | 67.7 | 65.5 |
| Premier League | 1ª | 384 | 47% | 84% | 83 | 5.3 | 80.2 | 81.0 |
| Primeira Liga | 1ª | 384 | 49% | 86% | 87 | 4.9 | 72.4 | 71.4 |
| Primera B | 2ª | 384 | 62% | 88% | 63 | 9.3 | 62.3 | 59.6 |
| Primera Nacional | 2ª | 384 | 49% | 79% | 78 | 15.8 | 60.7 | 58.6 |
| Saudi First Division | 2ª | 384 | 53% | 80% | 73 | 13.4 | 59.9 | 58.1 |
| Saudi Pro League | 1ª | 384 | 49% | 88% | 86 | 4.5 | 72.4 | 71.2 |
| Segunda División | 2ª | 384 | 33% | 74% | 62 | 12.1 | 61.6 | 59.6 |
| Serie A | 1ª | 384 | 46% | 79% | 87 | 5.9 | 77.2 | 77.3 |
| Serie B | 2ª | 384 | 45% | 75% | 81 | 13.7 | 69.5 | 67.8 |
| Super League Indonesia | 1ª | 384 | 39% | 72% | 70 | 6.6 | 55.7 | 53.5 |
| Torneo Dimayor | 2ª | 384 | 55% | 91% | 75 | 10.9 | 67.5 | 64.1 |
| MLS | 1ª | 384 | 48% | 71% | 74 | 8.6 | 71.1 | 70.0 |
