# CRAQUE: Documento de Requisitos

**Especificação comportamental completa, obtida por engenharia reversa.**


---

## Índice

| # | Seção |
|---|---|
| 0 | Como ler este documento |
| 1 | Visão geral |
| 2 | Glossário |
| 3 | Determinismo e aleatoriedade |
| 4 | Configuração de partida |
| 5 | Fluxo do usuário: mapa de telas |
| 6 | Tela de Início |
| 7 | Tela de Identidade |
| 8 | Tela de Aparência |
| 9 | Barra superior, ajustes e diálogos |
| 10 | O mundo |
| 11 | O jogador |
| 12 | Talento, potencial e personalidade |
| 13 | Crescimento e declínio |
| 14 | O laço de carreira |
| 15 | Catálogo de decisões |
| 16 | Ofertas de clube |
| 17 | O briefing do clube |
| 18 | Eventos de carreira |
| 19 | Foco de treino |
| 20 | Simulação de uma temporada |
| 21 | Títulos de clube |
| 22 | Promoção e rebaixamento |
| 23 | Reputação do clube ao longo da carreira |
| 24 | Seleção nacional |
| 25 | Prêmios individuais |
| 26 | Torcida |
| 27 | O rival |
| 28 | Número da camisa |
| 29 | Manchetes |
| 30 | A capa do jornal da temporada |
| 31 | Fim de carreira |
| 32 | Tela de Resumo |
| 33 | A biografia |
| 34 | Recordes reais |
| 35 | Linha do tempo |
| 36 | Vitrine de troféus |
| 37 | O arquivo de jornais |
| 38 | Feed de manchetes |
| 39 | Desafio do Dia |
| 40 | Placar local |
| 41 | Imagem de compartilhamento |
| 42 | A carta do jogador |
| 43 | Arte gerada |
| 44 | Animações e movimento |
| 45 | Som |
| 46 | Comemorações de conquista |
| 47 | Tela de carreira: leiaute e estados |
| 48 | Persistência, validação e recuperação |
| 49 | Idiomas |
| 50 | Acessibilidade |
| 51 | Páginas de erro |
| 52 | Ferramentas de desenvolvimento |
| 53 | Invariantes |
| 54 | Conjuntos de teste sugeridos |

---

## 0. Como ler este documento

Este documento descreve **o que o jogo faz**, não como ele está escrito. Nenhum nome
de arquivo, variável, função ou biblioteca aparece aqui. Qualquer pessoa deve
conseguir reconstruir o jogo inteiro a partir deste texto, em qualquer linguagem e
qualquer arquitetura, e chegar ao mesmo comportamento observável.

Convenções usadas:

- **OVR** significa "overall", a nota geral de 0 a 99 de uma carta.
- Todos os números (probabilidades, limiares, pesos, durações) são requisitos
  literais: são eles que definem o balanceamento.
- "Rolagem" significa um sorteio aleatório determinístico (ver seção 3).
- Onde houver uma lista de probabilidades indexada por reputação, o índice é a
  reputação de 0 a 5 do clube ou do país.
- Onde se lê "período", entenda o bloco de temporadas que uma única decisão do
  jogador cobre (1 ou 2 temporadas, conforme o modo).
- Onde se lê "temporada", entenda um ano de futebol simulado.

---

## 1. Visão geral

CRAQUE é um **simulador de carreira de futebol jogado por decisões**. O jogador
cria um atleta de 16 anos, escolhe nacionalidade, posição, pé preferido, sobrenome
e aparência, e a partir daí conduz a carreira inteira até a aposentadoria tomando
uma sequência de decisões discretas. Entre uma decisão e outra, o jogo simula uma
ou duas temporadas completas: jogos, gols, assistências, títulos, convocações,
prêmios, lesões, evolução e declínio de atributos.

Características que definem o produto:

1. **Não existe controle direto de partidas.** O jogador nunca escolhe uma
   escalação nem joga um jogo. Ele escolhe onde jogar, em que treinar, e como
   reagir a acontecimentos de carreira. Tudo o mais é consequência.
2. **A carta é o placar.** O resultado de cada decisão aparece como movimento
   nos seis atributos da carta e no OVR derivado deles.
3. **Não há vitória nem derrota formal.** A carreira termina sempre. O que varia
   é a qualidade da história produzida (ver seção 35). A única modalidade com
   pontuação numérica e ranking é o **Desafio do Dia** (seção 40).
4. **Uma sessão dura cerca de dois minutos.** Isso é uma meta de design declarada
   na tela inicial e condiciona o ritmo: poucas decisões, cada uma pesada.
5. **Tudo é local.** Não há conta, servidor, login ou sincronização. O progresso
   e o placar vivem no navegador do jogador.
6. **Tudo é determinístico.** A mesma semente com as mesmas decisões produz
   exatamente a mesma carreira.

---

## 2. Glossário

| Termo | Significado |
|---|---|
| Carta | Representação visual do jogador: OVR, posição, retrato, nome, número, seis atributos, bandeira, escudo da liga, escudo do clube. |
| Atributo | Um dos seis números impressos na carta. Os seis variam conforme a posição ser de linha ou goleiro. |
| Potencial | Teto oculto de OVR sorteado no início da carreira. Teto suave: o crescimento desacelera perto dele, nunca trava. |
| Faixa de talento | Uma de cinco classes de potencial (Promessa, Talento, Craque, Fenômeno, Geracional). |
| Traço | Personalidade sorteada no início. Afeta odds de risco, crescimento, declínio e torcida. |
| Papel | Agrupamento funcional das posições: atacante, criador, apoio, defensivo, goleiro. |
| Status no elenco | Titular, alta rotação, baixa rotação, reserva, terceiro goleiro. Derivado da diferença entre o OVR do jogador e o nível do clube. |
| Briefing | O que o clube contratou o jogador para fazer. Define torcida inicial, paciência e exigência. |
| Torcida | Medidor de 0 a 100 do apoio da arquibancada do clube atual. Reseta a cada mudança de clube. |
| Standing (posição no clube) | Como a torcida do clube lembrará o jogador: passageiro, regular, ídolo, lenda. |
| Rival | Jogador fictício da mesma geração, atribuído uma única vez, usado como régua de comparação. |
| Período | Bloco de temporadas coberto por uma decisão (1 no modo longo, 2 no normal). |
| Édito | No Desafio do Dia, uma regra proibitiva que vale pela carreira inteira. |
| Missão / briefing do dia | No Desafio do Dia, um objetivo pontuado. São três por dia; contam as duas melhores. |

---

## 3. Determinismo e aleatoriedade

### 3.1 Requisitos gerais

- Toda aleatoriedade do jogo passa por um gerador pseudoaleatório **semeado por
  texto** e **encadeado**: cada sorteio produz um valor e um novo estado, e o
  estado é persistido junto da carreira.
- Consequência obrigatória: recarregar a página no meio de uma carreira e
  continuar produz exatamente o mesmo futuro que produziria sem recarregar.
- A semente de uma carreira normal é gerada no momento da confirmação da
  identidade e combina o instante atual com uma componente aleatória, de forma
  que duas carreiras criadas em momentos diferentes nunca coincidam.
- A semente de um Desafio do Dia é **derivada do identificador do dia**, portanto
  idêntica para todos os jogadores naquele dia.

### 3.2 Primitivas que o gerador deve oferecer

| Primitiva | Comportamento |
|---|---|
| Número real em faixa | Valor uniforme entre um mínimo e um máximo. |
| Inteiro em faixa | Valor uniforme inteiro, inclusivo nos dois extremos. |
| Chance | Verdadeiro com probabilidade *p*; *p* é sempre limitado a [0, 1] antes do sorteio. |
| Escolher um | Item uniforme de uma lista. Erro se a lista estiver vazia. |
| Escolher ponderado | Item proporcional a pesos. Pesos negativos contam como zero. Erro se a soma for zero. |
| Embaralhar | Permutação uniforme. |

### 3.3 Sementes derivadas

Alguns subsistemas usam sementes derivadas por sufixo, de modo que sejam estáveis
sem consumir o fluxo principal:

- O **veredito de olheiro** sobre o talento (seção 15.3) usa uma semente derivada,
  para que a leitura não mude a cada renderização.
- A **biografia** usa uma semente derivada que inclui o idioma, para que o mesmo
  save conte a mesma história e traduzir não reescreva o texto de outra forma.
- As **capas de jornal** usam sementes derivadas por temporada.

---

## 4. Configuração de partida

Duas escolhas independentes, feitas na tela inicial, que se combinam livremente.

### 4.1 Modo (ritmo)

| Modo | Temporadas por decisão | Eventos pessoais na carreira | Períodos de reserva antes de não renovação | Períodos de baixa rotação antes de não renovação |
|---|---|---|---|---|
| Longo | 1 | 6 a 7 | 2 | 3 |
| Normal | 2 | 3 a 4 | 1 | 2 |

O modo só altera o ritmo: quantas temporadas passam entre duas decisões e,
consequentemente, quantas decisões cabem em uma carreira. O modo padrão é
**Normal**.

### 4.2 Dificuldade

Dificuldade é um eixo separado e altera o quanto o futebol perdoa. Todos os
valores são multiplicadores sobre o jogo normal.

| Efeito | Normal | Difícil |
|---|---|---|
| Peso da faixa Promessa | 1 | 1,6 |
| Peso da faixa Talento | 1 | 1 |
| Peso da faixa Craque | 1 | 0,68 |
| Peso da faixa Fenômeno | 1 | 0,38 |
| Peso da faixa Geracional | 1 | 0,28 |
| Multiplicador de crescimento | 1 | 0,82 |
| Multiplicador de declínio | 1 | 1,3 |
| Multiplicador de lesão | 1 | 1,8 |
| Peso extra da lesão grave | 1 | 1,9 |
| Penalidade de reputação nas ofertas | 0 | 1 |
| Multiplicador de quedas de torcida | 1 | 1,4 |
| Paciência do clube | 1 | 0 |

Consequências obrigatórias no difícil:

- A distribuição de talento passa de aproximadamente 28/34/22/11/5 para
  aproximadamente **45/34/15/4/1**.
- As ofertas recebidas são sorteadas de uma faixa de reputação **uma abaixo** da
  que o nível do jogador indicaria.
- Clubes deixam de tolerar uma temporada ruim: a não renovação passa a ser
  avaliada a partir dos **24 anos** em vez dos 26, e com um período a menos de
  tolerância.
- Somente as oscilações **negativas** de torcida são amplificadas. As positivas
  não mudam.

A dificuldade padrão é **Normal**. O Desafio do Dia força **Difícil** sempre.

---

## 5. Fluxo do usuário: mapa de telas

Existem seis telas. Uma única tela está visível por vez, dentro de uma casca fixa
com barra superior.

```
                   ┌──────────────┐
                   │    INÍCIO    │◄──────────────────┐
                   └──┬────────┬──┘                   │
        "Começar"     │        │   "Desafio do dia"   │
                      ▼        ▼                      │
            ┌──────────────┐  ┌───────────────┐       │
            │  IDENTIDADE  │  │    DESAFIO    │       │
            └──┬────────▲──┘  └───────┬───────┘       │
   "Personalizar" │     │ "Pronto"    │ "Jogar"       │
                  ▼     │             │               │
            ┌──────────────┐          │               │
            │   APARÊNCIA  │          │               │
            └──────────────┘          │               │
                      │ "Confirmar"   │               │
                      ▼               ▼               │
                   ┌──────────────────────┐           │
                   │       CARREIRA       │           │
                   └──────────┬───────────┘           │
                              │ fim da carreira       │
                              ▼                       │
                   ┌──────────────────────┐           │
                   │        RESUMO        ├───────────┘
                   └──────────────────────┘
                        "Jogar novamente" volta para IDENTIDADE
```

Regras de navegação:

- A marca na barra superior volta ao **Início**. Se houver carreira em andamento,
  pede confirmação antes, porque descarta o save.
- Existe um botão separado de **encerrar carreira** (ícone de chuteiras) visível
  apenas durante uma carreira em andamento. Ele também confirma, mas **preserva**
  tudo que foi jogado e leva direto ao Resumo.
- "Jogar novamente" no Resumo volta para **Identidade** (não para o Início),
  mantendo sobrenome, pé, país, posição e aparência, e descarta o vínculo com o
  desafio diário.
- Após um Desafio do Dia, o rótulo do botão de replay muda para indicar que ele
  inicia uma carreira normal, e não outra tentativa do desafio.

---

## 6. Tela de Início

### 6.1 Conteúdo

