import type { Locale } from "@/lib/i18n/context";
import type { BioFacts } from "./facts";

/**
 * Where in the arc a line belongs. The generator emits chapters in this order,
 * so a phrase never has to state when it happened — its chapter already does.
 */
export type BioChapter = "origins" | "rise" | "peak" | "twilight" | "legacy";

export const BIO_CHAPTER_ORDER: BioChapter[] = ["origins", "rise", "peak", "twilight", "legacy"];

/**
 * One thing that can be said about a career, in as many ways as we can write
 * it. `when` decides whether this career earned the line at all; the variants
 * exist purely so two similar careers still read like different articles.
 *
 * Variants must be interchangeable: the generator picks exactly one, and it
 * has to sit naturally beside whatever else its chapter selected. That means
 * no variant may assume another line came before it.
 */
export interface BioTopic {
  id: string;
  chapter: BioChapter;
  /** Ranked against other eligible topics when a chapter has more than it can print. */
  priority: number;
  when: (f: BioFacts) => boolean;
  /**
   * The age this line refers to, when it refers to a specific one. Lines that
   * have it are sorted chronologically against each other inside their
   * chapter, so "the first title at 30" can never be printed before "the first
   * call-up at 20". Lines without an age keep their authored position.
   */
  at?: (f: BioFacts) => number | null;
  variants: Record<Locale, string[]>;
}

/**
 * Tokens resolved against the career before rendering. Anything unmatched is
 * left in place rather than blanked, so a typo shows up loudly in testing
 * instead of silently eating half a sentence.
 */
export type BioVars = Record<string, string>;

const TOPICS: BioTopic[] = [];

function topic(t: BioTopic): void {
  TOPICS.push(t);
}

// ---------------------------------------------------------------------------
// Origins — where it started and what the first years looked like
// ---------------------------------------------------------------------------

topic({
  id: "origin_small_club",
  chapter: "origins",
  priority: 100,
  when: (f) => f.firstClub !== null && f.firstClub.reputation < 2,
  variants: {
    pt: [
      "A história começou longe dos holofotes, nas categorias de base do {firstClub}.",
      "Nada no início sugeria o que viria: um garoto de {nation} dando os primeiros passos no {firstClub}.",
      "O {firstClub} foi o ponto de partida — um clube pequeno, de estrutura modesta, mas que abriu a porta.",
      "Tudo nasceu no {firstClub}, onde poucos olhares se voltavam para as divisões de base.",
    ],
    es: [
      "La historia empezó lejos de los focos, en las inferiores del {firstClub}.",
      "Nada al principio sugería lo que vendría: un pibe de {nation} dando sus primeros pasos en el {firstClub}.",
      "El {firstClub} fue el punto de partida — un club chico, de estructura modesta, pero que abrió la puerta.",
      "Todo nació en el {firstClub}, donde pocas miradas se dirigían a las divisiones juveniles.",
    ],
    en: [
      "The story began a long way from the spotlight, in {firstClub}'s youth ranks.",
      "Nothing about the start suggested what was coming: a kid from {nation} taking their first steps at {firstClub}.",
      "{firstClub} was the starting point — a small club with modest facilities, but one that opened the door.",
      "It all began at {firstClub}, where barely anyone was watching the youth sides.",
    ],
  },
});

topic({
  id: "origin_big_club",
  chapter: "origins",
  priority: 100,
  when: (f) => f.firstClub !== null && f.firstClub.reputation >= 3.5,
  variants: {
    pt: [
      "Poucos jogadores começam onde {lastName} começou: na base de um gigante como o {firstClub}.",
      "A formação aconteceu no {firstClub}, um dos clubes mais exigentes que existem para um adolescente.",
      "Crescer no {firstClub} significava competir, desde cedo, com os melhores da mesma idade.",
      "O {firstClub} apostou cedo, e a base do clube virou a escola de {lastName}.",
    ],
    es: [
      "Pocos jugadores empiezan donde empezó {lastName}: en las inferiores de un gigante como el {firstClub}.",
      "La formación ocurrió en el {firstClub}, uno de los clubes más exigentes que existen para un adolescente.",
      "Crecer en el {firstClub} significaba competir, desde muy temprano, con los mejores de su edad.",
      "El {firstClub} apostó temprano, y la cantera del club se volvió la escuela de {lastName}.",
    ],
    en: [
      "Few players start where {lastName} started: in the academy of a giant like {firstClub}.",
      "The education happened at {firstClub}, one of the most demanding places a teenager can grow up.",
      "Growing up at {firstClub} meant competing with the best of the same age from very early on.",
      "{firstClub} backed them early, and the club's academy became {lastName}'s school.",
    ],
  },
});

topic({
  id: "origin_mid_club",
  chapter: "origins",
  priority: 90,
  when: (f) => f.firstClub !== null && f.firstClub.reputation >= 2 && f.firstClub.reputation < 3.5,
  variants: {
    pt: [
      "O {firstClub} foi o primeiro endereço profissional, um clube de estrutura sólida sem ser um gigante.",
      "A carreira começou no {firstClub}, ambiente competitivo o bastante para exigir, tranquilo o bastante para aprender.",
      "Foi no {firstClub} que a formação ganhou corpo, longe da pressão dos clubes de elite.",
      "O ponto de partida foi o {firstClub}, um clube de tradição respeitável no futebol de {nation}.",
    ],
    es: [
      "El {firstClub} fue el primer domicilio profesional, un club de estructura sólida sin ser un gigante.",
      "La carrera empezó en el {firstClub}, un ambiente competitivo como para exigir, tranquilo como para aprender.",
      "Fue en el {firstClub} donde la formación tomó cuerpo, lejos de la presión de los clubes de élite.",
      "El punto de partida fue el {firstClub}, un club de tradición respetable en el fútbol de {nation}.",
    ],
    en: [
      "{firstClub} was the first professional address, a well-run club without being a giant.",
      "The career started at {firstClub}, competitive enough to demand something, calm enough to learn in.",
      "It was at {firstClub} that the education took shape, away from the pressure of the elite clubs.",
      "The starting point was {firstClub}, a club with a respectable history in {nation}.",
    ],
  },
});

topic({
  id: "origin_position",
  chapter: "origins",
  priority: 70,
  when: () => true,
  variants: {
    pt: [
      "Desde os primeiros treinos, a função era clara: {position}.",
      "O posto de {position} apareceu cedo e nunca mais foi abandonado.",
      "Formado como {position}, foi ali que encontrou a versão mais natural do próprio jogo.",
      "A posição de {position} definiu a leitura de jogo desde a base.",
    ],
    es: [
      "Desde los primeros entrenamientos, la función estaba clara: {position}.",
      "El puesto de {position} apareció temprano y no se abandonó nunca más.",
      "Formado como {position}, fue ahí donde encontró la versión más natural de su propio juego.",
      "La posición de {position} definió su lectura de juego desde las inferiores.",
    ],
    en: [
      "From the first training sessions the role was obvious: {position}.",
      "The {position} slot arrived early and was never given up.",
      "Raised as a {position}, that was where the most natural version of the game showed up.",
      "The {position} role shaped how the game was read right from the academy.",
    ],
  },
});

topic({
  id: "origin_few_chances",
  chapter: "origins",
  priority: 95,
  when: (f) => f.benchSeasons >= 3 && f.spells.length > 1,
  variants: {
    pt: [
      "As oportunidades no início eram escassas, e o banco virou paisagem por temporadas seguidas.",
      "Os primeiros anos foram discretos, com pouco espaço entre os profissionais.",
      "Demorou para a chance aparecer: minutos contados, entradas no fim do jogo, pouca sequência.",
      "A promoção ao elenco principal veio, mas a confiança do treinador demorou bem mais.",
    ],
    es: [
      "Las oportunidades al principio eran escasas, y el banco se volvió paisaje por temporadas seguidas.",
      "Los primeros años fueron discretos, con poco espacio entre los profesionales.",
      "Tardó en aparecer la chance: minutos contados, entradas sobre el final, poca continuidad.",
      "El ascenso al plantel principal llegó, pero la confianza del técnico tardó bastante más.",
    ],
    en: [
      "Chances were scarce early on, and the bench became the view for season after season.",
      "The first few years were quiet, with little room among the senior players.",
      "The opening took its time: minutes counted out, late cameos, no real run of games.",
      "The promotion to the first-team squad came; the manager's trust took considerably longer.",
    ],
  },
});

topic({
  id: "origin_quick_starter",
  chapter: "origins",
  priority: 95,
  when: (f) => f.benchSeasons <= 1 && f.totalAppearances > 300,
  variants: {
    pt: [
      "A titularidade não demorou: em pouco tempo o nome já estava fixo na escalação.",
      "Foi um daqueles casos raros em que o juvenil vira titular quase sem escala.",
      "A adaptação ao futebol profissional foi imediata, com sequência de jogos desde cedo.",
      "Bastaram poucos meses para o treinador entender que ali havia um titular.",
    ],
    es: [
      "La titularidad no tardó: en poco tiempo el nombre ya estaba fijo en la formación.",
      "Fue uno de esos casos raros en que el juvenil se vuelve titular casi sin escalas.",
      "La adaptación al fútbol profesional fue inmediata, con continuidad desde muy temprano.",
      "Bastaron pocos meses para que el técnico entendiera que ahí había un titular.",
    ],
    en: [
      "A starting place didn't take long: the name was soon permanently on the team sheet.",
      "It was one of those rare cases where the teenager becomes a starter almost without a step in between.",
      "The adaptation to senior football was immediate, with a run of games from very early on.",
      "It took a few months for the manager to work out that this was a starter.",
    ],
  },
});

topic({
  id: "origin_loan_spell",
  chapter: "origins",
  priority: 85,
  when: (f) => f.loanCount === 1,
  variants: {
    pt: [
      "Veio então um empréstimo, a saída clássica para quem precisa jogar e não tinha espaço.",
      "Um empréstimo resolveu o impasse: era preciso jogar, e jogar exigia mudar de endereço.",
      "A cessão temporária foi o caminho encontrado para acumular minutos de verdade.",
      "O clube optou por emprestá-lo, e a decisão se mostrou acertada.",
    ],
    es: [
      "Vino entonces un préstamo, la salida clásica para quien necesita jugar y no tenía lugar.",
      "Un préstamo resolvió el impasse: había que jugar, y jugar exigía cambiar de domicilio.",
      "La cesión temporal fue el camino encontrado para acumular minutos de verdad.",
      "El club optó por cederlo, y la decisión se mostró acertada.",
    ],
    en: [
      "Then came a loan, the classic route for someone who needs to play and has nowhere to do it.",
      "A loan broke the deadlock: games were needed, and games meant a change of address.",
      "The temporary move was the route chosen to build up some genuine minutes.",
      "The club decided to loan them out, and the decision proved a good one.",
    ],
  },
});

