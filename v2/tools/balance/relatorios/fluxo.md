# Relatório do fluxo da carreira

Motor 2.0.0-m8.2, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 24% / 34% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 62% / 65% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.4 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 3.8 |
| ✓ | Decisões por carreira no ritmo Normal (3 a 5 minutos de interação) | 9 a 15 | 11.2 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.1% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Decisões | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 6.9 | 22.4 | 0.43 | 5.5 | 4.0% |
| Teimosa, Normal | 300 | 38 | 3.9 | 11.6 | 0.30 | 3.5 | 0.3% |
| Equilibrada, Intensa | 300 | 35 | 6.4 | 20.1 | 0.43 | 5.2 | 2.3% |
| Equilibrada, Normal | 300 | 36 | 3.8 | 11.2 | 0.29 | 3.3 | 0.7% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 24% | 76% | 0% | 0% | 0% |
| Teimosa, Normal | 34% | 66% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 15% | 0% | 7% | 77% |
| Equilibrada, Normal | 0% | 46% | 0% | 15% | 39% |

## Decisões por carreira, por tipo

| Lote | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 1.00 | 10.08 | 6.88 | 2.39 | 0.52 | 0.43 | 0.38 | 0.76 |
| Teimosa, Normal | 1.00 | 3.77 | 3.86 | 1.39 | 0.33 | 0.30 | 0.30 | 0.66 |
| Equilibrada, Intensa | 1.00 | 9.22 | 6.39 | 2.32 | 0.52 | 0.43 | 0.11 | 0.15 |
| Equilibrada, Normal | 1.00 | 3.58 | 3.81 | 1.48 | 0.32 | 0.29 | 0.24 | 0.46 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 33 | 4 | ██ |
| 34 | 12 | █████ |
| 35 | 18 | ███████ |
| 36 | 46 | ███████████████████ |
| 37 | 65 | ███████████████████████████ |
| 38 | 40 | ████████████████ |
| 39 | 41 | █████████████████ |
| 40 | 73 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 2 | █ |
| 34 | 19 | ██████ |
| 36 | 77 | ██████████████████████ |
| 38 | 99 | █████████████████████████████ |
| 40 | 103 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: loadManagement, dressingRoomRift, personalCoach, rowBoard, rivalSigned, bootDeal, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | starter | 24 | 0 | 63 | 63 | reinforcement | loadManagement/playAll |
| 2029 | 19 | Titanes | starter | 28 | 0 | 69 | 71 | reinforcement |  |
| 2030 | 20 | Titanes | starter | 28 | 0 | 74 | 76 | reinforcement | dressingRoomRift/neutral |
| 2031 | 21 | Grêmio | starter | 45 | 0 | 79 | 60 | projectPiece |  |
| 2032 | 22 | Grêmio | starter | 44 | 0 | 83 | 72 | projectPiece |  |
| 2033 | 23 | Lyon | starter | 37 | 0 | 86 | 66 | marqueeSigning |  |
| 2034 | 24 | Lyon | starter | 30 | 0 | 88 | 70 | marqueeSigning | personalCoach/hire ✓ |
| 2035 | 25 | PSG | starter | 41 | 0 | 89 | 70 | marqueeSigning |  |
| 2036 | 26 | PSG | starter | 51 | 0 | 90 | 85 | marqueeSigning |  |
| 2037 | 27 | PSG | starter | 48 | 0 | 91 | 89 | marqueeSigning | rowBoard/apologize |
| 2038 | 28 | PSG | starter | 48 | 0 | 91 | 93 | marqueeSigning |  |
| 2039 | 29 | PSG | starter | 48 | 0 | 91 | 98 | marqueeSigning |  |
| 2040 | 30 | PSG | reserve | 7 | 0 | 91 | 100 | marqueeSigning | rivalSigned/fight ✗ |
| 2041 | 31 | Bayern München | starter | 54 | 0 | 91 | 75 | marqueeSigning |  |
| 2042 | 32 | Bayern München | starter | 51 | 0 | 91 | 82 | marqueeSigning | bootDeal/discreet |
| 2043 | 33 | Bayern München | starter | 50 | 0 | 90 | 88 | marqueeSigning |  |
| 2044 | 34 | Bayern München | starter | 48 | 0 | 90 | 96 | marqueeSigning | muscleInjury/rushBack ✓ |
