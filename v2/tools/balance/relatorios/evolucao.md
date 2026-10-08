# Relatório de evolução do jogador

Motor 2.0.0-m8.4, semente `balanco-m2`, 6000 carreiras por lote. **17 de 17 metas atendidas.**

Gerado por `pnpm balance`. As carreiras rodam na caixa de areia da evolução: o clube vem de uma política
fixa e os títulos de um modelo provisório, até o mercado e as tabelas chegarem (M3 e M4).

## Normal, ritmo Intensa, política equilibrada

O lote de referência: clube do nível do jogador, foco de treino que mais sobe o OVR, uma temporada por decisão.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Normal | 28 / 34 / 22 / 11 / 5 | 27.4 / 34.7 / 22.6 / 10.7 / 4.8 |
| ✓ | Pico médio de OVR menos o potencial, por faixa | entre -2 e +3 em todas (bônus de títulos, D47) | Operário +1.4, Promissor +1.2, Craque +1.4, Estrela +2.3, Fenômeno +1.3 |
| ✓ | Justiça entre posições: diferença do pico relativo entre grupos | no máximo 3 pontos (bônus de títulos, D47) | 2.4 |
| ✓ | Idade do pico de OVR (mediana) | entre 26 e 29 | 28.0 (quartis 26.0 a 29.0) |
| ✓ | Maior subida de OVR numa temporada | no máximo +9 | +9 |
| ✓ | Temporadas com subida de 8 ou mais | no máximo 1% das temporadas | 0.04% |
| ✓ | Subidas de 8 ou mais só na juventude | até os 21 anos | até os 20 |
| ✓ | Crescimento típico de Craque, Estrela e Fenômeno dos 17 aos 19 (mediana por temporada) | entre +3 e +7 | +5.0 |
| ✓ | Declínio típico dos 33 aos 35 (mediana por temporada) | entre -4 e -1,5 | -3.0 |
| ✓ | Temporadas com queda de 7 ou mais, sem lesão | nenhuma | 0.00% (pior -6) |
| ✓ | Aos 16, faixas vizinhas se confundem (sem prodígios) | pelo menos 15% da faixa de cima começa abaixo da mediana da de baixo | Promissor/Operário 33%, Craque/Promissor 29%, Estrela/Craque 42%, Fenômeno/Estrela 31% |
| ✓ | Prodígios entre Estrelas e Fenômenos | 14% e 26% | 16.0% e 23.5% |
| ✓ | Os dois ritmos dão o mesmo jogador (Intensa contra Normal) | pico médio e OVR médio aos 21 a no máximo 0,6 de diferença, em todas as faixas | pico 0.49, aos 21 0.54 |

### OVR mediano por idade

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 49 | 58 | 65 | 69 | 70 | 71 | 71 | 71 | 69 | 63 | 55 | 45 | 40 | `▂▃▃▄▄▄▄▄▅▅▅▅▅▅▅▅▄▄▄▃▃▂▂▁` |
| Promissor | 50 | 60 | 69 | 74 | 77 | 78 | 78 | 78 | 76 | 71 | 63 | 52 | 47 | `▂▃▃▄▄▅▅▅▅▅▆▆▆▆▆▅▅▅▅▄▄▃▂▂` |
| Craque | 52 | 62 | 72 | 79 | 82 | 84 | 85 | 85 | 83 | 78 | 69 | 59 | 54 | `▂▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▆▆▆▅▄▄▃▃` |
| Estrela | 53 | 64 | 74 | 83 | 88 | 90 | 91 | 92 | 91 | 86 | 78 | 68 | 62 | `▃▃▄▅▅▆▆▆▇▇▇▇▇▇▇▇▇▇▆▆▆▅▄▄` |
| Fenômeno | 55 | 66 | 77 | 86 | 92 | 95 | 96 | 96 | 95 | 91 | 83 | 73 | 68 | `▃▃▄▅▅▆▆▇▇▇███████▇▇▇▆▆▅▄` |

### Variação de OVR por temporada

| Idade | 10% piores | Mediana | 10% melhores |
|---|---:|---:|---:|
| 17 a 19 | +3.0 | +5.0 | +6.0 |
| 20 a 22 | +1.0 | +3.0 | +5.0 |
| 23 a 25 | 0.0 | +1.0 | +2.0 |
| 26 a 29 | 0.0 | 0.0 | +1.0 |
| 30 a 32 | -2.0 | -1.0 | 0.0 |
| 33 a 35 | -5.0 | -3.0 | -1.0 |
| 36 a 39 | -6.0 | -5.0 | -3.0 |

