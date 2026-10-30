# Futeiros v2: Craque e Técnico

## Estado atual e leitura inicial (D111, 30/10/2026)

O projeto ativo é exclusivamente esta pasta `v2/`: React, Zustand e Vite.
Craque usa **`ENGINE_VERSION 2.0.0-m41`**; Técnico usa **`COACH_VERSION 1.10.0`**.
Para começar do zero, leia `AI_RULES.md`, este resumo, a arquitetura e os comandos
abaixo, o [GDD](docs/GDD.md) e o [README do Técnico](README-TECNICO.md).
As revisões D73 a D111 ao fim dos documentos detalham o estado atual e prevalecem
sobre descrições históricas do mesmo assunto. [DECISOES.md](docs/DECISOES.md)
registra o motivo das escolhas; os relatórios em `tools/balance/relatorios/`
registram resultados observados, sem garantir ocorrências raras.

- **D89:** lance errado nunca vence (mata-mata elimina, liga no máximo empata);
  o lance jogado que decide vale mais torcida, legado na final e um reconhecimento
  ("Destaque do jogo"); semifinal ou final podem vir depois da fase anterior da
  mesma copa; a promessa é decisão principal, no lugar da janela comum; Bola de
  Ouro +0,5 a +1 a partir de 90 de OVR; propostas com memória dos últimos clubes.
  Detalhes na seção D89 ao fim.
- **D90:** todo ano anual abre com decisão principal; até cinco decisões por
  ano; erro custa de 1 a 10 de torcida pela competição e fase; lenda/ídolo mais
  difíceis; goleiro raríssimo na Bola de Ouro; Luva de Ouro vira Troféu Yashin;
  colocações nos detalhes da temporada. Detalhes na seção D90 ao fim.
- **D91:** janela sem proposta vira treino (proposta garantida a cada três
  anos); Bola de Ouro mais difícil quanto mais atrás; goleiro adivinha o canto
  do pênalti; disputas de pênaltis raras para defensor e goleiro; resultado do
  lance em verde, amarelo, laranja e vermelho. Detalhes na seção D91 ao fim.
- **D92:** os 21 recordes possíveis e raros (8 Bolas de Ouro e 146 gols pela
  seleção destravados); três recordes novos de referência. Seção D92 ao fim.
- **D93:** as três marcas novas com número e detentor reais (Messi 32
  assistências, ter Stegen e Liaño 26, Marquinhos 11 na França); todos os 21
  recordes podem ser superados. Seção D93 ao fim.
- **D94:** recordes em faixas de raridade (clássico, raro, épico, lendário);
  recordes à vista e "faltaram N"; conquistas com raridade visual; jornal com
  selo de recorde; final "vale recorde"; um em quatro desafios do dia persegue
  um recorde com Fenômeno. Seção D94 ao fim.
- **D95:** a última página do jornal é a despedida; selo de recorde em
  medalha, sem cobrir a manchete e sem chegar antes da página na virada;
  jogos sem sofrer gol só conta como goleiro; seleção só nos detalhes de quem
  jogou por ela; faixa "Clássico"; folha mais alta; Início sem "Editar
  jogador". Seção D95 ao fim.
- **D96:** tabela da liga no jogo decisivo de liga; selo da terceira opção pelo
  resultado; recordes à vista só enquanto podem mudar; sai "Uma semana sem
  holofotes" (38 acontecimentos, motor m30); jornal sem transbordo; números
  por clube na linha do tempo; entrada do desafio mais limpa. Seção D96 ao fim.
- **D97:** totais da carreira somam clube e seleção; assistências da seleção na
  linha do tempo; tabela da liga que se reordena à vista; capa do jornal sem
  sobreposição. Seção D97 ao fim.
- **D98:** tabela da liga de tamanho fixo e animada (faixa em tela baixa);
  resultado do lance em 2,5 s; aba Seleção completa. Seção D98 ao fim.
- **D99:** "Pular resultado automaticamente" nos Ajustes; segurar o clique
  segura o resultado; resumo em Números, Troféus, Linha do tempo, Jornal e
  Hipotético; a biografia saiu do jogo. Seção D99 ao fim.
- **D100:** pontas e MEI perto dos recordes de temporada (metas por posição),
  MEI menos certeiro nas assistências, caudas de recorde ajustadas,
  assistências numa temporada vira Raro. Motor m31. Seção D100 ao fim.
- **D101:** centroavante Fenômeno com 5% ou mais no recorde de gols numa
  temporada (vira Raro); vitrine com Bola e Chuteira de Ouro primeiro; jornal
  abre com o recorde de mais valor. Motor m32. Seção D101 ao fim.
- **D102:** centroavante Fenômeno entre 4% e 5% no recorde de gols numa
  temporada (4,43% em 27.000 carreiras). Motor m33. Seção D102 ao fim.
- **D103:** superar Bola de Ouro, sequência de Bolas e Chuteiras de Ouro fica
  possível (a pressão para de crescer na marca real). Motor m34. Seção D103 ao fim.
- **D104:** o centroavante alcança o recorde de gols pela seleção (cauda de
  138, escala 7). Motor m35. Seção D104 ao fim.
- **D105:** goleiro na seleção perto de 12%; recorde novo de Jogos de Champions
  League (183); medição de Craque e Estrela. Motor m36. Seção D105 ao fim.
- **D106:** Bola de Ouro com protagonismo e títulos em escada (a Copa vale mais
  que a Champions); legado na seleção pela tradição do país; troca de empresário
  com janela garantida; concorrência na posição só perto da força do clube; o
  ritmo Normal não abre ano em jogo-chave; bolinhas que reveem o resultado; jornal e
  jogo-chave com mais variação; criador de personagem ampliado. Motor m37.
  Seção D106 ao fim.
- **D107:** erro no jogo-chave tira um pouquinho na Bola de Ouro e o jogo
  coletivo soma um pouquinho; top 10 da Bola de Ouro nos detalhes da temporada;
  "Manter o número" na homenagem; explosão jovem; promessa sempre julgada no
  Rápida; notas do jornal sem sobreposição; bandana fora. Motor m38.
  Seção D107 ao fim.
- **D108:** Portugal (duas ligas, três copas, 36 clubes); Liga das Nações da
  UEFA; Troféu Kopa no lugar do Revelação; Chuteira e coroas somam à Bola de
  Ouro; dispensa do banco até os 22 (depois 5 anos de casa); primeira carreira
  de Promissor para cima; Copa Bicentenario fora; capa do jornal sem corte;
  troféus novos. Motor m39, Técnico 1.10.0. Seção D108 ao fim.
- **D109:** cada torneio de seleções no ano real; Bola de Ouro com menos peso
  do OVR e top 10 pela posição; Kopa pelo desempenho; primeira carreira Craque
  ou Estrela; carreira até 2050; ritmo e dificuldade na tela de quem é você;
  Voltar da aparência descarta; troféus sem fundo. Motor m40. Seção D109 ao fim.
- **D110:** sem o Início do Craque (tudo na tela de quem é você); hipotético
  com sorteio refeito; briga com a diretoria sem sorteio; o batedor do time.
  Motor m41. Seção D110 ao fim.
- O Craque tem **38 acontecimentos (D96) e 55 cenas de partida** (D91: duas disputas de pênaltis raras). Partidas, promessas
  e reinvenção são etapas do mesmo ano, organizadas em `career/drama.ts` e
  `career/matchMoments.ts`. Finais continentais vêm após outros jogos de clubes
  e antes dos jogos de seleção. Rival pessoal foi removido; rivalidade entre
  clubes continua. “Um treino aberto no bairro” saiu do catálogo. Pé preferido
  não aparece na criação; o campo legado continua compatível com os replays.
- No rápido, o período cobre duas temporadas, com no máximo uma partida por
  ano. Cada ano é revelado quando sua decisão termina; promessas somam os dois
  anos. Treino tem efeito imediato. Reinvenção é opcional: idade mínima 33,
  perda de pelo menos dois de OVR nos últimos dois anos e convite semeado de
  45%. Benefícios e custos aparecem em chips; o caminho permanece no motor.
- Chances usam os atributos específicos da ação (95%) e OVR (5%), vezes
  `limitar(1 + (OVR - média atual da divisão) × 0,004; 0,90; 1,10)` em clubes.
  Seleções não recebem o fator da liga. Tetos: protagonismo 70%, coletivo
  sorteado entre 70% e 80%, conservador entre 70% e 90%. Exceções explícitas:
  gol olímpico 8%, bicicleta 35%, goleiro na área 18%/40%, pênalti de linha
  70%, defesa de pênalti 50% por adivinhar o canto (60% com especialista, D91),
  cobrança rara 80% (defensor) e 75% (goleiro), companheiro cobra a 50%.
  Bônus de veterano e ajuste por idade continuam sujeitos aos tetos.
