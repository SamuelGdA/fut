# ADR 0003: Manter Next.js 16

- **Data:** 2026-09-18
- **Estado:** aceito
- **Decide:** o usuário, entre manter Next 16, migrar para Vite, e exportar
  estático.

## Contexto

O CRAQUE é cem por cento client-side. Não tem conta, não tem servidor, não tem
banco, e o jogo inteiro vive numa rota só. Escrito assim, ele parece um SPA de
Vite, e a tentação de trocar é real: dev server mais rápido, build mais simples,
uma dependência enorme a menos.

Três coisas puxam para o outro lado.

**As páginas de erro são convenções do framework.** São quatro (404, 403, 500,
503) mais a de falha da própria casca, e foram desenhadas como conjunto. Duas
delas existem justamente para o servidor apontar as próprias páginas de erro
para algo que pareça o jogo.

**O jogo mora num caminho de um site maior.** A rota é
`/juegos/simulador-carrera`, e a raiz redireciona para ela. Isso é estrutura de
um site, não de um SPA isolado.

**O motor sendo framework-free torna a escolha barata.** Depois do ADR 0001, o
que o framework segura é rota, metadata, fonte e build. Trocar isso é um dia de
trabalho a qualquer momento, e não uma reescrita.

## Decisão

Manter Next.js 16 com App Router e React 19.

Vale registrar a regra operacional que vem junto, e que já está em `AGENTS.md`:
**esta versão do Next não é a do treinamento dos modelos que trabalham no
repositório.** Antes de escrever código que toque nas convenções do framework,
ler o guia em `node_modules/next/dist/docs/`. A movimentação do app para
`apps/web/src/` na etapa 1 foi feita assim: o documento de convenção de `src`
confirmou que `public/` fica na raiz do app, que os arquivos de configuração
ficam na raiz do app, e que o alias `@/*` precisa passar a incluir `src/`.

## Consequências

**A favor.**

- Zero trabalho de migração agora, e nada quebra.
- As páginas de erro continuam funcionando como o desenho previa.
- A estrutura de rota sobrevive.

**Contra.**

- Um framework de servidor inteiro para servir uma página estática.
- O dev server é mais pesado que o de um Vite.
- As convenções mudam entre versões maiores, e é preciso ler a documentação
  local antes de mexer.

## Alternativas consideradas

**Vite com React Router.** Mais leve e mais rápido de desenvolver. Rejeitada
pelo custo de reimplementar as páginas de erro, a metadata e a estrutura de rota
à mão, sem ganho para o jogador.

**Next com saída estática.** Mantém as convenções e remove o runtime de
servidor. Não rejeitada, apenas adiada: é uma mudança de uma linha na
configuração e pode ser avaliada quando o deploy for definido.
