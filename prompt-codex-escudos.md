# Missão: escudos e logos do jogo Futeiros (34 ligas e 525 clubes)

Você é um designer de identidade visual esportiva e um ilustrador vetorial meticuloso. Vai desenhar, em SVG, o escudo de cada clube e o logo de cada liga de um jogo de futebol. Não tenha pressa: qualidade acima de velocidade. Trabalhe em lotes, revise tudo e corrija antes de seguir.

## O objetivo

Cada arte tem de ser reconhecida na hora por quem conhece o time: quem olhar deve pensar "é o escudo do Flamengo", "é o do Real Madrid". Para isso:

1. **Pesquise a identidade oficial** de cada clube e liga antes de desenhar: escudo atual, cores exatas (hex), formato do escudo, símbolos (animal, cruz, coroa, estrela, monograma), número de estrelas, faixas, listras e proporções.
2. **Redesenhe do zero, inspirado no oficial.** Não copie nem vetorize o arquivo original. Faça uma versão vetorial limpa e própria, que preserve tudo o que torna o escudo reconhecível: silhueta, paleta, símbolo central e composição. Pense numa "versão de videogame": fiel no espírito, simplificada nos detalhes.
3. **Ligas:** pesquise o logo oficial e crie um símbolo inspirado nele: forma, cores e elemento gráfico principal (troféu, leão, estrela, bola, faixas).

## Especificação técnica (obrigatória)

**Clubes**
- Arquivo SVG com `viewBox="0 0 512 512"`, `width="512" height="512"`.
- Fundo transparente: nenhum retângulo de fundo.
- Escudo centralizado, ocupando cerca de 90% da área (aprox. 460 px na maior dimensão), com margem igual nos lados.
- Sem sombra externa, sem brilho externo, sem `filter` de sombra. Gradientes internos sutis são permitidos se ajudarem no volume, mas o visual deve ser plano e limpo.
- Texto só quando for essencial à identidade (siglas como "SCCP", "CRF", "FCB", ano de fundação). Nesse caso, converta o texto em `<path>`. Nada de `<text>` nem de fontes externas.
- Sem imagens embutidas (`<image>`, base64), sem scripts, sem links externos.
- Código enxuto: agrupe com `<g>`, reutilize com `<defs>`/`<use>`, use no máximo 2 casas decimais nas coordenadas e mantenha cada arquivo abaixo de cerca de 40 KB.
- Tem de ficar legível em 24 px e bonito em 512 px. Contorno de separação fino (escuro ou claro) quando o escudo tiver bordas claras, para funcionar tanto em fundo claro quanto escuro.

**Ligas**
- Mesmo formato: `viewBox="0 0 512 512"`, fundo transparente, logo centralizado.
- O jogo mostra a liga numa caixa quadrada, então o logo deve ser compacto (formato vertical ou quadrado). Logos largos ficam pequenos.
- Evite texto. Use símbolo, forma e cor. Se o logo oficial for só tipografia, crie um emblema com o elemento mais marcante (cor, forma, troféu, número da divisão).

**Nome dos arquivos**
- Só o nome do clube ou da liga, exatamente como está na lista abaixo, com `.svg` (exemplo: `Flamengo.svg`, `Premier League.svg`).
- Ligas numa pasta `ligas/`, clubes numa pasta `clubes/<Liga>/`.

## Processo de trabalho

1. **Lote por liga.** Faça uma liga de cada vez: primeiro o logo da liga, depois os clubes dela, do mais famoso ao menos famoso.
2. **Para cada arte:** pesquise, anote as cores hex e os elementos-chave, desenhe e salve.
3. **Revise cada lote** renderizando os SVGs em PNG (por exemplo, com `resvg` ou um navegador headless) em 512 px e em 32 px, sobre fundo branco e sobre fundo preto. Monte uma folha de contato do lote e verifique:
   - Está reconhecível? Se a pessoa não identifica o time em 2 segundos, refaça.
   - Está centralizado, ocupando cerca de 90%, sem cortes?
   - Fundo transparente e sem sombra?
   - Cores corretas? Duas equipes da mesma liga parecidas demais? Diferencie pelo símbolo, não pela cor errada.
   - O SVG é válido? Abra num validador ou parser XML.
4. **Corrija e renderize de novo** até ficar bom. Só então passe para a próxima liga.
5. **No fim**, faça uma revisão geral de todas as folhas de contato e um relatório curto: o que ficou ótimo, o que foi simplificado, e clubes cuja identidade oficial você não encontrou (para esses, crie um escudo coerente com as cores de referência da lista).

## Qualidade que espero

- Traços e curvas suaves (Bézier bem construídas, nada de polígono serrilhado).
- Animais e símbolos bem desenhados: proporção, pose e detalhe suficiente para lembrar o oficial.
- Coroas, estrelas e cruzes simétricas e alinhadas.
- Paleta fiel ao clube.
- Consistência de conjunto: todos os escudos parecem do mesmo jogo, com o mesmo nível de detalhe e a mesma espessura de contorno.

## Lista completa

As cores de referência são as cores principais que o jogo já usa para o clube; confirme com a identidade oficial.

## Ligas (34)

