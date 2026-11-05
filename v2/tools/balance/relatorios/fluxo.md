# Relatório do fluxo da carreira

Motor 2.0.0-m43, semente `balanco-m2`. **9 de 9 metas atendidas.**

Gerado por `pnpm balance`. Carreiras jogadas pelo laço de verdade (M4): base, janelas, eventos, focos, empréstimos,
dispensas e o mercado decidindo quem ainda tem clube. Posições e países se alternam; uma em cada quatro é Difícil.

- **Teimosa**: a política equilibrada que nunca aceita aposentar enquanto houver clube. Mede o mercado: quem encerra a
  carreira é a falta de ofertas, não a vontade do jogador.
- **Equilibrada**: a política do motor, que aposenta perto dos 35. Mede o ritmo: eventos e decisões por carreira.

## Metas

| | Meta | Alvo | Medido |
|---|---|---|---|
| ✓ | Carreiras que o mercado leva até os 40 (minoria), Intensa / Normal | menos de 50% | 11% / 28% |
| ✓ | Carreiras que terminam entre 33 e 38 (maioria), Intensa / Normal | 50% ou mais | 52% / 54% |
| ✓ | Carreiras que o mercado encerra antes dos 30 | no máximo 5% | 0.0% / 0.0% |
| ✓ | Eventos por carreira, ritmo Intensa (agenda de 7 a 8) | 6 a 8 | 6.7 |
| ✓ | Eventos por carreira, ritmo Normal (agenda de 4 a 5) | 3,5 a 5 | 4.0 |
| ✓ | Decisões no ritmo Normal: planejamento e total com momentos (D73) | planejamento 9 a 15; total até 65 | 13.7 / 30.8 |
| ✓ | Janelas com menos de duas ofertas de clube | no máximo 2% | 0.4% |
| ✓ | Primeira decisão com três bases | 100% | 100.0% |
| ✓ | Save refaz a carreira inteira (invariante 5, 60 carreiras) | 100% | 100.0% |

## Os lotes

| Lote | Carreiras | Fim (mediana) | Eventos | Planejamento | Decisões totais | Empréstimos | Clubes | Traidor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 300 | 38 | 7.3 | 21.5 | 49.4 | 0.27 | 5.6 | 4.0% |
| Teimosa, Normal | 300 | 38 | 4.1 | 14.7 | 32.6 | 0.14 | 5.1 | 1.0% |
| Equilibrada, Intensa | 300 | 35 | 6.7 | 18.8 | 44.4 | 0.23 | 4.9 | 2.0% |
| Equilibrada, Normal | 300 | 36 | 4.0 | 13.7 | 30.8 | 0.11 | 4.6 | 1.0% |

## Como as carreiras terminam

| Lote | Idade (40) | Sem mercado | Sem ofertas | Parou depois da dispensa | Escolheu parar |
|---|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 20% | 80% | 0% | 0% | 0% |
| Teimosa, Normal | 18% | 82% | 0% | 0% | 0% |
| Equilibrada, Intensa | 0% | 6% | 0% | 13% | 80% |
| Equilibrada, Normal | 0% | 33% | 0% | 28% | 39% |

## Decisões por carreira, por tipo

| Lote | Jogo-chave | Promessa | Veterano | Base | Janela | Evento | Foco de treino | Empréstimo | Volta de empréstimo | Dispensa | Aposentadoria forçada |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Teimosa, Intensa | 26.07 | 1.33 | 0.42 | 1.00 | 9.08 | 7.25 | 2.12 | 0.35 | 0.27 | 0.67 | 0.80 |
| Teimosa, Normal | 16.87 | 0.85 | 0.16 | 1.00 | 6.91 | 4.12 | 1.04 | 0.20 | 0.14 | 0.47 | 0.82 |
| Equilibrada, Intensa | 24.00 | 1.35 | 0.23 | 1.00 | 8.26 | 6.71 | 2.08 | 0.32 | 0.23 | 0.17 | 0.06 |
| Equilibrada, Normal | 16.00 | 0.86 | 0.15 | 1.00 | 6.75 | 4.01 | 1.07 | 0.18 | 0.11 | 0.30 | 0.33 |

