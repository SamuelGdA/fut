# Técnico: a carreira de treinador do Futeiros
> **Versão atual D82.** Técnico `1.9.0`; Craque `2.0.0-m23`. As decisões de partida, promessa, reinvenção e feedback de resultado pertencem somente ao Craque; o sistema de rival pessoal foi removido. O Craque preserva o espaço do card durante a saída no celular e oferece setas no cabeçalho do jornal ampliado. `Sheet` aceita ações opcionais no cabeçalho, sem alterar regras do Técnico. Para orientação inicial e fórmulas atuais do Craque, consulte o resumo no início do README principal. As revisões ao fim deste documento prevalecem sobre as notas históricas de animações e ferramentas Windows.
>
> **Revisão D63 (12/10/2026).** Craque `2.0.0-m10`; Técnico `1.4.0`.
> A última carreira do Técnico em andamento é retomável neste aparelho por replay de
> setup e comandos; encerrá-la remove o registro. O Craque não guarda sessões de
> carreira; preferências, rascunhos, conquistas e ranking continuam independentes.
> As regras abaixo de D61 substituem as notas históricas sobre salvamento, finanças,
> formações, eventos, vibração e bônus por conquistas.


O **Técnico** é o segundo jogo do hub Futeiros (o primeiro é o Craque, a
carreira de jogador). Você monta um treinador, recebe três propostas de clubes
do seu país, quase sempre da segunda divisão, e comanda clubes por até **24
temporadas**: até três ações por etapa (vender, contratar, treinar,
desenvolver, subir da base, vestiário, pedir verba), escalação e tática
livres, um evento por etapa e o mundo inteiro jogado partida a partida, com
elencos reais. Ao fim de cada temporada, a diretoria avalia o trabalho, a
reputação muda e chegam as propostas da temporada seguinte.

Duas regras de produto mudam o jeito de jogar:

- **Retomar a última carreira** (D61). O Técnico guarda setup e comandos neste aparelho enquanto a carreira está em andamento. O hub permite continuá-la. Encerrar remove o registro; o legado encerrado permanece apenas nesta sessão.
- **Só competições de clubes, por enquanto** (D55). O Técnico não tem
  seleções, convocações nem competições de seleções. O Craque continua com as
  dele.

