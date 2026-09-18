# CRAQUE: Simulador de Carreira

Um simulador de carreira de futebol 100% client-side. Você cria um jogador,
escolhe onde começar e joga temporada a temporada, por decisões narrativas e não
por partidas simuladas lance a lance, até a aposentadoria. No fim, o jogo
escreve a biografia da carreira e monta uma carta estilo EA FC com os atributos
no auge.

Não depende de backend nem de contas: todo o estado vive no navegador.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Zustand · [`motion`](https://motion.dev) · pnpm workspaces + Turborepo.

## Documentação

| Documento | O que é |
|---|---|
| [docs/REQUISITOS.md](docs/REQUISITOS.md) | A especificação completa do comportamento do jogo, em 55 seções |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Como o repositório é organizado e o que ainda falta mover |
| [docs/BALANCE.md](docs/BALANCE.md) | Como mexer em número de balanceamento sem quebrar nada |
| [docs/decisions/](docs/decisions) | ADRs das decisões estruturais |

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 20.9+ e [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Abra <http://localhost:3000>. A raiz redireciona para
`/juegos/simulador-carrera`, onde o jogo vive.

No Windows, dando duplo-clique em [`iniciar.bat`](iniciar.bat) ele instala o que
faltar e abre o jogo sozinho.

| Comando | O que faz |
|---|---|
| `pnpm build` | Build de produção |
| `pnpm verify` | Typecheck, lint e testes em tudo |
| `pnpm balance` | Confere o jogo contra os baselines de balanceamento |
| `pnpm balance:capture` | Regrava os baselines. Leia BALANCE.md antes |

## O que o jogo faz

1. **Criação de personagem.** Nome, pé preferido, nacionalidade (211 seleções),
   posição e um avatar vetorial totalmente customizável (cabelo, barba, olhos,
   nariz, boca, acessórios, cores), desenhado em SVG puro, sem imagem externa.

2. **Modo e dificuldade**, dois eixos independentes. O **modo** controla o
   ritmo: decisão a cada temporada ou a cada duas. A **dificuldade** controla o
   quanto o futebol perdoa: chance de talento raro, velocidade de evolução e
   declínio, chance de lesão, paciência dos clubes e reputação exigida para
   receber proposta.

3. **Carreira.** A cada período o motor resolve a temporada inteira: minutos,
   gols e assistências (ou jogos sem sofrer gol, para goleiros e defensores),
   evolução dos seis atributos, prêmios, disputa de títulos, acesso e
   rebaixamento, lesões, e eventualmente uma decisão narrativa entre 40 eventos
   de carreira.

4. **Talento oculto.** Todo jogador nasce com um teto de potencial sorteado
   (Promessa, Talento, Craque, Fenômeno, Geracional) que nunca é revelado como
   número. O veredito de olheiro vai afiando com a idade e os jogos, e é
   deliberadamente capaz de errar enquanto é só um rumor.

5. **Fim de carreira.** A tela de resumo monta a melhor carta da carreira
   (atributos no pico, não na aposentadoria), gera uma biografia em prosa
   condicional a partir do que de fato aconteceu, e mostra a linha do tempo de
   clubes, a vitrine de troféus, o rival e os recordes reais batidos. Dá para
   baixar como PNG ou compartilhar direto.

6. **Desafio do dia.** Todo mundo recebe a mesma semente, nacionalidade,
   posição, três briefings e um édito, sempre no difícil. Contam os dois
   melhores briefings, e insistir além do próprio auge custa pontos. Ranking
   local, que zera todo dia.

**O mundo:** 32 ligas em 17 países, 489 clubes, 211 seleções, 15 divisões de
acesso, e todas as competições continentais, mundiais e de seleção.

## Estrutura

```
apps/web/          o jogo (Next.js)
packages/          os pacotes de domínio, em extração
tools/balance/     captura e verificação dos baselines de balanceamento
tools/eslint-config/  as regras compartilhadas
docs/              especificação, arquitetura e ADRs
```

O repositório está em migração para uma arquitetura de monorepo com o motor de
simulação como pacote puro. A etapa 1 está concluída: a casca existe, o app foi
movido sem uma única alteração de conteúdo, e os baselines de balanceamento
foram capturados do código atual. O mapa completo, com o que falta e em que
ordem, está em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Origem dos dados

O dataset de clubes, ligas, países e troféus foi originalmente extraído de um
simulador de carreira público como ponto de partida para ter dados realistas.
A partir daí o projeto virou outra coisa: o motor de progressão foi reescrito, e
o sistema de atributos, o avatar vetorial, a identidade visual, os eventos de
carreira, a biografia gerada, a dificuldade configurável, a arte generativa de
escudos e troféus e o desafio diário são construções deste repositório, não uma
porta de outro jogo.
