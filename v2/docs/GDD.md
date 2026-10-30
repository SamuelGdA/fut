# Futeiros v2: Game Design Document

> **Estado atual D82 (21/10/2026).** Craque `2.0.0-m23`; Técnico `1.9.0`.
> Projeto ativo: `v2/`, React/Zustand/Vite. O resumo no início do
> [README](../README.md) orienta novas pessoas e IAs sobre os subsistemas atuais.
> Revisões D73 a D82 ao fim deste GDD especificam o calendário de decisões,
> progressão, probabilidades, produção e apresentação atuais, prevalecendo
> sobre descrições históricas anteriores do mesmo assunto. São 38 acontecimentos (D96),
> 55 cenas de partida (D91) e nenhum rival pessoal. As contas atuais de D80/D81 são
> preservadas na D82; somente o custo de respeitar o rival muda no motor.

> **Futeiros (D50 a D60).** Este documento especifica os dois jogos do hub.
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
> - 151 conquistas com abas por categoria: 22 recordes reais (D93, D105) gerados do catálogo e um título
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
- A última temporada jogável é a dos 40 anos (D109: a carreira de 2026 chega a 2050). Aos 41 a carreira termina.
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

**Histórico D45, substituído pelas D74/D79 nos eventos de final:** o Início é para começar. A carreira em andamento
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
| Países com liga jogável | 18 |
| Ligas | 34 (18 primeiras divisões, 16 segundas) |
| Clubes | 525 |
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
vantagem = limitar(OVR - força_atual, -3, 35)
suporte = limitar((76 - força_atual) / 16, 0, 1)
impacto = participação × (0,3 × mín(15, vantagem) + 0,06 × máx(0, vantagem - 15)
          + suporte × limitar((vantagem - 8) × 0,12, 0, 2))
participação = fração dos jogos do clube que o jogador disputou
```

Um craque 15 pontos acima de um clube que joga tudo vale +4,5 na parcela base.
Cada ponto adicional até 35 continua ajudando; participação integral limita
a base a +5,7 (D64); D81 acrescenta até +2 em elencos fracos conforme a fórmula acima. Permanência acrescenta investimento de até +0,35 por ano,
antes da reversão de 30% à força base.

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
OVR = limitar(OVR; 1; 99)
expoente = 0,185 × (min(OVR; 80) - 50) + 0,12 × max(0; OVR - 80)
fator_liga = 0,55 + 0,55 × limitar((força_média_da_divisão - 50) / 32; 0; 1)
teto_etário = piso(400.000.000 € × fator_de_idade / 1,35 / 500.000 €) × 500.000 €
base = min(teto_etário; 110.000 € × e^expoente × fator_de_idade × fator_liga)
valor = min(teto_etário; arredondar_3_algarismos(base × U(0,94; 1,06)))
fator_de_idade: ≤21 1,35; 22-24 1,2; 25-27 1,0; 28-29 0,85; 30 0,7;
                31 0,55; 32 0,42; 33 0,32; 34+ 0,22
```

Formatação por idioma: "€180M", "€12,5M" (pt/es) ou "€12.5M" (en), "€850 mil"
(pt), "€850K" (en, es).

No Craque m21, a curva desacelera acima de OVR 80 e considera a liga atual (D80).
O teto de até €400M cai com a idade (D72); a liga pode reduzir o valor abaixo dele.
Sem clube, a referência é neutra. Histórico, tela e condições de evento usam a base;
a função com oscilação continua disponível para simulações. O Técnico preserva
sua referência financeira própria, sem o multiplicador de liga.

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
vantagem(d) = d ≤ 10 ? d : 10 + 0,12 × (d - 10)
u = limitar((FIN - 80) / 19; 0; 1)
oportunidades = bônus_pos × u² × (3 - 2u)
λ_gols = (g_pos + oportunidades) × e^(0,032 × vantagem(OVR - oposição)) × e^(0,03 × vantagem(efetiva - oposição))
         × e^(0,035 × (FIN - OVR)) × fase
λ_ast  = a_pos × e^(0,045 × vantagem(OVR - oposição)) × e^(0,03 × vantagem(efetiva - oposição))
         × e^(0,035 × (PAS - OVR)) × fase
fase = LogNormal(0; 0,12)   (Artista 0,16)
gols ~ Poisson(λ_gols × jogos);  assistências ~ Poisson(λ_ast × jogos)
```

| Pos | g_pos | a_pos | bônus_pos |
|---|---|---|---|
| CA | 0,385 | 0,12 | 0 |
| PE / PD | 0,285 | 0,19 | 0,12 |
| MEI | 0,275 | 0,15 | 0,095 |
| ME / MD | 0,15 | 0,17 | 0,09 |
| MC | 0,07 | 0,11 | 0,055 |
| VOL | 0,035 | 0,06 | 0,012 |
| LE / LD | 0,035 | 0,09 | 0 |
| ZAG | 0,04 | 0,025 | 0 |
| GOL | 0 | 0,004 | 0 |

(Craque m14.) FIN até 80 preserva a taxa-base; acima disso a finalização
abre oportunidades adicionais gradualmente. A sorte e a pressão progressiva
dos recordes continuam atuando após essas taxas (ver D63 e D68).

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

**Como ficou, D90.** Goleiro perde 11 na nota da Bola de Ouro, ou 6 numa temporada
histórica (OVR 93+, 24+ jogos sem sofrer gol, continental principal ou Copa do
Mundo); se ganhar, leva o Troféu Yashin junto.

**Como ficou, D91.** Além do ajuste de posição da tabela, só a nota do jogador
perde `BALLON_POSITION`: MC 1,2, VOL 2, laterais 2,6, zagueiro 3,4
(atacante, ponta, meia e ME/MD 0; ver D92).

**Como ficou, D89.** A nota do jogador ganha um alívio a partir de 90 de OVR:
`+0,5 + 0,1 × (OVR - 90)`, até +1 (OVR 95). Só o jogador recebe.

### 13.3 Os demais prêmios

| Prêmio | Quem disputa | Regra |
|---|---|---|
| Troféu Yashin (antiga Luva de Ouro, D90) | goleiros | eleição entre os goleiros da elite, com nota por OVR, sucesso e jogos sem sofrer; cada goleiro da elite +8 (D90) |
| Chuteira de Ouro | só clubes da UEFA | gols de liga acima de um patamar sorteado N(30; 3,5), mínimo 24 |
| Artilheiro do campeonato | qualquer liga | gols de liga acima de N(0,55 × jogos_da_liga; 3), mínimo 8 |
| Troféu Kopa (era o Prêmio Revelação, D108) | até 21 anos | eleição contra a elite de até 21 anos do mundo, com a nota da Bola de Ouro (ver D108) |

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
- **Como ficou, D89.** Com nível 88 ou mais, a faixa desce até `nível - 9`
  (cada passo de alargamento também ganha 2 para baixo). Os seis clubes das
  últimas propostas pesam 0,3 contra 1 no sorteio dentro da região.

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

**Como ficou, D90:** Lenda exige `50 + 11p` pontos, 5 temporadas e 140 jogos; Ídolo `25 + 6p`, 2 temporadas e 70 jogos.

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

### 18.3 Catálogo (38 eventos desde a D96; eram 39 na D79)

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
| 16 | Racha no vestiário | 45 | sempre | tomar partido (arriscado) ou ficar neutro |
| 17 | Volta por cima | 50 | já jogou num clube onde foi Ídolo ou Lenda | voltar como estrela (titular garantido) ou ficar |
| 18 | Clube ou seleção | 20 | ano de torneio de seleção, jogador convocado | ir ao torneio (risco de lesão) ou ficar no clube (pula o torneio) |
| 19 | Lesão muscular | 100 | 20+ jogos | voltar antes (risco de recaída) ou recuperação completa (perde jogos) |
| 20 | Treinador novo | 55 | sempre | impressionar (papel sobe / desce) ou pedir para sair (oferta) |
| 21 | Semana de clássico | 60 | rival histórico, rotação ou superior e 12 jogos no ano anterior | provocar (55%: torcida +12; falha -10) ou respeitar o rival (torcida -2, sem sorteio; D82) |
| 22 | Despedida do ídolo | 40 | 5+ temporadas no clube | homenagear (torcida +, pressão +) ou discreto |
| 23 | Ultimato do empresário | 50 | idade 21-30 | forçar saída (clube maior, torcida -12) ou ficar (torcida +4, empresário rompe; ofertas só de clubes 2 pontos mais fracos na próxima decisão, se houver), D49 |
| 24 | Joia da base | 45 | idade ≥ 28 | apadrinhar (torcida +, evolução -) ou disputar |
| 25 | Contrato de chuteira | 35 | OVR ≥ 75 | chamativo (torcida +, pressão +) ou discreto |
| 26 | Podcast polêmico | 50 | idade ≥ 20 | falar tudo (torcida ±) ou recusar |
| 27 | Troca de empresário | 40 | idade 20-32 | trocar (nível de mercado +2 na próxima janela / ofertas piores) ou manter |
| 28 | Estádio lotado | 55 | sempre | jogar para a torcida (produção ×1,3 ou ×0,8) ou concentrado |
| 29 | Expulsão polêmica | 45 | Pavio curto ou 30+ jogos | recorrer (suspensão menor / maior) ou aceitar |
| 30 | Vaias | 45 | torcida < 35 | ficar e lutar (-L temporário) ou sair (oferta) |
| 31 | Bate-boca (técnico) | 16 | sempre | variante do técnico: papel desce |
| 32 | Bate-boca (diretoria) | 12 | sempre | variante da diretoria: vendido |
| 33 | Bate-boca (torcida) | 10 | torcida < 50 | variante da torcida: bloqueio do clube |
| 34 | Camisa de prestígio | 18 | há número de prestígio livre | escolher 1 de 3 números (pressão +) ou manter |
| 35 | Homenagem: escolha seu número | 12 | legado Ídolo ou Lenda no clube, uma vez por carreira | escolher 1 de até 5 números clássicos da posição (ou o dos sonhos) |
| 36 | Lesão grave | 26 | idade 20-34 | cirurgia agressiva (volta rápido, potencial -2 a -4) ou conservadora (perde mais tempo, potencial -1 a -2) |
| 37 | Uma nova seleção | 70 | cinco temporadas consecutivas no mesmo país estrangeiro, sem estreia por seleção e nível de convocação no país | aceitar (muda a nacionalidade) ou manter |
| 38 | O caderno do auxiliar | 45 | 12+ jogos anteriores | ensaiar (força +1 em copas, jogos -6%) ou ganhar ritmo (jogos +4%) |
| 39 | ~~Uma semana sem holofotes~~ | 0 | removido na D96 | |

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

151 conquistas (D105) em dez grupos: Carreira, Títulos, Prêmios, Seleção, Lealdade,
Estrada, Desafio, Curiosas, Recordes e Secretas. São 51 objetivos específicos,
22 recordes (D92, D105) e 79 competições. Recordes e títulos são gerados dos catálogos:
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
dos ajustes some. **D111:** o padrão volta a ser `real`; há escudo real para 518 dos 525
clubes e selo real para 31 das 34 ligas.

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

**D61:** sessões do Craque não são persistidas. `saveOf`/replay continuam existindo
para links e caminhos hipotéticos, sem escrever a carreira no localStorage. O
Técnico guarda somente a última carreira em andamento por setup/comandos; encerrar
apaga o registro. Esta regra substitui 34.1/34.2/34.4 quando falam em save de sessão.

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
- **PWA**: instalável; o hub e os modos já carregados funcionam offline;
  as imagens entram em cache conforme aparecem (D62).

**Como ficou no M8 (D36 a D38):**

- **Instalável** pelo `vite-plugin-pwa`: manifesto com nome, ícones (192, 512 e
  maskable), cor do tema e modo de aplicativo; ícone da Apple à parte.
- **Na instalação**, desde D62, entram somente casca/hub, estilos, fontes
  necessárias, ícones e páginas de erro: cerca de 1,2 MiB. O código de cada modo
  é guardado só depois de escolhê-lo. **Conforme aparecem**, escudos, troféus,
  federações, bandeiras, selos de liga e prêmios são lidos do cache na vez
  seguinte. Imagem que ainda não foi guardada, sem internet, troca na hora
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
| Bolas de Ouro, carreira de Fenômeno de ataque | média de 0,4 a 1,25, e de 20% a 45% ganham ao menos uma (D78, potencial relevante e OVRs altos mais raros) |
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

- Título da página, manifesto (`name` "Futeiros: futebol de escolhas",
  `short_name` "Futeiros"), tela de abertura ("Abrindo o Futeiros"), aviso sem
  JavaScript e páginas estáticas 404, 403, 500 e 503 dizem "Futeiros".
- A página não encontrada ("Bola fora") volta ao hub ("Voltar ao jogo").
- O painel de erro de uma tela usa `SCREEN_GAME`. No Técnico, a carreira em
  andamento é retomável pelo diário local; o Craque só mantém a sessão atual.
  Limpar dados e recarregar explicam o efeito para o modo aberto (D61/D62).
- Avisos de atualização do PWA seguem estas mesmas regras de sessão e retomada.

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
  `coachRng(semente, rótulo, ...partes)`. Versão `COACH_VERSION = 1.1.0`.
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
- **Nacionalidade**: só os 16 países com segunda divisão no jogo
  (`COACH_COUNTRIES`): ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER, ITA,
  PAR, PER, POR, URU e VEN (Portugal desde a D108). México e Estados Unidos
  ficam de fora, porque não têm segunda divisão. Os onze países com segunda
  divisão completada por jogadores gerados (ARG, BOL, BRA, CHI, COL, ECU, PAR,
  PER, POR, URU e VEN) levam a marca ◆ na escolha.
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
  decide em casa. Final em jogo único é em campo neutro; a Copa do Brasil
  também usa final única, pela referência de 2026 (D64).
- **Continentais**: com 32 ou mais classificados, chave de 32 (preliminar para
  o excedente, 8 grupos de 4, os dois primeiros às oitavas); de 16 a 31, chave
  de 16 (preliminar para o excedente, 4 grupos, quartas); com menos de 16,
  mata-mata direto. Grupos em turno e returno, potes por força. Mata-mata em
  ida e volta, final única e neutra.
- **Mundial de Clubes**: os campeões das primárias nas quatro temporadas
  anteriores, completados pelos mais fortes de cada confederação até a cota.
  São 32 clubes em oito grupos de quatro, incluindo nove representantes
  genéricos e um anfitrião norte-americano; passam dois por grupo às oitavas.
  Todos os jogos em campo neutro. Começando em 2026, uma carreira de 24 temporadas
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
| Fase ruim | dar confiança (65%; fase +1 e +2 / −2); poupar (75%; +2, fase +0,5 / −2, fase −0,5) |
| Papel | explicar (60%; +4 e aceita o banco / −4); prometer minutos (+8, 6 jogos) |
| Saudade | ajudar com a família (+10, 20 mil do caixa); pedir paciência (60%; +5 / −4) |
| Tudo bem | elogiar (75%; +4 / −2); desafiar (60%; fase +1 / −3) |

Reunião com o grupo: **apoiar** custa 2 de diretoria e dá +4 a todos quando torcida ou diretoria está
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
| Titular insatisfeito | pedido | estrela ou titular insatisfeito (6) | prometer (+14, titular em 70%); aumento de 30% do salário (+10; a folha mensal incorpora o aumento); firmeza (50%; +3 e grupo +2 / −10 e à venda) |
| Pedido para sair | pedido | insatisfeito com OVR 60 ou mais (5) | vender (preço `valor × U(0,95; 1,2)`, grupo +1); recusar (40%; +2 / −14 e grupo −2); prometer 6 jogos (+8) |
| Joia da base | oportunidade | até 20 anos com 5 ou mais de folga (5) | dar chance (+10, 5 jogos, torcida +2); elogiar em público (55%; torcida +3 e fase +1 / fase −1); paciência (−3, titulares +2) |
| Crise de lesões | crise | 3 lesionados ou mais (6) | departamento médico (2% da receita, recuperações 10 dias mais curtas); rodar (reservas +4, treino de meio, titulares −3) |
| Semana de clássico | clube | clássico por jogar (4) | inflamar (60%; treino de ataque e torcida +3 / fase −1 dos titulares); acalmar (treino de defesa, grupo +1, fase dos titulares −0,5) |
| Diretoria animada | oportunidade | diretoria 55 ou mais (3), senão (1) | aceitar 6% da receita na verba (diretoria −2); recusar (diretoria +3) |
| Protesto da torcida | crise | torcida abaixo de 38 (7) | conversar (55%; torcida +9 / −4); focar no trabalho (diretoria +2, torcida −3, treino de meio) |
| Vazamento | crise | 2 insatisfeitos ou mais (4) | caçar o culpado (50%; grupo +3 e diretoria +2 / grupo −5); unir (grupo +2, diretoria −2) |
| Veterano quer ajudar | clube | 31 anos ou mais sem Mentor e um jovem de até 21 (3) | aceitar (ganha Mentor, +6, jovens +3, fase −0,5); focar nele (fase +1, jovens −3) |
| Proposta pelo reserva | oportunidade | rotação ou reserva com OVR 55 ou mais; a proposta vem do rival, quando houver (3) | vender (preço `valor × U(1,15; 1,45)`, torcida −5 se for o rival, senão −1); manter (+5 e promessa de não vendê-lo até o fim da temporada) |
| Pedido de aumento | pedido | fase +1 com 3 participações em gol (4) | aumento de 35% (+12; a folha mensal incorpora o aumento); recusar (60%; −2 / −12 e fase −1) |
| Dor no treino | crise | estrela ou titular (2) | arriscar (50%; 6 dias fora / 32 dias); poupar (18 dias, +3) |
| Folha sob pressão | crise | folha ocupa 90% ou mais do limite (7) | listar o maior salário (diretoria +4, ele −4); renegociar −5% dos salários (diretoria +2, grupo −4) |
| Briga no vestiário | crise | um de 30 anos ou mais e um de até 22 (2) | apoiar o veterano (+6, jovens −6); apoiar os jovens (jovens +5, ele −8, promessa de 8 jogos para os jovens, `PROMISES.youthGames`); multar (60%; diretoria +2 e grupo +1 / grupo −3) |
| Pressão por resultados | clube | 5 jogos e pelo menos 4 posições abaixo da esperada (6) | blindar o grupo (grupo +3, torcida −2); cobrar (50%; fase +1 do grupo / grupo −3) |
| Boa fase | oportunidade | 5 jogos e pelo menos 2 posições acima da esperada (5) | comemorar (torcida +4, grupo +2, custo 1% da receita); investir 4% da receita na verba (diretoria +2, torcida −2) |
| Excursão de pré-temporada | clube | primeira etapa sem jogos (3) | excursão (3% da receita na verba; 70%, senão também fase −1 dos titulares); concentração (treino de meio, custo 1% da receita) |

O catálogo D61 acrescenta 13 cenas (total 30, além das decisões em campo):
voz do capitão, plano para reservas, ponte com a base, ritmo de treino,
laboratório de bola parada, treino aberto, estratégia na imprensa, sala de vídeo,
agenda do veterano, responsabilidade da estrela, integração do elenco,
política de rodízio e pressão sobre o jovem. Pré-condições, participantes e
contrapontos ficam no catálogo puro `packages/engine/src/coach/events.ts`; os
textos completos existem nos três idiomas. As três cenas recentes são evitadas
quando há outra elegível. Patrocínio de apostas foi retirado. Custos de qualquer
cena usam a verba e o comando é recusado se a opção exceder o saldo disponível.

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
| Empatando | Equilibrar | × 1,08 | × 1,05 | não perder |
| Empatando | Segurar o ponto | × 0,78 | × 0,68 | não perder |
| Ganhando | Fechar a casinha | × 0,75 | × 0,62 | manter a vitória |
| Ganhando | Buscar mais gols | × 1,22 | × 1,12 | manter a vitória |
| Ganhando | Administrar | × 0,95 | × 0,9 | manter a vitória |

Cada opção mostra o objetivo, pressão ofensiva e exposição defensiva em glifos,
com uma alternativa em foco e confirmação (D60). As chances exatas ficam no
motor/laboratório: os gols
esperados de cada lado no resto do jogo (`λ × mín. restantes / 90`, pelo menos
5 minutos), com o elenco em campo naquele minuto e o multiplicador da opção,
numa grade de Poisson de 0 a 8 gols. A estimativa da meta fica entre 3% e 97%. A
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
verba da temporada = 0,4 × receita + 0,5 × sobra da verba anterior
receita seguinte = (0,8 × receita + 0,2 × 0,3 × valor do elenco × divisão)
                   × 1,25 (acesso) × 0,8 (queda) × 1,05 (algum título), no mínimo 500 mil
```

Premiação no fim da temporada, em fração da receita: liga `0,6% × posições
acima do último` mais 12% ao campeão; título de copa nacional, copa da liga,
supercopa nacional ou Intercontinental 6%; título continental (inclusive a
supercopa continental) ou Mundial de Clubes 20%; acesso +25%; queda −5%
(`−20% × 0,25`).

Finanças na tela (D61): somente **Verba para contratações**, **Folha mensal** e
**Situação**. Saudável até 70% do limite mensal, apertada a partir de 90%; equilibrada
entre os dois. Compra verifica orçamento e folha, sem carteira paralela de caixa.
Caixa ainda existe na contabilidade interna da IA, mas não entra na situação,
na avaliação financeira, no pedido de verba ou no orçamento do treinador.
Aumento muda a folha real; custos de eventos respeitam o orçamento, sem gerar dívida.

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
`tools/balance/src/tecnico/targets.ts`: **23 de 23 atendidas** no motor 1.2.0:
demissões 12,0%, objetivos 45,3% contra 33,3% da política passiva. O relatório
versionado registra D60; a tabela abaixo preserva a rodada histórica D58 (motor 1.0.0).

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
demitido se confiança < 18 e objetivo não cumprido (D60)
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

Resultado (`packages/world/data/squads/relatorio.md`): **13.496 jogadores em
525 clubes**: 8.899 do FC 27, 818 do eFootball, 133 do conhecimento e 3.646
gerados (D108: com Portugal).

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


### 42.16 Central executiva e decisões visuais (D59)

**Como ficou.** A central usa temas, fontes e glifos do Craque com cartões executivos.
O laço mantém o botão de avanço visível e a etapa cabe de 360 × 640 ao PC; exploração,
eventos extensos e relatórios usam rolagem interna. Resultados têm placar com contagem
animada e seções retráteis. Consulta rápida por botão nos titulares/reservas/elenco:
hover de 300 ms e click no PC, bottom sheet no toque. Consulta e troca são comandos
separados. A ficha usa somente `PlayerRow`, respeitando 42.8; nada oculto é exposto.

Escolhas separam recompensa, custo e cenário adverso; estimativas vêm do motor. No jogo,
barra segmentada de vitória/empate/derrota, objetivo e multiplicadores de gols. A
resolução usa Motion (Framer Motion via `motion/react`) em evento, conversa e reunião;
fica no layout até avançar, sem temporizador que bloqueie a ação. Resultado de jogo
mostra escolha e placar real da partida. Teclado, leitor de tela e movimento reduzido.

Finanças mostram barras: azul para compras já pagas no clube/ano e dourado para os alvos, sem duplicar o livro da etapa já relatada; investimento estimado vs verba restante na busca; preço
negociado vs verba, folha projetada vs teto mensal (70% receita / 12), saída de caixa vs
capacidade até piso (−25% receita) antes de aceitar. A projeção fica fixa durante a rolagem dos alvos. Excedente vermelho com valor;
bloqueios por caixa/folha/inscrição/promessa não são confundidos com falta de verba.
Saldo após venda continua explícito. Laboratório usa os mesmos componentes para
mostrar excesso de orçamento e os dois resultados possíveis do descanso.

