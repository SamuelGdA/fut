# Relatório do fluxo da carreira

Motor 2.0.0-m25, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 28% / 44% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 55% / 55% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.7 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 4.0 |
| ✓ | Decisões no ritmo Normal: planejamento e total com momentos (D73) | planejamento 9 a 15; total até 65 | 13.1 / 29.1 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.5% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Planejamento | Decisões totais | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 7.3 | 21.1 | 47.2 | 0.25 | 5.0 | 2.0% |
| Teimosa, Normal | 300 | 38 | 4.1 | 14.1 | 31.1 | 0.10 | 4.7 | 1.3% |
| Equilibrada, Intensa | 300 | 35 | 6.7 | 18.8 | 43.1 | 0.25 | 4.8 | 1.7% |
| Equilibrada, Normal | 300 | 36 | 4.0 | 13.1 | 29.1 | 0.09 | 4.4 | 1.7% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 28% | 72% | 0% | 0% | 0% |
| Teimosa, Normal | 44% | 56% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 11% | 0% | 7% | 82% |
| Equilibrada, Normal | 0% | 16% | 0% | 8% | 76% |

## Decisões por carreira, por tipo

| Lote | Jogo-chave | Promessa | Veterano | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 24.45 | 1.29 | 0.39 | 1.00 | 9.09 | 7.26 | 2.16 | 0.32 | 0.25 | 0.31 | 0.72 |
| Teimosa, Normal | 15.94 | 0.84 | 0.17 | 1.00 | 6.97 | 4.08 | 1.04 | 0.13 | 0.10 | 0.25 | 0.56 |
| Equilibrada, Intensa | 22.71 | 1.33 | 0.24 | 1.00 | 8.32 | 6.69 | 2.08 | 0.31 | 0.25 | 0.09 | 0.11 |
| Equilibrada, Normal | 15.03 | 0.81 | 0.09 | 1.00 | 6.64 | 3.95 | 1.06 | 0.13 | 0.09 | 0.11 | 0.16 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 33 | 1 | █ |
| 34 | 8 | ███ |
| 35 | 11 | ████ |
| 36 | 35 | █████████████ |
| 37 | 52 | ███████████████████ |
| 38 | 59 | █████████████████████ |
| 39 | 49 | ██████████████████ |
| 40 | 84 | ██████████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 34 | 10 | ██ |
| 36 | 58 | █████████████ |
| 38 | 98 | ██████████████████████ |
| 40 | 133 | ██████████████████████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: personalCoach, homesick, loadManagement, rowCoach, extraTraining, academyJewel, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | Titanes | starter | 27 | 0 | 57 | 57 | reinforcement |  |
| 2028 | 18 | Titanes | reserve | 3 | 0 | 59 | 53 | reinforcement | personalCoach/hire ✗ |
| 2029 | 19 | Titanes | starter | 28 | 0 | 65 | 62 | reinforcement |  |
| 2030 | 20 | Bucaramanga | starter | 44 | 0 | 71 | 46 | heir |  |
| 2031 | 21 | Bucaramanga | starter | 46 | 0 | 76 | 32 | heir | homesick/stay |
| 2032 | 22 | Bucaramanga | starter | 35 | 0 | 82 | 50 | heir |  |
| 2033 | 23 | Lazio | starter | 55 | 0 | 85 | 62 | projectPiece |  |
| 2034 | 24 | Lazio | starter | 32 | 0 | 87 | 74 | projectPiece | loadManagement/rest |
| 2035 | 25 | Atlético Madrid | starter | 44 | 0 | 89 | 72 | marqueeSigning |  |
| 2036 | 26 | Real Madrid | starter | 54 | 0 | 90 | 97 | marqueeSigning |  |
| 2037 | 27 | Real Madrid | starter | 50 | 0 | 90 | 100 | marqueeSigning | rowCoach/apologize |
| 2038 | 28 | Real Madrid | starter | 50 | 0 | 91 | 100 | marqueeSigning |  |
| 2039 | 29 | Real Madrid | starter | 57 | 0 | 91 | 90 | marqueeSigning |  |
| 2040 | 30 | Real Madrid | starter | 47 | 0 | 92 | 99 | marqueeSigning | extraTraining/push ✓ |
| 2041 | 31 | Real Madrid | starter | 57 | 0 | 92 | 100 | marqueeSigning |  |
| 2042 | 32 | Real Madrid | starter | 56 | 0 | 91 | 100 | marqueeSigning | academyJewel/compete ✓ |
| 2043 | 33 | Real Madrid | starter | 56 | 0 | 91 | 100 | marqueeSigning |  |
| 2044 | 34 | Real Madrid | starter | 52 | 0 | 91 | 100 | marqueeSigning | muscleInjury/rushBack ✓ |
