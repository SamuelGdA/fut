import type { CoachMessages } from "./coach.pt";

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
export const coachEs: CoachMessages = {
  events: {
    captainVoice: {
  "title": "La voz del capitán",
  "body": "{player} quiere que los veteranos participen en las decisiones del vestuario. Los jóvenes también quieren ser escuchados.",
  "options": {
    "listen": {
      "label": "Escuchar a los veteranos",
      "result": "El veterano se siente valorado, pero los jóvenes quedan en segundo plano."
    },
    "shared": {
      "label": "Repartir la palabra",
      "success": "El diálogo une al plantel.",
      "failure": "El veterano siente que pierde influencia."
    }
  }
},
    benchPlan: {
  "title": "Un lugar en el plan",
  "body": "{player} pregunta cuándo tendrá minutos. Dar una fecha ayuda, pero crea un compromiso real.",
  "options": {
    "rotate": {
      "label": "Prometer titularidad en la segunda vuelta",
      "result": "El compromiso se comprueba en tus once al iniciar la segunda vuelta. La rotación posterior de la IA no lo decide."
    },
    "compete": {
      "label": "Pedir que compita",
      "success": "Acepta competir y mejora su rendimiento.",
      "failure": "La respuesta frustra al jugador."
    }
  }
},
    academyBridge: {
  "title": "Puente con la cantera",
  "body": "{player} pide más integración entre los jóvenes y los titulares. El tiempo de entrenamiento es limitado.",
  "options": {
    "integrate": {
      "label": "Mezclar los grupos",
      "result": "Los jóvenes se acercan al equipo; los titulares pierden atención exclusiva."
    },
    "individual": {
      "label": "Sesión extra con el cuerpo técnico",
      "result": "Mejora la preparación del medio, con un gasto del presupuesto."
    }
  }
},
    trainingTempo: {
  "title": "Ritmo de trabajo",
  "body": "El cuerpo técnico propone una semana intensa para los titulares. El plantel también pide tiempo para recuperarse.",
  "options": {
    "intense": {
      "label": "Subir la intensidad",
      "success": "Los titulares responden bien a la intensidad.",
      "failure": "La carga perjudica la forma de los titulares."
    },
    "light": {
      "label": "Aliviar la carga",
      "result": "El plantel está más satisfecho, con menos intensidad en el campo."
    }
  }
},
    setPieceLab: {
  "title": "Laboratorio a balón parado",
  "body": "Hay tiempo para un bloque extra de trabajo. Priorizar un área deja otra con menos atención.",
  "options": {
    "attack": {
      "label": "Ensayar jugadas de ataque",
      "result": "El ataque gana preparación; los suplentes se sienten olvidados."
    },
    "defend": {
      "label": "Ajustar la defensa",
      "result": "Mejora la defensa, pero el trabajo extra pesa en los titulares."
    }
  }
},
    openTraining: {
  "title": "Puertas abiertas",
  "body": "La afición pide asistir a un entrenamiento. Abrir acerca al club, pero expone más a los titulares.",
  "options": {
    "open": {
      "label": "Abrir el entrenamiento",
      "success": "La sesión acerca a la afición y al plantel.",
      "failure": "La exposición trae críticas y quita tranquilidad a los titulares."
    },
    "closed": {
      "label": "Mantener las puertas cerradas",
      "result": "El medio trabaja en privado; la afición siente la distancia."
    }
  }
},
    pressStrategy: {
  "title": "La pregunta de la rueda de prensa",
  "body": "La prensa pide una declaración sobre el plantel. Tu respuesta puede proteger al grupo o aumentar la exigencia.",
  "options": {
    "shield": {
      "label": "Asumir la presión",
      "result": "El plantel se siente protegido; la directiva quería más exigencia."
    },
    "challenge": {
      "label": "Desafiar al equipo en público",
      "success": "Los titulares responden y la afición lo aprueba.",
      "failure": "La exigencia pública molesta a los titulares."
    }
  }
},
    videoRoom: {
  "title": "Sala de vídeo",
  "body": "El cuerpo técnico seleccionó vídeos para corregir la defensa. Una sesión colectiva exige más tiempo a todos.",
  "options": {
    "collective": {
      "label": "Revisar con todo el plantel",
      "result": "La defensa gana preparación; el plantel protesta por el tiempo extra."
    },
    "private": {
      "label": "Conversaciones individuales",
      "success": "Los titulares asimilan los ajustes.",
      "failure": "Los mensajes individuales no conectan."
    }
  }
},
    veteranSchedule: {
  "title": "Rutina del veterano",
  "body": "{player} pide una rutina adaptada a su edad. El resto del plantel observa el trato.",
  "options": {
    "adapt": {
      "label": "Adaptar la rutina",
      "result": "El veterano rinde mejor; el grupo cuestiona el privilegio."
    },
    "equal": {
      "label": "Mantener la misma rutina",
      "success": "El plantel aprueba la igualdad de trato.",
      "failure": "La carga perjudica al veterano y lo frustra."
    }
  }
},
    starResponsibility: {
  "title": "Responsabilidad de la estrella",
  "body": "{player} puede asumir más responsabilidad en la preparación de partidos. Más protagonismo también trae presión.",
  "options": {
    "lead": {
      "label": "Darle protagonismo",
      "success": "La estrella crece con la responsabilidad e involucra al grupo.",
      "failure": "La nueva responsabilidad pesa en el jugador."
    },
    "protect": {
      "label": "Protegerlo de la presión",
      "result": "El jugador se siente apoyado; la afición quería más liderazgo."
    }
  }
},
    squadWorkshop: {
  "title": "Tiempo para el grupo",
  "body": "Una actividad fuera del campo puede unir al plantel. Usa presupuesto y ocupa un bloque de trabajo.",
  "options": {
    "bond": {
      "label": "Invertir en convivencia",
      "result": "El grupo se acerca. El coste sale del presupuesto disponible."
    },
    "work": {
      "label": "Usar el tiempo para entrenar",
      "result": "El medio gana preparación; el plantel echa de menos la actividad."
    }
  }
},
    rotationPolicy: {
  "title": "Prioridad de la alineación",
  "body": "Titulares y suplentes quieren entender tu plan. Decide quién recibe atención extra en esta etapa.",
  "options": {
    "merit": {
      "label": "Valorar a los titulares",
      "result": "Los titulares se sienten valorados; los suplentes quedan molestos."
    },
    "depth": {
      "label": "Preparar a los suplentes",
      "result": "Los suplentes ganan confianza; los titulares sienten la competencia."
    }
  }
},
    youngPressure: {
  "title": "Focos sobre el joven",
  "body": "{player} llamó la atención de la prensa en los entrenamientos. La exposición puede motivarlo o pesarle.",
  "options": {
    "protect": {
      "label": "Evitar la exposición",
      "result": "El joven está más tranquilo; la afición quería conocerlo."
    },
    "spotlight": {
      "label": "Darle espacio en la prensa",
      "success": "La atención motiva al joven y anima a la afición.",
      "failure": "La exposición perjudica su rendimiento y confianza."
    }
  }
},
    unhappyStar: {
      title: "Titular insatisfecho",
      body: "{player} pidió hablar contigo. Dice que no está contento y que ya tiene la cabeza fuera del club.",
      options: {
        promise: { label: "Prometer titularidad en la segunda vuelta", result: "Sale de la sala más aliviado. Ahora hay que cumplir la promesa." },
        raise: { label: "Ofrecer un aumento", result: "El aumento calma al jugador, y la cuenta llega a fin de mes." },
        firm: {
          label: "Mantenerse firme",
          success: "Entiende el mensaje y al grupo le gusta la actitud.",
          failure: "La charla se agrió. Pide que lo pongan en venta.",
        },
      },
    },
    wantsOut: {
      title: "Petición de salida",
      body: "{player} recibió una oferta de {buyer} ({price}) y quiere irse.",
      options: {
        sell: { label: "Autorizar la venta", result: "Trato cerrado. El vestuario respeta la decisión." },
        refuse: {
          label: "Rechazar la oferta",
          success: "Acepta quedarse, a disgusto, pero sin líos.",
          failure: "Se queda, pero el ambiente se enrarece en el vestuario.",
        },
        promise: { label: "Prometer titularidad en la segunda vuelta", result: "Acepta quedarse si juega. La promesa entra en la lista." },
      },
    },
    youthShines: {
      title: "Joya de la cantera",
      body: "{player} está volando en los entrenamientos. El cuerpo técnico cree que es hora de darle una oportunidad.",
      options: {
        chance: { label: "Prometer titularidad en la segunda vuelta", result: "A la afición le gusta ver a la cantera. Ahora él espera jugar." },
        praise: {
          label: "Elogiarlo en público",
          success: "El chico crece con la confianza.",
          failure: "La presión se le subió a la cabeza y bajó su rendimiento.",
        },
        patience: { label: "Pedir paciencia", result: "Los titulares lo aprueban; el chico se queda molesto." },
      },
    },
    injuryCrisis: {
      title: "Crisis de lesiones",
      body: "Hay {injured} jugadores en la enfermería. El fisiólogo pide inversión para acelerar las recuperaciones.",
      options: {
        medical: { label: "Invertir en el cuerpo médico ({cost})", result: "Cada recuperación se reduce en una vuelta." },
        rotate: { label: "Rotar la plantilla", result: "Los suplentes ganan moral y el medio entrena, pero los titulares se sienten relegados." },
      },
    },
    derbyWeek: {
      title: "Semana de clásico",
      body: "Se viene el clásico contra {rival}. La ciudad no habla de otra cosa.",
      options: {
        fire: {
          label: "Encender al equipo",
          success: "El ataque sale enchufado y la afición se suma a la pelea.",
          failure: "Nervios a flor de piel: los titulares rinden menos.",
        },
        calm: { label: "Bajar la temperatura", result: "Defensa bien entrenada y grupo tranquilo, pero los titulares pierden intensidad." },
      },
    },
    boardBonus: {
      title: "Directiva entusiasmada",
      body: "La directiva ofrece un refuerzo de {amount} para fichajes, si aceptas la exigencia que viene con él.",
      options: {
        accept: { label: "Aceptar el dinero", result: "Dinero en el presupuesto de fichajes, y la directiva vigilando." },
        decline: { label: "Rechazar con elegancia", result: "A la directiva le gusta la prudencia." },
      },
    },
    fanProtest: {
      title: "Protesta de la afición",
      body: "Pancartas en la puerta de la ciudad deportiva. La afición exige respuestas.",
      options: {
        meet: {
          label: "Recibir a los líderes",
          success: "La charla franca calma a la grada.",
          failure: "La reunión se filtró y terminó en discusión.",
        },
        focus: { label: "Entrenar a puerta cerrada", result: "La directiva apoya; la afición se siente ignorada." },
      },
    },
    pressLeak: {
      title: "Filtración",
      body: "Una conversación del vestuario salió en el periódico. Alguien está hablando de más.",
      options: {
        hunt: {
          label: "Buscar al culpable",
          success: "La filtración se corta y el grupo se cierra.",
          failure: "La caza de brujas dejó a todos desconfiados.",
        },
        unite: { label: "Cerrar filas sin buscar culpables", result: "A la plantilla le gusta; la directiva quería una respuesta más dura." },
      },
    },
    veteranMentor: {
      title: "Un veterano quiere ayudar",
      body: "{player} se ofrece a cuidar a los chicos de la cantera, con entrenamientos extra al terminar la jornada.",
      options: {
        accept: { label: "Aceptar la ayuda", result: "{player} se vuelve tutor y anima a los jóvenes, pero pierde algo de forma en su propio juego." },
        focus: { label: "Pedirle que se centre en su juego", result: "Su forma mejora; los jóvenes se sienten abandonados." },
      },
    },
    rivalInterest: {
      title: "Oferta por el suplente",
      body: "{buyer} ofrece {price} por {player}, que ha jugado poco.",
      options: {
        sell: { label: "Venderlo", result: "Dinero en caja. A la afición no le gusta reforzar a otro club." },
        keep: { label: "Mantenerlo en la plantilla", result: "Se siente valorado, y prometes no venderlo hasta el final de la temporada." },
      },
    },
    raiseRequest: {
      title: "Petición de aumento",
      body: "{player} está en un gran momento y su representante pide {raise} más al mes.",
      options: {
        raise: { label: "Darle el aumento", result: "Queda contento; la masa salarial crece." },
        refuse: {
          label: "Rechazar",
          success: "Lo entiende y sigue concentrado.",
          failure: "Se queda dolido y su rendimiento puede bajar.",
        },
      },
    },
    trainingInjury: {
      title: "Molestia en el entrenamiento",
      body: "{player} sintió un pinchazo en el entrenamiento. El médico pide prudencia.",
      options: {
        rush: {
          label: "Acelerar la vuelta",
          success: "Fue solo un susto: sigue disponible y gana confianza.",
          failure: "Las prisas agravaron la lesión: dos vueltas fuera.",
        },
        rest: { label: "Respetar los plazos", result: "Una vuelta fuera para recuperarse con calma." },
      },
    },
    austerity: {
      title: "Nómina bajo presión",
      body: "La nómina se acerca al límite. La directiva propone negociar a {player}, el salario más alto, o renegociar los sueldos del plantel.",
      options: {
        list: { label: "Ponerlo en la lista de ventas", result: "La directiva lo aprueba; a él no le gusta enterarse." },
        cut: { label: "Renegociar los salarios", result: "La nómina cae un 5%; el grupo se queda molesto." },
      },
    },
    dressingRoomFight: {
      title: "Pelea en el vestuario",
      body: "{player} discutió fuerte con los jóvenes de la plantilla después del entrenamiento.",
      options: {
        veteran: { label: "Apoyar al veterano", result: "Se siente respaldado; los jóvenes se quedan molestos." },
        youth: { label: "Apoyar a los jóvenes", result: "Los jóvenes ganan moral y la promesa de más partidos; el veterano se cierra." },
        fine: {
          label: "Multar a ambos lados",
          success: "Las reglas son las reglas: el grupo lo entiende.",
          failure: "La multa cayó mal y el grupo se partió.",
        },
      },
    },
    pressure: {
      title: "Presión por resultados",
      body: "El equipo rinde por debajo de lo esperado y la prensa empieza a hablar de cambio de entrenador.",
      options: {
        back: { label: "Defender al grupo en público", result: "La plantilla cierra filas contigo; la afición quería exigencia." },
        demand: {
          label: "Exigir a la plantilla",
          success: "El tirón de orejas funcionó: el equipo vuelve a rendir.",
          failure: "La exigencia pública pesó y el grupo se cerró.",
        },
      },
    },
    goodRun: {
      title: "Buena racha",
      body: "El equipo rinde por encima de lo esperado y la directiva quiere aprovechar el momento: {amount} más para refuerzos, si quieres.",
      options: {
        celebrate: { label: "Celebrar con el grupo", result: "Fiesta en el vestuario y en la grada. Cuesta el 1% de los ingresos anuales." },
        invest: { label: "Tomar el dinero", result: "Dinero para fichajes y directiva satisfecha; la afición echa de menos la celebración." },
      },
    },
    preseasonTour: {
      title: "Gira de pretemporada",
      body: "Un torneo de verano en el extranjero paga {amount}, pero cansa a la plantilla.",
      options: {
        tour: {
          label: "Hacer la gira",
          success: "Dinero cobrado y nadie lo sintió.",
          failure: "Dinero cobrado, pero los titulares volvieron cansados.",
        },
        camp: { label: "Quedarse a entrenar", result: "Mediocampo afinado. La concentración cuesta el 1% de los ingresos anuales." },
      },
    },
  },

  matchEvent: {
    title: "Decisión en el partido",
    context: "{competition} · {round}",
    minute: "{minute}'",
    venue: { home: "En casa", away: "Fuera", neutral: "Campo neutral" },
    aggregate: "Global {aggregate}",
    situations: {
      losing: { title: "Perdiendo al {minute}'", body: "El marcador está en contra. ¿Qué cambias?" },
      drawing: { title: "Empate al {minute}'", body: "Partido trabado. ¿Arriesgar o aguantar?" },
      winning: { title: "Ganando al {minute}'", body: "La ventaja es tuya. ¿Cómo cerrar el partido?" },
    },
    options: {
      allIn: { label: "Todo al ataque", hint: "Más goles a favor y mucha más exposición.", goal: "Buscar al menos el empate" },
      adjust: { label: "Ajustar sin desesperarse", hint: "Un poco más de ataque, casi sin riesgo extra.", goal: "Buscar al menos el empate" },
      accept: { label: "Evitar el ridículo", hint: "Cierra el equipo para no recibir más.", goal: "No empeorar el marcador" },
      push: { label: "Salir a ganar", hint: "Más probabilidad de ganar, más probabilidad de perder.", goal: "Ganar" },
      balance: { label: "Buscar el equilibrio", hint: "Algo más de ataque, con cierta exposición.", goal: "No perder" },
      hold: { label: "Asegurar el punto", hint: "Menos goles para los dos lados.", goal: "No perder" },
      close: { label: "Echar el cerrojo", hint: "Defensa reforzada, casi sin ataque.", goal: "Mantener la victoria" },
      keepGoing: { label: "Buscar más goles", hint: "Liquida el partido o le da vida al rival.", goal: "Mantener la victoria" },
      manage: { label: "Administrar la ventaja", hint: "Toque de balón y menos carreras.", goal: "Mantener la victoria" },
    },
    chance: "Probabilidad de éxito: {chance}",
    goal: "Objetivo: {goal}",
    odds: "Victoria {win} · Empate {draw} · Derrota {loss}",
    success: "Salió bien.",
    failure: "No salió bien.",
  },

  talks: {
    concerns: {
      minutes: "Dice que merece jugar más y que no está teniendo oportunidades.",
      wantsOut: "Quiere irse. Ya tiene la cabeza en otro lado.",
      promise: "Quiere saber si vas a cumplir la promesa que le hiciste.",
      form: "Anda sin confianza, fallando lo que siempre le salía.",
      role: "No entiende por qué pasa tanto tiempo en el banquillo.",
      homesick: "Extraña su casa y a su familia, lejos de su país.",
      content: "Está bien. Agradece la charla y quiere seguir así.",
    },
    immediate: "Solo con hablar, ya salió un poco mejor.",
    options: {
      promiseStarts: { label: "Prometer titularidad en la segunda vuelta", good: "Sale confiado. La promesa entra en la lista." },
      patience: { label: "Pedir paciencia", good: "Acepta esperar su turno.", bad: "No aceptó la petición." },
      honest: { label: "Ser franco sobre su papel", good: "La verdad dolió, pero acepta el banquillo.", bad: "No le gustó nada la franqueza." },
      list: { label: "Ponerlo en la lista de ventas", good: "Agradece que lo escuchen y espera ofertas." },
      convince: { label: "Intentar convencerlo de quedarse", good: "Decide quedarse y pelear por el puesto.", bad: "No hubo caso: sigue queriendo irse." },
      promiseMinutes: { label: "Prometer titularidad en la segunda vuelta", good: "Acepta esperar si juega. La promesa entra en la lista." },
      reassure: { label: "Asegurar que la cumplirás", good: "Confía en tu palabra." },
      release: { label: "Retirar la promesa", good: "No le gusta, pero la promesa deja de valer." },
      confidence: { label: "Darle confianza", good: "Vuelve a creer en sí mismo.", bad: "No sirvió: sigue sin confianza." },
      rest: { label: "Darle unos días de descanso", good: "Respira un poco y vuelve mejor.", bad: "El descanso le quitó ritmo y volvió frustrado." },
      explain: { label: "Explicarle su papel", good: "Lo entiende y acepta el banquillo.", bad: "No estuvo de acuerdo con la explicación." },
      family: { label: "Ayudar a traer a su familia", good: "Con la familia cerca, vuelve a sonreír." },
      praise: { label: "Elogiarlo", good: "Sale todavía más motivado.", bad: "El elogio sonó vacío y salió frustrado." },
      challenge: { label: "Desafiarlo a dar más", good: "El desafío encendió al jugador.", bad: "Le pareció demasiada exigencia." },
    },
  },

  meeting: {
    support: { label: "Apoyar al grupo", good: "El grupo gana moral; la directiva pierde 2 de confianza al esperar más exigencia." },
    demand: { label: "Exigir al grupo", good: "La exigencia funcionó: el equipo volvió a correr.", bad: "La exigencia cayó mal y el ambiente se enrareció." },
  },

  funds: {
    large: "La directiva libera {amount}.",
    small: "La directiva solo libera {amount}.",
    refused: "La directiva no libera nada por ahora.",
    condition: "Condición: el objetivo de la temporada sube a {objective}.",
  },

  objectives: {
    title: { name: "Pelear por el título", target: "Terminar entre los {target} primeros" },
    top: { name: "Zona alta", target: "Terminar entre los {target} primeros" },
    mid: { name: "Mitad de la tabla", target: "Terminar entre los {target} primeros" },
    survive: { name: "Evitar el descenso", target: "Terminar como máximo {target}.º" },
    promotion: { name: "Ascender", target: "Terminar entre los {target} primeros y ascender" },
    bottom: { name: "Hacer lo posible", target: "Terminar como máximo {target}.º" },
  },

  reasons: {
    resultsAbove: "Resultados por encima de lo esperado",
    resultsBelow: "Resultados por debajo de lo esperado",
    derbyWins: "Victorias en clásicos",
    derbyLosses: "Derrotas en clásicos",
    titles: "Títulos",
    promotion: "Ascenso",
    relegation: "Descenso",
    promiseKept: "Promesa cumplida",
    promiseBroken: "Promesa rota",
    idolSold: "Venta de un ídolo",
    idolSoldMoney: "Dinero de la venta del ídolo",
    starSold: "Venta de una estrella",
    unhappySold: "Salida de un insatisfecho",
    debtRelief: "Alivio en la nómina",
    seasonGood: "Temporada por encima de lo esperado",
    seasonBad: "Temporada por debajo de lo esperado",
    event: "Decisión de un evento",
    talk: "Charla en el vestuario",
  },

  bars: {
    board: { name: "Directiva", hint: "Confianza de la directiva en tu trabajo. Por debajo de 27 en la evaluación, te despiden." },
    fans: { name: "Afición", hint: "Humor de la grada. Pesa en la evaluación y reacciona a clásicos, títulos y ventas." },
    squad: { name: "Plantilla", hint: "Media de la satisfacción de los jugadores. Los insatisfechos rinden menos." },
  },

  moments: {
    derbyWin: "Victoria en el clásico contra {opponent} ({score})",
    derbyLoss: "Derrota en el clásico contra {opponent} ({score})",
    bigWin: "Goleada a {opponent} ({score})",
    bigLoss: "Goleada recibida ante {opponent} ({score})",
    title: "Campeón: {competition}",
    eliminated: "Eliminación: {competition} ({round})",
    promotion: "Ascenso conseguido",
    relegation: "Descenso",
    learnedPosition:"{player} aprendió a jugar como {position}.",
    hatTrick: "Hat-trick de {player} contra {opponent}",
    matchEventSuccess: "Decisión acertada en el partido",
    matchEventFailure: "La decisión en el partido no salió bien",
    debut: "Debut de {player}, de la cantera",
    signing: "Fichaje de {player} ({fee})",
    sale: "Venta de {player} a {buyer} ({fee})",
  },

  evaluation: {
    reasons: {
      ambition: "Lo que pesó: la exigencia de títulos y la sequía del club.",
      objective: "Lo que pesó: el objetivo de la liga.",
      cups: "Lo que pesó: las copas y los torneos continentales.",
      finances: "Lo que pesó: las finanzas del club.",
      promises: "Lo que pesó: las promesas hechas a la plantilla.",
      fans: "Lo que pesó: la relación con la afición.",
      history: "Lo que pesó: el historial de las temporadas anteriores.",
    },
    tolerance: {
      trusted: "La directiva confía en tu trabajo.",
      patience: "La temporada no fue buena, pero tu historial te garantiza paciencia.",
      warned: "La directiva lo dejó claro: la próxima tiene que ser mejor.",
      none: "Evaluación neutral.",
    },
    dismissed: "Despedido. La directiva decidió cambiar de entrenador.",
    kept: "Confirmado en el cargo para la próxima temporada.",
  },

  finance: {
    healthy: "Saneada",
    balanced: "Equilibrada",
    tight: "Ajustada",
  },

  achievements: {
    invincibles: {name:"Invencibles",description:"Gana una liga sin perder ningún partido."},
    firstSeason: { name: "Primera pizarra", description: "Termina la primera temporada como entrenador." },
    fullCareer: { name: "Veinticuatro años de banquillo", description: "Completa las 24 temporadas de la carrera de entrenador." },
    promotion: { name: "Ascenso", description: "Lleva a un club a primera división." },
    twoPromotions: { name: "Especialista en ascensos", description: "Consigue dos ascensos en tu carrera." },
    rescue: { name: "Bombero", description: "Salva de la caída a un club cuyo objetivo era evitar el descenso." },
    firstTitle: { name: "Primera copa", description: "Gana tu primer título como entrenador." },
    league: { name: "Campeón nacional", description: "Gana la liga de una primera división." },
    continental: { name: "Rey del continente", description: "Gana el principal torneo continental de clubes." },
    clubWorldCup: { name: "Campeón del mundo", description: "Gana el Mundial de Clubes." },
    underdogWorld: { name: "David contra Goliat", description: "Gana el Mundial de Clubes con un club de fuera de Europa." },
    treble: { name: "Triplete", description: "Gana la liga, la copa nacional y el principal torneo continental en la misma temporada." },
    tenTitles: { name: "Vitrina llena", description: "Suma 10 títulos como entrenador." },
    fromBottom: { name: "Del sótano a la cima", description: "Asciende con un club y, después, gana con él la liga de primera división." },
    loyal: { name: "Casa de verdad", description: "Dirige al mismo club durante 10 temporadas." },
    abroad: { name: "Pasaporte sellado", description: "Dirige a un club de otro país." },
    threeCountries: { name: "Ciudadano del mundo", description: "Dirige clubes de tres países distintos." },
    revelations: { name: "Fábrica de cracks", description: "Sube 5 jugadores de la cantera que lleguen a 30 partidos contigo." },
    comeback: { name: "Volver a levantarse", description: "Sufre un despido y, después, gana un título." },
    reputation: { name: "Leyenda de la pizarra", description: "Llega a 90 de reputación." },
  },
};
