# ADR 0004: Baselines de balanceamento como portão da migração

- **Data:** 2026-09-18
- **Estado:** aceito e implementado

## Contexto

O balanceamento do CRAQUE foi ajustado ao longo de muitos ciclos medidos, e
quase nada dele é óbvio lendo o código. Alguns exemplos do que está embutido em
números soltos:

- O modelo de OVR foi ajustado contra vinte e três cartas reais de referência
  até o erro médio cair para 0,76 ponto.
- As odds de prêmio foram retrabalhadas quatro vezes, primeiro para eliminar
  carreiras com dez Bolas de Ouro, depois para voltar a permitir que o recorde
  fosse alcançável.
- O amortecedor de campeão reinante tem piso porque sem ele quatro títulos
  seguidos era aritmeticamente impossível.
- Ritmo e Físico crescem barato porque, nivelados com os demais, um zagueiro
  terminava com Físico como maior número da carta em 146 de 150 testes.

Nenhuma dessas medições estava versionada. Elas viviam em scripts de scratchpad
rodados à mão e conferidos no olho. Uma reescrita que mexesse em qualquer um
desses números não seria percebida até muito depois, e possivelmente só por um
jogador reclamando.

## Decisão

Antes de mover uma única linha de lógica, capturar baselines a partir do código
atual e transformá-los em teste. São três, e falham por motivos diferentes de
propósito.

**Fingerprints.** 240 carreiras jogadas por políticas fixas, cada temporada
reduzida a um digest do que o jogador veria: carta arredondada, jogos, gols,
títulos, prêmios, camisa, contusão. Comparação **exata**. Um diff diz qual
carreira divergiu e em que idade.

**Aggregate.** 6.000 carreiras, reduzidas a distribuições: talento por
dificuldade, OVR de pico por faixa e por posição, a carta média de cada posição,
produção por papel, títulos, prêmios, sequências, recordes batidos, motivos de
aposentadoria.

**Challenge.** 180 dias auditados: três eixos distintos, posição compatível,
nenhuma contradição, nenhum conflito de édito, e nenhum dia impossível de
pontuar. Mais uma amostra jogada de 30 dias.

A comparação é exata em tudo, sem banda de tolerância. O corpus é fixo e a
simulação é determinística, então dois runs do mesmo código produzem números
idênticos; uma tolerância só serviria para esconder mudança real. A magnitude
continua sendo reportada, porque quando um número se move a primeira pergunta é
sempre de quanto.

## Consequências

**A favor.**

- Uma refatoração que preserva o comportamento deixa os 240 digests intactos.
- Uma que não preserva diz qual carreira e qual temporada.
- Uma mudança de tuning quebra as distribuições e não os digests, que é
  precisamente a distinção útil: o primeiro é bug, o segundo é decisão.
- A suíte inteira roda em onze segundos.

**Contra.**

- Os baselines são um artefato de dados versionado. Aceitar uma mudança exige
  recapturar, e recapturar por reflexo anula o portão inteiro. Ver BALANCE.md.
- `Math.pow`, `Math.exp` e `Math.log2` não são bit a bit idênticos entre motores
  de JavaScript, e a simulação usa os três. Cada baseline grava a versão de Node
  e a plataforma para que um diff depois de uma atualização leia como
  explicação, e não como mistério.

## Nota sobre o que os números medem

As carreiras do corpus são jogadas por três políticas fixas, e nenhuma delas
está tentando ganhar prêmio. Os alvos escritos em REQUISITOS.md seção 25.6 são
sobre o que um jogador **motivado** alcança, então as taxas medidas aqui são um
piso, não um veredito.

Concretamente, na captura inicial: o recorde de Bola de Ouro é batido por 3,03%
das carreiras geracionais do corpus, contra um alvo de 6% a 10% para um jogador
de verdade; quatro seguidas ficam em 0,61% contra 5% a 8%. Os extremos
continuam alcançáveis, e o corpus contém carreiras com oito Bolas de Ouro e
sequências de seis.

**Isso não é conclusão de que o balanceamento está errado.** É a leitura de um
robô que não persegue o objetivo. O que estes números servem para responder é
"mudou?", não "está bom?".