- `Liga Profesional.svg` — Liga Profesional (Argentina, 1ª divisão)
- `Primera Nacional.svg` — Primera Nacional (Argentina, 2ª divisão)
- `Liga Bolivia.svg` — Liga Bolivia (Bolívia, 1ª divisão)
- `Copa Simón Bolívar.svg` — Copa Simón Bolívar (Bolívia, 2ª divisão)
- `Brasileirão.svg` — Brasileirão (Brasil, 1ª divisão)
- `Brasileirão Série B.svg` — Brasileirão Série B (Brasil, 2ª divisão)
- `Liga de Primera.svg` — Liga de Primera (Chile, 1ª divisão)
- `Primera B.svg` — Primera B (Chile, 2ª divisão)
- `Liga Dimayor.svg` — Liga Dimayor (Colômbia, 1ª divisão)
- `Torneo Dimayor.svg` — Torneo Dimayor (Colômbia, 2ª divisão)
- `LigaPro Serie A.svg` — LigaPro Serie A (Equador, 1ª divisão)
- `LigaPro Serie B.svg` — LigaPro Serie B (Equador, 2ª divisão)
- `Premier League.svg` — Premier League (Inglaterra, 1ª divisão)
- `Championship.svg` — Championship (Inglaterra, 2ª divisão)
- `LaLiga.svg` — LaLiga (Espanha, 1ª divisão)
- `LaLiga 2.svg` — LaLiga 2 (Espanha, 2ª divisão)
- `Ligue 1.svg` — Ligue 1 (França, 1ª divisão)
- `Ligue 2.svg` — Ligue 2 (França, 2ª divisão)
- `Bundesliga.svg` — Bundesliga (Alemanha, 1ª divisão)
- `2. Bundesliga.svg` — 2. Bundesliga (Alemanha, 2ª divisão)
- `Serie A.svg` — Serie A (Itália, 1ª divisão)
- `Serie B.svg` — Serie B (Itália, 2ª divisão)
- `Liga MX.svg` — Liga MX (México, 1ª divisão)
- `Copa de Primera.svg` — Copa de Primera (Paraguai, 1ª divisão)
- `División Intermedia.svg` — División Intermedia (Paraguai, 2ª divisão)
- `Liga1.svg` — Liga1 (Peru, 1ª divisão)
- `Liga 2.svg` — Liga 2 (Peru, 2ª divisão)
- `Primeira Liga.svg` — Primeira Liga (Portugal, 1ª divisão)
- `Liga Portugal 2.svg` — Liga Portugal 2 (Portugal, 2ª divisão)
- `Liga Uruguaya.svg` — Liga Uruguaya (Uruguai, 1ª divisão)
- `Segunda División.svg` — Segunda División (Uruguai, 2ª divisão)
- `MLS.svg` — MLS (Estados Unidos, 1ª divisão)
- `Liga FUTVE.svg` — Liga FUTVE (Venezuela, 1ª divisão)
- `Liga FUTVE 2.svg` — Liga FUTVE 2 (Venezuela, 2ª divisão)

## Clubes (525)


### Liga Profesional (Argentina)

- `River Plate.svg` — cores de referência #ED192D
- `Boca Juniors.svg` — cores de referência #103F79
- `Racing Club.svg` — cores de referência #029CDC
- `Independiente.svg` — cores de referência #ED1C24
- `Talleres de Córdoba.svg` — cores de referência #040D2D
- `Vélez Sarsfield.svg` — cores de referência #0A539C
- `Estudiantes de La Plata.svg` — cores de referência #E21919
- `Rosario Central.svg` — cores de referência #0A3D72
- `Argentinos Juniors.svg` — cores de referência #E32021
- `Lanús.svg` — cores de referência #7C1F2C
- `San Lorenzo.svg` — cores de referência #263A54
- `Huracán.svg` — cores de referência #E30613
- `Belgrano.svg` — cores de referência #00BBF1
- `Defensa y Justicia.svg` — cores de referência #00722D
- `Newell's Old Boys.svg` — cores de referência #F42121
- `Atlético Tucuman.svg` — cores de referência #6FAEDC
- `Platense.svg` — cores de referência #4A2E15
- `Tigre.svg` — cores de referência #1E448D
- `Unión de Santa Fe.svg` — cores de referência #ED1C24
- `Banfield.svg` — cores de referência #03953F
- `Gimnasia y Esgrima La Plata.svg` — cores de referência #121A61
- `Independiente Rivadavia.svg` — cores de referência #13007C
- `Barracas Central.svg` — cores de referência #E30016
- `Instituto de Córdoba.svg` — cores de referência #DF040B
- `Central Córdoba de Santiago del Estero.svg` — cores de referência #000000
- `Sarmiento de Junin.svg` — cores de referência #008349
- `Estudiantes de Rio Cuarto.svg` — cores de referência #008BD0
- `Gimnasia de Mendoza.svg` — cores de referência #000000
- `Aldosivi.svg` — cores de referência #F3DB26
- `Deportivo Riestra.svg` — cores de referência #000000

### Primera Nacional (Argentina)

