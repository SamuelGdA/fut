# Relatório do fluxo da carreira

Motor 2.0.0-m13, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 34% / 44% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 53% / 56% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.4 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 3.9 |
| ✓ | Decisões por carreira no ritmo Normal (3 a 5 minutos de interação) | 9 a 15 | 11.3 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.5% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Decisões | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 7.0 | 22.8 | 0.42 | 5.5 | 2.7% |
| Teimosa, Normal | 300 | 38 | 3.9 | 11.7 | 0.28 | 3.6 | 0.0% |
| Equilibrada, Intensa | 300 | 35 | 6.4 | 20.2 | 0.44 | 5.4 | 2.7% |
| Equilibrada, Normal | 300 | 36 | 3.9 | 11.3 | 0.29 | 3.3 | 1.0% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 34% | 66% | 0% | 0% | 0% |
| Teimosa, Normal | 44% | 56% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 11% | 0% | 5% | 84% |
| Equilibrada, Normal | 0% | 38% | 0% | 12% | 50% |

## Decisões por carreira, por tipo

| Lote | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 1.00 | 10.52 | 6.99 | 2.39 | 0.50 | 0.42 | 0.29 | 0.66 |
| Teimosa, Normal | 1.00 | 4.00 | 3.91 | 1.38 | 0.31 | 0.28 | 0.23 | 0.56 |
| Equilibrada, Intensa | 1.00 | 9.33 | 6.42 | 2.32 | 0.54 | 0.44 | 0.07 | 0.11 |
| Equilibrada, Normal | 1.00 | 3.73 | 3.87 | 1.48 | 0.32 | 0.29 | 0.20 | 0.38 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 33 | 2 | █ |
| 34 | 12 | ████ |
| 35 | 17 | █████ |
| 36 | 27 | ████████ |
| 37 | 46 | ██████████████ |
| 38 | 55 | ████████████████ |
| 39 | 39 | ███████████ |
| 40 | 102 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 34 | 14 | ███ |
| 36 | 65 | ███████████████ |
| 38 | 89 | ████████████████████ |
| 40 | 131 | ██████████████████████████████ |

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
