# Ferramentas temporárias de testes no Windows

Estes arquivos só ajudam amigos a testar a cópia local. O site publicado não
importa nenhum deles e não consulta o GitHub pelo navegador.

- `instalacao.bat`: prepara Node.js LTS e instala as dependências. Depois, pede
  para executar `iniciar.bat`.
- `iniciar.bat`: consulta a última versão, avisa se houver atualização, confere
  dependências e abre o jogo. Sem internet, uma falha na consulta não bloqueia
  a abertura. A consulta tem timeout; limites da API do GitHub também podem
  impedir a conferência e são informados como indisponibilidade.
- `atualizar.bat`: com o jogo fechado, baixa a `main` de `SamuelGdA/fut`, atualiza
  o código e instala dependências. Não abre o jogo sozinho.

Os atalhos existem na raiz e dentro de `v2/`. Para receber este atualizador pela
primeira vez, baixe e extraia a versão que já inclui `atualizar.bat`.

## O que precisa estar instalado

Windows PowerShell 5.1 ou superior, normalmente já incluído no Windows 10/11,
e internet para consultar/baixar versões. Não é necessário instalar Git para
uma cópia baixada por ZIP. O instalador existente prepara Node.js 22.12+ pelo
WinGet oficial quando possível, ou orienta instalar o Node LTS pelo site oficial.
O pnpm é usado por `npm exec`, sem instalação global.

Uma cópia clonada com Git usa seu Git existente. A atualização aceita somente
`main`, origem oficial e avanço direto, sem mudanças locais. Nunca faz reset,
força atualização ou descarta trabalho. Se a instalação falhar depois do avanço
Git, o código já estará atualizado; repita `instalacao.bat` após corrigir a conexão.

## Cópias ZIP, backup e recuperação

A primeira conferência compara os arquivos com a árvore oficial, sem presumir
que um ZIP antigo seja a última versão. Depois, a revisão conhecida é registrada
em `.futeiros-teste.json`.

O ZIP é baixado para uma pasta temporária, validado e aplicado somente aos itens
conhecidos deste projeto. `v2/` é substituída inteira para remover código obsoleto;
arquivos pessoais na raiz ficam intactos. Não extraia o jogo misturado a arquivos
pessoais dentro de `v2/`. Antes de aplicar, a cópia anterior é movida para
`.futeiros-backups/<data>/`, incluindo arquivos locais daquela pasta. As escolhas
salvas no navegador não são apagadas pelo atualizador.

A instalação acontece no caminho definitivo para os links de dependências do
Windows continuarem válidos. Se falhar, a cópia ZIP anterior é restaurada. Caso
a própria restauração seja bloqueada por arquivos em uso, o programa informa
as pastas preservadas, sem apagá-las. Tentativas com dependências parcialmente
instaladas também ficam preservadas para diagnóstico; o atualizador evita
percorrer seus possíveis links durante a limpeza. Backups não são apagados
automaticamente e ocupam espaço. Confirme que a nova versão funciona antes de
remover uma cópia anterior.

## Remover ao publicar na web

1. Remova `iniciar.bat`, `instalacao.bat` e `atualizar.bat` da raiz e de `v2/`.
2. Remova de `v2/scripts/`: `windows.bat`, `windows.test.mjs`, `update.ps1`,
   `update.test.mjs`, `update.test.ps1` e este README.
3. Remova `test:windows` do `v2/package.json` e sua chamada em `verify`.
4. Remova as três entradas `.futeiros-*` do `.gitignore` da raiz e a orientação
   de testes locais dos README, se ela não for mais necessária.

Nenhuma alteração nos modos Craque/Técnico é necessária para retirar essas
ferramentas. A preferência de animações pertence ao jogo e permanece na web.
