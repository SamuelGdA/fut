# Relatório de evolução do jogador

Motor 2.0.0-m8.2, semente `balanco-m2`, 6000 carreiras por lote. **17 de 17 metas atendidas.**

Gerado por `pnpm balance`. As carreiras rodam na caixa de areia da evolução: o clube vem de uma política
fixa e os títulos de um modelo provisório, até o mercado e as tabelas chegarem (M3 e M4).

## Normal, ritmo Intensa, política equilibrada

O lote de referência: clube do nível do jogador, foco de treino que mais sobe o OVR, uma temporada por decisão.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Normal | 28 / 34 / 22 / 11 / 5 | 27.4 / 34.7 / 22.6 / 10.7 / 4.8 |
| ✓ | Pico médio de OVR menos o potencial, por faixa | entre -2 e +2 em todas | Operário +0.7, Promissor +0.3, Craque +0.1, Estrela +0.2, Fenômeno -0.2 |
| ✓ | Justiça entre posições: diferença do pico relativo entre grupos | no máximo 2 pontos | 1.8 |
| ✓ | Idade do pico de OVR (mediana) | entre 26 e 29 | 27.0 (quartis 25.0 a 28.0) |
| ✓ | Maior subida de OVR numa temporada | no máximo +9 | +8 |
| ✓ | Temporadas com subida de 8 ou mais | no máximo 1% das temporadas | 0.01% |
| ✓ | Subidas de 8 ou mais só na juventude | até os 21 anos | até os 19 |
| ✓ | Crescimento típico de Craque, Estrela e Fenômeno dos 17 aos 19 (mediana por temporada) | entre +3 e +7 | +5.0 |
| ✓ | Declínio típico dos 33 aos 35 (mediana por temporada) | entre -4 e -1,5 | -3.0 |
| ✓ | Temporadas com queda de 7 ou mais, sem lesão | nenhuma | 0.00% (pior -6) |
| ✓ | Aos 16, faixas vizinhas se confundem (sem prodígios) | pelo menos 15% da faixa de cima começa abaixo da mediana da de baixo | Promissor/Operário 33%, Craque/Promissor 29%, Estrela/Craque 42%, Fenômeno/Estrela 31% |
| ✓ | Prodígios entre Estrelas e Fenômenos | 14% e 26% | 16.0% e 23.5% |
| ✓ | Os dois ritmos dão o mesmo jogador (Intensa contra Normal) | pico médio e OVR médio aos 21 a no máximo 0,6 de diferença, em todas as faixas | pico 0.31, aos 21 0.49 |

### OVR mediano por idade

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 49 | 58 | 65 | 68 | 70 | 70 | 71 | 70 | 68 | 63 | 54 | 44 | 39 | `▂▃▃▄▄▄▄▄▅▅▅▅▅▅▅▄▄▄▄▃▃▂▁▁` |
| Promissor | 50 | 60 | 69 | 74 | 76 | 77 | 78 | 77 | 75 | 70 | 62 | 51 | 46 | `▂▃▃▄▄▅▅▅▅▅▅▆▆▆▅▅▅▅▅▄▄▃▂▂` |
| Craque | 51 | 62 | 71 | 79 | 82 | 83 | 84 | 84 | 82 | 76 | 68 | 58 | 52 | `▂▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▆▆▅▅▄▄▃▂` |
| Estrela | 53 | 64 | 74 | 82 | 87 | 89 | 90 | 90 | 88 | 83 | 74 | 64 | 59 | `▃▃▄▄▅▆▆▆▇▇▇▇▇▇▇▇▇▆▆▆▅▄▄▃` |
| Fenômeno | 55 | 66 | 77 | 85 | 91 | 94 | 95 | 95 | 93 | 89 | 80 | 70 | 65 | `▃▃▄▅▅▆▆▇▇▇▇▇███▇▇▇▇▆▆▅▅▄` |

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
| Operário | 1641 | 44 | 70.0 | 70.7 | +0.7 | 0% | n/d |
| Promissor | 2080 | 45 | 77.5 | 77.9 | +0.3 | 26% | 25 |
| Craque | 1355 | 47 | 83.9 | 84.0 | +0.1 | 96% | 23 |
| Estrela | 639 | 48 | 89.6 | 89.8 | +0.2 | 99% | 22 |
| Fenômeno | 285 | 50 | 94.6 | 94.4 | -0.2 | 100% | 21 |