- Bicicleta precisa de autorização de 20% dentro da família elegível, inclusive
  ao repetir cenas. Há participações raras fora da posição e goleiro na área
  apenas no mata-mata. Em liga, 18% dos lances começam um gol atrás: acerto
  busca empate, erro mantém derrota ou sofre outro gol. Começando empatado,
  erro que não resolve a partida tem 12% de terminar empatado. Placar inicial
  varia; resultado individual e resultado da equipe são coisas distintas.
- O destaque ajuda mais um elenco fraco: adicional à ajuda base de
  `participação × limitar((76 - força) / 16; 0; 1) × limitar((OVR - força - 8) × 0,12; 0; 2)`.
  Não garante título. Reconhecimento dá até `0,55` de capacidade por ocorrência,
  no máximo três/ano, reduzindo até zero em potencial +2 (D78). Não compra OVR
  integral por título. Valor de mercado considera idade, OVR e média da divisão
  atual, com fator de liga entre 0,55 e 1,10 e teto etário de até €400M.
- Resultado aparece na mesma decisão; placar tem animação própria, escolha fica
  marcada e aviso chega no clique. Leitura dura 2.100ms e saída lateral 560ms.
  A apresentação conserva o espaço e o tema do card até a saída terminar,
  inclusive no celular; só então mostra a próxima revista. Movimento reduzido
  remove a animação. Não há animações procedurais de resultado em Canvas.
- Jornal tem duas folhas do mesmo ano, capa e bastidores; segunda folha vazia
  quando não há conteúdo. No celular, visão proporcional e leitura ampliada.
  As setas junto de fechar mudam a temporada sem fechar a leitura, conservando
  capa/bastidores e desabilitando nos extremos. Crônicas usam terceira pessoa
  em PT/EN/ES; feedback da partida permanece direto ao jogador. Texto usa
  Schibsted Grotesk, com 14px na crônica ampliada e promessa em negrito.
- Cada decisão de partida é uma **transmissão** (D83): a competição tem cores,
  padrão de fundo, selo, filete e LED próprios (estrelas na Champions, raios de
  ouro na Libertadores, globo no Mundial, mosaico na Euro, tecido andino na Copa
  América, o DNA do país nas ligas e a chave do mata-mata nas copas), e o time de
  quem joga entra no brilho, no filete do lance, nas barras do placar e no
  cachecol ou bandeira do cabeçalho. Só interface; o motor não muda.
- “Semana de clássico”: provocar mantém 55% para torcida +12, falha -10;
  **Respeitar o rival custa torcida -2, sem sorteio**. Laboratório e ferramentas
  para forçar decisões existem só em desenvolvimento e usam as peças reais.

O motor é puro, determinístico e separado do texto e da interface. Saves guardam
setup e escolhas, reconstruídos por replay, com versão obrigatória. Mudanças no
resultado exigem nova versão, `pnpm balance` e as 51 metas. Antes de entregar:
`pnpm verify` e `pnpm e2e`; mudanças em produção/títulos exigem também auditoria
de recordes. As amostras de navegador atuais são replays **m36**, reconstruídos
com escolhas válidas, não resultados fabricados.

> **Futeiros (D50 a D61).** O site virou um hub com dois jogos de futebol e
> abre sempre nele: **Craque**, a carreira de jogador descrita neste README
> (motor `2.0.0-m36`), e **Técnico**, a carreira de
> treinador nova (motor próprio `COACH_VERSION 1.9.0`, 24 temporadas, elencos
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
2. **Quem é você.** Sobrenome, número dos sonhos (opcional), país (211
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
   mercado), o resumo traz os números, a vitrine de troféus, a linha do tempo,
   jornal, recordes reais igualados ou batidos, o pôster para compartilhar e
   o "E se...?".

### 1.2 Regras de produto que valem para tudo

- **O laço cabe numa tela.** Decisão, lance e jornal nunca rolam a página, do
  celular de 360 × 640 ao PC (D23). Só as telas de exploração (histórico,
  resumo, vitrine, conquistas) rolam.
- **Ritmos.** Na tela, "Normal" é uma temporada por decisão (o padrão; no
  código, `intense`) e "Rápida" são duas (no código, `normal`). O GDD antigo
  usa "Intensa" para o Normal de hoje.
- **Dificuldades.** Normal e Difícil. O Difícil muda a chance de talento,
  cresce menos (×0,86), envelhece mais rápido (×1,25), machuca mais (×1,6),
  tira 3 do nível de mercado e dispensa mais cedo.
- **Idiomas.** Português (fonte), espanhol e inglês, em tudo, inclusive textos
  gerados (manchetes, capas, jornal).
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
- `ENGINE_VERSION` (`version.ts`, hoje `2.0.0-m18`) sobe sempre que a mesma
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
     `(base da posição + oportunidades de finalização) × e^(n × v(OVR − oposição)) × e^(0,03 × v(time − oposição)) × e^(0,035 × (Finalização − OVR)) × fase`,
     onde `v(d)` vale d até 10 e `10 + 0,12 × (d − 10)` acima (o joelho que
     impede 60 gols todo ano) e `n` é 0,032, 0,0365 para o centroavante (D102) e
     0,05 para pontas e meia ofensivo (D100). Base de gols por jogo: centroavante 0,385;
     pontas 0,285; meia ofensivo 0,275; meias abertos 0,15; volante e laterais
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
  dos 18 países com liga jogável recebe clubes da confederação ou do mundo
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
  mercado, força do clube e bônus de prêmio (as marcas de história da
  biografia saíram na D99).
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

525 clubes com força (40 a 92, na escala do OVR) e prestígio (1 a 5), 211
seleções, 34 ligas (primeira e segunda divisão) de 18 países jogáveis
(ARG, BOL, BRA, CHI, COL, ECU, ENG, ESP, FRA, GER, ITA, MEX, PAR, PER, POR,
URU, USA, VEN), 85 competições (com a Liga das Nações da UEFA, D108), prêmios e uniformes. As notas dos clubes saem e
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
- **Luva de Ouro** (goleiros), **Troféu Kopa** (até 21 anos, 20 jogos; era o Revelação, D108).
- **Chuteira de Ouro**: só clubes da UEFA. A marca a bater é o artilheiro que
  ganharia sem o jogador, máx(28, N(35; 3,5)), mais 1,2 por Chuteira seguida;
  ganha quem faz mais gols de liga que isso.
- **Artilheiro e Craque de cada competição** (ligas, copas, continentais,
  Mundial, torneios de seleção): artilharia contra a marca dos artilheiros
  reais daquela competição (abaixo dela, impossível; acima do recorde,
  certa); craque por nota de desempenho, com mínimo de 60% dos jogos.
- **Recordes reais** (GDD 26, 18 marcas conferidas em setembro de 2026, mais 3 desde a D93: 32 assistências numa temporada, 26 jogos sem sofrer gol numa temporada de liga e 11 títulos da liga francesa): 73
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

Números da carreira, vitrine de troféus, linha do tempo, o jornal da carreira (capas por temporada), recordes
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
├─ packages/content/  todos os textos do jogo (pt, es, en): eventos, capas, manchetes, jornal,
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
| `src/features/` | Estado da carreira (`career/store.ts`, Zustand), save, rascunho do jogador, lance (`play.ts`) e mensagem (`resultView.ts`), transmissões das decisões de partida (`career/broadcast.ts`, `broadcastPackages.ts`, `broadcastMotifs.ts`, `teamColors.ts`; D83), "E se...?", resumo (pôster, link, vitrine), desafio (relógio), persistência (pasta `hall`: banco, ranking, conquistas), aparência, ajustes; o Técnico em `features/tecnico` (carreira só em memória, presença para o hub, rascunho, `view.ts` que esconde o rendimento) |
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
  `VITE_ASSETS=real` (D111; era `gerado`, D46):** o jogo usa a imagem real
  quando existe e a desenhada quando falta (sem internet e fora do cache,
  nenhum escudo aparece quebrado). Num build com `VITE_ASSETS=gerado`, só a
  arte desenhada (bandeiras continuam reais). Há escudo real para 518 dos 525
  clubes e selo real para 31 das 34 ligas (os escudos e selos que faltavam
  vieram da Wikipédia e do Wikimedia Commons, D46 e D111); o laboratório troca
  o modo sem rebuild.
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
  iguais, capas e manchetes coerentes), app (save, lance, contagens, desafio).
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
`iniciar.bat`. Para versões novas, feche o jogo e execute `atualizar.bat`; o
iniciador avisa quando houver atualização. São ferramentas temporárias para testes
([guia e remoção](scripts/README-WINDOWS.md)). O instalador prepara Node LTS se necessário e dependências com
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
- **Fim de carreira**: uma carreira jogada sozinha, com pôster e
  "Abrir no resumo".