topic({
  id: "origin_many_loans",
  chapter: "origins",
  priority: 90,
  when: (f) => f.loanCount >= 2,
  variants: {
    pt: [
      "Foram vários empréstimos seguidos, uma sequência de mudanças em busca de continuidade.",
      "A carreira passou por uma fase de cessões consecutivas, cada uma prometendo ser a definitiva.",
      "Rodou por empréstimos sucessivos, sempre com a mesma missão: jogar o suficiente para provar algo.",
      "Um empréstimo puxou o outro, e o começo virou uma peregrinação por clubes diferentes.",
    ],
    es: [
      "Fueron varios préstamos seguidos, una secuencia de mudanzas en busca de continuidad.",
      "La carrera pasó por una fase de cesiones consecutivas, cada una prometiendo ser la definitiva.",
      "Rodó por préstamos sucesivos, siempre con la misma misión: jugar lo suficiente para probar algo.",
      "Un préstamo llevó al otro, y el comienzo se volvió una peregrinación por clubes distintos.",
    ],
    en: [
      "There were several loans in a row, a run of moves in search of continuity.",
      "The career went through a phase of consecutive loan spells, each one promising to be the decisive one.",
      "They went from loan to loan, always with the same brief: play enough to prove something.",
      "One loan led to another, and the early years turned into a tour of different clubs.",
    ],
  },
});

topic({
  id: "origin_abroad_early",
  chapter: "origins",
  priority: 88,
  when: (f) => f.wentAbroadEarly,
  variants: {
    pt: [
      "A saída de {nation} veio cedo, ainda na casa dos vinte anos, antes mesmo de se firmar por completo.",
      "Não demorou para o futebol estrangeiro bater à porta, e a mudança de país aconteceu muito jovem.",
      "Trocou o futebol de {nation} pelo exterior antes de completar 21 anos, uma aposta arriscada.",
      "A primeira grande decisão foi geográfica: sair de {nation} cedo, com a carreira ainda por construir.",
    ],
    es: [
      "La salida de {nation} llegó temprano, todavía en los veinte, antes incluso de afirmarse del todo.",
      "No tardó en llamar el fútbol extranjero, y el cambio de país ocurrió muy joven.",
      "Cambió el fútbol de {nation} por el exterior antes de cumplir 21 años, una apuesta arriesgada.",
      "La primera gran decisión fue geográfica: salir de {nation} temprano, con la carrera por construir.",
    ],
    en: [
      "The move out of {nation} came early, still barely into their twenties, before they were even established.",
      "Foreign football came calling soon enough, and the move abroad happened very young.",
      "They swapped {nation} for a league abroad before turning 21, a genuine gamble.",
      "The first big decision was a geographical one: leaving {nation} early, with the career still unbuilt.",
    ],
  },
});

topic({
  id: "origin_shirt_number",
  chapter: "origins",
  priority: 40,
  when: (f) => f.shirtNumber !== null,
  variants: {
    pt: [
      "O número {number} apareceu cedo nas costas e acabou virando marca registrada.",
      "A camisa {number} colou no nome e atravessou a carreira inteira.",
      "Ficou conhecido pela {number}, o número que a lista de inscritos entregou e nunca mais tirou.",
      "A {number} virou parte da identidade, tanto quanto o próprio sobrenome.",
    ],
    es: [
      "El número {number} apareció temprano en la espalda y terminó siendo marca registrada.",
      "La camiseta {number} se pegó al nombre y atravesó la carrera entera.",
      "Se lo conoció por la {number}, el número que la lista de inscritos entregó y nunca más sacó.",
      "La {number} se volvió parte de la identidad, tanto como el propio apellido.",
    ],
    en: [
      "The number {number} appeared on their back early and ended up a trademark.",
      "The {number} shirt stuck to the name and lasted the whole career.",
      "They became known for the {number}, the number the squad list handed over and never took back.",
      "The {number} became part of the identity, as much as the surname itself.",
    ],
  },
});

// ---------------------------------------------------------------------------
// Rise — the years the career turned into something
// ---------------------------------------------------------------------------

topic({
  id: "rise_meteoric",
  chapter: "rise",
  priority: 100,
  when: (f) => f.meteoric,
  variants: {
    pt: [
      "A ascensão foi vertiginosa: antes dos 22 anos já era um jogador de primeiro nível.",
      "O salto aconteceu rápido demais para ser normal — em poucas temporadas, saiu de promessa a nome feito.",
      "Não houve travessia lenta. A explosão veio cedo e mudou a escala da carreira de uma vez.",
      "Queimou etapas de um jeito que quase ninguém queima, e ainda muito jovem já era peça central.",
    ],
    es: [
      "El ascenso fue vertiginoso: antes de los 22 años ya era un jugador de primer nivel.",
      "El salto ocurrió demasiado rápido para ser normal — en pocas temporadas pasó de promesa a nombre hecho.",
      "No hubo travesía lenta. La explosión llegó temprano y cambió la escala de la carrera de una vez.",
      "Quemó etapas como casi nadie las quema, y siendo muy joven ya era pieza central.",
    ],
    en: [
      "The rise was vertiginous: a genuinely top-level player before turning 22.",
      "The jump happened too quickly to be normal — in a handful of seasons, from prospect to established name.",
      "There was no slow climb. The breakthrough came early and changed the scale of the career at once.",
      "They skipped steps almost nobody skips, and were already central to a team while very young.",
    ],
  },
});

topic({
  id: "rise_late_bloomer",
  chapter: "rise",
  priority: 100,
  when: (f) => f.lateBloomer,
  variants: {
    pt: [
      "A explosão demorou. Só perto dos trinta o futebol finalmente se encaixou.",
      "Foi um caso clássico de maturação tardia: o melhor futebol apareceu quando muitos já pensam em desacelerar.",
      "Levou tempo — anos, na verdade — até o jogo fazer sentido no nível mais alto.",
      "A carreira só decolou de verdade numa idade em que a maioria já atingiu o teto.",
    ],
    es: [
      "La explosión tardó. Recién cerca de los treinta el fútbol finalmente encajó.",
      "Fue un caso clásico de maduración tardía: el mejor fútbol apareció cuando muchos ya piensan en bajar el ritmo.",
      "Llevó tiempo — años, en realidad — hasta que el juego tuviera sentido al máximo nivel.",
      "La carrera despegó de verdad a una edad en la que la mayoría ya tocó su techo.",
    ],
    en: [
      "The breakthrough took its time. Only near thirty did the football finally click.",
      "It was a classic late developer: the best years arrived when many are already winding down.",
      "It took time — years, really — for the game to make sense at the highest level.",
      "The career properly took off at an age where most players have already hit their ceiling.",
    ],
  },
});

topic({
  id: "rise_mid_club_breakout",
  chapter: "rise",
  priority: 90,
  at: (f) => f.breakoutClub?.from ?? null,
  when: (f) => f.breakoutClub !== null,
  variants: {
    pt: [
      "A virada aconteceu no {breakoutClub}, onde finalmente teve a bola e a confiança nos pés.",
      "Foi no {breakoutClub}, longe dos gigantes, que o futebol apareceu inteiro.",
      "Precisou de um clube que apostasse de verdade, e o {breakoutClub} apostou.",
      "O salto de qualidade veio no {breakoutClub}, num elenco em que era peça central.",
    ],
    es: [
      "El quiebre ocurrió en el {breakoutClub}, donde finalmente tuvo la pelota y la confianza.",
      "Fue en el {breakoutClub}, lejos de los gigantes, donde el fútbol apareció entero.",
      "Necesitó un club que apostara de verdad, y el {breakoutClub} apostó.",
      "El salto de calidad llegó en el {breakoutClub}, en un plantel donde era pieza central.",
    ],
    en: [
      "The turning point came at {breakoutClub}, where the ball and the trust finally arrived together.",
      "It was at {breakoutClub}, away from the giants, that the football showed up in full.",
      "It needed a club willing to genuinely back them, and {breakoutClub} did.",
      "The step up came at {breakoutClub}, in a squad where they were central to everything.",
    ],
  },
});

topic({
  id: "rise_joined_giant",
  chapter: "rise",
  priority: 93,
  at: (f) => f.giantMoveAge,
  when: (f) => f.giantMoveAge !== null,
  variants: {
    pt: [
      "Aos {giantMoveAge} anos veio a transferência que muda tudo: o {giantClub} bateu à porta.",
      "O {giantClub} apareceu aos {giantMoveAge}, e com ele um patamar completamente diferente de exigência.",
      "A mudança para o {giantClub}, aos {giantMoveAge}, colocou a carreira sob outro tipo de holofote.",
      "Aos {giantMoveAge} anos assinou com o {giantClub} — o salto que separa jogador bom de jogador grande.",
    ],
    es: [
      "A los {giantMoveAge} años llegó la transferencia que cambia todo: el {giantClub} golpeó la puerta.",
      "El {giantClub} apareció a los {giantMoveAge}, y con él un nivel de exigencia completamente distinto.",
      "El pase al {giantClub}, a los {giantMoveAge}, puso la carrera bajo otro tipo de foco.",
      "A los {giantMoveAge} años firmó con el {giantClub} — el salto que separa al buen jugador del grande.",
    ],
    en: [
      "At {giantMoveAge} came the transfer that changes everything: {giantClub} came calling.",
      "{giantClub} arrived at {giantMoveAge}, and with them a completely different level of demand.",
      "The move to {giantClub} at {giantMoveAge} put the career under a different kind of spotlight.",
      "At {giantMoveAge} they signed for {giantClub} — the jump that separates a good player from a big one.",
    ],
  },
});

topic({
  id: "twilight_veteran_voice",
  chapter: "twilight",
  priority: 72,
  when: (f) => f.retirementAge >= 34 && f.totalAppearances >= 400 && !f.trophyless,
  variants: {
    pt: [
      "Nos últimos anos o papel mudou: menos protagonismo em campo, mais peso no vestiário.",
      "Virou o veterano a quem os mais novos perguntavam as coisas antes de perguntar ao treinador.",
      "A experiência acumulada passou a valer tanto quanto as pernas.",
      "No fim, jogava menos e ensinava mais — função que nem todo grande jogador aceita bem.",
    ],
    es: [
      "En los últimos años el rol cambió: menos protagonismo en la cancha, más peso en el vestuario.",
      "Se volvió el veterano al que los más jóvenes preguntaban antes de preguntarle al técnico.",
      "La experiencia acumulada pasó a valer tanto como las piernas.",
      "Al final jugaba menos y enseñaba más — función que no todo gran jugador acepta bien.",
    ],
    en: [
      "In the final years the role changed: less of the spotlight on the pitch, more weight in the dressing room.",
      "They became the senior pro the young ones asked before they asked the manager.",
      "The accumulated experience came to matter as much as the legs did.",
      "By the end they played less and taught more — a role not every great player takes well.",
    ],
  },
});