`COACH_VERSION 1.1.0`, constantes em `DECISION_TRADEOFFS`: rodar na crise custa 3 de
satisfação dos titulares; acalmar custa 0,5 de fase dos titulares; aceitar o mentor
custa 0,5 de fase do veterano, focar nele custa 3 de satisfação dos jovens. Comemorar e
concentração custam 1% da receita anual, arredondada como os demais eventos. Investir
na boa fase custa 2 de torcida; apoiar o grupo custa 2 de diretoria. Descanso e elogio
nas conversas têm 75% de sucesso; falha do descanso tira 0,5 de fase e 2 de satisfação,
falha do elogio tira 2 de satisfação. Equilibrar no empate é ×1,08 a favor e ×1,05 contra,
eliminando a melhoria gratuita de ambos os lados. Benefícios dos cenários favoráveis
continuam os de 42.9/42.10. Promessas e oportunidade de receita perdida são custos
válidos. Não há mudanças nas regras do Craque.

A auditoria D59 também corrigiu o contraste do contador ×N da vitrine do Craque:
texto com o token semântico on-accent, adaptado aos dois temas.

### 42.17 Prancheta e decisões sem rolagem (D60)

**Como ficou.** Dois painéis no PC, foco de tela inteiro para decisões. Cabeçalho
único: objetivo, liga/posição ordinal, relações e reputação com i. Finanças/promessas
ficam na aba Clube; dicas distinguem orçamento, saldo, teto salarial e receita.
Resultados usam campanha gráfica e cards de jogadores consultáveis. Arrasto via
HTML Drag and Drop e Pointer Events, com destino indicado e confirmação pelo próprio
soltar, usa setTactics e os mesmos limites de disponibilidade. Toque/teclado preservados.

Decisões mantêm todas as alternativas visíveis e uma prévia em foco, com confirmar.
Nenhum painel da decisão rola de 360 × 640 ao PC. Narrativa extensa vai para o i.
Partidas mostram pressão/exposição em glifos, objetivo do plano e contexto real do
jogo; probabilidades e multiplicadores ficam só no laboratório. Eventos comuns
agrupam risco em menor (chance >=70%), incerto (>=45%), difícil (<45%); sem sorteio,
troca explícita. Resolução animada preservada. Avançar numa etapa com evento de jogo
armado simula diretamente até a decisão, sem a espera vazia anterior. Próximos jogos
parciais removidos. Catálogo sem sponsor nem conteúdo de apostas nos três idiomas.

**Motor 1.2.0.** Relações por partida: expectativa 0,65 − 0,30 × colocação esperada /
tamanho da liga. Resultado vale 1/0,4/0 para vitória/empate/derrota; a diferença
contra expectativa multiplica 1,2 na diretoria e 1,8 na torcida, mais ±0,6 nos
clássicos para torcida. Limita 0..100 e registra deltas no diário; remove ajuste
agregado de resultados e clássicos no fim, preserva títulos/acesso/queda.
Demissão anual: objetivo não cumprido e confiança <18. Meta equilibrada 3..12%.
No primeiro turno lento: pelo menos 12 jogos, pontos/jogo <=0,65, déficit de posição
>=max(6, teto(0,35 × tamanho da liga)), diretoria <58. Reputação −4. Histórico parcial,
propostas na avaliação, resto do mundo termina com IA antes da próxima temporada,
sem atribuir jogos/títulos posteriores ao treinador dispensado. Valores em
LIVE_RELATIONS e EVALUATION. Demais regras do Craque preservadas.

### 42.18 Consultas, economia e sessões por modo (D61)

As decisões usam altura natural e todas as alternativas cabem no palco, sem rolagem
em 360 × 640. A ficha por nome apresenta somente dados públicos. Grupos só são
consultáveis se os efeitos do evento identificarem integrantes reais; `eventTargets`
é compartilhada pela interface e resolução. Consultas usam hover 300 ms no desktop,
folha rápida no toque; grupos listam nome/OVR/idade. Estrela amarela indica característica.

Formações: 3-4-3, 3-5-2, 4-4-2, 4-3-3, 4-2-3-1, 4-1-4-1, 5-3-2, 5-4-1, em duas
filas de quatro. Laterais ligeiramente adiantados, trios centrais alinhados e extremos
atrás do centroavante. Titular → reserva e reserva → titular são trocas diretas por
arrasto. Modal de mercado separa cabeçalho/filtros, lista rolável e rodapé opaco.
Nome da base disponível antes de promover; a promoção abre o Elenco e a ficha.

Treze novos eventos contextuais; cenas das três etapas anteriores ficam fora do sorteio
quando há alternativa elegível. Acordos têm meta/progresso/prazo e são acompanhados
no Clube pela mesma função que os avalia (`promiseProgress`). O guia animado ao lado
da marca organiza ciclo, todos os traços, dinheiro e compromissos em quatro abas.

Craque: +1 de OVR por reconhecimento, teto conjunto +3 anual, aplicado após evolução
natural. Cada título conta uma vez; coroas identificam cada competição; globais
não duplicam as coroas; acesso exige jogos. Sorteio de talento Normal 26/33/23/12/6%;
Difícil normaliza os antigos pesos e aplica −2/−1/+1/+1/+1 pontos percentuais.
Empréstimo se mantém até retorno/transferência/compra explícita. Curva inclui o OVR
inicial e marca primeiro/pico/último. Prêmios identificam torneio e ficam separados
 dos troféus. Linha do tempo rotula Legado, independente da barra atual da torcida.
Conquista de final da Copa do Mundo excluída; registro antigo também é descartado.

Sessões: Craque só em memória; Técnico retoma a última não encerrada por replay local.
Nenhum elenco, calendário ou estado de simulação é serializado. Debug e laboratório
apenas no build de desenvolvimento; testes não produzem conquistas/retomada normal.
Animações não têm ajuste no site; respeitam acessibilidade do sistema. Vibração
opt-in, desligada por padrão, exposta só a ponteiro de toque.

**Calibragem D61 do Craque.** O bônus solicitado permanece integral e limitado a
+3 por temporada. Para conter a bola de neve sem alterar as metas: sensibilidade
dos gols ao nível 0,044 → 0,035, cauda da vantagem acima de dez pontos 0,30 → 0,12,
concorrência agregada da elite na Bola de Ouro 3,3 → 7, desconto do mercado por
ano acima de 32 anos 1,5 → 1,8. O nível ainda melhora a produção monotonamente;
prêmios continuam sem teto de quantidade. Missões são recalibradas pelo
percentil 65 fixo, não pela alteração das faixas de aprovação dos testes.

**Auditoria de conquistas D61.** A conquista de disputar final de Copa foi
removida. A genérica `worldChampion` duplicava `title:world-cup` e também saiu;
permanece a conquista específica com nome e taça. Marcos progressivos, como
90/95 OVR ou uma/cinco Bolas de Ouro, têm metas diferentes e permanecem.


A revisão final D61 inclui consultas de nomes nos relatórios de evolução, lesões,
compromissos e momentos; rolagem mais suave durante arrasto por toque. Cenários
internos preservam o registro normal mesmo ao abandonar o teste. No resumo de
cenário, replays de compartilhamento e “E se...?” ficam ocultos porque o perfil
alterado não vem das decisões da semente original; o pôster continua disponível.
Os imports de laboratório/debug são guardados diretamente por `import.meta.env.DEV`
para que seus módulos não sejam emitidos na distribuição de produção.

Na vitrine do resumo (D61), títulos/prêmios separados preservam as legendas no
celular mesmo em coleções grandes: tipo e torneio ocupam linhas distintas, e a
página pode crescer. O modo compacto de vitrine continua nos painéis do jogo.


## 43. Carregamento por modo e retirada da v1 (D62)

Como ficou: substitui o pré-carregamento global da D43 e o cache integral do GDD 37.
A abertura no hub não importa telas dos modos, elencos nem laboratório. Somente
peças necessárias à casca/hub e dados pequenos compartilhados são carregados.
Posições e atributos da carta usam submódulos, sem importar o barrel do motor.
Entrar em um modo antecipa seus próprios caminhos, sequencialmente; trocar/sair
cancela os próximos itens. Debug carrega somente o controle escolhido ao abrir.

O precache inicial é calculado pelo grafo estático da casca, hub, Motion e registro
PWA, com CSS, fontes usadas no hub, ícones e erros. Não inclui grafos dos jogos.
Após escolher o jogo, seu manifesto de assets é lido e guardado no cache de código
em lotes de quatro. O SW serve módulos/fontes guardados por CacheFirst; o manifesto
usa NetworkFirst para não reaproveitar hashes obsoletos. Offline: início e modos
já carregados funcionam; um modo nunca aberto exige rede. As imagens são guardadas
conforme aparecem, ou por Guardar todas (escudos, taças, bandeiras, selos e prêmios).

Só v2 permanece como implementação; a raiz é um conjunto de atalhos. Arquivos da
v1, Next/Turbo e suas dependências saem, preservando o histórico Git e uma cópia
externa dos fontes locais. O protótipo experimental manager sem uso, exports ou
dados também sai do engine ativo, com cópia externa. Nenhuma regra/RNG/versão dos
motores Craque/Técnico muda com esta revisão.

Validação D62: verify completo sem exclusões (679 testes, types, lint, 51 metas
do Craque, 23 do Técnico e build). Navegador: 75 aprovados e 7 pulados por
dispositivo; inclui ausência dos arquivos do modo não escolhido e reload offline
dos dois modos. Hub e controles de teste também conferidos em desenvolvimento.

## 44. Elenco, mercado, reconhecimentos e legado (D63)

Como ficou: Craque `2.0.0-m10`, Técnico `1.4.0`. Substitui as regras históricas
de lesão, propostas, negociações, prêmios e legado nas seções 42 e D61.

- Escalação sugerida por atribuição ótima: maximiza soma de OVR, uma pessoa por
  vaga, apenas posições declaradas. Vaga sem candidato fica vazia, sem improviso.
  Substituições automáticas também usam posições declaradas. Lesão bloqueia
  titularidade; recuperação ocorre entre etapas. Risco 0,0025 por 90 minutos,
  modificador etário preservado; 75% um turno, 25% dois turnos. O rápido contém
  um bloco anual. Meta do harness: 0,3 a 2,5 lesões por temporada.
- Base: posições vizinhas com chance 42% de uma secundária, mais 18% de uma
  segunda entre quem já recebeu a primeira. Sem defesa diretamente no ataque,
  nem goleiro de linha. Traços só quando úteis nas posições; ocultos na seleção.
- Processos de compra/venda sobrevivem até a troca de etapa. Reabrir consulta
  as mesmas respostas e condições, sem custo. Busca nova é uma nova ação na
  confirmação. Condições de dinheiro e elenco são revalidadas no aceite.
  Ofertas espontâneas: 48% após relatório, um a três alvos, comprador real
  elegível, preço 95% a 130% do valor. Aceite/recusa sem ação, sem duplicação.
- Virada: um a três novos jogadores no clube comandado, 65% base/35% reforço
  encontrado pela diretoria; notificação com nomes. Aposentadorias continuam
  por idade/nível/longevidade, com registro de auge preservado. Renovação
  preserva todos que não aposentaram; não gera novamente os titulares.
- Relações: passo por partida 0,35 diretoria/0,5 torcida. Campanha contra
  esperado soma variação maior no fim, 22% dela no primeiro turno. Reputação
  anual até 10, porScore 2,2, título maior 3/menor 1, acesso 2, salvamento 0,5,
  revelação 0,4; superar expectativa em elenco abaixo de 78 pode acrescentar 2.
  Propostas externas são três quando mantido: uma do país atual; percentil
  alvo 0,15 + 0,0088 × reputação, teto 0,98, faixa 0,07. Demissão mantém
  saída modesta. Objetivos de copas saem da força no conjunto de participantes.
- Ídolo: quatro temporadas, 120 jogos, três anos desde chegada, auge ao menos
  força do clube menos dois, nota no auge 6,8; produção mínima por posição.
- Intercontinental usa seis campeões da temporada, com ramo Ásia/África/Oceania,
  Américas, Challenger, final europeia. Mundial: 32, oito grupos de quatro,
  três rodadas, dois avançam, oitavas/final; quatro anos. Nove representantes
  de CAF/AFC/OFC e vaga do anfitrião completam os 22 das confederações com dados.
- Estatísticas por competição de todos os clubes alimentam os prêmios anuais.
  Artilheiro por gols, desempate assistências/id; craque por nota, produção,
  participação e sucesso. Mundial por nota/produção/títulos/nível, mínimo 15
  jogos. Treinador da liga por campanha relativa e títulos, continental A pelo
  título, mundial pelo melhor trabalho no mundo. Só o prêmio ganho pelo jogador
  gera +1 OVR, até três por temporada; treinador não dá bônus ao elenco inteiro.
  Não há MVP de continental B/C. Resultados exibem o reconhecimento e OVR real.
- Legado: números incluem copas, vitrine de troféus/prêmios, nomes completos e
  retrato do auge preservado após aposentadoria/venda, linha do tempo por ano,
  exportação de pôster 1080 × 1350 com arte compartilhada e aparência de lousa.
- Craque: o OVR de cada ano permanece histórico; a carta é da idade atual.
  A influência imediata máxima sobe de 3,3 para 4,1 pontos; investimento na
  força persistente 0,006 × participação × diferença até 35, até 0,21/ano,
  sujeito à reversão já existente. Não garante títulos nem iguala clube/jogador.

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


## 45. Qualidade, classificação e legado compartilhado (D64)


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

A referência de classificação dos 18 países, fontes e simplificações fica em
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


## Revisão D73: decisões de jogos-chave e novos capítulos do Craque (18/10/2026)

Craque `2.0.0-m17`. Exclusivo do Modo Craque; Técnico permanece `1.9.0`.
Esta revisão substitui as regras históricas dos mesmos assuntos.

- **Ritmo:** até cinco decisões por temporada, contando a escolha habitual de clube/evento/treino. A segunda temporada do ritmo Normal também pode ter seus próprios momentos. O período guarda somente contexto reconstruído por replay; a idade e o histórico avançam ao concluir a temporada, nunca por lance. O save continua contendo setup e escolhas. Saves m16 são incompatíveis com m17.
- **Jogos-chave:** uma a três decisões nas temporadas elegíveis, limitadas pelo espaço das cinco decisões. Exigem pelo menos 12 jogos na temporada anterior, previsão de pelo menos 12 jogos e papel de rotação/titular/craque, sem suspensão de meia temporada ou mais. Selecionam somente competições realmente disputadas e fases alcançadas na projeção sem a escolha: quartas, semifinal ou final; há também jogo decisivo de liga. Sem oportunidades elegíveis, nenhuma partida é inventada. No máximo um momento por competição e três por ano. Oito situações: pênalti, disputa de pênaltis, cara a cara, falta, último ataque, contra-ataque, saída do goleiro e interceptação. Goleiros defendem pênaltis; cobranças de desempate não contam como gols pessoais. Esquerda e direita têm a mesma chance, sorteio exclusivo `drama`.
- **Risco e recompensa:** arrojada privilegia atributo de finalização/defesa/reflexo (conforme posição), coletiva usa passe e segura usa físico. Chance base: arrojada 48%, pênalti 71%, desempate 71% (goleiro 32%), coletiva 68%, segura 86%; somar 0,4 ponto percentual por atributo acima de 70 e subtrair 0,6 ponto por ano depois de 31, com limite de 15–95% antes da proteção de recordes. O sucesso arrojado rende torcida +3 e legado +2; coletivo +2/+1; falha -2 de torcida. Seguro preserva apoio e reduz o risco de lesão em 5% por escolha, somente naquele ano, sem bônus individual; a equipe vence com 42%, sujeito à pressão do recorde em finais. O placar parte de 1×1 e termina em 2×1 ou 1×2; desempate mantém 1×1 com 5×4 ou 4×5 nos pênaltis. Liga altera dois pontos a favor do vencedor e tira um do perdedor em relação à projeção de empate. Mata-mata muda somente o torneio exibido, para campeão/vice na final, finalista/eliminado na semi e semifinalista/eliminado nas quartas. Os resultados alimentam memória, classificação e força dos clubes. Gols e assistências entram na linha da competição antes da pressão de recordes e da premiação. O motor de mundo continua condensado, sem pretensão de representar uma tabela completa de partidas minuto a minuto.
- **Atmosfera:** variáveis `--match-bg-gradient`, `--match-accent`, `--match-glow`; Champions azul noturno, competições CONMEBOL âmbar e ouro, seleções com cores do uniforme e ouro no Mundial/prata no continental, liga com identidade do clube. Desde a D83, cada competição tem um pacote de transmissão próprio (revisão D83 ao fim deste documento). Card de leitura escuro padronizado nos dois temas, placar, adversários, competição, fase e minuto. Escolhas novas resolvidas com um clique; teclado e anúncio do resultado preservados. Animações desligadas eliminam a transição. Resultado permanece até a próxima escolha e é consultável no histórico/resumo.
- **Promessa:** primeira oportunidade a partir dos 18 anos, garantida para quem continuar até esse ponto. Depois, chance anual 4%, intervalo mínimo cinco anos, máximo três na carreira. Humilde exige `max(5; arredondar(65% dos jogos anteriores))`; recompensa torcida +2 e capacidade +0,1, sem punição. Protagonista exige `max(10; teto(1,2 × gols+assistências anteriores))` no ataque ou `max(8; teto(1,2 × jogos sem sofrer anteriores))` em posições defensivas/GOL: torcida +5, legado +3, capacidade +0,3; falha -3 de torcida. Lenda exige artilharia de uma competição, título continental principal ou Bola de Ouro: torcida +9, legado +8, capacidade +0,5; falha -7 de torcida. Os bônus de capacidade não equivalem necessariamente a um ponto inteiro de OVR, que continua derivado dos atributos. Selos e números exatos no lance e no resumo. A torcida representa a reação pública; não foi criada uma segunda barra de moral.
- **Nêmesis:** um jogador real persistente quando OVR ≥75 e 12 jogos na temporada anterior. Catálogo compacto derivado da elite e dos clubes da base local, sem carregar o elenco inteiro do Técnico. MC/VOL compartilham grupo, assim como PD/PE/ME/MD; demais posições conservam seus grupos. Candidatos ativos, clube diferente e OVR projetado até 12 pontos de distância; sorteio entre os cinco mais próximos. Nunca substitui o nome escolhido nem mantém aposentados concorrendo. Se o jogador chegar ao clube do rival, este se transfere para outro clube do país na projeção fictícia. O nível e a produção seguem a mesma projeção usada pela votação anual; não são estatísticas reais futuras. Comparativo: gols + 0,5×assistências, ou jogos sem sofrer + 0,5×assistências para defesa/GOL. Superar o rival no comparativo anual rende torcida +2 e legado +2; empate não premia. Um encontro real contra seu clube/seleção destaca o nome no card.
- **Reinvenção:** escolha única ao entrar na temporada dos 30 anos, com seis caminhos permanentes. Maestro: coletiva +8 pontos percentuais e sem penalidade etária, jogos -5%. Capitão: mata-mata +4 pontos percentuais, força +0,7 nas copas/continentais e queda anual básica de torcida limitada a 3, sem bônus técnico. Letal: ações individuais de linha +10 pontos percentuais, jogos -14%. Para GOL, o caminho se chama Especialista em pênaltis e dá +10 pontos percentuais nas defesas de desempate, com o mesmo custo de jogos. Guardião: defesa/GOL +7 pontos percentuais e chance de lesão ×0,7, produção ×0,92. Motor incansável: arrancadas +8 pontos percentuais, jogos ×1,06, lesões ×1,3. Mentor: legado +2 por ano com 12 jogos, crescimento ×0,8 e produção ×0,96. Os caminhos não removem o declínio natural nem dão bônus sem concessão.
- **Eventos adicionais:** treino aberto no bairro (torcida +4/crescimento ×0,94 ou torcida -2/crescimento ×1,04); caderno do auxiliar (força +1 em copas e jogos ×0,94 ou jogos ×1,04); semana sem holofotes (torcida -3/lesões ×0,8 ou torcida +3/crescimento ×0,95). Usam o catálogo e a agenda existentes, uma vez por carreira, nos três idiomas.
- **Gestão de Carga:** retirado somente o chip de aumento de risco no resultado. Prévia da decisão permanece informativa. `playAll` mantém jogos ×1,08, produção ×1,08 e chance de lesão ×1,6 durante o período da escolha, sem acumular em anos posteriores. A lesão efetiva continua aparecendo com tipo e jogos perdidos. Risco +60% é multiplicador relativo, não chance absoluta de 60%; a quantidade perdida continua entre 5% e 22% dos jogos planejados.

