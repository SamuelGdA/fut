# Análise de monetização por anúncios do Futeiro

Estudo de 21/11/2026 (decisão D134). Objetivo: decidir onde e como o Futeiro
mostra anúncios para tirar a maior receita possível **sem** estragar o jogo, e
deixar esses lugares visíveis no site como moldura de prévia. Nada aqui liga
rede de anúncio real: nenhum script novo, nenhuma tag, nenhum rastreio. A
integração de verdade é uma fase posterior (seção 10).

---

## 0. Resumo executivo

- **O Futeiro não é um blog.** É um jogo de sessão longa numa página só (SPA):
  a pessoa passa 10 a 40 minutos sem recarregar. Em blog, a receita vem de
  muitas páginas vistas; aqui ela vem de **poucas posições com visibilidade
  altíssima por muito tempo**, e de trocas de tela que contam como "página nova"
  de verdade (o conteúdo muda inteiro).
- **O laço da carreira é sagrado** (D23: decisão, lance e jornal cabem numa tela
  sem rolar). Nenhum anúncio entra nele, nem no celular. No PC, só os
  **trilhos laterais** que moram fora das três colunas e só aparecem quando a
  margem comporta o anúncio inteiro com folga (a partir de 1660 px).
- **A receita mora nas telas de pausa e de exploração:** o resumo da carreira
  (tela mais longa, mais lida e mais compartilhada), o Desafio do dia (volta
  todo dia), as conquistas, o perfil e o hall. São as pausas cognitivas
  naturais: a carreira acabou, a pessoa está lendo, não decidindo.
- **Formatos escolhidos:** trilhos 160×600 e 300×600 (PC largo), 728×90
  in-content entre capítulos (PC e tablet), 300×250 in-content (celular e
  coluna lateral do Desafio), âncora fixa 320×50 no pé (celular, só em telas de
  leitura), 320×100 no hub do celular, e o anúncio recompensado do sorteio de
  clubes (já existe desde a D118, agora com a moldura 300×250).
- **Densidade:** no celular, no máximo uma unidade no meio do conteúdo por tela
  visível mais a âncora de 50 px; no PC, trilhos mais uma unidade no conteúdo.
  Sempre abaixo dos 30% do Better Ads Standards.
- **CLS = 0:** todo espaço reserva a altura exata do formato antes de o anúncio
  existir; trilhos e âncora são fixos (não empurram nada); a página ganha
  `padding-bottom` igual à âncora.
- **Futuro recomendado** (não implementado agora): intersticial de transição
  entre carreiras pela H5 Games Ads (o produto do Google feito para jogos de
  navegador), recompensado opcional em mais um ponto que não dê vantagem, e
  Ad Manager com refresh por tempo só quando houver volume.

---

## 1. O Futeiro do ponto de vista de anúncio

### 1.1 Como o jogo é usado

| Característica | O que significa para anúncio |
|---|---|
| SPA (React, Vite), uma página só, sem recarregar | Anúncio não se renova sozinho ao "mudar de página": precisa ser redesenhado quando a tela muda (nova tela = conteúdo novo). |
| Sessão longa (carreira inteira em 10 a 40 min) | Um espaço fixo e sempre visível acumula muito tempo de exibição. Trilhos e âncora rendem por tempo, não por clique. |
| Laço que cabe numa tela (D23) | Não existe rolagem no laço: não há "entre parágrafos" onde encaixar um anúncio. Só as margens. |
| Resumo longo (6 a 7 mil px no PC) | A melhor tela para in-content: muita leitura, rolagem natural, pausa. |
| Desafio do dia (D96, D125) | Volta diária garantida: impressões recorrentes, público fiel. |
| Público pt, es, en (Brasil e América Latina em maioria) | CPM menor que em tráfego de língua inglesa de EUA e Europa; compensa com volume e visibilidade, não com densidade. |
| PWA instalável, funciona sem internet | Sem internet não há anúncio: os espaços somem (nada de buraco). |
| Consentimento (D113) | Nada de rede de anúncio antes de "Aceitar todos". Na Europa, o AdSense exige uma CMP certificada. |

### 1.2 O que já existia antes deste estudo

