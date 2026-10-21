# Progressão no laço real: D78

Motor 2.0.0-m19. Brasil, início em 2026, dificuldade Normal. Políticas equilibrada, ambiciosa e fiel em rodízio, posições em rodízio. Sem ajustes de teste no jogador. Pico é o maior OVR ao fechar uma temporada.

## Antes e depois nas mesmas sementes

40 carreiras por faixa e ritmo, 400 antes no m18 e as mesmas 400 no m19. Prefixo `d78-progression-`, índice candidato começando em zero. Aceita o candidato quando o talento de nascimento corresponde à faixa; posição `POSITIONS[candidato % 12]`; política pelo índice aceito módulo três. Ritmo anual = Intensa; rápido = Normal.

| Faixa | Ritmo | 90+ antes | 90+ depois | 95+ antes | 95+ depois | 99 antes | 99 depois |
|---|---|---:|---:|---:|---:|---:|---:|
| Operário | Anual | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| Operário | Rápido | 2.5% | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| Promissor | Anual | 7.5% | 0.0% | 7.5% | 0.0% | 2.5% | 0.0% |
| Promissor | Rápido | 20.0% | 0.0% | 5.0% | 0.0% | 0.0% | 0.0% |
| Craque | Anual | 25.0% | 0.0% | 15.0% | 0.0% | 5.0% | 0.0% |
| Craque | Rápido | 27.5% | 0.0% | 20.0% | 0.0% | 10.0% | 0.0% |
| Estrela | Anual | 82.5% | 65.0% | 80.0% | 5.0% | 45.0% | 0.0% |
| Estrela | Rápido | 85.0% | 55.0% | 70.0% | 2.5% | 32.5% | 0.0% |
| Fenômeno | Anual | 92.5% | 90.0% | 82.5% | 62.5% | 52.5% | 5.0% |
| Fenômeno | Rápido | 92.5% | 85.0% | 80.0% | 70.0% | 30.0% | 7.5% |

## Amostra ampliada do m19

120 carreiras por faixa e ritmo, 1.200 no total, mesmo procedimento. Não é amostra aleatória de toda a população: cada faixa tem o mesmo tamanho, e todas as origens são brasileiras.

| Faixa | Ritmo | Pico médio | 90+ | 95+ | 99 | Maior pico |
|---|---|---:|---:|---:|---:|---:|
| Operário | Anual | 70.21 | 0.0% | 0.0% | 0.0% | 84 |
| Operário | Rápido | 69.78 | 0.0% | 0.0% | 0.0% | 85 |
| Promissor | Anual | 76.84 | 0.0% | 0.0% | 0.0% | 82 |
| Promissor | Rápido | 76.62 | 0.0% | 0.0% | 0.0% | 82 |
| Craque | Anual | 82.92 | 0.0% | 0.0% | 0.0% | 88 |
| Craque | Rápido | 82.65 | 0.0% | 0.0% | 0.0% | 89 |
| Estrela | Anual | 88.59 | 55.8% | 2.5% | 0.0% | 96 |
| Estrela | Rápido | 88.20 | 52.5% | 0.8% | 0.0% | 95 |
| Fenômeno | Anual | 94.31 | 87.5% | 63.3% | 8.3% | 99 |
| Fenômeno | Rápido | 94.00 | 85.8% | 65.8% | 9.2% | 99 |

## Leitura e limites

A correção remove degraus inteiros de OVR comprados todo ano por títulos/prêmios. O potencial continua diferenciando talentos: a faixa Fenômeno tem potencial natural 92–97, portanto 90+ segue plausível para grande parte dela. Estrelas deixam de atingir 99 nesta amostra e 95+ fica incomum. Nenhum Craque chegou a 90 neste lote; isso não é um bloqueio absoluto, pois eventos e descoberta tardia continuam existindo. A mesma semente continua determinística, sem consultar estes resultados durante o jogo.

As taxas de eventos raros têm incerteza amostral: zero observado não significa impossível. O lote de recordes separado continua usando 3.150 carreiras e registrando também ausências; nenhum resultado foi imposto para preencher uma linha. A auditoria não prova equivalência estratégica dos estilos ou dos seis caminhos de veterano. O balanceamento completo continua medindo 51 metas, além desta distribuição.
