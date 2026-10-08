import type { Widen } from "../i18n";

/**
 * Os textos dos eventos de carreira, pela chave do catálogo do motor
 * (`EVENT_CATALOG`). Cada opção tem o rótulo do botão e o texto do resultado:
 * `success` e `failure` nas arriscadas, `result` nas outras.
 *
 * Marcadores: {club} (clube atual), {target} (clube de destino da opção),
 * {rivalClub} (rival histórico do clube), {position}, {country}, {number}. Nome de clube e de país nunca vem depois
 * de artigo: o gênero muda de um para outro.
 */
export const eventsPt = {
  extraTraining: {
    title: "Treino extra",
    body: "O preparador físico propõe um programa à parte: academia antes do sol nascer e finalização depois do treino do time.",
    options: {
      push: {
        label: "Encarar o programa",
        success: "O corpo respondeu. Você começa a temporada mais forte do que nunca.",
        failure: "O excesso cobrou a conta. O cansaço tira você de alguns jogos.",
      },
      routine: { label: "Manter a rotina", result: "Você segue o plano do clube, sem atalhos." },
    },
  },
  personalCoach: {
    title: "Treinador particular",
    body: "Um treinador conhecido por lapidar jovens oferece trabalho individual, pago do seu bolso.",
    options: {
      hire: {
        label: "Contratar",
        success: "Os treinos em dobro aparecem em campo. Você evolui e ganha detalhes novos no jogo.",
        failure: "O técnico do clube não aceita treino por fora e deixa você no banco. O dinheiro e o tempo foram embora.",
      },
      decline: { label: "Recusar", result: "Você confia no trabalho do clube." },
    },
  },
  supplement: {
    title: "O suplemento",
    body: "Um conhecido do vestiário oferece um suplemento importado. Promete recuperação na metade do tempo e jura que é liberado.",
    options: {
      take: {
        label: "Tomar",
        success: "Nenhum exame acusou nada, e a recuperação mais rápida deixa você um degrau acima.",
        failure: "O antidoping deu positivo. Uma temporada de suspensão e o seu nome estampado nos jornais.",
      },
      refuse: { label: "Recusar", result: "Você recusa. Meses depois, dois colegas caem no antidoping." },
    },
  },
  loadManagement: {
    title: "Gestão de carga",
    body: "O departamento médico vê sinais de desgaste e sugere poupar você em alguns jogos.",
    options: {
      rest: { label: "Aceitar o rodízio", result: "Menos jogos, menos risco. O corpo agradece, e a evolução anda um pouco mais devagar." },
      playAll: { label: "Jogar tudo", result: "Você joga todas. Mais gols e mais chances, com o corpo no limite." },
    },
  },
  newRole: {
    title: "Nova função",
    body: "O treinador vê você rendendo mais como {position} e garante a vaga de titular se você topar a mudança.",
    options: {
      accept: { label: "Topar a mudança", result: "Nova posição, vaga garantida. O resto depende de você." },
      refuse: { label: "Manter a posição", result: "Você mantém a posição de origem, mas perde espaço com o treinador." },
    },
  },
  rivalSigned: {
    title: "Concorrência na posição",
    body: "O clube contratou um jogador badalado para a sua posição. A imprensa já fala em troca de titular.",
    options: {
      fight: {
        label: "Brigar pela vaga",
        success: "Você segura a posição, e a torcida adora a resposta em campo.",
        failure: "O recém-chegado ganha a disputa. Você começa a temporada no banco.",
      },
      leave: { label: "Aceitar outra proposta", result: "Você pede para sair. {target} fecha com você." },
    },
  },
  captaincy: {
    title: "A braçadeira",
    body: "O capitão vai embora e o treinador quer você com a braçadeira.",
    options: {
      accept: { label: "Aceitar", result: "Capitão. A torcida aplaude, e a cobrança cresce junto." },
      decline: { label: "Recusar", result: "Você prefere liderar sem a braçadeira." },
    },
  },
  seasonPriority: {
    title: "Prioridade da temporada",
    body: "O elenco não aguenta tudo. O treinador pergunta o que vem primeiro.",
    options: {
      league: { label: "A liga", result: "Força máxima no campeonato nacional. O continental fica em segundo plano." },
      continent: { label: "O continental", result: "Todas as fichas no torneio continental. Na liga, time misto." },
    },
  },
  rivalCalls: {
    title: "O rival chama",
    body: "{rivalClub}, o maior rival, quer você. A proposta é boa, mas a torcida nunca perdoaria.",
    options: {
      sign: { label: "Assinar com o rival", result: "Você atravessa a rua. {target} comemora; a sua antiga torcida, não." },
      stay: { label: "Ficar", result: "Você recusa o rival, e a torcida canta o seu nome." },
    },
  },
  financialCrisis: {
    title: "Crise financeira",
    body: "O clube atrasa salários e precisa vender. Há uma proposta na mesa.",
    options: {
      accept: { label: "Aceitar a venda", result: "{target} paga à vista, e você troca de clube." },
      stay: {
        label: "Ficar e ajudar",
        result: "Você fica e abre mão de parte do salário. O time enfraquece, mas a torcida não esquece o gesto.",
      },
    },
  },
  numberTen: {
    title: "A camisa 10",
    body: "A 10 ficou livre, e a diretoria oferece a camisa para você.",
    options: {
      wear: { label: "Vestir a 10", result: "A 10 é sua. Com ela vêm os holofotes e a cobrança." },
      keep: { label: "Manter o número", result: "Você prefere o número que já é seu." },
    },
  },
  homesick: {
    title: "Saudade de casa",
    body: "Três anos longe de casa pesam. Um clube do seu país quer você de volta.",
    options: {
      goHome: { label: "Voltar para casa", result: "{target} acerta a sua volta. É bom estar perto da família." },
      stay: { label: "Aguentar firme", result: "Você fica, mas a cabeça nem sempre está no jogo." },
    },
  },
  tattoo: {
    title: "A tatuagem",
    body: "Um tatuador famoso oferece uma peça enorme nas costas, às vésperas da temporada.",
    options: {
      doIt: {
        label: "Fazer",
        success: "A tatuagem viraliza, e a torcida adora.",
        failure: "Infeccionou. Você perde metade da temporada se recuperando.",
      },
      skip: { label: "Deixar para as férias", result: "Fica para depois." },
    },
  },
  taxes: {
    title: "Problema com o fisco",
    body: "A Receita aponta erros nas suas declarações dos últimos anos, e os jornais já sabem.",
    options: {
      settle: { label: "Fazer acordo", result: "Você paga e encerra o caso, mas a imagem arranha." },
      fight: {
        label: "Brigar na Justiça",
        success: "Absolvido. Você sai fortalecido.",
        failure: "Condenado. Meia temporada afastado e a imagem no chão.",
      },
    },
  },
  passport: {
    title: "O passaporte do avô",
    body: "Seu avô nasceu fora, e a seleção daquele país quer você: {country}.",
    options: {
      switch: { label: "Aceitar a convocação", result: "Novo passaporte, nova seleção: {country}." },
      keep: { label: "Ficar com a sua seleção", result: "Você mantém a camisa do país onde nasceu." },
    },
  },
  residencePassport: {
    title: "Uma nova seleção",
    body: "Depois de cinco temporadas no país, a seleção de {country} quer convocar você. Aceitar muda sua nacionalidade no jogo.",
    options: {
      switch: { label: "Aceitar a nova nacionalidade", result: "Você passa a representar {country}." },
      keep: { label: "Manter minha nacionalidade", result: "Você mantém sua nacionalidade e espera a sua seleção." },
    },
  },
  diploma: {
    title: "O diploma",
    body: "A família insiste: terminar os estudos antes de pensar só na bola.",
    options: {
      study: { label: "Terminar os estudos", result: "Diploma na mão. Menos treino reduz a evolução em 10% e o risco de lesão em 30% neste período." },
      football: { label: "Só futebol", result: "Você treina mais: evolução 10% maior, mas risco de lesão 30% maior neste período." },
    },
  },
  dressingRoomRift: {
    title: "Racha no vestiário",
    body: "O elenco rachou em dois grupos, e os dois querem você do lado deles.",
    options: {
      takeSide: {
        label: "Tomar partido",
        success: "Você escolheu o lado vencedor. Ganha espaço e o respeito da torcida.",
        failure: "O seu grupo perdeu a queda de braço. Você paga com minutos.",
      },
      neutral: { label: "Ficar neutro", result: "Você não se mete. Ninguém agradece, ninguém cobra." },
    },
  },
  comeback: {
    title: "A volta do ídolo",
    body: "{target} quer você de volta, onde a sua história já está escrita.",
    options: {
      return: { label: "Voltar", result: "A volta do ídolo. Estádio cheio e vaga garantida." },
      stay: { label: "Seguir onde está", result: "Você agradece o carinho e segue o seu caminho." },
    },
  },
  clubOrCountry: {
    title: "Clube ou seleção",
    body: "O torneio da seleção bate com a reta final do clube. Os dois querem você inteiro.",
    options: {
      tournament: {
        label: "Ir com a seleção",
        success: "Você vai ao torneio e volta inteiro.",
        failure: "Você vai ao torneio, mas volta baleado e perde jogos pelo clube.",
      },
      club: { label: "Ficar com o clube", result: "Você abre mão do torneio. A torcida do clube reconhece." },
    },
  },
  painBeforeFinal: {
    title: "Dor antes da final",
    body: "Uma dor na coxa aparece na semana da final. Os médicos dizem que o risco é seu.",
    options: {
      sacrifice: {
        label: "Jogar no sacrifício",
        success: "Você joga no limite e decide. Título e nome na história.",
        failure: "A coxa não aguentou. Final perdida e semanas fora.",
      },
      rest: { label: "Poupar o corpo", result: "Você assiste do banco. Sem você, o time perde a final." },
    },
  },
  muscleInjury: {
    title: "Lesão muscular",
    body: "Uma lesão na coxa no fim da pré-temporada. O clube quer pressa; os médicos, calma.",
    options: {
      rushBack: {
        label: "Voltar antes",
        success: "Você voltou rápido e perdeu pouca coisa.",
        failure: "Voltou cedo demais, e a lesão abriu de novo. Mais tempo fora, e o corpo sentiu.",
      },
      fullRecovery: { label: "Recuperar com calma", result: "Recuperação completa. Você perde mais jogos, mas volta inteiro." },
    },
  },
  decisivePenalty: {
    title: "O pênalti decisivo",
    body: "Final, disputa de pênaltis, última cobrança. O treinador olha para você.",
    options: {
      take: {
        label: "Bater",
        success: "Gol. Você decide o título.",
        failure: "Defendido. A taça fica com o adversário, e a torcida não esquece.",
      },
      leave: {
        label: "Deixar para outro",
        success: "Outro bate e converte. O título é do time, e você comemora junto.",
        failure: "Outro bate e o goleiro defende. A taça escapa, mas ninguém aponta para você.",
      },
    },
  },
  newCoach: {
    title: "Treinador novo",
    body: "Chegou um treinador com ideias próprias. Ninguém tem vaga garantida.",
    options: {
      impress: {
        label: "Mostrar serviço",
        success: "Você convence o novo treinador e ganha espaço.",
        failure: "Ele tem outros planos. Você perde espaço no time.",
      },
      leave: { label: "Procurar outro clube", result: "{target} fecha com você antes da estreia do novo treinador." },
    },
  },
  derby: {
    title: "Semana de clássico",
    body: "Clássico contra {rivalClub}. A imprensa quer uma frase forte.",
    options: {
      provoke: {
        label: "Provocar",
        success: "Você provocou e decidiu. Virou herói da torcida.",
        failure: "Provocou e sumiu no jogo. A torcida não perdoa.",
      },
      fairPlay: { label: "Respeitar o rival", result: "Você fala em respeito, e a torcida aprova o tom." },
    },
  },
  idolFarewell: {
    title: "Despedida do ídolo",
    body: "O maior ídolo do clube se aposenta e escolhe você para receber a homenagem no jogo de despedida.",
    options: {
      honor: { label: "Aceitar a homenagem", result: "Você assume o lugar simbólico do ídolo. A torcida abraça, e a cobrança cresce." },
      discreet: { label: "Ficar discreto", result: "Você agradece e deixa o palco para ele." },
    },
  },
  agentUltimatum: {
    title: "Ultimato do empresário",
    body: "O seu empresário tem a proposta de um clube maior e ameaça romper se você não forçar a saída.",
    options: {
      force: {
        label: "Forçar a saída",
        result: "Você força a barra e sai. {target} ganha um reforço; a sua antiga torcida, uma mágoa.",
      },
      stay: { label: "Ficar", result: "Você fica e ganha o apoio da torcida, mas o empresário rompe. Só a próxima decisão terá propostas de clubes mais fracos, se houver transferência; depois o mercado volta ao normal." },
    },
  },
  academyJewel: {
    title: "A joia da base",
    body: "Um garoto da base joga na sua posição e pede para treinar ao seu lado.",
    options: {
      mentor: { label: "Apadrinhar", result: "Você ensina tudo o que sabe. A torcida adora, e o seu tempo de treino diminui." },
      compete: { label: "Disputar a vaga", success: "Você ganha a disputa e mais espaço no time.", failure: "O garoto leva a melhor. Você perde espaço no time." },
    },
  },
  bootDeal: {
    title: "Contrato de chuteira",
    body: "Uma marca esportiva quer você na campanha principal, com chuteira colorida e comercial na TV.",
    options: {
      flashy: { label: "Topar a campanha", result: "Você vira rosto de campanha. Mais fama, mais cobrança." },
      discreet: { label: "Manter a discrição", result: "Você prefere chuteira preta e poucas entrevistas." },
    },
  },
  podcast: {
    title: "O podcast",
    body: "O podcast mais ouvido do país convida você para uma entrevista sem filtro.",
    options: {
      speak: {
        label: "Falar tudo",
        success: "Você foi sincero na medida certa. A entrevista viraliza a seu favor.",
        failure: "Uma frase fora de contexto vira polêmica. A torcida torce o nariz.",
      },
      decline: { label: "Recusar", result: "Você prefere falar em campo." },
    },
  },
  newAgent: {
    title: "Novo empresário",
    body: "Um empresário de peso promete abrir portas pelo mundo.",
    options: {
      change: {
        label: "Trocar de empresário",
        success: "Os contatos dele aquecem o mercado. Mais clubes perguntam por você.",
        failure: "Muita promessa, pouco resultado. O mercado esfria.",
      },
      keep: { label: "Manter o atual", result: "Você fica com quem está ao seu lado desde o começo." },
    },
  },
  packedStadium: {
    title: "Estádio lotado",
    body: "Casa cheia e transmissão para o mundo todo. É a chance de aparecer.",
    options: {
      showboat: {
        label: "Jogar para a torcida",
        success: "Você ganha espaço com atuações seguras. A torcida reconhece.",
        failure: "Você se expõe demais e perde espaço no time.",
      },
      focused: { label: "Jogar simples", result: "Você joga o simples e cumpre a função." },
    },
  },
  redCard: {
    title: "Expulsão",
    body: "Um vermelho direto num lance duro. O tribunal vai julgar a suspensão.",
    options: {
      appeal: {
        label: "Recorrer",
        success: "Pena reduzida. Você perde só um jogo.",
        failure: "O recurso irritou o tribunal, e a suspensão aumentou.",
      },
      accept: { label: "Aceitar a punição", result: "Você cumpre a suspensão padrão e segue em frente." },
    },
  },
  boos: {
    title: "Vaias",
    body: "A torcida vaia cada toque seu. O clima ficou pesado.",
    options: {
      fight: {
        label: "Dar a volta por cima",
        result: "Você encara as vaias. O começo é difícil, mas a torcida percebe o esforço.",
      },
      leave: { label: "Pedir para sair", result: "{target} oferece um recomeço, e você aceita." },
    },
  },
  rowCoach: {
    title: "Briga com o treinador",
    body: "Um bate-boca com o treinador vazou para a imprensa.",
    options: {
      standGround: {
        label: "Manter a posição",
        success: "O vestiário fica do seu lado. A torcida também.",
        failure: "O treinador vence a queda de braço. Você vai para o banco.",
      },
      apologize: { label: "Pedir desculpas", result: "Você pede desculpas em público. Fica um arranhão na imagem." },
    },
  },
  rowBoard: {
    title: "Briga com a diretoria",
    body: "Você criticou a diretoria em público, e o presidente exige retratação.",
    options: {
      standGround: {
        label: "Não recuar",
        success: "A torcida apoia você, e a diretoria recua.",
        failure: "A diretoria não perdoa. Você é vendido, e o clube fecha as portas para sempre.",
      },
      apologize: { label: "Retratar-se", result: "Você recua. Fica um arranhão na imagem." },
    },
  },
  rowFans: {
    title: "Briga com a torcida",
    body: "Uma organizada cerca você na saída do treino. Os ânimos estão à flor da pele.",
    options: {
      provoke: {
        label: "Enfrentar",
        success: "Você encara e conquista o respeito da arquibancada.",
        failure: "A torcida declara guerra. Você é posto para fora do clube e nunca mais volta.",
      },
      apologize: { label: "Pedir desculpas", result: "Você baixa o tom, e a relação melhora um pouco." },
    },
  },
  prestigeShirt: {
    title: "Número de peso",
    body: "Um número histórico da sua posição ficou livre no clube.",
    options: {
      number: { label: "Vestir a {number}", result: "A {number} é sua. Número pesado, cobrança junto." },
      keep: { label: "Manter o número", result: "Você fica com o número de sempre." },
    },
  },
  homage: {
    title: "Homenagem",
    body: "O clube quer eternizar a sua história e deixa você escolher o número da camisa.",
    options: {
      number: { label: "Vestir a {number}", result: "A {number} agora conta a sua história no clube." },
    },
  },
  seriousInjury: {
    title: "Lesão grave",
    body: "Ligamento rompido. Há dois caminhos para a recuperação.",
    options: {
      aggressive: { label: "Cirurgia e volta rápida", result: "Você volta antes, mas o joelho nunca mais é o mesmo." },
      conservative: {
        label: "Tratamento conservador",
        result: "A recuperação é longa. Você perde boa parte da temporada, mas preserva o corpo.",
      },
    },
  },
} as const;

export type EventsMessages = Widen<typeof eventsPt>;
