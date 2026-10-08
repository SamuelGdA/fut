# Elencos do Técnico: relatório da montagem

Gerado por `pnpm elencos:montar`. Fontes, ordem das camadas e regras na D52 (docs/DECISOES.md).

- FC 27: 17849 jogadores masculinos lidos; 8425 em clubes do jogo.
- eFootball: coleta de 2026-10-08 (build 9YQqj4WVHnB2zaXyahhhx); OVR = carta base + 4; usado em clubes com menos de 20 jogadores do FC 27.
- Times do eFootball descartados por terem jogadores fictícios: Bari BR (bari), Pescara BA (pescara), La Spezia B (spezia), Goiás V (goias), Recife Aflitos VB (nautico), Minas Gerais VP (america-mg), Florianópolis AB (avai), Criciúma ABP (criciuma), Ponte Preta BP (ponte-preta), Vila Nova VB (vila-nova), Maceió VB (crb), Reggio Emilia G (reggiana), Ribeirão Preto BVP (botafogo-sp), Cuiabá VA (cuiaba), Clube do Remo (remo), Ponta Grossa PB (operario-pr), Novo Horizonte AP (novorizontino), São João del-Rei PB (athletic-mg).
- Calibração: em 80 jogadores presentes nas duas fontes, FC 27 menos (base + 4) tem mediana -4.5 e média -4.8.
- Livres no início (teto de 30 acima de 21 anos): 10.

## Por país e divisão

| País | Div. | Clubes | Jogadores | FC 27 | eFootball | Conhecimento | Gerados | Reais | Deslocamento da liga | Ajuste da 2ª |
|---|---|---|---|---|---|---|---|---|---|---|
| ARG | 1 | 30 | 878 | 867 | 10 | 0 | 1 | 100% | 2.9 (30 clubes) | - |
| ARG | 2 | 36 | 792 | 0 | 0 | 4 | 788 | 1% | sem medida | +0 |
| BOL | 1 | 8 | 185 | 80 | 0 | 5 | 100 | 46% | 3.1 (3 clubes) | - |
| BOL | 2 | 8 | 176 | 0 | 0 | 0 | 176 | 0% | sem medida | +0.8 |
| BRA | 1 | 20 | 518 | 53 | 409 | 31 | 25 | 95% | 4.1 (18 clubes) | - |
| BRA | 2 | 20 | 443 | 0 | 33 | 40 | 370 | 16% | 9.5 (1 clubes) | +3.1 |
| CHI | 1 | 9 | 283 | 128 | 155 | 0 | 0 | 100% | 2.2 (9 clubes) | - |
| CHI | 2 | 10 | 232 | 0 | 34 | 0 | 198 | 15% | 15.9 (1 clubes) | +1.5 |
| COL | 1 | 10 | 265 | 177 | 85 | 1 | 2 | 99% | 2.6 (10 clubes) | - |
| COL | 2 | 10 | 247 | 0 | 92 | 0 | 155 | 37% | 14.8 (3 clubes) | +5.8 |
| ECU | 1 | 9 | 213 | 125 | 0 | 2 | 86 | 60% | 1.1 (5 clubes) | - |
| ECU | 2 | 9 | 198 | 0 | 0 | 0 | 198 | 0% | sem medida | +3.2 |
| ENG | 1 | 20 | 612 | 612 | 0 | 0 | 0 | 100% | 0.5 (20 clubes) | - |
| ENG | 2 | 24 | 669 | 669 | 0 | 0 | 0 | 100% | 0.9 (24 clubes) | - |
| ESP | 1 | 20 | 548 | 548 | 0 | 0 | 0 | 100% | 0.1 (20 clubes) | - |
| ESP | 2 | 20 | 504 | 477 | 0 | 2 | 25 | 95% | 0.4 (18 clubes) | - |
| FRA | 1 | 18 | 501 | 500 | 0 | 0 | 1 | 100% | -1 (18 clubes) | - |
| FRA | 2 | 18 | 460 | 459 | 0 | 0 | 1 | 100% | -0.9 (18 clubes) | - |
| GER | 1 | 18 | 548 | 548 | 0 | 0 | 0 | 100% | -0.6 (18 clubes) | - |
| GER | 2 | 18 | 499 | 499 | 0 | 0 | 0 | 100% | -0.3 (18 clubes) | - |
| ITA | 1 | 20 | 572 | 572 | 0 | 0 | 0 | 100% | -0.8 (20 clubes) | - |
| ITA | 2 | 20 | 501 | 404 | 0 | 24 | 73 | 85% | 1.5 (16 clubes) | - |
| MEX | 1 | 18 | 441 | 439 | 0 | 0 | 2 | 100% | -0.1 (18 clubes) | - |
| PAR | 1 | 8 | 209 | 121 | 0 | 0 | 88 | 58% | 4.3 (4 clubes) | - |
| PAR | 2 | 8 | 176 | 0 | 0 | 0 | 176 | 0% | sem medida | +2.4 |
| PER | 1 | 8 | 185 | 104 | 0 | 24 | 57 | 69% | 3.2 (4 clubes) | - |
| PER | 2 | 8 | 176 | 0 | 0 | 0 | 176 | 0% | sem medida | +0.5 |
| URU | 1 | 9 | 214 | 116 | 0 | 0 | 98 | 54% | 3.6 (4 clubes) | - |
| URU | 2 | 9 | 198 | 0 | 0 | 0 | 198 | 0% | sem medida | +3.5 |
| USA | 1 | 30 | 806 | 806 | 0 | 0 | 0 | 100% | 1.5 (30 clubes) | - |
| VEN | 1 | 8 | 184 | 111 | 0 | 0 | 73 | 60% | 4.6 (5 clubes) | - |
| VEN | 2 | 8 | 176 | 0 | 0 | 0 | 176 | 0% | sem medida | +2.3 |

## Por clube

