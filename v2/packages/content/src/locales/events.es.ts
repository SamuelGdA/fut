import type { EventsMessages } from "./events.pt";

/** Los textos de los eventos en español. */
export const eventsEs: EventsMessages = {
  extraTraining: {
    title: "Entrenamiento extra",
    body: "El preparador físico propone un programa aparte: gimnasio antes del amanecer y definición después de la práctica del equipo.",
    options: {
      push: {
        label: "Asumir el programa",
        success: "El cuerpo respondió. Empiezas la temporada más fuerte que nunca.",
        failure: "El exceso pasó factura. El cansancio te saca de algunos partidos.",
      },
      routine: { label: "Mantener la rutina", result: "Sigues el plan del club, sin atajos." },
    },
  },
  personalCoach: {
    title: "Entrenador personal",
    body: "Un entrenador famoso por pulir juveniles ofrece trabajo individual, pagado de tu bolsillo.",
    options: {
      hire: {
        label: "Contratarlo",
        success: "El trabajo doble se nota en la cancha. Evolucionas y sumas detalles nuevos a tu juego.",
        failure: "El técnico del club no acepta entrenamientos por fuera y te manda al banco. El dinero y el tiempo se fueron.",
      },
      decline: { label: "Rechazar", result: "Confías en el trabajo del club." },
    },
  },
  supplement: {
    title: "El suplemento",
    body: "Un conocido del vestuario te ofrece un suplemento importado. Promete recuperarte en la mitad del tiempo y jura que está permitido.",
    options: {
      take: {
        label: "Tomarlo",
        success: "Ningún control detectó nada, y la recuperación más rápida te deja un escalón más arriba.",
        failure: "El antidopaje dio positivo. Una temporada de suspensión y tu nombre en todos los diarios.",
      },
      refuse: { label: "Rechazar", result: "Lo rechazas. Meses después, dos compañeros caen en el antidopaje." },
    },
  },
  loadManagement: {
    title: "Gestión de carga",
    body: "El cuerpo médico ve señales de desgaste y sugiere cuidarte en algunos partidos.",
    options: {
      rest: { label: "Aceptar la rotación", result: "Menos partidos, menos riesgo. El cuerpo lo agradece, y la evolución va un poco más lenta." },
      playAll: { label: "Jugar todo", result: "Juegas todos. Más goles y más chances, con el cuerpo al límite." },
    },
  },
  newRole: {
    title: "Nueva función",
    body: "El entrenador te ve rindiendo más como {position} y te asegura la titularidad si aceptas el cambio.",
    options: {
      accept: { label: "Aceptar el cambio", result: "Nueva posición, lugar asegurado. El resto depende de ti." },
      refuse: { label: "Mantener la posición", result: "Sigues en tu posición de origen, pero pierdes lugar con el entrenador." },
    },
  },
  rivalSigned: {
    title: "Competencia en el puesto",
    body: "El club fichó a un jugador de renombre para tu puesto. La prensa ya habla de cambio de titular.",
    options: {
      fight: {
        label: "Pelear el puesto",
        success: "Sostienes la posición, y la hinchada adora la respuesta en la cancha.",
        failure: "El recién llegado gana la pulseada. Empiezas la temporada en el banco.",
      },
      leave: { label: "Aceptar otra oferta", result: "Pides salir. {target} cierra tu fichaje." },
    },
  },
  captaincy: {
    title: "La cinta",
    body: "El capitán se va y el entrenador te quiere con la cinta.",
    options: {
      accept: { label: "Aceptar", result: "Capitán. La hinchada aplaude, y la exigencia crece con ella." },
      decline: { label: "Rechazar", result: "Prefieres liderar sin la cinta." },
    },
  },
  seasonPriority: {
    title: "Prioridad de la temporada",
    body: "El plantel no da para todo. El entrenador pregunta qué va primero.",
    options: {
      league: { label: "La liga", result: "Máxima fuerza en el torneo local. El continental queda en segundo plano." },
      continent: { label: "El continental", result: "Todas las fichas al torneo continental. En la liga, equipo alternativo." },
    },
  },
  rivalCalls: {
    title: "Llama el rival",
    body: "{rivalClub}, el clásico rival, te quiere. La oferta es buena, pero la hinchada nunca lo perdonaría.",
    options: {
      sign: { label: "Firmar con el rival", result: "Cruzas la vereda. {target} festeja; tu antigua hinchada, no." },
      stay: { label: "Quedarse", result: "Le dices que no al rival, y la hinchada canta tu nombre." },
    },
  },
  financialCrisis: {
    title: "Crisis económica",
    body: "El club atrasa sueldos y necesita vender. Hay una oferta sobre la mesa.",
    options: {
      accept: { label: "Aceptar la venta", result: "{target} paga al contado, y cambias de club." },
      stay: {
        label: "Quedarse y ayudar",
        result: "Te quedas y resignas parte del sueldo. El equipo se debilita, pero la hinchada no olvida el gesto.",
      },
    },
  },
  numberTen: {
    title: "La camiseta 10",
    body: "La 10 quedó libre, y la dirigencia te la ofrece.",
    options: {
      wear: { label: "Ponerse la 10", result: "La 10 es tuya. Con ella llegan los focos y la exigencia." },
      keep: { label: "Mantener el número", result: "Prefieres el número que ya es tuyo." },
    },
  },
  homesick: {
    title: "Nostalgia de casa",
    body: "Tres años lejos de casa pesan. Un club de tu país te quiere de vuelta.",
    options: {
      goHome: { label: "Volver a casa", result: "{target} cierra tu regreso. Qué bueno estar cerca de la familia." },
      stay: { label: "Aguantar", result: "Te quedas, pero la cabeza no siempre está en el partido." },
    },
  },
  tattoo: {
    title: "El tatuaje",
    body: "Un tatuador famoso te ofrece una pieza enorme en la espalda, a días del inicio de la temporada.",
    options: {
      doIt: {
        label: "Hacerlo",
        success: "El tatuaje se viraliza, y la hinchada lo adora.",
        failure: "Se infectó. Pierdes media temporada recuperándote.",
      },
      skip: { label: "Dejarlo para las vacaciones", result: "Queda para después." },
    },
  },
  taxes: {
    title: "Problemas con Hacienda",
    body: "El fisco encuentra errores en tus declaraciones de los últimos años, y los diarios ya lo saben.",
    options: {
      settle: { label: "Llegar a un acuerdo", result: "Pagas y cierras el caso, pero la imagen queda manchada." },
      fight: {
        label: "Pelear en la Justicia",
        success: "Absuelto. Sales fortalecido.",
        failure: "Condenado. Media temporada afuera y la imagen por el piso.",
      },
    },
  },
  passport: {
    title: "El pasaporte del abuelo",
    body: "Tu abuelo nació afuera, y la selección de ese país te quiere: {country}.",
    options: {
      switch: { label: "Aceptar la convocatoria", result: "Nuevo pasaporte, nueva selección: {country}." },
      keep: { label: "Seguir con tu selección", result: "Mantienes la camiseta del país donde naciste." },
    },
  },
  residencePassport: {
    title: "Una nueva selección",
    body: "Tras cinco temporadas en el país, la selección de {country} quiere convocarte. Aceptar cambia tu nacionalidad en el juego.",
    options: {
      switch: { label: "Aceptar la nueva nacionalidad", result: "Ahora representas a {country}." },
      keep: { label: "Mantener mi nacionalidad", result: "Mantienes tu nacionalidad y esperas a tu selección." },
    },
  },
  diploma: {
    title: "El título",
    body: "La familia insiste: terminar los estudios antes de pensar solo en la pelota.",
    options: {
      study: { label: "Terminar los estudios", result: "Título en mano. Menos entrenamiento reduce la evolución un 10% y el riesgo de lesión un 30% durante este período." },
      football: { label: "Solo fútbol", result: "Entrenas más: evolución un 10% mayor, pero riesgo de lesión un 30% mayor durante este período." },
    },
  },
  dressingRoomRift: {
    title: "Grieta en el vestuario",
    body: "El plantel se partió en dos grupos, y los dos te quieren de su lado.",
    options: {
      takeSide: {
        label: "Tomar partido",
        success: "Elegiste el lado ganador. Ganas lugar y el respeto de la hinchada.",
        failure: "Tu grupo perdió la pulseada. Lo pagas con minutos.",
      },
      neutral: { label: "Mantenerse neutral", result: "No te metes. Nadie agradece, nadie reclama." },
    },
  },
  comeback: {
    title: "La vuelta del ídolo",
    body: "{target} te quiere de vuelta, donde tu historia ya está escrita.",
    options: {
      return: { label: "Volver", result: "La vuelta del ídolo. Estadio lleno y lugar asegurado." },
      stay: { label: "Seguir donde estás", result: "Agradeces el cariño y sigues tu camino." },
    },
  },
  clubOrCountry: {
    title: "Club o selección",
    body: "El torneo de la selección coincide con el tramo final del club. Los dos te quieren entero.",
    options: {
      tournament: {
        label: "Ir con la selección",
        success: "Vas al torneo y vuelves entero.",
        failure: "Vas al torneo, pero vuelves tocado y te pierdes partidos con el club.",
      },
      club: { label: "Quedarse con el club", result: "Renuncias al torneo. La hinchada del club lo reconoce." },
    },
  },
  painBeforeFinal: {
    title: "Dolor antes de la final",
    body: "Aparece un dolor en el muslo la semana de la final. Los médicos dicen que el riesgo es tuyo.",
    options: {
      sacrifice: {
        label: "Jugar infiltrado",
        success: "Juegas al límite y decides. Título y nombre en la historia.",
        failure: "El muslo no aguantó. Final perdida y semanas afuera.",
      },
      rest: { label: "Cuidar el cuerpo", result: "Miras desde el banco. Sin ti, el equipo pierde la final." },
    },
  },
  muscleInjury: {
    title: "Lesión muscular",
    body: "Una lesión en el muslo al final de la pretemporada. El club quiere apuro; los médicos, calma.",
    options: {
      rushBack: {
        label: "Volver antes",
        success: "Volviste rápido y te perdiste poco.",
        failure: "Volviste demasiado pronto y la lesión se abrió de nuevo. Más tiempo afuera, y el cuerpo lo sintió.",
      },
      fullRecovery: { label: "Recuperarse con calma", result: "Recuperación completa. Te pierdes más partidos, pero vuelves entero." },
    },
  },
  decisivePenalty: {
    title: "El penal decisivo",
    body: "Final, definición por penales, último tiro. El entrenador te mira.",
    options: {
      take: {
        label: "Patearlo",
        success: "Gol. Tú decides el título.",
        failure: "Atajado. La copa queda para el rival, y la hinchada no lo olvida.",
      },
      leave: {
        label: "Dejárselo a otro",
        success: "Patea otro y la mete. El título es del equipo, y lo festejas con todos.",
        failure: "Patea otro y el arquero ataja. La copa se escapa, pero nadie te señala.",
      },
    },
  },
  newCoach: {
    title: "Entrenador nuevo",
    body: "Llegó un entrenador con ideas propias. Nadie tiene el puesto asegurado.",
    options: {
      impress: {
        label: "Demostrar",
        success: "Convences al nuevo entrenador y ganas lugar.",
        failure: "Tiene otros planes. Pierdes lugar en el equipo.",
      },
      leave: { label: "Buscar otro club", result: "{target} cierra tu fichaje antes del debut del nuevo entrenador." },
    },
  },
  derby: {
    title: "Semana de clásico",
    body: "Clásico contra {rivalClub}. La prensa quiere una frase fuerte.",
    options: {
      provoke: {
        label: "Provocar",
        success: "Provocaste y decidiste. Eres el héroe de la hinchada.",
        failure: "Provocaste y desapareciste en el partido. La hinchada no perdona.",
      },
      fairPlay: { label: "Respetar al rival", result: "Hablas de respeto, y la hinchada aprueba el tono." },
    },
  },
  idolFarewell: {
    title: "Despedida del ídolo",
    body: "El máximo ídolo del club se retira y te elige para recibir el homenaje en su partido de despedida.",
    options: {
      honor: { label: "Aceptar el homenaje", result: "Asumes el lugar simbólico del ídolo. La hinchada te abraza, y la exigencia crece." },
      discreet: { label: "Mantener un perfil bajo", result: "Agradeces y le dejas el escenario a él." },
    },
  },
  agentUltimatum: {
    title: "Ultimátum del representante",
    body: "Tu representante tiene la oferta de un club más grande y amenaza con romper si no fuerzas la salida.",
    options: {
      force: {
        label: "Forzar la salida",
        result: "Fuerzas la salida y te vas. {target} gana un refuerzo; tu antigua hinchada, un rencor.",
      },
      stay: { label: "Quedarse", result: "Te quedas y ganas el apoyo de la hinchada, pero tu representante se va. Solo la próxima decisión tendrá ofertas de clubes más débiles, si hay transferencia; después el mercado vuelve a la normalidad." },
    },
  },
  academyJewel: {
    title: "La joya de la cantera",
    body: "Un chico de las inferiores juega en tu puesto y pide entrenar a tu lado.",
    options: {
      mentor: { label: "Apadrinarlo", result: "Le enseñas todo lo que sabes. La hinchada lo adora, y tu tiempo de entrenamiento baja." },
      compete: { label: "Pelear el puesto", success: "Ganas la disputa y más protagonismo.", failure: "El joven gana la disputa. Pierdes protagonismo." },
    },
  },
  bootDeal: {
    title: "Contrato de botines",
    body: "Una marca deportiva te quiere en su campaña principal, con botines de colores y comercial en la tele.",
    options: {
      flashy: { label: "Aceptar la campaña", result: "Eres la cara de la campaña. Más fama, más exigencia." },
      discreet: { label: "Mantener la discreción", result: "Prefieres botines negros y pocas entrevistas." },
    },
  },
  podcast: {
    title: "El pódcast",
    body: "El pódcast más escuchado del país te invita a una entrevista sin filtro.",
    options: {
      speak: {
        label: "Decir todo",
        success: "Fuiste sincero en la medida justa. La entrevista se viraliza a tu favor.",
        failure: "Una frase fuera de contexto se vuelve polémica. La hinchada frunce el ceño.",
      },
      decline: { label: "Rechazar", result: "Prefieres hablar en la cancha." },
    },
  },
  newAgent: {
    title: "Nuevo representante",
    body: "Un representante de peso promete abrirte puertas en todo el mundo.",
    options: {
      change: {
        label: "Cambiar de representante",
        success: "Sus contactos calientan el mercado. Más clubes preguntan por ti.",
        failure: "Mucha promesa, poco resultado. El mercado se enfría.",
      },
      keep: { label: "Seguir con el actual", result: "Te quedas con quien está a tu lado desde el principio." },
    },
  },
  packedStadium: {
    title: "Estadio lleno",
    body: "Casa llena y transmisión para todo el mundo. Es la chance de mostrarse.",
    options: {
      showboat: {
        label: "Jugar para la tribuna",
        success: "Ganas protagonismo con actuaciones sólidas. La afición lo reconoce.",
        failure: "Te expones demasiado y pierdes protagonismo.",
      },
      focused: { label: "Jugar simple", result: "Juegas simple y cumples tu función." },
    },
  },
  redCard: {
    title: "Expulsión",
    body: "Roja directa en una jugada fuerte. El tribunal va a decidir la sanción.",
    options: {
      appeal: {
        label: "Apelar",
        success: "Sanción reducida. Te pierdes un solo partido.",
        failure: "La apelación molestó al tribunal, y la sanción aumentó.",
      },
      accept: { label: "Aceptar la sanción", result: "Cumples la sanción de siempre y sigues adelante." },
    },
  },
  boos: {
    title: "Silbidos",
    body: "La hinchada silba cada vez que tocas la pelota. El clima se puso pesado.",
    options: {
      fight: {
        label: "Darlo vuelta",
        result: "Enfrentas los silbidos. El comienzo es duro, pero la hinchada nota el esfuerzo.",
      },
      leave: { label: "Pedir salir", result: "{target} te ofrece un nuevo comienzo, y aceptas." },
    },
  },
  rowCoach: {
    title: "Pelea con el entrenador",
    body: "Una discusión con el entrenador llegó a la prensa.",
    options: {
      standGround: {
        label: "Sostener tu postura",
        success: "El vestuario está de tu lado. La hinchada también.",
        failure: "El entrenador gana la pulseada. Vas al banco.",
      },
      apologize: { label: "Pedir disculpas", result: "Pides disculpas en público. La imagen queda algo golpeada." },
    },
  },
  rowBoard: {
    title: "Pelea con la dirigencia",
    body: "Criticaste a la dirigencia en público, y el presidente exige una rectificación.",
    options: {
      standGround: {
        label: "No retroceder",
        success: "La hinchada te apoya, y la dirigencia retrocede.",
        failure: "La dirigencia no perdona. Te venden, y el club te cierra las puertas para siempre.",
      },
      apologize: { label: "Rectificarse", result: "Retrocedes. La imagen queda algo golpeada." },
    },
  },
  rowFans: {
    title: "Pelea con la hinchada",
    body: "Un grupo de la barra te rodea a la salida del entrenamiento. Los ánimos están caldeados.",
    options: {
      provoke: {
        label: "Enfrentarlos",
        success: "Los enfrentas y te ganas el respeto de la tribuna.",
        failure: "La hinchada te declara la guerra. Te echan del club y nunca más vuelves.",
      },
      apologize: { label: "Pedir disculpas", result: "Bajas el tono, y la relación mejora un poco." },
    },
  },
  prestigeShirt: {
    title: "Número de peso",
    body: "Un número histórico de tu puesto quedó libre en el club.",
    options: {
      number: { label: "Ponerse la {number}", result: "La {number} es tuya. Número pesado, exigencia incluida." },
      keep: { label: "Mantener el número", result: "Te quedas con el número de siempre." },
    },
  },
  homage: {
    title: "Homenaje",
    body: "El club quiere inmortalizar tu historia y te deja elegir el número de la camiseta.",
    options: {
      number: { label: "Ponerse la {number}", result: "La {number} ahora cuenta tu historia en el club." },
    },
  },
  seriousInjury: {
    title: "Lesión grave",
    body: "Rotura de ligamentos. Hay dos caminos para la recuperación.",
    options: {
      aggressive: { label: "Cirugía y vuelta rápida", result: "Vuelves antes, pero la rodilla nunca vuelve a ser la misma." },
      conservative: {
        label: "Tratamiento conservador",
        result: "La recuperación es larga. Te pierdes buena parte de la temporada, pero cuidas el cuerpo.",
      },
    },
  },
};
