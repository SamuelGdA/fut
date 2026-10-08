import type { Widen } from "../i18n";

/**
 * A capa do jornal da temporada (GDD 21.2): a mesma manchete abre a revelação
 * e a página do jornal no resumo. Cada ângulo tem pelo menos cinco manchetes e
 * três linhas de apoio, sorteadas em separado. Muitas vêm do jornal do v1
 * (D10), reescritas para a regra abaixo; as outras foram escritas para o v2.
 *
 * Marcadores: {surname}, {club}, {league}, {competition}, {award}, {year},
 * {age}, {rank}, {count} (títulos da temporada), {ovr}, {goals}, {assists},
 * {cleanSheets} (números crus, só onde o ângulo garante plural), {gamesText},
 * {goalsText}, {assistsText}, {cleanSheetsText}, {productionText} (gols, ou jogos
 * sem sofrer para goleiro), todos com o plural certo, e no
 * ângulo do recorde {record}, {holder}, {mark} (a marca real) e {value} (a do
 * jogador). Nome de clube, liga, país e competição nunca vem depois de artigo
 * nem de preposição que pede artigo: entra como sujeito ou depois de
 * dois-pontos.
 */
export const coverPt = {
  papers: [
    "Gazeta do Gol",
    "Diário do Escanteio",
    "Correio do Gramado",
    "Jornal da Arquibancada",
    "Folha da Pequena Área",
    "O Apito Final",
    "Tribuna da Várzea",
    "Revista do Meio-Campo",
  ],
  dateline: "Edição de {year}",
  angles: {
    perfect: {
      headlines: [
        "Tríplice coroa: {surname} conquista liga, copa e continente",
        "{surname} ganha tudo o que disputou",
        "Tudo o que dava para ganhar",
        "Liga, copa e continente: o ano perfeito de {surname}",
        "Não sobrou competição",
        "Varreu o ano: {count} taças",
      ],
      support: [
        "Liga, copa nacional e o principal torneio do continente na mesma temporada.",
        "Uma temporada para guardar na moldura.",
        "Uma temporada dessas um clube tem uma vez por geração, se tiver.",
        "Foram {count} taças, e as três que mais pesam estavam entre elas.",
      ],
    },
    worldChampion: {
      headlines: [
        "{surname} é campeão do mundo",
        "Copa do Mundo: {surname} levanta a taça",
        "O mundo é de {surname}",
        "Campeão do mundo aos {age}",
        "A estrela que faltava na camisa",
      ],
      support: [
        "O título mundial de {year} tem a assinatura de {surname}.",
        "A taça mais pesada do futebol volta para casa com ele.",
        "Aos {age} anos, ele entra para a lista mais curta do futebol: a dos campeões do mundo.",
      ],
    },
    bestInWorld: {
      headlines: [
        "{surname} é o melhor do mundo",
        "Bola de Ouro: {surname} chega ao topo",
        "A Bola de Ouro é dele",
        "O ano inteiro foi dele",
        "Prêmio máximo e pouca discussão",
        "O ano foi dele, e o troféu confirma",
      ],
      support: [
        "A eleição premia a melhor temporada do planeta.",
        "Nenhum jogador do planeta fez mais do que ele neste ano.",
        "O prêmio de melhor do mundo confirma o que o ano inteiro já vinha dizendo.",
        "Depois de uma temporada assim, escolher qualquer outro nome teria sido difícil de justificar.",
        "Aos {age}, levou o troféu individual que todo jogador quer.",
      ],
    },
    continentKing: {
      headlines: [
        "{competition}: {surname} é campeão",
        "{surname} conquista o continente",
        "Rei do continente",
        "Taça continental: e ele estava lá",
        "{competition}: missão cumprida",
        "{club}: a noite esperada a vida inteira",
      ],
      support: [
        "A taça mais cobiçada do continente muda de endereço.",
        "Noite de final, e a festa termina com a taça na mão.",
        "Uma campanha inteira para chegar a uma noite só, e {club} saiu dela com a taça.",
        "Aos {age} anos, o nome dele entra na lista dos campeões continentais.",
        "O continente inteiro assistiu, e foi {club} quem levantou a taça.",
      ],
    },
    collector: {
      headlines: [
        "{count} taças: {surname} enche a estante",
        "{surname} coleciona títulos em {year}",
        "{count} títulos. Uma só temporada.",
        "Colecionador: {count} títulos no ano",
        "Mais uma, e mais outra: {count} no total",
        "{club}: o armário não fecha mais",
      ],
      support: [
        "Poucos jogadores levantam tantos troféus numa temporada só.",
        "A sala de troféus vai precisar de mais espaço.",
        "Foram {count} títulos numa temporada só, e ele esteve em todos.",
        "Nem todas valem o mesmo, mas são {count} e estão todas na vitrine.",
        "{count} títulos numa só temporada: o tipo de ano que um clube conta para os netos.",
      ],
    },
    nationGlory: {
      headlines: [
        "{competition}: {surname} é campeão com a seleção",
        "A seleção é campeã, e {surname} brilha",
        "Campeão do continente com a camisa da seleção",
        "{surname} leva a seleção ao título",
        "Taça continental para a seleção de {surname}",
      ],
      support: [
        "O título com a camisa da seleção coroa o ano.",
        "A seleção volta para casa com a taça e com ele em destaque.",
        "Ganhar pela seleção tem outro peso: é o país inteiro que comemora.",
      ],
    },
    nationalChampion: {
      headlines: [
        "{league}: {surname} é campeão",
        "{surname} conquista o campeonato",
        "Campeão! {club} fica com a liga",
        "A taça voltou para casa",
        "Título nacional aos {age} anos",
        "{club} no topo, e ele no meio da festa",
      ],
      support: [
        "{club} termina a liga no topo da tabela.",
        "A campanha mais regular do país termina com a taça.",
        "Depois de um campeonato inteiro, {club} terminou onde queria: em primeiro.",
        "O título nacional chegou com {gamesText} dele na conta.",
      ],
    },
    honour: {
      headlines: [
        "{award} para {surname}",
        "{surname} recebe um prêmio de peso: {award}",
        "{award}: o prêmio tem dono",
        "O reconhecimento chegou: {award}",
        "{award}, enfim, nas mãos de {surname}",
      ],
      support: [
        "Os números da temporada falam por ele.",
        "O reconhecimento vem depois de um ano acima da média.",
        "Ninguém do campeonato chegou perto do que ele fez nesta temporada.",
      ],
    },
    bestOfCompetition: {
      headlines: [
        "{surname}, o craque da competição: {competition}",
        "Ninguém jogou mais: {surname} é eleito o craque",
        "Melhor jogador da competição: {surname}",
        "O prêmio de craque tem dono: {surname}",
        "{competition}: deu {surname}",
      ],
      support: [
        "Eleito o melhor jogador da competição: {competition}.",
        "Foram {gamesText} e {productionText} para convencer quem votou.",
        "A temporada acima de todos rendeu o prêmio de craque: {competition}.",
      ],
    },
    scoringTitle: {
      headlines: [
        "{surname} é o artilheiro: {competition}",
        "Ninguém fez mais gols que {surname}",
        "Artilharia garantida: {surname}",
        "O goleador da competição: {surname}",
        "{competition}: a artilharia é de {surname}",
      ],
      support: [
        "Ninguém marcou mais na competição: {competition}.",
        "Foram {goalsText} na temporada, e a artilharia veio junto.",
        "Faro de gol de sobra: artilheiro, {competition}.",
      ],
    },
    relegated: {
      headlines: [
        "{club} cai de divisão",
        "Rebaixamento: {club} não escapa",
        "Queda consumada. E agora?",
        "Segunda divisão: a conta chegou",
        "O ano em que tudo deu errado",
        "{club}: o ano que a torcida quer esquecer",
      ],
      support: [
        "Uma temporada para esquecer, com a segunda divisão no horizonte.",
        "O rebaixamento deixa marcas no elenco e na arquibancada.",
        "A queda doeu, e o esforço em campo não bastou para evitá-la.",
        "{club} desce, e o ano fica marcado pelo motivo errado.",
        "A temporada que prometia virou a mais dura da carreira.",
      ],
    },
    promoted: {
      headlines: [
        "{club} sobe de divisão",
        "Acesso: {club} sobe para a primeira divisão",
        "Primeira divisão, aí vamos nós",
        "Subiu!",
        "Missão cumprida: {club} sobe",
        "Acesso conquistado no grito",
      ],
      support: [
        "A próxima temporada é na primeira divisão.",
        "A festa do acesso toma conta da cidade.",
        "Uma temporada inteira na segunda divisão terminou do único jeito que interessava: subindo.",
        "O acesso veio no sufoco, e {club} chega aonde queria.",
      ],
    },
    almost: {
      headlines: [
        "{surname} fica no pódio da Bola de Ouro",
        "Quase: {surname} termina em {rank} na Bola de Ouro",
        "Entre os três melhores do mundo",
        "Bola de Ouro: {surname} é o {rank}",
        "{surname} bate na porta do topo do mundo",
      ],
      support: [
        "O prêmio escapou, mas o mundo inteiro viu.",
        "Ficar entre os três melhores do mundo já é feito raro.",
        "A temporada colocou o nome dele na conversa sobre o melhor do planeta.",
      ],
    },
    debut: {
      headlines: [
        "{surname} estreia na seleção",
        "Primeira convocação: {surname} veste a camisa da seleção",
        "A seleção chamou",
        "Convocado pela primeira vez",
        "O sonho da camisa da seleção virou real",
        "O técnico da seleção não teve como ignorar",
      ],
      support: [
        "Aos {age} anos, a estreia que todo garoto sonha.",
        "A primeira convocação ninguém esquece.",
        "A ligação que todo jogador espera a vida inteira chegou aos {age} anos.",
        "Depois de {gamesText} na temporada, o técnico da seleção não teve como continuar ignorando.",
      ],
    },
    cup: {
      headlines: [
        "{competition}: {surname} levanta a taça",
        "{surname} é campeão da copa",
        "Mata-mata até o fim, e a taça",
        "A copa veio",
        "Rodada a rodada, até levantar",
        "Copa conquistada, festa até de manhã",
      ],
      support: [
        "Mata-mata vencido, taça na mão.",
        "A copa termina com festa e volta olímpica.",
        "Mata-mata é outra coisa, e {club} aguentou até o último jogo.",
        "A copa veio, e ele estava lá em cada rodada que importou.",
      ],
    },
    superCup: {
      headlines: [
        "{competition}: {club} fica com a taça",
        "Jogo único, taça na mão",
        "Decisão em noventa minutos, e deu {club}",
        "Uma partida, um troféu",
        "Uma final, uma taça: {competition}",
      ],
      support: [
        "Uma partida decidiu, e {club} levou a taça.",
        "Não é a maior taça do calendário, mas é taça, e é dele.",
        "Título de jogo único: noventa minutos e pronto.",
      ],
    },
    trophy: {
      headlines: [
        "{competition}: mais uma taça para {surname}",
        "{surname} soma um título: {competition}",
        "{competition}: campeão!",
        "Taça na mão: {competition}",
        "{surname} fecha o ano com título: {competition}",
      ],
      support: [
        "Um troféu a mais na conta da temporada.",
        "Mais uma conquista para a coleção.",
        "Não é a taça mais famosa do continente, mas pesa na estante.",
      ],
    },
    record: {
      headlines: [
        "Recorde: {surname} supera {holder}",
        "{surname} entra para a história: {record}",
        "{value}: {surname} quebra uma marca histórica",
        "O recorde de {holder} caiu",
        "Nunca ninguém tinha chegado lá",
      ],
      support: [
        "A marca de {holder} era {mark}. Agora é dele: {value}.",
        "{record}: a maior marca do futebol de verdade tem um nome novo.",
        "Um número que ninguém tinha alcançado, nem {holder}.",
      ],
    },
    explosion: {
      headlines: [
        "{surname} explode e vira assunto",
        "A temporada da virada de {surname}",
        "Explodiu: OVR {ovr} aos {age}",
        "De onde saiu esse jogador?",
        "O salto que ninguém viu chegando",
        "Aos {age}, outro patamar",
      ],
      support: [
        "A evolução apareceu em cada jogo.",
        "O salto de rendimento chama a atenção de todo o país.",
        "OVR {ovr} aos {age}: o salto que muda o preço e o tamanho de uma carreira.",
        "Entrou no ano como promessa e saiu como titular indiscutível.",
      ],
    },
    scorer: {
      headlines: [
        "{goalsText}: {surname} não para de marcar",
        "{surname} vira máquina de gols",
        "{goals} gols. Só isso.",
        "A temporada dos {goals} gols",
        "O goleiro adversário não dormiu este ano",
        "A artilharia não parou",
      ],
      support: [
        "Poucos atacantes balançam a rede tantas vezes num ano.",
        "A artilharia virou rotina.",
        "{goals} gols em {gamesText}: o tipo de temporada que muda o preço de um jogador.",
        "Cada zaga do campeonato passou por ele, e o placar contou a história.",
      ],
    },
    playmaker: {
      headlines: [
        "{assists} assistências: o cérebro do time",
        "Tudo passa pelos pés de {surname}",
        "O garçom da temporada",
        "{assists} passes que viraram gol",
        "O último passe era sempre dele",
        "Quem joga com {surname} marca mais",
      ],
      support: [
        "Não foram os gols dele que decidiram, foram os que ele deu.",
        "{assistsText}: quando o time criou alguma coisa, quase sempre passou por ele.",
        "Não foi o artilheiro, foi quem fez o artilheiro existir.",
      ],
    },
    wall: {
      headlines: [
        "{cleanSheetsText}: {surname} fecha o gol",
        "{surname} vira muralha",
        "{cleanSheets} jogos sem sofrer gol",
        "Passar por ele? Boa sorte.",
        "O ano em que a meta ficou fechada",
        "Defender virou rotina",
      ],
      support: [
        "Poucos goleiros passam tanto tempo sem buscar a bola no fundo da rede.",
        "Os atacantes do país passaram o ano tentando, sem sucesso.",
        "{cleanSheets} jogos sem levar gol: a temporada foi construída de trás para frente.",
      ],
    },
    injured: {
      headlines: [
        "Lesão tira {surname} de boa parte da temporada",
        "{surname} passa o ano no departamento médico",
        "Ano perdido no departamento médico",
        "Mais tempo na maca do que em campo",
        "A temporada que a lesão roubou",
      ],
      support: [
        "Os jogos perdidos pesaram no resultado do ano.",
        "A recuperação vira a prioridade para o próximo ano.",
        "Foram mais semanas de tratamento do que de treino, um ano que a carreira vai querer esquecer.",
        "A temporada existiu no papel, mas quase não existiu em campo.",
      ],
    },
    suspended: {
      headlines: [
        "{surname} passa a temporada suspenso",
        "Suspensão deixa {surname} longe dos gramados",
        "Um ano de arquibancada",
        "Punição pesada: {surname} fora de campo",
        "O gancho que custou uma temporada",
      ],
      support: [
        "Um ano inteiro sem entrar em campo.",
        "A volta aos gramados vira contagem regressiva.",
        "O calendário passou, e ele assistiu de fora.",
      ],
    },
    prospect: {
      headlines: [
        "Aos {age}, {surname} ainda é aposta da base",
        "{surname} treina com os profissionais e espera a vez",
        "A promessa espera a chance",
        "Paciência: {surname} ainda é garoto",
        "O futuro ainda está no banco",
      ],
      support: [
        "A vaga no time de cima ainda não chegou, e a idade está do lado dele.",
        "Os profissionais já olham para ele; falta só a chance.",
        "Por enquanto, {gamesText} e muito treino.",
      ],
    },
    forgotten: {
      headlines: [
        "{surname} some do time",
        "Pouco espaço para {surname}: {gamesText} no ano",
        "Esquecido no banco",
        "Fora dos planos",
        "O banco virou endereço fixo",
      ],
      support: [
        "Sem minutos, a temporada passou longe dele.",
        "O banco de reservas virou endereço fixo.",
        "Seja qual for o motivo, ele saiu dos planos do treinador.",
      ],
    },
    newAddress: {
      headlines: [
        "{club} apresenta {surname}",
        "{surname} troca de clube e começa do zero",
        "Chegou, jogou, e agora?",
        "Primeira temporada, primeiras impressões",
        "Vida nova: {club}",
      ],
      support: [
        "Primeira temporada com a camisa nova.",
        "Camisa nova, torcida nova, tudo para provar.",
        "Gramado novo, vestiário novo, e uma torcida ainda formando opinião.",
        "Foram {gamesText} para entender o lugar novo.",
      ],
    },
    lastDance: {
      headlines: [
        "Aos {age}, {surname} segue em campo",
        "A última dança de {surname}?",
        "A última dança",
        "Quantos anos ainda restam?",
        "Aos {age}, ainda em campo",
      ],
      support: [
        "A idade pesa, mas a bola ainda o procura.",
        "Cada jogo pode ser o último, e ele joga como se fosse.",
        "O corpo cobra mais caro a cada ano, mas a vontade continua ali.",
      ],
    },
    fading: {
      headlines: [
        "{surname} perde força",
        "O auge ficou para trás para {surname}?",
        "O declínio começou?",
        "Não é mais o mesmo",
        "O tempo cobra",
        "Os números caíram, e todo mundo viu",
      ],
      support: [
        "A queda de rendimento acende o alerta.",
        "Os números caem, e a idade começa a pesar.",
        "As pernas não respondem como respondiam, e o clube já começou a olhar para os mais novos.",
        "Pela primeira vez, a pergunta sobre o fim apareceu.",
      ],
    },
    steady: {
      headlines: [
        "{surname} cumpre mais uma temporada",
        "Temporada de trabalho para {surname}",
        "Mais um ano de trabalho",
        "Nem herói, nem vilão",
        "Sem manchete, mas com minutos",
        "O ano passou, e a vida segue",
      ],
      support: [
        "Sem manchete grande, mas com a carreira andando.",
        "Mais um ano somando jogos e experiência.",
        "{gamesText}, {productionText}, e a rotina de quem faz o trabalho sem virar manchete.",
        "Sem grandes emoções nesta temporada, o que, para um profissional, não é o pior resultado.",
      ],
    },
  },
} as const;

export type CoverMessages = Widen<typeof coverPt>;