- **D113:** quatro espaços genéricos (`perfil`, `resumo`, `conquistas`,
  `carreira`), dormentes: sem `VITE_ADSENSE_CLIENT`, não desenhavam nada em
  produção. Em desenvolvimento, uma moldura tracejada sem tamanho definido.
- **D118:** dois arranha-céus 160×600 nas margens da carreira, só a partir de
  1660 px, e o "intervalo comercial" de exemplo (1 s) antes do sorteio de
  clubes, lugar previsto para um anúncio recompensado.
- **CSP** já libera os domínios do AdSense e do Analytics; o aviso de cookies só
  aparece quando o build tem rastreador.

Este estudo reorganiza esses espaços num **registro central com tamanho IAB
exato**, acrescenta os que faltavam e cria a prévia visual.

---

## 2. Como funciona a monetização de jogos web

### 2.1 Site de conteúdo × jogo SPA de sessão longa

| | Blog / portal | Jogo web SPA (Futeiro) |
|---|---|---|
| Unidade de receita | página vista (cada clique recarrega e pede anúncios novos) | sessão (uma página, muitos minutos) |
| Alavanca principal | mais páginas por visita, mais espaços por página | **visibilidade por tempo** e trocas de tela significativas |
| Onde o olho está | no texto, rolando | no jogo; o olho só "sai" nas pausas |
| Risco típico | poluição, CLS ao carregar | clique acidental em controles, anúncio no meio da ação, bloqueio do laço |
| Métrica que manda | RPM de página | **RPM de sessão** (receita por mil sessões) e tempo visível por impressão |

Num SPA, se o jogo não trocar o anúncio, a pessoa passa 20 minutos vendo uma
única impressão. Há dois caminhos legítimos para gerar mais impressões:

1. **Redesenhar o espaço quando a tela muda de verdade** (do jogo para o resumo,
   do resumo para o hall). É uma página virtual nova com conteúdo novo: é como o
   jogo já mede páginas no Analytics (`trackScreen`, D113). O espaço de cada tela
   é um componente próprio, então isso acontece naturalmente.
2. **Refresh por tempo**, só no Google Ad Manager (não no AdSense), com regras:
   o espaço está visível, a aba está ativa, passou um intervalo mínimo (o
   mercado usa 30 a 60 s) e o refresh é declarado ao comprador. Bem feito, é
   onde jogos de sessão longa ganham mais. O AdSense **não permite** recarregar
   anúncio por tempo nem sem ação do usuário; fazer isso na mão é motivo de
   suspensão.

### 2.2 As métricas que realmente importam

- **eCPM:** receita por mil impressões. Depende do formato, do país, da
  categoria e, muito, da visibilidade (compradores pagam mais por impressão que
  costuma ser vista).
- **RPM:** receita por mil páginas vistas (ou por mil sessões, no nosso caso). É
  a métrica de negócio: junta eCPM, número de espaços e preenchimento.
- **Visibilidade (viewability):** padrão MRC/IAB: 50% dos pixels na tela por 1 s
  contínuo (para formatos grandes, a partir de 242.500 px², 30% dos pixels).
  Trilhos fixos e âncora ficam acima de 90%; um 728×90 no fim de uma página
  longa fica abaixo de 40%. Visibilidade alta sobe o eCPM e o preenchimento.
- **Active View / tempo ativo:** quanto tempo a impressão ficou visível com a
  aba em foco. Em jogo de sessão longa, é o que justifica refresh (quando houver
  Ad Manager) e o que valoriza os trilhos.
- **Preenchimento (fill rate):** fração dos pedidos que voltam com anúncio.
  Formatos comuns (300×250, 728×90, 320×50, 160×600, 300×600) enchem mais;
  formatos raros enchem menos. Por isso o estudo só usa tamanhos IAB padrão.
- **CTR saudável:** em display, algo entre 0,1% e 1%. CTR muito alto num jogo é
  sinal de **clique acidental** (anúncio perto de botão, anúncio que aparece
  embaixo do dedo). O Google desconta esse tráfego como inválido, devolve o
  dinheiro ao anunciante e pode suspender a conta. Clique acidental dá
  prejuízo, não lucro.