topic({
  id: "rise_first_league",
  at: (f) => f.firstLeagueAge,
  chapter: "rise",
  priority: 95,
  when: (f) => f.firstLeagueAge !== null,
  variants: {
    pt: [
      "O primeiro título nacional chegou aos {firstLeagueAge} anos, e com ele a sensação de pertencer àquele nível.",
      "Aos {firstLeagueAge} anos veio a primeira liga — o tipo de conquista que reorganiza uma carreira.",
      "A primeira medalha de campeão nacional foi conquistada aos {firstLeagueAge}, encerrando qualquer dúvida.",
      "Foi aos {firstLeagueAge} anos que o nome apareceu pela primeira vez numa lista de campeões nacionais.",
    ],
    es: [
      "El primer título nacional llegó a los {firstLeagueAge} años, y con él la sensación de pertenecer a ese nivel.",
      "A los {firstLeagueAge} años llegó la primera liga — el tipo de conquista que reorganiza una carrera.",
      "La primera medalla de campeón nacional se consiguió a los {firstLeagueAge}, cerrando cualquier duda.",
      "Fue a los {firstLeagueAge} años que el nombre apareció por primera vez en una lista de campeones nacionales.",
    ],
    en: [
      "The first league title arrived at {firstLeagueAge}, and with it the sense of belonging at that level.",
      "At {firstLeagueAge} came the first championship — the kind of win that reorganises a career.",
      "The first domestic winners' medal was collected at {firstLeagueAge}, ending any lingering doubt.",
      "It was at {firstLeagueAge} that the name appeared on a list of national champions for the first time.",
    ],
  },
});

topic({
  id: "rise_first_cup",
  at: (f) => f.firstCupAge,
  chapter: "rise",
  priority: 70,
  when: (f) => f.firstCupAge !== null && f.firstLeagueAge === null,
  variants: {
    pt: [
      "A primeira taça veio numa copa nacional, aos {firstCupAge} anos — a prova de que dava para vencer.",
      "Aos {firstCupAge} anos ergueu o primeiro troféu da carreira, num torneio de mata-mata.",
      "O primeiro título saiu numa campanha de copa, aos {firstCupAge}, e mudou o patamar do vestiário.",
      "Foi numa copa, aos {firstCupAge} anos, que a prateleira finalmente deixou de estar vazia.",
    ],
    es: [
      "La primera copa llegó en un torneo nacional, a los {firstCupAge} años — la prueba de que se podía ganar.",
      "A los {firstCupAge} años levantó el primer trofeo de la carrera, en un torneo de eliminación directa.",
      "El primer título salió en una campaña de copa, a los {firstCupAge}, y cambió el nivel del vestuario.",
      "Fue en una copa, a los {firstCupAge} años, que la vitrina finalmente dejó de estar vacía.",
    ],
    en: [
      "The first trophy came in a domestic cup at {firstCupAge} — proof that winning was possible.",
      "At {firstCupAge} they lifted the first trophy of the career, in a knockout competition.",
      "The first title came from a cup run at {firstCupAge}, and it changed the dressing room's standards.",
      "It was in a cup, at {firstCupAge}, that the trophy cabinet finally stopped being empty.",
    ],
  },
});

topic({
  id: "rise_first_call_up",
  at: (f) => f.firstCallUpAge,
  chapter: "rise",
  priority: 92,
  when: (f) => f.firstCallUpAge !== null,
  variants: {
    pt: [
      "A convocação para a seleção de {nation} veio aos {firstCallUpAge} anos e mudou o tamanho do nome.",
      "Aos {firstCallUpAge} anos veio o chamado da seleção — a confirmação de que o trabalho tinha sido notado.",
      "A primeira convocação chegou aos {firstCallUpAge}, e vestir a camisa de {nation} passou a ser rotina.",
      "O telefonema da seleção de {nation} aconteceu aos {firstCallUpAge} anos.",
    ],
    es: [
      "La convocatoria a la selección de {nation} llegó a los {firstCallUpAge} años y cambió el tamaño del nombre.",
      "A los {firstCallUpAge} años llegó el llamado de la selección — la confirmación de que el trabajo se había notado.",
      "La primera convocatoria llegó a los {firstCallUpAge}, y vestir la camiseta de {nation} pasó a ser rutina.",
      "El llamado de la selección de {nation} ocurrió a los {firstCallUpAge} años.",
    ],
    en: [
      "The {nation} call-up came at {firstCallUpAge} and changed the size of the name.",
      "At {firstCallUpAge} the international call arrived — confirmation that the work had been noticed.",
      "The first call-up came at {firstCallUpAge}, and wearing the {nation} shirt became routine.",
      "The phone call from {nation} came at {firstCallUpAge}.",
    ],
  },
});

topic({
  id: "rise_promotion",
  chapter: "rise",
  priority: 80,
  when: (f) => f.promotions >= 1,
  variants: {
    pt: [
      "Houve também um acesso conquistado no sacrifício, dessas campanhas que unem um clube inteiro.",
      "Uma temporada na divisão de baixo terminou com subida — e com o nome ligado para sempre àquela campanha.",
      "Ajudou a tirar um clube da segunda divisão, façanha que costuma valer mais que muito título.",
      "O acesso veio depois de uma temporada longa, decidida nos detalhes.",
    ],
    es: [
      "Hubo también un ascenso conseguido a pulmón, de esas campañas que unen a un club entero.",
      "Una temporada en la división de abajo terminó con el ascenso — y con el nombre ligado para siempre a esa campaña.",
      "Ayudó a sacar a un club de la segunda división, hazaña que suele valer más que muchos títulos.",
      "El ascenso llegó después de una temporada larga, definida en los detalles.",
    ],
    en: [
      "There was a promotion earned the hard way too, the kind of season that binds a whole club together.",
      "A year in the division below ended in promotion — and the name tied forever to that campaign.",
      "They helped drag a club out of the second tier, a feat often worth more than a shelf of medals.",
      "Promotion came at the end of a long season, settled in the small margins.",
    ],
  },
});

topic({
  id: "rise_severe_injury",
  chapter: "rise",
  priority: 100,
  at: (f) => f.severeInjuryAge,
  when: (f) => f.severeInjuryAge !== null,
  variants: {
    pt: [
      "Aos {severeInjuryAge} anos veio a lesão que divide a carreira em antes e depois.",
      "Uma lesão grave aos {severeInjuryAge} tirou uma temporada inteira — e levou junto parte do que ainda estava por vir.",
      "O corpo cedeu aos {severeInjuryAge} anos, e a recuperação devolveu um jogador parecido, mas não o mesmo.",
      "Aos {severeInjuryAge} anos o joelho cobrou tudo de uma vez, e o teto da carreira baixou para sempre.",
    ],
    es: [
      "A los {severeInjuryAge} años llegó la lesión que parte la carrera en antes y después.",
      "Una lesión grave a los {severeInjuryAge} le sacó una temporada entera — y se llevó parte de lo que faltaba por venir.",
      "El cuerpo cedió a los {severeInjuryAge} años, y la recuperación devolvió un jugador parecido, pero no el mismo.",
      "A los {severeInjuryAge} años la rodilla cobró todo de golpe, y el techo de la carrera bajó para siempre.",
    ],
    en: [
      "At {severeInjuryAge} came the injury that splits a career into before and after.",
      "A serious injury at {severeInjuryAge} cost a whole season — and took part of what was still to come with it.",
      "The body gave way at {severeInjuryAge}, and rehab handed back a similar player, but not the same one.",
      "At {severeInjuryAge} the knee took everything at once, and the career's ceiling dropped for good.",
    ],
  },
});

topic({
  id: "rise_relegation",
  chapter: "rise",
  priority: 82,
  when: (f) => f.relegations >= 1,
  variants: {
    pt: [
      "Nem tudo foi ascendente: houve um rebaixamento pelo caminho, com tudo que ele carrega.",
      "A carreira também conheceu a queda de divisão, experiência que endurece qualquer jogador.",
      "Um rebaixamento marcou o percurso, e a temporada seguinte começou num degrau abaixo.",
      "Passou pelo pior cenário possível para um elenco: cair de divisão e ter que reconstruir.",
    ],
    es: [
      "No todo fue ascendente: hubo un descenso en el camino, con todo lo que eso carga.",
      "La carrera también conoció la caída de categoría, experiencia que endurece a cualquier jugador.",
      "Un descenso marcó el recorrido, y la temporada siguiente empezó un escalón más abajo.",
      "Pasó por el peor escenario posible para un plantel: descender y tener que reconstruir.",
    ],
    en: [
      "Not everything went upwards: there was a relegation along the way, with everything that carries.",
      "The career also went through going down a division, an experience that hardens any player.",
      "A relegation marked the path, and the following season started a rung lower.",
      "They lived through the worst scenario a squad can face: going down, and having to rebuild.",
    ],
  },
});

topic({
  id: "rise_journeyman",
  chapter: "rise",
  priority: 78,
  when: (f) => f.journeyman,
  variants: {
    pt: [
      "Rodou bastante: foram muitos clubes, muitos vestiários, muitas readaptações.",
      "A carreira teve endereços demais para caber num parágrafo curto — mudar de clube virou hábito.",
      "Poucos jogadores conhecem tantos vestiários quanto {lastName} conheceu.",
      "Foi um andarilho do futebol, sempre atrás do projeto que finalmente encaixasse.",
    ],
    es: [
      "Rodó bastante: fueron muchos clubes, muchos vestuarios, muchas readaptaciones.",
      "La carrera tuvo demasiados domicilios para caber en un párrafo corto — cambiar de club se volvió hábito.",
      "Pocos jugadores conocen tantos vestuarios como los que conoció {lastName}.",
      "Fue un trotamundos del fútbol, siempre detrás del proyecto que finalmente encajara.",
    ],
    en: [
      "They moved around a lot: many clubs, many dressing rooms, many fresh starts.",
      "The career had too many addresses to fit in a short paragraph — moving became a habit.",
      "Few players know as many dressing rooms as {lastName} came to know.",
      "They were a footballing wanderer, always chasing the project that would finally fit.",
    ],
  },
});