- **Cartas**: a carta nas cinco faixas, números que contam, selos Difícil e
  Desafio.
- **Design**: as peças da interface, avisos e a mensagem do resultado em todas
  as variantes; as decisões de partida com o seletor de competição e a vitrine
  Transmissões, com as 80 competições e qualquer seleção (D83).
- **Mundo**: clubes por país e divisão, com as notas, e as 211 seleções.
- **Arte**: escudos, selos, troféus e prêmios, reais e gerados.
- **Avatar**: o criador de personagem e uma galeria.
- **Motor**: um jogador evoluindo dos 16 aos 40 contra a faixa de jogadores
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


## Revisão D78: evolução, variedade e ritmo rápido (20/10/2026)

Craque `2.0.0-m19`; Técnico `1.9.0` preservado. Esta revisão substitui os números e comportamentos anteriores que conflitem com ela.

- O resultado de partida fica por **2.100 ms de página visível**, antes do arrasto de 560 ms já existente. Continuar permite avançar antes. Revelação, placar LED e aviso imediato conservam o acabamento D77.
- Finais continentais, incluindo Champions e Libertadores, vêm depois dos outros jogos de clube do ano. Qualquer jogo de seleção vem depois delas.
- **48 situações de partida**, antes 21, com 27 novas situações distribuídas por posição e opções específicas para o contexto. O planejamento evita cenas já jogadas nos dois anos anteriores e repetições na fila atual enquanto houver alternativas. Marcação coletiva é uma ação defensiva, sem assistência artificial. Probabilidades continuam ocultas e usam OVR e atributo da ação.
- No ritmo rápido (Normal, duas temporadas), há **no máximo duas decisões de partida, uma por ano**. A primeira temporada fica completa no histórico e no lance quando a primeira partida termina; a segunda só é simulada depois de sua própria decisão. Se só houver partida no segundo ano, o primeiro já está disponível; se só houver no primeiro, ambos são revelados depois dela; sem partidas, os dois são revelados direto. A faixa no celular permite abrir o resultado completo entre os lances. Uma decisão auxiliar não apaga o ano já revelado.
- A promessa do ritmo rápido é feita no começo do período e soma os dois anos, com prazo explícito. A menor meta é 20, as demais sobem de dez em dez; a base adaptativa usa a produção anterior vezes o número de anos. Um único relatório e prêmio/custo aparecem ao fechar o segundo ano. No último período incompleto, usa apenas o ano restante. No ritmo anual, permanece uma temporada.
- Reinvenção de veterano usa os ícones do Design System, cards próximos do foco de treino e chips curtos de benefício, acompanhados do custo. Efeitos, idade de elegibilidade e seis caminhos são preservados; a descrição completa continua acessível.
- O hipotético usa título na fonte de leitura e lista **a primeira decisão principal de cada ano**, sem partidas, promessas ou reinvenções. O índice original da escolha é conservado, portanto seguir dali continua reconstruindo o ponto certo.

**Evolução D78.** Títulos, prêmios e promoção deixam de comprar até três pontos inteiros de OVR por ano sem considerar o potencial. Contam até três reconhecimentos. Depois do crescimento, declínio, treino e devolução temporária, o ganho de capacidade é `min(3, reconhecimentos) × 0,55 × limitar((P + 2 − nível total) / 5, 0, 1)`. Cada reconhecimento soma até 0,55 de capacidade; o retorno cai perto do potencial e zera em P + 2. OVR continua derivado dos seis atributos, limitado a 99. Treino específico mantém +2 mínimo imediato; eventos, boas temporadas e escolhas ainda permitem auges excepcionais. Não se alteram sorteio de talento, faixas de potencial, minutos ou chances dos adversários para compensar a dificuldade.

**Régua de prêmio D78.** Como Fenômeno deixa de significar OVR perto de 99 por muitos anos, a referência de Bola de Ouro passa a média de **0,4 a 1,25** e **20% a 45%** das carreiras de Fenômenos de ataque com ao menos uma. A faixa anterior de 1 a 2,25 e 40% a 60% dependia da inflação removida. São preservadas as outras 50 metas, inclusive os limites de recordes raros, produção e justiça entre posições. O Desafio é recalibrado pelo mesmo percentil 65 e pelos mesmos critérios de cobertura, sem mudar probabilidades para fabricar prêmios.

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

## D82: clássico, crônica e leitura contínua (21/10/2026)

Craque `2.0.0-m23`; Técnico `1.9.0`. Respeitar o rival na Semana de clássico custa torcida -2, sem sorteio. Os resultados nos três idiomas explicam o custo, sem dizer que a torcida aprovou. As outras opções e probabilidades desse evento permanecem.

O jornal relata o jogador em terceira pessoa em todas as famílias de lance; o feedback imediato continua em segunda pessoa. Crônicas usam Schibsted Grotesk, com 14px na leitura ampliada, e a conclusão da promessa usa a mesma fonte com peso 700 (16px ampliada). O cabeçalho ampliado tem setas anterior/próxima ao lado do X, contador e ano. Navegar conserva a folha escolhida, mantém a leitura aberta e respeita os extremos. Ao abrir durante uma virada, termina no destino pedido antes de iniciar a leitura.

A janela da decisão mantém o contexto de apresentação e o progresso anterior até a saída lateral terminar (560ms). A nova temporada e sua revista só reorganizam o espaço depois; nenhuma etapa do motor é repetida e os 2.100ms de leitura do resultado permanecem. Durante a saída não há segundo clique numa opção. Movimento reduzido completa a mesma passagem sem deslize. Laboratório usa as peças e textos reais; a nova navegação pertence ao jornal da carreira.

**Verificações D82.** `pnpm verify` integral aprovado: tipos, lint, 1.032 testes unitários, 27 cenários Windows, metas dos dois jogos e build. Tipos, lint, a resolução real de respeitar o rival e os 335 testes de conteúdo foram reconferidos após o acabamento. Balanceamento ampliado com 6.000 carreiras por lote: 51/51 metas aprovadas, mundo a 1,03 ms/temporada. Auditoria do laço no m23: 144 carreiras, 2.853 temporadas, 2.444 partidas e 175 promessas (38 cumpridas), cobrindo os seis caminhos de veterano, sem falhas de ordem, limites, prazo ou replay. Relatórios do motor atualizados em `tools/balance/relatorios/`. A auditoria de recordes D81 permanece identificada com a versão em que foi executada; a D82 não muda fórmulas de produção, prêmios ou títulos.

**Navegador D82, rodada final (21/10/2026).** `pnpm e2e` integral aprovado: **249 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, 258 no total, sem falhas (8,8 minutos). Inclui celular e computador nos dois temas, teclado, leitor de tela, contraste, movimento completo/reduzido, uso offline, compartilhamento, laboratório e regressões do Técnico. As setas do leitor ampliado preservam Capa/Bastidores e respeitam os extremos; promessa e crônica usam as fontes verificadas. Quadros de partida→partida, primeira→segunda temporada no rápido e partida→decisão principal mantêm posição e dimensões do card que sai. Trocar de aba durante a resposta não bloqueia a próxima escolha. Capturas nos dois dispositivos e temas revisadas, inclusive a conclusão da promessa ampliada. Tipos da interface/testes e lint reconferidos; temporários de execução removidos. As notas D73 a D81 descrevem entregas históricas; esta revisão consolida o código e a documentação atuais.

## D83: transmissões das decisões de partida (22/10/2026)

Craque `2.0.0-m23`; Técnico `1.9.0`. Só interface: motor, save, chances e textos de jogo não mudam, então não houve nova versão do motor nem recalibragem.

Cada decisão de partida virou uma **transmissão de TV** com identidade própria. O que muda na tela:

- **A competição.** Cada uma das 80 competições tem um pacote: cores, padrão de fundo sutil, selo ao lado do nome, filete de assinatura no alto do cabeçalho e cor dos pontos do placar de LED. A Champions é uma noite de gala azul-abissal com estrelas, curvas e prata; a Libertadores, obsidiana com raios de ouro e fumaça de sinalizador; o Mundial, preto e ouro com um globo nascendo do pé do palco; a Euro, um mosaico geométrico com filete de festival; a Copa América, uma noite índigo com tecido andino. Os padrões lembram o formato de cada torneio sem copiar marca nenhuma.
- **O país.** Ligas e copas nacionais levam o DNA do futebol do país (17 países): roxo, ciano e magenta com facetas na Inglaterra; coral sobre grafite na Espanha; azul-safira, ouro e scudetto tricolor na Itália; vermelho e antracito com prancheta técnica na Alemanha; leques art déco na França; gramado noturno, ouro canarinho e arquibancada em retícula no Brasil; papel picado na Argentina e no México, cordilheira no Chile. Copas trocam o padrão pela chave do mata-mata e o selo pela taça; FA Cup, Copa del Rey, DFB-Pokal e Copa do Brasil têm cores próprias.
- **O time de quem joga.** O clube entra no brilho lateral do palco, no filete do título do lance, na barra do time no placar e no cachecol do pé do cabeçalho, desenhado com o padrão da camisa (as listras do Barcelona, os blocos do Flamengo, a faixa do River, o xadrez da Croácia). A seleção entra nos refletores, no brilho e na bandeira da faixa (verde, amarelo e azul do Brasil; celeste e branco com o sol de Maio da Argentina). O adversário também mostra a barra dele.
- **A leitura.** O texto mora em superfícies escuras e sólidas, com teto de luminância calculado; o padrão some no centro do card. Contraste: texto principal acima de 7:1 em qualquer superfície, acento e texto secundário acima de 4,5:1, conferidos para toda competição com cada clube e cada seleção.
- **O PC e o celular.** No PC, o card é um monitor de cantos arredondados com borda especular no metal da competição, e o estádio continua em volta, um tom mais escuro. No celular, o card ocupa a área inteira e o estádio externo nem é desenhado. Um reflexo atravessa o cabeçalho quando o lance entra no ar e o ponto ao vivo pulsa; com animações reduzidas, os dois somem.
- **Peso.** Tudo é CSS e SVG mínimo, sem imagem baixada. Os desenhos dos padrões e as tabelas de cores ficam no código da carreira, carregado sob demanda; o CSS global leva só a composição das camadas.

Onde mora: `features/career/broadcastPackages.ts` (os pacotes e o DNA dos países), `broadcastMotifs.ts` (os desenhos dos padrões), `teamColors.ts` (cores de clube e seleção), `broadcast.ts` (fusão, cores de leitura e variáveis CSS), `screens/career/BroadcastEmblem.tsx` (os selos) e `styles/broadcast.css` (as camadas). No laboratório, Design, seção Transmissões, mostra as 80 competições lado a lado e veste os torneios de seleções com qualquer uma das 211 seleções; o laboratório da decisão ganhou o seletor Competição. A especificação completa está na revisão D83 do [GDD](docs/GDD.md) e o porquê, na decisão D83 de [DECISOES.md](docs/DECISOES.md).

**Validação D83 (22/10/2026).** `pnpm verify` integral aprovado: tipos, lint, 1.051 testes unitários (189 da interface; 19 a mais que na D82, todos das transmissões), 27 cenários Windows, 51 metas do Craque, metas do Técnico 1.9.0 em 384 temporadas e build. Os cenários Windows rodaram sem a variável `NoDefaultCurrentDirectoryInExePath`, que o terminal do assistente define e que impede o `cmd.exe` de achar o `run.cmd` temporário dos testes; com ela, os dez cenários falham pelo ambiente, sem relação com o código. `pnpm e2e` integral aprovado: **265 cenários passaram e nove foram pulados por restrições previstas de dispositivo**, sem falhas (9,8 minutos), incluindo os 16 novos de `d83.spec.ts` e as quatro atmosferas reforçadas de `d73.spec.ts`. A primeira rodada achou um problema real: a vitrine do laboratório montava as 80 transmissões junto com a área Design e, com quatro trabalhadores, o laboratório da decisão passou de 15 s no celular; a vitrine agora monta depois da primeira pintura e os cartões fora da tela não fazem layout (área Design de cerca de 1.000 ms para 430 ms no servidor aquecido). Conferência visual em PC 1280 × 720 e celular 360 × 640 nos dois temas, nas cinco famílias reais das amostras (Champions, Libertadores, Mundial, Copa América e Série B), no resultado da partida, em 320 × 568 e nas 80 competições da vitrine. A primeira versão misturava a cor da seleção no fundo e deixava o Brasil oliva no Mundial e na Copa América; a fusão passou para as luzes. O cabeçalho mede 117,8 px em 360 × 640 (antes, 118,5 px); com o resumo do lance aberto, a barra do time saía ao lado do nome e quebrava "RB Bragantino" em três linhas, e agora some nesse modo. Peso: o CSS global ganhou 1,5 KB com gzip (8,5 KB minificado); os desenhos dos padrões e as tabelas de cores ficam no pedaço da carreira, carregado sob demanda.

## D84: transições sem clarão e telas mais enxutas (22/10/2026)

No PC, trocar de competição entre duas decisões de partida não passa mais pela página clara: uma base escura fica por baixo e os estádios se cruzam. No celular, quando a temporada volta à decisão principal, o card desliza até o lugar novo em vez de pular. Saíram a aba que repetia no PC o texto de um evento (no celular ela continua, porque a mensagem é compacta), a contagem de conquistas liberadas do hub, duas frases de ajuda da identidade e a descrição do pôster. As manchetes do jornal agora usam a escolha e a fase do lance, então dois lances do mesmo ano não repetem título. Detalhes na revisão D84 do GDD e na decisão D84.

## D85: cada decisão chega com o próprio arranjo (22/10/2026)

O resumo do lance, a decisão, o jornal e os pontinhos de progresso agora fazem parte do card que desliza. Cada decisão entra já com o seu arranjo e nada em volta se mexe depois do deslize: a janela fica no mesmo lugar e com a mesma altura em todas as decisões. Substitui o deslize da D84. Detalhes na revisão D85 do GDD e na decisão D85.

## D86: o resultado não empurra mais a tela no celular (22/10/2026)

No celular, a mensagem de resultado virou uma faixa de uma linha sobre a barra do topo, que some sozinha em 4 s. Antes ela entrava acima do card e empurrava a decisão (ou cobria o nome do jogador nas partidas). Agora o card fica parado em todas as trocas. Detalhes na revisão D86 do GDD e na decisão D86.

## D87: card pronto no deslize, taças e som do lance (22/10/2026)

No celular, o card da decisão principal agora desliza já com o resumo e o jornal no lugar, sem pulo no final. As taças da temporada aparecem no cartão da temporada do PC (antes de "Detalhes da temporada") e em miniatura na faixa do lance do celular. O resultado de uma decisão de partida tem som: um para o lance que deu certo, outro para o que não deu. Detalhes na revisão D87 do GDD e na decisão D87.

## D88: nome da taça no toque e manchetes diretas (22/10/2026)

No celular, tocar numa taça mostra o nome dela por 2 s sem abrir a faixa por baixo. As manchetes do jornal ficaram diretas ("O gol que marcou a semifinal"), sem repetir o nome da escolha. A linha "Decisão X de Y" conta as decisões do ano: ao virar a temporada ela volta a 1. Detalhes na revisão D88 do GDD e na decisão D88.

## D89: resultado honesto, lance que vale mais e promessa como decisão principal (24/10/2026)

Motor do Craque `2.0.0-m24`. Regras novas (detalhes na revisão D89 do GDD e na decisão D89):

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

## D90: decisão principal todo ano, erro que pesa e Troféu Yashin (26/10/2026)

Motor do Craque `2.0.0-m25`. Detalhes na revisão D90 do GDD e na decisão D90.

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

## D91: pênaltis raros, Bola de Ouro por posição e resultado em cores (26/10/2026)

Motor do Craque `2.0.0-m26`. Detalhes na revisão D91 do GDD e na decisão D91.

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

## D92: recordes possíveis e três marcas novas (26/10/2026)

Motor do Craque `2.0.0-m27`. Detalhes na revisão D92 do GDD e na decisão D92.