| Clube | País | Div. | Força | Âncora | Melhores 14 | FC 27 | eFootball | Conhecimento | Gerados |
|---|---|---|---|---|---|---|---|---|---|
| River Plate | ARG | 1 | 76 | 78.9 | 76.6 | 33 | 0 | 0 | 0 |
| Boca Juniors | ARG | 1 | 75 | 77.9 | 75.9 | 34 | 0 | 0 | 0 |
| Racing Club | ARG | 1 | 73 | 75.9 | 73.6 | 29 | 0 | 0 | 0 |
| Independiente | ARG | 1 | 71 | 73.9 | 72.8 | 24 | 0 | 0 | 0 |
| Talleres de Córdoba | ARG | 1 | 71 | 73.9 | 71.9 | 25 | 0 | 0 | 0 |
| Vélez Sarsfield | ARG | 1 | 71 | 73.9 | 73.4 | 19 | 10 | 0 | 0 |
| Estudiantes de La Plata | ARG | 1 | 71 | 73.9 | 74.4 | 30 | 0 | 0 | 0 |
| Rosario Central | ARG | 1 | 70 | 72.9 | 73.8 | 36 | 0 | 0 | 0 |
| Argentinos Juniors | ARG | 1 | 70 | 72.9 | 71.6 | 27 | 0 | 0 | 0 |
| Lanús | ARG | 1 | 70 | 72.9 | 72.7 | 26 | 0 | 0 | 0 |
| San Lorenzo | ARG | 1 | 70 | 72.9 | 71.1 | 35 | 0 | 0 | 0 |
| Huracán | ARG | 1 | 69 | 71.9 | 71 | 21 | 0 | 0 | 1 |
| Belgrano | ARG | 1 | 68 | 70.9 | 73.5 | 24 | 0 | 0 | 0 |
| Defensa y Justicia | ARG | 1 | 68 | 70.9 | 70.6 | 30 | 0 | 0 | 0 |
| Newell's Old Boys | ARG | 1 | 68 | 70.9 | 68.4 | 32 | 0 | 0 | 0 |
| Atlético Tucuman | ARG | 1 | 67 | 69.9 | 70.3 | 28 | 0 | 0 | 0 |
| Platense | ARG | 1 | 67 | 69.9 | 71.3 | 32 | 0 | 0 | 0 |
| Tigre | ARG | 1 | 67 | 69.9 | 69.8 | 31 | 0 | 0 | 0 |
| Unión de Santa Fe | ARG | 1 | 67 | 69.9 | 70.4 | 23 | 0 | 0 | 0 |
| Banfield | ARG | 1 | 67 | 69.9 | 68.1 | 30 | 0 | 0 | 0 |
| Gimnasia y Esgrima La Plata | ARG | 1 | 67 | 69.9 | 69.4 | 31 | 0 | 0 | 0 |
| Independiente Rivadavia | ARG | 1 | 66 | 68.9 | 71.1 | 30 | 0 | 0 | 0 |
| Barracas Central | ARG | 1 | 66 | 68.9 | 69.7 | 34 | 0 | 0 | 0 |
| Instituto de Córdoba | ARG | 1 | 66 | 68.9 | 69.3 | 27 | 0 | 0 | 0 |
| Central Córdoba de Santiago del Estero | ARG | 1 | 65 | 67.9 | 68.4 | 25 | 0 | 0 | 0 |
| Sarmiento de Junin | ARG | 1 | 65 | 67.9 | 69.2 | 34 | 0 | 0 | 0 |
| Estudiantes de Rio Cuarto | ARG | 1 | 64 | 66.9 | 67.1 | 28 | 0 | 0 | 0 |
| Gimnasia de Mendoza | ARG | 1 | 64 | 66.9 | 69 | 28 | 0 | 0 | 0 |
| Aldosivi | ARG | 1 | 64 | 66.9 | 69.8 | 31 | 0 | 0 | 0 |
| Deportivo Riestra | ARG | 1 | 64 | 66.9 | 67.6 | 30 | 0 | 0 | 0 |
| Godoy Cruz | ARG | 2 | 64 | 66.9 | 65.1 | 0 | 0 | 4 | 18 |
| Colón de Santa Fe | ARG | 2 | 63 | 65.9 | 64.6 | 0 | 0 | 0 | 22 |
| San Martín (T) | ARG | 2 | 62 | 64.9 | 63.7 | 0 | 0 | 0 | 22 |
| Patronato | ARG | 2 | 61 | 63.9 | 62.2 | 0 | 0 | 0 | 22 |
| Quilmes | ARG | 2 | 61 | 63.9 | 62.1 | 0 | 0 | 0 | 22 |
| San Martín (SJ) | ARG | 2 | 61 | 63.9 | 62.7 | 0 | 0 | 0 | 22 |
| All Boys | ARG | 2 | 60 | 62.9 | 61.4 | 0 | 0 | 0 | 22 |
| Almagro | ARG | 2 | 60 | 62.9 | 61.5 | 0 | 0 | 0 | 22 |
| Almirante Brown | ARG | 2 | 60 | 62.9 | 62.4 | 0 | 0 | 0 | 22 |
| Atlético de Rafaela | ARG | 2 | 60 | 62.9 | 60.9 | 0 | 0 | 0 | 22 |
| Chacarita Juniors | ARG | 2 | 60 | 62.9 | 61 | 0 | 0 | 0 | 22 |
| Ferro Carril Oeste | ARG | 2 | 60 | 62.9 | 61.4 | 0 | 0 | 0 | 22 |
| Nueva Chicago | ARG | 2 | 60 | 62.9 | 62.1 | 0 | 0 | 0 | 22 |
| Temperley | ARG | 2 | 60 | 62.9 | 61.5 | 0 | 0 | 0 | 22 |
| Agropecuario | ARG | 2 | 59 | 61.9 | 59.7 | 0 | 0 | 0 | 22 |
| Atlanta | ARG | 2 | 59 | 61.9 | 60.9 | 0 | 0 | 0 | 22 |
| Atletico Mitre (SdE) | ARG | 2 | 59 | 61.9 | 60.9 | 0 | 0 | 0 | 22 |
| Deportivo Madryn | ARG | 2 | 59 | 61.9 | 60.4 | 0 | 0 | 0 | 22 |
| Deportivo Maipu | ARG | 2 | 59 | 61.9 | 59.8 | 0 | 0 | 0 | 22 |
| Deportivo Morón | ARG | 2 | 59 | 61.9 | 60.9 | 0 | 0 | 0 | 22 |
| Estudiantes | ARG | 2 | 59 | 61.9 | 59.7 | 0 | 0 | 0 | 22 |
| Gimnasia Jujuy | ARG | 2 | 59 | 61.9 | 59.9 | 0 | 0 | 0 | 22 |
| Gimnasia y Tiro | ARG | 2 | 59 | 61.9 | 60.2 | 0 | 0 | 0 | 22 |
| Los Andes | ARG | 2 | 59 | 61.9 | 60.2 | 0 | 0 | 0 | 22 |
| Chaco For Ever | ARG | 2 | 58 | 60.9 | 60 | 0 | 0 | 0 | 22 |
| Club Atlético Güemes | ARG | 2 | 58 | 60.9 | 59.4 | 0 | 0 | 0 | 22 |
| Defensores de Belgrano | ARG | 2 | 58 | 60.9 | 59.3 | 0 | 0 | 0 | 22 |
| Racing (C) | ARG | 2 | 58 | 60.9 | 59.6 | 0 | 0 | 0 | 22 |
| San Miguel | ARG | 2 | 58 | 60.9 | 59.9 | 0 | 0 | 0 | 22 |
| San Telmo | ARG | 2 | 58 | 60.9 | 59.8 | 0 | 0 | 0 | 22 |
| Tristán Suárez | ARG | 2 | 58 | 60.9 | 59.1 | 0 | 0 | 0 | 22 |
| Acassuso | ARG | 2 | 57 | 59.9 | 58.9 | 0 | 0 | 0 | 22 |
| Central Norte | ARG | 2 | 57 | 59.9 | 59.6 | 0 | 0 | 0 | 22 |
| Ciudad de Bolívar | ARG | 2 | 57 | 59.9 | 58.1 | 0 | 0 | 0 | 22 |
| Colegiales | ARG | 2 | 57 | 59.9 | 58.4 | 0 | 0 | 0 | 22 |
| Midland | ARG | 2 | 57 | 59.9 | 58.5 | 0 | 0 | 0 | 22 |
| Bolívar | BOL | 1 | 66 | 69.1 | 69 | 28 | 0 | 0 | 0 |
| The Strongest | BOL | 1 | 65 | 68.1 | 66.4 | 0 | 0 | 4 | 18 |
| Always Ready | BOL | 1 | 63 | 66.1 | 66.4 | 16 | 0 | 1 | 5 |
| Blooming | BOL | 1 | 62 | 65.1 | 65.4 | 25 | 0 | 0 | 0 |
| Independiente Petrolero | BOL | 1 | 60 | 63.1 | 63.6 | 11 | 0 | 0 | 11 |
| Nacional Potosí | BOL | 1 | 60 | 63.1 | 61.4 | 0 | 0 | 0 | 22 |
| Guabirá | BOL | 1 | 59 | 62.1 | 60.5 | 0 | 0 | 0 | 22 |
| San Antonio Bulo Bulo | BOL | 1 | 59 | 62.1 | 60.7 | 0 | 0 | 0 | 22 |
| Jorge Wilstermann | BOL | 2 | 59 | 62.1 | 60.8 | 0 | 0 | 0 | 22 |
| Real Potosí | BOL | 2 | 57 | 60.1 | 59.6 | 0 | 0 | 0 | 22 |
| Universitario de Vinto | BOL | 2 | 56 | 59.1 | 57.9 | 0 | 0 | 0 | 22 |
| Club Destroyers | BOL | 2 | 55 | 58.1 | 57.3 | 0 | 0 | 0 | 22 |
| Real Oruro | BOL | 2 | 55 | 58.1 | 57 | 0 | 0 | 0 | 22 |
| Academia del Balompié | BOL | 2 | 55 | 58.1 | 58.1 | 0 | 0 | 0 | 22 |
| Vaca Díez | BOL | 2 | 54 | 57.1 | 56.4 | 0 | 0 | 0 | 22 |
| San Juan | BOL | 2 | 53 | 56.1 | 55 | 0 | 0 | 0 | 22 |
| Flamengo | BRA | 1 | 79 | 83.1 | 80.6 | 0 | 20 | 4 | 0 |
| Palmeiras | BRA | 1 | 79 | 83.1 | 79.4 | 0 | 25 | 0 | 0 |
| Botafogo | BRA | 1 | 76 | 80.1 | 73.4 | 27 | 0 | 0 | 0 |
| Cruzeiro | BRA | 1 | 75 | 79.1 | 78.5 | 0 | 27 | 0 | 1 |
| Fluminense | BRA | 1 | 75 | 79.1 | 78.8 | 0 | 34 | 0 | 0 |
| Atlético Mineiro | BRA | 1 | 75 | 79.1 | 77.5 | 0 | 15 | 8 | 0 |
| São Paulo | BRA | 1 | 75 | 79.1 | 78.3 | 0 | 28 | 0 | 0 |
| Corinthians | BRA | 1 | 74 | 78.1 | 78 | 0 | 25 | 0 | 0 |
| Internacional | BRA | 1 | 74 | 78.1 | 77.8 | 0 | 17 | 7 | 0 |
| Grêmio | BRA | 1 | 73 | 77.1 | 77.4 | 0 | 18 | 4 | 0 |
| Bahia | BRA | 1 | 73 | 77.1 | 73.9 | 26 | 0 | 0 | 0 |
| Santos | BRA | 1 | 72 | 76.1 | 77.4 | 0 | 29 | 0 | 0 |
| Vasco da Gama | BRA | 1 | 72 | 76.1 | 77.1 | 0 | 32 | 0 | 0 |
| Red Bull Bragantino | BRA | 1 | 72 | 76.1 | 77 | 0 | 26 | 0 | 0 |
| Athletico Paranaense | BRA | 1 | 70 | 74.1 | 76.2 | 0 | 30 | 0 | 0 |
| Mirassol | BRA | 1 | 70 | 74.1 | 75.7 | 0 | 16 | 2 | 4 |
| Coritiba | BRA | 1 | 69 | 73.1 | 76 | 0 | 27 | 0 | 0 |
| Vitoria | BRA | 1 | 69 | 73.1 | 75.7 | 0 | 19 | 3 | 0 |
| Chapecoense | BRA | 1 | 67 | 71.1 | 73.9 | 0 | 21 | 0 | 1 |
| Remo | BRA | 1 | 67 | 71.1 | 69.9 | 0 | 0 | 3 | 19 |
| Sport Recife | BRA | 2 | 66 | 70.1 | 74 | 0 | 13 | 4 | 5 |
| Ceará | BRA | 2 | 66 | 70.1 | 75.5 | 0 | 20 | 5 | 0 |
| Goiás | BRA | 2 | 65 | 69.1 | 70.8 | 0 | 0 | 1 | 21 |
| América-MG | BRA | 2 | 65 | 69.1 | 70.6 | 0 | 0 | 1 | 21 |
| Cuiabá | BRA | 2 | 65 | 69.1 | 70.7 | 0 | 0 | 2 | 20 |
| Criciúma | BRA | 2 | 64 | 68.1 | 69.6 | 0 | 0 | 5 | 17 |
| Novorizontino | BRA | 2 | 64 | 68.1 | 69.2 | 0 | 0 | 5 | 17 |
| Avaí | BRA | 2 | 63 | 67.1 | 68.4 | 0 | 0 | 0 | 22 |
| Ponte Preta | BRA | 2 | 62 | 66.1 | 67.6 | 0 | 0 | 2 | 20 |
| Guarani | BRA | 2 | 62 | 66.1 | 67.8 | 0 | 0 | 1 | 21 |
| Náutico | BRA | 2 | 62 | 66.1 | 68.1 | 0 | 0 | 1 | 21 |
| Vila Nova | BRA | 2 | 62 | 66.1 | 67.3 | 0 | 0 | 1 | 21 |
| Paysandu | BRA | 2 | 62 | 66.1 | 67.8 | 0 | 0 | 9 | 13 |
| Operário-PR | BRA | 2 | 62 | 66.1 | 68.3 | 0 | 0 | 0 | 22 |
| CRB | BRA | 2 | 62 | 66.1 | 67.3 | 0 | 0 | 1 | 21 |
| Ferroviária | BRA | 2 | 61 | 65.1 | 67.1 | 0 | 0 | 1 | 21 |
| Botafogo-SP | BRA | 2 | 61 | 65.1 | 66.6 | 0 | 0 | 0 | 22 |
| Volta Redonda | BRA | 2 | 61 | 65.1 | 66.2 | 0 | 0 | 0 | 22 |
| Amazonas | BRA | 2 | 61 | 65.1 | 67.2 | 0 | 0 | 1 | 21 |
| Athletic-MG | BRA | 2 | 60 | 64.1 | 65.6 | 0 | 0 | 0 | 22 |
| Colo Colo | CHI | 1 | 69 | 71.2 | 75.6 | 0 | 40 | 0 | 0 |
| Universidad Católica | CHI | 1 | 68 | 70.2 | 69.9 | 27 | 0 | 0 | 0 |
| Universidad de Chile | CHI | 1 | 68 | 70.2 | 75.5 | 0 | 37 | 0 | 0 |
| Coquimbo Unido | CHI | 1 | 66 | 68.2 | 67.5 | 25 | 0 | 0 | 0 |
| Cobresal | CHI | 1 | 65 | 67.2 | 73.4 | 0 | 40 | 0 | 0 |
| Huachipato | CHI | 1 | 65 | 67.2 | 73.7 | 0 | 38 | 0 | 0 |
| O'Higgins | CHI | 1 | 65 | 67.2 | 66.6 | 25 | 0 | 0 | 0 |
| Palestino | CHI | 1 | 65 | 67.2 | 66.9 | 25 | 0 | 0 | 0 |
| Áudax Italiano | CHI | 1 | 65 | 67.2 | 67.2 | 26 | 0 | 0 | 0 |
| Cobreloa | CHI | 2 | 61 | 63.2 | 63.7 | 0 | 0 | 0 | 22 |
| Santiago Wanderers | CHI | 2 | 60 | 62.2 | 62.4 | 0 | 0 | 0 | 22 |
| Deportes Antofagasta | CHI | 2 | 59 | 61.2 | 61.8 | 0 | 0 | 0 | 22 |
| Deportes Magallanes | CHI | 2 | 58 | 60.2 | 60.1 | 0 | 0 | 0 | 22 |
| Rangers de Talca | CHI | 2 | 58 | 60.2 | 60.4 | 0 | 0 | 0 | 22 |
| Deportes Temuco | CHI | 2 | 58 | 60.2 | 60 | 0 | 0 | 0 | 22 |
| Deportes Copiapó | CHI | 2 | 58 | 60.2 | 59.8 | 0 | 0 | 0 | 22 |
| Curicó Unido | CHI | 2 | 58 | 60.2 | 60.6 | 0 | 0 | 0 | 22 |
| Deportes Concepción | CHI | 2 | 58 | 60.2 | 73.9 | 0 | 34 | 0 | 0 |
| San Marcos de Arica | CHI | 2 | 57 | 59.2 | 59 | 0 | 0 | 0 | 22 |
| Atlético Nacional | COL | 1 | 70 | 72.6 | 72.6 | 30 | 0 | 0 | 0 |
| América de Cali | COL | 1 | 68 | 70.6 | 70 | 23 | 0 | 0 | 1 |
| Junior | COL | 1 | 68 | 70.6 | 70.6 | 25 | 0 | 0 | 0 |
| Millonarios | COL | 1 | 68 | 70.6 | 70.1 | 20 | 0 | 1 | 1 |
| Deportes Tolima | COL | 1 | 67 | 69.6 | 69.6 | 29 | 0 | 0 | 0 |
| Independiente Medellin | COL | 1 | 67 | 69.6 | 69.3 | 26 | 0 | 0 | 0 |
| Santa Fe | COL | 1 | 67 | 69.6 | 70.7 | 24 | 0 | 0 | 0 |
| Bucaramanga | COL | 1 | 66 | 68.6 | 75.4 | 0 | 28 | 0 | 0 |
| Deportivo Cali | COL | 1 | 66 | 68.6 | 76.6 | 0 | 31 | 0 | 0 |
| Once Caldas | COL | 1 | 66 | 68.6 | 74.9 | 0 | 26 | 0 | 0 |
| Cúcuta Deportivo | COL | 2 | 59 | 61.6 | 73.6 | 0 | 29 | 0 | 0 |
| Atlético Huila | COL | 2 | 59 | 61.6 | 65.7 | 0 | 0 | 0 | 22 |
| Jaguares de Córdoba | COL | 2 | 59 | 61.6 | 73.8 | 0 | 32 | 0 | 0 |
| Unión Magdalena | COL | 2 | 59 | 61.6 | 65.6 | 0 | 0 | 0 | 22 |
| Real Cartagena | COL | 2 | 58 | 60.6 | 64.7 | 0 | 0 | 0 | 22 |
| Patriotas Boyacá | COL | 2 | 58 | 60.6 | 64.3 | 0 | 0 | 0 | 22 |
| Deportes Quindío | COL | 2 | 58 | 60.6 | 65 | 0 | 0 | 0 | 22 |
| Itagüí Leones | COL | 2 | 58 | 60.6 | 65.1 | 0 | 0 | 0 | 22 |
| Internacional de Bogotá | COL | 2 | 58 | 60.6 | 73.9 | 0 | 31 | 0 | 1 |
| Boca Juniors de Cali | COL | 2 | 56 | 58.6 | 63 | 0 | 0 | 0 | 22 |
| Independiente del Valle | ECU | 1 | 70 | 71.1 | 70.9 | 29 | 0 | 0 | 0 |
| LDU de Quito | ECU | 1 | 70 | 71.1 | 70.6 | 26 | 0 | 0 | 0 |
| Barcelona SC | ECU | 1 | 68 | 69.1 | 69.1 | 22 | 0 | 0 | 0 |
| Emelec | ECU | 1 | 66 | 67.1 | 65.5 | 0 | 0 | 2 | 20 |
| Universidad Católica | ECU | 1 | 65 | 66.1 | 65 | 0 | 0 | 0 | 22 |
| Deportivo Cuenca | ECU | 1 | 64 | 65.1 | 66.8 | 25 | 0 | 0 | 0 |
| Libertad | ECU | 1 | 64 | 65.1 | 63.6 | 0 | 0 | 0 | 22 |
| Orense SC | ECU | 1 | 64 | 65.1 | 63.5 | 0 | 0 | 0 | 22 |
| Macará | ECU | 1 | 63 | 64.1 | 66.7 | 23 | 0 | 0 | 0 |
| El Nacional | ECU | 2 | 60 | 61.1 | 62.5 | 0 | 0 | 0 | 22 |
| Independiente Juniors | ECU | 2 | 58 | 59.1 | 61.3 | 0 | 0 | 0 | 22 |
| Liga de Portoviejo | ECU | 2 | 57 | 58.1 | 59.8 | 0 | 0 | 0 | 22 |
| 9 de Octubre | ECU | 2 | 57 | 58.1 | 60 | 0 | 0 | 0 | 22 |
| Cumbayá | ECU | 2 | 57 | 58.1 | 60.1 | 0 | 0 | 0 | 22 |
| Gualaceo | ECU | 2 | 56 | 57.1 | 58.9 | 0 | 0 | 0 | 22 |
| Cuenca Juniors | ECU | 2 | 55 | 56.1 | 58.1 | 0 | 0 | 0 | 22 |
| Vinotinto Ecuador | ECU | 2 | 55 | 56.1 | 58.2 | 0 | 0 | 0 | 22 |
| Santo Domingo | ECU | 2 | 55 | 56.1 | 57.1 | 0 | 0 | 0 | 22 |
| Arsenal | ENG | 1 | 87 | 87.5 | 85.8 | 29 | 0 | 0 | 0 |
| Liverpool | ENG | 1 | 87 | 87.5 | 83.9 | 32 | 0 | 0 | 0 |
| Manchester City | ENG | 1 | 87 | 87.5 | 85 | 30 | 0 | 0 | 0 |
| Chelsea | ENG | 1 | 84 | 84.5 | 82.1 | 38 | 0 | 0 | 0 |
| Manchester United | ENG | 1 | 82 | 82.5 | 82.4 | 34 | 0 | 0 | 0 |
| Newcastle United | ENG | 1 | 82 | 82.5 | 80 | 28 | 0 | 0 | 0 |
| Tottenham | ENG | 1 | 81 | 81.5 | 81 | 37 | 0 | 0 | 0 |
| Aston Villa | ENG | 1 | 81 | 81.5 | 80.6 | 33 | 0 | 0 | 0 |
| Brighton | ENG | 1 | 79 | 79.5 | 79.1 | 34 | 0 | 0 | 0 |
| Crystal Palace | ENG | 1 | 78 | 78.5 | 79.7 | 32 | 0 | 0 | 0 |
| Bournemouth | ENG | 1 | 77 | 77.5 | 78.9 | 30 | 0 | 0 | 0 |
| Everton | ENG | 1 | 77 | 77.5 | 78.9 | 24 | 0 | 0 | 0 |
| Nottingham Forest | ENG | 1 | 77 | 77.5 | 79.6 | 28 | 0 | 0 | 0 |
| Brentford | ENG | 1 | 77 | 77.5 | 79.2 | 30 | 0 | 0 | 0 |
| Fulham | ENG | 1 | 77 | 77.5 | 77.6 | 23 | 0 | 0 | 0 |
| Leeds | ENG | 1 | 76 | 76.5 | 77.9 | 30 | 0 | 0 | 0 |
| Sunderland | ENG | 1 | 75 | 75.5 | 79.3 | 28 | 0 | 0 | 0 |
| Coventry City | ENG | 1 | 74 | 74.5 | 74.5 | 31 | 0 | 0 | 0 |
| Ipswich Town | ENG | 1 | 74 | 74.5 | 75.8 | 30 | 0 | 0 | 0 |
| Hull City | ENG | 1 | 73 | 73.5 | 74 | 31 | 0 | 0 | 0 |
| West Ham | ENG | 2 | 76 | 76.9 | 76.6 | 26 | 0 | 0 | 0 |
| Wolves | ENG | 2 | 75 | 75.9 | 75.6 | 30 | 0 | 0 | 0 |
| Burnley | ENG | 2 | 74 | 74.9 | 74.4 | 33 | 0 | 0 | 0 |
| Southampton | ENG | 2 | 73 | 73.9 | 74 | 30 | 0 | 0 | 0 |
| Middlesbrough | ENG | 2 | 72 | 72.9 | 72.8 | 28 | 0 | 0 | 0 |
| Sheffield United | ENG | 2 | 72 | 72.9 | 71.2 | 25 | 0 | 0 | 0 |
| Norwich | ENG | 2 | 71 | 71.9 | 71.3 | 34 | 0 | 0 | 0 |
| Wrexham | ENG | 2 | 71 | 71.9 | 71.7 | 30 | 0 | 0 | 0 |
| Birmingham City | ENG | 2 | 70 | 70.9 | 72.4 | 27 | 0 | 0 | 0 |
| Millwall | ENG | 2 | 70 | 70.9 | 71.6 | 31 | 0 | 0 | 0 |
| Stoke City | ENG | 2 | 70 | 70.9 | 71 | 26 | 0 | 0 | 0 |
| Swansea City | ENG | 2 | 70 | 70.9 | 72.1 | 24 | 0 | 0 | 0 |
| Watford | ENG | 2 | 70 | 70.9 | 70.7 | 24 | 0 | 0 | 0 |
| West Brom | ENG | 2 | 70 | 70.9 | 70.3 | 23 | 0 | 0 | 0 |
| Blackburn Rovers | ENG | 2 | 69 | 69.9 | 69.6 | 30 | 0 | 0 | 0 |
| Bristol City | ENG | 2 | 69 | 69.9 | 70.8 | 27 | 0 | 0 | 0 |
| Cardiff City | ENG | 2 | 69 | 69.9 | 68.6 | 26 | 0 | 0 | 0 |
| Derby County | ENG | 2 | 69 | 69.9 | 71.5 | 27 | 0 | 0 | 0 |
| Portsmouth | ENG | 2 | 69 | 69.9 | 69.9 | 34 | 0 | 0 | 0 |
| Preston | ENG | 2 | 69 | 69.9 | 70.6 | 22 | 0 | 0 | 0 |
| Charlton Athletic | ENG | 2 | 68 | 68.9 | 69.3 | 31 | 0 | 0 | 0 |
| Queen's Park Rangers | ENG | 2 | 68 | 68.9 | 71 | 28 | 0 | 0 | 0 |
| Bolton Wanderers | ENG | 2 | 68 | 68.9 | 68.2 | 27 | 0 | 0 | 0 |
| Lincoln City | ENG | 2 | 67 | 67.9 | 68.4 | 26 | 0 | 0 | 0 |
| Real Madrid | ESP | 1 | 89 | 89.1 | 86 | 32 | 0 | 0 | 0 |
| Barcelona | ESP | 1 | 88 | 88.1 | 85.9 | 29 | 0 | 0 | 0 |
| Atlético Madrid | ESP | 1 | 84 | 84.1 | 83.6 | 31 | 0 | 0 | 0 |
| Villarreal | ESP | 1 | 81 | 81.1 | 79.7 | 24 | 0 | 0 | 0 |
| Athletic Club | ESP | 1 | 80 | 80.1 | 80.4 | 32 | 0 | 0 | 0 |
| Real Betis | ESP | 1 | 79 | 79.1 | 79.2 | 27 | 0 | 0 | 0 |
| Real Sociedad | ESP | 1 | 79 | 79.1 | 78.6 | 24 | 0 | 0 | 0 |
| Sevilla | ESP | 1 | 78 | 78.1 | 75.5 | 26 | 0 | 0 | 0 |
| Celta de Vigo | ESP | 1 | 77 | 77.1 | 77.6 | 25 | 0 | 0 | 0 |
| Valencia | ESP | 1 | 76 | 76.1 | 76.5 | 29 | 0 | 0 | 0 |
| Osasuna | ESP | 1 | 76 | 76.1 | 77.2 | 23 | 0 | 0 | 0 |
| Rayo Vallecano | ESP | 1 | 76 | 76.1 | 77.4 | 27 | 0 | 0 | 0 |
| Espanyol | ESP | 1 | 75 | 75.1 | 75.6 | 25 | 0 | 0 | 0 |
| Alaves | ESP | 1 | 75 | 75.1 | 74.9 | 27 | 0 | 0 | 0 |
| Getafe | ESP | 1 | 75 | 75.1 | 75.6 | 30 | 0 | 0 | 0 |
| Elche | ESP | 1 | 74 | 74.1 | 73.4 | 27 | 0 | 0 | 0 |
| Deportivo La Coruña | ESP | 1 | 73 | 73.1 | 74.6 | 32 | 0 | 0 | 0 |
| Levante | ESP | 1 | 73 | 73.1 | 75.1 | 27 | 0 | 0 | 0 |
| Racing de Santander | ESP | 1 | 73 | 73.1 | 73 | 23 | 0 | 0 | 0 |
| Malaga | ESP | 1 | 73 | 73.1 | 72.6 | 28 | 0 | 0 | 0 |
| Girona | ESP | 2 | 76 | 76.4 | 76.1 | 32 | 0 | 0 | 0 |
| Mallorca | ESP | 2 | 74 | 74.4 | 73.8 | 26 | 0 | 0 | 0 |
| Almeria | ESP | 2 | 72 | 72.4 | 72.4 | 27 | 0 | 0 | 0 |
| Las Palmas | ESP | 2 | 72 | 72.4 | 72.5 | 26 | 0 | 0 | 0 |
| Real Oviedo | ESP | 2 | 72 | 72.4 | 72.1 | 23 | 0 | 0 | 0 |
| Valladolid | ESP | 2 | 72 | 72.4 | 68.9 | 31 | 0 | 0 | 0 |
| Granada CF | ESP | 2 | 71 | 71.4 | 70.3 | 21 | 0 | 2 | 1 |
| Sporting Gijon | ESP | 2 | 70 | 70.4 | 70.5 | 24 | 0 | 0 | 0 |
| Cadiz | ESP | 2 | 70 | 70.4 | 69.4 | 23 | 0 | 0 | 2 |
| Leganes | ESP | 2 | 70 | 70.4 | 70.5 | 27 | 0 | 0 | 0 |
| Eibar | ESP | 2 | 69 | 69.4 | 69.4 | 26 | 0 | 0 | 0 |
| Albacete | ESP | 2 | 68 | 68.4 | 69.9 | 29 | 0 | 0 | 0 |
| Burgos | ESP | 2 | 68 | 68.4 | 69.3 | 24 | 0 | 0 | 0 |
| Castellón | ESP | 2 | 68 | 68.4 | 69.9 | 26 | 0 | 0 | 0 |
| Cordoba | ESP | 2 | 68 | 68.4 | 68.8 | 22 | 0 | 0 | 0 |
| Tenerife | ESP | 2 | 68 | 68.4 | 67.8 | 24 | 0 | 0 | 0 |
| AD Ceuta FC | ESP | 2 | 67 | 67.4 | 67.6 | 21 | 0 | 0 | 1 |
| FC Andorra | ESP | 2 | 67 | 67.4 | 67.3 | 21 | 0 | 0 | 1 |
| Eldense | ESP | 2 | 66 | 66.4 | 66.1 | 13 | 0 | 0 | 9 |
| Sabadell | ESP | 2 | 66 | 66.4 | 66 | 11 | 0 | 0 | 11 |
| Paris Saint Germain | FRA | 1 | 87 | 86 | 86.9 | 29 | 0 | 0 | 0 |
| AS Monaco | FRA | 1 | 80 | 79 | 77.9 | 28 | 0 | 0 | 0 |
| Olympique de Marseille | FRA | 1 | 80 | 79 | 77.3 | 25 | 0 | 0 | 0 |
| Olympique Lyonnais | FRA | 1 | 79 | 78 | 78 | 34 | 0 | 0 | 0 |
| Lille | FRA | 1 | 79 | 78 | 77.4 | 27 | 0 | 0 | 0 |
| Lens | FRA | 1 | 78 | 77 | 77.1 | 27 | 0 | 0 | 1 |
| Stade Rennais | FRA | 1 | 78 | 77 | 77.8 | 25 | 0 | 0 | 0 |
| RC Strasbourg | FRA | 1 | 77 | 76 | 75.4 | 35 | 0 | 0 | 0 |
| Nice | FRA | 1 | 77 | 76 | 75.4 | 29 | 0 | 0 | 0 |
| Stade Brestois | FRA | 1 | 75 | 74 | 73.9 | 22 | 0 | 0 | 0 |
| Toulouse | FRA | 1 | 75 | 74 | 73.1 | 32 | 0 | 0 | 0 |
| Paris FC | FRA | 1 | 74 | 73 | 75.5 | 26 | 0 | 0 | 0 |
| Angers | FRA | 1 | 73 | 72 | 73.4 | 23 | 0 | 0 | 0 |
| Auxerre | FRA | 1 | 73 | 72 | 72.4 | 34 | 0 | 0 | 0 |
| Lorient | FRA | 1 | 73 | 72 | 72.7 | 24 | 0 | 0 | 0 |
| Le Havre | FRA | 1 | 73 | 72 | 72 | 26 | 0 | 0 | 0 |
| Estac Troyes | FRA | 1 | 72 | 71 | 70.4 | 27 | 0 | 0 | 0 |
| Le Mans | FRA | 1 | 71 | 70 | 70.3 | 27 | 0 | 0 | 0 |
| Nantes | FRA | 2 | 74 | 73.1 | 71.6 | 27 | 0 | 0 | 0 |
| Reims | FRA | 2 | 72 | 71.1 | 71.1 | 30 | 0 | 0 | 0 |
| Saint Étienne | FRA | 2 | 72 | 71.1 | 71.8 | 31 | 0 | 0 | 0 |
| Metz | FRA | 2 | 71 | 70.1 | 69.3 | 24 | 0 | 0 | 0 |
| Montpellier | FRA | 2 | 71 | 70.1 | 67.7 | 24 | 0 | 0 | 0 |
| Clermont Foot | FRA | 2 | 68 | 67.1 | 65.5 | 30 | 0 | 0 | 0 |
| Guingamp | FRA | 2 | 68 | 67.1 | 66 | 23 | 0 | 0 | 0 |
| Annecy | FRA | 2 | 67 | 66.1 | 66.9 | 24 | 0 | 0 | 0 |
| Dunkerque | FRA | 2 | 67 | 66.1 | 65.5 | 24 | 0 | 0 | 0 |
| Nancy | FRA | 2 | 67 | 66.1 | 66.1 | 28 | 0 | 0 | 0 |
| Dijon | FRA | 2 | 66 | 65.1 | 64.6 | 24 | 0 | 0 | 0 |
| Grenoble | FRA | 2 | 66 | 65.1 | 66.9 | 27 | 0 | 0 | 0 |
| Laval | FRA | 2 | 66 | 65.1 | 66.4 | 25 | 0 | 0 | 0 |
| PAU | FRA | 2 | 66 | 65.1 | 66.9 | 24 | 0 | 0 | 0 |
| Red Star FC 93 | FRA | 2 | 66 | 65.1 | 67.9 | 22 | 0 | 0 | 0 |
| Rodez | FRA | 2 | 66 | 65.1 | 66.1 | 23 | 0 | 0 | 1 |
| Sochaux | FRA | 2 | 66 | 65.1 | 64.6 | 24 | 0 | 0 | 0 |
| Boulogne | FRA | 2 | 65 | 64.1 | 64.9 | 25 | 0 | 0 | 0 |
| Bayern München | GER | 1 | 88 | 87.4 | 85.6 | 29 | 0 | 0 | 0 |
| Borussia Dortmund | GER | 1 | 83 | 82.4 | 82.1 | 29 | 0 | 0 | 0 |
| Bayer Leverkusen | GER | 1 | 82 | 81.4 | 79.6 | 30 | 0 | 0 | 0 |
| RB Leipzig | GER | 1 | 81 | 80.4 | 79.1 | 32 | 0 | 0 | 0 |
| VfB Stuttgart | GER | 1 | 80 | 79.4 | 78.6 | 34 | 0 | 0 | 0 |
| Eintracht Frankfurt | GER | 1 | 79 | 78.4 | 77.3 | 31 | 0 | 0 | 0 |
| SC Freiburg | GER | 1 | 78 | 77.4 | 77 | 29 | 0 | 0 | 0 |
| 1899 Hoffenheim | GER | 1 | 77 | 76.4 | 78 | 31 | 0 | 0 | 0 |
| Borussia Mönchengladbach | GER | 1 | 76 | 75.4 | 75.7 | 30 | 0 | 0 | 0 |
| FSV Mainz 05 | GER | 1 | 76 | 75.4 | 76.4 | 31 | 0 | 0 | 0 |
| Werder Bremen | GER | 1 | 76 | 75.4 | 74.8 | 30 | 0 | 0 | 0 |
| 1. FC Köln | GER | 1 | 75 | 74.4 | 74.7 | 31 | 0 | 0 | 0 |
| 1. FC Union Berlin | GER | 1 | 75 | 74.4 | 74.6 | 31 | 0 | 0 | 0 |
| FC Augsburg | GER | 1 | 75 | 74.4 | 75.4 | 29 | 0 | 0 | 0 |
| Hamburger SV | GER | 1 | 74 | 73.4 | 74.3 | 27 | 0 | 0 | 0 |
| FC Schalke 04 | GER | 1 | 72 | 71.4 | 73.3 | 33 | 0 | 0 | 0 |
| SC Paderborn 07 | GER | 1 | 72 | 71.4 | 69.7 | 32 | 0 | 0 | 0 |
| SV Elversberg | GER | 1 | 71 | 70.4 | 70.6 | 29 | 0 | 0 | 0 |
| VfL Wolfsburg | GER | 2 | 76 | 75.7 | 76.2 | 34 | 0 | 0 | 0 |
| FC St. Pauli | GER | 2 | 74 | 73.7 | 70.6 | 27 | 0 | 0 | 0 |
| 1. FC Heidenheim | GER | 2 | 73 | 72.7 | 71.3 | 26 | 0 | 0 | 0 |
| Holstein Kiel | GER | 2 | 72 | 71.7 | 69.2 | 31 | 0 | 0 | 0 |
| Hertha BSC | GER | 2 | 71 | 70.7 | 69.1 | 26 | 0 | 0 | 0 |
| VfL Bochum | GER | 2 | 71 | 70.7 | 70 | 25 | 0 | 0 | 0 |
| 1. FC Kaiserslautern | GER | 2 | 70 | 69.7 | 70.2 | 28 | 0 | 0 | 0 |
| 1. FC Nürnberg | GER | 2 | 70 | 69.7 | 69 | 27 | 0 | 0 | 0 |
| Hannover 96 | GER | 2 | 70 | 69.7 | 70.4 | 28 | 0 | 0 | 0 |
| Karlsruher SC | GER | 2 | 69 | 68.7 | 68.4 | 25 | 0 | 0 | 0 |
| Arminia Bielefeld | GER | 2 | 69 | 68.7 | 68.1 | 26 | 0 | 0 | 0 |
| SV Darmstadt 98 | GER | 2 | 69 | 68.7 | 69.6 | 30 | 0 | 0 | 0 |
| 1. FC Magdeburg | GER | 2 | 68 | 67.7 | 68.5 | 27 | 0 | 0 | 0 |
| Dynamo Dresden | GER | 2 | 68 | 67.7 | 68.5 | 27 | 0 | 0 | 0 |
| SpVgg Greuther Fürth | GER | 2 | 68 | 67.7 | 67.1 | 27 | 0 | 0 | 0 |
| Eintracht Braunschweig | GER | 2 | 67 | 66.7 | 68.1 | 29 | 0 | 0 | 0 |
| Energie Cottbus | GER | 2 | 67 | 66.7 | 66.9 | 30 | 0 | 0 | 0 |
| VfL Osnabrück | GER | 2 | 66 | 65.7 | 67.1 | 26 | 0 | 0 | 0 |
| Inter | ITA | 1 | 85 | 84.2 | 83.4 | 27 | 0 | 0 | 0 |
| Napoli | ITA | 1 | 84 | 83.2 | 81.5 | 30 | 0 | 0 | 0 |
| Juventus | ITA | 1 | 83 | 82.2 | 80.9 | 29 | 0 | 0 | 0 |
| AC Milan | ITA | 1 | 83 | 82.2 | 81.6 | 32 | 0 | 0 | 0 |
| Atalanta | ITA | 1 | 81 | 80.2 | 79.6 | 27 | 0 | 0 | 0 |
| AS Roma | ITA | 1 | 80 | 79.2 | 80.9 | 26 | 0 | 0 | 0 |
| Bologna | ITA | 1 | 79 | 78.2 | 76.4 | 24 | 0 | 0 | 0 |
| Lazio | ITA | 1 | 79 | 78.2 | 77.9 | 31 | 0 | 0 | 0 |
| Como | ITA | 1 | 78 | 77.2 | 78.6 | 34 | 0 | 0 | 0 |
| Fiorentina | ITA | 1 | 77 | 76.2 | 77.1 | 27 | 0 | 0 | 0 |
| Torino | ITA | 1 | 76 | 75.2 | 75.6 | 31 | 0 | 0 | 0 |
| Genoa | ITA | 1 | 75 | 74.2 | 74.4 | 27 | 0 | 0 | 0 |
| Sassuolo | ITA | 1 | 75 | 74.2 | 75.1 | 34 | 0 | 0 | 0 |
| Udinese | ITA | 1 | 75 | 74.2 | 74.1 | 27 | 0 | 0 | 0 |
| Cagliari | ITA | 1 | 74 | 73.2 | 73.6 | 29 | 0 | 0 | 0 |
| Parma | ITA | 1 | 74 | 73.2 | 72.9 | 23 | 0 | 0 | 0 |
| Lecce | ITA | 1 | 73 | 72.2 | 71.9 | 25 | 0 | 0 | 0 |
| Monza | ITA | 1 | 73 | 72.2 | 72.2 | 24 | 0 | 0 | 0 |
| Venezia | ITA | 1 | 73 | 72.2 | 74.1 | 33 | 0 | 0 | 0 |
| Frosinone | ITA | 1 | 72 | 71.2 | 71.8 | 32 | 0 | 0 | 0 |
| Hellas Verona | ITA | 2 | 72 | 73.5 | 71.4 | 31 | 0 | 0 | 0 |
| Cremonese | ITA | 2 | 71 | 72.5 | 71.7 | 28 | 0 | 0 | 0 |
| Palermo | ITA | 2 | 71 | 72.5 | 73.5 | 24 | 0 | 0 | 0 |
| Empoli | ITA | 2 | 71 | 72.5 | 68.4 | 20 | 0 | 2 | 0 |
| Pisa | ITA | 2 | 70 | 71.5 | 71.1 | 30 | 0 | 0 | 0 |
| Sampdoria | ITA | 2 | 70 | 71.5 | 72.1 | 24 | 0 | 0 | 0 |
| Modena | ITA | 2 | 69 | 70.5 | 70.2 | 26 | 0 | 0 | 0 |
| Spezia | ITA | 2 | 69 | 70.5 | 68.3 | 0 | 0 | 5 | 17 |
| Catanzaro | ITA | 2 | 68 | 69.5 | 69.8 | 26 | 0 | 0 | 0 |
| Bari | ITA | 2 | 68 | 69.5 | 67.6 | 0 | 0 | 6 | 16 |
| Pescara | ITA | 2 | 68 | 69.5 | 68.4 | 0 | 0 | 4 | 18 |
| Avellino | ITA | 2 | 67 | 68.5 | 68.9 | 19 | 0 | 1 | 2 |
| Cesena | ITA | 2 | 67 | 68.5 | 67.9 | 26 | 0 | 0 | 0 |
| Juve Stabia | ITA | 2 | 67 | 68.5 | 67 | 26 | 0 | 0 | 1 |
| Mantova | ITA | 2 | 67 | 68.5 | 68.6 | 24 | 0 | 0 | 0 |
| Padova | ITA | 2 | 67 | 68.5 | 69.6 | 30 | 0 | 0 | 0 |
| Reggiana | ITA | 2 | 67 | 68.5 | 66.2 | 0 | 0 | 6 | 16 |
| Carrarese | ITA | 2 | 66 | 67.5 | 67.4 | 24 | 0 | 0 | 0 |
| Sudtirol | ITA | 2 | 66 | 67.5 | 68.9 | 22 | 0 | 0 | 2 |
| Virtus Entella | ITA | 2 | 66 | 67.5 | 67.9 | 24 | 0 | 0 | 1 |
| Club América | MEX | 1 | 75 | 74.9 | 73.9 | 28 | 0 | 0 | 0 |
| Tigres UANL | MEX | 1 | 75 | 74.9 | 73.1 | 24 | 0 | 0 | 0 |
| Monterrey | MEX | 1 | 75 | 74.9 | 73.6 | 25 | 0 | 0 | 0 |
| Cruz Azul | MEX | 1 | 74 | 73.9 | 73.9 | 24 | 0 | 0 | 0 |
| Toluca | MEX | 1 | 74 | 73.9 | 74.4 | 28 | 0 | 0 | 0 |
| CF Pachuca | MEX | 1 | 73 | 72.9 | 71.8 | 22 | 0 | 0 | 0 |
| CD Guadalajara | MEX | 1 | 72 | 71.9 | 73.3 | 24 | 0 | 0 | 0 |
| Club León | MEX | 1 | 72 | 71.9 | 70.3 | 25 | 0 | 0 | 0 |
| Club Tijuana | MEX | 1 | 71 | 70.9 | 71 | 24 | 0 | 0 | 0 |
| Pumas UNAM | MEX | 1 | 71 | 70.9 | 72.7 | 25 | 0 | 0 | 0 |
| Atlas | MEX | 1 | 70 | 69.9 | 72.1 | 23 | 0 | 0 | 0 |
| Santos Laguna | MEX | 1 | 70 | 69.9 | 69.1 | 26 | 0 | 0 | 0 |
| Atletico San Luis | MEX | 1 | 69 | 68.9 | 70 | 23 | 0 | 0 | 0 |
| FC Juárez | MEX | 1 | 69 | 68.9 | 70.9 | 22 | 0 | 0 | 0 |
| Necaxa | MEX | 1 | 69 | 68.9 | 68.5 | 21 | 0 | 0 | 1 |
| Club Querétaro | MEX | 1 | 68 | 67.9 | 68.1 | 21 | 0 | 0 | 1 |
| Puebla | MEX | 1 | 68 | 67.9 | 68.6 | 24 | 0 | 0 | 0 |
| Atlante FC | MEX | 1 | 67 | 66.9 | 66.5 | 30 | 0 | 0 | 0 |
| Cerro Porteño | PAR | 1 | 67 | 71.3 | 71.4 | 30 | 0 | 0 | 0 |
| Libertad | PAR | 1 | 67 | 71.3 | 69.1 | 28 | 0 | 0 | 0 |
| Olimpia | PAR | 1 | 67 | 71.3 | 71.1 | 28 | 0 | 0 | 0 |
| Club Guaraní | PAR | 1 | 63 | 67.3 | 65.9 | 0 | 0 | 0 | 22 |
| Club Nacional | PAR | 1 | 63 | 67.3 | 65.9 | 0 | 0 | 0 | 22 |
| 2 de Mayo | PAR | 1 | 61 | 65.3 | 64.8 | 0 | 0 | 0 | 22 |
| Deportivo Recoleta | PAR | 1 | 61 | 65.3 | 67.1 | 35 | 0 | 0 | 0 |
| Sportivo Trinidense | PAR | 1 | 61 | 65.3 | 63.4 | 0 | 0 | 0 | 22 |
| Sportivo Luqueño | PAR | 2 | 58 | 62.3 | 63.5 | 0 | 0 | 0 | 22 |
| Sol de América | PAR | 2 | 58 | 62.3 | 63.3 | 0 | 0 | 0 | 22 |
| Rubio Ñu | PAR | 2 | 57 | 61.3 | 62.2 | 0 | 0 | 0 | 22 |
| River Plate | PAR | 2 | 56 | 60.3 | 60.4 | 0 | 0 | 0 | 22 |
| Atlético Colegiales | PAR | 2 | 56 | 60.3 | 61.2 | 0 | 0 | 0 | 22 |
| 12 de Octubre | PAR | 2 | 56 | 60.3 | 61.2 | 0 | 0 | 0 | 22 |
| Independiente de Campo Grande | PAR | 2 | 55 | 59.3 | 60.4 | 0 | 0 | 0 | 22 |
| Tacuary | PAR | 2 | 55 | 59.3 | 60.3 | 0 | 0 | 0 | 22 |
| Universitario | PER | 1 | 67 | 70.2 | 70 | 19 | 0 | 2 | 1 |
| Alianza Lima | PER | 1 | 66 | 69.2 | 68.4 | 0 | 0 | 15 | 7 |
| Sporting Cristal | PER | 1 | 66 | 69.2 | 69.2 | 29 | 0 | 0 | 0 |
| FBC Melgar | PER | 1 | 64 | 67.2 | 65.7 | 0 | 0 | 7 | 15 |
| Cienciano | PER | 1 | 63 | 66.2 | 67.4 | 17 | 0 | 0 | 5 |
| Cusco | PER | 1 | 63 | 66.2 | 67.4 | 15 | 0 | 0 | 7 |
| Alianza Atletico | PER | 1 | 62 | 65.2 | 65.1 | 24 | 0 | 0 | 0 |
| Deportivo Garcilaso | PER | 1 | 62 | 65.2 | 63.6 | 0 | 0 | 0 | 22 |
| César Vallejo | PER | 2 | 59 | 62.2 | 61.7 | 0 | 0 | 0 | 22 |
| Carlos A. Mannucci | PER | 2 | 57 | 60.2 | 59.6 | 0 | 0 | 0 | 22 |
| Universidad San Martín | PER | 2 | 57 | 60.2 | 58.7 | 0 | 0 | 0 | 22 |
| Unión Comercio | PER | 2 | 56 | 59.2 | 57 | 0 | 0 | 0 | 22 |
| Deportivo Coopsol | PER | 2 | 55 | 58.2 | 57.1 | 0 | 0 | 0 | 22 |
| Academia Cantolao | PER | 2 | 55 | 58.2 | 57.6 | 0 | 0 | 0 | 22 |
| Deportivo Llacuabamba | PER | 2 | 54 | 57.2 | 56.6 | 0 | 0 | 0 | 22 |
| Pirata FC | PER | 2 | 54 | 57.2 | 55.9 | 0 | 0 | 0 | 22 |
| Nacional | URU | 1 | 68 | 71.6 | 71 | 27 | 0 | 0 | 0 |
| Peñarol | URU | 1 | 68 | 71.6 | 71.6 | 28 | 0 | 0 | 0 |
| Defensor Sporting | URU | 1 | 64 | 67.6 | 65.9 | 0 | 0 | 0 | 22 |
| Liverpool | URU | 1 | 64 | 67.6 | 66.1 | 0 | 0 | 0 | 22 |
| Boston River | URU | 1 | 63 | 66.6 | 66.6 | 24 | 0 | 0 | 0 |
| Montevideo City Torque | URU | 1 | 62 | 65.6 | 67.1 | 25 | 0 | 0 | 0 |
| Racing de Montevideo | URU | 1 | 62 | 65.6 | 64.6 | 0 | 0 | 0 | 22 |
| Albion FC | URU | 1 | 61 | 64.6 | 63.9 | 0 | 0 | 0 | 22 |
| Juventud | URU | 1 | 61 | 64.6 | 66.5 | 12 | 0 | 0 | 10 |
| Rampla Juniors | URU | 2 | 57 | 60.6 | 63.6 | 0 | 0 | 0 | 22 |
| Deportivo Maldonado | URU | 2 | 57 | 60.6 | 62.4 | 0 | 0 | 0 | 22 |
| Central Español | URU | 2 | 56 | 59.6 | 62.6 | 0 | 0 | 0 | 22 |
| Sud América | URU | 2 | 56 | 59.6 | 61.6 | 0 | 0 | 0 | 22 |
| Rentistas | URU | 2 | 56 | 59.6 | 61.6 | 0 | 0 | 0 | 22 |
| Villa Española | URU | 2 | 55 | 58.6 | 61.4 | 0 | 0 | 0 | 22 |
| Uruguay Montevideo | URU | 2 | 55 | 58.6 | 60.6 | 0 | 0 | 0 | 22 |
| Atenas de San Carlos | URU | 2 | 55 | 58.6 | 60.4 | 0 | 0 | 0 | 22 |
| Tacuarembó | URU | 2 | 55 | 58.6 | 60.6 | 0 | 0 | 0 | 22 |
| Inter Miami | USA | 1 | 74 | 75.5 | 74.6 | 26 | 0 | 0 | 0 |
| Los Angeles FC | USA | 1 | 72 | 73.5 | 72.1 | 24 | 0 | 0 | 0 |
| Los Angeles Galaxy | USA | 1 | 71 | 72.5 | 71.4 | 26 | 0 | 0 | 0 |
| Columbus Crew | USA | 1 | 71 | 72.5 | 71.1 | 30 | 0 | 0 | 0 |
| FC Cincinnati | USA | 1 | 71 | 72.5 | 70.1 | 26 | 0 | 0 | 0 |
| Atlanta United | USA | 1 | 70 | 71.5 | 69.7 | 25 | 0 | 0 | 0 |
| New York City FC | USA | 1 | 70 | 71.5 | 71.9 | 31 | 0 | 0 | 0 |
| Orlando City | USA | 1 | 70 | 71.5 | 70.9 | 23 | 0 | 0 | 0 |
| Philadelphia Union | USA | 1 | 70 | 71.5 | 69.4 | 25 | 0 | 0 | 0 |
| San Diego FC | USA | 1 | 70 | 71.5 | 69.9 | 28 | 0 | 0 | 0 |
| Vancouver Whitecaps | USA | 1 | 70 | 71.5 | 71.8 | 26 | 0 | 0 | 0 |
| Seattle Sounders | USA | 1 | 70 | 71.5 | 71.7 | 25 | 0 | 0 | 0 |
| New York RB | USA | 1 | 69 | 70.5 | 67.7 | 28 | 0 | 0 | 0 |
| Charlotte FC | USA | 1 | 69 | 70.5 | 71 | 25 | 0 | 0 | 0 |
| Minnesota United | USA | 1 | 69 | 70.5 | 69.9 | 30 | 0 | 0 | 0 |
| Nashville SC | USA | 1 | 69 | 70.5 | 71.2 | 29 | 0 | 0 | 0 |
| FC Dallas | USA | 1 | 68 | 69.5 | 69.2 | 34 | 0 | 0 | 0 |
| Chicago Fire FC | USA | 1 | 68 | 69.5 | 71.3 | 25 | 0 | 0 | 0 |
| Austin FC | USA | 1 | 68 | 69.5 | 69.4 | 24 | 0 | 0 | 0 |
| Houston Dynamo | USA | 1 | 68 | 69.5 | 71 | 25 | 0 | 0 | 0 |
| Portland Timbers | USA | 1 | 68 | 69.5 | 70.4 | 25 | 0 | 0 | 0 |
| Real Salt Lake | USA | 1 | 68 | 69.5 | 70.2 | 35 | 0 | 0 | 0 |
| Sporting Kansas City | USA | 1 | 67 | 68.5 | 66.5 | 24 | 0 | 0 | 0 |
| DC United | USA | 1 | 67 | 68.5 | 69 | 23 | 0 | 0 | 0 |
| New England Revolution | USA | 1 | 67 | 68.5 | 70.9 | 27 | 0 | 0 | 0 |
| Colorado Rapids | USA | 1 | 67 | 68.5 | 68.7 | 27 | 0 | 0 | 0 |
| San Jose Earthquakes | USA | 1 | 67 | 68.5 | 70.1 | 30 | 0 | 0 | 0 |
| St. Louis City SC | USA | 1 | 67 | 68.5 | 68.1 | 27 | 0 | 0 | 0 |
| Toronto FC | USA | 1 | 67 | 68.5 | 70.5 | 28 | 0 | 0 | 0 |
| CF Montreal | USA | 1 | 66 | 67.5 | 67.6 | 25 | 0 | 0 | 0 |
| Caracas FC | VEN | 1 | 64 | 68.6 | 65.6 | 24 | 0 | 0 | 1 |
| Deportivo Táchira FC | VEN | 1 | 63 | 67.6 | 66.4 | 0 | 0 | 0 | 22 |
| Carabobo FC | VEN | 1 | 62 | 66.6 | 66.4 | 18 | 0 | 0 | 4 |
| Deportivo La Guaira | VEN | 1 | 62 | 66.6 | 66.6 | 21 | 0 | 0 | 1 |
| Puerto Cabello | VEN | 1 | 62 | 66.6 | 67 | 27 | 0 | 0 | 0 |
| Metropolitanos FC | VEN | 1 | 61 | 65.6 | 64.4 | 0 | 0 | 0 | 22 |
| Monagas SC | VEN | 1 | 61 | 65.6 | 64.1 | 0 | 0 | 0 | 22 |
| UCV | VEN | 1 | 61 | 65.6 | 67.3 | 21 | 0 | 0 | 1 |
| Mineros de Guayana | VEN | 2 | 57 | 61.6 | 61.6 | 0 | 0 | 0 | 22 |
| Trujillanos | VEN | 2 | 56 | 60.6 | 61.6 | 0 | 0 | 0 | 22 |
| Aragua | VEN | 2 | 55 | 59.6 | 60.4 | 0 | 0 | 0 | 22 |
| Angostura | VEN | 2 | 55 | 59.6 | 60.3 | 0 | 0 | 0 | 22 |
| Atlético El Vigía | VEN | 2 | 54 | 58.6 | 59.8 | 0 | 0 | 0 | 22 |
| Real Frontera | VEN | 2 | 54 | 58.6 | 59.6 | 0 | 0 | 0 | 22 |
| Marítimo de La Guaira | VEN | 2 | 54 | 58.6 | 60.1 | 0 | 0 | 0 | 22 |
| Titanes | VEN | 2 | 53 | 57.6 | 58.6 | 0 | 0 | 0 | 22 |