topic({
  id: "rise_abroad_multi",
  chapter: "rise",
  priority: 74,
  when: (f) => f.countriesPlayedIn >= 3,
  variants: {
    pt: [
      "Jogou em países diferentes, adaptando o jogo a culturas futebolísticas que pouco se parecem.",
      "A carreira cruzou fronteiras mais de uma vez, e cada liga exigiu uma versão diferente do jogador.",
      "Foram vários campeonatos nacionais distintos, cada um com suas próprias exigências.",
      "Poucos se adaptam a tantos futebóis diferentes quanto este currículo mostra.",
    ],
    es: [
      "Jugó en países distintos, adaptando el juego a culturas futbolísticas que poco se parecen.",
      "La carrera cruzó fronteras más de una vez, y cada liga exigió una versión diferente del jugador.",
      "Fueron varios campeonatos nacionales distintos, cada uno con sus propias exigencias.",
      "Pocos se adaptan a tantos fútboles diferentes como muestra este currículum.",
    ],
    en: [
      "They played in several countries, adapting the game to footballing cultures with little in common.",
      "The career crossed borders more than once, and each league demanded a different version of the player.",
      "There were several different national championships, each with its own demands.",
      "Few players adapt to as many different kinds of football as this CV shows.",
    ],
  },
});

// ---------------------------------------------------------------------------
// Peak — the best years, and what they produced
// ---------------------------------------------------------------------------

topic({
  id: "peak_level",
  at: (f) => f.peakAge,
  chapter: "peak",
  priority: 100,
  when: (f) => f.peakOverall >= 85,
  variants: {
    pt: [
      "No auge, aos {peakAge} anos, estava entre os melhores do mundo na posição.",
      "O pico chegou aos {peakAge}: um nível que pouquíssimos jogadores alcançam em qualquer geração.",
      "Aos {peakAge} anos atingiu um patamar de elite absoluta, com desempenho de referência mundial.",
      "A melhor versão apareceu aos {peakAge} anos, e era simplesmente de outro nível.",
    ],
    es: [
      "En su plenitud, a los {peakAge} años, estaba entre los mejores del mundo en el puesto.",
      "El pico llegó a los {peakAge}: un nivel que poquísimos jugadores alcanzan en cualquier generación.",
      "A los {peakAge} años alcanzó un escalón de élite absoluta, con rendimiento de referencia mundial.",
      "La mejor versión apareció a los {peakAge} años, y era sencillamente de otro nivel.",
    ],
    en: [
      "At their peak, aged {peakAge}, they were among the best in the world in the position.",
      "The peak came at {peakAge}: a level very few players reach in any generation.",
      "At {peakAge} they hit genuinely elite territory, performing as a global reference point.",
      "The best version arrived at {peakAge}, and it was simply on another level.",
    ],
  },
});

topic({
  id: "peak_level_good",
  at: (f) => f.peakAge,
  chapter: "peak",
  priority: 95,
  when: (f) => f.peakOverall >= 75 && f.peakOverall < 85,
  variants: {
    pt: [
      "O melhor momento veio aos {peakAge} anos, num nível sólido de primeira divisão.",
      "Aos {peakAge} anos alcançou o auge: titular indiscutível, confiável, respeitado pelos adversários.",
      "O pico técnico apareceu aos {peakAge}, longe do estrelato absoluto mas firme entre os bons.",
      "A melhor fase foi aos {peakAge} anos, quando virou peça que nenhum treinador tirava do time.",
    ],
    es: [
      "El mejor momento llegó a los {peakAge} años, en un nivel sólido de primera división.",
      "A los {peakAge} años alcanzó su plenitud: titular indiscutido, confiable, respetado por los rivales.",
      "El pico técnico apareció a los {peakAge}, lejos del estrellato absoluto pero firme entre los buenos.",
      "La mejor etapa fue a los {peakAge} años, cuando se volvió pieza que ningún técnico sacaba del equipo.",
    ],
    en: [
      "The best spell came at {peakAge}, at a solid top-division level.",
      "At {peakAge} they hit their peak: an undroppable starter, dependable, respected by opponents.",
      "The technical peak arrived at {peakAge}, short of stardom but firmly among the good ones.",
      "The best years came at {peakAge}, when they became a player no manager took out of the side.",
    ],
  },
});

topic({
  id: "peak_level_modest",
  chapter: "peak",
  priority: 90,
  when: (f) => f.modestCareer,
  variants: {
    pt: [
      "Nunca chegou ao estrelato, mas construiu uma carreira honesta e cheia de trabalho.",
      "O teto ficou abaixo do que a base prometia — ainda assim, foram anos de futebol profissional de verdade.",
      "Faltou aquele salto final. O que sobrou foi consistência e um vestiário que sempre o respeitou.",
      "A carreira se estabilizou num patamar discreto, sem grandes vitrines, com muito suor.",
    ],
    es: [
      "Nunca llegó al estrellato, pero construyó una carrera honesta y llena de trabajo.",
      "El techo quedó por debajo de lo que las inferiores prometían — aun así, fueron años de fútbol profesional de verdad.",
      "Faltó ese salto final. Lo que quedó fue consistencia y un vestuario que siempre lo respetó.",
      "La carrera se estabilizó en un escalón discreto, sin grandes vidrieras, con mucho sudor.",
    ],
    en: [
      "Stardom never arrived, but an honest career full of hard work was built instead.",
      "The ceiling landed below what the academy years promised — still, these were real professional seasons.",
      "The final jump never came. What remained was consistency and a dressing room that always respected them.",
      "The career settled at a quiet level, without big showcases, with plenty of sweat.",
    ],
  },
});

topic({
  id: "peak_best_season",
  at: (f) => f.bestSeason?.age ?? null,
  chapter: "peak",
  priority: 96,
  when: (f) => f.bestSeason !== null && !f.isGoalkeeper && f.bestSeason.goals + f.bestSeason.assists >= 12,
  variants: {
    pt: [
      "A melhor temporada foi aos {bestAge} anos, pelo {bestClub}: {bestGoals} gols e {bestAssists} assistências em {bestApps} jogos.",
      "Aos {bestAge} anos, no {bestClub}, produziu a temporada da vida — {bestGoals} gols e {bestAssists} assistências.",
      "O ano de {bestAge} anos ficou marcado: {bestGoals} gols, {bestAssists} assistências, {bestApps} partidas pelo {bestClub}.",
      "Nenhuma temporada superou a que fez aos {bestAge} pelo {bestClub}: {bestGoals} gols em {bestApps} jogos.",
    ],
    es: [
      "La mejor temporada fue a los {bestAge} años, en el {bestClub}: {bestGoals} goles y {bestAssists} asistencias en {bestApps} partidos.",
      "A los {bestAge} años, en el {bestClub}, produjo la temporada de su vida — {bestGoals} goles y {bestAssists} asistencias.",
      "El año de los {bestAge} quedó marcado: {bestGoals} goles, {bestAssists} asistencias, {bestApps} partidos en el {bestClub}.",
      "Ninguna temporada superó a la que hizo a los {bestAge} en el {bestClub}: {bestGoals} goles en {bestApps} partidos.",
    ],
    en: [
      "The best season came at {bestAge}, with {bestClub}: {bestGoals} goals and {bestAssists} assists in {bestApps} games.",
      "At {bestAge}, at {bestClub}, they produced the season of a lifetime — {bestGoals} goals and {bestAssists} assists.",
      "The year they turned {bestAge} stands out: {bestGoals} goals, {bestAssists} assists, {bestApps} appearances for {bestClub}.",
      "No season topped the one at {bestAge} with {bestClub}: {bestGoals} goals in {bestApps} matches.",
    ],
  },
});

topic({
  id: "peak_best_season_gk",
  at: (f) => f.bestSeason?.age ?? null,
  chapter: "peak",
  priority: 96,
  when: (f) => f.bestSeason !== null && f.isGoalkeeper,
  variants: {
    pt: [
      "A temporada mais sólida veio aos {bestAge} anos pelo {bestClub}, com {bestApps} jogos de regularidade rara.",
      "Aos {bestAge} anos, defendendo o {bestClub}, viveu o melhor momento debaixo das traves.",
      "O ápice como goleiro aconteceu aos {bestAge}, num ano em que praticamente não falhou pelo {bestClub}.",
      "Foi aos {bestAge} anos, no {bestClub}, que a meta virou território praticamente intransponível.",
    ],
    es: [
      "La temporada más sólida llegó a los {bestAge} años en el {bestClub}, con {bestApps} partidos de regularidad rara.",
      "A los {bestAge} años, defendiendo al {bestClub}, vivió su mejor momento bajo los tres palos.",
      "El ápice como arquero ocurrió a los {bestAge}, en un año en que prácticamente no falló en el {bestClub}.",
      "Fue a los {bestAge} años, en el {bestClub}, que el arco se volvió territorio prácticamente infranqueable.",
    ],
    en: [
      "The most solid season came at {bestAge} with {bestClub}, {bestApps} games of rare consistency.",
      "At {bestAge}, keeping goal for {bestClub}, they had their best spell between the posts.",
      "The peak as a keeper came at {bestAge}, a year in which they barely made a mistake for {bestClub}.",
      "It was at {bestAge}, at {bestClub}, that the goal became close to impassable.",
    ],
  },
});

topic({
  id: "peak_prolific",
  chapter: "peak",
  priority: 85,
  when: (f) => !f.isGoalkeeper && f.totalGoals >= 250,
  variants: {
    pt: [
      "O faro de gol foi a marca da carreira: {goals} gols somados ao longo dos anos.",
      "Terminou com {goals} gols oficiais, número que coloca qualquer atacante numa conversa séria.",
      "Poucos artilheiros da geração chegaram perto dos {goals} gols que acumulou.",
      "A conta final de gols fechou em {goals}, construída temporada após temporada.",
    ],
    es: [
      "El olfato de gol fue la marca de la carrera: {goals} goles sumados a lo largo de los años.",
      "Terminó con {goals} goles oficiales, número que mete a cualquier delantero en una conversación seria.",
      "Pocos goleadores de la generación se acercaron a los {goals} goles que acumuló.",
      "La cuenta final de goles cerró en {goals}, construida temporada tras temporada.",
    ],
    en: [
      "The eye for goal defined the career: {goals} goals across the years.",
      "They finished with {goals} official goals, a number that puts any forward in a serious conversation.",
      "Few scorers of the generation came close to the {goals} goals they accumulated.",
      "The final goal tally closed at {goals}, built season after season.",
    ],
  },
});

