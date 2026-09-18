# ADR 0001: Monorepo com o motor como pacote puro

- **Data:** 2026-09-18
- **Estado:** aceito
- **Decide:** o usuário, entre monorepo, app único com fronteiras por lint, e
  monorepo sem Turborepo.

## Contexto

A simulação do CRAQUE já era pura e determinística, mas estava misturada com
Next, React e os dados do mundo dentro de um único projeto. Nada impedia um
módulo de simulação de importar um componente, e nada impedia um componente de
importar o interior da simulação. As duas coisas aconteceram:

- `components/PlayerCard.tsx` importa `scoutedTalent` direto do motor.
- `components/CareerTimeline.tsx` recalcula standing de clube por conta própria,
  duplicando regra que também existe em `challenge/metrics.ts` e em
  `bio/facts.ts`. Três cópias da mesma coisa.

Os harnesses de balanceamento já rodavam a simulação fora do navegador, com
`jiti` e scripts `.cjs` num scratchpad que não sobrevivia à sessão. Ou seja: a
separação já era necessária na prática, só não tinha contrato.

## Decisão

Monorepo com pnpm workspaces e Turborepo. Quatro pacotes de domínio
(`engine`, `data`, `content`, `art`), um app, e as ferramentas em `tools/`.

O motor não declara React, Next nem nada de navegador como dependência, então
importá-los passa a ser um erro de resolução e não uma questão de disciplina.

## Consequências

**A favor.**

- A fronteira vira erro de compilação em vez de convenção.
- O motor é testável isolado, em Node, sem transpilar JSX.
- A CLI de balanceamento importa o motor sem arrastar o framework.
- A escolha de framework do app fica reversível: ver ADR 0003.

**Contra.**

- Mais configuração: workspace, Turborepo, um tsconfig por pacote.
- Um passo a mais para rodar qualquer coisa, até a ferramenta virar hábito.
- O Turborepo é a peça descartável das três. Se o cache de tarefas não pagar o
  peso, sai sem afetar o resto.

## Alternativas consideradas

**App único com fronteiras por lint.** Mesma separação lógica, imposta por
`dependency-cruiser` e regras de import. Mais simples de montar. Rejeitada
porque a fronteira continua sendo uma regra que alguém pode silenciar numa
linha, e porque não resolve o problema de rodar o motor fora do bundle do app.

**Monorepo sem Turborepo.** Mesma separação, sem orquestração de tarefas.
Continua sendo o plano B se o Turborepo incomodar.