## Características iniciais

| Característica | Jogadores | Fatia |
|---|---|---|
| aerial | 161 | 1% |
| clutch | 186 | 1% |
| fast | 263 | 2% |
| leader | 137 | 1% |
| setPiece | 197 | 2% |
| tireless | 82 | 1% |
| versatile | 344 | 3% |

## Identidades casadas com o FC 27 (fora do clube da outra fonte)

- Ronaldo (ef:110562, internacional) = Ronaldo (fc:245640, bahia)
- Rodrigo Aliendro (ef:111028, velez-sarsfield) = Rodrigo Aliendro (fc:233029, velez-sarsfield)
- Lucas Robertone (ef:114331, velez-sarsfield) = Lucas Robertone (fc:235008, velez-sarsfield)
- Erick (ef:118717, vitoria) = Erick (fc:263818, bahia)
- Christian Rivera (ef:119915, sport-recife) = Christian Rivera (fc:233079, cf-pachuca)
- Anderson (ef:126313, chapecoense) = Anderson (fc:247041, fora do jogo)
- Matías Pellegrini (ef:126407, velez-sarsfield) = Matías Pellegrini (fc:244884, velez-sarsfield)
- Fabricio Domínguez (ef:127098, sport-recife) = Fabricio Domínguez (fc:245247, cerro-porteno)
- Tomás Marchiori (ef:130974, velez-sarsfield) = Tomás Marchiori (fc:259273, velez-sarsfield)
- Joaquín García (ef:132818, velez-sarsfield) = Joaquín García (fc:256524, velez-sarsfield)
- Facundo Sanguinetti (ef:141386, velez-sarsfield) = Facundo Sanguinetti (fc:262865, velez-sarsfield)
- Alix Vinicius (ef:144024, rb-bragantino) = Abner Vinícius (fc:263815, olympique-lyonnais)
- Vitinho (ef:146560, atletico-mg) = Vitinho (fc:87071, fora do jogo)
- Dewar Victoria (ef:147414, internacional-de-bogota) = Dewar Victoria (fc:272378, millonarios)
- Cleiton (ef:148165, flamengo) = Cleiton (fc:82663, vfl-wolfsburg)
- Juan Mosquera (ef:151220, bucaramanga) = Juan David Mosquera (fc:255894, portland-timbers)
- Otávio (ef:153346, cruzeiro) = Otávio (fc:78088, eintracht-frankfurt)
- Ronaldo Martínez (ef:159959, velez-sarsfield) = Ronaldo Martínez (fc:260140, talleres)
- Isaac (ef:159966, atletico-paranaense) = Isaac (fc:74092, verona)
- João Pedro (ef:161109, corinthians) = João Pedro (fc:70170, fora do jogo)
- Robert (ef:169235, atletico-mg) = Robert (fc:74233, fora do jogo)
- Thiago Silvero (ef:170854, velez-sarsfield) = Thiago Silvero (fc:74853, velez-sarsfield)
- Jano Gordon (ef:170857, velez-sarsfield) = Jano Gordon (fc:74857, velez-sarsfield)
- Álex Verón (ef:176243, velez-sarsfield) = Álex Verón (fc:79234, velez-sarsfield)
- Dilan Godoy (ef:176252, velez-sarsfield) = Dilan Godoy (fc:80127, velez-sarsfield)
- Matías Arias (ef:178038, velez-sarsfield) = Matías Arias (fc:80123, velez-sarsfield)
- Simon Escobar (ef:182112, velez-sarsfield) = Simón Escobar (fc:83462, velez-sarsfield)
- Luca Feler (ef:182595, velez-sarsfield) = Luca Feler (fc:84092, velez-sarsfield)
- Sergio Núñez (ef:186228, huachipato) = Sergio Núñez (fc:258401, barcelona-sc)
- Rafael (ef:41204, sao-paulo) = Rafael (fc:192397, real-salt-lake)
- Manuel Lanzini (ef:42697, velez-sarsfield) = Manuel Lanzini (fc:188988, velez-sarsfield)
- Alisson (ef:47472, fluminense) = Alisson (fc:212831, liverpool)
- Lisandro Magallán (ef:47830, velez-sarsfield) = Lisandro Magallán (fc:211263, velez-sarsfield)
- Diego Valdés (ef:59196, velez-sarsfield) = Diego Valdés (fc:213597, velez-sarsfield)
- Claudio Baeza (ef:59265, velez-sarsfield) = Claudio Baeza (fc:214302, velez-sarsfield)
- Elías Gómez (ef:61036, velez-sarsfield) = Elías Gómez (fc:221053, velez-sarsfield)
- Emanuel Mammana (ef:61130, velez-sarsfield) = Emanuel Mammana (fc:221551, velez-sarsfield)
- Danilo (k:flamengo:danilo, flamengo) = Danilo (fc:216283, fora do jogo)
- Ricard Sánchez (k:granada-cf:ricard-sanchez, granada-cf) = Rubén Sánchez (fc:262479, espanyol)
