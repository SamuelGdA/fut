# Futeiros v2: Craque e Técnico

> **Futeiros (D50 a D61).** O site virou um hub com dois jogos de futebol e
> abre sempre nele: **Craque**, a carreira de jogador descrita neste README
> (motor `2.0.0-m14`), e **Técnico**, a carreira de
> treinador nova (motor próprio `COACH_VERSION 1.7.0`, 24 temporadas, elencos
> reais, com retomada da última carreira em andamento, só competições de clubes por enquanto). O Técnico tem
> README próprio, com todas as contas: **[README-TECNICO.md](README-TECNICO.md)**,
> e a especificação na [seção 42 do GDD](docs/GDD.md#42-técnico-a-carreira-de-treinador).
> O hub está na [seção 41](docs/GDD.md#41-o-hub-do-futeiros). O modo de treinador ativo é o Técnico (`packages/engine/src/coach`).
> O protótipo experimental `manager`, sem consumidores e incompleto, foi retirado
> do código ativo na D62 com uma cópia externa preservada.

> **Revisão D63 (12/10/2026).** Craque `2.0.0-m10`; Técnico `1.4.0`.
> A última carreira do Técnico em andamento é retomável neste aparelho por replay de
> setup e comandos; encerrá-la remove o registro. O Craque não guarda sessões de
> carreira; preferências, rascunhos, conquistas e ranking continuam independentes.
> As regras abaixo de D61 substituem as notas históricas sobre salvamento, finanças,
> formações, eventos, vibração e bônus por conquistas.

> **Revisão de 8 de outubro de 2026 (D47, motor `2.0.0-m8.3`).**
> Esta revisão substitui as regras anteriores indicadas abaixo.
>
> - Tema inicial e manifesto PWA claros (#F3F0E8), respeitando a preferência já salva. Abas de aparência com
>   altura estável no PC e celular (controles com rolagem própria), painéis preservados e transição breve, sem movimento
>   quando reduzido. Retrato da carta centralizado. Jornal com cabeçalho esportivo,
>   filetes e estatísticas mais legíveis. Resultado da decisão dentro do layout,
>   sem cobrir texto, mantido até a próxima escolha; no celular mostra o resultado
>   curto, com o detalhe no lance.
> - Renovação usa nome e expectativa próprios em todas as dez missões, por exemplo
>   “Renovação de estrela” e “Fica para ensinar os mais novos”, sem mudar a cobrança.
> - Legado: zero jogos dá zero pontos. Pontos = `4 × participação +
>   (10 × importância dos títulos + 2 × prêmios + bônus de torcida) ×
>   min(1, participação / 0,85)`, vezes o traço. Participação usa os jogos realmente disputados sobre os jogos
>   do clube, limitada ao papel no elenco. Ídolo exige 60 jogos no clube e lenda
>   exige 120, além dos pontos e temporadas. O bônus de torcida é 3 com apoio
>   de pelo menos 80. Lendas de 33 anos ou mais não perdem apoio pelo banco ou
>   declínio natural; rebaixamento ainda pode tirar até 2 pontos por temporada.
> - Clássico, estádio lotado, final, pênalti e cartão vermelho exigem
>   pelo menos rotação e 12 jogos na temporada
>   anterior. Estádio lotado agora sobe/desce o papel no elenco e muda torcida
>   (+5/-3), efeitos úteis em qualquer posição. Disputar a vaga com a joia da base
>   tem 50% exatos de aumentar os jogos planejados em 20% e 50% de reduzir em
>   20%, sem ajuste pelo traço, respeitando jogos disponíveis e lesões.
> - Novo evento “Uma nova seleção” (peso 70 no sorteio de eventos elegíveis):
>   cinco temporadas consecutivas no mesmo país estrangeiro, mesmo mudando de
>   clube, nenhuma estreia pela seleção e OVR suficiente para ao menos convocação
>   ocasional no país de residência. Aceitar muda nacionalidade; recusar mantém.
>   A decisão depende da agenda, não é automática ao completar cinco anos.
> - Título de clube ou seleção conquistado na temporada dá **+1 de OVR** sobre a
>   evolução natural, após crescimento, declínio, devolução de capacidade temporária
>   e garantia do treino, uma vez por temporada,
>   até 99 e respeitando atributos limitados a 99. Substitui a antiga moral variável.
>   OVR continua sendo calculado pelos atributos, nunca por um número separado.
> - Todos os clubes continuam evoluindo com sucesso, ruído e retorno à força base.
>   A força fica também limitada a ±10 da base. As estrelas das ofertas acompanham
>   a força atual, incluindo o impacto projetado do jogador: ±1 estrela no máximo
>   em relação à nota inicial, entre 1 e 5. Mudança exige ±3 pontos de força;
>   subir de 4 para 5 ou cair de 5 para 4 exige 4,5. O impacto continua sendo
>   `0,22 × participação × limitar(OVR - força, -3, 15)`, até +3,135 para um craque
>   de linha. Ganhar campeonatos ajuda a força, mas não garante uma estrela.
> - Desafio: “Regra da tentativa” substitui “Édito”; texto explica a penalidade
>   de metade da pontuação. Catálogo com 37 missões. Missão de temporadas como ídolo substituída por virar
>   lenda de um clube (alvo 1); nova missão de ídolo ou lenda de dois clubes
>   (alvo 2). Ambos são alvos fixos do produto, os demais seguem calibrados.
> - 148 conquistas com abas por categoria: 18 recordes gerados do catálogo e um título
>   por competição, automaticamente. Aba secreta com quatro conquistas naturais,
>   escondendo nome e requisito até desbloquear. Nova conquista de terminar no
>   clube da estreia em campo. Contagens persistem sem precisar guardar carreiras.
> - Hall da Fama desativado: arquivos antigos são apagados na abertura do banco;
>   carreiras concluídas/interrompidas e saves incompatíveis não são arquivados.
>   Permanecem o save atual, conquistas, contagens agregadas e ranking diário.
>   O resumo e o caminho hipotético continuam disponíveis para o save atual.
>   O capítulo passa a se chamar “{sobrenome} hipotético”.
> - Biografia explicita “camisa” ao citar o número 1 ou outro número histórico.
> - Metas revisadas pelo bônus obrigatório de título: pico médio Normal entre
>   P−2 e P+3; diferença entre grupos até 3 OVR; Bolas de Ouro de Fenômeno
>   de ataque com média entre 1 e 2,25, mantendo 40–60% com ao menos uma.
>   As missões de legado conservam os alvos 1/2 e só entram em faixas em que
>   15–55% do lote de calibragem os alcança, sem tolerância nesta seleção.
> - Talento no Difícil usa **pesos** 45/34/15/4/1, soma 99: probabilidades reais
>   45,45% / 34,34% / 15,15% / 4,04% / 1,01%. Normal: 28/34/22/11/5%.
> - Validação: 547 testes unitários, 44 ponta a ponta, build e 51 metas de
>   balanceamento aprovados; todos os recordes alcançados. (As notas da época
>   citavam um módulo `manager` que não existe neste repositório; ver D50.)

**Residência consecutiva (D48):** sair do país interrompe a contagem; ao voltar,
é preciso completar cinco novas temporadas seguidas. Anos de períodos separados
não se somam. Trocar de clube dentro do mesmo país mantém a sequência.
O ciclo obrigatório de testar, corrigir e retestar está em `AI_RULES.md`.

**Revisão D49, motor `2.0.0-m8.4`:** no diploma, estudar reduz evolução em
10% e risco de lesão em 30%; só futebol aumenta ambos em 10% e 30%,
respectivamente, durante o período. Ficar no ultimato dá torcida +4 e rompe
com o empresário: somente a próxima decisão pode trazer ofertas de clubes
pelo menos 2 pontos de força mais fracos que o atual. Se a decisão for treino
ou outro evento sem transferência, a restrição acaba mesmo assim. Não obriga
a sair, não reduz a força dos clubes e não afeta janelas posteriores.
Escudos e selos continuam desenhados por padrão; competições e prêmios usam
suas imagens reais quando disponíveis e arte gerada como reserva. O laboratório
compara o padrão misto, todas reais ou todas geradas; `VITE_ASSETS=gerado`
continua permitindo um build inteiramente desenhado. Troféus e prêmios carregam
assim que entram na tela, sem depender do carregamento adiado. O Vite ignora
os relatórios de testes para evitar travamento do observador no Windows.
Validação D49: 550 testes unitários, 48 ponta a ponta e 51 metas no
balanceamento completo aprovados. A pendência da amostra reduzida foi
resolvida na D57 (lote completo de Fenômenos no `balance:check`), e o `verify`
roda inteiro.

**Craque** é o simulador de carreira de jogador, jogado por decisões. Você monta um jogador de
16 anos, escolhe onde jogar, no que treinar e como reagir ao que acontece, e
vê a carreira inteira acontecer dentro de um mundo de futebol simulado:
tabelas, copas, continentais, seleções, prêmios e recordes reais. Uma carreira
completa leva poucos minutos.

O Futeiros abre no hub (`apps/game/src/screens/hub`), com um cartão para cada
jogo. O Craque começa uma carreira nova, sem saves de sessão. O Técnico oferece continuar a última carreira em andamento neste aparelho. Recarregar a página
sempre abre o hub (D50).

Este documento é a referência do projeto (e do Craque em detalhe; o Técnico
está no [README-TECNICO.md](README-TECNICO.md)): quem nunca viu o código deve
entender, só por ele, como o jogo funciona, como o motor calcula e onde cada
coisa mora. O detalhe completo de cada regra está no
[GDD](docs/GDD.md) (a especificação, com notas "Como ficou" onde a
implementação mudou algo), e o porquê de cada escolha está em
[docs/DECISOES.md](docs/DECISOES.md) (D1 em diante). **Antes de mudar qualquer
coisa, leia [AI_RULES.md](AI_RULES.md).**

> Este diretório (`v2/`) contém o único projeto ativo. A v1 foi removida na D62.
> A raiz oferece atalhos para estes comandos, sem dependências ou outro workspace.
> Dados, arte, testes e ferramentas da v2 são autossuficientes.

**Central do Técnico (D59):** painel executivo compacto, detalhes por hover/toque no
campo e no banco, decisões com risco e recompensa, resolução animada e barras de verba,
folha e excedente antes de contratar. Resultados com placar e seções retráteis.
Benefícios gratuitos de eventos/conversas agora têm custo ou chance de falhar;
as regras estão no [README do Técnico](README-TECNICO.md) e no GDD 42.16.
A projeção financeira permanece visível ao rolar os alvos;
alertas complexos abrem sob demanda. A revisão também corrige o contraste do contador de troféus do Craque no tema claro.


**Prancheta do Técnico (D60):** composição em duas colunas, HUD único de objetivo,
classificação e relações, arrasto de jogadores no mouse/toque, relatório visual.
Decisões com alternativa em foco e confirmação, sem rolagem e sem misturar chances
de vitória com metas táticas. Sem tela vazia de partida, próximos jogos parciais ou
evento de apostas. Reputação/finanças explicadas no i. Relações mudam a cada jogo;
diretoria mais paciente (demissão anual abaixo de 18 com objetivo não cumprido),
demissão no primeiro turno só em campanha desastrosa. Motor Técnico 1.2.0; detalhes
e limiares no README-TECNICO, GDD 42.17 e D60.
## Índice

1. [Visão geral](#1-visão-geral)
2. [O motor: as contas por trás da tela](#2-o-motor-as-contas-por-trás-da-tela)
3. [O mundo e os prêmios](#3-o-mundo-e-os-prêmios)
4. [Metagame: Desafio do dia, conquistas e caminho hipotético](#4-metagame)
5. [Arquitetura técnica](#5-arquitetura-técnica)
6. [Comandos](#6-comandos)
7. [Documentação e regras para quem mexe no código](#7-documentação-e-regras)

---

## 1. Visão geral

### 1.1 O laço do jogo

```mermaid
flowchart LR
  A[Início] --> B[Quem é você<br/>identidade e aparência]
  B --> C[Decisão]
  C --> D[Mensagem do resultado<br/>e o lance da temporada]
  D --> C
  D --> E[Resumo da carreira]
  E --> F[Conquistas / caminho hipotético / jogar de novo]
```

1. **Início.** Ritmo e dificuldade, Começar carreira, Jogo rápido (identidade
   e aparência sorteadas), o Desafio do dia, as conquistas e os números do mundo. O Início é para começar: a carreira em
   andamento não aparece nele; começar outra substitui o save atual, sem arquivo. Abrir o
   jogo de novo volta para a carreira guardada.
2. **Quem é você.** Sobrenome, número dos sonhos (opcional), pé, país (211
   seleções) e posição (12), mais o editor de aparência. O jogador montado
   fica guardado para a próxima carreira.
3. **Decisões.** A tela da carreira mostra uma decisão por vez: a primeira
   base, a janela de transferências, empréstimos, volta de empréstimo,
   dispensa, eventos, foco de treino. Cada escolha joga uma temporada (ritmo
   Normal) ou duas (ritmo Rápida).
4. **O resultado.** Não há janela para fechar. Logo depois de confirmar,
   uma mensagem animada mostra o resultado da escolha (deu certo, deu errado,
   contrato assinado, você fica, treino escolhido), e a tela já traz a próxima
   decisão, com o lance da temporada (números contando, títulos, acesso ou
   queda, atributos que mudaram) e o jornal da temporada. Era a "Revelação"
   do GDD 22; virou isto (D43 e D45).
5. **Resumo.** Quando a carreira acaba (aposentadoria, idade, falta de
   mercado), o resumo traz biografia, linha do tempo, vitrine de troféus,
   jornal, recordes reais igualados ou batidos, o pôster para compartilhar e
   o "E se...?".

### 1.2 Regras de produto que valem para tudo

- **O laço cabe numa tela.** Decisão, lance e jornal nunca rolam a página, do
  celular de 360 × 640 ao PC (D23). Só as telas de exploração (histórico,
  biografia, vitrine, conquistas) rolam.
- **Ritmos.** Na tela, "Normal" é uma temporada por decisão (o padrão; no
  código, `intense`) e "Rápida" são duas (no código, `normal`). O GDD antigo
  usa "Intensa" para o Normal de hoje.
- **Dificuldades.** Normal e Difícil. O Difícil muda a chance de talento,
  cresce menos (×0,86), envelhece mais rápido (×1,25), machuca mais (×1,6),
  tira 3 do nível de mercado e dispensa mais cedo.
- **Idiomas.** Português (fonte), espanhol e inglês, em tudo, inclusive textos
  gerados (biografia, manchetes, capas).
- **Sem travessão em texto de jogo.** Os testes de idioma recusam "—" e "–".
- **Toda funcionalidade passa por duas perguntas:** cria algo interessante? O
  jogador entende o efeito facilmente? (ver [AI_RULES.md](AI_RULES.md)).

---

## 2. O motor: as contas por trás da tela

O motor (`packages/engine`) é **puro, semeado e imutável**: recebe estado e
escolha e devolve o estado novo, sem relógio, sem `Math.random`, sem React.
Todas as constantes citadas aqui estão no código, com o nome entre crases.

### 2.1 Sementes, replay e versão

- Todo sorteio vem de `stream(semente, sistema, ...partes)` (`rng.ts`):
  um gerador sfc32 por fluxo. Os sistemas são `birth`, `world`, `titles`,
  `season`, `growth`, `injury`, `awards`, `market`, `events`, `national`,
  `narrative`, `bio`, `scout`, `challenge` e `policy`. Cada torneio, cada
  temporada e cada característica do jogador tem o próprio fluxo, então mexer
  num sorteio nunca muda os outros.
- **O save é um replay** (D4): setup (semente, ano, ritmo, dificuldade,
  identidade) e a lista de escolhas. `replay()` refaz a carreira inteira e
  chega exatamente ao mesmo ponto. O save também guarda um retrato leve
  (`snapshot`) para mostrar a carreira sem rodar o motor.
- `ENGINE_VERSION` (`version.ts`, hoje `2.0.0-m8.3`) sobe sempre que a mesma
  entrada passa a produzir outra carreira. Save de outra versão abre só para
  leitura; o save incompatível pode ser descartado, sem arquivamento.

### 2.2 O jogador

Criado aos 16 anos (`player/player.ts`). O jogador nunca vê os números
internos: vê atributos e OVR.

| Característica | Como sai |
|---|---|
| Talento | Jornaleiro, Promessa, Craque, Estrela, Fenômeno: 28/34/22/11/5% no Normal, 45/34/15/4/1% no Difícil (`TALENT_ODDS`) |
| Potencial P | Teto suave do nível total, uniforme na faixa do talento: 66–74, 74–81, 81–87, 87–92, 92–97 (`POTENTIAL_RANGE`). Nunca aparece; o olheiro dá uma leitura aproximada |
| Capacidade L | Habilidade natural aos 16: `46 + 1,3 × faixa + N(0; 1,6)`, entre 43 e 56 |
| Prodígio | 14% das Estrelas e 26% dos Fenômenos já chegam prontos: L começa de 11 a 17 abaixo de P (`PRODIGY_CHANCE`, `PRODIGY_GAP`) |
| Idade de pico | Atacante 26,5; meia ofensivo 26,5; meio-campo 27,5; lateral 27; zagueiro 28,5; goleiro 30 (`PEAK_AGE_BASE`), ±2 pela maturação (precoce 15%, normal 70%, tardia 15%) |
| Longevidade | 7% dos jogadores de linha (fora zagueiros) ganham 3 anos a mais antes do declínio (`LONGEVITY`) |
| Traço | Competidor, Profissional, Líder, Artista, Cabeça quente, Frágil: mexem em crescimento, declínio, lesão, risco, torcida e legado (`TRAIT_EFFECTS`) |
| DNA | Desvio por atributo, N(0; 2,2), recentrado para não mudar o OVR, só o desenho da carta |
| Treino | Bônus permanentes por atributo, de 0 a +8 |

**Atributos e OVR.** Os seis atributos da carta (Ritmo, Finalização, Passe,
Drible, Defesa, Físico; no gol, Elasticidade, Manejo, Reposição, Reflexos,
Velocidade e Posicionamento) saem de

    atributo = limitar(arredondar(L + desenho da posição + DNA + curva da idade + treino), 1, 99)

e o OVR sai **sempre** dos atributos (invariante 1):

    OVR = limitar(arredondar(média ponderada pelos pesos da posição + bônus da posição), 1, 99)

Os pesos por posição estão em `player/positions.ts`. Exemplo: centroavante
10/42/8/20/0/20 com bônus 2; zagueiro 8/0/10/4/50/28 com bônus 3.

### 2.3 Evolução: crescimento, teto biológico e declínio

A cada temporada, L cresce (`evolution/growth.ts`, `evolution/tuning.ts`):

    ganho esperado = 7,6 × idade × folga × minutos × treinador × confiança × traço × dificuldade

- **Idade**: logística que cai à metade 2,5 anos antes do pico.
- **Folga** até o potencial, com saturação:
  `(máx(P − nível, 0) + 0,35) / (… + 9)`. Quem se adiantou desacelera perto
  do teto; quem se atrasou recupera. É a "tendência à média" do modelo.
- **Minutos**: `0,45 + 0,55 × mín(1, jogos / 34)`.
- **Treinador**: de 0,85 (clube de força 55) a 1,15 (força 90).
- **Confiança**: de 0,96 a 1,04, pela torcida.
- **Forma da temporada**: normal ×0,88–1,12; tropeço (8%) ×0,45–0,7; explosão
  ×1,25–1,45, com chance de 14% até 19 anos, 10% até 22, 5% até 25, 1,5%
  depois, e só com 20 jogos ou mais.
- **Teto biológico** (`capSeasonGain`): até 4,4 pontos numa temporada passam
  inteiros; acima disso o ganho rende cada vez menos e nunca chega a 7.
  Nenhuma temporada dá um salto irreal (o maior salto de OVR medido é +9).
- **Bônus de título (D47)**: +1 OVR após toda a evolução natural, uma vez
  por temporada com ao menos um título, inclusive no declínio. Limite 99.
- **Declínio** (`ageDecline`): começa 2 anos depois do pico, mais a folga da
  posição (zagueiro +1, goleiro +2) e a longevidade:
  `mín(4,5; 0,26 × anos + 0,05 × anos²)` por temporada, × traço × dificuldade.

### 2.4 Treino (foco)

Dos 17 aos 31 anos, no mínimo quatro anos depois do último foco, com 40% de
chance a cada decisão (`FOCUS_RULE`), aparece a decisão de foco: seis focos,
um por atributo (Arranque, Pontaria, Visão de jogo, Bola no pé, Marcação,
Força; no gol, Voo, Mãos firmes, Reposição, Reflexos, Explosão, Comando da
área). O foco soma **+2** ao atributo uma vez, no período seguinte, e garante
que ele termine o período pelo menos 2 acima de onde começou
(`TRAINING.focus`, `guaranteeFocus`).

### 2.5 Uma temporada do jogador

`season/playerSeason.ts`, nesta ordem:

1. **Papel no elenco** pela distância `d = OVR − força do clube`
   (`season/role.ts`): Craque do time (d ≥ 3, joga 95% dos jogos), Titular
   (d ≥ −1, 85%), Rotação (d ≥ −4, 60%), Reserva (d ≥ −8, 28%), Sem espaço
   (8%). Goleiro: Titular (d ≥ −2, 92%), Reserva (d ≥ −7, 12%), Terceiro (2%).
   Quem não é titular tem de 2% a 8% de chance de subir um degrau na
   temporada.
2. **O mundo inteiro** (seção 3), com o jogador somando força ao clube:
   `força + 0,22 × participação × limitar(OVR − força, −3, 15)`
   (`CLUB_IMPACT`), e à seleção (`NATIONAL_IMPACT`, 0,12).
3. **Jogos e lesão.** Jogos planejados = jogos do time × participação ×
   N(1; 0,06). Lesão (`season/injury.ts`): chance
   `0,14 × (1 + 0,05 por ano acima dos 28) × (1,15 − 0,3 × físico / 99) × traço × (1,6 no Difícil)`;
   tira de 5% a 22% dos jogos planejados.
4. **Produção**, competição por competição (`season/production.ts`). Os jogos
   dele são repartidos entre as competições na proporção dos jogos do time, e
   cada competição sorteia:
   - gols e assistências por **Poisson**, com taxa por jogo
     `(base da posição + oportunidades de finalização) × e^(0,032 × v(OVR − oposição)) × e^(0,03 × v(time − oposição)) × e^(0,035 × (Finalização − OVR)) × fase`,
     onde `v(d)` vale d até 10 e `10 + 0,12 × (d − 10)` acima (o joelho que
     impede 60 gols todo ano). Base de gols por jogo: centroavante 0,385;
     pontas 0,24; meia ofensivo 0,22; meias abertos 0,15; volante e laterais
     0,035; zagueiro 0,04 (`SCORING`). No m14, FIN acima de 80 abre
     oportunidades extras para pontas e meias conforme a função; ver D68.
     As assistências conservam a taxa-base e o coeficiente de nível 0,045,
     usando Passe no lugar de Finalização.
   - jogos sem sofrer gol por **binomial**, com chance
     `e^(−1,05 × sofridos por jogo)` e
     `sofridos = 1,2 × e^(−0,055 × (time + defesa − oposição))`.
   - a fase da temporada é log-normal (o Artista oscila mais).
5. **Seleção** (`season/national.ts`): pela distância `OVR − força da
   seleção`, Titular (≥ 2: 9 a 11 jogos fora de torneio), Elenco (≥ −1: 5 a 7),
   Ocasional (≥ −3: 1 a 3) ou fora; nos anos de torneio, joga o torneio.
   Produção com escala 0,6 (jogo de seleção é mais travado).
6. **Títulos**: título de clube só conta para quem jogou naquela competição;
   título de seleção, para quem estava no elenco do torneio.
7. **Prêmios** (seção 3.4) e **pressão do recorde** (2.6).
8. **Evolução** (2.3).

### 2.6 Pressão do recorde

Recorde é possível e raríssimo (D44, `records/pressure.ts`). Cada número que
encosta num recorde real tem uma cauda: até o começo dela nada muda; dali em
diante, cada unidade a mais (gol, jogo, convocação, título, Bola de Ouro) só
entra se passar num sorteio, e a chance cai a cada passo:

    chance do passo n = e^(−n / escala)

Exemplo: gols numa temporada têm cauda a partir de 62, escala 6. O 73º gol
entra com 16% de chance, o 74º com 14%, o 80º com 5%. Valem caudas para gols
na temporada, assistências, jogos sem sofrer gol do goleiro, gols e jogos na
carreira, gols e jogos pela seleção, títulos (total, por liga, por
continental, Copa do Mundo, sequências de ligas e de continentais), Bolas de
Ouro (total e seguidas) e Chuteiras de Ouro. Nada tem teto (invariante 4). O
título que a sorte não confirma fica com o vice, logo que o torneio acaba (o
mundo continua coerente); o prêmio fica com o segundo colocado. Em 2.250
carreiras de Fenômeno perseguindo recorde, todos os recordes foram
alcançados, quase sempre poucos acima da marca
(`tools/balance/relatorios/recordes.md`).

### 2.7 A carreira: decisões, mercado e fim

**A próxima decisão** (`career/decisions.ts`) é a primeira regra que se
aplicar: idade 40 (fim), sem mercado (fim), suspensão, volta de empréstimo,
dispensa, evento agendado, foco de treino, empréstimo e, por fim, a janela de
transferências.

- **Primeira base** (`ACADEMY`): três clubes do país do jogador, cada um da
  primeira divisão com 30% de chance e da segunda no resto. Quem nasceu fora
  dos 17 países com liga jogável recebe clubes da confederação ou do mundo
  perto de OVR + 6.
- **Mercado** (`career/market.ts`). O nível de mercado é o OVR, mais até +5
  para quem tem menos de 23 anos (0,8 por ano), mais reputação (até +3),
  menos 3 no Difícil, menos 1,5 por ano acima dos 32. Os interessados têm
  força entre nível − 7 e nível + 3 (a faixa se alarga quando faltam clubes:
  o jovem alcança clubes mais fortes, o veterano mais fracos). A região vem
  do OVR (abaixo de 75: metade do próprio país, 30% da confederação, 20% do
  mundo). Uma oferta é sempre um passo acima (pelo menos 2 de força a mais) e
  outra um lugar onde ele será protagonista: é isso que faz a escolha doer.
  Cada oferta mostra liga, estrelas, papel esperado, missão, pressão,
  competições e o número da camisa.
- **Missão** (10, `career/mission.ts`): Aposta da base, Reforço, Peça do
  projeto, Contratação de peso, Herdeiro, Resgate, Reconstrução, Volta para
  casa, Experiência, Mostrar serviço. Cada uma define torcida inicial,
  pressão (multiplica as quedas de torcida) e exigência.
- **Torcida e legado** (`career/fans.ts`): torcida de 0 a 100 por clube, em
  faixas (Desconhecido, Hostil, Morna, Calorosa, Querido, Idolatrado). O
  primeiro clube começa em 50 e, na primeira temporada, a torcida só sobe.
  Títulos, jogos e gols somam legado (Sem legado até Lenda do clube). Trocar
  um clube pelo rival de clássico marca Traidor.
- **Empréstimo** (`LOAN`): de 18 a 23 anos, no máximo dois na carreira, para
  quem ficou como reserva, sem espaço ou terceiro goleiro (60% de chance) ou
  na rotação (25%). Na volta, as
  opções são clubes de verdade: voltar ao dono do passe, ficar no clube do
  empréstimo (compra, 40% ou 70% de chance de existir) ou o mercado.
- **Dispensa** (`RELEASE`): a partir dos 25 anos e duas temporadas seguidas
  sem espaço (23 e uma no Difícil): três clubes, nunca o que dispensou.
- **Camisa** (`career/shirt.ts`): o número dos sonhos quando o clube permite;
  titulares e craques ganham os números clássicos da posição (1, 9, 10...),
  reservas os altos. Número que não combina com a posição (a 10 de um
  goleiro) só sai com 0,8% de chance, para o craque do time. A camisa só muda
  na transferência (a oferta mostra) ou na opção de ficar, quando o clube
  oferece outra.
- **Fim**: aos 40 anos; sem nenhuma oferta; ou por vontade própria (a opção
  aposentar aparece nas janelas a partir dos 33, depois de dispensa a partir
  dos 32; "Encerrar carreira" no menu vale depois da primeira temporada
  jogada, e a partir dos 27 no Desafio do dia).

### 2.8 Eventos declarativos

Um evento é **dado**, não código (`events/model.ts`, `events/catalog.ts`, 39
eventos): condições para aparecer, opções e os efeitos de cada resultado.

- **Condições**: idade, jogos na última temporada, papel, temporadas no
  clube, continental, mata-mata, clube rival interessado, clássico, declínio
  do clube, a 10 livre, tempo no exterior, valor de mercado, seleção fraca ou
  sem estreia, legado em outro clube, elenco de torneio, torcida, OVR, traço,
  posição vizinha, número histórico livre, homenagem, ou "qualquer uma de".
- **Efeitos**, aplicados na ordem: capacidade (agora, no período ou depois),
  potencial, atributos, torcida, pressão, papel (sobe, desce, titular
  garantido), jogos, lesão, produção, crescimento, força por torneio, final
  decidida (a final sempre acontece, D45), seleção (pular ou ir ao torneio),
  suspensão, transferência, posição, nacionalidade, camisa, bloquear o clube,
  mercado, força do clube, bônus de prêmio e marcas de história (para a
  biografia).
- **Opções**: de risco (chance de sucesso, ajustada pelo traço), seguras, de
  mudança e de escolha. A interface mostra o que muda em cada caso.
- **Agenda** (`career/events.ts`): no começo da carreira, o motor sorteia de
  7 a 8 idades com evento (4 a 5 no ritmo Rápida), entre 17 e 37 anos; na
  idade marcada entra um evento elegível sorteado pelo peso.
- Os textos ficam em `@craque/content` pelo id do evento e da opção: um evento
  novo é uma entrada no catálogo e um bloco de texto em cada idioma.

---

## 3. O mundo e os prêmios

### 3.1 Os dados (`packages/world`)

489 clubes com força (40 a 92, na escala do OVR) e prestígio (1 a 5), 211
seleções, 32 ligas (primeira e segunda divisão) de 17 países jogáveis
(ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER, ITA, MEX, PAR, PER, URU,
USA, VEN), 79 competições, prêmios e uniformes. As notas dos clubes saem e
voltam por planilha (`pnpm notas:exportar` e `pnpm notas:importar`).

### 3.2 Uma temporada do mundo (`world/season.ts`)

Ordem: supercopas, ligas, copas, continentais, Intercontinental, Mundial de
Clubes, seleções e, por fim, acesso, rebaixamento e a força nova dos clubes.
Cada torneio sorteia no próprio fluxo.

- **Liga**: cada clube tira uma nota = força efetiva + N(0; 3,1); a tabela é
  a ordem das notas, e os pontos por jogo são
  `limitar(1,36 + 0,078 × (nota − média), 0,35, 2,63)` (pontos nunca crescem
  com a posição).
- **Copas e continentais**: mata-mata ordenado por nota (força + ruído de 4,2
  nas copas e continentais, 5,2 na copa da liga, 3,4 no Mundial). Jogo único
  (supercopa, final da Intercontinental):
  `P(A vence) = 1 / (1 + e^(−(A − B) / 4,5))`.
- **Classificação continental** pela tabela, por país (`QUALIFICATION`).
- **Calendário**: Copa do Mundo nos anos com resto 2 por 4 (2026, 2030), os
  continentais de seleções (Eurocopa, Copa América, Copa Ouro, Copa Africana,
  Copa da Ásia, Copa da OFC) com resto 0, Mundial de Clubes com resto 1.
- **Acesso e rebaixamento** entre as divisões de cada país.
- **Força ao longo do tempo** (`CLUB_DRIFT`): volta 30% para a força base,
  soma sucesso (liga +0,4, continental principal +0,6, acesso +0,5,
  rebaixamento −0,8) e ruído; fica entre 35 e 95. Dinastia sim, monopólio não.
- O mundo começa com 4 temporadas de aquecimento (só memória, sem mexer em
  força nem divisão).

### 3.3 Quem disputa os prêmios

- **A elite real** (D8, `awards/elite.ts`): jogadores de verdade com
  projeções de carreira fictícias (sobe 1,9 por ano até o pico, cai depois).
- **A geração futura**: a elite real só vai até quem nasceu em 2009; para a
  Bola de Ouro não virar prêmio sem adversário depois de 2037, o motor gera,
  pela semente da carreira, dez candidatos por ano de nascimento de 2009 a
  2028 (pico médio 86,5). O motor não dá nome a eles: `@craque/content`
  monta nomes fictícios que soam do país de cada um.

### 3.4 Os prêmios (`awards/awards.ts`, `awards/crowns.ts`)

- **Bola de Ouro**: eleição entre o jogador e a elite. Nota =
  OVR + 2,2 × sucesso (liga 1, copa 0,3, continental 2,5, Copa do Mundo 3,
  continental de seleções 1,5) + produção + ajuste da posição (atacante 0,
  zagueiro −2,5, goleiro −3) + prestígio (0,8 por Bola anterior, até 4) −
  freio de sequência (2 por ano seguido, até 5) − fama (0,8 por ano abaixo
  dos 22) + N(0; 1,6). Cada candidato da elite ganha +8,25 (o resto do mundo).
  Mínimo de 25 jogos.
- **Luva de Ouro** (goleiros), **Revelação** (até 21 anos, 20 jogos).
- **Chuteira de Ouro**: só clubes da UEFA. A marca a bater é o artilheiro que
  ganharia sem o jogador, máx(28, N(35; 3,5)), mais 1,2 por Chuteira seguida;
  ganha quem faz mais gols de liga que isso.
- **Artilheiro e Craque de cada competição** (ligas, copas, continentais,
  Mundial, torneios de seleção): artilharia contra a marca dos artilheiros
  reais daquela competição (abaixo dela, impossível; acima do recorde,
  certa); craque por nota de desempenho, com mínimo de 60% dos jogos.
- **Recordes reais** (GDD 26, 18 marcas conferidas em setembro de 2026): 73
  gols numa temporada, 979 na carreira, 8 Bolas de Ouro (4 seguidas), 6
  Chuteiras, 46 títulos, 3 Copas do Mundo, 6 Champions, 6 Libertadores, ligas
  de Inglaterra (13), Espanha (12), Itália (10), Alemanha (13), 11 ligas
  seguidas, 5 continentais seguidos, 146 gols e 234 jogos pela seleção, 1.390
  jogos na carreira. O resumo mostra os igualados ou batidos.

---

## 4. Metagame

### 4.1 Desafio do dia (`packages/engine/src/challenge`)

- **O dia é UTC.** O identificador é a data em UTC (`AAAA-MM-DD`), calculada
  com aritmética inteira de calendário (sem `Date`; o motor nunca lê o
  relógio, quem chama passa o instante). Vira exatamente na meia-noite UTC
  para todo mundo.
- **A mão do dia** sai só do identificador: nação (com liga jogável),
  posição, talento do jogador do dia, três missões de três eixos diferentes
  e um édito. Nação, posição e édito andam em **rodízio** determinístico:
  cada nação uma vez antes de repetir, cada posição a cada 12 dias, cada
  édito a cada 10, e nunca o mesmo de um dia para o outro (D31).
- **Missões**: 36, em 9 eixos (gols, títulos, fidelidade, estrada, evolução,
  zebra, seleção, longevidade, prêmios), com alvo por faixa de talento,
  calibrado por `pnpm desafio:calibrar` (D29). A terceira é surpresa e só se
  revela aos 24 anos.
- **Éditos**: 10 restrições (D30), cada uma quebra de 10% a 75% das carreiras.
- **Regras fixas**: dificuldade Difícil, duas temporadas por decisão,
  aposentar a partir dos 27; livres o sobrenome, o pé, a aparência e o número.
- **Pontuação** (sobre 1000, `challenge/score.ts`):

      missão(r = progresso / alvo) = 400 × (1 − e^(−2,2 r)) / (1 − e^(−2,2))   se r ≤ 1
                                   = 400 + mín(50; 45 × log2 r)                  se r > 1
      total = arredondar((duas melhores missões + bônus de pico) × (édito cumprido ? 1 : 0,5) × 0,97^temporadas apagadas)
      bônus de pico = 100 × limitar((OVR de pico − 72) / 27, 0, 1)^1,4

  A primeira tentativa terminada no dia é a **ranqueada**; as outras são
  amistosas.

### 4.2 Conquistas e persistência

Hall desativado (D47): não guarda carreiras antigas e apaga os arquivos existentes.
IndexedDB `craque-v2` preserva conquistas e ranking; `craque.v2.progress` guarda
somente melhores contagens por conquista e hashes das carreiras concluídas,
sem replay ou retratos. Falha do banco mantém a sessão funcionando em memória.

São 148 conquistas em dez categorias: 51 específicas, 18 geradas do catálogo
de recordes e 79 das competições. A aba Secretas tem quatro objetivos naturais,
com nome e pista ocultos até desbloquear. Aposentar no clube da estreia em campo
é uma conquista de Lealdade. Cada competição nova gera sua conquista de título.

### 4.3 Caminho hipotético

No resumo de uma carreira comum (fora do Desafio), o capítulo
“{sobrenome} hipotético” lista cada decisão. Escolher uma refaz o replay até ali
e continua ao vivo com outra opção. Substitui o save atual; a linha alternativa
não libera conquistas. Não há arquivo da carreira anterior.

### 4.4 O resumo e o compartilhamento

Biografia gerada do diário da carreira (`career/log.ts`), linha do tempo,
vitrine de troféus, o jornal da carreira (capas por temporada), recordes
reais, a carta do auge e o **pôster PNG** (gerado com modern-screenshot, com
opção de esconder o sobrenome; carta com selo "Difícil" ou "Desafio"). O
**link da carreira** leva o replay inteiro no fragmento da URL (`#c=`,
comprimido com deflate-raw): abrir o link refaz a carreira e mostra o resumo
só para leitura, sem tocar no save de quem abre.

---

## 5. Arquitetura técnica

### 5.1 Pacotes e a regra das dependências

```
v2/
├─ packages/world/    dados do mundo e consultas (países, ligas, clubes, competições, prêmios, kits);
│                     elencos reais do Técnico em `@craque/world/squads` (data/squads, D52)
├─ packages/engine/   o motor: puro, semeado, imutável; depende só de world. O motor do Técnico
│                     fica em src/coach, exportado em `@craque/engine/coach`
├─ packages/content/  todos os textos do jogo (pt, es, en): eventos, capas, manchetes, biografia,
│                     recordes, desafio, conquistas, nomes da geração futura; os do Técnico em
│                     `@craque/content/coach`; depende de engine e world
├─ packages/art/      arte gerada: escudos, selos, troféus e o avatar (portados do v1, byte a byte)
├─ apps/game/         o jogo: Vite + React 19; depende de todos acima
├─ tools/balance/     harness de balanceamento: metas do GDD 40 (Craque), do GDD 42.12 (Técnico) e relatórios
├─ tools/terminal/    uma carreira inteira no terminal (pnpm carreira)
└─ docs/              GDD.md (especificação) e DECISOES.md (D1 em diante)
```

- **O motor não sabe que existe interface.** Nada em `packages/engine`
  importa React, DOM, relógio, armazenamento ou textos. Um teste de pureza
  (`packages/engine/test/purity.test.ts`) varre o código do motor e falha com
  `Math.random`, `Date`, APIs de navegador ou de Node. Toda regra de jogo mora no motor; o app só mostra e pergunta.
- **Textos fora do motor.** O motor devolve ids e números; `@craque/content`
  transforma em frases nos três idiomas. A interface tem os próprios textos em
  `apps/game/src/i18n` (português é a fonte, os tipos obrigam es e en a ter
  as mesmas chaves).
- **Carreira = estado imutável.** `createCareer(setup)` → `choose(carreira,
  escolha)` → `{ carreira, avisos }`. Os avisos (temporada, transferência,
  resultado do evento, primeira convocação) alimentam o lance e a mensagem.

### 5.2 O app (`apps/game`)

| Parte | O que faz |
|---|---|
| Pilha | Vite 8, React 19 com React Compiler, TypeScript 6, Tailwind 4.3, Base UI, Motion 13, Zustand 5 |
| `src/app/` | Casca (barra do topo sempre visível), navegação por `history.state` (a URL não muda entre telas, nenhum host precisa de regra de reescrita), barreiras de erro em três níveis, telas carregadas sob demanda e antecipadas apenas dentro do modo escolhido (D62) |
| `src/screens/` | Hub do Futeiros; do Craque: Início, Identidade, Aparência, Carreira (decisão, lance, jornal, mensagem do resultado), Resumo, link compartilhado, Desafio; do Técnico (`screens/tecnico`): identidade, aparência, a carreira (propostas, etapa, processos, evento, decisão no jogo, resultados, avaliação) e o legado; Conquistas (Craque e Técnico), 404 e o laboratório |
| `src/features/` | Estado da carreira (`career/store.ts`, Zustand), save, rascunho do jogador, lance (`play.ts`) e mensagem (`resultView.ts`), "E se...?", resumo (pôster, link, vitrine), desafio (relógio), persistência (pasta `hall`: banco, ranking, conquistas), aparência, ajustes; o Técnico em `features/tecnico` (carreira só em memória, presença para o hub, rascunho, `view.ts` que esconde o rendimento) |
| `src/services/` | Som, vibração, `localStorage` seguro, IndexedDB com espelho em memória, imagens offline |
| `src/ui/` | Sistema de design: botões, carta do jogador, números que contam, sinais e pílulas, painéis, janelas, avisos |
| `src/i18n/` | Português (fonte), espanhol, inglês; o Técnico em `i18n/tecnico`, carregado só pelas telas dele |

**Save.** `localStorage`: `craque.v2.save` (replay + retrato + avatar + tela),
`craque.v2.draft` (o último jogador montado) e `craque.v2.prefs` (idioma,
tema, volume, movimento, vibração, ritmo, dificuldade). Cada escolha grava
na hora; recarregar abre o hub, e o cartão do Craque volta para a mesma tela
(D50). Save corrompido é descartado com aviso no Início do Craque, e o
rascunho fica. O Técnico não tem save (D51): guarda só o rascunho da
identidade (`craque.v2.tecnico.draft`) e as conquistas.

**Acessibilidade.** Laço inteiro por teclado (Tab, Enter, Espaço), o foco
volta ao título da decisão nova, o lance é anunciado numa frase para o leitor
de tela, contraste WCAG AA nos dois temas (inclusive com as cores dos
clubes), movimento reduzido respeitado (do sistema ou dos ajustes).

### 5.3 PWA e imagens

- **PWA** com `vite-plugin-pwa` (D36): instalável, funciona sem internet
  para o hub e modos já carregados. Só a casca/hub, suas dependências estáticas,
  estilos, fontes necessárias, ícones e erros entram na instalação (D62).
- **Imagem desenhada ou real.** Cada clube, liga, troféu e prêmio tem arte
  desenhada em `packages/art` (gerada no navegador, sem rede). **O padrão é
  `VITE_ASSETS=gerado`: só a arte desenhada** (bandeiras continuam reais)
  (D46). Num build com `VITE_ASSETS=real` (copie `apps/game/.env.example`
  para `.env.local` e troque o valor), o jogo usa a imagem real quando existe
  e a desenhada quando falta (sem internet e fora do cache, nenhum escudo
  aparece quebrado). Há escudo real para 481 dos 489 clubes e selo real para
  29 das 32 ligas (os 82 escudos e 5 selos mais novos vieram da Wikipédia e
  do Wikimedia Commons, D46); o laboratório troca o modo sem rebuild.
- **No modo real**, escudos, troféus, federações, bandeiras, selos e prêmios entram no cache
  `craque-imagens` conforme aparecem, e Ajustes > "Imagens sem internet" >
  "Guardar todas" baixa o resto. No modo desenhado essa linha não aparece:
  não há imagem real para guardar. A suíte ponta a ponta gera o build no modo
  real, para testar esse caminho.
- **Páginas de erro estáticas** (404, 403, 500, 503) geradas no build com os
  textos e desenhos do jogo, nos três idiomas (D38).

### 5.4 Qualidade

- **Testes unitários** (Vitest) em cada pacote: motor (pureza, replay,
  propriedades, regras), conteúdo (textos sem marcador sobrando, idiomas
  iguais, biografia coerente), app (save, lance, contagens, desafio).
- **Ponta a ponta** (Playwright no Chrome instalado, sobre o build de
  produção, celular 375 × 812 e desktop 1280 × 800): hub, jornada do Craque
  do hub ao Resumo, recarregar, Desafio, caminho hipotético, conquistas, erros,
  offline e acessibilidade (axe nos dois temas, teclado, leitor de tela); a
  jornada do Técnico (`e2e/tecnico.spec.ts`: propostas, ações, evento,
  simulação, avaliação, legado, ritmo lento, recarregar, sair, 360 × 640 e
  auditoria do armazenamento).
- **Balanceamento** (`tools/balance`): milhares de carreiras com políticas
  automáticas contra as 51 metas do GDD 40 (evolução, mundo, carreira,
  fluxo, desafio), e o relatório de recordes. O Técnico tem 23 metas próprias
  (`pnpm balance:tecnico`, relatório `tools/balance/relatorios/tecnico.md`).

---

## 6. Comandos

Pré-requisitos: Node.js 22.12 ou mais novo e pnpm 10. Tudo dentro de `v2/`.

**Jeito fácil (Windows):** extraia o ZIP inteiro, execute `instalacao.bat` e depois
`iniciar.bat`. O instalador prepara Node LTS se necessário e dependências com
pnpm 10.34.5, sem instalação global deste. O iniciador também confere as
dependências e abre o jogo em http://localhost:5173 (ou a próxima porta livre). `carreira.bat` joga uma carreira no terminal.

```bash
pnpm install
```

```bash
pnpm start
```

| Comando | O que faz |
|---|---|
| `pnpm start` | Servidor de desenvolvimento e abre o navegador |
| `pnpm dev` | O mesmo, sem abrir o navegador (http://localhost:5173) |
| `pnpm build` | Build estático em `apps/game/dist` (com service worker e páginas de erro) |
| `pnpm preview` | Serve o build de produção |
| `pnpm test` | Testes unitários de todos os pacotes |
| `pnpm typecheck` | Checagem de tipos |
| `pnpm lint` | Regras de código (ESLint) |
| `pnpm verify` | Tipos, regras, testes, metas de balanceamento (Craque e Técnico, modo reduzido) e build: rode antes de entregar qualquer mudança |
| `pnpm e2e` | Suíte ponta a ponta (precisa do Google Chrome; fica fora do `verify`) |
| `pnpm balance` | Metas do GDD 40 com milhares de carreiras; grava `tools/balance/relatorios/` |
| `pnpm balance:check` | O mesmo, menor e sem gravar arquivo; falha se alguma meta falhar |
| `pnpm balance:recordes` | Fenômenos perseguindo recordes; grava `relatorios/recordes.md` |
| `pnpm balance:tecnico` | As 23 metas do Técnico (sondas exatas e carreiras automáticas em paralelo); grava `relatorios/tecnico.md` |
| `pnpm balance:tecnico:check` | A mesma rodada do relatório (16 carreiras de 24 temporadas, semente `tecnico-m1`), sem gravar arquivo; falha se alguma meta falhar (entra no `verify`) |
| `pnpm elencos:montar` | Remonta os elencos do Técnico (`packages/world/data/squads`) a partir das fontes versionadas, offline |
| `pnpm elencos:coletar` | Coleta o eFootball (rede e Chromium; fora do `verify`) |
| `pnpm desafio:calibrar` | Recalibra os alvos das missões do Desafio do dia |
| `pnpm carreira` | Uma carreira inteira no terminal, com o motor e os textos de verdade |
| `pnpm notas:exportar` / `pnpm notas:importar` | Planilha de força e prestígio dos clubes, ida e volta |
| `pnpm --filter @craque/game icones` | Redesenha os ícones do PWA a partir da marca |

### 6.1 Laboratório

Só em desenvolvimento: http://localhost:5173/#lab (ou o botão Laboratório no
pé do hub). Áreas:

- **Técnico** (a primeira): elencos e fontes, sorteio das propostas, finanças,
  eventos, simulador de partida e Europa × América do Sul, filosofias, a conta
  da contratação termo a termo, Desenvolver, rendimento escondido e temporadas
  inteiras simuladas no navegador. Detalhe no [README-TECNICO.md](README-TECNICO.md).

- **Desafio**: as mãos de hoje e dos próximos 13 dias, com Simular.
- **Fim de carreira**: uma carreira jogada sozinha, com pôster, biografia e
  "Abrir no resumo".
- **Cartas**: a carta nas cinco faixas, números que contam, selos Difícil e
  Desafio.
- **Design**: as peças da interface, avisos e a mensagem do resultado em todas
  as variantes.
- **Mundo**: clubes por país e divisão, com as notas, e as 211 seleções.
- **Arte**: escudos, selos, troféus e prêmios, reais e gerados.
- **Avatar**: o criador de personagem e uma galeria.
- **Motor**: um jogador evoluindo dos 16 aos 39 contra a faixa de jogadores
  parecidos, com tudo escolhível.
- **Temporadas**: um mundo de 2026 a 2050 sem jogador, com todos os
  campeões.

### 6.2 Ponta a ponta

```bash
pnpm e2e
```

Gera o build, sobe o `vite preview` em http://localhost:4173 (feche qualquer
outro servidor nessa porta antes) e joga no Chrome do sistema. Sem Google
Chrome, aponte `PW_CHROMIUM_PATH` para um Chromium instalado. O relatório
fica em `apps/game/e2e-relatorio/`; falhas deixam foto e rastro em
`apps/game/e2e-resultados/`. Uma parte só:

```bash
pnpm e2e e2e/jornada.spec.ts --project=desktop
```

### 6.3 Relatórios de balanceamento

```bash
pnpm balance
```

Imprime as 51 metas com ✓ ou ✗ e grava em `tools/balance/relatorios/`:
`evolucao.md` (o jogador: OVR por idade, faixas, posições, Difícil, ritmos),
`mundo.md` (60 mundos sem jogador: campeões, dinastias, acesso), `carreira.md`
(gols, Bolas de Ouro, Chuteiras, continentais), `fluxo.md` (o laço de
verdade: fim de carreira, eventos, empréstimos, traições) e `desafio.md` (10
anos de mãos). Os relatórios são versionados como registro de validação.

```bash
pnpm balance:recordes
```

Joga 150 Fenômenos por posição em três lotes (ambicioso, fiel, fiel ao
gigante) até o fim e mostra, para cada recorde, o melhor do lote, a mediana,
quantos alcançaram e quantos passaram por 1, 2 e 3.

### 6.4 Carreira no terminal

```bash
pnpm carreira
```

| Opção | Exemplo | O que faz |
|---|---|---|
| `--semente` | `--semente minha-carreira` | A mesma semente com as mesmas escolhas dá a mesma carreira |
| `--posicao` | `--posicao cam` | gk, cb, lb, rb, cdm, cm, cam, lm, rm, lw, rw, st |
| `--pais` | `--pais ARG` | Código de três letras do país |
| `--ritmo` | `--ritmo rapida` | `normal` (padrão, uma temporada por decisão) ou `rapida` (duas) |
| `--dificuldade` | `--dificuldade dificil` | `normal` ou `dificil` |
| `--idioma` | `--idioma es` | `pt`, `es` ou `en` |
| `--sobrenome`, `--numero` | `--sobrenome ROCHA --numero 10` | Nome na camisa e número dos sonhos |
| `--auto` | `--auto ambitious` | Joga sozinho: `balanced`, `ambitious`, `loyal` ou `random` |
| `--resumo` | `--auto --resumo` | Com `--auto`, só o resumo final |
| `--salvar`, `--carregar` | `--salvar minha.json` | Grava o save a cada decisão; carrega e continua |

Durante o jogo: o número escolhe, `h` mostra o histórico, `s` salva, `q` sai.

### 6.5 Notas dos clubes

1. `pnpm notas:exportar` gera `packages/world/data/clubes.csv` (separador `;`,
   abre direto no Excel em português).
2. Edite só `forca` (40 a 92) e `prestigio` (1 a 5).
3. `pnpm notas:importar` confere a planilha inteira e grava em
   `packages/world/data/clubs/`; uma linha errada recusa o arquivo todo.

---

## 7. Documentação e regras

- **[AI_RULES.md](AI_RULES.md)**: as regras para qualquer pessoa ou IA que
  mexer no projeto. A principal: toda mudança de funcionalidade, arquitetura
  ou lógica do motor atualiza este README e o GDD na mesma entrega.
- **[docs/GDD.md](docs/GDD.md)**: a especificação completa, seção por seção,
  com as metas de balanceamento (seção 40) e notas "Como ficou" onde a
  implementação mudou algo.
- **[docs/DECISOES.md](docs/DECISOES.md)**: cada decisão de arquitetura e de
  produto, com o porquê (D1 em diante). Decisão nova ganha o próximo número.

### Marcos

| Marco | Entrega |
|---|---|
| M0 a M2 | GDD, workspace, dados refeitos, arte e avatar portados, o jogador e a evolução |
| M3 e M4 | O mundo simulado, prêmios, mercado, eventos e o laço completo |
| M5 e M6 | Telas de entrada, carreira, save, resumo, biografia, jornal, pôster |
| M7 | Desafio do dia, Hall da Fama, conquistas, "E se...?" |
| M8 | Páginas de erro, PWA, acessibilidade, e2e |
| Depois do M8 | Regras do motor revistas (D42), interface sem revelação (D43), pressão do recorde (D44), mensagem do resultado e Início sem perguntas (D45): versão 2.0.0 |

## Revisão D61: consultas, economia e sessão

- Decisões com altura natural, sem o vazio entre contexto e alternativas. Informações
  de jogadores por hover de 300 ms ou toque; grupos mostram somente nome, OVR e idade
  dos integrantes que o motor realmente afeta. Menções sem grupo resolvido não inventam integrantes.
- Técnico: oito formações em duas filas de quatro, ordenadas por três/quatro/cinco
  defensores. Novas 3-4-3 (amplitude e três atacantes) e 5-4-1 (bloco baixo); coordenadas
  corrigidas na 4-3-3, 4-2-3-1 e 5-3-2. Arrastar titular sobre reserva efetua a troca
  nos dois sentidos. Estrela amarela marca características.
- Contratar: cabeçalho, filtros e orçamento fixos; somente a lista rola; rodapé em
  seu próprio espaço opaco. A base mostra o nome antes da promoção e abre o Elenco
  na ficha do promovido. Contratados recebem a etiqueta Novo reforço na temporada.
- Três métricas: **Verba para contratações**, **Folha mensal**, **Situação**. Receita
  continua como referência interna para o porte do clube; caixa não impede a compra,
  não compõe situação, avaliação ou próxima verba. Aumento altera o salário mensal;
  renegociação reduz a folha e cobra satisfação. Custos de eventos respeitam a verba.
- Promessas viraram **compromissos**, com meta, progresso e prazo no Clube. A cobrança
  e a barra usam a mesma função pura; lesões reduzem metas de presença. O guia `?`
  junto à marca explica o ciclo, todas as características, dinheiro e compromissos.
- Treze eventos novos e memória das três últimas cenas: liderança, adaptação,
  disciplina, treinamento, convivência, rodízio, imprensa e plano de jogo; elegibilidade
  depende do elenco e do calendário, e cada escolha tem custo ou contraponto.
- Ajustes: animações sempre ativas, respeitando movimento reduzido do sistema;
  vibração inicia desligada e só aparece em aparelhos com ponteiro de toque.
- Craque: empréstimo preservado em treino/renovação sem compra; rótulo contínuo no
  cabeçalho. Lesão mostra jogos perdidos. Troféus e prêmios separados; artilharia/craque
  identificam a competição. Pôster traz legendas e curva com primeiro/maior/último OVR.
  Legado é explicitamente diferente do humor atual da torcida. Conquista de disputar
  final de Copa do Mundo removida, inclusive dos desbloqueios legados. A genérica
  Campeão do mundo também saiu por duplicar a conquista específica da competição.
- Talento Normal: Operário 26%, Promissor 33%, Craque 23%, Estrela 12%, Fenômeno 6%.
  No Difícil, pesos anteriores normalizados, depois as mesmas alterações em pontos
  percentuais: 43,45 / 33,34 / 16,15 / 5,04 / 2,01 (soma 100%).
- Reconhecimentos dão +1 de OVR por título conquistado, coroa de competição,
  prêmio global e acesso com participação; teto único de **+3 por temporada**,
  depois do crescimento/declínio/treino, limitado a OVR 99 pelos atributos. Nenhuma
  coroa é contada de novo pela etiqueta genérica em `awards.won`.
- Debug de ambos os modos e laboratório são importados apenas com `IS_DEV`.
  Cenários de teste não desbloqueiam conquistas nem substituem a carreira retomável.
  Produção exclui os módulos, não apenas esconde os botões.

Detalhes e limites de equilíbrio: [D61](docs/DECISOES.md#d61-consultas-economia-clara-e-sessão-por-modo).

A vitrine abre o nome completo e os anos de cada peça por toque/clique, mesmo quando
as legendas da grade precisam encolher. O PNG mantém nomes e contadores separados,
e curva com números legíveis. Conversas mostram uma pessoa por vez com confirmação;
concluir sem escolher não decide por você. Craque remove os registros antigos de
retomada na abertura, e não exibe fluxos de continuar/limpar save.

A calibragem de produção/concorrência/mercado junto ao bônus D61 está no
[GDD 42.18](docs/GDD.md#4218-consultas-economia-e-sessões-por-modo-d61).


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

## Revisão D62: abertura leve e projeto somente v2

O hub carrega sua interface, arte e metadados necessários, sem antecipar telas,
motores, elencos ou laboratório. Posições do rascunho e nomes dos atributos da
carta usam os submódulos leves `@craque/engine/positions` e `@craque/engine/attributes`.
Após entrar no Craque ou Técnico, o app aquece
somente telas daquele modo; sair cancela os próximos downloads. Debug também
separa seus controles por modo e só os baixa ao abrir o painel.

O PWA instala somente a casca e o hub, suas dependências estáticas, CSS, duas
fontes latinas necessárias, ícones e páginas de erro. `build/gameLoading.ts`
calcula o grafo a partir do build, sem depender do nome/hash de um arquivo.
`game-cache.json` contém os grafos dos modos e só é lido depois da escolha.
O modo escolhido é guardado em lotes de quatro arquivos para funcionar offline;
um modo nunca aberto precisa de conexão. Imagens entram ao aparecer, ou quando
se escolhe Guardar todas nos ajustes. Não há cache preventivo dos dois jogos.

A v1, Next.js, Turborepo, pacotes, docs, lockfile e dependências antigos saíram.
A raiz delega seus comandos para v2; `pnpm deps` instala as dependências da v2.
O protótipo manager sem uso e sem dados foi preservado fora do projeto e retirado
do motor ativo, eliminando os quatro imports inexistentes que impediam verify.
As regras e versões dos motores usados pelo jogo não mudaram.

Validação D62: verify completo aprovado sem exclusões (679 testes, types/lint,
51 metas do Craque, 23 do Técnico e build); navegador: 75 aprovados, 7 pulados
por dispositivo. Conferência de desenvolvimento confirmou hub sem motor completo
e controles de teste por modo. Precache inicial: 53 entradas, cerca de 1,2 MiB.

## Revisão D63: elenco, mercado e legado vivo

Motores: Craque `2.0.0-m10`, Técnico `1.4.0`. Objetivo do Técnico mostra a
colocação diretamente; copas têm metas por porte do clube. A escalação automática
maximiza o OVR usando posições principais e secundárias, sem improvisar posições.
Lesionados não são titulares; o risco caiu de 2,2% para 0,25% por 90 minutos e o
afastamento é de um ou dois turnos, com recuperação no planejamento. No rápido,
o bloco anual cobre os dois turnos. A base oculta características antes da
promoção, pode gerar posições vizinhas e abre a consulta no contexto do Time.
Características incompatíveis com as posições não são atribuídas.

Negociações de compra/venda ficam guardadas na etapa, mesmo depois de fechar a
folha; voltar não consome outra ação. Nova busca exige outra confirmação de ação.
Consultas espontâneas podem chegar após resultados, sem gastar ação para responder.
A virada repõe o clube comandado com um a três jogadores da base ou da diretoria,
e os nomes das chegadas/aposentadorias são informados. Renovar preserva o elenco
restante; envelhecimento, aposentadoria e reposição explicam as mudanças.

Relações mudam pouco durante jogos/primeiro turno e respondem mais à campanha
concluída. Reputação tem ganho anual máximo 10, com peso maior para superar
expectativas de equipes fracas. As propostas mantêm a renovação e três externas,
com uma do país atual, ajustadas pela reputação. Ídolo exige quatro temporadas,
120 jogos, rendimento e importância para o nível do elenco.

Intercontinental anual: seis campeões continentais, ramo África/Ásia/Oceania,
derbi das Américas, Challenger e final contra a Europa. Mundial quadrienal:
32 equipes, oito grupos de quatro em turno único, oitavas até a final. Os
continentes sem elencos da base usam representantes genéricos. Supercopas de
jogo único identificam o campeão na conclusão da partida.

Prêmios anuais do Técnico: treinador mundial, da liga e da continental principal;
jogadores disputam artilharia, craque de competição e melhor do mundo, pelo
mesmo mundo simulado. Cada reconhecimento individual dá +1 OVR, com teto de três
por temporada e OVR 99. Não há craque de continental B/C nos dois modos.
O legado ganha números de todas as partidas, taças compartilhadas com o Craque,
jogadores consultáveis no auge, linha do tempo e pôster em lousa tática.

Craque: estrelas também em renovação e eventos de transferência; títulos das
duas temporadas do rápido ficam identificados no lance. Tooltips da linha do
tempo incluem a competição do prêmio. OVR do histórico é do fim daquele ano;
a carta é da idade atual. A influência imediata do jogador no clube continua
pequena (0,22 até 15 de vantagem e só 0,04 por ponto extra até 35, máximo 4,1 vezes a participação);
permanecer com qualidade acrescenta investimento discreto de até 0,21 ponto/ano,
com a mesma reversão à força base. D63 validada: verify integral aprovado (tipos, lint, 702 testes unitários, 51 metas do Craque, 23 do Técnico e build). Navegador: 77 aprovados e 7 pulados por dispositivo, sem falhas. Conferência visual de Craque e Técnico em PC/celular e nos dois temas, incluindo legado, abas, nomes, base, conquistas das duas temporadas e pôsteres. Arrasto da carta corrigido retirando a sobreposição fixa das formações; trocas com reservas passaram em mouse/toque. Busca preservada após outra ação e retomada local passaram no navegador.

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

**Valor no Craque.** Teto absoluto de €300 milhões, inclusive depois do humor ±6% e do arredondamento. Valor-base = `min(300M; 110000 × exp(0,185 × (min(OVR,80) − 50) + 0,12 × max(0,OVR − 80)) × fator de idade)`, OVR limitado a 1–99. O fator etário mantém 1,35 até 21; 1,2 até 24; 1 até 27; 0,85 até 29; 0,7 aos 30; 0,55 aos 31; 0,42 aos 32; 0,32 aos 33; 0,22 depois. Aos 25, OVR 90 vale cerca de €93,9M, 95 €171,2M e 99 €276,6M. OVR 99 aos 20 chega a €300M; aos 30 vale €193,6M e aos 34 €60,9M. O Técnico continua com sua referência financeira anterior, usando função separada, sem alterar salários, transferências ou resultados da versão 1.7.0.

**Animações, somente diagnóstico.** Nenhuma configuração de movimento ou regra de animação foi alterada. Na aba conectada, `data-motion=system` e a consulta `prefers-reduced-motion: reduce` retornou verdadeira. Portanto, o jogo está respeitando o pedido de movimento reduzido enviado pelo navegador/sistema. A configuração de efeitos de animação do Windows e uma eventual emulação no DevTools são os pontos a conferir.

**Validação final D68 (16/10/2026).** `pnpm verify` aprovado: tipos, lint, 766 testes unitários, nove cenários Windows, 51 metas Craque e 23 Técnico, mais build de produção. O lote ampliado de 6.000 carreiras por lote também passou nas 51 metas sem alterar limites. `pnpm balance:recordes`: 2.250 carreiras, 20/21 marcas observadas; gols pela seleção ficaram em 142 para referência 146, com zero ocorrências registrado. Suíte completa do navegador: 95 aprovados e nove pulos previstos por dispositivo, sem falhas. Revisão manual do hipotético próprio com ajustes de teste em PC e 360 × 640, nos dois temas, sem vazamento lateral; criação da linha alternativa confirmada. O laboratório também foi conferido com FIN 99, usando as taxas reais do motor. A preferência de movimento reduzido foi apenas lida, sem mudar animações. Após isolar a receita do Técnico, seis regressões finais dos dois modos foram aprovadas. Uma espera do teste foi corrigida para aguardar a resolução assíncrona antes de auditar a próxima tela.
