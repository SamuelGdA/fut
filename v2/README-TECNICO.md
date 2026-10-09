# Técnico: a carreira de treinador do Futeiros

O **Técnico** é o segundo jogo do hub Futeiros (o primeiro é o Craque, a
carreira de jogador). Você monta um treinador, recebe três propostas de clubes
do seu país, quase sempre da segunda divisão, e comanda clubes por até **24
temporadas**: até três ações por etapa (vender, contratar, treinar,
desenvolver, subir da base, vestiário, pedir verba), escalação e tática
livres, um evento por etapa e o mundo inteiro jogado partida a partida, com
elencos reais. Ao fim de cada temporada, a diretoria avalia o trabalho, a
reputação muda e chegam as propostas da temporada seguinte.

Duas regras de produto mudam o jeito de jogar:

- **Sem salvamento** (D51). A carreira vive só na memória da aba. Recarregar
  ou fechar a página encerra a carreira e abre o hub. A tela avisa antes de
  começar, antes de sair, no `beforeunload` do navegador, no aviso de versão
  nova e no painel de erro.
- **Só competições de clubes, por enquanto** (D55). O Técnico não tem
  seleções, convocações nem competições de seleções. O Craque continua com as
  dele.

Este documento explica o Técnico para quem nunca viu o código: como se joga,
como o motor calcula cada coisa e onde cada parte mora. A especificação
completa, com todas as tabelas, está na
[seção 42 do GDD](docs/GDD.md#42-técnico-a-carreira-de-treinador); o hub, na
[seção 41](docs/GDD.md#41-o-hub-do-futeiros); o porquê das escolhas, nas
decisões D50 a D58 de [docs/DECISOES.md](docs/DECISOES.md). O resto do projeto
está no [README.md](README.md). **Antes de mudar qualquer coisa, leia
[AI_RULES.md](AI_RULES.md).**

## Índice

1. [Como se joga](#1-como-se-joga)
2. [O motor](#2-o-motor)
3. [As contas](#3-as-contas)
4. [O mundo](#4-o-mundo)
5. [Elencos e fontes de dados](#5-elencos-e-fontes-de-dados)
6. [A interface](#6-a-interface)
7. [Laboratório](#7-laboratório)
8. [Balanceamento](#8-balanceamento)
9. [Testes e comandos](#9-testes-e-comandos)
10. [Limitações conhecidas e próximos passos](#10-limitações-conhecidas-e-próximos-passos)

---

## 1. Como se joga

### 1.1 O laço

```
identidade ──► 3 propostas ──► etapa (até 3 ações + tática) ──► evento ──► simulação ──► resultados
                                   ▲                                │ (pausa: decisão no jogo)   │
                                   │                                ▼                            │
                                   └── 2º turno (só no ritmo lento) ◄────────────────────────────┤
                                                                                                 ▼
                                         próxima temporada ◄── propostas ◄── avaliação ◄─────────┘
```

1. **Identidade.** Nome (até 16 letras), país de origem, ritmo e aparência de
   terno. Só os 15 países com segunda divisão no jogo entram (ARG, BOL, BRA,
   CHI, COL, ECU, ENG, ESP, FRA, GER, ITA, PAR, PER, URU e VEN); México e
   Estados Unidos ficam de fora porque não têm segunda divisão (D53). Os dez
   países cuja segunda divisão foi completada com jogadores gerados levam a
   marca ◆.
2. **Propostas iniciais.** Três sorteios independentes: cada um tira 95%
   segunda divisão e 5% primeira, entre os clubes do seu país, sem repetir
   clube. Em média, 14,3% das carreiras recebem pelo menos uma proposta de
   primeira. O cartão mostra clube, divisão, força, objetivo, verba, folha,
   receita, situação financeira e dificuldade (1 a 5). Clube maior não é
   emprego mais fácil: a cobrança vem junto.
3. **Etapa.** Até 3 ações. Cada ação é um processo: abrir e escolher é livre;
   **confirmar gasta 1 das 3**; as respostas chegam (propostas, sim ou não dos
   jogadores e dos clubes, resultado da conversa); aceitar ou recusar cada
   resposta não gasta nada; "Concluir" fecha e recusa o que ficou pendente.
   Cancelar antes de confirmar não custa nada. Dinheiro, folha e elenco só
   mudam no aceite. Escalação, formação, filosofia e a consulta ao elenco são
   livres e não gastam ação.
4. **Evento.** Um por etapa, sem gastar ação. Em 38% das etapas
   (`STAGE_EVENTS.matchShare`) o evento é uma decisão no meio de um jogo, que
   fica armada para a simulação. No resto, é um evento fora de campo
   (proposta pelo reserva, protesto da torcida, crise de lesões...), resolvido
   antes de simular. Cada opção mostra o que faz e a chance, quando há sorteio.
5. **Simulação.** O período inteiro, dia a dia, para todas as ligas e copas do
   mundo. Se a decisão no jogo estava armada, a simulação para no minuto,
   mostra placar, adversário, mando e agregado, e cada opção traz o objetivo e
   as chances exatas de vitória, empate e derrota. O resultado entra na tabela
   ou na chave de verdade.
6. **Resultados.** Campanha, copas, evolução de OVR do elenco, lesões, relações,
   dinheiro, momentos, revelações, promessas resolvidas, características novas.
7. **Avaliação** (fim da temporada). Objetivo cumprido ou não, confiança da
   diretoria (abaixo de 27, demissão), reputação e as propostas: renovar,
   assinar com outro clube ou encerrar.
8. **Fim.** Aposentar é possível a partir do fim da primeira temporada (pelo
   menu ou pela avaliação). Ao fim das 24 temporadas, a carreira termina e vai
   para o **legado**: clubes, títulos, acessos, quedas, demissões, reputação,
   sala de troféus, temporada a temporada e jogadores marcantes. O legado
   também não é salvo.

### 1.2 Os dois ritmos

| Ritmo | Etapas por temporada | Ações e eventos por ano | Períodos simulados |
|---|---|---|---|
| Rápido | 1 | 3 ações, 1 evento | dias 0 a 364 |
| Lento | 2, uma por turno | 6 ações, 2 eventos | dias 0 a 149 e 150 a 364 |

A temporada tem 300 dias de jogos e 65 de férias (`CALENDAR_DAYS`). No lento,
evolução, salários e receitas usam fração 0,5 em cada turno, e as duas metades
somam o mesmo que o período único do rápido. A meta do harness "Rápido = lento"
confere isso (seção 8).

### 1.3 O que a tela mostra e o que esconde

| Escondido (só no motor) | O que a tela mostra |
|---|---|
| Nível contínuo do jogador | OVR, o nível arredondado |
| Potencial | Uma frase: pode crescer muito, ainda deve crescer, pode crescer um pouco, perto do limite, no auge, na fase final da carreira |
| Satisfação de 0 a 100 | Uma palavra: satisfeito, neutro, insatisfeito |
| Fase de −2 a +2 | Uma palavra: em grande fase, boa fase, fase normal, fase ruim, fase péssima |
| Rendimento efetivo em campo | Nada |
| Chance exata de uma contratação | Uma faixa: quase impossível, difícil, possível, provável |

A tela só lê os jogadores pela projeção `apps/game/src/features/tecnico/view.ts`.
O teste `view.test.ts` serializa as vistas e reprova se o nível, o potencial, a
satisfação em número, a longevidade ou as notas recentes aparecerem. O valor de
mercado aparece sempre como estimativa ("≈"), porque o preço real sai da
negociação.

---

## 2. O motor

O motor do Técnico mora em `packages/engine/src/coach/` e é exportado em
`@craque/engine/coach`, fora do índice do motor do Craque (o Craque não baixa
nada disto). As regras do projeto valem aqui também: puro (sem React, DOM,
relógio, `Math.random`, `Date`, armazenamento ou textos), determinístico pela
semente e com todos os números de equilíbrio num lugar só, `tuning.ts`. O teste
de pureza (`packages/engine/test/purity.test.ts`) varre também esta pasta.

| Módulo | O que faz |
|---|---|
| `tuning.ts` | Todos os números: ações, calendário, partida, filosofias, previsibilidade, treino, lesões, satisfação, promessas, evolução, Desenvolver, base, finanças, venda, contratação, verba, avaliação, reputação, propostas, mercado da IA |
| `types.ts` | O estado da carreira (`CoachCareer`), jogadores, clubes, partidas, fluxos de ação, eventos, relatórios, histórico |
| `world.ts` | Cria o mundo: clubes com força derivada do elenco, âncora, receita, caixa; `COACH_COUNTRIES` |
| `players.ts` | Jogador inicial (nível, potencial escondido, longevidade), valor, salário, fase, humor e rendimento efetivo |
| `competitions.ts` | Calendário e formatos de todas as competições de clubes; sorteios de cada fase; tabelas e chaves |
| `match.ts` | O jogo do treinador minuto a minuto (gols, autores, notas, lesões, trocas, pênaltis) e a conta de gols esperados |
| `tactics.ts` | Formações, filosofias, previsibilidade e a escolha de abordagem da IA |
| `lineup.ts` | Ficha de cada jogo: escalação válida, rotação, promessas, banco e inscrição |
| `season.ts` | Simula um período em ordem cronológica, com a pausa da decisão no jogo |
| `actions.ts` | As 7 ações como processos, as respostas, as prévias de dinheiro e as conversas |
| `market.ts` | A conta da contratação, procura e compradores das vendas, transferências |
| `events.ts` | Catálogo de eventos fora de campo, decisão no jogo, efeitos e promessas |
| `evolution.ts` | Evolução do nível por período, declínio, Desenvolver e características novas |
| `report.ts` | O resumo de cada período |
| `review.ts` | Fim da temporada: acesso e queda, premiação, avaliação, reputação, propostas, verba |
| `rollover.ts` | Férias: âncoras, aposentadorias, jovens e mercado da IA, elencos viáveis |
| `career.ts` | A máquina de fases e `coachCommand`, a única porta de entrada |
| `probes.ts` | Contas exatas para o laboratório e o harness (odds, filosofias, Mundial, curvas de contratação) |
| `util.ts` | Fluxos de sorteio (`coachRng`), dias absolutos, chaves de etapa |

**Determinismo.** Todo sorteio vem de `coachRng(semente, rótulo, ...partes)`,
um fluxo próprio do sistema `coach` no gerador do projeto (`rng.ts`), separado
por rótulo (`"player"`, `"sale"`, `"talk"`, `"funds"`, `"event"`, `"draw"`...).
Os fluxos do Craque não mudaram. A mesma semente e os mesmos comandos dão a
mesma carreira. A semente é sorteada a cada carreira; a suíte ponta a ponta
fixa uma pelo `sessionStorage` (`futeiros.e2e.seed`).

**Comandos.** `coachCommand(carreira, comando)` nunca altera o estado recebido:
devolve um estado novo ou o mesmo com o código da recusa. Cada comando valida a
fase (`offers`, `stage`, `event`, `matchEvent`, `results`, `review`, `ended`) e
o fluxo aberto; repetido ou fora de fase, é recusado sem efeito, então clique
duplo não vende duas vezes nem simula duas vezes. Os comandos leves
(`setTactics`, `autoLineup`, `openAction`, `cancelAction`) fazem cópia rasa; os
pesados (`simulate`, `chooseMatchEvent`, `decide`, `acceptOffer`) levam perto
de um segundo e a tela pinta o aviso "Simulando os jogos" antes de começar
(`runHeavy` no store).

---

## 3. As contas

Os números abaixo estão em `packages/engine/src/coach/tuning.ts`; o nome da
constante aparece entre parênteses.

### 3.1 A partida

Uma só conta de gols esperados vale para todos os jogos do mundo:

```
λ = 1,32 × e^(0,045 × (ATQ − DEF_adv) + 0,02 × (MEI − MEI_adv) ± 0,11)
    × filosofia × bola parada × treino × previsibilidade × decisão no jogo
λ limitado a [0,12; 4,2]; mando +0,11 em casa, −0,11 fora, 0 em campo neutro   (MATCH)
ATQ = 0,75 × ataque + 0,25 × meio
DEF = 0,65 × defesa + 0,20 × goleiro + 0,15 × meio                            (SECTOR_MIX)
setor = média do rendimento de quem joga nele + 1,2 × (jogadores a mais que a base)
```

- **IA contra IA**: gols por `Poisson(λ)` de cada lado, com o melhor time
  disponível na formação fixa do clube.
- **Jogo do treinador**, minuto a minuto: gol com chance `λ / 90` por minuto,
  recalculado com quem está em campo; autor pelo peso da vaga vezes
  `(nível / 70)³`; assistência em 78% dos gols; nota de 3 a 10 com base 6,2.
- **Mata-mata empatado**: prorrogação com um terço dos gols esperados
  (`MATCH.extraTime`) e pênaltis, com conversão
  `limitar(0,76 − 0,004 × (goleiro − 70); 0,62; 0,86)`.
- **Com 6 pontos de vantagem em todos os setores** (elite europeia contra o
  melhor sul-americano), o favorito vence cerca de 60% a 65% num jogo único.

**Filosofias** (`PHILOSOPHY`), multiplicadores dos gols a favor e contra:

| Filosofia | A favor | Contra | Para quem |
|---|---|---|---|
| Ofensiva | × 1,2 | × 1,12, aliviado pela própria defesa | quem é bem mais forte |
| Defensiva | × 0,8 | × 0,76 | quem é bem mais fraco |
| Posse | `1 + limitar(0,02 × (MEI − MEI adv); −0,1; 0,1)` | × 0,92 | quem tem o meio melhor |
| Contra-ataque | × 1,13 contra ofensiva ou posse, × 0,86 contra defensiva, mais até 6% com velozes | × 0,94 | quem enfrenta time exposto |

Nenhuma é sempre melhor: no relatório, a defensiva vence com 8 ou 12 pontos a
menos, o contra-ataque com 5 a menos e em forças iguais, a posse com 3 ou 5 a
mais, a ofensiva com 8 ou 12 a mais.

**Previsibilidade** (`PREDICTABILITY`): cada jogo com o mesmo esquema soma 0,04
a `p` (de 0 a 1); o adversário ganha `+6% × p` de gols e o time perde `3% × p`.
Mudar a formação, a filosofia ou 4 titulares reduz `p` por sorteio (às vezes
funciona bem, às vezes pouco). Metade de `p` passa de temporada. Com `p ≥ 0,5`
a etapa dá a pista "Os adversários estão lendo o seu esquema".

**Treino** (`TRAINING`): +4%, +2,5% e +1,5% num setor, no máximo 8%, valendo no
período seguinte (ataque: gols a favor; defesa: gols contra; meio: metade de
cada).

### 3.2 Lesões e substituições

- Chance por minuto jogado `(0,022 / 90) × (1 + 0,04 × máx(0; idade − 28))`,
  vezes 0,75 com Incansável (`INJURY`). Gravidade: 70% leve (4 a 14 dias), 25%
  média (15 a 45), 5% grave (60 a 180). As férias contam para a recuperação.
- Trocas automáticas pela Lei 3 da IFAB (`SUBSTITUTIONS`): até 5 trocas em 3
  paradas além do intervalo. Lesionado sai no minuto; sem troca legal, o time
  segue com um a menos.
- Banco de 12 no Brasil, Itália e Argentina; 9 nos demais (`BENCH_SIZE`).

### 3.3 Satisfação e rendimento escondido

A satisfação vai de 0 a 100 e aparece só como palavra (satisfeito com 66 ou
mais, insatisfeito abaixo de 40). Cada jogo mexe nela conforme o papel que o
jogador espera ter (estrela, titular, rotação, reserva, promessa): a estrela
fora perde 1,8 por jogo, o reserva quase nada. A campanha mexe em todos no fim
do período, e tudo volta 10% em direção a 60.

```
rendimento = nível + limitar(máx(−4; humor + fase) + características; −4; 3) + penalidade de posição
humor: insatisfeito −3; neutro 0; satisfeito +1     (MOOD_OUTPUT)
```

Um 75 insatisfeito rende como 72. A barra "Elenco" do placar é a média das
satisfações e nenhuma conta de partida a lê: não há penalidade coletiva a mais.

### 3.4 Evolução e Desenvolver

```
ganho = fração × 5 × idade × folga × minutos × (1 + 0,15 × desempenho) × mentor
declínio = fração × (0,35 × x + 0,08 × x²), x = idade − (31 + longevidade), por setor
nível novo = nível + ganho − declínio + N(0; 0,6 × √fração), nunca acima de potencial + 1
```

A longevidade sorteada é `N(0; 1,5)` anos, com um piso para quem já está num
elenco no começo: o declínio não pode ter começado mais de um ano antes
(`EVOLUTION.veteranOverStart`). Alguns jogadores seguem ótimos até 37 ou 39.

**Desenvolver** (`DEVELOP`): até 3 jogadores por etapa, uma marca por jogador.

```
bônus = limitar(0,25 × (potencial − nível); 0,8; 2,2) × fator + |N(0; 0,25)|
fator: até 21 anos 1; até 25, 0,8; até 29, 0,5; acima de 29, só corta a queda pela metade
```

No relatório, com o mesmo jogador e a mesma sorte: até 21 anos o ganho médio
sobe 1,93 de nível; de 22 a 25, 1,21; de 26 a 29, a chance de o OVR subir vai
de 69,0% para 90,8%.

### 3.5 Base

Cinco garotos por etapa (`YOUTH`), de 16 a 19 anos: 60% medianos, 25% fracos,
12% bons, 3% craques, com OVR e potencial relativos à âncora do clube. A tela
mostra posição, idade, país, característica, custo e salário, e uma descrição
("Cru", "Regular", "Promissor", "Especial") que aponta a faixa vizinha em 30%
das vezes. OVR e potencial verdadeiros só aparecem depois de subir.

### 3.6 Finanças e verba

```
receita = 0,3 × valor do elenco inicial × (1ª divisão 1; 2ª 0,8)            (FINANCE)
caixa por período += receita × fração − folha mensal × 12 × fração
teto da folha = 70% da receita (contratar acima disso é bloqueado)
verba da temporada = 0,4 × receita + 0,3 × máx(0; caixa − 0,2 × receita) + 0,5 × sobra
venda aceita: preço no caixa e 60% na verba
```

Premiação em fração da receita: campeão da liga 12%, copa 6%, continental ou
Mundial 20%, acesso +25%, queda −5%. A receita da temporada seguinte sobe 25%
com acesso, cai 20% com queda e sobe 5% com título.

**Pedir verba** (`FUNDS`): a folha mostra as chances e os valores antes de
confirmar.

```
confiança = σ((diretoria − 55) / 8); saúde = σ((caixa / receita + 0,05) / 0,08)
repetição = 0,6 ^ pedidos anteriores na temporada
muita verba: 0,45 × confiança × saúde × repetição  → 6% da receita × repetição
pouca verba: 0,55 × (0,5 + 0,5 × confiança) × (0,4 + 0,6 × saúde) × repetição → 2,5% × repetição
recusa: o resto; no máximo duas liberações por temporada
```

Metade das liberações grandes vem com condição (objetivo um degrau acima),
mostrada antes do aceite.

### 3.7 Avaliação, confiança e demissão

```
s = objetivo + copas + finanças + promessas + (torcida − 50) / 100
objetivo = limitar((esperada − posição) / máx(2; n / 5); −2; 2) ± 0,3 (cumpriu) + 0,8 (acesso) − 1,2 (queda)
C' = limitar(0,6 × C + 0,4 × s; −1,5; 1,5)        C começa em 0,5 em cada clube novo
confiança = 50 + 12 × s + 15 × C'                  demissão abaixo de 27   (EVALUATION)
```

A tela mostra a confiança e o termo que mais pesou. Promessas cumpridas e
quebradas valem ±0,2 cada, até ±0,6; desfeitas numa conversa não contam. Com a
política equilibrada do harness, as demissões ficam entre 8% e 15% por
temporada.

### 3.8 Reputação e propostas

A reputação vai de 0 a 100 e começa em 15. Por temporada:
`Δ = 3,2 × s + 4 por título grande + 2 por outro + 3 (acesso) + 2 (livrou da
queda) + até 3 por revelações`, maior em clubes fortes e limitada a ±12
(`REPUTATION`). Ela aponta uma faixa de clubes pelo percentil de força no
mundo (15% com reputação 0, 95% com 100), com propostas de fora do país a
partir de 35 de reputação. Mantido no cargo: renovação mais 1 a 3 propostas.
Demitido: 2 a 4, uma garantida de segunda divisão; o clube que demitiu fica
fora por 3 temporadas (`OFFERS`).

### 3.9 A conta da contratação

Trazer alguém muito melhor que o seu time deve ser muito difícil, e um craque
mundial num clube pequeno, quase impossível (D56). A chance de um negócio é a
do **jogador querer** vezes a do **clube dele liberar** (`market.ts`, números
em `PURCHASE`).

**Passo 1: a atratividade do comprador.**

```
atratividade = força + 2 × (prestígio − 3) + 0,25 × (força média da liga − 70)
               + continental (primária 1,5; secundária ou terciária 0,7)
               + 0,06 × (reputação do técnico − 40)      (só no clube do treinador)
```

**Passo 2: a expectativa do jogador.** O próprio OVR, puxado para baixo quando
ele joga num clube bem menos atraente do que ele (até 3 pontos,
`PURCHASE.ambitionCap`): o craque de um clube pequeno aceita um vizinho do
mesmo porte, nunca um clube bem menor. Sem clube, `OVR − 3`.

```
expectativa = OVR − mín(3; 0,5 × máx(0; OVR − atratividade do clube atual))
lacuna = expectativa − atratividade do comprador
descida = força do vendedor − força do comprador
folga = 4, + 4 se ele não é estrela nem titular lá, + 3 com 32 anos ou mais
```

**Passo 3: o jogador quer?**

```
jogador = limitar(σ((2,5 − lacuna) / 1,6) × σ((folga − descida) / 2,2) × estrela × papel; 0,0001; 0,97)
estrela (OVR 85+, comprador abaixo de OVR − 1): máx(0,05; 1 − 0,15 × (OVR − 84))
papel que teria no comprador: estrela ou titular × 1,15; reserva × 0,5; rotação ou promessa × 1
```

**Passo 4: o clube libera?**

```
clube = base do papel lá (estrela 25%; titular 55%; rotação 80%; reserva 92%; promessa 70%)
        × σ((força comprador − força vendedor + 3) / 2,5) × 1,6      (só estrela ou titular)
        × 1,5 se ele está à venda × 1,3 com 31 anos ou mais, entre 1% e 97%
```

**Exemplo 1: Mbappé (91, Real Madrid, força 86,6) no Flamengo (força 80,9).**
A atratividade do Flamengo é 86,9; a do Real Madrid, 94,2. Mbappé já joga num
clube mais atraente do que ele, então não há desconto: expectativa 91, lacuna
4,06, nível `σ((2,5 − 4,06) / 1,6) = 0,274`. A descida é 5,73 com folga 4:
fator 0,313. Estrela de 91: `máx(0,05; 1 − 0,15 × 7) = 0,05`. Papel no
Flamengo: estrela, × 1,15. O jogador quer com 0,49%. O Real libera uma estrela
com 25% × `σ((80,9 − 86,6 + 3) / 2,5)` × 1,6 = 10,1%. **Negócio: 0,05%**
(o relatório mede 0,0497%). Quase impossível, não impossível.

**Exemplo 2: Pedro (81, titular do Flamengo) no Goiás (força 70,5, Série B).**
Atratividade do Goiás 68,6: lacuna 12,4, fator de nível 0,002; descida 10,5,
fator 0,05. O jogador quer com 0,012% e o Flamengo libera um titular com 4,2%.
**Negócio: 0,0005%**.

**Exemplo 3: Edenilson (71, rotação no Vitória, força 76,1) no Goiás.**
Lacuna 2,42 (fator 0,513), descida 5,64 com folga 8 por não ser titular (fator
0,745), papel de estrela no Goiás (× 1,15): o jogador quer com 44%. O Vitória
libera um jogador de rotação com 80%. **Negócio: 35%, "Possível"**.

**Na tela**, a chance vira faixa: abaixo de 5% "Quase impossível", abaixo de
25% "Difícil", abaixo de 55% "Possível", acima "Provável". A busca esconde os
quase impossíveis até o jogador pedir. Confirmar sorteia as respostas: o clube
não libera, o jogador não tem interesse, ou o clube aceita com preço e salário
pedidos.

```
preço = valor × faixa do papel (estrela 1,35 a 1,6; titular 1,15 a 1,35; rotação 1 a 1,15;
        reserva 0,85 a 1; promessa 1,1 a 1,4) × (1 + 0,03 × máx(0; descida))
salário = máx(salário atual × U(1,05; 1,3); salário do OVR) × (1 + 0,04 × máx(0; descida))
```

Aceitar exige verba, caixa acima de −25% da receita, folha abaixo do teto e
vaga na inscrição; a tela mostra verba, caixa e folha depois do negócio antes
do aceite, e cada aceite é validado de novo.

No relatório, a mediana da chance cai a cada degrau de diferença entre o OVR do
alvo e a força do comprador. Flamengo: 72,3% no próprio nível, 52,5% com +2,
27,8% com +4, 16,1% com +6, 0,87% com +8. Goiás: 54,2%, 27,3%, 7,5%, 1,2% e
0,13%.

---

## 4. O mundo

O Técnico usa os mesmos clubes, ligas e competições de clubes do Craque
(`packages/world`), agora jogados partida a partida (`competitions.ts`). A
memória da temporada anterior (tabelas, copas, continentais) vem do mundo do
Craque com a mesma semente, e a classificação continental segue a seção 8.7 do
GDD.

| Competição | Formato |
|---|---|
| Liga | Turno e returno pelo método do círculo, mando alternado; acesso e queda pelas vagas de cada liga |
| Copa nacional | Todos os clubes do país, mata-mata; Copa do Brasil em ida e volta a partir das oitavas |
| Copa da liga (ENG) | Mata-mata com semifinal em ida e volta |
| Supercopas | Jogo único em campo neutro |
| Continentais | Preliminar, grupos e mata-mata conforme o número de classificados (32 ou mais: 8 grupos e oitavas; 16 a 31: 4 grupos e quartas; menos: mata-mata); ida e volta, final única |
| Intercontinental | Campeões de CONMEBOL e CONCACAF e adversários genéricos de AFC, CAF e OFC; o vencedor enfrenta o campeão europeu |
| Mundial de Clubes | Anos com `ano % 4 == 1` (6 edições numa carreira que começa em 2026); cotas UEFA 12, CONMEBOL 6, CONCACAF 4; 22 clubes em campo neutro |

Cada fase de mata-mata é sorteada quando a anterior termina: o resultado do
treinador muda quem segue. **Nenhuma competição de seleções**: nem convocação,
nem Copa do Mundo, nem data FIFA (D55). A tela de competições diz "Só
competições de clubes".

**Europa contra América do Sul é só elenco.** Nenhum bônus de continente ou de
liga entra na conta. A sonda "trocado" do harness refaz cada duelo com os
elencos trocados de clube e o resultado inverte (erro 2,2e-16). Barcelona
(86,7) passa pelo Flamengo (80,9) num jogo único em 70,1%; com os elencos
trocados, 29,9%. No Mundial de Clubes, jogado 20 mil vezes com as chances
exatas, um clube de fora da Europa ganha 2,8% das edições, e o melhor
sul-americano (o Flamengo) 1,27%: difícil, mas possível.

---

## 5. Elencos e fontes de dados

A montagem (`packages/world/scripts/elencos/`, `pnpm elencos:montar`) é offline
e determinística, por camadas, nesta ordem (D52):

1. **EA FC 27** (`players.csv`, só homens). O FC 27 decide o clube de cada
   jogador, inclusive para tirar quem saiu para uma liga fora do jogo.
2. **eFootball**, só em clube com menos de 20 jogadores do FC 27 e só
   jogadores reais (`fake_version = 0`), com **OVR = carta base + 4**. Times
   sem licença (jogadores fictícios) são descartados e listados no relatório.
3. **Conhecimento**: jogadores reais escritos à mão, com OVR estimado pela
   âncora do clube e pelo papel no elenco.
4. **Gerados**, até 22 jogadores com 2 goleiros e a composição mínima por
   setor, na escala dos reais da mesma liga. Na tela, ◆ "Fictício"; o nome
   sai do id e da nacionalidade, sempre o mesmo.

- **Calibração medida**: em 80 jogadores presentes nas duas fontes, o FC 27
  fica 4,5 abaixo da carta base do eFootball + 4 na mediana (4,8 na média). O
  +4 foi mantido como pedido, e o laboratório mostra a diferença.
- **Ajuste da 2ª** (`DIVISION_GAP = 2,5`): numa segunda divisão sem clubes
  medidos suficientes, o melhor clube completado fica 2,5 abaixo do primeiro
  quartil dos 14 melhores da primeira do país. Sem isso, Ceará e Sport reais
  caindo numa Série B gerada faziam campeões de 100 pontos.
- **Teto inicial**: 30 jogadores acima de 21 anos por clube; os cortados vão
  para os livres.

Resultado (`packages/world/data/squads/relatorio.md`): **12.609 jogadores em 489
clubes**, 8.415 do FC 27, 818 do eFootball, 133 do conhecimento e 3.243
gerados.

| Grupo | Jogadores reais |
|---|---|
| Primeiras divisões de ENG, ESP, FRA, GER e ITA; Championship, 2. Bundesliga, Ligue 2; MLS e Liga MX | 100% |
| Brasileirão Série A e LaLiga 2 | 95% |
| Serie B italiana | 85% |
| Brasileirão Série B | 16% |
| Primeiras divisões de ARG, CHI e COL | 99% a 100% |
| Primeiras divisões de BOL, ECU, PAR, PER, URU e VEN | 46% a 69% |
| Segundas divisões de COL, CHI e ARG | 37%, 15% e 1% |
| Segundas divisões de BOL, ECU, PAR, PER, URU e VEN | 0% |

Os elencos ficam em `packages/world/data/squads/{país}.ts` (tuplas compactas,
um arquivo por país, cerca de 1 MB no pedaço do build), expostos em
`@craque/world/squads`. O teste `packages/world/test/squads.test.ts` confere ids
únicos (ninguém em dois clubes), elencos de 22 ou mais com 2 goleiros, idades
plausíveis e o tamanho de cada arquivo. `pnpm elencos:coletar` refaz a coleta do
eFootball (precisa de rede e de um Chromium; fica fora do `verify`).

---

## 6. A interface

| Tela | Arquivo | O que tem |
|---|---|---|
| Hub | `screens/hub/HubScreen.tsx` | Os dois cartões; o do Técnico avisa "Sem salvamento" e mostra a carreira em memória nesta aba |
| Identidade | `screens/tecnico/TecnicoIdentityScreen.tsx` | Nome, país (grade de bandeiras), ritmo, aparência, aviso sem save; no celular, em duas etapas |
| Aparência | `screens/tecnico/TecnicoAppearanceScreen.tsx` | O editor do Craque com o avatar de terno |
| Carreira | `screens/tecnico/TecnicoScreen.tsx` | A tela muda pela fase do motor: propostas, etapa, processo, evento, decisão no jogo, resultados, avaliação |
| Legado | `screens/tecnico/TecnicoLegacyScreen.tsx` | O resumo da carreira, sem save |

- **Celular**: placar compacto (clube, temporada, caixa, as três barras em
  palavra) e abas embaixo: Etapa, Elenco, Time, Clube, Mais. A etapa cabe sem
  rolar em 360 × 640; só as telas de exploração rolam.
- **PC**: o clube à esquerda, a etapa no meio, a exploração (Elenco, Time,
  Competições, Carreira) à direita.
- **Processo**: uma folha (`Process.tsx`) com os passos, o aviso "Usa 1 de 3
  ações" e o impacto em verba, caixa e folha antes de cada aceite; fechar a
  folha não perde as respostas, que vivem no motor.
- **Estado**: `features/tecnico/store.ts` (Zustand sem `persist`) é o único
  módulo que carrega o motor, os elencos e os textos do Técnico, e só entra
  quando o jogador começa. `presence.ts` diz ao hub e à barra se há carreira
  em memória, sem carregar o motor.
- **Textos**: interface em `apps/game/src/i18n/tecnico/{pt,es,en}.ts`; textos de
  jogo (eventos, conversas, motivos, conquistas) em
  `packages/content/src/locales/coach.{pt,es,en}.ts`. Sem travessão; testes
  reprovam chave faltando, marcador diferente e tradução que é cópia do
  português.
- **Acessibilidade**: radiogroups para país, formação, filosofia e setor;
  regiões que rolam entram no Tab; axe nos dois temas na suíte ponta a ponta.
- **Conquistas**: 19 (`COACH_ACHIEVEMENTS`, ids `tecnico:*`), no mesmo banco das
  do Craque, contadas em separado (D54). São a única coisa do Técnico que
  sobrevive ao recarregar.

---

## 7. Laboratório

Só em desenvolvimento: http://localhost:5173/#lab, área **Técnico** (a
primeira), em `apps/game/src/screens/lab/areas/TecnicoArea.tsx` e
`apps/game/src/screens/lab/tecnico/*`. Todas as seções usam as funções de
verdade do motor (`probes.ts` e os módulos), as mesmas do harness.

| Seção | O que mostra |
|---|---|
| Elencos e fontes | De onde vem cada jogador (FC 27, eFootball, conhecimento, gerado) por país, divisão e clube, com o elenco de cada clube |
| Sorteio das propostas iniciais | A fatia de segundas divisões em milhares de carreiras e as três propostas de uma semente |
| Simulador de partida | A conta exata de Poisson entre dois clubes, com os elencos trocados, e Europa contra América do Sul |
| Filosofias | Pontos por jogo de cada filosofia por diferença de força |
| A conta da contratação | Atratividade, expectativa, lacuna e cada fator, termo a termo, para qualquer jogador e comprador, a faixa da tela e a curva do comprador |
| Desenvolver | O mesmo jogador com a mesma sorte, com e sem a marca, e rápido contra lento |
| Rendimento escondido | OVR, satisfação, fase e quanto o jogador rende de verdade |
| Eventos | O catálogo com o peso de cada evento no clube escolhido |
| Finanças e verba | Receita, folha, teto, verba e alvos ao alcance de cada clube de um país |
| Temporada simulada | O mundo inteiro jogo a jogo no navegador, temporada por temporada, com campeões, Intercontinental, Mundial e uma carreira automática |

---

## 8. Balanceamento

```bash
pnpm balance:tecnico                       # 16 carreiras de 24 temporadas, grava o relatório
pnpm balance:tecnico:check                 # a mesma rodada, sem gravar; falha se alguma meta falhar (está no verify)
pnpm balance:tecnico --carreiras 32 --temporadas 24 --semente outra --cache arquivo.json
```

O harness (`tools/balance/src/tecnico/`) roda as **sondas**, contas exatas sem
sorteio, e as **carreiras automáticas** em paralelo (um trabalhador por
núcleo), com três políticas: equilibrada (treina, desenvolve, contrata ou sobe
da base), passiva (nenhuma ação) e gastadora (contrata em toda etapa). O
relatório versionado é `tools/balance/relatorios/tecnico.md`. As metas estão em
`targets.ts`; os valores medidos da última rodada estão na tabela abaixo.

| Meta | Alvo | Medido |
|---|---|---|
| Propostas iniciais: cada sorteio independente, 95% segunda divisão | 95% ± 0,5 ponto em 60 mil sorteios | 95,14% (pelo menos uma de 1ª em 13,9% das carreiras; esperado 14,3%) |
| Filosofias: cada uma é a melhor em alguma faixa de força, nenhuma em todas | as quatro aparecem como melhor | defensiva, contra-ataque, posse, ofensiva |
| Filosofias em forças iguais: diferença entre a melhor e a pior | no máximo 0,2 ponto por jogo | 0,053 |
| Só o elenco decide: trocar os elencos de dois clubes troca as chances (nenhum bônus de continente) | erro abaixo de 1e-9 | 2,2e-16 |
| Elite europeia × melhores do Brasil e da Argentina, mata-mata de jogo único | favorito passa em média entre 60% e 85%, nunca acima de 90% (difícil, mas possível) | média 79,9%, máximo 87,8% |
| Mundial de Clubes: difícil, mas possível para quem não é europeu (chaveamento jogado 20 mil vezes com as chances exatas) | fora da Europa entre 1% e 15% dos títulos; o melhor sul-americano com pelo menos 0,5% | 2,8% fora da Europa; melhor sul-americano Flamengo 1,27% (12 europeus em 22) |
| Contratar acima do próprio nível: quanto maior a diferença, mais difícil | mediana cai a cada degrau (resolução de 0,01 ponto); +8 abaixo de 5%; +12 ou mais abaixo de 0,5% | curvas em queda em todos os clubes |
| Mbappé no Flamengo: quase impossível, não impossível | entre 0,001% e 0,1% | 0,0497% |
| Desenvolver em jovens: ganho a mais na próxima atualização | pelo menos +1 de nível até 21 e de 22 a 25 anos | até 21: +1,93; 22 a 25: +1,21 |
| Desenvolver perto do auge (26 a 29 anos, com folga): chance de o OVR subir | pelo menos 90% e 15 pontos acima de não desenvolver | 90,8% contra 69,0% |
| Rápido = lento: evolução média numa temporada sem ações | diferença de no máximo 0,15 de nível | rápido 1,02, lento 0,97 |
| Verba de início dá para contratar sem pedir dinheiro (clubes de 2ª divisão) | pelo menos 90% com 3 alvos do nível ao alcance | 98,2% (sem: Ceará, Deportes Concepción, Jaguares de Córdoba, Palermo) |
| Comandos válidos da política nunca são recusados pelo motor | nenhum | nenhum |
| Campeão da primeira divisão é o clube mais forte do começo da temporada | entre 35% e 60% | 56,9% |
| Mundial de Clubes ganho por europeu nas carreiras (só pelo elenco, como os 17 dos últimos 18 da vida real) | pelo menos 85% (a chance exata de quem não é europeu está na sonda) | 99,0% em 96 edições; final com sul-americano em 7,3% |
| Intercontinental ganho pelo campeão europeu | entre 60% e 95% | 84,0% em 381 edições |
| Elencos da IA estáveis: tamanho entre 22 e 34 | pelo menos 95% dos clubes em todas as temporadas | 99,1% (menor 17, maior 40) |
| Jogadores ativos no mundo depois de todas as temporadas | a no máximo 10% do começo | 12619 → 13315 (+5,5%) |
| Força média das primeiras divisões no fim, contra o começo | todas a no máximo 3 pontos | pior: Liga FUTVE -2,6 |
| Lesões de 10 dias ou mais no elenco do treinador, por temporada | entre 4 e 15, no máximo 10% graves | 6,2 por temporada, 8,0% graves, 173 dias |
| Demissões por temporada com a política equilibrada | entre 8% e 15% | 11,5% em 192 temporadas (na primeira: 0,0%) |
| Usar as ações vale a pena: objetivo cumprido, equilibrada contra passiva | equilibrada à frente | 52,1% contra 37,5% |
| Negócio disponível cabe na verba e na folha (contratando em toda etapa, sem pedir verba) | pelo menos 70% das respostas positivas | 90,6% (77 de 85; 264 alvos procurados) |

Na rodada versionada (semente `tecnico-m1`, 16 carreiras, 384 temporadas), a política
equilibrada cumpre o objetivo em 52,1% das temporadas, a passiva em 37,5% e a gastadora em 45,8%;
as reputações finais médias são 44, 14 e 22. Uma temporada leva em média 1320 ms no rápido e 1851 ms
no lento (Node, trabalhadores em paralelo).

---

## 9. Testes e comandos

| O quê | Onde |
|---|---|
| Motor do Técnico | `packages/engine/test/coach/` (`offers`, `actions`, `season`, `model`, `promises`): 95/5, ações e limites, nunca vender duas vezes, dinheiro só no aceite, elenco viável, um evento por etapa, tabela igual à soma das partidas, promessas, rápido igual a lento, 24 temporadas, aposentadoria só depois da primeira |
| Pureza | `packages/engine/test/purity.test.ts` |
| Textos | `packages/content/test/coach.test.ts`: três idiomas iguais em forma, sem travessão, casados com o catálogo do motor, traduções de verdade |
| Elencos | `packages/world/test/squads.test.ts` |
| Interface | `apps/game/src/features/tecnico/view.test.ts` (nada escondido vaza), `apps/game/src/i18n/tecnico/tecnico.test.ts` |
| Ponta a ponta | `apps/game/e2e/tecnico.spec.ts`: do hub ao legado (propostas, três ações, evento, simulação, avaliação, aposentadoria, auditoria do armazenamento, axe), recarregar encerra a carreira, sair pede confirmação, ritmo lento, a etapa em 360 × 640 |

```bash
pnpm verify      # tipos, regras, testes, metas do Craque e do Técnico, build
pnpm e2e         # suíte ponta a ponta (PW_CHROMIUM_PATH sem Google Chrome)
```

---

## 10. Limitações conhecidas e próximos passos

- **Sem seleções, por enquanto.** Nenhuma competição nem convocação de
  seleções no Técnico (D55).
- **Sem save.** Recarregar encerra a carreira (D51).
- **Elencos completados.** A Série B tem 16% de jogadores reais e as segundas
  divisões sul-americanas são quase todas geradas; como o treinador quase
  sempre começa numa segunda divisão, muitas carreiras sul-americanas começam
  com elencos fictícios. A tela marca cada jogador gerado.
- **Notas estimadas.** A camada de conhecimento tem OVR estimado, e o eFootball
  + 4 fica cerca de 4,5 acima do FC 27 nos jogadores em comum.
- **Substituições automáticas.** O treinador escolhe titulares, banco, formação
  e filosofia; as trocas durante o jogo são do motor.
- **Mundial difícil para quem não é europeu.** Só o elenco conta, e a elite
  europeia é muito mais forte: 2,8% das edições vão para fora da Europa.