- **Ala de meio sem desconto na Bola de Ouro.** ME e MD já ganhavam bem menos que o MC por natureza (Fenômeno: 18% a 19% com ao menos uma, contra 33% do MC); o desconto deles caiu de 0,6 para 0. Pontas e MEI seguem sem desconto: PE 33%, PD 36%, MEI 33%.
- **Os dois recordes que ninguém batia ficaram possíveis.** Bolas de Ouro: a cauda da pressão do recorde começa na 5ª Bola em vez da 4ª (`PRESSURE.ballonDor.start` 4 para 5). Gols pela seleção: a cauda começa em 141 em vez de 136, e os gols da seleção deixam de passar também pela cauda dos gols da carreira (979), que prendia o artilheiro perto dos dois recordes. Com 400 Fenômenos por posição em cada lote: 8 Bolas de Ouro em 1 de 4.800 carreiras (melhor antes: 7), 146 gols pela seleção em 1 de 4.800 (melhor 148; antes 140), gols na carreira de 6 para 14 de 4.800. As 21 marcas do relatório são alcançáveis e raras.
- **Três recordes novos no jogo**, como marcas de referência (sem detentor de consenso, e o texto diz isso): assistências numa temporada (35), jogos sem sofrer gol numa temporada (34) e títulos de uma mesma liga fora de Inglaterra, Espanha, Itália e Alemanha (12). Entram na tela de recordes, no resumo e cada um ganha a conquista de recorde automática. São 21 recordes no jogo.

## D93: recordes reais e todos superáveis (26/10/2026)

Motor do Craque `2.0.0-m28`. Detalhes na revisão D93 do GDD e na decisão D93.

- **As três marcas da D92 ganharam número e detentor reais.** Assistências numa temporada: **32, Lionel Messi** (Barcelona, 2011-12, todas as competições; as fontes divergem entre 29 e 34, o jogo usa 32). Jogos sem sofrer gol numa temporada: **26, Marc-André ter Stegen e Francisco Liaño** (Barcelona 2022-23 e Deportivo 1993-94, recorde das cinco grandes ligas, só liga); o jogo conta só os jogos de liga de primeira divisão. Liga fora das quatro: virou **Títulos da liga francesa, 11, Marquinhos** (Paris Saint-Germain, Guinness, 2026). Não há recorde de consenso para "todas as competições" em jogos sem sofrer gol, nem um detentor firme de "liga fora das quatro grandes".
- **Todo recorde dá para bater e superar.** As caudas da pressão do recorde foram afrouxadas onde ninguém passava da marca: Bola de Ouro começa a frear depois da 8ª (escala 4), Bolas seguidas a partir da 3ª com escala 3, Chuteiras de Ouro a partir da 4ª, títulos continentais a partir do 5º e a sequência continental a partir do 5º (escala 2,5). Assistências por temporada passaram a frear a partir de 22 (o recorde caiu de 35 para 32). O prestígio do votante na Bola de Ouro sobe até 5,5 (antes 4): só quem já tem 7 ou mais Bolas sente a diferença. Fenômenos de ataque: Bola de Ouro média 0,77, 36% com ao menos uma (meta 0,4 a 1,25 e 20% a 45%).

## D94: recordes em faixas, quase, coleção, jornal e desafio de recorde (27/10/2026)

Motor do Craque `2.0.0-m29`. Detalhes na revisão D94 do GDD e na decisão D94.

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

## D95: despedida no jornal, selo novo e recordes da posição (27/10/2026)

Sem mudança de motor (`2.0.0-m29`); conteúdo e interface. Detalhes na revisão D95 do GDD e na decisão D95.

- **Faixa "Clássico".** A faixa de entrada dos recordes passou a se chamar **Clássico** (Classic, Clásico); o id interno continua `entry`. As outras seguem Raro, Épico e Lendário.
- **Recordes da posição.** O recorde de jogos sem sofrer gol numa temporada de liga só conta temporadas como goleiro. Um atacante não o vê em "Recordes à vista", não o alcança no resumo e não libera a conquista; no motor, o Desafio do dia já o reservava ao goleiro. Os outros recordes valem para qualquer posição (gols, assistências, títulos, jogos e prêmios).
- **Seleção nos detalhes da temporada.** As competições de seleção só aparecem em "Competições da temporada" quando o jogador entrou em campo por ela no ano. Sem convocação, a Copa do Mundo da seleção não aparece como se fosse dele.
- **Folha mais alta.** A folha que abre "O último lance" (e as outras folhas) cresce até `min(94dvh, 1100px)` antes de rolar; antes parava em `min(88dvh, 780px)`. No PC os detalhes da temporada cabem inteiros na maior parte dos anos.
- **Início sem "Editar jogador".** O botão debaixo da carta saiu do Início; o jogador é montado em "Começar carreira".
- **Selo de recorde do jornal.** O selo virou uma medalha: estrelas da faixa (uma no Clássico, quatro no Lendário) com o nome da faixa, uma fita com "Recorde quebrado" ou "Recorde igualado", o nome do recorde e o duelo em dois números (detentor e você). Superado é dourado com um brilho que passa uma vez; igualado tem a cor da faixa. O selo fica no lugar da foto do escudo, no fluxo da página, e não cobre mais a manchete. Correção: ao virar a página, o selo da edição seguinte aparecia antes do papel, fixo por cima da folha que ainda girava. A página agora isola o empilhamento (`isolation: isolate`), as cópias que giram não carimbam, e a batida do carimbo só toca quando a página assenta.
- **Última página é a despedida.** Numa carreira encerrada, a última edição do jornal sempre abre com o ângulo novo `farewell` ("Obrigado, {nome}", "Aos 35, {nome} diz adeus", "O último apito para {nome}"...), com uma linha de apoio que resume a carreira (jogos, gols ou jogos sem sofrer gol, e títulos, os mesmos números do rodapé "Até aqui na carreira"). Um recorde alcançado no último ano continua no selo. Carreira em andamento não tem despedida.

## D96: tabela da liga, recordes que ainda podem mudar, jornal sem transbordo e desafio mais limpo (27/10/2026)

Motor do Craque `2.0.0-m30`. Detalhes na revisão D96 do GDD e na decisão D96.

- **Tabela da liga no jogo decisivo de liga.** Embaixo das opções (e, no resultado, embaixo do placar final) aparece a tabela da liga na rodada do jogo, rolável por dentro, com o clube do jogador em destaque e o adversário marcado. Ela abre centrada no clube; se ele já aparece com a lista no topo, fica no topo, do primeiro para baixo. Quando o lance termina, a rodada inteira fecha: o clube e o adversário somam pelo placar final, os outros somam 3, 1 ou 0, a tabela se reordena com animação e mostra quem subiu ou caiu e quantos pontos cada um somou. Como funciona: o mundo condensado só tem a tabela final do ano; `leagueSnapshot` (`career/leagueTable.ts`) usa a prévia do ano que o motor já monta para planejar os jogos (`seasonPreview`, a mesma de antes), sorteia a rodada entre 70% e 95% do campeonato (fluxo `drama/leagueRound`) e dá a cada clube os pontos no ritmo que o levou ao lugar final; `leagueAfter` fecha a rodada. A foto é tirada uma vez por lance, para não mudar entre o lance e o resultado. Só mostra: nenhuma carreira muda por causa dela. Em celular baixo (até 700 px de altura), a tabela some para o laço caber na tela (substituído na D98: tamanho medido e fixo, com a faixa em tela baixa).
- **Selo do resultado da terceira opção.** Segurar o jogo deixou de mostrar sempre "Decisão certeira". O selo diz o que aconteceu: "Vitória segurada" e "Empate segurado" na liga, "Vaga garantida" e "Taça garantida" no mata-mata, e "Não foi o suficiente" quando o lance deu certo mas o time perdeu (nos pênaltis, por exemplo). Lance que não deu certo continua "Jogada adversária".
- **Recordes à vista só enquanto podem mudar.** Nos detalhes da temporada, a lista mostra só o que a próxima temporada ainda pode mudar: somas da carreira (gols, títulos, jogos, Champions...) e sequências que ainda correm, contadas pelo tamanho atual. Recordes de uma temporada só (gols, assistências e jogos sem sofrer gol numa temporada) recomeçam todo ano e saem da vista; sequência quebrada também. O resumo da carreira continua mostrando tudo o que ficou perto (`recordChases`); a carreira usa `liveRecordChases`.
- **"Uma semana sem holofotes" saiu do jogo.** O catálogo passa de 39 para 38 acontecimentos. Muda o sorteio de eventos de carreira: motor `2.0.0-m30`, amostras de navegador reconstruídas.
- **Jornal sem texto fora da página.** Os lances da página de dentro usavam a competição como chave do item; dois lances da mesma competição no ano (dois jogos de liga, por exemplo) davam chaves repetidas, e ao virar a página o React deixava itens de outra edição para trás: quatro lances empilhados e texto descendo para fora do jornal, inclusive ao só segurar a folha. A chave agora é única (o mesmo conserto no resumo dos lances da temporada). A folha também corta o que passar da altura dela e cada história tem no máximo cinco linhas; a leitura ampliada continua sem corte.
- **Nome do jogador no selo.** O selo de recorde do jornal mostra o nome do jogador no lugar de "Você".
- **Números de cada clube na linha do tempo.** Como a estreia na seleção já mostrava, cada passagem por clube mostra jogos, gols e assistências ali; com temporadas no gol ou na defesa, também os jogos sem sofrer gol; o goleiro puro mostra jogos e jogos sem sofrer gol.
- **Desafio do dia mais limpo.** A entrada do desafio tem a data como título, o relógio em selo, a bandeira grande com a posição, as regras fixas em quatro selos curtos (Difícil, 1 decisão a cada 2 anos, Fim a partir dos 27, Valem as 2 melhores missões), as missões, o recorde do dia quando houver e o édito, que já diz o que acontece se for descumprido. "Seu jogador" tem a aparência, o nome e o número. À direita, o botão Jogar em destaque, uma linha sobre a ranqueada, Voltar, o ranking do dia e as suas ranqueadas. Saíram as notas repetidas: a regra da meia-noite UTC, a frase sobre o que é livre, o aviso do édito repetido, a nota do ranking e a explicação de "Limpas" (agora na dica do rótulo).

