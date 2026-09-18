# Balanceamento

Como mexer em número sem quebrar nada por acidente, e como saber que quebrou
quando for de propósito.

Contexto e justificativa em [ADR 0004](./decisions/0004-baselines-de-balanceamento.md).

---

## O ciclo

```
1. pnpm balance            confere que você parte de um estado limpo
2. mexa no que for mexer
3. pnpm balance            leia o diff
4. a mudança era a que você queria?
     não  -> conserte e volte ao 3
     sim  -> pnpm balance:capture, e o diff vai no corpo do commit
```

A regra que faz o sistema valer alguma coisa: **recapturar é aceitar.** Um
`capture` por reflexo, para "limpar" a saída vermelha, apaga exatamente a
informação que o portão existe para dar.

---

## O que cada baseline detecta

| Baseline | Quebra quando | Não quebra quando |
|---|---|---|
| `fingerprints` | Qualquer coisa muda no que o jogador vê, em qualquer temporada de 240 carreiras | Nunca. É exato. |
| `aggregate` | As distribuições se movem | Uma refatoração pura reordena chamadas sem mudar resultado |
| `challenge` | O dealer muda de mão, ou um dia fica impossível | |

A distinção entre os dois primeiros é a parte útil:

- **Fingerprints quebram, aggregate não muda:** você mudou a *ordem* dos
  sorteios sem mudar o balanceamento. Numa refatoração, isso é quase sempre um
  acidente e vale investigar. É legítimo se você moveu deliberadamente uma
  chamada do gerador.
- **Aggregate muda, fingerprints também:** você mexeu em número. Esperado numa
  sessão de tuning.
- **Aggregate muda e fingerprints não:** impossível. Se acontecer, o bug está
  na ferramenta.

---

## Lendo a saída

```
Fingerprints  (240 careers, exact match required)
  3 career(s) changed
  fp-014-CB-normal-hard: diverged at age 24
      goals 128 -> 131; trophies 4 -> 5
```

A idade é a **primeira** temporada que parou de bater. Tudo depois dela é
consequência, não causa: uma carreira é uma cadeia, e a segunda divergência
quase nunca é um segundo bug.

```
  target drift:
  targets.hardGenerationalPct
      1.3  ->  1.8  (+0.5, +38.5%)
```

Os `targets` são os catorze números sobre os quais o desenho tem opinião
declarada, e estão especificados em REQUISITOS.md seções 25.6 e 4.2. Eles vêm
primeiro no relatório porque são os que merecem discussão antes do resto.

---

## Os alvos declarados

De REQUISITOS.md seção 25.6 e 54:

| Alvo | Faixa |
|---|---|
| Recorde de Bola de Ouro (8) batido | 6% a 10% das carreiras geracionais |
| Quatro Bolas de Ouro seguidas | 5% a 8% das geracionais |
| Recorde de Chuteira de Ouro (6) | 12% a 15% das geracionais na Europa |
| Mediana de uma carreira geracional | 1 a 2 Bolas de Ouro |
| Distribuição de talento no difícil | ~45 / 34 / 15 / 4 / 1 |
| Teto de contagem em qualquer prêmio | **Nunca existe** |

**Importante:** os alvos descrevem um jogador que está perseguindo o objetivo.
O corpus é jogado por três políticas fixas, e nenhuma delas persegue nada. As
taxas medidas são um **piso**, e ficar abaixo do alvo no corpus não é, sozinho,
prova de que o jogo está difícil demais.

A distribuição de talento é a exceção: ela não depende de decisão nenhuma, e
por isso é comparável diretamente. Na captura inicial ela saiu em
45,8 / 33,9 / 14,7 / 4,3 / 1,3, que é o alvo.

---

## O corpus

Definido em `tools/balance/src/corpus.ts`. **A semente mestre e a forma nunca
mudam.** Mudar qualquer uma invalida todos os números guardados, e é por isso
que elas estão numa constante com nome e não espalhadas.

| | |
|---|---|
| Semente mestre | `craque-balance-v1` |
| Fingerprints | 240 carreiras, 20 por posição, os dois modos, as duas dificuldades |
| Aggregate | 6.000 carreiras, 60% difícil, países jogáveis e estrangeiros |
| Challenge | 180 dias a partir de 2026-01-01, 30 deles jogados 6 vezes |

### As políticas de decisão

Três, porque uma não basta para confiar num baseline.

| Política | Como escolhe | Para que serve |
|---|---|---|
| `first` | Sempre a primeira opção | A linha de menor esforço, sem nenhuma aleatoriedade |
| `ambitious` | O maior escudo na mesa | Exercita mercado, briefings e odds de título |
| `varied` | Sorteio semeado | Alcança ramos raros: lesão grave, troca de seleção, homenagem de camisa |

Nenhuma aceita aposentadoria quando existe outra opção, para que a carreira
sempre chegue ao fim natural.

O fluxo de decisão da política é um gerador **separado** do da simulação, então
a forma como um robô escolhe nunca perturba a sequência de sorteios do jogo.

---

## Quando o ambiente muda

Cada baseline grava a versão de Node, a plataforma e a arquitetura. A simulação
usa `Math.pow`, `Math.exp` e `Math.log2`, e esses três não são garantidamente
idênticos bit a bit entre motores de JavaScript.

Se aparecer um diff largo e difuso logo depois de uma atualização de Node, olhe
o bloco `environment` antes de procurar bug no código.

---

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm balance` | Confere tudo, com relatório. Sai com código 1 se houver diferença |
| `pnpm balance:capture` | Regrava os três baselines |
| `pnpm --filter @craque/balance exec vite-node src/cli.ts -- check fingerprints` | Só um dos três |
| `pnpm --filter @craque/balance exec vite-node src/cli.ts -- check --verbose` | Diff completo, sem corte |
| `pnpm --filter @craque/balance test` | A mesma conferência como suíte de teste |
