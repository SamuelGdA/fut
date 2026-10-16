# Classificações do Futeiros, revisão D64

Pesquisa consultada em 13/10/2026. O motor usa regras de referência de 2026,
incluindo as vagas brasileiras para 2027. As décadas seguintes são simulações:
não se prevê uma mudança futura de regulamento. Craque e Técnico usam a mesma
função de classificação e a mesma memória da temporada encerrada.

## Princípios comuns

- Uma vaga por clube entre os níveis continentais. Ganhar a Libertadores ou a
  Sul-Americana dá vaga adicional na Libertadores seguinte e participação na
  Recopa. A indicação nacional passa ao próximo clube disponível.
- Ganhar Champions ou Europa dá Champions; ganhar Conference dá Europa,
  salvo classificação à Champions. Na UEFA, uma vaga já conquistada na liga
  não se transforma em mais uma vaga nacional pelo título continental.
- Campeão de copa já classificado passa a indicação ao próximo disponível
  da liga, exceto onde há previsão de vice ou playoff na tabela abaixo.
- A proposta de renovação calcula a próxima edição a partir dos resultados
  concluídos, e não copia os torneios que o clube acabou de disputar.
- O primeiro ano tem quatro temporadas de preparação simulada para preencher
  campeões e tabelas anteriores. A lista nacional vem da primeira divisão.

## Os 17 países jogáveis

"Liga" significa a classificação anual simulada. Em países com Apertura,
Clausura e tabela acumulada, essa liga anual condensa suas indicações: não há
dois campeões nacionais independentes dentro de um ano do jogo. As quantidades
incluem vagas preliminares e diretas; não são apenas vagas de fase de grupos.

| País | Continental principal | Continental secundária | Terceira continental | Copa nacional e exceções |
| --- | --- | --- | --- | --- |
| Brasil | 5 pela liga + campeão e vice da Copa do Brasil | 6 pela liga, excluindo os da Libertadores | Nenhuma | Finalistas da copa já classificados cedem a vaga à liga. Titulares continentais somam vagas adicionais. |
| Argentina | 5 pela liga + campeão da Copa Argentina | 6 seguintes da liga | Nenhuma | A classificação anual condensa os campeões dos dois torneios e suas três indicações acumuladas. |
| Bolívia | 3 pela liga + campeão da copa | 3 pela liga + vice da copa | Nenhuma | Duplicatas passam à liga. Referência: Copa Paceña e campeonato de 2026. |
| Chile | 2 pela liga + campeão da Copa da Liga + vencedor do playoff | 3 pela liga + perdedor do playoff | Nenhuma | Próximo da liga enfrenta o campeão da Copa Chile. Campeão da Copa da Liga já classificado cede ao vice; Copa Chile também usa vice antes da liga. Indicação da copa exige elite. |
| Colômbia | 4 pela liga anual | 3 pela liga + campeão da Copa Colombia | Nenhuma | Campeão da copa precisa continuar na primeira divisão. O jogo condensa as duas indicações de campeões de liga e duas da tabela acumulada. |
| Equador | 3 pela liga + campeão da Copa Ecuador | 4 pela liga | Nenhuma | Se o campeão já tem Libertadores, tenta o vice da copa na elite e depois a liga. |
| Paraguai | 3 pela liga + campeão da Copa Paraguay | 4 pela liga | Nenhuma | Campeão da copa já classificado passa a indicação à liga. |
| Peru | 4 pela liga | 4 seguintes da liga | Nenhuma | A tabela anual condensa os playoffs e a classificação acumulada. Não há copa nacional no calendário do jogo. |
| Uruguai | 4 pela liga | 4 seguintes da liga | Nenhuma | A tabela anual condensa Campeonato Uruguaio, Intermedio e classificação acumulada. Copa AUF não cria uma vaga extra automática. |
| Venezuela | 4 pela liga | 4 seguintes da liga | Nenhuma | Liga anual condensa as fases nacionais; Copa Venezuela não acrescenta indicação continental automática no jogo. |
| Inglaterra | 4 pela liga, mais eventual vaga de desempenho | 1 pela liga + FA Cup | Copa da Liga | FA Cup dá Europa; Copa da Liga dá Conference. Duplicata de copa passa à liga. |
| Espanha | 4 pela liga, mais eventual vaga de desempenho | 1 pela liga + Copa del Rey | 1 seguinte da liga | Campeão da copa já classificado cede a indicação à liga. |
| Itália | 4 pela liga, mais eventual vaga de desempenho | 1 pela liga + Coppa Italia | 1 seguinte da liga | Mesma redistribuição da copa. |
| Alemanha | 4 pela liga, mais eventual vaga de desempenho | 1 pela liga + DFB Pokal | 1 seguinte da liga | Mesma redistribuição da copa. |
| França | 4 pela liga, contando a indicação preliminar, mais eventual vaga de desempenho | 1 pela liga + Coupe de France | 1 seguinte da liga | Mesma redistribuição da copa. |
| México | 6 para Champions Cup | Nenhuma | Nenhuma | A liga anual condensa campeões, vices de Apertura/Clausura e a classificação acumulada. |
| Estados Unidos | 5 pela liga + US Open Cup para Champions Cup | Nenhuma | Nenhuma | A liga anual condensa MLS Cup, Supporters' Shield, outra conferência e classificação acumulada. |

