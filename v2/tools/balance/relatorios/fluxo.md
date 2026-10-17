# Relatório do fluxo da carreira

Motor 2.0.0-m15, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 36% / 47% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 52% / 53% |
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
| Teimosa, Intensa | 100 | 38 | 7.0 | 22.8 | 0.44 | 5.6 | 2.0% |
| Teimosa, Normal | 100 | 38 | 3.8 | 11.6 | 0.30 | 3.6 | 0.0% |
| Equilibrada, Intensa | 100 | 35 | 6.4 | 20.3 | 0.49 | 5.6 | 2.0% |
| Equilibrada, Normal | 100 | 36 | 3.9 | 11.2 | 0.26 | 3.2 | 2.0% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 36% | 64% | 0% | 0% | 0% |
| Teimosa, Normal | 47% | 53% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 7% | 0% | 5% | 88% |
| Equilibrada, Normal | 0% | 42% | 0% | 13% | 45% |

## Decisões por carreira, por tipo

| Lote | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 1.00 | 10.55 | 6.95 | 2.41 | 0.53 | 0.44 | 0.29 | 0.64 |
| Teimosa, Normal | 1.00 | 4.00 | 3.83 | 1.37 | 0.32 | 0.30 | 0.27 | 0.53 |
| Equilibrada, Intensa | 1.00 | 9.35 | 6.41 | 2.34 | 0.55 | 0.49 | 0.05 | 0.07 |
| Equilibrada, Normal | 1.00 | 3.67 | 3.87 | 1.44 | 0.31 | 0.26 | 0.22 | 0.42 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 33 | 1 | █ |
| 34 | 5 | ████ |
| 35 | 4 | ███ |
| 36 | 6 | █████ |
| 37 | 18 | ███████████████ |
| 38 | 18 | ███████████████ |
| 39 | 12 | ██████████ |
| 40 | 36 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 34 | 7 | ████ |
| 36 | 24 | ███████████████ |
| 38 | 22 | ██████████████ |
| 40 | 47 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: personalCoach, dressingRoomRift, loadManagement, rowCoach, rivalSigned, bootDeal, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | reserve | 3 | 0 | 59 | 53 | reinforcement | personalCoach/hire ✗ |
| 2029 | 19 | Titanes | starter | 28 | 0 | 65 | 62 | reinforcement |  |
| 2030 | 20 | Titanes | starter | 28 | 0 | 72 | 69 | reinforcement | dressingRoomRift/neutral |
| 2031 | 21 | Independiente | starter | 36 | 0 | 77 | 61 | projectPiece |  |
| 2032 | 22 | Hamburger | starter | 30 | 0 | 81 | 60 | projectPiece |  |
| 2033 | 23 | Sevilla | starter | 49 | 0 | 84 | 62 | projectPiece |  |
| 2034 | 24 | Sevilla | starter | 26 | 0 | 86 | 62 | projectPiece | loadManagement/rest |
| 2035 | 25 | Sevilla | starter | 37 | 0 | 91 | 72 | projectPiece |  |
| 2036 | 26 | Bayern München | starter | 50 | 0 | 94 | 83 | marqueeSigning |  |
| 2037 | 27 | Bayern München | starter | 51 | 0 | 97 | 93 | marqueeSigning | rowCoach/apologize |
| 2038 | 28 | Bayern München | starter | 49 | 0 | 98 | 99 | marqueeSigning |  |
| 2039 | 29 | Bayern München | starter | 52 | 0 | 98 | 100 | marqueeSigning |  |
| 2040 | 30 | Bayern München | reserve | 7 | 0 | 98 | 100 | marqueeSigning | rivalSigned/fight ✗ |
| 2041 | 31 | PSG | starter | 56 | 0 | 98 | 90 | marqueeSigning |  |
| 2042 | 32 | PSG | starter | 52 | 0 | 98 | 96 | marqueeSigning | bootDeal/discreet |
| 2043 | 33 | PSG | starter | 51 | 0 | 98 | 100 | marqueeSigning |  |
| 2044 | 34 | PSG | starter | 49 | 0 | 98 | 100 | marqueeSigning | muscleInjury/rushBack ✓ |