topic({
  id: "peak_creator",
  chapter: "peak",
  priority: 80,
  when: (f) => !f.isGoalkeeper && f.totalAssists >= 90,
  variants: {
    pt: [
      "Se o gol veio, o passe veio junto: {assists} assistências no total.",
      "Foi tão decisivo servindo quanto finalizando, com {assists} passes para gol na carreira.",
      "As {assists} assistências dizem tanto quanto os gols sobre o tipo de jogador que era.",
      "Distribuiu {assists} assistências ao longo dos anos, sempre enxergando o companheiro melhor posicionado.",
    ],
    es: [
      "Si llegó el gol, el pase llegó junto: {assists} asistencias en total.",
      "Fue tan decisivo sirviendo como definiendo, con {assists} pases gol en la carrera.",
      "Las {assists} asistencias dicen tanto como los goles sobre el tipo de jugador que era.",
      "Repartió {assists} asistencias a lo largo de los años, viendo siempre al compañero mejor ubicado.",
    ],
    en: [
      "If the goals came, so did the passes: {assists} assists in total.",
      "They were as decisive supplying as finishing, with {assists} career assists.",
      "The {assists} assists say as much as the goals about the kind of player they were.",
      "They laid on {assists} assists over the years, always spotting the better-placed teammate.",
    ],
  },
});

topic({
  id: "peak_clean_sheets",
  chapter: "peak",
  priority: 85,
  when: (f) => f.isGoalkeeper && f.totalCleanSheets >= 120,
  variants: {
    pt: [
      "Foram {cleanSheets} jogos sem sofrer gol, a estatística que melhor resume um goleiro.",
      "Terminou com {cleanSheets} partidas de meta invicta, construídas na base da regularidade.",
      "A conta de {cleanSheets} jogos sem levar gol explica por que os treinadores raramente o tiraram.",
      "Manteve o gol zerado {cleanSheets} vezes, número que sustenta carreiras inteiras.",
    ],
    es: [
      "Fueron {cleanSheets} partidos sin recibir goles, la estadística que mejor resume a un arquero.",
      "Terminó con {cleanSheets} partidos con la valla invicta, construidos a base de regularidad.",
      "La cuenta de {cleanSheets} partidos sin goles en contra explica por qué los técnicos rara vez lo sacaron.",
      "Mantuvo el arco en cero {cleanSheets} veces, número que sostiene carreras enteras.",
    ],
    en: [
      "There were {cleanSheets} clean sheets, the statistic that best sums up a goalkeeper.",
      "They finished with {cleanSheets} shut-outs, built on sheer consistency.",
      "The {cleanSheets} clean sheets explain why managers so rarely took them out of the side.",
      "They kept the goal untouched {cleanSheets} times, a number that sustains entire careers.",
    ],
  },
});

topic({
  id: "peak_golden_boot",
  chapter: "peak",
  priority: 88,
  when: (f) => f.goldenBoots >= 1,
  variants: {
    pt: [
      "Foi artilheiro, e não apenas uma vez — o prêmio de goleador virou hábito.",
      "A artilharia veio para a estante, confirmando o que os números já gritavam.",
      "Terminou temporadas como maior goleador, o tipo de reconhecimento que não se discute.",
      "Ganhou prêmio de artilheiro, encerrando qualquer debate sobre quem mais fazia gol.",
    ],
    es: [
      "Fue goleador, y no una sola vez — el premio al máximo artillero se volvió costumbre.",
      "La bota de goleador llegó a la vitrina, confirmando lo que los números ya gritaban.",
      "Terminó temporadas como máximo goleador, el tipo de reconocimiento que no se discute.",
      "Ganó el premio al goleador, cerrando cualquier debate sobre quién hacía más goles.",
    ],
    en: [
      "They finished as top scorer, and not just once — the golden boot became a habit.",
      "The top-scorer award reached the shelf, confirming what the numbers were already shouting.",
      "They ended seasons as the leading scorer, the kind of recognition nobody argues with.",
      "They won a top-scorer award, settling any debate about who was scoring the most.",
    ],
  },
});

topic({
  id: "peak_ballon_dor",
  chapter: "peak",
  priority: 100,
  when: (f) => f.ballonDors >= 1,
  variants: {
    pt: [
      "E veio o maior reconhecimento individual do futebol: foi eleito o melhor jogador do mundo.",
      "O prêmio de melhor do mundo coroou a fase mais alta da carreira.",
      "Ser eleito o melhor jogador do planeta transformou definitivamente o tamanho daquele nome.",
      "O troféu de melhor do mundo chegou, e com ele um lugar entre os grandes da época.",
    ],
    es: [
      "Y llegó el mayor reconocimiento individual del fútbol: fue elegido el mejor jugador del mundo.",
      "El premio al mejor del mundo coronó la etapa más alta de la carrera.",
      "Ser elegido el mejor jugador del planeta transformó definitivamente el tamaño de ese nombre.",
      "El trofeo al mejor del mundo llegó, y con él un lugar entre los grandes de la época.",
    ],
    en: [
      "And then came football's biggest individual honour: they were voted the best player in the world.",
      "The world player of the year award crowned the highest phase of the career.",
      "Being voted the best player on the planet permanently changed the size of that name.",
      "The world's-best trophy arrived, and with it a place among the greats of the era.",
    ],
  },
});

topic({
  id: "peak_idol",
  chapter: "peak",
  priority: 86,
  when: (f) => f.idolClubs.length > 0 && f.legendClubs.length === 0,
  variants: {
    pt: [
      "No {idolClub}, virou ídolo — daqueles cujo nome a arquibancada canta sem precisar de motivo.",
      "A relação com a torcida do {idolClub} passou do respeito para a idolatria.",
      "Conquistou o status de ídolo no {idolClub}, construído jogo a jogo.",
      "Para a torcida do {idolClub}, deixou de ser mais um contratado e virou referência afetiva.",
    ],
    es: [
      "En el {idolClub} se volvió ídolo — de esos cuyo nombre la tribuna canta sin necesitar motivo.",
      "La relación con la hinchada del {idolClub} pasó del respeto a la idolatría.",
      "Consiguió el estatus de ídolo en el {idolClub}, construido partido a partido.",
      "Para la hinchada del {idolClub}, dejó de ser un fichaje más y se volvió referencia afectiva.",
    ],
    en: [
      "At {idolClub} they became an idol — the kind whose name the stands sing without needing a reason.",
      "The relationship with the {idolClub} support moved from respect into genuine adoration.",
      "They earned idol status at {idolClub}, built game by game.",
      "To the {idolClub} fans, they stopped being another signing and became something people loved.",
    ],
  },
});

topic({
  id: "peak_legend",
  chapter: "peak",
  priority: 100,
  when: (f) => f.legendClubs.length > 0,
  variants: {
    pt: [
      "No {legendClub}, o nome entrou definitivamente na história do clube.",
      "Virou lenda do {legendClub}, categoria reservada a pouquíssimos jogadores por geração.",
      "A passagem pelo {legendClub} foi longa e vitoriosa o bastante para virar capítulo à parte na história do clube.",
      "Para o {legendClub}, {lastName} deixou de ser jogador e virou patrimônio.",
    ],
    es: [
      "En el {legendClub}, el nombre entró definitivamente en la historia del club.",
      "Se volvió leyenda del {legendClub}, categoría reservada a poquísimos jugadores por generación.",
      "El paso por el {legendClub} fue largo y ganador como para volverse capítulo aparte en la historia del club.",
      "Para el {legendClub}, {lastName} dejó de ser jugador y se volvió patrimonio.",
    ],
    en: [
      "At {legendClub}, the name entered the club's history for good.",
      "They became a {legendClub} legend, a category reserved for very few players per generation.",
      "The spell at {legendClub} was long enough and successful enough to become its own chapter in the club's history.",
      "To {legendClub}, {lastName} stopped being a player and became part of the institution.",
    ],
  },
});

topic({
  id: "peak_continental",
  at: (f) => f.firstContinentalAge,
  chapter: "peak",
  priority: 98,
  when: (f) => f.firstContinentalAge !== null,
  variants: {
    pt: [
      "O título continental chegou aos {firstContinentalAge} anos, a noite que separa carreiras boas de carreiras grandes.",
      "Aos {firstContinentalAge} anos ergueu a taça continental — o teto de qualquer carreira de clube.",
      "A conquista continental veio aos {firstContinentalAge}, e mudou de vez o peso daquele currículo.",
      "Foi aos {firstContinentalAge} anos que o nome apareceu numa lista de campeões continentais.",
    ],
    es: [
      "El título continental llegó a los {firstContinentalAge} años, la noche que separa carreras buenas de carreras grandes.",
      "A los {firstContinentalAge} años levantó la copa continental — el techo de cualquier carrera de club.",
      "La conquista continental llegó a los {firstContinentalAge}, y cambió de una vez el peso de ese currículum.",
      "Fue a los {firstContinentalAge} años que el nombre apareció en una lista de campeones continentales.",
    ],
    en: [
      "The continental title came at {firstContinentalAge}, the night that separates good careers from great ones.",
      "At {firstContinentalAge} they lifted the continental cup — the ceiling of any club career.",
      "The continental win came at {firstContinentalAge}, and permanently changed the weight of that CV.",
      "It was at {firstContinentalAge} that the name appeared on a list of continental champions.",
    ],
  },
});

topic({
  id: "peak_world_cup",
  chapter: "peak",
  priority: 100,
  when: (f) => f.wonWorldCup,
  variants: {
    pt: [
      "E aconteceu o que quase ninguém consegue: campeão do mundo por {nation}.",
      "A Copa do Mundo veio, e com ela o lugar mais alto que um jogador de {nation} pode ocupar.",
      "Foi campeão mundial — a conquista que reescreve tudo que veio antes e depois.",
      "Levantou a Copa do Mundo com {nation}, encerrando qualquer discussão sobre grandeza.",
    ],
    es: [
      "Y ocurrió lo que casi nadie consigue: campeón del mundo con {nation}.",
      "Llegó la Copa del Mundo, y con ella el lugar más alto que un jugador de {nation} puede ocupar.",
      "Fue campeón mundial — la conquista que reescribe todo lo que vino antes y después.",
      "Levantó la Copa del Mundo con {nation}, cerrando cualquier discusión sobre grandeza.",
    ],
    en: [
      "And then the thing almost nobody manages happened: world champion with {nation}.",
      "The World Cup came, and with it the highest place a {nation} player can occupy.",
      "They were a world champion — the win that rewrites everything before and after it.",
      "They lifted the World Cup with {nation}, ending any discussion about greatness.",
    ],
  },
});