Este documento explica o Técnico para quem nunca viu o código: como se joga,
como o motor calcula cada coisa e onde cada parte mora. A especificação
completa, com todas as tabelas, está na
[seção 42 do GDD](docs/GDD.md#42-técnico-a-carreira-de-treinador); o hub, na
[seção 41](docs/GDD.md#41-o-hub-do-futeiros); o porquê das escolhas, nas
decisões D50 a D60 de [docs/DECISOES.md](docs/DECISOES.md). O resto do projeto
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
   resposta não gasta nada; "Concluir" fecha e preserva compras e vendas pendentes nesta etapa. Voltar ao processo não gasta outra ação; uma nova busca confirmada custa uma ação.
   Cancelar antes de confirmar não custa nada. Dinheiro, folha e elenco só
   mudam no aceite. Escalação, formação, filosofia e a consulta ao elenco são
   livres e não gastam ação.
4. **Evento.** Um por etapa, sem gastar ação. Em 38% das etapas
   (`STAGE_EVENTS.matchShare`) o evento é uma decisão no meio de um jogo, que
   fica armada para a simulação. No resto, é um evento fora de campo
   (proposta pelo reserva, protesto da torcida, crise de lesões...), resolvido
   antes de simular. Cada opção separa recompensa e consequência adversa, com faixas de risco quando há sorteio.
5. **Simulação.** O período inteiro, dia a dia, para todas as ligas e copas do
   mundo. Se a decisão no jogo estava armada, a simulação para no minuto,
   mostra placar, adversário, mando e agregado, e cada opção traz
   a pressão ofensiva, exposição defensiva e o plano, sem probabilidades numéricas na decisão. O resultado entra na tabela
   ou na chave de verdade.
6. **Resultados.** Campanha, copas, evolução de OVR do elenco, lesões, relações,
   dinheiro, momentos, revelações, promessas resolvidas, características novas.
7. **Avaliação** (fim da temporada). Objetivo cumprido ou não, confiança da
   diretoria (abaixo de 18 e objetivo não cumprido, demissão), reputação e as propostas: renovar,
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
confiança = 50 + 12 × s + 15 × C'                  demissão abaixo de 18 com objetivo não cumprido (EVALUATION)
```

A tela mostra a confiança e o termo que mais pesou. Promessas cumpridas e
quebradas valem ±0,2 cada, até ±0,6; desfeitas numa conversa não contam. Com a
política equilibrada do harness, a meta de demissões é entre 3% e 12% por
temporada.

As relações também respondem **a cada partida**, antes do fim do turno. Seja
`e = 0,65 − 0,3 × posição esperada / tamanho da liga` e `r = 1` na vitória,
`0,4` no empate, `0` na derrota: a diretoria varia `1,2 × (r − e)` e a
torcida `1,8 × (r − e)`, com ±0,6 extra em clássicos. Eventos, títulos e
promessas continuam contribuindo, sem contar o resultado duas vezes.

No ritmo lento, a demissão no primeiro turno exige **todos** estes critérios:
12 jogos de liga, no máximo 0,65 ponto por jogo, posição pelo menos
`máx(6; teto(35% × tamanho da liga))` abaixo da esperada e diretoria abaixo
de 58. A reputação cai 4. O técnico recebe propostas e o mundo termina a
temporada com IA; os jogos posteriores não entram no histórico do técnico.
As constantes vêm de `LIVE_RELATIONS` e também aparecem no laboratório.

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
| Identidade | `screens/tecnico/TecnicoIdentityScreen.tsx` | Nome, país (grade de bandeiras), ritmo, aparência, aviso de retomada da carreira; no celular, em duas etapas |
| Aparência | `screens/tecnico/TecnicoAppearanceScreen.tsx` | O editor do Craque com o avatar de terno |
| Carreira | `screens/tecnico/TecnicoScreen.tsx` | A tela muda pela fase do motor: propostas, etapa, processo, evento, decisão no jogo, resultados, avaliação |
| Legado | `screens/tecnico/TecnicoLegacyScreen.tsx` | O resumo da carreira encerrada, disponível nesta sessão |

- **Celular**: placar compacto (clube, temporada, caixa, as três barras em
  palavra) e abas embaixo: Etapa, Elenco, Time, Clube, Mais. A etapa cabe sem
  rolar em 360 × 640; só as telas de exploração rolam.
- **PC**: prancheta ampla e exploração (Time, Elenco, Clube, Competições, Carreira). Objetivo e relações ficam no cabeçalho.
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
  do Craque, contadas em separado (D54). Sobrevivem ao recarregar, assim como o diário da carreira em andamento.

---

### 6.1 Central de comando (D59/D60)

- Consulta em titulares, reservas e elenco: botão de informação abre em hover de
  300 ms/click no PC; no celular, bottom sheet. Troca de jogador usa botão separado.
  A ficha usa `PlayerRow`, sem potencial ou moral numéricos escondidos. Também
  aceita arrastar pelo cartão no PC e pelo puxador no toque, com rolagem na borda.
- Decisões: glifos, ganhos/custos e cenário adverso; risco por faixa, sem percentuais.
  No jogo, pressão/exposição relativas e objetivo do plano; uma alternativa em foco.
  Evento, conversa e reunião resolvem com Motion no layout. O relatório mostra
  a escolha em campo e o placar real, contagem animada e detalhes retráteis.
- Mercado: azul para compras já pagas no clube/ano, dourado para os alvos e vermelho para o excedente. A projeção fica visível durante a rolagem, sem duplicar despesas entre livro e relatório;
  preço negociado, folha mensal projetada e caixa até o piso de dívida no aceite.
  Excedente vermelho com valor; os bloqueios específicos continuam visíveis.
- Motor `COACH_VERSION 1.1.0`: rodar na crise tira 3 de satisfação dos titulares;
  acalmar o clássico tira 0,5 de fase deles. Mentor tira 0,5 de fase do veterano;
  foco individual tira 3 de satisfação dos jovens. Comemorar e concentração custam
  1% da receita anual cada. Investir na boa fase tira 2 de torcida. Apoiar o grupo
  tira 2 de confiança da diretoria. Descansar/elogiar têm 75% de sucesso: descanso
  falho tira 0,5 de fase e 2 de satisfação; elogio falho tira 2 de satisfação.
  Equilibrar no empate: gols a favor ×1,08, contra ×1,05. Os benefícios anteriores
  nos resultados favoráveis permanecem. Constantes em `DECISION_TRADEOFFS`.
- Teclado, dois temas e movimento reduzido continuam válidos. Informações
  secundárias em popovers e painéis; etapa sem rolagem da página no celular.

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

O harness (`tools/balance/src/tecnico/`) roda **sondas** do modelo (o Mundial
amostra 20 mil chaveamentos, com desempate por força) e as **carreiras automáticas** em paralelo (um trabalhador por
núcleo), com três políticas: equilibrada (treina, desenvolve, contrata ou sobe
da base), passiva (nenhuma ação) e gastadora (contrata em toda etapa). O
relatório versionado é `tools/balance/relatorios/tecnico.md`. As metas estão em
`targets.ts`; a tabela abaixo registra a rodada D58 (motor 1.0.0), mantida como
histórico. O relatório atual D60 (motor 1.2.0) passa as 23 metas: demissões 12,0%,
objetivos cumpridos 45,3% contra 33,3% da política passiva, em 384 temporadas.

| Meta | Alvo | Medido |
|---|---|---|
| Propostas iniciais: cada sorteio independente, 95% segunda divisão | 95% ± 0,5 ponto em 60 mil sorteios | 95,14% (pelo menos uma de 1ª em 13,9% das carreiras; esperado 14,3%) |
| Filosofias: cada uma é a melhor em alguma faixa de força, nenhuma em todas | as quatro aparecem como melhor | defensiva, contra-ataque, posse, ofensiva |
| Filosofias em forças iguais: diferença entre a melhor e a pior | no máximo 0,2 ponto por jogo | 0,053 |
| Só o elenco decide: trocar os elencos de dois clubes troca as chances (nenhum bônus de continente) | erro abaixo de 1e-9 | 2,2e-16 |
| Elite europeia × melhores do Brasil e da Argentina, mata-mata de jogo único | favorito passa em média entre 60% e 85%, nunca acima de 90% (difícil, mas possível) | média 79,9%, máximo 87,8% |
| Mundial de Clubes: difícil, mas possível para quem não é europeu (sonda de 20 mil chaveamentos com chances por partida e desempate por força) | fora da Europa entre 1% e 15% dos títulos; o melhor sul-americano com pelo menos 0,5% | 2,8% fora da Europa; melhor sul-americano Flamengo 1,27% (12 europeus em 22) |
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
| Interface | `apps/game/src/features/tecnico/view.test.ts` (nada escondido vaza; compras não se duplicam entre livro e relatório), `apps/game/src/i18n/tecnico/tecnico.test.ts` |
| Ponta a ponta | `apps/game/e2e/tecnico.spec.ts`: do hub ao legado (propostas, três ações, evento, simulação, avaliação, aposentadoria, auditoria do armazenamento, axe), recarregar permite retomar a carreira em andamento, sair pede confirmação, ritmo lento, a etapa em 360 × 640; consulta por hover/toque sem trocar o time, projeção e excedente financeiro, resolução animada nos dois temas |

```bash
pnpm verify      # tipos, regras, testes, metas do Craque e do Técnico, build
pnpm e2e         # suíte ponta a ponta (PW_CHROMIUM_PATH sem Google Chrome)
```

---

## 10. Limitações conhecidas e próximos passos

- **Sem seleções, por enquanto.** Nenhuma competição nem convocação de
  seleções no Técnico (D55).
- **Retomada local.** A última carreira em andamento é guardada por replay neste aparelho (D61). Registros de outra versão do motor são incompatíveis; o legado encerrado fica nesta sessão.
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

**Revisão de interface e motor (D60):** composição em duas colunas, HUD único de objetivo,
classificação e relações, arrasto de jogadores no mouse/toque, relatório visual.
Decisões com alternativa em foco e confirmação, sem rolagem e sem misturar chances
de vitória com metas táticas. Sem tela vazia de partida, próximos jogos parciais ou
evento de apostas. Reputação/finanças explicadas no i. Relações mudam a cada jogo;
diretoria mais paciente (demissão anual abaixo de 18 com objetivo não cumprido),
demissão no primeiro turno só em campanha desastrosa. Motor Técnico 1.2.0; detalhes
e limiares no README-TECNICO, GDD 42.17 e D60.

## D61: finanças, compromissos e retomada

A interface expõe apenas verba para contratações, folha mensal e situação.
Verba compra passes, paga custos de eventos e recebe a parte das vendas destinada
à comissão técnica. Nova temporada: `0,4 × receita de referência + 0,5 × sobra`.
A folha soma os salários mensais do elenco: limite interno `0,7 × receita / 12`,
mostrado na mesma barra, sem outra métrica. Situação: saudável até 70% desse limite,
equilibrada entre 70% e 90%, apertada a partir de 90%. Compra exige verba e espaço
na folha, além das regras de elenco; caixa não a bloqueia. Saúde salarial orienta
pedido de verba e avaliação. Aumentos realmente alteram salário. O evento de
pressão na folha oferece listar o maior salário ou reduzir todos em 5%, com −4 de
satisfação do grupo. Custos de eventos não podem produzir verba negativa.

Compromissos mostram jogador/grupo, realizado/meta e prazo; `promiseProgress`
calcula tanto a cobrança quanto o progresso visual. Lesão reduz disponibilidade;
com menos de três jogos disponíveis o acordo de presença é dispensado. Jogador
que deixou o clube não conta como acordo cumprido. Escalação automática continua
priorizando os minutos acertados; manter jogador bloqueia a venda até o prazo.

Catálogo recebeu treze situações contextuais e evita as três cenas recentes quando
há outras elegíveis. O painel `?` apresenta ciclo, características, finanças e acordos.
Grupos consultáveis vêm de `eventTargets`, a mesma seleção usada pela resolução.
Nomes de jogadores mostram OVR, idade, posição, fase, satisfação, papel, salário,
valor, leitura do olheiro, características e estatísticas, sem revelar teto ou dados ocultos.

O registro `futeiros.tecnico.save` contém versão/setup/comandos/avatar/metadados.
Cada comando bem-sucedido substitui o registro; reload abre o hub e oferece continuar.
Retomada reexecuta os comandos e valida pelo motor, cedendo quadros entre simulações.
Encerrar remove o registro; legado concluído continua somente nesta sessão. Registros
incompatíveis ou inválidos são descartados. Debug não substitui o registro normal.

Formações, coordenadas, arrasto bidirecional, fluxo da base e exclusão do laboratório
em produção estão descritos no [README geral, D61](README.md#revisão-d61-consultas-economia-e-sessão).

Conversas exibem um participante por vez; as alternativas e a confirmação cabem
sem rolar no celular. Concluir com conversas pendentes não escolhe nenhuma opção
por conta do treinador. O guia lista as nove características existentes.


A revisão final D61 inclui consultas de nomes nos relatórios de evolução, lesões,
compromissos e momentos; rolagem mais suave durante arrasto por toque. Cenários
internos preservam o registro normal mesmo ao abandonar o teste. No resumo de
cenário, replays de compartilhamento e “E se...?” ficam ocultos porque o perfil
alterado não vem das decisões da semente original; o pôster continua disponível.
Os imports de laboratório/debug são guardados diretamente por `import.meta.env.DEV`
para que seus módulos não sejam emitidos na distribuição de produção.

A vitrine separa tipo de prêmio e competição em duas linhas, com nome completo
na consulta e identificação acessível da quantidade. Validação D61: 679 testes
unitários, 71 de navegador aprovados/7 pulados por dispositivo, 51 metas do Craque
e 23 do Técnico; limitação preexistente do typecheck global documentada na D61.

No resumo, legendas de prêmios/torneios permanecem visíveis também em coleções
grandes no celular; a página cresce quando necessário. Painéis compactos do jogo
continuam usando o limite de altura e as decisões não ganham rolagem.

## D62: carregar apenas o modo escolhido

O hub não baixa os elencos nem o motor do Técnico. Entrar neste modo carrega
suas telas/dados e prepara seu grafo offline; entrar no Craque não baixa o
Técnico. O replay da última carreira e as regras financeiras continuam iguais.
A v2 é autossuficiente e a única implementação mantida no repositório.

## Revisão D63: elenco, resultados e legado

Motor `1.4.0`. As regras de D63 no [GDD 44](docs/GDD.md#44-elenco-mercado-reconhecimentos-e-legado-d63)
substituem lesões em dias, propostas por pouca reputação, encerramento das buscas
e o legado em lista. Objetivo é colocação explícita, com metas adicionais de
copas. A formação fica compacta/alcançável; arrasto parte da carta no campo.

A escalação automática usa todas as posições declaradas e o maior OVR possível;
lesionado não entra. Lesões ficam cerca de nove vezes menos frequentes por
minuto, por um ou dois turnos; no rápido o bloco contém a temporada. Base pode
ter secundárias vizinhas, não revela traços antes de subir e abre a consulta
no Time. Um a três jogadores chegam pela base/diretoria na virada. Aposentados
são avisados pelo nome; renovação mantém quem continua no elenco.

Compra/venda ficam consultáveis na etapa, com filtros para vender e nova busca
explícita. Ofertas espontâneas vêm após o relatório, sem gasto de ação. Relações
reagem à posição contra o esperado e às conquistas, mais no fechamento anual.
Reputação alta aproxima clubes maiores e inclui oferta do país atual.

Mundial quadrienal de 32 com grupos e mata-mata, Intercontinental anual dos
seis campeões em ramos distintos. Títulos são celebrados com as mesmas taças do
Craque. Reconhecimentos anuais do treinador e dos jogadores aparecem no fim do
ano; jogador ganha +1 por prêmio, máximo +3/ano e OVR 99. O legado tem números,
vitrine, pessoas no auge, linha do tempo e exportação de pôster de lousa.
D63 validada: verify integral aprovado (tipos, lint, 702 testes unitários, 51 metas do Craque, 23 do Técnico e build). Navegador: 77 aprovados e 7 pulados por dispositivo, sem falhas. Conferência visual de Craque e Técnico em PC/celular e nos dois temas, incluindo legado, abas, nomes, base, conquistas das duas temporadas e pôsteres. Arrasto da carta corrigido retirando a sobreposição fixa das formações; trocas com reservas passaram em mouse/toque. Busca preservada após outra ação e retomada local passaram no navegador.

**Calibragem D63.** A produção usa coeficiente de nível dos gols 0,032 (antes 0,035), para a contribuição extra do clube não inflar o resultado típico. Caudas raras: gols/temporada 63/7; gols/carreira 890/75; seleção 136/22; Chuteiras de Ouro 3/3,5 (começo/escala). O investimento do clube é 0,006 × participação × diferença positiva até 35, no máximo 0,21 por ano antes da reversão. A parcela imediata é 0,22 até 15 de vantagem mais 0,04 por ponto extra até 35, no máximo 4,1 vezes a participação.
Reforço adulto da diretoria exige elenco abaixo de 30 e folga de pelo menos dois salários projetados; caso contrário chega um jovem. Receita pode crescer mais 0,4% por posição acima da esperada, limitado a 4% na temporada, além dos ajustes existentes por elenco, título, acesso e queda. A política automática considera a projeção do lote inteiro de compras, a folga salarial, os jovens utilizados e o setor mais fraco; em elenco cheio, prefere treinar a subir mais um jovem. Isso testa as decisões financeiras que a interface apresenta.

D63: a força do campo concorrente da Bola de Ouro sobe de 7 para 7,25, preservando a meta de 40% a 60% de Fenômenos de ataque com ao menos um prêmio na carreira.

D63: a comparação do benefício das ações usa pares com a mesma semente, nacionalidade e ritmo. Ambas as políticas usam a escalação automática livre antes de cada etapa; a política equilibrada aproveita os atletas contratados e desenvolvidos. As metas mantêm a exigência de que usar ações cumpra mais objetivos, corrigindo o viés anterior de comparar países e sementes diferentes.

D63: a meta de demissões da política equilibrada passa de 3% a 12% para 1% a 12%. A escalação ótima gratuita agora aproveita reforços e evolução em ambos os grupos, e a comparação usa carreiras pareadas. A rodada registra 1,6% de demissões, 79,2% de objetivos cumpridos com ações contra 67,7% sem ações. Não se aumenta artificialmente a cobrança para demitir treinadores que superam seus objetivos.

D63: a sonda do Mundial usa vitória/empate/derrota nos grupos, sem prorrogação, e chances de avanço apenas no mata-mata. Potes e desempate por força simplificam a amostra; ela estima o torneio, sem reproduzir uma edição inteira. A formação compacta rola com o painel para não cobrir destinos de arrasto.

D63: a entrega de prêmios registra o ano processado mesmo se nenhum veio para o clube comandado. Consultar novamente não aplica outra vez o bônus de OVR dos vencedores de outros clubes.

D63: na amostra ampliada (500 Fenômenos por posição e política), 19 das 21 marcas foram alcançadas. Gols de seleção e seis Chuteiras de Ouro não ocorreram nesta amostra (melhores: 142 gols e cinco prêmios); o relatório registra os zeros. As caudas mantêm probabilidades positivas, sem teto de contagem, cobertas nos testes de pressão. Não se afrouxam as regras apenas para forçar uma ocorrência neste lote. O relatório corrige o nome do ritmo para Intensa, efetivamente usado pela ferramenta.

D63: fichas de titulares e reservas ficam suspensas durante o arrasto controlado por ponteiro. A consulta volta a funcionar ao terminar a troca.

D63: mouse e toque usam o mesmo arrasto controlado por ponteiro. A rolagem nativa do navegador podia deslocar o destino entre mover e soltar; agora a rolagem de borda é controlada pelo jogo nos dois dispositivos. Mouse aceita a carta/linha inteira; toque mantém o gesto no jogador do campo e no puxador do banco.

Reteste D63 do arrasto: cinco repetições por dispositivo (dez cenários executados, dez pulados por dispositivo) aprovadas, incluindo titular/banco em ambos os sentidos e clique normal de consulta antes da troca. Captura de ponteiro conserva o botão original para não consumir esse clique.


## Revisão D64: qualidade do jogador e carreira do treinador

Motores: Craque 2.0.0-m11 e Técnico 1.5.0. Estas regras substituem os valores
e os fluxos de D63. A ajuda do Craque é relativa à força atual do clube:
0,3 por ponto de vantagem até 15, mais 0,06 por ponto adicional até 35,
multiplicado pela participação. O máximo é 5,7. A permanência acrescenta
0,01 vezes participação vezes vantagem positiva até 35 à força do ano
seguinte (máximo 0,35), antes da reversão existente de 30%. A consulta do OVR
explica a força do clube e a ajuda potencial com participação integral.

Rei da América existe nos dois modos para quem atua na elite das Américas,
independentemente da nacionalidade. Exige pelo menos 25 jogos e ótimo rendimento,
com concorrentes do mesmo ano. Cada reconhecimento mantém +1 OVR, limitado a
+3 por ano e OVR 99. No Técnico, a IA recebe a mesma régua de notas por gols,
assistências, resultados e jogos sem sofrer gol. Craque de copa exige semifinal
e participação em pelo menos 60% dos jogos; artilharia continua sendo por gols.

A classificação continental e a proposta de renovação usam a mesma memória da
temporada concluída. Campeões da Libertadores e Sul-Americana entram na
Libertadores seguinte; campeões de Champions e Europa entram na Champions,
e o de Conference entra na Europa se não tiver vaga superior. Vagas nacionais
e redistribuições são descritas em docs/CLASSIFICACOES.md. Copas e tabelas não
geram participação duplicada em torneios continentais de níveis diferentes.

Mercado espontâneo só abre no começo do segundo turno ou após renovar.
Nunca oferece um lote que, aceito inteiro, deixe menos de 18 jogadores ou
dois goleiros. Vender bloqueia essa seleção antes de gastar ação e explica
o motivo. Reposição da diretoria pode contratar atletas já existentes no
estado atual do mundo, preservando suas características, ou promover jovens.
Chegadas compradas pela diretoria recebem a mesma marca de nova contratação.

Promessas só podem nascer no primeiro turno do lento. São conferidas nos onze
escolhidos pelo usuário ao iniciar a simulação do segundo turno; lesão dispensa
a cobrança. A IA não escolhe automaticamente um prometido para cumprir o acordo.
A escalação ótima maximiza OVR com posições secundárias e desempata por
característica, juventude, satisfação/fase e ordem estável.

Resultados recentes elevam a ambição do clube. Um campeão da primeira divisão
passa a buscar a faixa de cima da tabela; repetir o título aproxima a cobrança
de disputar a taça. Conquistar liga de elite ou continental principal eleva a
faixa de clubes interessados, com preferência por propostas nacionais fortes.

Legado e pôster do Técnico seguem o desenho do Craque: carta grande de treinador,
capítulos fixos, passagens por clube, vitrine, seis números no pôster, três clubes
principais e curva de reputação. Cabeçalhos com setas ordenam posição, OVR, nome,
idade e valor; filtros ficam na própria coluna. A estrela fica na bolinha do
OVR. Conquistas identificam a competição, usam animação e sinal sonoro
respeitando volume, silêncio e movimento reduzido.

D64, calibragem e regulamentos: bônus do campo concorrente da Bola de Ouro
8,25 (antes 7,25); mantêm-se as metas de raridade e de títulos. A primeira
calibragem passou as 51 metas sem alterar seus limites. O Craque soma 0,3
por ponto acima da força do clube até 15 e 0,06 por ponto extra até 35;
5,7 de ajuda máxima com participação integral. Um jogador 96 num clube
82 soma 4,2 à força efetiva, em lugar de 3,08 da D63. Investimento anual:
0,01 vezes participação vezes vantagem positiva até 35, máximo 0,35.
Rei da América tem OVR mínimo 78 e 25 jogos; no Técnico, nota média mínima
7. No Craque, produção ofensiva de pelo menos 30 (gols + metade das
assistências) ou 18 jogos sem sofrer gol para posições defensivas. Os perfis
regionais diferenciam Américas de Ásia; nove referências americanas
complementam a elite, e a região futura usa fluxo separado (85% Europa;
dos demais, 80% Américas). Bônus, idade de auge e aposentadoria são projeções.

A referência de classificação dos 17 países, fontes e simplificações fica em
CLASSIFICACOES.md. Duas vagas UEFA por desempenho anual médio são calculadas
no mundo simulado; Chile inclui Copa da Liga da elite e playoff de indicação.
Mundial do Craque também tem 32 participantes (22 representados, nove genéricos
e uma indicação de anfitrião norte-americano), como no Técnico. Intercontinental
usa os campeões da temporada corrente nos dois modos. Copa do Brasil tem final
única desde a referência 2026. Treinador mundial exige clube da primeira divisão.

A carta do Técnico mantém a moldura e proporções do Craque, com reputação,
retrato em medalhão e prancheta de giz desenhando a formação registrada no
auge. Os números da carta têm tamanho adequado para quatro dígitos. O corpo
da busca de contratação rola inteiro, com verba fixa no alto e confirmação
fixa no pé: os cabeçalhos nunca comprimem a lista até zero no celular.

D64: os testes do motor usam dois processos simultâneos para não disputar toda a CPU entre as simulações completas. As verificações, amostras e o prazo de cada teste permanecem iguais.

## Evolução gradual de todos os clubes (D65, 14/10/2026)

Craque `2.0.0-m12` e Técnico `1.5.1`. A mesma régua vale para cada clube,
inclusive os da IA. Títulos somam à evolução anual: liga de elite +0,4;
segunda divisão +0,2; copa nacional +0,15; copa da liga ou supercopa +0,1;
continental principal +0,6; secundário +0,25; terceiro nível +0,15;
Recopa/Supercopa UEFA +0,1; Intercontinental +0,25; Mundial de Clubes +0,6.
Taças diferentes somam, limitadas a +1,2 na temporada; uma taça duplicada não conta.

O jejum começa zerado no início da carreira e é atualizado só quando o ano
fecha, sem contar o aquecimento. Qualquer título de clube zera o jejum.
Os primeiros três anos sem taças não geram penalidade. O quarto tira 0,02;
o quinto, 0,04; do sexto em diante, no máximo 0,06 por ano. A perda máxima é
menor que o ganho do menor título. Conquistas de seleções, prêmios individuais,
acesso e bom resultado sem taça não zeram esse contador.

No Craque, isso participa da força persistente do clube, separadamente da
ajuda do OVR do jogador. No Técnico, participa da âncora usada pela base e pelo
mercado da diretoria; a força em campo continua derivada dos jogadores presentes.
Nos dois modos permanecem retorno de 30% à referência, ruído anual de 0,6,
limite de ±10 da referência e efeitos de acesso/queda. Esses freios evitam
crescimento infinito ou decadência automática de clubes modestos.

A consulta do OVR explica o efeito no Craque; a aba Clube do Técnico mostra
o jejum desta carreira e a influência sobre formação/contratação. O laboratório
explica a régua nos três idiomas. A nova bateria confere todos os tipos de taça,
o prazo de tolerância, limites, fim do jejum e aplicação a todos os clubes,
com as mesmas sementes, sem interferir no sorteio das partidas.

Validação final D64/D65 (14/10/2026): `pnpm verify` aprovado, com 737 testes
unitários, 51 metas do Craque e 23 do Técnico. A rodada ampliada `pnpm balance`
(6.000 carreiras por lote e 60 mundos de 25 temporadas) também atende as 51 metas;
nenhum limite foi afrouxado. `pnpm balance:tecnico --check` registra 384 temporadas
no motor 1.5.1, com 23/23 metas. `pnpm e2e` executa 77 cenários aprovados e sete
pulos previstos por dispositivo, sem falhas. PC e celular de 360 × 640 foram
conferidos visualmente nos dois temas; legado também em português, inglês e espanhol.

`pnpm balance:recordes`, motor 2.0.0-m12, amostra 2.250 carreiras (150 Fenômenos
por posição em cada uma de três políticas), observa 20 das 21 marcas. O recorde
de gols pela seleção não ocorreu neste lote, com máximo 142 ante a referência 146;
o zero permanece no relatório. As probabilidades positivas e a ausência de teto
artificial continuam verificadas pelos testes de pressão, sem facilitar o prêmio
para forçar ocorrência. O pôster PNG foi exportado e inspecionado em 1080 × 1350;
a prancheta não cobre o nome, e uma carreira de temporada única não duplica o
rótulo da curva. Os relatórios de balanceamento estão em `tools/balance/relatorios/`.


## Revisão D66 (16/10/2026)

Craque `2.0.0-m13` e Técnico `1.6.0`. Esta revisão reúne os pedidos de 15/10 e a auditoria dos pedidos anteriores nos dois modos.

- Troféus completos, com nomes por hover/foco/toque, prêmios individuais por competição e ordem editorial de importância compartilhada pelos dois modos e pôsteres. Prêmios de competição ficam abaixo de todas as taças; a contagem não aumenta a importância. O pôster mantém 1080 px de largura e mínimo de 1350 px de altura, crescendo para acomodar a coleção inteira.
- Detalhes da temporada começam fechados, com preferência persistente. Defensores mostram jogos sem sofrer gol entre os números da temporada.
- Descoberta tardia: dos 24 aos 30 anos, OVR entre 55 e 74 e pelo menos 12 jogos, chance de 0,15% por temporada elegível de alcançar 78 a 86 OVR. Uma vez por carreira, potencial elevado pelo menos ao novo alvo +3, sorteio independente da evolução normal. Os prodígios de estreia continuam: 14% dos Estrelas e 26% dos Fenômenos, cerca de 3,24% da distribuição Normal. Físico reduz risco de lesão pela regra já existente.
- Torcida a partir de 80 pode conceder uma temporada adicional de tolerância ao banco (duas com 95), com chance de 60% a 90% em cada ano extra. Apoio popular também amplia em até 3 OVR a tolerância para permanência quando o mercado some. Efetivação do empréstimo não recebe missão Volta para casa.
- Técnico: buscas e colunas em Desenvolver e Conversar; contratação começa por chance (provável, possível, difícil, quase impossível), com posição e limites OVR vazios; filtro por coluna preserva escolhas durante a etapa. Fichas abrem à esquerda no PC. Campo verde nos dois temas, estrela e aviso de improvisação separados. Debug de atleta individual. Vaga titular vazia impede avançar e simular.
- Escalação usa atribuição global por rendimento na posição, inclusive alternativas. A IA também usa atribuição global, evitando escolhas locais que desperdiciavam jogadores versáteis.
- Rival: chance de negociação ×0,45, limitada a 24%, e preço ×1,2. A faixa nunca ultrapassa Difícil. Reputação positiva ×1,1, teto anual +11; perdas mantêm teto -10. Notas ruins retiram até 0,9 de nível por ano antes do ruído e do declínio.
- Previsibilidade: sobe 0,04 por partida multiplicado por característica fixa do clube entre 0,7 e 1,3. No máximo, gols próprios -16% e rivais +28%; 85% da leitura passa para o ano seguinte. Mudanças mantêm as recuperações sorteadas anteriores.
- Finanças: verba base 32% da receita; até 30% da sobra, limitada a 20% da receita, retorna. Investimento líquido do ano anterior reduz a parcela base em `min(30%; 0,5 × investimento / receita)`. Verba nunca supera caixa +20% da receita. Operação do clube consome 20% da receita; salários anuais têm teto de 65%. Salários se ajustam 35% por ano em direção ao nível do atleta. Compras da diretoria apenas para vagas descobertas, elenco abaixo de 26 e chance anterior de 35%; chegadas de base continuam de 1 a 3.
- Uma entrada curta no segundo tempo não satisfaz estrela/titular como uma escalação inicial. Hat-tricks identificam adversário. Invencíveis exige título de liga completo e zero derrotas.

Os relatórios de simulação ficam em `tools/balance/relatorios/`. A prévia e o PNG acompanham a altura real da coleção, inclusive após a montagem do portal; o laboratório usa a mesma medição. O encerramento não cobra uma próxima temporada nem promete conquistas futuras numa carreira encerrada.


### Formato e dados da Champions no Técnico

A fase de liga contém 36 participantes, quatro potes de nove por coeficiente
quinquenal simulado (o campeão anterior lidera o primeiro pote), oito rodadas
com 18 partidas, dois rivais de cada pote, um em casa e outro fora. São quatro
mandos por clube, sem repetir adversário. As duas primeiras e as duas últimas
rodadas têm mandos opostos; nunca há três mandos iguais consecutivos. O sorteio
procura evitar a mesma associação e limita a dois os adversários de qualquer
outra associação. Uma exceção doméstica só é habilitada quando a composição
numérica dos potes exige a flexibilização prevista pela UEFA; ela aparece na
consulta da competição, em vez de ficar oculta.

1º ao 8º seguem às oitavas. 9º/10º enfrentam 23º/24º, 11º/12º enfrentam
21º/22º, 13º/14º enfrentam 19º/20º e 15º/16º enfrentam 17º/18º no playoff;
a volta é na casa dos cabeças. Oitavas distribuem 1º/2º, 3º/4º, 5º/6º e
7º/8º em metades opostas e contra o grupo correspondente do playoff. A chave
fica fixa até a final. Os caminhos dos quatro primeiros protegem o mando da
volta das quartas; os dos dois primeiros protegem a semifinal. Quem elimina
um cabeça herda seu caminho. A final é única e neutra. São 189 jogos no total.
Dias de referência: fase de liga 31/52/73/94/115/136/157/169; playoff 183/190,
oitavas 206/213, quartas 234/241, semifinal 255/262 e final 283. Datas conflitantes
com ligas/copas são deslocadas pelo calendário comum.

Desempate da liga: pontos, saldo, gols, gols fora, vitórias, vitórias fora,
pontos/saldo/gols somados dos adversários e coeficiente. Cartões não são
simulados e por isso o critério disciplinar é neutro para todos. Coeficiente
usa as últimas cinco temporadas simuladas, com dois pontos por vitória e um
por empate, bônus de classificação da Champions (12 para o líder, menos 0,25
por posição até 6,25 no 24º; seis para os demais) e 1,5 por avanço de oitavas
até final. Os anos anteriores ao início são aproximados pela força inicial;
Europa League/Conference ainda usam o bônus de fase do modelo simplificado.
Esses coeficientes são do mundo do jogo, não os números oficiais dos clubes.

As cinco ligas europeias jogáveis fornecem seus classificados pelas regras já
existentes, incluindo campeões Champions/Europa League. Para completar 36 sem
inflar suas cotas, o mundo do Técnico contém vinte representantes gerados de
outras associações UEFA: POR/NED/BEL com dois cada e TUR/GRE/CZE/NOR/DEN/AZE/
CYP/KAZ/SCO/AUT/SUI/SRB/CRO/SWE com um. Os melhores completam as vagas restantes.
Eles têm jogadores e resultados simulados, nomes de representantes explícitos,
força inicial de 68 a 81 e elenco de 24. Não são clubes reais nem propostas de
emprego, e suas ligas domésticas não são jogáveis. A consulta pode mostrar esses
atletas porque as estatísticas pertencem ao mesmo mundo simulado.

Fontes de formato: [sorteio UEFA 2025/26](https://www.uefa.com/uefachampionsleague/news/029a-1de997bb1779-486bab913658-1000--uefa-champions-league-league-phase-draw/),
[sorteio das eliminatórias 2025/26](https://www.uefa.com/uefachampionsleague/news/02a2-1ffe3d954170-60c0b7443c85-1000--uefa-champions-league-round-of-16-quarter-final-and-semi/?gsid=68f92188-a93f-4043-bf1a-90a337907ffe),
[artigo 19](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-19-Draw-system-knockout-phase-Online)
e [artigo 18](https://documents.uefa.com/r/Regulations-of-the-UEFA-Champions-League-2026/27/Article-18-Equality-of-points-league-phase-Online).
A numeração dos artigos 2026/27 confirma a estrutura já descrita pela UEFA para
2025/26; as datas acima são do calendário abstrato do jogo.

### Estatísticas, posições e expectativas

A aba Estatísticas consulta o elenco ou todos os atletas ativos, com nome/clube,
posição principal ou secundária, competição e ordenação por coluna. Mostra jogos,
gols, assistências, jogos sem sofrer gol e nota média; a vista defensiva acrescenta
titularidades, minutos e gols sofridos. A ficha dedicada soma os totais e detalha
cada competição: inclui participação em gols. Notas são médias ponderadas pelo
número de jogos. Não inventa desarmes, defesas ou chutes que não existem no motor.
Nos jogos detalhados, minutos e gols sofridos respeitam a entrada/saída; clean
sheet exige pelo menos 60 minutos sem sofrer gol enquanto estava em campo.
Nos jogos rápidos da IA os onze atuam por 90 minutos no modelo simplificado.

Improvisação mantém a penalidade de posição: alternativa -1, mesmo setor -3,
outro setor -7 e goleiro -25, com redução pela característica Polivalente.
Aprendizado de uma posição vizinha exige oito jogos como titular com pelo menos
60 minutos e nota média 7. A chance por posição elegível é 6% por ano (3% por
metade); no máximo uma é aprendida em cada atualização. A experiência acumulada
é reiniciada na virada anual; posições aprendidas permanecem.

A expectativa não depende apenas da ordem de jogadores no setor: OVR pelo menos
três acima da força do clube exige papel de estrela; adulto de pelo menos 21 anos
com OVR a partir de força menos um exige titularidade, mesmo com concorrência.
Entradas breves não substituem essa exigência. Na virada, papéis não são
rebaixados automaticamente para justificar banco a quem antes tinha titularidade.

A reserva inicial de caixa da segunda divisão varia entre 12% e 30% da receita;
a primeira conserva a faixa de -8% a 30%. Assim os menores podem negociar sem
remover o limite de folha de 65% nem a redução de verba pelo investimento passado.
A base dos clubes da IA tem potencial médio âncora menos 1,5; a do treinador
conserva âncora menos três. A IA não compra se deixar o vendedor com menos de
18 jogadores ou dois goleiros. Ambição anual combina 60% da referência do elenco
e 40% da melhor colocação recente; títulos ainda elevam o piso de cobrança.
A dispensa anual exige objetivo não cumprido e confiança abaixo de 12, com a
mesma memória de campanhas anteriores. Crises no meio do ano mantêm sua regra.

### Escopo de validação e carregamento

As 51 metas originais do Craque continuam medindo a curva biológica isolada,
sem a descoberta tardia. Não se ampliou o limite de salto natural para tornar a
exceção comum: o novo salto tem uma sonda separada com dez mil temporadas elegíveis,
faixa 78 a 86, limite de uma descoberta e casos inelegíveis. A integração na
temporada completa também é verificada. A estreia excepcional já existia e foi
observada no navegador: atleta de 16 anos com 40 jogos e OVR final 75.

O carregamento do Técnico monta mais de 13 mil atletas e calendários de todo o
mundo. O modo de desenvolvimento também recompila módulos e carrega o catálogo
de elencos; isso não representa o tempo da versão compilada. A escalação global
agora calcula cada custo uma vez e reaproveita índices de elenco, em vez de
recalcular a pontuação dentro de cada passagem do algoritmo. O sorteio da Champions
usa cobertura exata com padrões de mando balanceados por pote. A aplicação já
pré-carrega os módulos do modo e pinta o aviso antes das operações pesadas.
Recomenda-se avaliar a versão compilada para publicação; mover a simulação a um
worker é uma alternativa futura caso a medição no dispositivo alvo ainda mostre
bloqueio perceptível. Essa alternativa não é declarada implementada.

Na IA, a fase anual soma uma oscilação comum do clube de desvio 1,3 à oscilação
individual de desvio 0,5, sempre limitada entre -2 e +2. Isso permite campanhas
melhores e piores sem tirar a influência da qualidade. O treinador conserva
a fase pelas notas efetivamente registradas. Totais de prêmios contam cada
conquista de competição uma vez e descartam seu selo anual resumido; jornal
e demais coleções mostram todas as imagens, compactando o espaço quando preciso.

D66, complemento de calibração: na conta dos gols esperados, valores de setor
acima de 80 entram como `80 + 0,7 × (valor - 80)`, para ambos os lados. A qualidade
continua ajudando; o ganho marginal diminui no topo, sem limitar o OVR exibido.
A política equilibrada de laboratório/harness reage à pista de previsibilidade
a partir de 0,5: alterna ofensiva/posse quando a expectativa é o terço superior
e defensiva/contra-ataque nos demais. Os controles passivo e treinar+comprar
continuam com filosofia fixa. Essa mudança de política é explícita; o motor
não lê a política. As 23 metas e seus limites permanecem inalterados.

A contratação mostra chance na própria coluna e carrega mais 120 resultados por vez, sem descartar os demais alvos. No celular, Estatísticas tem uma aba própria. O laboratório distingue a política passiva (sem ações) da equilibrada (treino, desenvolvimento e adaptação da filosofia); seu resumo de teste fica somente na sessão atual.

### Validação D66

`pnpm verify` aprovado: 754 testes unitários, 51 metas Craque e 23 metas Técnico,
mais tipos, lint e build. `pnpm balance` ampliado mantém as 51 metas, com
6.000 carreiras por lote e 60 mundos de 25 temporadas. O relatório completo do
Técnico cobre 16 carreiras e 384 temporadas, sem comandos válidos recusados.

O cenário específico do Barcelona começa com onze atletas de OVR 92 e usa
quatro sementes pareadas em três políticas, 12 carreiras de 24 temporadas.
A Champions foi conquistada entre zero e cinco vezes por carreira; houve
derrotas na liga em 287 das 288 temporadas. Equipes boas continuam favoritas,
mas treino e compras repetidos não asseguram taças. O relatório registra todos
os resultados, inclusive quando a política equilibrada perde para a de controle.

`pnpm balance:recordes`, motor m13: 2.250 carreiras, 150 Fenômenos por posição
em cada uma de três políticas, 20/21 marcas observadas. Gols pela seleção:
máximo 142 ante referência 146, sem forçar ocorrência ou esconder o zero.
Descoberta tardia tem regressão separada em dez mil elegíveis e integração
na temporada real; os limites das 51 metas biológicas permanecem intactos.

Navegador real: Craque rápido e Técnico até 24 temporadas, PC e 360 × 640,
claro e escuro, contratação, desenvolvimento, vestiário, gramado, estatísticas,
Champions, legado, consulta de atletas no auge e pôster. Coleção com 41 tipos
de conquistas exportada e inspecionada em 1080 × 2261. A regressão verifica
que a prévia acompanha a imagem e que o PNG inclui toda a altura.

A suíte ponta a ponta final executou 92 cenários: 85 aprovados e sete pulos previstos por dispositivo, sem falhas. Inclui regressões da faixa OVR, posição, estatísticas por competição e coleção grande de pôster nos dois temas e tamanhos. A lista temporária de 86 itens foi conferida integralmente e removida conforme solicitado.


## Revisão D67: cobrança por conquistas, propostas e instalação Windows

Técnico `1.7.0`; Craque permanece `2.0.0-m13`.

- Diretoria: clubes da elite com objetivo `title` têm peso 1. Clubes com força ≥80, prestígio ≥4 e posição esperada entre os primeiros `ceil(25% da liga)` têm peso 0,8. Demais clubes mantêm a avaliação anterior. No mandato atual, cada ano sem grande título acumula 1 de jejum; copa nacional ou segundo continental acumulam apenas 0,5. Liga, principal continental ou Mundial de Clubes zeram o contador. Supercopas não encerram o jejum. Histórico parcial, segunda divisão ou passagem por outro clube interrompem a sequência.
- Penalidade na nota anual: `peso × min(3,5; 0,45 + 0,6 × max(0; jejum − 1))`, ou zero com grande título. Continua a memória de crédito de 60% e confiança `50 + 12 × nota + 15 × crédito`. Nos clubes ambiciosos, confiança abaixo de 28 permite dispensa mesmo cumprindo a colocação; nos demais, permanece abaixo de 12 com objetivo não cumprido. Primeira temporada dá margem, sem proteger campanhas desastrosas. Torcida, finanças e boas copas continuam contando; vice-campeonatos sucessivos não garantem permanência eterna. A regra aparece no objetivo, guia, laboratório e motivo da avaliação.
- Propostas espontâneas usam a tipografia, cores, filetes, identificação de jogador e botões do laboratório. Cada painel separa jogador, comprador, valor e resposta, com rolagem apenas no conteúdo no celular. Aceitar e recusar mantêm as regras existentes. O palco usa `overflow: clip` para impedir que foco e rolagem implícita movam o painel para trás do cabeçalho; as listas internas continuam roláveis.
- Ícones compactos de títulos e prêmios têm dica por hover e foco de teclado, encerrada ao sair ou com Escape. Não são botões; o clique não fixa uma janela.
- Windows: extraia todos os arquivos do ZIP e execute `instalacao.bat`. Ele confere Node ≥22.12 e tenta instalar a versão LTS pelo WinGet oficial se faltar ou estiver antigo; se não conseguir, mostra o endereço oficial e orienta repetir. Usa `npm exec --yes --package=pnpm@10.34.5 -- pnpm install --frozen-lockfile`, sem pnpm global. Ao terminar, informa para executar `iniciar.bat`. Este também confere dependências antes de abrir o jogo, usando a porta disponível a partir de 5173. Internet é necessária na primeira instalação; mantenha a janela aberta enquanto joga. Os atalhos da raiz e de `v2/` usam o mesmo procedimento. Dependências de desenvolvimento também são instaladas, pois o iniciador serve o Vite.

**Validação de balanceamento.** 16 carreiras, 384 temporadas, 23/23 metas aprovadas, sem alterar limites: demissões equilibradas 12,0% (23/192), objetivo cumprido 36,5% contra 15,6% passivo. Regressão de elite: 12 carreiras/288 temporadas, Barcelona inicialmente OVR 92. Antes, todos os mandatos duravam 24 anos. Agora, seis duraram de 9 a 23 anos; as seis campanhas restantes, com conquistas frequentes, chegaram a 24. Nenhum comando inválido. Dados por semente em `tools/balance/relatorios/tecnico-elite.md`; não são garantia de resultado para toda estratégia humana.


**Validação final D67 (16/10/2026).** Tipos, lint, 759 testes unitários, nove cenários isolados dos instaladores, 51 metas Craque e 23 Técnico aprovados (`pnpm verify`, com tipos/lint finais reconferidos). Instalação real executada com sucesso, lockfile preservado. Suíte completa do navegador: 100 cenários, 91 aprovados e nove pulos previstos por dispositivo, sem falhas, incluindo modo offline, acessibilidade, hover/clique/Escape dos troféus e aceitar/recusar propostas. A revisão manual conferiu propostas em 1280 × 720 e 360 × 640, nos dois temas, com página sem rolagem ou vazamento lateral e acesso às ações pela rolagem interna. A correção de rolagem implícita foi confirmada em uso e na posição do painel abaixo do cabeçalho.


## Revisão D68: hipotético visível, finalizadores e valor no Craque

Craque `2.0.0-m14`; Técnico permanece `1.7.0`.

**Hipotético.** O capítulo `{sobrenome} hipotético` volta a aparecer também em resumos compartilhados e sessões de teste. A carreira comum desta sessão já tinha o capítulo; o desaparecimento nesses outros contextos vinha do filtro por callback e do bloqueio de `internalTesting`. O compartilhado agora oferece iniciar uma cópia alternativa somente após confirmação. Sessões de teste avisam que o replay parte da semente e escolhas originais, sem reproduzir alterações manuais de OVR, idade ou elenco. O capítulo conserva apenas o prefixo de decisões válidas se uma oferta de debug não existir no replay, em vez de lançar erro. A linha alternativa continua sem liberar conquistas; o Desafio competitivo conserva o bloqueio anterior. Abrir um link sem iniciar uma alternativa continua sem tocar na carreira local.

**Gols por posição e finalização.** As taxas-base anteriores de gols e assistências continuam. Acima de FIN 80, adiciona-se à taxa-base de gols uma parcela `b × u² × (3 − 2u)`, com `u = limitar((FIN − 80)/19; 0; 1)`. `b`: PE/PD 0,12; MEI 0,095; ME/MD 0,09; MC 0,055; VOL 0,012; demais zero. Depois continuam nível, força relativa do time, especialização `exp(0,035 × (FIN − OVR))`, fase, contexto de seleção e pressão de recordes. O CA mantém sua produção anterior. Isso aumenta as oportunidades dos finalizadores excepcionais sem transformar toda posição em CA e sem aumentar quem tem FIN comum. O laboratório compara as taxas reais por função com controles de OVR e FIN.

No contexto fixo OVR 94, time 88 e oposição 80, em 50 jogos e fase neutra: PE com FIN 80 espera 13,1 gols, FIN 94 espera 30,2 e FIN 99 espera 38,1; CA com FIN 99 espera 40,8; MEI 33,4; MC 13,2. São médias antes da pressão de recordes, não garantias; minutos e oportunidades reais continuam dependendo do papel no elenco. Tabela completa em `tools/balance/relatorios/finalizacao.md`.

**Valor no Craque (histórico D68, substituído pelo teto etário D72 abaixo).** Teto absoluto de €300 milhões, inclusive depois do humor ±6% e do arredondamento. Valor-base = `min(300M; 110000 × exp(0,185 × (min(OVR,80) − 50) + 0,12 × max(0,OVR − 80)) × fator de idade)`, OVR limitado a 1–99. O fator etário mantém 1,35 até 21; 1,2 até 24; 1 até 27; 0,85 até 29; 0,7 aos 30; 0,55 aos 31; 0,42 aos 32; 0,32 aos 33; 0,22 depois. Aos 25, OVR 90 vale cerca de €93,9M, 95 €171,2M e 99 €276,6M. OVR 99 aos 20 chega a €300M; aos 30 vale €193,6M e aos 34 €60,9M. O Técnico continua com sua referência financeira anterior, usando função separada, sem alterar salários, transferências ou resultados da versão 1.7.0.

**Animações, somente diagnóstico.** Nenhuma configuração de movimento ou regra de animação foi alterada. Na aba conectada, `data-motion=system` e a consulta `prefers-reduced-motion: reduce` retornou verdadeira. Portanto, o jogo está respeitando o pedido de movimento reduzido enviado pelo navegador/sistema. A configuração de efeitos de animação do Windows e uma eventual emulação no DevTools são os pontos a conferir.

**Validação final D68 (16/10/2026).** `pnpm verify` aprovado: tipos, lint, 766 testes unitários, nove cenários Windows, 51 metas Craque e 23 Técnico, mais build de produção. O lote ampliado de 6.000 carreiras por lote também passou nas 51 metas sem alterar limites. `pnpm balance:recordes`: 2.250 carreiras, 20/21 marcas observadas; gols pela seleção ficaram em 142 para referência 146, com zero ocorrências registrado. Suíte completa do navegador: 95 aprovados e nove pulos previstos por dispositivo, sem falhas. Revisão manual do hipotético próprio com ajustes de teste em PC e 360 × 640, nos dois temas, sem vazamento lateral; criação da linha alternativa confirmada. O laboratório também foi conferido com FIN 99, usando as taxas reais do motor. A preferência de movimento reduzido foi apenas lida, sem mudar animações. Após isolar a receita do Técnico, seis regressões finais dos dois modos foram aprovadas. Uma espera do teste foi corrigida para aguardar a resolução assíncrona antes de auditar a próxima tela.


## Revisão D69: animações controladas pelo jogador

Em Ajustes, o controle Animações tem somente dois estados: ativadas (padrão) e desativadas. A escolha fica salva neste navegador, compartilhada pelo hub, Craque e Técnico, e prevalece sobre a preferência de movimento do sistema operacional. Não existe mais opção de seguir o aparelho. Preferências antigas de sistema e valores desconhecidos passam a ativadas; uma escolha explícita anterior de movimento reduzido continua desativada.

A preferência é aplicada antes da primeira pintura e reidratada pelo mesmo armazenamento das demais configurações. Motion usa never/always conforme a escolha, e os componentes de confete, contagem, cartas, jornal, decisões e rolagem leem o mesmo estado. Regras CSS também dependem de data-motion, sem consultas ao movimento do PC. Desativar remove confete e movimento contínuo, zera atrasos e torna transições imediatas; informações e controles permanecem disponíveis. Texto em português, inglês e espanhol; o laboratório e os dois modos usam o controle comum. Motor Craque 2.0.0-m14 e Técnico 1.7.0 permanecem inalterados.


## Revisão D70: atualização temporária para testes locais

Os atalhos Windows agora incluem atualizar.bat na raiz e em v2/. O iniciar.bat consulta o GitHub ao abrir e avisa quando houver versão nova, sem bloquear o jogo se a consulta falhar ou não houver internet. O título da janela também indica uma atualização disponível. A fonte é exclusivamente SamuelGdA/fut, branch main.

O atualizador usa Windows PowerShell 5.1+, já presente normalmente no Windows 10/11; cópias ZIP não precisam de Git. Baixa um pacote da revisão fixa do GitHub, valida caminhos e estrutura, preserva a cópia anterior e troca os itens conhecidos do projeto, incluindo a v2 completa. Instala dependências no destino e restaura a cópia ZIP anterior se essa etapa falhar. Não altera arquivos pessoais da raiz nem preferências do navegador. Recusa atualização com o servidor deste projeto aberto. Backups ficam em .futeiros-backups; tentativas incompletas com dependências podem ser preservadas para diagnóstico.

Cópias Git usam o Git existente, exigem main, origem oficial, árvore limpa e avanço direto. Não há reset ou sobrescrita forçada. Se a instalação das dependências falhar depois do avanço Git, repita instalacao.bat. A primeira consulta de um ZIP sem revisão compara seus arquivos com a árvore oficial antes de registrar a revisão. A API pode ficar indisponível ou limitar consultas; o iniciador informa a falha e continua.

Tudo fica nos atalhos e em scripts/, sem importação pelo jogo ou pelo build web. Instruções de uso, recuperação e remoção completa em scripts/README-WINDOWS.md. Para receber o atualizador pela primeira vez, baixe o ZIP que já inclui estes arquivos. As versões dos motores não mudaram.


**Validação final D69/D70 (16/10/2026).** pnpm verify aprovado: tipos, lint, 768 testes unitários, cenários Windows, 51 metas Craque, 23 Técnico e build. A suíte Windows final passou em 27 cenários, com pastas temporárias: instalação, consulta, ZIP inicial, atualização, rollback, offline, pacote incompleto, jogo aberto, proteção do Git e substituição dos próprios atalhos. Consulta real ao GitHub e download/validação do ZIP oficial aprovados sem atualizar a cópia de trabalho. Navegador: 99 aprovados e nove pulos previstos por dispositivo na suíte completa; dez regressões finais aprovadas após os ajustes da linha do tempo e do seletor. Tipos/lint reconferidos. Revisão manual em PC e 360 × 640, nos dois temas, com preferência do sistema reduzida e animações do jogo ativadas; desativação preservada após recarregar. Nenhuma preferência do Windows foi alterada.


## Revisão D71: campanhas, economia e leitura completa (16/10/2026)

Craque `2.0.0-m15`; Técnico `1.8.0`. Esta revisão substitui as regras anteriores dos assuntos abaixo.

- **Mundial de Clubes, ambos os modos:** campeões do principal continental nas quatro temporadas anteriores têm prioridade. As demais vagas usam somente campanhas desse continental na mesma janela, com no máximo dois clubes por país, exceto vagas de campeões distintos. Força atual, liga nacional e Série B não dão vaga direta. Ranking do Técnico: três pontos por vitória, um por empate, três pela participação e bônus por fase (campeão 10, final 8, semifinal 6, quartas 4, oitavas 2). Craque, que condensa os torneios: `max(1; 18 − 3 × ceil(log2(colocação)))` por campanha. Quatro mapas anuais são reconstruídos por replay. Regiões/ligas ausentes usam representantes explícitos, nunca clubes nacionais sem campanha; forças sintéticas adicionais: UEFA 79, CONMEBOL 75, CONCACAF 72. Cotas e sede permanecem as anteriores. Adaptação do critério esportivo da [FIFA](https://www.fifa.com/pt/tournaments/mens/club-world-cup/usa-2025/articles/classificacao-mundial-2025); o ranking condensado do jogo não pretende reproduzir todos os coeficientes oficiais.
- **Propostas do Técnico:** chegar entre os primeiros `max(2; floor(20% da liga))` da primeira divisão, sem demissão, eleva a faixa de interesse ao percentil mínimo `max(0,68; percentil do clube + 0,06)`. A proposta doméstica priorizada vem da primeira divisão quando existe clube elegível. Não garante assumir um gigante, nem remove recusas e bloqueios.
- **Finanças do Técnico:** nova verba = `32% da receita × (1 − min(corte máximo; 0,9 × investimento líquido anterior / (32% da receita))) + 85% da verba restante`, limitada a `max(0; caixa + 15% da receita)`. A sobra não é uma nova receita nem permite gastar dinheiro duas vezes. O corte máximo varia de 20% (receita até €50M) a 65% (a partir de €250M), linear entre os dois, para preservar a renovação básica de clubes menores. Os clubes da IA também respeitam a verba, o desconto e a reserva; não compram apenas por terem caixa. Ao trocar de treinador, a reserva continua no clube. Vendas continuam abatendo investimento líquido e alimentando a verba na proporção anterior. Economizar acumula capacidade de compra; investir muito reduz a nova parcela, inclusive depois de títulos. Receita converge 12% para a referência de elenco, com variação comercial limitada a ±6% por ano antes de campanha/acesso/queda; título soma 3%, em vez de 5%. Os demais fatores de campanha permanecem. O efeito aparece na aba Clube e no laboratório.
- **Melhor do mundo fora da Europa:** no Craque, desconto de oito pontos na votação, OVR ≥92, ≥40 jogos, título do principal continental ou Copa do Mundo e produção histórica (ataque: gols + 0,5 × assistências ≥55; demais: ≥30 jogos sem sofrer). Mesmo vencendo na nota, há só 2,5% de chance no fluxo exclusivo `outsideEurope`, além da pressão de recordes. Na Europa a regra anterior continua. No Técnico, candidatura fora da UEFA exige OVR ≥92, ≥40 jogos, nota média ≥8 e ao menos dois pontos de títulos (liga 0,8, principal continental 1,2, demais 0,3), chance própria de 2,5% e desconto de 2,5 pontos na nota mundial. Rei da América e prêmios locais mantêm as regras. Ser excepcional permite disputar, não garante ganhar.
- **Craque:** decisão de terminar estudos removida do catálogo e dos três idiomas. O capítulo hipotético usa tipografia de leitura, frases completas e não mostra mais o aviso sobre ajustes de teste, conforme pedido. As proteções de linha alternativa e Desafio continuam.
- **Seleção:** a estreia na linha do tempo também mostra o legado final daquela seleção, jogos e gols. Pontuação: cada jogo vale 1, gols/assistências ofensivos 0,8/0,6; posições defensivas usam clean sheets 1,2 e assistências 0,6. Protagonismo relativo soma `jogos × clamp(OVR − força da seleção; 0; 25) × 0,04`; título mundial soma 45 e continental 22, apenas em temporadas com jogos pela seleção. Régua nacional = `clamp(0,65 + (força − 60)/40; 0,6; 1,5)`. Respeitado, Ídolo e Lenda exigem, respectivamente, pontos 40/110/200 e jogos 20/55/95, ambos multiplicados pela régua. Abaixo disso é Comum. País forte exige mais; uma seleção menor pode reconhecer uma lenda sem títulos. Troca de nacionalidade não mistura os números.
- **Interface:** relatórios do Técnico animam cada abertura e painéis animam cada troca. A preferência Animações continua com duas opções, ativa por padrão e salva. Troféus iguais na linha do tempo de ambos os jogos formam pilhas com duas silhuetas e quantidade exata; hover/foco/toque expande as cópias, com quebra de linha e redistribuição. Cada cópia mantém nome e ano em dica temporária. Exportações estáticas mantêm os agrupamentos e contagens próprios. Filtro de contratação ganhou idade mínima/máxima vazias por padrão, combinado com OVR e posição, preservado no rascunho da etapa. Retirados cortes CSS por reticências e limites de linhas dos textos: caixas passam a quebrar linhas; a rolagem necessária fica dentro dos painéis do jogo.

A comparação econômica reproduzível está em `pnpm balance:tecnico:economia` e `tools/balance/relatorios/tecnico-economia.md`. No celular, tocar no último lance abre seus detalhes completos numa folha rolável; fechar devolve as opções da decisão sem comprimi-las.

**Compatibilidade D71.** Os motores mudaram e os diários de versões anteriores não são retomados com resultados diferentes. Antes de substituir um diário antigo do Técnico, preserva-se uma cópia por versão na chave local `futeiros.tecnico.backup.<versão>`. A cópia não é sobrescrita automaticamente. Não há migração de resultados antigos para o motor novo; novas carreiras usam as regras D71.

**Validação final D71 (16/10/2026).** `pnpm verify` aprovado (tipos, lint, testes, 27 cenários Windows, 51 metas Craque, 23 Técnico e build). Conferência incremental final: 775 testes unitários aprovados no conjunto, incluindo a cópia de diários antigos; tipos/lint reconferidos depois dos últimos ajustes. `pnpm balance --check` passou nas 51 metas com 6.000 carreiras por lote. Recordes: 20 das 21 referências observadas nas 2.250 carreiras; gols pela seleção chegaram a 142 contra a referência 146, sem ocorrência neste lote, sem forçar o resultado ou alterar a produção. Técnico: 384 temporadas da suíte padrão, mais 288 temporadas de elite e 30 da comparação econômica. Exemplo pareado do Barcelona: €107M investidos de €151,1M em 2026 resultaram em €97,6M de verba em 2027; sem investimento, a reserva chegou a €283,7M. As campanhas não são idênticas. Suíte completa do navegador: 107 aprovados e nove pulos previstos por dispositivo, incluindo acessibilidade, filtros, aberturas repetidas, trocas de aba, pilhas e narrativa completa. Revisão manual em PC e 360 × 640 nos dois temas. Na contratação estreita, o nome ocupa a primeira linha e idade/valor/chance ficam abaixo, sem apertar ou cortar a informação.

## Revisão D72: histórico completo e conquistas consistentes (17/10/2026)

Craque passa a `2.0.0-m16`; Técnico passa a `1.9.0`. Estas regras substituem as notas anteriores dos mesmos assuntos.

- Pilhas de troféus: cópias entram e saem em 320 ms; os deslocamentos de layout usam 380 ms, com desaceleração suave. Sair da pilha aguarda 140 ms para evitar abre/fecha ao cruzar ícones. Hover, foco de teclado e toque expandem as cópias, preservando cada nome/ano e a contagem. A preferência de animações desligadas continua prevalecendo. Laboratório de arte oferece exemplo interativo.
- Hipotético: a sessão guarda em memória os estados reais anteriores às escolhas, inclusive ajustes de teste, em vez de depender apenas do replay da semente original. A lista e a ramificação usam esses estados. Aposentar e aplicar novo ajuste preservam o histórico. Os estados não são gravados no save nem enviados no link; links normais continuam reconstruídos pelo replay. Linhas de teste e alternativas continuam sem liberar conquistas. Retirado o ícone de informação junto ao legado da seleção.
- Diretoria animada: peso zero no segundo turno. Continua elegível no primeiro e no ritmo rápido, com os pesos anteriores. Não muda as opções nem o valor oferecido.
- Título de liga: o quadro de conquistas da temporada usa todos os títulos do histórico, inclusive uma liga conquistada sem copa ou prêmio individual. O campeão já era registrado pelo motor; o erro estava na condição de abertura do quadro.
- Competições: o seletor permite consultar todos os torneios da temporada, com os do clube primeiro. Não há transferência da fase de liga da Champions para a Europa League, conforme o formato atual da UEFA. A montagem também impede participação simultânea nos três continentais UEFA, inclusive ao adicionar detentores de títulos.
- Caixa: teto absoluto de €500 milhões por clube, humano e IA, aplicado ao caixa inicial e a toda entrada de receita, premiação, venda ou evento. O excedente não fica acumulado. Dívidas continuam possíveis; o limite não perdoa saldo negativo. Verba de transferências e caixa são conceitos distintos; as regras de reserva e desconto D71 permanecem. Interface e laboratório explicitam o teto.
- Conquistas: auditoria dos contratos de desbloqueio de todos os itens dos dois catálogos, com estados controlados positivos, bloqueio de repetição, encerramento e temporada parcial, além dos testes de campanhas e persistência existentes. Estados controlados testam as condições; simulações de carreiras e recordes medem a possibilidade e raridade, sem confundir os dois tipos de evidência.

Fonte do formato UEFA: https://www.uefa.com/news-media/news/0268-12157d69ce2d-9f011c70f6fa-1000--how-clubs-qualify-for-europe/


**D72, limite de valor solicitado depois da revisão:** em ambos os modos, nenhum valor ou transferência de jogador passa de €400M. O teto etário é 400M × fator de idade / 1,35, arredondado para baixo a €500 mil: até 21 anos €400M, até 24 €355,5M, até 27 €296M, até 29 €251,5M, aos 30 €207M, aos 31 €162,5M, aos 32 €124M, aos 33 €94,5M e depois €65M. O OVR continua determinando o valor dentro desse limite. No Craque mantém-se a curva suave acima de 80; OVR 99 aos 20 vale cerca de €373,5M antes do humor de mercado, e o humor ±6% respeita o teto após arredondar. No Técnico preserva-se a curva anterior até ela encontrar o teto etário; a referência salarial não foi alterada. Propostas, rivalidade, vendas espontâneas, eventos e mercado da IA respeitam o limite depois dos acréscimos. Replays antigos conservam a indicação de versão incompatível e a cópia de segurança existente; não são silenciosamente reinterpretados.

**Validação D72 (17/10/2026).** `pnpm verify` aprovado: tipos, lint, 951 testes unitários, 27 cenários Windows, 51 metas Craque, 23 metas Técnico e build. Tipos/lint reconferidos após corrigir a auditoria de acessibilidade: os avisos transitórios ficam excluídos também quando uma folha é auditada; seu teste próprio continua verificando os avisos parados. O rastro da falha identificou o título de um aviso na saída, não o conteúdo da negociação. Craque: 51 metas aprovadas com 6.000 carreiras por lote. Técnico: 384 temporadas por execução e 30 temporadas da comparação econômica; nenhum caixa acima de €500M. A suíte de valores cobre OVR 40–110, idades 16–40, humor de mercado, negociação rival e transferência efetiva, com teto etário respeitado. Os dois replays públicos foram reconstruídos no motor m16 antes de atualizar as fixtures.

Todas as condições de conquistas têm casos positivos controlados, além de repetição, encerramento, bloqueios e persistência. Isso não equivale a observar todos os eventos raros por sorteio: nas 4.500 carreiras de recordes, 20 das 21 referências apareceram; gols pela seleção chegaram a 142 contra a referência 146, sem ocorrência neste lote. Não foi imposto um resultado nem alterada a produção para fabricar esse caso. Os relatórios versionados registram a amostra e os limites da evidência.

Conferência manual em PC e 360 × 640 nos dois temas, incluindo pilhas, seleção sem ícone de informação e consulta dos 36 clubes da Champions a partir do Avaí. No hipotético, após alterar OVR e posição e jogar mais temporadas, as 18 decisões reais continuaram listadas; ramificar a última retomou o estado anterior correto. A alteração de tamanho do navegador foi desfeita, a aba descartável foi fechada e nenhuma configuração do Windows foi alterada.

**Navegador final D72:** suíte completa repetida após a correção da auditoria, com 107 cenários aprovados e nove pulos previstos por dispositivo, sem falhas. Inclui a jornada completa dos dois modos, acessibilidade, avisos, animações ativadas/desativadas, retorno das pilhas, histórico/hipotético, filtros e consulta da Champions nos dois temas e tamanhos. A lista temporária de tarefas foi conferida e removida ao concluir a revisão.


## Revisão D79: escolhas de campo e leitura sem ruído (20/10/2026)

Craque `2.0.0-m20`; Técnico permanece `1.9.0`. Substitui as regras anteriores destes assuntos.

- Nêmesis pessoal removida por completo: catálogo, estado, encontros forçados, comparativo anual, bônus de torcida/legado e componentes. Clássicos e rivalidade entre clubes continuam sendo regras diferentes. O acontecimento “Um treino aberto no bairro” saiu do catálogo e dos três idiomas. O catálogo passa de 41 para 39 acontecimentos, pois o pênalti também passou para o calendário de partidas. Pé preferido saiu dos formulários de identidade/Desafio; o campo interno dos replays é preservado, sem efeito esportivo.
- Há **50 cenas** de partida. As três opções comuns exibem apenas “Mais protagonismo.”, “Bônus individual menor.” e “Sem bônus individual.”. Todas as alternativas conservadoras têm nome próprio ligado ao lance. “Chute com desvio” oferece “Segurar a bola”. Novo escanteio: gol olímpico, cruzar na área ou cobrança curta. O gol olímpico tem teto de **8%**, inclusive com bônus de veterano.
- Atributos da ação têm 95% do peso e OVR, 5%: qualidade = limitar((0,95 × nota ponderada dos atributos + 0,05 × OVR) / 99; 0; 1). Chance = limitar(teto × qualidade + bônus de veterano − perda etária; piso; teto), antes da pressão histórica de títulos, preservada nas finais. Piso 5%, inclusive para o olímpico. Perda etária = 0,6 ponto percentual por ano depois dos 31; Maestro fica isento no coletivo.
- Teto individual comum: **70% fixos**. Coletivo: inteiro sorteado de **70% a 80%**. Conservadora: de **70% a 90%**. Sorteio independente por semente/ano/competição/cena/ação, estável no replay e ao reler o card. São limites máximos: notas fracas não recebem essas chances prontas. Nenhum bônus ultrapassa o teto; as probabilidades continuam ocultas na interface. Acertar a ação conservadora preserva a participação, sem contribuição individual; a equipe ainda resolve o resultado com a chance anterior de 42%, sujeita à pressão de título na final.
- Pesos dos atributos: passe simples 100% PAS; tabela/giro/apoio curto 65% PAS e 35% DRI; passagem/cutback 75% PAS e 25% RIT. Arrancada seguida de chute 40% RIT e 60% FIN; corte/domínio seguido de chute 55% FIN e 45% DRI; cabeceio/voleio/segundo poste 70% FIN e 30% FIS; demais chutes 100% FIN. Interceptação/bola aérea 70% DEF e 30% FIS; recuperação em corrida 45% RIT, 45% DEF e 10% FIS. Conservadora de linha: devolução/circulação/cobrança curta 100% PAS; proteção/domínio 60% DRI e 40% FIS; cobertura e sobra 30% PAS, 35% DEF e 35% FIS. Olímpico 75% PAS e 25% FIN.
- Goleiro: espera conservadora 50% POS, 20% REF, 15% ELA e 15% MAN, ou 60% REP e 40% POS ao esperar uma saída com a bola nos pés; saída com passe 80% REP e 20% POS; pênalti/desvio 60% REF, 15% ELA, 15% MAN e 10% VEL; saída fora da área 45% VEL, 20% REF, 20% POS e 15% MAN; demais intervenções 35% ELA, 35% MAN, 15% REF e 15% POS. Duas direções de cobrança têm o mesmo teto: cobrador 70%, goleiro 35%. Especialista em pênaltis soma **10 pontos percentuais** à chance de defesa já limitada entre 5% e 35%, com teto 45%, tanto no jogo quanto no desempate. A pressão de finais é aplicada depois e igualmente aos dois lados.
- “O pênalti decisivo” deixou de ser acontecimento e virou lance de mata-mata realmente alcançado, com o placar e o resultado dos jogos. Mantém assumir ou deixar com o companheiro: assumir usa finalização e teto 70%, torcida +8 ao converter ou -6 ao perder; deixar tem chance 50% de vitória e torcida neutra. Não fabrica uma final de outra competição. O novo lance participa dos mesmos limites e ordenação anual/rápida.
- Reinvenção não é obrigatória: só aparece a partir dos **33 anos**, com perda de pelo menos **2 OVR em dois anos causada pela idade** sobre o mesmo jogador, e convite em **45% das sementes**, no máximo uma vez. Ganhos verdes e concessões vermelhas com seta seguem o treino. O caminho continua aplicado, mas seu anúncio no quadro da temporada aparece somente no ano da escolha.
- Promessas usam chips de recompensa e de punição, conservando exatamente os efeitos: humilde +2 torcida e +0,1 capacidade, sem punição; protagonista +5 torcida/+3 legado/+0,3 capacidade ou -3 torcida; histórica +9/+8/+0,5 ou -7 torcida. O prazo agregado do rápido permanece.
- Jornal aberto mantém as duas folhas do mesmo ano. A segunda conta até **dois lances importantes** com adversário, minuto, ação, contribuição real e consequência na campanha, incluindo desempate. O texto não atribui gol, assistência ou taça inexistente. Tipografia de resultado uniforme na família de títulos, também nos avisos “Deu certo” e “Não deu”.
- Cards do resultado e da temporada não têm rolagem interna. O quadro principal conserva ano, clube, liga e números; “Detalhes da temporada” abre uma folha de consulta com todos os atributos, promessa, conquistas e lances. A folha é uma vista de exploração; o card fica inteiro e o histórico mantém sua própria rolagem. Números/legendas da linha estatística têm alinhamento consistente. Fim de carreira ocupa a mesma largura das decisões.
- Hipotético volta à fonte de títulos do jogo, preserva a primeira decisão principal por ano e informa o clube de destino nas transferências. “Saudade de casa” não fixa três anos no texto. Ficar no clube informa os mesmos continentais da projeção de ofertas. Laboratório usa os componentes ativos e inclui olímpico/pênalti convertido, chips de promessa/reinvenção e nenhuma nêmesis.

**Verificação D79:** arquivos de teste do motor e do conteúdo são executados sequencialmente por pacote, sem alterar casos nem limites de tempo, para evitar disputa de CPU/memória ao carregar o mundo.

A suíte do navegador usa o build de produção em 4173 e um servidor local de desenvolvimento em 4174 para conferir o laboratório, que continua exclusivo do desenvolvimento. Os dois são preparados e encerrados pelo Playwright.

**Validação D79 (20/10/2026).** Verificação integral aprovada: tipos, lint, 1.010 testes unitários, 27 cenários Windows, 51 metas do Craque, 23 do Técnico e build. Tipos e lint reconferidos após o ajuste final. Balanceamento completo com 6.000 carreiras por amostra aprovado; mundo em 1,43 ms/temporada. Auditoria do laço: 144 carreiras, 2.855 temporadas, 2.438 jogos-chave, 175 promessas (40 cumpridas), reinvenção em 50 carreiras e os seis caminhos observados, sem falhas nos limites, ordem, prazo ou replay.

Recordes: 3.150 carreiras reais, 19 das 21 referências observadas. Não observados neste lote: gols pela seleção (máximo 138 para referência 146) e Bolas de Ouro (sete para referência oito). Ausência amostral não demonstra impossibilidade. Relatórios em `tools/balance/relatorios/`; nenhum resultado foi forçado. O aviso visual do resultado não captura cliques sobre o menu no celular; a regressão foi conferida nos dois tamanhos de tela.
**Navegador D79:** suíte completa do build final aprovada, **211 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, 220 no total, sem falhas (8,8 minutos). Inclui celular e computador, ambos os temas, acessibilidade, animações, limites visuais, jornais em português/espanhol/inglês, laboratório e uso offline. Os arquivos temporários de execução foram removidos; relatórios de balanceamento e testes de regressão permanecem no projeto. Alterações locais, sem publicação ou commit.

## D80: lances fora da função, reação no placar e mercado por liga

Craque `2.0.0-m21`; Técnico permanece `1.9.0`. Esta revisão substitui os números anteriores relacionados abaixo.

- O pênalti decisivo mantém os efeitos e as duas escolhas. Subtextos: “Mais protagonismo” e “Sem bônus individual.”, também traduzidos em inglês e espanhol.
- Valor de mercado do Craque considera a média de força atual dos clubes da mesma divisão e país, usando as divisões após acessos/quedas. Multiplicador = `0,55 + 0,55 × limitar((média - 50) / 32; 0; 1)`, de 0,55 a 1,10. Multiplica a curva de OVR/idade antes do teto etário de até €400M. Aplica-se ao valor exibido, aos registros de temporada e às condições de acontecimento por valor. Sem clube, conserva a referência neutra. A referência financeira do Técnico não muda.
- As famílias de criação e finalização podem aparecer fora da função. Por oportunidade: atacante ST/LW/RW recebe 8% de lances adicionais de criação; meio CDM/CM/CAM/LM/RM recebe 6% de finalizações adicionais; lateral recebe 3% de lances adicionais de criação/finalização e zagueiro 1,5%. Só entram os contextos compatíveis ausentes da família habitual. O sorteio da família vem antes da filtragem de repetições; esgotar lances habituais não torna os raros comuns.
- Goleiro tem 0,8% por oportunidade de mata-mata de receber “A última subida”, em qualquer fase realmente alcançada: aos 92–95 minutos, perdendo por um gol. Cabecear, escorar para o companheiro ou ficar no gol. Atributos de goleiro: cabeçada 50% elasticidade, 20% velocidade e 30% posicionamento, teto 18%; escorada 30% elasticidade, 20% manejo e 50% posicionamento, teto 40%; ficar usa reposição/velocidade/posicionamento e não dá bônus individual. Se empatar, o mata-mata termina nos pênaltis, sem atribuir classificação automática ao gol.
- Voleio já existia e foi preservado. Entram “De costas para o gol”, com bicicleta (70% finalização/30% físico, teto 35%), escorada de cabeça ou domínio; e “Em cima da linha”, com corte, desvio para o companheiro ou cobertura da sobra. Total: 53 contextos. Descrições e opções estão nos três idiomas; o laboratório usa os componentes e a resolução reais.
- Placar inicial empatado sorteia 0, 1, 2 ou 3 gols para cada lado, com pesos 2:5:2:1. Em 18% das oportunidades de liga, começa um gol atrás. Acertar então empata; errar mantém a derrota ou acrescenta um gol adversário (30%). Nos cenários empatados, a definição acrescenta um gol ao vencedor. Pênaltis não alteram o placar do jogo. A tabela usa a diferença de pontos entre o placar inicial e o final: reagir de derrota para empate dá +1, nunca os +2 de uma vitória saindo de empate. Resultado, LED e crônica reconhecem empate.
- Impacto do destaque conserva a base anterior e soma ajuda em elencos fracos: `participação × suporte × limitar((vantagem - 8) × 0,08; 0; 1,5)`, sendo `suporte = limitar((76 - força) / 16; 0; 1)` e vantagem limitada de -3 a 35. Não aumenta força se o jogador estiver próximo ou abaixo do elenco; não ajuda clubes de força 76+. Participação reduz tanto a ajuda base quanto a adicional. Exemplo de força 70/OVR 97 com participação integral: +5,7825, antes +5,22. A calibração conserva as metas de raridade dos títulos.
- Debug de desenvolvimento inclui “Forçar decisão”, com os títulos das nove decisões gerais, 39 acontecimentos e 53 lances. Monta somente a sessão marcada como teste, sem gravar escolha especial em replay, liberar conquistas ou alimentar o ranking. O fluxo normal não consulta a ferramenta; o módulo permanece fora do build de produção. Pré-requisitos podem ser ignorados nesse cenário de teste e alvos ausentes recebem dados reais do catálogo. Não é uma forma de continuar ou compartilhar uma carreira válida.

Na reação de liga começando atrás, as três alternativas seguem a mesma relação entre ação e placar: sucesso empata, falha conserva a derrota ou sofre mais um. A alternativa conservadora conserva bônus individual zero e, somente nesse contexto, não usa o sorteio independente do time. A regressão percorre 50 sementes com cada uma das três ações, cobrindo acerto e erro.

**Auditorias D80 (20/10/2026).** Lote ampliado com 6.000 carreiras por amostra aprovado nas 51 metas; mundo em 2,19 ms/temporada. Auditoria do laço real: 144 carreiras, 2.852 temporadas, 2.452 jogos-chave e 175 promessas (38 cumpridas), com reinvenção em 49 carreiras e todos os seis caminhos observados. Limites, ordem, treino no período correto, prazo e replay aprovados. A auditoria confere o atributo no registro do ano treinado quando a escolha já encerrou a temporada, sem comparar com o declínio da idade seguinte.

Recordes: 3.150 carreiras reais, 19 das 21 referências observadas. As duas ausentes no lote foram gols pela seleção (melhor 141, referência 146) e Bolas de Ouro (sete, referência oito). Ausência amostral não prova impossibilidade; nenhum resultado foi imposto. O relatório versionado registra a amostra e seus limites. Os replays m21 dos testes usam decisões reais, incluindo a coleção `d80-collection-16` (31 grupos, legado de lenda na seleção) e `d80-stacks-2` (pilha de 13 conquistas numa passagem por clube). As 44 regressões das amostras passaram sem reduzir limites nem exigências visuais.

**Verificação D80:** verificação integral aprovada, incluindo 27 cenários Windows, 51 metas do Craque, 23 do Técnico e build. Após o ajuste final da reação no placar, tipos, lint e a suíte completa de **1.020 testes unitários** foram repetidos e aprovados. A regressão cobre também empréstimo forçado fora da idade normal, montagem/resolução de todo o catálogo de teste, limites técnicos, raridade por posição, empate sem crédito indevido e crônicas nos três idiomas. As execuções finais foram separadas das auditorias mais pesadas para evitar falsos estouros de tempo por disputa de recursos; nenhum limite de teste foi aumentado.

**Acabamento visual D80.** Em 360 × 640, a promessa oculta a linha redundante de ano/idade, já disponíveis no cabeçalho e no progresso, e compacta as margens internas dos cards para manter todos os selos visíveis mesmo após um acontecimento. A prévia móvel do laboratório reduz as margens laterais e o espaço entre equipes, evitando quebrar nomes curtos no meio. O teste de avanço no mesmo ano escolhe duas partidas efetivamente consecutivas na amostra atual e verifica o card ativo, em vez de depender do antigo índice da primeira partida europeia ou do card que está saindo.

A abertura do menu nos testes fecha avisos pelos botões reais e repete o clique se o aviso offline chegar nesse intervalo. A repetição verifica se o menu já está aberto para não fechá-lo de novo; nenhum clique forçado, aviso suprimido ou limite global maior foi usado.

**Navegador D80 (21/10/2026).** Suíte completa do build final aprovada: **221 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, 230 no total, sem falhas (7,9 minutos). Inclui celular e computador, ambos os temas, teclado, leitura e contraste, animações completas/reduzidas, jornais, novos lances, laboratório, produção sem controles de teste e uso offline. Antes da rodada integral, os fluxos afetados pelo aviso offline passaram em 43 cenários, com três pulos previstos. Tipos da interface e lint foram reconferidos e aprovados após o ajuste do helper. Relatórios de balanceamento e testes de regressão permanecem; temporários removidos. Alterações locais, sem publicação, commit ou envio ao GitHub.
## D81: lance raro, contexto da liga e leitura do resultado

Craque `2.0.0-m22`; Técnico permanece `1.9.0`. Estas regras substituem os números anteriores destes assuntos.

- Bicicleta passa por uma autorização de 20% dentro da família de cenas sorteada, antes da preferência por lances ainda não vistos. Quando a autorização não vem, as outras cenas continuam disponíveis mesmo que já tenham aparecido. Não fica obrigatória após esgotar o catálogo. As raridades por posição e a subida do goleiro permanecem.
- Em liga começando empatada, se a equipe não resolve o lance, há 12% de conservar o empate sem novo gol adversário. Nas demais vezes sofre o gol. O sorteio tem fluxo próprio; mata-mata e reação começando atrás conservam suas regras. Empate preservado não dá gol, assistência ou vitória fictícios.
- A qualidade técnica da decisão passa a multiplicar pelo contexto da liga: `limitar(1 + (OVR - média atual da divisão) × 0,004; 0,90; 1,10)`. Atributos continuam com peso 95% e OVR 5%. O ajuste vale somente em partidas de clubes; seleção conserva referência neutra. Bônus, perda etária e tetos anteriores continuam; nenhuma chance ultrapassa seu teto. Deixar a cobrança com o companheiro continua 50%, pois não depende da execução do jogador.
- Ajuda adicional ao elenco fraco passa a `participação × suporte × limitar((vantagem - 8) × 0,12; 0; 2)`, mantendo `suporte = limitar((76 - força) / 16; 0; 1)` e a ajuda base. Exemplos com participação integral: força 60/OVR 85 recebe +7,10; força 70/OVR 97 recebe +5,97. Clubes de força 76+ e jogador sem participação não ganham esse adicional. Não garante títulos.
- Resultado conta a opção escolhida, o acerto/erro da ação e o resultado da equipe separadamente, em português, inglês e espanhol. Uma ação conservadora bem executada pode acompanhar derrota, e o relato explica isso. Jornal também distingue reação que busca empate de empate mantido após erro.
- A conclusão da promessa aparece junto aos números da temporada, com cumprida/não cumprida e realizado/meta. A confirmação da promessa troca o antigo subtexto por meta e período ou pelo resultado, se já fechou o prazo. Detalhes completos continuam na folha de consulta.
- No celular, jornal aberto preserva duas folhas do mesmo ano com proporção de jornal, em vez de esticar duas colunas estreitas até 680px. “Ampliar jornal” abre leitura da capa ou dos bastidores na largura do aparelho. Folhear, teclado, folha em branco e design do computador continuam.
**Auditorias D81 (21/10/2026).** Balanceamento ampliado, 6.000 carreiras por amostra: 51/51 metas aprovadas, mundo em 0,99 ms/temporada. O adicional maior aos elencos fracos passou sem reduzir as metas de raridade. Auditoria do laço real: 144 carreiras, 2.853 temporadas, 2.446 partidas e 175 promessas, 38 cumpridas; 45 carreiras com reinvenção, cobrindo os seis caminhos. Limites, ordem, treino imediato, ofertas, prazo e replay aprovados.

Recordes: 3.150 carreiras reais, 19 das 21 referências observadas. Gols pela seleção chegaram a 142 para a referência 146, e Bolas de Ouro a sete para a referência oito. A ausência dessas duas ocorrências neste lote não demonstra impossibilidade; nenhum resultado foi imposto. Relatórios versionados em `tools/balance/relatorios/`.

Amostras de navegador foram reconstruídas no m22 por decisões válidas. A coleção tem 32 grupos de conquistas e legado de lenda na seleção; a amostra de pilhas chega a 17 conquistas iguais numa passagem por clube. Os pontos de teste registram os placares reais: a animação não depende mais da suposição fixa de 1×1 para 2×1. O teste do jornal abre também uma edição com crônica para conferir a leitura ampliada, além da folha em branco preservada.

**Amostra de raridade D81.** O teste rápido passa a usar as mesmas 80 carreiras chilenas do lote completo, com as mesmas sementes, política e limite de 25%. O prefixo antigo de 50 teve 13 campeões (26%), enquanto o lote completo teve 19/80 (23,75%). A ampliação inclui integralmente os 50 casos anteriores e evita que uma única carreira no recorte menor reprove uma distribuição aprovada na referência completa. Nenhuma meta, regra do jogo ou resultado foi alterado por essa correção do harness.

**Verificação D81 (21/10/2026).** `pnpm verify` integral aprovado: tipos, lint, **1.027 testes unitários**, 27 cenários Windows, 51 metas do Craque, 23 do Técnico e build. A rodada isolada de interface passou nos 26 cenários de feedback, promessa visível e jornal ampliado, em celular e computador e nos dois temas. A leitura ampliada foi conferida numa edição com crônicas, com texto de 13px, além da folha vazia preservada. O laboratório compartilha o novo relato e mostra a conclusão compacta da promessa pelo mesmo componente da carreira.
**Navegador D81 (21/10/2026).** Suíte completa do build final aprovada: **231 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, 240 no total, sem falhas (8,2 minutos). Inclui PC e celular nos dois temas, relatos por opção, texto e botão inteiros, promessa visível com realizado/meta, jornal proporcional sem alargar a página, leitura ampliada com crônicas, três idiomas, animações, acessibilidade, uso offline e regressões do Técnico. Tipos da interface e lint foram reconferidos e aprovados após o último ajuste do teste.

O teste do laboratório consulta o aviso da ação escolhida diretamente; o novo resumo de promessa possui seu próprio status acessível e não pode tornar essa consulta ambígua. A rodada final confirmou ambos os avisos e as verificações anteriores, sem suprimir elementos nem forçar cliques. Capturas da promessa e do jornal foram revisadas; relatórios de balanceamento e amostras m22 permanecem. Arquivos temporários removidos; alterações locais, sem publicação, commit ou envio ao GitHub.
