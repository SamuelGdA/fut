# Futeiros

Este repositório contém somente o projeto ativo em **v2/**: os jogos Craque e
Técnico, em React/Zustand/Vite, com motores puros e dados próprios.

A implementação v1 (Next.js), seus pacotes, documentação e dependências foram
removidos. O histórico de Git permanece. A raiz guarda apenas os atalhos do
projeto; não é outro workspace.

## Rodar

**Para jogar no Windows:** baixe o ZIP do repositório e extraia todos os arquivos.
Execute `instalacao.bat` uma vez e depois `iniciar.bat`. O instalador verifica Node
22.12+, tenta preparar a versão LTS se necessário e instala as dependências.
Se o Windows pedir autorização para instalar Node, confirme. Sem WinGet, o
instalador orienta instalar Node em [nodejs.org](https://nodejs.org) e repetir.
Não é necessário instalar pnpm globalmente. A primeira instalação precisa de
internet; mantenha a janela do jogo aberta enquanto estiver jogando.

**Para desenvolver:** Node.js 22.12+ e pnpm 10.34.5:

```powershell
pnpm deps
pnpm dev
```

Abra http://localhost:5173. No Windows, `iniciar.bat` chama o inicializador da v2.
Os comandos da raiz delegam para a v2: `pnpm build`, `pnpm test`, `pnpm verify`,
`pnpm e2e`, `pnpm balance` e `pnpm balance:tecnico`, entre outros.
O lockfile e as dependências ficam exclusivamente em `v2/`.

## Documentação

- [README do projeto e do Craque](v2/README.md)
- [README do Técnico](v2/README-TECNICO.md)
- [Especificação](v2/docs/GDD.md)
- [Decisões de produto e arquitetura](v2/docs/DECISOES.md)
- [Regras para alterações](v2/AI_RULES.md)

A abertura carrega a casca, o hub e peças compartilhadas. Código e dados de cada
jogo só são antecipados depois de escolher o modo. O cache offline também segue
essa separação: abra o jogo com conexão e aguarde seu carregamento para usá-lo
sem internet. Detalhes na D62.