topic({
  id: "peak_national_continental",
  chapter: "peak",
  priority: 90,
  when: (f) => f.wonNationalContinental && !f.wonWorldCup,
  variants: {
    pt: [
      "Com a seleção de {nation}, veio um título continental — a maior alegria possível fora de uma Copa.",
      "O título continental por {nation} coroou a passagem pela seleção.",
      "Foi campeão continental com {nation}, num torneio decidido nos detalhes.",
      "A seleção de {nation} rendeu um troféu continental, e o nome ficou ligado àquele elenco para sempre.",
    ],
    es: [
      "Con la selección de {nation} llegó un título continental — la mayor alegría posible fuera de un Mundial.",
      "El título continental con {nation} coronó su paso por la selección.",
      "Fue campeón continental con {nation}, en un torneo definido en los detalles.",
      "La selección de {nation} le dio un trofeo continental, y el nombre quedó ligado a ese plantel para siempre.",
    ],
    en: [
      "With {nation} came a continental title — the greatest joy available outside a World Cup.",
      "The continental title with {nation} crowned their international career.",
      "They were a continental champion with {nation}, in a tournament settled by small margins.",
      "The {nation} national team produced a continental trophy, tying the name to that squad forever.",
    ],
  },
});

topic({
  id: "peak_rival_outshone",
  chapter: "peak",
  priority: 84,
  when: (f) => f.rivalName !== null && f.outshoneRival,
  variants: {
    pt: [
      "A comparação constante com {rival} acompanhou os melhores anos — e, no fim, {lastName} chegou mais alto.",
      "Toda geração tem seu duelo. O de {lastName} foi contra {rival}, e a disputa terminou favorável.",
      "Passou anos sendo medido contra {rival}, até o dia em que a comparação deixou de fazer sentido.",
      "A rivalidade com {rival} empurrou os dois para cima, mas foi {lastName} quem atingiu o pico mais alto.",
    ],
    es: [
      "La comparación constante con {rival} acompañó los mejores años — y, al final, {lastName} llegó más alto.",
      "Toda generación tiene su duelo. El de {lastName} fue contra {rival}, y la disputa terminó a su favor.",
      "Pasó años siendo medido contra {rival}, hasta el día en que la comparación dejó de tener sentido.",
      "La rivalidad con {rival} empujó a los dos hacia arriba, pero fue {lastName} quien alcanzó el pico más alto.",
    ],
    en: [
      "The constant comparison with {rival} shadowed the best years — and in the end, {lastName} climbed higher.",
      "Every generation has its duel. {lastName}'s was against {rival}, and the argument ended favourably.",
      "They spent years being measured against {rival}, until the day the comparison stopped making sense.",
      "The rivalry with {rival} pushed both of them upwards, but it was {lastName} who hit the higher peak.",
    ],
  },
});

topic({
  id: "peak_rival_shadow",
  chapter: "peak",
  priority: 84,
  when: (f) => f.rivalName !== null && !f.outshoneRival,
  variants: {
    pt: [
      "Foi uma carreira vivida à sombra de {rival}, sempre perto, nunca à frente.",
      "A comparação com {rival} nunca deu trégua, e a balança raramente pendeu para este lado.",
      "Dividiu a geração com {rival} e teve que aprender a conviver com o segundo lugar nessa conversa.",
      "{rival} esteve sempre um passo à frente, e essa perseguição definiu boa parte da carreira.",
    ],
    es: [
      "Fue una carrera vivida a la sombra de {rival}, siempre cerca, nunca adelante.",
      "La comparación con {rival} nunca dio tregua, y la balanza rara vez se inclinó para este lado.",
      "Compartió la generación con {rival} y tuvo que aprender a convivir con el segundo lugar en esa conversación.",
      "{rival} estuvo siempre un paso adelante, y esa persecución definió buena parte de la carrera.",
    ],
    en: [
      "It was a career lived in {rival}'s shadow, always close, never quite ahead.",
      "The comparison with {rival} never let up, and the scales rarely tipped this way.",
      "They shared a generation with {rival} and had to learn to live with second place in that conversation.",
      "{rival} was always a step ahead, and that pursuit defined a good part of the career.",
    ],
  },
});

topic({
  id: "peak_record_broken",
  chapter: "peak",
  priority: 100,
  when: (f) => f.brokenRecords.length > 0,
  variants: {
    pt: [
      "E entrou nos livros: {recordList}.",
      "Alguns números saíram do campo e foram parar na história — {recordList}.",
      "A carreira mexeu com marcas que pareciam intocáveis: {recordList}.",
      "Registros que resistiam há décadas caíram: {recordList}.",
    ],
    es: [
      "Y entró en los libros: {recordList}.",
      "Algunos números salieron de la cancha y fueron a parar a la historia — {recordList}.",
      "La carrera tocó marcas que parecían intocables: {recordList}.",
      "Registros que resistían hacía décadas cayeron: {recordList}.",
    ],
    en: [
      "And into the record books they went: {recordList}.",
      "Some numbers left the pitch and ended up in history — {recordList}.",
      "The career went after marks that looked untouchable: {recordList}.",
      "Records that had stood for decades fell: {recordList}.",
    ],
  },
});

// ---------------------------------------------------------------------------
// Twilight — the years after the peak
// ---------------------------------------------------------------------------

topic({
  id: "twilight_decline",
  chapter: "twilight",
  priority: 90,
  when: (f) => f.peakOverall - f.finalOverall >= 8,
  variants: {
    pt: [
      "O declínio veio como vem para todos: primeiro as pernas, depois a sequência de jogos.",
      "Os últimos anos foram de queda gradual, com o corpo cobrando o que a cabeça ainda queria dar.",
      "Aos poucos o nível caiu, e o time passou a depender menos daquele nome.",
      "A curva desceu de forma clara na reta final, sem drama, apenas com o tempo fazendo o trabalho dele.",
    ],
    es: [
      "El declive llegó como llega para todos: primero las piernas, después la continuidad.",
      "Los últimos años fueron de caída gradual, con el cuerpo cobrando lo que la cabeza todavía quería dar.",
      "De a poco el nivel bajó, y el equipo pasó a depender menos de ese nombre.",
      "La curva bajó de forma clara en el tramo final, sin drama, solo con el tiempo haciendo su trabajo.",
    ],
    en: [
      "The decline came the way it comes for everyone: the legs first, then the run of games.",
      "The last years were a gradual fall, the body charging for what the head still wanted to give.",
      "The level dropped bit by bit, and the team came to lean on that name a little less.",
      "The curve came down clearly at the end, without drama, just time doing its work.",
    ],
  },
});

topic({
  id: "twilight_held_level",
  chapter: "twilight",
  priority: 88,
  when: (f) => f.peakOverall - f.finalOverall <= 3 && f.retirementAge >= 33,
  variants: {
    pt: [
      "Manteve o nível até muito tarde, contrariando a lógica da idade.",
      "Chegou aos últimos anos ainda competitivo, algo raro para quem já tinha tanta estrada.",
      "A queda que costuma vir com os anos praticamente não apareceu.",
      "Envelheceu bem dentro de campo, ajustando o jogo em vez de perdê-lo.",
    ],
    es: [
      "Mantuvo el nivel hasta muy tarde, contrariando la lógica de la edad.",
      "Llegó a los últimos años todavía competitivo, algo raro para quien ya tenía tanto recorrido.",
      "La caída que suele llegar con los años prácticamente no apareció.",
      "Envejeció bien adentro de la cancha, ajustando el juego en vez de perderlo.",
    ],
    en: [
      "They held their level until very late, defying the logic of age.",
      "They reached the final years still competitive, rare for someone with that many miles.",
      "The drop-off that usually comes with age barely showed up at all.",
      "They aged well on the pitch, adjusting the game rather than losing it.",
    ],
  },
});

topic({
  id: "twilight_return_home",
  chapter: "twilight",
  priority: 92,
  at: (f) => f.homecomingAge,
  when: (f) => f.homecomingAge !== null,
  variants: {
    pt: [
      "Aos {homecomingAge} anos voltou ao {firstClub}, o clube onde tudo tinha começado.",
      "O retorno ao {firstClub}, aos {homecomingAge}, fechou um ciclo que parecia impossível de fechar.",
      "Depois de tanta estrada, aos {homecomingAge} anos o caminho apontou de volta para o {firstClub}.",
      "A volta para casa aconteceu aos {homecomingAge}: {firstClub} de novo, muitas histórias depois.",
    ],
    es: [
      "A los {homecomingAge} años volvió al {firstClub}, el club donde todo había empezado.",
      "El regreso al {firstClub}, a los {homecomingAge}, cerró un ciclo que parecía imposible de cerrar.",
      "Después de tanto camino, a los {homecomingAge} años la ruta apuntó de vuelta al {firstClub}.",
      "La vuelta a casa ocurrió a los {homecomingAge}: {firstClub} otra vez, muchas historias después.",
    ],
    en: [
      "At {homecomingAge} they went back to {firstClub}, where it had all started.",
      "The return to {firstClub} at {homecomingAge} closed a circle that had looked impossible to close.",
      "After all those miles, at {homecomingAge} the road pointed back to {firstClub}.",
      "The homecoming came at {homecomingAge}: {firstClub} again, many stories later.",
    ],
  },
});

topic({
  id: "twilight_one_club",
  chapter: "twilight",
  priority: 95,
  when: (f) => f.oneClubMan,
  variants: {
    pt: [
      "Nunca precisou de outro endereço. A carreira inteira coube num único escudo.",
      "Foi jogador de um clube só, fidelidade que praticamente desapareceu do futebol moderno.",
      "Do primeiro ao último jogo, sempre a mesma camisa.",
      "Recusou o mundo lá fora e construiu tudo dentro de casa, num clube só.",
    ],
    es: [
      "Nunca necesitó otro domicilio. La carrera entera cupo en un solo escudo.",
      "Fue jugador de un solo club, fidelidad que prácticamente desapareció del fútbol moderno.",
      "Del primer al último partido, siempre la misma camiseta.",
      "Rechazó el mundo de afuera y construyó todo puertas adentro, en un solo club.",
    ],
    en: [
      "They never needed another address. The whole career fitted inside one badge.",
      "A one-club player, a loyalty that has all but vanished from modern football.",
      "From the first game to the last, always the same shirt.",
      "They turned down the world outside and built everything at home, at a single club.",
    ],
  },
});

