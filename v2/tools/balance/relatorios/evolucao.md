# Relatório de evolução do jogador

Motor 2.0.0-m23, semente `balanco-m2`, 6000 carreiras por lote. **17 de 17 metas atendidas.**

Gerado por `pnpm balance`. As carreiras rodam na caixa de areia da evolução: o clube vem de uma política
fixa e os títulos de um modelo provisório, até o mercado e as tabelas chegarem (M3 e M4).

## Normal, ritmo Intensa, política equilibrada

O lote de referência: clube do nível do jogador, foco de treino que mais sobe o OVR, uma temporada por decisão.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Normal | 26 / 33 / 23 / 12 / 6 | 25.5 / 33.1 / 23.7 / 12.1 / 5.6 |
| ✓ | Pico médio de OVR menos o potencial, por faixa | entre -2 e +3 em todas (bônus de títulos, D47) | Operário +0.8, Promissor +0.4, Craque +0.1, Estrela +0.2, Fenômeno -0.2 |
| ✓ | Justiça entre posições: diferença do pico relativo entre grupos | no máximo 3 pontos (bônus de títulos, D47) | 1.8 |
| ✓ | Idade do pico de OVR (mediana) | entre 26 e 29 | 27.0 (quartis 25.0 a 28.0) |
| ✓ | Maior subida de OVR numa temporada | no máximo +9 | +8 |
| ✓ | Temporadas com subida de 8 ou mais | no máximo 1% das temporadas | 0.02% |
| ✓ | Subidas de 8 ou mais só na juventude | até os 21 anos | até os 19 |
| ✓ | Crescimento típico de Craque, Estrela e Fenômeno dos 17 aos 19 (mediana por temporada) | entre +3 e +7 | +5.0 |
| ✓ | Declínio típico dos 33 aos 35 (mediana por temporada) | entre -4 e -1,5 | -3.0 |
| ✓ | Temporadas com queda de 7 ou mais, sem lesão | nenhuma | 0.00% (pior -6) |
| ✓ | Aos 16, faixas vizinhas se confundem (sem prodígios) | pelo menos 15% da faixa de cima começa abaixo da mediana da de baixo | Promissor/Operário 33%, Craque/Promissor 29%, Estrela/Craque 42%, Fenômeno/Estrela 33% |
| ✓ | Prodígios entre Estrelas e Fenômenos | 14% e 26% | 15.8% e 23.5% |
| ✓ | Os dois ritmos dão o mesmo jogador (Intensa contra Normal) | pico médio e OVR médio aos 21 a no máximo 0,6 de diferença, em todas as faixas | pico 0.28, aos 21 0.51 |

### OVR mediano por idade

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 49 | 58 | 65 | 69 | 70 | 70 | 71 | 70 | 68 | 63 | 55 | 45 | 40 | `▂▃▃▄▄▄▄▄▅▅▅▅▅▅▅▄▄▄▄▃▃▂▂▁` |
| Promissor | 50 | 60 | 69 | 74 | 77 | 77 | 78 | 78 | 75 | 70 | 62 | 52 | 47 | `▂▃▃▄▄▅▅▅▅▅▅▆▆▆▆▅▅▅▅▄▄▃▂▂` |
| Craque | 52 | 62 | 72 | 79 | 82 | 83 | 84 | 84 | 82 | 77 | 68 | 58 | 53 | `▂▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▆▆▅▅▄▄▃▃` |
| Estrela | 53 | 64 | 74 | 83 | 87 | 89 | 90 | 90 | 88 | 83 | 74 | 64 | 59 | `▃▃▄▄▅▆▆▆▇▇▇▇▇▇▇▇▇▆▆▆▅▄▄▃` |
| Fenômeno | 55 | 66 | 77 | 86 | 92 | 94 | 95 | 95 | 93 | 89 | 80 | 70 | 65 | `▃▃▄▅▅▆▆▇▇▇▇▇███▇▇▇▇▆▆▅▅▄` |

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
| Operário | 1528 | 44 | 70.0 | 70.8 | +0.8 | 0% | n/d |
| Promissor | 1989 | 45 | 77.5 | 77.9 | +0.4 | 27% | 25 |
| Craque | 1420 | 47 | 84.0 | 84.1 | +0.1 | 96% | 23 |
| Estrela | 727 | 48 | 89.5 | 89.7 | +0.2 | 99% | 22 |
| Fenômeno | 336 | 49 | 94.6 | 94.4 | -0.2 | 100% | 21 |