## D97: números de clube e seleção juntos, tabela que se ajeita e capa do jornal sem sobreposição (27/10/2026)

Motor do Craque `2.0.0-m30` (sem mudança de carreira). Detalhes na revisão D97 do GDD e na decisão D97.

- **Números da carreira somam clube e seleção.** `careerTotals` passa a contar em `games`, `goals`, `assists` e `cleanSheets` os jogos de clube e os da seleção; a parte da seleção continua em `nationalGames`, `nationalGoals` e os novos `nationalAssists` e `nationalCleanSheets`. Vale para o painel da carreira, o resumo, o Hall, a biografia, a despedida e o rodapé "Até aqui na carreira" do jornal. Os recordes já somavam clube e seleção desde a D92 (gols, jogos), então nenhum recorde, missão ou meta muda; os números de uma temporada (a caixa "Os números" do jornal, recordes de temporada) seguem sendo do clube. Só apresentação: o motor das carreiras não muda.
- **Assistências pela seleção.** O motor já contava as assistências da seleção (e o peso delas no legado nacional); agora `nationalLegacy` as devolve, com os jogos sem sofrer gol, e a estreia na seleção da linha do tempo mostra jogos · gols · assistências pela mesma regra dos clubes (goleiro puro: jogos e jogos sem sofrer gol; quem jogou atrás também vê os jogos sem sofrer gol).
- **A tabela da liga se ajeita à vista.** No resultado, a tabela abre como estava e, meio segundo depois, a rodada fecha: as linhas deslizam para o lugar novo em 0,8 s, as setas de quem subiu ou caiu aparecem e a linha do clube acende. Com movimento reduzido, fecha direto.
- **Mais tempo no resultado do lance.** O resultado do jogo decisivo segue sozinho para a próxima decisão depois de 3 s (eram 2,1 s); o botão Continuar segue na hora.
- **Capa do jornal sem caixa por cima de caixa.** A caixa de conquistas mantinha a altura mínima e deixava a lista vazar por cima dos selos da temporada (Acesso, lesão). Agora ela não encolhe, cada nome fica numa linha só (o nome inteiro na dica), "Também nesta temporada" continua a parte que cede e a coluna corta o que sobrar. Conferido página a página em todas as amostras de navegador, no PC e no celular.

## D98: tabela da liga fixa e animada, 2,5 s no resultado e aba Seleção completa (27/10/2026)

Motor do Craque `2.0.0-m30` (sem mudança de carreira). Detalhes na revisão D98 do GDD e na decisão D98.

- **Tabela da liga de tamanho fixo, presa ao pé do card.** É uma peça só do lance ao resultado (antes eram duas, uma sob as opções e outra sob o resultado, e por isso mudava de lugar e de tamanho). O tamanho é medido uma vez, com as opções na tela, que é o estado mais alto do card, e fica o mesmo até seguir: nunca cresce, encolhe nem se mexe. Com espaço, a tabela tem 150 px (cinco linhas à vista, o resto rola por dentro); com menos, fica com o que sobra, desde que caibam três linhas (112 px); com menos ainda, vira a **faixa**: uma linha de 46 px com os clubes em volta do jogador (posição, escudo e pontos; o nome na dica e no leitor de tela), que reordena do mesmo jeito; sem espaço nem para a faixa, não aparece nesse jogo. Nos jogos de liga as opções ficam um pouco mais baixas para caber. Medido em 1440 × 900, 1920 × 1080, 768 × 1024 e 412 × 915 (tabela), 360 × 740 (tabela de três linhas), 1366 × 768 e 390 × 800 (faixa): mesma posição e altura antes e depois do lance, sem rolar o card.
- **Tabela mais animada.** As linhas entram em cascata; um ponto pulsa "ao vivo" até o resultado; no resultado, a tabela respira, a rodada fecha, as linhas trocam de lugar em 0,9 s, os pontos sobem contando, as posições de quem subiu ficam verdes e as de quem caiu vermelhas, quem venceu ganha um fundo verde, a posição do clube do jogador pulsa e um brilho atravessa a tabela. Com movimento reduzido, nada disso: fecha direto.
- **Resultado do lance em 2,5 s.** O resultado do jogo decisivo segue sozinho depois de 2,5 s (eram 3 s na D97).
- **Aba Seleção completa.** Jogos, gols, assistências, jogos sem sofrer gol (para quem jogou atrás), títulos e estreia; goleiro puro vê jogos sem sofrer gol no lugar de gols e assistências, como na linha do tempo. Os títulos contam só os torneios que ele disputou, como a lista de torneios.
- **O resultado do jogo de liga muda a tabela final.** Já era assim desde a D89 (`keyLeague`, `world/keyMatches.ts`): a diferença de pontos entre o placar na hora do lance e o placar final vai para o clube do jogador e para o adversário na tabela do ano, que se reordena. Virar uma derrota em vitória vale 3 pontos e pode dar o título ou tirar do rebaixamento.

## D99: pular resultado nos Ajustes, segurar para ler, resumo sem biografia (27/10/2026)

Motor do Craque `2.0.0-m30` (sem mudança de carreira). Detalhes na revisão D99 do GDD e na decisão D99.

- **Pular resultado automaticamente (Ajustes).** Preferência nova, ligada por padrão: o resultado do lance segue sozinho para a próxima decisão depois de 2,5 s. Desligada, o resultado espera o botão Continuar. Fica em Ajustes (logo depois de Animações) e no laboratório, em Controles. Preferência `autoAdvance` em `store/prefs.ts`.
- **Segurar o clique segura o resultado.** Com o avanço automático ligado, segurar o clique (ou o dedo) em qualquer ponto do card da decisão para o relógio; ao soltar, ele retoma de onde parou. Sem nenhum desenho novo: só a lógica, como já acontecia com a aba escondida.
- **Resumo reorganizado.** Os capítulos ficam na ordem Números, Troféus, Linha do tempo, Jornal e Hipotético (o capítulo do Desafio, quando há, continua em primeiro).
- **A biografia saiu do jogo.** Saem o capítulo do resumo, a prévia no laboratório (Fim de carreira mostra só o pôster), o gerador (`biography`, `bioFacts`, temas e capítulos), os textos nos três idiomas (`locales/bio.*`), os estilos e os testes dela, e o efeito `story` dos acontecimentos, que não fazia nada no jogo e só servia de marca para a biografia (sete marcas no catálogo). As passagens por clube, que a linha do tempo e o pôster usam, ficam em `packages/content/src/stints.ts` (`stintsOf`). Nenhuma carreira muda: o efeito `story` era ignorado pelo motor.
- **Teste de recordes por posição (só medição, nada mudou).** 900 Fenômenos por posição, jogados até o fim pelos três lotes da ferramenta de recordes. Gols numa temporada (73): PE e PD igualaram em 0,11% (1 carreira cada; melhor 78 e 79), CA em 2,78% (melhor 80), MEI em 0,11% (melhor 76). Assistências numa temporada (32): PE 2,11% (melhor 36), PD 2,44% (melhor 35), CA 3,33% (melhor 38), MEI 48,89% (melhor 41, mediana 31), MC 6,56%. Todos conseguem; o MEI consegue o de assistências em quase metade das carreiras de Fenômeno.