topic({
  id: "twilight_long_spell",
  chapter: "twilight",
  priority: 76,
  when: (f) => !f.oneClubMan && f.longestSpell !== null && f.longestSpell.seasons >= 8,
  variants: {
    pt: [
      "A passagem mais longa foi pelo {longestClub}, onde ficou tempo suficiente para virar parte da mobília.",
      "Foram muitos anos no {longestClub} — a casa mais duradoura de toda a carreira.",
      "O {longestClub} concentrou a maior parte da história: temporada após temporada, sem pressa de sair.",
      "Nenhum clube teve {lastName} por tanto tempo quanto o {longestClub}.",
    ],
    es: [
      "El paso más largo fue por el {longestClub}, donde estuvo el tiempo suficiente para volverse parte del mobiliario.",
      "Fueron muchos años en el {longestClub} — la casa más duradera de toda la carrera.",
      "El {longestClub} concentró la mayor parte de la historia: temporada tras temporada, sin apuro por irse.",
      "Ningún club tuvo a {lastName} tanto tiempo como el {longestClub}.",
    ],
    en: [
      "The longest spell was at {longestClub}, where they stayed long enough to become part of the furniture.",
      "There were many years at {longestClub} — the most enduring home of the whole career.",
      "{longestClub} holds most of the story: season after season, in no hurry to leave.",
      "No club had {lastName} for as long as {longestClub} did.",
    ],
  },
});

topic({
  id: "twilight_rival_move",
  chapter: "twilight",
  priority: 86,
  when: (f) => f.everLeftForRival,
  variants: {
    pt: [
      "Houve também a transferência que nenhuma torcida perdoa: sair direto para o rival.",
      "Trocar um clube pelo maior rival dele custou caro em afeto, por mais que fizesse sentido no contrato.",
      "A mudança para o arquirrival dividiu opiniões e transformou ídolo em traidor da noite para o dia.",
      "Uma parte da torcida nunca engoliu a transferência para o rival direto.",
    ],
    es: [
      "Hubo también la transferencia que ninguna hinchada perdona: irse directo al rival.",
      "Cambiar un club por su máximo rival costó caro en afecto, por más sentido que tuviera en el contrato.",
      "El pase al archirrival dividió opiniones y transformó al ídolo en traidor de la noche a la mañana.",
      "Una parte de la hinchada nunca se tragó la transferencia al rival directo.",
    ],
    en: [
      "There was also the transfer no support ever forgives: going straight to the rival.",
      "Swapping a club for its biggest rival cost dearly in affection, however much sense the contract made.",
      "The move to the arch-rival split opinion and turned an idol into a traitor overnight.",
      "Part of the support never swallowed the transfer to the direct rival.",
    ],
  },
});

topic({
  id: "twilight_loved",
  chapter: "twilight",
  priority: 70,
  when: (f) => f.fanSupport >= 78,
  variants: {
    pt: [
      "A relação com a torcida terminou no melhor ponto possível: adoração pura.",
      "As arquibancadas nunca deixaram de estar do lado dele, até o último jogo.",
      "Saiu amado, com o nome cantado mesmo nas tardes em que o time não jogava bem.",
      "A torcida abraçou {lastName} até o fim, sem reservas.",
    ],
    es: [
      "La relación con la hinchada terminó en el mejor punto posible: adoración pura.",
      "Las tribunas nunca dejaron de estar de su lado, hasta el último partido.",
      "Se fue amado, con el nombre cantado incluso en las tardes en que el equipo no jugaba bien.",
      "La hinchada abrazó a {lastName} hasta el final, sin reservas.",
    ],
    en: [
      "The relationship with the supporters ended at the best possible point: pure adoration.",
      "The stands never stopped being on their side, right up to the last game.",
      "They left loved, name still sung even on afternoons when the team played badly.",
      "The support held on to {lastName} until the end, without reservation.",
    ],
  },
});

topic({
  id: "twilight_hated",
  chapter: "twilight",
  priority: 70,
  when: (f) => f.fanSupport <= 30,
  variants: {
    pt: [
      "O fim da relação com a torcida foi áspero, com vaias substituindo os aplausos.",
      "As arquibancadas viraram um ambiente hostil, e cada erro passou a ser cobrado em voz alta.",
      "Terminou sob desconfiança, com boa parte da torcida já querendo outro nome naquela posição.",
      "A paciência da arquibancada acabou antes do contrato.",
    ],
    es: [
      "El final de la relación con la hinchada fue áspero, con silbidos reemplazando los aplausos.",
      "Las tribunas se volvieron un ambiente hostil, y cada error pasó a reclamarse en voz alta.",
      "Terminó bajo desconfianza, con buena parte de la hinchada ya queriendo otro nombre en ese puesto.",
      "La paciencia de la tribuna se acabó antes que el contrato.",
    ],
    en: [
      "The relationship with the supporters ended roughly, with jeers replacing applause.",
      "The stands turned hostile, and every mistake started being called out loudly.",
      "They finished under suspicion, with much of the support already wanting another name in that position.",
      "The terraces ran out of patience before the contract ran out.",
    ],
  },
});

// ---------------------------------------------------------------------------
// Legacy — retirement and the final verdict
// ---------------------------------------------------------------------------

topic({
  id: "legacy_retire_at_first_club",
  at: (f) => f.retirementAge,
  chapter: "legacy",
  priority: 100,
  when: (f) => f.retiredAtFirstClub,
  variants: {
    pt: [
      "A carreira se encerrou aos {retireAge} anos exatamente onde havia começado, no {firstClub}.",
      "Pendurou as chuteiras no {firstClub}, fechando o círculo perfeito aos {retireAge} anos.",
      "O último jogo foi com a camisa do {firstClub}, a mesma da estreia, {retireAge} anos de idade.",
      "Terminou onde nasceu para o futebol: {firstClub}, aos {retireAge} anos.",
    ],
    es: [
      "La carrera se cerró a los {retireAge} años exactamente donde había empezado, en el {firstClub}.",
      "Colgó los botines en el {firstClub}, cerrando el círculo perfecto a los {retireAge} años.",
      "El último partido fue con la camiseta del {firstClub}, la misma del debut, a los {retireAge} años.",
      "Terminó donde nació para el fútbol: {firstClub}, a los {retireAge} años.",
    ],
    en: [
      "The career ended at {retireAge}, exactly where it had begun, at {firstClub}.",
      "They hung up their boots at {firstClub}, closing the perfect circle at {retireAge}.",
      "The last game came in a {firstClub} shirt, the same one as the debut, aged {retireAge}.",
      "They finished where they were born into football: {firstClub}, at {retireAge}.",
    ],
  },
});

topic({
  id: "legacy_retire_elsewhere",
  at: (f) => f.retirementAge,
  chapter: "legacy",
  priority: 95,
  when: (f) => !f.retiredAtFirstClub && f.lastClub !== null,
  variants: {
    pt: [
      "A despedida aconteceu aos {retireAge} anos, com a camisa do {lastClub}.",
      "O ponto final veio aos {retireAge} anos, no {lastClub}.",
      "Encerrou a carreira aos {retireAge}, defendendo o {lastClub}.",
      "O último capítulo foi escrito no {lastClub}, aos {retireAge} anos.",
    ],
    es: [
      "La despedida ocurrió a los {retireAge} años, con la camiseta del {lastClub}.",
      "El punto final llegó a los {retireAge} años, en el {lastClub}.",
      "Cerró la carrera a los {retireAge}, defendiendo al {lastClub}.",
      "El último capítulo se escribió en el {lastClub}, a los {retireAge} años.",
    ],
    en: [
      "The farewell came at {retireAge}, in a {lastClub} shirt.",
      "The full stop arrived at {retireAge}, at {lastClub}.",
      "They ended the career at {retireAge}, playing for {lastClub}.",
      "The final chapter was written at {lastClub}, aged {retireAge}.",
    ],
  },
});

topic({
  id: "legacy_retire_no_offers",
  chapter: "legacy",
  priority: 90,
  when: (f) => f.retirementReason === "no_offers" || f.retirementReason === "poor_form",
  variants: {
    pt: [
      "O fim não foi escolhido: as propostas simplesmente pararam de chegar.",
      "A aposentadoria veio pela porta dos fundos, sem festa e sem jogo de despedida.",
      "Não houve escolha no encerramento — o mercado decidiu antes que o jogador decidisse.",
      "Terminou em baixa, num momento em que o telefone havia parado de tocar.",
    ],
    es: [
      "El final no fue elegido: las propuestas simplemente dejaron de llegar.",
      "El retiro llegó por la puerta de atrás, sin fiesta y sin partido despedida.",
      "No hubo elección en el cierre — el mercado decidió antes que el jugador.",
      "Terminó en baja, en un momento en que el teléfono había dejado de sonar.",
    ],
    en: [
      "The ending wasn't chosen: the offers simply stopped arriving.",
      "Retirement came through the back door, with no party and no farewell match.",
      "There was no choice in the ending — the market decided before the player did.",
      "They finished on the way down, at a point where the phone had stopped ringing.",
    ],
  },
});

topic({
  id: "legacy_trophy_haul",
  chapter: "legacy",
  priority: 92,
  when: (f) => f.totalTrophies >= 8,
  variants: {
    pt: [
      "A prateleira final contou {trophies} títulos, acumulados em clubes e seleção.",
      "Foram {trophies} taças ao todo — uma carreira construída para ganhar.",
      "O currículo fechou com {trophies} conquistas, número que fala por si.",
      "Somou {trophies} títulos, o tipo de coleção que só se monta com longevidade e boas escolhas.",
    ],
    es: [
      "La vitrina final contó {trophies} títulos, acumulados en clubes y selección.",
      "Fueron {trophies} copas en total — una carrera construida para ganar.",
      "El currículum cerró con {trophies} conquistas, número que habla por sí solo.",
      "Sumó {trophies} títulos, el tipo de colección que solo se arma con longevidad y buenas decisiones.",
    ],
    en: [
      "The final cabinet held {trophies} trophies, collected across clubs and country.",
      "There were {trophies} trophies in all — a career built to win.",
      "The CV closed with {trophies} honours, a number that speaks for itself.",
      "They gathered {trophies} trophies, the kind of collection only longevity and good choices build.",
    ],
  },
});