### Posições

| Grupo | Pico - P (média) |
|---|---:|
| Atacante | -0.1 |
| Meia ofensivo | -0.1 |
| Meio-campo | +0.7 |
| Lateral | +0.2 |
| Zagueiro | +1.4 |
| Goleiro | +1.7 |

## Difícil, ritmo Intensa, política equilibrada

Talento mais raro, crescimento 14% mais lento e declínio 25% mais rápido.

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Distribuição de talento, Difícil | 45 / 34 / 15 / 4 / 1 | 44.8 / 35.3 / 15.1 / 3.9 / 0.9 |
| ✓ | No Difícil, o OVR mediano aos 21 anos fica abaixo do Normal na mesma faixa | pelo menos 1 ponto abaixo em todas as faixas | Operário -2, Promissor -3, Craque -2, Estrela -4, Fenômeno -2 |
| ✓ | No Difícil, pico médio de OVR menos o potencial | entre -3 e +2 em todas as faixas | Operário +0.2, Promissor -0.6, Craque -1.4, Estrela -2.0, Fenômeno -0.8 |
| ✓ | No Difícil, maior subida numa temporada | no máximo +9 | +7 |

| Faixa | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 34 | 36 | 38 | 39 | Curva 16 a 39 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Operário | 48 | 57 | 63 | 67 | 69 | 70 | 70 | 70 | 67 | 61 | 51 | 38 | 32 | `▂▂▃▃▄▄▄▄▄▄▅▅▅▅▅▄▄▄▃▃▂▂▁▁` |
| Promissor | 50 | 59 | 66 | 72 | 75 | 76 | 77 | 76 | 74 | 68 | 57 | 45 | 39 | `▂▃▃▄▄▄▅▅▅▅▅▅▅▅▅▅▅▅▄▄▃▂▂▁` |
| Craque | 51 | 60 | 69 | 76 | 80 | 82 | 83 | 83 | 80 | 74 | 63 | 51 | 45 | `▂▃▃▄▄▅▅▆▆▆▆▆▆▆▆▆▆▅▅▄▄▃▂▂` |
| Estrela | 53 | 63 | 71 | 79 | 84 | 86 | 88 | 88 | 85 | 79 | 69 | 56 | 50 | `▃▃▄▄▅▅▆▆▆▆▆▇▇▇▇▇▆▆▆▅▄▄▃▂` |
| Fenômeno | 55 | 66 | 75 | 83 | 89 | 92 | 93 | 94 | 92 | 87 | 78 | 65 | 59 | `▃▃▄▅▅▆▆▆▇▇▇▇▇▇▇▇▇▇▇▆▆▅▄▃` |

## Políticas de clube (pico - P por faixa)

Mesmo lote de sementes, só a escolha de clube muda. Mostra a troca entre minutos e treinador.

| Política | Operário | Promissor | Craque | Estrela | Fenômeno | Jogos aos 18 | Jogos aos 24 | Maior subida |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Equilibrada (clube do nível) | +0.7 | +0.3 | +0.1 | +0.2 | -0.2 | 37 | 37 | +8 |
| Minutos (clube abaixo) | +0.7 | +0.2 | -0.2 | -0.1 | -0.5 | 41 | 41 | +8 |
| Ambiciosa (clube acima) | -0.5 | -1.7 | -2.8 | -3.0 | -4.3 | 17 | 18 | +7 |
| Sorteada | +0.5 | +0.0 | -0.4 | -0.3 | -0.9 | 33 | 34 | +8 |