- `Godoy Cruz.svg` — cores de referência #0081C3
- `Colón de Santa Fe.svg` — cores de referência #E30B12
- `San Martín (T).svg` — cores de referência #AC0F17
- `Patronato.svg` — cores de referência #D40002
- `Quilmes.svg` — cores de referência #000755
- `San Martín (SJ).svg` — cores de referência #40AB35
- `All Boys.svg` — cores de referência #FFFFFF
- `Almagro.svg` — cores de referência #0241AA
- `Almirante Brown.svg` — cores de referência #FDE100
- `Atlético de Rafaela.svg` — cores de referência #0084C9
- `Chacarita Juniors.svg` — cores de referência #D5161B
- `Ferro Carril Oeste.svg` — cores de referência #156538
- `Nueva Chicago.svg` — cores de referência #00A650
- `Temperley.svg` — cores de referência #00BCEA
- `Agropecuario.svg` — cores de referência #01994C
- `Atlanta.svg` — cores de referência #333399
- `Atletico Mitre (SdE).svg` — cores de referência #FFCB00
- `Deportivo Madryn.svg` — cores de referência #FDCA00
- `Deportivo Maipu.svg` — cores de referência #E30613
- `Deportivo Morón.svg` — cores de referência #C1102A
- `Estudiantes.svg` — cores de referência #000000
- `Gimnasia Jujuy.svg` — cores de referência #1AA3DB
- `Gimnasia y Tiro.svg` — cores de referência #009FE3
- `Los Andes.svg` — cores de referência #FF0000
- `Chaco For Ever.svg` — cores de referência #000000
- `Club Atlético Güemes.svg` — cores de referência #00438E
- `Defensores de Belgrano.svg` — cores de referência #E92123
- `Racing (C).svg` — cores de referência #00A1DF
- `San Miguel.svg` — cores de referência #03933F
- `San Telmo.svg` — cores de referência #104185
- `Tristán Suárez.svg` — cores de referência #1E1F41
- `Acassuso.svg` — cores de referência #33348E
- `Central Norte.svg` — cores de referência #000000
- `Ciudad de Bolívar.svg` — cores de referência #0013FF
- `Colegiales.svg` — cores de referência #213990
- `Midland.svg` — cores de referência #010157

### Liga Bolivia (Bolívia)

- `Bolívar.svg` — cores de referência #00A6DC
- `The Strongest.svg` — cores de referência #E2AB1C
- `Always Ready.svg` — cores de referência #E01913
- `Blooming.svg` — cores de referência #569BD0
- `Independiente Petrolero.svg` — cores de referência #E90914
- `Nacional Potosí.svg` — cores de referência #F80907
- `Guabirá.svg` — cores de referência #E70605
- `San Antonio Bulo Bulo.svg` — cores de referência #01115B

### Copa Simón Bolívar (Bolívia)

- `Jorge Wilstermann.svg` — cores de referência #E31E24
- `Real Potosí.svg` — cores de referência #8B1A1A
- `Universitario de Vinto.svg` — cores de referência #1E3A8A
- `Club Destroyers.svg` — cores de referência #FFD100
- `Real Oruro.svg` — cores de referência #C8102E
- `Academia del Balompié.svg` — cores de referência #00A94F
- `Vaca Díez.svg` — cores de referência #0B7A3B
- `San Juan.svg` — cores de referência #0033A0

### Brasileirão (Brasil)

- `Flamengo.svg` — cores de referência #C52613
- `Palmeiras.svg` — cores de referência #006437
- `Botafogo.svg` — cores de referência #000000
- `Cruzeiro.svg` — cores de referência #2F529E
- `Fluminense.svg` — cores de referência #92062A
- `Atlético Mineiro.svg` — cores de referência #000000
- `São Paulo.svg` — cores de referência #FFFFFF
- `Corinthians.svg` — cores de referência #FFFFFF
- `Internacional.svg` — cores de referência #E5050F
- `Grêmio.svg` — cores de referência #0D80BF
- `Bahia.svg` — cores de referência #006BB4
- `Santos.svg` — cores de referência #FFFFFF
- `Vasco da Gama.svg` — cores de referência #000000
- `Red Bull Bragantino.svg` — cores de referência #001D46
- `Athletico Paranaense.svg` — cores de referência #CF181F
- `Mirassol.svg` — cores de referência #166F3D
- `Coritiba.svg` — cores de referência #005742
- `Vitoria.svg` — cores de referência #FF1100
- `Chapecoense.svg` — cores de referência #00A329
- `Remo.svg` — cores de referência #000000

### Brasileirão Série B (Brasil)

- `Sport Recife.svg` — cores de referência #c8102e
- `Ceará.svg` — cores de referência #12161c
- `Goiás.svg` — cores de referência #0f7a3d
- `América-MG.svg` — cores de referência #1c7a3c
- `Cuiabá.svg` — cores de referência #0f7a3d
- `Criciúma.svg` — cores de referência #f5c400
- `Novorizontino.svg` — cores de referência #f5c400
- `Avaí.svg` — cores de referência #0d80bf
- `Ponte Preta.svg` — cores de referência #12161c
- `Guarani.svg` — cores de referência #0f7a3d
- `Náutico.svg` — cores de referência #c8102e
- `Vila Nova.svg` — cores de referência #c8102e
- `Paysandu.svg` — cores de referência #0b4ea2
- `Operário-PR.svg` — cores de referência #12161c
- `CRB.svg` — cores de referência #c8102e
- `Ferroviária.svg` — cores de referência #c8102e
- `Botafogo-SP.svg` — cores de referência #12161c
- `Volta Redonda.svg` — cores de referência #f5c400
- `Amazonas.svg` — cores de referência #0f8a4d
- `Athletic-MG.svg` — cores de referência #12161c