- **CLS (Cumulative Layout Shift):** anúncio que carrega e empurra o conteúdo
  piora o Core Web Vitals, irrita e gera clique errado (o botão pula, o dedo cai
  no anúncio). A meta aqui é **CLS 0** vindo de anúncio.

### 2.3 Formatos IAB e o que rende

| Formato | Uso | Por que |
|---|---|---|
| 300×250 (retângulo médio) | in-content no celular, coluna lateral no PC | O formato com mais demanda do mercado; enche quase sempre. |
| 336×280 (retângulo grande) | não usado | Pede 368 px de largura com margens: não cabe em 360 px. |
| 728×90 (leaderboard) | in-content no PC e tablet | Boa demanda, baixo impacto visual numa faixa entre capítulos. |
| 970×90 / 970×250 | não usado agora | O conteúdo do resumo tem 896 px: não cabe sem alargar a página. |
| 160×600 (arranha-céu) | trilhos no PC largo | Fixo na margem, visível o tempo todo, sem tocar no conteúdo. |
| 300×600 (meia página) | trilhos no PC muito largo | Um dos eCPMs mais altos de display; só onde sobra margem de verdade. |
| 320×50 (âncora) | pé da tela no celular | Visibilidade perto de 100%; eCPM menor, mas constante. |
| 320×100 (banner grande) | hub no celular | O dobro de área do 320×50 com quase o mesmo encaixe. |

### 2.4 Better Ads Standards e políticas que mudam o desenho

A Coalition for Better Ads lista as experiências que o Chrome pode bloquear:

- **PC:** pop-up, vídeo com som automático, prestitial com contagem regressiva,
  anúncio fixo grande (mais de 30% da tela).
- **Celular:** pop-up, prestitial, **densidade acima de 30%** (soma da altura dos
  anúncios no conteúdo principal ÷ altura da página), animação piscando, vídeo
  com som, postitial com contagem, scrollover em tela cheia, anúncio fixo grande
  (mais de 30% da tela).

O que isso muda aqui: a âncora do celular tem 50 px (6% de uma tela de 812 px),
nunca um 320×100 fixo; nada aparece por cima do jogo sozinho; o intersticial
futuro só em transição, sem contagem forçada, e pelo produto do Google que já
segue essas regras.

Políticas do Google (AdSense/Ad Manager) que pesam no posicionamento:

- **Anúncio longe de controles.** Não pode ficar colado em botões, abas, menus
  ou lugares onde se clica sem querer, nem em lugar que confunda com conteúdo do
  jogo. Aqui, nenhum espaço encosta em botão de ação: há sempre um respiro
  (margem do capítulo, coluna separada) e um rótulo.
- **Rótulo:** só "Publicidade" ou "Anúncios" (no AdSense, "Advertisements" ou
  "Sponsored Links" e traduções). O jogo usa "Publicidade".
- **Nada de incentivo a clicar** e nada de anúncio em tela sem conteúdo
  (tela de carregamento, erro, página vazia).
- **Recompensado** só com escolha explícita da pessoa e recompensa clara (é o
  caso do sorteio de clubes, D118).

### 2.5 Que formatos fazem sentido para este jogo

| Formato | Agora (prévia) | Por quê |
|---|---|---|
| Display fixo in-content | Sim, nas telas de leitura | Pausas naturais; não toca no laço. |
| Trilhos laterais (PC largo) | Sim | Receita por tempo numa sessão longa; zero impacto no conteúdo. |
| Âncora no pé (celular) | Sim, só em telas de leitura | Visibilidade máxima com 50 px; nunca no laço, na criação ou no login. |
| Recompensado opcional | Sim, o do sorteio de clubes (já existia) | Troca justa: variedade de propostas sem vantagem (D118). |
| Intersticial de transição | **Futuro** | Bom entre carreiras (fim de carreira → resumo, "Jogar de novo"), com limite de frequência. Exige H5 Games Ads. |
| Refresh por tempo | **Futuro** | Só com Ad Manager e volume. |
| Vídeo in-stream / outstream | Não recomendado | Pesado, chama atenção demais, pede player; não combina com um jogo de leitura e decisão. |

