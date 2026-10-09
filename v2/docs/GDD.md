# Futeiros v2: Game Design Document

> **Futeiros (D50 a D58).** Este documento especifica os dois jogos do hub.
> As seções 0 a 40 são o **Craque** (carreira de jogador, regras inalteradas);
> a [seção 41](#41-o-hub-do-futeiros) é o hub e a
> [seção 42](#42-técnico-a-carreira-de-treinador) é o **Técnico** (carreira de
> treinador). O Técnico tem também um README próprio,
> [`README-TECNICO.md`](../README-TECNICO.md).

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
O ciclo obrigatório de testar, corrigir e retestar está em `../AI_RULES.md`.

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

Especificação do CRAQUE v2, escrita do zero para a reescrita clean room de
2026-09-29. Este documento é a **única referência funcional** da implementação:
o código do v2 nasce daqui, e não do código do v1 nem de qualquer outro jogo.

Os números marcados como **(inicial)** são pontos de partida do modelo. Eles são
ajustados pelo harness de balanceamento (`tools/balance`) até que as metas da
seção 40 sejam atingidas. As metas são fixas; os números iniciais não.

**Mantido em dia com o código.** Onde a implementação mudou uma regra, a seção
traz uma nota "Como ficou", com a decisão (`DECISOES.md`) que explica o
porquê. Quem mexer em funcionalidade, arquitetura ou motor atualiza este
documento e o `README.md` na mesma entrega: é a regra absoluta do
[`AI_RULES.md`](../AI_RULES.md). O resumo do jogo inteiro, com as fórmulas e
os comandos, está no [`README.md`](../README.md).

---

## Índice

| # | Seção | # | Seção |
|---|---|---|---|
| 0 | Como ler | 21 | Narrativa: manchetes e capa |
| 1 | Visão e pilares | 22 | A revelação da temporada |
| 2 | Glossário | 23 | Fim de carreira |
| 3 | Configuração da partida | 24 | O resumo |
| 4 | Tempo e calendário | 25 | A biografia |
| 5 | Telas e navegação | 26 | Recordes reais |
| 6 | Telas de entrada | 27 | Desafio do dia |
| 7 | Os dados do mundo | 28 | Hall da Fama, conquistas e "E se...?" |
| 8 | A simulação do mundo | 29 | Compartilhamento |
| 9 | O jogador | 30 | A carta |
| 10 | Evolução | 31 | Arte e assets |
| 11 | A temporada do jogador | 32 | Linguagem visual |
| 12 | Seleção nacional | 33 | Movimento, som e vibração |
| 13 | Prêmios individuais | 34 | Persistência |
| 14 | O laço de carreira | 35 | Idiomas e texto |
| 15 | Mercado | 36 | Acessibilidade |
| 16 | A missão do clube | 37 | Erros e offline |
| 17 | Torcida e legado | 38 | Ferramentas de desenvolvimento |
| 18 | Eventos de carreira | 39 | Invariantes |
| 19 | Número da camisa | 40 | Metas de balanceamento e testes |
| 20 | O rival | 41 | O hub do Futeiros |
| | | 42 | Técnico: a carreira de treinador |

---

## 0. Como ler

- **OVR** é a nota geral de 1 a 99 impressa na carta.
- **Força** é a nota de um clube ou seleção na mesma escala do OVR.
- **Rolagem** é um sorteio do gerador semeado (seção 8.1). Nada no jogo usa
  aleatoriedade fora dele.
- **Período** é o bloco de temporadas entre duas decisões (1, 2 ou 3).
- `limitar(x, a, b)` prende `x` entre `a` e `b`.
- `N(μ, σ)` é uma normal; `U(a, b)` é uniforme; `Poisson(λ)` e
  `Binomial(n, p)` como de costume.

---

## 1. Visão e pilares

CRAQUE é um **simulador de carreira de futebol jogado por decisões**. Você cria
um atleta de 16 anos e conduz a carreira até a aposentadoria escolhendo onde
jogar, no que treinar e como reagir ao que acontece. Entre uma decisão e outra o
jogo simula temporadas inteiras de um mundo que também está vivo.

**Pilares**

1. **Cada decisão pesa.** Poucas decisões por carreira, todas com troca real:
   minutos contra prestígio, segurança contra risco, lealdade contra ambição.
2. **O mundo reage.** Ligas têm tabela, copas têm campeão, clubes crescem e
   caem. O jogador vê onde terminou, contra quem jogou e quem levou o prêmio
   quando não foi ele.
3. **A carta é o placar.** Todo resultado aparece como movimento em seis
   atributos e no OVR que sai deles.
4. **Cada carreira conta uma história.** O fim produz biografia, jornal, linha
   do tempo e vitrine que só fazem sentido para aquela carreira.
5. **Sessão curta.** Uma carreira leva de 3 a 5 minutos no ritmo Normal e um
   pouco mais no Intenso.
6. **Local e determinístico.** Sem conta nem servidor. A mesma semente com as
   mesmas escolhas produz a mesma carreira, sempre.

Não existe vitória nem derrota formal. A única modalidade com pontuação é o
Desafio do dia (seção 27).

---

## 2. Glossário

| Termo | Significado |
|---|---|
| Capacidade (L) | Habilidade latente do jogador, na escala do OVR, com casas decimais. Nunca é exibida |
| Potencial (P) | Teto suave de L, sorteado no início. Nunca é exibido como número |
| Talento | Uma de cinco faixas de potencial |
| Atributos | Seis números da carta, derivados de L, da posição, da idade e do treino |
| Força do clube | Nível do elenco de um clube na temporada |
| Prestígio | Tamanho histórico de um clube, de 1 a 5 |
| Papel no elenco | Craque do time, Titular, Rotação, Reserva ou Sem espaço |
| Missão | O motivo pelo qual um clube contratou o jogador |
| Torcida | Medidor de 0 a 100 do apoio da arquibancada do clube atual |
| Legado | Como um clube lembra do jogador: De passagem, Respeitado, Ídolo, Lenda |
| Rival | Um jogador real da mesma geração, usado como régua |
| Elite | O grupo de jogadores reais que disputa os prêmios com você |
| Édito | No desafio, uma regra proibitiva julgada no fim da carreira |

---

## 3. Configuração da partida

### 3.1 Ritmo

| Ritmo | Temporadas por decisão | Decisões por carreira (aprox.) | Eventos pessoais |
|---|---|---|---|
| **Intensa** (padrão) | 1 | 24 | 7 a 8 |
| Normal (rápido) | 2 | 12 | 4 a 5 |

Dois ritmos só, decisão do produto em 2026-09-30. O ritmo muda apenas quantas
temporadas passam entre decisões. As regras que contam tempo (dispensa,
intervalo de foco de treino) contam **temporadas**, nunca decisões, para que os
dois ritmos joguem o mesmo futebol.

**Como ficou na revisão do M8 (D43):** na tela, "Rápida" (duas temporadas
por decisão) fica à esquerda e "Normal" (uma por decisão, o padrão) à
direita. Os nomes internos continuam `normal` e `intense`. No resto deste
documento, escrito antes da troca, "Intensa" é o Normal de hoje e "ritmo
Normal" é a Rápida de hoje (o Desafio do dia, por exemplo, joga com duas
temporadas por decisão).

### 3.2 Dificuldade

| Efeito | Normal | Difícil |
|---|---|---|
| Distribuição de talento | 28 / 34 / 22 / 11 / 5 | 45 / 34 / 15 / 4 / 1 |
| Multiplicador de evolução | 1,00 | 0,86 (inicial) |
| Multiplicador de declínio | 1,00 | 1,25 (inicial) |
| Multiplicador de lesão | 1,00 | 1,60 (inicial) |
| Nível de mercado | +0 | -3 |
| Quedas de torcida | ×1,00 | ×1,35 |
| Dispensa por falta de minutos | a partir dos 25, após 2 temporadas | a partir dos 23, após 1 temporada |

Só as oscilações **negativas** de torcida são amplificadas no difícil. O
Desafio do dia é sempre Difícil e Normal.

### 3.3 O setup

Tudo que a simulação lê vem de um único objeto imutável:

```
setup = {
  seed, startYear, pace, difficulty, challengeId?,
  identity: { surname, foot, nationality, position, dreamNumber?, avatar? }
}
```

- `seed`: texto. Numa carreira comum combina o instante da criação com um
  componente aleatório do navegador. No desafio, deriva do dia.
- `startYear`: o ano em que a carreira começa. Numa carreira comum, o ano
  corrente. No desafio, o ano do identificador do dia.
- `foot` e `avatar` são cosméticos: a simulação nunca os lê.

---

## 4. Tempo e calendário

- A temporada `i` (começando em 0) acontece no ano `startYear + i`, com o
  jogador na idade `16 + i`.
