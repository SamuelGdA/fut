# CRAQUE — Simulador de Carreira

Um simulador de carreira de futebol 100% client-side: você cria um jogador, escolhe onde começar e joga temporada a temporada — via decisões narrativas, não partidas simuladas jogo a jogo — até a aposentadoria. No final, o jogo escreve a biografia da sua carreira e monta uma carta de jogador estilo EA FC com os atributos no auge.

Não depende de backend nem de contas: todo o estado vive no navegador (Zustand + `localStorage`).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · [`motion`](https://motion.dev) para animações.

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — a rota raiz redireciona para `/juegos/simulador-carrera`, onde o jogo vive.

No Windows, dando duplo-clique em [`iniciar.bat`](iniciar.bat) ele instala as dependências (se faltarem) e abre o jogo no navegador sozinho.

Outros scripts:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # eslint
npx tsc --noEmit  # checagem de tipos
```

## O que o jogo faz

1. **Criação de personagem** — nome, pé preferido, nacionalidade (211 seleções), posição e um avatar vetorial totalmente customizável (cabelo, barba, olhos, acessórios, cores) desenhado em SVG puro, sem imagens externas.
2. **Modo e dificuldade** — dois eixos independentes:
   - **Modo** (`long` / `normal`) controla o ritmo: decisões a cada temporada ou a cada duas.
   - **Dificuldade** (`normal` / `hard`) controla o quão realista/punitivo o jogo é: chance de virar Craque/Fenômeno, velocidade de evolução e declínio, chance de lesão (incluindo lesões graves), paciência dos clubes e reputação exigida para receber propostas.
3. **Carreira** — a cada período o motor de simulação (`lib/sim/`) resolve a temporada: minutos, gols/assistências (ou defesas, para goleiros), evolução dos 6 atributos, prêmios, disputa de títulos, rebaixamento/acesso, lesões, e eventualmente uma decisão narrativa (uma de ~30 eventos de carreira). A cada 2 temporadas normalmente aparece uma janela de transferência com propostas de outros clubes.
4. **Talento oculto** — todo jogador nasce com um "teto" de potencial sorteado (Promessa → Talento → Craque → Fenômeno → Geracional), nunca revelado como número — só dá pra sentir jogando.
5. **Final de carreira** — a tela de resumo monta a melhor carta da carreira (atributos no pico, não na aposentadoria), gera uma biografia em prosa condicional a partir do que de fato aconteceu naquela carreira específica, mostra a linha do tempo de clubes, o mural de troféus, o rival ao longo da carreira e os recordes mundiais reais batidos (atualizados para 2026). Dá para baixar a carta como PNG ou compartilhar direto.
6. **Desafio do dia** — todo mundo recebe a mesma seed, nacionalidade, posição e uma missão do dia (uma de 30, sempre em modo Difícil). A pontuação mede o quão perto (ou além) da meta da missão você chegou, com um ranking local guardado no navegador.

## Estrutura do projeto

```
app/juegos/simulador-carrera/page.tsx   # roteador de telas (via screen no store)
components/screens/                     # Intro, Identity, Appearance, Career, Summary, Challenge
components/                             # carta de jogador, avatar, timeline, biografia, etc.
store/careerStore.ts                    # único store Zustand (persistido em localStorage)
lib/sim/                                # motor de simulação: RNG, atributos, progressão, eventos, carreira
lib/data/                               # dataset: 23 ligas / 384 clubes / 211 países / troféus
lib/avatar/                             # config do criador de personagem
lib/bio/                                # gerador de biografia (fatos extraídos da carreira + frases condicionais)
lib/challenge/                          # desafio diário: métricas, missões, seed/rotação, ranking local
lib/i18n/                               # dicionários pt/es/en + contexto de idioma
public/craque-assets/                   # escudos, bandeiras e troféus servidos localmente
```

### Motor de simulação (`lib/sim/`)

- `rng.ts` — RNG determinístico por seed (tudo no jogo é reproduzível a partir da seed da carreira).
- `constants.ts` — tabelas de balanceamento: tiers de talento, curvas de idade, e `DIFFICULTY_CONFIG` (o eixo Normal/Difícil).
- `attributes.ts` — os 6 atributos por posição e o cálculo de OVR a partir deles.
- `engine.ts` — sorteio de potencial, evolução de atributos, declínio por idade, reputação de clube.
- `career.ts` — orquestra uma carreira inteira: temporada a temporada, contratos, lesões, seleção nacional, aposentadoria.
- `careerEvents.ts` — os ~30 eventos narrativos (decisões com consequências reais nos atributos/reputação).
- `shirtNumbers.ts` — atribuição e evolução do número da camisa.

### Biografia (`lib/bio/`)

- `facts.ts` — extrai fatos objetivos da carreira (clube revelação, volta para casa, lesão grave, etc.) sem nunca inferir o que não aconteceu.
- `phrases.ts` — biblioteca de frases condicionais, cada uma só é elegível se os fatos da carreira a sustentam.
- `generate.ts` — monta o texto final em ordem cronológica global.
- `records.ts` — recordes mundiais reais (Cristiano Ronaldo, Messi, etc.) usados para comparar contra a carreira do jogador.

### Desafio diário (`lib/challenge/`)

- `metrics.ts` — extrai um snapshot plano (`CareerMetrics`) da carreira terminada; toda missão é pontuada só a partir daí, nunca lendo o motor de simulação diretamente.
- `missions.ts` — 30 missões, cada uma com uma curva de progresso contínua (nunca um gate binário) e uma lista de posições em que faz sentido ser sorteada.
- `daily.ts` — fixa seed, nacionalidade, posição e missão do dia a partir da data (UTC); a rotação de missões garante um intervalo mínimo antes de repetir; `scoreChallenge()` converte progresso em pontuação (0–1000+) numa curva que valoriza mais quem chega perto da meta.
- `leaderboard.ts` — ranking local em `localStorage`: a primeira tentativa completa de cada desafio vale para o ranking, replays contam como amistoso.

### Store (`store/careerStore.ts`)

Único store Zustand com `persist`. Guarda o rascunho de identidade/avatar, preferências (som, tema, modo, dificuldade) e a carreira em andamento. Migração versionada (`version`/`migrate`) para não quebrar saves antigos quando o formato muda.

### Debug panel

Em desenvolvimento (`npm run dev`), um botão 🐞 no canto inferior esquerdo abre um painel para forçar OVR, torcida, traço de personalidade, tier de talento, evento de carreira específico, transferência ou rival — útil para testar sem jogar dezenas de temporadas manualmente. Ele é removido do bundle em produção (`NODE_ENV === "production"`), a menos que `NEXT_PUBLIC_CRAQUE_DEBUG=1` seja definido de propósito.

## i18n

O jogo é totalmente traduzido para **português, espanhol e inglês** (`lib/i18n/locales.json` + `lib/i18n/context.tsx`), com troca de idioma em tempo real pela UI.

## Origem dos dados

O dataset de clubes, ligas, países e troféus foi originalmente extraído de um simulador de carreira de futebol público como ponto de partida para ter dados realistas (escudos, reputações, competições). A partir daí o projeto virou algo próprio: motor de progressão reescrito, sistema de atributos EA FC, avatar vetorial, identidade visual, eventos de carreira, biografia gerada, dificuldade configurável e o desafio diário são construções deste repositório, não uma porta 1:1 de outro jogo.
