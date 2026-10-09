# Decisões do CRAQUE v2

Registro curto das decisões estruturais, aprovadas em 2026-09-29. O que o jogo
faz está no [GDD](./GDD.md); aqui fica o porquê da forma.

---

## D1. Reescrita clean room

**Decisão.** O v2 é escrito do zero a partir do GDD. Nenhuma linha de lógica,
texto de jogador, esquema de dados ou nota de clube vem do v1 ou do Copero.

**Exceções declaradas** (portadas, não reescritas): o editor e o renderizador do
avatar, os geradores de arte (escudos, troféus, selos de liga), os kits, os
arquivos de imagem e o arquivo de jornais do resumo (D10).

**Consequência.** A carreira não reproduz o v1 número a número. Os baselines
exatos do v1 não se aplicam; as metas de design do GDD (seção 40) viram testes.

## D2. Vite SPA, não Next

**Decisão.** Vite 8 com React 19 e React Compiler, publicado como site estático.

**Por quê.** O jogo roda inteiro no navegador: não há servidor, conta nem rota
dinâmica. O Vite dá recarga instantânea no desenvolvimento, bundle sem runtime de
framework, Web Workers e PWA triviais, e deploy em qualquer host estático. As
páginas de erro viram arquivos HTML estáticos gerados no build.

**Custo aceito.** Metadados e páginas de erro são feitos à mão, uma vez.

## D3. Monorepo com pnpm, sem Turborepo

**Decisão.** Workspace pnpm com `apps/game`, `packages/engine`, `packages/world`,
`packages/content`, `packages/art` e `tools/balance`.

**Por quê.** A fronteira entre motor e interface vira dependência declarada: o
motor não lista React, então importá-lo é erro de resolução. O Turborepo não
paga o peso com um só app.

## D4. Motor puro, save como replay

**Decisão.** O motor é uma função pura `(carreira, escolha) → { carreira,
eventos }`, semeada, sem relógio e sem `Math.random`. O save guarda `setup` e a
lista de escolhas, mais um snapshot de reserva.

**Por quê.** Save minúsculo, impossível de "editar o OVR", compartilhável por
link, bug reproduzível por uma string, e "E se...?" de graça.

**Custo aceito.** Mudar o motor invalida replays antigos; eles abrem pelo
snapshot em modo leitura.

## D5. Mundo simulado em vez de tabelas de probabilidade

**Decisão.** Toda temporada o motor sorteia tabelas de liga, copas,
classificação continental, campeões e torneios de seleção a partir da força dos
clubes e das seleções, com o jogador somando força ao próprio time.

**Por quê.** Probabilidades coerentes (sempre há um campeão), classificação
conquistada, adversários reais nas finais, posição na tabela como feedback, e um
modelo contínuo que se ajusta por poucos parâmetros em vez de dezenas de tabelas.

## D6. Aleatoriedade em fluxos

**Decisão.** Cada sistema tem o próprio gerador derivado de `(semente, ano,
sistema)`.

**Por quê.** Ajustar um sistema não embaralha os outros, o que mantém as
comparações de balanceamento legíveis.

## D7. Assets `real | gerado`

**Decisão.** `VITE_ASSETS=real` (padrão) usa as imagens reais; `gerado` usa só a
arte gerada para escudos, troféus e selos de liga. Bandeiras são sempre reais.

**Por quê.** Os troféus, e provavelmente os logos, vieram das URLs de mídia do
Copero e são marcas de clubes e competições. A chave permite lançar sem eles sem
tocar em código.

**Consequência (M1).** A tabela de troféus gerados do v1 só cobria competições
sem foto. Para o modo `gerado` ficar completo, o v2 acrescenta peças próprias
para as ligas e copas que tinham foto, os continentais principais, os torneios
de seleções, os dois mundiais e os cinco prêmios
(`packages/art/src/trophy/extra.ts`). Um teste garante que nenhuma competição
repete a arte de outra. A arte portada continua idêntica byte a byte.

## D8. Nomes reais na elite e no rival

**Decisão.** O rival e a elite que disputa os prêmios usam jogadores reais, com
projeções de carreira fictícias.

**Risco registrado.** Uso de nome de pessoa real num produto publicado envolve
direito de imagem. A decisão foi do produto.

## D9. Linguagem visual "noite de jogo", sem cara de template

**Decisão.** Referências da cultura impressa e televisiva do futebol, cor
chapada, filetes, cantos pequenos, tipografia forte (Big Shoulders, Schibsted
Grotesk, Newsreader), cor do clube como acento. Sem degradê néon, vidro fosco ou
emoji como ícone.

## D10. O jornal do resumo é portado do v1

**Decisão (2026-09-30).** O arquivo de jornais que fecha o resumo, folheado
arrastando de lado temporada a temporada, fica como está no v1: componente,
anatomia da página e manchetes. Um adaptador traduz as temporadas do motor do v2
para o formato que ele lê.

**Por quê.** É uma peça que o produto já aprovou e quer manter.

## D11. Dois ritmos

**Decisão (2026-09-30).** Só Intensa (uma temporada por decisão, padrão) e
Normal (duas, o modo rápido). A Expressa sai.


## D12. Evolução orgânica, com o potencial como orçamento

**Decisão (2026-09-30, M2).** A capacidade cresce por um produto de razões
(idade, folga até o potencial, minutos, treinador, torcida, traço, forma) e passa
por um **teto suave** por temporada. A folga satura em vez de crescer em linha
reta. O potencial limita o **nível total** (capacidade natural mais treino): o
treino acelera e molda o perfil, e no teto especializa em vez de somar. O
prodígio acontece na criação.

**Por quê.** As fórmulas iniciais do GDD, calculadas antes de qualquer código,
davam a um Fenômeno de 16 anos de +15 a +19 de capacidade numa temporada de
explosão, e o treino empilhado deixava qualquer jogador oito pontos acima do
próprio teto. O prodígio depois da primeira temporada virava um salto de 30
pontos na carta. O harness mostrou os três problemas na primeira rodada.

**Como se garante.** As metas de realismo da seção 40.1 (maior subida +9,
subidas de 8 ou mais em até 1% das temporadas e só na juventude, nenhuma queda
de 7, pico a ±2 do potencial, justiça entre posições) rodam no `pnpm verify`
pelo `pnpm balance:check`. Os coeficientes ficam todos em
`packages/engine/src/evolution/tuning.ts`.

## D13. Elite real e geração futura

**Decisão (2026-10-01, M3).** A elite que disputa os prêmios tem duas partes: os
114 jogadores reais (nascidos de 1997 a 2009, projeções fictícias) e uma
geração futura gerada pela semente da carreira, 10 candidatos por ano de
nascimento de 2009 a 2028. O rival é sempre real.

**Por quê.** Não existe jogador real com nome nascido depois de 2009, e a elite
real envelhece com a carreira. Medido no harness: a melhor nota da elite caía
de cerca de 99 em 2030 para 70 em 2045, e um Fenômeno ganhava 12 Bolas de Ouro
de mediana, quase todas depois de 2037. Com a geração futura, a disputa fica do
mesmo tamanho em qualquer ano.

**Decidido (2026-10-01, na aprovação do M3).** A geração futura aparece com
nomes fictícios da cultura de cada país ("João Santos" para um brasileiro,
"Haruto Tanaka" para um japonês). O motor continua sem nomes: o pacote
`@craque/content` monta o nome na hora de mostrar, a partir de listas de
prenomes e sobrenomes comuns por cultura (lusófona, espanhola, rio-platense,
latino-americana, francesa, inglesa, americana, alemã, italiana, holandesa,
magrebina, balcânica, nórdica, oeste-africana anglófona e francófona, japonesa,
coreana, turca, do leste europeu e do Golfo). O nome é fixo para a mesma
carreira e o mesmo candidato, e nunca coincide com um jogador real conhecido:
um teste confere contra a elite real e uma lista de nomes famosos que as
combinações poderiam formar.

## D14. Calibragem do mundo e dos prêmios

**Decisão (2026-10-01, M3).** Os números iniciais das seções 8, 11, 12 e 13 do
GDD foram recalibrados pelo harness e documentados lá: mais volta à média na
força dos clubes, mais sorte nas tabelas e nos continentais, um joelho na
vantagem de nível dos gols, jogo de seleção mais travado, e na Bola de Ouro
força do campo, prestígio, fama e um amortecedor maior.

**Por quê.** Cada problema apareceu num número que dá para conferir com o
futebol real: Flamengo com 105 pontos todo ano, LaLiga com campeão de 98
pontos, PSG com 96% dos títulos, centroavante Fenômeno com 886 gols de mediana,
prodígio de 19 anos ganhando a Bola de Ouro. As metas novas da seção 40.1 (37
ao todo) rodam no `pnpm verify` e foram conferidas com duas sementes
diferentes.

## D15. O mercado da base e a faixa que se alarga

**Decisão (2026-10-01, M4).** A primeira decisão não usa a faixa do nível de
mercado (seção 15.2): são três clubes do próprio país (ou da confederação, ou do
mundo, nessa ordem) perto de `OVR + 6`, onde o jogador chega como aposta da
base. Nas outras janelas, quando a faixa `nível - 7` a `nível + 3` tem menos
clubes do que ofertas, ela se alarga: para cima até os 21 anos (clubes que
apostam no que ele vai ser), para baixo depois. O nível ganha o desconto de
veterano: 1,5 por ano depois dos 32. A missão "aposta da base" passa a vir antes
de "resgate" e "reconstrução".

**Por quê.** Aos 16 anos o OVR fica entre 40 e 55 e o clube mais fraco do mundo
tem força 53: na primeira rodada do harness, 60% das carreiras terminavam aos 16
sem nenhuma oferta. O desconto de veterano é o que faz o mercado encerrar a
carreira na idade certa: sem ele, quem não se aposenta joga até os 40.

**Como se garante.** O relatório `fluxo.md` do harness, com metas no `pnpm
verify`: primeira decisão sempre com três bases, no máximo 2% de janelas com
menos de duas ofertas, a maioria das carreiras terminando entre 33 e 38 e uma
minoria aos 40, mesmo para quem nunca aceita aposentar.