### Liga de Primera (Chile)

- `Colo Colo.svg` — cores de referência #FFFFFF
- `Universidad Católica.svg` — cores de referência #1958A8
- `Universidad de Chile.svg` — cores de referência #022F87
- `Coquimbo Unido.svg` — cores de referência #000000
- `Cobresal.svg` — cores de referência #DB812E
- `Huachipato.svg` — cores de referência #0084CA
- `O'Higgins.svg` — cores de referência #4C9C2E
- `Palestino.svg` — cores de referência #008954
- `Áudax Italiano.svg` — cores de referência #1F4794

### Primera B (Chile)

- `Cobreloa.svg` — cores de referência #FF6600
- `Santiago Wanderers.svg` — cores de referência #007A33
- `Deportes Antofagasta.svg` — cores de referência #00A0DF
- `Deportes Magallanes.svg` — cores de referência #0033A0
- `Rangers de Talca.svg` — cores de referência #C8102E
- `Deportes Temuco.svg` — cores de referência #009639
- `Deportes Copiapó.svg` — cores de referência #6A1B9A
- `Curicó Unido.svg` — cores de referência #C8102E
- `Deportes Concepción.svg` — cores de referência #5B1A8A
- `San Marcos de Arica.svg` — cores de referência #FFD100

### Liga Dimayor (Colômbia)

- `Atlético Nacional.svg` — cores de referência #00953B
- `América de Cali.svg` — cores de referência #000000
- `Junior.svg` — cores de referência #00309B
- `Millonarios.svg` — cores de referência #273479
- `Deportes Tolima.svg` — cores de referência #8D3031
- `Independiente Medellin.svg` — cores de referência #252C5E
- `Santa Fe.svg` — cores de referência #C32523
- `Bucaramanga.svg` — cores de referência #F3E638
- `Deportivo Cali.svg` — cores de referência #2A975E
- `Once Caldas.svg` — cores de referência #292E6E

### Torneo Dimayor (Colômbia)

- `Cúcuta Deportivo.svg` — cores de referência #C8102E
- `Atlético Huila.svg` — cores de referência #FFC72C
- `Jaguares de Córdoba.svg` — cores de referência #0B6E4F
- `Unión Magdalena.svg` — cores de referência #003DA5
- `Real Cartagena.svg` — cores de referência #00A94F
- `Patriotas Boyacá.svg` — cores de referência #C8102E
- `Deportes Quindío.svg` — cores de referência #FFC72C
- `Itagüí Leones.svg` — cores de referência #C8102E
- `Internacional de Bogotá.svg` — cores de referência #0B6E4F
- `Boca Juniors de Cali.svg` — cores de referência #003DA5

### LigaPro Serie A (Equador)

- `Independiente del Valle.svg` — cores de referência #000000
- `LDU de Quito.svg` — cores de referência #B70000
- `Barcelona SC.svg` — cores de referência #FFF218
- `Emelec.svg` — cores de referência #054C94
- `Universidad Católica.svg` — cores de referência #2FA6D9
- `Deportivo Cuenca.svg` — cores de referência #09823A
- `Libertad.svg` — cores de referência #DCB248
- `Orense SC.svg` — cores de referência #2A2086
- `Macará.svg` — cores de referência #3397C4

### LigaPro Serie B (Equador)

- `El Nacional.svg` — cores de referência #C8102E
- `Independiente Juniors.svg` — cores de referência #0B2E13
- `Liga de Portoviejo.svg` — cores de referência #0033A0
- `9 de Octubre.svg` — cores de referência #0033A0
- `Cumbayá.svg` — cores de referência #00A94F
- `Gualaceo.svg` — cores de referência #C8102E
- `Cuenca Juniors.svg` — cores de referência #C8102E
- `Vinotinto Ecuador.svg` — cores de referência #7A1F2B
- `Santo Domingo.svg` — cores de referência #FFD100

### Premier League (Inglaterra)

- `Arsenal.svg` — cores de referência #E20613
- `Liverpool.svg` — cores de referência #DC0714
- `Manchester City.svg` — cores de referência #7AB2E1
- `Chelsea.svg` — cores de referência #153D8A
- `Manchester United.svg` — cores de referência #DA020E
- `Newcastle United.svg` — cores de referência #000000
- `Tottenham.svg` — cores de referência #000A3C
- `Aston Villa.svg` — cores de referência #94BEE5
- `Brighton.svg` — cores de referência #004899
- `Crystal Palace.svg` — cores de referência #0055A5
- `Bournemouth.svg` — cores de referência #CC080F
- `Everton.svg` — cores de referência #014593
- `Nottingham Forest.svg` — cores de referência #DC0D15
- `Brentford.svg` — cores de referência #D20000
- `Fulham.svg` — cores de referência #FFFFFF
- `Leeds.svg` — cores de referência #FFDF00
- `Sunderland.svg` — cores de referência #E40520
- `Coventry City.svg` — cores de referência #7AB2E1
- `Ipswich Town.svg` — cores de referência #3A64A3
- `Hull City.svg` — cores de referência #F18A01