---

## 3. Equilíbrio: receita máxima sem destruir o visual

### 3.1 Princípios de desenho

1. **O anúncio mora no "fora" do jogo:** margens, faixas entre capítulos,
   colunas de apoio. Nunca dentro de um cartão, de uma lista de opções ou de um
   painel do laço.
2. **Mesma linguagem visual:** o espaço usa os tokens do tema (painel, linha,
   texto apagado), raio de borda e respiro iguais aos dos painéis do jogo. Um
   anúncio real dentro de um quadro bem acabado parece parte de um produto
   cuidado; o mesmo anúncio solto parece site barato.
3. **Tamanho fixo e conhecido:** cada espaço tem o tamanho IAB exato, centrado,
   com o rótulo "Publicidade". Nada de bloco "responsivo" que estica e muda de
   altura.
4. **Uma coisa por vez:** no celular, uma unidade no conteúdo por tela visível,
   mais a âncora. No PC, os trilhos (fora do conteúdo) e uma unidade no
   conteúdo.
5. **Some quando não cabe.** Trilho que espremeria o jogo não aparece. Espaço
   sem anúncio (sem preenchimento, sem consentimento, sem internet) não vira
   buraco em produção.

### 3.2 Onde o olho descansa × áreas sagradas

**Pausas naturais (bons lugares):**

- Fim de carreira: o resumo inteiro, entre capítulos (Números → Troféus,
  Linha do tempo → Jornal).
- Desafio do dia, antes de jogar e depois: a coluna do ranking e das tentativas.
- Conquistas, perfil e hall: telas de coleção, leitura sem pressa.
- Hub: depois dos dois cartões (a escolha já foi vista).
- Margens largas do PC: o olho não está lá, mas o anúncio fica visível o tempo
  todo (visibilidade conta, não atenção).

**Áreas sagradas (nunca):**

- O laço da carreira: decisão, opções, "Confirmar escolha", lance, jornal, abas
  do celular (Temporada, Jogador, Histórico, Troféus).
- Qualquer lugar a menos de um respiro claro de um botão de ação primária
  ("Jogar", "Começar carreira", "Jogar o desafio", "Avançar", "Compartilhar").
- A barra fixa de "Voltar / Avançar" da criação de jogador no celular.
- O login e a criação de conta (conversão e senha: nada de distração).
- Telas de carregamento, de erro, a 404 e o laboratório.
- Modais e folhas (compartilhar, confirmar, ajustes), exceto o recompensado,
  que é escolha da pessoa.

### 3.3 Regra de densidade por tela visível

| Tela visível | Máximo | Exemplo do Futeiro |
|---|---|---|
| Celular (360 a 430 px de largura) | 1 unidade no conteúdo + âncora 320×50; soma abaixo de 30% da altura visível na maior parte da rolagem | Resumo: um 300×250 entre capítulos, âncora no pé |
| Tablet (768 a 1023 px) | 1 unidade 728×90 no conteúdo; sem âncora, sem trilhos | Resumo: 728×90 entre capítulos |
| Laptop (1024 a 1535 px) | 1 unidade no conteúdo; trilhos só onde a margem comporta | 1366 px: trilhos 160×600 no resumo (coluna de 896 px) e nos Termos; nenhum no hub, na criação e no desafio |
| PC largo (1536 px ou mais) | trilhos 160×600 ou 300×600 + 1 unidade no conteúdo; anúncios abaixo de 25% da área visível | 1920 px: trilhos 300×600 + 728×90 entre capítulos |

---

## 4. Tela por tela