## D16. Eventos declarativos: o que o modelo ganhou

**Decisão (2026-10-01, M4).** O modelo da seção 18.2 virou código em
`packages/engine/src/events/` com estes ajustes:

- "Título ×m" virou **força do time por tipo de torneio** (liga, copas,
  continental) e **final decidida** (vence ou perde, se o time chegar a uma). O
  mundo simula força, não probabilidade de título, então o evento empurra a força
  e o resultado aparece nas tabelas de verdade.
- Efeitos novos: jogos, risco de lesão, crescimento, nível de mercado, força do
  clube, votos nos prêmios e um fato para a biografia, sem efeito em jogo.
- "Papel fixo" virou **papel mínimo**: o titular garantido é piso, não teto (um
  craque do time continua craque do time).
- Os efeitos valem **na ordem da lista**: o que vem antes da transferência age
  no clube que ele deixa, o que vem depois age no clube novo.
- Opções que dependem de um alvo (clube de destino, posição, país, número) só
  aparecem se o alvo existir agora; um evento que fica com menos de duas opções
  não aparece, e a vaga da agenda passa.
- O evento 38 ("o rival assina com o seu clube rival") virou comprar a briga ou
  ignorar, sem troca de clube: trocar de clube já tem os eventos 9, 26 e 33.

**Por quê.** Era o pedido do M4: eventos fáceis de mapear, com condições,
opções, impacto e mensagens separados. Um evento novo é uma entrada no catálogo
e um bloco de texto em `@craque/content`; nenhuma tela muda. Os testes conferem
que cada evento do catálogo tem texto nos três idiomas, que cada marcador do
texto tem de onde vir e que cada efeito tem descrição.

## D17. O pacote de conteúdo e o terminal

**Decisão (2026-10-01, M4).** Os textos do jogo saem do motor e da interface e
moram em `@craque/content`: eventos, decisões, opções, missões, efeitos, avisos,
fim de carreira e os nomes da geração futura, em português, espanhol e inglês.
O terminal (`tools/terminal`, `pnpm carreira`) usa os mesmos textos que o jogo
vai usar no M5.

**Feito no M5.** Posições (com as siglas), papéis, talentos e traços saíram do
dicionário da interface: as telas leem do conteúdo pelo tradutor (`c` e `cp`
do `useT`). Os textos curtos ficam num subcaminho leve,
`@craque/content/career-text`, que a casca usa sem trazer os eventos nem o
motor.

## D18. Políticas automáticas

**Decisão (2026-10-01, M4).** O motor tem quatro jogadores automáticos
(`balanced`, `ambitious`, `loyal`, `random`), usados pelo harness, pelos testes
e pelo `--auto` do terminal. Nenhum faz parte do jogo. O harness ainda tem a
política teimosa (a equilibrada que nunca aceita aposentar), que mede o mercado
sem a vontade do jogador no meio.

## D19. Camisa pelo papel

**Decisão (2026-10-01, na aprovação do M4).** Sem número dos sonhos, titular e
craque do time vestem um número clássico da posição; rotação, de 12 a 23;
reserva e promessa, de 12 a 99. Quem ganha a posição no clube vestindo número
alto pode ganhar um clássico na virada da janela (50%).

**Por quê.** Pedido do produto: um craque do time com a 58 nas costas não parece
futebol. O GDD dava 15% de chance de número de prestígio a qualquer um.

## D20. O save em duas camadas

**Decisão (2026-10-01, M5).** O save ganhou `avatar`, `screen`, `snapshot` e
`quit` (GDD 34.2). A leitura tem duas camadas: `saveRecord.ts`, que olha o save
sem o motor (formato, retrato, versão por `@craque/engine/version`), e
`save.ts`, que valida as escolhas e monta o registro. O Início e a decisão de
onde o jogo abre usam só a primeira. "Encerrar carreira" é `retireNow` no
motor, registrado em `quit`.

**Por quê.** O Início é a primeira tela: trazer o motor e os 489 clubes para
mostrar "Continuar carreira" dobraria o primeiro carregamento. O motor, os
dados e os textos dos eventos só chegam quando a carreira abre.

## D21. A revelação e a escolha em duas etapas

**Decisão (2026-10-01, M5).**

- Escolher é marcar e confirmar: um toque sem querer, no celular, nunca muda uma
  carreira.
- A revelação é uma página por temporada, em seis tempos (GDD 22), com
  rolagem automática até o passo novo, e um momento só para os títulos e
  prêmios da leva: brilho dourado, troféus caindo um a um, confete, som de
  troféu e vibração, uma vez por página.
- O resultado de um evento é a primeira página da revelação, e não um aviso de
  canto de tela.
- "Pular sempre" e movimento reduzido mostram cada página pronta, sem
  animação nem confete; o som do troféu continua.

**Por quê.** A revelação é o momento de retenção do jogo (pedido do produto no
M5). Um aviso de 5 segundos sumia por baixo dela, e o título, a parte que o
jogador mais quer ver, precisava de tempo e de lugar próprios.

## D22. O que o M5 deixa para depois

**Decisão (2026-10-01, M5).**

- O Resumo do M5 tem a carta do auge, o motivo do fim, os números, o caminho
  pelos clubes e a estante. Biografia, linha do tempo completa, jornal e pôster
  são do M6.
- Desafio do dia e Hall da Fama aparecem no Início com o M7. Começar uma
  carreira nova, com outra salva, pede confirmação e apaga a anterior; no M7
  ela vai para o Hall da Fama como interrompida.
- O laboratório só abre em desenvolvimento, por `#lab` ou pelo botão no Início,
  e ganhou a área Cartas: a folha de contato das cartas (GDD 38).
- Os dicionários de idioma continuam no pacote inicial; carregar sob demanda
  fica para a fase combinada.

## D23. O laço do jogo cabe na tela

**Decisão (2026-10-02, M6, diretriz do produto na aprovação do M5).** A
decisão, o painel do jogador e a revelação nunca pedem rolagem, de 360 × 640
até o desktop. A página da carreira é uma grade da altura da janela
(cabeçalho, corpo, abas) que não rola; só as vistas de exploração rolam, por
dentro do próprio painel.

- As opções viraram linhas compactas. Marcada, a opção abre os detalhes (a
  missão e a pressão; o torneio continental, quando há), e a legenda sob o
  título passa a explicar a opção marcada no lugar do texto da decisão.
- Numa proposta de empréstimo o selo "Empréstimo" sai das linhas: o título já
  diz.
- No celular, a última temporada (com "Rever a temporada") foi para a aba nova
  Jogador, a leitura de status: carta, totais, contrato, torcida, rival e
  seleção. No desktop ela fica no alto da coluna da decisão.
- A revelação ganhou palco fixo: o ano entra grande e assenta; os títulos têm
  um holofote do palco inteiro que depois encolhe numa tira; a capa tem limite
  de linhas. Acabou a rolagem automática do M5.
- Medido por roteiro em cinco tamanhos e em cada tipo de decisão, com cada
  opção marcada, inclusive os eventos raros de três opções: zero pixel de
  rolagem.

**Por quê.** Um jogo de navegador viciante não pede rolagem para jogar
(pedido do produto). No M5 as opções eram cartões altos e a revelação descia
abaixo da dobra.

## D24. O jornal do v1 com a capa do v2

