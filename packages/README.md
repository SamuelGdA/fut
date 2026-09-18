# packages/

Os pacotes de domínio. **Isto é o jogo**; a oficina fica em `tools/`.

Nenhum deles existe ainda: a etapa 1 da migração montou a casca e travou os
baselines de balanceamento, e a extração começa na etapa 3. A ordem e o motivo
estão em [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

| Pacote | O que vai conter | Etapa |
|---|---|---|
| `data` | Países, ligas, clubes, competições, rivalidades, kits | 3 |
| `art` | Escudos, troféus, escudos de liga, avatar, especificação da carta | 3 |
| `content` | Prosa e traduções, com lint de travessão, paridade e variantes | 4 |
| `engine` | A simulação pura | 5 |

Cada um nasce com `@craque/eslint-config/strict` ligado: os tetos de tamanho e
complexidade valem para o código que vai ficar, não para o que está de saída.