| Tela | Anúncio? | O quê | Por quê |
|---|---|---|---|
| Hub | Sim | 728×90 / 320×100 abaixo dos cartões; trilhos no PC largo | Primeira tela, muitas visitas; o anúncio vem depois da escolha dos modos, sem disputar com "Jogar". |
| Quem é você (criação, também o Início do Craque) | Só trilhos (PC largo) | Nada no conteúdo | Formulário com botão de começar; no celular há barra fixa embaixo. |
| Aparência | Não | | Editor de personagem; toque e arrasto. |
| Carreira (laço) | Só trilhos a partir de 1660 px | 160×600 (ou 300×600 a partir de 1944 px) | D23: o laço cabe numa tela; anúncio só fora das colunas. |
| Sorteio de clubes | Sim, recompensado | 300×250 dentro do intervalo | Escolha da pessoa; troca justa (D118). |
| Resumo / carreira compartilhada | Sim | 2 in-content + trilhos + âncora no celular | A tela mais longa e mais lida; pausa total. |
| Desafio do dia | Sim | 300×250 na coluna do ranking; trilhos | Volta diária; a coluna lateral é leitura. |
| Hall | Sim (abre as conquistas) | o mesmo das conquistas | O hall antigo virou a tela de conquistas. |
| Conquistas | Sim | 728×90 / 300×250 no pé; trilhos; âncora | Coleção; já tinha espaço (D113). |
| Perfil | Só com conta | 728×90 / 300×250 no pé | Sem conta, o perfil é o login: nada. |
| Termos e Privacidade | Só trilhos | | O Google exige as páginas; anúncio no meio do texto legal soa mal. |
| Login / criar conta | Não | | Conversão e senha. |
| Técnico (jogo, identidade, aparência) | Não agora | | Modo "Em breve" no ar (D124). Quando abrir: trilhos como na carreira. |
| Legado do Técnico | Recomendação futura | in-content como no resumo | Mesmo papel do resumo do Craque. |
| 404, erro, carregamento, laboratório | Nunca | | Sem conteúdo (política) ou ferramenta interna. |

---

## 5. Matriz de espaços

Tamanhos em px (largura × altura). "Oculto" = não desenha nada naquela faixa.
O registro no código é `apps/game/src/features/ads/slots.ts`.

| Slot ID | Telas | PC (≥ 768 px) | Celular (< 768 px) | Função estratégica |
|---|---|---|---|---|
| `trilho-esquerdo`, `trilho-direito` | hub, quem é você, desafio, resumo, carreira compartilhada, conquistas (e o hall, que abre as conquistas), termos, privacidade | 300×600 quando a margem livre ≥ 348 px; 160×600 quando ≥ 208 px; senão oculto | Oculto | Receita por tempo numa sessão longa; zero impacto no conteúdo. |
| `carreira-trilho-esquerdo`, `carreira-trilho-direito` | carreira (laço) | 160×600 a partir de 1696 px; 300×600 a partir de 1976 px (conteúdo de 1280 px) | Oculto | O único anúncio possível durante o jogo, sem tocar nas três colunas (D118). |
| `hub-rodape` | hub | 728×90 | 320×100 | Primeira tela; depois da escolha do modo. |
| `resumo-numeros` | resumo, carreira compartilhada | 728×90 | 300×250 | Primeira pausa da leitura: depois dos números, antes dos troféus. Alta visibilidade. |
| `resumo-jornal` | resumo, carreira compartilhada | 728×90 | 300×250 | Segunda pausa: depois da linha do tempo, antes do jornal. |
| `desafio-ranking` | desafio do dia | 300×250 (coluna do ranking; some entre 1024 e 1279 px, onde a coluna tem 260 px) | 300×250 (depois das ranqueadas) | Público diário; a coluna é de leitura. |
| `conquistas-rodape` | conquistas (e o hall) | 728×90 | 300×250 | Fim da coleção (D113). |
| `perfil-rodape` | perfil, só com conta | 728×90 | 300×250 | Fim do perfil (D113). |
| `ancora-celular` | resumo, carreira compartilhada, conquistas (e o hall) | Oculto | 320×50 fixo no pé, depois de rolar 240 px | Visibilidade perto de 100% nas telas de leitura. |
| `sorteio-recompensado` | intervalo do sorteio de clubes | 300×250 | 300×250 | Recompensado opcional (D118). |

### 5.1 Por que cada um, em detalhe

- **Trilhos (`trilho-*`).** Ficam fixos na margem, centrados no espaço livre
  entre a borda da tela e o conteúdo, logo abaixo da barra do topo. Aparecem só
  se a margem livre de cada lado couber o anúncio mais 24 px de folga de cada
  lado (o que já cobre a barra de rolagem). Como são fixos, **não empurram
  nada** (CLS 0) e nunca espremem o jogo. O 300×600 rende bem mais que o 160×600;
  por isso o trilho sobe de formato quando há margem. Precisa também de altura:
  a tela tem de caber a barra do topo, 600 px e uma folga, senão some.