### Posições

| Grupo | Pico - P (média) |
|---|---:|
| Atacante | -0.0 |
| Meia ofensivo | -0.1 |
| Meio-campo | +0.7 |
| Lateral | +0.3 |
| Zagueiro | +1.3 |
| Goleiro | +1.7 |

## Difícil, ritmo Intensa, política equilibrada

Talento mais raro, crescimento 14% mais lento e declínio 25% mais rápido.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Difícil | 43.45454545454545 / 33.343434343434346 / 16.151515151515152 / 5.040404040404041 / 2.0101010101010104 | 42.8 / 34.1 / 16.5 / 4.6 / 1.9 |
| ✓ | No Difícil, o OVR mediano aos 21 anos fica abaixo do Normal na mesma faixa | pelo menos 1 ponto abaixo em todas as faixas | Operário -2, Promissor -2, Craque -3, Estrela -3, Fenômeno -3 |
| ✓ | No Difícil, pico médio de OVR menos o potencial | entre -3 e +2 em todas as faixas | Operário +0.3, Promissor -0.3, Craque -1.2, Estrela -1.5, Fenômeno -1.4 |
| ✓ | No Difícil, maior subida numa temporada | no máximo +9 | +8 |

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 48 | 57 | 63 | 67 | 69 | 70 | 70 | 70 | 67 | 61 | 51 | 39 | 33 | `▂▃▃▃▄▄▄▄▄▄▅▅▅▅▅▄▄▄▃▃▂▂▁▁` |
| Promissor | 50 | 59 | 67 | 72 | 75 | 76 | 77 | 77 | 74 | 68 | 58 | 46 | 40 | `▂▃▃▄▄▅▅▅▅▅▅▅▅▅▅▅▅▅▄▄▃▂▂▁` |
| Craque | 51 | 61 | 69 | 76 | 80 | 82 | 83 | 83 | 80 | 74 | 64 | 51 | 45 | `▂▃▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▆▅▄▄▃▂▂` |
| Estrela | 53 | 63 | 72 | 79 | 84 | 87 | 88 | 88 | 86 | 80 | 70 | 57 | 51 | `▃▃▄▄▅▅▆▆▆▆▇▇▇▇▇▇▆▆▆▅▅▄▃▂` |
| Fenômeno | 55 | 65 | 74 | 83 | 89 | 92 | 93 | 93 | 91 | 86 | 76 | 64 | 58 | `▃▃▄▅▅▆▆▆▇▇▇▇▇▇▇▇▇▇▆▆▅▅▄▃` |

## Políticas de clube (pico - P por faixa)

Mesmo lote de sementes, só a escolha de clube muda. Mostra a troca entre minutos e treinador.

| Política | Operário | Promissor | Craque | Estrela | Fenômeno | Jogos aos 18 | Jogos aos 24 | Maior subida |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Equilibrada (clube do nível) | +0.8 | +0.4 | +0.1 | +0.2 | -0.2 | 37 | 37 | +8 |
| Minutos (clube abaixo) | +0.7 | +0.3 | -0.0 | -0.1 | -0.5 | 41 | 41 | +8 |
| Ambiciosa (clube acima) | -0.3 | -1.4 | -2.4 | -2.6 | -3.5 | 17 | 18 | +7 |
| Sorteada | +0.6 | +0.1 | -0.3 | -0.4 | -0.8 | 33 | 34 | +8 |