**Decisão (2026-10-02, M6).** O jornal do resumo é o componente do v1 (D10):
mesma página, mesma anatomia, mesma virada de página arrastando ou pelos
botões. A manchete e o apoio de cada página são a capa da temporada, a mesma
que a revelação mostra. As manchetes do jornal do v1 entraram no banco de capas
do v2, reescritas: sem artigo antes de nome de clube (o gênero muda de um para
outro), com a pontuação que o expurgo de travessões tinha apagado ("Liga,
copa e continente: o ano perfeito"), e com plural certo. O banco passou a ter
pelo menos 5 manchetes e 3 apoios por ângulo (GDD 21.2), com três ângulos
novos: Jogo único, Recorde e Garçom.

**Por quê.** Com dois geradores, a mesma temporada teria uma manchete na
revelação e outra no jornal. O v1 já evitava isso pelo mesmo motivo.

## D25. O diário da carreira

**Decisão (2026-10-02, M6).** O motor guarda no estado da carreira um diário
com idade e ano: transferência, empréstimo, dispensa, camisa, primeira
convocação, rival, evento resolvido, a maior oferta recusada e a
aposentadoria. A biografia, a linha do tempo e as manchetes leem o diário e o
histórico; nunca o interior da simulação. O diário não vai para o save: o
replay o refaz igual (testado).

**Por quê.** Pedido do produto: biografia e linha do tempo geradas dos
eventos guardados na carreira. Os avisos da revelação somem depois de
mostrados (invariante 23) e não serviam para isso.

**Versão do motor.** O diário não sorteia nada e não muda resultado. Os
relatórios de balanceamento saíram idênticos, fora o tempo medido no relógio.
Por isso `ENGINE_VERSION` continua `2.0.0-m5`, e as carreiras salvas no M5
seguem abrindo; os pacotes sobem para `2.0.0-m6`.

## D26. Recordes reais conferidos e datados

**Decisão (2026-10-02, M6).** Dezoito recordes (GDD 26), conferidos em
setembro de 2026. Para quem ainda joga (Cristiano Ronaldo, Lionel Messi), o
resumo mostra a data da conferência. Ficaram de fora as marcas sem fonte de
consenso: assistências, jogos sem sofrer gol de goleiro, Europa League,
Sul-Americana e as ligas da França e do Brasil.

**Por quê.** Um "recorde do futebol de verdade" errado é pior do que um
recorde a menos.

## D27. Pôster pelo modern-screenshot, link pelo fragmento

**Decisão (2026-10-02, M6).**

- O pôster é um componente de 1080 × 1350 em pixels fixos e paleta escura
  fixa. O PNG sai do próprio DOM pelo `modern-screenshot` 4.7.0 (MIT, mantido,
  cerca de 15 KB comprimido), carregado só quando alguém pede o pôster: o
  primeiro carregamento do jogo não muda.
- O rodapé imprime `VITE_SITE_URL` ou, sem ele, o endereço de onde o jogo está
  sendo servido. Nunca um domínio inventado.
- O link da carreira leva o replay e o avatar no fragmento `#c=` (comprimido
  com `deflate-raw`), que não vai ao servidor. Abre uma tela própria, só de
  leitura, que nunca toca o save de quem abre; sair dela tira o fragmento da
  URL. Link de outra versão do motor, quebrado ou de carreira não terminada
  abre uma mensagem clara.

**Por quê.** Pedido do produto: biblioteca leve e confiável. Desenhar o
pôster à mão num canvas duplicaria a carta e o avatar; o DOM já os tem.

## D28. O dia do desafio é UTC, e o motor não lê o relógio

**Decisão (2026-10-02, M7).** O identificador do dia é a data em UTC
(`AAAA-MM-DD`). O motor converte instante em dia com aritmética de calendário
em inteiros (`challenge/day.ts`), sem `Date`: o teste de pureza (D4) continua
valendo, e a conta bate com o relógio do sistema do ano 1 ao 9999. Quem lê o
relógio é a interface, uma vez por segundo, e passa o instante. O Início
importa só o calendário (`@craque/engine/day`), sem baixar o motor.

**Por quê.** Pedido do produto: a semente muda exatamente à meia-noite UTC e
todo mundo joga o mesmo dia. Com o relógio dentro do motor, o replay deixaria
de ser puro.

## D29. Alvos por faixa de talento, calibrados pelo harness

**Decisão (2026-10-02, M7).** Cada missão tem um alvo por faixa de talento do
jogador do dia, no valor mais perto do percentil 65 das carreiras comuns com as
regras do desafio (600 carreiras por faixa). Missão rara ganha alvo 1 quando
pelo menos 15% chegam lá; senão sai da faixa. `pnpm desafio:calibrar` reescreve
a tabela; `pnpm balance` confere 157 células (missão × faixa) entre 15% e 55%.

**Por quê.** Um alvo único seria impossível num dia de Operário e trivial num
dia de Fenômeno. Com o alvo da faixa, os dois dias são justos.

## D30. Éditos com dente

**Decisão (2026-10-02, M7).** Os dez éditos do primeiro desenho foram medidos;
os que nunca quebravam saíram, e os que quase sempre quebravam ganharam corte
de idade. Ficaram: Quatro camisas, Sem empréstimo, Longe das cinco grandes,
Nunca cair, Titular sempre (dos 20 anos em diante, uma temporada de folga),
Primeira classe (dos 23 em diante), Raízes (três temporadas por clube), Casa no
continente, Sem gigantes (força 82 ou mais) e o piso Operário (450 jogos). O
harness exige que cada um quebre entre 10% e 75% das carreiras de quem não
presta atenção nele.

**Por quê.** Édito que ninguém quebra não é escolha; édito que todo mundo
quebra é castigo.

## D31. Rodízio de nação, posição e édito

**Decisão (2026-10-02, M7).** Nação, posição e édito saem de um rodízio
determinístico: cada ciclo embaralha a lista pela semente do ciclo, e cada item
aparece uma vez por ciclo. Se o primeiro de um ciclo repetiria o último do
anterior, os dois primeiros trocam de lugar. Nada repete de um dia para o
outro, e a regra não precisa olhar para trás mais de um ciclo.

**Por quê.** Revisando as mãos no laboratório, dois dias seguidos saíram com a
mesma nação e o mesmo édito. O desafio é o motor de retenção: amanhã tem de ser
outro jogo. A comparação nos mesmos 120 dias não mostrou perda de pontuação
(mediana do jogo automático 432 antes, 571 depois).

## D32. Hall, conquistas e ranking no IndexedDB, com espelho em memória

**Decisão (2026-10-02, M7).**

- Banco `craque-v2`, lojas `archive`, `achievements` e `leaderboard`, sem
  biblioteca: um invólucro de cem linhas sobre a API do navegador.
- Na abertura, tudo vai para um espelho em memória. Leitura do espelho
  (síncrona); escrita no espelho e depois no disco.
- Sem IndexedDB, abertura recusada, abertura que não responde em 4 segundos ou
  escrita que falha: o banco vira só memória até o fim da sessão, e o aviso
  discreto sai uma vez (só se o aviso geral do armazenamento não saiu).
- Tudo que vem do disco passa por schema; linha inválida sai. O ranking tem
  formato versionado: formato antigo é descartado inteiro.
- O id da carreira no Hall é um hash do replay: arquivar de novo troca, nunca
  duplica, e a tentativa ranqueada continua ranqueada.
- `fake-indexeddb` 6.2.5 entrou como dependência de teste, para testar o
  IndexedDB de verdade e cada caminho de queda.

**Por quê.** Pedido do produto: tratar aba anônima e disco restrito com o
fallback em memória como salvador. Com o espelho, a queda no meio da sessão não
perde nada do que já estava na tela.

## D33. As conquistas

**Decisão (2026-10-02, M7).** 44 conquistas em oito grupos, derivadas do
histórico, do diário, do resultado do desafio e de dois contadores entre
carreiras. Medidas em 400 carreiras automáticas antes de fechar o catálogo; três
exemplos do GDD estavam fora de alcance e foram ajustados:

| Do GDD | Medido | Ficou |
|---|---|---|
| Dez clubes | máximo de 8 em 400 carreiras | Oito clubes |
| Recorde de gols numa temporada (73) | máximo de 53 | 50 gols numa temporada |
| Continental com clube que você subiu | 0 em 400 | Subir com um clube e depois ganhar a liga com ele |

O aviso de conquista espera a revelação terminar, toca um som próprio e mostra
no máximo três avisos de uma vez (com mais, dois e "mais N"). "Conquista
desbloqueada" não virou manchete do jornal: é do jogador, não da carreira.

**Por quê.** Conquista impossível frustra; o GDD pede conquistas que contem
histórias, e essas três ainda contam a mesma história, ao alcance.

## D34. "E se...?" entrou no M7

**Decisão (2026-10-02, M7).** O "E se...?" (GDD 28.3) entrou neste marco,
decisão minha dentro do plano aprovado do v2.0: o capítulo final do resumo
lista as decisões; seguir de uma delas refaz as escolhas anteriores e continua
ao vivo. A original fica no Hall; a nova carrega no save de onde saiu e é
marcada como "Linha alternativa", com a etiqueta "Escolha da original" na
decisão em que se separou. Desligado no desafio.

**Por quê.** O Hall da Fama é o que torna o "E se...?" possível (a original
precisa ficar guardada), e os dois juntos fecham o ciclo de rejogar.

## D35. Versões no M7, e o que mudou fora do desafio

**Decisão (2026-10-02, M7).**

- `ENGINE_VERSION` continua `2.0.0-m5`. O M7 só acrescenta: o sistema de
  sorteio `challenge` (que não mexe nas outras sementes), o desafio e a regra
  de encerrar só a partir dos 27, que vale só para carreira de desafio. O
  `stream` deriva a semente do nome do sistema, não da posição na lista. As 46
  medições do `balance:check` do fim do M6 saíram idênticas no M7, fora o tempo
  de relógio (0,72 ms antes, 0,93 ms agora); as 5 a mais são as metas do
  desafio. Os saves do M5 e do M6 seguem abrindo. Os pacotes sobem para
  `2.0.0-m7`.
- Três ajustes de tela pequena achados na revisão: a grade da carreira passou a
  ter coluna `minmax(0, 1fr)` (cinco abas empurravam a tela para 339 px em
  320); a capa do jornal sai da revelação quando nem a primeira linha da
  manchete cabe; e, em telas de até 620 px de altura, a página de temporada fica
  mais justa. Medido: a revelação cabe em 320 × 568 em 72 páginas seguidas.

**Por quê.** Trocar a versão do motor sem mudar resultado tiraria do jogador as
carreiras salvas à toa.

## D36. PWA: instalação enxuta, imagens conforme aparecem, arte gerada como rede

**Decisão (2026-10-02, M8).**

- `vite-plugin-pwa` 1.3.0 (com Workbox 7.4), no modo `generateSW`. Os ícones
  saem da marca do jogo por um script (`pnpm --filter @craque/game icones`,
  com o Chrome do sistema) e ficam no repositório.
- **Na instalação**, cerca de 4,4 MB: código, estilos, fontes latinas, páginas
  de erro, bandeiras (o seletor de país mostra as 211 de uma vez), selos de liga
  e prêmios. Escudos e troféus, cerca de 22 MB, entram **conforme aparecem**
  (cache primeiro, rede depois). As federações não entram: o jogo não as usa.
- Toda imagem real que falha troca na hora pela arte gerada (invariante 16):
  sem internet, um escudo nunca aparece quebrado.
- "Imagens sem internet", nos Ajustes, guarda todos os escudos e troféus de uma
  vez, no mesmo cache que o service worker lê. É opcional, porque são 22 MB.
- Versão nova não entra sozinha: `registerType: "prompt"` e um aviso que espera
  com "Atualizar".

**Por quê.** Pedido do produto: o jogo funciona offline e os escudos não
quebram sem internet. Guardar os 22 MB na instalação pesaria em todo celular
que só abre o jogo uma vez; a arte gerada já cobre a falta, e quem quer tudo
guarda com um toque.

## D37. Barreiras de erro em três níveis e uma abertura que nunca fica branca

**Decisão (2026-10-02, M8).**

- Raiz (tela inteira), tela (dentro da casca, com volta para o Início) e
  trecho (capítulo do resumo, área do laboratório, painel de ajustes). Trocar
  de tela zera a barreira.
- A revelação que falhar se fecha sozinha, avisa e devolve a decisão: a
  temporada já foi jogada e salva.
- Pedaço do jogo que não baixou tem mensagem e ação próprias ("Recarregar"):
  é versão nova no ar ou falta de internet, não erro de quem joga.
- O `index.html` traz uma abertura com a marca; se o jogo não desenhar em 12
  segundos, ela vira o erro com "Recarregar".

**Por quê.** Pedido do produto: nunca uma tela branca. Um erro deve ser pego
no nível mais baixo que dá conta dele, para o resto do jogo seguir de pé.

## D38. Páginas estáticas geradas dos mesmos textos e desenhos do jogo

**Decisão (2026-10-02, M8).** As páginas 404, 403, 500 e 503 são geradas no
build por um plugin (`apps/game/build/errorPages.ts`), a partir dos
dicionários e dos desenhos SVG da tela de erro do jogo. Cada uma é um HTML só,
sem JavaScript do jogo, sem fonte, imagem ou script de fora, e escolhe idioma
e tema pelas preferências salvas. No desenvolvimento, o mesmo plugin as serve.

**Por quê.** O GDD pede o conjunto com o vocabulário visual do jogo. Escrever
à mão quatro HTMLs em três idiomas garantiria que um dia eles divergissem.

## D39. Acessibilidade no laço

**Decisão (2026-10-02, M8).** As opções da decisão viram um rádio com foco
itinerante (setas andam e marcam); o foco vai para o título da decisão nova
quando estava solto; a revelação abre com o foco no botão do rodapé, prende o
foco e anuncia o texto da página quando ela termina. A cor do clube passa a
ser ajustada pela conta de contraste da WCAG (4,8:1 contra o fundo mais
próximo em cada tema), e não mais por luminância percebida.

**Por quê.** Pedido do produto: Tab, Enter e Espaço fluindo no laço, e ARIA
certo para leitor de tela. O axe achou o resto (veja D41).

## D40. A suíte ponta a ponta

**Decisão (2026-10-02, M8).** Playwright 1.63 (`@playwright/test`) com
`@axe-core/playwright` 4.13, no Chrome instalado no sistema (nada de baixar
navegador), sobre o build de produção servido pelo `vite preview` (é onde o
service worker existe), em dois projetos: celular 375 × 812 e desktop
1280 × 800. São 22 cenários e 40 execuções (4 rodam só no desktop: teclado,
leitor de tela, avisos e o download de 22 MB), em cerca de 2 minutos. Roda
com `pnpm e2e` e fica fora do `pnpm verify`, porque pede o Chrome instalado.

**Por quê.** O GDD 40.2 pede e2e em celular e desktop; o produto pediu a
jornada do Início ao Resumo. Rodar no build de verdade é o único jeito de
testar o offline.

## D41. Defeitos antigos que o M8 achou

**Decisão (2026-10-02, M8).** Corrigidos, cada um com teste:

- O Início apagava o save inválido dentro do inicializador do estado; se a
  primeira renderização fosse descartada, o aviso de save inválido nunca
  aparecia. Apagar passou para depois de a tela desenhar.
- O painel de Ajustes passava de 568 px de altura e o fim dele ficava fora de
  alcance. Agora respeita a altura disponível e rola por dentro.
- O chip vermelho suave tinha contraste de 4,26:1 no tema escuro; acentos de
  clube claros sumiam no tema claro.
- O ano da revelação usava `aria-label` num parágrafo, o que o ARIA proíbe.

**Por quê.** Ficam registrados porque vieram de antes do M8: a suíte nova é
que os encontrou.

## D42. Revisão do M8: as regras do motor e do conteúdo

**Decisão (2026-10-03, pedido do produto depois do M8).** O motor passa a
`2.0.0-m8.1`: saves de antes abrem em modo leitura e entram no Hall pelo
retrato. Mudou:

- **Encerrar a carreira** só depois da primeira temporada jogada.
- **Bases.** Num país com liga jogável, cada uma das três bases é um clube
  sorteado do país: da primeira divisão com 30% de chance, da segunda no resto
  (no Brasil, Série A ou Série B). País com uma divisão só (México, Estados
  Unidos) sorteia nela; quem nasceu fora dos países jogáveis segue a regra de
  antes (confederação e mundo, perto de OVR + 6).
- **Torcida da primeira temporada.** O primeiro clube começa com 50 (no meio
  do medidor) e, na primeira temporada da carreira, a torcida só pode subir.
  Da segunda em diante, quem não joga ou não rende perde a arquibancada.
- **Números redondos nos eventos.** Capacidade, potencial, atributos, força e
  torcida mudam sempre por inteiros (o "+0,8 de OVR" virou +1); a pressão
  aparece em palavras ("Mais pressão").
- **Lesão** é só o nome da lesão, sem os jogos fora, em todo texto.
- **Camisa.** O número só muda em dois momentos: na transferência (a oferta já
  mostra o número que o clube dá) e na opção de ficar, quando o clube oferece
  outro número a quem ganhou a posição. Acabou a troca automática depois da
  temporada (o caso do 9 que virou 10 no River). Evento de camisa (a 10 livre,
  a homenagem) continua sendo escolha explícita. Número dos sonhos que não
  combina com a posição (a 10 de um goleiro, a 9 de um zagueiro) vem com 0,8%
  de chance, e só para o craque do time; o resto recebe os clássicos da
  posição ou os números altos de quem ainda não é titular.
- **Treino.** Cada foco treina um atributo só (seis focos por linha, um por
  atributo da carta) e a opção diz qual: "+2 Finalização". O bônus entra uma
  vez, no período que vem depois da escolha, e o atributo termina o período
  pelo menos 2 acima de onde começou. A temporada pode somar mais por conta
  própria; uma temporada ruim pode derrubar os outros atributos, nunca o
  treinado. Para compensar o treino que deixou de somar toda temporada, os
  gols de ataque por jogo subiram de 7% a 13% (centroavante 0,34 para 0,385),
  e a Chuteira de Ouro ficou mais perto dos vencedores reais (média 35).
- **Volta de empréstimo.** Cada opção é um clube: "Voltar para o clube" mostra
  o dono do passe (com o número de antes), e "Ficar no clube do empréstimo" é
  a compra (40% de chance quando o dono o quer de volta, 70% quando não quer),
  além das ofertas do mercado. O defeito: a opção "Voltar ao clube de origem"
  aparecia com o escudo do clube do empréstimo, e quem queria ficar voltava.
- **Rival pessoal removido** do motor, do conteúdo e da interface. Ficam as
  rivalidades entre clubes (clássico, troca pelo rival, traidor).
- **Gols por competição.** A produção sai competição por competição, com os
  jogos dele repartidos na proporção dos jogos do time; o total tem a mesma
  distribuição de antes.
- **Artilharia e craque de cada competição** (ligas, copas, continentais,
  Mundial de Clubes, Copa do Mundo e torneios de seleção; supercopas e a
  Intercontinental, não). Artilharia: cada competição tem a marca dos
  artilheiros reais das últimas temporadas (LaLiga 31, Premier League 27,
  Serie A 28, Bundesliga 30, Ligue 1 28, Brasileirão 19, Champions 12,
  Libertadores 9, Copa do Mundo 6...). Abaixo da marca, impossível; na marca,
  a chance já existe e sobe a cada gol (`1 - e^(-(gols - média + 1) /
  espalhamento)`); acima do recorde da competição, certa. Craque: quem jogou
  60% dos jogos do time (no mata-mata, chegando pelo menos à semifinal) tem
  uma nota com o OVR contra os mais fortes do torneio, a produção para a
  posição, a campanha e um pouco de sorte. O vencedor da Chuteira de Ouro é
  sempre o artilheiro da própria liga. Os valores foram levantados de memória
  das temporadas recentes e ajustados ao número de rodadas de cada liga no
  jogo; as ligas sem levantamento usam 0,75 gol por rodada (0,6 na segunda).
- **Título é de quem jogou.** Título de clube só conta para quem entrou em
  campo naquela competição: o garoto da base com três jogos na liga leva a
  liga, não a copa em que nem jogou.
- **Declínio.** Confirmado: zagueiro (pico 28,5 e um ano a mais de folga) e
  goleiro (pico 30 e dois anos a mais) envelhecem mais tarde. Novo: meia,
  atacante e lateral têm 7% de chance de nascer com **longevidade** (três anos
  a mais antes do declínio).
- **Papel.** Confirmado: o papel da oferta é o esperado pelo nível de hoje. Na
  temporada, o papel é recalculado pelo OVR do começo dela (quem evolui ganha
  espaço) e há 2% a 8% de chance de subir um degrau mesmo sem evoluir.
- **Acesso e rebaixamento** existiam desde o M3; agora aparecem em selo no
  lance, no histórico e no jornal.
- **Biografia.** O titular precoce é contado só no clube dono do passe; o
  empréstimo em que ele virou titular tem frase própria ("emprestado, virou
  titular por lá"), e as duas nunca aparecem juntas. Acesso não diz mais "de
  volta à elite" (nem todo clube já esteve lá), e artilharias e prêmios de
  craque entram no Auge.
- **Conquistas** (49): "Lenda do clube" deixa claro que é o legado no clube
  e não o OVR (a carta "Lenda" virou "Ícone"); voltaram as metas do GDD que
  agora são alcançáveis (73 gols numa temporada, dez clubes, continental com
  um clube que você subiu), e entraram "Artilheiro" e "Craque do campeonato".
- **Recordes ao alcance (D33; os números abaixo foram substituídos pela D44).** `pnpm balance:recordes` joga Fenômenos pelas
  decisões, ambiciosos e fiéis, sem aposentar por vontade própria. Em 1.500
  carreiras, todos os recordes do GDD 26 foram alcançados por alguma: 73 gols
  numa temporada (3,4% dos Fenômenos de ataque), 979 gols na carreira, 146
  gols e 234 jogos pela seleção, 1.390 jogos na carreira, oito Bolas de Ouro,
  seis Chuteiras de Ouro, três Copas do Mundo, seis Champions e seis
  Libertadores, as ligas de cada país (13 Premier Leagues em 0,1%, a mais
  rara), 11 ligas seguidas e cinco continentais seguidos.

**Por quê.** Pedidos do produto na revisão do M8. Os números do motor mudaram,
então a versão sobe, o `pnpm balance` foi rodado de novo (51 de 51 metas) e os
alvos do Desafio do dia foram recalibrados (a calibragem agora descarta
degraus cumpridos por mais de 55% do jogo comum, em vez de dar a missão de
presente).

## D43. Revisão do M8: a interface

**Decisão (2026-10-03, pedido do produto depois do M8).**

- **O lance na tela, sem revelação.** Depois de confirmar, não há mais janela
  para fechar: a próxima decisão já está ali. O que a escolha produziu aparece
  num cartão (o resultado do evento, a temporada com escudo, liga, posição,
  acesso ou queda, os números contando, o OVR e os atributos que mudaram, os
  títulos em miniatura, artilharias e prêmios, e o desafio), os números do
  placar, da carta e do jogador contam até os valores novos (verde subindo,
  vermelho caindo) e o jornal da temporada fica embaixo da decisão. No PC o
  cartão fica no alto da coluna da direita; no celular, é uma faixa de duas
  linhas que abre com um toque. Na faixa fechada, título, acesso e queda são
  selos (★ ▲ ▼) e o resultado do evento é o glifo: as palavras ficam no
  cartão aberto e no leitor de tela, porque com elas a linha não cabia em
  360 px. Título ganha confete e o som do troféu. O histórico mostra uma
  temporada qualquer no lugar do lance. O leitor de tela ouve o lance numa
  frase, e o foco volta ao título da decisão nova. Saiu o ajuste "Pular a
  revelação".
- **A barra do jogo fica em todas as telas**, a Carreira inclusive. Num
  celular baixo ela afina, e o lance, o jornal e as opções encolhem antes de
  qualquer rolagem (o laço cabe de 360 × 640 em diante).
- **Telas que cabem no PC, sem rolar a página:** Início (três colunas), Quem é
  você (carta e aparência, nome e posição, país com a lista rolando por
  dentro, mais compacta), Desafio do dia e o editor de aparência. Conferido
  de 1024 × 768 a 1920 × 1080; numa janela menor que isso, a tela rola por
  dentro em vez de cortar.
- **Início:** a carreira encerrada não aparece mais (fica no Hall); o jogo
  rápido não apaga mais o último jogador montado, que volta pronto na próxima
  carreira (aparência, posição, número, país, pé e sobrenome).
- **Identidade:** saiu "o que pesa na nota" da posição.
- **Ritmos:** "Rápida" (duas temporadas por decisão) à esquerda e "Normal"
  (uma por decisão, o padrão) à direita. "Lenta" diria o contrário do que o
  ritmo faz: a carreira passa mais depressa.
- **Janela de transferências:** a oferta mostra a liga do clube (com o selo)
  no lugar da força, e o número da camisa que o clube dá.
- **Eventos com transferência** mostram o clube de destino na opção (nome,
  liga e papel), como em "Procurar outro clube".
- **Carta do jogador** no desenho das cartas de videogame, sem copiar
  nenhuma: escudo com cantos chanfrados, OVR e posição no alto à esquerda,
  retrato grande, nome, os seis atributos numa linha e, no pé, bandeira, liga
  e escudo. A carta de compartilhar (pôster e carta do auge) leva o selo
  "Difícil" ou "Desafio"; a do Normal, nenhum.
- **Editor de aparência:** a prévia grande e fixa, as opções em três abas
  (Rosto, Cabelo e barba, Detalhes) e "Desfazer".
- **Foco de treino:** os seis focos em duas colunas; num celular estreito, sem
  o ícone, para o nome do foco e o "+2 atributo" caberem.
- **Resumo:** "Jogar de novo" em vermelho (um vermelho próprio de botão,
  `#bd2c34` nos dois temas: o vermelho dos avisos do tema escuro é claro
  demais para texto branco); a vitrine de troféus não passa de
  72 px por peça; recordes só aparecem quando há recorde igualado ou batido.
- **Histórico:** títulos e prêmios em miniaturas lado a lado, e acesso,
  rebaixamento e título em selo.
- **"E se...?"** é só para se divertir: a linha alternativa não entra no Hall
  (nem terminada nem interrompida) e não libera conquista.
- **Carregamento:** as telas baixam em segundo plano depois da primeira
  pintura, a carreira e o resumo leem o save antes de pintar, e o aviso
  "Carregando" só aparece se a espera passar de um instante.
- **Textos mais naturais:** "Missão escondida / Abre aos 24 anos, com o texto
  completo" virou "Missão surpresa / Você descobre qual é aos 24 anos"; o
  édito, o foco de treino e o "E se...?" foram reescritos no mesmo tom.

**Por quê.** Pedidos do produto na revisão do M8.

## D44. Pressão do recorde

**Decisão (2026-10-07, pedido do produto).** Recorde é possível e raríssimo, e
passar dele custa cada vez mais. O motor passa a `2.0.0-m8.2` (saves de antes
abrem em modo leitura). Cada número que encosta num recorde real tem uma
cauda (`packages/engine/src/records/pressure.ts`): até o começo dela nada
muda; dali em diante, cada unidade a mais só entra se passar num sorteio, e a
chance cai a cada passo:

    chance do passo n = e^(-n / escala)

Nada tem teto (a invariante 4 continua valendo): a chance nunca chega a zero,
só fica pequena demais para acontecer sempre.

- **Números da temporada** contam do zero a cada ano: gols pelo clube (cauda
  a partir de 62, escala 6: o 73º gol entra com 16% de chance, o 74º com 14%,
  o 80º com 5%), assistências (25, escala 5) e jogos sem sofrer gol do
  goleiro (24, escala 6). As unidades passam pelo sorteio numa ordem
  embaralhada entre as competições; o jogo sem sofrer gol que não entra vira
  gol sofrido.
- **Números da carreira** contam o que a carreira já tem: gols de clube e
  seleção (860, escala 55), gols pela seleção (134, escala 20), convocações
  (208, escala 18) e jogos (1.300, escala 70). Jogo que não entra é rodízio:
  o veterano recordista joga menos.
- **Títulos.** Todo título da carreira passa pela cauda dos títulos (36,
  escala 4); a liga passa também pela contagem naquele país (Inglaterra a
  partir de 13, Espanha 10, Itália 9, Alemanha 11, os outros países 10) e pela
  sequência de ligas (8, escala 4); o continental principal pela contagem (4,
  escala 2) e pela sequência (3, escala 2); a Copa do Mundo pela contagem (2,
  escala 3). O título é do clube: quando a sorte não vem, ele fica com o vice
  (os dois trocam de linha na tabela, ou o vice vence a final), logo que o
  torneio termina e antes de alimentar o seguinte, então o mundo continua
  coerente. Final decidida por evento vale acima da pressão.
- **Prêmios.** A partir da quinta Bola de Ouro (escala 3) e da terceira
  seguida (escala 2), e da quarta Chuteira de Ouro (escala 2,5), o prêmio
  ganho na votação fica com o segundo colocado se a sorte não vier.
- **Medição.** `pnpm balance:recordes` ganhou um terceiro lote, o fiel ao
  gigante (sobe até um clube de força 84 e fica), e as colunas +1, +2 e +3
  (quantas carreiras passaram da marca por um, dois e três). Em 2.250
  carreiras de Fenômeno perseguindo recorde, todos foram alcançados, perto da
  marca e não dezenas acima:

| Recorde | Melhor do lote | Alcançaram | +1 | +2 | +3 |
|---|---:|---:|---:|---:|---:|
| 73 gols numa temporada | 75 | 6 (0,3%) | 4 | 2 | 0 |
| 979 gols na carreira | 987 | 2 | 2 | 2 | 2 |
| 146 gols pela seleção | 146 | 1 | 0 | 0 | 0 |
| 234 jogos pela seleção | 234 | 2 | 0 | 0 | 0 |
| 1.390 jogos na carreira | 1.410 | 9 | 6 | 5 | 5 |
| 8 Bolas de Ouro | 9 | 5 | 1 | 0 | 0 |
| 4 Bolas de Ouro seguidas | 4 | 10 | 0 | 0 | 0 |
| 6 Chuteiras de Ouro | 7 | 5 | 1 | 0 | 0 |
| 46 títulos | 48 | 28 | 8 | 2 | 0 |
| 3 Copas do Mundo | 4 | 16 | 1 | 0 | 0 |
| 6 Champions League | 7 | 27 | 4 | 0 | 0 |
| 6 Libertadores | 7 | 12 | 3 | 0 | 0 |
| 13 Premier Leagues | 14 | 3 | 1 | 0 | 0 |
| 12 LaLigas | 13 | 13 | 1 | 0 | 0 |
| 10 Serie A | 13 | 7 | 3 | 1 | 1 |
| 13 Bundesligas | 14 | 5 | 2 | 0 | 0 |
| 11 ligas seguidas | 12 | 19 | 4 | 0 | 0 |
| 5 continentais seguidos | 5 | 4 | 0 | 0 | 0 |

  Antes da pressão, o melhor do lote fazia 115 gols numa temporada, 1.395 na
  carreira, 13 Bolas de Ouro (13 seguidas), 91 títulos, 20 LaLigas e 22 ligas
  seguidas.
- **Metas do GDD 40.** As três metas que pediam recorde comum mudaram para
  raro: Bolas de Ouro (8) e quatro seguidas, no máximo 2% dos Fenômenos de
  ataque (eram 6% a 10% e 5% a 8%); Chuteiras de Ouro (6), no máximo 3% dos
  centroavantes Fenômenos na Europa (eram 12% a 15%). A meta de Bolas de Ouro
  por carreira de Fenômeno passou de "mediana de 1 a 2" para "média de 1 a 2,
  e de 40% a 60% ganham ao menos uma": com metade do lote no zero, a mediana
  pulava entre 0 e 1 conforme a amostra (passava no `balance:check` e falhava
  no `pnpm balance` completo, o que já vinha da D42). A marca da meta de gols
  na carreira foi corrigida de 930 para 979, a do GDD 26.

**Por quê.** Pedido do produto: "cada 1 a mais precisa de mais sorte", para
gols, jogos, assistências, goleiro, títulos e prêmios. Sem a pressão, o motor
deixava o recorde comum entre os Fenômenos e o melhor do lote muito acima do
real.

## D45. A mensagem do resultado, o Início sem perguntas e os textos coerentes

**Decisão (2026-10-07, pedido do produto).**

- **Mensagem do resultado.** Logo depois de confirmar, um cartão salta com o
  resultado da escolha: deu certo (o certo se desenha, com faíscas), deu
  errado (o X se desenha e o cartão treme), feito, contrato assinado,
  emprestado, de volta ao clube, comprado em definitivo, você fica (com a
  camisa nova, se veio) ou o treino escolhido (o haltere pula). Traz a frase
  do resultado e os efeitos caindo um a um, some sozinho em 3 a 7 segundos
  (conforme o tamanho do texto; no PC, para com o ponteiro em cima) ou assim
  que o jogador segue jogando (qualquer toque ou tecla, em qualquer lugar), e
  não bloqueia a decisão nova: no PC fica na coluna da direita, por cima do
  lance; no celular, compacto, no alto, e o toque atravessa o cartão (tocar
  na opção de baixo escolhe a opção, não só fecha a mensagem). Fica fora da árvore de
  acessibilidade (o leitor de tela já ouve o lance), e com movimento reduzido
  só aparece e some. Temporada revista e tela recarregada não têm mensagem.
  O laboratório mostra cada variante.
- **Início sem carreira em andamento, e começar sem perguntar.** O Início não
  mostra mais a carreira em andamento, e Começar carreira, Jogo rápido e
  Jogar o desafio começam na hora, sem confirmação; a carreira de antes, com
  ao menos uma temporada, entra no Hall da Fama como interrompida. Sair da
  carreira para o Início continua pedindo confirmação, com o texto novo:
  abrir o jogo de novo volta para a carreira guardada. O laboratório também
  abre a carreira no resumo sem perguntar.
- **Editor de aparência.** As seções descem em colunas de jornal (sem o
  buraco que a grade deixava quando Pele dividia a linha com Olhos), a prévia
  do PC encolheu (320 para 260 px), a tela tem o tamanho do que tem dentro
  (nunca maior que a janela; numa janela baixa só o painel rola) e a aba Rosto
  segue o rosto de cima para baixo.
- **Textos de evento coerentes.** "Treinador particular" que dá errado só tira
  espaço no time (antes dava errado e ainda melhorava o jogador, o que não
  fazia sentido), com o motivo no texto: o técnico do clube não aceita treino
  por fora. Os eventos de final garantem a final: se o clube não chegaria a
  nenhuma, chega à do torneio mais importante que disputa (antes, "Título e
  nome na história" podia aparecer num ano sem final). "Deixar para outro" no
  pênalti decisivo também decide a final, metade das vezes a favor. Os
  efeitos "Vence a final" e "Perde a final" perderam o "se o time chegar a
  uma".

**Por quê.** Pedidos do produto.

## D46. Escudos que faltavam, e o desenhado como padrão

**Decisão (2026-10-08, pedido do produto).** Com a permissão do produto,
82 escudos de clubes e 5 selos de liga que faltavam foram baixados da
Wikipédia e do Wikimedia Commons (a imagem principal da página de cada
clube, conferida uma a uma numa folha de contato) e entraram em
`apps/game/public/assets/` com a extensão marcada nos dados do mundo. Ficaram
sem imagem real, desenhados, os 8 clubes e 3 ligas sem escudo encontrável
(Real Oruro, Vaca Díez, San Juan, Patriotas Boyacá, Santo Domingo, Atlético
El Vigía, Real Frontera, Marítimo de La Guaira; LigaPro Serie B, Liga 2,
Liga FUTVE 2). Ao mesmo tempo, o modo padrão de imagens passou a ser
`gerado`: o jogo sai com os escudos, selos e troféus desenhados, e as
imagens reais só aparecem num build com `VITE_ASSETS=real`. No modo
desenhado, "Imagens sem internet" some dos ajustes. A suíte ponta a ponta
gera o build no modo real, para continuar testando o cache de imagens.

**Por quê.** Pedido do produto: "como padrão, somente os escudos desenhados".
Os escudos reais são marcas dos clubes; o desenho do jogo é próprio.


## D47. Participação, continuidade e interface de leitura

**Decisão (2026-10-08, pedido do produto).** Motor `2.0.0-m8.3`.
Legado considera participação também nos títulos e prêmios; lendas veteranas
mantêm respeito mesmo no banco. Eventos ligados ao campo exigem rotação e
participação recente. A disputa com a joia da base é 50/50; estádio lotado
muda espaço no elenco, para servir a todas as posições. Nacionalização por
residência exige cinco temporadas seguidas no país e nenhuma estreia por seleção.
Títulos dão um ponto de OVR após evolução, em vez da antiga moral variável.
Estrelas acompanham a força, até um degrau da base, com mais resistência no 4/5.
Missões de legado são objetivos concretos, de uma lenda ou dois clubes como ídolo.

Interface clara por padrão, abas estáveis com movimento reduzido respeitado,
resultado sem sobreposição, retrato central, jornal esportivo e textos próprios
para renovação. Conquistas usam os catálogos de recordes e competições, com
quatro segredos e aposentadoria no clube de estreia. Hall suspenso e arquivos
antigos apagados; somente o save atual, contagens, conquistas e ranking persistem.
O caminho alternativo se chama “{sobrenome} hipotético”. README e GDD trazem
as fórmulas e os limites exatos desta revisão.

**Por quê.** Título coletivo não torna reserva uma lenda; escolhas precisam
ter efeito compreensível em qualquer posição. A leitura da próxima decisão
não pode ser coberta pela anterior. Catálogos automáticos evitam conquistas
faltando quando o mundo ganha competições. O produto pediu suspender o Hall.

**Calibragem da D47.** O bônus de cada temporada campeã é obrigatório,
inclusive acima do antigo teto suave e no declínio. Por isso a meta Normal
de pico passa de P±2 para [P−2, P+3], a diferença entre grupos de 2 para 3
OVR e a média de Bolas de Ouro de 1–2 para 1–2,25. O primeiro lote de 6000
mediu respectivamente +2,3 em Estrelas, diferença 2,4 e média 2,10; manter
os limites anteriores exigiria enfraquecer o bônus pedido ou alterar o
crescimento natural de todos. A fatia com ao menos uma Bola continua 40–60%,
e as metas de raridade dos recordes não mudam. Os alvos 1/2 das novas missões
são fixos; a calibragem só decide em quais talentos elas aparecem (15–55%
de cumprimento comum), evitando dois ídolos para Operários quando é raro demais.
O resultado fica no layout até a próxima escolha: remover no início do toque
deslocava os controles antes do clique no celular.

Na disputa com a joia da base, o sorteio altera os jogos planejados em +20% ou
−20%, em vez de um degrau de papel: subir de estrela já era limitado ao topo
e podia resultar em nenhuma mudança. Continua 50/50, independente do traço,
com os limites normais do calendário e das lesões.

O bônus de título é a última etapa, depois da devolução de capacidade temporária
e da garantia do atributo treinado no fim do período. Teste de regressão encontrou
um lateral aos 31 em que a garantia absorvia o +1 quando aplicada depois dele.
Jogo e caixas de areia seguem a mesma ordem; o bônus não pode ser consumido pelo treino.

**Validação da D47 (8/10/2026).** 547 testes unitários aprovados; 44 testes
ponta a ponta aprovados (quatro duplicações deliberadamente omitidas no celular),
com build de produção e auditoria de acessibilidade nos dois temas. As 51 metas
de `pnpm balance` passaram com 6000 carreiras por lote; 3000 carreiras calibraram
as missões e o lote de 2250 Fenômenos alcançou todas as marcas verificadas por
`pnpm balance:recordes`. Telas conferidas visualmente no PC e no celular.
Tipos de app, conteúdo e balanceamento passaram. Lint passou excluindo o script
preexistente `packages/world/scripts/manager-data.mjs` (escape desnecessário).
`pnpm verify` ainda para nos quatro exports ausentes de `@craque/world` usados
pelo módulo preexistente `packages/engine/src/manager/core.ts`: `MANAGER_CLUBS`,
`MANAGER_COUNTRIES`, `MANAGER_PLAYERS` e `MANAGER_YOUTH_NAMES`. Esse trabalho
paralelo não foi alterado nesta revisão.

## D48. Residência sem interrupção e validação iterativa obrigatória

**Decisão.** A nacionalização exige cinco temporadas consecutivas no mesmo país
estrangeiro. Sair interrompe a sequência; voltar exige cinco novas temporadas.
Transferências entre clubes do mesmo país preservam a sequência. A implementação
já aplica essa regra; testes de regressão agora cobrem saída, retorno e troca local.
Toda IA deve testar, corrigir falhas e melhorias necessárias e retestar após cada
mudança, repetindo até as verificações passarem sem defeitos conhecidos no escopo.
A obrigação fica centralizada em `AI_RULES.md`, lido pelos arquivos de entrada das IAs.

**Por quê.** Períodos separados não representam residência contínua. A entrega
precisa comprovar qualidade por verificações repetidas e comunicar qualquer
bloqueio real, sem confundir testes parciais com validação completa.

**Validação da D48.** Os 547 testes unitários passaram, incluindo regressões de
residência interrompida, retorno e troca entre clubes do mesmo país. Build e
lint passaram (lint exclui o script paralelo `manager-data.mjs`, conforme D47).
`pnpm verify` continua bloqueado pelos quatro exports do módulo `manager`
listados na D47. `pnpm balance:check`, com 2500 carreiras por lote, passou em
50 das 51 metas: a média de Bolas de Ouro foi 2,40, acima do teto de 2,25.
Essa pendência de calibragem não foi ocultada nem teve seu limite relaxado;
a D48 altera documentação e cobertura de testes, sem mudar resultados do motor.

## D49. Diploma com compromisso, rompimento do empresário e imagens dos troféus

**Decisão.** Estudar combina evolução ×0,9 com risco de lesão ×0,7. Só futebol
combina evolução ×1,1 com risco ×1,3. Ambos valem pelo período e aparecem no
preview e no resultado, nos três idiomas. Ficar no ultimato mantém torcida +4,
mas rompe com o empresário. Um efeito próprio restringe as propostas somente
na próxima decisão a força ≤ força atual −2. A restrição é consumida ao gerar
essa decisão, inclusive se for treino ou evento sem transferência, sem durar
até uma futura janela. Mercado, empréstimo, retorno e transferências de eventos
respeitam o teto; ficar continua possível e a restrição não força aposentadoria.

Competições e prêmios voltam a priorizar fotos reais, com fallback gerado.
Escudos e selos conservam o padrão desenhado. O laboratório distingue padrão
misto, todas reais e todas geradas. A suíte de navegador decodifica todas as
imagens de competições e prêmios nos dois modos, em celular e desktop.

**Por quê.** Uma opção determinística apenas negativa contra uma opção vazia
não oferece compromisso interessante. O rompimento precisa cumprir a ameaça
narrada sem virar penalidade permanente. As fotos das taças haviam sido
substituídas pelo modo gerado padrão; os desenhos carregavam, mas ocultavam as
imagens reais esperadas. Cada família de arte deve ter sua origem apropriada.

**Compatibilidade.** Motor `2.0.0-m8.4`, pois os mesmos eventos agora produzem
consequências diferentes. Saves anteriores seguem a política de versão do jogo.

**Ajustes encontrados na validação.** Troféus e prêmios passam a solicitar suas
imagens imediatamente, sem aguardar o carregamento adiado. O observador do Vite
ignora relatórios/resultados do Playwright: reescrevê-los derrubava o servidor
com `EBUSY` no Windows. O teste de trocar a carreira agora compara sementes,
pois dois jogadores novos podem sortear o mesmo sobrenome; a exigência de save
novo é preservada.

**Validação final da D49 (8/10/2026).** 550 testes unitários aprovados; 48
ponta a ponta aprovados, quatro duplicações omitidas no celular. Build de
produção/PWA aprovado pela suíte, tipos de app/conteúdo/balanceamento e lint
aprovados (mesma exclusão do script paralelo `manager-data.mjs` da D47).
Todas as imagens reais cadastradas e as artes geradas de competições/prêmios
decodificaram em Chrome, desktop e celular; fotos dos prêmios conferidas
visualmente no laboratório com o padrão misto. `pnpm balance` completo passou
nas 51 metas, com média de 2,11 Bolas de Ouro. O modo reduzido `--check` mantém
a pendência de amostra registrada na D48: 2,40, acima de 2,25; aumentar apenas
`--carreiras` não amplia o sublote de prêmios, que continua reduzido nesse modo.
Nenhuma regra de prêmios nem seu limite foi alterado para esconder a falha.
`pnpm verify` continua bloqueado pelos quatro exports ausentes do módulo
paralelo `manager`, listados na D47. O servidor de desenvolvimento reiniciado
com a exclusão dos relatórios permaneceu funcionando após a suíte.

## D50. Futeiros: um hub com dois jogos, aberto sempre na primeira tela

**Decisão.** O site passa a se chamar **Futeiros** e abre sempre no hub
(`apps/game/src/screens/hub/HubScreen.tsx`), com dois cartões: **Craque**, a
carreira de jogador que já existia, e **Técnico**, a carreira de treinador
nova. `startScreen` devolve `hub` para qualquer abertura no endereço do jogo;
só um caminho desconhecido (página não encontrada), um link de carreira
(`#c=`) e o `#lab` em desenvolvimento abrem outra coisa. A carreira salva do
Craque não abre mais sozinha: o cartão dele mostra o resumo do save e oferece
"Continuar carreira" (ou "Ver o resumo") e "Início do Craque". O Craque não
mudou de regra: `ENGINE_VERSION` continua `2.0.0-m8.4`, e o h1 do Início dele
continua "CRAQUE".

`SCREEN_GAME` (`app/navigation.ts`) diz de que jogo é cada tela: a barra mostra
a marca Futeiros (que volta ao hub) e uma etiqueta do jogo atual, e o painel de
erro de uma tela do Técnico não promete carreira salva nem oferece limpar o
save (D51). Manifesto, título, tela de abertura e páginas estáticas de erro
dizem "Futeiros". A página não encontrada volta ao hub. A tela de conquistas
tem a troca Craque/Técnico, e o Início do Craque conta só as dele (D54).

O hub não baixa motor nenhum: o motor do Técnico, os elencos e os textos dele
ficam em pedaços próprios, carregados só quando o jogador começa (medido no
build: o pedaço de entrada e o do hub não contêm `createCoachCareer` nem os
elencos; os elencos são um pedaço de cerca de 1 MB, guardado pelo service
worker para jogar sem internet).

**Por quê.** Pedido do produto: um portal com os dois jogos, o Técnico como
jogo de verdade e não como modo escondido. Abrir no hub é a única regra que
funciona para os dois ao mesmo tempo: o Técnico não tem save (D51), então
recarregar não pode "voltar para onde estava"; e o Craque continua a um toque,
pelo cartão. Manter o Craque byte a byte igual nas regras evita reabrir a
validação das 51 metas dele.

## D51. Técnico sem salvamento

**Decisão.** A carreira do Técnico vive só na memória da aba
(`features/tecnico/store.ts`, Zustand sem `persist`). Nada da carreira vai para
`localStorage`, `sessionStorage` ou IndexedDB. Ficam guardados só o rascunho
da identidade (`craque.v2.tecnico.draft`: nome, país, ritmo e aparência, como
o rascunho do Craque) e as conquistas liberadas (D54). A tela avisa em todos os
pontos: o cartão do hub ("Sem salvamento"), a identidade antes de começar, o
pedido de confirmação ao sair do Técnico, o `beforeunload` do navegador ao
recarregar ou fechar, o aviso de versão nova e o painel de erro. Recarregar
encerra a carreira e abre o hub. Sair para o hub sem recarregar mantém a
carreira nesta aba ("Em andamento nesta aba", "Voltar à carreira"); o legado
fica na tela até o jogador sair dele.

O motor continua determinístico e semeado (`coachRng(semente, rótulo, ...)`),
mas a semente é sorteada a cada carreira; só a suíte ponta a ponta fixa uma
pelo `sessionStorage` (`futeiros.e2e.seed`).

**Por quê.** Pedido explícito da especificação: sem save de carreira. Um
estado de 24 temporadas com o mundo inteiro jogado partida a partida também
seria grande para guardar e migrar entre versões; sem save, o Técnico pode
mudar de regra (`COACH_VERSION`) sem política de compatibilidade. O custo é
perder a carreira ao recarregar, e por isso o aviso aparece antes de cada
ação que pode perdê-la. A suíte ponta a ponta audita o armazenamento depois de
uma carreira inteira.

## D52. Elencos reais: FC 27, eFootball real com +4, conhecimento e gerados

**Decisão.** O Técnico joga com elencos de verdade nos mesmos clubes e ligas do
Craque. A montagem (`packages/world/scripts/elencos/`, `pnpm elencos:montar`,
offline e determinística) segue camadas, nesta ordem:

1. **EA FC 27** (`players.csv`, só homens). O FC 27 decide o clube de cada
   jogador, inclusive para tirar quem saiu de um clube do jogo para uma liga
   que o jogo não tem.
2. **eFootball**, só para clubes com menos de 20 jogadores do FC 27, e só
   jogadores reais (`fake_version = 0`). OVR = carta base + 4. Times sem
   licença (jogadores fictícios) são descartados e listados no relatório.
3. **Conhecimento**: jogadores reais escritos à mão, com OVR estimado, para
   completar elencos sem fonte (Série B, ligas sul-americanas pequenas).
4. **Gerados** pelo jogo, até 22 jogadores com 2 goleiros, na escala dos reais
   da mesma liga. Na tela, jogador gerado tem a marca ◆ "Fictício".

Medido na montagem: em 80 jogadores presentes nas duas fontes, o FC 27 fica
4,5 abaixo da carta base do eFootball + 4 (mediana). O +4 foi mantido como
pedido, e o laboratório mostra a diferença. Segundas divisões sem pelo menos
cinco clubes medidos ganham um **ajuste da 2ª** (`DIVISION_GAP = 2,5` abaixo
do percentil 25 dos 14 melhores da primeira divisão do país), para os elencos
gerados não ficarem fracos demais perto dos reais rebaixados. Cada clube fica
com no máximo 30 jogadores acima de 21 anos; os cortados vão para os livres.

Resultado (`packages/world/data/squads/relatorio.md`): 12.609 jogadores em 489
clubes, 8.415 do FC 27, 818 do eFootball, 133 do conhecimento e 3.243 gerados.
As primeiras divisões europeias, a MLS e a Liga MX são 100% reais; a Série A
95%; a Série B 16%; as segundas divisões sul-americanas quase todas geradas.

**Por quê.** Pedido do produto, com a ordem de fontes definida pelo usuário.
Jogador fictício do eFootball não é jogador real, então não entra. As lacunas
são sinalizadas na interface (◆ e o aviso na escolha do país), nunca
escondidas. O ajuste da 2ª corrige o que o harness mostrou: com Ceará e Sport
reais caindo numa Série B gerada, o campeão fazia 100 pontos.

## D53. Nacionalidades do treinador e inscrição

**Decisão.** O treinador escolhe entre os 15 países que têm segunda divisão no
jogo (`COACH_COUNTRIES`): ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER,
ITA, PAR, PER, URU e VEN. México e Estados Unidos ficam de fora: sem segunda
divisão, o sorteio de 95% de segunda das propostas iniciais seria impossível.
Os dez países com segunda divisão completada com gerados levam a marca ◆ na
escolha.

Inscrição automática (`REGISTRATION`): Inglaterra com 25 acima de 21 anos e os
mais jovens fora do teto; os demais com 30 e o mesmo corte de idade. A regra de
formados no país (homegrown) não é aplicada. Banco de 12 no Brasil, Itália e
Argentina e de 9 nos demais; cinco substituições em três paradas além do
intervalo (IFAB).

**Por quê.** A regra das propostas iniciais é o começo do jogo e precisa valer
para todos. A inscrição inglesa completa (homegrown) complica sem criar escolha
interessante; o teto de idade já faz o jogador pensar em quem subir da base.

## D54. Conquistas do Técnico

**Decisão.** O Técnico tem 19 conquistas próprias (`COACH_ACHIEVEMENTS` em
`packages/content/src/coach.ts`, ids `tecnico:*`): primeira temporada,
carreira completa, acesso, dois acessos, salvar da queda, primeiro título,
liga, continental, Mundial de Clubes, Mundial com clube de fora da Europa,
tríplice coroa, dez títulos, do fundo ao topo, fiel a um clube, trabalho no
exterior, três países, revelações da base, recuperação e reputação. Ficam no
mesmo banco de conquistas do Craque, liberadas quando a temporada vira ou a
carreira acaba. O hub e a tela de conquistas contam cada jogo em separado; o
Início do Craque conta só as do Craque.

**Por quê.** As conquistas são a única coisa do Técnico que sobrevive ao
recarregar (D51): dão memória ao jogo sem save. Separar a contagem evita que o
Técnico mude os números que o Craque já mostrava.

## D55. Calendário e competições do Técnico: só clubes, por enquanto

**Decisão.** O Técnico joga as mesmas competições de clubes do Craque, partida
a partida: liga em turno e returno (método do círculo), copa nacional em
mata-mata (Copa do Brasil em ida e volta a partir das oitavas), copa da liga
inglesa (semifinal em ida e volta), supercopas, continentais com preliminar,
grupos e mata-mata conforme o número de classificados, supercopa continental,
Intercontinental e Mundial de Clubes nos anos em que `ano % 4 == 1` (cotas
UEFA 12, CONMEBOL 6, CONCACAF 4). A temporada tem 300 dias de jogos e 65 de
férias; no ritmo lento, o primeiro turno termina no dia 149. Cada fase de
mata-mata é sorteada quando a anterior acaba: o resultado do treinador muda
quem segue.

**O Técnico não tem seleções nem competições de seleções, por enquanto**
(instrução do usuário em 8/10/2026). Nenhuma convocação, Copa do Mundo, copa
continental de seleções ou data FIFA entra no calendário dele; a tela de
competições diz "Só competições de clubes" e o hub diz "Mundo vivo, sem
seleções". O Craque continua com as seleções dele.

**Por quê.** Calendário de clubes completo já entrega o que o técnico decide
(elenco, rotação, mata-mata), e as seleções exigiriam convocações e datas que o
pedido deixou para depois. Força relativa: só o elenco conta, sem bônus de
continente (a sonda "trocado" do harness inverte o resultado quando os elencos
trocam de clube).

## D56. Contratar muito acima do próprio nível é quase impossível

**Decisão.** A chance de um negócio é a do jogador querer vezes a do clube dele
liberar (`coach/market.ts`, números em `PURCHASE`). O jogador compara a
**atratividade** do comprador (força, prestígio, liga, continental, reputação
do técnico) com a **expectativa** dele: o próprio OVR, menos um desconto de
ambição de até 3 pontos quando ele está num clube abaixo do próprio nível
(livre: OVR − 3). A vontade cai com a lacuna, `σ((2,5 − lacuna) / 1,6)`, com a
descida de nível, com ser estrela (85+) e com o papel que teria; nunca é zero
(piso 0,0001). O clube libera pelo papel (estrela 25%, titular 55%, rotação
80%, reserva 92%), menos ainda para um comprador mais fraco. A tela mostra a
faixa (quase impossível abaixo de 5%, difícil abaixo de 25%, possível abaixo de
55%, provável), e a busca esconde os quase impossíveis até o jogador pedir. O
laboratório abre a conta inteira, termo a termo.

Na mesma calibragem: a verba da temporada é 40% da receita
(`FINANCE.budgetShare`), mais 30% do caixa acima de 20% da receita e metade da
sobra da temporada anterior, para quase todo clube de segunda divisão ter pelo
menos três alvos do próprio nível ao alcance (98,2% no harness); avaliação com crédito inicial 0,5 por clube novo, confiança
`50 + 12s + 15C` e demissão abaixo de 27, para 8% a 15% de demissões por
temporada com a política equilibrada.

**Por quê.** Pedido do produto: trazer alguém muito melhor deve ser muito
difícil, e um craque mundial num clube pequeno, quase impossível, com a conta
à vista. Medido no harness: Mbappé no Flamengo 0,0497%; a mediana cai a cada
degrau de diferença de OVR; +8 fica abaixo de 5% e +12, abaixo de 0,5%.

## D57. O `verify` volta a rodar inteiro: lote completo de Fenômenos no modo reduzido e metas do Técnico

**Decisão.** No `pnpm balance:check`, o lote de Fenômenos de ataque joga as
mesmas 400 carreiras do `pnpm balance` completo (antes, só as 150 primeiras da
mesma semente). Nenhuma meta mudou. O `pnpm verify` passa a rodar também o
`pnpm balance:tecnico:check`, a mesma rodada do relatório versionado (16
carreiras de 24 temporadas, semente `tecnico-m1`), sem gravar arquivo, depois
das metas do Craque e antes do build.

**Por quê.** A pendência registrada na D48 e na D49 era de amostra, não de
regra: as 150 primeiras carreiras dão média de 2,40 Bolas de Ouro, acima do
teto de 2,25, e as 400 dão 2,11, dentro da faixa, como o relatório completo.
Usar o lote inteiro custa cerca de 14 segundos e deixa o modo reduzido medir o
mesmo que o completo. As metas do Técnico são determinísticas pela semente.
Uma rodada menor (8 carreiras de 12 temporadas, 48 temporadas da política
equilibrada) oscilava por amostra: 18,8% de demissões contra 11,5% nas 192 da
rodada completa. Por isso o `verify` roda a mesma rodada do relatório, cerca
de 3 minutos; uma mudança no motor do Técnico que quebre uma meta para a
entrega, e o que ele mede é o que o relatório mostra. O Craque não mudou de regra
(`ENGINE_VERSION` continua `2.0.0-m8.4`); as notas da D47 à D49 sobre o
módulo `manager` falavam de um módulo que não existe neste repositório (D50).

## D58. Ajustes do Técnico na revisão final

**Decisão.** Cinco correções no Técnico, achadas ao conferir o código contra a
especificação e contra a tela:

1. **Pedir verba tem confirmação.** Abrir a ação mostra as chances de muita
   verba, pouca verba e recusa, com os valores (`fundsPreview`); confirmar
   gasta a ação e sorteia a resposta; cancelar antes não custa nada, como em
   todas as ações. `FUNDS.large` e `FUNDS.small` passam a ser as frações da
   receita (6% e 2,5%) que a conta já usava.
2. **Desfazer uma promessa não é cumpri-la.** A resposta "Desfazer a promessa"
   deixa a promessa com o estado "desfeita", que não conta na avaliação (antes
   contava como cumprida e valia +0,2).
3. **As promessas de não vender e de jogos para os jovens existem de verdade.**
   "Manter no elenco" (Proposta pelo reserva) promete não vender o jogador até
   o fim da temporada; "Apoiar os jovens" (Briga no vestiário) promete 8 jogos
   aos jovens de até 21 anos (`PROMISES.youthGames`). A cobrança, o bloqueio
   da venda e a prioridade dos jovens na escalação já estavam no motor, sem
   nada que criasse essas promessas. Os textos dos resultados dizem a promessa.
4. **Veteranos do começo não desabam.** A longevidade dos jogadores que já
   estão num elenco no início tem um piso: o declínio não pode ter começado
   mais de um ano antes (`EVOLUTION.veteranOverStart`). Um meia de 36 anos com
   longevidade sorteada de −3 perdia de 8 a 10 de OVR já na primeira temporada.
5. **Limpeza.** Sai a situação "lesão" da decisão no jogo (nunca era
   disparada); os números escritos à mão viram constantes do `tuning.ts`
   (Incansável, Líder, volta da fase sem jogar, situação financeira, verba da
   temporada); saem constantes sem uso. A conquista "Fábrica de craques" passa
   a pedir o que o texto diz: 5 jogadores subidos da base que chegam a 30 jogos
   com o treinador. No legado, os números dos jogadores ganham rótulo ("41
   jogos · melhor OVR 76"). Na tela, os rótulos em caixa alta não cortam mais
   o til e o acento, e a identidade empilha os botões abaixo de 400 px.

**Por quê.** Toda ação precisa mostrar o efeito antes de gastar a vaga, e
"cancelar antes de confirmar não gasta ação" vale para as sete. Promessa
desfeita contando como cumprida premiava a quebra. As promessas de não vender
e de dar chance aos jovens estavam na especificação e no motor, mas nenhum
caminho as criava. O despencar dos veteranos aparecia no primeiro resultado de
quase toda carreira. As metas do harness seguem 23 de 23
(`tools/balance/relatorios/tecnico.md`).

**Validação da entrega D50 a D58 (9/10/2026).** `pnpm verify` passou inteiro:
tipos, regras, 632 testes unitários (motor 281, conteúdo 139, app 144, mundo
35, balanceamento 10, terminal 15, arte 8), as 51 metas do Craque no
`balance:check`, as 23 metas do Técnico na rodada do relatório e o build.
A suíte ponta a ponta passou duas vezes seguidas (57 testes, 5 pulados de
propósito: duplicações no celular), com o Chromium do contêiner
(`PW_CHROMIUM_PATH`). Uma rodada anterior falhou uma vez no teste "sem
internet" do celular sob carga (o hub não abriu sem rede); não voltou em três
rodadas completas nem em 18 repetições com 4 trabalhadores, e fica registrada
aqui. Telas do Técnico conferidas por fotos em 360 × 640, 375 × 812 e
1280 × 800, claro e escuro, em português, espanhol e inglês, sem rolagem
lateral nem erro no console.
