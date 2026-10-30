# Futeiros

Este repositório contém somente o projeto ativo em **v2/**: os jogos Craque e
Técnico, em React/Zustand/Vite, com motores puros e dados próprios.

A revisão atual é **D116**: Craque `2.0.0-m41` e Técnico `1.10.0`.
O [estado atual e a orientação para começar do zero](v2/README.md#estado-atual-e-leitura-inicial-d116-30102026)
reúnem as regras vigentes, os novos momentos de carreira, as contas do motor,
o jornal com leitura ampliada e os caminhos da documentação técnica.

A implementação v1 (Next.js), seus pacotes, documentação e dependências foram
removidos. O histórico de Git permanece. A raiz guarda apenas os comandos que
delegam para a v2; não é outro workspace.

## Rodar

**Para desenvolver:** Node.js 22.12+ e pnpm 10.34.5:

```powershell
pnpm deps
pnpm dev
```

Abra http://localhost:5173. Os comandos da raiz delegam para a v2: `pnpm build`,
`pnpm test`, `pnpm verify`, `pnpm e2e`, `pnpm balance`, `pnpm balance:tecnico`,
`pnpm imagens:importar`, `pnpm supabase:testar`, entre outros. O lockfile e as
dependências ficam exclusivamente em `v2/`. Os atalhos `.bat` de Windows saíram
(D115): quem testa abre o endereço publicado.

**Contas (opcional, D112 a D114):** com `VITE_SUPABASE_URL` e
`VITE_SUPABASE_PUBLISHABLE_KEY` em `v2/apps/game/.env.local` (fora do Git), o
jogo ganha login com Google ou e-mail, perfil, troféus com quantidade e ranking
mundial do Desafio. Sem elas, tudo funciona só no aparelho. Passo a passo do
Supabase, dos anúncios genéricos e das imagens geradas no
[README do projeto](v2/README.md#d112-a-d115-contas-na-nuvem-privacidade-segurança-e-ferramentas-30102026).

Em Ajustes, **Animações** começa ativado e pode ser desativado. A escolha fica
salva neste navegador para os dois jogos e independe da configuração do PC.

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