## D100: pontas e meias perto dos recordes, MEI menos certeiro nas assistências (27/10/2026)

Motor do Craque `2.0.0-m31`. Detalhes na revisão D100 do GDD e na decisão D100.

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

## D101: centroavante perto do recorde, vitrine com Bola e Chuteira primeiro, jornal com o recorde de mais valor (28/10/2026)

Motor do Craque `2.0.0-m32`. Detalhes na revisão D101 do GDD e na decisão D101.

- **Centroavante Fenômeno bate o recorde de gols numa temporada em 5% ou mais.** O peso do nível nos gols do centroavante passa de 0,032 para **0,039** (`LEVEL_BY_POSITION.st`): o centroavante que sobra em campo faz mais gols. O teto das outras posições (D100) continua medido contra o centroavante de peso 0,032, para pontas e MEI não mudarem. MEI: gols 0,28 para **0,275**, para seguir perto e abaixo de 1%.
- **Medido (1.800 Fenômenos por posição, duas sementes).** Recorde de gols numa temporada: CA 5,8%, PE e PD cerca de 2%, MEI perto de 0,8%. Assistências: pontas cerca de 3,6%, MEI 7,5%, CA cerca de 1%. Mediana da melhor temporada do CA: 53 gols (eram 48).
- **Gols numa temporada vira Raro.** Era Épico (0,5% a 1,5%); com o centroavante em 5% ou mais, o lote de ataque dá 2,6%, faixa Rara (2% a 5%). O selo da conquista muda junto.
- **Caudas (`PRESSURE`).** Com o centroavante marcando mais, voltaram para a faixa: gols na carreira começa a afinar em **870** (era 880), gols pela seleção em **126** (era 132) e Chuteiras de Ouro passa a afinar a partir da **sexta**, escala **1,2** (era sétima, escala 3,5). Relatório na semente padrão: gols numa temporada 2,61% (Raro), gols na carreira 1,11%, gols pela seleção 0,22%, assistências 3,94%, Chuteiras de Ouro 0,33%. Quatro marcas lendárias seguem alcançadas mas não superadas no lote: Bolas de Ouro, Bolas de Ouro seguidas, Chuteiras de Ouro e Premier League.
- **Vitrine: troféus primeiro, prêmios depois, com duas exceções.** A Bola de Ouro e a Chuteira de Ouro, quando ganhas, abrem a vitrine antes de todas as taças; depois vêm os troféus, pela importância, e então os outros prêmios (Luva de Ouro, Rei da América, Revelação, craque e artilheiro de competição). Vale para a vitrine da carreira, a linha do tempo e as conquistas do jornal (`compareHonours`).
- **Dois ou mais recordes no mesmo ano.** O jornal abre a capa com um recorde só e o selo conta os outros ("+N"). O escolhido é o superado (antes do igualado) de mais valor: lendário, épico, raro e clássico; no empate, a ordem do catálogo.
- **Ajustes.** "Pular resultado automaticamente" fica sem a frase de explicação, nos Ajustes e no laboratório.
- **Muda o resultado das carreiras.** Motor `2.0.0-m32`, amostras de navegador reconstruídas em m32.

## D102: centroavante Fenômeno entre 4% e 5% no recorde de gols (28/10/2026)

Motor do Craque `2.0.0-m33`. Detalhes na revisão D102 do GDD e na decisão D102.

- **Centroavante Fenômeno entre 4% e 5% no recorde de gols numa temporada (pedido do usuário).** O peso do nível nos gols do centroavante passa de 0,039 (D101) para **0,0365** (`LEVEL_BY_POSITION.st`). Pontas e MEI não mudam: o teto deles continua medido contra o centroavante de peso 0,032.
- **Como foi medido.** Lotes de 900 Fenômenos centroavantes (três políticas, jogados até o fim), muitas sementes de cada vez. Com 0,039: 6,56% em 3.600 carreiras. Com 0,0355: 4,30% e com 0,0358: 4,46% nas mesmas 5.400. Com **0,0365**: 4,44% em 10.800 carreiras, 4,80% em outras 5.400 e 4,23% em 10.800 sementes novas, nunca usadas no ajuste; ao todo, **4,43% em 27.000 carreiras** (margem de cerca de 0,25 ponto). Lotes de 900 variam de 3,6% a 5,1% só pela amostra. A mediana da melhor temporada do centroavante Fenômeno fica em 52 gols.
- **Recordes (`pnpm balance:recordes`).** Na semente padrão: gols numa temporada 2,00% (Raro, 2% a 5%), gols na carreira 0,83%, gols pela seleção 0,17%, assistências 3,94%. Na segunda semente, gols numa temporada 2,67%: a média do ataque fica perto de 2,3% (CA 4,4%, pontas cerca de 2%, MEI 0,8%), dentro da faixa Rara. Chuteiras de Ouro ficou em 0,17% e 0,06% nas duas sementes (média dentro da faixa lendária); a cauda delas afina com escala **1,6** (era 1,2 na D101), o que deixa passar da marca mais possível. As mesmas quatro marcas lendárias da D101 seguem alcançadas mas não superadas no lote.
- **Muda o resultado das carreiras.** Motor `2.0.0-m33`, amostras de navegador reconstruídas em m33.

## D103: superar Bola de Ouro, sequência de Bolas e Chuteiras de Ouro fica possível (28/10/2026)

Motor do Craque `2.0.0-m34`. Detalhes na revisão D103 do GDD e na decisão D103.

- **Na marca real, a pressão do recorde para de crescer (`Tail.mark`).** Até a marca, cada conquista a mais custa mais sorte; passar da marca custa o mesmo que alcançá-la. Vale para três recordes que ninguém superava em 21.600 carreiras de Fenômeno (D44 pede superar raro, mas possível): **Bolas de Ouro** (marca 8: a 9ª fica com 45% de chance, como a 8ª, em vez de 30%), **Bolas de Ouro seguidas** (marca 4: a 5ª seguida fica com 51%, como a 4ª, em vez de 26%) e **Chuteiras de Ouro** (marca 6: a 7ª fica com 54%, como a 6ª, em vez de 29%). Alcançar a marca continua exatamente tão raro quanto antes. As outras caudas não mudam.
- **Medido (21.600 Fenômenos de ataque: CA, MEI, PE e PD, seis sementes).** Bolas de Ouro: alcança 0,27%, supera 0,032% (12% de quem alcança; antes, 0 em 29). Bolas seguidas: alcança 0,30%, supera 0,023% (8% de quem alcança). Chuteiras de Ouro: alcança 0,27%, supera 0,042% (15% de quem alcança).
- **O relatório de recordes.** Na semente padrão, Bolas de Ouro seguidas passa a ser superada no lote; Bolas de Ouro e Chuteiras de Ouro ainda aparecem marcadas, porque o lote do relatório tem 1.800 carreiras de ataque e só 3 ou 4 chegam à marca: com 12% a 15% de quem alcança superando, o lote espera perto de meia carreira que supere. A medição grande acima é a prova de que superar é possível.
- **Tabela por posição (D102, 1.800 Fenômenos por posição, a mesma conta de recordes do jogo).** Gols numa temporada: CA 4,2%, PE 2,1%, PD 2,2%, MEI 0,39%, ME e MD perto de 0,15%, MC 0,11%, defensores e goleiro 0. Assistências numa temporada: ME 8,8%, MEI 8,4%, MD 7,4%, PE 4,9%, PD 4,1%, MC 1,1%, LE 0,94%, CA e LD 0,67%. Jogos sem sofrer gol numa temporada de liga: goleiro 10,7%. Jogos pela seleção: goleiro 23%, zagueiro 16%, demais de 5% a 10%. Títulos e ligas dependem do clube e quase não mudam com a posição.
- **Muda o resultado das carreiras.** Motor `2.0.0-m34`, amostras de navegador reconstruídas em m34.

## D104: o centroavante alcança o recorde de gols pela seleção (28/10/2026)

Motor do Craque `2.0.0-m35`. Detalhes na revisão D104 do GDD e na decisão D104.

