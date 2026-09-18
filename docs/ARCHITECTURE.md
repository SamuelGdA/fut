# Arquitetura

Como o CRAQUE é organizado, por quê, e o que ainda falta mover.

A especificação do que o jogo faz está em [REQUISITOS.md](./REQUISITOS.md).
Este documento trata só de estrutura. As decisões maiores têm registro próprio
em [decisions/](./decisions).

---

## 1. A ideia central

O jogo é uma **máquina de estados determinística e pura** com uma camada fina de
renderização por cima. Toda a arquitetura decorre de levar isso a sério:

```
semente + configuração + lista ordenada de escolhas  ->  carreira inteira
```

Nada mais entra. Sem relógio, sem rede, sem `Math.random`, sem estado ambiente.
Consequências diretas:

- A simulação roda igual no navegador, no Node e no test runner.
- Um save é a lista de escolhas, não o estado (ver ADR 0002).
- Um bug é reproduzível a partir de uma string.
- O balanceamento é mensurável, e portanto travável (ver ADR 0004).

---

## 2. Mapa

```
craque/
├── apps/web/            Next.js. A única coisa que é publicada.
├── packages/
│   ├── engine/          Simulação pura. Zero dependências, zero framework.
│   ├── data/            O mundo: países, ligas, clubes, competições.
│   ├── content/         Prosa e traduções.
│   └── art/             Arte generativa. Sem framework.
├── tools/
│   ├── balance/         Captura e verificação dos baselines.
│   └── eslint-config/   As regras compartilhadas.
└── docs/
    ├── REQUISITOS.md    O que o jogo faz.
    ├── ARCHITECTURE.md  Este arquivo.
    ├── BALANCE.md       Como mexer em número sem quebrar nada.
    └── decisions/       ADRs.
```

A separação entre `packages/` e `tools/` é deliberada: **`packages/` é o jogo,
`tools/` é a oficina.** Nada em `tools/` entra no que o jogador baixa.

### Direção de dependência

```
            data
           ↗  ↑  ↖
     engine  art  content
           ↖  ↑  ↗
            apps/web

    tools/balance  →  engine (hoje: apps/web)
```

Uma seta para cima nunca existe. O motor não conhece o app, não conhece React,
e não conhece a arte. Essa é a regra que o monorepo torna um erro de
compilação em vez de uma convenção (ver ADR 0001).

---

## 3. Camadas

### `packages/engine`

Organizado por **conceito de domínio**, não por camada técnica.

| Pasta | O que vive ali |
|---|---|
| `kernel/` | Gerador semeado, curvas, identificadores determinísticos |
| `config/` | **Todo** número ajustável, **nenhuma** lógica |
| `model/` | Tipos, schemas de save e migrações |
| `rating/` | A carta: pesos, OVR, tetos, crescimento, declínio, forma |
| `season/` | O que acontece em campo |
| `competition/` | Títulos, acesso, seleção, prêmios, prestígio de clube |
| `market/` | Ofertas, afinidade, empréstimos, briefings, valor |
| `narrative/` | Torcida, standing, rival, camisa, manchetes, capa |
| `events/` | Catálogo, agendamento, elegibilidade, resolução |
| `flow/` | O laço: começar, próxima decisão, aplicar, avançar, aposentar |
| `query/` | Read-models derivados, calculados uma vez |

Três pontos que justificam essa divisão:

**`config/` separa número de fórmula.** Balancear deixa de ser editar
matemática. É também o que permite que os baselines signifiquem alguma coisa:
uma mudança de número aparece num diff de uma linha.

**`query/careerMetrics` é fonte única.** Hoje o standing de clube é recalculado
em três lugares independentes (o placar do desafio, a linha do tempo e os fatos
da biografia), com três cópias da mesma regra. Duas já discordaram entre si.

**`flow/` é o que resta do módulo de carreira.** Ele tem 2.843 linhas hoje e
segura tipos, agendamento, geração de decisão, resolução, simulação de
temporada, visões derivadas e ferramentas de debug ao mesmo tempo.

### `apps/web`

Fatias verticais por feature, não uma pasta plana de componentes.