Explosões em 5.1% das temporadas, tropeços em 8.0%.

### Faixas de talento

| Faixa | Carreiras | OVR aos 16 (mediana, sem prodígio) | Potencial médio | Pico médio | Pico - P | Chega a 80 | Idade em que chega a 80 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Operário | 1641 | 44 | 70.0 | 71.4 | +1.4 | 0% | n/d |
| Promissor | 2080 | 45 | 77.5 | 78.7 | +1.2 | 38% | 26 |
| Craque | 1355 | 47 | 83.9 | 85.4 | +1.4 | 97% | 23 |
| Estrela | 639 | 48 | 89.6 | 91.9 | +2.3 | 99% | 22 |
| Fenômeno | 285 | 50 | 94.6 | 95.9 | +1.3 | 100% | 21 |

### Posições

| Grupo | Pico - P (média) |
|---|---:|
| Atacante | +0.8 |
| Meia ofensivo | +0.8 |
| Meio-campo | +1.8 |
| Lateral | +1.2 |
| Zagueiro | +2.7 |
| Goleiro | +3.2 |

## Difícil, ritmo Intensa, política equilibrada

Talento mais raro, crescimento 14% mais lento e declínio 25% mais rápido.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Difícil | 45 / 34 / 15 / 4 / 1 | 44.8 / 35.3 / 15.1 / 3.9 / 0.9 |
| ✓ | No Difícil, o OVR mediano aos 21 anos fica abaixo do Normal na mesma faixa | pelo menos 1 ponto abaixo em todas as faixas | Operário -2, Promissor -2, Craque -3, Estrela -3, Fenômeno -3 |
| ✓ | No Difícil, pico médio de OVR menos o potencial | entre -3 e +2 em todas as faixas | Operário +0.8, Promissor +0.1, Craque -0.3, Estrela -0.5, Fenômeno +0.7 |
| ✓ | No Difícil, maior subida numa temporada | no máximo +9 | +8 |

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 48 | 57 | 63 | 67 | 69 | 70 | 70 | 70 | 67 | 62 | 51 | 39 | 33 | `▂▃▃▃▄▄▄▄▄▅▅▅▅▅▅▄▄▄▄▃▂▂▁▁` |
| Promissor | 50 | 59 | 67 | 72 | 75 | 77 | 77 | 77 | 75 | 69 | 58 | 46 | 40 | `▂▃▃▄▄▅▅▅▅▅▅▅▅▅▅▅▅▅▄▄▃▂▂▁` |
| Craque | 51 | 61 | 69 | 76 | 80 | 82 | 83 | 84 | 81 | 75 | 65 | 53 | 46 | `▂▃▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▆▅▅▄▃▂▂` |
| Estrela | 53 | 63 | 72 | 79 | 84 | 87 | 89 | 89 | 87 | 81 | 70 | 57 | 51 | `▃▃▄▄▅▅▆▆▆▆▇▇▇▇▇▇▇▆▆▅▅▄▃▂` |
| Fenômeno | 56 | 66 | 75 | 83 | 90 | 93 | 95 | 95 | 94 | 90 | 80 | 67 | 61 | `▃▃▄▅▅▆▆▇▇▇▇▇████▇▇▇▆▆▅▄▃` |

## Políticas de clube (pico - P por faixa)

Mesmo lote de sementes, só a escolha de clube muda. Mostra a troca entre minutos e treinador.

| Política | Operário | Promissor | Craque | Estrela | Fenômeno | Jogos aos 18 | Jogos aos 24 | Maior subida |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Equilibrada (clube do nível) | +1.4 | +1.2 | +1.4 | +2.3 | +1.3 | 37 | 37 | +9 |
| Minutos (clube abaixo) | +1.3 | +0.8 | +0.8 | +1.8 | +0.8 | 41 | 41 | +8 |
| Ambiciosa (clube acima) | +0.2 | -0.7 | -1.6 | -1.2 | -2.9 | 17 | 18 | +8 |
| Sorteada | +1.1 | +0.8 | +0.8 | +1.4 | +0.4 | 33 | 34 | +8 |