- A última temporada jogável é a dos 39 anos. Aos 40 a carreira termina.
- O ano é o rótulo de tudo que o jogador vê ("Temporada 2031", "Copa do Mundo
  2034").

**Torneios com calendário próprio (estilizado)**

| Torneio | Anos |
|---|---|
| Copa do Mundo | ano mod 4 = 2 (2026, 2030, 2034...) |
| Continentais de seleções (Euro, Copa América, Copa Ouro, Copa Africana, Copa da Ásia, Copa da OFC) | ano mod 4 = 0 (2028, 2032...) |
| Mundial de Clubes | ano mod 4 = 1 (2029, 2033...) |
| Copa Intercontinental | todo ano |

**Sedes da Copa do Mundo** entram classificadas: 2026 EUA, México, Canadá; 2030
Espanha, Portugal, Marrocos; 2034 Arábia Saudita. Depois disso, sem sede fixa.

---

## 5. Telas e navegação

```
            ┌───────────┐
            │  INÍCIO   │◄─────────────────────────┐
            └─┬───┬───┬─┘                          │
   Começar    │   │   │ Hall da Fama               │
              ▼   │   ▼                            │
     ┌──────────┐ │ ┌──────────────┐               │
     │IDENTIDADE│ │ │ HALL DA FAMA │──(abre resumo)│
     └──┬────▲──┘ │ └──────────────┘               │
        │    │    │ Desafio                        │
        ▼    │    ▼                                │
     ┌──────────┐ ┌──────────┐                     │
     │APARÊNCIA │ │ DESAFIO  │                     │
     └──────────┘ └────┬─────┘                     │
        │ Confirmar    │ Jogar                     │
        ▼              ▼                           │
     ┌─────────────────────────┐                   │
     │        CARREIRA         │                   │
     └───────────┬─────────────┘                   │
                 ▼ fim                             │
     ┌─────────────────────────┐                   │
     │         RESUMO          ├───────────────────┘
     └─────────────────────────┘
```

Regras:

- A navegação é uma máquina de estados tipada, sincronizada com o histórico do
  navegador. O botão voltar do sistema anda para a tela anterior.
- Sair da Carreira por qualquer caminho (marca, voltar) pede confirmação. A
  carreira **não é descartada**: ela continua salva e aparece como "Continuar"
  no Início.
- O botão **Encerrar carreira** (só na Carreira) confirma, aposenta o jogador na
  hora (motivo voluntário) e vai direto ao Resumo.
- **Jogar de novo** no Resumo volta à Identidade com o rascunho preservado.
- Recarregar a página retoma a tela de Carreira ou Resumo em que o jogador
  estava. Qualquer outra tela recarrega no Início.
- Só existe uma carreira em andamento por vez. Começar outra com uma em
  andamento pede confirmação e arquiva a anterior no Hall da Fama como
  "interrompida".
- Um endereço com `#c=` (o link da carreira, seção 29.2) abre direto o resumo
  compartilhado, em modo leitura. Sair dele tira o fragmento da URL: recarregar
  depois abre o jogo normal.

---

## 6. Telas de entrada

### 6.1 Início

- Marca, título e subtítulo com o tom do produto.
- Cartão **Continuar carreira** quando há save: sobrenome, idade, clube, OVR.
- Seletor de **ritmo** (2 opções) e de **dificuldade** (2), cada um com uma
  linha explicando o efeito da opção ativa.
- **Começar carreira** (primário), **Jogo rápido** (identidade e aparência
  aleatórias, direto para a carreira), **Desafio do dia** (com contagem
  regressiva até a virada em UTC), **Hall da Fama**.
- Carta de demonstração com o rascunho do jogador, ou silhueta e "VOCÊ".
- Números do mundo (clubes, ligas, seleções), lidos dos dados.
- Desde o M5: Continuar, ritmo, dificuldade, Começar, Jogo rápido, a carta e os
  números do mundo. Desafio do dia e Hall da Fama entram com o M7. O Início não
  carrega o motor: o cartão de Continuar lê o retrato do save (seção 34.2).

**Como ficou na revisão do M8 (D43):** no PC, tudo numa tela só, em três
colunas. A carreira encerrada não aparece (fica no Hall), e o último jogador
montado volta pronto na próxima carreira; o jogo rápido não o apaga.

**Como ficou depois (D45):** o Início é para começar. A carreira em andamento
não aparece nele, e começar outra (Começar carreira, Jogo rápido ou o
Desafio do dia) não pergunta nada: a de antes, com ao menos uma temporada,
entra no Hall da Fama como interrompida. Abrir o jogo de novo volta para a
carreira guardada.

### 6.2 Identidade

No celular é um fluxo em etapas; no desktop, uma tela só. A carta ao vivo
acompanha as escolhas.

| Campo | Regras |
|---|---|
| Sobrenome | Até 16 caracteres, obrigatório (não pode ser só espaço), maiúsculas ao confirmar com regra do idioma |
| Número dos sonhos | Opcional, 1 a 99. Vazio significa "o clube escolhe" |
| Pé preferido | Direito (padrão) ou esquerdo. Cosmético |
| Nacionalidade | 211 países, busca sem acento, ordem alfabética no idioma atual, sugestões no topo (países com liga jogável) |
| Posição | Toque num campo desenhado com 12 posições. Cada uma mostra o que pesa na nota |
| Aparência | Opcional; abre o editor |

Confirmar exige sobrenome, nacionalidade e posição. Confirmar toca o apito e
cria a carreira.

**Como ficou na revisão do M8 (D43):** no PC, uma tela só (carta e aparência,
nome e posição, país com a lista rolando por dentro). Saiu "o que pesa na
nota" da posição. O número dos sonhos avisa que número de outra posição é
muito raro.

### 6.3 Aparência (portada do v1)

O editor de avatar e o renderizador vetorial são **portados sem alteração de
comportamento**: mesmas opções, mesma ordem, mesmas regras (deslizadores de
posição invertidos, barba que acompanha a cor do cabelo, boina que substitui o
cabelo, "Surpreenda-me", "Voltar ao cinza"). O renderizador fica idêntico byte a
byte. Só a moldura da tela adota a linguagem visual do v2.

**Como ficou na revisão do M8 (D43):** as mesmas opções numa moldura nova:
prévia grande e fixa, três abas (Rosto, Cabelo e barba, Detalhes) e
"Desfazer". No PC, cabe na janela.

**Como ficou depois (D45):** as seções de cada aba descem em colunas de
jornal, cada uma logo abaixo da de cima, sem o buraco que a grade deixava.
No PC, a tela tem o tamanho do que tem dentro (nunca maior que a janela) e
a prévia ficou menor; na aba Rosto, a ordem segue o rosto de cima para
baixo (pele, sobrancelha, olhos, nariz, boca).

### 6.4 Desafio

Ver seção 27.

---

## 7. Os dados do mundo

### 7.1 Escopo

| Conjunto | Quantidade |
|---|---|
| Países (nacionalidades) | 211 |
| Países com liga jogável | 17 |
| Ligas | 32 (17 primeiras divisões, 15 segundas) |
| Clubes | 489 |
| Confederações | UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC |

México e Estados Unidos têm só a primeira divisão, e por isso lá não há acesso
nem rebaixamento.

Nomes, países e divisões de clubes são fatos e são mantidos. **Todas as notas
são novas**, escritas para o v2, e ficam num CSV revisável
(`packages/world/data/clubs.csv`).

### 7.2 Clube

| Campo | Uso |
|---|---|
| `id` | Único no mundo inteiro. Colisão é erro de teste |
| `name`, `short`, `abbr` | Exibição |
| `country`, `division` | Onde joga no início do mundo |
| `strength` | Força base (40 a 92) |
| `prestige` | Prestígio (1,0 a 5,0) |
| `colors` | Primária e secundária |
| `kit` | Padrão da camisa (liso, listras verticais, listras horizontais, faixa, xadrez) |
| `crest` | Caminho da imagem real, quando existe |

### 7.3 Liga

`id`, `name`, `country`, `division`, `leagueGames` (jogos de liga por
temporada, próximo do real), `promotionSlots` (vagas trocadas com a divisão
vizinha), `logo`, `trophy`.

### 7.4 País

Nomes em pt/es/en, ISO alfa-2, código FIFA, confederação, **força da seleção**
(nota nova), cores e padrão do kit, bandeira.

### 7.5 Competições

| Chave | O que é | Importância |
|---|---|---|
| `league` | Liga nacional (1ª divisão) | 1,0 |
| `second` | Liga da 2ª divisão | 0,5 |
| `cup` | Copa nacional (não existe no México) | 0,5 |
| `leagueCup` | Copa da liga (só Inglaterra) | 0,35 |
| `superCup` | Supercopa nacional (países listados nos dados) | 0,25 |
| `continental1` | Champions League, Libertadores, Concachampions | 2,5 |
| `continental2` | Europa League, Sul-Americana | 1,3 |
| `continental3` | Conference League | 0,8 |
| `continentalSuper` | Supercopa da UEFA, Recopa | 0,6 |
| `intercontinental` | Copa Intercontinental | 1,0 (Europa) / 2,0 (fora dela) |
| `clubWorldCup` | Mundial de Clubes | 2,5 (Europa) / 3,5 (fora dela) |
| `nationsCup` | Continental de seleções | 2,0 |
| `worldCup` | Copa do Mundo | 3,5 |

A importância de um título de clube é julgada pela **confederação do clube**,
nunca pelo passaporte do jogador.

### 7.6 Rivalidades

Tabela de clássicos reais, só para marcar "Traidor" quando o jogador troca um
clube pelo rival histórico. Pares não listados não são rivais.

---

## 8. A simulação do mundo

### 8.1 Aleatoriedade

- O gerador é semeado por texto e **dividido em fluxos**: cada sistema recebe um
  gerador próprio derivado de `(seed, sistema, ano ou rótulo)`. Sistemas:
  `birth` (criação do jogador, com um fluxo por característica), `world`,
  `titles`, `season`, `growth`, `injury`, `awards`, `market`, `events`,
  `national`, `narrative`, `bio`, `scout` e `policy` (só para jogadores
  automáticos do harness; a simulação nunca o lê).
- Consequência: acrescentar uma rolagem num sistema não muda nenhum outro.
- Primitivas: real em faixa, inteiro em faixa, chance (p limitado a [0,1]),
  escolha uniforme, escolha ponderada (peso negativo conta zero; soma zero é
  erro), embaralhar, normal, Poisson, binomial.
- Nada usa relógio nem `Math.random` dentro do motor.

### 8.2 Força efetiva

A força de um clube numa temporada é:

```
efetiva = força_atual + impacto_do_jogador (só no clube do jogador)
impacto = κ × participação × limitar(OVR - força_atual, -3, 15)
κ = 0,22 (inicial)
participação = fração dos jogos do clube que o jogador disputou
```

Um craque 15 pontos acima de um clube que joga tudo vale +3,3 de força.

### 8.3 Tabela da liga

Toda liga de todo país é simulada toda temporada.

```
nota_i = efetiva_i + N(0; 3,1)
classificação = ordem decrescente de nota
pontos_por_jogo_i = limitar(1,36 + 0,078 × (nota_i - média), 0,35, 2,63)
pontos_i = arredondar(ppj_i × jogos_da_liga)
```

O teto de 2,63 por jogo é o recorde real (100 pontos em 38 jogos). Com a
inclinação inicial (0,115) o campeão espanhol fazia 98 pontos de mediana; com o
desvio inicial (2,6) o PSG ganhava 96% das Ligue 1.

Pontos são forçados a não crescer com a posição (empates desfeitos por um ponto
a menos). O jogador vê posição e pontos do próprio clube e a tabela resumida.

### 8.4 Acesso e rebaixamento

Ao fim da temporada, nos países com duas divisões, os `promotionSlots` últimos
da primeira trocam de lugar com os `promotionSlots` primeiros da segunda. O
campeão da segunda ganha o título `second`. A divisão de cada clube é estado do
mundo e vale para tudo que o jogador vê (ofertas, carta, histórico, jornal).

### 8.5 Copas nacionais

Todos os clubes do país (1ª e 2ª divisão).

```
nota_i = efetiva_i + N(0; 4,2)
```

Campeão é a maior nota; a segunda é o vice. A posição do clube do jogador na
ordem define a fase alcançada: 1 campeão, 2 final, 3-4 semi, 5-8 quartas, 9-16
oitavas, depois fases anteriores. A copa da liga inglesa usa σ = 5,2.

### 8.6 Supercopa nacional

Jogada no início da temporada `Y`, entre o campeão da liga e o campeão da copa
de `Y-1` (se forem o mesmo, entra o vice da liga). Jogo único:

```
P(A vence) = 1 / (1 + e^(-(efetiva_A - efetiva_B) / 4,5))
```

Como o mundo é simulado, quem assina com um classificado joga a supercopa.

### 8.7 Classificação continental

Definida pela tabela e pelas copas de `Y-1`, para a temporada `Y`.

| Confederação | Primária | Secundária | Terciária |
|---|---|---|---|
| UEFA: ENG, ESP, ITA, GER | 1º-4º | 5º + campeão da copa | 6º |
| UEFA: FRA | 1º-3º | 4º + campeão da copa | 5º |
| CONMEBOL: BRA | 1º-6º + campeão da copa | 7º-12º | - |
| CONMEBOL: ARG | 1º-5º + campeão da copa | 6º-11º | - |
| CONMEBOL: demais | 1º-3º + campeão da copa | 4º-6º | - |
| CONCACAF: MEX, USA | 1º-5º + campeão da copa (USA) | - | - |

O campeão da primária entra na edição seguinte mesmo sem vaga pela liga. Vaga
repetida desce para o próximo da tabela. Clubes de outros países europeus, se o
conjunto de dados os tiver, entram por força.

### 8.8 Torneios continentais

```
nota_i = efetiva_i + N(0; 4,2)
```

Mata-mata tem mais sorte que liga: com o desvio inicial (3,4) o maior campeão
levava 40% das Libertadores de cada mundo. A ordem define campeão, vice e fase (mesma regra da seção 8.5 sobre o tamanho do
grupo). Um gigante praticamente nunca está na secundária, porque já se
classificou para a primária: isso sai do modelo, não de uma exceção.

### 8.9 Supercopa continental

Início de `Y`: campeão da primária contra o da secundária de `Y-1`. Mesma fórmula
logística da seção 8.6.

### 8.10 Copa Intercontinental

- Temporada `Y`: campeão da UEFA de `Y-1` contra o vencedor do chaveamento dos
  campeões de CONMEBOL e CONCACAF de `Y`. As temporadas sul e norte-americanas
  seguem o ano civil, e as europeias terminam no meio do ano: é por isso que o
  campeão europeu joga no ano seguinte.
- Chaveamento: nota com σ 3,4; final pela fórmula logística.
- Campeões de AFC, CAF e OFC entram como adversários genéricos de força 72, 74 e
  60 quando não houver clube desses continentes nos dados.

### 8.11 Mundial de Clubes

Anos de Mundial (seção 4). Participantes: os campeões das primárias de UEFA,
CONMEBOL e CONCACAF nas quatro temporadas anteriores, completados pelos mais
fortes de cada confederação até UEFA 12, CONMEBOL 6, CONCACAF 4. Nota com σ 3,4.

### 8.12 Seleções

```
efetiva_seleção = força_seleção + 0,12 × participação × limitar(OVR - força, -3, 15)
nota = efetiva + N(0; 3,0)
```

- **Copa do Mundo**: 48 vagas. UEFA 16, CAF 9, AFC 8, CONMEBOL 6, CONCACAF 6,
  OFC 1, mais 2 repescagens para as melhores notas restantes. Sedes entram
  direto. O torneio ordena os 48 por nota: 1 campeão, 2 final, 3-4 semi, 5-8
  quartas, 9-16 oitavas, 17-32 fase de 32, resto fase de grupos.
- **Continental de seleções**: todos da confederação (UEFA: as 24 melhores
  notas).

### 8.13 Força dos clubes ao longo do tempo

Depois de cada temporada:

```
força_nova = limitar(força + 0,3 × (força_base - força) + sucesso + N(0; 0,6), 35, 95)
sucesso: título de liga +0,4; primária +0,6; secundária +0,25; copa +0,15;
         acesso +0,5; rebaixamento -0,8; 3 últimas colocações sem cair -0,2
```

Um campeão perene se estabiliza em `sucesso / volta` acima da base. Com os números
iniciais (+2,5 por ano contra 25% de volta) ele subia 10 pontos e ganhava tudo
para sempre: o Flamengo fazia 105 pontos todo ano. Com os atuais, fica cerca de
3 pontos acima, e 99% dos clubes terminam 25 temporadas a menos de 3 da base.

A volta à média mantém o mundo reconhecível: um gigante que cai volta a ser
forte com o tempo, e um pequeno que ganhou tudo não vira gigante para sempre.

---

## 9. O jogador

### 9.1 Posições e grupos

| Grupo | Posições (pt) | es | en |
|---|---|---|---|
| Atacante | CA, PE, PD | DC, EI, ED | ST, LW, RW |
| Meia ofensivo | MEI, ME, MD | MCO, MI, MD | CAM, LM, RM |
| Meio-campo | MC, VOL | MC, MCD | CM, CDM |
| Lateral | LE, LD | LI, LD | LB, RB |
| Zagueiro | ZAG | DFC | CB |
| Goleiro | GOL | POR | GK |

**Defensores** para fins de exibição (jogos sem sofrer gol aparecem): ZAG, LE,
LD, VOL.

### 9.2 Atributos

| Linha | Sigla | Goleiro | Sigla |
|---|---|---|---|
| Ritmo | RIT | Elasticidade | ELA |
| Finalização | FIN | Manejo | MAN |
| Passe | PAS | Reposição | REP |
| Drible | DRI | Reflexos | REF |
| Defesa | DEF | Velocidade | VEL |
| Físico | FIS | Posicionamento | POS |

Goleiro só tem os seis de goleiro; jogador de linha só os seis de linha.

### 9.3 OVR

```
OVR = limitar(arredondar( Σ peso_a × atributo_a / 100 + bônus_da_posição ), 1, 99)
```

| Pos | RIT | FIN | PAS | DRI | DEF | FIS | Bônus |
|---|---|---|---|---|---|---|---|
| CA | 10 | 42 | 8 | 20 | 0 | 20 | +2 |
| PE / PD | 22 | 22 | 16 | 32 | 0 | 8 | +2 |
| MEI | 8 | 20 | 34 | 30 | 0 | 8 | +3 |
| ME / MD | 20 | 16 | 26 | 30 | 2 | 6 | +2 |
| MC | 6 | 10 | 34 | 26 | 12 | 12 | +4 |
| VOL | 6 | 4 | 24 | 12 | 34 | 20 | +4 |
| LE / LD | 22 | 4 | 18 | 14 | 28 | 14 | +3 |
| ZAG | 8 | 0 | 10 | 4 | 50 | 28 | +3 |

| Pos | ELA | MAN | REP | REF | VEL | POS | Bônus |
|---|---|---|---|---|---|---|---|
| GOL | 24 | 20 | 8 | 28 | 4 | 16 | +1 |

Cada linha soma exatamente 100 (teste). Atributo que a posição não usa tem
peso zero. O bônus existe porque cartas reais ficam um pouco acima da média
simples dos seis números impressos.

### 9.4 Capacidade e atributos

O OVR nunca é decidido direto. O jogador tem uma **capacidade latente L**, e os
atributos saem dela:

```
atributo_a = limitar(arredondar(L + forma_a + idade_a + treino_a), 1, 99)
```

- `forma_a`: o molde da posição mais o DNA individual. O DNA é sorteado uma vez
  (N(0; 2,2) por atributo) e recentrado para somar zero no peso da posição. O
  molde é normalizado para que o OVR fique igual a L aos **28 anos** (a idade
  de referência) e sem treino, em qualquer posição. Sem a idade de
  referência, posições que pesam a leitura de jogo (zagueiro, volante) teriam
  um pico de OVR mais alto que pontas com a mesma capacidade.
- `idade_a`: como o corpo muda o perfil (seção 9.5).
- `treino_a`: bônus permanentes de foco de treino e de eventos, até +8 por
  atributo.

**Moldes por posição (inicial)**

| Pos | RIT | FIN | PAS | DRI | DEF | FIS |
|---|---|---|---|---|---|---|
| CA | +3 | +6 | -6 | +1 | -28 | +1 |
| PE / PD | +7 | 0 | -3 | +5 | -30 | -8 |
| MEI | -2 | +1 | +5 | +4 | -26 | -9 |
| ME / MD | +5 | -3 | +2 | +3 | -18 | -8 |
| MC | -4 | -6 | +5 | +2 | -4 | -1 |
| VOL | -6 | -14 | +2 | -5 | +5 | +3 |
| LE / LD | +5 | -18 | -2 | -3 | +2 | -1 |
| ZAG | -7 | -26 | -8 | -14 | +6 | +4 |

| Pos | ELA | MAN | REP | REF | VEL | POS |
|---|---|---|---|---|---|---|
| GOL | +2 | 0 | -6 | +3 | -14 | +1 |

Mudança de posição (evento) troca o molde e mantém L, DNA e treino.

### 9.5 A idade no perfil

| Classe | Atributos | Curva (pontos ligados por retas) |
|---|---|---|
| Explosivos | RIT, VEL | +1 aos 16; +2 dos 18 aos 25; 0 aos 29; -1,5 por ano depois |
| Físicos | FIS, ELA | -3 aos 16; +1 dos 20 aos 31; -1,2 por ano depois |
| Técnicos | FIN, DRI, REF | 0 até os 31; -0,8 por ano depois |
| Leitura | PAS, DEF, POS, MAN, REP | -3 aos 16; +2 dos 30 aos 34; -0,5 por ano depois |

A explosão vai primeiro e a leitura de jogo vai por último. Esse é o motivo de
um veterano ainda parecer útil na carta enquanto já perde minutos. As curvas
são contínuas de propósito: um degrau faria um atributo cair dois pontos numa
virada de temporada sem motivo nenhum.

### 9.6 Talento e potencial

| Faixa | Potencial | Normal | Difícil |
|---|---|---|---|
| Operário | 66 a 74 | 28% | 45% |
| Promissor | 74 a 81 | 34% | 34% |
| Craque | 81 a 87 | 22% | 15% |
| Estrela | 87 a 92 | 11% | 4% |
| Fenômeno | 92 a 97 | 5% | 1% |

P é uniforme dentro da faixa. O potencial é **teto suave**: a evolução perde
força perto dele, mas nunca é travada.

**Capacidade inicial**: `L = limitar(46 + 1,3 × índice_da_faixa + N(0; 1,6), 43, 56)`,
com índice de 0 a 4. Um fenômeno costuma ser visivelmente melhor aos 16, mas não
o bastante para entregar a faixa.

**Prodígio**: na criação, Estrela tem 14% e Fenômeno 26% de chance de chegar
pronto: `L = max(L, P - U(11, 17))`. Acontece antes da primeira decisão, para
que a carta, as ofertas e o primeiro ano já sejam do jogador que ele é.
Aplicado depois da primeira temporada, viraria um salto de 30 pontos sem
explicação.

### 9.7 Maturação

Cada jogador tem uma **idade de pico** sorteada:

```
pico = base_do_grupo + perfil + N(0; 0,6)
base: Atacante 26,5; Meia ofensivo 26,5; Meio-campo 27,5; Lateral 27;
      Zagueiro 28,5; Goleiro 30
perfil: precoce -2 (15%), normal 0 (70%), tardio +2 (15%); goleiro sempre normal
```

### 9.8 Traços

| Traço | Peso | Efeito |
|---|---|---|
| Competidor | 20 | sucesso em escolhas de risco ×1,12; evolução ×1,04 |
| Profissional | 20 | declínio ×0,8; lesões ×0,85 |
| Líder | 15 | torcida +2 por temporada; destrava eventos de capitão; legado +10% |
| Artista | 15 | torcida +4 por temporada; oscilação de produção maior |
| Pavio curto | 15 | torcida -1 por temporada; eventos de expulsão; risco ×1,05 |
| Vidraça | 15 | lesões ×1,5; risco ×0,9 |

### 9.9 Leitura do olheiro

O potencial nunca aparece como número. O olheiro dá uma leitura que afina com
**idade e jogos ao mesmo tempo**:

| Nível | Portão | O que mostra |
|---|---|---|
| Em observação | antes do portão seguinte | "Ainda é cedo" |
| Boato | 20 anos e 60 jogos | duas faixas vizinhas com "?"; desvio de -2 a +2 com pesos 10/22/36/22/10 |
| Aproximada | 24 anos e 180 jogos | duas faixas com "?"; desvio de -1 a +1 com pesos 18/64/18 |
| Certeira | 29 anos e 350 jogos | a faixa verdadeira |

- O desvio é sorteado uma vez por nível num fluxo derivado, para a leitura não
  mudar a cada tela.
- **A cor segue a faixa reportada, nunca a verdadeira.** Colorir pela verdadeira
  entregaria a resposta.
- A interface desenha a leitura como uma régua de potencial com uma faixa de
  incerteza que estreita a cada nível.

### 9.10 Valor de mercado

```
valor = 110.000 € × e^(0,185 × (OVR - 50)) × fator_de_idade × U(0,94; 1,06)
fator_de_idade: ≤21 1,35; 22-24 1,2; 25-27 1,0; 28-29 0,85; 30 0,7;
                31 0,55; 32 0,42; 33 0,32; 34+ 0,22
```

Formatação por idioma: "€180M", "€12,5M" (pt/es) ou "€12.5M" (en), "€850 mil"
(pt), "€850K" (en, es).

---

## 10. Evolução

Roda uma vez por temporada, depois dos jogos, com o que realmente aconteceu.

### 10.1 Crescimento de L

O potencial P limita o **nível total**: a capacidade natural L mais o que o
treino soma ao OVR (`nível = L + Σ peso_a × treino_a / 100`). O talento decide
até onde se chega; idade, minutos, treinador e sorte decidem quando.

```
ganho_bruto = base × T(idade, pico) × S(nível, P) × jogo × treinador × forma
              × confiança × traço × dificuldade

T = 1 / (1 + e^((idade - (pico - 2,5)) / 1,8))
folga = max(P - nível, 0) + 0,35
S = folga / (folga + 9)
jogo = 0,45 + 0,55 × min(1, jogos / 34)
treinador = 0,85 + 0,30 × limitar((força_do_clube - 55) / 35, 0, 1)
confiança = 0,96 + 0,08 × torcida / 100
base = 7,6

ganho = teto_suave(ganho_bruto), com joelho 4,4 e teto 7,0
teto_suave(g) = g ≤ j ? g : j + (g - j) / (1 + (g - j) / (t - j))
```

- **Tendência à média.** A folga satura: longe do teto o jogador anda rápido,
  perto dele anda devagar. Quem se adiantou chega perto do potencial e
  desacelera; quem se atrasou ainda tem folga e recupera.
- **Teto biológico.** Até 4,4 pontos de L por temporada passam inteiros;
  acima disso cada ponto extra rende menos, e nenhuma temporada chega a 7,0.
  É o que impede saltos irreais sem criar um degrau artificial.
- **Minutos contra treinador.** Na prática eles puxam em sentidos opostos: o
  clube grande ensina mais, mas escala menos o garoto.

(Todos os coeficientes calibrados pelo harness, seção 40.)

### 10.2 Forma da temporada

| Resultado | Chance | Multiplicador |
|---|---|---|
| Explosão | por idade: ≤19 14%, 20-22 10%, 23-25 5%, 26+ 1,5%; zero com menos de 20 jogos | U(1,25; 1,45) |
| Tropeço | 8% | U(0,45; 0,70) |
| Normal | resto | U(0,88; 1,12) |

Sempre consome os mesmos dois sorteios, seja qual for o resultado. Pelo teto
suave, uma explosão rende cerca de +1 de OVR sobre uma temporada normal entre os
17 e os 22 anos, e um tropeço tira 1 ou 2.

### 10.3 Declínio

```
x = idade - pico - 2 - graça
perda = x ≤ 0 ? 0 : min(4,5; 0,26x + 0,05x²) × traço × dificuldade
graça: Goleiro +2; Zagueiro +1; demais 0
```

O declínio não depende da forma: temporada ruim não acelera o envelhecimento e
temporada boa não o interrompe.

**Como ficou na revisão do M8 (D42):** zagueiro e goleiro envelhecem mais
tarde (pico mais tarde e folga de um e dois anos). Meia, atacante e lateral
têm 7% de chance de nascer com longevidade: três anos a mais antes do
declínio.

### 10.4 Bônus de título (D47)

Após forma, crescimento, declínio e treino, se houver ao menos um título na
temporada, acrescenta exatamente um OVR ao resultado natural (até 99 e os
limites dos atributos). Número ou importância dos títulos não multiplica o bônus.
Exemplos: queda natural −5 vira −4; subida +1 vira +2; estabilidade vira +1.
A capacidade aumenta até o primeiro degrau de atributos que entrega esse OVR;
o OVR continua sempre derivado da carta. A antiga moral variável foi substituída.

### 10.5 Foco de treino

| Foco (linha) | Atributos |
|---|---|
| Arranque | RIT +2, FIS +1 |
| Bola no pé | DRI +2, PAS +1 |
| Pontaria | FIN +2, DRI +1 |
| Cérebro | PAS +2, DEF +1 |
| Combate | DEF +2, FIS +1 |

| Foco (goleiro) | Atributos |
|---|---|
| Reflexo | REF +2, ELA +1 |
| Jogo com os pés | REP +2, MAN +1 |
| Domínio da área | POS +2, MAN +1 |
| Explosão | VEL +2, ELA +1 |

- Cada temporada do período soma o foco direto a `treino_a` (limite +8 por
  atributo). Os dois ritmos treinam igual: o bônus conta temporadas.
- **O treino conta dentro do potencial.** Abaixo do teto, ele acelera: os
  atributos do foco sobem na hora e o nível chega antes a P. No teto, ele
  **especializa**: o atributo treinado continua subindo e a capacidade natural
  cede o mesmo tanto no OVR. Sem essa regra, cinco focos empilhados deixariam
  qualquer jogador oito pontos acima do próprio potencial.
- **Garantia visível**: ao fim do período, cada atributo do foco termina pelo
  menos 1 ponto acima de onde começou (salvo no 99 ou com o treino já em +8).
  Escolher um foco e ver o número parado se lê como a escolha ter sido
  ignorada.

**Como ficou na revisão do M8 (D42):** cada foco treina **um** atributo (seis
focos por linha, um por atributo da carta): Arranque (Ritmo), Pontaria
(Finalização), Visão de jogo (Passe), Bola no pé (Drible), Marcação (Defesa) e
Força (Físico); no gol, Voo, Mãos firmes, Reposição, Reflexos, Explosão e
Comando da área. A opção diz "+2 Finalização". O bônus entra uma vez, no
período que vem depois da escolha, e o atributo termina o período pelo menos
2 acima de onde começou. Os outros atributos podem cair numa temporada ruim;
o treinado, não.

---

## 11. A temporada do jogador

### 11.1 Ordem dentro de uma temporada

1. Prodígio (só na primeira temporada).
2. Supercopas do início da temporada.
3. Papel no elenco, jogos, lesão leve.
4. Tabelas, copas, continentais, Intercontinental, Mundial de Clubes (seção 8),
   com o impacto do jogador.
5. Produção: gols, assistências, jogos sem sofrer gol, gols sofridos.
6. Seleção: convocação, jogos, torneio do ano.
7. Prêmios.
8. Acesso e rebaixamento; evolução da força dos clubes.
9. Evolução do jogador (crescimento, declínio, moral, foco).
10. Registro da temporada com o estado **do fim** da temporada.
11. Valor de mercado, torcida, legado, manchetes, rival, conquistas.

### 11.2 Papel no elenco

`d = OVR - força_atual_do_clube`

| Linha | Condição | Participação |
|---|---|---|
| Craque do time | d ≥ +3 | 0,95 |
| Titular | d ≥ -1 | 0,85 |
| Rotação | d ≥ -4 | 0,60 |
| Reserva | d ≥ -8 | 0,28 |
| Sem espaço | abaixo | 0,08 |

| Goleiro | Condição | Participação |
|---|---|---|
| Titular | d ≥ -2 | 0,92 |
| Reserva | d ≥ -7 | 0,12 |
| Terceiro goleiro | abaixo | 0,02 |

- **Chance de ganhar espaço**: quem está em Rotação, Reserva ou Sem espaço tem
  `limitar(0,08 - 0,004 × |d|, 0,02, 0,08)` de subir um degrau na temporada.
- Eventos podem subir, descer ou fixar o papel.

### 11.3 Jogos

```
jogos_do_clube = jogos_da_liga + jogos_da_copa(fase) + jogos_continentais(fase)
                 + supercopas + Intercontinental + Mundial
jogos = arredondar(jogos_do_clube × participação × N(1; 0,06)) - jogos_perdidos
```

Fases valem jogos: copa nacional 1 a 6; continental 6 (grupos) mais 2 por fase
de mata-mata; Mundial de Clubes 3 a 7.

### 11.4 Produção

```
oposição = média de força da liga (85%) e da competição continental (15%)
vantagem(d) = d ≤ 10 ? d : 10 + 0,3 × (d - 10)
λ_gols = g_pos × e^(0,044 × vantagem(OVR - oposição)) × e^(0,03 × vantagem(efetiva - oposição))
         × e^(0,035 × (FIN - OVR)) × fase
λ_ast  = a_pos × e^(0,045 × vantagem(OVR - oposição)) × e^(0,03 × vantagem(efetiva - oposição))
         × e^(0,035 × (PAS - OVR)) × fase
fase = LogNormal(0; 0,12)   (Artista 0,16)
gols ~ Poisson(λ_gols × jogos);  assistências ~ Poisson(λ_ast × jogos)
```

| Pos | g_pos | a_pos |
|---|---|---|
| CA | 0,34 | 0,12 |
| PE / PD | 0,22 | 0,17 |
| MEI | 0,20 | 0,22 |
| ME / MD | 0,14 | 0,17 |
| MC | 0,07 | 0,11 |
| VOL | 0,035 | 0,06 |
| LE / LD | 0,035 | 0,09 |
| ZAG | 0,04 | 0,025 |
| GOL | 0 | 0,004 |

(Iniciais.) Não há teto nem portão: a raridade vem da distribuição.

**Como ficou na revisão do M8 (D42):** os números saem por competição (os
jogos repartidos na proporção dos jogos do time), e título de clube só conta
para quem entrou em campo na competição.

### 11.5 Jogos sem sofrer gol

```
impacto_defensivo = Goleiro 0,5 × (OVR - força); defensores 0,2 × (OVR - força); demais 0
λ_sofridos = 1,2 × e^(-0,055 × (efetiva + impacto_defensivo - oposição))
p_sem_sofrer = e^(-1,05 × λ_sofridos)
jogos_sem_sofrer ~ Binomial(jogos, p);  gols_sofridos (goleiro) ~ Poisson(λ × jogos)
```

### 11.6 Lesão leve

```
p = 0,14 × (1 + 0,05 × max(0, idade - 28)) × (1,15 - 0,3 × FIS/99) × traço × dificuldade
```

Só com pelo menos 10 jogos. Se acontecer, perde `U(5%, 22%)` dos jogos, com um
tipo sorteado (muscular, tornozelo, joelho, lombar, virose, adutor). É
descontada **antes** da produção. Aparece só no jornal e no histórico detalhado,
nunca como alerta.

### 11.7 Suspensão

Temporada suspensa: zero jogos, zero produção, nenhum título, nenhum prêmio, e
o clube do jogador joga sem ele (o mundo continua).

---

## 12. Seleção nacional

### 12.1 Convocação

`dn = OVR - força_da_seleção`

| Situação | Condição | Jogos por temporada |
|---|---|---|
| Titular | dn ≥ +2 | 9 a 11 |
| Elenco | dn ≥ -1 | 5 a 7 |
| Chamado às vezes | dn ≥ -3 | 1 a 3 |
| Fora | abaixo | 0 |

Multiplicador de idade: ≤18 ×0,4; 19-20 ×0,7; 21-33 ×1; 34-35 ×0,8; 36+ ×0,5.
Em ano de torneio, quem está no elenco soma os jogos da fase alcançada.

### 12.2 Produção pela seleção

Mesmas fórmulas da seção 11.4, com oposição 76, a força efetiva da seleção e
gols e assistências × 0,6: jogo de seleção é mais travado, e os maiores
artilheiros de seleção ficam perto de 0,55 gol por jogo.

### 12.3 Primeira convocação

A idade da estreia é gravada para sempre e gera manchete, comemoração, entrada
na linha do tempo e um ângulo possível para a capa.

### 12.4 Legado na seleção

| Legado | Condição |
|---|---|
| Ícone | ≥ 80 jogos e pontuação de títulos de seleção ≥ 2 |
| Ídolo | ≥ 40 jogos e pontuação ≥ 0,5, ou ≥ 100 jogos |
| Nenhum | resto |

---

## 13. Prêmios individuais

### 13.1 A elite

Os prêmios são **eleições** entre você e a elite: um grupo de **jogadores reais**
com projeções de carreira (ano de nascimento, grupo de posição, nacionalidade,
OVR de pico projetado, idade do pico). O OVR projetado de cada um em cada ano:

```
antes do pico: pico_ovr - 1,9 × (idade_pico - idade)
depois:        pico_ovr - 1,3 × max(0, idade - idade_pico - 1)^1,35
aposenta entre 35 e 40 (fixo por jogador; goleiros mais tarde)
```

- **Elite real**: 114 jogadores de verdade, nascidos de 1997 a 2009
  (`packages/world/data/elite.json`). As projeções são ficção do jogo sobre
  pessoas reais; o uso de nomes reais é decisão do produto (2026-09-29). O rival
  sai sempre daqui.
- **Geração futura**: não existem jogadores reais com nome nascidos depois de
  2009, e a elite real envelhece com a carreira; depois de 2037 a Bola de Ouro
  ficaria sem adversário. O motor gera, pela semente da carreira, um elenco de
  10 candidatos por ano de nascimento de 2009 a 2028 (pico N(86,5; 2,6) entre 82
  e 94). Eles não têm nome no motor: a forma de apresentá-los é decisão de
  produto (D13).

### 13.2 Bola de Ouro

Elegível com pelo menos 25 jogos na temporada.

```
nota = OVR + 2,2 × sucesso + produção + ajuste_de_posição
       + prestígio - amortecedor - fama + N(0; 1,6)
       (+ 3,7 de força do campo para cada candidato da elite)
sucesso (você): liga 1,0; copa 0,3; primária 2,5; Copa do Mundo 3,0;
                continental de seleções 1,5
sucesso (elite): sorteado: 45% 0; 30% 1,0; 15% 2,5; 10% 3,5; +3,0 com 8%
                 em ano de Copa do Mundo
produção: ofensivos limitar((gols + 0,5 × ast - 30) / 12, -1, 3);
          demais limitar((jogos_sem_sofrer - 18) / 10, -1, 1,5)
ajuste: CA/PE/PD/MEI 0; ME/MD/MC -0,8; VOL/LE/LD -2; ZAG -2,5; GOL -3
prestígio: 0,8 por Bola de Ouro já ganha, até 4
amortecedor: 2,0 por título seguido vigente, até 5
fama: 0,8 por ano abaixo dos 22
```

- **Força do campo**: a elite resume centenas de jogadores num punhado de nomes;
  o bônus representa o resto do mundo que também disputa.
- **Prestígio**: o votante lembra de quem já ganhou (Messi e Cristiano levaram
  13 de 15 entre 2008 e 2023). **Amortecedor**: freia as sequências.
- **Fama**: ninguém ganhou antes dos 21 na vida real; um prodígio de 19 anos com
  OVR 94 não ganha só pelo número.

A maior nota vence. O jogador vê a própria colocação ("3º lugar") até o 30º.

### 13.3 Os demais prêmios

| Prêmio | Quem disputa | Regra |
|---|---|---|
| Luva de Ouro | goleiros | eleição entre os goleiros da elite, com nota por OVR, sucesso e jogos sem sofrer |
| Chuteira de Ouro | só clubes da UEFA | gols de liga acima de um patamar sorteado N(30; 3,5), mínimo 24 |
| Artilheiro do campeonato | qualquer liga | gols de liga acima de N(0,55 × jogos_da_liga; 3), mínimo 8 |
| Prêmio Revelação | até 21 anos | eleição entre a elite de até 21 anos |

A Chuteira de Ouro tem amortecedor próprio de 1,2 gol por título seguido. Quando
o jogador não bate o patamar, o prêmio vai para um atacante da elite que joga na
Europa (sorteado pelo OVR), com os gols do patamar; a artilharia da liga vai
para "um jogador de" um dos seis primeiros da tabela.

**Como ficou na revisão do M8 (D42):** a artilharia deixou de ser só da
liga: cada competição (menos supercopas e Intercontinental) tem artilharia,
pela marca dos artilheiros reais, e o **Craque da competição**, pela nota de
desempenho com mínimo de jogos. Ver D42.

**Como ficou depois (D44):** perto dos recordes, Bola de Ouro e Chuteira de
Ouro passam pela pressão do recorde: a partir da quinta Bola de Ouro, da
terceira seguida e da quarta Chuteira, cada uma a mais precisa de mais
sorte. Quando a sorte não vem, o prêmio fica com o segundo colocado.

### 13.4 Metas

Seção 40. Nenhum prêmio tem teto de contagem.

---

## 14. O laço de carreira

### 14.1 Estrutura

```
createCareer(setup) ──► decisão atual ──► escolha ──► resolve a escolha
                           ▲                            │
                           │                            ▼
                           └───── próxima decisão ◄── simula o período
```

### 14.2 Ordem de geração da próxima decisão

A primeira regra que se aplicar vence:

1. **Idade 40** → fim (idade).
2. **Sem mercado**: idade ≥ 27 e nenhum clube aceitaria o jogador → decisão com
   uma só opção, aposentar (fim: sem espaço).
3. **Suspenso** → janela de transferências simples, sem evento.
4. **Volta de empréstimo** → decisão de retorno.
5. **Dispensa** → decisão de dispensa.
6. **Evento agendado e elegível** → evento de carreira.
7. **Foco de treino**: idade entre 17 e 31, pelo menos 4 temporadas desde o
   último foco, rolagem de 40%.
8. **Empréstimo**: elegível e rolagem (60% se Reserva ou Sem espaço, 25% se
   Rotação) → oferta de empréstimo.
9. **Janela de transferências**.
10. Se nem a janela tiver opção → fim (sem ofertas).

**Aposentar agora** entra como opção extra em janelas, retornos e dispensas a
partir dos 33 anos, e a partir dos 27 no Desafio do dia.

### 14.3 Resolução de uma escolha

1. Aposentar encerra a carreira com o motivo do lugar (seção 23).
2. Clubes recusados são registrados (máximo 40, com a força do momento).
3. Efeitos do evento são aplicados uma vez para o período.
4. O jogador passa a jogar onde a escolha definiu.
5. Número da camisa, se mudou de clube (seção 19).
6. Missão do clube e torcida de chegada, se mudou de clube.
7. Traição registrada, se for o caso.
8. Foco de treino passa a valer.
9. Simula cada temporada do período.
10. Garantia do foco, efeitos adiados (recuperação), volta de empréstimo.
11. Gera a próxima decisão.

A escolha carrega o identificador da decisão. Uma escolha para uma decisão que
não é mais a atual é rejeitada (clique duplo, aba antiga).

### 14.4 Tipos de decisão

| Tipo | Opções |
|---|---|
| Base | 3 clubes do país, perto de OVR + 6, como aposta da base (D15) |
| Janela | Ficar + 2 clubes |
| Empréstimo | até 3 clubes + ficar |
| Retorno: retido | ficar + 2 clubes |
| Retorno: não retido | 2 ou 3 clubes (inclui compra pelo clube do empréstimo, se ele quiser) |
| Dispensa | 3 clubes (nunca o que dispensou) + aposentar a partir dos 32 |
| Aposentadoria forçada | aposentar |
| Evento | 2 ou 3 escolhas |
| Foco de treino | 5 focos (linha) ou 4 (goleiro) |

**Como ficou na revisão do M8 (D42):** encerrar a carreira só depois da
primeira temporada jogada. As bases do próprio país são sorteadas por
divisão (30% primeira, 70% segunda).

---

## 15. Mercado

### 15.1 Nível de mercado

```
nível = OVR + juventude + reputação - dificuldade - veterano + empresário
juventude = limitar((23 - idade) × 0,8, 0, 5) × (índice_da_faixa + 1) / 3
reputação = min(3, 0,5 × prêmios_recentes + 0,3 × títulos_recentes)   (últimas 3 temporadas)
dificuldade = 0 no Normal, 3 no Difícil
veterano = max(0, idade - 32) × 1,5
empresário = ±2 na próxima janela, pelo evento 30; rompimento no evento 26 limita só a próxima decisão a clubes 2 pontos mais fracos (D49)
```

O desconto de veterano é o que faz o mercado encerrar a carreira na idade
certa (D15): sem ele, quem nunca aceita aposentar joga até os 40.

### 15.2 Quem oferece

- Candidatos: clubes com força entre `nível - 7` e `nível + 3`, fora o atual e
  os bloqueados.
- Geografia por OVR:

| OVR | Mesmo país | Mesma confederação | Mundo |
|---|---|---|---|
| < 75 | 50% | 30% | 20% |
| 75 a 83 | 30% | 30% | 40% |
| ≥ 84 | 15% | 25% | 60% |

- **Troca de verdade**: quando possível, uma oferta é um passo acima (força ≥
  clube atual + 2) e outra é um lugar onde ele será protagonista. É isso que
  faz a escolha doer.
- Jogador de país sem liga jogável recebe a base na mesma confederação, e se não
  houver, no mundo.
- **A base** (primeira decisão, D15): três clubes do próprio país (ou da
  confederação, ou do mundo) sorteados entre os oito mais perto de `OVR + 6`.
  Aos 16 anos o OVR fica entre 40 e 55 e o clube mais fraco tem força 53: a
  faixa do nível não serviria.
- **Faixa que se alarga** (D15): se a faixa tem menos clubes do que ofertas, ela
  cresce em passos. Até os 21 anos, para cima (`-8 a +7`, depois `-10 a +12`);
  depois, para baixo (`-10 a +3`, depois `-14 a +4`).

### 15.3 O que o cartão de oferta mostra

Clube, liga (a divisão atual), bandeira, **papel esperado** (calculado pela
regra da seção 11.2 com a força daquele clube), nível do clube em estrelas,
competições da próxima temporada (por exemplo, "Champions League"), missão e
pressão. Pode-se comparar duas ofertas lado a lado.

### 15.4 Empréstimo

- Idade de 18 a 23, no máximo dois por carreira.
- Clubes com força entre `OVR - 6` e `OVR + 1` (minutos garantidos), 75% no
  mesmo país.
- Dura um período.

### 15.5 Retorno

- **Retido** se `OVR ≥ força_do_dono - 4` e idade ≤ 23: ficar ou sair.
- **Não retido** caso contrário: só saídas, incluindo compra pelo clube do
  empréstimo (70% de chance de ele querer).

**Como ficou na revisão do M8 (D42):** cada opção é um clube: voltar para o
dono do passe, ficar no clube do empréstimo (a compra) ou as ofertas do
mercado.

### 15.6 Dispensa

Temporadas **seguidas** como Reserva, Sem espaço ou Terceiro goleiro no clube
atual, a partir da idade da dificuldade (seção 3.2), disparam a dispensa.

### 15.7 Clubes bloqueados

- Saída permanente direto para o rival histórico → o clube que ficou marca o
  jogador como **Traidor** e nunca mais oferece nada. Empréstimo não conta.
- Um evento em que a torcida expulsa o jogador → idem.

A tarja Traidor aparece uma vez, na temporada da saída.

---

## 16. A missão do clube

| Missão | Quando pode aparecer | Torcida inicial | Pressão | Cobrança |
|---|---|---|---|---|
| Aposta da base | idade ≤ 19 e força ≥ OVR + 4 | 45 | 0,70 | 0 |
| Reforço | padrão | 50 | 1,00 | 3 |
| Peça do projeto | OVR ≥ força | 55 | 1,00 | 4 |
| Contratação de peso | OVR ≥ força + 4, ou prestígio ≥ 4 e OVR ≥ 84 | 64 | 1,30 | 8 |
| Herdeiro da camisa | passo acima, 12% | 48 | 1,45 | 8 |
| Missão resgate | clube no terço de baixo da tabela anterior | 56 | 1,20 | 5 |
| Reconstrução | clube que acabou de subir ou cair | 58 | 0,85 | 2 |
| Volta para casa | clube onde já jogou, ou o primeiro clube | 68 | 0,80 | 2 |
| Experiência | idade ≥ 31 | 55 | 0,80 | 2 |
| Mostrar serviço | vindo de dispensa ou de empréstimo não retido | 46 | 1,15 | 4 |

- A primeira que se aplicar, nesta ordem: volta para casa, mostrar serviço,
  aposta da base, resgate, reconstrução, contratação de peso, herdeiro,
  experiência, peça do projeto, reforço.
- **Pressão** multiplica as quedas de torcida. **Cobrança** é descontada do
  ganho de torcida toda temporada.
- A missão fica guardada enquanto o jogador estiver no clube.
- Aceitar camisa de prestígio, braçadeira ou homenagem soma pressão (limite 1,8).
- A pílula da missão é colorida pela pressão: ≥ 1,3 alta (vermelha), ≤ 0,85
  baixa (verde), resto neutra. Sempre com texto, nunca só cor.

---

## 17. Torcida e legado

### 17.1 Medidor

| Faixa | Valor |
|---|---|
| Desconhecido | < 20 e pico da passagem < 35 |
| Hostil | < 20 |
| Fria | < 40 |
| Morna | < 60 |
| Querido | < 80 |
| Idolatrado | ≥ 80 |

### 17.2 Variação por temporada

```
desempenho = 0,45 × min(1, participação / 0,85) + 0,55 × produção_relativa
produção_relativa: ofensivos (gols + 0,6 × ast) / jogos / referência_da_posição;
                   goleiro taxa_sem_sofrer / 0,40;
                   defensores 0,5 × taxa_sem_sofrer / 0,35 + 0,5 × participação
                   (tudo limitado a [0, 1])
Δ = 16 × (desempenho - 0,5) + 5 × importância_dos_títulos + traço
    - cobrança_da_missão + desempenho_do_time
desempenho_do_time: campeão +3; acima do esperado +2; rebaixado -8
Δ < 0 → Δ × pressão × dificuldade
Δ > 0 → Δ × limitar((100 - torcida) / 50, 0,3, 1)
idade ≤ 18 → Δ = max(Δ, 0), salvo rebaixamento
sem jogos → Δ = -10
```

### 17.3 Chegada

| Situação | Torcida inicial |
|---|---|
| Primeiro clube | 20 |
| Clube novo | a da missão |
| Clube onde já jogou | onde ficou + min(10; 0,5 × melhora de OVR) |

O pico de cada arquibancada fica na memória, para que voltar a uma recepção
fria continue parecendo um lugar que se virou contra o jogador.

**Como ficou na revisão do M8 (D42):** o primeiro clube começa com 50, e na
primeira temporada a torcida só pode subir.

### 17.4 Legado por clube

**Como ficou na D47:** vale a fórmula de participação real no início deste GDD; zero jogos dá zero pontos. Ídolo exige 60 jogos e lenda 120, além dos pontos e temporadas. Lenda de 33+ anos não perde torcida por poucos minutos; rebaixamento ainda tira até 2. As fórmulas abaixo registram a regra anterior.


```
pontos = Σ temporadas no clube: 4 × participação + 10 × importância_dos_títulos
         + 2 × prêmios + (torcida ≥ 80 ? 3 : 0)
p = prestígio do clube
Respeitado ≥ 8 + 2p
Ídolo      ≥ 22 + 5p e pelo menos 2 temporadas
Lenda      ≥ 45 + 10p e pelo menos 4 temporadas
```

Duas passagens no mesmo clube somam um legado só, e a interface sempre mostra o
total do clube.

---

## 18. Eventos de carreira

### 18.1 Agenda

- No início da carreira monta-se um plano: quantos eventos (seção 3.1) e em que
  idades, entre 17 e 37, espaçados pelo menos 2 anos (Intensa) ou 3 (Normal).
- Um evento só dispara se estiver elegível. Se o agendado não estiver, sorteia-se
  outro elegível do catálogo; se nenhum estiver, a vaga passa.
- Eventos de lesão: no máximo 2 por carreira. Cada evento aparece no máximo uma
  vez por carreira.

### 18.2 Modelo declarativo

```
Evento  { id, peso, tags, quando: Condição[], opções[], expande? }
Opção   { id, tipo: arriscada | segura | mudança | escolha,
          chance?, sucesso: Efeito[], fracasso?: Efeito[] }
Condição = idade | jogos | papel | temporadas no clube | continental | mata-mata
         | rival histórico interessado | clássico na liga | queda do clube
         | 10 livre | anos fora | valor | seleção fraca ou sem estreia
         | legado em outro clube | convocado para torneio | torcida | OVR
         | traço | rival pessoal | posição vizinha | número de prestígio
         | homenagem | qualquer uma de (ou)
Efeito  = capacidade(+x, agora | período | depois)
        | potencial(-x, piso 60) | atributos(+x no foco)
        | torcida(±x) | pressão(+x)
        | papel(sobe | desce | titular garantido, que é piso)
        | jogos(×m) | lesão(×m) | produção(×m) | crescimento(×m)
        | força do time(liga | copas | continental, ±x)
        | final(vence | perde)
        | seleção(pula | força torneio) | prêmios(±votos)
        | suspensão(temporadas)
        | transferência(oferta | maior | rival | casa | legado)
        | posição | nacionalidade | camisa(10 | escolhida)
        | bloqueia | mercado(±x) | força do clube(±x) | fato da biografia
```

- O modelo mora em `packages/engine/src/events/` (modelo, condições, catálogo);
  o intérprete dos efeitos, em `career/effects.ts`. Os textos ficam em
  `@craque/content`, pelo id do evento e da opção (D16, D17).
- Os efeitos valem **na ordem da lista**: antes da transferência, no clube que
  ele deixa; depois, no clube novo.
- Uma opção que precisa de alvo (clube, posição, país, número) só aparece se ele
  existir. Evento com menos de duas opções não aparece, e a vaga passa.

- A chance de uma opção arriscada é multiplicada pelo traço (seção 9.8) e
  **exibida** no cartão, com barra e glifo.
- Opção sem nenhum efeito previsto imprime "Sem efeito": a escolha segura
  deliberada não pode parecer inacabada.
- O resultado aparece num aviso no trilho de notificações por 5 segundos:
  ▲ deu certo, ▼ não deu, ● neutro, com os números exatos.

### 18.3 Catálogo (42 eventos)

| # | Evento | Peso | Elegível quando | Opções (resumo) |
|---|---|---|---|---|
| 1 | Treino no contraturno | 100 | sempre | arriscar (+L forte / lesão leve) ou rotina |
| 2 | Preparador particular | 90 | idade ≤ 30 | contratar (+L e +1 atributo / atrito com o clube, papel desce) ou não |
| 3 | Suplemento suspeito | 18 | idade 19-33 | tomar (+L grande / suspensão de 1 temporada) ou recusar |
| 4 | Gestão de carga | 90 | 12+ jogos na última temporada | poupar (menos jogos, menos lesão, evolução menor) ou jogar tudo (mais jogos e produção, risco de lesão) |
| 5 | Nova função tática | 80 | há posição vizinha que faz sentido | aceitar (nova posição, titular) ou recusar (papel desce) |
| 6 | Concorrente contratado | 90 | titular ou craque do time | disputar (50% mantém / 50% vira rotação) ou sair (oferta) |
| 7 | Braçadeira | 70 | idade ≥ 24, 3+ temporadas no clube | aceitar (torcida +, pressão +) ou recusar |
| 8 | Prioridade da temporada | 80 | clube em competição continental | liga (força +2,5 na liga, -2,5 no continental) ou continente (o inverso) |
| 9 | O rival local chama | 70 | rival histórico com força ≥ atual quer o jogador | assinar (Traidor no atual) ou ficar (torcida +) |
| 10 | Crise financeira | 45 | força do clube caiu 3+ | aceitar a venda (transferência) ou ficar (força do clube -2) |
| 11 | A camisa 10 vagou | 45 | meia ou atacante titular, 10 livre | vestir (10, pressão +) ou manter |
| 12 | Saudade de casa | 45 | jogando fora do país de nascimento há 3+ temporadas | voltar (clube do país) ou ficar (-L temporário) |
| 13 | Tatuagem enorme | 35 | idade ≤ 30 | fazer (torcida + / infecção, perde meia temporada) ou não |
| 14 | Problema com o fisco | 25 | valor ≥ €20M | acordo (torcida -) ou brigar (absolvição / suspensão de meia temporada) |
| 15 | Passaporte do avô | 25 | seleção atual fraca ou ainda sem convocação | trocar de seleção (nacionalidade) ou manter |
| 16 | Diploma | 30 | idade ≤ 19 | estudar (evolução -10%, risco de lesão -30%) ou só futebol (evolução +10%, risco +30%), pelo período (D49) |
| 17 | Racha no vestiário | 45 | sempre | tomar partido (arriscado) ou ficar neutro |
| 18 | Volta por cima | 50 | já jogou num clube onde foi Ídolo ou Lenda | voltar como estrela (titular garantido) ou ficar |
| 19 | Clube ou seleção | 20 | ano de torneio de seleção, jogador convocado | ir ao torneio (risco de lesão) ou ficar no clube (pula o torneio) |
| 20 | Dor na véspera da final | 20 | clube disputa título grande | jogar no sacrifício (força o título ou lesão séria) ou poupar (perde o título) |
| 21 | Lesão muscular | 100 | 20+ jogos | voltar antes (risco de recaída) ou recuperação completa (perde jogos) |
| 22 | Pênalti decisivo | 20 | clube disputa final | bater (ganha ou perde o título) ou deixar para outro |
| 23 | Treinador novo | 55 | sempre | impressionar (papel sobe / desce) ou pedir para sair (oferta) |
| 24 | Clássico decisivo | 60 | clube tem rival histórico na liga | provocar (torcida ++ / --) ou jogo limpo |
| 25 | Despedida do ídolo | 40 | 5+ temporadas no clube | homenagear (torcida +, pressão +) ou discreto |
| 26 | Ultimato do empresário | 50 | idade 21-30 | forçar saída (clube maior, torcida -12) ou ficar (torcida +4, empresário rompe; ofertas só de clubes 2 pontos mais fracos na próxima decisão, se houver), D49 |
| 27 | Joia da base | 45 | idade ≥ 28 | apadrinhar (torcida +, evolução -) ou disputar |
| 28 | Contrato de chuteira | 35 | OVR ≥ 75 | chamativo (torcida +, pressão +) ou discreto |
| 29 | Podcast polêmico | 50 | idade ≥ 20 | falar tudo (torcida ±) ou recusar |
| 30 | Troca de empresário | 40 | idade 20-32 | trocar (nível de mercado +2 na próxima janela / ofertas piores) ou manter |
| 31 | Estádio lotado | 55 | sempre | jogar para a torcida (produção ×1,3 ou ×0,8) ou concentrado |
| 32 | Expulsão polêmica | 45 | Pavio curto ou 30+ jogos | recorrer (suspensão menor / maior) ou aceitar |
| 33 | Vaias | 45 | torcida < 35 | ficar e lutar (-L temporário) ou sair (oferta) |
| 34 | Bate-boca (técnico) | 16 | sempre | variante do técnico: papel desce |
| 35 | Bate-boca (diretoria) | 12 | sempre | variante da diretoria: vendido |
| 36 | Bate-boca (torcida) | 10 | torcida < 50 | variante da torcida: bloqueio do clube |
| 37 | O rival provoca | 50 | há rival | responder (produção ± e torcida) ou ignorar |
| 38 | O rival assina com o seu clube rival | 45 | há rival e o clube tem clássico na liga | comprar a briga (torcida + e votos / torcida -) ou ignorar |
| 39 | Duelo com o rival | 40 | há rival | encarar (bônus de prêmio / tropeço) ou evitar |
| 40 | Camisa de prestígio | 18 | há número de prestígio livre | escolher 1 de 3 números (pressão +) ou manter |
| 41 | Homenagem: escolha seu número | 12 | legado Ídolo ou Lenda no clube, uma vez por carreira | escolher 1 de até 5 números clássicos da posição (ou o dos sonhos) |
| 42 | Lesão grave | 26 | idade 20-34 | cirurgia agressiva (volta rápido, potencial -2 a -4) ou conservadora (perde mais tempo, potencial -1 a -2) |

Textos, chances exatas e números de cada efeito ficam em
`packages/content` e `packages/engine/events`, escritos para o v2.

**Como ficou depois (D45):** cada texto diz o que o efeito faz. "Treinador
particular" que dá errado só tira espaço no time (antes dava errado e ainda
melhorava o jogador). Os eventos de final ("Dor antes da final", "O pênalti
decisivo") garantem a final: se o clube não chegasse a nenhuma, ele chega à
do torneio mais importante que disputa; e deixar o pênalti para outro
também decide a final, metade das vezes a favor.

---

**Como ficou na revisão do M8 (D42):** com o rival pessoal fora do jogo,
saíram os três eventos dele (37, 38 e 39); o catálogo tem 39. Os números dos
eventos são inteiros (o "+0,8 de OVR" virou +1), e a lesão não diz mais
quantos jogos tira. Os eventos que levam a outro clube mostram o clube na
opção.

## 19. Número da camisa

### 19.1 Número dos sonhos

- Escolhido na identidade (opcional).
- Primeiro contrato profissional: se há número dos sonhos, o clube dá com 85% de
  chance (60% se for de 1 a 11 e o papel for Reserva ou abaixo). Senão, o clube
  dá o número do papel (D19).
- Ao chegar num clube novo como Titular ou acima, 60% de chance de receber o
  número dos sonhos; senão, o número do papel.
- **Número do papel** (D19, pedido do produto no M4): Titular e Craque do time
  vestem um número clássico da posição (o mais típico com 60%, os outros
  dividem o resto); Rotação, de 12 a 23; Reserva, Sem espaço e Terceiro
  goleiro, de 12 a 99.
- **Promoção da camisa**: quem ficou no clube, foi titular ou craque do time e
  veste número de 12 para cima (que não seja o dos sonhos) tem 50% de chance,
  a cada escolha, de receber um número clássico. Aparece como aviso na
  revelação.

**Como ficou na revisão do M8 (D42):** o número só muda na transferência (a
oferta mostra qual) e na opção de ficar, quando o clube oferece outro (acabou
a promoção automática). Número dos sonhos que não combina com a posição vem
com 0,8% de chance, só para o craque do time.

### 19.2 Números de prestígio por posição

O mais típico primeiro.

| Posição | Números |
|---|---|
| GOL | 1 |
| ZAG | 4, 3, 5 |
| LE | 6, 3 |
| LD | 2 |
| VOL | 5, 8, 6 |
| MC | 8, 6, 10 |
| MEI | 10, 8 |
| ME / PE | 11, 7, 10 |
| MD / PD | 7, 11, 10 |
| CA | 9, 11, 10 |

### 19.3 No jogo

- Cada temporada grava o número daquela temporada. A carta do auge usa o número
  da temporada de pico.
- O número aparece na camisa do retrato.

---

## 20. O rival

- Quando o OVR chega a 80 pela primeira vez, uma rolagem de 65% decide se há
  rival. Falhou, não há outra chance.
- O rival é um **jogador real** da elite, do mesmo grupo de posição, nascido
  entre 4 anos antes e 1 depois do jogador. 30% de preferência por compatriota
  quando existir um.
- O OVR do rival é o da projeção (seção 13.1).
- Em jogo: linha "à frente / empatado / atrás" com o placar `seu OVR × dele` e a
  tendência. A palavra carrega o sentido; a cor só reforça.
- No resumo, os dois são comparados no pico de cada um.

**Removido na revisão do M8 (D42):** o rival pessoal saiu do jogo. Ficam as
rivalidades entre clubes (seção 7.6).

---

## 21. Narrativa: manchetes e capa

### 21.1 Manchetes

Guardadas como chave, variáveis e tom (bom, ruim, neutro); traduzidas na hora de
exibir. Máximo de 300 por carreira. Catálogo: título (por competição), prêmio,
pódio da Bola de Ouro, primeira convocação, rebaixamento, acesso, explosão
(ΔOVR ≥ 5 e 15+ jogos), transferência, empréstimo, camisa, lesão grave,
recorde batido, rival definido, conquista desbloqueada.

**Como ficou no M6 (D25):** saem do histórico de cada temporada e do **diário
da carreira**, que o motor guarda no estado (transferência, empréstimo,
dispensa, camisa, primeira convocação, rival, evento, oferta recusada,
aposentadoria, cada um com idade e ano). Lesão grave é a de 10 jogos ou mais.
"Conquista desbloqueada" ficou fora das manchetes no M7 (D33): a conquista é
do jogador, entre carreiras, e aparece no aviso próprio e na tela de
conquistas; o jornal conta só a história da carreira. O jornal imprime as
manchetes de cada ano na coluna "Também nesta temporada".

### 21.2 Capa da temporada

A notícia mais importante da temporada que acabou. Primeiro ângulo que se
aplicar:

| # | Ângulo | Condição | Tom |
|---|---|---|---|
| 1 | Temporada perfeita | liga + copa + primária | bom |
| 2 | Campeão do mundo | Copa do Mundo | bom |
| 3 | Melhor do mundo | Bola de Ouro | bom |
| 4 | Rei do continente | primária ou Mundial de Clubes | bom |
| 5 | Colecionador | 3 ou mais títulos | bom |
| 6 | Glória da seleção | continental de seleções | bom |
| 7 | Campeão nacional | liga | bom |
| 8 | Artilharia | Chuteira de Ouro, Luva de Ouro ou artilheiro do campeonato | bom |
| 9 | Queda | rebaixamento | ruim |
| 10 | Subida | acesso | bom |
| 11 | Quase | pódio da Bola de Ouro | bom |
| 12 | Estreia na seleção | primeira convocação | bom |
| 13 | Copa | copa nacional ou da liga | bom |
| 13b | Jogo único | supercopa nacional ou continental, Intercontinental (desde o M6) | bom |
| 14 | Taça de uma noite | qualquer outro título | bom |
| 15 | Recorde | recorde real superado na temporada (seção 26) | bom |
| 16 | Explosão | ΔOVR ≥ 4 e 15+ jogos | bom |
| 17 | Matador | 20+ gols (ou 15+ jogos sem sofrer, goleiro) | bom |
| 17b | Garçom | 10+ assistências, fora do gol (desde o M6) | bom |
| 18 | Parado pela lesão | perdeu 20%+ dos jogos | ruim |
| 19 | Suspenso | temporada suspensa | ruim |
| 19b | Promessa | 19 anos ou menos e menos de 10 jogos (desde o M5) | neutro |
| 20 | Esquecido | menos de 10 jogos | ruim |
| 21 | Novo endereço | mudou de clube | neutro |
| 22 | Última dança | idade ≥ 37 | neutro |
| 23 | Apagando | ΔOVR ≤ -3 e 15+ jogos | ruim |
| 24 | Seguindo | nada acima | neutro |

- Desde o M5 o goleiro tem ângulo próprio no lugar de "Matador": **Muralha**
  (15+ jogos sem sofrer). "Recorde" (15) entrou no M6 com os recordes reais.
- Desde o M6 cada ângulo tem **pelo menos 5 manchetes e 3 linhas de apoio** por
  idioma (D24). As manchetes do jornal do v1 entraram neste banco, reescritas:
  sem artigo antes de nome de clube, com a pontuação que o expurgo de
  travessões tinha apagado, e com plural certo (número cru só onde o ângulo
  garante plural). "Jogo único" ganhou as do v1 que falavam de supercopa, e o
  "Garçom" é o ângulo de assistências do jornal do v1.
- A revelação e o jornal leem a mesma capa: as duas nunca discordam sobre a
  história de uma temporada.
- Uma supercopa é jogo único antes da temporada: nunca é chamada de campanha.
- Honras individuais ficam acima do título nacional: é o jornal de um jogador.
- **5 manchetes e 3 linhas de apoio por ângulo** por idioma, sorteadas em
  separado. Uma manchete igual à do ano anterior avança para a próxima redação.
- 8 nomes de jornal inventados; um por carreira.
- A confederação usada é a do clube em que a temporada foi jogada.

---

## 22. A revelação da temporada

Depois de cada decisão, antes da próxima, uma sequência curta mostra o que
aconteceu. No ritmo Normal (2 temporadas), uma página por temporada.

1. Ano e idade viram.
2. Escudo, liga e **posição final** do clube (com acesso ou queda).
3. Números da temporada contam até o valor final.
4. OVR com a variação, atributos que mudaram com chips "+2 FIN", e a carta
   trocando de faixa quando for o caso.
5. Títulos e prêmios: um momento só para a leva inteira, com confete, som e
   vibração.
6. A capa do jornal.

- Um toque pula para o fim; "Pular sempre" é um ajuste.
- Com movimento reduzido, a sequência vira um cartão estático com tudo.
- Recarregar a página no meio não repete nada: a revelação é consumida dos
  eventos da jogada, que não são persistidos.

**Como ficou no M5 (D21)**

- Antes das temporadas, se a escolha foi um evento, uma página do resultado:
  ▲ deu certo, ▼ deu errado ou ● escolha feita, o texto e cada efeito com os
  números exatos. Substitui o aviso de 5 segundos do GDD 18.2, que sumia antes
  da revelação.
- Tempos de uma página: ano em 0 s, clube 0,65 s, números 1,25 s, OVR 2,15 s,
  títulos 3,3 s (com 1,9 s só para eles), capa e fim logo depois.
- **Desde o M6, a revelação cabe na tela** (D23): faixa, palco e rodapé são as
  linhas de uma grade da altura da janela. O ano entra grande e assenta no
  cabeçalho quando o clube aparece. Os títulos ganham um **holofote** que
  ocupa o palco inteiro durante o momento de glória (taças grandes, confete,
  brilho, som) e depois encolhe numa tira compacta, abrindo lugar para a capa,
  que tem manchete e apoio com limite de linhas. Nada nasce abaixo da dobra, e
  a tela não rola mais sozinha.
- Enquanto a página anima, o botão do rodapé diz **Pular**; no fim, Continuar
  ou Próxima temporada.
- Transferência, camisa nova e foco entram na primeira temporada do período;
  rival e primeira convocação, na temporada em que aconteceram.
- "Rever a temporada" (última temporada e histórico) abre a revelação de
  qualquer temporada já jogada, sem evento nem avisos.

**Substituída na revisão do M8 (D43): o lance.** Não há mais janela para
fechar. O que a escolha produziu aparece na própria tela da carreira: o
cartão do lance (evento, temporada, números contando, OVR e atributos,
títulos em miniatura, artilharias, desafio), os números do jogador contando
até os valores novos e o jornal da temporada embaixo da decisão. No PC o
cartão fica no alto da coluna da direita; no celular, é uma faixa que abre
com um toque. O histórico mostra qualquer temporada no lugar do lance.

**Como ficou depois (D45): a mensagem do resultado.** Logo depois de
confirmar, um cartão salta por cima do lance com o resultado da escolha: deu
certo (o certo se desenha, faíscas), deu errado (o X se desenha e o cartão
treme), feito, contrato assinado, emprestado, de volta, comprado, você fica
(com a camisa nova, se veio) ou o treino escolhido (o haltere). Traz a frase
do resultado e os efeitos caindo um a um, some sozinho em 3 a 7 segundos
(no PC, para com o ponteiro em cima) ou assim que o jogador segue jogando, e
não bloqueia a decisão nova: no PC fica na coluna da direita, sobre o lance;
no celular, compacto, no alto, e o toque atravessa o cartão. Com movimento
reduzido, só aparece e some.

---

## 23. Fim de carreira

| Motivo | Gatilho | Controle |
|---|---|---|
| Idade | 40 anos | nenhum |
| Sem espaço | seção 14.2, regra 2 | nenhum |
| Sem ofertas | nenhuma opção possível numa janela | nenhum |
| Dispensa | escolheu aposentar numa dispensa | sim |
| Voluntária | escolheu aposentar numa janela, ou usou Encerrar carreira | sim |

- Quando a carreira acaba na tela de Carreira, aparece um intervalo "A carreira
  chegou ao fim" com o botão **Ver resumo**. O botão Encerrar carreira pula esse
  intervalo.
- A carreira terminada vai para o Hall da Fama automaticamente.

---

## 24. O resumo

### 24.1 Estrutura

- **Topo**: carta do auge (vira para mostrar o verso com os totais), sobrenome,
  bandeira, posição, motivo do fim.
- **Ações**: Compartilhar, Baixar pôster, Copiar link, E se...?, Jogar de novo,
  Hall da Fama.
- **Capítulos** com navegação fixa: Desafio (se houver), Biografia, Números,
  Linha do tempo, Troféus, Jornal.

**Como ficou no M6:** o resumo é a tela de exploração, então rola à vontade. A
navegação dos capítulos gruda abaixo da barra do topo e marca o capítulo que
está na tela. As ações são Pôster (abre a folha do pôster), Compartilhar (o
link, onde o navegador compartilha), Copiar link, Jogar de novo e Início. "E
se...?" e Hall da Fama chegam no M7. O mesmo resumo abre em modo leitura pelo
link compartilhado, com "Jogar o CRAQUE" no lugar de "Jogar de novo". Os
Números trazem também o pico do rival, os atributos no auge, a curva do OVR e
os recordes reais (seção 26).

### 24.2 Carta do auge

A temporada de maior OVR (empate: a mais antiga), com os atributos, o clube e o
número **daquela** temporada.

### 24.3 Números

Temporadas, jogos, gols e assistências (ou jogos sem sofrer e gols sofridos, no
gol; os dois grupos para defensores), títulos, prêmios, OVR de pico, valor de
pico, jogos e gols pela seleção, clubes, países. Rival: `seu pico × pico dele`.
Barras de atributos no auge.

**Como ficou na revisão do M8 (D43):** os recordes reais só aparecem quando
algum foi igualado ou batido. O rival saiu.

### 24.4 Linha do tempo

Passagens por clube (temporadas seguidas no mesmo clube viram uma entrada) e a
estreia na seleção, ordenadas por idade. Cada passagem: escudo, nome, anos,
legado do **clube** (total), tarja Traidor quando couber, tira de honras (até 8,
depois "+N"). Cor do marcador: Traidor vermelho, Lenda dourado, Ídolo verde,
resto neutro. Cascata de entrada respeitando movimento reduzido.

### 24.5 Vitrine

Troféus e prêmios agrupados por competição com "×N". A grade escolhe o maior
tamanho em que a coleção inteira cabe, largando as legendas antes de encolher
demais as peças. Vazia: moldura tracejada e uma frase.

### 24.6 Jornal (portado do v1)

O arquivo de jornais do resumo do v1 é **portado como está**, a pedido do
produto (2026-09-30): a mesma página, a mesma anatomia, a mesma virada de página
arrastando de lado temporada a temporada, as mesmas manchetes. Só a fonte dos
dados muda: o componente passa a ler as temporadas do motor do v2 por um
adaptador, sem mudar o que o jogador vê. É a terceira exceção declarada ao clean
room, ao lado do criador de personagem e das imagens.

**Como ficou no M6 (D24):** a página, a virada (arrastar, botões e setas, com a
fila de viradas) e a anatomia são as do v1. A manchete e a linha de apoio de
cada página são a capa da temporada (seção 21.2), a mesma da revelação; o nome
do jornal é o da carreira; as notas são as manchetes da carreira (21.1). Saiu
só a linha de estrelas do clube, que o v2 não guarda por temporada.

---

## 25. A biografia

- Gerada de um objeto de **fatos** achatado (nunca do interior da simulação):
  identidade, níveis, passagens, títulos por tipo, prêmios, seleção,
  adversidades, torcida, rival, recordes, arcos (meteórico, tardio, andarilho,
  clube de uma vida, estrada não tomada).
- Cinco capítulos com limite de frases: Origem 3, Ascensão 4, Auge 5, Reta final
  3, Legado 4. O limite força duas carreiras parecidas a contar detalhes
  diferentes.
- Cada **tema** tem capítulo, saliência (número ou função da carreira), grupo
  (temas que dizem a mesma coisa; só um por artigo), condição, idade opcional e
  **4 redações por idioma**, escritas em cada idioma e não traduzidas.
- Seleção por saliência, empates por sorteio no fluxo `bio` (que inclui o
  idioma).
- Linhas com idade são refiladas no capítulo cuja faixa etária da própria
  carreira as contém; o Legado nunca é refilado.
- **Variedade**: a redação escolhida é a que menos repete palavras de conteúdo já
  usadas no artigo; nomes de clube e país não contam como repetição.

**Como ficou no M6 (D25):** 56 temas em `@craque/content`, quatro redações cada
nos três idiomas. Os fatos vêm do histórico e do diário da carreira. As faixas
dos capítulos são desta carreira: Origem até a primeira temporada de titular,
Auge entre a primeira e a última temporada a até 2 pontos do pico. Além das
palavras repetidas, a redação que começaria igual à frase anterior ("Aos 19...
Aos 19...") também perde pontos. O sobrenome entra em caixa de nome na prosa.
O "último clube" só aparece para a passagem que fecha a carreira depois do
auge e não é a casa da carreira.

---

## 26. Recordes reais

Marcas reais e documentadas, exibidas como fatos (valor, detentor, detalhe).
Comparadas com a carreira: igualado ou superado.

| Grupo | Recordes |
|---|---|
| Globais | gols numa temporada, gols na carreira, assistências numa temporada, assistências na carreira, jogos na carreira, Bolas de Ouro, Chuteiras de Ouro, títulos na carreira, Copas do Mundo, jogos por seleção, gols por seleção, jogos sem sofrer gol (goleiro) |
| Continentais | títulos de Champions League, de Libertadores, de Europa League, de Sul-Americana (cada um só contra títulos daquela confederação) |
| Ligas | títulos de liga na Inglaterra, Espanha, Itália, Alemanha, França, Brasil (só 1ª divisão) |
| Sequências | Bolas de Ouro seguidas, ligas seguidas, primárias seguidas |

Os valores e detentores são verificados na implementação e datados.

**Como ficou no M6 (D26), conferido em setembro de 2026:**

| Recorde | Marca | Detentor |
|---|---|---|
| Gols na carreira | 979 | Cristiano Ronaldo (em atividade) |
| Bolas de Ouro | 8 | Lionel Messi |
| Copas do Mundo | 3 | Pelé |
| Gols numa temporada | 73 | Lionel Messi (Barcelona, 2011-12) |
| Títulos na carreira | 46 | Lionel Messi (em atividade) |
| Chuteiras de Ouro | 6 | Lionel Messi |
| Gols por seleção | 146 | Cristiano Ronaldo (em atividade) |
| Jogos por seleção | 234 | Cristiano Ronaldo (em atividade) |
| Jogos na carreira | 1390 | Peter Shilton |
| Champions League | 6 | Gento, Modrić, Kroos, Carvajal e Nacho |
| Libertadores | 6 | Francisco Sá |
| Liga inglesa | 13 | Ryan Giggs |
| Liga espanhola | 12 | Francisco Gento |
| Liga italiana | 10 | Gianluigi Buffon |
| Liga alemã | 13 | Thomas Müller |
| Bolas de Ouro seguidas | 4 | Lionel Messi |
| Ligas seguidas (cinco grandes da Europa) | 11 | Thomas Müller e Manuel Neuer |
| Títulos continentais seguidos | 5 | Gento e Di Stéfano (Real Madrid) |

Ficaram de fora as marcas sem fonte de consenso na conferência: assistências
(temporada e carreira), jogos sem sofrer gol de goleiro, Europa League,
Sul-Americana e as ligas da França e do Brasil. Para quem está em atividade, o
resumo mostra a data da conferência ao lado.

**Como ficou na revisão do M8 (D33 e D42):** todos os recordes estão ao
alcance de um jogador extraordinário com sorte; `pnpm balance:recordes` mede
(relatório `tools/balance/relatorios/recordes.md`).

**Como ficou depois (D44): a pressão do recorde.** Cada marca tem uma cauda:
até o começo dela nada muda; dali em diante, cada unidade a mais (gol, jogo,
convocação, título, Bola de Ouro) só entra com sorte, e a chance cai a cada
passo (e elevado a menos o passo dividido pela escala). Nada tem teto. Os
títulos que a sorte não confirma ficam com o vice, e o mundo continua
coerente. As caudas estão em `packages/engine/src/records/pressure.ts`.

---

## 27. Desafio do dia

### 27.1 Regras fixas

| Parâmetro | Valor |
|---|---|
| Identificador | data em UTC, `AAAA-MM-DD` |
| Dificuldade / ritmo | Difícil / Normal |
| Nacionalidade e posição | dadas pelo dia (só países com liga jogável) |
| Semente e ano inicial | derivados do identificador |
| Aposentar | permitido a partir dos 27 |
| Livre | sobrenome, pé, aparência, número dos sonhos |

Uma tentativa começada antes da meia-noite UTC termina com o identificador em
que começou.

**Como ficou no M7 (D28):** o motor nunca lê o relógio. A interface passa o
instante e o motor converte para o dia em UTC com aritmética de calendário em
inteiros (testada contra o relógio do sistema do ano 1 ao 9999). A semente é
`desafio:AAAA-MM-DD`, o ano inicial é o ano do dia, e o identificador fica no
setup da carreira (`challengeId`), então a tentativa termina no dia em que
começou mesmo depois da meia-noite. O Início e a entrada do desafio mostram a
contagem até a virada e trocam de mão sozinhos. "Encerrar carreira" (menu do
placar) também respeita os 27: o motor recusa antes e o item some do menu.

### 27.2 A mão do dia

**Como ficou na D47:** 37 missões. “Lenda de um clube” exige uma lenda; “Ídolo em dois clubes” exige dois clubes como ídolo ou lenda. Alvos fixos 1/2; calibragem seleciona somente talentos com cumprimento comum entre 15% e 55%. A interface chama éditos de “Regras da tentativa”.


Três missões e um édito:

1. As três missões vêm de **três eixos diferentes**.
2. Nenhum par é contraditório (tabela de contradições, lida nos dois sentidos).
3. A posição do dia consegue perseguir as três.
4. O édito não torna nenhuma impossível.

Busca determinística: o catálogo é embaralhado pela semente do dia e percorrido
em ordem; a primeira mão válida vence. **A missão escondida** é a de índice
`dias_desde_a_época mod 3`, revelada aos 24 anos, com o texto completo impresso
no momento em que abre.

**Como ficou no M7 (D29 e D31):**

- O **talento** do jogador do dia vem do mesmo sorteio que cria o jogador
  (Difícil), e os alvos são os da faixa dele (27.3). Ele não aparece na tela.
- **Nação, posição e édito andam em rodízio**: cada nação com liga jogável
  aparece uma vez antes de alguma repetir, cada posição a cada 12 dias, cada
  édito a cada 10, e nada repete de um dia para o outro, nem na virada do
  ciclo. Tudo continua saindo só do identificador do dia. O édito do rodízio é
  tentado primeiro; os outros só entram se ele não fechar mão nenhuma.
- Uma missão só entra se a posição a persegue e se tem alvo maior que zero
  para a faixa do dia; o édito não pode bloquear nenhuma (por exemplo, "Quatro
  camisas" não convive com "5 clubes", e "Casa no continente" não convive com
  missão de países que o continente do jogador não tem).
- Testado em dois anos de mãos (três eixos, nenhum par contraditório, alvo e
  posição válidos) e medido pelo harness em 3.650 dias seguidos.

### 27.3 Eixos e missões

Eixos: Gols, Troféus, Lealdade, Estrada, Evolução, Azarão, Seleção,
Longevidade, Prêmios. O catálogo tem 37 missões escritas para o v2, cada uma com
eixo, posições que podem persegui-la, unidade, fórmula de progresso e alvo. Os
alvos são calibrados pelo harness para que um jogador bom chegue perto de 1
alvo cheio e 1 parcial numa tentativa típica.

**Como ficou no M7 (D29):** o alvo depende da faixa de talento do jogador do
dia (Operário a Fenômeno) e é o valor mais perto do percentil 65 das carreiras
comuns com as regras do desafio: o jogo comum cumpre cerca de um terço, quem
persegue cumpre bem mais. Missão rara (percentil 65 em zero) ganha alvo 1 se
pelo menos 15% chegam a 1; senão sai das mãos daquela faixa. A tabela é gerada
por `pnpm desafio:calibrar` em `packages/engine/src/challenge/targets.ts`, e o
`pnpm balance` confere que cada célula (missão × faixa) cumpre entre 15% e 55%.

### 27.4 Éditos

Dez éditos. Nove são **teto** (começam cumpridos e quebram de vez ao cruzar uma
linha, desenhados como faixa de perigo). Um é **piso** (começa não cumprido,
exige um mínimo até o fim, desenhado como barra de progresso). O édito só é
julgado na carreira terminada.

**Como ficou no M7 (D30):** Quatro camisas (no máximo 4 clubes), Sem
empréstimo, Longe das cinco grandes, Nunca cair, Titular sempre (dos 20 anos em
diante, no máximo 1 temporada terminada no banco), Primeira classe (dos 23 em
diante, nunca na segunda divisão), Raízes (nunca sair de um clube antes de três
temporadas), Casa no continente, Sem gigantes (nunca num clube de força 82 ou
mais) e o piso Operário (450 jogos por clube). Cada um quebra entre 10% e 75%
das carreiras de quem não presta atenção nele (medido pelo harness).

### 27.5 Pontuação

```
pontos_da_missão(r = progresso / alvo):
    r ≤ 1: 400 × (1 - e^(-2,2 r)) / (1 - e^(-2,2))
    r > 1: 400 + min(50; 45 × log2(r))
bruto = soma das DUAS melhores missões                (máx. 900)
pico  = 100 × limitar((OVR_de_pico - 72) / 27, 0, 1)^1,4   (máx. 100)
total = arredondar((bruto + pico) × (édito ? 1 : 0,5) × 0,97^temporadas_apagadas)
temporada apagada: depois da idade de pico, OVR ≤ pico - 5
```

Máximo teórico 1000: duas missões muito acima do alvo, édito intacto, nenhuma
temporada apagada e pico 99. Contar só duas é o que faz perseguir as três ser a
linha perdedora.

### 27.6 HUD, entrada e resultado

- **Entrada**: as duas missões abertas, a escondida tracejada com a idade de
  abertura, o édito em vermelho, a mão do dia (bandeira, país, posição), aviso
  de tentativa ranqueada já feita, botão Jogar, ranking do dia ao lado.
- **HUD em jogo**: missões com progresso `N/M` e unidade ao lado, barra; édito
  como faixa ou barra; aviso de temporadas apagadas a partir dos 27. A barra
  nunca diz quais duas estão contando.
- **Resultado no resumo**: pontuação sobre 1000, as três missões (a sacrificada
  em cinza, visível), ranqueada ou amistosa, bônus de pico, édito quebrado,
  penalidade de apagadas, e **uma linha** com a colocação do dia.

**Como ficou no M7:**

- O painel em jogo é a **quinta aba** no celular (Temporada, Jogador, Desafio,
  Histórico, Troféus) e a primeira aba da coluna de exploração no desktop. Cabe
  na tela como o resto do laço (D23), medido de 320 × 568 a 1366 × 768. Mostra
  também a pontuação "se parasse agora" e o bônus de pico; nunca quais duas
  missões estão contando.
- A revelação ganha uma **página do desafio**, a última da jogada, só quando
  algo marcante aconteceu: a escondida abriu (o texto inteiro desdobra na
  tela), uma missão foi cumprida, o édito quebrou ou uma temporada foi apagada.
- No resumo, o Desafio é o **primeiro capítulo**. Num link compartilhado a
  colocação fica de fora: o ranking é do aparelho de quem jogou.
- O pôster leva o **selo dourado do desafio** com a pontuação, no lugar do
  vermelho do Difícil (todo desafio é Difícil).

### 27.7 Ranking local

- Cada tentativa registra: dia, missão que mais pontuou, sobrenome, pontuação,
  missões cumpridas, édito, OVR de pico, horário, ranqueada.
- **Ranqueada** é a primeira tentativa terminada do dia. As outras entram no
  ranking do dia, mas não nas estatísticas.
- O ranking exibido é **do dia** e zera no dia seguinte. Estatísticas (jogados,
  melhor, média, corridas limpas) só sobre ranqueadas.
- Formato versionado: um ranking de formato antigo é descartado inteiro.

**Como ficou no M7 (D32):** o ranking mora no IndexedDB, loja `leaderboard`,
uma linha por tentativa terminada, com o mesmo id da carreira no Hall. A
primeira do dia é a ranqueada, e arquivar de novo a mesma carreira (recarregar
o resumo) nunca troca isso. A tela de entrada mostra o ranking do dia e as
estatísticas das ranqueadas (jogadas, melhor, média e limpas: édito cumprido e
nenhuma temporada apagada).

---

## 28. Hall da Fama, conquistas e "E se...?"

### 28.1 Hall suspenso (D47)

Não arquivar carreiras concluídas, interrompidas, alternativas ou incompatíveis.
Ao abrir o banco, apagar entradas antigas de `archive`; a loja permanece vazia
por compatibilidade do schema. As rotas antigas voltam ao Início/Conquistas.
Somente o save atual pode abrir o resumo e o caminho hipotético.

### 28.2 Conquistas (D47)

148 conquistas em dez grupos: Carreira, Títulos, Prêmios, Seleção, Lealdade,
Estrada, Desafio, Curiosas, Recordes e Secretas. São 51 objetivos específicos,
18 recordes e 79 competições. Recordes e títulos são gerados dos catálogos:
igualar ou superar a marca, ou vencer a competição, respectivamente.
Secretas tem quatro objetivos naturais; nome e pista só aparecem após desbloquear.
Lealdade inclui terminar no clube da estreia em campo.

Os desbloqueios ficam em `achievements`. As melhores contagens e hashes de
carreiras terminadas ficam em `craque.v2.progress`, sem guardar replays, histórico
ou retratos de carreiras. O hash impede contar duas vezes ao recarregar o resumo.
A carreira alternativa e a compartilhada não avançam conquistas.

### 28.3 E se...?

No resumo de uma carreira comum, a linha do tempo de decisões permite escolher
um ponto e **seguir por outro caminho**: nova carreira com o mesmo setup e as
escolhas até ali, continuando ao vivo. A original é substituída no save atual; a nova
é marcada como "linha alternativa". Desligado para carreiras de desafio.

**Como ficou no M7 (D34):** o capítulo "E se...?" do resumo (e da carreira
aberta pelo Hall) lista cada decisão com idade, título e o que foi escolhido.
Seguir dali refaz as escolhas anteriores e entrega a decisão ao vivo; o placar
mostra "Linha alternativa" e a opção que a original escolheu ganha a etiqueta
"Escolha da original". O save guarda de onde a linha saiu.

---

## 29. Compartilhamento

### 29.1 Pôster

- PNG 1080 × 1350, paleta escura fixa, margem de 60 px, tudo em posições
  conhecidas.
- Conteúdo: marca, selo (Desafio dourado ou Difícil vermelho; desafio vence),
  carta do auge, sobrenome (pode ser escondido: "Mostrar sobrenome"), país e
  posição, seis números, valor de pico, vitrine resumida, clubes principais,
  curva do OVR se couber, rodapé.
- Nenhuma imagem externa: escudos, bandeiras e avatar entram embutidos. As
  fontes são garantidas antes de desenhar.

### 29.2 Entrega

- **Baixar** sempre. **Compartilhar** só onde o navegador aceita arquivo de
  imagem (testado com um arquivo-sonda). Cancelar não é erro.
- Nome do arquivo: `craque-<sobrenome>.png` normalizado, ou
  `craque-carreira.png`.
- URL temporário liberado depois de 60 segundos.
- **Copiar link**: a carreira inteira comprimida no fragmento da URL. Abrir o
  link reconstrói o resumo por replay, em modo leitura.

**Como ficou no M6 (D27):** o PNG sai do próprio DOM do pôster pelo
`modern-screenshot`, carregado só quando alguém pede o pôster. A prévia na
folha é o pôster em tamanho real, reduzido por escala. Escudos, bandeiras e
troféus são do mesmo endereço do jogo (ou data URL), então entram embutidos; o
desenho espera as fontes e as imagens. O rodapé imprime `VITE_SITE_URL` ou, sem
ele, o endereço de onde o jogo está sendo servido. O link leva o replay (setup
e escolhas) e o avatar, em `deflate-raw` e base64 de URL, num fragmento `#c=`
que nunca vai ao servidor. Link de outra versão do motor, quebrado ou de
carreira não terminada abre uma mensagem clara, nunca outra carreira.

---

## 30. A carta

- Desenho novo do v2: uma **ficha colecionável** retangular com cantos
  levemente chanfrados, faixa superior na cor do clube, retrato, OVR em
  numerais de placar, posição, sobrenome, seis atributos em grade 3 × 2,
  bandeira, escudo do clube e selo da liga.
- Faixas de raridade impressas como material, sem brilho em loop:

| Faixa | OVR | Material |
|---|---|---|
| Bronze | até 64 | papel-cartão cobre fosco |
| Prata | 65 a 74 | aço escovado |
| Ouro | 75 a 84 | ouro fosco com textura de trama |
| Elite | 85 a 91 | ouro com tira de foil vertical |
| Lenda | 92+ | preto com relevo e filete dourado |

- Tamanhos por variável CSS (`--card-w`), nunca por classe arbitrária com
  variante.
- A faixa usa um tom vizinho da cor do clube (mais escuro; mais claro nas cores
  muito escuras): a camisa do retrato, que é a própria cor do clube, não some.
  Sem clube, a faixa usa a cor da seleção.
- Troca de faixa na revelação: a carta gira e revela o novo material.
- Versão canvas para o pôster, lendo a mesma especificação.

---

## 31. Arte e assets

### 31.1 Modo de assets

Uma variável de ambiente de build, `VITE_ASSETS`, escolhe:

| Valor | Escudos | Troféus | Selos de liga | Bandeiras |
|---|---|---|---|---|
| `real` (padrão) | imagens reais | imagens reais | logos reais | reais |
| `gerado` | escudos gerados | troféus gerados | selos gerados | reais |

Bandeiras são sempre as reais (são desenhos de domínio público). Em
desenvolvimento, o `/lab` permite alternar o modo sem rebuild para comparar.

**Como ficou (D46):** o padrão passou a ser `gerado` (só a arte desenhada);
`real` é escolha de build. No modo desenhado, a linha "Imagens sem internet"
dos ajustes some. Há escudo real para 481 dos 489 clubes e selo real para 29
das 32 ligas.

**Como ficou (D49):** o padrão mistura escudos e selos gerados com fotos reais
das competições e dos prêmios. Cada foto ausente ou que falha ao carregar usa
a arte gerada. `VITE_ASSETS=real` força todas reais e `VITE_ASSETS=gerado`
força todas geradas. O laboratório oferece também o padrão misto e conta as
fotos reais de acordo com o modo dos troféus, separado do modo dos escudos.

### 31.2 Arte gerada (portada do v1)

- **Escudos**: disco de três partes (aro, campo com padrão, símbolo), derivado
  deterministicamente do clube; os campos mais barulhentos ficam reservados a
  clubes curados.
- **Troféus**: seis silhuetas (taça, cálice, salva, escudo, bojo, ânfora), três
  metais; segundas divisões em prata.
- **Selos de liga**: nunca redondos (para não parecerem um segundo clube), com
  as cores da seleção do país e as iniciais da liga.
- **Avatar**: renderizador vetorial, idêntico byte a byte.

### 31.3 Regra

Nenhum clube, liga, troféu ou prêmio fica sem imagem: se a real faltar, a
gerada entra.

---

## 32. Linguagem visual

### 32.1 Direção

"Noite de jogo" sem cara de template: a referência é a **cultura impressa e
televisiva do futebol** (programa de jogo, placar do estádio, grafismo de
transmissão, ficha de súmula, jornal esportivo), não um painel de SaaS.

**Evitar**: degradê roxo ou azul-néon, vidro fosco e desfoque em tudo, brilho em
borda, emoji como ícone, cartões todos iguais com borda fina e cantos muito
redondos, texto em degradê, animação flutuando sem motivo.

**Buscar**: cor chapada, filetes e réguas como em página impressa, cantos pequenos
(4 a 6 px), hierarquia tipográfica forte, números grandes e tabulares, a cor do
clube como acento da tela de carreira, textura sutil (grão, faixas de gramado
cortado) usada com parcimônia.

### 32.2 Tokens (tema escuro, opcional)

| Token | Valor | Uso |
|---|---|---|
| `ink` | #0D1110 | fundo |
| `pitch-night` | #111815 | faixa de fundo alternada |
| `surface` | #161D1A | painéis |
| `surface-2` | #1D2622 | painéis internos, trilhos |
| `line` | #2B3631 | filetes |
| `line-strong` | #3C4943 | réguas de seção |
| `chalk` | #EEF1EA | texto principal, botão primário |
| `muted` | #9CA79F | texto secundário |
| `faint` | #838E86 | terciário |
| `grass` | #3FB26A | positivo, evolução |
| `gold` | #E3B341 | glória |
| `card-red` | #EC5B60 | perigo, negativo |
| `sky` | #7AA6CF | informação, seleção |
| `club` | dinâmico | cor do clube atual |

O tema claro é o padrão (D47), com papel quente (#F3F0E8) como fundo.
Uma preferência já salva, clara ou escura, é respeitada.

### 32.3 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display e números | **Big Shoulders** (variável) | títulos, OVR, placares, estatísticas |
| Interface | **Schibsted Grotesk** (variável) | tudo que não é display |
| Editorial | **Newsreader** (variável) | biografia e jornal |

Todas auto-hospedadas. Números sempre tabulares.

### 32.4 Componentes base

Botão (primário giz, secundário contornado, fantasma, perigo, glória), botão de
ícone, controle segmentado, chip, painel com régua, cabeçalho de seção, bloco de
estatística, medidor, barra de chance, abas, folha inferior, diálogo, popover,
deslizador, interruptor, dica, aviso.

### 32.5 Layout

- **Celular primeiro.** Na carreira: cabeçalho compacto (placar do jogador), a
  decisão e as abas Temporada · Jogador · Histórico · Troféus.
- **Desktop**: três colunas (o jogador | a última temporada e a decisão |
  histórico, troféus e seleção em abas), sem nada escondido.
- **O laço cabe na tela** (diretriz do produto no M6, D23): a decisão, o painel
  do jogador e a revelação nunca pedem rolagem, de 360 × 640 até o desktop. As
  opções são linhas compactas; marcada, a opção abre os detalhes, e a legenda
  sob o título passa a explicar a opção marcada. A carta mede a altura que
  sobra. Só as vistas de exploração (histórico, troféus, seleção, resumo) rolam,
  por dentro do próprio painel.
- Alvos de toque de pelo menos 44 px. A página respeita a altura dinâmica da
  janela e a área segura do aparelho.

---

## 33. Movimento, som e vibração

### 33.1 Movimento

- Animar só `transform` e `opacity`.
- Entradas: 180 a 320 ms com desaceleração; molas para elementos que o dedo
  arrasta.
- Contagem de números na revelação; carta girando na troca de faixa; confete
  curto só em título ou prêmio.
- **Movimento reduzido** (sistema ou ajuste): desliga cascatas, contagens,
  confete e giros. Avisos e a virada do jornal mantêm a lógica e chegam na hora.

### 33.2 Som

Sintetizado em tempo real, sem arquivos. Sinais: toque, seleção, confirmação,
voltar, atributo subiu, título, revelação, apito e conquista (desde o M7). Cada tom com ataque curto e
decaimento exponencial. Volume mestre em 5 passos (0, 25, 50, 75, 100%; padrão
75%) aplicado como multiplicador no agendamento; mudo corta antes de agendar. O
contexto de áudio nasce no primeiro gesto. O som de título toca **uma vez por
leva**.

| Ação | Sinal |
|---|---|
| Trocar opção de controle, abrir ajustes, fechar diálogo | toque |
| Escolher opção de decisão, abrir editor, sortear aparência | seleção |
| Confirmar, jogar de novo, baixar ou compartilhar | confirmação |
| Voltar, sair, encerrar, aposentar | voltar |
| Escolher foco de treino, atributo subiu na revelação | atributo subiu |
| Título ou prêmio | título |
| Abrir o resumo | revelação |
| Confirmar identidade, começar desafio | apito |
| Conquista desbloqueada | conquista |

### 33.3 Vibração

Só onde há suporte e com o ajuste ligado: pulso curto em escolha, padrão duplo
em título, longo na aposentadoria.

---

## 34. Persistência

### 34.1 Chaves

| Onde | Chave | Conteúdo |
|---|---|---|
| localStorage | `craque.v2.prefs` | idioma, tema, volume, mudo, movimento, vibração, último ritmo e dificuldade (o "pular revelação" saiu na revisão do M8, D43) |
| localStorage | `craque.v2.draft` | rascunho da identidade e avatar |
| localStorage | `craque.v2.save` | carreira em andamento |
| IndexedDB `craque-v2` | `archive`, `achievements`, `leaderboard` | Hall da Fama, conquistas, ranking |

**Como ficou no M7 (D32):** o banco abre uma vez e lê tudo para um espelho em
memória; a leitura vem do espelho e a escrita vai para o espelho e depois para
o disco. Sem IndexedDB, com a abertura recusada ou travada (4 segundos), ou com
uma escrita que falha (cota cheia, aba anônima), o banco passa a viver só em
memória até o fim da sessão: o jogo segue igual e o aviso aparece uma vez.

### 34.2 O save é um replay

```
{ v, engine, setup, choices[], quit?, avatar, screen, snapshot }
```

- `quit`: a carreira foi encerrada pelo botão, depois da última escolha; o
  replay termina no mesmo ponto.
- `avatar` fica fora do setup: é cosmético e a simulação nunca lê.
- `screen`: `career` ou `summary`, para recarregar no mesmo lugar.
- `snapshot`: sobrenome, posição, país, idade, clube, OVR, temporadas e motivo
  do fim. O Início e a abertura do jogo leem só isto, sem o motor (D20).
- O diário da carreira (seção 21.1) fica no **estado**, não no save: o replay o
  refaz igual (D25).

- Abrir: se `engine` bate com a versão do motor, reexecuta o replay (milissegundos)
  e descarta o snapshot.
- Se não bate: abre o resumo pelo snapshot, em **modo leitura**, com aviso claro
  de que a carreira foi jogada numa versão anterior.
- Escolhas inválidas no replay (save editado) invalidam o save: o jogo avisa e
  cai no Início com o rascunho intacto.

### 34.3 Validação

Tudo que é lido do armazenamento passa por schema. Valor desconhecido num campo
de preferência ou do avatar cai para o padrão daquele campo, sem derrubar nada.
Armazenamento bloqueado ou cheio: o jogo funciona em memória e mostra um aviso
discreto uma vez. O aviso do Hall só aparece se o do armazenamento geral não
apareceu: um aviso por problema, nunca dois.

### 34.4 Recuperação

A tela de erro oferece **Tentar de novo** (remonta) e **Limpar dados e
recarregar** (remove só o save). Ela avisa que a carreira continua salva.

---

## 35. Idiomas e texto

- Português (padrão), espanhol e inglês. Troca imediata, sem recarregar.
- O dicionário português é a fonte; os outros dois são tipados contra ele:
  chave faltando é erro de compilação.
- Interpolação por `{nome}`; plural por regra do idioma.
- Nomes de países vêm do registro do país, nos três idiomas.
- A biografia e as manchetes são **escritas** em cada idioma.
- **Nenhum travessão** (— nem –) em texto de jogador, em nenhum idioma. Quem
  tira um travessão o substitui por vírgula, dois-pontos, ponto ou parênteses.
  Um teste reprova o build.
- **Voz**: jornalismo esportivo direto, frase curta, sem jargão de marketing e
  sem clichês de texto gerado ("jornada", "mergulhar", "épico", "desbloquear seu
  potencial").

---

## 36. Acessibilidade

| Requisito | Como |
|---|---|
| Cor nunca sozinha | todo par bom e ruim leva glifo: ▲ ▼ ● ✓ ✕ |
| Medidores | papel de medidor com valor, mínimo, máximo e rótulo |
| Grupos de escolha | rádio com rótulo; alternâncias com estado declarado |
| Diálogos e folhas | modais com foco preso e retorno de foco |
| Avisos | região de status com anúncio educado |
| Jornal | região com descrição e navegação por setas |
| Ícones sem texto | rótulo acessível |
| Foco | anel visível em tudo que é interativo |
| Movimento reduzido | respeitado (seção 33.1) |
| Números nus | toda estatística com explicação acessível |
| Contraste | texto normal ≥ 4,5:1 nos dois temas |

**Como ficou no M8 (D39):**

- As opções da decisão são um grupo de rádio com foco itinerante: Tab entra
  no grupo pela opção marcada (ou pela primeira), as setas andam e marcam,
  Espaço e Enter marcam, e o próximo Tab chega ao "Confirmar escolha".
- Decisão nova com o foco solto (a tela abriu, a revelação fechou): o foco vai
  para o título da decisão, e o leitor de tela lê a pergunta nova.
- A revelação é um diálogo modal: o foco abre no botão do rodapé (Enter e
  Espaço pulam e avançam), fica preso dentro dela, e o texto de cada página é
  anunciado quando ela termina de aparecer, nunca no meio da contagem.
- O acento na cor do clube é clareado ou escurecido até ter contraste de
  4,8:1 (conta da WCAG) contra o fundo mais próximo dele em cada tema; o texto
  dos chips suaves puxa um pouco para a cor do texto do tema.
- A suíte ponta a ponta audita todas as telas com o axe (WCAG 2.1 A e AA) nos
  dois temas, e joga um turno inteiro só com o teclado.

---

## 37. Erros e offline

- Páginas estáticas 404, 403, 500 e 503, como conjunto, com ilustração própria
  de futebol e o mesmo vocabulário visual. A 500 avisa que a carreira continua
  salva.
- Barreira de erro de execução na raiz do app (seção 34.4).
- **PWA**: instalável; a casca e o jogo funcionam offline; escudos e troféus
  entram em cache conforme aparecem.

**Como ficou no M8 (D36 a D38):**

- **Instalável** pelo `vite-plugin-pwa`: manifesto com nome, ícones (192, 512 e
  maskable), cor do tema e modo de aplicativo; ícone da Apple à parte.
- **Na instalação** entram o jogo inteiro (código, estilos, fontes latinas),
  as páginas de erro, bandeiras, selos de liga e prêmios, cerca de 4,4 MB.
  **Conforme aparecem**, escudos e troféus (cerca de 22 MB), lidos do cache na
  vez seguinte. Imagem que ainda não foi guardada, sem internet, troca na hora
  pela arte gerada (invariante 16): nunca aparece quebrada. Nos Ajustes,
  "Imagens sem internet" guarda todas de uma vez para quem não quer nenhuma
  desenhada.
- **Versão nova**: o jogo nunca troca sozinho no meio de uma carreira; um
  aviso espera com o botão "Atualizar". Conexão que cai ou volta também avisa.
- **Barreiras de erro** em três níveis: a da raiz (tela inteira), uma por tela
  (a casca fica de pé, com a volta para o Início) e uma por trecho (capítulo
  do resumo, área do laboratório, painel de ajustes). A revelação que falhar
  se fecha sozinha e avisa: o laço nunca trava. Pedaço do jogo que não baixou
  (versão nova no ar, ou sem internet com a tela ainda fora do aparelho) tem
  conversa própria, com "Recarregar".
- **Antes do jogo**: o `index.html` traz uma abertura com a marca; se o jogo
  não desenhar em 12 segundos, ela vira a mensagem de erro com "Recarregar".
- **Página não encontrada** dentro do jogo ("Bola fora") para qualquer
  endereço desconhecido; sair dela limpa o endereço.
- **Páginas estáticas** 404 ("Bola fora"), 403 ("Impedimento"), 500 ("Bateu
  na trave") e 503 ("Jogo adiado"), geradas no build com os mesmos textos e
  desenhos do jogo, nos três idiomas, sem nada carregado de fora.

---

## 38. Ferramentas de desenvolvimento

- **`/lab`** (só em desenvolvimento): o sistema de design em todos os estados,
  nos dois temas e em largura de celular; folhas de contato de cartas por faixa,
  escudos (10, 16, 28, 48, 96 px), troféus, selos de liga, pôster com carreiras
  extremas; alternância de modo de assets.
- Desde o M6, a área **Fim de carreira** joga uma carreira inteira pela política
  automática (ambicioso, leal ou goleiro), mostra o pôster e a biografia, e
  "Abrir no resumo" grava essa carreira como o save do navegador e abre o
  resumo de verdade (pede confirmação se já houver uma carreira salva).
- **Painel de depuração** (só em desenvolvimento, com carreira): mexer em OVR,
  torcida, traço, talento; forçar evento, transferência e rival; pular decisão.
  A barreira é repetida dentro de cada ação, e nenhuma delas toca o gerador nem a
  agenda de eventos.
- **`tools/balance`**: roda milhares de carreiras com políticas fixas (clube do
  nível, para jogar, acima, sorteada; foco de treino melhor, primeiro, sorteado
  ou nenhum), num fluxo de escolhas separado do da simulação, e compara com as
  metas da seção 40. `pnpm balance` imprime as metas e grava três relatórios em
  `tools/balance/relatorios/`: `evolucao.md` (o jogador), `mundo.md` (60 mundos
  de 25 temporadas sem jogador) e `carreira.md` (carreiras inteiras dentro do
  mundo, com uma carreira contada temporada a temporada). `pnpm balance:check`
  reprova o `pnpm verify` se alguma meta falhar. Até o mercado e as tabelas chegarem
  (M3 e M4), as carreiras rodam numa caixa de areia: o clube vem da política e
  os títulos de um modelo provisório declarado.

---

## 39. Invariantes

1. O OVR é sempre lido dos atributos.
2. Cada linha de pesos de posição soma 100.
3. Atributos ficam entre 1 e 99.
4. Nenhuma contagem (títulos, prêmios, gols) tem teto rígido.
5. A mesma semente com as mesmas escolhas produz a mesma carreira; o replay de um
   save é idêntico à carreira jogada.
6. Toda decisão em andamento existe e tem pelo menos uma opção.
7. Toda carreira termina.
8. O registro de uma temporada guarda o estado do fim daquela temporada.
9. Temporada suspensa não ganha nada.
10. A lesão leve é descontada antes da produção.
11. A importância de um título usa a confederação do clube.
12. A leitura do olheiro é colorida pela faixa reportada.
13. A liga exibida é sempre a divisão atual do clube.
14. Toda liga simulada tem exatamente um campeão por temporada.
15. Identificadores de clube são únicos.
16. Toda arte tem um fallback gerado.
17. Nenhuma imagem externa entra no pôster.
18. Nenhum travessão em texto de jogador.
19. Cor nunca é o único sinal.
20. Um save que passa na validação nunca derruba o jogo depois.
21. A mão do desafio nunca é impossível.
22. O ranking do desafio é do dia.
23. A revelação e os avisos nunca se repetem depois de recarregar.
24. Uma escolha para uma decisão antiga é rejeitada.

---

## 40. Metas de balanceamento e testes

### 40.1 Metas

| Meta | Alvo |
|---|---|
| Distribuição de talento, Normal | ~28 / 34 / 22 / 11 / 5 |
| Distribuição de talento, Difícil | ~45 / 34 / 15 / 4 / 1 |
| Pico médio por faixa | entre P−2 e P+3 no Normal, incluindo bônus obrigatório de títulos (D47) |
| Justiça entre posições | pico relativo ao potencial dentro de 3 pontos entre os grupos (D47) |
| Idade do pico | mediana entre 26 e 29 |
| Maior subida de OVR numa temporada | +9, nunca +10 |
| Subidas de 8 ou mais | no máximo 1% das temporadas, e só até os 21 anos |
| Crescimento típico de Craque, Estrela e Fenômeno dos 17 aos 19 | mediana de +3 a +7 por temporada |
| Declínio típico dos 33 aos 35 | mediana de -1,5 a -4 por temporada |
| Quedas de 7 ou mais numa temporada sem lesão | nenhuma |
| OVR aos 16 entre faixas vizinhas | pelo menos 15% da faixa de cima começa abaixo da mediana da de baixo |
| Difícil | aos 21 anos, pelo menos 1 ponto abaixo do Normal em todas as faixas; pico entre -3 e +2 do potencial |
| Os dois ritmos | mesmo jogador: pico médio e OVR médio aos 21 a no máximo 0,6 de diferença por faixa |
| Bolas de Ouro, carreira de Fenômeno de ataque | média de 1 a 2,25, e de 40% a 60% ganham ao menos uma (D47) (era "mediana de 1 a 2"; D44) |
| Recorde de Bolas de Ouro (8) batido | raro: no máximo 2% dos Fenômenos de ataque (era 6% a 10%; D44) |
| Quatro Bolas de Ouro seguidas | raro: no máximo 2% dos Fenômenos de ataque (era 5% a 8%; D44) |
| Recorde de Chuteiras de Ouro (6) | raro: no máximo 3% dos centroavantes Fenômenos que jogam na Europa (era 12% a 15%; D44) |
| Todos os recordes reais (GDD 26) | alcançados por alguma carreira de um lote grande de Fenômenos que os persegue, e cada passo além da marca mais raro que o anterior (`pnpm balance:recordes`; D44) |
| Gols de centroavante de faixa Craque (mediana da carreira) | 250 a 380 |
| Gols de centroavante Fenômeno (mediana da carreira) | 500 a 750 |
| Recorde de gols na carreira (979) batido | no máximo 10% dos Fenômenos de ataque |
| Campeão da primária continental (pelo menos uma vez) | 50% ou mais na Europa; 25% ou menos para quem fica numa liga menor (Chile) |
| Pontos do campeão nas grandes ligas | mediana entre 74 e 95 |
| Campeões diferentes por primeira divisão em 25 temporadas | mediana de pelo menos 4 |
| Dinastia, sem monopólio | maior campeão de cada mundo com no máximo 95% da liga e 45% da primária continental |
| Quem sobe e se mantém | 30% a 65% |
| Volta à média dos clubes | 99% a no máximo 6 pontos da base depois de 25 temporadas |
| Libertadores | Brasil e Argentina com 70% ou mais |
| Champions League | Inglaterra e Espanha com 50% ou mais |
| Intercontinental | campeão europeu de 70% a 95% (17 dos últimos 18 mundiais reais) |
| Mundial de Clubes | europeu em 60% ou mais |
| Copa do Mundo | 8 seleções mais fortes em 70% ou mais; fora de UEFA e CONMEBOL no máximo 10% |
| Custo | uma temporada do mundo inteiro em no máximo 3 ms |
| Carreiras que terminam aos 40 | minoria; a maioria termina entre 33 e 38 |
| Duração de uma carreira no ritmo Normal | 3 a 5 minutos de interação |

As metas de prêmio descrevem um jogador que **persegue** o objetivo: o lote de
referência joga num clube do nível dele e vai para a Europa a partir de OVR 75,
por uma política fixa (a caixa de areia do M3), aposentando quem passa dos 33
com OVR 72 ou menos e todo mundo aos 38. As políticas fixas do harness dão um
piso, não um veredito.

As metas do fluxo (relatório `fluxo.md`, desde o M4) usam o laço de verdade,
com o mercado decidindo. A idade do fim é medida com a política teimosa, que
nunca aceita aposentar enquanto houver clube: quem encerra a carreira é o
mercado.

| Meta do fluxo | Alvo |
|---|---|
| Carreiras que o mercado leva até os 40 | menos de 50%, nos dois ritmos |
| Carreiras que terminam entre 33 e 38 | 50% ou mais, nos dois ritmos |
| Carreiras encerradas pelo mercado antes dos 30 | no máximo 5% |
| Eventos por carreira | 6 a 8 na Intensa, 3,5 a 5 na Normal |
| Decisões por carreira no ritmo Normal | 9 a 15 |
| Janelas com menos de duas ofertas | no máximo 2% |
| Primeira decisão com três bases | 100% |
| Save refaz a carreira inteira | 100% |

### 40.2 Testes

| Conjunto | O que garante |
|---|---|
| Unidade do motor | cada fórmula e tabela |
| Propriedades (fast-check) | invariantes da seção 39 em milhares de carreiras aleatórias |
| Determinismo | carreira ao vivo idêntica ao replay, byte a byte |
| Balanceamento | seção 40.1, em lote |
| Conteúdo | travessão, paridade de chaves e de marcadores entre idiomas, número de redações |
| Dados | ids únicos, toda liga com clubes, todo clube com imagem real ou gerada |
| Interface | e2e em celular (375 × 812) e desktop: carreira completa, resumo, pôster, recarregar no meio |

**Como ficou no M8 (D40):** a suíte `pnpm e2e` (Playwright, no Chrome do
sistema, sobre o build de produção) cobre a jornada do Início ao Resumo pela
identidade, o link compartilhado, recarregar no meio e no resumo, o Desafio do
dia até o resultado ranqueado, o Hall com "E se...?" e conquistas, os erros
(endereço inexistente, save corrompido, tela que não baixa, tela que quebra,
páginas estáticas, jogo que não começa), o PWA (manifesto, jogo inteiro sem
internet, imagens guardadas) e a acessibilidade (axe nos dois temas, teclado,
leitor de tela). No celular, o laço é medido a cada turno: cabe na tela.

**Como ficou (D50):** a suíte abre no hub, entra no Craque pelo cartão dele
(recarregar volta ao hub, e "Continuar carreira" retoma a mesma decisão) e
tem a jornada do Técnico (42.12). Sem Google Chrome, `PW_CHROMIUM_PATH` aponta
para um Chromium instalado.

---

## 41. O hub do Futeiros

O site se chama **Futeiros** e reúne dois jogos de futebol: o **Craque**, a
carreira de jogador das seções 1 a 40, e o **Técnico**, a carreira de treinador
da seção 42. O hub (`apps/game/src/screens/hub/HubScreen.tsx`) é a primeira
tela. Ele não carrega motor nenhum: o motor do Técnico, os elencos e os textos
dele só entram quando o jogador começa uma carreira (a identidade importa
`features/tecnico/store.ts` na hora de começar).

### 41.1 Abertura e navegação

`startScreen` (`apps/game/src/app/startup.ts`) decide onde o jogo abre. A
primeira regra que se aplicar vence:

| Endereço | Abre |
|---|---|
| Caminho que não é o do jogo | Página não encontrada (`notFound`) |
| Fragmento `#c=` (link de carreira, seção 29.2) | Resumo compartilhado (`shared`) |
| `#lab`, só em desenvolvimento | Laboratório (`lab`) |
| Qualquer outro | Hub (`hub`) |

- Abrir ou recarregar o site sempre cai no hub. A carreira salva do Craque não
  abre mais sozinha: ela continua pelo cartão do Craque (41.2). O Técnico não
  tem save (D51), então recarregar nunca volta para a carreira dele.
- A URL continua a mesma entre telas (seção 5); o botão voltar do sistema anda
  pelo histórico.
- `SCREEN_GAME` (`apps/game/src/app/navigation.ts`) diz de que jogo é cada tela:

| Jogo | Telas |
|---|---|
| `hub` | `hub`, `achievements`, `notFound`, `lab` |
| `craque` | `home`, `identity`, `appearance`, `career`, `summary`, `shared`, `challenge`, `hall`, `archived` |
| `tecnico` | `tecnicoIdentity`, `tecnicoAppearance`, `tecnico`, `tecnicoLegacy` |

- A barra mostra a marca Futeiros, que volta ao hub, e, dentro de um jogo, a
  etiqueta dele ("Craque" ou "Técnico").
- Sair do Técnico (marca, menu "Sair do Técnico", voltar do sistema) pede
  confirmação ("Sair do Técnico?"). Confirmar leva ao destino e **não** apaga a
  carreira: ela segue na memória da aba até a página ser recarregada. A ida
  para o legado passa sem confirmação.
- A tela da carreira e a do legado, abertas sem carreira em memória (depois de
  recarregar, por exemplo), voltam ao hub.

**Como ficou (D50):** substitui, na seção 5, a regra de recarregar retomando a
Carreira ou o Resumo do Craque. O Craque não mudou de regra: `ENGINE_VERSION`
continua `2.0.0-m8.4` e o título do Início dele continua "CRAQUE".

### 41.2 Os cartões dos dois jogos

No PC, os dois cartões ficam lado a lado sem rolar; no celular, empilhados.
Cada cartão diz o que o jogo é em três linhas, mostra quantas conquistas
daquele jogo foram liberadas e tem o botão de jogar.

| | Craque | Técnico |
|---|---|---|
| Arte | A carta do rascunho do jogador | O avatar do rascunho do treinador, de terno (`outfit="coach"`) |
| Linha de apoio | "Do primeiro contrato, aos 16 anos, até a despedida." | "24 temporadas no banco, quase sempre começando na segunda divisão." |
| Três pontos | Uma decisão por temporada; ofertas, treinos e eventos; carreira salva neste aparelho | Três ações por etapa; elencos reais, mercado e base; mundo vivo, sem seleções |
| Selo | nenhum | "Sem salvamento" |
| Sem carreira | "Jogar" (abre o Início do Craque) | "Jogar" (abre a identidade) e o aviso "Recarregar a página encerra a carreira do Técnico." |
| Com carreira | "Carreira salva: {sobrenome}, {idade} anos, OVR {ovr}", com "Continuar carreira" (ou "Ver o resumo", se o save está no resumo) e "Início do Craque" | "Em andamento nesta aba: {clube} · {ano}" (ou "Legado na tela"), com "Voltar à carreira" (ou ao legado) e "Jogar" |

- O cartão do Técnico lê só `features/tecnico/presence.ts` (ativo, clube, ano,
  encerrada), atualizado pelo store a cada comando: o hub não precisa do motor.
- "Jogar" com uma carreira do Técnico em memória abre a identidade; começar
  pede confirmação ("Começar outra carreira?") e encerra a anterior.
- O rodapé leva às conquistas (com o total liberado dos dois jogos) e, só em
  desenvolvimento, ao laboratório.

### 41.3 Marca, PWA e erros

- Título da página, manifesto (`name` "Futeiros: dois jogos de futebol",
  `short_name` "Futeiros"), tela de abertura ("Abrindo o Futeiros"), aviso sem
  JavaScript e páginas estáticas 404, 403, 500 e 503 dizem "Futeiros".
- A página não encontrada ("Bola fora") volta ao hub ("Voltar ao jogo").
- O painel de erro de uma tela usa `SCREEN_GAME`. Numa tela do Técnico, o texto
  não promete carreira salva: "a carreira do Técnico continua nesta aba [...];
  recarregar a página encerra a carreira". O botão de limpar dados só aparece
  nas telas que leem o save do Craque (`career` e `summary`).
- Pedaço de tela que não baixa por versão nova: no Técnico, o texto avisa que
  recarregar encerra a carreira, que não é salva.
- Aviso de versão nova do PWA: "Atualize quando quiser. A carreira do Craque
  continua salva; a do Técnico acaba ao atualizar."

### 41.4 Conquistas por jogo

- As conquistas dos dois jogos ficam no mesmo banco. As do Técnico têm id
  `tecnico:*` (`COACH_ACHIEVEMENTS`, `packages/content/src/coach.ts`; lista na
  42.14).
- A tela de conquistas tem a troca Craque/Técnico, com contagem própria de cada
  jogo. O cartão de cada jogo no hub conta só as dele; o Início do Craque conta
  só as que não começam com `tecnico:`.
- As do Técnico são conferidas quando o histórico ganha uma temporada (fim de
  temporada ou aposentadoria no meio dela) e quando a carreira acaba. São a
  única coisa do Técnico que sobrevive ao recarregar.

**Como ficou (D54):** separar a contagem evita que o Técnico mude os números
que o Craque já mostrava.

---

## 42. Técnico: a carreira de treinador

### 42.1 Visão e o laço da temporada

O Técnico é uma carreira de **24 temporadas** (`CAREER_SEASONS`) no banco de
reservas, nos mesmos clubes e competições de clubes do Craque, com elencos
reais. O jogador decide pouco e com peso: **até 3 ações por etapa**
(`ACTIONS_PER_STAGE`), escalação e tática livres, e um evento por etapa. O
resto é simulado partida a partida, no mundo inteiro.

- Motor puro e semeado em `packages/engine/src/coach/` (`@craque/engine/coach`,
  fora do índice do motor do Craque). Todo sorteio passa por
  `coachRng(semente, rótulo, ...partes)`. Versão `COACH_VERSION = 1.0.0`.
- Todos os números de equilíbrio estão em `packages/engine/src/coach/tuning.ts`.
- Toda mudança passa por `coachCommand`, que nunca altera o estado recebido:
  devolve um estado novo ou o mesmo com o código da recusa. Comando fora de
  fase é recusado sem efeito: clique repetido não duplica venda, receita nem
  simulação.
- A semente é sorteada a cada carreira. A primeira temporada é 2026.

```
propostas ──► etapa (até 3 ações + tática) ──► evento ──► simulação ──► resultados
                 ▲                                │ (pausa: decisão no jogo)  │
                 │                                ▼                           │
                 └── 2º turno (só no lento) ◄──────────────────────────────────┤
                                                                              ▼
                       próxima temporada ◄── propostas ◄── avaliação ◄────────┘
```

**Ritmos** (`COACH_MODES`):

| Ritmo | Etapas por temporada | Períodos simulados |
|---|---|---|
| Rápido (`fast`) | 1 | dias 0 a 364 |
| Lento (`slow`) | 2, uma por turno | dias 0 a 149 e 150 a 364 |

A temporada tem 300 dias de jogos e 65 de férias (`CALENDAR_DAYS`). O último
período vai até o fim das férias para caber o Mundial de Clubes. No lento,
cada turno tem as próprias 3 ações e o próprio evento; evolução, salários e
receitas usam metade da temporada em cada turno (fração 0,5), e as duas
metades somam o mesmo que o período único do rápido.

**Resumo do período** (`report.ts`): posição e campanha na liga, fase alcançada
em cada copa, evolução de OVR (com a marca de quem foi desenvolvido), lesões de
10 dias ou mais, mudanças nas relações com o motivo, dinheiro do período
(receitas, salários, transferências, premiações, caixa e verba), momentos,
destaques (as 3 melhores notas médias entre quem fez 3 jogos ou mais),
revelações (até 21 anos, 4 jogos ou mais, nota média de 6,8 ou mais, ou +2 de
OVR), quem ficou abaixo do esperado (estrela ou titular com 4 jogos ou mais e
nota média abaixo de 6,3), promessas resolvidas e características novas.

### 42.2 Identidade do treinador

- **Nome**: até 16 caracteres.
- **Nacionalidade**: só os 15 países com segunda divisão no jogo
  (`COACH_COUNTRIES`): ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER, ITA,
  PAR, PER, URU e VEN. México e Estados Unidos ficam de fora, porque não têm
  segunda divisão. Os dez países com segunda divisão completada por jogadores
  gerados (ARG, BOL, BRA, CHI, COL, ECU, PAR, PER, URU e VEN) levam a marca ◆
  na escolha.
- **Ritmo**: rápido ou lento (42.1).
- **Aparência**: o editor do Craque, com o avatar de terno (`outfit="coach"`) e
  o uniforme do país; botão de sortear.
- A tela avisa antes de começar: "A carreira do Técnico não é salva. Recarregar
  ou fechar a página encerra a carreira e volta para o início."
- Ficam guardados só o rascunho (`craque.v2.tecnico.draft`: nome,
  nacionalidade, ritmo e aparência) e as conquistas. A carreira vive no store
  `features/tecnico/store.ts`, sem `persist`.

**Como ficou (D51 e D53):** além da identidade, o aviso de que não há save
aparece no cartão do hub, na confirmação de saída, no `beforeunload` do
navegador, no aviso de versão nova e no painel de erro (41.3). A suíte ponta a
ponta fixa a semente pelo `sessionStorage` (`futeiros.e2e.seed`) e audita o
armazenamento depois de uma carreira.

### 42.3 Propostas

**Iniciais** (`initialOffers`): três sorteios **independentes**. Cada um tira a
divisão sozinho: 95% segunda, 5% primeira (`INITIAL_OFFERS.secondDivisionChance`),
e depois um clube daquela divisão no país do treinador, sem repetir clube. Sem
clube disponível na divisão, vale qualquer divisão do país. A chance de ao
menos uma proposta de primeira é `1 − 0,95³ = 14,3%`.

**O cartão de proposta** (`OfferCard`): clube, divisão, país (com a marca "Fora
do país" quando é outro), força (média do OVR do melhor time), objetivo,
verba, folha mensal, receita anual, finanças (saudável, equilibrada ou
apertada, 42.11), dificuldade e, quando 25% ou mais do elenco é gerado, a
fração gerada.

```
dificuldade = limitar(arredondar(1 + pressão_do_objetivo + pressão_financeira + prestígio + meta_apertada); 1; 5)
pressão_do_objetivo: título 1,6; acesso 1,2; parte de cima 0,9; meio 0,4; evitar a queda 1,1; fazer o possível 0,3
pressão_financeira: apertada 1; equilibrada 0,4; saudável 0
prestígio: 4 ou mais = 1; 3 = 0,5; menos = 0
meta_apertada: 0,6 se a posição exigida é melhor que a esperada
```

Na tela: 1 Tranquila, 2 Moderada, 3 Exigente, 4 Difícil, 5 Muito difícil.
Clube maior não é emprego mais fácil.

**Ao assinar** (`setCoachClub`): diretoria 60, torcida 50, crédito 0,5
(`EVALUATION.creditStart`), verba da temporada, objetivo, papéis do elenco e a
formação que rende mais com o elenco (filosofia inicial posse). As propostas
depois de cada temporada estão na 42.13.

### 42.4 Calendário e competições

**O Técnico não tem seleções nem competições de seleções, por enquanto**
(instrução do usuário). Nenhuma convocação, Copa do Mundo, copa continental de
seleções ou data FIFA entra no calendário. A tela de competições diz "Só
competições de clubes"; o hub diz "Mundo vivo, sem seleções". O Craque continua
com as seleções dele.

O Técnico joga as mesmas competições de clubes do Craque, partida a partida
(`competitions.ts`). A memória da temporada anterior (tabelas, copas,
continentais) vem do aquecimento do mundo do Craque com a mesma semente, e a
classificação continental segue a seção 8.7.

| Competição | Formato | Dias |
|---|---|---|
| Liga | Turno e returno pelo método do círculo, `games` rodadas por clube; mando alterna | rodadas espalhadas do dia 8 ao 292 |
| Supercopa nacional | Campeão da liga contra o campeão da copa do ano anterior (o vice da liga, se for o mesmo); jogo único, neutro | 2 |
| Supercopa continental | Campeões da primária e da secundária; jogo único, neutro | 4 |
| Copa nacional | Todos os clubes do país, mata-mata; Copa do Brasil em ida e volta a partir das oitavas | os últimos dias da lista 24, 52, 80, 108, 164, 192, 220, 262, um por fase (final no 262) |
| Copa da liga (ENG) | Mata-mata; semifinal em ida e volta | os últimos dias da lista 17, 45, 73, 101, 157, 185, 213, 241 (final no 241) |
| Continentais | Preliminar, grupos e mata-mata conforme o número de classificados | preliminar 31; grupos 38, 59, 87, 115, 129, 143; mata-mata 171 e 178, 199 e 206, 227 e 234; final 283 (secundária e terciária, um dia depois) |
| Intercontinental | Chaveamento dos campeões de CONMEBOL e CONCACAF da temporada e dos adversários genéricos (AFC 72, CAF 74, OFC 60); o vencedor enfrenta o campeão europeu da temporada anterior | 289, 292, 295, 298 |
| Mundial de Clubes | Anos com `ano % 4 == 1`; cotas UEFA 12, CONMEBOL 6, CONCACAF 4 | 303, 306, 310, 314, 318 (férias) |

- **Tabela**: pontos, saldo, gols pró, vitórias e, por fim, a força.
- **Acesso e queda**: os `promotionSlots` últimos da primeira trocam com os
  primeiros da segunda (seção 8.4).
- **Copas**: cabeça de chave por força, com +20 para clubes da primeira
  divisão; os mais fortes ganham folga até a potência de 2, e na primeira fase
  o cabeça enfrenta o mais fraco que sobrou. As fases seguintes são sorteadas
  livremente. Jogo único em casa do mais forte; em ida e volta, o mais forte
  decide em casa. Final em jogo único é em campo neutro; na Copa do Brasil, a
  final também é em ida e volta.
- **Continentais**: com 32 ou mais classificados, chave de 32 (preliminar para
  o excedente, 8 grupos de 4, os dois primeiros às oitavas); de 16 a 31, chave
  de 16 (preliminar para o excedente, 4 grupos, quartas); com menos de 16,
  mata-mata direto. Grupos em turno e returno, potes por força. Mata-mata em
  ida e volta, final única e neutra.
- **Mundial de Clubes**: os campeões das primárias nas quatro temporadas
  anteriores, completados pelos mais fortes de cada confederação até a cota.
  São 22 clubes numa chave de 16: os 12 mais fracos jogam a preliminar. Todos
  os jogos em campo neutro. Começando em 2026, uma carreira de 24 temporadas
  tem 6 edições.
- **Cada fase de mata-mata é sorteada quando a anterior termina**: o resultado
  do treinador muda quem segue. Jogo de copa marcado num dia em que um dos
  clubes já joga muda para o dia livre mais próximo, até 3 dias de distância.
- **Jogo decisivo empatado** (no placar ou no agregado): prorrogação com um
  terço dos gols esperados (`MATCH.extraTime`) e pênaltis.

**Como ficou (D55):** com número ímpar de clubes, cada volta da liga tem uma
folga por rodada. Força relativa: só o elenco conta, sem bônus de continente
(42.5).

### 42.5 A partida

Uma só conta de gols esperados vale para todos os jogos do mundo
(`tactics.ts`, números em `MATCH` e `SECTOR_MIX`):

```
λ = 1,32 × e^(0,045 × (ATQ − DEF_adv) + 0,02 × (MEI − MEI_adv) ± 0,11)
    × filosofia_a_favor × filosofia_contra_do_adversário × bola_parada
    × reforço_a_favor × reforço_contra_do_adversário
    × (1 − 0,1 × faltando) × (1 + 0,1 × faltando_adversário)
λ limitado a [0,12; 4,2]; mando +0,11 em casa, −0,11 fora, 0 em campo neutro
ATQ = 0,75 × ataque + 0,25 × meio
DEF = 0,65 × defesa + 0,20 × goleiro + 0,15 × meio
setor = média do rendimento de quem joga nele + 1,2 × (jogadores no setor − base)
base: 4 defensores, 4 meias, 2 atacantes; setor vazio: média geral − 6 (goleiro: − 15)
bola_parada = 1 + mín(0,04; 0,02 × titulares com Bola parada)
```

Os reforços vêm do treino (42.9), da previsibilidade (42.6) e da decisão no
jogo (42.10).

**Jogo da IA contra a IA** (`quickMatch`): gols por `Poisson(λ)` de cada lado.
Cada clube joga com o melhor time disponível na formação fixa dele, com
rendimento `nível + limitar(fase; −2; 2) + penalidade de posição` (contra o
treinador, `nível + fase`, −3 fora da posição). Depois do placar, cada titular
tem chance `0,022 × fator de idade` de se machucar.

**Jogo do treinador** (`match.ts`), minuto a minuto:

- Gol com chance `λ / 90` por minuto, recalculado com quem está em campo.
- Autor sorteado pelo peso da vaga vezes `(nível / 70)³`: centroavante 0,32,
  pontas 0,2, meia ofensivo 0,16, meias abertos 0,12, meia central 0,07,
  volante 0,04, zagueiro 0,045, laterais 0,03, goleiro 0.
- Assistência em 78% dos gols, peso da vaga vezes `(nível / 70)²`.
- Nota: base 6,2; gol +0,9; assistência +0,45; vitória +0,35; derrota −0,35;
  sem sofrer gol +0,4 (goleiro, zagueiros e laterais); ruído `N(0; 0,55)`;
  entre 3 e 10 (`RATING`).
- Lesão: chance por minuto `(0,022 / 90) × (1 + 0,04 × máx(0; idade − 28))`,
  vezes 0,75 com Incansável (`INJURY`). Gravidade: leve 70% (4 a 14 dias),
  média 25% (15 a 45), grave 5% (60 a 180).
- Substituições automáticas pela Lei 3 da IFAB (`SUBSTITUTIONS`): até 5 trocas
  em 3 paradas além do intervalo. Paradas táticas aos 60', 71' e 81': duas
  trocas aos 60', depois uma (duas com placar de 2 gols ou mais). Sai quem tem
  a pior nota no jogo, descontado o cansaço da idade (Incansável cansa menos),
  nunca o goleiro; o reserva só entra se não for mais de 6 pontos pior, salvo
  promessa de minutos. Lesionado sai no minuto; sem troca legal, o time segue
  com um a menos.
- Pênaltis: cinco cobranças, depois alternadas; conversão
  `limitar(0,76 − 0,004 × (goleiro adversário − 70); 0,62; 0,86)`.

**Só o elenco decide.** Nenhum bônus de continente ou de liga entra na conta. A
sonda "trocado" do harness refaz o duelo com os elencos trocados de clube e o
resultado inverte (erro 2,2e-16). No relatório, em jogo único e campo neutro,
Barcelona (86,7) passa pelo Flamengo (80,9) em 70,1%; com os elencos trocados,
29,9%.

### 42.6 Tática, escalação e inscrição

Não há barra de adequação tática: a formação só decide quantos jogadores cada
setor tem e em que posição cada um joga.

| Formação | Vagas |
|---|---|
| `4-4-2` | GOL, LD, ZAG, ZAG, LE, MD, MC, MC, ME, CA, CA |
| `4-3-3` | GOL, LD, ZAG, ZAG, LE, MC, VOL, MC, PD, CA, PE |
| `4-2-3-1` | GOL, LD, ZAG, ZAG, LE, VOL, MC, PD, MEI, PE, CA |
| `3-5-2` | GOL, ZAG, ZAG, ZAG, MD, MC, VOL, MC, ME, CA, CA |
| `5-3-2` | GOL, LD, ZAG, ZAG, ZAG, LE, MC, VOL, MC, CA, CA |
| `4-1-4-1` | GOL, LD, ZAG, ZAG, LE, VOL, MD, MC, MC, ME, CA |

**Filosofias** (`PHILOSOPHY`), multiplicadores dos gols a favor e contra:

| Filosofia | A favor | Contra |
|---|---|---|
| Ofensiva | × 1,2 | `limitar(1,12 − 0,004 × (DEF própria − ATQ adversário); 1,05; 1,2)` |
| Defensiva | × 0,8 | × 0,76 |
| Posse | `1 + limitar(0,02 × (MEI − MEI adv); −0,1; 0,1)` | × 0,92 |
| Contra-ataque | × 1,13 contra ofensiva ou posse, × 0,86 contra defensiva, × 1 contra contra-ataque; vezes `1 + mín(0,06; 0,02 × titulares velozes)` | × 0,94 |

Nenhuma é sempre melhor. Pontos por jogo contra a mistura de abordagens da IA,
no relatório: com 12 ou 8 pontos a menos, a defensiva; com 5 a menos, o
contra-ataque; com 3 a menos, a defensiva; em forças iguais, o contra-ataque
(diferença de 0,053 ponto para a pior); com 3 ou 5 a mais, a posse; com 8 ou 12
a mais, a ofensiva.

**A IA** escolhe a abordagem pela força: mais de 3 pontos acima, 55% ofensiva e
45% posse; mais de 3 abaixo, 50% defensiva e 50% contra-ataque; perto, posse
30%, ofensiva 25%, contra-ataque 25%, defensiva 20%. A formação da IA é fixa por
clube: `4-3-3` 35%, `4-2-3-1` 25%, `4-4-2` 20%, `3-5-2` 10%, `4-1-4-1` 6%,
`5-3-2` 4%.

**Previsibilidade** (`PREDICTABILITY`), de 0 a 1:

- Cada jogo soma 0,04. O adversário ganha `+6% × p` de gols e o time perde
  `3% × p`.
- Mudar reduz `p` por sorteio, conforme o que os rivais leem mais na temporada
  (formação ou filosofia, 50% cada): formação lida `× U(0,3; 0,9)`, não lida
  `× U(0,6; 0,95)`; filosofia lida `× U(0,05; 0,45)`, não lida `× U(0,3; 0,8)`;
  4 titulares novos ou mais `× U(0,6; 0,95)`.
- Metade de `p` passa para a temporada seguinte.
- Com `p ≥ 0,5`, a etapa dá a pista: "Os adversários estão lendo o
  seu esquema. Mudar formação ou filosofia pode surpreender."

**Escalação.** O jogador escolhe titulares por vaga e o banco, livremente, na
etapa e no evento, antes de simular; "Escalar automático" monta o melhor time
disponível na formação. Trocar a formação mantém os mesmos onze nas vagas mais
parecidas. Para cada jogo, o motor monta a ficha (`coachSheet`):

- quem não pode jogar (lesionado ou fora da inscrição) é trocado pelo melhor
  disponível para a vaga;
- em jogo que não é grande, quem não é estrela e tem 6 jogos seguidos como
  titular descansa com chance de 20%; em jogo de copa de menor peso (fora da
  liga e dos grupos, com 5 pontos de força ou mais de vantagem), até 2 titulares
  descansam, com 50% cada; o substituto não pode ser mais de 8 pontos pior
  (`ROTATION`);
- promessas de titularidade atrasadas tiram a vaga do titular mais fraco da
  mesma posição, nunca de uma estrela (42.11);
- o banco completa até o limite do país, promessas primeiro.

Jogo grande: mata-mata decisivo (jogo único ou volta), semifinal ou final.

**Penalidade de posição** (`POSITION_FIT`): posição alternativa −1, mesmo setor
−3, outro setor −7, goleiro fora do gol (ou jogador de linha no gol) −25.
Versátil perde metade, menos no gol.

**Inscrição automática** (`REGISTRATION`): jovens de até 21 anos no ano da
temporada ficam fora do teto; dos demais, entram os de maior OVR até 25 na
Inglaterra e 30 nos outros países. Quem fica fora da lista não joga. A regra de
formados no país (homegrown) não é aplicada. Contratar alguém acima de 21 anos
é bloqueado quando o elenco já tem mais 5 que o teto.

**Banco** (`BENCH_SIZE`): 12 no Brasil, na Itália e na Argentina; 9 nos demais.
**Elenco mínimo** (`SQUAD_MINIMUM`): 18 jogadores com 2 goleiros; nenhuma venda
pode deixar menos.

**Como ficou (D53):** a inscrição inglesa completa complica sem criar escolha
interessante; o teto de idade já faz o jogador pensar em quem subir da base.

### 42.7 Mercado: vender e contratar

**Vender** (`SALE`). O treinador oferece até 3 jogadores; cada um só uma vez
por etapa.

```
compradores = clubes com força entre OVR − 6 e OVR + 3
              e caixa + 0,4 × receita ≥ 0,8 × valor
procura = compradores × 0,4 (32 anos ou mais) ou × 1,3 (até 24)
          × 1,4 (à venda) × 0,5 (lesionado)
procura: 14 ou mais = muita; 5 ou mais = média; menos = pouca
chance de proposta: pouca 30%, média 60%, muita 85%
preço = valor × U(0,75; 1,25) × (0,9 pouca; 1 média; 1,08 muita)
```

O comprador é um clube de força entre `OVR − 6` e `OVR + 4` que pode pagar,
com peso `1 + máx(0; 6 − |força − OVR|)`. O vendido segue a trajetória dele no
novo clube. Aceitar uma venda põe o preço no caixa e 60% dele na verba
(`FINANCE.saleToBudget`). Nenhuma venda pode deixar o elenco abaixo do mínimo
(42.6).

Reação à venda: ídolo (60 jogos ou mais com o treinador, ou 30 se veio da base
do clube) tira 9 da torcida, dá 2 à diretoria e tira 2 da satisfação de cada um
do elenco; estrela tira 4 da torcida; reserva ou rotação insatisfeito vendido
dá 1 de satisfação ao grupo; caixa negativo dá 2 à diretoria.

**Contratar** (`PURCHASE`, `market.ts`). A busca mostra jogadores de outros
clubes com OVR entre `força − 12` e `força + 20` do clube. Por padrão: OVR até
`força + 4`, só quem cabe na verba e **sem os quase impossíveis** (o jogador
pode pedir para vê-los). Os resultados vêm ordenados pela faixa de chance, e o
treinador escolhe até 3 alvos.

A chance de um negócio é a do jogador querer vezes a do clube dele liberar:

```
atratividade = força + 2 × (prestígio − 3) + 0,25 × (força média da liga − 70)
               + continental (primária 1,5; secundária ou terciária 0,7)
               + 0,06 × (reputação do técnico − 40)   (só no clube do treinador)
expectativa = OVR − mín(3; 0,5 × máx(0; OVR − atratividade do clube atual))
              (sem clube: OVR − 3)
lacuna = expectativa − atratividade do comprador
descida = força do vendedor − força do comprador
folga = 4, + 4 se não é estrela nem titular onde está, + 3 com 32 anos ou mais
jogador = limitar(σ((2,5 − lacuna) / 1,6) × σ((folga − descida) / 2,2) × estrela × papel; 0,0001; 0,97)
estrela = máx(0,05; 1 − 0,15 × (OVR − 84)) se OVR ≥ 85 e a atratividade do comprador < OVR − 1
papel no comprador: estrela ou titular × 1,15; reserva × 0,5; rotação ou promessa × 1
clube = base do papel lá (estrela 0,25; titular 0,55; rotação 0,8; reserva 0,92; promessa 0,7)
        × σ((força comprador − força vendedor + 3) / 2,5) × 1,6   (só estrela ou titular)
        × 1,5 (à venda) × 1,3 (31 anos ou mais), limitado a [0,01; 0,97]; sem clube: 1
```

O teto do desconto de ambição é `PURCHASE.ambitionCap` (3): o craque de um
clube pequeno aceita um vizinho do mesmo porte, nunca um clube bem menor. O
piso `PURCHASE.playerFloor` (0,0001) faz o negócio nunca ser impossível.

A tela mostra uma faixa, nunca a conta: abaixo de 5% "Quase impossível"; abaixo
de 25% "Difícil"; abaixo de 55% "Possível"; acima, "Provável". Confirmar sorteia
as duas respostas: o clube não libera, o jogador não tem interesse, ou o clube
aceita vender com preço e salário pedidos.

```
preço = valor × U(faixa do papel) × (1 + 0,03 × máx(0; descida))
faixa: estrela 1,35 a 1,6; titular 1,15 a 1,35; rotação 1 a 1,15; reserva 0,85 a 1; promessa 1,1 a 1,4
salário = máx(salário atual × U(1,05; 1,3); salário do OVR) × (1 + 0,04 × máx(0; descida))
```

Aceitar exige verba, caixa acima de `−25%` da receita
(`FINANCE.debtLimit`), folha abaixo do teto (70% da receita por mês) e vaga
na inscrição; a tela mostra verba, caixa e folha depois do negócio antes do
aceite. Cada aceite é validado de novo: um negócio aceito pode impedir o
seguinte.

No relatório, a mediana da chance cai a cada degrau de diferença entre o OVR
do alvo e a força do comprador. Flamengo (80,9): 72,3% no próprio nível, 52,5%
com +2, 27,8% com +4, 16,1% com +6, 0,869% com +8. Goiás (70,5): 54,2%, 27,3%,
7,5%, 1,2%, 0,132%. Mbappé (91, Real Madrid) no Flamengo: 0,0497%; no
Manchester City: 23,6588%.

**Como ficou (D56):** o pedido do produto é que trazer alguém muito melhor seja
muito difícil e um craque mundial num clube pequeno, quase impossível, com a
conta à vista no laboratório.

### 42.8 O jogador e o que a tela mostra

| Escondido (só no motor) | O que a tela mostra |
|---|---|
| Nível contínuo (`level`) | OVR, o nível arredondado |
| Potencial (`potential`) | Uma frase: pode crescer muito, ainda deve crescer, pode crescer um pouco, perto do limite, no auge, na fase final da carreira |
| Satisfação de 0 a 100 | Uma palavra: satisfeito, neutro, insatisfeito |
| Fase de −2 a +2 | Uma palavra: em grande fase, boa fase, fase normal, fase ruim, fase péssima |
| Rendimento efetivo | Nada |
| Longevidade, notas recentes | Nada |

A projeção `apps/game/src/features/tecnico/view.ts` é a única porta da tela
para os jogadores, e `view.test.ts` reprova se `level`, `potential`,
`satisfaction`, `longevity` ou `recentRatings` aparecerem. Só o laboratório, em
desenvolvimento, mostra os valores escondidos.

**Criação** (`players.ts`): `nível = OVR + U(−0,45; 0,45)`. Potencial escondido
pela idade: até 18 anos `OVR + U(5; 15)`, mais `U(3; 8)` em 8% dos casos; até
20, `U(3; 12)` mais `U(2; 6)` em 6%; até 23, `U(1; 8)`; até 26, `U(0; 4)`;
depois, `U(0; 1,2)`; teto 97. Longevidade `N(0; 1,5)` anos, com um piso para
quem já está num elenco no começo: o declínio não pode ter começado mais de 1
ano antes (`EVOLUTION.veteranOverStart`), senão um meia de 36 anos perderia de 8
a 10 de OVR já na primeira temporada. Satisfação inicial `62 + U(−6; 6)`.

**Indicação do potencial**: `folga = potencial + erro fixo − nível`, com erro
fixo por jogador entre −3 e +3. 31 anos ou mais: fase final; 27 ou mais com
folga abaixo de 2: no auge; folga acima de 10: pode crescer muito; acima de 5:
ainda deve crescer; acima de 1,5: pode crescer um pouco; senão, perto do limite.

**Satisfação** (`SATISFACTION`). Satisfeito com 66 ou mais, insatisfeito abaixo
de 40. Por jogo, conforme o papel:

| Papel | Titular | Entrou no jogo | No banco sem entrar | Fora |
|---|---|---|---|---|
| Estrela | +0,5 | +0,3 | −1,6 | −1,8 |
| Titular | +0,4 | +0,24 | −1,2 | −1,4 |
| Rotação | +0,7 | +0,42 | −0,25 | −0,45 |
| Reserva | +0,8 | +0,48 | −0,05 | −0,1 |
| Promessa | +1 | +0,6 | 0 | −0,05 |

Quem aceita ser reserva (de saída, quem tem 31 anos ou mais e 35% dos outros;
uma conversa pode convencer) não perde enquanto as vezes no banco sem entrar
forem até 25% dos jogos disponíveis; posto à venda ou poupado pela rotação
também não perde. No fim de cada período, a campanha mexe em todos:

```
satisfação += limitar((esperada − posição) / máx(2; n / 5); −1; 1) × 4   (60% da queda com um Líder no elenco)
satisfação += 0,1 × (60 − satisfação)
na virada, mais: satisfação += 0,2 × (60 − satisfação)
```

**Fase**: média das últimas 6 notas: abaixo de 5,8 é −2; abaixo de 6,25, −1;
abaixo de 6,85, 0; abaixo de 7,25, +1; acima, +2. Sem jogar, a fase volta 0,1
por jogo em direção a 0.

**Rendimento efetivo** (escondido):

```
rendimento = nível + limitar(máx(−4; humor + fase) + características; −4; 3) + penalidade de posição
humor, pela satisfação: insatisfeito −3; neutro 0; satisfeito +1
```

Um 75 insatisfeito rende como 72.

**Papel esperado** (`roleFor`): posto do jogador no setor dele (titulares: 1
goleiro, 4 defensores, 3 meias, 3 atacantes). Titular com OVR pelo menos 3
acima da força do clube é estrela; titular comum, titular; quem não é titular
e tem até 20 anos é promessa; os 2 seguintes de cada setor de linha são
rotação; o resto, reserva. Definido na chegada e na virada, quando cai no
máximo um degrau por temporada no clube do treinador.

**Características** (`TRAIT_EFFECTS`), no máximo 2 por jogador:

| Característica | Efeito |
|---|---|
| Veloz | +2% de gols a favor por titular no contra-ataque, até +6% |
| Bola parada | +2% de gols a favor por titular, até +4% |
| Decisivo | +2 de rendimento em jogo grande |
| Muralha | +1 de rendimento como zagueiro ou volante |
| Incansável | 75% do risco de lesão; cansa menos nas trocas |
| Versátil | metade da penalidade fora da posição |
| Líder | o grupo sente 60% da queda de satisfação por resultados |
| Clássico | +2 de rendimento contra o rival |
| Mentor | jovens de até 21 anos do elenco evoluem 15% mais |

As iniciais vêm das fontes (42.15). No clube do treinador, com fase de +1 ou
mais, o jogador pode ganhar uma, com chance de 6% por candidata
(`EVOLUTION.traitChance`): Decisivo com 2 gols em jogos grandes, Clássico com 2
em clássicos, Bola parada com 2 de bola parada, Líder com 28 anos ou mais, 15
jogos como titular e nota média 7, Incansável com mais de 10 jogos disponíveis
e 85 minutos por jogo disponível. Mentor também chega por evento.

**Evolução** (`evolution.ts`), uma atualização por período, para todo o mundo:

```
ganho = fração × 5 × idade × folga × minutos × (1 + 0,15 × desempenho) × mentor
idade = 1 / (1 + e^((idade − (pico − 2)) / 1,6)); pico: goleiro 30, defesa 28, meio 27,5, ataque 26,5
folga = (máx(potencial − nível; 0) + 0,3) / (máx(potencial − nível; 0) + 5,3)
minutos = 0,45 + 0,55 × mín(1; jogos por temporada / 32)
desempenho = limitar((nota média − 6,6) / 0,6; −1; 1)   (só no clube do treinador; IA: 0)
declínio = fração × (0,35 × x + 0,08 × x²) × (1 − 0,2 × desempenho)
x = idade − (31 + 2 goleiro ou + 1 defensor + longevidade), se positivo
nível novo = limitar(nível + ganho − declínio + N(0; 0,6 × √fração); 30; 97)
o ganho nunca passa de potencial + 1
```

Na IA, os jogos vêm do posto no elenco: os 11 melhores 30 por temporada, os 7
seguintes 12, os outros 6 (até 20 anos) ou 3. A fase da IA é sorteada a cada
período, `N(0; 0,7)`.

**Valor e salário**: valor estimado pela curva do Craque (OVR e idade; a tela
diz que é estimativa). Salário mensal pelo OVR, igual em qualquer clube:
`máx(2.000; 0,11 × valor de base aos 27 anos / 12)`, em passos de 500.

Jogador gerado tem a marca ◆ "Fictício".

### 42.9 Treinar, desenvolver, base, vestiário e verba

**O processo de cada ação.** Abrir e escolher alvos é livre. Confirmar gasta 1
das 3 ações e produz as respostas; aceitar ou recusar cada resposta não gasta
nada. "Concluir" fecha o processo e recusa o que ficou pendente (conversa sem
resposta fica com a primeira opção). Cancelar antes de confirmar não custa
nada. Dinheiro, folha e elenco só mudam no aceite. Um processo aberto de cada
vez. Escalação, tática e a consulta ao elenco são livres.

| Ação | Alvos | Respostas |
|---|---|---|
| Vender | até 3 do elenco | uma proposta ou nenhuma por jogador (42.7) |
| Contratar | até 3 de outros clubes ou livres | uma resposta por alvo (42.7) |
| Treinar | 1 setor | aplica na hora |
| Desenvolver | até 3 do elenco | aplica na hora |
| Base | 1 dos 5 garotos | aplica na hora |
| Vestiário | até 3 conversas ou uma reunião | uma resposta por conversa, ou o resultado da reunião |
| Pedir verba | nenhum: a folha mostra as chances e os valores de agora | a resposta da diretoria |

**Treinar** (`TRAINING`): cada vez no mesmo setor rende menos: +4%, +2,5% e
+1,5%, no máximo 3 vezes e 8% por setor. Ataque multiplica os gols a favor por
`1 + treino`; defesa multiplica os gols sofridos por `1 − treino`; meio-campo
dá metade do valor para os dois lados. Vale no período simulado a seguir.

**Desenvolver** (`DEVELOP`): até 3 jogadores ainda não marcados na etapa. O
bônus entra inteiro na próxima atualização:

```
bônus = limitar(0,25 × (potencial − nível); 0,8; 2,2) × fator + |N(0; 0,25)|
fator: até 21 anos 1; até 25, 0,8; até 29, 0,5
acima de 29: sem bônus; se o período for de queda, a queda cai pela metade
```

No relatório, até 21 anos o ganho médio sobe de 2,81 para 4,74 (+1,93); de 22 a
25, de 1,98 para 3,19 (+1,21); de 26 a 29, a chance de o OVR subir vai de 69,0%
para 90,8%.

**Base** (`YOUTH`): cinco garotos por etapa, sorteados no começo dela e
guardados; repetir a ação escolhe outro entre os que sobraram.

| Faixa | Peso | OVR (sobre a âncora do clube) | Potencial (sobre a âncora) |
|---|---|---|---|
| Fraco | 25 | −22 a −16 | −12 a −6 |
| Mediano | 60 | −18 a −12 | −6 a +1 |
| Bom | 12 | −14 a −8 | +1 a +6 |
| Craque | 3 | −10 a −2 | +6 a +14 |

Idade de 16 a 19 anos, com `+1,2 × (idade − 17)` de OVR; potencial pelo menos
OVR + 2; OVR entre 40 e 85. A tela mostra só posição, idade, país (8% de
estrangeiros), característica (30% dos bons e craques, 6% dos outros), custo e
salário. A descrição ("Cru", "Regular", "Promissor", "Especial") aponta a faixa
vizinha em 30% das vezes. OVR e potencial aparecem depois de subir. Custo
`2% × U(0,6; 1,4)` do valor de um titular do clube (OVR da âncora, 26 anos),
pago do caixa; salário `máx(1.500; 25% × U(0,6; 1,2)` do salário do OVR da
âncora). Quem sobe chega como promessa, com satisfação 70, e conta como
revelado pelo treinador.

**Vestiário.** Conversar com até 3: às vezes, só de conversar o jogador já
melhora (satisfeito: +3; os outros: 50% de chance de +2 a +5). O que ele diz
depende do momento, na ordem: promessa ativa; quer sair (à venda, ou
satisfação abaixo de 32); quer minutos (estrela ou titular com menos de metade
dos jogos como titular em 4 disponíveis, ou rotação com menos de um quarto em
6); fase ruim (−1 ou pior); reserva sem estar satisfeito; saudade de casa
(estrangeiro de até 23 anos com satisfação abaixo de 58); tudo bem.

| O que ele diz | Respostas (chance; deu certo / não deu) |
|---|---|
| Quer minutos | prometer vaga (+12, promessa de titular em 60%); pedir paciência (60%; +5 / −4); ser franco (60%; −2 e aceita o banco / −10) |
| Quer sair | pôr à venda (+6); convencer (45%; +12 / −8); prometer minutos (+8, promessa de 6 jogos) |
| Promessa | garantir (+3); desfazer (−6; a promessa fica "desfeita": sai da lista e não conta nem como cumprida nem como quebrada) |
| Fase ruim | dar confiança (65%; fase +1 e +2 / −2); poupar (+2, fase +0,5) |
| Papel | explicar (60%; +4 e aceita o banco / −4); prometer minutos (+8, 6 jogos) |
| Saudade | ajudar com a família (+10, 20 mil do caixa); pedir paciência (60%; +5 / −4) |
| Tudo bem | elogiar (+4); desafiar (60%; fase +1 / −3) |

Reunião com o grupo: **apoiar** dá +4 a todos quando torcida ou diretoria está
abaixo de 50 (senão +2), e +2 a mais aos insatisfeitos; **cobrar** dá certo em
55% quando o momento é ruim (senão 35%): fase +0,5 aos titulares e +2 à
diretoria; dando errado, −4 de satisfação a todos.

**Pedir verba** (`FUNDS`): no máximo duas liberações por temporada. Não há
alvo: a folha mostra as chances e os valores do pedido (`fundsPreview`);
confirmar gasta a ação e sorteia a resposta, e cancelar antes não custa nada.

```
confiança = σ((diretoria − 55) / 8); saúde = σ((caixa / receita + 0,05) / 0,08)
repetição = 0,6 ^ pedidos anteriores na temporada
grande = 0,45 × confiança × saúde × repetição               → FUNDS.large (6%) da receita × repetição
pequena = mín(1 − grande; 0,55 × (0,5 + 0,5 × confiança) × (0,4 + 0,6 × saúde) × repetição) → FUNDS.small (2,5%) da receita × repetição
recusa = o resto
```

Metade das liberações grandes vem com condição, mostrada antes do aceite: o
objetivo sobe um degrau (evitar a queda ou fazer o possível para meio; meio
para parte de cima; parte de cima para título) e a posição exigida sobe 2.
Objetivo de título ou de acesso não recebe condição.

### 42.10 Eventos e decisões no meio do jogo

Um evento por etapa, sem gastar ação, sorteado ao ir para o evento
(`events.ts`). Em 38% das etapas (`STAGE_EVENTS.matchShare`) o evento é uma
decisão no meio de um jogo, que fica armada para a simulação; no resto, sai um
evento fora de campo pelo peso, entre os que se aplicam. Sem nenhum evento
fora de campo possível, a etapa tem decisão no jogo. O evento fora de campo é
resolvido antes de simular; a tela mostra a chance de cada opção ou "Sem
sorteio".

| Evento | Tipo | Quando (peso) | Opções |
|---|---|---|---|
| Titular insatisfeito | pedido | estrela ou titular insatisfeito (6) | prometer (+14, titular em 70%); aumento de 30% do salário (+10; o caixa paga 12 meses do aumento); firmeza (50%; +3 e grupo +2 / −10 e à venda) |
| Pedido para sair | pedido | insatisfeito com OVR 60 ou mais (5) | vender (preço `valor × U(0,95; 1,2)`, grupo +1); recusar (40%; +2 / −14 e grupo −2); prometer 6 jogos (+8) |
| Joia da base | oportunidade | até 20 anos com 5 ou mais de folga (5) | dar chance (+10, 5 jogos, torcida +2); elogiar em público (55%; torcida +3 e fase +1 / fase −1); paciência (−3, titulares +2) |
| Crise de lesões | crise | 3 lesionados ou mais (6) | departamento médico (2% da receita, recuperações 10 dias mais curtas); rodar o elenco (reservas +4, treino de meio) |
| Semana de clássico | clube | clássico por jogar (4) | inflamar (60%; treino de ataque e torcida +3 / fase −1 dos titulares); acalmar (treino de defesa, grupo +1) |
| Diretoria animada | oportunidade | diretoria 55 ou mais (3), senão (1) | aceitar 6% da receita na verba (diretoria −2); recusar (diretoria +3) |
| Patrocínio polêmico | oportunidade | sempre (3) | aceitar 5% da receita no caixa (torcida −4); recusar (torcida +3) |
| Protesto da torcida | crise | torcida abaixo de 38 (7) | conversar (55%; torcida +9 / −4); focar no trabalho (diretoria +2, torcida −3, treino de meio) |
| Vazamento | crise | 2 insatisfeitos ou mais (4) | caçar o culpado (50%; grupo +3 e diretoria +2 / grupo −5); unir (grupo +2, diretoria −2) |
| Veterano quer ajudar | clube | 31 anos ou mais sem Mentor e um jovem de até 21 (3) | aceitar (ganha Mentor, +6, jovens +3); focar nele (fase +1) |
| Proposta pelo reserva | oportunidade | rotação ou reserva com OVR 55 ou mais; a proposta vem do rival, quando houver (3) | vender (preço `valor × U(1,15; 1,45)`, torcida −5 se for o rival, senão −1); manter (+5 e promessa de não vendê-lo até o fim da temporada) |
| Pedido de aumento | pedido | fase +1 com 3 participações em gol (4) | aumento de 35% (+12; o caixa paga 12 meses do aumento); recusar (60%; −2 / −12 e fase −1) |
| Dor no treino | crise | estrela ou titular (2) | arriscar (50%; 6 dias fora / 32 dias); poupar (18 dias, +3) |
| Caixa no vermelho | crise | caixa negativo (7) | pôr o maior salário à venda (diretoria +4, ele −4); cortar 3% da receita da verba (diretoria +2) |
| Briga no vestiário | crise | um de 30 anos ou mais e um de até 22 (2) | apoiar o veterano (+6, jovens −6); apoiar os jovens (jovens +5, ele −8, promessa de 8 jogos para os jovens, `PROMISES.youthGames`); multar (60%; diretoria +2 e grupo +1 / grupo −3) |
| Pressão por resultados | clube | 5 jogos e pelo menos 4 posições abaixo da esperada (6) | blindar o grupo (grupo +3, torcida −2); cobrar (50%; fase +1 do grupo / grupo −3) |
| Boa fase | oportunidade | 5 jogos e pelo menos 2 posições acima da esperada (5) | comemorar (torcida +4, grupo +2); investir 4% da receita na verba (diretoria +2) |
| Excursão de pré-temporada | clube | primeira etapa sem jogos (3) | excursão (3% da receita no caixa; 70%, senão também fase −1 dos titulares); concentração (treino de meio) |

Números de satisfação sem alvo são do jogador do evento. Treino ganho por
evento soma ao treino da etapa (42.9).

**Decisão no jogo.** A etapa avisa antes de simular: "Um jogo desta etapa vai
pedir uma decisão sua." O evento armado dispara no primeiro jogo do treinador no
período cuja importância alcança a exigida pelo andamento; o último jogo do
período sempre dispara.

| Importância | Jogo |
|---|---|
| 5 | final |
| 4 | mata-mata decisivo |
| 3 | clássico |
| 2 | outro mata-mata, fase de grupos, ou liga depois da 8ª rodada contra um vizinho de até 2 posições |
| 1 | o resto |

Exigida: 5 até 30% dos jogos do período, 4 até 55%, 3 até 75%, 2 até 90%, 1
depois. O jogo pausa no primeiro minuto a partir dos 55' com no máximo um gol
de diferença (no agregado, se houver); senão, aos 70'.

| Situação | Opção | Gols a favor | Gols contra | Dá certo se |
|---|---|---|---|---|
| Perdendo | Tudo ao ataque | × 1,5 | × 1,4 | pelo menos empatar |
| Perdendo | Ajustar sem desespero | × 1,18 | × 1,05 | pelo menos empatar |
| Perdendo | Evitar o vexame | × 0,85 | × 0,75 | não piorar o placar |
| Empatando | Ir para cima | × 1,32 | × 1,25 | vencer |
| Empatando | Equilibrar | × 1,08 | × 0,95 | não perder |
| Empatando | Segurar o ponto | × 0,78 | × 0,68 | não perder |
| Ganhando | Fechar a casinha | × 0,75 | × 0,62 | manter a vitória |
| Ganhando | Buscar mais gols | × 1,22 | × 1,12 | manter a vitória |
| Ganhando | Administrar | × 0,95 | × 0,9 | manter a vitória |

Cada opção mostra o objetivo, a chance de dar certo e as chances exatas de
vitória, empate e derrota no fim, calculadas pelo próprio modelo: os gols
esperados de cada lado no resto do jogo (`λ × mín. restantes / 90`, pelo menos
5 minutos), com o elenco em campo naquele minuto e o multiplicador da opção,
numa grade de Poisson de 0 a 8 gols. A chance mostrada fica entre 3% e 97%. A
escolha vale até o fim do jogo; o que já aconteceu fica igual, e o resto usa um
fluxo de sorteio próprio da opção. Dar certo soma 1 à torcida (3 numa final).

### 42.11 Diretoria, torcida, elenco, objetivo, finanças e promessas

**Barras**, de 0 a 100, sempre à vista no placar do técnico, em palavra:

| Barra | 65 ou mais | 45 a 64 | 30 a 44 | abaixo de 30 |
|---|---|---|---|---|
| Diretoria | Confiante | Atenta | Impaciente | No limite |
| Torcida | Apaixonada | Exigente | Irritada | Revoltada |
| Elenco | Unido | Estável | Dividido | Rachado |

A barra do elenco é a média das satisfações (nunca a de um jogador); o número
inteiro de cada barra só vai para o leitor de tela. Diretoria começa em 60 e
torcida em 50 em cada clube novo. O placar também mostra caixa, verba e
reputação.

No fim de cada período, com `r = limitar((esperada − posição) / máx(2; n / 5); −1,5; 1,5)`:

- torcida `+ r × 3,5` no 1º turno do lento, `+ r × 5` no fim da temporada;
  ±2 por clássico ganho ou perdido;
- diretoria `+ r × 4` no 1º turno do lento;
- no fim da temporada: torcida +6 por título, +8 pelo acesso, −10 pela queda; a
  diretoria passa a valer a confiança da avaliação (42.13).

Mudanças abaixo de meio ponto não contam; as outras são arredondadas.

**Objetivo** (`objectiveFor`). A expectativa de cada clube na liga é
`força + 1,2 × (prestígio − 3)`, e a posição esperada é o posto dele nessa
ordem. A mesma colocação pode ser sucesso num clube e fracasso em outro.

| Divisão | Posição esperada | Objetivo | Cumpre com |
|---|---|---|---|
| 2ª | até as vagas de acesso | Subir de divisão | o acesso |
| 2ª | até 2 × vagas + 2 | Parte de cima | 2 × vagas + 2 ou melhor |
| 2ª | até n − 3 | Meio da tabela | metade de cima |
| 2ª | pior | Fazer o possível | n − 2 ou melhor |
| 1ª | 1º ou 2º | Brigar pelo título | 2º ou melhor |
| 1ª | até n / 4 | Parte de cima | máx(4; n / 4) ou melhor |
| 1ª | até 60% da tabela | Meio da tabela | metade de cima |
| 1ª | pior, com rebaixamento | Evitar a queda | n − vagas de queda ou melhor |
| 1ª | pior, sem rebaixamento | Fazer o possível | n − 3 ou melhor |

**Finanças** (`FINANCE`, euros, salário mensal):

```
receita inicial = 0,3 × valor do elenco × (1ª divisão 1; 2ª 0,8)
caixa inicial = receita × U(−0,08; 0,3), fixo por clube
por período: caixa += receita × fração − folha × 12 × fração
teto da folha = 70% da receita, por mês
verba da temporada = 0,4 × receita + 0,3 × máx(0; caixa − 0,2 × receita) + 0,5 × sobra da verba anterior
receita seguinte = (0,8 × receita + 0,2 × 0,3 × valor do elenco × divisão)
                   × 1,25 (acesso) × 0,8 (queda) × 1,05 (algum título), no mínimo 500 mil
```

Premiação no fim da temporada, em fração da receita: liga `0,6% × posições
acima do último` mais 12% ao campeão; título de copa nacional, copa da liga,
supercopa nacional ou Intercontinental 6%; título continental (inclusive a
supercopa continental) ou Mundial de Clubes 20%; acesso +25%; queda −5%
(`−20% × 0,25`).

Finanças na tela: **apertada** com caixa negativo ou folha anual de 65% da
receita ou mais; **saudável** com caixa de 15% da receita ou mais e folha anual
de até 50%; senão, **equilibrada**. No relatório, 222 de 226 clubes de segunda
divisão e 259 de 263 de primeira têm 3 alvos do próprio nível ao alcance da
verba e da folha logo no começo; os que não têm estão com a folha acima do
teto e precisam vender antes.

**Promessas.** Nascem de conversas e eventos e aparecem no Clube com o prazo.

| Promessa | Origem | Cobrança no prazo |
|---|---|---|
| Titular em uma parte dos jogos | conversa (60%, `PROMISES.startsShare`), Titular insatisfeito (70%) | titularidades sobre jogos disponíveis desde a promessa |
| Pelo menos N jogos | conversa (6, `PROMISES.minutesGames`), Pedido para sair (6), Joia da base (5) | jogos desde a promessa ≥ `mín(N; metade dos disponíveis)` |
| Não ser vendido | Proposta pelo reserva (manter) | ainda no clube no prazo; enquanto vale, aceitar uma venda dele é bloqueado |
| N jogos para os jovens | Briga no vestiário (apoiar os jovens, 8) | jogos somados dos jovens de até 21 anos do elenco desde a promessa ≥ N; os jovens do banco entram primeiro nas trocas |

- Prazo: fim do turno no 1º turno do lento; senão, fim da temporada. "Não
  ser vendido" vale sempre até o fim da temporada.
- Desfazer a promessa numa conversa (42.9) a deixa "desfeita": não conta na
  avaliação.
- Lesão suspende a cobrança: com menos de 3 jogos disponíveis desde a
  promessa, ela conta como cumprida.
- Cumprida (`PROMISES.kept`): +12 ao jogador e +0,5 a cada um do elenco
  (relação do elenco +2). Quebrada (`PROMISES.broken`): −22 ao jogador, −1 a
  cada um do elenco (relação −4) e −3 à diretoria.
- A ficha do jogo respeita as promessas: titularidade atrasada ganha a vaga do
  titular mais fraco da posição (custa força em campo nesses jogos); promessa
  de minutos entra primeiro nas trocas e no banco.
- Na avaliação, cada promessa da temporada vale ±0,2, limitado a ±0,6.

### 42.12 Metas de balanceamento e laboratório

`pnpm balance:tecnico` (`tools/balance/src/tecnico/`) mede o Técnico e grava o
relatório versionado `tools/balance/relatorios/tecnico.md`. As **sondas** fazem
contas exatas sobre o modelo, sem sorteio (`coach/probes.ts`, as mesmas do
laboratório). As **carreiras automáticas** jogam o mundo inteiro com uma
política fixa: equilibrada (treina, desenvolve, contrata ou sobe da base),
passiva (nenhuma ação) e gastadora (contrata em toda etapa). A rodada versionada
usa a semente `tecnico-m1`, 16 carreiras e 384 temporadas (8 equilibradas, 4
passivas, 4 gastadoras). `pnpm verify` roda a mesma rodada sem gravar
o arquivo (`balance:tecnico:check`). Metas em
`tools/balance/src/tecnico/targets.ts`: **23 de 23 atendidas**.

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

No relatório, uma temporada leva em média 1320 ms no rápido e 1851 ms no lento
(Node, trabalhadores em paralelo), e criar o mundo leva 190 ms.

**Laboratório** (`apps/game/src/screens/lab/areas/TecnicoArea.tsx` e
`apps/game/src/screens/lab/tecnico/*`), com os números de verdade do motor, em
dez seções:

| Seção | O que mostra |
|---|---|
| Elencos e fontes | de onde vem cada jogador, por país, divisão e clube |
| Sorteio das propostas iniciais | a fatia de segundas divisões em muitas carreiras e as propostas de uma semente |
| Simulador de partida | a conta exata de Poisson entre dois clubes, com os elencos trocados, e Europa contra América do Sul |
| Filosofias | pontos por jogo de cada filosofia por diferença de força |
| A conta da contratação | atratividade, expectativa, lacuna e cada fator, termo a termo, a faixa da tela e a curva do comprador |
| Desenvolver | o mesmo jogador com a mesma sorte, com e sem a marca, e rápido contra lento |
| Rendimento escondido | OVR, satisfação, fase e quanto o jogador rende |
| Eventos | o catálogo com o peso de cada evento no clube escolhido |
| Finanças e verba | receita, folha, teto, verba e alvos ao alcance de cada clube |
| Temporada simulada | o mundo inteiro jogo a jogo no navegador, com uma carreira automática (equilibrada ou passiva) |

**Testes**: motor em `packages/engine/test/coach/*` (ações, modelo, propostas,
promessas, temporada); a projeção em `apps/game/src/features/tecnico/view.test.ts`;
ponta a ponta em `apps/game/e2e/tecnico.spec.ts` (do hub ao legado, recarregar
encerra a carreira e abre o hub, sair pede confirmação, ritmo lento com ações
renovadas no 2º turno, a etapa cabe em 360 × 640).

### 42.13 Avaliação, demissão e reputação

**Avaliação anual** (`evaluateSeason`, números em `EVALUATION`):

```
s = objetivo + copas + finanças + promessas + torcida
objetivo = limitar((esperada − posição) / máx(2; n / 5); −2; 2) + (cumpriu ? 0,3 : −0,3)
           + 0,8 (acesso) − 1,2 (queda)
copas = mín(1,5; Σ peso da competição × valor da fase) × 0,4
peso: primária 1,5; secundária 1; terciária 0,7; copa 0,8; copa da liga 0,4; supercopa 0,25;
      supercopa continental 0,3; Intercontinental 0,8; Mundial 1,5
fase: campeão 1; final 0,6; semifinal 0,4; quartas 0,25; oitavas 0,12; grupos 0,05
finanças = −1 (caixa abaixo de −25% da receita), −0,6 (caixa negativo) ou +0,2 (saldo do período positivo);
           −0,3 se a folha anual passa de 70% da receita
promessas = limitar(0,2 × (cumpridas − quebradas); −0,6; 0,6)
torcida = (torcida − 50) / 100
C' = limitar(0,6 × C + 0,4 × s; −1,5; 1,5)      (C começa em 0,5 em cada clube novo)
confiança = limitar(arredondar(50 + 12 × s + 15 × C'); 0; 100)
demitido se confiança < 27
```

A tela mostra a confiança, explica o termo que mais pesou (objetivo, copas,
finanças, promessas, torcida ou histórico) e, sem demissão, o tom da diretoria: confia (`s ≥ 0,5`); paciência pelo
histórico (`s < 0` com crédito anterior acima de 0,2); aviso (`s < 0` sem esse
crédito); neutra. O clube que demite não oferece emprego por 3 temporadas
(`OFFERS.banSeasons`).

**Reputação** (`REPUTATION`), de 0 a 100, começa em 15:

```
Δ = 3,2 × limitar(s; −2; 2) + 4 por título grande + 2 por outro título
    + 3 (acesso) + 2 (livrou da queda) + 1 × mín(3; revelados com 10 jogos ou mais)
título grande: liga de qualquer divisão, primária continental, Mundial ou Intercontinental
Δ positivo × limitar(0,6 + (força − 60) / 40; 0,6; 1,4)
Δ limitado a ±12
```

Livrar da queda é cumprir o objetivo "Evitar a queda" sem cair.

**Propostas para a temporada seguinte** (`seasonOffers`, `OFFERS`):

- Mantido: o clube atual oferece renovação, mais 1 a 3 propostas (com
  reputação abaixo de 25, 40% de chance de uma a menos). Demitido: 2 a 4
  propostas, uma delas garantida de segunda divisão, de preferência em casa, e
  nunca menos de 2.
- A reputação aponta uma faixa de clubes pelo percentil de força no mundo:

```
alvo = limitar(0,15 + 0,008 × reputação + 0,2 × máx(0; melhor trabalho − clube atual) − 0,08 (demitido); 0,05; 0,98)
peso do clube = máx(0; 0,12 − |percentil − alvo|) × país
país: casa (país do clube atual ou do treinador) 1; fora 0,35 com reputação 35 ou mais, senão 0,1
```

"Melhor trabalho" é o percentil do maior clube em que o treinador cumpriu o
objetivo. Na última temporada não há propostas: só ver o legado. No relatório,
a política equilibrada termina com reputação 44, a passiva com 14 e a gastadora
com 22.

**Como ficou (D56):** crédito inicial 0,5, confiança `50 + 12s + 15C` e demissão
abaixo de 27 dão 11,5% de demissões por temporada com a política equilibrada,
dentro da meta de 8% a 15%.

### 42.14 Virada da temporada, mundo da IA, aposentadoria, legado e conquistas

**Fim da temporada**, numa ordem fixa e uma vez só, depois das promessas, da
satisfação, da evolução e das finanças do período: ligas fechadas, acesso e
queda, premiação, relações, avaliação, reputação, histórico e propostas. Depois
da decisão (ficar, assinar com outro clube, encerrar), as férias
(`rollover.ts`):

1. **Âncora** de cada clube: `âncora + 0,3 × (base − âncora) + sucesso + N(0; 0,6)`,
   limitada a ±10 da base; sucesso: título de liga +0,4, primária +0,6, acesso
   +0,5, queda −0,8 (`AI_MARKET.anchorDrift`).
2. **Receitas** da temporada seguinte (42.11).
3. **Aposentadorias** a partir dos 34 anos:
   `0,15 + 0,13 × (idade − 34) − 0,04 × longevidade`, pela metade com OVR 80
   ou mais, +0,25 sem clube; aos 41, todos param (`RETIREMENT`). Sem clube, em
   qualquer idade, `0,35 + 0,08 × máx(0; idade − 26)`, até 95%.
4. **Jovens da IA** (`AI_YOUTH`), pelo tamanho do elenco: 30 ou mais, nenhum;
   27 a 29, 0 ou 1; 24 a 26, 1 ou 2; menos, 2 ou 3. OVR
   `âncora − 14 + N(0; 4)` (+5 nos 3% de craques), entre 42 e 80; 17 ou 18 anos;
   88% do país do clube.
5. **Mercado da IA** (`AI_MARKET`): elenco acima de 32 corta os piores acima
   de 21 anos para os livres; abaixo de 24, completa com livres de até
   `âncora + 2` e até 35 anos; depois, até 2 reforços por clube para a vaga
   mais fraca do time, com jogadores de até 31 anos de clubes menores, de OVR
   entre o do titular mais fraco + 2 e `âncora + 5`, pela mesma curva de interesse do treinador
   (mínimo 15%), pagando o valor, se o caixa aguenta ficar até 20% da receita
   no negativo. O clube do treinador fica fora: as vendas e compras dele são
   só dele.
6. **Elenco viável** para todos: jovens até ter 18 jogadores e 2 goleiros.
7. **Força** refeita pelo elenco, papéis (no clube do treinador, no máximo um
   degrau de queda) e estatísticas da temporada zeradas.

Ficando no clube: objetivo novo, verba com metade da sobra, pedidos de verba
zerados, metade da previsibilidade e foco de leitura sorteado de novo. Mudando:
tudo de clube novo (42.3).

**Aposentadoria do treinador**: a partir do fim da primeira temporada, pelo
menu ou pela avaliação, nunca com um processo aberto, um evento sem escolha ou
uma decisão no jogo pendente. No meio de uma temporada, ela entra no histórico
como incompleta. Ao fim das 24 temporadas, a carreira termina completa.

**Legado** (`TecnicoLegacyScreen.tsx`): clubes, temporadas, títulos, acessos,
quedas, demissões e reputação final; sala de troféus; temporada a temporada;
jogadores marcantes (homens de confiança, revelados pela base, contratações);
momentos. "Este legado não é salvo. Ao sair desta tela, ele some."

**Conquistas** (19, `COACH_ACHIEVEMENTS`):

| Id (`tecnico:`) | Nome | Requisito |
|---|---|---|
| `firstSeason` | Primeira prancheta | terminar a primeira temporada |
| `fullCareer` | Vinte e quatro anos de banco | completar as 24 temporadas |
| `promotion` | Acesso | subir um clube |
| `twoPromotions` | Especialista em acesso | dois acessos |
| `rescue` | Bombeiro | livrar da queda um clube com esse objetivo |
| `firstTitle` | Primeira taça | primeiro título |
| `league` | Campeão nacional | liga de uma primeira divisão |
| `continental` | Rei do continente | principal torneio continental |
| `clubWorldCup` | Campeão do mundo | Mundial de Clubes |
| `underdogWorld` | Davi contra Golias | Mundial com clube de fora da Europa |
| `treble` | Tríplice coroa | liga da primeira divisão, copa nacional e primária na mesma temporada |
| `tenTitles` | Galeria cheia | 10 títulos |
| `fromBottom` | Do porão ao topo | subir com um clube e depois ganhar a primeira divisão com ele |
| `loyal` | Casa de verdade | 10 temporadas seguidas no mesmo clube |
| `abroad` | Passaporte carimbado | treinar um clube de outro país |
| `threeCountries` | Cidadão do mundo | clubes de três países |
| `revelations` | Fábrica de craques | 5 jogadores subidos da base que chegam a 30 jogos com o treinador |
| `comeback` | A volta por cima | ser demitido e depois ganhar um título |
| `reputation` | Lenda da prancheta | 90 de reputação |

### 42.15 Elencos e fontes de dados

O Técnico joga com elencos de verdade nos mesmos clubes e ligas do Craque
(`packages/world/data/squads/*.ts`, `@craque/world/squads`). A montagem é
offline e determinística (`pnpm elencos:montar`,
`packages/world/scripts/elencos/*.mjs`), por camadas, nesta ordem:

1. **EA FC 27**, só futebol masculino. O FC 27 decide o clube de cada jogador:
   quem aparece no FC em outro clube, mesmo numa liga fora do jogo, não entra
   por outra fonte.
2. **eFootball**, só em clube com menos de 20 jogadores do FC 27
   (`EF_THRESHOLD`) e só jogadores reais (`fake_version = 0`), com
   `OVR = carta base + 4` (`EF_BONUS`). Times com jogadores fictícios são
   descartados e listados no relatório (18 times).
3. **Conhecimento**: jogadores reais escritos à mão, com OVR estimado pela
   âncora do clube e pelo papel (destaque +3, titular 0, rotação −3, reserva
   −6, jovem −8, mais `U(−1,5; 1,5)`).
4. **Gerados**: o que faltar para 22 jogadores (`TARGET`) e para a composição
   mínima de 2 goleiros, 6 defensores, 6 meias e 3 atacantes, na escala dos
   reais da mesma liga. Na tela, ◆ "Fictício"; o nome sai do id e da nacionalidade, sempre o
   mesmo.

- **Calibração medida**: em 80 jogadores presentes nas duas fontes, o FC 27
  fica 4,5 abaixo da carta base do eFootball + 4 (mediana; média 4,8). O +4
  foi mantido como pedido.
- **Âncora da liga**: a força do clube no Craque mais o deslocamento medido na
  liga: a mediana, entre os clubes com 16 jogadores reais ou mais, da média
  dos 14 melhores menos a força do clube. Segunda divisão com menos de 5 clubes
  medidos usa a régua da primeira (a primeira precisa de 3).
- **Ajuste da 2ª** (`DIVISION_GAP = 2,5`): numa segunda divisão sem medida, o
  melhor clube completado fica 2,5 abaixo do primeiro quartil dos 14 melhores
  dos clubes medidos da primeira do país. Só sobe, e só vale para clubes sem
  jogadores reais suficientes.
- **Teto inicial**: no máximo 30 jogadores acima de 21 anos por clube; os
  cortados vão para os livres (10 no início).
- **Características iniciais** vêm dos números das fontes (velocidade, bola
  parada, cabeceio, impulsão, fôlego, estilos de jogo, posições, capitania).
  Gerados começam sem nenhuma; os do conhecimento, no máximo Versátil, pelas
  posições alternativas.

Resultado (`packages/world/data/squads/relatorio.md`): **12.609 jogadores em
489 clubes**: 8.415 do FC 27, 818 do eFootball, 133 do conhecimento e 3.243
gerados.

| Grupo | Jogadores reais |
|---|---|
| Primeiras divisões de ENG, ESP, FRA, GER e ITA; Championship, 2. Bundesliga e Ligue 2; MLS e Liga MX | 100% |
| Brasileirão (Série A) | 95% |
| LaLiga 2 | 95% |
| Serie B italiana | 85% |
| Brasileirão Série B | 16% |
| Primeiras divisões de ARG, CHI e COL | 99% a 100% |
| Primeiras divisões de BOL, ECU, PAR, PER, URU e VEN | 46% a 69% |
| Segundas divisões de COL, CHI e ARG | 37%, 15% e 1% |
| Segundas divisões de BOL, ECU, PAR, PER, URU e VEN | 0% |

**Limitação conhecida, dita com franqueza:** as segundas divisões
sul-americanas são quase todas geradas, e a Série B tem só 16% de jogadores
reais. Como o treinador sul-americano quase sempre começa numa segunda divisão
(42.3), boa parte das primeiras carreiras começa com elencos fictícios. A tela
avisa: ◆ na escolha do país (42.2), a fração gerada no cartão da proposta
(42.3) e ◆ "Fictício" em cada jogador gerado.

**Como ficou (D52):** a ordem de fontes foi definida pelo usuário. Jogador
fictício do eFootball não é jogador real, então não entra. O ajuste da 2ª
corrige o que o harness mostrou: com Ceará e Sport reais caindo numa Série B
gerada, o campeão fazia 100 pontos.