- **Trilhos da carreira.** Mesma lógica, mas medidos contra as três colunas de
  1280 px e posicionados abaixo do cabeçalho do jogador. É o anúncio que fica
  mais tempo visível no jogo inteiro.
- **`hub-rodape`.** No PC, a faixa de 728×90 cabe embaixo dos cartões sem rolar
  em 1366 × 768. No celular, o 320×100 entra depois do segundo cartão, onde a
  pessoa já viu as duas opções.
- **`resumo-numeros` e `resumo-jornal`.** O resumo é a melhor página do jogo
  para anúncio: longa, lida com calma, aberta também por quem recebe o link de
  "Copiar carreira". Dois espaços em mais de 6 mil px de página dão densidade
  baixa (menos de 10% no celular). No PC, 728×90 cabe na coluna de 896 px; no
  celular, 300×250 (o formato com mais demanda) cabe em 360 px com as margens.
  O espaço do fim da página que existia (D113) saiu: no fim de uma página longa,
  quase ninguém chega a ver.
- **`desafio-ranking`.** No PC, a coluna da direita (ranking, tentativas) tem
  300 px: o retângulo entra ali, longe do botão "Jogar o desafio" (que fica no
  topo da coluna, com o ranking e as tentativas no meio). No celular, vai depois
  das ranqueadas, no fim da tela, depois do botão e do ranking.
- **`conquistas-rodape`, `perfil-rodape`.** Telas de coleção; uma unidade
  cada, onde a leitura termina. O perfil de quem não tem conta é a tela de
  login: lá não há anúncio nenhum (nem trilho, nem âncora).
- **`ancora-celular`.** 320×50 colado no pé, acima da área segura do aparelho
  (`env(safe-area-inset-bottom)`), com a página ganhando o mesmo espaço embaixo
  para nada ficar escondido. Só entra depois que a pessoa rola 240 px: no
  primeiro olhar ela cobriria o "Compartilhar" do topo do resumo. Só em telas de leitura, nunca onde já existe barra
  fixa embaixo (abas da carreira, "Voltar / Avançar" da criação). Fica abaixo de
  modais, folhas, avisos e do aviso de cookies (que sobe para ficar por cima
  dela).
- **`sorteio-recompensado`.** Já existia como intervalo de exemplo de 1 s. A
  moldura 300×250 mostra onde o anúncio recompensado de verdade vai aparecer.

---

## 6. Comportamento por resolução

Larguras do conteúdo medidas no PC: hub 1216 px; quem é você e desafio
1312 px; coluna do resumo 896 px; conquistas 1152 px; Termos e Privacidade
736 px; carreira 1280 px (três colunas).

| Largura × altura | Hub | Quem é você / Desafio | Resumo | Conquistas | Termos | Carreira | In-content | Âncora |
|---|---|---|---|---|---|---|---|---|
| 360 × 640 | | | | | | | 300×250 / 320×100 | 320×50 |
| 390 × 844 | | | | | | | 300×250 / 320×100 | 320×50 |
| 768 × 1024 | | | | | | | 728×90 | |
| 1024 × 768 | | | | | | | 728×90 | |
| 1280 × 800 | | | | | 160×600 | | 728×90 | |
| 1366 × 768 | | | 160×600 | | 160×600 | | 728×90 | |
| 1440 × 900 | | | 160×600 | | 300×600 | | 728×90 | |
| 1536 × 864 | | | 160×600 | | 300×600 | | 728×90 | |
| 1600 × 900 | | | 300×600 | 160×600 | 300×600 | | 728×90 | |
| 1920 × 1080 | 300×600 | 160×600 | 300×600 | 300×600 | 300×600 | 160×600 | 728×90 | |
| 2560 × 1440 | 300×600 | 300×600 | 300×600 | 300×600 | 300×600 | 300×600 | 728×90 | |