| Pasta | O que vive ali |
|---|---|
| `app/` | Só rotas, finas. Grupos `(game)`, `(errors)`, `(lab)` |
| `features/` | `onboarding`, `career`, `summary`, `challenge`, `sharing`, `settings` |
| `shared/` | Primitivas de UI, i18n, áudio, movimento, plataforma |
| `state/` | Store fina sobre o motor, com persistência atrás de uma interface |
| `workers/` | Replay e laboratório de balanceamento fora da thread principal |

A store é **adaptadora**, não dona de regra. O validador de save sai da
configuração de persistência e vira schema no motor.

---

## 4. Padrão de código

Regras que reprovam o build, não que ficam num documento. Vivem em
`tools/eslint-config`.

### `base` — vale para tudo

| Regra | Efeito |
|---|---|
| `no-explicit-any` | `unknown` na fronteira, nunca `any` depois dela |
| `consistent-type-imports` | Import de tipo é sempre explícito |
| `no-param-reassign` | Argumento não é variável de trabalho |
| `eqeqeq` | Comparação estrita, exceto contra `null` |
| `no-console` | Aviso, com `warn` e `error` liberados |

### `strict` — só nos pacotes extraídos

| Regra | Limite |
|---|---|
| `max-lines` | 300 |
| `max-lines-per-function` | 50 |
| `complexity` | 12 |
| `max-depth` | 3 |
| `max-params` | 4 |
| `max-nested-callbacks` | 3 |
| Export default | Proibido |
| `Math.random`, `Date.now`, `new Date()` | Proibidos: quebram o determinismo |

**O app não recebe `strict` hoje.** Ele guarda o código pré-reescrita, movido
verbatim, e os tetos reprovariam módulos que existem só até o motor sair. Cada
pacote que deixa o app nasce com `strict` ligado, então o teto se aplica ao
código que vai ficar, e não ao que vai embora.

### Convenções

- **Código em inglês, conteúdo e interface em português.**
- Funções do motor são `(estado, entrada) => estado`. Puras, sem I/O.
- Mutação é permitida **dentro** de uma temporada, em objeto de trabalho local,
  e congelada na saída: o laço roda milhares de carreiras nos testes.
- **Comentário explica por quê, nunca o quê.** Os comentários do código atual
  registram a tentativa que falhou e o número que ela produziu. Isso é o ativo
  mais valioso do repositório e não se perde na migração. Decisão grande
  gradua de comentário para ADR.
- Os testes citam a seção de `REQUISITOS.md` que verificam.

---

## 5. Estado da migração

| # | Etapa | Estado |
|---|---|---|
| 1 | Esqueleto do monorepo, tooling, docs | **Feito** |
| 2 | Baselines de balanceamento capturados do código atual | **Feito** |
| 3 | `data` e `art` extraídos | pendente |
| 4 | `content` extraído, com lint de travessão, paridade e variantes | pendente |
| 5 | `engine` extraído módulo a módulo | pendente |
| 6 | Especificação única da carta e do avatar | pendente |
| 7 | App reorganizado em fatias verticais | pendente |
| 8 | Formato de replay com fallback de snapshot | pendente |

Durante a etapa 1 o app inteiro foi movido para `apps/web/` **sem uma única
alteração de conteúdo**: 866 arquivos, todos detectados pelo git como renomeação
pura. `tsc` e `next build` passam, e os baselines foram capturados depois do
movimento, contra o código no seu lugar final.

### A ponte transitória

O motor ainda mora dentro do app, então `tools/balance` alcança a simulação
pelo alias `@/` do próprio app, configurado em `tools/balance/vite.config.ts`.
**Essa é a única linha que muda quando o motor sair:** `@/` deixa de apontar
para o app e `@craque/engine` assume. Os baselines não se movem, que é
exatamente a razão de terem sido capturados antes e não depois.

---

## 6. Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Sobe o jogo |
| `pnpm build` | Compila tudo |
| `pnpm verify` | Typecheck, lint e testes em tudo |
| `pnpm balance` | Confere o jogo contra os baselines, com relatório |
| `pnpm balance:capture` | Regrava os baselines (ver BALANCE.md antes) |