### Vagas de desempenho da UEFA

As duas associações com melhor desempenho continental médio na temporada
simulada recebem uma indicação adicional à Champions no ano seguinte. A regra
real usa coeficientes por partidas e bônus. O Craque condensa esse coeficiente
pela posição final dos representantes nos três torneios: para índice `i` a
partir de zero, `max(0, 10 - 2 × ceil(log2(i + 1)))`, somando 2 na Champions,
1 na Europa e 0 na Conference. A soma é dividida pelo número de clubes distintos
da associação. Empate usa o código do país. Não se fixam Inglaterra e Espanha
para todas as décadas da carreira.

### Playoff chileno

Uma partida neutra com sorteio próprio define a última indicação. A força-base
dos dois clubes e a escala 4,5 da partida única são usadas tanto no cartão de
proposta quanto na montagem do calendário. Portanto a classificação não muda
depois de o usuário renovar. Esse duelo de indicação é condensado na seleção
dos participantes, sem criar uma partida controlável extra entre temporadas.

### Limites do mundo representado

O regulamento real da Concacaf também inclui Leagues Cup, Canadá, América Central
e Caribe. O jogo tem apenas México e Estados Unidos como países de clubes dessa
confederação; suas indicações confirmadas são as descritas acima. Não existe uma
Leagues Cup fictícia nem se atribui sua vaga a um clube arbitrário. Da mesma
forma, não há estaduais, todas as séries inferiores ou torneios regionais de
todos os países. As copas nacionais usam os clubes efetivamente presentes no
mundo e um mata-mata condensado. A Copa da Liga chilena é restrita à elite.

## Supercopas, Mundial e Intercontinental

Supercopas nacionais usam campeão da liga e da copa do ano anterior; se for
o mesmo, entra o vice da liga na adaptação do jogo. Recopa e Supercopa da UEFA usam os campeões da
principal e secundária anteriores. O calendário condensa formatos nacionais
com mais de dois participantes, como a Supercopa chilena.

O Mundial acontece a cada quatro anos. Usa campeões continentais das quatro
edições anteriores e ranking dos clubes para completar as cotas representadas:
12 UEFA, 6 CONMEBOL e 4 CONCACAF, com participantes genéricos das confederações
sem ligas no jogo para completar 32. A Intercontinental tem seis campeões
continentais da temporada corrente e o europeu entra na final; continentes sem ligas usam adversários
genéricos. Isso é uma adaptação explícita do mundo jogável, não um elenco real
completo de uma edição futura.

## Rei da América

Referência: eleição de El País para jogadores que atuam no continente, inclusive
MLS, independentemente de nacionalidade. No jogo, exige elite, 25 jogos, OVR 78
e ótimo rendimento; nacionalidade sul-americana em clube europeu não dá
elegibilidade. Bento, com projeção fora das Américas, não disputa esse prêmio.
Os perfis de referência incluem os candidatos reais descritos por El País;
OVR, auge e aposentadoria são projeções fictícias, como no restante da elite.
Na geração futura, 85% dos concorrentes atuam na Europa e, dos demais, 80%
nas Américas, em sorteio separado da evolução.