A conta: margem livre = (largura da tela − largura do conteúdo) ÷ 2. O trilho
aparece se a margem ≥ largura do trilho + 48 px. Altura mínima: barra do topo
(e a barra de capítulos, no resumo, ou o cabeçalho do jogador, na carreira) +
rótulo + 600 px + 16 px.

Laptops de 1366 a 1536 px (a maioria dos PCs no Brasil) só ganham trilho nas
telas de coluna estreita (resumo, Termos): é de propósito. Espremer o jogo para
caber um 160×600 custaria mais em experiência do que renderia. Nas outras telas
desses laptops, a receita do PC vem do in-content.

---|---|---|---|---|---|
| 360 × 640 | não | não | não | 300×250 / 320×100 | 320×50 |
| 390 × 844 | não | não | não | 300×250 / 320×100 | 320×50 |
| 768 × 1024 | não | não | não | 728×90 | não |
| 1024 × 768 | não | não | não | 728×90 | não |
| 1280 × 800 | não | 160×600 | não | 728×90 | não |
| 1366 × 768 | não | 300×600 | não | 728×90 | não |
| 1440 × 900 | não | 300×600 | não | 728×90 | não |
| 1536 × 864 | 160×600 | 300×600 | não | 728×90 | não |
| 1920 × 1080 | 300×600 | 300×600 | 160×600 | 728×90 | não |
| 2560 × 1440 | 300×600 | 300×600 | 300×600 | 728×90 | não |

A conta: margem livre = (largura da tela − largura do conteúdo) ÷ 2. O trilho
aparece se a margem ≥ largura do trilho + 48 px. Altura mínima: barra do topo
(ou cabeçalho da carreira) + 600 px + 16 px.

Laptops de 1366 a 1440 px (a maioria dos PCs no Brasil) ficam sem trilho nas
telas largas: é de propósito. Espremer o jogo para caber um 160×600 custaria
mais em experiência do que renderia. Nessas telas, a receita do PC vem do
in-content.

---

## 7. Cuidados do celular

- **Zona do polegar.** A metade de baixo da tela é onde o dedo vive. A âncora
  fica ali, então **só entra em telas de leitura**, onde não há botão primário
  fixo embaixo. Nas telas com ação no pé (laço, criação), não há âncora.
- **Área segura.** A âncora soma `env(safe-area-inset-bottom)` (iPhone com
  barra de gestos) por dentro, e a página soma o mesmo no `padding-bottom`.
- **Altura útil.** Em 360 × 640, a âncora come 50 px (8%). O conteúdo continua
  inteiro: a página rola mais 50 px no fim.
- **Avisos e camadas.** Avisos (toasts) ficam no topo: não brigam com a
  âncora. O aviso de cookies sobe acima da âncora. Folhas e modais cobrem a
  âncora (ela tem camada menor). O teclado virtual não acontece nessas telas
  (são de leitura).
- **Clique acidental.** Nenhum in-content encosta em botão: o capítulo tem 56 px
  de respiro em cima e embaixo. A âncora não fica colada em nada clicável: a
  página termina 50 px acima dela.

---

## 8. Formatos futuros (recomendação, não implementado agora)

1. **Intersticial de transição (H5 Games Ads / Ad Placement API).** É o produto
   do Google para jogos de navegador (`adBreak()` com tipos `start`, `next`,
   `pause`, `browse`, `reward`), com limite de frequência e as regras do Better
   Ads já embutidas. Lugares certos: ao encerrar a carreira, antes do resumo
   (`next`), e em "Jogar de novo". Nunca no meio do laço. Limite sugerido: no
   máximo um a cada 3 minutos e nunca na primeira carreira da sessão. Pede
   aprovação do Google para jogos.
2. **Mais um recompensado opcional.** Candidatos que passam nas duas perguntas
   do `AI_RULES.md` sem dar vantagem: "ver outra edição do jornal", "nova arte
   de fundo do pôster", "segunda tentativa de treino sem bônus". Recompensa que
   dá vantagem vira escolha obrigatória e quebra o equilíbrio (D118).
3. **Refresh por tempo (Ad Manager).** Para trilhos e âncora: 60 s, só com o
   espaço visível e a aba ativa, declarado ao comprador. Só faz sentido com
   volume (dezenas de milhares de sessões por dia).