topic({
  id: "legacy_trophyless",
  chapter: "legacy",
  priority: 94,
  when: (f) => f.trophyless,
  variants: {
    pt: [
      "Não houve títulos. Houve, sim, uma carreira inteira de futebol profissional, o que já é raro o bastante.",
      "A prateleira ficou vazia, mas o currículo tem centenas de jogos que ninguém pode tirar.",
      "Faltou a taça. Sobrou trabalho, presença e uma carreira longa em campo.",
      "Nunca ergueu um troféu — destino de muitos bons jogadores que nasceram nos clubes errados.",
    ],
    es: [
      "No hubo títulos. Hubo, sí, una carrera entera de fútbol profesional, lo que ya es bastante raro.",
      "La vitrina quedó vacía, pero el currículum tiene cientos de partidos que nadie puede sacar.",
      "Faltó la copa. Sobró trabajo, presencia y una carrera larga en la cancha.",
      "Nunca levantó un trofeo — destino de muchos buenos jugadores que nacieron en los clubes equivocados.",
    ],
    en: [
      "There were no trophies. There was a whole career in professional football, which is rare enough by itself.",
      "The cabinet stayed empty, but the CV holds hundreds of games nobody can take away.",
      "The silverware never came. The work, the presence and a long career on the pitch did.",
      "They never lifted a trophy — the fate of many good players born into the wrong clubs.",
    ],
  },
});

topic({
  id: "legacy_appearances",
  chapter: "legacy",
  priority: 74,
  when: (f) => f.totalAppearances >= 500,
  variants: {
    pt: [
      "No total, foram {apps} partidas oficiais — longevidade que poucos alcançam.",
      "Entrou em campo {apps} vezes ao longo da carreira.",
      "As {apps} partidas disputadas dizem muito sobre disciplina e resistência.",
      "Fechou a carreira com {apps} jogos, número que exige anos de cuidado com o corpo.",
    ],
    es: [
      "En total fueron {apps} partidos oficiales — longevidad que pocos alcanzan.",
      "Entró a la cancha {apps} veces a lo largo de la carrera.",
      "Los {apps} partidos disputados dicen mucho sobre disciplina y resistencia.",
      "Cerró la carrera con {apps} partidos, número que exige años de cuidado del cuerpo.",
    ],
    en: [
      "In all there were {apps} official appearances — longevity few ever reach.",
      "They walked onto the pitch {apps} times across the career.",
      "The {apps} games played say a great deal about discipline and durability.",
      "They closed the career on {apps} appearances, a number that demands years of looking after the body.",
    ],
  },
});

topic({
  id: "legacy_national_never",
  chapter: "legacy",
  priority: 80,
  when: (f) => f.neverCapped,
  variants: {
    pt: [
      "A seleção de {nation} nunca chamou, e essa ficou como a lacuna da carreira.",
      "Faltou a convocação. É o tipo de ausência que acompanha um jogador para sempre.",
      "Nunca vestiu a camisa de {nation}, apesar de temporadas que mereciam ao menos um teste.",
      "O chamado da seleção jamais veio, e o currículo ficou restrito aos clubes.",
    ],
    es: [
      "La selección de {nation} nunca llamó, y esa quedó como la deuda de la carrera.",
      "Faltó la convocatoria. Es el tipo de ausencia que acompaña a un jugador para siempre.",
      "Nunca vistió la camiseta de {nation}, pese a temporadas que merecían al menos una prueba.",
      "El llamado de la selección jamás llegó, y el currículum quedó restringido a los clubes.",
    ],
    en: [
      "{nation} never called, and that stayed the gap in the career.",
      "The call-up never came. It's the kind of absence that follows a player forever.",
      "They never wore the {nation} shirt, despite seasons that deserved at least a look.",
      "The international call never arrived, and the CV stayed a club one.",
    ],
  },
});

topic({
  id: "legacy_national_established",
  chapter: "legacy",
  priority: 82,
  when: (f) => f.caps >= 30,
  variants: {
    pt: [
      "Pela seleção de {nation}, foram {caps} jogos — presença constante por muitos anos.",
      "Acumulou {caps} partidas por {nation}, virando nome fixo nas convocações.",
      "Os {caps} jogos pela seleção mostram que o posto era realmente dele.",
      "Defendeu {nation} em {caps} oportunidades ao longo da carreira.",
    ],
    es: [
      "Por la selección de {nation} fueron {caps} partidos — presencia constante durante muchos años.",
      "Acumuló {caps} partidos con {nation}, volviéndose nombre fijo en las convocatorias.",
      "Los {caps} partidos por la selección muestran que el puesto era realmente suyo.",
      "Defendió a {nation} en {caps} oportunidades a lo largo de la carrera.",
    ],
    en: [
      "For {nation} there were {caps} caps — a constant presence over many years.",
      "They gathered {caps} appearances for {nation}, becoming a fixture in the squad.",
      "The {caps} international caps show the shirt really was theirs.",
      "They represented {nation} on {caps} occasions across the career.",
    ],
  },
});

topic({
  id: "legacy_national_fringe",
  chapter: "legacy",
  priority: 78,
  when: (f) => f.caps > 0 && f.caps < 12,
  variants: {
    pt: [
      "Na seleção de {nation}, nunca se firmou de verdade: foram poucas convocações e menos jogos ainda.",
      "Chegou a vestir a camisa de {nation}, mas o posto de titular sempre pertenceu a outro.",
      "A passagem pela seleção foi curta, mais um aceno do que uma história.",
      "Jogou por {nation}, embora a sequência nunca tenha aparecido.",
    ],
    es: [
      "En la selección de {nation} nunca se afirmó de verdad: fueron pocas convocatorias y menos partidos aún.",
      "Llegó a vestir la camiseta de {nation}, pero el puesto de titular siempre fue de otro.",
      "El paso por la selección fue corto, más un guiño que una historia.",
      "Jugó por {nation}, aunque la continuidad nunca apareció.",
    ],
    en: [
      "With {nation} they never truly established themselves: few call-ups and fewer games.",
      "They did wear the {nation} shirt, but the starting place always belonged to someone else.",
      "The international spell was short, more a nod than a story.",
      "They played for {nation}, though a proper run in the side never came.",
    ],
  },
});

topic({
  id: "legacy_verdict_legend",
  chapter: "legacy",
  priority: 100,
  when: (f) => f.peakOverall >= 85 && f.totalTrophies >= 6,
  variants: {
    pt: [
      "O veredito é simples: uma das grandes carreiras de sua geração.",
      "Fica registrada como uma carreira de primeira grandeza, dessas que servem de referência.",
      "É o tipo de trajetória que gerações seguintes usam como parâmetro.",
      "No fim das contas, poucos jogadores de {nation} construíram algo desse tamanho.",
    ],
    es: [
      "El veredicto es simple: una de las grandes carreras de su generación.",
      "Queda registrada como una carrera de primera magnitud, de esas que sirven de referencia.",
      "Es el tipo de trayectoria que las generaciones siguientes usan como parámetro.",
      "A fin de cuentas, pocos jugadores de {nation} construyeron algo de ese tamaño.",
    ],
    en: [
      "The verdict is simple: one of the great careers of its generation.",
      "It goes down as a career of the first order, the kind that becomes a reference point.",
      "It's the sort of path later generations measure themselves against.",
      "In the end, few players from {nation} built anything on this scale.",
    ],
  },
});

topic({
  id: "legacy_verdict_solid",
  chapter: "legacy",
  priority: 90,
  when: (f) => f.peakOverall >= 75 && f.peakOverall < 85,
  variants: {
    pt: [
      "Não foi uma carreira de lenda, mas foi uma carreira de respeito — longa, séria e bem construída.",
      "Fica a imagem de um profissional confiável, que rendeu por muitos anos num bom nível.",
      "É a carreira que a maioria dos jogadores gostaria de ter e poucos conseguem: estável e digna.",
      "O saldo é claramente positivo: anos no alto nível e a confiança de quem trabalhou com ele.",
    ],
    es: [
      "No fue una carrera de leyenda, pero fue una carrera de respeto — larga, seria y bien construida.",
      "Queda la imagen de un profesional confiable, que rindió durante muchos años en buen nivel.",
      "Es la carrera que la mayoría de los jugadores querría tener y pocos consiguen: estable y digna.",
      "El saldo es claramente positivo: años en el alto nivel y la confianza de quienes trabajaron con él.",
    ],
    en: [
      "It wasn't a legendary career, but it was a respected one — long, serious and well built.",
      "What remains is the picture of a dependable professional who delivered at a good level for years.",
      "It's the career most players would want and few get: steady and dignified.",
      "The balance is clearly positive: years at a high level, and the trust of everyone who worked with them.",
    ],
  },
});

topic({
  id: "legacy_verdict_modest",
  chapter: "legacy",
  priority: 88,
  when: (f) => f.modestCareer,
  variants: {
    pt: [
      "Ficou a sensação de potencial não completamente aproveitado — mas também a de quem nunca deixou de tentar.",
      "O talento talvez pedisse mais. Ainda assim, viver de futebol por tantos anos não é pouca coisa.",
      "É a história de milhares de jogadores: carreira honesta, sem holofotes, encerrada em silêncio.",
      "Não virou nome de manchete, mas foi profissional de verdade do começo ao fim.",
    ],
    es: [
      "Quedó la sensación de potencial no del todo aprovechado — pero también la de quien nunca dejó de intentarlo.",
      "El talento tal vez pedía más. Aun así, vivir del fútbol tantos años no es poca cosa.",
      "Es la historia de miles de jugadores: carrera honesta, sin focos, cerrada en silencio.",
      "No fue nombre de titular de diario, pero fue profesional de verdad de principio a fin.",
    ],
    en: [
      "There's a sense of potential not fully used — but also of someone who never stopped trying.",
      "The talent may have asked for more. Even so, making a living from football for that long is no small thing.",
      "It's the story of thousands of players: an honest career, no spotlight, ended quietly.",
      "They never became a headline, but they were a real professional from start to finish.",
    ],
  },
});

topic({
  id: "legacy_shirt_retired",
  chapter: "legacy",
  priority: 60,
  when: (f) => f.legendClubs.length > 0 && f.shirtNumber !== null && f.shirtNumber <= 11,
  variants: {
    pt: [
      "A camisa {number} ficou definitivamente associada a esse nome no {legendClub}.",
      "No {legendClub}, quem vestir a {number} depois dele vai ouvir a comparação.",
      "A {number} do {legendClub} tem dono na memória da torcida.",
      "Deixou a {number} carregada de significado para quem vier a seguir.",
    ],
    es: [
      "La camiseta {number} quedó definitivamente asociada a ese nombre en el {legendClub}.",
      "En el {legendClub}, quien use la {number} después de él va a escuchar la comparación.",
      "La {number} del {legendClub} tiene dueño en la memoria de la hinchada.",
      "Dejó la {number} cargada de significado para quien venga después.",
    ],
    en: [
      "The {number} shirt became permanently attached to that name at {legendClub}.",
      "At {legendClub}, whoever wears the {number} next will hear the comparison.",
      "The {legendClub} {number} has an owner in the supporters' memory.",
      "They left the {number} loaded with meaning for whoever comes next.",
    ],
  },
});

export { TOPICS as BIO_TOPICS };
