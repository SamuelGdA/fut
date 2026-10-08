# Regras para IAs (e pessoas) que mexem no CRAQUE v2

Este arquivo vale para qualquer assistente de código (Claude, Codex, Cursor,
Copilot ou outro) e para qualquer pessoa. `AGENTS.md`, `CLAUDE.md` e
`.cursor/rules/craque.mdc` apontam para cá: as regras moram só aqui.

---

> ## ⚠️ REGRA ABSOLUTA
>
> **Toda e qualquer IA que modificar, adicionar ou remover funcionalidades,
> alterar a arquitetura ou mexer nas lógicas do motor deste projeto, tem a
> OBRIGAÇÃO de atualizar o `README.md` e o `GDD.md` imediatamente para
> refletir as mudanças. A documentação deve ser sempre a fonte da verdade
> exata do código atual.**

- `README.md` fica nesta pasta (`v2/README.md`); o GDD fica em `docs/GDD.md`.
- "Imediatamente" quer dizer **na mesma entrega** da mudança, nunca depois.
- Vale para números também: uma constante que muda no motor (uma chance, um
  limite, uma fórmula) muda no README e no GDD.
- Código e documentação que discordam são um defeito, tão grave quanto um
  teste quebrado.

---

## Antes de criar ou mudar qualquer coisa: as duas perguntas

Avalie cada funcionalidade por duas perguntas:

1. **Ela cria uma funcionalidade interessante?**
2. **O jogador consegue entender seu efeito facilmente?**

Se a resposta a qualquer uma for "não", simplifique a ideia ou não a faça.
Uma regra que o jogador não percebe, ou que só existe para complicar, não
entra no jogo. Na dúvida, mostre o efeito na tela (texto, número, selo) em
vez de escondê-lo no motor.

---

## Como trabalhar neste projeto

### 1. Leia antes de mexer

1. `README.md`: visão geral, mecânicas, arquitetura e comandos.
2. As seções do `docs/GDD.md` ligadas à mudança (e as notas "Como ficou").
3. As decisões de `docs/DECISOES.md` que tratam do assunto (D1 a D45).

### 2. Ponha cada coisa no lugar certo

| O quê | Onde |
|---|---|
| Regra de jogo, conta, sorteio | `packages/engine` (puro: sem React, DOM, relógio, `Math.random`, `Date`, armazenamento, textos) |
| Dado do mundo (clube, liga, competição, prêmio) | `packages/world` |
| Texto do jogo (evento, capa, manchete, biografia, conquista) | `packages/content`, nos três idiomas |
| Texto da interface | `apps/game/src/i18n` (`pt.ts` é a fonte; `es.ts` e `en.ts` com as mesmas chaves) |
| Arte gerada | `packages/art` |
| Tela, estado, save, PWA | `apps/game` |

### 3. Regras do motor

- Todo sorteio vem de `stream(semente, sistema, ...partes)`, num fluxo
  próprio. Nunca reaproveite o fluxo de outro sistema.
- O save é um replay: a mesma semente e as mesmas escolhas têm de dar a mesma
  carreira. Não guarde no save nada que o replay possa refazer.
- Mudou o resultado de alguma carreira? Suba `ENGINE_VERSION`
  (`packages/engine/src/version.ts`) e rode `pnpm balance`. As 51 metas do
  GDD 40 têm de passar; se uma meta precisar mudar, a mudança e o porquê vão
  para o GDD e para uma decisão nova.
- Mexeu em produção, prêmios ou títulos? Rode também `pnpm balance:recordes`
  (todo recorde alcançável e raro, D44).
- Mexeu em missões do Desafio do dia? Rode `pnpm desafio:calibrar`.
- Evento novo é dado: uma entrada em `events/catalog.ts` e um bloco de texto
  em cada idioma, sem lógica nova. O texto tem de dizer exatamente o que os
  efeitos fazem.

### 4. Regras da interface

- O laço (decisão, lance, jornal) cabe na tela sem rolar a página, de
  360 × 640 ao PC. Só telas de exploração rolam.
- Teclado, leitor de tela, contraste AA nos dois temas e movimento reduzido
  continuam funcionando.
- Todo texto existe em português, espanhol e inglês.
- **Nenhum travessão (— ou –) em texto de jogo**: troque por vírgula, dois
  pontos ou ponto, sem apagar a ideia.
- O **laboratório** (`/#lab`, `apps/game/src/screens/lab`) mostra e descreve
  as peças do jogo. Mudou algo que o laboratório mostra ou descreve? Mude o
  laboratório também.

### 5. Documente na mesma entrega

- `README.md`: o que mudou para quem lê o projeto pela primeira vez (regras,
  números, contagens, comandos, estrutura de pastas).
- `docs/GDD.md`: a especificação da regra. Se a implementação mudou algo,
  acrescente uma nota "Como ficou" na seção, com o número da decisão.
- `docs/DECISOES.md`: toda decisão de produto ou de arquitetura ganha o
  próximo número (D46, D47...), com **Decisão** e **Por quê**.
- Comentários no código explicam o porquê, em português, no tom do resto do
  arquivo.

### 6. Verifique antes de entregar

```bash
pnpm verify
```

Tipos, lint, testes, metas de balanceamento e build. Para mudança de tela,
rode também a suíte ponta a ponta (precisa do Google Chrome):

```bash
pnpm e2e
```

Teste que passa não encerra o trabalho: olhe a tela de verdade (celular e PC,
os dois temas), procure o que ficou estranho, ajuste e teste de novo.

### 7. Entregue completo

- Arquivos completos, nunca placeholders, "TODO" ou "implementar depois".
- Nenhum arquivo de rascunho ou experimento dentro do projeto.
- Não versione saídas geradas (`dist/`, `node_modules/`,
  `apps/game/e2e-relatorio/`, `apps/game/e2e-resultados/`). Os relatórios de
  `tools/balance/relatorios/` são versionados de propósito: são o registro de
  validação do motor.
- Mensagens de commit dizem o que mudou e por quê.