## Fontes oficiais e do organizador

- [CBF, Conselho Técnico da Série A de 2026](https://www.cbf.com.br/a-cbf/noticias/parecer-do-ccei/a/cbf-realiza-conselho-tecnico-da-serie-a-de-2026): cinco vagas da liga e duas da copa para 2027.
- [CBF, Copa do Brasil 2026](https://www.cbf.com.br/futebol-brasileiro/noticias/copa-verde/profissional/copa-do-brasil-de-2026-tera-recorde-de-participantes-e-17-estreantes).
- [CONMEBOL, campeão da Sudamericana](https://gol.conmebol.com/sudamericana/es/news/lanus-campeon-de-la-conmebol-sudamericana): Libertadores e Recopa seguintes.
- [CONMEBOL, Manual Libertadores 2026](https://cdn.conmebol.com/wp-content/uploads/2025/12/Manual-de-Clubes-CONMEBOL-Libertadores-2026-ESP.pdf) e [Manual Sudamericana 2026](https://cdn.conmebol.com/wp-content/uploads/2025/12/Manual-de-Clubes-CONMEBOL-Sudamericana-2026-ESP.pdf): cotas de associações e campeões.
- [AFA, regulamento LPF 2026](https://assets1.afa.com.ar/2026/BOLETINES/Boletin-Resoluciones-6818---Complementario-01---Reglamento-Torneos-LPF-Primera-2026.pdf).
- [FBF, temporada 2026](https://fbf.com.bo/temporada-2026-de-la-division-profesional/) e [Copa Paceña](https://fbf.com.bo/copa-pacena-2026/).
- [ANFP, bases da Liga de Primera 2026, artigos 85 e 87](https://www.anfp.cl/?jet_download=76787e8731095b0f64dc7be885f0c3ab1294adb9).
- [DIMAYOR, Liga 2026](https://dimayor.com.co/wp-content/uploads/2026/01/REGLAMENTO-LIGA-2026-V12.pdf) e [Copa 2026](https://dimayor.com.co/wp-content/uploads/2026/04/REGLAMENTO-COPA-2026-V5.pdf).
- [FEF, Copa Ecuador](https://www.fef.ec/wp-content/uploads/2025/04/Reglamento-Copa-Ecuador-2025.pdf).
- [APF, Copa Paraguay](https://www.apf.org.py/copa-paraguay).
- [FPF, Liga 1](https://fpf.org.pe/wp-content/uploads/2025/02/Reglamento-Liga1-Te-Apuesto-2025-v3.pdf).
- [AUF, Copa Uruguay 2026](https://auf.org.uy/copa-auf-uruguay-2026/). A classificação anual usa as cotas CONMEBOL e condensa os torneios da liga.
- [FVF, Copa Venezuela 2026](https://www.fvf.com.ve/articulos/vuelve-la-copa-venezuela-la-fvf-anuncia-el-inicio-de-la-edicion-2026). O anúncio não fundamenta vaga continental adicional; preservam-se as cotas confirmadas pela CONMEBOL.
- [UEFA, artigo 3 de 2026/27](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-3-Entries-for-the-competition-Online?contentId=EgXhqnzQsuW60mwbyCqWtw): acesso por campeões e associações.
- [UEFA, vagas europeias de desempenho](https://www.uefa.com/uefachampionsleague/news/02a2-1fdbe9a25733-8d37ff5f9226-1000--2026-27-uefa-champions-league-which-teams-are-in-the-euro/).
- [Premier League, FA Cup e vagas europeias](https://www.premierleague.com/en/news/4657287/how-the-fa-cup-final-will-affect-european-qualification/).
- [Concacaf, regulamento Champions Cup 2026](https://www.concacaf.com/media/mouphckx/26-ccc-regs-spa.pdf).
- [El País, candidatos e critérios do Rei da América](https://www.elpais.com.uy/ovacion/futbol/encuesta-el-pais-los-jugadores-que-se-candidatean-a-rey-de-america-2025-y-sus-meritos-para-ir-por-el-premio).