4. **Header bidding (Prebid) e outras redes.** Mais compradores disputando a
   mesma impressão sobem o eCPM; custa peso de script e complexidade. Depois do
   Ad Manager.
5. **Legado do Técnico.** Quando o modo abrir (D124), espelhar o resumo do
   Craque: dois in-content e trilhos.

---

## 9. Estimativa de receita (ordem de grandeza)

Fórmula: receita = sessões × impressões visíveis por sessão × eCPM ÷ 1000.

Faixas de eCPM de display em AdSense para tráfego majoritariamente brasileiro e
latino-americano são baixas (dezenas de centavos de dólar por mil); tráfego de
EUA, Canadá, Reino Unido e Europa paga várias vezes mais. São faixas de mercado,
não promessa: o número real só aparece com 2 a 4 semanas de anúncio no ar.

Impressões por sessão típica (uma carreira completa no PC de 1920 px): 2 dos
trilhos da carreira + 2 trilhos e 2 in-content do resumo + 1 do hub + 2
trilhos do hub ≈ 9. No laptop de 1366 px: 1 do hub + 2 trilhos e 2 in-content
do resumo ≈ 5. No celular: 1 do hub + 2 in-content e 1 âncora no resumo ≈ 4. Com refresh futuro
nos trilhos e na âncora, esse número multiplica pelo tempo de sessão.

O que mais move a receita, em ordem: **visibilidade** (formatos fixos e bem
colocados), **preenchimento** (tamanhos padrão), **número de telas por sessão**
(carreira → resumo → hall → nova carreira) e só depois **número de espaços**.

---

## 10. Antes de ligar de verdade (checklist)

1. Conta AdSense aprovada (domínio `futeiro.com`, páginas de Termos e
   Privacidade no ar, conteúdo próprio).
2. `ads.txt` na raiz do site com a linha do editor.
3. CMP certificada pelo Google para tráfego do Espaço Econômico Europeu e do
   Reino Unido; o aviso atual cobre a LGPD.
4. Um bloco de anúncio por slot ID (tamanho fixo, nada de "responsivo"),
   configurado a partir do registro `slots.ts`.
5. Trocar a moldura de prévia pelo anúncio real **dentro do mesmo espaço
   reservado** (o tamanho já está certo, então o CLS continua 0).
6. Espaço sem preenchimento: colapsar só depois de esperar o anúncio, ou manter
   a altura (preferível no in-content para não pular a página).
7. Medir 2 a 4 semanas: visibilidade por slot, CTR (desconfiar acima de 1%),
   RPM de sessão, CLS no Search Console. Desligar o slot que render pouco e
   atrapalhar.
8. Decisão nova no `DECISOES.md` para a integração.

---

## 11. A prévia implementada

- **Registro central:** `apps/game/src/features/ads/slots.ts` (ID, tipo,
  tamanho no PC e no celular, telas, função). Ligar, desligar ou mudar um
  espaço é mudar uma linha ali.
- **Componentes:** `AdSlot` (no conteúdo), `AdRails` (trilhos fixos ou da
  carreira), `AdAnchor` (âncora do celular), todos em `features/ads/`.
- **Moldura:** fundo listrado sutil e borda tracejada com as cores do tema,
  selo "AD · PREVIEW", nome do slot, tamanho em px e tipo de posicionamento. O
  tamanho é o IAB exato: a moldura ocupa o lugar que o anúncio vai ocupar.
- **Ligar e desligar:** no desenvolvimento (`pnpm dev`), ligada por padrão.
  Alterna com o botão "Ads" na barra do topo do PC, o atalho
  **Alt + Shift + A**, a chave "Mostrar ou ocultar a prévia dos anúncios" nos
  Ajustes (o caminho no celular) ou a URL (`?ads=on` / `?ads=off`). A escolha
  fica no aparelho. Em produção a prévia não existe; na suíte ponta a ponta ela
  existe desligada e os testes de `e2e/anuncios.spec.ts` a ligam.
- **Produção:** nada muda para o jogador. Nenhum script de anúncio novo.
