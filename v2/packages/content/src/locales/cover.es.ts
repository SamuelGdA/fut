import type { CoverMessages } from "./cover.pt";

/**
 * Portada del diario de la temporada (GDD 21.2), escrita en español y no
 * traducida. Mismas reglas que el portugués: el nombre de club, liga, país o
 * competición nunca va tras artículo ni tras preposición que lo pida; entra
 * como sujeto o después de dos puntos.
 */
export const coverEs: CoverMessages = {
  papers: [
    "Gaceta del Gol",
    "Diario del Córner",
    "Correo del Césped",
    "Periódico de la Grada",
    "Hoja del Área Chica",
    "El Pitazo Final",
    "Tribuna del Potrero",
    "Revista Mediocampo",
  ],
  dateline: "Edición de {year}",
  angles: {
    perfect: {
      headlines: [
        "Triple corona: {surname} conquista liga, copa y continente",
        "{surname} gana todo lo que juega",
        "Todo lo que había para ganar",
        "Liga, copa y continente: el año perfecto de {surname}",
        "No quedó competición",
        "Barrió el año: {count} copas",
      ],
      support: [
        "Liga, copa nacional y el gran torneo del continente en la misma temporada.",
        "Una temporada para enmarcar.",
        "Una temporada así un club la tiene una vez por generación, si la tiene.",
        "Fueron {count} copas, y las tres que más pesan estaban entre ellas.",
      ],
    },
    worldChampion: {
      headlines: [
        "{surname}, campeón del mundo",
        "Copa del Mundo: {surname} levanta el trofeo",
        "El mundo es de {surname}",
        "Campeón del mundo a los {age}",
        "La estrella que faltaba en la camiseta",
      ],
      support: [
        "El título mundial de {year} lleva la firma de {surname}.",
        "El trofeo más pesado del fútbol vuelve a casa con él.",
        "A los {age} años entra en la lista más corta del fútbol: la de los campeones del mundo.",
      ],
    },
    bestInWorld: {
      headlines: [
        "{surname}, el mejor del mundo",
        "Balón de Oro: {surname} llega a la cima",
        "El Balón de Oro es suyo",
        "El año entero fue suyo",
        "Premio máximo y poca discusión",
        "El año fue suyo, y el trofeo lo confirma",
      ],
      support: [
        "La votación premia la mejor temporada del planeta.",
        "Ningún jugador del planeta hizo más que él este año.",
        "El premio al mejor del mundo confirma lo que el año entero venía diciendo.",
        "Después de una temporada así, elegir otro nombre habría sido difícil de justificar.",
        "A los {age}, se llevó el trofeo individual que todo jugador quiere.",
      ],
    },
    continentKing: {
      headlines: [
        "{competition}: {surname} es campeón",
        "{surname} conquista el continente",
        "Rey del continente",
        "Copa continental: y él estaba ahí",
        "{competition}: misión cumplida",
        "{club}: la noche esperada toda la vida",
      ],
      support: [
        "La copa más codiciada del continente cambia de dueño.",
        "Noche de final, y la fiesta termina con la copa en la mano.",
        "Una campaña entera para llegar a una sola noche, y {club} salió de ella con la copa.",
        "A los {age} años, su nombre entra en la lista de campeones continentales.",
        "Todo el continente miró, y fue {club} quien levantó la copa.",
      ],
    },
    collector: {
      headlines: [
        "{count} copas: {surname} llena la vitrina",
        "{surname} colecciona títulos en {year}",
        "{count} títulos. Una sola temporada.",
        "Coleccionista: {count} títulos en el año",
        "Una más, y otra: {count} en total",
        "{club}: la vitrina ya no cierra",
      ],
      support: [
        "Pocos jugadores levantan tantos trofeos en una sola temporada.",
        "La sala de trofeos va a necesitar más espacio.",
        "Fueron {count} títulos en una sola temporada, y él estuvo en todos.",
        "No todas valen lo mismo, pero son {count} y están todas en la vitrina.",
        "{count} títulos en una temporada: el año que un club les cuenta a sus nietos.",
      ],
    },
    nationGlory: {
      headlines: [
        "{competition}: {surname} campeón con la selección",
        "La selección es campeona, y {surname} brilla",
        "Campeón del continente con la camiseta de la selección",
        "{surname} lleva a la selección al título",
        "Copa continental para la selección de {surname}",
      ],
      support: [
        "El título con la selección corona el año.",
        "La selección vuelve a casa con la copa y con él en primer plano.",
        "Ganar con la selección pesa distinto: celebra el país entero.",
      ],
    },
    nationalChampion: {
      headlines: [
        "{league}: {surname} es campeón",
        "{surname} conquista el campeonato",
        "¡Campeón! {club} se queda con la liga",
        "El título vuelve a casa",
        "Campeón de liga a los {age}",
        "{club} en lo más alto, y él en medio de la fiesta",
      ],
      support: [
        "{club} termina la liga en lo más alto de la tabla.",
        "La campaña más regular del país termina con el título.",
        "Después de un campeonato entero, {club} terminó donde quería: primero.",
        "El título nacional llegó con {gamesText} suyos en la cuenta.",
      ],
    },
    honour: {
      headlines: [
        "{award} para {surname}",
        "{surname} recibe un premio de peso: {award}",
        "{award}: el premio tiene dueño",
        "Llegó el reconocimiento: {award}",
        "{award}, por fin, en manos de {surname}",
      ],
      support: [
        "Los números de la temporada hablan por él.",
        "El reconocimiento llega tras un año por encima de la media.",
        "Nadie en el campeonato se acercó a lo que hizo esta temporada.",
      ],
    },
    bestOfCompetition: {
      headlines: [
        "{surname}, el mejor del torneo: {competition}",
        "Nadie jugó mejor: {surname} es elegido el mejor",
        "Mejor jugador del torneo: {surname}",
        "El premio al mejor ya tiene dueño: {surname}",
        "{competition}: el mejor fue {surname}",
      ],
      support: [
        "Elegido el mejor jugador del torneo: {competition}.",
        "Fueron {gamesText} y {productionText} para convencer a los votantes.",
        "Una temporada por encima de todos le dio el premio al mejor: {competition}.",
      ],
    },
    scoringTitle: {
      headlines: [
        "{surname}, máximo goleador: {competition}",
        "Nadie marcó más que {surname}",
        "Goleador del torneo: {surname}",
        "El pichichi tiene nombre: {surname}",
        "{competition}: el título de goleador es de {surname}",
      ],
      support: [
        "Nadie marcó más en la competición: {competition}.",
        "Fueron {goalsText} en la temporada, y el título de goleador llegó con ellos.",
        "Olfato de gol de sobra: máximo goleador, {competition}.",
      ],
    },
    relegated: {
      headlines: [
        "{club} pierde la categoría",
        "Descenso: {club} no se salva",
        "Descenso consumado. ¿Y ahora?",
        "Segunda división: llegó la factura",
        "El año en que todo salió mal",
        "{club}: el año que la afición quiere olvidar",
      ],
      support: [
        "Una temporada para olvidar, con la segunda división en el horizonte.",
        "El descenso deja marcas en el plantel y en la grada.",
        "El descenso dolió, y el esfuerzo en la cancha no alcanzó para evitarlo.",
        "{club} baja, y el año queda marcado por el motivo equivocado.",
        "La temporada que prometía se volvió la más dura de su carrera.",
      ],
    },
    promoted: {
      headlines: [
        "{club} sube de categoría",
        "Ascenso: {club} sube a primera división",
        "Primera división, allá vamos",
        "¡Subió!",
        "Misión cumplida: {club} sube",
        "Ascenso conseguido a pulmón",
      ],
      support: [
        "La próxima temporada es en primera división.",
        "La fiesta del ascenso se apodera de la ciudad.",
        "Una temporada entera en segunda terminó de la única forma que importaba: subiendo.",
        "El ascenso llegó sufriendo, y {club} llega adonde quería.",
      ],
    },
    almost: {
      headlines: [
        "{surname} sube al podio del Balón de Oro",
        "Casi: {surname} termina {rank} en el Balón de Oro",
        "Entre los tres mejores del mundo",
        "Balón de Oro: {surname} es {rank}",
        "{surname} llama a la puerta de la cima del mundo",
      ],
      support: [
        "El premio se escapó, pero el mundo entero lo vio.",
        "Quedar entre los tres mejores del mundo ya es una hazaña rara.",
        "La temporada puso su nombre en la conversación sobre el mejor del planeta.",
      ],
    },
    debut: {
      headlines: [
        "{surname} debuta con la selección",
        "Primera convocatoria: {surname} viste la camiseta de la selección",
        "La selección llamó",
        "Convocado por primera vez",
        "La camiseta con la que soñaba ya es suya",
        "El seleccionador no pudo ignorarlo",
      ],
      support: [
        "A los {age} años, el debut con el que sueña todo chico.",
        "La primera convocatoria no se olvida.",
        "La llamada que todo jugador espera toda la vida llegó a los {age} años.",
        "Tras {gamesText} en la temporada, el seleccionador ya no pudo seguir ignorándolo.",
      ],
    },
    cup: {
      headlines: [
        "{competition}: {surname} levanta la copa",
        "{surname} es campeón de copa",
        "Eliminatoria tras eliminatoria, y la copa",
        "Llegó la copa",
        "Ronda a ronda, hasta levantarla",
        "Copa conquistada, fiesta hasta la mañana",
      ],
      support: [
        "Eliminatoria ganada, copa en la mano.",
        "La copa termina con fiesta y vuelta olímpica.",
        "La eliminatoria es otra cosa, y {club} aguantó hasta el último partido.",
        "La copa llegó, y él estuvo en cada ronda que importó.",
      ],
    },
    superCup: {
      headlines: [
        "{competition}: {club} se queda con el trofeo",
        "Partido único, copa en la mano",
        "Definición en noventa minutos, y fue para {club}",
        "Un partido, un trofeo",
        "Una final, una copa: {competition}",
      ],
      support: [
        "Un partido lo decidió, y {club} se llevó la copa.",
        "No es la copa más grande del calendario, pero es copa, y es suya.",
        "Título a partido único: noventa minutos y listo.",
      ],
    },
    trophy: {
      headlines: [
        "{competition}: otra copa para {surname}",
        "{surname} suma un título: {competition}",
        "{competition}: ¡campeón!",
        "Copa en la mano: {competition}",
        "{surname} cierra el año con título: {competition}",
      ],
      support: [
        "Un trofeo más en la cuenta de la temporada.",
        "Otra conquista para la colección.",
        "No es la copa más famosa del continente, pero pesa en la vitrina.",
      ],
    },
    record: {
      headlines: [
        "Récord: {surname} supera a {holder}",
        "{surname} entra en la historia: {record}",
        "{value}: {surname} rompe una marca histórica",
        "Cayó el récord de {holder}",
        "Nadie había llegado tan lejos",
      ],
      support: [
        "La marca de {holder} era {mark}. Ahora es suya: {value}.",
        "{record}: la mayor marca del fútbol de verdad tiene un nombre nuevo.",
        "Un número que nadie había alcanzado, ni siquiera {holder}.",
      ],
    },
    explosion: {
      headlines: [
        "{surname} explota y da que hablar",
        "La temporada del salto de {surname}",
        "Explotó: OVR {ovr} a los {age}",
        "¿De dónde salió este jugador?",
        "El salto que nadie vio venir",
        "A los {age}, otro nivel",
      ],
      support: [
        "La evolución se vio en cada partido.",
        "El salto de rendimiento llama la atención de todo el país.",
        "OVR {ovr} a los {age}: el salto que cambia el precio y el tamaño de una carrera.",
        "Entró en el año como promesa y salió como titular indiscutible.",
      ],
    },
    scorer: {
      headlines: [
        "{goalsText}: {surname} no para de marcar",
        "{surname}, máquina de goles",
        "{goals} goles. Sin más.",
        "La temporada de los {goals} goles",
        "Los porteros rivales no durmieron este año",
        "La artillería no paró",
      ],
      support: [
        "Pocos delanteros mueven la red tantas veces en un año.",
        "El gol se volvió rutina.",
        "{goals} goles en {gamesText}: el tipo de temporada que cambia el precio de un jugador.",
        "Cada defensa del campeonato pasó por él, y el marcador contó la historia.",
      ],
    },
    playmaker: {
      headlines: [
        "{assists} asistencias: el cerebro del equipo",
        "Todo pasa por los pies de {surname}",
        "El asistidor de la temporada",
        "{assists} pases que acabaron en gol",
        "El último pase siempre era suyo",
        "Quien juega con {surname} marca más",
      ],
      support: [
        "No decidieron los goles que marcó, sino los que dio.",
        "{assistsText}: cuando el equipo creó algo, casi siempre pasó por él.",
        "No fue el goleador, fue quien hizo existir al goleador.",
      ],
    },
    wall: {
      headlines: [
        "{cleanSheetsText}: {surname} cierra el arco",
        "{surname}, un muro",
        "{cleanSheets} partidos sin encajar",
        "¿Superarlo? Suerte con eso.",
        "El año en que la portería se cerró",
        "Atajar se volvió rutina",
      ],
      support: [
        "Pocos porteros pasan tanto tiempo sin ir a buscar la pelota al fondo de la red.",
        "Los delanteros del país pasaron el año intentándolo, sin éxito.",
        "{cleanSheets} partidos sin encajar: la temporada se construyó de atrás hacia adelante.",
      ],
    },
    injured: {
      headlines: [
        "Una lesión saca a {surname} de buena parte de la temporada",
        "{surname} pasa el año en la enfermería",
        "Un año perdido en la enfermería",
        "Más tiempo en la camilla que en el campo",
        "La temporada que la lesión le robó",
      ],
      support: [
        "Los partidos perdidos pesaron en el resultado del año.",
        "La recuperación pasa a ser la prioridad del próximo año.",
        "Más semanas de tratamiento que de entrenamiento: un año que la carrera querrá olvidar.",
        "La temporada existió en el papel, pero casi no existió en la cancha.",
      ],
    },
    suspended: {
      headlines: [
        "{surname} pasa la temporada sancionado",
        "La sanción deja a {surname} lejos de las canchas",
        "Un año en la grada",
        "Castigo duro: {surname} fuera del campo",
        "La sanción que costó una temporada",
      ],
      support: [
        "Un año entero sin pisar el campo.",
        "La vuelta a las canchas se vuelve cuenta regresiva.",
        "El calendario pasó, y él lo miró desde fuera.",
      ],
    },
    prospect: {
      headlines: [
        "A los {age}, {surname} sigue siendo apuesta de la cantera",
        "{surname} entrena con el primer equipo y espera su turno",
        "La promesa espera la oportunidad",
        "Paciencia: {surname} todavía es un chico",
        "El futuro todavía está en el banco",
      ],
      support: [
        "El lugar en el primer equipo todavía no llegó, y la edad juega a su favor.",
        "El primer equipo ya lo mira; solo falta la oportunidad.",
        "Por ahora, {gamesText} y mucho entrenamiento.",
      ],
    },
    forgotten: {
      headlines: [
        "{surname} desaparece del equipo",
        "Poco espacio para {surname}: {gamesText} en el año",
        "Olvidado en el banquillo",
        "Fuera de los planes",
        "El banco se volvió dirección fija",
      ],
      support: [
        "Sin minutos, la temporada le pasó de largo.",
        "El banquillo se volvió dirección fija.",
        "Sea cual sea el motivo, salió de los planes del entrenador.",
      ],
    },
    newAddress: {
      headlines: [
        "{club} presenta a {surname}",
        "{surname} cambia de club y empieza de cero",
        "Llegó, jugó, ¿y ahora?",
        "Primera temporada, primeras impresiones",
        "Vida nueva: {club}",
      ],
      support: [
        "Primera temporada con la camiseta nueva.",
        "Camiseta nueva, afición nueva, todo por demostrar.",
        "Campo nuevo, vestuario nuevo y una afición que aún se forma una idea.",
        "Fueron {gamesText} para entender el lugar nuevo.",
      ],
    },
    lastDance: {
      headlines: [
        "A los {age}, {surname} sigue en el campo",
        "¿El último baile de {surname}?",
        "El último baile",
        "¿Cuántos años le quedan?",
        "A los {age}, todavía en el campo",
      ],
      support: [
        "La edad pesa, pero la pelota todavía lo busca.",
        "Cada partido puede ser el último, y él juega como si lo fuera.",
        "El cuerpo cobra más caro cada año, pero las ganas siguen ahí.",
      ],
    },
    fading: {
      headlines: [
        "{surname} pierde fuerza",
        "¿El mejor momento de {surname} ya pasó?",
        "¿Empezó el declive?",
        "Ya no es el mismo",
        "El tiempo pasa factura",
        "Los números cayeron, y todos lo vieron",
      ],
      support: [
        "La caída de rendimiento enciende la alarma.",
        "Los números bajan, y la edad empieza a pesar.",
        "Las piernas ya no responden igual, y el club empezó a mirar a los más jóvenes.",
        "Por primera vez, apareció la pregunta sobre el final.",
      ],
    },
    steady: {
      headlines: [
        "{surname} cumple otra temporada",
        "Temporada de trabajo para {surname}",
        "Otro año de trabajo",
        "Ni héroe ni villano",
        "Sin titulares, pero con minutos",
        "Pasó el año, y la vida sigue",
      ],
      support: [
        "Sin gran titular, pero con la carrera avanzando.",
        "Otro año sumando partidos y experiencia.",
        "{gamesText}, {productionText}, y la rutina de quien hace el trabajo sin salir en portada.",
        "Sin grandes emociones esta temporada, lo que, para un profesional, no es el peor resultado.",
      ],
    },
  },
};
