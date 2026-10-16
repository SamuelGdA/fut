# Relatório do fluxo da carreira

Motor 2.0.0-m14, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 36% / 46% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 53% / 54% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.4 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 3.9 |
| ✓ | Decisões por carreira no ritmo Normal (3 a 5 minutos de interação) | 9 a 15 | 11.2 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.4% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Decisões | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 100 | 38 | 6.9 | 22.8 | 0.43 | 5.6 | 4.0% |
| Teimosa, Normal | 100 | 38 | 3.9 | 11.6 | 0.30 | 3.6 | 0.0% |
| Equilibrada, Intensa | 100 | 35 | 6.4 | 20.3 | 0.51 | 5.6 | 2.0% |
| Equilibrada, Normal | 100 | 36 | 3.9 | 11.2 | 0.27 | 3.2 | 2.0% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 36% | 64% | 0% | 0% | 0% |
| Teimosa, Normal | 46% | 54% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 7% | 0% | 4% | 89% |
| Equilibrada, Normal | 0% | 42% | 0% | 13% | 45% |

## Decisões por carreira, por tipo

| Lote | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 1.00 | 10.53 | 6.93 | 2.42 | 0.51 | 0.43 | 0.34 | 0.64 |
| Teimosa, Normal | 1.00 | 3.99 | 3.85 | 1.37 | 0.32 | 0.30 | 0.24 | 0.54 |
| Equilibrada, Intensa | 1.00 | 9.34 | 6.40 | 2.33 | 0.57 | 0.51 | 0.04 | 0.07 |
| Equilibrada, Normal | 1.00 | 3.67 | 3.86 | 1.43 | 0.31 | 0.27 | 0.22 | 0.42 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 33 | 1 | █ |
| 34 | 4 | ███ |
| 35 | 5 | ████ |
| 36 | 7 | ██████ |
| 37 | 17 | ██████████████ |
| 38 | 19 | ████████████████ |
| 39 | 11 | █████████ |
| 40 | 36 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 34 | 7 | █████ |
| 36 | 25 | ████████████████ |
| 38 | 22 | ██████████████ |
| 40 | 46 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: loadManagement, dressingRoomRift, personalCoach, rowBoard, rivalSigned, bootDeal, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | starter | 24 | 0 | 63 | 63 | reinforcement | loadManagement/playAll |
| 2029 | 19 | Titanes | starter | 28 | 0 | 69 | 71 | reinforcement |  |
| 2030 | 20 | Titanes | starter | 28 | 0 | 75 | 76 | reinforcement | dressingRoomRift/neutral |
| 2031 | 21 | Hannover 96 | starter | 33 | 0 | 79 | 62 | rebuild |  |
| 2032 | 22 | Valencia | starter | 34 | 0 | 83 | 59 | projectPiece |  |
| 2033 | 23 | RB Leipzig | starter | 49 | 0 | 86 | 64 | projectPiece |  |
| 2034 | 24 | RB Leipzig | starter | 37 | 0 | 90 | 70 | projectPiece | personalCoach/hire ✓ |
| 2035 | 25 | Real Madrid | starter | 45 | 0 | 92 | 68 | marqueeSigning |  |
| 2036 | 26 | Real Madrid | starter | 54 | 0 | 95 | 95 | marqueeSigning |  |
| 2037 | 27 | Real Madrid | starter | 52 | 0 | 98 | 100 | marqueeSigning | rowBoard/apologize |
| 2038 | 28 | Real Madrid | starter | 52 | 0 | 98 | 100 | marqueeSigning |  |
| 2039 | 29 | Real Madrid | starter | 58 | 0 | 98 | 100 | marqueeSigning |  |
| 2040 | 30 | Real Madrid | reserve | 8 | 0 | 98 | 100 | marqueeSigning | rivalSigned/fight ✗ |
| 2041 | 31 | Liverpool | starter | 59 | 0 | 98 | 87 | marqueeSigning |  |
| 2042 | 32 | Liverpool | starter | 63 | 0 | 98 | 97 | marqueeSigning | bootDeal/discreet |
| 2043 | 33 | Liverpool | starter | 58 | 0 | 98 | 100 | marqueeSigning |  |
| 2044 | 34 | Liverpool | starter | 53 | 0 | 98 | 100 | marqueeSigning | muscleInjury/rushBack ✓ |