### Championship (Inglaterra)

- `West Ham.svg` — cores de referência #7C2C3B
- `Wolves.svg` — cores de referência #FDB913
- `Burnley.svg` — cores de referência #5F0041
- `Southampton.svg` — cores de referência #ED1A3B
- `Middlesbrough.svg` — cores de referência #C8102E
- `Sheffield United.svg` — cores de referência #EC2227
- `Norwich.svg` — cores de referência #038C40
- `Wrexham.svg` — cores de referência #E62E29
- `Birmingham City.svg` — cores de referência #1E3D8F
- `Millwall.svg` — cores de referência #00367A
- `Stoke City.svg` — cores de referência #D6172E
- `Swansea City.svg` — cores de referência #000000
- `Watford.svg` — cores de referência #FBEE23
- `West Brom.svg` — cores de referência #091453
- `Blackburn Rovers.svg` — cores de referência #1E3D8F
- `Bristol City.svg` — cores de referência #E21A23
- `Cardiff City.svg` — cores de referência #2B58AE
- `Derby County.svg` — cores de referência #000000
- `Portsmouth.svg` — cores de referência #293F9C
- `Preston.svg` — cores de referência #002156
- `Charlton Athletic.svg` — cores de referência #BE1E2D
- `Queen's Park Rangers.svg` — cores de referência #1D5BA4
- `Bolton Wanderers.svg` — cores de referência #263C7E
- `Lincoln City.svg` — cores de referência #E62831

### LaLiga (Espanha)

- `Real Madrid.svg` — cores de referência #FFFFFF
- `Barcelona.svg` — cores de referência #004D98
- `Atlético Madrid.svg` — cores de referência #E8151E
- `Villarreal.svg` — cores de referência #005187
- `Athletic Club.svg` — cores de referência #EE2523
- `Real Betis.svg` — cores de referência #00954C
- `Real Sociedad.svg` — cores de referência #143C8B
- `Sevilla.svg` — cores de referência #D70F21
- `Celta de Vigo.svg` — cores de referência #8AC3EE
- `Valencia.svg` — cores de referência #FFDF1C
- `Osasuna.svg` — cores de referência #D70F27
- `Rayo Vallecano.svg` — cores de referência #E3351C
- `Espanyol.svg` — cores de referência #0085CC
- `Alaves.svg` — cores de referência #0232A0
- `Getafe.svg` — cores de referência #014F97
- `Elche.svg` — cores de referência #05642C
- `Deportivo La Coruña.svg` — cores de referência #0085CC
- `Levante.svg` — cores de referência #005CA3
- `Racing de Santander.svg` — cores de referência #2D9A29
- `Malaga.svg` — cores de referência #A7D6F5

### LaLiga 2 (Espanha)

- `Girona.svg` — cores de referência #CF0C29
- `Mallorca.svg` — cores de referência #ED1B24
- `Almeria.svg` — cores de referência #E30511
- `Las Palmas.svg` — cores de referência #FFE400
- `Real Oviedo.svg` — cores de referência #094CA1
- `Valladolid.svg` — cores de referência #911C8F
- `Granada CF.svg` — cores de referência #C31632
- `Sporting Gijon.svg` — cores de referência #E2001A
- `Cadiz.svg` — cores de referência #FDE607
- `Leganes.svg` — cores de referência #0B1F6F
- `Eibar.svg` — cores de referência #02306B
- `Albacete.svg` — cores de referência #FFFFFF
- `Burgos.svg` — cores de referência #FFFFFF
- `Castellón.svg` — cores de referência #FFFFFF
- `Cordoba.svg` — cores de referência #016139
- `Tenerife.svg` — cores de referência #2D3997
- `AD Ceuta FC.svg` — cores de referência #FFFFFF
- `FC Andorra.svg` — cores de referência #000D88
- `Eldense.svg` — cores de referência #043298
- `Sabadell.svg` — cores de referência #3443A8

### Ligue 1 (França)

- `Paris Saint Germain.svg` — cores de referência #004170
- `AS Monaco.svg` — cores de referência #FF002E
- `Olympique de Marseille.svg` — cores de referência #0097D7
- `Olympique Lyonnais.svg` — cores de referência #0F23AA
- `Lille.svg` — cores de referência #E01E13
- `Lens.svg` — cores de referência #B71315
- `Stade Rennais.svg` — cores de referência #E13327
- `RC Strasbourg.svg` — cores de referência #009FE3
- `Nice.svg` — cores de referência #ED1C24
- `Stade Brestois.svg` — cores de referência #ED1C24
- `Toulouse.svg` — cores de referência #38284F
- `Paris FC.svg` — cores de referência #0A0F2D
- `Angers.svg` — cores de referência #000000
- `Auxerre.svg` — cores de referência #004EA2
- `Lorient.svg` — cores de referência #F58113
- `Le Havre.svg` — cores de referência #193260
- `Estac Troyes.svg` — cores de referência #006CB4
- `Le Mans.svg` — cores de referência #E30613