- Sobrelinha de marca, título em duas linhas (a segunda com gradiente verde/dourado),
  subtítulo explicativo e uma dica de duração ("cerca de 2 minutos até a
  aposentadoria").
- Seletor de **modo**, em forma de pílula com dois botões. Abaixo dele, a
  descrição do modo selecionado.
- Seletor de **dificuldade**, também em pílula. O botão "difícil", quando ativo,
  fica vermelho; o "normal", quando ativo, fica na cor de primeiro plano. Abaixo,
  a descrição da dificuldade selecionada.
- Botão primário **Começar** (verde) e botão secundário **Desafio do dia**
  (contornado em dourado).
- Três blocos de estatística do produto (clubes, ligas, seleções).
- À direita, uma **carta de demonstração** OVR 87 flutuando suavemente. Ela usa
  o país, a posição, o sobrenome e o avatar já salvos no rascunho do jogador, e
  cai para Brasil, atacante e o rótulo "VOCÊ" quando não há rascunho.

### 6.2 Estados

| Estado | Comportamento |
|---|---|
| Primeira visita | Modo Normal, dificuldade Normal, carta sem avatar (silhueta cinza), nome "VOCÊ". |
| Com rascunho salvo | Carta reflete país, posição, sobrenome e aparência escolhidos antes. |
| Marca da barra superior | Desabilitada (não clicável) enquanto esta é a tela ativa. |

### 6.3 Interações sonoras

| Ação | Cue |
|---|---|
| Trocar modo ou dificuldade | Tique |
| Começar | Confirmar |
| Desafio do dia | Selecionar |

O apito fica reservado para o instante em que a carreira de fato começa: a
confirmação da identidade, e o início de um desafio.

---

## 7. Tela de Identidade

### 7.1 Campos

| Campo | Regras |
|---|---|
| Sobrenome | Texto livre, **máximo 16 caracteres**. Convertido para MAIÚSCULAS ao confirmar. Obrigatório (não pode ser só espaços). |
| Pé preferido | Esquerdo ou direito. Padrão: direito. Puramente cosmético: não afeta simulação alguma. |
| Nacionalidade | Lista de 211 países com busca por texto, ordenada alfabeticamente **no idioma atual**. Obrigatório. |
| Posição | Escolhida tocando um campo de futebol desenhado, com 12 marcadores posicionados. Obrigatório. |
| Aparência | Opcional. Sem personalizar, o jogador aparece como silhueta cinza. |

### 7.2 Campo de posições

Layout fixo, em porcentagem do retângulo do campo (topo = ataque):

| Posição | x | y |
|---|---|---|
| LW (ponta esquerda) | 18% | 14% |
| ST (centroavante) | 50% | 10% |
| RW (ponta direita) | 82% | 14% |
| LM (meia esquerda) | 20% | 38% |
| CAM (meia ofensivo) | 50% | 26% |
| RM (meia direita) | 80% | 38% |
| LB (lateral esquerdo) | 18% | 66% |
| CM (meio-campo) | 50% | 42% |
| RB (lateral direito) | 82% | 66% |
| CDM (volante) | 50% | 60% |
| CB (zagueiro) | 50% | 76% |
| GK (goleiro) | 50% | 92% |

O campo desenha linhas de marcação, círculo central, grandes e pequenas áreas e
meias-luas, além de faixas de grama. O marcador selecionado cresce 10%, fica
branco com texto verde-escuro e ganha sombra.

### 7.3 Painel esquerdo

- Retrato quadrado do avatar, com o kit da **seleção do país escolhido** (não de
  um clube, porque ainda não existe clube).
- Se houver sobrenome digitado, ele aparece sobreposto na base do retrato, com
  degradê preto.
- Botão "Personalizar aparência" / "Editar aparência" conforme já exista avatar.
- Quando não há avatar, uma linha de aviso: sem personalizar, joga-se como
  silhueta.

### 7.4 Estados

| Estado | Comportamento |
|---|---|
| Incompleto | Botão "Confirmar" desabilitado, opacidade 40%, sem eventos de ponteiro. |
| Completo | Botão habilitado. Confirmar toca o **apito** e inicia a carreira. |
| Busca de país sem resultado | Mensagem de lista vazia no lugar da grade. |

---

## 8. Tela de Aparência

Editor de avatar completo, em duas colunas: pré-visualização fixa à esquerda
(grudada ao topo na rolagem), painel de controles à direita em colunas de
jornal (2 no celular, 3 no tablet, 4 no desktop).

### 8.1 Grupos de controle e opções

| Grupo | Controle | Opções |
|---|---|---|
| Pele | Amostras de cor | 10 tons, do mais claro ao mais escuro |
| Sobrancelha | Chips | Reta, arqueada, grossa, fina, inclinada |
| Sobrancelha | Deslizador de posição | -2 a +2 |
| Olhos | Amostras | 8 cores |
| Olhos | Chips | Padrão, amendoado, sonolento, fechado |
| Olhos | Deslizador de tamanho | 0 a 10 (padrão 5) |
| Olhos | Deslizador de posição | -2 a +2 |
| Barba | Chips | Sem barba, bigode, pingente, barba fina, cheia |
| Barba | Amostras | 16 cores (só aparece se houver barba) |
| Nariz | Chips | Pequeno, reto, arrebitado, largo |
| Nariz | Deslizador de tamanho | 0 a 10 |
| Nariz | Deslizador de posição | -2 a +2 |
| Boca | Chips | Sorriso, sorrisão, sorriso torto, neutra, discreta |
| Boca | Deslizador de posição | -2 a +2 |
| Cabelo | Chips | Careca, curto, repartido, ondulado, cacheado, black power, coque, comprido |
| Cabelo | Amostras | 16 cores |
| Marcas | Chips | Sardas (com/sem) |
| Marcas | Chips | Pinta: nenhuma, bochecha esq., bochecha dir., queixo, acima do lábio |
| Acessório | Chips | Nenhum, faixa de cabelo, óculos esportivo, boina |
| Acessório | Amostras | 16 cores (só aparece se houver acessório) |

### 8.2 Regras de comportamento

1. **Deslizadores de posição são invertidos na interface.** Arrastar para a
   direita **sobe** a feição; para a esquerda, **desce**. Isso vale para
   sobrancelha, olhos, nariz e boca.
2. **A barba acompanha o cabelo.** Ao trocar a cor do cabelo, se a cor da barba
   for igual à cor antiga do cabelo, ela muda junto. Se o jogador já tiver
   desacoplado as duas, a barba não muda.
3. **A boina esconde o cabelo inteiro.** Não desenha por cima: substitui.
4. **Abrir o editor já cria um avatar.** A pré-visualização da esquerda continua
   mostrando a silhueta até que uma alteração real seja feita.
5. **"Surpreenda-me"** sorteia tudo: pele, cabelo e cor, sobrancelhas e offset,
   olhos (cor, forma, tamanho, offset), nariz (forma, tamanho, offset), boca
   (forma, offset), barba (com a mesma cor do cabelo), sardas com 30% de chance,
   pinta com 35% de chance (nunca "nenhuma" quando sorteada) e acessório com 30%
   de chance (nunca "nenhum" quando sorteado).
6. **"Voltar ao cinza"** apaga o avatar por completo, devolvendo a silhueta.
7. Ambos os botões de rodapé ("Voltar" e "Pronto") levam de volta à Identidade;
   a diferença é apenas o som (voltar vs. confirmar).

### 8.3 Ordem de desenho do retrato

O retrato é vetorial, em uma caixa de 200 por 200, desenhado nesta ordem exata
(de trás para frente):

1. Fundo (opcional; desligado quando o retrato aparece dentro da carta).
2. Camisa: torso, padrão do kit recortado pelo torso, e gola.
3. Pescoço.
4. Orelhas.
5. Rosto (elipse).
6. Sardas.
7. Olhos.
8. Sobrancelhas.
9. Nariz.
10. Pinta.
11. Barba.
12. Boca.
13. Cabelo (omitido sob a boina).
14. Acessório.

No estado de silhueta, apenas fundo, camisa, pescoço, rosto e uma sugestão
genérica de cabelo são desenhados; nenhuma feição facial aparece, e todas as
cores são cinzas.

### 8.4 Padrões de camisa

| Padrão | Desenho |
|---|---|
| Sólido | Nada além da cor base |
| Listras verticais | Faixas verticais alternadas em cor de destaque |
| Listras horizontais | Faixas horizontais alternadas |
| Banda diagonal | Uma faixa larga inclinada a -38 graus |
| Xadrez | Tabuleiro de quadrados de 21 unidades |

O kit neutro é cinza sólido e é usado quando não há clube (criação, carta de
demonstração).

---

## 9. Barra superior, ajustes e diálogos

### 9.1 Barra superior

Fixa no topo, 56 pixels de altura, fundo translúcido com desfoque.

| Elemento | Visível quando | Ação |
|---|---|---|
| Marca "CRAQUE carreira" | Sempre (o "Q" é verde; a palavra "carreira" some em telas estreitas) | Volta ao Início |
| Ícone de chuteiras | Só durante carreira em andamento | Encerrar carreira agora |
| Engrenagem | Sempre | Abre o menu de ajustes |

### 9.2 Diálogos de confirmação

Dois diálogos distintos, ambos modais, centralizados, com fundo escurecido e
desfocado, e renderizados **fora** da barra superior (para não herdar seu
contexto de posicionamento).

| Diálogo | Quando | Botão primário | Botão secundário |
|---|---|---|---|
| Sair | Clicar na marca com carreira em andamento | Cancelar (verde) | Sair mesmo assim (descarta o save) |
| Encerrar | Clicar nas chuteiras | Cancelar (verde) | Encerrar (preserva tudo e vai ao Resumo) |

O botão verde é sempre o de **não destruir nada**.

### 9.3 Menu de ajustes

Popover ancorado à engrenagem, com fechamento por clique fora e por tecla Esc.
A engrenagem gira 45 graus quando o menu está aberto.

| Ajuste | Controle | Comportamento |
|---|---|---|
| Idioma | Três segmentos: ES, EN, PT | Troca imediata. Padrão: PT. |
| Tema | Dois segmentos com ícones de lua e sol | Escuro (padrão) ou claro. Persistido. |
| Volume | Botão de mudo + deslizador de 5 passos | Passos: 0%, 25%, 50%, 75%, 100%. Padrão 75%. |

Regras do volume:

- Arrastar o deslizador para fora do zero **desmuta automaticamente**.
- O deslizador continua mostrando o nível escolhido mesmo mudo, de forma que
  desmutar restaure esse nível e não vá ao máximo.
- O rótulo à direita mostra "mudo" ou a porcentagem.
- Há som de "tique" ao **soltar** o deslizador, nunca a cada passo.
- Desmutar toca um som de confirmação; mutar não toca nada.

### 9.4 Tema

O jogo **sempre começa no tema escuro**, independentemente da preferência do
sistema operacional. O tema claro é estritamente opt-in.

| Token | Escuro | Claro |
|---|---|---|
| Fundo | `#070b12` | `#f3f5f9` |
| Superfície | `#0d1420` | `#ffffff` |
| Superfície 2 | `#131c2b` | `#eef1f6` |
| Primeiro plano | `#f2f6fb` | `#10151f` |
| Texto secundário | `#9aa8bd` | `#4b5567` |
| Texto terciário | `#5f6e85` | `#6b7690` |
| Linha | `#1d2838` | `#dde3ec` |
| Verde (gramado) | `#2fbf62` | `#1f9e50` |
| Verde profundo | `#0f7a3c` | `#0f7a3c` |
| Dourado | `#f5c451` | `#b8860f` |
| Dourado profundo | `#a97b17` | `#8a5f10` |
| Refletor | `#dfe9ff` | `#2f5fd8` |
| Perigo | `#f2555a` | `#d3323e` |

No tema escuro o corpo da página recebe três degradês radiais sobrepostos
(refletor branco vindo de cima, um verde à esquerda e um dourado à direita), com
anexação fixa. No tema claro o fundo é chapado, sem degradês.

### 9.5 Casca da página

- O corpo tem exatamente **uma altura de viewport dinâmica** e nunca rola.
- Tudo que precisa rolar rola dentro da própria caixa.
- Em telas menores que o ponto de corte largo, a casca inteira passa a rolar e
  cada bloco assume a altura de que precisa.
- Barras de rolagem são finas (6 pixels), com polegar na cor de linha.

---

## 10. O mundo

### 10.1 Escala

| Conjunto | Quantidade |
|---|---|
| Países selecionáveis como nacionalidade | 211 |
| Ligas | 32 |
| Países com liga jogável | 17 |
| Clubes | 489 |
| Divisões de acesso (segunda divisão) | 15 |
| Confederações | 6 (UEFA, CONMEBOL, CONCACAF, CAF, AFC, OFC) |

### 10.2 Ligas

| País | Nível 1 | Clubes | Nível 2 | Clubes |
|---|---|---|---|---|
| ARG | Liga Profesional | 30 | Primera Nacional | 36 |
| BOL | Liga Bolivia | 8 | Copa Simón Bolívar | 8 |
| BRA | Brasileirão | 20 | Brasileirão Série B | 20 |
| CHI | Liga de Primera | 9 | Primera B | 10 |
| COL | Liga Dimayor | 10 | Torneo Dimayor | 10 |
| ECU | LigaPro Serie A | 9 | LigaPro Serie B | 9 |
| ENG | Premier League | 20 | Championship | 24 |
| ESP | LaLiga | 20 | LaLiga 2 | 20 |
| FRA | Ligue 1 | 18 | Ligue 2 | 18 |
| GER | Bundesliga | 18 | 2. Bundesliga | 18 |
| ITA | Serie A | 20 | Serie B | 20 |
| MEX | Liga MX | 18 | - | - |
| PAR | Copa de Primera | 8 | División Intermedia | 8 |
| PER | Liga1 | 8 | Liga 2 | 8 |
| URU | Liga Uruguaya | 9 | Segunda División | 9 |
| USA | MLS | 30 | - | - |
| VEN | Liga FUTVE | 8 | Liga FUTVE 2 | 8 |

México e Estados Unidos **não têm segunda divisão** de propósito: a MLS não tem
acesso e rebaixamento, e a Liga MX suspendeu o seu. Por consequência, ninguém
que jogue nesses dois países pode ser rebaixado nem promovido.

### 10.3 Atributos de um clube

| Campo | Uso |
|---|---|
| Nome, nome curto, abreviação | Exibição |
| Cor primária | Base para o escudo gerado e para o kit de fallback |
| Reputação doméstica (0 a 5) | Odds de liga, copa, supercopa nacional e rebaixamento |
| Reputação continental (0 a 5) | Odds de competições continentais e mundiais |
| Reputação internacional (0 a 5) | Nível base do elenco, e portanto status no elenco e ofertas |

Todo clube de segunda divisão tem as **três reputações em zero**.

### 10.4 Nível base do elenco por reputação internacional

| Reputação | OVR base do elenco |
|---|---|
| 0 | 58 |
| 1 | 68 |
| 2 | 75 |
| 3 | 80 |
| 4 | 84 |
| 5 | 88 |

### 10.5 Atributos de um país

Nome em três idiomas, código ISO, código FIFA, bandeira, confederação, reputação
continental, reputação FIFA, reputação internacional, cor primária e as cores e
o padrão do kit da seleção.

### 10.6 Catálogo de competições

**Títulos de clube**

| Chave | Descrição | Peso de importância |
|---|---|---|
| Supercopa nacional | Campeão contra campeão da copa, jogo único no início da temporada seguinte | 0,30 |
| Copa da liga | Segunda copa nacional (só a Inglaterra tem) | 0,45 |
| Copa nacional | Copa mata-mata do país | 0,60 |
| Liga | Campeonato nacional | 1,00 |
| Continental terciária | Terceiro torneio continental (só UEFA) | 1,10 |
| Supercopa continental | Campeão continental contra campeão da secundária, temporada seguinte | 0,80 |
| Continental secundária | Segundo torneio continental | 1,60 |
| Copa Intercontinental | Anual, contra os outros campeões continentais | 1,60 (varia, ver abaixo) |
| Continental primária | Principal torneio continental | 2,60 |
| Mundial de Clubes | A cada quatro anos, entre os campeões do ciclo | 3,40 (varia) |

**Peso da Intercontinental por confederação** (o que a conquista significa para
o clube): UEFA 0,7; CONMEBOL 2,4; CONCACAF 2,6; CAF 2,6; AFC 2,6; OFC 2,6.

**Peso do Mundial de Clubes por confederação**: UEFA 3,0; CONMEBOL 3,8; CONCACAF
4,0; CAF 4,0; AFC 4,0; OFC 4,0.

**Títulos de seleção**

| Chave | Peso |
|---|---|
| Continental de seleções | 1,00 |
| Copa do Mundo | 2,60 |

**Prêmios individuais**: Bola de Ouro, Chuteira de Ouro, Luva de Ouro.

### 10.7 Torneios continentais por confederação

| Confederação | Primária | Secundária | Terciária | Supercopa | Seleções |
|---|---|---|---|---|---|
| UEFA | Champions League | Europa League | Conference League | Supercopa da UEFA | Euro |
| CONMEBOL | Copa Libertadores | Copa Sudamericana | - | Recopa Sudamericana | Copa América |
| CONCACAF | Concachampions | - | - | - | Copa Ouro |
| CAF | - | - | - | - | Copa Africana de Nações |
| AFC | - | - | - | - | Copa Asiática |
| OFC | - | - | - | - | Copa das Nações da OFC |

### 10.8 Copas nacionais

Existem para ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER, ITA, PAR, PER,
URU, USA e VEN. **México não tem copa nacional** (a Copa MX foi extinta).

### 10.9 Supercopas nacionais

Existem para ENG, ESP, ITA, GER, FRA, BRA, ARG, MEX, CHI, COL, ECU, URU e PAR.
**Bolívia, Venezuela, Peru e Estados Unidos não têm.**

### 10.10 Copas da liga

Só a Inglaterra (EFL Cup). A competição é aberta também à segunda divisão.

### 10.11 Rivalidades reais

Existe uma tabela de duplas de clubes que são rivais históricos reconhecíveis
(clássicos), usada exclusivamente para marcar "traidor" quando o jogador sai de
um clube e assina diretamente com o rival. A tabela é deliberadamente
conservadora: dois clubes não listados simplesmente não são rivais. Cobre Brasil,
Argentina, Inglaterra, Espanha, Itália, Alemanha, França, México, Colômbia,
Chile, Uruguai, Peru, Equador, Paraguai, Bolívia, Venezuela e Estados Unidos.
---

## 11. O jogador

### 11.1 Estado inicial

| Campo | Valor |
|---|---|
| Idade | 16 |
| OVR | 50 |
| Valor de mercado | 100 mil euros |
| Clube | Nenhum |
| Número da camisa | Nenhum |
| Torcida | 0 (ninguém ouviu falar dele) |
| Idade de aposentadoria compulsória | 40 |

### 11.2 Posições e papéis

| Papel | Posições |
|---|---|
| Atacante | LW, ST, RW |
| Criador | LM, CAM, RM |
| Apoio | LB, CM, RB |
| Defensivo | CDM, CB |
| Goleiro | GK |

Além disso existe o conceito de **defensor**, mais largo que o papel defensivo,
usado apenas para decidir por qual número a temporada é julgada na interface:
CB, LB, RB e CDM. Um lateral é defensor mesmo que o modelo de crescimento o
coloque com os meio-campistas, porque ninguém lê a temporada de um lateral pelos
gols.

### 11.3 Os seis atributos

**Jogadores de linha**

| Atributo | Sigla impressa |
|---|---|
| Ritmo | RIT |
| Finalização | FIN |
| Passe | PAS |
| Condução (drible) | CON |
| Defesa | DEF |
| Físico | FÍS |

**Goleiros**

| Atributo | Sigla impressa |
|---|---|
| Elasticidade | ELA |
| Manejo | MAN |
| Chute | CHU |
| Reflexos | REF |
| Velocidade | VEL |
| Posicionamento | POS |

Todo jogador carrega internamente os doze números; a carta imprime apenas os
seis da metade correspondente. A metade não usada é fixada em **12** na criação
e nunca cresce.

### 11.4 Cálculo do OVR

O OVR é a **média ponderada dos atributos que a posição usa, mais um bônus fixo
da posição**. Atributos fora da posição têm peso **zero**: um centroavante não é
penalizado por marcar mal.

Pesos (cada linha soma 1):

| Pos | RIT | FIN | PAS | CON | DEF | FÍS |
|---|---|---|---|---|---|---|
| ST | 0,08 | 0,45 | 0,11 | 0,20 | 0 | 0,16 |
| LW / RW | 0,14 | 0,24 | 0,20 | 0,34 | 0 | 0,08 |
| CAM | 0,09 | 0,22 | 0,32 | 0,30 | 0 | 0,07 |
| LM / RM | 0,15 | 0,20 | 0,27 | 0,33 | 0 | 0,05 |
| CM | 0,05 | 0,08 | 0,36 | 0,30 | 0,12 | 0,09 |
| CDM | 0,04 | 0,03 | 0,27 | 0,15 | 0,32 | 0,19 |
| LB / RB | 0,20 | 0,04 | 0,20 | 0,16 | 0,26 | 0,14 |
| CB | 0,06 | 0 | 0,12 | 0,07 | 0,48 | 0,27 |

| Pos | ELA | MAN | CHU | REF | VEL | POS |
|---|---|---|---|---|---|---|
| GK | 0,25 | 0,16 | 0,11 | 0,29 | 0 | 0,19 |

Bônus somado depois da média:

| Posição | Bônus |
|---|---|
| ST, LW, RW | +3,6 |
| LM, RM | +3,0 |
| CAM, CM | +5,0 |
| CDM | +6,0 |
| CB | +4,1 |
| LB, RB | +3,2 |
| GK | +1,0 |

O bônus existe porque a referência do gênero calcula o overall a partir de
dezenas de sub-atributos invisíveis (reação, compostura, interceptação,
posicionamento), o que produz um deslocamento sistemático: a carta real fica
alguns pontos acima da média dos seis números impressos, mais no meio-campo e
quase nada no gol. Este modelo reproduz vinte e três cartas reais de referência
com erro médio absoluto de 0,76 ponto e erro máximo de 1,8.

Requisito: **o OVR nunca é decidido primeiro**. Ele é sempre lido de volta dos
atributos depois que eles se movem. Toda vez que o jogo precisa aplicar um
delta de OVR (um evento, um bônus de título), ele redistribui esse delta pelos
atributos e depois recalcula o OVR.

### 11.5 Normalização para um OVR alvo

Quando um delta de OVR precisa ser aplicado:

1. Calcula-se a diferença entre o OVR alvo e o atual.
2. Distribui-se essa diferença proporcionalmente ao peso de cada atributo, mas
   **somente entre atributos que ainda têm folga na direção necessária** (abaixo
   do próprio teto se estiver subindo; acima de 1 se estiver descendo).
3. Repete-se até seis vezes para absorver o recorte nas bordas.
4. Todos os atributos ficam sempre entre 1 e 99.

Requisito derivado: um bônus de título aplicado a uma carta já madura pousa nas
partes da carta que ainda cabem, e não sobe os seis números juntos. Sem isso,
dois terços das carreiras geracionais terminavam com pelo menos um 99.

### 11.6 Forma inicial da carta

Aos 16 anos, todos os atributos da metade usada partem de 50 mais um
deslocamento fixo por posição, e depois a carta inteira é normalizada para OVR 50.

| Pos | RIT | FIN | PAS | CON | DEF | FÍS |
|---|---|---|---|---|---|---|
| ST | +6 | +8 | -6 | +2 | -14 | +2 |
| LW / RW | +10 | +3 | -2 | +7 | -14 | -6 |
| CAM | +2 | +3 | +8 | +7 | -12 | -6 |
| LM / RM | +7 | 0 | +5 | +5 | -8 | -6 |
| CM | 0 | -3 | +8 | +4 | 0 | 0 |
| CDM | -4 | -8 | +4 | -2 | +8 | +6 |
| LB / RB | +8 | -10 | +2 | 0 | +5 | 0 |
| CB | -4 | -14 | -4 | -8 | +10 | +9 |

| Pos | ELA | MAN | CHU | REF | VEL | POS |
|---|---|---|---|---|---|---|
| GK | +3 | +2 | -6 | +4 | -8 | +2 |

### 11.7 Valor de mercado

Interpolação linear entre âncoras, mais um ajuste de idade e um ruído de 0,95 a
1,05.

| OVR | Valor |
|---|---|
| 50 | 100 mil |
| 55 | 250 mil |
| 60 | 500 mil |
| 65 | 1,2 milhões |
| 70 | 3 milhões |
| 75 | 5 milhões |
| 80 | 15 milhões |
| 85 | 50 milhões |
| 90 | 100 milhões |
| 95 | 150 milhões |
| 99 | 250 milhões |

Formatação exibida: acima de 1 milhão, mostra em milhões com uma casa decimal
até 10M e arredondado acima disso (por exemplo "€12,5M" e "€120M"); abaixo,
mostra em milhares ("€850K").

---

## 12. Talento, potencial e personalidade

### 12.1 Faixas de talento

Sorteadas uma vez, no início da carreira, antes de qualquer decisão.

| Faixa | Peso (normal) | Intervalo de potencial |
|---|---|---|
| Promessa | 28 | 70 a 78 |
| Talento | 34 | 77 a 85 |
| Craque | 22 | 85 a 91 |
| Fenômeno | 11 | 91 a 96 |
| Geracional | 5 | 96 a 99 |

Os pesos são multiplicados pelos valores da dificuldade antes do sorteio. O
potencial exato é sorteado uniformemente dentro do intervalo da faixa.

O potencial é um **teto suave**: o crescimento desacelera drasticamente perto
dele mas nunca chega a zero, e um foco de treino pode ultrapassá-lo em até
quatro pontos num único atributo. Não existe teto rígido em lugar nenhum do
jogo.

### 12.2 Perfil de desenvolvimento

Sorteado junto com o potencial.

| Perfil | Chance | Efeito |
|---|---|---|
| Precoce | 10% | Todas as curvas de idade são avaliadas como se o jogador fosse **2 anos mais velho**: atinge o pico e decai mais cedo. |
| Normal | 80% | Sem deslocamento. |
| Tardio | 10% | Curvas avaliadas como se fosse **2 anos mais novo**: demora mais para estourar e dura mais. |

**Goleiros são sempre normais.**

### 12.3 Veredito do olheiro

O jogo nunca revela o potencial diretamente. A leitura vai afiando conforme a
carreira avança, e depende de **dois portões que precisam ser cruzados ao mesmo
tempo**: idade e jogos na carreira.

| Nível | Idade mínima | Jogos mínimos | O que mostra |
|---|---|---|---|
| Desconhecido | - | - | "Ainda não dá para saber" |
| Rumor | 22 | 75 | Uma faixa, que **pode estar errada** |
| Aproximado | 27 | 230 | Uma faixa, quase certa |
| Exato | 32 | 440 | A faixa verdadeira |

Comportamento do **rumor**: a faixa reportada sofre um desvio de até dois níveis
em torno da verdadeira, com pesos 12 / 24 / 28 / 24 / 12 para os deslocamentos
-2, -1, 0, +1, +2. O jogo exibe duas faixas separadas por "ou", com um ponto de
interrogação e opacidade reduzida.

Comportamento do **aproximado**: desvio de até um nível, com pesos 17 / 66 / 17.
Também exibido como duas faixas com interrogação.

Requisito crítico de interface: **a cor do rótulo acompanha a faixa reportada,
nunca a verdadeira.** Colorir pela verdadeira entregaria a resposta, porque uma
leitura hesitante "Craque ou Fenômeno" impressa na cor de Fenômeno diz
exatamente qual das duas é.

Cores por faixa reportada: Promessa cinza, Talento azul-claro, Craque verde,
Fenômeno âmbar, Geracional fúcsia. Desconhecido usa cinza terciário.

Razão de design registrada: usar somente jogos como portão quebrava a tensão
principal do jogo, porque um adolescente que jogasse duas temporadas inteiras
num clube pequeno saberia aos 18 se valia a pena continuar, e o movimento
correto passava a ser reiniciar até sair uma boa faixa.

### 12.4 Traços de personalidade

Sorteado uma vez, no início.

| Traço | Peso | Odds de risco | Crescimento | Declínio | Torcida por temporada |
|---|---|---|---|---|---|
| Determinado | 22 | ×1,18 | ×1,06 | ×1,00 | +0 |
| Profissional | 20 | ×1,05 | ×1,02 | ×0,85 | +1 |
| Líder | 16 | ×1,12 | ×1,00 | ×0,95 | +3 |
| Showman | 16 | ×1,00 | ×1,00 | ×1,00 | +5 |
| Cabeça quente | 14 | ×1,10 | ×1,03 | ×1,08 | -2 |
| Frágil | 12 | ×0,85 | ×0,97 | ×1,12 | +0 |

"Odds de risco" multiplica a probabilidade de a escolha arriscada de um evento
de carreira dar certo.

### 12.5 Explosão precoce

Um talento verdadeiramente raro pode chegar pronto. A rolagem acontece **antes
da primeira temporada**, aos 16 anos, e só se o clube já tiver decidido usar o
jogador (status no elenco não é de banco).

| Faixa | Chance |
|---|---|
| Fenômeno | 15% |
| Geracional | 25% |
| Demais | 0% |

Quando acontece, o OVR salta para um valor sorteado entre **73 e 87**, limitado
pelo potencial do jogador. O salto é o teto chegando cedo, nunca um teto
diferente.

Requisito: isso é rolado **antes** da temporada, para que os jogos, os gols, a
torcida e o jornal daquele ano pertençam ao jogador em que ele se transformou.
Aplicar depois produzia um garoto de 16 anos com carta 87 ao lado de uma linha
com dez jogos e nenhum gol.

---

## 13. Crescimento e declínio

Esta é a peça central do jogo. Ela roda **uma vez por temporada**, depois que a
temporada foi jogada, e usa o que realmente aconteceu em campo.

### 13.1 Fórmula por atributo

Para cada um dos seis atributos da posição:

```
ganho_final = (gatilho + bônus_de_treino × 4,5)
              × treinabilidade
              × fator_de_treinador
              × freio_de_potencial
              × multiplicador_de_forma
              × confiança
              × multiplicador_de_crescimento_do_traço_e_dificuldade
              × fator_de_folga
              × freio_de_liderança

novo_valor = limitar(valor + ganho_final + declínio × multiplicador_de_declínio)
```

### 13.2 Gatilhos de crescimento (jogadores de linha)

Todas as taxas são **por jogo** e saturam: uma temporada excelente é premiada
por inteiro, uma absurda não é premiada mais ainda.

Fator de jogos: zero se não jogou; caso contrário `0,35 + 0,65 × min(1, jogos/32)`.
O piso existe porque um reserva ainda treina com o grupo a semana inteira. Sem
o piso, minutos dominariam todo o resto e "assinar com o time mais fraco que me
escale" seria o único movimento correto do jogo.

| Atributo | Gatilho |
|---|---|
| Finalização | afinidade × (valor_de_produção_por_idade × taxa_de_gols × **9,5** + **1,35** × fator_de_jogos) |
| Passe | afinidade × (valor_de_produção_por_idade × taxa_de_assistências × **9,5** + **1,35** × fator_de_jogos) |
| Condução | afinidade × **7,0** × (**1,3** + taxa_de_criação) × fator_de_jogos |
| Ritmo | afinidade × **2,6** × fator_de_idade_de_ritmo × fator_de_jogos |
| Físico | afinidade × **3,4** × fator_de_idade_físico × fator_de_jogos |
| Defesa | afinidade × **5,6** × fator_de_experiência × fator_de_jogos × solidez_do_time |

Ritmo e Físico são deliberadamente baratos porque não pedem nada ao jogador além
de estar disponível. Nivelados com os demais, eles simplesmente venciam: um
zagueiro terminava com Físico como maior número da carta em 146 de 150 testes.

Solidez do time (para Defesa): `0,5 + 0,5 × reputação_do_clube/5`.

As taxas são medidas contra o que é uma temporada de elite **para aquele papel**
e depois descontadas pela força real da oposição:

| Papel | Gols/jogo de elite | Assistências/jogo de elite | Criação/jogo de elite |
|---|---|---|---|
| Atacante | 0,62 | 0,20 | 0,78 |
| Criador | 0,42 | 0,30 | 0,70 |
| Apoio | 0,08 | 0,13 | 0,20 |
| Defensivo | 0,05 | 0,045 | 0,09 |
| Goleiro | 0,01 | 0,05 | 0,05 |

### 13.3 Gatilhos de crescimento (goleiros)

Unidade de crescimento de goleiro: **2,5**.

| Atributo | Gatilho |
|---|---|
| Elasticidade | afinidade × 2,5 × (0,7 + 1,8 × taxa_de_jogos_sem_sofrer) × fator_de_jogos |
| Reflexos | afinidade × 2,5 × (0,7 + 1,6 × taxa_de_jogos_sem_sofrer + 0,5 × solidez) × fator_de_jogos |
| Posicionamento | afinidade × 2,5 × fator_de_experiência × (0,78 + 0,42 × solidez) × fator_de_jogos |
| Manejo | afinidade × 2,5 × (0,8 + 1,0 × fator_de_jogos) |
| Chute | afinidade × 2,5 × (1,0 + 0,9 × fator_de_jogos + 0,6 × taxa_de_assistências + 0,3 × reputação/5) |
| Velocidade | afinidade × 2,6 × fator_de_idade_de_ritmo × (0,5 + 0,5 × fator_de_jogos) |

Taxa de jogos sem sofrer satura em 0,45 por jogo; gols sofridos saturam em 2,2
por jogo; solidez é `1 - taxa_de_gols_sofridos`.

Nota de design: o posicionamento é trabalho do próprio goleiro. Atrás de uma
defesa vazada ele **treina mais**, não menos, por isso o termo que o time
contribui é deliberadamente a metade menor. O chute cresce de jogar, não das
assistências que um goleiro quase nunca tem: amarrá-lo só a assistências deixava
o chute como o único número da carta que nunca se mexia.

### 13.4 Afinidade

A afinidade de um atributo é medida contra o **peso mais alto da própria
posição**, não contra uma escala absoluta:

```
relativo  = min(1, peso / peso_máximo_da_posição)
afinidade = 0,1 + 0,9 × relativo^0,6
```

Depois disso, a afinidade é normalizada por posição, de forma que a taxa global
de crescimento não dependa de quão **concentrados** são os pesos daquela posição.
Sem essa normalização, zagueiros (0,48 em Defesa) ganhariam uma vantagem enorme
sobre meio-campistas centrais, cujos seis pesos são quase iguais: um artefato da
matemática, não uma decisão de design. A constante de referência de concentração
é **0,98**.

### 13.5 Curvas de idade

| Fator | ≤18 | 19-21 | 22-24 | 25-27 | 28-30 | 31+ |
|---|---|---|---|---|---|---|
| Ritmo | 1,7 | 1,4 | 1,0 | 0,6 | 0,3 | 0,1 |

| Fator | ≤18 | 19-22 | 23-27 | 28-31 | 32+ |
|---|---|---|---|---|---|
| Físico | 0,8 | 1,2 | 1,4 | 1,0 | 0,5 |

| Fator | ≤20 | 21-24 | 25-29 | 30+ |
|---|---|---|---|---|
| Experiência | 0,6 | 0,9 | 1,2 | 1,4 |

| Fator | ≤19 | 20-22 | 23-25 | 26-28 | 29-31 | 32-34 | 35+ |
|---|---|---|---|---|---|---|---|
| Treinabilidade base | 1,45 | 1,3 | 1,0 | 0,72 | 0,34 | 0,18 | 0,09 |

A treinabilidade é a torneira mestra: a experiência decide **quais** atributos
melhoram, mas depois do fim dos vinte simplesmente há menos a ganhar. Jogadores
excepcionais mantêm parte da treinabilidade: a retenção é
`limitar((potencial - 84) / 15, 0, 1)` e reduz a queda da curva. É a razão pela
qual os maiores de todos os tempos ainda melhoravam aos 30, e o que dá às faixas
mais raras a pista de decolagem que elas precisam para de fato chegar ao teto
prometido.

| Fator | ≤19 | 20-22 | 23-25 | 26-28 | 29+ |
|---|---|---|---|---|---|
| Valor da produção por idade | 1,4 | 1,05 | 0,8 | 0,6 | (continua caindo) |

### 13.6 Qualidade do clube

| Reputação internacional | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Fator de treinador (quanto o clube ensina) | 0,72 | 0,86 | 1,00 | 1,13 | 1,28 | 1,44 |
| Fator de competição (o quanto a produção vale) | 0,45 | 0,62 | 0,80 | 0,95 | 1,08 | 1,20 |

O fator de competição existe para eliminar uma estratégia degenerada: sem ele, o
movimento ótimo é cair para a pior liga possível e colher gols, porque o modelo
de taxa de gols já paga muito bem quando o jogador está muito acima da liga.
Isso é o oposto de como jogadores se desenvolvem de verdade.

### 13.7 Freio de potencial

```
folga = potencial - OVR
se folga ≤ 0: freio = 0,05
senão:        freio = limitar(folga / 16, 0,05, 2,2)
```

Deliberadamente bilateral: uma folga grande não apenas deixa de frear, ela
**acelera**. Talento bruto precisa ser diferente de jogar, não apenas permitir um
número maior vinte temporadas depois. O freio nunca chega a zero, para que uma
sequência excepcional possa passar um pouco do próprio potencial: um teto rígido
se lê como injusto, um afunilamento íngreme se lê como "espremi tudo o que havia".

### 13.8 Teto por atributo

Cada atributo tem o próprio teto, centrado na média ponderada da posição:

```
teto = potencial - bônus_da_posição + 8 × (relativo - média_relativa_da_posição) × 2 - 2
```

Onde `relativo` é o peso do atributo dividido pelo maior peso da posição. Isso
garante que uma carta totalmente crescida pouse exatamente no potencial, mas que
os atributos dentro dela se espalhem como a posição exige: um zagueiro com 88 de
potencial tem Defesa bem acima de 88 e Ritmo bem abaixo, e não 88 em tudo, que
seria internamente consistente e uma carta que ninguém imprimiria.

- **Espalhamento**: 8 pontos.
- **Recuo de estagnação**: 2 pontos (atributos já no teto param antes).

### 13.9 Fator de folga

```
folga = limitar((teto - valor) / 26, 0, 1,5)
```

Retornos decrescentes conforme o atributo se aproxima do próprio teto.

### 13.10 Freio de liderança

Impede que um único atributo dispare muito à frente do OVR e produza uma carta
irreconhecível.

```
liderança = valor - OVR
se liderança ≤ 6:  freio = 1
senão:             freio = max(0,2, 1 - (liderança - 6) / 10)
```

Requisito explícito: isto é um **freio multiplicativo, nunca um teto rígido**.
Uma versão anterior usava um limite absoluto de distância e travava o
crescimento inteiro: o OVR de pico caía de 78 para 61.

### 13.11 Declínio

```
severidade = severidade_por_idade(idade - graça_da_posição) × completude
completude = limitar(OVR / potencial, 0,5, 1)
perda_por_atributo = -severidade × parcela_do_atributo × fator_de_nível
fator_de_nível = max(0,35, valor / 58)
```

| Idade ajustada | ≤26 | 27-28 | 29-30 | 31-32 | 33-34 | 35-36 | 37+ |
|---|---|---|---|---|---|---|---|
| Severidade | 0 | 0,38 | 0,70 | 1,20 | 1,80 | 2,40 | 3,00 |

**Graça por posição** (anos de folga antes de o envelhecimento morder):

| Posição | Graça |
|---|---|
| LW, RW, LM, RM | -1 |
| ST, CAM, LB, RB, CM | 0 |
| CDM | +1 |
| CB | +2 |
| GK | +3 |

Um zagueiro aos 32 envelhece como um ponta aos 29.

**Parcelas do declínio** (o que a idade come primeiro):

| Atributo | Parcela |
|---|---|
| Ritmo / Velocidade | 2,2 |
| Elasticidade | 1,5 |
| Físico | 1,4 |
| Condução / Reflexos | 1,2 |
| Finalização | 0,9 |
| Defesa / Manejo | 0,8 |
| Chute | 0,6 |
| Passe | 0,5 |
| Posicionamento | 0,4 |

A explosividade vai primeiro; a inteligência de jogo vai por último.

A **completude** é o que permite que um jogador tardio ainda esteja subindo aos
31 enquanto um colega já esgotado começa a apagar: quem ainda tem muito talento
não realizado continua melhorando de formas que compensam o desgaste atlético.

Requisito: o declínio **não é afetado pela forma da temporada**. Uma temporada
ruim não desacelera o envelhecimento e uma ótima não o interrompe.

### 13.12 Forma da temporada

Uma rolagem por temporada, que multiplica **todo** o crescimento.

| Resultado | Chance | Multiplicador |
|---|---|---|
| Explosão | ver tabela abaixo | 2,4 a 4,0 |
| Queda | 10% | 0,35 a 0,65 |
| Normal | resto | 0,85 a 1,15 |

Chance base de explosão por idade (ajustada pelo perfil de desenvolvimento):

| Idade | ≤19 | 20-22 | 23-25 | 26-28 | 29+ |
|---|---|---|---|---|---|
| Chance | 20% | 16% | 8% | 3% | 0,8% |

Essa chance é multiplicada por `min(1, fator_de_jogos × 1,8)`, e é **zerada**
abaixo de **20 jogos** na temporada. Uma temporada que define uma carreira
precisa ter sido jogada de verdade, não inferida de onze participações
simbólicas.

### 13.13 Confiança da torcida

```
confiança = 0,92 + 0,16 × (torcida / 100)
```

Faixa deliberadamente estreita: tempera uma temporada em vez de decidi-la. Mas é
o que torna concreto o valor de ficar tempo suficiente num lugar para ser amado.

### 13.14 Garantia do foco de treino

Se o jogador escolheu um foco de treino, os atributos daquele foco **terminam o
período pelo menos um ponto acima** de onde começaram, aconteça o que acontecer
(declínio, forma ruim, redistribuição de bônus de título).

O piso pode ultrapassar o teto natural do atributo, mas **somente em até 4
pontos**. Sem esse limite, escolher o mesmo foco toda vez levava um atributo do
teto até 99 independentemente do talento de nascença, e era a maior causa de
99 aparecendo em cartas que não tinham por que carregar um.

### 13.15 Bônus de título na carta

Levantar troféu vale ponto na carta, com teto.

- O bônus é proporcional à **importância somada** dos títulos da temporada (ver
  a tabela de pesos da seção 10.6), usando a confederação do clube.
- O bônus não se aplica acima de **OVR 90**, e além disso não pode passar do
  teto derivado do potencial.
- É aplicado depois do crescimento natural e antes do choque de rebaixamento.

Requisito de design: suficiente para se sentir merecido, pequeno o bastante para
que perseguir título nunca ganhe de simplesmente jogar bem.

### 13.16 Choque de rebaixamento de clube grande

Se um clube com reputação doméstica alta for rebaixado, o elenco inteiro perde
**10 pontos de OVR**, o jogador incluído, aplicado logo após o bônus de título.
Não respeita o potencial: é um choque, não um ajuste.
---

## 14. O laço de carreira

### 14.1 Estrutura

```
  início da carreira
        │
        ▼
  gera a próxima decisão  ◄──────────────┐
        │                                │
        ▼                                │
  jogador escolhe uma opção              │
        │                                │
        ▼                                │
  resolve os efeitos da escolha          │
        │                                │
        ▼                                │
  simula N temporadas (N = 1 ou 2)       │
        │                                │
        ▼                                │
  aplica garantias do período ───────────┘
        │
        ▼ (só se a carreira acabou)
      resumo
```

### 14.2 Ordem exata de geração da próxima decisão

A cada vez que uma decisão termina, a próxima é escolhida por esta ordem, e a
**primeira que se aplicar vence**:

1. **Idade 40 ou mais** → a carreira termina imediatamente. Motivo: idade.
2. **Idade 26 ou mais e OVR abaixo de 50** → decisão de aposentadoria forçada
   por falta de ofertas, com **uma única opção**: aposentar. Motivo: má forma.
3. **Cumprindo suspensão** → só janelas de transferência normais, nada mais.
4. **Voltando de empréstimo** → decisão de pós-empréstimo (retido, não retido,
   ou passou da idade). O vínculo de empréstimo é sempre limpo aqui, mesmo que
   nenhuma decisão tenha conseguido ser montada.
5. **Não renovação de contrato** → se a idade e as sequências de mau uso o
   permitirem (ver 14.3).
6. **Evento de carreira** → se algum evento estiver agendado e elegível.
7. **Foco de treino** → se a idade estiver entre 17 e 31, o último foco for de
   pelo menos 3 períodos atrás, e uma rolagem de **45%** passar.
8. **Empréstimo ou transferência** → se o jogador for elegível a empréstimo,
   sorteia-se entre "empréstimo" (peso conforme status) e "transferência" (peso
   100 menos aquele). Caso contrário, transferência direta.
9. **Nenhuma oferta possível** → a carreira termina. Motivo: sem ofertas.

Sobre a decisão gerada, se a carreira permitir aposentadoria antecipada (só o
Desafio do Dia) e a idade for **27 ou mais** e a decisão for de janela
(transferência, empréstimo, pós-empréstimo em qualquer variante, não renovação),
uma opção adicional **"aposentar agora"** é acrescentada.

### 14.3 Não renovação de contrato

Um clube deixa de renovar quando o jogador foi mal utilizado por tempo demais.

| Dificuldade | Idade mínima | Períodos de reserva (modo longo / normal) | Períodos de baixa rotação (longo / normal) |
|---|---|---|---|
| Normal | 26 | 2 / 1 | 3 / 2 |
| Difícil | 24 | 1 / 1 (um a menos, mínimo 1) | 2 / 1 |

As sequências contam períodos **consecutivos** no clube atual.

### 14.4 Resolução de uma escolha

Ao escolher uma opção, nesta ordem:

1. Se a opção for "aposentar", a carreira termina. O **motivo** depende de onde:
   na decisão de aposentadoria forçada é "má forma"; numa não renovação é "sem
   ofertas"; em qualquer outro lugar é "voluntária".
2. Registram-se os clubes **recusados** nessa decisão (nunca em oferta de
   academia, nunca a opção "ficar", nunca opções sem clube). Máximo de 40
   registrados, com a reputação congelada no momento da oferta.
3. Resolvem-se os **modificadores** do evento de carreira, se houver, uma vez
   para todo o período.
4. Resolvem-se as sobreposições de troféu forçado (lesão no auge, pênalti
   decisivo, conflito clube vs. seleção).
5. Decide-se **onde o jogador joga**: aceitar oferta de rival, entrar por
   empréstimo, ficar, transferir-se ou permanecer onde estava.
6. Se ainda não houver número de camisa, um é atribuído.
7. Eventos de camisa podem trocar o número.
8. Troca de nacionalidade reconstrói o calendário de torneios.
9. Deltas imediatos e permanentes de OVR são aplicados **uma vez para o período
   inteiro**, espalhados pela carta.
10. Delta de potencial (lesão grave) reduz o teto, com piso em **55** (OVR
    inicial mais 5), para que um save fique danificado e nunca injogável.
11. Contador de suspensão é ajustado (mínimo 2 temporadas, ou o tamanho do
    período, o que for maior).
12. Manchetes de mudança de clube, lesão grave e camisa são acrescentadas.
13. O **briefing** do clube é fixado (só muda quando o clube muda).
14. A **torcida de chegada** é calculada (ver 21.3).
15. Clubes "traídos" são registrados.
16. O foco de treino escolhido passa a valer para as temporadas seguintes.
17. O evento de carreira é marcado como cumprido no plano.
18. **Simula-se cada temporada do período**, uma por vez.
19. A garantia de foco de treino é aplicada ao fim do período.
20. Deltas adiados de OVR (por exemplo, recuperação de uma lesão) são aplicados.
21. Se foi um empréstimo, o jogador volta ao clube contratante.
22. Gera-se a próxima decisão.

### 14.5 Ordem exata dentro de uma temporada

1. **Explosão precoce** (só aos 16, só se não estiver no banco).
2. Determina-se a divisão em que o clube realmente está.
3. **Estatísticas da temporada**: status no elenco, jogos, contusão leve, gols,
   assistências, jogos sem sofrer gol.
4. **Títulos de clube**.
5. **Seleção nacional**.
6. **Prêmios individuais**.
7. **Promoção ou rebaixamento**.
8. **Reputação do clube** (bônus por título, decaimento para os demais).
9. Valor de mercado da temporada.
10. Registra-se o instantâneo da temporada.
11. **Crescimento e declínio** dos atributos.
12. **Bônus de OVR por título**.
13. **Choque de rebaixamento de clube grande** (-10 OVR).
14. O instantâneo é reescrito com o OVR e os atributos **do fim** da temporada.
15. Novo valor de mercado.
16. **Convocações** acumuladas.
17. **Torcida**.
18. **Manchetes**.
19. **Rolagem do rival** (uma única vez na vida).

Requisito: o instantâneo precisa registrar o OVR **do fim** da temporada. Sem
isso, a tabela mostrava a evolução da temporada anterior ao lado dos jogos
desta, e o jornal anunciava uma explosão para um número que a tabela só
imprimiria um ano depois.

---

## 15. Catálogo de decisões

Existem dez tipos de decisão. Cada um usa um dos três painéis: oferta de clube,
evento de carreira ou foco de treino.

| Tipo | Painel | Quando aparece | Opções |
|---|---|---|---|
| Oferta de academia | Clube | Uma vez, aos 16, na primeira decisão | 3 clubes |
| Transferência | Clube | Janela normal | Ficar + 2 clubes (ou só clubes, se não houver onde ficar) |
| Oferta de empréstimo | Clube | Jogador jovem e sem espaço | Até 3 clubes |
| Pós-empréstimo: retido | Clube | O clube contratante quer o jogador de volta | Ficar + alternativas |
| Pós-empréstimo: não retido | Clube | O clube contratante não quer mais | Só alternativas |
| Pós-empréstimo: passou da idade | Clube | Jogador passou do limite de empréstimo | Alternativas |
| Não renovação de contrato | Clube | Mau uso prolongado | 3 clubes, ou 2 clubes + aposentar se tiver 32 ou mais |
| Aposentadoria sem ofertas | Clube | Idade ≥26 e OVR <50 | Somente aposentar |
| Evento de carreira | Evento | Agendado e elegível | 2 ou 3 escolhas narrativas |
| Foco de treino | Treino | 45% de chance, entre 17 e 31 anos, com 3 períodos de intervalo | 5 focos (linha) ou 4 (goleiro) |

### 15.1 Painel de oferta de clube

Cada opção é um cartão com:

- Prefixo de ação em caixa alta pequena ("Assinar com", "Ficar em", "Ir por
  empréstimo para", "Transferir-se para").
- Escudo do clube, 48 pixels.
- Nome do clube.
- **Pílula de briefing**, se houver (ver seção 19). Nunca aparece para o
  briefing genérico de "reforço de elenco".
- Linha inferior com bandeira do país, escudo da liga (10 pixels) e nome da liga.

A pílula de briefing é tingida pela **paciência** do clube, não pelo tipo:

| Pressão | Condição | Cor |
|---|---|---|
| Alta | paciência ≥ 1,3 | Vermelha |
| Baixa | paciência ≤ 0,85 | Verde |
| Média | resto | Neutra |

Requisito: a liga mostrada é a divisão em que o clube está **agora**, honrando
promoções e rebaixamentos, e não a listada estaticamente no conjunto de dados.

A opção "aposentar", quando presente, é um cartão diferente: emoji de claquete,
rótulo e descrição, borda que fica vermelha ao passar o mouse.

### 15.2 Painel de foco de treino

Grade de até três colunas em tela larga. Cada foco mostra ícone, nome,
descrição e chips verdes com as siglas dos atributos que sobem.

### 15.3 Painel de evento de carreira

- Sobrelinha "Decisão" em verde.
- Título e descrição do evento (ou da variante ativa, se houver).
- Duas ou três opções. Uma opção que seja mudança de clube é sempre desenhada
  como cartão de clube, mesmo dentro de um evento.
- Cada opção narrativa mostra:
  - Rótulo (com escudo de clube ou bandeira de país quando aplicável).
  - Linha de resultado neutro, se houver.
  - Linha positiva prefixada por **▲** verde, com a probabilidade em negrito.
  - Linha negativa prefixada por **▼** vermelho, com a probabilidade.
  - Linha neutra em cinza, com a probabilidade.
  - **Chips de efeito**: "+2 OVR", "-14 Torcida", "Desempenho +18%", "▲" ou "▼"
    para melhora ou piora de papel, e uma palavra para "mais pressão".
  - Se não houver nenhum texto de resultado e nenhum efeito previsto, imprime
    "Sem efeito" em itálico: essa é a escolha segura deliberada, e o cartão não
    pode parecer inacabado.

Requisito de acessibilidade: o glifo ▲/▼ carrega sozinho a leitura de bom ou
ruim. Sem ele, as duas linhas seriam separadas apenas por cor, que é exatamente
o par verde/vermelho que um daltônico não distingue.

---

## 16. Ofertas de clube

### 16.1 Reputação de oferta do jogador

A faixa de clubes que aparece é decidida pelo OVR:

| OVR | Reputação de oferta |
|---|---|
| ≥ 87 | 5 |
| ≥ 83 | 4 |
| ≥ 78 | 3 |
| ≥ 73 | 2 |
| ≥ 65 | 1 |
| abaixo | 0 |

No difícil, **subtrai-se 1** dessa faixa.

Sobre esse número aplica-se um **jitter**: com alguma probabilidade a oferta
vem de uma faixa acima ou abaixo, para que o mercado não seja uma escada
perfeita.

### 16.2 Afinidade geográfica

De onde as ofertas vêm depende do nível do jogador:

| OVR | Distribuição |
|---|---|
| ≥ 83 | 100% aleatório global: um craque interessa a qualquer um |
| ≥ 78 | 25% mesmo país, 25% mesma confederação, 50% global |
| ≥ 73 | 50% mesmo país, 50% mesma confederação |
| ≥ 50 | 50% mesmo país, 50% mesma confederação |
| < 50 | Sem afinidade: sorteio uniforme entre todos os clubes da faixa |

### 16.3 Tipos de oferta

| Tipo | Quantidade | Regras especiais |
|---|---|---|
| Academia | 3 clubes | Não conta como recusa: todo garoto tem que escolher um |
| Transferência | 2 clubes + "ficar" | Nunca oferece clubes bloqueados |
| Empréstimo | até 3 clubes | 90% mesmo país, 10% mesma confederação |
| Não renovação | 3 clubes, ou 2 + aposentar se ≥32 anos | Nunca oferece o clube que dispensou |

### 16.4 Elegibilidade de empréstimo

- Idade mínima: **18**.
- Idade máxima: **24**.
- Apenas um empréstimo por carreira (um empréstimo já feito ou ativo bloqueia
  novos).
- Peso do empréstimo contra transferência, por status no elenco:

| Status | Peso do empréstimo |
|---|---|
| Baixa rotação | 30 |
| Reserva ou terceiro goleiro | 70 |
| Outros | 0 (não é elegível) |

### 16.5 Clubes bloqueados

Um clube nunca mais oferece nada ao jogador quando:

- O jogador saiu dele para assinar **diretamente com um rival histórico**
  reconhecido, em transferência **permanente** (ser emprestado a um rival é
  decisão do clube dono, não deserção, e voltar ao clube dono depois também
  não); ou
- A torcida do clube expulsou o jogador (variante "torcida" do evento de
  bate-boca no vestiário).

Esses clubes ficam marcados como "traídos" e aparecem com a tarja **Traidor** na
tabela e na linha do tempo, na temporada em que a saída aconteceu (uma única
vez por saída, e não repetida em todas as temporadas daquele clube).

---

## 17. O briefing do clube

Todo clube que contrata o jogador tem um motivo. O briefing define três coisas:
a torcida inicial, quanto a torcida aguenta, e quanto ela cobra por temporada.

| Briefing | Torcida inicial | Paciência | Exigência |
|---|---|---|---|
| Substituir o ídolo | 46 | 1,45 | 9 |
| Contratação-estrela | 66 | 1,35 | 9 |
| Missão salvação | 58 | 1,25 | 5 |
| Reconstrução | 60 | 0,85 | 2 |
| Projeto de futuro | 52 | 0,70 | 0 |
| Aprendiz | 48 | 0,75 | 1 |
| Provar seu valor | 45 | 1,20 | 5 |
| Volta pra casa | 70 | 0,80 | 2 |
| Reforço de elenco | 50 | 1,00 | 4 |

Interpretação:

- **Torcida inicial**: onde o medidor começa ao assinar.
- **Paciência**: multiplica as quedas de torcida. Acima de 1 a torcida vira mais
  rápido; abaixo de 1 ela perdoa.
- **Exigência**: subtraída do ganho de torcida a cada temporada. Uma arquibancada
  que espera o substituto do camisa 9 precisa de uma temporada real só para
  ficar empatada.

O briefing é escolhido por sorteio ponderado, filtrado pelo que faz sentido para
aquela contratação (tamanho do clube, idade e nível do jogador, se ele já jogou
ali antes). O briefing fica **guardado na carreira**, porque a torcida continua
medindo contra ele temporada após temporada, e não só na chegada.

Certos eventos de carreira aumentam permanentemente a paciência exigida do
briefing (limitada a 2): aceitar a camisa 10, aceitar um jogo em sua homenagem,
etc. Uma recompensa sem custo não é decisão: o jogador a aceitaria sempre.

---

## 18. Eventos de carreira

### 18.1 Agendamento

- No início da carreira, um **plano de eventos** é montado: sorteia-se quantos
  eventos pessoais a carreira terá (6 a 7 no modo longo, 3 a 4 no normal) e em
  quais idades eles caem.
- As idades possíveis começam em 16 mais o primeiro múltiplo do tamanho do
  período que alcance 6 anos de carreira, e vão até 37.
- As idades escolhidas são **espaçadas** de propósito, para que os eventos não
  se amontoem.
- Um evento só dispara se estiver **elegível** no momento (ver 18.3).
- Eventos de lesão contam separadamente e nunca passam de **dois** por carreira.

### 18.2 Catálogo completo (40 eventos)

| Evento | Peso | Natureza |
|---|---|---|
| Treino extra | 100 | Sempre disponível; variante única |
| Treinador pessoal | 100 | Variante única |
| Substância misteriosa | 20 | Risco alto: suspensão possível |
| Carga da temporada | 100 | Ritmo vs. desgaste |
| Mudança de posição | 100 | Muda a posição do jogador |
| Concorrência de posição | 100 | Disputa por vaga |
| Braçadeira de capitão | 80 | Torcida e pressão |
| Prioridade do clube | 100 | Dobra as odds de uma competição e corta as da outra |
| Oferta do rival | 80 | Assinar com um clube rival do mesmo país |
| Crise no clube | 45 | |
| Número icônico | 45 | Troca de camisa com custo de pressão |
| Voltar pra casa | 45 | |
| Tatuagem gigante | 35 | Pode infeccionar e tirar o jogador da primeira temporada |
| Problema com o fisco | 25 | |
| Avô estrangeiro | 25 | Trocar de seleção |
| Terminar o ensino médio | 35 | |
| Atrito no vestiário | 45 | |
| Retorno triunfal | 50 | Garante status de titular |
| Conflito clube vs. seleção | 20 | Pode custar um torneio |
| Lesão no auge | 20 | Força ganhar ou perder um título específico |
| Lesão | 100 | Lesão comum, com perda de OVR |
| Pênalti decisivo | 20 | Força ganhar ou perder um título específico |
| Novo treinador | 55 | |
| Holofote do clássico | 60 | |
| Jogo de homenagem | 40 | |
| Ultimato do empresário | 50 | |
| Contratação de joia | 45 | |
| Contrato de chuteira | 35 | |
| Entrevista em podcast | 50 | |
| Troca de empresário | 40 | |
| Estádio lotado | 55 | |
| Cartão vermelho polêmico | 45 | |
| Torcida se vira contra | 45 | |
| Bate-boca no vestiário | 14 | Três variantes: técnico 40, diretoria 35, torcida 25 |
| Imprensa do rival | 50 | Só se houver rival |
| Marca do rival | 45 | Só se houver rival |
| Duelo com o rival | 40 | Só se houver rival |
| Troca de camisa (upgrade) | 18 | Oferece 3 números de prestígio |
| Homenagem à camisa de lenda | 12 | Oferece 5 números lendários; uma vez por carreira |
| Lesão grave | 26 | Reduz o **potencial** permanentemente |

Requisito: a variante "torcida" do bate-boca no vestiário é a única coisa no
jogo que marca o clube atual como traído por iniciativa do próprio clube. Dá
para brigar com um técnico e ser perdoado, com a arquibancada não.

### 18.3 Portões de elegibilidade

Cada evento tem o seu. Exemplos de regras que precisam existir:

- Eventos de rival só aparecem se um rival tiver sido atribuído.
- A homenagem à camisa de lenda só acontece uma vez, e só com standing alto.
- A troca de camisa exige que exista um número melhor livre.
- A oferta do rival exige clubes do mesmo país com reputação **igual ou maior**
  que a do clube atual, não bloqueados.
- A lesão grave tem uma janela de idade restrita.
- O conflito clube vs. seleção exige um torneio de seleção naquele ano.
- A lesão no auge e o pênalti decisivo exigem um título ao alcance.
- A mudança de posição exige que a nova posição faça sentido.
- Eventos de crise de torcida exigem a torcida na faixa correspondente.
- Um evento que geraria uma transferência exige que uma transferência fosse de
  fato produzir ofertas.

### 18.4 Modificadores que um evento pode aplicar

| Modificador | Efeito |
|---|---|
| Delta imediato de OVR | Aplicado uma vez, antes do período |
| Delta permanente de OVR | Idem, somado ao anterior |
| Delta adiado de OVR | Aplicado **depois** do período (recuperação) |
| Delta de potencial | Abaixa o teto para sempre. Piso absoluto: 55 |
| Delta de torcida | Oscilação única no medidor |
| Delta de paciência do briefing | Muda permanentemente o quanto a torcida cobra (teto 2) |
| Multiplicador de estatísticas | Escala gols, assistências e jogos sem sofrer |
| Deslocamento de papel | Sobe ou desce um degrau no elenco |
| Sobreposição de papel | Fixa o status no elenco |
| Suspensão | Apaga a temporada inteira: nada é jogado, nada é ganho |
| Multiplicadores de título | Por competição: liga, copa, continental primária, secundária, mundial |
| Torneio de seleção | Força ou pula um torneio específico |
| Sobreposição de título de clube | Força ou impede um título específico |
| Sobreposição de título de seleção | Idem, para seleção |
| Traição do clube atual | Marca o clube como bloqueado para sempre |

### 18.5 Odds de risco

Toda escolha arriscada tem a sua probabilidade multiplicada pelo
**multiplicador de risco do traço** do jogador (ver 12.4). Isso é o que faz o
mesmo evento se comportar de forma diferente entre um Determinado e um Frágil.

### 18.6 Revelação do resultado

Após escolher, um aviso discreto aparece no canto superior direito por **5,2
segundos**, com saída de 260 ms. Ele diz se a aposta deu certo e mostra os
números exatos.

| Resultado | Glifo | Cor | Sobrelinha |
|---|---|---|---|
| Positivo | ▲ | Verde | "Deu certo" |
| Negativo | ▼ | Vermelho | "Não deu certo" |
| Neutro | ● | Cinza | Neutra |

Regra especial: uma escolha **sem aposta** costuma ser uma troca (a diretoria
dobra as odds de uma competição e corta as da outra), e as duas metades são a
resposta para "o que aconteceu". Uma versão apostada imprime um ramo ou o
outro; uma decidida imprime os dois.

O aviso é clicável, e clicar apenas apressa a saída. Ele nunca bloqueia nada.

---

## 19. Foco de treino

### 19.1 Focos de linha

| Foco | Atributos que sobem |
|---|---|
| Explosividade | Ritmo e Físico |
| Técnica | Condução e Passe |
| Força | Físico e Defesa |
| Finalização | Finalização e Condução |
| Visão de jogo | Passe e Visão tática |

### 19.2 Focos de goleiro

| Foco | Atributos que sobem |
|---|---|
| Defesa de bola | Reflexos e Elasticidade |
| Saída de bola | Chute e Manejo |
| Comando de área | Posicionamento e Manejo |
| Explosividade | Velocidade e Elasticidade |

Cada foco tem ícone, nome e descrição nos três idiomas, e uma repartição de
peso entre os atributos que ele move.

### 19.3 Efeito

- O foco adiciona um empurrão direto ao crescimento dos atributos escolhidos,
  multiplicado por 4,5 antes de entrar na fórmula.
- Ao fim do período, a **garantia** entra em ação: os atributos focados terminam
  pelo menos um ponto acima de onde começaram (ver 13.14).

Razão da garantia: o empurrão é real mas não confiavelmente **visível**. O
declínio de um veterano pode comê-lo, uma forma ruim pode deixá-lo em meio
ponto, e a redistribuição de bônus de título pode empurrá-lo de volta para
baixo. Escolher um foco e ver o número parado se lê como a escolha ter sido
ignorada.

---

## 20. Simulação de uma temporada

### 20.1 Status no elenco

Calculado da diferença entre o OVR do jogador e o nível base do clube.

**Jogadores de linha**

| Diferença | Status |
|---|---|
| ≥ 0 | Titular |
| ≥ -4 | Alta rotação |
| ≥ -8 | Baixa rotação |
| abaixo | Reserva |

**Goleiros**

| Diferença | Status |
|---|---|
| ≥ -3 | Titular |
| ≥ -8 | Reserva |
| abaixo | Terceiro goleiro |

O goleiro tem uma escada mais generosa porque um goleiro é escolhido tanto por
confiança quanto por nota, e um técnico que se decidiu por um o escala toda
semana. Exigir que ele estivesse no nível do clube inteiro fazia goleiros de
clubes grandes passarem temporadas inteiras de fora, e nenhuma carreira de
goleiro chegava perto dos recordes de jogos e de jogos sem sofrer gol que os
goleiros desses clubes de fato detêm.

### 20.2 Chance de furar a fila

Um jogador no banco (reserva, terceiro goleiro ou baixa rotação) tem uma chance
de **subir um degrau** nesta temporada:

```
chance = limitar(0,08 - |min(0, diferença)| × 0,003, 0,015, 0,08)
```

Nunca chega a zero, nem em um clube gigantesco. Não se aplica quando o status
foi forçado por um evento.

### 20.3 Jogos

| Status | Faixa de jogos (linha) | Faixa de jogos (goleiro) |
|---|---|---|
| Titular | 44 a 61 | 45 a 59 |
| Alta rotação | 27 a 42 | - |
| Baixa rotação | 16 a 26 | - |
| Reserva | 5 a 15 | 2 a 14 |
| Terceiro goleiro | - | 0 a 4 |

Sobre esse sorteio aplicam-se:

- **Multiplicador de calendário do clube**: reputação doméstica 0 → 0,70;
  reputação 1 → 0,80; reputação continental 0 → 0,90; reputação continental 4
  ou mais → 1,04; caso contrário 1,00. Um time que vai longe na Europa e joga
  o Mundial simplesmente joga mais futebol.
- **Ajuste de condicionamento**: `0,88 + 0,22 × (Físico / 99)`.

Uma temporada **suspensa** tem zero jogos.

### 20.4 Contusões leves

Rolagem por temporada, só se o jogador tiver ao menos **8** jogos.

```
probabilidade = limitar(0,20 × (1,3 - 0,7 × Físico/99) + max(0, idade - 29) × 0,022, 0,04, 0,50)
```

| Tipo | Peso | Jogos perdidos |
|---|---|---|
| Sobrecarga muscular | 30 | 2 a 5 |
| Pancada no tornozelo | 24 | 2 a 4 |
| Contusão no joelho | 16 | 2 a 4 |
| Contratura lombar | 12 | 3 a 6 |
| Desconforto no adutor | 10 | 4 a 8 |
| Virose | 8 | 1 a 3 |

Os jogos perdidos nunca passam de **40% dos jogos da temporada**. Uma temporada
inteira apagada é o que a lesão grave faz, não esta.

Requisito: a contusão é descontada **antes** de qualquer produção ser derivada,
para que gols e jogos sem sofrer gol escalem com os jogos realmente disputados.

Requisito de interface: contusões leves são **deliberadamente invisíveis** em
jogo. Elas aparecem apenas como uma temporada com menos jogos do que deveria,
que é exatamente como uma lesão pequena se lê de fora. Uma tarja "3 jogos fora"
em metade das linhas era ruído sobre algo que o jogador não decide nem pode
mudar. A tarja existe apenas no jornal, ao fim da carreira.

### 20.5 Produção de jogadores de linha

```
faixa = balde(diferença de OVR)
escala = força_do_time × jitter(0,9-1,1) × multiplicador_de_evento × produção_por_OVR
taxa_de_gols_bruta        = taxa_do_papel[faixa] × escala × impulso_de_finalização
taxa_de_assistências_bruta = taxa_do_papel[faixa] × escala × impulso_de_passe
```

**Baldes de diferença**

| Diferença | Índice |
|---|---|
| ≥ 10 | 0 |
| ≥ 6 | 1 |
| ≥ 3 | 2 |
| ≥ -2 | 3 |
| ≥ -5 | 4 |
| ≥ -9 | 5 |
| abaixo | 6 |

**Gols por jogo, por papel e balde**

| Papel | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Atacante | 1,10 | 0,85 | 0,65 | 0,50 | 0,30 | 0,15 | 0,05 |
| Criador | 0,85 | 0,60 | 0,45 | 0,30 | 0,20 | 0,10 | 0,05 |
| Apoio | 0,15 | 0,10 | 0,08 | 0,05 | 0,02 | 0 | 0 |
| Defensivo | 0,10 | 0,08 | 0,06 | 0,04 | 0,02 | 0 | 0 |
| Goleiro | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Assistências por jogo, por papel e balde**

| Papel | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|---|
| Atacante | 0,40 | 0,30 | 0,20 | 0,15 | 0,10 | 0,08 | 0,05 |
| Criador | 0,60 | 0,45 | 0,35 | 0,25 | 0,15 | 0,08 | 0,05 |
| Apoio | 0,35 | 0,25 | 0,18 | 0,12 | 0,07 | 0,03 | 0,02 |
| Defensivo | 0,10 | 0,07 | 0,05 | 0,03 | 0,01 | 0 | 0 |
| Goleiro | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Força do time por reputação doméstica**: 0,55 / 0,75 / 0,95 / 1,00 / 1,10 / 1,20.

**Multiplicador de produção por OVR**

| OVR | Multiplicador |
|---|---|
| ≤ 65 | 0,60 |
| 65 a 80 | 0,60 até 0,85 (linear) |
| 80 a 85 | 0,85 até 1,00 (linear) |
| 85 a 95 | 1,00 até 1,10 (linear) |
| ≥ 95 | 1,10 |

**Impulsos de atributo**

```
impulso_de_finalização = 0,55 + 0,85 × (Finalização/99)^1,3
impulso_de_passe       = 0,25 + 1,25 × (Passe/99)^1,8
```

O passe é a curva mais íngreme de propósito. Chances criadas eram a única coisa
que um bom OVR carregava sozinho: a diferença entre um passador 55 e um 95
costumava ser um quarto, quando deveria ser um fator de três. A finalização
mantém a curva mais suave porque a posição e o papel já decidem a maior parte de
quem recebe as chances.

### 20.6 Portões de raridade

A taxa bruta por jogo, quando muito alta, precisa **passar por portões** para
sobreviver inteira. Abaixo do primeiro limiar nada é rolado (uma temporada
normal não toca essa parte do gerador). Acima dele, cada limiar exige a sua
própria rolagem, verificada de cima para baixo; falhar em um assenta a
temporada naquela taxa em vez de zerar tudo.

**Gols**

| Acima de (por jogo) | Chance de manter |
|---|---|
| 0,75 | 22% |
| 1,05 | 8% |
| 1,46 | 1,2% |

**Assistências**

| Acima de (por jogo) | Chance de manter |
|---|---|
| 0,27 | 40% |
| 0,33 | 8% |
| 0,385 | 0,8% |
| 0,46 | 0,25% |

Requisito explícito: isto **não é um teto**. Uma temporada no ritmo de 107 gols
continua tendo uma chance real, pequena e nomeada de acontecer de verdade. Ela
apenas deixou de ser o resultado mais provável de "grande atacante, grande
clube, sorte razoável".

Requisito: o portão é aplicado à **taxa por jogo**, nunca ao total da
temporada, de forma que uma sequência longa sem lesão continue rendendo mais
gols.

### 20.7 Jogos sem sofrer gol

**Goleiros**

```
gols_sofridos = jogos × base_do_clube × multiplicador_do_goleiro × jitter(0,9-1,1)
taxa_de_jogo_sem_sofrer = limitar(e^(-λ(1 + 0,1λ)), 0,03, 0,65)   onde λ = gols_sofridos / jogos
```

**Base de gols sofridos por jogo, por reputação doméstica**: 1,45 / 1,35 / 1,15
/ 0,95 / 0,80 / 0,68.

**Multiplicador do goleiro por diferença de OVR**

| Diferença | Multiplicador |
|---|---|
| ≥ 10 | 0,72 |
| ≥ 6 | 0,84 |
| ≥ 3 | 0,93 |
| ≥ -2 | 1,00 |
| ≥ -5 | 1,10 |
| ≥ -9 | 1,20 |
| abaixo | 1,35 |

A curva exponencial existe porque gols chegam aproximadamente como um processo
de Poisson: a fração de jogos sem nenhum é `e^-λ`, não uma reta. O pequeno termo
quadrático é superdispersão: gols de verdade se agrupam, e times ruins caem
abaixo da linha pura de Poisson.

**Defensores** (CB, LB, RB, CDM) também registram jogos sem sofrer gol, com
**metade** do escudo de um goleiro:

```
escudo = 1 + (multiplicador_do_goleiro - 1) × 0,5
```

Eles são um de uma linha de quatro, não o último homem.

### 20.8 Suspensão

Uma temporada suspensa: zero jogos, zero produção, **nenhum título**, nenhuma
contusão registrada, nenhuma reputação de clube movida. Ela aparece com a tarja
vermelha "Suspenso" na tabela e no jornal.
---

## 21. Títulos de clube

### 21.1 Como um título é decidido

Monta-se a lista de competições que o clube disputa naquela temporada, cada uma
com a sua probabilidade. Depois rola-se uma por uma, em ordem, respeitando as
exclusões. **A Copa Intercontinental é resolvida por último**, porque para metade
do mundo ela depende de um título continental sorteado momentos antes no mesmo
laço.

### 21.2 Reputação efetiva

Um superastro levanta a reputação efetiva de um clube modesto em um degrau:

```
se OVR ≥ 90 e reputação < 3: reputação_efetiva = min(5, reputação + 1)
```

### 21.3 Impulso do astro

A diferença entre o OVR do jogador e o nível base do clube multiplica as odds:

| Diferença | Impulso |
|---|---|
| ≥ 10 | ×1,6 |
| ≥ 6 | ×1,3 |
| ≥ 3 | ×1,1 |
| resto | ×1,0 |

Nas supercopas e nas competições mundiais, o impulso é **amortecido pela
metade**: um jogo único dá muito menos espaço para um craque arrastar um time do
que uma liga de 38 rodadas.

### 21.4 Probabilidades

**Liga (primeira divisão), por reputação doméstica efetiva**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 0,4% | 1,5% | 5% | 25% | 45% | 70% |

Mesmo um clube de reputação 0 mantém uma chance minúscula mas real de ser
campeão nacional.

**Copa nacional, por reputação doméstica efetiva**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 1% | 4% | 10% | 25% | 35% | 40% |

Exceção: a copa da Colômbia é efetivamente o mata-mata da liga, então ela usa
**as mesmas odds da liga**, e vencê-la promove automaticamente.

**Copa da liga (só Inglaterra), por reputação doméstica**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 2% | 5% | 9% | 18% | 24% | 28% |

Mais baixa que a copa nacional no topo (clubes grandes rodam muito o elenco nas
primeiras rodadas) e mais alta embaixo (o chaveamento é mais gentil e times da
segunda divisão vão longe).

**Continental primária, por reputação continental efetiva**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 0,08% | 0,3% | 5% | 15% | 20% | 30% |

**Continental secundária**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 2% | 6% | 15% | 2% | 0% | 0% |

**Continental terciária (Conference League)**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 3% | 6% | 4,5% | 0,8% | 0% | 0% |

Ambas caem a zero no topo porque um gigante simplesmente não está nessas
competições.

**Segunda divisão**: a "liga" de um time da segunda divisão usa a tabela de
título de segunda divisão (ver 22.1) e nunca passa de 30%.

### 21.5 Exclusões obrigatórias

| Competição | Não pode ser ganha se... |
|---|---|
| Continental secundária | Ganhou a primária nesta temporada, ou ganhou liga / primária / secundária na temporada passada |
| Continental terciária | Ganhou primária ou secundária nesta temporada, ou ganhou liga / primária / secundária / terciária na temporada passada |
| Todas as continentais, intercontinental e mundial | O clube está na segunda divisão |
| Supercopa nacional | Não ganhou liga nem copa na temporada passada, ou a temporada passada foi na segunda divisão, ou foi em outro clube |
| Supercopa continental | Não ganhou continental primária nem secundária na temporada passada, ou foi em outro clube |

Requisito: apenas a continuidade **no mesmo clube** conta para supercopas. O jogo
acompanha resultados dos clubes por onde o jogador passou e de mais ninguém, de
forma que assinar com um campeão no meio do ano é indetectável, e inventar isso
significaria inventar um título que ninguém ganhou.

### 21.6 Supercopas

Decididas em jogo único, muito mais próximas de cara ou coroa que uma liga.
A linha aplicada depende de como o clube se classificou:

| Qualificação | Rep 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Dobradinha (liga + copa) | 60% | 62% | 64% | 66% | 68% | 70% |
| Um só dos dois | 44% | 46% | 48% | 50% | 52% | 54% |
| Campeão continental primário | 50% | 52% | 54% | 56% | 58% | 60% |
| Campeão continental secundário | 34% | 36% | 38% | 40% | 42% | 44% |

### 21.7 Amortecedor de bicampeonato continental

| Sequência atual | Multiplicador |
|---|---|
| 0 | ×1,00 |
| 1 (defendendo o título) | ×0,72 |
| 2 ou mais | ×0,30 |

Repetir acontece de verdade (Milan e Real Madrid conseguiram). Um **terceiro**
seguido aconteceu uma vez na história, e é por isso que o recorde é três.

### 21.8 Copa Intercontinental (anual)

Disputada na temporada **seguinte** à conquista do continente, entre os campeões
continentais. Existe uma exceção de calendário:

| Confederação | Quando joga |
|---|---|
| CONMEBOL, CONCACAF, OFC | **Mesma temporada** em que ganhou o continental |
| UEFA, AFC, CAF | Temporada **seguinte** |

Razão: a partida é em dezembro. América do Sul, América do Norte e Oceania jogam
por ano-calendário, então o campeão é coroado algumas semanas antes e disputa
logo; Europa, Ásia e África terminam em maio e voltam para ela no dezembro
seguinte, que é a temporada seguinte.

**Odds de vencer, por confederação**

| UEFA | CONMEBOL | CONCACAF | AFC | CAF | OFC |
|---|---|---|---|---|---|
| 58% | 12% | 3% | 3,5% | 2,5% | 1% |

Multiplicadas pelo impulso de astro amortecido.

### 21.9 Mundial de Clubes (a cada 4 anos)

- Acontece nos anos em que `(idade - 19)` é múltiplo de 4, a partir dos 19.
- Um clube está **classificado pelo ciclo** se ganhou a continental primária em
  qualquer uma das últimas **4** temporadas, com o jogador presente.
- Classificado pelo ciclo → usa as odds de campeão, com impulso amortecido.
- Não classificado → usa as odds de convite por ranking, com impulso normal.

**Odds de campeão (classificado), por confederação**

| UEFA | CONMEBOL | CONCACAF | AFC | CAF | OFC |
|---|---|---|---|---|---|
| 42% | 7,5% | 2% | 2% | 1,5% | 0,5% |

**Odds por convite, por confederação e reputação continental**

| Conf | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| UEFA | 0,03% | 0,1% | 0,5% | 5% | 10% | 15% |
| CONMEBOL | 0,01% | 0,03% | 0,08% | 0,2% | 0,6% | 2% |
| CAF | 0,003% | 0,008% | 0,02% | 0,06% | 0,15% | 0,4% |
| AFC | 0,003% | 0,008% | 0,02% | 0,06% | 0,15% | 0,4% |
| CONCACAF | 0,005% | 0,01% | 0,03% | 0,08% | 0,15% | 0,3% |
| OFC | 0,001% | 0,003% | 0,008% | 0,02% | 0,05% | 0,12% |

Os dois títulos mundiais são **independentes**: um clube que ganhou o continente
na temporada passada pode jogar os dois no mesmo ano e ganhar os dois.

---

## 22. Promoção e rebaixamento

Só existem em países que têm as duas divisões no conjunto de dados. Nos Estados
Unidos e no México **nada disso acontece**.

### 22.1 Subir da segunda divisão

Duas formas, avaliadas nesta ordem:

1. **Automática por título**: ganhar a liga da segunda divisão **ou a copa
   nacional** promove imediatamente. Uma campanha capaz de ganhar a copa
   nacional jogando a segunda divisão é rara e genuinamente matadora de
   gigantes, e um elenco capaz disso é claramente forte demais para a divisão.
2. **Vaga direta ou playoff**: se não subiu por título, rola-se a chance de
   acesso.

**Título da segunda divisão, por teto de OVR**

| OVR até | Chance |
|---|---|
| 64 | 3% |
| 69 | 4% |
| 74 | 6% |
| 79 | 9% |
| 84 | 13% |
| 87 | 18% |
| 89 | 25% |
| 99 | 30% |

**Acesso sem título, por teto de OVR**

| OVR até | Chance |
|---|---|
| 64 | 8% |
| 69 | 12% |
| 74 | 16% |
| 79 | 22% |
| 84 | 28% |
| 87 | 35% |
| 89 | 42% |
| 99 | 50% |

Essas chances são moduladas pelo **formato de acesso do país**:

| País | Vagas | Tem playoff |
|---|---|---|
| Inglaterra, Espanha, Itália, França, Alemanha | 3 | Sim |
| Argentina | 2 | Sim |
| Todos os demais | 2 | Sim |

### 22.2 Cair da primeira divisão

| Reputação doméstica | Chance de rebaixamento |
|---|---|
| 0 | 5% a 15%, conforme o OVR do jogador (quanto pior o jogador, maior) |
| 1 | 2% |
| 2 | 0,8% |
| 3 | 0,3% |
| 4 | 0,1% |
| 5 | 0,03% |

Regra especial: um clube de reputação 0 cuja **reputação efetiva** subiu para 1
ou mais graças a um jogador de OVR 90+ **não pode ser rebaixado** naquela
temporada.

Rebaixamento nunca acontece na mesma temporada de uma promoção.

### 22.3 Choque de rebaixamento de clube grande

Se o clube rebaixado tiver reputação doméstica **4 ou 5**, o elenco perde 10
pontos de OVR e a manchete usa uma variante mais dura ("a pior geração da
história do clube").

### 22.4 Persistência da divisão

A divisão em que cada clube está é registrada como uma correção sobre o conjunto
de dados. Ela vale para toda a carreira: a liga mostrada nos cartões de oferta,
na carta, na tabela e no jornal é sempre a divisão real naquele momento.

---

## 23. Reputação do clube ao longo da carreira

O clube em que o jogador está **cresce quando ganha e encolhe quando para de
ganhar**, e isso realimenta as odds futuras e o mercado de transferências.

### 23.1 Ganho por título

| Título | Doméstica | Continental | Internacional |
|---|---|---|---|
| Supercopa nacional | +0,06 | - | - |
| Copa da liga | +0,12 | - | - |
| Copa nacional | +0,18 | - | - |
| Liga | +0,40 | - | - |
| Continental terciária | +0,10 | +0,28 | - |
| Supercopa continental | +0,10 | +0,30 | - |
| Continental secundária | +0,12 | +0,40 | - |
| Continental primária | +0,20 | +0,70 | - |
| Copa Intercontinental | - | +0,10 | +0,28 |
| Mundial de Clubes | - | +0,20 | +0,60 |

### 23.2 Decaimento

Todo clube que **não** ganhou nada naquela temporada perde **0,07** de cada uma
das três reputações acumuladas, com piso em zero. Quando as três voltam ao
baseline, o clube deixa de ser rastreado.

### 23.3 Visibilidade

Quando o clube sobe ou desce uma **estrela inteira** (a parte inteira da
reputação doméstica) estando o jogador lá, a capa do jornal daquela temporada
imprime uma linha dizendo isso, com seta e pips de estrela. Só conta movimento
**no mesmo clube**: trocar de clube troca o escudo, e isso é transferência, não
crescimento.

---

## 24. Seleção nacional

### 24.1 Calendário de torneios

Montado no início da carreira, e reconstruído se o jogador trocar de
nacionalidade.

| Torneio | Primeira idade possível | Ciclo |
|---|---|---|
| Continental de seleções | 17 | 4 anos |
| Copa do Mundo | 18 | 4 anos |

A classificação para a Copa do Mundo é **sorteada no momento da montagem do
calendário**, por reputação continental do país:

| Reputação | Chance de classificar |
|---|---|
| 0 | 5% |
| 1 | 50% |
| 2 | 80% |
| 3 ou mais | 100% |

O continental de seleções nunca precisa de classificação.

### 24.2 Limiar de convocação

| Reputação internacional do país | OVR mínimo |
|---|---|
| 0 | 60 |
| 1 | 70 |
| 2 | 74 |
| 3 | 78 |
| 4 | 80 |
| 5 | 83 |

### 24.3 Impulso do astro na seleção

Um jogador move muito menos uma seleção do que um clube: não há entrosamento
diário, só um elenco que se junta por algumas semanas. A mesma vantagem precisa
ser **cerca do dobro** para valer o mesmo, e o teto é menor:

| Diferença para o nível do país | Impulso |
|---|---|
| ≥ 20 | ×1,6 |
| ≥ 12 | ×1,3 |
| ≥ 6 | ×1,1 |
| resto | ×1,0 |

### 24.4 Probabilidades de título

**Continental de seleções, por reputação continental do país**

| 0 | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| 0,001% | 2% | 5% | 10% | 20% | 30% | 80% |

**Copa do Mundo, por reputação FIFA do país**

| 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| 0,0001% | 0,5% | 5% | 8% | 12% | 18% |

### 24.5 Convocações

Requisito central: convocações acumulam **toda temporada** em que o jogador está
no nível do elenco, e não apenas nos anos em que cai um torneio. Amarrá-las a
torneios fazia um titular de seleção acumular cerca de vinte jogos numa carreira
inteira, quando internacionais reais jogam eliminatórias e amistosos, que é de
onde vem a maior parte de uma súmula.

```
no_elenco = convocado_para_torneio  OU  OVR ≥ limiar_de_convocação
jogos_por_temporada = max(1, arredondar(11 × fator_de_idade × min(1,15, jogos_no_clube / 40)))
```

**Fator de idade das convocações**

| Idade | ≤18 | 19-20 | 21-22 | 23-33 | 34-36 | 37-38 | 39+ |
|---|---|---|---|---|---|---|---|
| Fator | 0,35 | 0,65 | 0,85 | 1,00 | 0,80 | 0,55 | 0,35 |

Com essa rampa, o máximo absoluto que uma carreira de 24 temporadas consegue
acumular fica **logo abaixo do recorde real**, de forma que bater o recorde exija
uma carreira internacional que comece adolescente, nunca saia do time e vá até os
quarenta.

### 24.6 Produção pela seleção

Gols, assistências e jogos sem sofrer gol pela seleção são derivados da taxa por
jogo no clube, amortecidos em **0,78**, porque jogos internacionais são mais
truncados que a média das partidas de clube.

### 24.7 Primeira convocação

A idade da primeira vez em que o jogador entra no elenco é registrada
permanentemente e nunca muda. Ela gera:

- Uma manchete.
- Uma comemoração no canto da tela (categoria "convocação"), uma única vez.
- Uma entrada na linha do tempo do resumo.
- Um ângulo possível para a capa de jornal daquela temporada.

### 24.8 Standing na seleção

| Standing | Requisitos |
|---|---|
| Lenda | Jogos ≥ 40 + 10 × reputação **e** pontuação de títulos ≥ 0,5 + 0,9 × reputação |
| Ídolo | Jogos ≥ 20 + 6 × reputação **e** pontuação de títulos ≥ 0,2 + 0,5 × reputação |
| Nenhum | Caso contrário |

Títulos são obrigatórios: jogos sozinhos, por mais que sejam, são lealdade e não
glória.

---

## 25. Prêmios individuais

### 25.1 Porta de entrada

Nenhum prêmio é sequer rolado abaixo de **20 jogos** na temporada. Ninguém nunca
ganhou um desses em nove jogos.

### 25.2 Bola de Ouro (ou Luva de Ouro, para goleiros)

Probabilidade base por OVR e pelo que o clube ganhou naquela temporada:

| OVR | Liga + continental | Só continental | Só liga | Nenhum |
|---|---|---|---|---|
| ≥ 97 | 90% | 90% | 90% | 90% |
| ≥ 94 | 88% | 76% | 66% | 56% |
| ≥ 90 | 46% | 30% | 22% | 14% |
| ≥ 85 | 4% | 2% | 0,6% | 0% |
| < 85 | 0% | 0% | 0% | 0% |

Requisito: **nenhuma faixa é certeza.** O topo da curva já retornou 1, e um
jogador que chegasse a 97 era eleito o melhor do mundo em todas as temporadas
restantes da carreira. Isso produzia carreiras com oito e dez Bolas de Ouro, mais
do que qualquer pessoa já ganhou, numa carreira com um terço da duração das que
ganharam.

### 25.3 Amortecedor de campeão reinante

| Sequência de vitórias | Multiplicador |
|---|---|
| 0 | ×1,00 |
| 1 | ×0,72 |
| 2 | ×0,62 |
| 3 ou mais | ×0,54 |

Requisito: o último valor é um **piso**, aplicado a todas as temporadas
seguintes, e nunca zero. Uma versão anterior descia a 0,18 e ficava lá, o que
tornava quatro seguidas aritmeticamente impossível: em 900 carreiras a maior
sequência vista foi três, contra um recorde real de quatro.

### 25.4 Multiplicador de papel

| Papel | Multiplicador |
|---|---|
| Apoio (LB, CM, RB) | ×0,50 |
| Defensivo (CDM, CB) | ×0,25 |
| Demais | ×1,00 |

### 25.5 Chuteira de Ouro

**Somente para jogadores em clubes da UEFA.** Fora da Europa a probabilidade é
zero, o que mantém escolher a Europa como uma recompensa real.

| Gols na temporada | Chance |
|---|---|
| ≥ 50 | 96% |
| ≥ 42 | 78% |
| ≥ 34 | 48% |
| ≥ 28 | 22% |
| < 28 | 0% |

Também multiplicada pelo amortecedor de campeão reinante (sequência própria,
separada da Bola de Ouro).

Goleiros nunca disputam a Chuteira de Ouro.

### 25.6 Metas de raridade declaradas

Estas são as metas de balanceamento que o sistema precisa atingir:

| Alvo | Meta |
|---|---|
| Recorde de Bola de Ouro (8) batido | 6% a 10% das carreiras geracionais, ~0% abaixo dessa faixa |
| Quatro Bolas de Ouro seguidas | 5% a 8% das geracionais |
| Recorde de Chuteira de Ouro (6) batido | 12% a 15% das geracionais que jogam na Europa |
| Mediana de uma carreira geracional | 1 a 2 Bolas de Ouro |
| Teto de contagem | **Nunca existe** |

---

## 26. Torcida

### 26.1 Faixas

| Faixa | Valor | Cor |
|---|---|---|
| Desconhecido | < 20, e o pico da passagem também < 40 | Cinza |
| Hostil | < 20 | Vermelho |
| Fria | < 40 | Cinza |
| Morna | < 60 | Azul |
| Amada | < 80 | Verde |
| Adorada | ≥ 80 | Dourado |

A faixa "desconhecido" existe para separar uma arquibancada que **ainda não tem
opinião** de uma que se virou contra o jogador. É por isso que ela olha o pico da
passagem, e não só o valor atual.

### 26.2 Envolvimento esperado por idade

| Idade | ≤17 | 18-19 | 20-21 | 22+ |
|---|---|---|---|---|
| Esperado | 0,30 | 0,55 | 0,80 | 1,00 |

Ninguém vaia um garoto de 17 por jogar onze jogos: essa **é** a temporada que um
garoto de 17 deve ter.

### 26.3 Variação por temporada

```
se jogos == 0:  delta = -14 × esperado

senão:
  minutos   = limitar(jogos / (34 × esperado), 0, 1)
  produção  = goleiro ? limitar((jogos_sem_sofrer/jogos) / 0,4, 0, 1)
                      : limitar((gols + assistências)/jogos / 0,5, 0, 1)
  delta = -6 × esperado + minutos × 8 + produção × 12 + importância_dos_títulos × 6
          + bônus_de_traço
```

Requisito: o termo base é **negativo de propósito**. Simplesmente estar na folha
de pagamento gasta a paciência da arquibancada, e ela é recuperada com minutos,
produção e títulos. Sem isso a torcida era uma catraca de uma via só: um titular
ganhava +20 por temporada e toda carreira ficava cravada em 100 por volta do
terceiro ano, o medidor parava de dizer qualquer coisa e nenhum evento de
reação negativa da torcida voltava a ser alcançável.

### 26.4 Exigência e paciência do briefing

```
delta_esperado = delta - exigência_do_briefing

se delta_esperado < 0:
    delta_final = delta_esperado × multiplicador_de_dificuldade × paciência
senão:
    delta_final = delta_esperado × amortecimento_de_teto
```

### 26.5 Amortecimento de teto

```
amortecimento = limitar((100 - torcida_atual) / 55, 0,3, 1)
```

Adoração precisa ser defendida, não guardada no banco: quanto mais perto do
topo, menos cada boa temporada adiciona.

### 26.6 Torcida de chegada

Ao assinar com um clube:

| Situação | Torcida inicial |
|---|---|
| Primeiro clube da vida | **0** |
| Clube novo | Torcida inicial do briefing |
| Clube onde já jogou | Onde aquela arquibancada ficou, mais um bônus de boas-vindas |

**Bônus de boas-vindas ao voltar**: `min(8, melhora_de_OVR × 0,6)`. Voltar melhor
do que saiu vale um pouco.

O **pico** daquela arquibancada é preservado na memória, de forma que voltar a
uma recepção fria continue lendo como um lugar que se virou contra o jogador, e
não como um lugar que nunca ouviu falar dele.

### 26.7 Standing no clube

Três degraus, cada um com três requisitos, avaliados de cima para baixo.

| Degrau | Temporadas mínimas | Pontuação de títulos mínima | Participação mínima |
|---|---|---|---|
| Lenda | arredondar(4 + rep × 0,6) | 1 + rep × 1,1 | 0,55 |
| Ídolo | arredondar(2 + rep × 0,4) | 0,4 + rep × 0,55 | 0,40 |
| Regular | arredondar(1 + rep × 0,4) | 0 | 0 |
| Passageiro | (nenhum degrau alcançado) | | |

Onde `rep` é a média entre a reputação doméstica e a internacional do clube, e a
participação é a média de jogos por temporada dividida por 40.

Regra de mérito: os dois requisitos de tempo e de títulos **negociam entre si**,
em vez de serem portões rígidos.

```
mérito = 0,45 × (temporadas / mínimo) + 0,55 × (pontuação_de_títulos / mínimo)
```

O degrau é alcançado se `mérito ≥ 1`, **desde que** a razão de temporadas seja de
pelo menos **0,6** e a participação atinja o mínimo. Assim, um acervo
avassalador cobre uma passagem mais curta, e um servidor longo com pouca prata
ainda é lembrado, mas uma única temporada gloriosa nunca compra um legado.

O standing é julgado **por clube**, somando todas as passagens: duas estadas
separadas no mesmo clube constroem um único legado.

Requisito: as passagens mostram o total do **clube**, não o da passagem, ou um
retorno de lenda leria como "Lenda · 2 temporadas", que se contradiz.

---

## 27. O rival

### 27.1 Atribuição

- Um rival só pode ser atribuído quando o OVR alcança **80**.
- A rolagem acontece **exatamente uma vez**: na primeira temporada em que a
  barra é cruzada.
- Chance de atribuição: **60%**. Uma rolagem fracassada é permanente, de modo
  que uma carreira que perdeu a chance nunca volta a tentar mais tarde.

### 27.2 O rival

- Nome tirado de um repertório de cerca de 75 paródias claramente fictícias de
  grandes jogadores, **nunca o nome real**, agrupadas em quatro grupos por
  posição (atacante, meio-campista, defensor, goleiro). Cada nome tem no máximo
  14 caracteres, porque precisa caber numa linha de cartão e de linha do tempo.
- Nacionalidade: **25% de chance** de ser compatriota (disputando a mesma
  camisa), 75% de ser estrangeiro.
- Potencial próprio, sorteado entre **84 e 97**.

### 27.3 Carreira do rival

```
distância = |idade - 28|
queda     = idade < 28 ? distância × 2,4 : distância × 1,9
OVR       = limitar(potencial - queda, 45, 99)
```

O pico é sempre aos 28.

### 27.4 Exibição em jogo

O rastreador de rival é uma linha do painel lateral que só existe se um rival
tiver sido atribuído. Ele mostra:

- A palavra de estado ("à frente", "empatado", "atrás"), que carrega o
  significado sozinha, e a cor apenas reforça.
- O nome do rival.
- O placar `meu OVR × OVR dele`.
- Uma seta de **tendência**, comparando a diferença atual com a da temporada
  passada: ▲ verde se a diferença está fechando a favor do jogador, ▼ vermelho
  se está abrindo contra.

Em janela curta, a linha colapsa para só o placar, e o nome e o estado vão para
a dica de ferramenta.

No resumo, o rival é medido **no próprio pico** (idade 28), assim como o jogador.

---

## 28. Número da camisa

### 28.1 Primeiro número

Atribuído automaticamente ao assinar o primeiro contrato profissional. O jogador
**nunca escolhe** esse.

- **18% de chance** de ser um dos números de prestígio da posição.
- Caso contrário, um número genérico entre **12 e 99**.

**Números de prestígio por posição**

| Posição | Números |
|---|---|
| GK | 1, 12, 13 |
| ST, LW, RW | 7, 9, 10, 11 |
| CAM, CM, CDM | 5, 6, 8, 10 |
| LB, RB | 2, 3, 6 |
| CB | 3, 4, 5 |
| LM, RM | 7, 8, 10, 11 |

### 28.2 Promoção de camisa

O evento de troca de camisa oferece **3** dos números de prestígio da posição,
nunca o atual.

### 28.3 Homenagem de lenda

Um jogador com standing alto pode ser convidado a escolher o próprio número, a
partir dos números de titular tradicionais **da sua posição**, e não da lista
inteira. São oferecidos até **5**. Acontece **uma vez por carreira**.

| Posição | Números de titular |
|---|---|
| GK | 1 |
| RB | 2, 4 |
| LB | 3, 6 |
| CB | 3, 4, 5, 6 |
| CDM | 4, 5, 6, 8 |
| CM | 6, 8, 10 |
| CAM | 8, 10, 11 |
| LM, RM | 7, 11 |
| LW, RW | 7, 10, 11 |
| ST | 9, 10, 11 |

Um goleiro tem exatamente um número aqui, e esse é justamente o sentido da
homenagem. A diretoria abrir a lista inteira permitia oferecer o 4 a um
centroavante, o que não é homenagem, é erro de arquivo.

### 28.4 Custo

Aceitar um número icônico ou de prestígio **aumenta permanentemente a paciência
exigida do briefing**: a arquibancada passa a cobrar mais. É o que impede essas
opções de serem de graça.

### 28.5 O número na carta

O número é impresso na camisa do retrato, logo abaixo da gola, em branco com
contorno preto duro, para ler sobre qualquer cor de kit. O tamanho da fonte e a
espessura do contorno escalam com o tamanho da carta.

O número gravado no instantâneo de cada temporada é o **daquela temporada**, e a
carta do resumo mostra o número da temporada de pico, e não o atual.

---

## 29. Manchetes

### 29.1 Regras gerais

- No máximo **200** manchetes são guardadas; as mais antigas são descartadas.
- Cada manchete tem idade, chave, variáveis de interpolação e tom (bom, ruim,
  neutro).
- A lesão é guardada como chave crua e só é traduzida na hora de exibir.

### 29.2 Catálogo

| Chave | Tom | Quando |
|---|---|---|
| Título (por competição) | Bom | Cada título ganho |
| Prêmio (por prêmio) | Bom | Cada prêmio ganho |
| Primeira convocação | Bom | Primeira vez no elenco da seleção |
| Rebaixado | Ruim | Queda de divisão |
| Rebaixado (clube grande) | Ruim | Queda de clube com reputação 4 ou 5 |
| Promovido | Bom | Acesso |
| Temporada de explosão | Bom | Salto de OVR ≥ 6 **e** pelo menos 15 jogos |
| Assinou com clube | Neutro | Toda mudança permanente de clube |
| Emprestado | Neutro | Toda ida por empréstimo |
| Camisa atribuída | Neutro | Primeiro número da vida |
| Camisa promovida | Bom | Toda troca de número posterior |
| Lesão grave | Ruim | Toda queda de potencial por lesão |

Requisito: a manchete de explosão exige **jogos**. Notas continuam subindo nas
reservas, e "você explodiu" impresso sobre sete jogos contradiz a tabela ao lado.

---

## 30. A capa do jornal da temporada

Um painel em forma de jornal, acima da próxima decisão, com a única notícia mais
importante da temporada que acabou.

### 30.1 Prioridade dos ângulos

Avaliados nesta ordem exata; **o primeiro que se aplicar vence**.

| # | Ângulo | Condição | Tom |
|---|---|---|---|
| 1 | Varredura | Ganhou liga **e** copa **e** (continental primária **ou** mundial) | Bom |
| 2 | Tríplice coroa | Exatamente 3 títulos | Bom |
| 3 | Fartura de títulos | Mais de 3 títulos | Bom |
| 4 | Coroa continental | Ganhou continental primária ou mundial | Bom |
| 5 | Melhor do mundo | Bola de Ouro | Bom |
| 6 | Artilheiro | Chuteira de Ouro | Bom |
| 7 | Muralha | Luva de Ouro | Bom |
| 8 | Título nacional | Ganhou a liga | Bom |
| 9 | Rebaixado | Rebaixamento | Ruim |
| 10 | Promovido | Acesso | Bom |
| 11 | Destruído pela lesão / Encostado | Zero jogos (o primeiro se houve contusão) | Ruim |
| 12 | Primeira convocação | Estreia na seleção | Bom |
| 13 | Campanha de copa | Copa nacional ou copa da liga | Bom |
| 14 | Supercopa | Qualquer supercopa, a intercontinental, ou qualquer outro título | Bom |
| 15 | Destruído pela lesão | Contusão de 5+ jogos **e** menos de 22 jogos | Ruim |
| 16 | Explosão | Salto de OVR ≥ 4 **e** pelo menos 15 jogos | Bom |
| 17 | Muralha | Goleiro ou defensor com 12+ jogos sem sofrer | Bom |
| 18 | Fartura de gols | 16+ gols (não goleiro) | Bom |
| 19 | Rei das assistências | 10+ assistências (não goleiro) | Bom |
| 20 | Encostado | Menos de 12 jogos | Ruim |
| 21 | Última dança | Idade ≥ 38 | Neutro |
| 22 | Apagando | Queda de OVR ≥ 3 **e** pelo menos 15 jogos | Ruim |
| 23 | Nova chegada | Mudou de clube | Neutro |
| 24 | Constante | Nada do acima | Neutro |

Requisitos explícitos desta tabela:

- A varredura tem que ser **verdadeira** para ser impressa. Uma regra antiga
  aceitava três títulos de qualquer tipo, e uma liga mais duas supercopas, com a
  copa nacional perdida, saía sob "nada ficou para trás".
- Honras individuais ficam **acima** do título nacional de propósito: este é o
  jornal de um jogador, e uma Bola de Ouro é a matéria maior mesmo numa
  temporada em que o time também ganhou tudo.
- As supercopas **não são campanha de mata-mata**: são um jogo único antes da
  temporada começar, e uma manchete sobre sobreviver a todas as rodadas para
  levantá-la seria simplesmente falsa.

### 30.2 Variações

- **6** redações por ângulo.
- **4** linhas de apoio (o parágrafo sob a manchete) por ângulo, sorteadas
  separadamente para que uma manchete repetida não arraste o mesmo parágrafo
  junto.
- **8** nomes de jornal. O nome é sorteado uma vez **para o save inteiro**, de
  forma que a publicação seja sempre a mesma enquanto a escrita muda.
- Se a temporada seguinte cair no mesmo ângulo com a mesma redação da anterior,
  a redação é avançada para a próxima. Duas manchetes idênticas em anos
  consecutivos se leem como um bug mesmo quando as temporadas de fato foram
  idênticas.

### 30.3 Aparência

- Nome do jornal em caixa alta com espaçamento largo.
- Régua horizontal na cor do tom.
- Glifo de tom (▲ / ▼ / •) antes da manchete, em tamanho pequeno alinhado ao
  meio.
- Manchete em caixa alta, negrito máximo, quebra de palavra permitida (um nome
  de clube com uma palavra muito longa se recusa a quebrar e seria cortado).
- Linha estatística embaixo, em três formatos:
  - Goleiro: jogos + jogos sem sofrer gol.
  - Defensor: jogos + gols + assistências + jogos sem sofrer gol.
  - Demais: jogos + gols + assistências.
- Se o clube subiu ou desceu uma estrela, uma linha extra com seta, frase e pips
  de estrela (`★★★☆☆ → ★★★★☆`).

### 30.4 Confederação usada

A capa usa a confederação **do clube em que a temporada foi jogada**, não a do
passaporte do jogador. Um brasileiro que ganha a Champions League pelo Real
Madrid conquistou a Europa.
---

## 31. Fim de carreira

### 31.1 Não existe vitória nem derrota

CRAQUE não tem condição de vitória. O jogo termina sempre, e o que muda é a
história que ficou. A única modalidade com pontuação e ranking é o Desafio do
Dia.

### 31.2 As cinco formas de acabar

| Motivo | Gatilho | Controle do jogador |
|---|---|---|
| Idade | Chegou aos 40 | Nenhum: é compulsório |
| Má forma | Idade ≥ 26 **e** OVR < 50 | Nenhum: a única opção na tela é aposentar |
| Sem ofertas (mercado) | Nenhuma oferta pôde ser gerada | Nenhum |
| Sem ofertas (dispensa) | Escolheu aposentar numa não renovação | Sim |
| Voluntária | Escolheu aposentar em qualquer outro lugar, ou usou o botão de encerrar | Sim |

O motivo é registrado e usado pela biografia: a linha final de um jogador que se
aposentou porque quis é diferente da de um que ninguém mais quis.

### 31.3 Estado intermediário

Quando a carreira termina enquanto a tela de carreira está visível, ela não
salta direto para o resumo. Aparece um painel centralizado dizendo que a
carreira acabou, com um botão dourado "Ver resumo". Isso dá ao jogador um
momento antes do documento final.

Exceção: o botão de **encerrar carreira** da barra superior pula esse
intersticial e vai direto ao resumo, porque o jogador acabou de escolher parar.

### 31.4 O que sobrevive

- A carreira inteira permanece no save (temporadas, manchetes, títulos,
  prêmios, briefing, memória de torcida, clubes bloqueados, ofertas recusadas).
- Um recarregamento na tela de resumo volta para a tela de resumo.
- "Jogar novamente" descarta a carreira e volta à identidade.

---

## 32. Tela de Resumo

### 32.1 Estrutura

Uma coluna fixa à esquerda (em desktop) e um documento rolável à direita. Em
telas estreitas, tudo vira uma única coluna rolável.

**Coluna esquerda (a identidade do save):**

1. Sobrelinha dourada "Resumo da carreira".
2. Sobrenome em display grande.
3. Bandeira + país + posição.
4. **A carta do auge** (tamanho médio, com animação de revelação).
5. Legenda "Melhor carta da carreira".
6. Botões de baixar e compartilhar.
7. Botão "Jogar novamente" (só em desktop; no celular ele vai para o fim do
   documento).

**Coluna direita (o documento), na ordem:**

1. Resultado do desafio (só em carreiras de desafio).
2. **Biografia** e recordes batidos.
3. Totais da carreira.
4. Atributos no auge (barras).
5. Linha do tempo.
6. Vitrine de troféus.
7. Arquivo de jornais.

### 32.2 A carta do auge

A carta mostrada é o jogador no **pico absoluto**, não na aposentadoria:

- OVR recalculado a partir dos atributos da melhor temporada.
- Atributos daquela temporada.
- Número da camisa **daquela temporada**.
- Clube **daquela temporada**.

### 32.3 Totais

| Métrica | Quando aparece |
|---|---|
| Temporadas | Sempre |
| Jogos | Sempre |
| Jogos sem sofrer gol | Goleiro, ou defensor |
| Gols sofridos | Só goleiro |
| Gols | Não goleiro |
| Assistências | Não goleiro |
| Valor de mercado (o **pico**, não o final) | Sempre |
| Títulos (destacado em dourado) | Sempre |
| Prêmios (destacado) | Sempre |
| OVR de pico (destacado) | Sempre |

Se houver rival, um bloco extra mostra o nome do rival e `meu pico × pico dele`,
verde se o jogador ganhou a comparação, vermelho se perdeu.

### 32.4 Barras de atributo

Seis linhas: sigla, barra com gradiente verde, valor numérico. A largura da
barra é o próprio valor em porcentagem.

---

## 33. A biografia

A carreira contada em prosa. Cada frase é escolhida da biblioteca **somente se
esta carreira a mereceu**, e depois ordenada cronologicamente, de forma que o
texto leia como a análise **deste** jogador, e não como um formulário
preenchido.

### 33.1 Capítulos e limites

| Capítulo | Máximo de linhas |
|---|---|
| Origens | 3 |
| Ascensão | 4 |
| Auge | 6 |
| Crepúsculo | 3 |
| Legado | 4 |

O limite é intencionalmente apertado: uma biografia que diz tudo não diz nada, e
é o limite que força duas carreiras parecidas a trazer **detalhes diferentes**.

### 33.2 Tópicos

Existem **87 tópicos**, cada um com:

- Um capítulo.
- Uma **prioridade**, que pode ser um número fixo ou uma função da carreira
  (três supercopas é rodapé, nove é a matéria, e um número fixo não consegue
  expressar isso).
- Um **grupo** opcional: tópicos do mesmo grupo dizem a mesma coisa com outras
  palavras, e só o de maior prioridade é impresso no artigo inteiro.
- Uma **condição** (predicado sobre os fatos da carreira).
- Uma **idade** opcional, quando a linha se refere a um momento datado.
- **Quatro redações** por idioma (português, espanhol, inglês).

### 33.3 Seleção

1. Para cada capítulo, filtram-se os tópicos elegíveis.
2. Escolhe-se por prioridade; empates são desempatados por sorteio semeado, de
   forma que duas carreiras com o mesmo perfil de fatos ainda produzam artigos
   diferentes.
3. Assim que um tópico de um grupo é escolhido, todo o grupo sai de circulação
   para o artigo inteiro.
4. Dentro do capítulo, a ordem autoral é preservada, porque é ela que faz linhas
   consecutivas fluírem.

### 33.4 Reordenação cronológica

Uma linha que menciona uma idade específica é **refilada** no capítulo cuja
faixa etária de fato a contém. As faixas vêm da própria carreira, não de idades
fixas:

| Capítulo | Vai até |
|---|---|
| Origens | min(idade_inicial + 3, idade_de_pico - 1) |
| Ascensão | max(idade_de_pico - 2, idade_inicial + 4) |
| Auge | idade_de_pico + 3 |
| Crepúsculo | idade_de_aposentadoria - 1 |
| Legado | infinito |

Linhas sem data abrem o capítulo, na ordem em que foram escritas; linhas datadas
seguem em ordem de idade.

Exceção: linhas de **legado** nunca são movidas, mesmo carregando a idade final,
porque são declarações-resumo e pertencem ao fim.

Duas tentativas anteriores falharam e vale não repetir: ordenar globalmente
mantendo o capítulo autoral imprimia "chegou ao nível de elite aos 28" dentro do
parágrafo de decadência; ordenar só dentro do capítulo deixava um retorno aos 28
imprimir depois de uma passagem que foi dos 34 aos 39.

### 33.5 Evitando eco

O gerador guarda todos os trechos de três palavras já impressos no artigo, e
para cada tópico escolhe a redação que **menos repete** o que já foi dito.

- Marcadores de substituição colapsam para um token único, de forma que
  "{clubeGigante} bateu à porta" e "o futebol estrangeiro bater à porta" se
  alinhem na metade que importa.
- Um trecho só conta como eco se pelo menos **duas** das três palavras
  carregarem significado, o que impede que conectivos como "o tipo de" pareçam
  repetição.
- Nomes de clube e de país **nunca** chegam a essa análise: ela lê o molde e
  não a frase final, e nomear o mesmo clube duas vezes num perfil não é
  repetição.
- Empates são desfeitos ao acaso, de modo que um artigo sem nada a evitar
  continue variando exatamente como antes.

### 33.6 Fatos disponíveis

A biblioteca de frases só pode consultar um objeto de fatos achatado, nunca o
interior da simulação. Esse objeto inclui, entre outras coisas:

- Identidade: sobrenome, posição, se é goleiro, se é defensor, nacionalidade
  atual, nacionalidade de nascimento, se houve troca de seleção, traço, faixa de
  talento, número da camisa, idade e motivo de aposentadoria.
- Níveis: OVR inicial, de pico, idade do pico, final.
- Passagens por clube: cada uma com país, anos, temporadas, se foi empréstimo,
  standing, reputação, gols, assistências, jogos, títulos, OVR de chegada e de
  saída, e se saiu para um rival.
- Derivados de passagem: primeiro clube, último clube, maior clube, passagem
  mais longa, número de clubes, número de empréstimos, países em que jogou,
  idade do retorno para casa, se aposentou no primeiro clube, todos os
  retornos, o roteiro resumido (no máximo 6 clubes), a passagem-chave, o clube
  onde estourou, o primeiro salto para um gigante e a idade dele, se alguma vez
  saiu para um rival, clubes onde virou lenda, clubes onde virou ídolo.
- Produção: jogos, gols, assistências, jogos sem sofrer gol, melhor temporada.
- Títulos, separados por tipo: títulos da primeira divisão, títulos da segunda
  divisão (nunca confundidos), primeiro título de liga, primeiro título de
  segunda, continentais primária/secundária/terciária com nome real e idade,
  copas, copas da liga, supercopas, mundiais, intercontinentais, copas do mundo,
  continentais de seleção, a temporada mais decorada, quantas temporadas
  terminaram com pelo menos um título, se ficou sem nada.
- Prêmios: Bolas de Ouro, Chuteiras de Ouro.
- Seleção: jogos, gols, idade da primeira convocação, se nunca foi convocado, e
  uma faixa qualitativa (nenhuma, periférico, elenco, regular, pilar, ícone).
- Adversidade: idade da lesão grave, rebaixamentos, acessos, clube do último
  acesso, se o potencial ficou por realizar, temporadas no banco, temporadas
  suspensas.
- Torcida final e faixa.
- Rival: nome, OVR e se foi superado.
- Recordes batidos.
- Rótulos de arco: meteórico, tardio, andarilho, um clube só, saiu cedo do país,
  carreira modesta, temporadas de platô, queda do pico ao fim.
- **A estrada não tomada**: o maior clube que o jogador recusou, com a idade e
  para onde foi em vez disso. Só é guardada quando o clube recusado era de
  verdade grande **e** maior do que o escolhido; recusar um time de meio de
  tabela para assinar com um campeão europeu não é estrada não tomada, é apenas
  uma transferência.

---

## 34. Recordes reais

A biografia compara a carreira com marcas reais e documentadas do futebol. Cada
uma tem valor, detentor, data de verificação e detalhe, exibidos literalmente:
são fatos reportados, não personagens do jogo.

### 34.1 Recordes globais

| Recorde | Valor | Detentor |
|---|---|---|
| Gols em uma temporada | 73 | Lionel Messi |
| Gols na carreira | 950 | Cristiano Ronaldo |
| Assistências em uma temporada | 21 | Lionel Messi |
| Assistências na carreira | 400 | Lionel Messi |
| Partidas oficiais na carreira | 1391 | Fábio |
| Prêmios de artilheiro | 6 | Lionel Messi |
| Prêmios de melhor do mundo | 8 | Lionel Messi |
| Jogos sem sofrer gol | 508 | Fábio |
| Total de títulos | 46 | Lionel Messi |
| Copas do Mundo | 3 | Pelé |
| Jogos por seleção | 226 | Cristiano Ronaldo |
| Gols por seleção | 145 | Cristiano Ronaldo |

Restrições: gols, assistências e gols por seleção são **só para jogadores de
linha**; jogos sem sofrer gol é **só para goleiros**.

### 34.2 Recordes continentais (por confederação)

| Recorde | Confederação | Valor | Detentor |
|---|---|---|---|
| Continental primária | UEFA | 6 | Francisco Gento |
| Continental primária | CONMEBOL | 6 | Francisco Sá |
| Continental secundária | UEFA | 5 | José Antonio Reyes |
| Continental secundária | CONMEBOL | 3 | Claudio Morel Rodríguez |

Requisito: um recorde continental só é checado contra títulos ganhos em ligas
**daquela confederação**. Uma Libertadores nunca é medida contra uma marca de
Champions League, mesmo que o jogo arquive as duas sob a mesma chave.

### 34.3 Recordes de liga (por país)

| País | Valor | Detentor |
|---|---|---|
| Inglaterra | 13 | Ryan Giggs |
| Espanha | 12 | Francisco Gento |
| Itália | 10 | Gianluigi Buffon |
| Alemanha | 13 | Thomas Müller |
| França | 11 | Marquinhos |
| Brasil | 5 | Mayke |

Só contam títulos da **primeira divisão** daquele país.

### 34.4 Recordes de sequência

| Recorde | Valor | Detentor |
|---|---|---|
| Bolas de Ouro seguidas | 4 | Lionel Messi |
| Títulos de liga seguidos | 11 | Thomas Müller |
| Títulos continentais seguidos | 3 | Sergio Ramos, Luka Modrić e Toni Kroos |

Sequências são um eixo separado dos totais: quatro títulos espalhados por quinze
anos e quatro seguidos não são a mesma conquista.

### 34.5 Exibição

Recordes batidos aparecem num quadro dourado ao fim da biografia, cada um com:

- O número alcançado, em dourado.
- O rótulo do recorde.
- Se foi **igualado** ou **superado**, com o nome do detentor e a marca antiga.
- O detalhe documental do recorde.

Além disso, uma linha da própria prosa pode mencionar todos eles de uma vez,
com concordância de artigo correta por idioma (por exemplo "superando **as** 21
assistências de Messi" e "superando **os** 950 gols de Cristiano Ronaldo").

---

## 35. Linha do tempo

Uma tira vertical com uma coluna dorsal e um ponto por entrada.

### 35.1 Entradas

| Tipo | Conteúdo |
|---|---|
| Passagem por clube | Escudo, nome, anos, standing, tarja de traidor, total de temporadas **no clube**, tira de honras |
| Primeira convocação | Bandeira, rótulo de estreia, standing na seleção (se houver), idade |

Temporadas consecutivas no mesmo clube colapsam numa única passagem: dez anos
lêem como um capítulo, não dez linhas. Todas as entradas são ordenadas por idade.

### 35.2 Cor do ponto

| Situação | Cor |
|---|---|
| Traidor | Vermelho |
| Lenda | Dourado |
| Ídolo | Verde |
| Demais | Cinza |
| Convocação (lenda / ídolo / outro) | Dourado / Verde / Azul |

### 35.3 Tira de honras

Máximo de **8** ícones por passagem; o excedente vira "+N". Troféus e prêmios
compartilham a mesma tira, em uma **única linha**, para que a altura da linha
dependa de um número só. A dica de ferramenta lista todos os nomes.

### 35.4 Animação

As linhas entram em cascata: opacidade de 0 a 1 e deslocamento de -12 px em x,
duração 0,4 s, atraso escalonado de 0,06 s. Respeita a preferência de movimento
reduzido.

---

## 36. Vitrine de troféus

Grade de troféus e prêmios, agrupada por competição, com contador "×N" para
repetições.

### 36.1 Auto-dimensionamento

A vitrine escolhe o **maior tamanho de célula que ainda faz a coleção inteira
caber**, medindo a caixa real e descendo um degrau de cada vez:

| Nível | Célula | Ícone | Espaço | Nomes de troféu | Nomes de prêmio |
|---|---|---|---|---|---|
| 1 | 68 | 52 | 10 | Sim | Sim |
| 2 | 60 | 46 | 10 | Sim | Sim |
| 3 | 54 | 42 | 8 | Sim | Sim |
| 4 | 48 | 36 | 8 | Sim | Sim |
| 5 | 54 | 42 | 8 | Não | Sim |
| 6 | 48 | 36 | 8 | Não | Sim |
| 7 | 42 | 32 | 6 | Não | Sim |
| 8 | 36 | 28 | 6 | Não | Não |
| 9 | 30 | 24 | 4 | Não | Não |

Requisitos:

- As legendas são abandonadas **antes** de as peças ficarem realmente pequenas:
  um troféu que ainda dá para reconhecer ganha de um maior cuja coleção precisa
  de rolagem para ser vista.
- Tamanhos se repetem na fronteira da legenda de propósito: abandonar a legenda
  libera mais largura que altura, porque uma célula legendada é tão larga quanto
  a sua palavra mais longa.
- Ao redimensionar a janela, a vitrine **volta ao topo da escala**, para que
  alargar a janela devolva as peças grandes.
- Cada peça é desenhada numa célula quadrada de tamanho fixo, com a arte
  limitada a 80% da largura da célula: uma medalha redonda ou uma salva chata
  preenchem um quadrado de canto a canto e lêem como o dobro de uma taça fina
  de duas alças.

### 36.2 Estado vazio

Sem títulos e sem prêmios, mostra uma caixa tracejada com um emoji de troféu
apagado e a frase de vitrine vazia.

---

## 37. O arquivo de jornais

A carreira como um jornal que se folheia de verdade. Exatamente **uma** página
por vez.

### 37.1 A virada de página

- A folha gira em torno da **borda esquerda**, até **166 graus** (curto de 180
  para nunca mostrar um verso chapado).
- Duração de uma virada completa: **900 ms**.
- É possível **arrastar** a folha com o dedo ou o mouse. A direção é decidida
  pelo primeiro movimento real e depois travada, de forma que um tremor no meio
  do arrasto não inverta a página.
- O arrasto percorre **55% da largura** do palco para varrer a folha inteira.
- Soltar além de **28%** do percurso completa a virada; aquém disso, a folha
  volta.
- A animação de assentamento tem piso de **280 ms** e curva de desaceleração, de
  forma que soltar perto do fim leia como a folha caindo sob o próprio peso, e
  não como um pulo de dois quadros.
- Botões e teclas (seta esquerda e direita) apenas **movem o alvo**. Nada é
  rejeitado por ser cedo demais: clicar rápido através de vinte temporadas
  precisa parecer um jornal, e não um formulário. As viradas são enfileiradas e
  executadas uma a uma.
- Agarrar a folha com o ponteiro **sempre vence**, mesmo no meio de uma virada
  automática: o que estava em voo conclui instantaneamente e o que estava na
  fila é descartado.
- Com movimento reduzido ativado, a máquina de estados é idêntica e a página
  simplesmente chega na hora.

### 37.2 Anatomia de uma página

Altura fixa de **620 px**, fundo de papel-jornal (`#f0ede3`) com um leve
chuvisco de fibra, **em ambos os temas**: é a representação de um papel, e papel
não é escuro.

Na ordem, de cima para baixo:

1. **Cabeçalho**: régua dupla em cima, nome do jornal centralizado em caixa
   alta, régua fina embaixo.
2. **Linha de data**: "Edição N de M" à esquerda, idade à direita.
3. **Clube e competição**: nome do clube em vermelho-jornal, nome da liga em
   cinza, com o sufixo "(2ª div)" quando for segunda divisão.
4. **Manchete**: caixa alta, com glifo de tom. O tamanho da fonte cede conforme
   o comprimento: 34 px até 30 caracteres, 30 px até 46, 26 px acima disso.
5. **Foto e olho**: o escudo do clube emoldurado como fotografia (com moldura e
   legenda), e o parágrafo de apoio ao lado.
6. **Duas colunas**:
   - Esquerda: quadro "Números" com jogos, gols (ou jogos sem sofrer),
     assistências (ou gols sofridos), OVR com seta de variação e valor de
     mercado.
   - Direita: quadro de honras (máximo **5**, com "+N" para o resto), tarjas de
     situação, linha de estrelas do clube e a coluna "Também nesta temporada".
7. **Rodapé de acumulado**: jogos, gols (ou jogos sem sofrer), assistências e
   títulos **até aquela edição**.
8. **Assinatura** "CRAQUE" centralizada.

### 37.3 Tarjas de situação

| Tarja | Tom |
|---|---|
| Acesso | Bom |
| Rebaixamento | Ruim |
| Suspenso | Ruim |
| Empréstimo | Neutro |
| Contusão (com número de jogos perdidos) | Neutro |

### 37.4 A coluna "Também nesta temporada"

Esta é a única parte cujo tamanho não é conhecido de antemão, porque o quadro de
honras acima dela varia de nada a cinco troféus mais uma nota de excedente.

Requisito: a coluna **mede o espaço que sobrou** e imprime apenas quantas linhas
inteiras cabem. Limitar apenas a contagem de itens nunca foi suficiente: três
itens de duas linhas precisam de 78 px, e uma temporada decorada pode deixar 40,
o que cortava o último item horizontalmente no meio de uma palavra.

Parâmetros: altura de linha **13 px**, espaçamento **4 px**, cabeçalho **14 px**,
limite absoluto **4** itens.

### 37.5 Ordenação dos títulos

Os títulos de cada edição são ordenados pela **importância que têm para aquele
clube**, usando a confederação do clube e não a do jogador. A página lidera com
o prêmio real da temporada. A intercontinental é a noite pela qual um sul-
americano é lembrado e um rodapé de uma tríplice coroa europeia, e a tabela de
importância já sabe disso.

### 37.6 Paleta

| Elemento | Cor |
|---|---|
| Folha | `#f0ede3` |
| Tinta | `#15130e` |
| Texto secundário | `#443f36` |
| Texto terciário | `#6f6a5c` |
| Réguas | `#c2bba7` |
| Destaque (vermelho de jornal) | `#9b2617` |
| Vitória (verde) | `#1c6640` |

---

## 38. Feed de manchetes

Existe como componente com duas formas. Hoje apenas a forma de **arquivo** é
usada no jogo; a forma de trilho lateral existe e está fora de uso.

| Forma | Ordem | Extras |
|---|---|---|
| Trilho | Mais nova primeiro | Idade sob cada linha |
| Arquivo | Mais antiga primeiro (alternável) | Filtros de tom, contagem, cabeçalhos de idade |

No arquivo, uma idade é anunciada uma única vez, e as linhas sob ela pertencem
àquela temporada. Os filtros são "todas", "boas" e "ruins", e só aparecem os que
têm pelo menos uma entrada, para nunca oferecer um filtro que leva a uma lista
vazia.

Cada linha tem uma barra colorida à esquerda **e** um glifo (▲ ▼ •), porque uma
borda colorida de 2 px é exatamente o tipo de sinal que desaparece para um
leitor daltônico.

---

## 39. Desafio do Dia

### 39.1 Regras fixas

| Parâmetro | Valor |
|---|---|
| Dificuldade | Sempre **Difícil** |
| Ritmo | Sempre **Normal** (2 temporadas por decisão) |
| Nacionalidade | Definida pelo desafio |
| Posição | Definida pelo desafio |
| Semente | Definida pelo desafio |
| Aposentadoria antecipada | **Permitida** a partir dos 27 |
| Livre para o jogador | Sobrenome, pé preferido, aparência |

Requisito: qualquer coisa que a simulação leia precisa ser idêntica para todos
ou as pontuações não são comparáveis. Só o cosmético é livre.

### 39.2 Identificador do dia

O identificador é a data em **UTC** no formato `AAAA-MM-DD`, para que o desafio
vire no mesmo instante no mundo inteiro.

### 39.3 A mão do dia

Três briefings e um édito, com estas restrições, em ordem de importância:

1. Os três briefings precisam vir de **três eixos diferentes**. Sem isso,
   "escolher os dois melhores" não é sacrifício, é apenas uma rede mais larga.
2. Precisa existir **pelo menos uma posição** capaz de perseguir os três, ou o
   dia começa com um zero garantido.
3. Nenhum par pode ser uma **contradição declarada** (por exemplo, "nunca se
   transferir" contra "ganhar uma liga em três países").
4. O édito não pode tornar nenhum dos três **literalmente impossível**. Difícil é
   o objetivo; invencível é um bug.

A busca é determinística: o repertório inteiro é embaralhado por dia, percorrido
em ordem, e a primeira mão que satisfaz tudo é a escolhida. Nunca há laço
infinito.

**Qual dos três fica escondido** rota por dia: o índice é o número de dias desde
a época, módulo 3.

### 39.4 Países possíveis

Somente nações cuja liga o jogo simula de verdade: BR, AR, ES, FR, DE, IT,
Inglaterra, UY, CO, CL, MX, US, PE, EC, PY, VE, BO. Um repertório anterior
incluía Portugal e Dinamarca, que têm seleção mas nenhuma competição doméstica
aqui, e um dia de "domínio nacional" dado a um dinamarquês pontuava zero para
qualquer estratégia, porque não havia liga a dominar.

### 39.5 Os eixos

`produção`, `prata`, `lealdade`, `jornada`, `crescimento`, `azarão`, `seleção`,
`longevidade`, `condecorações`.

### 39.6 Catálogo completo de briefings

| Briefing | Eixo | Posições | Unidade | Progresso | Alvo |
|---|---|---|---|---|---|
| Lenda de um clube só | Lealdade | Qualquer | pontos | temporadas no 1º clube ×2 + títulos ×8 + pontos de standing | 26 |
| Máquina de gols | Produção | Atacante | gols | Gols na carreira | 172 |
| Armador | Produção | Linha | assistências | Assistências na carreira | 99 |
| Colecionador de títulos | Prata | Qualquer | títulos | Total de títulos | 5 |
| Colecionador | Prata | Qualquer | pontos | tipos distintos ×12 + total ×2 | 34 |
| Prodígio | Crescimento | Qualquer | OVR | Melhor OVR até os 21 | 68 |
| Explosão tardia | Crescimento | Qualquer | pontos | pico + max(0, idade_do_pico - 26) × 5 | 89 |
| Ídolo do azarão | Azarão | Qualquer | pontos | melhor de (pontos de standing × (1 + (5 - reputação)/5)) | 80 |
| Trotamundos | Jornada | Qualquer | pontos | países ×18 + títulos ×2 | 62 |
| Herói nacional | Seleção | Qualquer | pontos | pico/2 + jogos ×2 + copas ×60 + continentais ×30 | 38 |
| Homem de ferro | Longevidade | Qualquer | jogos | Jogos na carreira | 660 |
| Sem empréstimos | Jornada | Qualquer | OVR | Pico (regra: zero empréstimos) | 76 |
| Rei do continente | Prata | Qualquer | pontos | continentais ×45 + mundiais ×30 + maior reputação ×8 | 70 |
| Resiliente | Azarão | Qualquer | pontos | pico + (lesão grave ? 35 : 0) + rebaixamentos ×10 + acessos ×12 | 117 |
| Amado | Lealdade | Qualquer | pontos | Torcida final | 88 |
| Camisa de peso | Lealdade | Qualquer | temporadas | Temporadas com número ≤ 11 | 22 |
| Andarilho | Jornada | Qualquer | pontos | clubes ×5 + títulos | 40 |
| Volta pra casa | Lealdade | Qualquer | pontos | temporadas no 1º clube ×3 + (voltou ? 25 : 0) + (aposentou lá ? 40 : 0) | 43 |
| Franco-atirador | Produção | Atacante | gols | Melhor temporada de gols | 18 |
| Da base ao estrelato | Crescimento | Qualquer | OVR | Pico menos 50 | 31 |
| Inquebrável | Longevidade | Qualquer | OVR | Pico (regra: sem lesão grave e sem rebaixamento) | 76 |
| Glória individual | Condecorações | Atacante | pontos | Bolas ×60 + Chuteiras ×25 + pico/2 | 38 |
| Lenda em dobro | Jornada | Qualquer | pontos | clubes de lenda ×40 + de ídolo ×12 | 40 |
| Servo leal | Lealdade | Qualquer | temporadas | Maior número de temporadas num clube | 12 |
| Muralha | Produção | Goleiro | jogos sem sofrer | Total na carreira | 187 |
| Em ascensão | Azarão | Qualquer | pontos | acessos ×25 + títulos de liga ×15 + pico/2 | 131 |
| Domínio nacional | Prata | Qualquer | pontos | ligas ×10 + copas ×6 | 20 |
| Classe mundial | Crescimento | Qualquer | OVR | Pico | 81 |
| Veterano | Longevidade | Qualquer | OVR | OVR aos 40 menos max(0, 38 - idade_de_aposentadoria) × 4 | 78 |
| Oportunista | Produção | Atacante | pontos | (gols/jogos) × 100, zero abaixo de 120 jogos | 52 |
| Criador-chefe | Produção | Linha | assistências | Melhor temporada de assistências | 17 |
| Tríplice coroa | Prata | Qualquer | pontos | ligas ×6 + copas ×5 + continentais ×14 | 46 |
| Conquistador do mundo | Prata | Qualquer | pontos | mundiais de clube ×40 + copas do mundo ×45 + continentais de seleção ×20 | 45 |
| Manteve a camisa | Lealdade | Qualquer | pontos | Se ≤ 2 clubes: temporadas ×3 + títulos ×6 + clubes de lenda ×20; senão 0 | 84 |
| Centenário | Seleção | Qualquer | jogos | Jogos pela seleção | 112 |
| Goleador internacional | Seleção | Linha | gols | Gols pela seleção | 44 |
| Convocado cedo | Crescimento | Qualquer | pontos | max(0, 30 - idade_da_1ª_convocação) × 6 + jogos | 74 |
| Sempre em campo | Longevidade | Qualquer | temporadas | Temporadas em clubes com média ≥ 30 jogos | 17 |
| Herói da segunda divisão | Azarão | Qualquer | pontos | acessos ×26 + temporadas na 2ª ×4 + títulos ×3 | 62 |
| Herói cultuado | Azarão | Qualquer | pontos | clubes de ídolo ×18 + de lenda ×26 | 58 |
| Corrida da Chuteira | Condecorações | Atacante | pontos | Chuteiras ×22 + melhor temporada de gols | 68 |
| Condecorado | Condecorações | Qualquer | pontos | prêmios ×14 + Bolas ×20 | 58 |
| Mãos seguras | Crescimento | Goleiro | pontos | melhor temporada sem sofrer ×3 + max(0, pico - 70) ×2 | 96 |
| Carreira completa | Condecorações | Qualquer | pontos | min(títulos,10) ×6 + min(jogos_seleção,40) + min(clubes de lenda,2) ×15 + pico/2 | 72 |

Pontos de standing usados acima: lenda 40, ídolo 18, regular 6, passageiro 0.

### 39.7 Regras rígidas de briefing

Três briefings carregam uma regra. Quebrá-la **não zera** a pontuação: ela
limita, de forma que quem escorregou tarde ainda ganhe de quem nunca começou,
mas nunca de quem fez a corrida limpa.

| Briefing | Regra |
|---|---|
| Lenda de um clube só | Zero transferências permanentes |
| Sem empréstimos | Zero empréstimos |
| Inquebrável | Nenhuma lesão grave e nenhum rebaixamento |

### 39.8 Contradições declaradas

| Briefing | Não pode ser dado junto com |
|---|---|
| Lenda de um clube só | Trotamundos, Andarilho, Lenda em dobro, Volta pra casa, Em ascensão |
| Prodígio | Explosão tardia |
| Ídolo do azarão | Classe mundial, Domínio nacional, Rei do continente |
| Volta pra casa | Trotamundos |
| Servo leal | Trotamundos, Andarilho |
| Em ascensão | Domínio nacional, Rei do continente |
| Manteve a camisa | Trotamundos, Andarilho |
| Herói da segunda divisão | Classe mundial, Rei do continente, Domínio nacional |

O sistema lê essas exclusões **simetricamente**: declarar num lado basta.

### 39.9 Éditos

Uma regra que não pode ser quebrada, julgada **somente na carreira terminada**,
nunca no meio. O jogador é livre para descobrir sozinho se um movimento ainda é
legal.

| Édito | Condição de sobrevivência | Conflita com |
|---|---|---|
| Sem saídas cedo | Nenhuma transferência permanente antes dos 24 | Trotamundos, Andarilho |
| No máximo dois clubes | No máximo 2 clubes na carreira | Trotamundos, Andarilho, Lenda em dobro |
| Nada de gigantes | Maior reputação de clube abaixo de 3,5 | Rei do continente, Classe mundial, Colecionador de títulos |
| Um país só | No máximo 1 país | Trotamundos |
| Só primeira divisão | Zero temporadas na segunda divisão | Ídolo do azarão, Em ascensão |
| Sem empréstimos | Zero empréstimos | Sem empréstimos (o briefing) |
| Nunca criar raízes | Maior passagem contínua de no máximo 4 temporadas | Lenda de um clube só, Servo leal, Volta pra casa |
| Sem camisa de peso | Zero temporadas com número ≤ 11 | Camisa de peso |
| Nunca rebaixado | Zero rebaixamentos | Em ascensão, Resiliente |
| Exílio | Pelo menos **3** países | Lenda de um clube só, Servo leal, Volta pra casa |

**Édito de piso vs. édito de teto.** Nove dos dez são "tetos": começam
satisfeitos e quebram para sempre no instante em que uma linha é cruzada. O
exílio é o único **piso**: ele exige um mínimo até o fim da carreira e por isso
começa **não satisfeito**. A interface precisa distinguir os dois, porque um
garoto de 16 anos que jogou por exatamente um clube não falhou em nada, apenas
ainda não chegou lá. O édito de piso é desenhado como uma barra de progresso,
igual a um briefing; o de teto é desenhado como uma faixa de perigo.

### 39.10 Pontuação

```
pontos_do_briefing(m):
    razão = progresso / alvo
    se razão ≤ 1:  pontos = razão^1,35 × 340
    senão:         pontos = 340 + min(60, log2(razão) × 90)

bruto = soma dos DOIS MAIORES pontos de briefing
pontos_de_pico = 200 × ((pico - 70) / 29)^1,5      (zero abaixo de OVR 70)

total = (bruto + pontos_de_pico)
        × (édito_sobreviveu ? 1 : 0,35)
        × 0,96^temporadas_apagadas
```

| Constante | Valor |
|---|---|
| Pontos de um briefing cheio | 400 (85% deles, 340, até o alvo; os 60 restantes só acima dele) |
| Briefings contados | Os **2** melhores de 3 |
| Pontos máximos do pico | 200 |
| Piso do pico | OVR 70 |
| Curva do pico | expoente 1,5 |
| Multiplicador de édito quebrado | 0,35 |
| Decaimento por temporada apagada | 0,96 |
| Limiar de temporada apagada | OVR do ano ≤ pico - 4, **e** idade acima da idade do pico |
| Máximo teórico | 1000 |

Requisitos de design:

- A curva de briefing **não é linear** de propósito: o último trecho até o alvo
  vale mais que o primeiro, de forma que quase chegar claramente vença chegar na
  metade. Passar do alvo continua subindo devagar, senão toda corrida forte
  empataria.
- Contar só os **dois melhores** é o que faz perseguir os três ser a linha
  perdedora: a pergunta de verdade é qual abandonar.
- O édito é tudo ou nada, porque uma regra que dá para cumprir pela metade não é
  regra.
- A **decadência de crepúsculo** é julgada pela **carta, não pela idade**: quem
  segurou o nível até os 38 nunca é punido por isso. Mais temporadas continuam
  rendendo mais progresso, então insistir pode estar certo; só precisa ser pago.
- Uma pontuação de 1000 exige os dois briefings no máximo, o édito intacto,
  nenhuma temporada apagada **e** um pico de 99.

### 39.11 HUD em jogo

Painel acima da decisão, visível só em carreiras de desafio.

| Elemento | Comportamento |
|---|---|
| Cabeçalho | "Objetivo" em dourado, e a regra das duas melhores à direita |
| Linhas de briefing aberto | Título, progresso `N/M` com a unidade curta ao lado, barra de progresso. A dica de ferramenta traz o texto completo do briefing. |
| Briefing escondido | Cadeado e a idade em que abre, até os **25** anos |
| Briefing recém-revelado | Fundo dourado com anel, e o texto completo impresso por extenso |
| Édito de teto | Faixa neutra enquanto vale; faixa vermelha com "Regra quebrada" quando quebra |
| Édito de piso | Barra de progresso `atual/alvo`, verde quando alcançado |
| Aviso de decadência | A partir dos 27: ou a regra de banco ("você pode parar quando quiser"), ou a penalidade atual em temporadas e porcentagem |

Requisitos:

- A barra **nunca** diz quais dois estão contando. O jogador vê os números e
  deduz sozinho.
- O texto completo do briefing escondido precisa ser impresso **no instante em
  que ele abre**: é a única chance de o jogador aprender o que ele pede, porque
  o título sozinho ("Temporada mágica") não diz nada sobre o que fazer.
- A unidade fica ao lado do número. Vários briefings pontuam numa curva de
  pontos e não numa contagem crua, e "34/34" sem unidade se lia como uma
  exigência de trinta e quatro troféus.

### 39.12 Tela de entrada do desafio

Duas colunas.

**Esquerda (o briefing do dia):**

1. "Objetivo" em dourado e a regra das duas melhores.
2. Os **dois briefings abertos**, cada um em cartão com título, texto e alvo
   com unidade.
3. Um cartão tracejado para o **briefing escondido**, dizendo em que idade ele
   abre.
4. Quadro vermelho com o **édito**: rótulo, título e texto.
5. A regra de banco.
6. A **mão distribuída**: bandeira, nome do país, posição, e o aviso de que o
   desafio é sempre no difícil.
7. Se já houver tentativa ranqueada hoje, um aviso dourado.
8. Botão verde "Jogar".

**Direita (o ranking):**

1. Rótulo "Ranking".
2. Quatro mini-estatísticas: jogados, seu melhor (dourado), média, corridas
   limpas. Só aparecem se houver ao menos uma tentativa.
3. Lista de até **8** entradas do dia, ordenadas por pontuação, com posição,
   nome, briefing que carregou a corrida, OVR de pico e pontuação.
4. Estado vazio com a frase correspondente.

### 39.13 Resultado do desafio no resumo

Bloco no topo da coluna direita, com:

- Pontuação em dourado grande, sobre "/ 1000".
- Os **três** briefings listados, com o sacrificado em cinza e não escondido:
  ver o que foi abandonado é o ponto do formato.
- Cada linha: ✓ ou -, título, `progresso/alvo`, pontos.
- Etiqueta "Ranqueada" (verde) ou "Amistosa" (cinza).
- Etiqueta com o bônus de pico: OVR alcançado e pontos que ele valeu.
- Etiqueta vermelha de regra quebrada, com o nome do édito, se aplicável.
- Etiqueta de penalidade de crepúsculo, com temporadas e porcentagem.
- Uma linha de colocação: a posição, se foi recorde pessoal ou a posição dentro
  do campo, e uma legenda. Deliberadamente **uma linha só**: a tabela completa
  vive na tela do desafio, e depois de vinte e quatro temporadas o que o jogador
  quer é a própria posição.

Medalhas de posição: 1º dourado, 2º branco, 3º vermelho, demais neutro.

---

## 40. Placar local

Tudo vive no navegador. Não há servidor, então não há contra quem trapacear e
não faz sentido fingir que há. A forma é a de um placar de verdade, para que
transformá-lo num placar real depois seja uma troca de transporte e não um
redesenho.

### 40.1 Entrada registrada

| Campo | Descrição |
|---|---|
| Identificador do desafio | A data |
| Briefing | O que mais pontuou nessa corrida |
| Nome | O sobrenome do jogador |
| Pontuação | Total final |
| Briefings cumpridos | Quantos dos contados atingiram o alvo |
| Édito sobreviveu | Booleano |
| OVR de pico | Para contexto |
| Data e hora | ISO |
| Ranqueada | Booleano (ver abaixo) |

### 40.2 Ranqueada vs. amistosa

A corrida **ranqueada** é a **primeira tentativa completada** de cada desafio.
Qualquer coisa depois disso continua sendo registrada, mas fica fora das
estatísticas agregadas; do contrário o placar só premiaria quem mais repetiu.

### 40.3 Ranking diário

Requisito: o ranking exibido é **do dia**. Um placar diário que carrega as
pontuações de ontem não é um placar diário, e uma lista histórica com uma linha
por dia é um histórico e não uma classificação. Todas as tentativas do dia
entram nele, ranqueadas ou não, de forma que ele se encha ao longo do dia e
esteja vazio de novo na manhã seguinte.

### 40.4 Estatísticas agregadas

Calculadas apenas sobre corridas **ranqueadas**: quantidade jogada, melhor
pontuação, média e número de corridas limpas (édito intacto).

### 40.5 Versionamento

O placar guarda um número de versão. Um placar de formato antigo é **descartado
inteiro**, e não parcialmente confiado: são pontuações, e um número errado é
pior que um número ausente.

Falhas de escrita (armazenamento cheio ou bloqueado) são silenciosas: perder uma
pontuação não vale quebrar a tela de fim de carreira.

---

## 41. Imagem de compartilhamento

Um pôster PNG da carreira, pintado pixel a pixel em posições conhecidas.

### 41.1 Requisitos estruturais

- Tamanho **1080 × 1350** (proporção 4:5), que é o retrato que Instagram,
  WhatsApp, Facebook e X exibem sem cortar.
- **Nada é diagramado dinamicamente**: cada elemento é colocado num pixel
  conhecido. O que o código desenha é exatamente o que sai, em todo navegador,
  toda vez.
- Paleta **escura fixa**, independentemente do tema do site: um pôster não é
  tematizado.
- Margem interna de **60 px**.
- Imagens externas nunca são usadas; tudo é desenhado ou embutido, para que a
  tela de desenho não seja contaminada e a exportação continue funcionando.

### 41.2 Conteúdo, de cima para baixo

1. **Fundo**: degradê vertical em três paradas, mais o escudo do clube como
   marca d'água.
2. **Marca** "CRAQUE" no canto superior esquerdo.
3. **Selo**, no canto superior direito, quando aplicável:
   - Carreira de desafio → selo **dourado** "DESAFIO".
   - Carreira no difícil → selo **vermelho** "DIFÍCIL".
   - Carreira normal → **nenhum selo**.
   - Quando os dois se aplicam, o selo de desafio vence.
4. **Carta do auge**, à esquerda, numa caixa de 386 × 551.
5. **Coluna direita**:
   - Sobrelinha "Resumo da carreira" em dourado.
   - Sobrenome em display grande, com fonte que encolhe até caber.
   - Bandeira + país + nome longo da posição.
   - **Seis números**, três por linha: jogos; gols (ou jogos sem sofrer, para
     goleiro); assistências (ou jogos sem sofrer para defensor, ou número de
     clubes para goleiro); títulos (destacado); temporadas; jogos pela seleção.
   - Faixa dourada com o **valor de mercado de pico**.
6. Legenda sob a carta: `OVR · MELHOR CARTA`.
7. **Vitrine**: até 10 peças agrupadas com contador.
8. **A estrada percorrida**: até 8 passagens em duas colunas, com escudo, nome,
   pílula dourada com a contagem de títulos (com uma taça desenhada, nunca um
   emoji, porque emojis carregam a própria cor e viram adesivo sobre dourado) e
   os anos.
9. **Gráfico de arco** do OVR ao longo da carreira, **somente se sobrar espaço**.
10. **Rodapé**: marca, slogan e chamada para ação.

### 41.3 Como o espaço é dividido

A metade de baixo é elástica. Três blocos opcionais dividem o que sobra entre a
carta e o rodapé, e cedem nesta ordem:

1. A lista de passagens **corta linhas** antes de transbordar, e reserva uma
   linha para a nota "+N clubes".
2. O gráfico de arco só aparece se houver pelo menos **116 px** livres, e nunca
   ocupa mais de 214 px.

### 41.4 Entrega

| Plataforma | Botão |
|---|---|
| Qualquer | "Baixar carta" |
| Só onde o navegador aceita compartilhar **arquivos de imagem** | "Compartilhar" |

O botão de compartilhar só aparece onde o navegador realmente consegue entregar
um arquivo. Navegadores de desktop anunciam a função e recusam arquivos de
imagem, então oferecê-la lá seria falhar na cara do usuário. O teste é feito com
um arquivo-sonda.

Cancelar o diálogo de compartilhamento **não é falha** e não mostra erro.

O nome do arquivo é `craque-<sobrenome-normalizado>.png`, com queda para
`craque-carreira.png`.

O URL temporário do download é liberado depois de 60 segundos: liberá-lo na
hora corre com o próprio download em alguns navegadores e o arquivo chega vazio.

### 41.5 Estados do botão

| Estado | Comportamento |
|---|---|
| Ocioso | Rótulo normal |
| Trabalhando | Rótulo "Gerando...", ambos os botões desabilitados |
| Erro | Mensagem vermelha curta ao lado |
---

## 42. A carta do jogador

### 42.1 Forma

A carta é um **escudo** recortado, com ombros retos, laterais retas e um pé que
afunila até a ponta:

```
polígono(50% 0%, 100% 4,5%, 100% 78%, 50% 100%, 0% 78%, 0% 4,5%)
```

A zona plana vai até 78% da altura, de forma que a grade de atributos nunca caia
dentro do afunilamento.

### 42.2 Tamanhos

| Tamanho | Largura | Altura | Onde é usado |
|---|---|---|---|
| xs | 124 | 177 | Tela de carreira em janela baixa |
| sm | 164 | 234 | Tela de carreira normal |
| md | 232 | 331 | Resumo |
| lg | 300 | 429 | Carta de demonstração do início |

Requisito: largura **e** altura explícitas em pixels, nunca uma proporção. A
carta costuma ser um item flexível dentro de uma linha que estica, e uma altura
esticada ganha da proporção, o que fazia a carta sair mais alta que 7:10
dependendo do que estivesse ao lado dela.

### 42.3 Faixas de raridade

| Faixa | OVR | Placa |
|---|---|---|
| Bronze | 0 a 64 | Cobre escuro a claro |
| Prata | 65 a 74 | Cinza-aço a branco |
| Ouro | 75 a 93 | Dourado escuro a claro |
| ICON | 94 a 99 | Platina quase branca com tinta dourada quente |

São quatro e não cinco de propósito. A faixa de ouro é deliberadamente a mais
larga: é onde quase toda carreira real vive, e dividi-la mais fazia duas cartas
com um ponto de diferença parecerem classes diferentes de jogador.

### 42.4 Brilho progressivo

Quanto mais alto o OVR sobe **dentro da própria faixa**, mais a placa brilha. O
progresso na faixa é `(OVR - piso) / (teto - piso)`, sempre entre 0 e 1.

| Camada | Opacidade |
|---|---|
| Riscos diagonais (metal escovado) | 0,10 + progresso × 0,30 |
| Faixa de brilho varrendo a placa | 0,16 + progresso × 0,42 |
| Poça de luz atrás do retrato | 0,14 + progresso × 0,16 |
| Luz de borda (sombra interna nas bordas do escudo) | 0,10 + progresso × 0,45 |
| Florescência atrás do número de OVR | progresso × 0,34 |

Requisitos:

- Os riscos diagonais são mascarados na metade inferior, para nunca brigarem
  com os números. A máscara vai de opaco a 46% e some em 66%.
- O brilho é **estático**. A carta antiga tinha uma varredura de luz em laço,
  que lia como falha de renderização.
- A luz de borda é uma sombra **interna**, contida pelo recorte, coisa que um
  brilho externo nunca conseguia.
- O brilho final sempre tem que continuar agradável: os seis números na frente
  são o motivo da carta existir.

### 42.5 Conteúdo

| Posição | Elemento |
|---|---|
| Canto superior esquerdo | OVR grande, com a sigla da posição abaixo |
| Topo, centralizado | Retrato do avatar, ocupando 47% da altura |
| 44% da altura, centralizado | Número da camisa, branco com contorno preto |
| 55,5% da altura | Sobrenome, truncado com reticências |
| 66% da altura | Seis atributos: sigla acima, valor abaixo |
| 80% da altura | Bandeira + escudo da liga + escudo do clube |

O rótulo de atributo aperta o espaçamento de letras no tamanho xs, onde seis
rótulos de três letras em 124 px se atropelam.

---

## 43. Arte gerada

Nenhum clube, troféu ou liga fica sem imagem. Toda arte faltante é **gerada
deterministicamente a partir dos dados**, e servida como imagem embutida (nunca
um arquivo externo), para que a exportação de imagem continue funcionando e o
jogo continue funcionando sem rede.

### 43.1 Escudos de clube

Sempre o mesmo disco de três partes concêntricas, e é isso que faz 489 clubes
parecerem uma única coleção:

1. **Aro**: um anel sólido, de raio 44,5 a 50, quase sempre na segunda cor.
2. **Campo**: o disco interno, com o padrão.
3. **Símbolo**: uma silhueta ao centro.

**Padrões de campo disponíveis**: sólido, metades verticais, metades
horizontais, listras, argolas, banda, banda dupla, banda vertical, faixa
diagonal, duas riscas finas diagonais, diagonal, quartos, cruz, cruz de Santo
André, galão, pilha, raios, órbita, xadrez, tricolor vertical, tricolor
horizontal, ondas, horizonte, canto, gradiente.

**Símbolos disponíveis**: cerca de setenta silhuetas, entre aves (águia, condor,
gaivota, pega, coruja, galo, cisne), mamíferos (leão, touro, carneiro, cavalo,
lobo, raposa, urso, gato, cervo, elefante), outros animais (serpente, dragão,
abelha, golfinho, tubarão, peixe), marinhos (onda, âncora, navio, farol),
terrestres (montanha, vulcão, sol, lua, estrela, bússola, raio, chama, tocha),
vegetais (árvore, pinheiro, palmeira, trigo, louro, trevo, uvas, cacto, folha) e
futebolísticos (bola, chuteira, gol), além de um escudo com iniciais.

**Derivação para clubes sem escudo curado:**

1. Cores vêm do kit do clube; se o kit não existir, da cor primária; se nem
   isso, de uma paleta de futebol escolhida pelo hash do identificador.
2. Se a cor de destaque não separar da base, ela vira preto quase puro (base
   clara) ou uma versão 70% clareada da base (base escura).
3. O **padrão do kit decide o campo** quando ele diz algo específico (listras
   verticais → listras, horizontais → argolas, faixa → faixa, xadrez → xadrez).
   Só camisas lisas caem para o hash.
4. O **símbolo** vem de uma fatia independente do hash, de forma que dois clubes
   que por acaso compartilhem o campo quase nunca compartilhem o símbolo.
5. A contagem de listras vem de uma terceira fatia (5, 7 ou 9), e o espelhamento
   de uma quarta.

Requisito: os campos mais barulhentos (raios, xadrez, cruz de Santo André) ficam
**reservados** a clubes curados, para que um time desconhecido nunca grite mais
alto do que um conhecido.

Requisito: clubes curados existem para os poucos casos em que a derivação erra
feio, e podem sempre tomar o lugar da versão derivada.

Requisito: identificadores de clube precisam ser únicos globalmente. Uma colisão
move silenciosamente um clube para o país errado.

### 43.2 Troféus

Desenhados numa caixa de 120 × 210, com seis silhuetas possíveis:

| Silhueta | Usada para |
|---|---|
| Taça | Copas de mata-mata |
| Cálice | Torneios continentais |
| Salva | Supercopas nacionais |
| Escudo | O Community Shield, que literalmente é um escudo |
| Bojo | Ligas |
| Ânfora | Supercopas continentais e a Intercontinental |

Três metais: ouro, prata e bronze, cada um com gradiente de cinco paradas
casado com a arte original enviada, para que peças geradas fiquem ao lado de
peças fotografadas sem parecerem outro material.

Cada peça tem uma cor de destaque (o pedestal), que é onde a identidade da
competição aparece, e opcionalmente **uma ou duas letras gravadas** no pedestal.

Regra: só competições sem arte própria recebem peça gerada. Qualquer coisa com
fotografia real mantém a fotografia. Um URL ausente ou um dos dois arquivos de
placeholder compartilhados conta como "sem arte".

As segundas divisões geradas usam **prata** e não ouro: um segundo nível deve
ler como o metal mais silencioso ao lado da própria primeira divisão.

### 43.3 Escudos de liga

Regra absoluta: **nunca um círculo**. Os dois lugares onde um escudo de liga
aparece o colocam imediatamente ao lado de um escudo de clube, e todo escudo de
clube é um disco. Um escudo de liga redondo leria como um segundo clube.

A forma é um **escudo de competição de topo chato**, inconfundivelmente não-disco
mesmo a dez pixels, que é o tamanho em que ele de fato é desenhado na carta.

| Parte | Regra |
|---|---|
| Campo | Cores do kit da seleção do país, passadas pelo mesmo temperador das cores de escudo |
| Padrão | Derivado do padrão do kit; cai para tricolor horizontal quando o país tem terceira cor, senão banda |
| Pé | Faixa onde as iniciais são gravadas |
| Iniciais | Derivadas do nome da liga |
| Segunda divisão | Campo 28% mais escuro e pé de aço |
| Contorno | Fio de contraste para manter a borda sobre painel escuro |

**Derivação das iniciais**: normaliza acentos para ASCII (um caractere acentuado
dentro do texto quebra a imagem embutida), remove palavras sem identidade
(`de`, `del`, `la`, `las`, `los`, `el`, `campeonato`, `torneo`) mas **mantém**
`liga`, `serie`, `primera`, `segunda` e os dígitos, porque são toda a diferença
entre "Primera B" e "Liga 2", e corta em três letras. Se a poda deixar menos de
duas letras, usa o nome inteiro; se ainda assim não sobrar nada, usa o código
FIFA do país.

O tamanho da fonte é 21 para duas letras e 17 para três.

Quatro ligas têm iniciais curadas por lerem melhor que as derivadas.

### 43.4 Kits

Cada clube relevante tem um kit pesquisado à mão: cor base, cor de destaque e
padrão (sólido, listras verticais, listras horizontais, faixa diagonal, xadrez).
Clubes sem entrada caem para uma camisa lisa derivada da cor primária.

Kit neutro (cinza sólido) é usado sempre que não há clube: criação de
personagem, carta de demonstração.

---

## 44. Animações e movimento

### 44.1 Catálogo de animações

| Nome | Duração | Curva | O que faz | Onde |
|---|---|---|---|---|
| Aparecer | 320 ms | ease-out | Opacidade 0 → 1 | Troca de tela, linhas de manchete |
| Aparecer subindo | 340 ms | (0.22, 1, 0.36, 1) | Opacidade 0 → 1, y +10 → 0 | Painéis, capa de jornal, diálogos, menu de ajustes |
| Estourar | 380 ms | (0.34, 1.56, 0.64, 1) | Escala 0,72 → 1,08 → 1 | Peças da vitrine |
| Entrada de carta | 520 ms | (0.22, 1, 0.36, 1) | Perspectiva, rotação Y -16° → 0, y +14 → 0, escala 0,94 → 1 | Carta nova |
| Varredura de brilho | 1,5 s, atraso 250 ms | (0.22, 1, 0.36, 1) | Faixa de luz cruzando | Carta recém-revelada |
| Brilho de contagem | 700 ms | ease-out | Sombra de texto dourada pulsando | Números |
| Flutuação suave | 5 s, infinita | ease-in-out | y 0 → -6 → 0 | Carta de demonstração do início |
| Confete | 1,1 s | ease-in | Queda com rotação de 340° | Comemorações |
| Pulso de troféu | 1,8 s, infinita | ease-in-out | Halo dourado pulsando | Realce de troféu |
| Aviso entrando | 320 ms | (0.22, 1, 0.36, 1) | x +16, y -6, escala 0,96 → 1 | Avisos do canto |
| Aviso saindo | 260 ms | (0.4, 0, 1, 1) | x → +24, escala → 0,96 | Avisos do canto |

### 44.2 Cascata

Blocos marcados como cascata animam os filhos em sequência, com a mesma curva de
"aparecer subindo", e atrasos de 40, 90, 140, 190, 240 e 290 ms para os seis
primeiros filhos. Usado nas grades de opção de decisão.

### 44.3 Animações programadas

| Efeito | Detalhes |
|---|---|
| Medalhas do aviso de conquista | Escala 0,3 → 1,15 → 1 e rotação -20° → 6° → 0°, 600 ms, cascata de 70 ms entre medalhas |
| Desvanecimento do aviso | Opacidade 1 → 0 e x 0 → 24, 350 ms, disparado 350 ms antes do fim da vida |
| Linhas da linha do tempo | Opacidade 0 → 1 e x -12 → 0, 400 ms, cascata de 60 ms |
| Parágrafos da biografia | Opacidade 0 → 1 e y 8 → 0, 450 ms, cascata de 80 ms |
| Virada de página do jornal | Rotação Y até -166°, 900 ms, curva (0.36, 0, 0.24, 1); assentamento com (0.22, 1, 0.36, 1) e piso de 280 ms |

### 44.4 Transições de estado

| Elemento | Transição |
|---|---|
| Barra de torcida | largura, 700 ms, ease-out |
| Barras de briefing e édito | largura, 500 ms |
| Barras de atributo do resumo | largura, 700 ms |
| Bandeiras e escudos esmaecidos | filtro e opacidade, 500 ms |
| Engrenagem de ajustes | rotação 45°, 300 ms |
| Botões em geral | escala 0,98 no clique, brilho 110% no hover |
| Cartões de opção | escala 1,02 no hover, 0,98 no clique, borda vira verde |

### 44.5 Movimento reduzido

Quando o sistema pede movimento reduzido, estas animações são **desligadas por
completo**: aparecer, aparecer subindo, estourar, entrada de carta, brilho de
contagem, flutuação, confete, pulso de troféu, cascata e varredura de brilho.

Ficam **deliberadamente de fora da exceção**:

- Os avisos de canto (entrada e saída), que são pistas curtas de 260 a 320 ms
  que o usuário quer ver incondicionalmente, e não enfeite.
- A virada de página do jornal, que mantém a mesma máquina de estados e
  simplesmente chega instantaneamente, de forma que a página ainda vire para
  quem pediu menos movimento.
- O auto-rolar da tabela de carreira, que troca rolagem suave por instantânea.

---

## 45. Som

Kit sintetizado inteiramente em tempo real, sem nenhum arquivo de áudio.

| Cue | Composição |
|---|---|
| Tique | Onda triangular 520 Hz, 50 ms, ganho 0,035 |
| Selecionar | Triangular 660 Hz 90 ms + senoide 880 Hz 80 ms atrasada 40 ms |
| Confirmar | Três triangulares: 523,25 / 659,25 / 783,99 Hz, com atrasos de 0, 70 e 140 ms |
| Voltar | Senoide 420 Hz deslizando para 300 Hz, 110 ms |
| Atributo subiu | Senoide 700 Hz deslizando para 1200 Hz, 140 ms |
| Troféu | Três triangulares 659,25 / 830,61 / 987,77 Hz + ruído filtrado de 350 ms |
| Revelação de carta | Ruído de 280 ms + senoide 300 → 900 Hz de 350 ms |
| Apito | Senoide 1800 → 2200 Hz de 180 ms + senoide 2100 Hz de 160 ms |

Detalhes obrigatórios:

- Cada tom tem ataque curto (12 ms) e decaimento exponencial, de forma que soe
  como um "pop" suave e não um estalo.
- O ruído tem envelope descendente e passa por um filtro passa-banda em 2400 Hz.
- O contexto de áudio é criado sob demanda e retomado se estiver suspenso, pois
  navegadores só o liberam após um gesto do usuário.
- O volume mestre é um **multiplicador simples**, não um nó de ganho
  compartilhado, para que um som já agendado antes do jogador mexer no
  deslizador continue tocando no nível em que começou.
- Mudo ou volume zero curta-circuita tudo antes de qualquer agendamento.

### 45.1 Mapa de gatilhos

| Ação | Cue |
|---|---|
| Trocar modo, dificuldade, pé, país, posição, idioma, tema | Tique |
| Fechar diálogo, abrir ajustes, soltar o deslizador de volume | Tique |
| Abrir o editor de aparência, sortear aparência, desmutar, escolher qualquer opção de decisão, ir ao desafio | Selecionar |
| Terminar aparência, confirmar, jogar novamente, baixar/compartilhar imagem | Confirmar |
| Voltar, limpar aparência, sair, encerrar carreira, escolher aposentar | Voltar |
| Escolher um foco de treino | Atributo subiu |
| Ganhar qualquer troféu ou prêmio (uma vez por lote) | Troféu |
| Abrir o resumo | Revelação de carta |
| Confirmar identidade, iniciar desafio | Apito |

Requisito: o cue de troféu toca **uma vez por lote**, no momento em que o lote é
montado, e não por aviso individual. Avisos expiram em tempos diferentes, e um
efeito atrelado ao aviso do topo da fila tocava o som de novo a cada aviso que
envelhecia, cerca de uma vez a cada 700 ms. Uma tríplice coroa soava como o cue
gaguejando três vezes em vez de tocar uma.

---

## 46. Comemorações de conquista

### 46.1 Regras

- Aparecem no **mesmo trilho de notificação** que a revelação de resultado, no
  canto superior direito, e nunca por cima dela.
- Nunca bloqueiam nada. Não existe "toque para continuar".
- Clicar apenas **apressa** a saída.
- Ao ver uma carreira pela primeira vez (inclusive ao recarregar a página), tudo
  que já está nela conta como **já visto**. Isso impede que um F5 reproduza cada
  troféu da carreira inteira como se fosse novo.
- A fila é **substituída**, não acrescentada. Clicar através das decisões mais
  rápido do que os avisos expiram criava um acúmulo, e um jogador três
  temporadas à frente ainda estava sendo avisado de uma copa ganha antes da
  última transferência. O que acabou de acontecer é a única coisa que vale
  anunciar.

### 46.2 Duas formas

| Situação | Forma |
|---|---|
| Exatamente uma conquista | Cartão único: medalha de 44 px, sobrelinha, nome, idade |
| Duas ou mais | Cartão único de "fartura": até **4** medalhas lado a lado, "+N" para o resto, contagem, todos os nomes juntos, idade |

Requisito: uma leva é **um evento**, portanto **um cartão**. Antes eram cartões
separados com temporizadores escalonados, então uma tríplice coroa punha quatro
cartões na tela e depois embaralhava os restantes para cima a cada 700 ms
conforme cada um expirava. O movimento fazia um bom momento ler como uma falha.

### 46.3 Tempos

| Parâmetro | Valor |
|---|---|
| Vida de um cartão único | 4200 ms |
| Vida extra de uma leva | +1600 ms |
| Desvanecimento | Começa 350 ms antes do fim |
| Máximo de medalhas visíveis | 4 |

### 46.4 Categorias

| Categoria | Sobrelinha |
|---|---|
| Troféu | "Título conquistado" |
| Prêmio | "Prêmio conquistado" |
| Convocação | "Primeira convocação" |

---

## 47. Tela de carreira: leiaute e estados

### 47.1 Estrutura

```
┌──────────────────────────────────────────────────────────┐
│ [trilho de notificações, fixo, canto superior direito]   │
├──────────────────────────────────────────────────────────┤
│ CARTA │ PAINEL DE INFO │      TABELA DE TEMPORADAS       │  ← altura = altura da carta
├──────────────────────────────────────────────────────────┤
│                                    │                     │
│  HUD do desafio (se houver)        │                     │
│  CAPA DO JORNAL (se houver)        │   VITRINE           │
│  PAINEL DE DECISÃO                 │   DE TROFÉUS        │
│                                    │                     │
├──────────────────────────────────────────────────────────┤
│         RODAPÉ DA SELEÇÃO (fixo na base)                 │
└──────────────────────────────────────────────────────────┘
```

Requisito estrutural: **a linha de cima tem exatamente a altura da carta e nem
um pixel a mais.** O painel de info e a vitrine antes se dimensionavam
livremente, então um save decorado empurrava esse bloco para baixo e espremia a
decisão logo abaixo numa fatia rolável. Prendendo a linha à altura da própria
carta, o espaço abaixo é constante da primeira à última temporada, e a decisão
nunca precisa rolar.

### 47.2 Janela baixa

Abaixo de **860 px de altura** de viewport, a carta cede um tamanho (de `sm`
para `xs`), e o painel ao lado dela aperta na mesma medida. Isso vale 57 pixels,
que num laptop de 1280×800 são a diferença entre ler uma decisão e rolar atrás
dela.

No modo compacto:

- O rastreador de rival colapsa para uma linha só, mantendo o placar (que é o
  que a rivalidade é lida) e mandando nome e estado para a dica de ferramenta.
- Todas as linhas do painel perdem metade do preenchimento vertical.

### 47.3 Painel de informação

Uma faixa de blocos estatísticos e quatro ou cinco leituras de uma linha,
distribuídas com espaço igual (e não empilhadas no topo), para que o painel leia
como um bloco preenchido, tenha ou não a carreira arranjado um rival.

**Blocos estatísticos**

| Bloco | Sempre | Condição |
|---|---|---|
| Idade | Sim | |
| Valor de mercado | Sim | |
| Jogos | Sim | |
| Gols **ou** jogos sem sofrer | Sim | Jogos sem sofrer se for goleiro |
| Jogos sem sofrer | Não | Só se for defensor (então são **5** blocos) |

Com cinco blocos na largura de quatro, o texto das leituras encolhe um degrau;
sem isso um valor de mercado de 12,5 milhões era cortado para "€12...".

Cada bloco tem uma dica de ferramenta em linguagem simples, porque de resto eles
são apenas números nus.

**Leituras**

| Leitura | Conteúdo |
|---|---|
| Talento | Veredito do olheiro, colorido pela faixa reportada |
| Perfil | Traço de personalidade, com descrição na dica |
| Torcida | Faixa em palavras + barra colorida; a dica traz o briefing |
| Rival | Só se houver rival |

### 47.4 Tabela de temporadas

Uma linha **por período**, não por temporada, com colunas de largura fixa em
pixels.

| Coluna | Largura | Conteúdo |
|---|---|---|
| Idade | 48 px | Idade inicial do período |
| Clube | flexível | Escudo, nome, tarjas, ícones de honra |
| OVR | 48 px | OVR ao fim do período |
| Jogos | 48 px | Soma do período |
| Gols / jogos sem sofrer | 48 px | Conforme a posição |
| Assistências / gols sofridos | 48 px | Conforme a posição |
| Jogos sem sofrer | 48 px | Só para defensores |

Requisito: largura fixa e leiaute de tabela fixo. Com dimensionamento
automático, a tabela ficava alguns pixels mais larga que a caixa, e uma barra de
rolagem horizontal aparecia. A correção antiga cortava os últimos pixels do nome
do clube para esconder o transbordo; a correta é **remover o transbordo**, para
que nada seja cortado.

**Estados de linha**

| Estado | Aparência |
|---|---|
| Concluído | Tudo preenchido |
| Pendente | "?" em negrito, texto em itálico dizendo o que a decisão está esperando, e o OVR atual |
| Travado | Linha vazia com 40% de opacidade |

O texto de espera muda conforme o tipo de decisão: "Escolhendo clube...",
"Decisão de carreira", "Escolhendo foco de treino". Antes, um foco de treino
aparecia rotulado como se o jogador estivesse escolhendo time.

**Tarjas de clube**

| Tarja | Aparência |
|---|---|
| Suspenso | Retângulo vermelho sólido, texto branco |
| Empréstimo | Símbolo ⇄ neutro |
| Acesso | ▲ verde |
| Traidor | Retângulo vermelho translúcido |
| Rebaixamento | Palavra em vermelho |

Contusões leves **não** têm tarja aqui (ver 20.4).

**Auto-rolagem**: a linha da temporada atual é mantida à vista, ancorada perto do
**fundo** da caixa e não no centro. Centrar enchia o resto da vista com
temporadas futuras travadas e em branco. Ancorar embaixo enche o espaço acima
com as temporadas de fato jogadas, que é o sentido de uma tabela de histórico. A
âncora é recalculada quando a temporada muda **e** quando a caixa é
redimensionada.

### 47.5 Rodapé da seleção

Barra fixa na base, com:

- Bandeira do país num círculo. **Esmaecida e em escala de cinza** enquanto não
  houver nenhuma convocação.
- Nome do país e o rótulo "Seleção", com os dois ícones de campo e gol.
- Jogos, e depois gols + assistências (ou jogos sem sofrer + gols sofridos, para
  goleiro).

Uma seleção é a sua bandeira, sem escudo de federação ao lado: a bandeira já é a
identidade mais forte e mais reconhecível que um país tem.

### 47.6 Trilho de notificações

Um único trilho fixo, inerte (não recebe cliques; só os cartões dentro dele
recebem), no canto superior direito em telas largas e centralizado no topo em
telas estreitas. Contém a revelação de resultado e as comemorações, nessa ordem.

Antes eram duas camadas fixas independentes no mesmo nível de empilhamento, e um
aviso de troféu caía exatamente em cima do resultado da decisão que o ganhou.

### 47.7 Abaixo do ponto de corte largo

- A coluna da direita (vitrine) é **escondida**, não empilhada. Um telefone não
  consegue mostrar as duas colunas sem a página passar de uma tela, e entre as
  duas é a decisão que precisa estar lá.
- A tabela de temporadas também é escondida.
- A casca inteira passa a rolar.

---

## 48. Persistência, validação e recuperação

### 48.1 O que é salvo

| Campo | Salvo |
|---|---|
| Rascunho de identidade (sobrenome, pé, país, posição, aparência) | Sempre |
| Preferências (som, volume, modo, dificuldade, tema) | Sempre |
| A carreira em andamento | Só nas telas de carreira e resumo |
| Tela atual | Só "carreira" ou "resumo"; qualquer outra é salva como "início" |
| Vínculo com desafio | Só junto com a carreira |

Requisito: recarregar a página, ou fechar e reabrir o navegador, precisa
**retomar a carreira exatamente onde estava**. As telas de identidade e
aparência estão a um formulário de distância de um começo do zero, e
re-persisti-las significaria um campo de nome meio preenchido sobrevivendo à
aba que o digitou.

### 48.2 Validação estrutural de um save

O armazenamento local é gravável pelo usuário e sobrevive a atualizações. Um
save pode chegar editado à mão, truncado ou escrito por uma versão antiga.
Qualquer coisa que passe pela validação é confiada integralmente e entregue à
simulação e às telas, então a validação precisa cobrir **todo campo que essas
telas leem sem fallback**. Um save aceito que depois estoura é o pior resultado
possível, porque ele é recarregado a cada visita e o jogador precisa achar o
botão de recuperação para escapar.

Checagens obrigatórias:

| Campo | Regra |
|---|---|
| Semente | Texto não vazio |
| Fase | "carreira" ou "resumo" |
| Identidade | Objeto presente |
| Modo | "longo" ou "normal" |
| Dificuldade | "normal" ou "difícil" |
| Estado do gerador | Semente textual e estado numérico finito |
| Jogador | Idade e OVR finitos, posição conhecida, papel conhecido |
| Atributos | **Cada atributo que a carta daquela posição imprime** precisa ser um número finito, ou o cálculo de OVR produz NaN e a carta inteira sai em branco |
| Nacionalidade | Precisa resolver contra o conjunto de países atual |
| Temporadas | Array; cada uma com estatísticas, jogos finitos, arrays de títulos e prêmios |
| Manchetes | Array |
| Estatísticas de seleção | Objeto |
| Correções de divisão | Objeto |
| Correções de reputação | Objeto |
| Plano de eventos | Objeto |
| Decisão atual | Se a fase for "carreira", precisa existir e ter ao menos uma opção |

Campos opcionais adicionados depois (clubes traídos, memória de torcida) são
lidos defensivamente no uso e **deliberadamente não exigidos**, para que um save
antigo ainda retome.

### 48.3 Saneamento do avatar

O avatar é a coisa mais profunda que sobrevive a um recarregamento, e cada campo
de estilo é uma chave de busca numa tabela. Uma única chave desconhecida (de uma
versão antiga, de um estilo removido, ou de um armazenamento editado) estourava
dentro do desenho e derrubava a **primeira tela**, sem volta a não ser apagando
os dados.

Regra: qualquer valor que não bata com as listas atuais cai para o padrão
daquele campo. Um avatar obsoleto degrada para um rosto plausível em vez de
quebrar.

### 48.4 Saneamento do rascunho

- Sobrenome cortado em 16 caracteres.
- Pé que não for "esquerdo" nem "direito" vira "direito".
- País que não resolve vira nulo.
- Posição que não existe mais vira nula.
- Avatar passa pelo saneamento acima.

### 48.5 Saneamento da tela

Uma tela só faz sentido junto do estado que ela mostra. "Carreira" e "resumo"
precisam de um objeto de carreira; se a carreira falhou na validação, ou se o
valor da tela for desconhecido, cai para "início" em vez de renderizar uma tela
sem nada atrás.

### 48.6 Versionamento e migração

- O save carrega um número de versão.
- Versão 1 → 2: a carreira em andamento passou a ser persistida. Um save antigo
  simplesmente não tem a chave, o que já é tratado como "sem carreira em
  andamento".
- Qualquer coisa anterior à versão 1 é **descartada**: só preferências e um
  rascunho inacabado viviam ali, e um rascunho novo custa uma tela ao jogador.

### 48.7 Recuperação de erro

A página de erro de execução oferece dois botões:

1. **Tentar de novo**: apenas remonta a árvore.
2. **Limpar dados e recarregar**: remove **somente** o save persistido e
   recarrega. Nada mais na página tem estado que sobreviva a um recarregamento.
   A remoção é protegida contra armazenamento indisponível (modo privado,
   cookies bloqueados), porque recarregar ainda vale a pena.

---

## 49. Idiomas

Três idiomas: **português (padrão)**, espanhol e inglês.

### 49.1 Regras

- A tradução é por caminho pontuado, com interpolação de `{marcadores}`.
- Se a chave faltar no idioma atual, cai para o **espanhol**; se faltar lá
  também, imprime o próprio caminho da chave (um branco silencioso esconde
  bugs).
- Nomes de país vêm do próprio registro do país, em três campos separados.
- Alguns textos vivem fora do pacote de tradução por serem copy própria do
  produto: a chamada da tela inicial, os textos do editor de aparência, e os
  textos do sistema de treino.
- A biografia tem as suas quatro redações por tópico **em cada idioma**, não
  traduzidas de um original.
- A troca de idioma é imediata e não recarrega nada.

### 49.2 Ramos do pacote

| Ramo | Aproximadamente |
|---|---|
| Introdução | 12 chaves |
| Identidade | 23 |
| Carreira | 180 |
| Eventos de carreira | 40 |
| Posições (siglas) | 12 |
| Posições (nomes longos) | 12 |
| Troféus | 13 |
| Prêmios | 3 |
| Manchetes | 12 |
| Desafio | 38 |
| Ajustes | 9 |
| Navegação | 10 |
| Capa de jornal | 10 |
| Atributos | 12 |

### 49.3 Regra editorial obrigatória

**Nenhum travessão em nenhuma frase do jogo.** A regra vale para todo texto que
o jogador lê, em qualquer idioma. Quando um travessão é removido, ele precisa
ser **substituído** por pontuação equivalente (vírgula, dois-pontos, ponto,
parênteses) e nunca simplesmente apagado, ou a frase vira um amontoado sem
pausa.

---

## 50. Acessibilidade

| Requisito | Implementação |
|---|---|
| Cor nunca sozinha | Todo par bom/ruim carrega também um glifo: ▲ ▼ • ✓ - ✕ |
| Barras de medidor | Papel de medidor com valor, mínimo, máximo e rótulo |
| Grupos de rádio | Papel de grupo de rádio com rótulo, e estado marcado por botão |
| Botões de alternância | Estado pressionado declarado |
| Diálogos | Papel de diálogo modal |
| Carrossel do jornal | Região com descrição de papel e navegação por seta esquerda/direita |
| Avisos | Região de status com anúncio educado |
| Imagens decorativas | Marcadas como ocultas para leitores de tela |
| Ícones sem texto | Sempre com rótulo acessível e dica de ferramenta |
| Movimento reduzido | Respeitado (ver 44.5) |
| Foco de teclado | Anel visível no deslizador de volume e nos marcadores de posição |
| Números nus | Toda estatística de painel tem dica em linguagem simples |

---

## 51. Páginas de erro

Quatro páginas, desenhadas como um conjunto: mesma casca, mesma espessura de
traço na ilustração, mesmo vocabulário futebolístico.

| Código | Tom | Sobrelinha | Ilustração | Ação |
|---|---|---|---|---|
| 404 | Dourado | "Bola fora" | Bola passando pela linha lateral | Voltar ao início |
| 403 | Vermelho | "Cartão vermelho" | Cartão vermelho erguido | Voltar ao início |
| 500 | Vermelho | "Jogador no chão" | Maca e jogador caído | Tentar de novo + Limpar dados |
| 503 | Neutro | "Gramado em manutenção" | Campo sendo replantado | Tentar de novo |

Anatomia comum: brilho radial na cor do tom, listras de gramado em 40% de
opacidade, ilustração, sobrelinha em caixa alta espaçada, **código em 86 px**,
régua de 64 px, título e descrição.

Requisitos:

- 403 e 503 são rotas reais, para que o servidor consiga apontar as próprias
  páginas de erro para algo que pareça o jogo. O jogo nunca as gera sozinho:
  não há conta e não há dado no servidor.
- A página 500 de tempo de execução é interativa e precisa avisar que **a
  carreira continua salva**, senão o jogador acha que perdeu tudo.
- Existe ainda uma quinta página, para quando a própria casca da aplicação
  falha. Ela traz o próprio documento HTML, sem provedores, sem barra superior e
  sem componentes compartilhados, porque a falha pode estar justamente em um
  deles.

---

## 52. Ferramentas de desenvolvimento

### 52.1 Painel de depuração

Visível apenas fora de produção (ou com uma variável de ambiente explícita), e
apenas quando há uma carreira. Fica no canto inferior esquerdo, recolhido por
padrão.

| Ferramenta | Deltas oferecidos |
|---|---|
| OVR | -15, -5, +5, +15 |
| Torcida | -20, -5, +5, +20 |
| Traço de personalidade | Seleção entre os seis |
| Faixa de talento | Seleção entre as cinco |
| Forçar evento de carreira | Seleção entre os 40 |
| Forçar transferência | Botão |
| Pular decisão | Botão |
| Forçar rival | Botão |

Requisito de segurança: a barreira **não pode ser só o painel**. As próprias
ações continuam no pacote e poderiam ser chamadas diretamente, então a
verificação é repetida dentro de cada mutador.

Requisito: nenhuma dessas ferramentas toca no gerador aleatório nem no
orçamento de eventos de carreira, de forma que usá-las não corrompa uma
partida real.

### 52.2 Folhas de contato

Existem páginas internas de revisão visual, fora do jogo, que mostram toda a
arte gerada nos tamanhos em que ela é de fato usada, sobre fundo claro e escuro:

- Escudos de clube.
- Troféus.
- Escudos de liga (aos **10, 14, 28 e 96 px**, com a arte enviada ao lado da
  gerada, para todas as ligas).
- Estilos de cabelo.
- Exportação da imagem de compartilhamento.

Requisito declarado: um escudo que funciona a 96 px e vira mingau a 10 não serve,
e 10 é o tamanho em que ele mais vive.

---

## 53. Invariantes

Regras que precisam valer em qualquer implementação. Cada uma já foi quebrada em
algum momento e o efeito está registrado.

1. **O OVR nunca é decidido primeiro.** Ele é sempre lido dos atributos.
2. **Nunca existe teto rígido** em contagem de prêmios, títulos, recordes,
   estatísticas ou atributos. Raridade vem só de odds afinando.
3. **Atributos fora da posição têm peso zero** no OVR. Toda versão dessa tabela
   que taxava a carta pelos atributos que a posição não usa errava na mesma
   direção, e errava mais para quem tinha a carta mais desequilibrada.
4. **Cada linha de pesos de OVR precisa somar exatamente 1.** Uma linha somando
   0,98 custava silenciosamente cerca de 1,7 ponto a todos os pontas.
5. **O freio de crescimento é multiplicativo, nunca um limite de distância.**
6. **Um delta de OVR sempre respeita o teto de cada atributo.**
7. **O instantâneo de uma temporada registra o estado do fim daquela temporada.**
8. **O portão de raridade é aplicado à taxa por jogo**, nunca ao total.
9. **A contusão é descontada antes de derivar produção.**
10. **Uma temporada suspensa não ganha nada.**
11. **A confederação usada para julgar a importância de um título é a do clube**,
    não a do passaporte.
12. **O veredito de olheiro é colorido pela faixa reportada**, nunca pela real.
13. **A liga exibida é sempre a divisão atual**, honrando acesso e rebaixamento.
14. **Toda decisão em andamento precisa existir e ter pelo menos uma opção**,
    ou nenhuma tela consegue renderizar.
15. **Toda arte tem um fallback gerado.** Nenhum clube, liga, troféu ou prêmio
    pode ficar sem imagem.
16. **Identificadores de clube são globalmente únicos.**
17. **Nenhuma imagem externa entra na exportação de compartilhamento.**
18. **Nenhum travessão em texto de jogador.**
19. **Cores nunca são o único sinal.**
20. **Um save que passa na validação nunca pode estourar depois.**
21. **A mesma semente com as mesmas decisões produz a mesma carreira.**
22. **A mão do Desafio do Dia nunca pode ser impossível**: três eixos, uma
    posição compatível, nenhuma contradição, e um édito que não mate nenhum
    briefing.
23. **A soma da decadência de crepúsculo é julgada pela carta, não pela idade.**
24. **O ranking do desafio é do dia**, e zera todo dia.
25. **Uma carreira sempre termina**; nenhuma cadeia de decisões pode ficar presa.

---

## 54. Conjuntos de teste sugeridos

Os números deste documento são verificáveis. Uma implementação fiel deve
reproduzir, com carreiras simuladas em lote:

| Verificação | Alvo |
|---|---|
| Invariantes estruturais em 300 carreiras | Zero violações |
| Saves aceitos após validação | 100% renderizam sem erro |
| Frases repetidas em 900 biografias | 0% |
| Contradições em mãos de desafio | Zero |
| Briefings alcançáveis por posição | 100% |
| Falhas da garantia de treino | Zero |
| Cartas por posição contra cartas reais | Erro médio abaixo de 1 ponto |
| Recorde de Bola de Ouro em carreiras geracionais | 6% a 10% |
| Quatro Bolas de Ouro seguidas | 5% a 8% |
| Recorde de Chuteira de Ouro em geracionais na Europa | 12% a 15% |
| Distribuição de talento no difícil | ~45/34/15/4/1 |
| Pico médio de uma carreira mediana | Perto do potencial sorteado, nunca acima dele por mais de 4 pontos num único atributo |

---

*Fim do documento.*