## Idade do fim, política teimosa, ritmo Intensa

| Idade | Carreiras | |
|---:|---:|---|
| 33 | 1 | █ |
| 34 | 3 | █ |
| 35 | 10 | ████ |
| 36 | 28 | ████████████ |
| 37 | 44 | ███████████████████ |
| 38 | 69 | ██████████████████████████████ |
| 39 | 54 | ███████████████████████ |
| 40 | 32 | ██████████████ |
| 41 | 59 | ██████████████████████████ |

## Idade do fim, política teimosa, ritmo Normal

No ritmo Normal as decisões caem nas idades pares, então o fim também.

| Idade | Carreiras | |
|---:|---:|---|
| 32 | 1 | █ |
| 34 | 5 | █ |
| 36 | 40 | ██████████ |
| 38 | 116 | ██████████████████████████████ |
| 40 | 84 | ██████████████████████ |
| 41 | 54 | ██████████████ |

## Uma carreira do lote equilibrado, ritmo Intensa

Semente `balanco-m2:fluxo:balanced:intense:0`, gk, BRA. Fim aos 35 (Escolheu parar). Eventos: personalCoach, dressingRoomRift, loadManagement, rowBoard, supplement, academyJewel, muscleInjury.

| Ano | Idade | Clube | Papel | Jogos | Gols | OVR | Torcida | Missão | Evento |
|---:|---:|---|---|---:|---:|---:|---:|---|---|
| 2026 | 16 | Atlético-MG | third | 1 | 0 | 52 | 50 | academyBet |  |
| 2027 | 17 | PSIM | starter | 31 | 0 | 58 | 61 | rescue |  |
| 2028 | 18 | PSIM | reserve | 4 | 0 | 59 | 41 | rescue | personalCoach/hire ✗ |
| 2029 | 19 | PSIM | starter | 21 | 0 | 66 | 48 | rescue |  |
| 2030 | 20 | Catanzaro | starter | 36 | 0 | 72 | 65 | rescue |  |
| 2031 | 21 | Catanzaro | starter | 37 | 0 | 78 | 73 | rescue | dressingRoomRift/neutral |
| 2032 | 22 | Catanzaro | starter | 33 | 0 | 82 | 54 | rescue |  |
| 2033 | 23 | Al-Ittihad | starter | 50 | 0 | 87 | 75 | marqueeSigning |  |
| 2034 | 24 | Al-Ittihad | starter | 35 | 0 | 88 | 97 | marqueeSigning | loadManagement/rest |
| 2035 | 25 | PSG | starter | 41 | 0 | 90 | 67 | marqueeSigning |  |
| 2036 | 26 | PSG | starter | 50 | 0 | 90 | 81 | marqueeSigning |  |
| 2037 | 27 | PSG | starter | 49 | 0 | 91 | 95 | marqueeSigning | rowBoard/apologize |
| 2038 | 28 | Real Madrid | starter | 50 | 0 | 91 | 84 | marqueeSigning |  |
| 2039 | 29 | Real Madrid | starter | 56 | 0 | 91 | 94 | marqueeSigning |  |
| 2040 | 30 | Real Madrid | starter | 48 | 0 | 93 | 100 | marqueeSigning | supplement/take ✓ |
| 2041 | 31 | Real Madrid | starter | 57 | 0 | 93 | 100 | marqueeSigning |  |
| 2042 | 32 | Real Madrid | starter | 43 | 0 | 93 | 100 | marqueeSigning | academyJewel/compete ✗ |
| 2043 | 33 | Real Madrid | starter | 56 | 0 | 92 | 100 | marqueeSigning |  |
| 2044 | 34 | Real Madrid | starter | 45 | 0 | 92 | 100 | marqueeSigning | muscleInjury/fullRecovery |