### Ligue 2 (França)

- `Nantes.svg` — cores de referência #FFDC00
- `Reims.svg` — cores de referência #EB0000
- `Saint Étienne.svg` — cores de referência #1D995B
- `Metz.svg` — cores de referência #731013
- `Montpellier.svg` — cores de referência #003E7E
- `Clermont Foot.svg` — cores de referência #1F3561
- `Guingamp.svg` — cores de referência #E30613
- `Annecy.svg` — cores de referência #E30613
- `Dunkerque.svg` — cores de referência #1B2738
- `Nancy.svg` — cores de referência #E93526
- `Dijon.svg` — cores de referência #D40028
- `Grenoble.svg` — cores de referência #005DA3
- `Laval.svg` — cores de referência #EB680B
- `PAU.svg` — cores de referência #1C1F42
- `Red Star FC 93.svg` — cores de referência #B21E28
- `Rodez.svg` — cores de referência #AC1028
- `Sochaux.svg` — cores de referência #133578
- `Boulogne.svg` — cores de referência #CD131D

### Bundesliga (Alemanha)

- `Bayern München.svg` — cores de referência #ED0038
- `Borussia Dortmund.svg` — cores de referência #FFD900
- `Bayer Leverkusen.svg` — cores de referência #E22726
- `RB Leipzig.svg` — cores de referência #DD0741
- `VfB Stuttgart.svg` — cores de referência #D40723
- `Eintracht Frankfurt.svg` — cores de referência #E1020C
- `SC Freiburg.svg` — cores de referência #E1020C
- `1899 Hoffenheim.svg` — cores de referência #1961B5
- `Borussia Mönchengladbach.svg` — cores de referência #000000
- `FSV Mainz 05.svg` — cores de referência #AE0F0A
- `Werder Bremen.svg` — cores de referência #1D9053
- `1. FC Köln.svg` — cores de referência #E20613
- `1. FC Union Berlin.svg` — cores de referência #EB1923
- `FC Augsburg.svg` — cores de referência #BA3733
- `Hamburger SV.svg` — cores de referência #1E5CB3
- `FC Schalke 04.svg` — cores de referência #004B9C
- `SC Paderborn 07.svg` — cores de referência #005CA8
- `SV Elversberg.svg` — cores de referência #FFFFFF

### 2. Bundesliga (Alemanha)

- `VfL Wolfsburg.svg` — cores de referência #52A600
- `FC St. Pauli.svg` — cores de referência #624839
- `1. FC Heidenheim.svg` — cores de referência #003B79
- `Holstein Kiel.svg` — cores de referência #00579C
- `Hertha BSC.svg` — cores de referência #0068B4
- `VfL Bochum.svg` — cores de referência #005BA4
- `1. FC Kaiserslautern.svg` — cores de referência #E30511
- `1. FC Nürnberg.svg` — cores de referência #AA1124
- `Hannover 96.svg` — cores de referência #009D3A
- `Karlsruher SC.svg` — cores de referência #004C94
- `Arminia Bielefeld.svg` — cores de referência #005C9D
- `SV Darmstadt 98.svg` — cores de referência #004F9F
- `1. FC Magdeburg.svg` — cores de referência #0057B7
- `Dynamo Dresden.svg` — cores de referência #9B0011
- `SpVgg Greuther Fürth.svg` — cores de referência #2FA641
- `Eintracht Braunschweig.svg` — cores de referência #FEE71A
- `Energie Cottbus.svg` — cores de referência #E61C02
- `VfL Osnabrück.svg` — cores de referência #572A86

### Serie A (Itália)

- `Inter.svg` — cores de referência #00239C
- `Napoli.svg` — cores de referência #01A7E1
- `Juventus.svg` — cores de referência #000000
- `AC Milan.svg` — cores de referência #E4002B
- `Atalanta.svg` — cores de referência #0067B2
- `AS Roma.svg` — cores de referência #970A2C
- `Bologna.svg` — cores de referência #1B2838
- `Lazio.svg` — cores de referência #85D8F8
- `Como.svg` — cores de referência #10416A
- `Fiorentina.svg` — cores de referência #61358B
- `Torino.svg` — cores de referência #881F19
- `Genoa.svg` — cores de referência #AE1919
- `Sassuolo.svg` — cores de referência #1EA451
- `Udinese.svg` — cores de referência #000000
- `Cagliari.svg` — cores de referência #B01028
- `Parma.svg` — cores de referência #24338A
- `Lecce.svg` — cores de referência #002856
- `Monza.svg` — cores de referência #ED1639
- `Venezia.svg` — cores de referência #A08C55
- `Frosinone.svg` — cores de referência #004393

### Serie B (Itália)

