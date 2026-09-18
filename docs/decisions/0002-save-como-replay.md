# ADR 0002: O save é a lista de decisões, com snapshot de cache

- **Data:** 2026-09-18
- **Estado:** aceito, ainda não implementado (etapa 8 da migração)
- **Decide:** o usuário, entre híbrido, só replay, e manter o snapshot completo.

## Contexto

Hoje o save é o `CareerState` inteiro serializado no armazenamento do
navegador. Isso trouxe três problemas, todos reais:

1. **É grande e frágil.** Vinte e quatro temporadas com atributos, títulos,
   manchetes, memória de torcida e ofertas recusadas.
2. **Precisa de um validador escrito à mão.** São cerca de sessenta linhas de
   type guard que têm que ser mantidas em sincronia com a forma do estado por
   disciplina, e cuja regra declarada é dura: um save que passa na validação e
   depois estoura é o pior resultado disponível, porque ele é recarregado a cada
   visita e o jogador precisa achar o botão de recuperação para escapar.
3. **É editável.** O armazenamento é gravável pelo usuário. Nada impede escrever
   um OVR 99 à mão, o que torna qualquer ranking uma decoração.

Enquanto isso, a carreira **já é** totalmente determinada por semente,
configuração, identidade e a lista ordenada de escolhas. Essa informação cabe em
algumas centenas de bytes e o jogo já a possui.

## Decisão

Gravar o **replay** como verdade e um **snapshot como cache**:

```
{ engineVersion, seed, setup, choices[], snapshot? }
```

- Abrir um save: se `engineVersion` bate, reexecuta o replay e descarta o cache.
- Se não bate, abre pelo snapshot em **modo leitura**, sem continuar a carreira.
- O replay roda num Web Worker, para que refazer vinte e quatro temporadas na
  abertura não trave a primeira pintura.

## Consequências

**A favor.**

- Save minúsculo.
- Integridade de graça: não há OVR para editar, só escolhas, e escolhas
  inválidas são rejeitadas pelo próprio motor ao reexecutar.
- Carreira compartilhável por link.
- Um relatório de bug vira uma string.
- O ranking do desafio fica verificável no servidor, se um dia existir um.

**Contra.**

- Toda mudança no motor invalida replays antigos. É o custo real, e é por isso
  que o snapshot de cache existe.
- O modo leitura precisa ser projetado: uma carreira antiga abre no resumo e
  não pode continuar. Isso precisa ser dito ao jogador com clareza, não
  escondido.
- O worker adiciona uma fronteira assíncrona onde hoje há uma leitura síncrona.

## Alternativas consideradas

**Só replay, sem cache.** Mais limpo e menor. Rejeitada: sem fallback, uma
mudança de número de balanceamento apagaria a carreira de quem estava jogando.
O jogo é local-first e não tem backup em lugar nenhum.

**Manter o snapshot completo, validado por schema.** Migração mais simples e
resolve o problema do validador à mão. Rejeitada: não resolve tamanho,
integridade nem compartilhamento, que são três dos quatro motivos.