Referências de direção visual: [identidade UEFA 2024](https://www.uefa.com/news-media/news/0290-1badd36e73b2-c3e5755b7fae-1000--uefa-unveils-new-uefa-champions-league-brand-identity/), [azul, estrelas e acentos UEFA](https://www.uefa.com/news-media/news/0246-0e98e0d8f237-fe23dece0335-1000--uefa-champions-league-unveils-refreshed-brand-identity/) e [manual CONMEBOL](https://www.conmebol.com/wp-content/uploads/documents/manual-de-marca-conmebol-libertadores-espanol.pdf). Referência de elite por posição: [FIFPRO World 11 de 2025](https://www.fifpro.org/en/articles/2025/11/who-is-in-the-2025-fifpro-men-s-world-11); nomes, clubes e projeções adicionais reaproveitam os dados locais documentados. As cores da seleção vêm dos uniformes do próprio catálogo.

**Calibragem D73 do ritmo:** a meta histórica de 9–15 decisões no ritmo Normal passa a medir as decisões de planejamento (clube, evento e treino), preservando a faixa. O relatório também exibe todas as escolhas, incluindo jogos-chave, promessa e veterano, com média total de até 65. A meta conjunta mantém 51 verificações; os limites individuais de cinco decisões/ano e três partidas/ano são verificados no lote dedicado `pnpm balance:craque:momentos`. A mudança de medição é necessária porque o pedido acrescenta decisões dentro da temporada, sem acrescentar janelas ou treinos burocráticos.

**Amostra do Desafio D73:** os bônus e os resultados das novas decisões exigem recalibrar os alvos de missão, preservando o percentil 65 e os limites de 15–55%, inclusive os alvos fixos de uma lenda/dois ídolos. A taxa estatística de quebra de `noBigFive` passa a considerar somente origens fora dessas ligas: a base obrigatória do próprio país já impõe a quebra às demais, que não medem uma escolha evitável. Os limites de aprovação continuam em 10–75%; não se mudou a regra do édito no jogo.

**Mata-mata D73:** avançar uma fase reposiciona os dois participantes. Quem perde as quartas ou a semifinal não pode reaparecer na final nem como campeão na projeção restante. A regressão cobre inclusive o favorito que antes estava em primeiro no torneio.

**Amostra de término D73:** o `verify` usa as mesmas 300 carreiras por grupo do relatório completo, em vez de 100. Os limites permanecem: menos da metade chega aos 40, pelo menos metade termina entre 33 e 38, até 5% termina antes dos 30. O lote completo mediu, em Intensa/Normal, 38%/48,3% aos 40 e 52%/51,3% entre 33 e 38. A amostra reduzida havia medido 38%/51% e 47%/49%; ampliar a amostra preserva as metas e evita ajustar o mercado por essa oscilação. Nenhuma penalidade etária foi alterada.

**Estatísticas D73:** partidas interativas com gol sofrido reduzem o máximo possível de jogos sem sofrer gol naquela competição; os gols sofridos totais também respeitam o placar conhecido. A regressão impede, por exemplo, quatro jogos sem sofrer em quatro partidas quando uma delas terminou 2×1. Disputas de pênaltis continuam fora dos gols pessoais.

**Comparativo anual D73:** os 12 jogos são requisito para o surgimento do nêmesis, não para vencer um duelo anual. Toda pontuação superior à do rival ativo rende torcida +2 e legado +2, inclusive numa temporada curta. O teste cobre explicitamente esse caso. O texto do Capitão esclarece que o limite de queda de torcida se aplica à reação anual básica; cobranças de promessa e de lances continuam separadas.

**Paleta das seleções D73:** a confederação de uma seleção não ativa a atmosfera de clubes. Copa América e Euro usam o uniforme nacional com prata; Mundial usa o mesmo uniforme com ouro. Azul estrelado fica exclusivo dos clubes europeus. Há regressão unitária para UEFA e CONMEBOL e conferência da distinção nas quatro atmosferas da jornada.

**Validação D73 (18/10/2026).** Verificação geral `pnpm verify` aprovada. As correções finais foram reconferidas com tipos, lint, testes completos e os cenários afetados: 975 testes unitários aprovados (incluindo 165 da interface), 27 cenários Windows, build padrão e suíte completa do navegador com 123 aprovados e nove pulos previstos por dispositivo. A conferência visual cobriu PC e 360 × 640 nos dois temas, seis escolhas inteiras, resultado imediato, superfícies de leitura e quatro atmosferas; axe e teclado passaram. Os novos testes distinguem explicitamente seleção de clube dentro de UEFA/CONMEBOL.

O lote de 6.000 carreiras por amostra passou nas 51 metas do Craque, sem alterar os limites de aprovação. A medição isolada do mundo foi de 1,31 ms por temporada, abaixo dos 3 ms exigidos; a execução concorrente com Chrome e recordes havia medido 4,58 ms. O Técnico manteve motor 1.9.0 e passou nas 23 metas em 384 temporadas. O Desafio foi recalibrado com 3.000 carreiras, preservando o percentil 65. A auditoria adicional de 144 carreiras concluiu 2.929 temporadas, 3.053 jogos-chave, 219 promessas (57 cumpridas), 102 carreiras com nêmesis e 272 anos superando o rival. Todos os seis caminhos de veterano apareceram; teto anual, estatísticas, resultados e amostras de replay passaram.

Os relatórios versionados registram também a limitação da amostra de recordes: nas 2.250 carreiras, 18 das 21 referências foram observadas. Gols pela seleção chegaram a 140/146, Chuteiras de Ouro a 5/6 e Premier League a 12/13; nenhuma dessas três marcas foi forçada para fabricar uma ocorrência. O lote comprova os resultados observados e não garante a ocorrência de todo evento raro. Nenhuma publicação, commit ou envio ao GitHub foi realizado.


## Revisão D74: ritmo dentro da temporada e leitura dos resultados (19/10/2026)

Craque `2.0.0-m18`; Técnico continua `1.9.0`. Esta revisão prevalece sobre D73 nos pontos abaixo; replays m17 não retomam no motor m18.

- Até cinco escolhas anuais continuam contando as decisões existentes. O plano de momentos inclui progresso anual, transição lateral e resultado visual na própria decisão, antes da seguinte. O resultado permanece por três segundos, com botão Continuar para antecipar o avanço. As porcentagens dos jogos não aparecem. Seleção fica por último, depois de todos os momentos de clube.
- Chances usam OVR e atributo do lance. Bases D74: 48% para ação arrojada, 68% para coletiva, 86% para preservar a posição, 71% no pênalti/desempate de um jogador de linha e 32% para defender pênalti. Soma: base + 0,2 ponto percentual por OVR acima de 70 + 0,3 ponto por atributo acima de 70, além dos modificadores de idade e reinvenção já documentados; limites de 15–95%, antes da pressão de recordes em finais. Os 21 contextos de partida distinguem finalização, passe, defesa de goleiro, desarme e proteção. Um desarme não vira gol pessoal; passe decisivo dá assistência.
- Promessa somente para rotação, titular ou craque no clube atual. Reservas, sem espaço e terceiro goleiro também ficam fora dos eventos de exposição pública (fama, torcida, liderança, homenagem e finais) e da semana de imprensa. Primeira promessa adiada até existir espaço no time. As três metas usam gols+assistências, ou jogos sem sofrer para defesa/GOL: primeira `max(10; piso(60% da produção anterior / 10) × 10)`, depois +10 e +20. São sempre múltiplos de dez. Recompensas e punições de cada nível conservam os valores D73; o resumo não exibe bônus zero.
- Reinvenção só aparece a partir dos 30 e depois que o OVR derivado já diminui ao avançar um ano de idade mantendo o mesmo jogador. Não é um evento automático de aniversário. Os seis caminhos conservam os efeitos distintos de D73.
- Não há janela com uma única opção de ficar: o vínculo continua automaticamente. Uma proposta externa deve aparecer em até três temporadas, inclusive no segundo ano do ritmo Normal; a oportunidade tem prioridade sobre evento/treino. A vaga de um acontecimento agendado fica pendente até haver uma decisão livre e um evento elegível, sem ser apagada pela oferta. Os clubes bloqueados e o teto de restrição do empresário continuam respeitados. Aposentadoria por ausência de mercado continua possível. Sem interessados, a margem de renovação do clube é nível de mercado +3 antes dos 38 e +2 a partir dos 38, além do bônus de lealdade de até +3.
- O foco aplica +2 imediatamente, antes dos lances do mesmo ano, sem reaplicar na simulação. O piso antes+2 é protegido durante o período; evolução natural positiva pode somar. A garantia de foco pode ultrapassar o antigo bônus acumulado de +8 para compensar declínio; o atributo continua limitado a 99. Só se oferece um foco cujo atributo esteja no máximo em 97, para permitir os dois pontos prometidos. Eventos comuns conservam seu limite de treino e não apagam treino já acima dele.
- Removido o evento Dor antes da final, incluindo suas opções de sacrifício/poupar e textos. Catálogo: 41 eventos.
- O resumo numérico perde a lista de detalhes por ano. O jornal passa a ter duas folhas por temporada: capa existente e uma folha de bastidores com momentos importantes, promessa, rival e caminho escolhido. O auge empatado usa gols para atacantes, assistências para meias e jogos sem sofrer para defesa/GOL; persistindo empate, gols+assistências.
- Placar vetorial de pontos luminosos inspirado na referência fornecida, com texto acessível equivalente. Resultado usa o bloco HTML/CSS especificado na D76; movimento reduzido preserva a leitura estática. Troféus e legendas respeitam as células; pilhas grandes têm expansão gradual no fluxo. O laboratório acompanha as peças novas.

Referências de implementação: [movimento reduzido, MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) e [transições de saída, Motion](https://motion.dev/docs/react-animate-presence).

**Políticas de partida D74:** jogadores automáticos não consultam as probabilidades ocultas. Ambicioso assume a jogada; fiel procura o coletivo e, a partir dos 33, preserva o físico; equilibrado divide as escolhas entre assumir e passar (50% cada). Nas cobranças com duas direções, sorteia o lado. A política fiel conserva o clube quando tem ao menos 12 jogos e papel de rotação, titular ou craque; a existência de uma proposta obrigatória não obriga essa política a trocar. Esta mudança corrige a vantagem de informação dos lotes, sem alterar as chances de uma escolha humana.

**Amostra do Desafio D74:** a calibragem e as tentativas passam a incluir os três estilos não aleatórios, equilibrado, ambicioso e fiel, com o mesmo peso. Cada posição é cruzada com os três estilos, sem prender uma posição a uma política; as origens continuam em rodízio. A oferta obrigatória tornou a migração mais frequente, e uma amostra só de dois estilos deixava de representar quem prefere conservar o clube. Nenhuma política consulta missão ou édito. O percentil 65, as faixas de 15–55% das missões e 10–75% de quebra dos éditos permanecem iguais.

**Empréstimos no estilo fiel D74:** ficar enquanto joga não significa recusar minutos quando perdeu espaço. A política automática fiel também considera empréstimos se a última temporada terminou como reserva, sem espaço ou terceiro goleiro; o vínculo com o dono permanece. Com participação regular, continua no clube. Essa correção elimina uma recusa automática incoerente na amostra, preservando as regras e os limites de aprovação do desafio.

**Validação D74 (19/10/2026).** Verificação geral `pnpm verify` aprovada. Após os últimos ajustes nas políticas e a recalibragem, tipos, lint, os 987 testes unitários, os 27 cenários Windows e o build foram reconferidos e aprovados. O lote completo de evolução usou 6.000 carreiras por amostra e o conjunto passou nas 51 metas do Craque, sem relaxar os limites. O mundo foi medido em 0,98 ms por temporada, abaixo dos 3 ms exigidos. Técnico 1.9.0 preservado, com as 23 metas aprovadas em 16 carreiras e 384 temporadas.

O Desafio foi recalibrado com 3.000 carreiras, 600 por faixa, cruzando os três estilos com posições e origens. A conferência separada aprovou a cobertura das 37 missões, as 162 células com amostra suficiente e os dez éditos, com a tolerância estatística já existente. A auditoria adicional de 144 carreiras concluiu 2.856 temporadas, 3.026 jogos-chave, 202 promessas (44 cumpridas), 99 carreiras com nêmesis e 286 anos vencendo o duelo. Os seis caminhos de veterano apareceram. Ofertas em até três anos, ausência de janela sem alternativa, treino imediato, limites anuais, seleção por último, estatísticas e replay passaram.

Os recordes foram conferidos em 3.150 carreiras de Fenômenos: 150 por posição, sete posições e três políticas. Vinte das 21 referências apareceram; gols pela seleção chegaram a 138 contra a referência 146, sem ocorrência neste lote. Cada linha do relatório considera apenas as posições elegíveis para aquela marca. Nenhum resultado raro foi imposto para fabricar uma ocorrência. Os relatórios versionados registram a amostra e os limites da evidência. Alterações mantidas localmente, sem publicação, commit ou envio ao GitHub.

**Navegador final D74:** suíte completa repetida no build final, com 141 cenários aprovados e nove pulos previstos por dispositivo, sem falhas. Inclui PC e 360 × 640 nos dois temas, teclado e acessibilidade, avanço automático na mesma temporada, transições com animações ativadas/desativadas, lances por posição, placar LED, taça contida, duas folhas do jornal, legendas completas e pilha com pelo menos nove troféus, abrindo gradualmente e terminando sem sobreposição. Conferência visual das telas e resultados realizada com as imagens da execução final.

## Revisão D76: resultado de decisão integrado à interface (19/10/2026)

Como ficou: esta revisão substitui integralmente a apresentação de resultado D74/D75. As cenas procedurais, o motor Canvas, seus componentes, arquivos de cena, texturas, estilos, traduções, replay visual, testes e ateliê foram removidos. Placar LED e assets originais de troféus continuam sendo usados. Craque permanece `2.0.0-m18`, Técnico `1.9.0`; sorteios, efeitos e replays de carreira não mudaram.

- A escolha confirmada permanece marcada e bloqueada acima do resultado, com seu nome e um check. As outras opções saem para manter a leitura inteira em 360 × 640, sem rolar o laço ou permitir uma segunda escolha.
- Resultado em HTML/CSS usando as superfícies, tipografia, bordas e ícones do jogo. Entrada por opacidade e deslocamento vertical de 6 px em 200 ms. Sucesso usa borda esmeralda e brilho interno discreto; título usa ouro. Falha usa vermelho/âmbar e um deslocamento horizontal de apenas 2 px em 150 ms, exclusivamente no bloco, após a entrada.
- Selos distinguem gol, cobrança convertida, passe, defesa, antecipação, proteção de espaço e falha. O texto continua descrevendo o resultado real do motor; acertar sua ação não significa necessariamente vencer a partida. Nenhuma chance numérica é exposta.
- O placar do cabeçalho mostra o resultado definitivo. Quando os gols mudam, recebe uma microtransição de opacidade/escala de 200 ms. Pênaltis permanecem separados do placar e dos gols pessoais, explicitados no texto final.
- Final vencida mostra somente `TrophyArt`, o mesmo asset usado no restante do jogo, com escala de 94% a 100% e opacidade em 200 ms. Não existe desenho procedural de taça, campo, jogador ou bola no resultado.
- O resultado fica na mesma decisão/ano por 3.400 ms visíveis e avança no fluxo já existente; `Continuar` permite seguir antes. Ocultar a aba pausa a contagem. Há foco acessível no título do resultado e controles por teclado. As micro-interações são desligadas pela redução de movimento dos Ajustes ou do sistema.
- Textos em PT/EN/ES. O laboratório usa os mesmos componentes, com sucesso/falha, posições e finais para conferir escolha, selos, placar e asset de taça. O servidor de testes exclusivo do antigo ateliê foi retirado; a jornada é validada no build de produção.

**Validação D76 (19/10/2026).** `pnpm verify` aprovado: tipos, lint, 988 testes unitários (167 da interface), 27 cenários Windows, 51 metas do Craque, 23 metas do Técnico e build. Tipos da interface e lint reconferidos após o ajuste final do laboratório. `pnpm e2e` completo aprovado: 157 cenários passaram e nove foram ignorados conforme as condições previstas por dispositivo, sem falhas. Inclui `animacoes.spec.ts`, `aparencia.spec.ts`, `acessibilidade.spec.ts` e `jornada.spec.ts`.

Os 16 cenários D76 cobrem escolha marcada e bloqueada, resultado abaixo da escolha, gol/título, passe, falha, placar definitivo, tempos das micro-interações, asset original de taça contido, teclado, contraste e movimento reduzido pelo jogo/sistema. Conferência visual em PC e 360 × 640 nos dois temas. As regressões D73/D74 continuam verificando posições, atmosferas, continuidade e avanço automático na mesma temporada. Auditoria de fontes e build sem referências ao motor visual removido. Documentação e laboratório atualizados; temporários removidos.

## Revisão D77: ritmo das decisões e jornal aberto (19/10/2026)

Como ficou: esta revisão substitui os tempos, o enquadramento e a navegação de jornal descritos nas D74/D76. Craque permanece `2.0.0-m18` e Técnico `1.9.0`; não há novo sorteio, efeito ou alteração de replay.

- A área de decisão de partida tem respiro interno de 16 px no PC e 12 px no celular compacto, com separação entre cabeçalho, texto e opções. Em janelas baixas, a fase aparece na faixa do minuto, evitando repeti-la em uma linha adicional do cabeçalho. As opções continuam inteiras.
- O resultado entra em 420 ms por opacidade, deslocamento de 12 px e escala de 98,5% a 100%. Selo, título e descrição entram em sequência com atrasos de 80, 140 e 210 ms, cada um em 360 ms. A falha mantém o tremor discreto de 150 ms depois da entrada. Sem Canvas ou ilustrações procedurais de lance.
- Após 2.700 ms visíveis, o card atual é puxado para a esquerda e o seguinte entra pela direita, percorrendo uma largura inteira em 560 ms com aceleração/desaceleração suave. As duas superfícies se movem juntas; a que sai fica inerte e oculta para leitores de tela. O título novo recebe o foco que estava no card anterior, preservando foco no histórico ou nos menus. O aviso do canto aparece imediatamente ao resolver a escolha, com o mesmo resultado, e mantém a identidade durante o avanço para não reaparecer atrasado. No celular ele flutua sobre o cabeçalho apenas durante a revelação, sem empurrar o card; no desktop continua na coluna da direita.
- O placar mantém o LED existente. Apenas os dígitos alterados rolam: o número anterior sobe em 480 ms e o novo entra de baixo em 620 ms. Os dígitos que não mudaram ficam parados. A preferência Animações dos Ajustes governa também o resultado e o LED, em acordo com a D69: desligar mantém tudo estático; ligar anima mesmo se o sistema pedir redução de movimento. Isso substitui a exceção de sistema da D76, para não desligar a apresentação sem o jogador escolher. O botão Continuar usa o componente de botão secundário do Design System, com tipografia e ícone originais.
- O jornal mostra duas páginas simultâneas da mesma temporada: capa à esquerda e decisões à direita. Cada seta ou arrasto passa uma temporada inteira. A folha gira pela dobra central, com frente e verso; a fila de viradas continua funcionando. Quando não houve partida, promessa ou escolha nova de reinvenção, a segunda página é papel em branco, sem texto, reservado à imagem futura. O caminho de veterano mantido nos anos seguintes e um comparativo anual de rival não criam uma página extra sozinhos.
- As páginas permanecem lado a lado também no celular, com tipografia e colunas adaptadas à largura. A dobra, os escudos e os conteúdos ficam contidos nas folhas. Controles, teclado, PT/EN/ES e a preferência de movimento reduzido do jogo são preservados. Laboratório usa os componentes atualizados, com altura própria para a prévia do fluxo.

**Validação D77 (19/10/2026).** `pnpm verify` aprovado: tipos, lint, 988 testes unitários, 27 cenários Windows, 51 metas do Craque, 23 metas do Técnico e build. Após os ajustes de foco e encaixe do escudo, os tipos da interface, lint e os 167 testes da interface foram reconferidos e aprovados. A suíte completa final `pnpm e2e` passou com 163 cenários aprovados e nove pulos previstos por dispositivo, sem falhas; inclui animações, aparência, acessibilidade, Desafio e jornadas completas dos dois jogos.

Mais 24 cenários D74/D77 passaram após o acabamento final das superfícies da transição, mantendo o relatório completo. Cobrem PC e 360 × 640, dois temas, respiro e três opções inteiras, resultado e dígitos em movimento medidos quadro a quadro, arrasto automático entre 2 e 3 segundos, aviso imediato sem deslocar o cabeçalho, preferência do jogo prevalecendo sobre o sistema, duas páginas do mesmo ano, folha vazia, dobra com frente/verso, teclado, contraste e escudo contido. Revisão visual das imagens finais realizada.

A revisão identificou e corrigiu cortes nas telas baixas e o foco retido no card anterior. Os testes agora consultam o card ativo durante a saída do anterior, sem enfraquecer as verificações de navegação ou acessibilidade. Nenhuma mudança nova de regra ou sorteio. Temporários removidos; documentação e laboratório atualizados.


## Como ficou, D78 (20/10/2026): progressão e períodos rápidos

Craque m19 substitui m18; Técnico permanece 1.9.0. Aplicam-se as regras da revisão D78 do README.

**Seções 10 e 40, evolução.** Reconhecimentos contam até três por ano, mas somam capacidade fracionária: `0,55 × reconhecimentos × clamp((P + 2 − nível total) / 5, 0, 1)`, após evolução natural, declínio, treino/garantia e restituição de capacidade temporária. Retorno máximo de 1,65 de capacidade, menor nos cinco pontos finais até P + 2, zero acima disso. Não há mais garantia de +1 OVR por título nem +3 OVR anuais por reconhecimentos. OVR continua função dos atributos; o foco ainda garante +2 no atributo escolhido. A meta de Bola de Ouro do Fenômeno de ataque passa a média 0,4–1,25 e participação 20–45%, pois as referências anteriores pressupunham muitos anos próximos de 99. As demais 50 metas não mudam. Medir distribuição de picos por faixa e ritmo no laço real, além do simulador de evolução, e conservar a raridade/possibilidade dos recordes.

**Seções 14 e 22, calendário e revelação.** O ritmo Normal tem até uma partida por temporada e duas no período. Intensa conserva até três por ano e cinco decisões totais. Ordenação: outros jogos, finais domésticas, finais continentais, seleções. Sorteio escolhe entre 48 cenas elegíveis por posição/fase, preferindo não reutilizar as dos dois anos anteriores nem da fila atual. As 27 novas cenas cobrem reação e saída de goleiro, cobertura e bola aérea, apoio e circulação, cruzamento e finalização; ações de cobertura continuam defensivas e não rendem assistência. Texto de cada opção corresponde ao lance; não mostrar chance numérica. Resultado permanece 2.100 ms visíveis antes do deslocamento de 560 ms, com pausa fora da aba e avanço manual disponível.

**Promessa e ritmo rápido.** Prazo inclusivo `year` a `throughYear`, número de temporadas restantes do período. Só oferecer a promessa rápida no início dele. Base = `max(10 × temporadas, floor(produção anterior × temporadas × 0,6 / 10) × 10)`; níveis seguintes somam 10 e 20. Métrica é a soma dos gols e assistências de clube, ou jogos sem sofrer para defensores/goleiros. O relatório surge uma única vez no último ano, somando registros anteriores do intervalo e temporada atual. Prêmios/torcida são aplicados somente nessa liquidação. A simulação só completa um ano após terminar sua fila: antes da partida do segundo, o primeiro está integralmente disponível; o segundo permanece ausente do histórico. Se só houver partida no primeiro, revela ambos após ela; se só houver no segundo, o primeiro vem antes; sem partidas, ambos direto. A apresentação retém o card anterior somente durante a leitura e libera a faixa do resultado no celular ao avançar.

**Seções 24 e 28, reinvenção e hipotético.** Reinvenção com ícones e benefício em chip mais custo curto, mantendo mecânicas e descrição acessível. Hipotético com título em fonte de leitura, primeira escolha principal de cada ano, excluindo match/promise/veteran. Conservar os índices reais na lista e todas as escolhas nos checkpoints para ramificar sem deslocamentos.

**Conquistas de entrada D78.** O teste de frequência passa a cruzar dez posições, quatro estilos e doze origens, com 480 carreiras e dificuldade distribuída entre essas combinações. Antes, o rodízio simultâneo prendia o estilo equilibrado ao Difícil e associava origens a estilos. A primeira taça continua incluindo ligas menores e divisões de acesso: uma carreira de OVR modesto também pode ser campeã. A referência dessa conquista de entrada passa de menos de 85% para menos de 90% ao longo da carreira inteira; as demais conservam menos de 75%. Um teste separado exige uma carreira campeã com pico abaixo de 80. Isso preserva recompensa em clubes menores sem inflar a capacidade nem tornar obrigatória uma carreira de elite. Não altera elegibilidade, quantidade de títulos, sorteios ou as 51 metas do motor.

**Acabamento do fluxo D78.** No celular, o cabeçalho das partidas fica compacto quando há um resumo de temporada ou de acontecimento acima, preservando as três opções e o botão do resultado. O resumo anterior permanece durante a revelação, sem antecipar o ano seguinte nem deslocar o placar. A reinvenção usa a área da decisão para os seis cards; o aviso da escolha anterior flutua no cabeçalho e seu resultado continua disponível no histórico. A região de status também anuncia ganhos e consequências de escolhas que ainda não fecharam uma temporada. Descrições antigas da reinvenção foram removidas das traduções; os seis pares de benefício/custo são conferidos nos três idiomas, incluindo a especialização do goleiro em disputas de pênaltis.


**Validação D78 (20/10/2026).** `pnpm verify` integral aprovado: tipos, lint, testes unitários, 27 cenários Windows, 51 metas do Craque, 23 do Técnico e build. Após o acabamento final, tipos de todo o workspace, lint e os **170 testes da interface** foram reconferidos e aprovados; o conjunto atual soma 998 testes unitários. `pnpm e2e` completo no build final: **187 cenários aprovados e nove pulos previstos por dispositivo**, sem falhas, 196 no total. Inclui PC e 360 × 640 nos dois temas, teclado, contraste e leitor de tela, animações ligadas/desligadas, avanços, resumo hipotético e jogos dos dois modos. Os testes de uso offline também passaram no celular e no PC.

A revisão das imagens encontrou e corrigiu cortes no goleiro veterano e no resultado de final com texto mais longo. As verificações agora medem se todos os cards e o botão do resultado cabem na janela, além da ausência de rolagem da página. Conferem também que a faixa do primeiro ano permanece durante a resposta da segunda partida e que o cabeçalho não muda de posição. O teste offline fecha o aviso pelo botão real antes de usar o menu, sem forçar clique através dele.

**Balanceamento D78.** Lote completo de 6.000 carreiras por amostra aprovado nas 51 metas; verificação geral mediu o mundo em 1,16 ms por temporada, abaixo de 3 ms. Desafio recalibrado com 3.000 carreiras, 600 por faixa, mantendo percentil 65 e critérios de cobertura. Auditoria do laço real: 144 carreiras, 2.846 temporadas, 2.424 jogos-chave, 173 promessas (42 cumpridas), 91 carreiras com nêmesis e os seis caminhos de veterano. Limites, ordem, prazo agregado e replay passaram.

A distribuição de OVR foi medida em 1.200 carreiras, com comparação nas mesmas 400 sementes do m18: nenhuma Estrela chegou a 99 no lote ampliado; Fenômenos chegaram a 99 em 8,3% no anual e 9,2% no rápido. São frequências amostrais, sem bloqueio artificial por faixa. Relatório e procedimento em `tools/balance/relatorios/progressao-real.md`.

Os recordes foram conferidos em 3.150 carreiras de Fenômenos: **19 das 21 referências observadas**. Gols pela seleção chegaram a 139 para a referência 146; Bolas de Ouro chegaram a sete para a referência oito, sem ocorrência dessas duas marcas neste lote. Ausência amostral não demonstra impossibilidade. Nenhum resultado raro foi imposto para preencher o relatório. Os relatórios versionados registram a amostra e seus limites. Temporários removidos; alterações locais, sem publicação, commit ou envio ao GitHub.


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
- Debug de desenvolvimento inclui “Forçar decisão”, com os títulos das nove decisões gerais, 39 acontecimentos e 53 lances (55 desde a D91). Monta somente a sessão marcada como teste, sem gravar escolha especial em replay, liberar conquistas ou alimentar o ranking. O fluxo normal não consulta a ferramenta; o módulo permanece fora do build de produção. Pré-requisitos podem ser ignorados nesse cenário de teste e alvos ausentes recebem dados reais do catálogo. Não é uma forma de continuar ou compartilhar uma carreira válida.

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

## Como ficou, D82: clássico e apresentação estável (21/10/2026)

Craque `2.0.0-m23`; Técnico permanece `1.9.0`. Em `events/catalog.ts`, Semana de clássico (`derby`), respeitar o rival (`fairPlay`) tem efeito determinístico `fans: -2`. Provocar permanece com chance 55%, torcida +12 no sucesso e -10 na falha. As condições continuam: rival, papel de rotação/titular/craque e pelo menos 12 jogos no ano anterior. Resultado e chips exibem o custo real nos três idiomas.

**Jornal (24.6).** `matchStory` pede a voz editorial de `matchOutcomeText`, em terceira pessoa, mantendo ação, execução, placar e consequência reais. Nenhum “você”, “sua finalização” ou equivalente em inglês/espanhol aparece na crônica. Os relatos diretos da partida não mudam de voz. Crônicas usam Schibsted Grotesk a 11px na folha proporcional e 14px/linha 1,6 ampliada; conclusão de promessa usa peso 700, 13px na folha e 16px ampliada. Duas páginas da mesma temporada e folha em branco permanecem.

Na leitura ampliada, anterior/próxima ficam junto de fechar, com rótulos acessíveis, botões desabilitados nos extremos e contador/ano anunciados. Cada seta troca a edição/temporada sem fechar a folha nem mudar Capa/Bastidores. A abertura conclui qualquer virada pendente no destino solicitado. As folhas comuns continuam com virada animada, arrasto e teclado.

**Transição (14/32.5).** O motor continua resolvendo cada escolha uma única vez. A interface segura carreira, revista, tema e progresso de apresentação durante a leitura do resultado (2.100ms) e conserva esse contexto na saída lateral (560ms), liberando-o pelo término real da saída. A próxima decisão existe, mas não aceita cliques durante o deslize. A revista seguinte só ocupa espaço depois, evitando redução de altura/largura do card que sai no celular. Movimento reduzido elimina a animação, preservando a ordem. Regressões medem posição e dimensões quadro a quadro em partida→partida e partida→decisão principal, além de verificar teclado, limites, dois temas e ausência de rolagem no laço.

Se a pessoa trocar de aba durante a resposta, o painel da temporada pode ser desmontado. Uma liberação de segurança após 1.000ms da saída evita depender de um callback de animação que deixou de existir. No fluxo visível, o término real de 560ms libera antes; esse prazo não estende a leitura nem altera o motor. Ao terminar a transição, o título recebe foco depois de sair de `inert`, preservando foco externo em menus/exploração.

**Validação D82.** Verificação integral aprovada: 1.032 testes unitários, 27 cenários Windows, 51 metas do Craque, 23 do Técnico e build. O lote ampliado de 6.000 carreiras passou nas 51 metas; auditoria do laço m23 confirmou 144 carreiras, 2.853 temporadas e 2.444 partidas, com limites, ordem, promessas e replay coerentes. Tipos e lint reconferidos. Suíte final de navegador: 249 aprovados, nove pulos previstos por dispositivo, nenhuma falha; capturas em celular/computador e nos dois temas revisadas. A inspeção da pilha de troféus mede quadros desde antes do toque/hover e preserva as verificações de contagem e ausência de sobreposição; seis repetições isoladas também passaram.

## Revisão D83: transmissões das decisões de partida (22/10/2026)

Craque `2.0.0-m23`; Técnico `1.9.0`. Só interface: o motor, o save, as chances e os textos de jogo não mudam. Esta revisão substitui a descrição da atmosfera da D73 (variáveis `--match-*` com um gradiente por família); as regras de paleta das seleções da D73 continuam valendo.

**Pacotes.** `features/career/broadcastPackages.ts` guarda um pacote por competição: fundo (`deep`, `mid`), dois refletores (`light`, `light2`), luz no nível do gramado (`floor`), acento de leitura, metal do troféu, filete de assinatura (três cores), cor do LED, padrão de fundo (`motif`) e selo (`emblem`). Os padrões lembram o formato sem copiar marca; as cores são as da competição.

| Competição | Pacote | Padrão | Selo | Cores |
|---|---|---|---|---|
| Champions League | `ucl` | estrelas e duas curvas no alto | anel de estrelas | azul abissal `#03071e` a `#0a194e`, prata, ciano |
| Europa League | `uel` | arcos encadeados | anel de arcos | laranja e preto |
| Conference League | `uecl` | linhas cortadas | losango | verde elétrico e preto |
| Supercopa da UEFA | `usuper` | estrelas | taça | azul e prata |
| Libertadores | `libertadores` | raios de sol saindo do alto | louro com estrela | obsidiana, ouro `#d4af37`, âmbar, fumaça de sinalizador |
| Sul-Americana | `sudamericana` | papel picado | rosa dos ventos | azul profundo, celeste, ouro |
| Recopa | `recopa` | raios | taça | vinho e ouro |
| Copa dos Campeões da Concacaf | `concacaf` | linhas diagonais | losango | grafite, azul e prata |
| Mundial de Clubes | `clubworld` | globo | globo | preto e ouro |
| Copa Intercontinental | `intercontinental` | globo | globo | azul e ouro |
| Copa do Mundo | `worldcup` | globo nascendo do pé do palco | globo | preto, ouro de troféu, seleção nas luzes |
| Eurocopa | `euro` | mosaico geométrico | mosaico | azul-noite, prata, filete multicolorido |
| Copa América | `copaamerica` | tecido andino | sol | noite índigo, luz âmbar, prata |
| Copa Ouro | `goldcup` | linhas diagonais | taça | preto e ouro |
| Copa Africana de Nações | `afcon` | trama de tecido | estrela | verde-noite, ouro, verde e vermelho |
| Copa da Ásia | `asiancup` | colmeia | taça | azul-petróleo, ouro, vinho |
| Copa das Nações da OFC | `ofc` | ondas | taça | azul-oceano e prata |

**DNA dos países.** As duas divisões da liga usam o mesmo pacote do país (`league:XXX`):

| País | Padrão | Selo | Cores |
|---|---|---|---|
| Inglaterra | facetas angulosas | coroa | roxo real, ciano, magenta, verde no LED |
| Espanha | faixas arredondadas | sol listrado | grafite e coral |
| Itália | losangos finos | scudetto tricolor | azul-safira, ouro, filete tricolore |
| Alemanha | prancheta técnica | salva de prata | antracito e vermelho vivo |
| França | leques art déco | hexágono | azul de Paris, tricolor, ouro déco |
| Brasil | retícula de arquibancada | esfera estrelada | gramado noturno, ouro canarinho |
| Argentina | papel picado | sol de Maio | celeste, branco, ouro |
| Uruguai | listras da bandeira | sol | celeste e ouro |
| Chile | cordilheira | estrela | vermelho, azul, branco |
| Colômbia | ondas | escudo | amarelo, azul, vermelho |
| Equador | cordilheira | escudo | amarelo e azul |
| Paraguai | listras verticais | estrela | vermelho, branco, azul |
| Peru | tecido andino | escudo | vermelho e branco |
| Bolívia | tecido andino | estrela | vermelho, amarelo, verde |
| Venezuela | arcos | estrela | vinotinto e ouro |
| México | papel picado de festa | bandeirola | verde, branco, vermelho |
| Estados Unidos | linhas diagonais | escudo com estrela | azul-marinho, branco, vermelho |

Copas nacionais (`cup:XXX`) herdam o DNA do país, trocam o padrão pela chave do mata-mata e o selo pela taça. Quatro têm cores próprias: FA Cup (azul real e prata), Copa del Rey (vermelho e ouro, selo de coroa), DFB-Pokal (preto, vermelho e ouro) e Copa do Brasil (azul da noite de mata-mata com verde e amarelo). Copas da liga (`leaguecup:ENG`, `leaguecup:CHI`) usam o DNA com a chave; supercopas usam o DNA com a taça. Sem pacote conhecido, um estádio neutro (`generic`); nenhuma competição atual cai nele.

**Fusão com o time.** `features/career/teamColors.ts`:

- **Clube:** a faixa usa a camisa curada (`getClubKit`: duas cores e o padrão). Camisa lisa vira cor, detalhe no meio, cor; listras verticais alternam a cada 5 px (14 px no cachecol); listras horizontais viram blocos, como num cachecol; faixa diagonal vira diagonais; xadrez vira xadrez. O brilho usa a cor do clube e a segunda cor diferente da camisa.
- **Seleção:** 63 seleções têm identidade conferida (bandeira na faixa, cores da camisa no brilho, detalhe central quando a bandeira tem um: sol de Maio na Argentina e no Uruguai, esfera armilar em Portugal, estrela de Gana; xadrez na Croácia). As outras montam a bandeira com o uniforme dos dados, com a cor mais viva no brilho.
- **Brilho:** preto, branco e cinza (croma abaixo de 0,18) viram prata `#cfd8e3`, a 16% no canto principal e 12% no outro; cores vivas brilham a 30% e 20%. Cores escuras clareiam até luminância relativa 0,1 para aparecer no fundo noturno.
- **Faixa:** cores com luminância abaixo de 0,05 clareiam até 0,06; preto vira grafite `#3b414b`, que ainda se lê como preto.
- **Seleção no torneio:** o segundo refletor vira a segunda cor da camisa e o alto do palco recebe a cor mais escura e viva da camisa (20% no Mundial e na Copa Africana, na Copa da Ásia e na Copa Ouro; 16% na Euro e na Copa América; 18% na OFC). Assim o Brasil no Mundial vira noite esmeralda com ouro, sem o oliva de misturar o amarelo no escuro.

**Leitura.** `features/career/broadcast.ts` finaliza o pacote com tetos de luminância relativa: fundo 0,02, alto do palco 0,045, placa do cabeçalho 0,035, opção 0,04, opção sob o cursor e quadro do ícone 0,07. O acento é clareado até 4,8:1 sobre a superfície mais clara, o nome da competição (metal clareado) até 9:1 sobre a placa e o texto secundário até 5,2:1. O texto principal é `#f5f7fb` em todas as transmissões. O padrão é uma máscara do pseudo-elemento, forte nas bordas e quase apagado no centro, onde mora o texto; o brilho do time e o círculo dos refletores terminam antes da altura do título do lance. Card escuro nos dois temas, como na D73.

**Camadas** (`styles/broadcast.css`, de trás para a frente; os desenhos dos padrões ficam em `features/career/broadcastMotifs.ts`, no código da carreira carregado sob demanda, e chegam ao CSS pela variável `--bc-mask`, com a luz que os pinta e a opacidade de borda e de centro): degradê do pacote; luz do gramado; brilho do time nos dois cantos de baixo; dois refletores no alto com feixes cônicos; vinheta; padrão. O cabeçalho é uma placa de vidro levemente translúcida com borda no metal, filete de assinatura no alto, selo antes do nome, barra de cada time sob o nome (a camisa em miniatura) e o cachecol do time de quem joga no pé. O LED acende na cor do pacote (gelo na Champions, âmbar na Libertadores, ouro no Mundial, verde na Premier League). Gala europeia tem caixa alta espaçada com brilho frio; Libertadores, Recopa, Mundial e Mundial de Clubes têm ouro em relevo. O filete do título do lance leva o brilho do time.

**Tamanhos.** No PC, o card tem cantos de 10 px, borda especular (metal forte em dois cantos opostos) e sombra no brilho do time; o estádio em volta recebe um véu de 30% para o card se destacar. No celular, o card ocupa a área inteira e o estádio externo não é desenhado. O cabeçalho mede 117,8 px em 360 × 640, menos que antes; com o resumo do lance aberto, escudo e nome ficam lado a lado e a barra do time sai para o nome caber numa linha.

**Movimento.** Ao entrar no ar, um reflexo atravessa a placa uma vez (1,25 s); o ponto ao vivo pulsa só em opacidade. Com animações reduzidas no jogo, os dois somem. Nada mais anima; a troca de card continua a transição da D82, e cada card leva a própria transmissão durante a saída.

**Atributos.** O card tem `data-broadcast` (o pacote) e `data-motif` (o padrão); as barras e o cachecol têm `data-kit` e as variáveis `--k1`, `--k2`, `--k3` e `--kmark`. `.career` continua publicando `--match-accent`, `--match-glow` e `--match-bg-gradient`.

**Laboratório.** Design, seção Transmissões, mostra as 80 competições com o pacote real e os dois clubes de maior prestígio de cada liga ou confederação; um seletor veste os torneios de seleções com qualquer uma das 211 seleções. A vitrine monta logo depois da primeira pintura da área, e os cartões fora da tela não fazem layout nem pintura, para não atrasar o resto do laboratório. O laboratório da decisão ganhou o seletor Competição, que põe qualquer competição na cena escolhida.

**Testes.** `broadcast.test.ts` exige pacote próprio para toda competição, identidades distintas entre torneios e entre os 17 DNAs, estrelas só na Champions e na Supercopa da UEFA, ouro no Mundial e prata na Euro e na Copa América para qualquer seleção, e contraste das superfícies de leitura em toda competição com cada um dos 302 clubes ou das 211 seleções. `teamColors.test.ts` cobre brilho, faixa visível para todos os clubes e seleções e os desenhos de camisa. `d73.spec.ts` confere pacote, padrão, barras, cachecol e bandeira nas quatro atmosferas; `d83.spec.ts` mede o contraste real nas cores calculadas pelo navegador, o reflexo e o ponto ao vivo com animações completas e reduzidas, e a vitrine do laboratório.

**Validação D83 (22/10/2026).** `pnpm verify` integral aprovado: tipos, lint, 1.051 testes unitários (189 da interface; 19 a mais que na D82, todos das transmissões), 27 cenários Windows, 51 metas do Craque, metas do Técnico 1.9.0 em 384 temporadas e build. Os cenários Windows rodaram sem a variável `NoDefaultCurrentDirectoryInExePath`, que o terminal do assistente define e que impede o `cmd.exe` de achar o `run.cmd` temporário dos testes; com ela, os dez cenários falham pelo ambiente, sem relação com o código. `pnpm e2e` integral aprovado: **265 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, sem falhas (9,8 minutos), incluindo os 16 novos de `d83.spec.ts` e as quatro atmosferas reforçadas de `d73.spec.ts`. A primeira rodada achou um problema real: a vitrine do laboratório montava as 80 transmissões junto com a área Design e, com quatro trabalhadores, o laboratório da decisão passou de 15 s no celular; a vitrine agora monta depois da primeira pintura e os cartões fora da tela não fazem layout (área Design de cerca de 1.000 ms para 430 ms no servidor aquecido). Conferência visual em PC 1280 × 720 e celular 360 × 640 nos dois temas, nas cinco famílias reais das amostras (Champions, Libertadores, Mundial, Copa América e Série B), no resultado da partida, em 320 × 568 e nas 80 competições da vitrine. A primeira versão misturava a cor da seleção no fundo e deixava o Brasil oliva no Mundial e na Copa América; a fusão passou para as luzes. O cabeçalho mede 117,8 px em 360 × 640 (antes, 118,5 px); com o resumo do lance aberto, a barra do time saía ao lado do nome e quebrava "RB Bragantino" em três linhas, e agora some nesse modo. Peso: o CSS global ganhou 1,5 KB com gzip (8,5 KB minificado); os desenhos dos padrões e as tabelas de cores ficam no pedaço da carreira, carregado sob demanda.

## Revisão D84: transições sem clarão e telas mais enxutas (22/10/2026)

Craque `2.0.0-m23`. `MatchAtmosphere` desenha `.match-atmosphere-base` (`#05070c`, só no PC) por baixo do estádio enquanto há partida; ela entra e sai em 650 ms e os estádios de competições diferentes se cruzam sobre ela. `SeasonDecision` usa `m.div layout="position"` (420 ms, mesma curva da saída lateral): quando resumo e jornal reaparecem acima ou abaixo, o card desliza. `PlayFeed` não desenha a aba de evento sem temporada no PC (a mensagem do resultado mostra o texto inteiro); no celular a aba continua. Hub sem contagem de liberadas; identidade sem `appearanceHint` e `dreamHint`; pôster sem descrição. `matchStory` monta o título com a escolha (`sceneOption`) e a fase: gol "o gol que marcou", assistência "o passe que mudou", defesa "as mãos que seguraram", desarme "o corte que salvou", segura "o time decidiu", falha "escapou por um detalhe", nos três idiomas.

## Revisão D85: a pilha que desliza (22/10/2026)

Substitui o `layout="position"` da D84. `CareerScreen` passa a `SeasonDecision` um `.slide-stack` com o resumo compacto (celular, nas mesmas condições de antes), a decisão e o `NewsBar`; `SeasonDecision` coloca a `.season-progress` dentro de cada `.season-decision-slide` (coluna) e usa o progresso da decisão do próprio card. No celular, o `.loop-panel` do Craque (o Técnico não muda) não tem margem e `.slide-stack` tem 12 px por 16 px (8 px na vertical até 760 px de altura), sem margem quando contém o palco da partida e sem margem lateral no fim de carreira. O card de partida leva o próprio fundo escuro e as cores da transmissão na linha de progresso. O cabeçalho compacto da partida vale com `.slide-stack:has(> .play-compact)`. Medido em 360 × 640: janela no mesmo topo e com a mesma altura na partida, na decisão seguinte e na próxima partida.

## Revisão D86: resultado no topo, no celular (22/10/2026)

Até 1023 px de largura, `.result-layer` é fixa (`top: env(safe-area-inset-top) + 4px`, 8 px das laterais, altura da barra do topo menos 8 px), com `.result-msg` numa linha (selo de 28 px, chamada e título com reticências; corpo e chips ocultos) e a animação `result-away` (0,3 s, depois de 4 s) que a apaga. `.career:not(.tecnico)` ganha `position: relative; z-index: 41` no celular para a faixa ficar acima da barra (z 40). A regra antiga que fixava a mensagem sobre o cabeçalho nas partidas saiu. Medido em 360 × 640: a janela da decisão fica em 127 px de topo e 456 px de altura em todas as trocas, inclusive logo depois da escolha.

## Revisão D87: card pronto no deslize, taças e som do lance (22/10/2026)

`CareerScreen` monta a pilha do card com `stackPlay` (o lance ativo; durante a leitura do resultado da partida, o anterior), `stackShown`, `stackDramatic` e `stackNewsIndex`, todos da decisão nova; o `AnimatePresence` guarda o desenho do card que sai. Medido em 360 × 640, da última partida para a decisão principal: o card novo tem resumo, decisão e jornal desde o primeiro quadro e a primeira opção fica em 327 px durante todo o deslize. `PlayFeed`: as taças (`showcaseItems`) aparecem no cartão do PC antes de "Detalhes da temporada" (também quando há o botão de detalhes) e na primeira linha da faixa do celular (`.play-strip-honours`, 18 px, até duas e "+n", substituindo o selo de campeão), com `club.short`. Som (GDD 33): novos sinais `hit` e `miss` em `services/audio.ts`, tocados por `MatchOutcome` ao aparecer; `hit` vibra como sucesso. O laboratório de som os lista nos três idiomas.

## Revisão D88: toque nas taças e manchetes (22/10/2026)

`HonourToken` controla a dica: `onPointerDown` de toque abre por 2 s (fechamentos do componente são ignorados nesse intervalo); na faixa do lance, o grupo de taças segura o clique para não abrir o resumo, e nas pilhas de troféus o toque continua abrindo a pilha. Mouse e teclado seguem como antes. `matchStory` monta o título com a ação do lance e a fase (gol "o gol que marcou", assistência "o passe que mudou", defesa "as mãos que seguraram", desarme "o corte que salvou", segura "o time decidiu", falha "escapou por um detalhe"), sem o rótulo da escolha, com a primeira letra maiúscula, nos três idiomas.

## Revisão D89: resultado honesto, lance que vale mais e promessa como decisão principal (24/10/2026)

Motor `2.0.0-m24`. Esta revisão substitui, onde conflitar, as regras de resultado de lance, promessa, Bola de Ouro e propostas das revisões D73 a D88.

- **Lance que não deu certo nunca vence.** Com erro, no mata-mata o adversário marca e elimina (sem pênaltis); na liga o placar fica no máximo empatado: saindo empatado, 12% de o adversário também não marcar, senão ele vence; saindo atrás, a derrota continua. Vale para arrojada, coletiva, segura, cobrança, canto e o companheiro que desperdiça o pênalti decisivo.
- **Segura que deu certo** mantém o placar e depende do time: 42% de o time marcar (vezes a pressão do recorde na final). Se não marca, a liga fica no empate e o mata-mata vai para os pênaltis (50%). Vencer assim vale o resultado do time (título, classificação, pontos), sem bônus individual: torcida 0, legado 0.
- **O lance jogado que decide vale mais.** Arrojada, coletiva, cobrança ou canto que deram certo e terminaram em vitória somam à torcida base (+3 arrojada, +2 coletiva, +8 pênalti decisivo) +1 nas quartas e na semifinal e +2 na final; o legado base (+2/+1) ganha +1 na final; e o lance conta como **um reconhecimento** na evolução do ano (o mesmo dos títulos: até +0,55 de capacidade, teto de três por ano, diminuindo até zero perto do potencial). O resultado mostra o selo "Destaque do jogo: + evolução".
- **Campanha contínua.** Num ano com vaga para dois ou mais jogos (ritmo anual), quando a copa sorteada chegou à semifinal ou à final, há 50% de a fase anterior da mesma copa vir antes (antes da final: semifinal 60%, quartas 40%), contra um adversário que caiu naquela fase no mundo. Os jogos ficam em ordem de fase. Eliminado numa fase, as fases seguintes da mesma copa não são puladas: cada uma vira outro jogo do mesmo ano que ainda está vivo (liga, copa nacional, outro continental ou seleção), escolhido entre os jogos que o mundo projetou e que vêm depois na ordem do ano. Só quando não sobra jogo assim o ano fica com menos decisões. Vencer uma fase anterior nunca rebaixa a colocação que o mundo já deu ao time.
- **Promessa é decisão principal.** Ela disputa a vaga da janela comum do ano, depois de evento, treino e empréstimo, e nunca chega depois de outra decisão principal. Condições: 18 anos ou mais, papel público (rotação, titular ou craque), nenhuma promessa em curso, no máximo três na carreira e cinco anos desde a última. Chance: 60% para a primeira, 12% para as seguintes; se não sair naquele ano, não sai. Metas, prazo e recompensas não mudaram. Depois dela vêm só as partidas do ano.
- **Reinvenção também é decisão principal.** Com as mesmas condições de antes (33 anos ou mais, perda de pelo menos 2 de OVR em dois anos, convite de 45% sorteado uma vez), ela ocupa a vaga da janela comum, antes da promessa, e nunca chega depois de outra decisão principal.
- **Bola de Ouro um pouco mais acessível no topo.** A partir de 90 de OVR, a nota do jogador ganha +0,5, mais 0,1 por ponto acima de 90, até +1 (OVR 95). Fenômenos de ataque: média de 0,52 para 0,73 Bolas por carreira, 30% para 35% ganham ao menos uma (meta 20% a 45%).
- **Propostas mais variadas.** A carreira lembra os seis clubes das últimas propostas; no sorteio dentro da região, cada um pesa 0,3 contra 1 dos demais. Com nível de mercado 88 ou mais, a faixa de interessados desce até `nível - 9` (em vez de `- 7`). Medido em 200 carreiras com OVR 86+: repetição de clube entre janelas seguidas de 19% para 13%, cinco clubes mais frequentes de 50% para 44% das propostas.
- **Hipotético.** Promessa e reinvenção, agora decisões principais, entram na lista do Hipotético como ponto do ano; só as partidas ficam fora.
- **Amostras de navegador** reconstruídas no m24: replays das escolhas antigas quando a decisão equivalente existe, e carreiras novas e reais (sementes `d89-*`) para os lances que a divergência apagou: Libertadores, escanteio, pênalti decisivo, permanência em clube continental e ultimato.

**Como ficou (D89).** `resolveKeyMatch` (`career/drama.ts`) resolve sucesso, depois `resolved = sucesso e (não segura ou correndo atrás ou time marca)`; o placar de quem segurou fica como estava, o de quem errou ganha um gol do adversário (na liga, salvo os 12% do empate mantido); o empate no mata-mata só existe com sucesso e vai a pênaltis. `MATCH_REWARD` guarda torcida por fase, legado da final, reconhecimento, 42% e 12%. `KeyMatchResult.recognition` entra em `successBonus` de `simulatePlayerSeason`. `planMatches` monta a cadeia com `MATCH_CHAIN` e `resolveDrama`, na eliminação, troca as fases canceladas por jogos de `DramaPeriod.reserve` (sobras do sorteio do ano, de outras competições, com `matchOrder` igual ou maior que o do jogo atual); `keyKnockout` coloca o vencedor em `min(posição atual, teto da fase)`. Os sorteios do lance, do placar e do teto passam a incluir a fase, para dois jogos da mesma copa no mesmo ano não repetirem o resultado. A reinvenção principal sai de `veteranDue`/`veteranDecision` e a promessa de `promiseDue`/`promiseDecision`, ambas chamada em `buildNextDecision` antes da janela comum; ela não tem linha de progresso, como as outras decisões principais. `BALLON.eliteFrom/eliteBase/elitePerPoint/eliteMax` e `ballonEliteBonus` (`awards/awards.ts`). `MARKET.recentWeight/recentMemory/eliteFrom/eliteBelow` e `Career.recentOffers` (refeito pelo replay, nunca salvo). Um aposentado no meio do prazo de uma promessa a deixa sem balanço.

**Validação D89.** 51/51 metas; recordes auditados (Bola de Ouro: 1 de 1.800 Fenômenos chegou às oito; antes, o melhor do lote parava em sete). Auditoria do laço real (`pnpm balance:craque:momentos`): 144 carreiras, 140 promessas (antes 175), 49 fases seguidas da mesma copa no ano, nenhum lance errado vencendo, nenhuma fase depois de eliminação, nenhuma promessa ou reinvenção depois de outra decisão principal. `pnpm verify` e `pnpm e2e` aprovados.

## Revisão D90: decisão principal todo ano, erro que pesa e Troféu Yashin (26/10/2026)

Motor `2.0.0-m25`. Substitui, onde conflitar, as revisões anteriores sobre limite de partidas por ano, torcida no erro, legado, mercado de elite, Luva de Ouro e pilhas de troféus.

- **Toda temporada tem uma decisão principal.** No ritmo anual, nenhum ano começa direto numa partida. Antes, uma janela sem nenhuma proposta e ainda sem a opção de aposentar (menos de 33 anos) era pulada; agora chega ao menos a proposta do clube mais perto do nível. No ritmo rápido continua uma decisão principal por período de dois anos.
- **Até cinco decisões por ano.** No ritmo anual, o ano sorteia de 1 a 4 partidas (pesos 30/30/25/15), sempre dentro do limite de cinco decisões com a principal. No rápido, uma partida por ano.
- **Erro custa torcida pela competição e pela fase.** Todo lance jogado que não deu certo (arrojada, coletiva, segura, cobrança ou canto) tira `arredondar(2 × importância do título + fase)` de torcida, de 1 a 10, com fase 0 na liga e nas quartas, +1 na semifinal e +3 na final. Exemplos: liga da segunda divisão -1, liga da primeira -2, final de copa nacional -4, final da Champions ou da Libertadores -8, final da Copa do Mundo -10. Na D90 o custo aparecia em cada opção ("Erro: torcida -N"); a D91 tirou o texto da opção. O pênalti deixado para o companheiro não cobra. Lenda do clube perde metade a partir de -2, arredondando para cima.
- **Lenda e ídolo um pouco mais difíceis.** Lenda: `50 + 11 × prestígio` pontos, 5 temporadas e 140 jogos no clube (antes 45 + 10p, 4 e 120). Ídolo: `25 + 6 × prestígio` pontos, 2 temporadas e 70 jogos (antes 22 + 5p, 2 e 60). As missões do Desafio foram recalibradas.
- **Contrato de chuteira dá mídia.** Topar a campanha soma, além de torcida +6 e pressão, **+8% no valor de mercado** pelo resto da carreira, dentro do teto da idade. A pedido, o efeito não aparece na mensagem do evento.
- **Propostas no topo.** Para o craque de elite (nível de mercado 88+), a faixa de interessados sempre alcança os clubes até 7 pontos do mais forte do mundo; os nove últimos clubes que fizeram proposta pesam 0,15 no sorteio. Antes, acima do clube mais forte a faixa achava só dois ou três gigantes (e às vezes nenhum, o que pulava a decisão principal). Medido com OVR 92+: sete gigantes revezando perto de 9% cada, repetição entre janelas seguidas de 10%.
- **Goleiro na Bola de Ouro: possível, mas raríssimo.** A nota do goleiro perde 11 pontos; numa temporada histórica (OVR 93+, 24+ jogos sem sofrer gol e o continental principal ou a Copa do Mundo), perde 6. Goleiro que ganha a Bola de Ouro leva o Troféu Yashin junto. Antes, 31% dos goleiros Fenômeno ganhavam ao menos uma Bola de Ouro; agora 1 em 300.
- **Troféu Yashin (antiga Luva de Ouro), bem mais difícil.** O nome muda nos três idiomas (Yashin Trophy, Trofeo Yashin). Cada goleiro da elite ganha +8 na nota da eleição. Goleiro Fenômeno: de 13,7 para 6,5 por carreira; Estrela: de 7,1 para 1,3.
- **Missão "Paredão" do Desafio.** Com o Troféu Yashin bem mais difícil, a missão passa a contar as temporadas entre os dez primeiros da eleição do Yashin (antes, Luvas ganhas). Sem isso, só goleiro Estrela ou Fenômeno poderia recebê-la e ela sumia das mãos do dia.
- **Detalhes da temporada mostram as colocações.** Uma seção "Competições da temporada" lista onde o clube terminou cada competição do ano (liga pela posição, mata-matas pela fase, campeão em dourado) e, quando houve, as da seleção. Só aparece nos detalhes.
- **Pilha de troféus abre num painel flutuante.** Hover, foco ou toque na pilha mostra todas as cópias com o ano de cada uma, num painel que fica dentro da tela e não mexe no resto da linha do tempo. Antes, as cópias se espalhavam no fluxo, sobrepunham e empurravam a linha para baixo.
- **Nomes de taças.** A placa da taça da Série B foi redesenhada para o texto caber, e nomes de troféu com palavra longa ("Copa Intercontinental") usam fonte menor em vez de quebrar a palavra no meio.
- **A opção segura ("segurar e recomeçar", "manter deste lado" e afins), em detalhe.** A chance de acertar tem teto sorteado de 70% a 90% e depende dos atributos da ação. Acertou: o placar não muda por culpa sua, sem gol, assistência, torcida, legado ou reconhecimento; correndo atrás na liga, o time empata; empatado, o time ainda marca sozinho com 42% (vezes a pressão do recorde na final) e vence; se não marcar, a liga fica empatada e o mata-mata vai aos pênaltis (50%). Errou: no mata-mata o adversário marca e elimina; na liga, empatado, 12% de o empate continuar e 88% de derrota; atrás, a derrota continua. Errar custa torcida pela tabela acima. Cada segura escolhida reduz em 5% o risco de lesão leve naquele ano.

**Como ficou (D90).** `windowDecision` (`career/decisions.ts`) cria a proposta do clube mais perto do nível quando a janela vem vazia e o jogador tem contrato e ainda não pode se aposentar. `widenedClubs` (`career/market.ts`) usa `MARKET.eliteSpan` e `recentWeight/recentMemory`. `planMatches` sorteia com `MATCH_COUNT`. `matchFanLoss` e `MATCH_FAN_LOSS` (`career/drama.ts`) calculam o custo; `resolveKeyMatch` o aplica a toda falha que não seja `leave`; `matchOptionHint` o mostra. `LEGACY_BAR` (`career/fans.ts`). Efeito novo `fame` (`events/model.ts`), `Career.fame`, `famedMarketValue` (`player/value.ts`), sem texto em `describeEffect`. `keeperBallonPenalty`, `BALLON.keeper*`, `GOLDEN_GLOVE.fieldBonus` e o Yashin forçado ao goleiro que ganha a Bola de Ouro (`awards/awards.ts`). A chave interna do prêmio continua `goldenGlove`, e a arte continua a da luva. Interface: `SeasonCompetitions` (`screens/career/PlayFeed.tsx`), `HonourGroups` com `Popover` do Base UI (`ui/HonourGroups.tsx`), `HonourArt`/`honourName` (`ui/HonourToken.tsx`), `data-long` em `Showcase.tsx`.

**Validação D90.** 51/51 metas; Bola de Ouro dos Fenômenos de ataque igual (média 0,73, 35%). Desafio recalibrado com 3.000 carreiras. Recordes auditados: a Bola de Ouro (8) não foi alcançada neste lote (melhor 6); nas rodadas D89 o melhor foi 7 e depois 8, e a regra do atacante não mudou, então é variação da amostra. Auditoria do laço real: 144 carreiras, 2.888 temporadas, 2.570 partidas, máximo de 5 decisões num ano, nenhum ano do ritmo anual sem decisão principal, 138 promessas e 56 fases seguidas da mesma copa.

## Revisão D91: pênaltis raros, Bola de Ouro por posição e resultado em cores (26/10/2026)

Motor `2.0.0-m26`. Substitui, onde conflitar, a D90 sobre a janela sem proposta e o custo do erro mostrado na opção, e as regras anteriores de defesa de pênalti (35%, 45% com especialista).

- **Janela sem proposta vira outra decisão principal.** A proposta de clube é garantida a cada três temporadas (`transferOpportunityDue`): vencido o prazo sem interessados, chega a do clube mais perto do nível. Antes do prazo, uma janela que só teria "ficar" não inventa proposta (isso a D90 fazia): o ano abre com um **treino escolhido** (as opções de foco da posição). Só se nenhum atributo puder subir (todos acima de 97) o jogo usa a proposta do clube mais perto. Nenhum ano do ritmo anual começa direto numa partida.
- **Bola de Ouro mais difícil quanto mais atrás.** Além do ajuste de posição que já valia para todos, a nota do jogador perde `BALLON_POSITION`: atacante, ponta, meia e ala de meio (ME/MD) 0; MC 1,2; VOL 2; laterais 2,6; zagueiro 3,4; o goleiro segue com a regra própria (-11, ou -6 numa temporada histórica). Medido com 300 Fenômenos por posição na Europa, carreiras com ao menos uma Bola de Ouro: CA 50%, MEI 33%, MC 45% para 33%, VOL 34% para 18%, LE 28% para 12%, ZAG 38% para 9%, GOL 1%. Média por carreira: CA 1,18, MC 0,58, VOL 0,24, LE 0,15, ZAG 0,10, GOL 0,01.
- **Pênalti contra o goleiro é adivinhar o canto.** O cobrador escolhe o canto antes, 50/50 (`penaltySide`, sorteio próprio e estável no replay). Acertou o lado, defendeu; errou, não. A chance mostrada é 50% (na final, vezes a pressão do recorde). O especialista em pênaltis (reinvenção do goleiro) ainda alcança 20% das bolas no canto errado: 60% no total. Vale para o pênalti no jogo e para a defesa na disputa.
- **Duas disputas de pênaltis raras.** Só no mata-mata, antes da escolha normal da cena: "Nas alternadas" chega a zagueiros, laterais e volantes (4% dos jogos de mata-mata deles), com a 7ª a 10ª cobrança; "Só falta você" chega ao goleiro (1,2%), na 11ª cobrança, quando os dez de linha já bateram. As duas têm só os dois cantos. Teto de chance: defensor 80% (finalização 80%, físico 20%), goleiro 75% (reposição 70%, posicionamento 30%). Acertou, o time vence a disputa (pênaltis `cobrança × cobrança - 1`); errou, perde. O placar do jogo mostra a cobrança ("Pênaltis · 8ª cobrança").
- **Goleiro que não defende o pênalti perde um a menos de torcida.** No pênalti contra e na defesa da disputa, o custo do erro é o da tabela da D90 menos 1 (`MATCH_FAN_LOSS.keeperSave`), antes da metade da lenda. O goleiro que bate ("Só falta você") não tem o alívio.
- **O custo do erro saiu das opções.** A regra de torcida da D90 continua igual, mas a dica da opção não mostra mais "Erro: torcida -N".
- **Contrato de luva.** Para goleiro, o "Contrato de chuteira" vira "Contrato de luva" nos três idiomas (título, texto e resultado), com os mesmos efeitos.
- **Resultado do lance em quatro cores.** Verde, "Deu certo!": o lance deu certo e o time venceu. Amarelo, "Segurou o empate!": deu certo na liga e terminou empatado (o time empatou correndo atrás, ou segurou o empate). Laranja, "Caiu nos pênaltis!": deu certo no mata-mata, o empate seguiu e o time perdeu a disputa. Vermelho: o lance não deu certo. O aviso e o placar do lance usam a mesma cor. No mata-mata o texto agora diz como terminou: "O empate seguiu até o apito final e o jogo foi para os pênaltis. O time venceu a disputa." (ou perdeu), "Depois, a equipe marcou o gol da vitória." ou "O adversário marcou e decidiu o confronto."
- **Vitrine organizada.** Troféus primeiro, prêmios depois, cada grupo pela importância (aba Troféus, resumo e pôster).
- **Pilha de troféus.** No botão da pilha, a taça não ganha mais o quadrado próprio no hover; fica só o contorno do botão inteiro.
- **Debug.** Os controles de teste ganharam "Resetar todas as conquistas", com confirmação: apaga as conquistas liberadas, os contadores e as carreiras terminadas daquele navegador.
- **Textos.** Criação: o campo do nome mostra só "Nome" (sem "Sobrenome" e sem "Até 16 letras"); o rótulo interno do campo e do Desafio passou a "Nome". Hub: "Futebol de escolhas" (também no título da página e no manifesto) e novas frases dos dois cartões. Início do Craque: frase de abertura nova, dica do ritmo rápido com até 72 caracteres, sem as frases das dificuldades. Ajustes: sem a frase das animações. Aparência: sem "Tudo opcional".

**Como ficou (D91).** `nextDecision` (`career/decisions.ts`) troca a janela que só teria "ficar" por uma decisão `focus` (`focusOptions`); `windowDecision` só cria a proposta do clube mais perto quando `guaranteed`. `BALLON_POSITION` e `ballonPositionPenalty` (`awards/awards.ts`, antes `keeperBallonPenalty`). `SHOOTOUT_SCENES`, `RARE_SHOOTOUT`, `isShootout`, `isCornerChoice` e `isKeeperSave` (`career/matchMoments.ts`); cenas `suddenDeath` e `keeperShootout`, `KeyMatch.kick`. `KEEPER_SAVE`, `penaltySide` e `MATCH_FAN_LOSS.keeperSave` (`career/drama.ts`). Conteúdo: textos das cenas novas (`matchScenes.ts`), finais de mata-mata em `matchOutcome.ts`, `heldDraw` e `shortfall` em `drama.ts`, `KEEPER_EVENTS` em `text.ts`. Interface: tons `draw` e `short` (`ui/tone.ts`, `--draw` e `--short`), marcas de resultado `draw` e `short` (`resultView.ts`, `ResultMessage.tsx`, `MatchOutcome.tsx` com `data-level`), ordem da vitrine (`features/summary/showcase.ts`), `resetAchievements` (`features/hall/store.ts`) no debug, `hideLabel` no `TextField`. O laboratório mostra os tons novos e os dois resultados parciais.

## Revisão D92: recordes possíveis e três marcas novas (26/10/2026)

Motor `2.0.0-m27`.

- **Ala de meio sem desconto na Bola de Ouro.** ME e MD já ganhavam bem menos que o MC por natureza (Fenômeno: 18% a 19% com ao menos uma, contra 33% do MC); o desconto deles caiu de 0,6 para 0. Pontas e MEI seguem sem desconto: PE 33%, PD 36%, MEI 33%.
- **Os dois recordes que ninguém batia ficaram possíveis.** Bolas de Ouro: a cauda da pressão do recorde começa na 5ª Bola em vez da 4ª (`PRESSURE.ballonDor.start` 4 para 5). Gols pela seleção: a cauda começa em 141 em vez de 136, e os gols da seleção deixam de passar também pela cauda dos gols da carreira (979), que prendia o artilheiro perto dos dois recordes. Com 400 Fenômenos por posição em cada lote: 8 Bolas de Ouro em 1 de 4.800 carreiras (melhor antes: 7), 146 gols pela seleção em 1 de 4.800 (melhor 148; antes 140), gols na carreira de 6 para 14 de 4.800. As 21 marcas do relatório são alcançáveis e raras.
- **Três recordes novos no jogo**, como marcas de referência (sem detentor de consenso, e o texto diz isso): assistências numa temporada (35), jogos sem sofrer gol numa temporada (34) e títulos de uma mesma liga fora de Inglaterra, Espanha, Itália e Alemanha (12). Entram na tela de recordes, no resumo e cada um ganha a conquista de recorde automática. São 21 recordes no jogo.

**Como ficou (D92).** `BALLON_POSITION` com ME/MD 0 (`awards/awards.ts`); `PRESSURE.ballonDor` e `PRESSURE.nationalGoals` (`records/pressure.ts`); a produção da seleção em `season/playerSeason.ts` usa só a cauda dos gols pela seleção. Recordes `seasonAssists`, `seasonCleanSheets` e `otherLeague` em `packages/content/src/records.ts`, com a medida nova `career` (conta do histórico até a temporada), e textos nos três idiomas.

## Revisão D93: recordes reais e todos superáveis (26/10/2026)

Motor `2.0.0-m28`. Substitui a D92 sobre as três marcas de referência.

- **As três marcas da D92 ganharam número e detentor reais.** Assistências numa temporada: **32, Lionel Messi** (Barcelona, 2011-12, todas as competições; as fontes divergem entre 29 e 34, o jogo usa 32). Jogos sem sofrer gol numa temporada: **26, Marc-André ter Stegen e Francisco Liaño** (Barcelona 2022-23 e Deportivo 1993-94, recorde das cinco grandes ligas, só liga); o jogo conta só os jogos de liga de primeira divisão. Liga fora das quatro: virou **Títulos da liga francesa, 11, Marquinhos** (Paris Saint-Germain, Guinness, 2026). Não há recorde de consenso para "todas as competições" em jogos sem sofrer gol, nem um detentor firme de "liga fora das quatro grandes".
- **Todo recorde dá para bater e superar.** As caudas da pressão do recorde foram afrouxadas onde ninguém passava da marca: Bola de Ouro começa a frear depois da 8ª (escala 4), Bolas seguidas a partir da 3ª com escala 3, Chuteiras de Ouro a partir da 4ª, títulos continentais a partir do 5º e a sequência continental a partir do 5º (escala 2,5). Assistências por temporada passaram a frear a partir de 22 (o recorde caiu de 35 para 32). O prestígio do votante na Bola de Ouro sobe até 5,5 (antes 4): só quem já tem 7 ou mais Bolas sente a diferença. Fenômenos de ataque: Bola de Ouro média 0,77, 36% com ao menos uma (meta 0,4 a 1,25 e 20% a 45%).

**Como ficou (D93).** `seasonAssists` (32), `seasonCleanSheets` (26, só linhas `kind: "league"`) e `leagueFrance` (11) em `packages/content/src/records.ts`; `PRESSURE` em `records/pressure.ts`; `BALLON.prestigeMax` em `awards/awards.ts`. O relatório `tools/balance/relatorios/recordes.md` mede as três com as marcas reais.

## Revisão D94: recordes em faixas, quase, coleção, jornal e desafio de recorde (27/10/2026)

Motor `2.0.0-m29`.

- **Faixas de raridade dos recordes.** Cada recorde tem uma faixa, medida como a chance de uma carreira de Fenômeno (simulada pelas políticas automáticas) igualar ou superar a marca:
  - **Clássico (6% a 15%, chamada de Entrada até a D95):** assistências numa temporada (32), jogos pela seleção (234), jogos sem sofrer gol numa temporada de liga (26), títulos na carreira (46).
  - **Raro (2% a 5%):** jogos na carreira (1.390), Champions (6), ligas grandes seguidas (11), Ligue 1 (11).
  - **Épico (0,5% a 1,5%):** gols numa temporada (73), gols na carreira (979), Copas do Mundo (3), LaLiga (12), Serie A (10), Bundesliga (13), continentais seguidos (5).
  - **Lendário (0,1% a 0,4%):** Bolas de Ouro (8), Bolas seguidas (4), Chuteiras de Ouro (6), gols pela seleção (146), Libertadores (6), Premier League (13).

  `pnpm balance:recordes` mostra a faixa de cada marca e se ela está dentro (coluna "Na faixa", que também exige alguém passando da marca). As caudas da pressão (`records/pressure.ts`) foram recalibradas para isso, e o fator de gols em jogo de seleção subiu de 0,6 para 0,64. Antes, o recorde mais comum caía em 2,9% das carreiras e vários em 1 de 4.800.
- **Mostrar o quase.** Nos detalhes da temporada, "Recordes à vista" lista até quatro marcas a partir de 80% delas ("Faltam 3 para igualar Messi (73)") e, depois de igualar, "Falta 1 para superar". No resumo, os recordes alcançados vêm com a faixa e a coleção da carreira ("3 de 21 recordes nesta carreira"), e os que ficaram perto aparecem com "Faltaram N".
- **Coleção com raridade.** Toda conquista tem raridade (comum, rara, épica, lendária), que muda só a aparência do cartão: borda e fundo da cor da raridade, selo com o nome, e brilho na épica e na lendária liberadas. Recordes seguem a faixa (clássico rara, raro épico, épico e lendário lendários); títulos seguem o peso do troféu; as outras têm a raridade definida em `ITEM_RARITY`. A conquista secreta só mostra a raridade depois de cair. Igualar o recorde já libera a conquista. A aba Recordes diz "Coleção de recordes: N de 21".
- **Jornal de recorde.** Igualar ou superar um recorde abre a capa do ano antes de qualquer taça (ângulo "recorde" ou o novo "recorde igualado", com manchetes próprias nos três idiomas). O jornalzinho do lance ganha borda dourada e o carimbo "Recorde" no lugar da data; a capa do jornal completo ganha um selo inclinado com o nome do recorde e o placar "detentor: marca · Você: valor", dourado ao superar e da cor da faixa ao igualar (desde a D95, medalha no lugar do escudo; ver D95).
- **Final valendo recorde.** Quando vencer uma final iguala (ou supera por um) uma marca real (Copa do Mundo, Champions, Libertadores, continentais seguidos ou títulos na carreira), a decisão de partida ganha a faixa dourada "Vale recorde" sob o placar ("Se vencer, iguala Gento: Títulos da Champions League, 6"), e essa final entra primeiro na fila do ano. Só acontece se o clube chegou à final de verdade; a chance do lance não muda.
- **Desafio do dia com recorde-alvo.** Em 25% dos dias, a mão traz um recorde real da posição (gols numa temporada, gols na carreira, gols pela seleção, Bolas de Ouro, assistências, jogos sem sofrer gol, títulos, Champions, Copas, jogos pela seleção ou jogos na carreira) e todo mundo joga com um Fenômeno. O recorde vale até 250 pontos: `150 × (marca / recorde)^1,5`, mais 60 ao igualar e mais 40 ao superar; missões e pico passam a valer 75%. A nota continua de 0 a 1000.

**Como ficou (D94).** Faixas: `RecordTier` e `tier` em `packages/content/src/records.ts`, `RECORD_BANDS` e `inBand` em `tools/balance/src/records.ts`. Quase: `recordChases` (conteúdo), `RecordWatch` em `screens/career/PlayFeed.tsx`, `nearRecords` no resumo. Raridade: `achievementRarity` e `ACHIEVEMENT_RARITIES` (conteúdo), `data-rarity` e `--rarity` (estilos), tom `--epic`. Jornal: `recordsReachedIn`, ângulo `recordMatch`, `SeasonCover.record` (`CoverRecord`), `RecordSeal`. Final valendo recorde: `recordStake` em `career/drama.ts` (prioridade em `planMatches`), `.match-stake`. Desafio: `challenge/records.ts` (`CHALLENGE_RECORDS`, `recordPoints`, `RECORD_SHARE`), `ChallengeHand.record`, `CareerSetup.talent` e `NewPlayerInput.talent` (o sorteio do talento continua saindo, para os outros fluxos do nascimento não mudarem), `ChallengeStatus.record`, `RecordTarget` em `MissionViews.tsx`. O laboratório mostra a final da Libertadores valendo recorde (cinco títulos antes) e, na área do Desafio, o recorde-alvo dos dias de recorde.

## Revisão D95: despedida no jornal, selo novo e recordes da posição (27/10/2026)

- **Faixa "Clássico".** A faixa de entrada dos recordes passou a se chamar **Clássico** (Classic, Clásico); o id interno continua `entry`. As outras seguem Raro, Épico e Lendário.
- **Recordes da posição.** O recorde de jogos sem sofrer gol numa temporada de liga só conta temporadas como goleiro. Um atacante não o vê em "Recordes à vista", não o alcança no resumo e não libera a conquista; no motor, o Desafio do dia já o reservava ao goleiro. Os outros recordes valem para qualquer posição (gols, assistências, títulos, jogos e prêmios).
- **Seleção nos detalhes da temporada.** As competições de seleção só aparecem em "Competições da temporada" quando o jogador entrou em campo por ela no ano. Sem convocação, a Copa do Mundo da seleção não aparece como se fosse dele.
- **Folha mais alta.** A folha que abre "O último lance" (e as outras folhas) cresce até `min(94dvh, 1100px)` antes de rolar; antes parava em `min(88dvh, 780px)`. No PC os detalhes da temporada cabem inteiros na maior parte dos anos.
- **Início sem "Editar jogador".** O botão debaixo da carta saiu do Início; o jogador é montado em "Começar carreira".
- **Selo de recorde do jornal.** O selo virou uma medalha: estrelas da faixa (uma no Clássico, quatro no Lendário) com o nome da faixa, uma fita com "Recorde quebrado" ou "Recorde igualado", o nome do recorde e o duelo em dois números (detentor e você). Superado é dourado com um brilho que passa uma vez; igualado tem a cor da faixa. O selo fica no lugar da foto do escudo, no fluxo da página, e não cobre mais a manchete. Correção: ao virar a página, o selo da edição seguinte aparecia antes do papel, fixo por cima da folha que ainda girava. A página agora isola o empilhamento (`isolation: isolate`), as cópias que giram não carimbam, e a batida do carimbo só toca quando a página assenta.
- **Última página é a despedida.** Numa carreira encerrada, a última edição do jornal sempre abre com o ângulo novo `farewell` ("Obrigado, {nome}", "Aos 35, {nome} diz adeus", "O último apito para {nome}"...), com uma linha de apoio que resume a carreira (jogos, gols ou jogos sem sofrer gol, e títulos, os mesmos números do rodapé "Até aqui na carreira"). Um recorde alcançado no último ano continua no selo. Carreira em andamento não tem despedida.

**Como ficou (D95).** `leagueCleanSheets` em `packages/content/src/records.ts` devolve 0 fora do gol. `SeasonCompetitions` em `screens/career/PlayFeed.tsx` só lista torneios de seleção com `national.games > 0`. `.sheet-popup` em `styles/components.css`. `RecordSeal` (`stamp`, `TIER_STARS`) e `FrontPage` (`stamp`) em `screens/summary/Newspaper.tsx`; estilos `.paper-record-*` em `styles/summary.css`. Ângulo `farewell` em `COVER_ANGLES`, `CoverFacts.final`, textos em `locales/cover.*.ts` e o plural `stats.titlesCount`. O laboratório (Design, partida) mostra o selo lendário superado e o clássico igualado com o nome de detentor mais longo.

## Revisão D96: tabela da liga, recordes que ainda podem mudar, jornal sem transbordo e desafio mais limpo (27/10/2026)

Motor `2.0.0-m30`.

- **Tabela da liga no jogo decisivo de liga.** Embaixo das opções (e, no resultado, embaixo do placar final) aparece a tabela da liga na rodada do jogo, rolável por dentro, com o clube do jogador em destaque e o adversário marcado. Ela abre centrada no clube; se ele já aparece com a lista no topo, fica no topo, do primeiro para baixo. Quando o lance termina, a rodada inteira fecha: o clube e o adversário somam pelo placar final, os outros somam 3, 1 ou 0, a tabela se reordena com animação e mostra quem subiu ou caiu e quantos pontos cada um somou. Como funciona: o mundo condensado só tem a tabela final do ano; `leagueSnapshot` (`career/leagueTable.ts`) usa a prévia do ano que o motor já monta para planejar os jogos (`seasonPreview`, a mesma de antes), sorteia a rodada entre 70% e 95% do campeonato (fluxo `drama/leagueRound`) e dá a cada clube os pontos no ritmo que o levou ao lugar final; `leagueAfter` fecha a rodada. A foto é tirada uma vez por lance, para não mudar entre o lance e o resultado. Só mostra: nenhuma carreira muda por causa dela. Em celular baixo (até 700 px de altura), a tabela some para o laço caber na tela (substituído na D98: tamanho medido e fixo, com a faixa em tela baixa).
- **Selo do resultado da terceira opção.** Segurar o jogo deixou de mostrar sempre "Decisão certeira". O selo diz o que aconteceu: "Vitória segurada" e "Empate segurado" na liga, "Vaga garantida" e "Taça garantida" no mata-mata, e "Não foi o suficiente" quando o lance deu certo mas o time perdeu (nos pênaltis, por exemplo). Lance que não deu certo continua "Jogada adversária".
- **Recordes à vista só enquanto podem mudar.** Nos detalhes da temporada, a lista mostra só o que a próxima temporada ainda pode mudar: somas da carreira (gols, títulos, jogos, Champions...) e sequências que ainda correm, contadas pelo tamanho atual. Recordes de uma temporada só (gols, assistências e jogos sem sofrer gol numa temporada) recomeçam todo ano e saem da vista; sequência quebrada também. O resumo da carreira continua mostrando tudo o que ficou perto (`recordChases`); a carreira usa `liveRecordChases`.
- **"Uma semana sem holofotes" saiu do jogo.** O catálogo passa de 39 para 38 acontecimentos. Muda o sorteio de eventos de carreira: motor `2.0.0-m30`, amostras de navegador reconstruídas.
- **Jornal sem texto fora da página.** Os lances da página de dentro usavam a competição como chave do item; dois lances da mesma competição no ano (dois jogos de liga, por exemplo) davam chaves repetidas, e ao virar a página o React deixava itens de outra edição para trás: quatro lances empilhados e texto descendo para fora do jornal, inclusive ao só segurar a folha. A chave agora é única (o mesmo conserto no resumo dos lances da temporada). A folha também corta o que passar da altura dela e cada história tem no máximo cinco linhas; a leitura ampliada continua sem corte.
- **Nome do jogador no selo.** O selo de recorde do jornal mostra o nome do jogador no lugar de "Você".
- **Números de cada clube na linha do tempo.** Como a estreia na seleção já mostrava, cada passagem por clube mostra jogos, gols e assistências ali; com temporadas no gol ou na defesa, também os jogos sem sofrer gol; o goleiro puro mostra jogos e jogos sem sofrer gol.
- **Desafio do dia mais limpo.** A entrada do desafio tem a data como título, o relógio em selo, a bandeira grande com a posição, as regras fixas em quatro selos curtos (Difícil, 1 decisão a cada 2 anos, Fim a partir dos 27, Valem as 2 melhores missões), as missões, o recorde do dia quando houver e o édito, que já diz o que acontece se for descumprido. "Seu jogador" tem a aparência, o nome e o número. À direita, o botão Jogar em destaque, uma linha sobre a ranqueada, Voltar, o ranking do dia e as suas ranqueadas. Saíram as notas repetidas: a regra da meia-noite UTC, a frase sobre o que é livre, o aviso do édito repetido, a nota do ranking e a explicação de "Limpas" (agora na dica do rótulo).

**Como ficou (D96).** `career/leagueTable.ts` (`leagueSnapshot`, `leagueAfter`, `LEAGUE_ROUND`) e `seasonPreview` em `career/drama.ts`; `LeagueLive` em `screens/career/LeagueLive.tsx`, estilos `.league-live*` em `styles/drama.css`. Selo da terceira opção em `MatchOutcome.tsx` com as chaves `hold*` de `i18n/decisionFeedback.ts`. `liveRecordChases` em `packages/content/src/records.ts`. `silentWeek` removido de `events/catalog.ts` e dos textos. Chave dos lances em `Newspaper.tsx` e `SeasonDrama.tsx`; corte da folha no fim de `styles/summary.css`. `StintNumbers` em `SummarySections.tsx`. Entrada do desafio em `screens/challenge/ChallengeScreen.tsx` e `styles/challenge.css`.

## Revisão D97: números de clube e seleção juntos, tabela que se ajeita e capa do jornal sem sobreposição (27/10/2026)

Motor `2.0.0-m30`, sem mudança de carreira.

- **Números da carreira somam clube e seleção.** `careerTotals` passa a contar em `games`, `goals`, `assists` e `cleanSheets` os jogos de clube e os da seleção; a parte da seleção continua em `nationalGames`, `nationalGoals` e os novos `nationalAssists` e `nationalCleanSheets`. Vale para o painel da carreira, o resumo, o Hall, a biografia, a despedida e o rodapé "Até aqui na carreira" do jornal. Os recordes já somavam clube e seleção desde a D92 (gols, jogos), então nenhum recorde, missão ou meta muda; os números de uma temporada (a caixa "Os números" do jornal, recordes de temporada) seguem sendo do clube. Só apresentação: o motor das carreiras não muda.
- **Assistências pela seleção.** O motor já contava as assistências da seleção (e o peso delas no legado nacional); agora `nationalLegacy` as devolve, com os jogos sem sofrer gol, e a estreia na seleção da linha do tempo mostra jogos · gols · assistências pela mesma regra dos clubes (goleiro puro: jogos e jogos sem sofrer gol; quem jogou atrás também vê os jogos sem sofrer gol).
- **A tabela da liga se ajeita à vista.** No resultado, a tabela abre como estava e, meio segundo depois, a rodada fecha: as linhas deslizam para o lugar novo em 0,8 s, as setas de quem subiu ou caiu aparecem e a linha do clube acende. Com movimento reduzido, fecha direto.
- **Mais tempo no resultado do lance.** O resultado do jogo decisivo segue sozinho para a próxima decisão depois de 3 s (eram 2,1 s); o botão Continuar segue na hora.
- **Capa do jornal sem caixa por cima de caixa.** A caixa de conquistas mantinha a altura mínima e deixava a lista vazar por cima dos selos da temporada (Acesso, lesão). Agora ela não encolhe, cada nome fica numa linha só (o nome inteiro na dica), "Também nesta temporada" continua a parte que cede e a coluna corta o que sobrar. Conferido página a página em todas as amostras de navegador, no PC e no celular.

**Como ficou (D97).** `careerTotals` em `career/history.ts` e `nationalLegacy` em `season/nationalLegacy.ts`; `NumbersLine` em `screens/summary/SummarySections.tsx`; rodapé do jornal em `Newspaper.tsx` e totais da despedida em `packages/content/src/cover.ts`. `SETTLE_DELAY_MS` e `SETTLE_MS` em `LeagueLive.tsx`, animações `league-move` e `league-me` em `styles/drama.css`. `RESULT_READING_MS` em `features/career/useSeasonFlow.ts`. Bloco D97 no fim de `styles/summary.css`.

## Revisão D98: tabela da liga fixa e animada, 2,5 s no resultado e aba Seleção completa (27/10/2026)

Motor `2.0.0-m30`, sem mudança de carreira.

- **Tabela da liga de tamanho fixo, presa ao pé do card.** É uma peça só do lance ao resultado (antes eram duas, uma sob as opções e outra sob o resultado, e por isso mudava de lugar e de tamanho). O tamanho é medido uma vez, com as opções na tela, que é o estado mais alto do card, e fica o mesmo até seguir: nunca cresce, encolhe nem se mexe. Com espaço, a tabela tem 150 px (cinco linhas à vista, o resto rola por dentro); com menos, fica com o que sobra, desde que caibam três linhas (112 px); com menos ainda, vira a **faixa**: uma linha de 46 px com os clubes em volta do jogador (posição, escudo e pontos; o nome na dica e no leitor de tela), que reordena do mesmo jeito; sem espaço nem para a faixa, não aparece nesse jogo. Nos jogos de liga as opções ficam um pouco mais baixas para caber. Medido em 1440 × 900, 1920 × 1080, 768 × 1024 e 412 × 915 (tabela), 360 × 740 (tabela de três linhas), 1366 × 768 e 390 × 800 (faixa): mesma posição e altura antes e depois do lance, sem rolar o card.
- **Tabela mais animada.** As linhas entram em cascata; um ponto pulsa "ao vivo" até o resultado; no resultado, a tabela respira, a rodada fecha, as linhas trocam de lugar em 0,9 s, os pontos sobem contando, as posições de quem subiu ficam verdes e as de quem caiu vermelhas, quem venceu ganha um fundo verde, a posição do clube do jogador pulsa e um brilho atravessa a tabela. Com movimento reduzido, nada disso: fecha direto.
- **Resultado do lance em 2,5 s.** O resultado do jogo decisivo segue sozinho depois de 2,5 s (eram 3 s na D97).
- **Aba Seleção completa.** Jogos, gols, assistências, jogos sem sofrer gol (para quem jogou atrás), títulos e estreia; goleiro puro vê jogos sem sofrer gol no lugar de gols e assistências, como na linha do tempo. Os títulos contam só os torneios que ele disputou, como a lista de torneios.
- **O resultado do jogo de liga muda a tabela final.** Já era assim desde a D89 (`keyLeague`, `world/keyMatches.ts`): a diferença de pontos entre o placar na hora do lance e o placar final vai para o clube do jogador e para o adversário na tabela do ano, que se reordena. Virar uma derrota em vitória vale 3 pontos e pode dar o título ou tirar do rebaixamento.

**Como ficou (D98).** `LeagueLive.tsx` (`FULL_HEIGHT`, `MIN_HEIGHT`, `STRIP_HEIGHT`, `SETTLE_DELAY_MS`, `SETTLE_MS`, `CountUp`), renderizada uma vez no fim de `DramaDecisionPanel.tsx`; estilos D98 no fim de `styles/drama.css`. `RESULT_READING_MS = 2500` em `features/career/useSeasonFlow.ts`. `NationPanel` em `screens/career/CareerPanels.tsx`, chaves `career.nation.assists`, `cleanSheets` e `titles`.

## Revisão D99: pular resultado nos Ajustes, segurar para ler, resumo sem biografia (27/10/2026)

Motor `2.0.0-m30`, sem mudança de carreira. A seção 25 (biografia) e as menções à biografia nas seções anteriores ficam como registro; não valem mais.

- **Pular resultado automaticamente (Ajustes).** Preferência nova, ligada por padrão: o resultado do lance segue sozinho para a próxima decisão depois de 2,5 s. Desligada, o resultado espera o botão Continuar. Fica em Ajustes (logo depois de Animações) e no laboratório, em Controles. Preferência `autoAdvance` em `store/prefs.ts`.
- **Segurar o clique segura o resultado.** Com o avanço automático ligado, segurar o clique (ou o dedo) em qualquer ponto do card da decisão para o relógio; ao soltar, ele retoma de onde parou. Sem nenhum desenho novo: só a lógica, como já acontecia com a aba escondida.
- **Resumo reorganizado.** Os capítulos ficam na ordem Números, Troféus, Linha do tempo, Jornal e Hipotético (o capítulo do Desafio, quando há, continua em primeiro).
- **A biografia saiu do jogo.** Saem o capítulo do resumo, a prévia no laboratório (Fim de carreira mostra só o pôster), o gerador (`biography`, `bioFacts`, temas e capítulos), os textos nos três idiomas (`locales/bio.*`), os estilos e os testes dela, e o efeito `story` dos acontecimentos, que não fazia nada no jogo e só servia de marca para a biografia (sete marcas no catálogo). As passagens por clube, que a linha do tempo e o pôster usam, ficam em `packages/content/src/stints.ts` (`stintsOf`). Nenhuma carreira muda: o efeito `story` era ignorado pelo motor.
- **Teste de recordes por posição (só medição, nada mudou).** 900 Fenômenos por posição, jogados até o fim pelos três lotes da ferramenta de recordes. Gols numa temporada (73): PE e PD igualaram em 0,11% (1 carreira cada; melhor 78 e 79), CA em 2,78% (melhor 80), MEI em 0,11% (melhor 76). Assistências numa temporada (32): PE 2,11% (melhor 36), PD 2,44% (melhor 35), CA 3,33% (melhor 38), MEI 48,89% (melhor 41, mediana 31), MC 6,56%. Todos conseguem; o MEI consegue o de assistências em quase metade das carreiras de Fenômeno.

**Como ficou (D99).** `autoAdvance` em `store/prefs.ts`, chaves `settings.autoAdvance` e `settings.autoAdvanceHint`, interruptor em `SettingsPanel.tsx` e em `lab/sections/Controls.tsx`. Relógio com pausa por aba escondida e por clique segurado dentro de `.season-decision-window` em `features/career/useSeasonFlow.ts`. `CHAPTERS` em `screens/summary/SummaryView.tsx`. `stintsOf` em `packages/content/src/stints.ts`; `packages/content/src/biography/` e `locales/bio.*` apagados. Teste ponta a ponta em `e2e/d99.spec.ts`.

## Revisão D100: pontas e meias perto dos recordes, MEI menos certeiro nas assistências (27/10/2026)

Motor `2.0.0-m31`. A tabela de `SCORING` da seção da produção e as caudas da D63 e da D92 ficam como registro; os números abaixo prevalecem.

- **Metas por posição (pedido do usuário), em Fenômenos jogados até o fim.** Gols numa temporada (73): pontas perto de 2%, MEI perto de 1% e abaixo. Assistências numa temporada (32): pontas perto de 4%, MEI de 5% para cima (era 49%).
- **Produção (`SCORING`).** Pontas: gols 0,24 para **0,285**, assistências 0,17 para **0,19**. MEI: gols 0,22 para **0,28**, assistências 0,22 para **0,15**. As outras posições não mudam.
- **Peso do nível por posição (`LEVEL_BY_POSITION`, novo).** O coeficiente de nível dos gols, 0,032 para todos, passa a **0,05** para pontas e MEI: quem sobra em campo transforma a sobra em gols, o que abre a temporada recorde para o Fenômeno sem mexer tanto na temporada comum, que joga perto do nível da oposição. As assistências seguem 0,045 para todos.
- **Teto em relação ao centroavante (`STRIKER_CEILING`, novo).** Com a finalização comum, o centroavante segue finalizando mais que todos, na ordem CA, ponta, MEI, meia aberto, MC. O finalizador de elite da ponta pode passar o centroavante com os mesmos números, que é o que abre a temporada recorde para ele, mas no máximo **130%** dele (MEI **125%**). Medido: um teto em 97% (ninguém passa o centroavante) derrubava as pontas para 0,15% no recorde de gols, e em 115%, para 0,75%; a meta de 2% exige o finalizador de elite acima do centroavante.
- **Regra da D68 revista.** A D68 pedia o ponta excepcional de finalização comum abaixo de 65% do centroavante e a ordem das funções com finalização 99. Agora: abaixo de 92% com finalização comum, a ordem das funções com finalização comum (CA, ponta, MEI, meia aberto, MC) e com finalização 99 entre as outras posições, e o ponta de elite com no máximo 55 gols esperados em 50 jogos (eram 50). Testes em `test/d68.test.ts`.
- **Caudas de recorde (`PRESSURE`).** Com pontas e meias fazendo mais gols, três marcas saíram da faixa de raridade e voltaram: gols numa temporada começa a afinar em **72** (era 73; o 73º gol já passa por sorteio), gols na carreira em **880** (era 930) e gols pela seleção em **132** (era 146). Bolas de Ouro seguidas, que já estava acima da faixa lendária antes da D100, passa a afinar a partir da **terceira** seguida, escala **1,5** (era quarta, escala 3).
- **Assistências numa temporada vira Raro.** Era Clássico (6% a 15% das carreiras de Fenômeno de ataque); com o MEI na casa dos 7%, as pontas perto de 4% e o centroavante abaixo de 1%, o lote de ataque dá cerca de 4%, a faixa Rara (2% a 5%). O selo da conquista muda junto.
- **Medido (1.800 Fenômenos por posição, duas sementes).** Gols numa temporada: PE 1,5%, PD 2,2% (pontas 1,9%), MEI 0,7%, CA 2,4%. Assistências numa temporada: PE 3,4%, PD 3,7%, MEI 7,2%, CA 0,7%. Medianas da melhor temporada: pontas 38 gols e 22 assistências; MEI 35 gols e 23 assistências; CA 48 gols.
- **Relatório de recordes (`pnpm balance:recordes`, semente padrão).** Gols numa temporada 1,44%, gols na carreira 0,61%, gols pela seleção 0,33%, assistências numa temporada 4,06% (Raro), Bolas de Ouro seguidas 0,39%: todas na faixa. Três marcas lendárias ficam marcadas porque alguém as alcança mas ninguém as supera no lote: Bolas de Ouro (8), Bolas de Ouro seguidas (4) e Premier League (13, já assim antes da D100). Em outra semente, Premier League foi superada; com alcance de 0,2% a 0,3%, superar no lote de 1.800 é questão de amostra.
- **Muda o resultado das carreiras.** Motor `2.0.0-m31`, amostras de navegador reconstruídas em m31, as 51 metas do GDD 40 atendidas.

**Como ficou (D100).** `SCORING`, `LEVEL_BY_POSITION`, `STRIKER_CEILING` e `STRIKER_CEILING_BY_POSITION` em `packages/engine/src/season/production.ts`; `PRESSURE` em `records/pressure.ts`; faixa de `seasonAssists` em `packages/content/src/records.ts` e `tools/balance/src/records.ts`; `runRecordCareers` aceita medir só algumas posições.

## Revisão D101: centroavante perto do recorde, vitrine com Bola e Chuteira primeiro, jornal com o recorde de mais valor (28/10/2026)

Motor `2.0.0-m32`.

- **Centroavante Fenômeno bate o recorde de gols numa temporada em 5% ou mais.** O peso do nível nos gols do centroavante passa de 0,032 para **0,039** (`LEVEL_BY_POSITION.st`): o centroavante que sobra em campo faz mais gols. O teto das outras posições (D100) continua medido contra o centroavante de peso 0,032, para pontas e MEI não mudarem. MEI: gols 0,28 para **0,275**, para seguir perto e abaixo de 1%.
- **Medido (1.800 Fenômenos por posição, duas sementes).** Recorde de gols numa temporada: CA 5,8%, PE e PD cerca de 2%, MEI perto de 0,8%. Assistências: pontas cerca de 3,6%, MEI 7,5%, CA cerca de 1%. Mediana da melhor temporada do CA: 53 gols (eram 48).
- **Gols numa temporada vira Raro.** Era Épico (0,5% a 1,5%); com o centroavante em 5% ou mais, o lote de ataque dá 2,6%, faixa Rara (2% a 5%). O selo da conquista muda junto.
- **Caudas (`PRESSURE`).** Com o centroavante marcando mais, voltaram para a faixa: gols na carreira começa a afinar em **870** (era 880), gols pela seleção em **126** (era 132) e Chuteiras de Ouro passa a afinar a partir da **sexta**, escala **1,2** (era sétima, escala 3,5). Relatório na semente padrão: gols numa temporada 2,61% (Raro), gols na carreira 1,11%, gols pela seleção 0,22%, assistências 3,94%, Chuteiras de Ouro 0,33%. Quatro marcas lendárias seguem alcançadas mas não superadas no lote: Bolas de Ouro, Bolas de Ouro seguidas, Chuteiras de Ouro e Premier League.
- **Vitrine: troféus primeiro, prêmios depois, com duas exceções.** A Bola de Ouro e a Chuteira de Ouro, quando ganhas, abrem a vitrine antes de todas as taças; depois vêm os troféus, pela importância, e então os outros prêmios (Luva de Ouro, Rei da América, Revelação, craque e artilheiro de competição). Vale para a vitrine da carreira, a linha do tempo e as conquistas do jornal (`compareHonours`).
- **Dois ou mais recordes no mesmo ano.** O jornal abre a capa com um recorde só e o selo conta os outros ("+N"). O escolhido é o superado (antes do igualado) de mais valor: lendário, épico, raro e clássico; no empate, a ordem do catálogo.
- **Ajustes.** "Pular resultado automaticamente" fica sem a frase de explicação, nos Ajustes e no laboratório.
- **Muda o resultado das carreiras.** Motor `2.0.0-m32`, amostras de navegador reconstruídas em m32.

**Como ficou (D101).** `LEVEL_BY_POSITION.st` e `SCORING.cam` em `packages/engine/src/season/production.ts`; `PRESSURE` em `records/pressure.ts`; faixa de `seasonGoals` em `packages/content/src/records.ts` e `tools/balance/src/records.ts`; ordem por valor em `recordsReachedIn` (`packages/content/src/records.ts`); `GLOBAL_AWARDS` em `packages/world/src/honourOrder.ts` e `showcaseItems` em `apps/game/src/features/summary/showcase.ts` só por `compareHonours`.

## Revisão D102: centroavante Fenômeno entre 4% e 5% no recorde de gols (28/10/2026)

Motor `2.0.0-m33`. Prevalece sobre o peso do centroavante e a escala das Chuteiras de Ouro da D101.

- **Centroavante Fenômeno entre 4% e 5% no recorde de gols numa temporada (pedido do usuário).** O peso do nível nos gols do centroavante passa de 0,039 (D101) para **0,0365** (`LEVEL_BY_POSITION.st`). Pontas e MEI não mudam: o teto deles continua medido contra o centroavante de peso 0,032.
- **Como foi medido.** Lotes de 900 Fenômenos centroavantes (três políticas, jogados até o fim), muitas sementes de cada vez. Com 0,039: 6,56% em 3.600 carreiras. Com 0,0355: 4,30% e com 0,0358: 4,46% nas mesmas 5.400. Com **0,0365**: 4,44% em 10.800 carreiras, 4,80% em outras 5.400 e 4,23% em 10.800 sementes novas, nunca usadas no ajuste; ao todo, **4,43% em 27.000 carreiras** (margem de cerca de 0,25 ponto). Lotes de 900 variam de 3,6% a 5,1% só pela amostra. A mediana da melhor temporada do centroavante Fenômeno fica em 52 gols.
- **Recordes (`pnpm balance:recordes`).** Na semente padrão: gols numa temporada 2,00% (Raro, 2% a 5%), gols na carreira 0,83%, gols pela seleção 0,17%, assistências 3,94%. Na segunda semente, gols numa temporada 2,67%: a média do ataque fica perto de 2,3% (CA 4,4%, pontas cerca de 2%, MEI 0,8%), dentro da faixa Rara. Chuteiras de Ouro ficou em 0,17% e 0,06% nas duas sementes (média dentro da faixa lendária); a cauda delas afina com escala **1,6** (era 1,2 na D101), o que deixa passar da marca mais possível. As mesmas quatro marcas lendárias da D101 seguem alcançadas mas não superadas no lote.
- **Muda o resultado das carreiras.** Motor `2.0.0-m33`, amostras de navegador reconstruídas em m33.

**Como ficou (D102).** `LEVEL_BY_POSITION.st` em `packages/engine/src/season/production.ts`; `PRESSURE.goldenShoes` em `records/pressure.ts`.

## Revisão D103: superar Bola de Ouro, sequência de Bolas e Chuteiras de Ouro fica possível (28/10/2026)

Motor `2.0.0-m34`.

- **Na marca real, a pressão do recorde para de crescer (`Tail.mark`).** Até a marca, cada conquista a mais custa mais sorte; passar da marca custa o mesmo que alcançá-la. Vale para três recordes que ninguém superava em 21.600 carreiras de Fenômeno (D44 pede superar raro, mas possível): **Bolas de Ouro** (marca 8: a 9ª fica com 45% de chance, como a 8ª, em vez de 30%), **Bolas de Ouro seguidas** (marca 4: a 5ª seguida fica com 51%, como a 4ª, em vez de 26%) e **Chuteiras de Ouro** (marca 6: a 7ª fica com 54%, como a 6ª, em vez de 29%). Alcançar a marca continua exatamente tão raro quanto antes. As outras caudas não mudam.
- **Medido (21.600 Fenômenos de ataque: CA, MEI, PE e PD, seis sementes).** Bolas de Ouro: alcança 0,27%, supera 0,032% (12% de quem alcança; antes, 0 em 29). Bolas seguidas: alcança 0,30%, supera 0,023% (8% de quem alcança). Chuteiras de Ouro: alcança 0,27%, supera 0,042% (15% de quem alcança).
- **O relatório de recordes.** Na semente padrão, Bolas de Ouro seguidas passa a ser superada no lote; Bolas de Ouro e Chuteiras de Ouro ainda aparecem marcadas, porque o lote do relatório tem 1.800 carreiras de ataque e só 3 ou 4 chegam à marca: com 12% a 15% de quem alcança superando, o lote espera perto de meia carreira que supere. A medição grande acima é a prova de que superar é possível.
- **Tabela por posição (D102, 1.800 Fenômenos por posição, a mesma conta de recordes do jogo).** Gols numa temporada: CA 4,2%, PE 2,1%, PD 2,2%, MEI 0,39%, ME e MD perto de 0,15%, MC 0,11%, defensores e goleiro 0. Assistências numa temporada: ME 8,8%, MEI 8,4%, MD 7,4%, PE 4,9%, PD 4,1%, MC 1,1%, LE 0,94%, CA e LD 0,67%. Jogos sem sofrer gol numa temporada de liga: goleiro 10,7%. Jogos pela seleção: goleiro 23%, zagueiro 16%, demais de 5% a 10%. Títulos e ligas dependem do clube e quase não mudam com a posição.
- **Muda o resultado das carreiras.** Motor `2.0.0-m34`, amostras de navegador reconstruídas em m34.

**Como ficou (D103).** Campo `mark` em `Tail` e no cálculo do expoente (`records/pressure.ts`); `PRESSURE.ballonDor`, `PRESSURE.ballonStreak` e `PRESSURE.goldenShoes` com `mark`. Teste em `test/records.test.ts`.

## Revisão D104: o centroavante alcança o recorde de gols pela seleção (28/10/2026)

Motor `2.0.0-m35`.

- **O centroavante passa a bater o recorde de gols pela seleção.** Na tabela por posição da D102, o CA nunca chegava aos 146, embora fosse quem mais chegava perto (55 de 900 Fenômenos com 130 ou mais). A cauda começava a afinar em 126 com escala 22 e empilhava todos entre 130 e 144. Agora ela começa em **138**, escala **7**: até 138 o gol entra livre, e daí para a frente cada gol pede mais sorte.
- **Medido (1.800 Fenômenos por posição).** Alcança 146: CA 0,33%, PE 0,28%, PD 0,44%, MEI 0 (o MEI chega a 143); supera: CA 0,17%, PE e PD 0,22%. Ataque inteiro 0,26%. No relatório da semente padrão, 0,33% (faixa lendária, 0,1% a 0,4%), com superação no lote.
- **Muda o resultado das carreiras.** Motor `2.0.0-m35`, amostras de navegador reconstruídas em m35.

**Como ficou (D104).** `PRESSURE.nationalGoals` em `packages/engine/src/records/pressure.ts`.

## Revisão D105: goleiro na seleção perto de 12%, Jogos de Champions League e talentos abaixo do Fenômeno (29/10/2026)

Motor `2.0.0-m36`.

- **Jogos pela seleção do goleiro perto de 12%.** O goleiro chegava aos 234 jogos pela seleção em 23% das carreiras de Fenômeno, o dobro do teto da faixa Clássica (6% a 15%): virava recorde garantido. A cauda dos jogos pela seleção do goleiro começa em **216** (`PRESSURE.capsKeeper`; a das outras posições segue em 224). Medido: 12,6% a 13,2% (5.400 goleiros Fenômeno). As outras posições não mudam.
- **Recorde novo: Jogos de Champions League (Cristiano Ronaldo, 183; UEFA e Guinness).** Faixa Clássica, contada pelos jogos na Champions League das linhas de competição da temporada. É o recorde de carreira longa em clube grande, e por isso a meta natural das posições de trás: Fenômeno GOL 17,7%, ZAG 14,2%, VOL 14,1%, LE e LD cerca de 12,5%, ataque de 10% a 12,6%. No relatório da semente padrão, 14,27%. Textos nos três idiomas.
- **Por que não um recorde de gols de defensor.** Pesquisado: o recorde de gols de um defensor é de Ronald Koeman (cerca de 253 na carreira; as fontes divergem entre 193 só de liga, 239 e 253), com 113 de pênalti e 60 de falta; o segundo é Daniel Passarella (175); pela seleção, Sergio Ramos (23 pela Espanha). Um zagueiro Fenômeno faz no jogo de 20 (mediana) a 54 gols na carreira e no máximo 11 pela seleção: a marca exigiria um batedor de pênalti e falta, que o jogo não tem. Ficaria inalcançável, contra a regra da D44.
- **Talentos abaixo do Fenômeno (medição, sem mudança).** Com 1.800 carreiras por posição e faixa: **Estrela** vê recorde de vez em quando em toda posição (CA gols numa temporada 1,8%, MEI assistências 2,6%, GOL jogos sem sofrer gol 3,2%, ZAG títulos 3,3%, ligas e Champions de 0,2% a 2%), e quase nunca os individuais grandes (Bola de Ouro 0, gols na carreira só o CA 0,39%). **Craque** fica quase tudo entre 0 e 0,4% (GOL jogos sem sofrer gol 1,2%, MEI assistências 0,78%, CA gols numa temporada 0,39%, títulos continentais e de liga perto de 0,1% a 0,3%): possível, mas raro, como pedido.
- **Ferramenta.** `runRecordCareers` aceita a faixa de talento, para medir Craque e Estrela.
- **Muda o resultado das carreiras.** Motor `2.0.0-m36`, amostras de navegador reconstruídas em m36.

**Como ficou (D105).** `PRESSURE.capsKeeper` em `packages/engine/src/records/pressure.ts`, usado em `season/playerSeason.ts` para o goleiro; `championsGames` em `packages/content/src/records.ts`, nos textos `locales/records.*.ts` e em `tools/balance/src/records.ts`.

## Revisão D106: Bola de Ouro com protagonismo, legado pela tradição, empresário, bolinhas e personagem (29/10/2026)

Motor `2.0.0-m37`. Esta revisão prevalece sobre a GDD 13 (Bola de Ouro), a regra de legado na seleção da D71, o ritmo Rápida da D78 e o tempo de leitura da D98.

- **Bola de Ouro com protagonismo e títulos em escada.** A nota do jogador continua sendo OVR, produção, fama, prestígio e posição; mudam os títulos e entra o protagonismo.
  - **Títulos em escada** (`BALLON_TITLE`, `BALLON_TITLE_STEPS`): Copa do Mundo 4,2, Champions (continental principal) 2,5, Eurocopa ou Copa América 1,6, liga 1, continental secundário 0,7, Mundial de Clubes 0,6, copa nacional e continental terciário 0,35, intercontinental 0,3, supercopa continental 0,2, copa da liga 0,15, supercopa nacional 0,1; segunda divisão não conta. O maior título conta inteiro e os seguintes 70%, 50%, 35%, 25% e 20%: ganhar a Copa e a Champions é o melhor ano, mas três copas menores não somam uma Champions.
  - **Ano de Copa** (`WORLD_CUP_SHADOW` 0,85): quem não ganhou a Copa vê os títulos de clube pesarem 85%. Com a campeã conhecida, a elite daquela seleção leva 60% da Copa (`ELITE_CHAMPION_SHARE`), e o resto da elite também carrega a sombra.
  - **Título decidido por ele** (`STARRED_TITLE` 1,25): a competição em que o lance de protagonista do jogo-chave deu certo pesa 25% a mais.
  - **Protagonismo** (`SPOTLIGHT`): cada jogo-chave em que ele assume a jogada (ou a cobrança) soma 0,25, mais 0,35 se deu certo, vezes o peso da fase (liga 0,7, quartas 0,9, semifinal 1,1, final 1,4) e 1,15 pela seleção, até **2,2** pontos na nota (o goleiro leva metade). O teto e a chance menor do lance ousado impedem a fazenda de Bola de Ouro. A opção diz "Mais protagonismo." (D107: sem citar a Bola de Ouro).
  - **Rei da América igual:** o prêmio das Américas usa a mesma escada de títulos (sem a sombra do ano de Copa) e o mesmo protagonismo, com desconto de 1,1 (`AMERICA_RECALIBRATION`) para não inflar: por temporada elegível, a frequência fica como antes (CA 18,7%, ZAG 16,8%, MC 8,6%), e quem ousa duas ou mais vezes ganha mais (CA 26,6%).
  - **Recalibragem:** força do campo 9,0 (era 8,25) e desconto do goleiro 13 (era 11).
  - **Medido (300 Fenômenos por posição, temporadas com OVR 90 ou mais):** atacante ganha em 54% dos anos de Copa sem Champions e 44% dos anos de Champions sem Copa (eram 23% e 43%); Copa e Champions juntas, de 62% (ZAG) a 100% (CA). Sem título grande ainda dá (cerca de 1%, como a temporada de 2025 de Harry Kane). Quem ousa 3 ou mais vezes no ano ganha de 3 a 5 vezes mais que quem nunca ousa. Bolas por carreira: CA 1,07, PE 0,82, MEI 0,87, MC 0,51, VOL 0,34, ZAG 0,23, LE 0,23, GOL 0,01 (0,7% dos goleiros Fenômeno ganham uma, raríssimo como na D90). No total, 18,8% dos Fenômenos ganham ao menos uma (2.400 carreiras).
  - **Fora da Europa, raro mas possível:** a temporada histórica fora da Europa (OVR 91 ou mais, 38 jogos, continental principal ou Copa, 50 gols mais metade das assistências, ou 28 jogos sem sofrer gol) tira o desconto de 8 e deixa 1 (`outsideHistoricPenalty`), com 60% de o voto se confirmar (`outsideEuropeChance`). Medido: 0,42% das carreiras de Fenômeno (1 em 240) ganham uma Bola de Ouro jogando fora da Europa; antes, nenhuma em 2.400.
- **Legado na seleção pela tradição do país.** `WORLD_CUP_TITLES` (packages/world) guarda as campeãs do mundo: Brasil 5, Alemanha 4, Itália 4, Argentina 3, França 2, Uruguai 2, Inglaterra 1, Espanha 1. Nelas, só a Copa do Mundo faz uma lenda; com números de lenda e sem a Copa, o jogador fica como ídolo, e o resumo diz por quê. Seleção forte sem Copa (força 82 ou mais, como Portugal, Holanda e Bélgica) cobra a Copa ou o título continental. As outras fazem lenda com números e protagonismo, e nelas o título continental pesa mais (até 1,6 vez).
- **Troca de empresário com efeito garantido.** Deu certo ou errado, a decisão seguinte é uma janela de transferências com proposta garantida: propostas melhores que o normal (`agentUp`) ou piores (`agentDown`), com ficar no clube como opção. O evento só aparece até os 29 anos (era 32). Os textos dizem exatamente isso.
- **Concorrência na posição só quando faz sentido.** O clube não contrata um concorrente para quem está mais de 6 pontos de OVR acima da força do elenco (condição `clubGap`). Perto disso, brigar pela vaga fica mais fácil: +4% de chance por ponto acima da força, de -2 a +6 (`gapEdge`).
- **Ritmo Normal: nenhuma temporada abre sem decisão principal.** Quando a janela não tinha proposta, não sobrava treino possível (atributos no teto) e nem a proposta garantida aparecia, o ano começava direto num jogo-chave. Agora esse ano abre com a promessa da temporada, que é decisão principal. O ritmo Rápida segue como antes: a decisão principal e até um jogo-chave por ano, até três decisões nas duas temporadas.
- **Bolinhas da temporada clicáveis.** A bolinha de uma decisão já respondida no ano abre o resultado dela, só para ler: a decisão principal com o cartão do resultado e "Sua escolha" marcada, o jogo-chave com o placar e o desfecho. A bolinha atual (ou "Voltar à decisão atual") volta para a decisão em aberto. Nada volta no tempo.
- **Resultado do lance em 3 s** (eram 2,5 s na D98), com o mesmo ajuste de pular automaticamente.
- **Jogo-chave e jornal com mais variação.** O título grande do jogo-chave fala do momento (final, desvantagem, acréscimos, seleção, pênaltis), com variantes que não se repetem em duas decisões seguidas; o nome da cena ("Domínio na área") vira a linha de cima. A crônica do lance no jornal tem três a quatro manchetes por desfecho, três aberturas e quatro finais por situação, com mais emoção e sem inventar nada. As capas não repetem uma manchete do mesmo ângulo na carreira até esgotar as opções, e os ângulos mais comuns ganharam três manchetes e duas linhas de apoio novas nos três idiomas.
- **Criador de personagem.** Cabelo: 14 estilos (novos: repartido ao meio, para trás, espetado, topete, moicano e nagô; o ondulado agora fica dentro da cabeça, sem encostar na orelha). Barba: 8 (novas: cavanhaque, cavanhaque e bigode e lenhador). Itens: 7 (novos: faixa nasal levemente curva, boné e gorro; a bandana saiu na D107); boné, gorro e boina escondem o cabelo inteiro. Rosto: opção sem sobrancelha, sem nariz e sem boca. Detalhes novos: cicatriz pequena (sobrancelha, bochecha, queixo) e brinco (esquerdo, direito, os dois) em cinco modelos (ponto, argola, diamante, cruz, pingente) e seis cores. Saves antigos abrem sem cicatriz nem brinco, e um estilo que não existe mais volta ao padrão.
- **Interface.** Conquistas de cada aba da comum à lendária e, dentro da raridade, em ordem alfabética (a secreta fechada vai para o fim); o seletor Craque | Técnico na fonte de título. No Início do Craque, o painel das conquistas fica, sem o título "Memória". Ritmo: "Uma decisão principal a cada duas temporadas." e "Uma decisão principal por temporada.". Etiqueta "Escolha original" (era "Escolha da original"), dentro da borda da opção. A regra do desafio com idade diz quando vale: "Antes dos 23 anos, vale tudo. Dos 23 anos até o fim, nenhuma temporada na segunda divisão." e "Quebrou a regra uma vez, a pontuação final cai pela metade."
- **Recordes e desafio depois da recalibragem.** A cauda das Bolas de Ouro seguidas fica mais curta (escala 0,9, era 1,5): o protagonismo ajudava quem já ganha a ganhar de novo, e a quarta seguida chegou a 0,67% dos Fenômenos. A terceira Copa do Mundo pede mais sorte (escala 2,2, era 3,5), de 1,56% para 1,38%. Relatório de recordes: 19 de 22 marcas na faixa; Bolas de Ouro (0,33%), Bolas seguidas (0,39%) e Premier League (0,18%) são alcançadas na faixa, mas ninguém superou na amostra, como já acontecia na D105. Metas do Desafio do dia recalibradas (`pnpm desafio:calibrar`).
- **Muda o resultado das carreiras.** Motor `2.0.0-m37`, amostras de navegador reconstruídas em m37.

**Como ficou (D106).** Bola de Ouro em `packages/engine/src/awards/awards.ts` (`BALLON_TITLE`, `BALLON_TITLE_STEPS`, `WORLD_CUP_SHADOW`, `ELITE_CHAMPION_SHARE`, `STARRED_TITLE`, `SPOTLIGHT`, `ballonTitleValue`, `ballonSpotlight`), alimentada em `season/playerSeason.ts`; legado em `season/nationalLegacy.ts` e `WORLD_CUP_TITLES` em `packages/world/src/world.ts`; empresário em `career/decisions.ts` (razões `agentUp` e `agentDown`); concorrência em `events/catalog.ts`, condição `clubGap` e `gapEdge`; ano sem decisão principal em `career/decisions.ts` (`nextDecision`, promessa no lugar da partida). Bolinhas em `screens/career/SeasonDecision.tsx`, `CareerScreen.tsx` e `features/career/useSeasonFlow.ts` (`DecisionRecall`). Manchetes em `packages/content/src/matchHeadlines.ts`, `matchStory.ts` e `cover.ts`. Avatar em `packages/art/src/avatar`. Pressão em `records/pressure.ts` (`ballonStreak`, `worldCups`); metas do desafio em `challenge/targets.ts`. Testes: `packages/engine/test/d106.test.ts`, `packages/art/test/avatarStyles.test.ts`, `apps/game/e2e/d106.spec.ts` (e amostra `e2e/fixtures/despedida-m37.json` para a capa da despedida com recorde).

## Revisão D107: erro no jogo-chave, top 10 da Bola de Ouro, explosão jovem e promessa no Rápida (29/10/2026)

Motor do Craque `2.0.0-m38`. Detalhes na revisão D107 do GDD e na decisão D107.

- **Bola de Ouro: o erro tira um pouquinho e o jogo coletivo soma um pouquinho.** Complementos ao protagonismo da D106, que segue igual para o lance de protagonista que dá certo (0,25 + 0,35 vezes a fase).
  - **Lance que deu errado** (`SPOTLIGHT.miss` 0,12): qualquer opção (ousada, coletiva, segura, canto) tira 0,12 vezes o peso da fase (liga 0,7 a final 1,4), vezes 1,15 pela seleção, vezes o peso da competição: 1 mais 0,12 por ponto do título na escada da Bola de Ouro, até +50% (`missStake`). Errar a final da Copa tira cerca de 0,28; acertar dá 0,97. O lance ousado que dá errado deixou de somar a tentativa.
  - **Jogo coletivo que deu certo** (`SPOTLIGHT.teamSuccess` 0,1): vezes a fase e a seleção. Menos de um quinto do lance de protagonista.
  - **Limites:** o ano soma no máximo 2,2 e tira no máximo 0,9 (`SPOTLIGHT.min`). Abrir mão do pênalti decisivo não soma nem tira.
  - **A dica da opção** fica só "Mais protagonismo.", sem citar a Bola de Ouro.
  - **Medido (300 Fenômenos por posição e lote, 7.200 carreiras):** 19,6% ganham ao menos uma Bola de Ouro (era 18,5%); fora da Europa, 0,28% das carreiras (era 0,25%).
- **Top 10 da Bola de Ouro nos detalhes da temporada.** Entre os dez da votação, a Bola de Ouro aparece em "Competições da temporada", num grupo "Prêmios", com a arte do prêmio e a colocação ("4º lugar", ou "Vencedor").
- **Homenagem com "Manter o número".** O evento da homenagem ganha a opção de ficar com o número de sempre: torcida +2 e nenhuma pressão nova, contra a camisa escolhida com torcida +4 e mais pressão.
- **Explosão jovem** (`YOUNG_BREAKOUT`, `evolution/breakthrough.ts`): dos 17 aos 22 anos, com OVR de 50 a 67, uma vez na carreira, o jogador pode subir do nada para 70 a 76 (pelo menos 8 pontos), no começo da temporada. Chance de 1,8% por ano até os 19 e 1% dos 20 aos 22. O salto vale já naquele ano: o OVR novo decide o papel no elenco, e ele ganha ao menos a vaga de titular. Os detalhes da temporada dizem "Explosão: do nada, seu futebol subiu de patamar e o técnico te deu a vaga de titular." Medido: 88 de 1.440 carreiras (cerca de 6%, de Operário a Estrela) têm uma.
- **Promessa no ritmo Rápida.** A janela de transferências garantida que aparece no meio do período de duas temporadas oferecia aposentar; quem aceitava perdia a promessa sem julgamento. Com promessa em andamento (`promisePending`), essa janela não oferece aposentar. Auditoria de 120 carreiras no Rápida e 60 no Normal, com as quatro políticas: toda promessa feita é julgada, nenhum período abre em jogo-chave, nenhuma carreira trava. O Rápida tem a decisão principal e até um jogo-chave por ano (até três decisões no período); o Normal, até cinco decisões por ano.
- **Jornal: notas do ano sem sobreposição.** Em "Também nesta temporada", cada nota tinha altura de uma linha, e a nota longa ("Artilheiro: UEFA Champions League, 15 gols") invadia a de baixo. Agora a nota quebra em duas linhas e só aparecem as que cabem inteiras.
- **Jornal: capa de recorde com manchete longa.** A marca de cinco detentores ("alcança a marca de Gento, Modrić, Kroos, Carvajal e Nacho") deixava a caixa "Os números" passar por cima de "Até aqui na carreira". A manchete com selo de recorde desce um tamanho antes, a muito longa ganha um tamanho menor (22 px), e nessa capa (`data-tight`) os números se juntam. Auditoria em todas as edições das 17 amostras, no PC e no celular: nenhuma caixa se cobre e nenhuma nota sai do lugar.
- **Recordes depois da recalibragem.** O erro no jogo-chave pesa contra quem domina muitos anos, e as oito Bolas de Ouro caíram para 1 em 1.800 Fenômenos; a cauda das Bolas fica mais branda (`ballonDor` escala 3,2, era 2,5) e volta a 0,22%. A Serie A passou o teto épico por uma carreira (1,56%); a cauda italiana fica mais firme (escala 3,2, era 4) e volta a 1,47%. Ficam 19 de 22 marcas na faixa, com as mesmas três da D106 sinalizadas só porque ninguém as superou na amostra (oito Bolas, quatro seguidas, Premier League). Metas do desafio recalibradas.
- **Personagem:** a bandana saiu (um save com bandana abre sem item).
**Como ficou (D107).** Bola de Ouro em `packages/engine/src/awards/awards.ts` (`SPOTLIGHT.teamSuccess`, `miss`, `missStake`, `missStakeMax`, `min`, `ballonSpotlight`); explosão em `evolution/breakthrough.ts` (`YOUNG_BREAKOUT`, `youngBreakout`) e `season/playerSeason.ts` (`breakout`); promessa em `career/decisions.ts` (`promisePending`); homenagem em `events/catalog.ts`. Tela: `screens/career/PlayFeed.tsx` (grupo Prêmios e nota da explosão), `screens/summary/Newspaper.tsx` e `styles/summary.css` (notas do ano, `data-tight`); pressão em `records/pressure.ts` (`ballonDor`, `leagues.ITA`). Testes: `packages/engine/test/d107.test.ts`, `apps/game/e2e/d107.spec.ts`.

- **Muda o resultado das carreiras.** Motor `2.0.0-m38`, amostras de navegador reconstruídas em m38.

## Revisão D108: Portugal, Liga das Nações, Troféu Kopa, prêmios na Bola de Ouro, dispensa e jornal (29/10/2026)

Motor do Craque `2.0.0-m39`, Técnico `1.10.0`. Detalhes na revisão D108 do GDD e na decisão D108.

- **Portugal no mundo.** Primeira Liga (18 clubes, 34 rodadas, 2 sobem e 2 caem) e Liga Portugal 2 (18), Taça de Portugal (`cup:POR`), Taça da Liga (`leaguecup:POR`) e Supertaça Cândido de Oliveira (`super:POR`). Os 18 clubes da primeira divisão são os do EA FC 27 (elencos 99% reais, força pela média dos 14 melhores: Porto 80, Sporting e Benfica 79, Braga 76); os 18 da segunda têm elencos gerados com nomes da cultura do país. Vagas continentais: campeão e vice na Champions, terceiro e campeão da Taça na Europa League, quarto na Conference (`QUALIFICATION.POR`). Clássicos: Benfica x Sporting, Benfica x Porto, Porto x Sporting, Braga x Vitória, Marítimo x Nacional e Belenenses x Benfica. Artilharia: Primeira Liga média 26 (recorde 43, Peyroteo), Liga Portugal 2 média 17. Transmissão própria (verde e vermelho com a grade do azulejo). O Técnico também ganha Portugal (16 países).
- **Escudos de Portugal gerados como os outros.** Os 36 clubes não têm arquivo de escudo: o gerador de `packages/art/src/crest` desenha cada um com a cor real, o padrão da camisa e um símbolo da identidade (o dragão do Porto, o leão rampante do Sporting, a águia do Benfica, o canhão do Braga, o castelo de Guimarães, o galo de Barcelos do Gil Vicente, a nau do Rio Ave, os vulcões de Santa Clara, a âncora do Marítimo...). Os selos das ligas saem gerados (LP e LP2).
- **Liga das Nações da UEFA** (`nationsleague:UEFA`, tipo `nationsLeague`). Fase final nos anos ímpares (2027, 2029...), entre a Copa e a Euro (`NATIONS_LEAGUE.parity`). Só a Liga A disputa o título: as 16 seleções mais fortes da UEFA no ano. Jogos: 6 na fase de liga, 8 nas quartas, 10 na fase final. Esses jogos ocupam datas de amistoso e eliminatória, então descontam dos jogos comuns de seleção (a convocação não incha). Pesa pouco: importância 1 (a Euro é 2), 0,6 na escada da Bola de Ouro (a liga é 1), 40% do continental no legado na seleção, sem valer como o título que o país cobra. Tem artilharia e craque, troféu real, transmissão própria (azul-cobalto e prata) e conquista rara.
- **Troféu Kopa** (era o Prêmio Revelação; a chave segue `youngPlayer`). O melhor jogador do mundo até 21 anos, com pelo menos 20 jogos, contra a elite jovem do mundo inteiro. A nota é a da Bola de Ouro: escada de títulos, 60% do protagonismo, Chuteira e coroas, desconto de posição, sem fama nem prestígio. Cada jovem da elite ganha +4 (`YOUNG_PLAYER.fieldBonus`: o resto da geração), para um jogador de 80 não ganhar só porque a elite daquele ano é nova. Fora da Europa, -7; na temporada histórica (OVR 86 ou mais e Champions, Libertadores ou Copa), -2,5. Medido (600 carreiras por talento): por temporada elegível, OVR 80 a 83 ganha 0 a 2%, 84 a 87 de 6 a 20%, 88 ou mais de 51 a 63%; carreiras com Kopa: Craque 0,2% (era 1%), Estrela 9,3% (era 16%), Fenômeno 21,3% (era 27%). Fora da Europa o Fenômeno ganhava em 12% das temporadas elegíveis; agora em 3,7%, e só com 92 a 98 de OVR antes dos 21 (o melhor jovem do mundo de longe). Arte nova do troféu e do Rei da América.
- **Chuteira de Ouro e coroas somam à Bola de Ouro** (`AWARD_BOOST`). A Chuteira soma 0,5; cada artilharia ou craque de competição soma 0,15 vezes o peso do título na escada (craque da Champions 0,38, artilheiro da liga 0,15, da copa nacional 0,05), até 0,9. A Chuteira e as coroas agora saem antes da votação. Para o total não inflar, a força do campo sobe de 9,0 para 9,8: medido em 7.200 Fenômenos, 19,7% ganham ao menos uma (era 19,6%), 3.075 Bolas (era 3.072), fora da Europa 0,24%. Quem ganha a Chuteira e as coroas fica na frente de quem não ganha.
- **Dispensa mais rápida de quem não joga** (`BENCH_LIMIT`). O jovem no banco fica no máximo até os 22: aos 23, se o banco começou aos 22 ou antes, é dispensado. A partir dos 23, o reserva fica no máximo 5 anos de casa; 7 se for ídolo do clube, 9 se for lenda. Vale junto com a regra de antes (25 anos e duas temporadas no banco no Normal).
- **Primeira carreira com talento.** A primeira carreira do Craque no aparelho nasce com talento de Promissor para cima (Promissor, Craque, Estrela ou Fenômeno): a semente é sorteada de novo enquanto der Operário (`firstCareerSeed`, até 64 tentativas). Uma preferência (`startedCareer`) guarda que a pessoa já começou.
- **Peru sem copa.** A Copa Bicentenario acabou e saiu do jogo; o Peru fica como o México, sem copa nacional.
- **Ultimato do empresário:** "a proposta de um clube melhor" (era "maior").
- **Rápida: a janela do meio do período não aposenta.** Aposentar é decisão principal; antes, quem aceitava a aposentadoria na janela garantida do segundo ano terminava a carreira com o período pela metade, sem a temporada e sem o resultado na tela.
- **Troféus novos.** 36 imagens geradas pelo usuário entraram em `public/assets` (fundo branco tirado só onde encosta na borda, recortadas, 480 px de altura, WebP de 12 a 44 KB): Bola de Ouro (substitui a antiga), Troféu Kopa, Rei da América, supercopas de Argentina, Brasil, Chile, Colômbia, Equador, Espanha, França, Alemanha, Itália, México, Paraguai, Portugal e Uruguai, EFL Cup, Copa de la Liga, Taça da Liga, Taça de Portugal, Copa Bolivia (Copa Paceña), Conference League, Supercopa da UEFA, Recopa, Intercontinental, Liga das Nações e as ligas Brasileirão Série B (substitui a antiga), Primeira Liga, Liga Portugal 2, Copa Simón Bolívar, Primera B, Torneo Dimayor, LigaPro Serie B, Segunda División e Liga FUTVE 2. Há troféu real para 83 das 85 competições; a arte gerada continua de reserva.
- **Jornal: a coluna da direita da capa sempre cabe.** Conquistas, etiquetas (lesão, contratação) e notas mudam a cada ano; quando não cabem, as conquistas viram só os ícones e, se ainda faltar, as etiquetas saem. Nada aparece cortado. Auditoria em 40 carreiras novas (metade de Estrela e Fenômeno) e nas 17 amostras, todas as páginas, no PC e no celular: nenhuma caixa cortada nem sobreposta (1.636 notas visíveis, 41 em duas linhas; o ajuste agiu em 12 capas).
- **Recordes depois da recalibragem.** Jogos pela seleção: a cauda começa em 220, escala 13 (era 224 e 16), porque a Liga das Nações dá alguns jogos a mais a quem vai longe nela; Bolas de Ouro: escala 2,9 (era 3,2); títulos na carreira: escala 5,5 (era 6). Ficam 21 de 22 marcas na faixa; a de 4 Bolas seguidas está na frequência certa (0,39%) e só é sinalizada porque ninguém a superou na amostra. Metas do desafio recalibradas; a amostra da calibragem voltou a cruzar todas as posições, estilos e países (com 18 países, o passo antigo repetia combinações).
**Como ficou (D108).** Portugal em `packages/world/data/clubs/por.json`, `leagues.json`, `kits.json`, `rivalries.json`, `fontes/aliases.json`, elencos em `data/squads/por.ts` (`pnpm elencos:montar`), copas em `src/competitions.ts` (`CUPS`, `SUPER_CUPS`, `LEAGUE_CUPS`), vagas em `engine/src/world/tuning.ts` (`QUALIFICATION.POR`), escudos em `packages/art/src/crest/clubs.ts`. Liga das Nações: `nationsLeague` em `competitions.ts`, `simulateNationsLeague` em `world/season.ts`, `NATIONS_LEAGUE` em `world/tuning.ts`, `NATIONS_LEAGUE_FORMAT` em `world/model.ts`, jogos em `season/schedule.ts` e `season/national.ts` (`overlap`), legado em `season/nationalLegacy.ts` (`NATIONS_LEAGUE_SHARE`). Prêmios em `awards/awards.ts` (`YOUNG_PLAYER`, `AWARD_BOOST`, `awardBoost`). Dispensa em `career/decisions.ts` (`BENCH_LIMIT`, `benchLimitReached`). Primeira carreira em `apps/game/src/features/career/newCareer.ts` e `store/prefs.ts`. Jornal em `screens/summary/Newspaper.tsx` (`useSideFit`). Testes: `packages/engine/test/d108.test.ts`, `apps/game/src/features/career/newCareer.test.ts`, `packages/world/test/integrity.test.ts`.

- **Muda o resultado das carreiras.** Motor `2.0.0-m39`, Técnico `1.10.0`, amostras de navegador reconstruídas em m39.

## Revisão D109: calendário dos torneios, Bola de Ouro pelo que se fez, Kopa pelo desempenho, carreira até 2050 e telas (30/10/2026)

Motor do Craque `2.0.0-m40`. Detalhes na revisão D109 do GDD e na decisão D109.

- **Torneios de seleções no ano certo** (`nationsCupYear`, `world/tuning.ts`). Antes, todos os continentais de seleções eram no mesmo ano da Euro. Agora: Eurocopa, Copa América e Copa das Nações da OFC a cada quatro anos (2028, 2032); Copa Ouro a cada dois, nos anos ímpares (2027, 2029); Copa da Ásia a cada quatro, a partir de 2027 (2031); Copa Africana em 2027 e 2028 e depois a cada quatro (2032), como a CAF decidiu em 2025. Copa do Mundo (2026, 2030...), Mundial de Clubes (2029...), Liga das Nações (anos ímpares) e os torneios de clubes anuais já seguiam o calendário real. O evento de ano de torneio do jogador olha o torneio da confederação dele.
- **Bola de Ouro: o OVR conta menos, o que o jogador fez conta mais.** A nota usa `88 + 0,8 × (OVR - 88)` para a elite e para o jogador (`BALLON.ovrWeight`, `ovrPivot`). A temporada histórica de gols passa do teto de 3 da produção, até 1,5 a mais (`productionBeyond`; 70 gols e 20 assistências chegam lá); o goleiro, até 0,75. A força do campo passa de 9,8 para 8,6 para manter a frequência: 19,4% dos Fenômenos ganham ao menos uma (era 19,7%), com 2.864 Bolas em 7.200 carreiras (eram 3.075: com o OVR pesando menos, o mesmo craque domina menos anos seguidos); fora da Europa, 0,25%.
- **Top 10 da Bola de Ouro pela posição.** Para ganhar, o desconto de posição continua inteiro (D91). Para a colocação, entra só metade (`placementPositionShare` 0,5): entrar no top 10 é um pouco mais difícil para quem joga atrás, principalmente na defesa, mas bem menos que ganhar.
- **Troféu Kopa pelo desempenho.** O OVR pesa 70% em torno de 84 (`YOUNG_PLAYER.ovrWeight`, `ovrPivot`); a produção acima da referência pesa o dobro (`productionWeight`, só a parte positiva: o ano grande conta mais, o fraco não perde em dobro); o campo jovem é 0. Fora da Europa o desconto é 4 (era 7; na Bola de Ouro é 8) e 1,5 na temporada histórica. Medido (600 carreiras por talento): com 80 a 83 de OVR e um ano grande (32 gols mais metade das assistências, ou título de liga ou continental), o jovem ganha em cerca de 7% das vezes, e sem ele em cerca de 1% (os rivais nesses anos são os jovens reais, de 85 a 90); 84 a 87, de 11 a 22%; 88 ou mais, de 61 a 69%; carreiras com Kopa: Estrela 10,2%, Fenômeno 22%; fora da Europa, o Fenômeno ganha em 6,1% das temporadas elegíveis.
- **Primeira carreira Craque ou Estrela.** A primeira carreira no aparelho nasce Craque ou Estrela (`FIRST_CAREER_TALENTS`), só ela.
- **A carreira vai até 2050.** Última idade jogável 40 (era 39), fim por idade aos 41: quem começa em 2026 joga a temporada de 2050 e a Copa do Mundo dela. As políticas de teste se aposentam antes, então as metas não mudam.
- **Ritmo e dificuldade na tela de quem é você.** Saíram do Início, que fica só com Começar carreira e Jogo rápido (o jogo rápido usa a última escolha). No celular a seção aparece na etapa final, com a aparência.
- **Aparência:** Voltar descarta o que mudou nesta visita, só Pronto guarda; em Detalhes, no PC, marcas, brinco e acessório têm cada um a sua coluna (o acessório não pula de lugar quando o brinco abre opções).
- **Troféus sem fundo.** As imagens de troféus e prêmios foram trocadas pelas versões sem fundo do usuário (recortadas, 480 px, WebP), com o Troféu Yashin novo.
**Como ficou (D109).** Calendário em `engine/src/world/tuning.ts` (`nationsCupYear`), usado em `world/season.ts` e `career/context.ts`; Bola de Ouro e Kopa em `awards/awards.ts` (`BALLON.ovrWeight`, `ovrPivot`, `placementPositionShare`, `placementRank`, `productionBeyond`, `YOUNG_PLAYER.ovrWeight`, `productionWeight`, `kopaOvrDiscount`); idade em `types.ts` (`LAST_AGE`, `RETIREMENT_AGE`); primeira carreira em `apps/game/src/features/career/newCareer.ts`; telas em `features/career/CareerSettings.tsx`, `screens/identity/IdentityScreen.tsx`, `screens/home/HomeScreen.tsx`, `screens/appearance/AppearanceScreen.tsx`, `features/appearance/AvatarEditor.tsx`. Testes: `packages/engine/test/d109.test.ts`, `apps/game/e2e/d109.spec.ts`.

- **Recordes com a temporada a mais.** A cauda dos jogos na carreira começa em 1.320, escala 65 (era 1.330 e 80): com a carreira até os 40, o recorde de 1.390 jogos de Peter Shilton passava para 6,8% dos Fenômenos; volta a 4,67% (faixa rara). Ficam 21 de 22 marcas na faixa; a de 4 Bolas seguidas está na frequência certa (0,28%) e só é sinalizada porque ninguém a superou na amostra. Metas do desafio recalibradas.
- **Muda o resultado das carreiras.** Motor `2.0.0-m40`, amostras de navegador reconstruídas em m40.

## Revisão D110: sem o Início do Craque, hipotético com sorteio refeito, briga com a diretoria e o batedor do time (30/10/2026)

Motor do Craque `2.0.0-m41`. Detalhes na revisão D110 do GDD e na decisão D110.

- **Sem o Início do Craque.** "Jogar" no Craque abre direto a tela de quem é você. Ela traz o que ficava no Início: Jogo rápido (ao lado de Começar carreira no PC; no celular, embaixo), o Desafio do dia, as conquistas, os números do mundo e o laboratório. Voltar leva ao hub do Futeiros. O texto do ritmo ficou curto ("Decisão principal a cada 2 anos" e "todo ano") para não empurrar a dificuldade.
- **Hipotético com o sorteio refeito.** Na linha alternativa, da decisão de troca em diante, o sorteio de dar certo ou errado (acontecimento e jogo-chave) leva um sal novo (`setup.rerolls`, `career/outcome.ts`): a mesma escolha da linha original pode ter outro resultado. As decisões antes da troca se refazem iguais; um hipotético dentro de outro guarda as trocas anteriores.
- **Briga com a diretoria.** Não recuar é a transferência certa, sem sorteio: a diretoria vende você e fecha as portas. Retratar-se custa 10 de torcida (era 2).
- **O batedor do time.** Fora do ataque (zagueiro, lateral, volante, meias), finalização a partir de 80 faz do jogador o cobrador de pênalti e falta: gols a mais por jogo, até 0,06 (zagueiro e volante), 0,05 (lateral), 0,04 (meio-campista) e 0,03 (meia e alas) no 99 de FIN (`SET_PIECE_TAKER`, `setPieceSkill`, `season/production.ts`), e o jogo-chave vira uma cobrança (pênalti, falta, pênalti decisivo) com até 30% de chance (`SET_PIECE_SCENE_CHANCE`, `career/matchMoments.ts`).
- **Muda o resultado das carreiras.** Motor `2.0.0-m41`, amostras de navegador reconstruídas em m41.

## Revisão D111: escudos e selos reais por padrão (30/10/2026)

- **Escudos e selos reais por padrão.** O build usa `VITE_ASSETS=real` quando nada é dito (`apps/game/src/lib/env.ts`); `gerado` continua disponível para comparar. Onde não há imagem real, entra a arte desenhada.
- **Escudos que faltavam.** Vieram da Wikipédia (o campo de imagem da página de cada clube): os 36 clubes de Portugal, Vaca Díez, San Juan, Patriotas Boyacá e os selos da Primeira Liga e da Liga Portugal 2. Ficam com o escudo desenhado, sem imagem achada: Real Oruro, Santo Domingo, Torreense, União de Leiria, Atlético El Vigía, Real Frontera e Marítimo de La Guaira; e os selos da LigaPro Serie B, da Liga 2 peruana e da Liga FUTVE 2. Agora são 518 de 525 escudos e 31 de 34 selos reais.
- **Imagens trocadas pelo usuário (30/10/2026):** o escudo do Vasco da Gama (`clubs/vasco-da-gama.png`) e o selo do Brasileirão Série B (`leagues/brasileirao-serie-b.png`) passaram a ser as versões PNG enviadas pelo usuário, recortadas e com 512 px de altura; os dados (`clubs/bra.json`, `leagues.json`) registram a extensão `png`.
