import type { Widen } from "../i18n";

/**
 * Os textos de jogo do Técnico (GDD 42), pelas chaves do motor
 * (`@craque/engine/coach`): eventos fora de campo, decisões no meio da
 * partida, conversas do vestiário, reunião, pedido de verba, objetivos,
 * motivos das barras, momentos e avaliação.
 *
 * O texto conta a cena; os números de cada opção (satisfação, dinheiro,
 * promessa, chance) a tela mostra ao lado, lidos dos efeitos do motor. Assim
 * o texto nunca promete um efeito que a opção não tem.
 *
 * Marcadores: {player} (jogador envolvido), {club} (clube do treinador),
 * {buyer} (clube interessado), {rival} (rival da semana), {amount}, {price},
 * {raise}, {cost} (valores já formatados), {injured} (lesionados),
 * {opponent}, {minute}, {score}, {competition}. Nome de clube nunca vem depois
 * de artigo: o gênero muda de um para outro.
 */
export const coachPt = {
  events: {
    captainVoice: {
  "title": "Voz do capitão",
  "body": "{player} quer que os veteranos participem das decisões do vestiário. Os jovens também querem ser ouvidos.",
  "options": {
    "listen": {
      "label": "Ouvir os veteranos",
      "result": "O veterano se sente valorizado, mas os jovens ficam em segundo plano."
    },
    "shared": {
      "label": "Dividir a palavra",
      "success": "O diálogo aproximou o grupo.",
      "failure": "O veterano sente que perdeu espaço."
    }
  }
},
    benchPlan: {
  "title": "Um lugar no plano",
  "body": "{player} quer saber quando terá minutos. Dar uma data ajuda, mas cria uma cobrança real.",
  "options": {
    "rotate": {
      "label": "Prometer titularidade no segundo turno",
      "result": "Ele deve estar nos titulares ao iniciar a simulação do segundo turno. A escolha é sua."
    },
    "compete": {
      "label": "Pedir disputa pela vaga",
      "success": "Ele aceita competir e melhora o rendimento.",
      "failure": "A resposta frustra o jogador."
    }
  }
},
    academyBridge: {
  "title": "Ponte com a base",
  "body": "{player} pede mais integração entre os jovens e os titulares. O tempo de treino é limitado.",
  "options": {
    "integrate": {
      "label": "Misturar os grupos",
      "result": "Os jovens se aproximam do time; os titulares perdem atenção exclusiva."
    },
    "individual": {
      "label": "Treino extra com a comissão",
      "result": "O treino de meio melhora, com um gasto na verba."
    }
  }
},
    trainingTempo: {
  "title": "Ritmo de trabalho",
  "body": "A comissão propõe uma semana mais intensa para os titulares. O grupo também pede tempo para recuperar.",
  "options": {
    "intense": {
      "label": "Aumentar a intensidade",
      "success": "Os titulares responderam bem à intensidade.",
      "failure": "A carga pesou e a fase dos titulares caiu."
    },
    "light": {
      "label": "Aliviar a carga",
      "result": "O elenco fica mais satisfeito, com menos intensidade em campo."
    }
  }
},
    setPieceLab: {
  "title": "Laboratório de bola parada",
  "body": "Há tempo para um bloco extra de treino. Priorizar uma área deixa outra sem a mesma atenção.",
  "options": {
    "attack": {
      "label": "Ensaiar jogadas de ataque",
      "result": "O ataque ganha preparação; os reservas sentem falta de atenção."
    },
    "defend": {
      "label": "Ajustar a defesa",
      "result": "A defesa fica mais preparada, mas o treino extra pesa nos titulares."
    }
  }
},
    openTraining: {
  "title": "Portões abertos",
  "body": "A torcida pede para assistir a um treino. Abrir aproxima o clube, mas aumenta a exposição dos titulares.",
  "options": {
    "open": {
      "label": "Abrir o treino",
      "success": "O treino aberto aproxima torcida e elenco.",
      "failure": "A exposição trouxe cobrança e tirou tranquilidade dos titulares."
    },
    "closed": {
      "label": "Manter os portões fechados",
      "result": "O time trabalha o meio em privado; a torcida sente a distância."
    }
  }
},
    pressStrategy: {
  "title": "A pergunta da coletiva",
  "body": "A imprensa quer uma declaração sobre o elenco. Sua resposta pode proteger o grupo ou aumentar a cobrança.",
  "options": {
    "shield": {
      "label": "Assumir a pressão",
      "result": "O elenco se sente protegido; a diretoria queria mais cobrança."
    },
    "challenge": {
      "label": "Desafiar o time em público",
      "success": "Os titulares responderam e a torcida gostou.",
      "failure": "A cobrança pública caiu mal entre os titulares."
    }
  }
},
    videoRoom: {
  "title": "Sala de vídeo",
  "body": "A comissão separou vídeos para corrigir a defesa. Uma sessão coletiva exige mais tempo de todos.",
  "options": {
    "collective": {
      "label": "Rever com todo o elenco",
      "result": "A defesa ganha preparação; o elenco reclama do tempo extra."
    },
    "private": {
      "label": "Conversas individuais",
      "success": "Os titulares assimilaram os ajustes.",
      "failure": "As mensagens individuais não encaixaram."
    }
  }
},
    veteranSchedule: {
  "title": "Rotina do veterano",
  "body": "{player} pede uma rotina de trabalho adaptada à idade. O restante do elenco observa o tratamento.",
  "options": {
    "adapt": {
      "label": "Adaptar a rotina",
      "result": "O veterano rende melhor; o grupo questiona o privilégio."
    },
    "equal": {
      "label": "Manter a mesma rotina",
      "success": "O elenco aprova a regra igual para todos.",
      "failure": "A carga pesou no veterano e o deixou frustrado."
    }
  }
},
    starResponsibility: {
  "title": "Responsabilidade da estrela",
  "body": "{player} pode assumir mais responsabilidade na preparação dos jogos. Mais protagonismo também traz pressão.",
  "options": {
    "lead": {
      "label": "Dar protagonismo",
      "success": "A estrela cresce com a responsabilidade e envolve o grupo.",
      "failure": "A nova responsabilidade pesou no jogador."
    },
    "protect": {
      "label": "Proteger da cobrança",
      "result": "O jogador se sente apoiado; a torcida queria mais liderança."
    }
  }
},
    squadWorkshop: {
  "title": "Tempo para o grupo",
  "body": "Uma atividade fora do campo pode aproximar o elenco. Ela usa parte da verba e ocupa um bloco de trabalho.",
  "options": {
    "bond": {
      "label": "Investir na convivência",
      "result": "O grupo se aproxima. O custo sai da verba disponível."
    },
    "work": {
      "label": "Usar o tempo para treinar",
      "result": "O meio ganha preparação; o elenco sente falta da atividade."
    }
  }
},
    rotationPolicy: {
  "title": "Critério de escalação",
  "body": "Titulares e reservas querem entender a prioridade do seu plano. Escolha quem recebe atenção extra nesta etapa.",
  "options": {
    "merit": {
      "label": "Valorizar os titulares",
      "result": "Os titulares se sentem valorizados; os reservas ficam contrariados."
    },
    "depth": {
      "label": "Preparar os reservas",
      "result": "Os reservas ganham confiança; os titulares sentem a concorrência."
    }
  }
},
    youngPressure: {
  "title": "Holofotes sobre o jovem",
  "body": "{player} chamou a atenção da imprensa nos treinos. A exposição pode motivar ou pesar.",
  "options": {
    "protect": {
      "label": "Poupar da exposição",
      "result": "O jovem fica mais tranquilo; a torcida queria conhecê-lo melhor."
    },
    "spotlight": {
      "label": "Dar espaço na imprensa",
      "success": "A atenção motivou o jovem e animou a torcida.",
      "failure": "A exposição atrapalhou o rendimento e a confiança do jovem."
    }
  }
},
    unhappyStar: {
      title: "Titular insatisfeito",
      body: "{player} pediu uma conversa. Diz que não está feliz e que a cabeça já não está no clube.",
      options: {
        promise: { label: "Prometer titularidade no segundo turno", result: "Ele sai da sala mais leve. Agora a promessa precisa ser cumprida." },
        raise: { label: "Oferecer aumento", result: "O aumento acalma o jogador, e a conta chega no fim do mês." },
        firm: {
          label: "Ser firme",
          success: "Ele entende o recado e o grupo gosta da postura.",
          failure: "A conversa azedou. Ele pede para ser negociado.",
        },
      },
    },
    wantsOut: {
      title: "Pedido para sair",
      body: "{player} recebeu uma proposta de {buyer} ({price}) e quer ir embora.",
      options: {
        sell: { label: "Liberar a venda", result: "Negócio fechado. O vestiário respeita a decisão." },
        refuse: {
          label: "Recusar a proposta",
          success: "Ele aceita ficar, contrariado, mas sem confusão.",
          failure: "Ele fica, mas o clima pesa no vestiário.",
        },
        promise: { label: "Prometer titularidade no segundo turno", result: "Ele topa ficar se jogar. A promessa entra na lista." },
      },
    },
    youthShines: {
      title: "Joia da base",
      body: "{player} está voando nos treinos. A comissão técnica acha que é hora de dar uma chance.",
      options: {
        chance: { label: "Prometer titularidade no segundo turno", result: "A torcida gosta de ver a base. Agora ele espera jogar." },
        praise: {
          label: "Elogiar em público",
          success: "O garoto cresce com a confiança.",
          failure: "A pressão subiu à cabeça e ele caiu de rendimento.",
        },
        patience: { label: "Pedir paciência", result: "Os titulares aprovam; o garoto fica chateado." },
      },
    },
    injuryCrisis: {
      title: "Crise de lesões",
      body: "São {injured} jogadores no departamento médico. O fisiologista pede investimento para acelerar as recuperações.",
      options: {
        medical: { label: "Investir no departamento médico ({cost})", result: "Cada recuperação diminui em um turno." },
        rotate: { label: "Rodar o elenco", result: "Reservas ganham moral e o meio treina, mas os titulares se sentem preteridos." },
      },
    },
    derbyWeek: {
      title: "Semana de clássico",
      body: "Vem aí o clássico contra {rival}. A cidade não fala de outra coisa.",
      options: {
        fire: {
          label: "Inflamar o time",
          success: "O ataque entra ligado e a torcida compra a briga.",
          failure: "Nervos à flor da pele: os titulares rendem menos.",
        },
        calm: { label: "Baixar a temperatura", result: "Defesa bem treinada e grupo tranquilo, mas os titulares perdem intensidade." },
      },
    },
    boardBonus: {
      title: "Diretoria animada",
      body: "A diretoria oferece um reforço de {amount} para contratações, se você aceitar a cobrança que vem junto.",
      options: {
        accept: { label: "Aceitar a verba", result: "Dinheiro no caixa de contratações, e a diretoria de olho." },
        decline: { label: "Recusar com elegância", result: "A diretoria gosta da prudência." },
      },
    },
    fanProtest: {
      title: "Protesto da torcida",
      body: "Faixas no portão do centro de treinamento. A torcida exige resposta.",
      options: {
        meet: {
          label: "Receber os líderes",
          success: "A conversa franca acalma a arquibancada.",
          failure: "A reunião vazou e virou bate-boca.",
        },
        focus: { label: "Fechar os treinos", result: "A diretoria apoia; a torcida se sente ignorada." },
      },
    },
    pressLeak: {
      title: "Vazamento",
      body: "Uma conversa do vestiário apareceu no jornal. Alguém está falando demais.",
      options: {
        hunt: {
          label: "Caçar o culpado",
          success: "O vazamento para e o grupo se fecha.",
          failure: "A caça às bruxas deixou todo mundo desconfiado.",
        },
        unite: { label: "Fechar o grupo sem caça", result: "O elenco gosta; a diretoria queria uma resposta mais dura." },
      },
    },
    veteranMentor: {
      title: "Veterano quer ajudar",
      body: "{player} se oferece para cuidar dos garotos da base, com treinos extras depois do expediente.",
      options: {
        accept: { label: "Aceitar a ajuda", result: "{player} vira mentor e anima os jovens, mas perde um pouco de fase no próprio jogo." },
        focus: { label: "Pedir foco no próprio jogo", result: "A fase dele melhora; os jovens se sentem deixados de lado." },
      },
    },
    rivalInterest: {
      title: "Proposta pelo reserva",
      body: "{buyer} oferece {price} por {player}, que tem jogado pouco.",
      options: {
        sell: { label: "Vender", result: "Verba reforçada. A torcida não gosta de reforçar quem é de fora." },
        keep: { label: "Manter no elenco", result: "Ele se sente valorizado, e você promete não vendê-lo até o fim da temporada." },
      },
    },
    raiseRequest: {
      title: "Pedido de aumento",
      body: "{player} está em grande fase e o empresário pede {raise} a mais por mês.",
      options: {
        raise: { label: "Dar o aumento", result: "Ele fica feliz; a folha cresce." },
        refuse: {
          label: "Recusar",
          success: "Ele entende e segue focado.",
          failure: "Ele fica magoado e o rendimento pode cair.",
        },
      },
    },
    trainingInjury: {
      title: "Dor no treino",
      body: "{player} sentiu uma fisgada no treino. O médico pede cautela.",
      options: {
        rush: {
          label: "Apressar a volta",
          success: "Foi só um susto: segue disponível e ganha confiança.",
          failure: "A pressa piorou a lesão: dois turnos fora.",
        },
        rest: { label: "Respeitar o tempo", result: "Um turno fora para se recuperar com tranquilidade." },
      },
    },
    austerity: {
      title: "Folha sob pressão",
      body: "A folha está perto do limite. A diretoria sugere negociar {player}, o maior salário, ou um corte coletivo com impacto no ambiente.",
      options: {
        list: { label: "Colocar na lista de vendas", result: "A diretoria aprova; ele não gosta de saber." },
        cut: { label: "Renegociar os salários", result: "A folha cai 5%; o grupo fica contrariado." },
      },
    },
    dressingRoomFight: {
      title: "Briga no vestiário",
      body: "{player} discutiu feio com os jovens do elenco depois do treino.",
      options: {
        veteran: { label: "Apoiar o veterano", result: "Ele se sente respaldado; os jovens ficam chateados." },
        youth: { label: "Apoiar os jovens", result: "Os jovens ganham moral e a promessa de mais jogos; o veterano se fecha." },
        fine: {
          label: "Multar os dois lados",
          success: "Regra é regra: o grupo entende.",
          failure: "A multa caiu mal e o grupo rachou.",
        },
      },
    },
    pressure: {
      title: "Pressão por resultados",
      body: "O time está abaixo do esperado e a imprensa começa a falar em troca de comando.",
      options: {
        back: { label: "Defender o grupo em público", result: "O elenco fecha com você; a torcida queria cobrança." },
        demand: {
          label: "Cobrar o elenco",
          success: "O puxão de orelha funcionou: o time volta a render.",
          failure: "A cobrança pública pesou e o grupo se fechou.",
        },
      },
    },
    goodRun: {
      title: "Boa fase",
      body: "O time está acima do esperado e a diretoria quer aproveitar o momento: {amount} a mais para reforços, se você quiser.",
      options: {
        celebrate: { label: "Comemorar com o grupo", result: "Festa no vestiário e na arquibancada. A celebração custa 1% da receita anual." },
        invest: { label: "Pegar a verba", result: "Verba para reforços e diretoria satisfeita; a torcida sente falta da comemoração." },
      },
    },
    preseasonTour: {
      title: "Excursão de pré-temporada",
      body: "Um torneio de verão no exterior paga {amount}, mas cansa o elenco.",
      options: {
        tour: {
          label: "Viajar",
          success: "Cachê no bolso e ninguém sentiu.",
          failure: "Cachê no bolso, mas os titulares voltaram cansados.",
        },
        camp: { label: "Ficar e treinar", result: "Meio-campo afiado. A concentração custa 1% da receita anual." },
      },
    },
  },

  matchEvent: {
    title: "Decisão no jogo",
    context: "{competition} · {round}",
    minute: "{minute}'",
    venue: { home: "Em casa", away: "Fora", neutral: "Campo neutro" },
    aggregate: "Agregado {aggregate}",
    situations: {
      losing: { title: "Perdendo aos {minute}'", body: "O placar está contra. O que muda?" },
      drawing: { title: "Empate aos {minute}'", body: "Jogo travado. Arriscar ou segurar?" },
      winning: { title: "Ganhando aos {minute}'", body: "A vantagem é sua. Como fechar o jogo?" },
    },
    options: {
      allIn: { label: "Tudo ao ataque", hint: "Mais gols a favor e muito mais exposição.", goal: "Buscar pelo menos o empate" },
      adjust: { label: "Ajustar sem desespero", hint: "Um pouco mais de ataque, quase sem risco a mais.", goal: "Buscar pelo menos o empate" },
      accept: { label: "Evitar o vexame", hint: "Fecha o time para não levar mais.", goal: "Não piorar o placar" },
      push: { label: "Ir para cima", hint: "Mais chance de vencer, mais chance de perder.", goal: "Vencer" },
      balance: { label: "Equilibrar", hint: "Um pouco mais de ataque, com alguma exposição.", goal: "Não perder" },
      hold: { label: "Segurar o ponto", hint: "Menos gols para os dois lados.", goal: "Não perder" },
      close: { label: "Fechar a casinha", hint: "Defesa reforçada, quase sem ataque.", goal: "Manter a vitória" },
      keepGoing: { label: "Buscar mais gols", hint: "Mata o jogo ou dá chance ao rival.", goal: "Manter a vitória" },
      manage: { label: "Administrar", hint: "Toque de bola e menos correria.", goal: "Manter a vitória" },
    },
    chance: "Chance de dar certo: {chance}",
    goal: "Objetivo: {goal}",
    odds: "Vitória {win} · Empate {draw} · Derrota {loss}",
    success: "Deu certo.",
    failure: "Não deu certo.",
  },

  talks: {
    concerns: {
      minutes: "Diz que merece jogar mais e que não está tendo chance.",
      wantsOut: "Quer sair. A cabeça já está em outro lugar.",
      promise: "Quer saber se a promessa que você fez vai ser cumprida.",
      form: "Anda sem confiança, errando o que sempre acertava.",
      role: "Não entende por que fica tanto no banco.",
      homesick: "Sente falta de casa e da família, longe do país dele.",
      content: "Está bem. Agradece a conversa e quer seguir assim.",
    },
    immediate: "Só de conversar, ele já saiu um pouco melhor.",
    options: {
      promiseStarts: { label: "Prometer titularidade no segundo turno", good: "Ele sai confiante. A promessa entra na lista." },
      patience: { label: "Pedir paciência", good: "Ele aceita esperar a vez.", bad: "Ele não aceitou o pedido." },
      honest: { label: "Ser franco sobre o papel dele", good: "A verdade doeu, mas ele aceita o banco.", bad: "Ele não gostou nada da franqueza." },
      list: { label: "Colocar na lista de vendas", good: "Ele agradece por ser ouvido e espera propostas." },
      convince: { label: "Tentar convencer a ficar", good: "Ele decide ficar e lutar pela vaga.", bad: "Não deu: ele segue querendo sair." },
      promiseMinutes: { label: "Prometer titularidade no segundo turno", good: "Ele topa esperar se jogar. A promessa entra na lista." },
      reassure: { label: "Garantir que vai cumprir", good: "Ele confia na sua palavra." },
      release: { label: "Desfazer a promessa", good: "Ele não gosta, mas a promessa deixa de valer." },
      confidence: { label: "Dar confiança", good: "Ele volta a acreditar.", bad: "Não adiantou: segue sem confiança." },
      rest: { label: "Poupar por uns dias", good: "Respira um pouco e volta melhor.", bad: "O descanso tirou ritmo e ele voltou frustrado." },
      explain: { label: "Explicar o papel dele", good: "Ele entende e aceita o banco.", bad: "Ele não concordou com a explicação." },
      family: { label: "Ajudar a trazer a família", good: "Com a família perto, ele volta a sorrir." },
      praise: { label: "Elogiar", good: "Ele sai ainda mais motivado.", bad: "O elogio pareceu vazio e ele saiu frustrado." },
      challenge: { label: "Desafiar a ir além", good: "O desafio acendeu o jogador.", bad: "Ele achou que era cobrança demais." },
    },
  },

  meeting: {
    support: { label: "Apoiar o grupo", good: "O grupo ganha moral; a diretoria perde 2 de confiança por esperar mais cobrança." },
    demand: { label: "Cobrar o grupo", good: "A cobrança funcionou: o time voltou a correr.", bad: "A cobrança caiu mal e o clima pesou." },
  },

  funds: {
    large: "A diretoria libera {amount}.",
    small: "A diretoria libera só {amount}.",
    refused: "A diretoria não libera nada agora.",
    condition: "Condição: o objetivo da temporada sobe para {objective}.",
  },

  objectives: {
    title: { name: "Brigar pelo título", target: "Terminar entre os {target} primeiros" },
    top: { name: "Parte de cima", target: "Terminar entre os {target} primeiros" },
    mid: { name: "Meio da tabela", target: "Terminar entre os {target} primeiros" },
    survive: { name: "Evitar a queda", target: "Terminar no máximo em {target}º" },
    promotion: { name: "Subir de divisão", target: "Terminar entre os {target} primeiros e subir" },
    bottom: { name: "Fazer o possível", target: "Terminar no máximo em {target}º" },
  },

  reasons: {
    resultsAbove: "Resultados acima do esperado",
    resultsBelow: "Resultados abaixo do esperado",
    derbyWins: "Vitórias em clássicos",
    derbyLosses: "Derrotas em clássicos",
    titles: "Títulos",
    promotion: "Acesso",
    relegation: "Rebaixamento",
    promiseKept: "Promessa cumprida",
    promiseBroken: "Promessa quebrada",
    idolSold: "Venda de um ídolo",
    idolSoldMoney: "Dinheiro da venda do ídolo",
    starSold: "Venda de uma estrela",
    unhappySold: "Saída de um insatisfeito",
    debtRelief: "Alívio na folha",
    seasonGood: "Temporada acima do esperado",
    seasonBad: "Temporada abaixo do esperado",
    event: "Decisão de um evento",
    talk: "Conversa no vestiário",
  },

  bars: {
    board: { name: "Diretoria", hint: "Confiança da diretoria no seu trabalho. Abaixo de 27 na avaliação, você é demitido." },
    fans: { name: "Torcida", hint: "Humor da arquibancada. Pesa na avaliação e reage a clássicos, títulos e vendas." },
    squad: { name: "Elenco", hint: "Média da satisfação dos jogadores. Quem está insatisfeito rende menos." },
  },

  moments: {
    derbyWin: "Vitória no clássico contra {opponent} ({score})",
    derbyLoss: "Derrota no clássico contra {opponent} ({score})",
    bigWin: "Goleada sobre {opponent} ({score})",
    bigLoss: "Goleada sofrida para {opponent} ({score})",
    title: "Campeão: {competition}",
    eliminated: "Eliminado: {competition} ({round})",
    promotion: "Acesso conquistado",
    relegation: "Rebaixado",
    learnedPosition:"{player} aprendeu a jogar como {position}.",
    hatTrick: "Hat-trick de {player} contra {opponent}",
    matchEventSuccess: "Decisão certeira no jogo",
    matchEventFailure: "A decisão no jogo não deu certo",
    debut: "Estreia de {player}, da base",
    signing: "Contratação de {player} ({fee})",
    sale: "Venda de {player} para {buyer} ({fee})",
  },

  evaluation: {
    reasons: {
      ambition: "O que pesou: a cobrança por títulos e o jejum do clube.",
      objective: "O que pesou: o objetivo da liga.",
      cups: "O que pesou: as copas e os torneios continentais.",
      finances: "O que pesou: as finanças do clube.",
      promises: "O que pesou: as promessas feitas ao elenco.",
      fans: "O que pesou: a relação com a torcida.",
      history: "O que pesou: o histórico das temporadas anteriores.",
    },
    tolerance: {
      trusted: "A diretoria confia no seu trabalho.",
      patience: "A temporada não foi boa, mas o seu histórico garante paciência.",
      warned: "A diretoria deixou claro: a próxima precisa ser melhor.",
      none: "Avaliação neutra.",
    },
    dismissed: "Demitido. A diretoria decidiu trocar o comando.",
    kept: "Mantido no cargo para a próxima temporada.",
  },

  finance: {
    healthy: "Saudável",
    balanced: "Equilibrada",
    tight: "Apertada",
  },

  achievements: {
    invincibles: {name:"Invencíveis",description:"Conquiste uma liga sem perder nenhuma partida."},
    firstSeason: { name: "Primeira prancheta", description: "Termine a primeira temporada como técnico." },
    fullCareer: { name: "Vinte e quatro anos de banco", description: "Complete as 24 temporadas da carreira de técnico." },
    promotion: { name: "Acesso", description: "Suba um clube para a primeira divisão." },
    twoPromotions: { name: "Especialista em acesso", description: "Conquiste dois acessos na carreira." },
    rescue: { name: "Bombeiro", description: "Livre da queda um clube que tinha como objetivo evitar o rebaixamento." },
    firstTitle: { name: "Primeira taça", description: "Ganhe o primeiro título como técnico." },
    league: { name: "Campeão nacional", description: "Ganhe a liga de uma primeira divisão." },
    continental: { name: "Rei do continente", description: "Ganhe o principal torneio continental de clubes." },
    clubWorldCup: { name: "Campeão do mundo", description: "Ganhe o Mundial de Clubes." },
    underdogWorld: { name: "Davi contra Golias", description: "Ganhe o Mundial de Clubes com um clube de fora da Europa." },
    treble: { name: "Tríplice coroa", description: "Ganhe a liga, a copa nacional e o principal torneio continental na mesma temporada." },
    tenTitles: { name: "Galeria cheia", description: "Some 10 títulos como técnico." },
    fromBottom: { name: "Do porão ao topo", description: "Suba com um clube e, depois, ganhe a liga da primeira divisão com ele." },
    loyal: { name: "Casa de verdade", description: "Treine o mesmo clube por 10 temporadas." },
    abroad: { name: "Passaporte carimbado", description: "Treine um clube de outro país." },
    threeCountries: { name: "Cidadão do mundo", description: "Treine clubes de três países diferentes." },
    revelations: { name: "Fábrica de craques", description: "Suba 5 jogadores da base que chegam a 30 jogos com você." },
    comeback: { name: "A volta por cima", description: "Seja demitido e, depois, ganhe um título." },
    reputation: { name: "Lenda da prancheta", description: "Chegue a 90 de reputação." },
  },
} as const;

export type CoachMessages = Widen<typeof coachPt>;