- `Hellas Verona.svg` — cores de referência #A08C55
- `Cremonese.svg` — cores de referência #004393
- `Palermo.svg` — cores de referência #EEC0C8
- `Empoli.svg` — cores de referência #1D4C90
- `Pisa.svg` — cores de referência #ED1639
- `Sampdoria.svg` — cores de referência #004B95
- `Modena.svg` — cores de referência #00004B
- `Spezia.svg` — cores de referência #FFFFFF
- `Catanzaro.svg` — cores de referência #C30F1B
- `Bari.svg` — cores de referência #CE282A
- `Pescara.svg` — cores de referência #013765
- `Avellino.svg` — cores de referência #008633
- `Cesena.svg` — cores de referência #818181
- `Juve Stabia.svg` — cores de referência #FBCC33
- `Mantova.svg` — cores de referência #DC0619
- `Padova.svg` — cores de referência #E30613
- `Reggiana.svg` — cores de referência #752F2F
- `Carrarese.svg` — cores de referência #1879BF
- `Sudtirol.svg` — cores de referência #BB2026
- `Virtus Entella.svg` — cores de referência #9BD3F3

### Liga MX (México)

- `Club América.svg` — cores de referência #FFEB00
- `Tigres UANL.svg` — cores de referência #015DAA
- `Monterrey.svg` — cores de referência #0A2240
- `Cruz Azul.svg` — cores de referência #001F60
- `Toluca.svg` — cores de referência #D53741
- `CF Pachuca.svg` — cores de referência #162577
- `CD Guadalajara.svg` — cores de referência #002856
- `Club León.svg` — cores de referência #187B56
- `Club Tijuana.svg` — cores de referência #ED1B26
- `Pumas UNAM.svg` — cores de referência #132347
- `Atlas.svg` — cores de referência #EC1C24
- `Santos Laguna.svg` — cores de referência #008066
- `Atletico San Luis.svg` — cores de referência #2A2F61
- `FC Juárez.svg` — cores de referência #21CB35
- `Necaxa.svg` — cores de referência #E1001E
- `Club Querétaro.svg` — cores de referência #0056B3
- `Puebla.svg` — cores de referência #2B4B75
- `Atlante FC.svg` — cores de referência #111231

### Copa de Primera (Paraguai)

- `Cerro Porteño.svg` — cores de referência #081227
- `Libertad.svg` — cores de referência #000000
- `Olimpia.svg` — cores de referência #000000
- `Club Guaraní.svg` — cores de referência #FFCC00
- `Club Nacional.svg` — cores de referência #065697
- `2 de Mayo.svg` — cores de referência #203185
- `Deportivo Recoleta.svg` — cores de referência #D4AB49
- `Sportivo Trinidense.svg` — cores de referência #251981

### División Intermedia (Paraguai)

- `Sportivo Luqueño.svg` — cores de referência #003DA5
- `Sol de América.svg` — cores de referência #C8102E
- `Rubio Ñu.svg` — cores de referência #FFD100
- `River Plate.svg` — cores de referência #C8102E
- `Atlético Colegiales.svg` — cores de referência #0033A0
- `12 de Octubre.svg` — cores de referência #0B6E4F
- `Independiente de Campo Grande.svg` — cores de referência #C8102E
- `Tacuary.svg` — cores de referência #C8102E

### Liga1 (Peru)

- `Universitario.svg` — cores de referência #8C1619
- `Alianza Lima.svg` — cores de referência #192745
- `Sporting Cristal.svg` — cores de referência #56C7ED
- `FBC Melgar.svg` — cores de referência #EC1C24
- `Cienciano.svg` — cores de referência #0A214E
- `Cusco.svg` — cores de referência #CA9A56
- `Alianza Atletico.svg` — cores de referência #222677
- `Deportivo Garcilaso.svg` — cores de referência #ED0103

### Liga 2 (Peru)

- `César Vallejo.svg` — cores de referência #0B6E4F
- `Carlos A. Mannucci.svg` — cores de referência #003DA5
- `Universidad San Martín.svg` — cores de referência #0033A0
- `Unión Comercio.svg` — cores de referência #00A94F
- `Deportivo Coopsol.svg` — cores de referência #0033A0
- `Academia Cantolao.svg` — cores de referência #0B2E5C
- `Deportivo Llacuabamba.svg` — cores de referência #009639
- `Pirata FC.svg` — cores de referência #12161C

### Primeira Liga (Portugal)

- `FC Porto.svg` — cores de referência #003F87
- `Sporting CP.svg` — cores de referência #00804A
- `SL Benfica.svg` — cores de referência #E30613
- `SC Braga.svg` — cores de referência #D7141A
- `Vitória SC.svg` — cores de referência #1A1A1A
- `FC Famalicão.svg` — cores de referência #123C8C
- `FC Arouca.svg` — cores de referência #F2C400
- `Estoril Praia.svg` — cores de referência #FFD200
- `Casa Pia AC.svg` — cores de referência #111111
- `Gil Vicente.svg` — cores de referência #C8102E
- `Rio Ave FC.svg` — cores de referência #00843D
- `Estrela da Amadora.svg` — cores de referência #D50032
- `CD Santa Clara.svg` — cores de referência #D0021B
- `FC Alverca.svg` — cores de referência #0057A8
- `CD Nacional.svg` — cores de referência #000000
- `Moreirense FC.svg` — cores de referência #00843D
- `CS Marítimo.svg` — cores de referência #CE1126
- `Académico de Viseu.svg` — cores de referência #1A1A1A

### Liga Portugal 2 (Portugal)

