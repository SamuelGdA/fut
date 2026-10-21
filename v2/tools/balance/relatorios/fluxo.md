# Relatório do fluxo da carreira

Motor 2.0.0-m23, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 27% / 40% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 60% / 60% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.7 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 4.0 |
| ✓ | Decisões no ritmo Normal: planejamento e total com momentos (D73) | planejamento 9 a 15; total até 65 | 14.0 / 30.5 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.6% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Planejamento | Decisões totais | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 7.2 | 22.6 | 47.7 | 0.25 | 5.3 | 1.3% |
| Teimosa, Normal | 300 | 38 | 4.1 | 15.1 | 32.5 | 0.10 | 4.7 | 0.7% |
| Equilibrada, Intensa | 300 | 35 | 6.7 | 20.2 | 43.1 | 0.24 | 5.1 | 3.3% |
| Equilibrada, Normal | 300 | 36 | 4.0 | 14.0 | 30.5 | 0.09 | 4.5 | 0.7% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 27% | 73% | 0% | 0% | 0% |
| Teimosa, Normal | 40% | 60% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 12% | 0% | 6% | 81% |
| Equilibrada, Normal | 0% | 20% | 0% | 8% | 72% |

## Decisões por carreira, por tipo

| Lote | Jogo-chave | Promessa | Veterano | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 23.21 | 1.43 | 0.44 | 1.00 | 10.47 | 7.21 | 2.32 | 0.33 | 0.25 | 0.28 | 0.73 |
| Teimosa, Normal | 15.78 | 1.24 | 0.41 | 1.00 | 7.72 | 4.10 | 1.18 | 0.13 | 0.10 | 0.25 | 0.60 |
| Equilibrada, Intensa | 21.32 | 1.39 | 0.23 | 1.00 | 9.51 | 6.67 | 2.26 | 0.31 | 0.24 | 0.08 | 0.12 |
| Equilibrada, Normal | 15.07 | 1.18 | 0.30 | 1.00 | 7.16 | 4.04 | 1.25 | 0.13 | 0.09 | 0.10 | 0.20 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 33 | 2 | █ |
| 34 | 10 | ████ |
| 35 | 17 | ██████ |
| 36 | 32 | ████████████ |
| 37 | 67 | █████████████████████████ |
| 38 | 52 | ███████████████████ |
| 39 | 38 | ██████████████ |
| 40 | 81 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 34 | 15 | ████ |
| 36 | 62 | ████████████████ |
| 38 | 103 | ██████████████████████████ |
| 40 | 119 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: personalCoach, homesick, extraTraining, rowCoach, loadManagement, academyJewel, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | reserve | 3 | 0 | 59 | 53 | reinforcement | personalCoach/hire ✗ |
| 2029 | 19 | Titanes | starter | 28 | 0 | 65 | 62 | reinforcement |  |
| 2030 | 20 | Defensor Sporting | starter | 43 | 0 | 72 | 63 | projectPiece |  |
| 2031 | 21 | Defensor Sporting | starter | 53 | 0 | 78 | 82 | projectPiece | homesick/stay |
| 2032 | 22 | Brentford | starter | 35 | 0 | 82 | 58 | rescue |  |
| 2033 | 23 | Brentford | starter | 41 | 0 | 85 | 67 | rescue |  |
| 2034 | 24 | Brentford | starter | 28 | 0 | 88 | 81 | rescue | extraTraining/push ✗ |
| 2035 | 25 | Atlético Madrid | starter | 45 | 0 | 89 | 77 | marqueeSigning |  |
| 2036 | 26 | Bayern München | starter | 50 | 0 | 90 | 68 | marqueeSigning |  |
| 2037 | 27 | Bayern München | starter | 50 | 0 | 90 | 74 | marqueeSigning | rowCoach/apologize |
| 2038 | 28 | Bayern München | starter | 47 | 0 | 91 | 88 | marqueeSigning |  |
| 2039 | 29 | Bayern München | starter | 52 | 0 | 91 | 96 | marqueeSigning |  |
| 2040 | 30 | Bayern München | starter | 43 | 0 | 91 | 99 | marqueeSigning | loadManagement/rest |
| 2041 | 31 | Bayern München | starter | 50 | 0 | 91 | 100 | marqueeSigning |  |
| 2042 | 32 | Bayern München | starter | 37 | 0 | 90 | 100 | marqueeSigning | academyJewel/compete ✗ |
| 2043 | 33 | Bayern München | starter | 51 | 0 | 90 | 100 | marqueeSigning |  |
| 2044 | 34 | Bayern München | starter | 42 | 0 | 90 | 100 | marqueeSigning | muscleInjury/fullRecovery |
