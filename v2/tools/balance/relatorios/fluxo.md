# Relatório do fluxo da carreira

Motor 2.0.0-m8.4, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 27% / 37% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 60% / 62% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.4 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 3.8 |
| ✓ | Decisões por carreira no ritmo Normal (3 a 5 minutos de interação) | 9 a 15 | 11.2 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.5% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Decisões | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 6.9 | 22.5 | 0.43 | 5.5 | 3.3% |
| Teimosa, Normal | 300 | 38 | 3.9 | 11.6 | 0.29 | 3.5 | 1.0% |
| Equilibrada, Intensa | 300 | 35 | 6.4 | 20.2 | 0.44 | 5.3 | 2.3% |
| Equilibrada, Normal | 300 | 36 | 3.8 | 11.2 | 0.30 | 3.3 | 0.7% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 27% | 73% | 0% | 0% | 0% |
| Teimosa, Normal | 37% | 63% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 14% | 0% | 7% | 79% |
| Equilibrada, Normal | 0% | 44% | 0% | 12% | 43% |

## Decisões por carreira, por tipo

| Lote | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 1.00 | 10.16 | 6.88 | 2.39 | 0.52 | 0.43 | 0.40 | 0.73 |
| Teimosa, Normal | 1.00 | 3.84 | 3.87 | 1.38 | 0.32 | 0.29 | 0.30 | 0.63 |
| Equilibrada, Intensa | 1.00 | 9.27 | 6.40 | 2.32 | 0.53 | 0.44 | 0.09 | 0.14 |
| Equilibrada, Normal | 1.00 | 3.65 | 3.82 | 1.48 | 0.33 | 0.30 | 0.21 | 0.44 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 33 | 4 | ██ |
| 34 | 13 | █████ |
| 35 | 17 | ██████ |
| 36 | 39 | ███████████████ |
| 37 | 60 | ███████████████████████ |
| 38 | 48 | ██████████████████ |
| 39 | 38 | ██████████████ |
| 40 | 80 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 2 | █ |
| 34 | 17 | █████ |
| 36 | 72 | ███████████████████ |
| 38 | 98 | ██████████████████████████ |
| 40 | 111 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: loadManagement, dressingRoomRift, personalCoach, rowCoach, rivalSigned, bootDeal, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | starter | 24 | 0 | 63 | 63 | reinforcement | loadManagement/playAll |
| 2029 | 19 | Titanes | starter | 28 | 0 | 69 | 71 | reinforcement |  |
| 2030 | 20 | Titanes | starter | 28 | 0 | 74 | 76 | reinforcement | dressingRoomRift/neutral |
| 2031 | 21 | Grêmio | starter | 45 | 0 | 79 | 60 | projectPiece |  |
| 2032 | 22 | Grêmio | starter | 44 | 0 | 84 | 72 | projectPiece |  |
| 2033 | 23 | Newcastle | starter | 41 | 0 | 86 | 62 | projectPiece |  |
| 2034 | 24 | Newcastle | starter | 35 | 0 | 88 | 70 | projectPiece | personalCoach/hire ✓ |
| 2035 | 25 | Liverpool | starter | 37 | 0 | 90 | 74 | marqueeSigning |  |
| 2036 | 26 | Bayern München | starter | 53 | 0 | 91 | 95 | marqueeSigning |  |
| 2037 | 27 | Bayern München | starter | 53 | 0 | 92 | 100 | marqueeSigning | rowCoach/apologize |
| 2038 | 28 | Bayern München | starter | 50 | 0 | 93 | 100 | marqueeSigning |  |
| 2039 | 29 | Bayern München | starter | 50 | 0 | 94 | 100 | marqueeSigning |  |
| 2040 | 30 | Bayern München | reserve | 7 | 0 | 95 | 100 | marqueeSigning | rivalSigned/fight ✗ |
| 2041 | 31 | Real Madrid | starter | 57 | 0 | 96 | 83 | marqueeSigning |  |
| 2042 | 32 | Real Madrid | starter | 58 | 0 | 96 | 90 | marqueeSigning | bootDeal/discreet |
| 2043 | 33 | Real Madrid | starter | 55 | 0 | 96 | 94 | marqueeSigning |  |
| 2044 | 34 | Real Madrid | starter | 50 | 0 | 96 | 99 | marqueeSigning | muscleInjury/rushBack ✓ |