- **O centroavante passa a bater o recorde de gols pela seleção.** Na tabela por posição da D102, o CA nunca chegava aos 146, embora fosse quem mais chegava perto (55 de 900 Fenômenos com 130 ou mais). A cauda começava a afinar em 126 com escala 22 e empilhava todos entre 130 e 144. Agora ela começa em **138**, escala **7**: até 138 o gol entra livre, e daí para a frente cada gol pede mais sorte.
- **Medido (1.800 Fenômenos por posição).** Alcança 146: CA 0,33%, PE 0,28%, PD 0,44%, MEI 0 (o MEI chega a 143); supera: CA 0,17%, PE e PD 0,22%. Ataque inteiro 0,26%. No relatório da semente padrão, 0,33% (faixa lendária, 0,1% a 0,4%), com superação no lote.
- **Muda o resultado das carreiras.** Motor `2.0.0-m35`, amostras de navegador reconstruídas em m35.

## D105: goleiro na seleção perto de 12%, Jogos de Champions League e talentos abaixo do Fenômeno (29/10/2026)

Motor do Craque `2.0.0-m36`. Detalhes na revisão D105 do GDD e na decisão D105.

- **Jogos pela seleção do goleiro perto de 12%.** O goleiro chegava aos 234 jogos pela seleção em 23% das carreiras de Fenômeno, o dobro do teto da faixa Clássica (6% a 15%): virava recorde garantido. A cauda dos jogos pela seleção do goleiro começa em **216** (`PRESSURE.capsKeeper`; a das outras posições segue em 224). Medido: 12,6% a 13,2% (5.400 goleiros Fenômeno). As outras posições não mudam.
- **Recorde novo: Jogos de Champions League (Cristiano Ronaldo, 183; UEFA e Guinness).** Faixa Clássica, contada pelos jogos na Champions League das linhas de competição da temporada. É o recorde de carreira longa em clube grande, e por isso a meta natural das posições de trás: Fenômeno GOL 17,7%, ZAG 14,2%, VOL 14,1%, LE e LD cerca de 12,5%, ataque de 10% a 12,6%. No relatório da semente padrão, 14,27%. Textos nos três idiomas.
- **Por que não um recorde de gols de defensor.** Pesquisado: o recorde de gols de um defensor é de Ronald Koeman (cerca de 253 na carreira; as fontes divergem entre 193 só de liga, 239 e 253), com 113 de pênalti e 60 de falta; o segundo é Daniel Passarella (175); pela seleção, Sergio Ramos (23 pela Espanha). Um zagueiro Fenômeno faz no jogo de 20 (mediana) a 54 gols na carreira e no máximo 11 pela seleção: a marca exigiria um batedor de pênalti e falta, que o jogo não tem. Ficaria inalcançável, contra a regra da D44.
- **Talentos abaixo do Fenômeno (medição, sem mudança).** Com 1.800 carreiras por posição e faixa: **Estrela** vê recorde de vez em quando em toda posição (CA gols numa temporada 1,8%, MEI assistências 2,6%, GOL jogos sem sofrer gol 3,2%, ZAG títulos 3,3%, ligas e Champions de 0,2% a 2%), e quase nunca os individuais grandes (Bola de Ouro 0, gols na carreira só o CA 0,39%). **Craque** fica quase tudo entre 0 e 0,4% (GOL jogos sem sofrer gol 1,2%, MEI assistências 0,78%, CA gols numa temporada 0,39%, títulos continentais e de liga perto de 0,1% a 0,3%): possível, mas raro, como pedido.
- **Ferramenta.** `runRecordCareers` aceita a faixa de talento, para medir Craque e Estrela.
- **Muda o resultado das carreiras.** Motor `2.0.0-m36`, amostras de navegador reconstruídas em m36.

## D106: Bola de Ouro com protagonismo, legado pela tradição, empresário, bolinhas e personagem (29/10/2026)

Motor do Craque `2.0.0-m37`. Detalhes na revisão D106 do GDD e na decisão D106.

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

## D107: erro no jogo-chave, top 10 da Bola de Ouro, explosão jovem e promessa no Rápida (29/10/2026)

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
- **Muda o resultado das carreiras.** Motor `2.0.0-m38`, amostras de navegador reconstruídas em m38.

## D108: Portugal, Liga das Nações, Troféu Kopa, prêmios na Bola de Ouro, dispensa e jornal (29/10/2026)

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
- **Muda o resultado das carreiras.** Motor `2.0.0-m39`, Técnico `1.10.0`, amostras de navegador reconstruídas em m39.

## D109: calendário dos torneios, Bola de Ouro pelo que se fez, Kopa pelo desempenho, carreira até 2050 e telas (30/10/2026)

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
- **Recordes com a temporada a mais.** A cauda dos jogos na carreira começa em 1.320, escala 65 (era 1.330 e 80): com a carreira até os 40, o recorde de 1.390 jogos de Peter Shilton passava para 6,8% dos Fenômenos; volta a 4,67% (faixa rara). Ficam 21 de 22 marcas na faixa; a de 4 Bolas seguidas está na frequência certa (0,28%) e só é sinalizada porque ninguém a superou na amostra. Metas do desafio recalibradas.
- **Muda o resultado das carreiras.** Motor `2.0.0-m40`, amostras de navegador reconstruídas em m40.

## D110: sem o Início do Craque, hipotético com sorteio refeito, briga com a diretoria e o batedor do time (30/10/2026)

Motor do Craque `2.0.0-m41`. Detalhes na revisão D110 do GDD e na decisão D110.

- **Sem o Início do Craque.** "Jogar" no Craque abre direto a tela de quem é você. Ela traz o que ficava no Início: Jogo rápido (ao lado de Começar carreira no PC; no celular, embaixo), o Desafio do dia, as conquistas, os números do mundo e o laboratório. Voltar leva ao hub do Futeiros. O texto do ritmo ficou curto ("Decisão principal a cada 2 anos" e "todo ano") para não empurrar a dificuldade.
- **Hipotético com o sorteio refeito.** Na linha alternativa, da decisão de troca em diante, o sorteio de dar certo ou errado (acontecimento e jogo-chave) leva um sal novo (`setup.rerolls`, `career/outcome.ts`): a mesma escolha da linha original pode ter outro resultado. As decisões antes da troca se refazem iguais; um hipotético dentro de outro guarda as trocas anteriores.
- **Briga com a diretoria.** Não recuar é a transferência certa, sem sorteio: a diretoria vende você e fecha as portas. Retratar-se custa 10 de torcida (era 2).
- **O batedor do time.** Fora do ataque (zagueiro, lateral, volante, meias), finalização a partir de 80 faz do jogador o cobrador de pênalti e falta: gols a mais por jogo, até 0,06 (zagueiro e volante), 0,05 (lateral), 0,04 (meio-campista) e 0,03 (meia e alas) no 99 de FIN (`SET_PIECE_TAKER`, `setPieceSkill`, `season/production.ts`), e o jogo-chave vira uma cobrança (pênalti, falta, pênalti decisivo) com até 30% de chance (`SET_PIECE_SCENE_CHANCE`, `career/matchMoments.ts`).
- **Muda o resultado das carreiras.** Motor `2.0.0-m41`, amostras de navegador reconstruídas em m41.

## D111: escudos e selos reais por padrão (30/10/2026)

Só interface e dados de imagem; o motor não muda.

- **Escudos e selos reais por padrão.** O build usa `VITE_ASSETS=real` quando nada é dito (`apps/game/src/lib/env.ts`); `gerado` continua disponível para comparar. Onde não há imagem real, entra a arte desenhada.
- **Escudos que faltavam.** Vieram da Wikipédia (o campo de imagem da página de cada clube): os 36 clubes de Portugal, Vaca Díez, San Juan, Patriotas Boyacá e os selos da Primeira Liga e da Liga Portugal 2. Ficam com o escudo desenhado, sem imagem achada: Real Oruro, Santo Domingo, Torreense, União de Leiria, Atlético El Vigía, Real Frontera e Marítimo de La Guaira; e os selos da LigaPro Serie B, da Liga 2 peruana e da Liga FUTVE 2. Agora são 518 de 525 escudos e 31 de 34 selos reais.
- **Imagens trocadas pelo usuário (30/10/2026):** o escudo do Vasco da Gama (`clubs/vasco-da-gama.png`) e o selo do Brasileirão Série B (`leagues/brasileirao-serie-b.png`) passaram a ser as versões PNG enviadas pelo usuário, recortadas e com 512 px de altura; os dados (`clubs/bra.json`, `leagues.json`) registram a extensão `png`.