- `AVS Futebol.svg` — cores de referência #D71920
- `CD Tondela.svg` — cores de referência #00924A
- `GD Chaves.svg` — cores de referência #0B3D91
- `FC Vizela.svg` — cores de referência #0055A4
- `Portimonense SC.svg` — cores de referência #111111
- `FC Paços de Ferreira.svg` — cores de referência #F7D117
- `SC Farense.svg` — cores de referência #111111
- `SCU Torreense.svg` — cores de referência #0057B8
- `Leixões SC.svg` — cores de referência #D71920
- `CD Feirense.svg` — cores de referência #0047AB
- `União de Leiria.svg` — cores de referência #D71920
- `FC Penafiel.svg` — cores de referência #C8102E
- `UD Oliveirense.svg` — cores de referência #F6C700
- `CF Os Belenenses.svg` — cores de referência #004B9B
- `Académica de Coimbra.svg` — cores de referência #111111
- `FC Felgueiras.svg` — cores de referência #C8102E
- `Lusitânia Lourosa.svg` — cores de referência #1D5A2E
- `Varzim SC.svg` — cores de referência #D71920

### Liga Uruguaya (Uruguai)

- `Nacional.svg` — cores de referência #003362
- `Peñarol.svg` — cores de referência #FFE600
- `Defensor Sporting.svg` — cores de referência #560090
- `Liverpool.svg` — cores de referência #004292
- `Boston River.svg` — cores de referência #EB3236
- `Montevideo City Torque.svg` — cores de referência #6CADDF
- `Racing de Montevideo.svg` — cores de referência #27682E
- `Albion FC.svg` — cores de referência #00306D
- `Juventud.svg` — cores de referência #2E5099

### Segunda División (Uruguai)

- `Rampla Juniors.svg` — cores de referência #C8102E
- `Deportivo Maldonado.svg` — cores de referência #FFD100
- `Central Español.svg` — cores de referência #C8102E
- `Sud América.svg` — cores de referência #FFD100
- `Rentistas.svg` — cores de referência #C8102E
- `Villa Española.svg` — cores de referência #0033A0
- `Uruguay Montevideo.svg` — cores de referência #0057B8
- `Atenas de San Carlos.svg` — cores de referência #C8102E
- `Tacuarembó.svg` — cores de referência #0033A0

### MLS (Estados Unidos)

- `Inter Miami.svg` — cores de referência #F7B5CD
- `Los Angeles FC.svg` — cores de referência #000000
- `Los Angeles Galaxy.svg` — cores de referência #00245D
- `Columbus Crew.svg` — cores de referência #FEDD00
- `FC Cincinnati.svg` — cores de referência #FE5000
- `Atlanta United.svg` — cores de referência #80000A
- `New York City FC.svg` — cores de referência #6CACE4
- `Orlando City.svg` — cores de referência #633492
- `Philadelphia Union.svg` — cores de referência #051C2C
- `San Diego FC.svg` — cores de referência #117DB6
- `Vancouver Whitecaps.svg` — cores de referência #00245E
- `Seattle Sounders.svg` — cores de referência #2CC84D
- `New York RB.svg` — cores de referência #ED1E36
- `Charlotte FC.svg` — cores de referência #0085CA
- `Minnesota United.svg` — cores de referência #8CD2F4
- `Nashville SC.svg` — cores de referência #ECE83A
- `FC Dallas.svg` — cores de referência #BF0D3E
- `Chicago Fire FC.svg` — cores de referência #FF0000
- `Austin FC.svg` — cores de referência #00B140
- `Houston Dynamo.svg` — cores de referência #F4911E
- `Portland Timbers.svg` — cores de referência #2C5234
- `Real Salt Lake.svg` — cores de referência #B30838
- `Sporting Kansas City.svg` — cores de referência #93B1D7
- `DC United.svg` — cores de referência #EF3E42
- `New England Revolution.svg` — cores de referência #0A2240
- `Colorado Rapids.svg` — cores de referência #960A2C
- `San Jose Earthquakes.svg` — cores de referência #0067B1
- `St. Louis City SC.svg` — cores de referência #E0004D
- `Toronto FC.svg` — cores de referência #B81137
- `CF Montreal.svg` — cores de referência #003DA5

### Liga FUTVE (Venezuela)

- `Caracas FC.svg` — cores de referência #EE3124
- `Deportivo Táchira FC.svg` — cores de referência #FCC708
- `Carabobo FC.svg` — cores de referência #51100E
- `Deportivo La Guaira.svg` — cores de referência #10032E
- `Puerto Cabello.svg` — cores de referência #272A83
- `Metropolitanos FC.svg` — cores de referência #342861
- `Monagas SC.svg` — cores de referência #15325A
- `UCV.svg` — cores de referência #FFC429

### Liga FUTVE 2 (Venezuela)

- `Mineros de Guayana.svg` — cores de referência #0B2E5C
- `Trujillanos.svg` — cores de referência #C8102E
- `Aragua.svg` — cores de referência #F5A800
- `Angostura.svg` — cores de referência #00A94F
- `Atlético El Vigía.svg` — cores de referência #0033A0
- `Real Frontera.svg` — cores de referência #C8102E
- `Marítimo de La Guaira.svg` — cores de referência #009639
- `Titanes.svg` — cores de referência #6A1B9A