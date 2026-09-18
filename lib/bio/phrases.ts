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
  /**
   * Ranked against other eligible topics when a chapter has more than it can
   * print. A function when the line's importance depends on the career: three
   * super cups is a footnote, nine is the story, and a fixed number cannot
   * express that. Generic lines stay constant and get out of the way.
   */
  priority: number | ((f: BioFacts) => number);
  /**
   * Topics sharing a group say the same thing in different words, so only the
   * highest-priority one is ever printed. Without this a career can be told it
   * never left one club twice in the same article.
   */
  group?: string;
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
  group: "origin_club",
  chapter: "origins",
  priority: 100,
  when: (f) => f.firstClub !== null && f.firstClub.reputation < 2,
  variants: {
    pt: [
      "A história começou longe dos holofotes, nas categorias de base do {firstClub}.",
      "Nada no início sugeria o que viria: um garoto de {birthNation} dando os primeiros passos no {firstClub}.",
      "O {firstClub} foi o ponto de partida: um clube pequeno, de estrutura modesta, mas que abriu a porta.",
      "Tudo nasceu no {firstClub}, onde poucos olhares se voltavam para as divisões de base.",
    ],
    es: [
      "La historia empezó lejos de los focos, en las inferiores del {firstClub}.",
      "Nada al principio sugería lo que vendría: un pibe de {birthNation} dando sus primeros pasos en el {firstClub}.",
      "El {firstClub} fue el punto de partida, un club chico, de estructura modesta, pero que abrió la puerta.",
      "Todo nació en el {firstClub}, donde pocas miradas se dirigían a las divisiones juveniles.",
    ],
    en: [
      "The story began a long way from the spotlight, in {firstClub}'s youth ranks.",
      "Nothing about the start suggested what was coming: a kid from {birthNation} taking their first steps at {firstClub}.",
      "{firstClub} was the starting point, a small club with modest facilities, but one that opened the door.",
      "It all began at {firstClub}, where barely anyone was watching the youth sides.",
    ],
  },
});

topic({
  id: "origin_big_club",
  group: "origin_club",
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
  group: "origin_club",
  chapter: "origins",
  priority: 90,
  when: (f) => f.firstClub !== null && f.firstClub.reputation >= 2 && f.firstClub.reputation < 3.5,
  variants: {
    pt: [
      "O {firstClub} foi o primeiro endereço profissional, um clube de estrutura sólida sem ser um gigante.",
      "A carreira começou no {firstClub}, ambiente competitivo o bastante para exigir, tranquilo o bastante para aprender.",
      "Foi no {firstClub} que a formação ganhou corpo, longe da pressão dos clubes de elite.",
      "O ponto de partida foi o {firstClub}, um clube de tradição respeitável no futebol de {birthNation}.",
    ],
    es: [
      "El {firstClub} fue el primer domicilio profesional, un club de estructura sólida sin ser un gigante.",
      "La carrera empezó en el {firstClub}, un ambiente competitivo como para exigir, tranquilo como para aprender.",
      "Fue en el {firstClub} donde la formación tomó cuerpo, lejos de la presión de los clubes de élite.",
      "El punto de partida fue el {firstClub}, un club de tradición respetable en el fútbol de {birthNation}.",
    ],
    en: [
      "{firstClub} was the first professional address, a well-run club without being a giant.",
      "The career started at {firstClub}, competitive enough to demand something, calm enough to learn in.",
      "It was at {firstClub} that the education took shape, away from the pressure of the elite clubs.",
      "The starting point was {firstClub}, a club with a respectable history in {birthNation}.",
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
  group: "early_minutes",
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
  group: "early_minutes",
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
  group: "loans",
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
  group: "loans",
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
  id: "rise_switched_nation",
  chapter: "rise",
  priority: 86,
  // Only when the switch actually led to a shirt. A career that changed
  // eligibility and was then never called reads its own line below, and
  // saying both would have the article contradict itself two paragraphs
  // apart.
  when: (f) => f.switchedNationality && !f.neverCapped,
  variants: {
    pt: [
      "Nascido em {birthNation}, acabou defendendo {nation}: um passaporte de família reabriu a porta da seleção.",
      "A seleção que chamou não foi a de {birthNation}: escolheu {nation}, e a história internacional passou a ser outra.",
      "Trocou {birthNation} por {nation} no cenário internacional, decisão que poucos jogadores precisam tomar.",
      "Cresceu em {birthNation}, mas foi com a camisa de {nation} que jogou pela seleção."
    ],
    es: [
      "Nacido en {birthNation}, terminó defendiendo a {nation}, un pasaporte de familia le reabrió la puerta.",
      "La selección que lo llamó no fue la de {birthNation}: eligió {nation}, y la historia internacional fue otra.",
      "Cambió {birthNation} por {nation} en el plano internacional, una decisión que pocos tienen que tomar.",
      "Creció en {birthNation}, pero jugó la selección con la camiseta de {nation}."
    ],
    en: [
      "Born in {birthNation}, they ended up playing for {nation}, a family passport reopened the international door.",
      "The call did not come from {birthNation}: they chose {nation}, and the international story became a different one.",
      "They swapped {birthNation} for {nation} at international level, a decision few players ever face.",
      "They grew up in {birthNation}, but it was the {nation} shirt they played international football in."
    ],
  },
});

topic({
  id: "legacy_switched_nation_uncapped",
  group: "caps",
  chapter: "legacy",
  priority: 84,
  when: (f) => f.switchedNationality && f.neverCapped,
  variants: {
    pt: [
      "Trocou de seleção no papel, deixou {birthNation} por {nation} e mesmo assim o chamado nunca veio.",
      "Ficou elegível por {nation}, longe de onde cresceu, e nem por isso jogou uma partida internacional.",
      "A troca de {birthNation} para {nation} foi feita para abrir uma porta que nunca chegou a abrir.",
      "Nem o passaporte de {nation} resolveu: a seleção seguiu sendo uma linha em branco na carreira."
    ],
    es: [
      "Cambió de selección en el papel, dejó {birthNation} por {nation} y aun así el llamado nunca llegó.",
      "Quedó elegible por {nation}, lejos de donde creció, y ni así jugó un partido internacional.",
      "El cambio de {birthNation} a {nation} se hizo para abrir una puerta que nunca llegó a abrirse.",
      "Ni el pasaporte de {nation} alcanzó: la selección siguió siendo un renglón en blanco."
    ],
    en: [
      "They switched allegiance on paper, {birthNation} for {nation} and the call still never came.",
      "They became eligible for {nation}, a long way from where they grew up, and never played an international anyway.",
      "The move from {birthNation} to {nation} was made to open a door that never opened.",
      "Not even the {nation} passport did it: the international line stayed blank."
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
      "A saída de {birthNation} veio cedo, ainda na casa dos vinte anos, antes mesmo de se firmar por completo.",
      "Não demorou para o futebol estrangeiro bater à porta, e a mudança de país aconteceu muito jovem.",
      "Trocou o futebol de {birthNation} pelo exterior antes de completar 21 anos, uma aposta arriscada.",
      "A primeira grande decisão foi geográfica: sair de {birthNation} cedo, com a carreira ainda por construir.",
    ],
    es: [
      "La salida de {birthNation} llegó temprano, todavía en los veinte, antes incluso de afirmarse del todo.",
      "No tardó en llamar el fútbol extranjero, y el cambio de país ocurrió muy joven.",
      "Cambió el fútbol de {birthNation} por el exterior antes de cumplir 21 años, una apuesta arriesgada.",
      "La primera gran decisión fue geográfica: salir de {birthNation} temprano, con la carrera por construir.",
    ],
    en: [
      "The move out of {birthNation} came early, still barely into their twenties, before they were even established.",
      "Foreign football came calling soon enough, and the move abroad happened very young.",
      "They swapped {birthNation} for a league abroad before turning 21, a genuine gamble.",
      "The first big decision was a geographical one: leaving {birthNation} early, with the career still unbuilt.",
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
  group: "trajectory",
  chapter: "rise",
  priority: 100,
  when: (f) => f.meteoric,
  variants: {
    pt: [
      "A ascensão foi vertiginosa: antes dos 22 anos já era um jogador de primeiro nível.",
      "O salto aconteceu rápido demais para ser normal, em poucas temporadas, saiu de promessa a nome feito.",
      "Não houve travessia lenta. A explosão veio cedo e mudou a escala da carreira de uma vez.",
      "Queimou etapas de um jeito que quase ninguém queima, e ainda muito jovem já era peça central.",
    ],
    es: [
      "El ascenso fue vertiginoso: antes de los 22 años ya era un jugador de primer nivel.",
      "El salto ocurrió demasiado rápido para ser normal, en pocas temporadas pasó de promesa a nombre hecho.",
      "No hubo travesía lenta. La explosión llegó temprano y cambió la escala de la carrera de una vez.",
      "Quemó etapas como casi nadie las quema, y siendo muy joven ya era pieza central.",
    ],
    en: [
      "The rise was vertiginous: a genuinely top-level player before turning 22.",
      "The jump happened too quickly to be normal, in a handful of seasons, from prospect to established name.",
      "There was no slow climb. The breakthrough came early and changed the scale of the career at once.",
      "They skipped steps almost nobody skips, and were already central to a team while very young.",
    ],
  },
});

topic({
  id: "rise_late_bloomer",
  group: "trajectory",
  chapter: "rise",
  priority: 100,
  when: (f) => f.lateBloomer,
  variants: {
    pt: [
      "A explosão demorou. Só perto dos trinta o futebol finalmente se encaixou.",
      "Foi um caso clássico de maturação tardia: o melhor futebol apareceu quando muitos já pensam em desacelerar.",
      "Levou tempo, anos, na verdade, até o jogo fazer sentido no nível mais alto.",
      "A carreira só decolou de verdade numa idade em que a maioria já atingiu o teto.",
    ],
    es: [
      "La explosión tardó. Recién cerca de los treinta el fútbol finalmente encajó.",
      "Fue un caso clásico de maduración tardía: el mejor fútbol apareció cuando muchos ya piensan en bajar el ritmo.",
      "Llevó tiempo, años, en realidad, hasta que el juego tuviera sentido al máximo nivel.",
      "La carrera despegó de verdad a una edad en la que la mayoría ya tocó su techo.",
    ],
    en: [
      "The breakthrough took its time. Only near thirty did the football finally click.",
      "It was a classic late developer: the best years arrived when many are already winding down.",
      "It took time, years, really, for the game to make sense at the highest level.",
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
      "Aos {giantMoveAge} anos assinou com o {giantClub}, o salto que separa jogador bom de jogador grande.",
    ],
    es: [
      "A los {giantMoveAge} años llegó la transferencia que cambia todo: el {giantClub} golpeó la puerta.",
      "El {giantClub} apareció a los {giantMoveAge}, y con él un nivel de exigencia completamente distinto.",
      "El pase al {giantClub}, a los {giantMoveAge}, puso la carrera bajo otro tipo de foco.",
      "A los {giantMoveAge} años firmó con el {giantClub}, el salto que separa al buen jugador del grande.",
    ],
    en: [
      "At {giantMoveAge} came the transfer that changes everything: {giantClub} came calling.",
      "{giantClub} arrived at {giantMoveAge}, and with them a completely different level of demand.",
      "The move to {giantClub} at {giantMoveAge} put the career under a different kind of spotlight.",
      "At {giantMoveAge} they signed for {giantClub}, the jump that separates a good player from a big one.",
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
      "No fim, jogava menos e ensinava mais, função que nem todo grande jogador aceita bem.",
    ],
    es: [
      "En los últimos años el rol cambió: menos protagonismo en la cancha, más peso en el vestuario.",
      "Se volvió el veterano al que los más jóvenes preguntaban antes de preguntarle al técnico.",
      "La experiencia acumulada pasó a valer tanto como las piernas.",
      "Al final jugaba menos y enseñaba más, función que no todo gran jugador acepta bien.",
    ],
    en: [
      "In the final years the role changed: less of the spotlight on the pitch, more weight in the dressing room.",
      "They became the senior pro the young ones asked before they asked the manager.",
      "The accumulated experience came to matter as much as the legs did.",
      "By the end they played less and taught more, a role not every great player takes well.",
    ],
  },
});

topic({
  id: "rise_first_league",
  group: "league_title",
  at: (f) => f.firstLeagueAge,
  chapter: "rise",
  priority: 95,
  // Top flight only — a second-division championship gets its own line.
  when: (f) => f.firstLeagueAge !== null,
  variants: {
    pt: [
      "O primeiro título nacional chegou aos {firstLeagueAge} anos, e com ele a sensação de pertencer àquele nível.",
      "Aos {firstLeagueAge} anos veio a primeira liga, o tipo de conquista que reorganiza uma carreira.",
      "A primeira medalha de campeão nacional foi conquistada aos {firstLeagueAge} anos.",
      "Foi aos {firstLeagueAge} anos que o nome apareceu pela primeira vez numa lista de campeões nacionais.",
    ],
    es: [
      "El primer título nacional llegó a los {firstLeagueAge} años, y con él la sensación de pertenecer a ese nivel.",
      "A los {firstLeagueAge} años llegó la primera liga, el tipo de conquista que reorganiza una carrera.",
      "La primera medalla de campeón nacional se consiguió a los {firstLeagueAge} años.",
      "Fue a los {firstLeagueAge} años que el nombre apareció por primera vez en una lista de campeones nacionales.",
    ],
    en: [
      "The first league title arrived at {firstLeagueAge}, and with it the sense of belonging at that level.",
      "At {firstLeagueAge} came the first championship, the kind of win that reorganises a career.",
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
      "A primeira taça veio numa copa nacional, aos {firstCupAge} anos, a prova de que dava para vencer.",
      "Aos {firstCupAge} anos ergueu o primeiro troféu da carreira, num torneio de mata-mata.",
      "O primeiro título saiu numa campanha de copa, aos {firstCupAge}, e mudou o patamar do vestiário.",
      "Foi numa copa, aos {firstCupAge} anos, que a prateleira finalmente deixou de estar vazia.",
    ],
    es: [
      "La primera copa llegó en un torneo nacional, a los {firstCupAge} años, la prueba de que se podía ganar.",
      "A los {firstCupAge} años levantó el primer trofeo de la carrera, en un torneo de eliminación directa.",
      "El primer título salió en una campaña de copa, a los {firstCupAge}, y cambió el nivel del vestuario.",
      "Fue en una copa, a los {firstCupAge} años, que la vitrina finalmente dejó de estar vacía.",
    ],
    en: [
      "The first trophy came in a domestic cup at {firstCupAge}, proof that winning was possible.",
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
      "Aos {firstCallUpAge} anos veio o chamado da seleção, a confirmação de que o trabalho tinha sido notado.",
      "A primeira convocação chegou aos {firstCallUpAge} anos, e a camisa de {nation} passou a ser sua também.",
      "O telefonema da seleção de {nation} aconteceu aos {firstCallUpAge} anos.",
    ],
    es: [
      "La convocatoria a la selección de {nation} llegó a los {firstCallUpAge} años y cambió el tamaño del nombre.",
      "A los {firstCallUpAge} años llegó el llamado de la selección, la confirmación de que el trabajo se había notado.",
      "La primera convocatoria llegó a los {firstCallUpAge} años, y la camiseta de {nation} pasó a ser suya también.",
      "El llamado de la selección de {nation} ocurrió a los {firstCallUpAge} años.",
    ],
    en: [
      "The {nation} call-up came at {firstCallUpAge} and changed the size of the name.",
      "At {firstCallUpAge} the international call arrived, confirmation that the work had been noticed.",
      "The first call-up came at {firstCallUpAge}, and the {nation} shirt became theirs too.",
      "The phone call from {nation} came at {firstCallUpAge}.",
    ],
  },
});

topic({
  id: "rise_promotion",
  chapter: "rise",
  // Same group as the second-division title: winning that division *is* the
  // promotion, and printing both gave the same season twice in two sentences.
  // The title line outranks this one, so a season that won the division says
  // so, and a season that went up without winning it still gets its line.
  group: "second_tier",
  priority: 80,
  when: (f) => f.promotions >= 1,
  variants: {
    pt: [
      "Houve também um acesso conquistado no sacrifício, dessas campanhas que unem um clube inteiro.",
      "Uma temporada na segunda divisão com o {promotionClub} terminou em acesso e com o nome ligado àquela campanha.",
      "Ajudou a tirar um clube da segunda divisão, façanha que costuma valer mais que muito título.",
      "O acesso veio depois de uma temporada longa, decidida nos detalhes.",
    ],
    es: [
      "Hubo también un ascenso conseguido a pulmón, de esas campañas que unen a un club entero.",
      "Una temporada en la segunda división con el {promotionClub} terminó en ascenso y con el nombre ligado a esa campaña.",
      "Ayudó a sacar a un club de la segunda división, hazaña que suele valer más que muchos títulos.",
      "El ascenso llegó después de una temporada larga, definida en los detalles.",
    ],
    en: [
      "There was a promotion earned the hard way too, the kind of season that binds a whole club together.",
      "A year in the division below ended in promotion, and the name was tied to that campaign forever.",
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
      "Uma lesão grave aos {severeInjuryAge} tirou uma temporada inteira e levou junto parte do que ainda estava por vir.",
      "O corpo cedeu aos {severeInjuryAge} anos, e a recuperação devolveu um jogador parecido, mas não o mesmo.",
      "Aos {severeInjuryAge} anos o joelho cobrou tudo de uma vez, e o teto da carreira baixou para sempre.",
    ],
    es: [
      "A los {severeInjuryAge} años llegó la lesión que parte la carrera en antes y después.",
      "Una lesión grave a los {severeInjuryAge} le sacó una temporada entera y se llevó parte de lo que faltaba por venir.",
      "El cuerpo cedió a los {severeInjuryAge} años, y la recuperación devolvió un jugador parecido, pero no el mismo.",
      "A los {severeInjuryAge} años la rodilla cobró todo de golpe, y el techo de la carrera bajó para siempre.",
    ],
    en: [
      "At {severeInjuryAge} came the injury that splits a career into before and after.",
      "A serious injury at {severeInjuryAge} cost a whole season and took part of what was still to come with it.",
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
      "A carreira teve endereços demais para caber num parágrafo curto, mudar de clube virou hábito.",
      "Poucos jogadores conhecem tantos vestiários quanto {lastName} conheceu.",
      "Foi um andarilho do futebol, sempre atrás do projeto que finalmente encaixasse.",
    ],
    es: [
      "Rodó bastante: fueron muchos clubes, muchos vestuarios, muchas readaptaciones.",
      "La carrera tuvo demasiados domicilios para caber en un párrafo corto, cambiar de club se volvió hábito.",
      "Pocos jugadores conocen tantos vestuarios como los que conoció {lastName}.",
      "Fue un trotamundos del fútbol, siempre detrás del proyecto que finalmente encajara.",
    ],
    en: [
      "They moved around a lot: many clubs, many dressing rooms, many fresh starts.",
      "The career had too many addresses to fit in a short paragraph, moving became a habit.",
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
  group: "peak_level",
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
  group: "peak_level",
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
  group: "peak_level",
  chapter: "peak",
  priority: 90,
  when: (f) => f.modestCareer,
  variants: {
    pt: [
      "Nunca chegou ao estrelato, mas construiu uma carreira honesta e cheia de trabalho.",
      "O teto ficou abaixo do que a base prometia, ainda assim, foram anos de futebol profissional de verdade.",
      "Faltou aquele salto final. O que sobrou foi consistência e um vestiário que sempre o respeitou.",
      "A carreira se estabilizou num patamar discreto, sem grandes vitrines, com muito suor.",
    ],
    es: [
      "Nunca llegó al estrellato, pero construyó una carrera honesta y llena de trabajo.",
      "El techo quedó por debajo de lo que las inferiores prometían, aun así, fueron años de fútbol profesional de verdad.",
      "Faltó ese salto final. Lo que quedó fue consistencia y un vestuario que siempre lo respetó.",
      "La carrera se estabilizó en un escalón discreto, sin grandes vidrieras, con mucho sudor.",
    ],
    en: [
      "Stardom never arrived, but an honest career full of hard work was built instead.",
      "The ceiling landed below what the academy years promised, still, these were real professional seasons.",
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
  group: "best_season",
  when: (f) => f.bestSeason !== null && !f.isGoalkeeper && f.bestSeason.goals + f.bestSeason.assists >= 12,
  variants: {
    pt: [
      "A melhor temporada foi aos {bestAge} anos, pelo {bestClub}: {bestGoals} gols e {bestAssists} assistências em {bestApps} jogos.",
      "Aos {bestAge} anos, no {bestClub}, produziu a temporada da vida, {bestGoals} gols e {bestAssists} assistências.",
      "O ano de {bestAge} anos ficou marcado: {bestGoals} gols, {bestAssists} assistências, {bestApps} partidas pelo {bestClub}.",
      "Nenhuma temporada superou a que fez aos {bestAge} pelo {bestClub}: {bestGoals} gols em {bestApps} jogos.",
    ],
    es: [
      "La mejor temporada fue a los {bestAge} años, en el {bestClub}: {bestGoals} goles y {bestAssists} asistencias en {bestApps} partidos.",
      "A los {bestAge} años, en el {bestClub}, produjo la temporada de su vida, {bestGoals} goles y {bestAssists} asistencias.",
      "El año de los {bestAge} quedó marcado: {bestGoals} goles, {bestAssists} asistencias, {bestApps} partidos en el {bestClub}.",
      "Ninguna temporada superó a la que hizo a los {bestAge} en el {bestClub}: {bestGoals} goles en {bestApps} partidos.",
    ],
    en: [
      "The best season came at {bestAge}, with {bestClub}: {bestGoals} goals and {bestAssists} assists in {bestApps} games.",
      "At {bestAge}, at {bestClub}, they produced the season of a lifetime, {bestGoals} goals and {bestAssists} assists.",
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
  group: "best_season",
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
  // A back four keeps clean sheets too, and for a centre-back it is the
  // number their whole career is read off. The variants below avoid saying
  // "goalkeeper" so the line fits either job.
  when: (f) => (f.isGoalkeeper || f.isDefender) && f.totalCleanSheets >= 120,
  variants: {
    pt: [
      "Foram {cleanSheets} jogos sem sofrer gol, a estatística que melhor resume a carreira.",
      "Terminou com {cleanSheets} partidas de meta invicta, construídas na base da regularidade.",
      "A conta de {cleanSheets} jogos sem levar gol explica por que os treinadores raramente o tiraram.",
      "Manteve o gol zerado {cleanSheets} vezes, número que sustenta carreiras inteiras.",
    ],
    es: [
      "Fueron {cleanSheets} partidos sin recibir goles, la estadística que mejor resume la carrera.",
      "Terminó con {cleanSheets} partidos con la valla invicta, construidos a base de regularidad.",
      "La cuenta de {cleanSheets} partidos sin goles en contra explica por qué los técnicos rara vez lo sacaron.",
      "Mantuvo el arco en cero {cleanSheets} veces, número que sostiene carreras enteras.",
    ],
    en: [
      "There were {cleanSheets} clean sheets, the statistic that best sums up the career.",
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
  group: "golden_boot",
  when: (f) => f.goldenBoots >= 1 && !recordAlreadySaid(f, "golden_boots"),
  variants: {
    pt: [
      "Foi artilheiro, e não apenas uma vez: o prêmio de goleador virou hábito.",
      "A artilharia veio para a estante, confirmando o que os números já gritavam.",
      "Terminou temporadas como maior goleador, o tipo de reconhecimento que não se discute.",
      "Ganhou prêmio de artilheiro, encerrando qualquer debate sobre quem mais fazia gol.",
    ],
    es: [
      "Fue goleador, y no una sola vez, el premio al máximo artillero se volvió costumbre.",
      "La bota de goleador llegó a la vitrina, confirmando lo que los números ya gritaban.",
      "Terminó temporadas como máximo goleador, el tipo de reconocimiento que no se discute.",
      "Ganó el premio al goleador, cerrando cualquier debate sobre quién hacía más goles.",
    ],
    en: [
      "They finished as top scorer, and not just once, the golden boot became a habit.",
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
  group: "ballon_dor",
  when: (f) => f.ballonDors >= 1 && !recordAlreadySaid(f, "ballon_dor"),
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
  group: "club_standing",
  chapter: "peak",
  priority: 86,
  when: (f) => f.idolClubs.length > 0 && f.legendClubs.length === 0,
  variants: {
    pt: [
      "No {idolClub}, virou ídolo, daqueles cujo nome a arquibancada canta sem precisar de motivo.",
      "A relação com a torcida do {idolClub} passou do respeito para a idolatria.",
      "Conquistou o status de ídolo no {idolClub}, construído jogo a jogo.",
      "Para a torcida do {idolClub}, deixou de ser mais um contratado e virou referência afetiva.",
    ],
    es: [
      "En el {idolClub} se volvió ídolo, de esos cuyo nombre la tribuna canta sin necesitar motivo.",
      "La relación con la hinchada del {idolClub} pasó del respeto a la idolatría.",
      "Consiguió el estatus de ídolo en el {idolClub}, construido partido a partido.",
      "Para la hinchada del {idolClub}, dejó de ser un fichaje más y se volvió referencia afectiva.",
    ],
    en: [
      "At {idolClub} they became an idol, the kind whose name the stands sing without needing a reason.",
      "The relationship with the {idolClub} support moved from respect into genuine adoration.",
      "They earned idol status at {idolClub}, built game by game.",
      "To the {idolClub} fans, they stopped being another signing and became something people loved.",
    ],
  },
});

topic({
  id: "peak_legend",
  group: "club_standing",
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

// The two continental tiers get their own lines, and both name the actual
// competition. Reading "the ceiling of any club career" about a Sudamericana
// is the kind of overclaim that makes a reader stop trusting the whole page.
topic({
  id: "peak_continental",
  at: (f) => f.firstContinentalPrimary?.age ?? null,
  chapter: "peak",
  priority: 98,
  group: "continental",
  when: (f) => f.firstContinentalPrimary !== null,
  variants: {
    pt: [
      "A {continentalPrimary} chegou aos {continentalPrimaryAge} anos, a noite que separa carreiras boas de carreiras grandes.",
      "Aos {continentalPrimaryAge} anos ergueu a {continentalPrimary} o teto de qualquer carreira de clube.",
      "A {continentalPrimary} veio aos {continentalPrimaryAge}, e mudou de vez o peso daquele currículo.",
      "Foi aos {continentalPrimaryAge} anos que o nome entrou na lista de campeões da {continentalPrimary}.",
    ],
    es: [
      "La {continentalPrimary} llegó a los {continentalPrimaryAge} años, la noche que separa carreras buenas de carreras grandes.",
      "A los {continentalPrimaryAge} años levantó la {continentalPrimary}, el techo de cualquier carrera de club.",
      "La {continentalPrimary} llegó a los {continentalPrimaryAge}, y cambió de una vez el peso de ese currículum.",
      "Fue a los {continentalPrimaryAge} años que el nombre entró en la lista de campeones de la {continentalPrimary}.",
    ],
    en: [
      "The {continentalPrimary} came at {continentalPrimaryAge}, the night that separates good careers from great ones.",
      "At {continentalPrimaryAge} they lifted the {continentalPrimary}, the ceiling of any club career.",
      "The {continentalPrimary} arrived at {continentalPrimaryAge}, and permanently changed the weight of that CV.",
      "It was at {continentalPrimaryAge} that the name joined the list of {continentalPrimary} winners.",
    ],
  },
});

topic({
  id: "peak_continental_secondary",
  at: (f) => f.firstContinentalSecondary?.age ?? null,
  chapter: "peak",
  // Real silverware and a real European or South American night, but not the
  // one that defines a career — so it sits below the primary and yields to it.
  priority: 84,
  group: "continental",
  when: (f) => f.firstContinentalSecondary !== null,
  variants: {
    pt: [
      "Aos {continentalSecondaryAge} anos levantou a {continentalSecondary}, não é a maior taça do continente, mas é uma noite europeia de verdade no currículo.",
      "A {continentalSecondary} veio aos {continentalSecondaryAge}: um título internacional, e a prova de que aquele time chegou longe.",
      "Foi campeão da {continentalSecondary} aos {continentalSecondaryAge} anos, o primeiro troféu que atravessou fronteiras.",
    ],
    es: [
      "A los {continentalSecondaryAge} años levantó la {continentalSecondary}, no es la copa más grande del continente, pero es una noche internacional de verdad.",
      "La {continentalSecondary} llegó a los {continentalSecondaryAge}: un título internacional, y la prueba de que aquel equipo llegó lejos.",
      "Fue campeón de la {continentalSecondary} a los {continentalSecondaryAge} años, el primer trofeo que cruzó fronteras.",
    ],
    en: [
      "At {continentalSecondaryAge} they lifted the {continentalSecondary}, not the continent's biggest cup, but a real European night on the CV.",
      "The {continentalSecondary} came at {continentalSecondaryAge}: an international title, and proof that side went a long way.",
      "They won the {continentalSecondary} at {continentalSecondaryAge}, the first trophy that crossed a border.",
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
      "Foi campeão mundial, a conquista que reescreve tudo que veio antes e depois.",
      "Levantou a Copa do Mundo com {nation}, encerrando qualquer discussão sobre grandeza.",
    ],
    es: [
      "Y ocurrió lo que casi nadie consigue: campeón del mundo con {nation}.",
      "Llegó la Copa del Mundo, y con ella el lugar más alto que un jugador de {nation} puede ocupar.",
      "Fue campeón mundial, la conquista que reescribe todo lo que vino antes y después.",
      "Levantó la Copa del Mundo con {nation}, cerrando cualquier discusión sobre grandeza.",
    ],
    en: [
      "And then the thing almost nobody manages happened: world champion with {nation}.",
      "The World Cup came, and with it the highest place a {nation} player can occupy.",
      "They were a world champion, the win that rewrites everything before and after it.",
      "They lifted the World Cup with {nation}, ending any discussion about greatness.",
    ],
  },
});

topic({
  id: "peak_national_continental",
  chapter: "peak",
  priority: 90,
  when: (f) => f.wonNationalContinental,
  variants: {
    pt: [
      "Com a seleção de {nation}, veio um título continental, a maior alegria possível fora de uma Copa.",
      "O título continental por {nation} coroou a passagem pela seleção.",
      "Foi campeão continental com {nation}, num torneio decidido nos detalhes.",
      "A seleção de {nation} rendeu um troféu continental, e o nome ficou ligado àquele elenco para sempre.",
    ],
    es: [
      "Con la selección de {nation} llegó un título continental, la mayor alegría posible fuera de un Mundial.",
      "El título continental con {nation} coronó su paso por la selección.",
      "Fue campeón continental con {nation}, en un torneo definido en los detalles.",
      "La selección de {nation} le dio un trofeo continental, y el nombre quedó ligado a ese plantel para siempre.",
    ],
    en: [
      "With {nation} came a continental title, the greatest joy available outside a World Cup.",
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
      "A comparação constante com {rival} acompanhou os melhores anos, e, no fim, {lastName} chegou mais alto.",
      "Toda geração tem seu duelo. O de {lastName} foi contra {rival}, e a disputa terminou favorável.",
      "Passou anos sendo medido contra {rival}, até o dia em que a comparação deixou de fazer sentido.",
      "A rivalidade com {rival} empurrou os dois para cima, mas foi {lastName} quem atingiu o pico mais alto.",
    ],
    es: [
      "La comparación constante con {rival} acompañó los mejores años, y, al final, {lastName} llegó más alto.",
      "Toda generación tiene su duelo. El de {lastName} fue contra {rival}, y la disputa terminó a su favor.",
      "Pasó años siendo medido contra {rival}, hasta el día en que la comparación dejó de tener sentido.",
      "La rivalidad con {rival} empujó a los dos hacia arriba, pero fue {lastName} quien alcanzó el pico más alto.",
    ],
    en: [
      "The constant comparison with {rival} shadowed the best years, and in the end {lastName} climbed higher.",
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
      "Alguns números saíram do campo e foram parar na história, {recordList}.",
      "A carreira mexeu com marcas que pareciam intocáveis: {recordList}.",
      "Registros que resistiam há décadas caíram: {recordList}.",
    ],
    es: [
      "Y entró en los libros: {recordList}.",
      "Algunos números salieron de la cancha y fueron a parar a la historia, {recordList}.",
      "La carrera tocó marcas que parecían intocables: {recordList}.",
      "Registros que resistían hacía décadas cayeron: {recordList}.",
    ],
    en: [
      "And into the record books they went: {recordList}.",
      "Some numbers left the pitch and ended up in history, {recordList}.",
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
  group: "decline",
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
  group: "decline",
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
  group: "return",
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
  group: "club_span",
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
  group: "club_span",
  chapter: "twilight",
  priority: 76,
  // Silent when the key spell already covered this club: the peak chapter
  // says "X took the best years, N seasons and N games", and this one then
  // added "X held most of the story, season after season" — the same
  // sentence twice about the same club, a few lines apart.
  when: (f) =>
    !f.oneClubMan &&
    f.longestSpell !== null &&
    f.longestSpell.seasons >= 8 &&
    f.keySpell?.name !== f.longestSpell.name,
  variants: {
    pt: [
      "A passagem mais longa foi pelo {longestClub}, onde ficou tempo suficiente para virar parte da mobília.",
      "Foram muitos anos no {longestClub}, a casa mais duradoura de toda a carreira.",
      "O {longestClub} concentrou a maior parte da história: temporada após temporada, sem pressa de sair.",
      "Nenhum clube teve {lastName} por tanto tempo quanto o {longestClub}.",
    ],
    es: [
      "El paso más largo fue por el {longestClub}, donde estuvo el tiempo suficiente para volverse parte del mobiliario.",
      "Fueron muchos años en el {longestClub}, la casa más duradera de toda la carrera.",
      "El {longestClub} concentró la mayor parte de la historia: temporada tras temporada, sin apuro por irse.",
      "Ningún club tuvo a {lastName} tanto tiempo como el {longestClub}.",
    ],
    en: [
      "The longest spell was at {longestClub}, where they stayed long enough to become part of the furniture.",
      "There were many years at {longestClub}, the most enduring home of the whole career.",
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
  group: "retire",
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
  group: "retire",
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

/**
 * Below this, hanging up the boots is a story in itself rather than the
 * ordinary end of a career. Real players do retire in their early thirties;
 * doing it before then is the kind of thing a profile leads with.
 */
const EARLY_RETIREMENT_AGE = 33;

topic({
  id: "legacy_retire_early_choice",
  group: "retire",
  at: (f) => f.retirementAge,
  chapter: "legacy",
  priority: 91,
  // Walking away with years still in the legs is a different ending from
  // fading out, and the paper should not confuse the two. Only fires when
  // the player was still worth a place: a retirement at 29 off the back of
  // a collapse already has its own, bleaker line.
  when: (f) =>
    f.retirementReason === "voluntary" &&
    f.retirementAge <= EARLY_RETIREMENT_AGE &&
    f.finalOverall >= f.peakOverall - 6,
  variants: {
    pt: [
      "Aos {retireAge} anos, ainda inteiro, decidiu que estava bom e parou.",
      "Ninguém o empurrou para fora: pendurou as chuteiras aos {retireAge}, no tempo dele.",
      "Saiu de cena aos {retireAge}, com futebol de sobra e a decisão nas próprias mãos.",
      "O fim veio cedo e por escolha: aos {retireAge} anos, sem ninguém pedir."
    ],
    es: [
      "A los {retireAge} años, todavía entero, decidió que estaba bien y paró.",
      "Nadie lo empujó afuera: colgó los botines a los {retireAge}, en su tiempo.",
      "Se fue a los {retireAge}, con fútbol de sobra y la decisión en sus manos.",
      "El final llegó temprano y por elección: a los {retireAge} años, sin que nadie lo pidiera."
    ],
    en: [
      "At {retireAge}, still whole, they decided it was enough and stopped.",
      "Nobody pushed them out: the boots went up at {retireAge}, on their own terms.",
      "They walked away at {retireAge}, football still in the legs and the call their own.",
      "The ending came early and by choice: {retireAge} years old, with nobody asking."
    ],
  },
});

topic({
  id: "legacy_retire_no_offers",
  group: "retire",
  chapter: "legacy",
  priority: 90,
  when: (f) => f.retirementReason === "no_offers" || f.retirementReason === "poor_form",
  variants: {
    pt: [
      "O fim não foi escolhido: as propostas simplesmente pararam de chegar.",
      "A aposentadoria veio pela porta dos fundos, sem festa e sem jogo de despedida.",
      "Não houve escolha no encerramento: o mercado decidiu antes que o jogador decidisse.",
      "Terminou em baixa, num momento em que o telefone havia parado de tocar.",
    ],
    es: [
      "El final no fue elegido: las propuestas simplemente dejaron de llegar.",
      "El retiro llegó por la puerta de atrás, sin fiesta y sin partido despedida.",
      "No hubo elección en el cierre, el mercado decidió antes que el jugador.",
      "Terminó en baja, en un momento en que el teléfono había dejado de sonar.",
    ],
    en: [
      "The ending wasn't chosen: the offers simply stopped arriving.",
      "Retirement came through the back door, with no party and no farewell match.",
      "There was no choice in the ending, the market decided before the player did.",
      "They finished on the way down, at a point where the phone had stopped ringing.",
    ],
  },
});

topic({
  id: "legacy_trophy_haul",
  group: "haul",
  chapter: "legacy",
  priority: 92,
  when: (f) => f.totalTrophies >= 8,
  variants: {
    pt: [
      "A prateleira final contou {trophies} títulos, acumulados em clubes e seleção.",
      "Foram {trophies} taças ao todo, uma carreira construída para ganhar.",
      "O currículo fechou com {trophies} conquistas, número que fala por si.",
      "Somou {trophies} títulos, o tipo de coleção que só se monta com longevidade e boas escolhas.",
    ],
    es: [
      "La vitrina final contó {trophies} títulos, acumulados en clubes y selección.",
      "Fueron {trophies} copas en total, una carrera construida para ganar.",
      "El currículum cerró con {trophies} conquistas, número que habla por sí solo.",
      "Sumó {trophies} títulos, el tipo de colección que solo se arma con longevidad y buenas decisiones.",
    ],
    en: [
      "The final cabinet held {trophies} trophies, collected across clubs and country.",
      "There were {trophies} trophies in all, a career built to win.",
      "The CV closed with {trophies} honours, a number that speaks for itself.",
      "They gathered {trophies} trophies, the kind of collection only longevity and good choices build.",
    ],
  },
});

topic({
  id: "legacy_trophyless",
  group: "haul",
  chapter: "legacy",
  priority: 94,
  when: (f) => f.trophyless,
  variants: {
    pt: [
      "Não houve títulos. Houve, sim, uma carreira inteira de futebol profissional, o que já é raro o bastante.",
      "A prateleira ficou vazia, mas o currículo tem centenas de jogos que ninguém pode tirar.",
      "Faltou a taça. Sobrou trabalho, presença e uma carreira longa em campo.",
      "Nunca ergueu um troféu, destino de muitos bons jogadores que nasceram nos clubes errados.",
    ],
    es: [
      "No hubo títulos. Hubo, sí, una carrera entera de fútbol profesional, lo que ya es bastante raro.",
      "La vitrina quedó vacía, pero el currículum tiene cientos de partidos que nadie puede sacar.",
      "Faltó la copa. Sobró trabajo, presencia y una carrera larga en la cancha.",
      "Nunca levantó un trofeo, destino de muchos buenos jugadores que nacieron en los clubes equivocados.",
    ],
    en: [
      "There were no trophies. There was a whole career in professional football, which is rare enough by itself.",
      "The cabinet stayed empty, but the CV holds hundreds of games nobody can take away.",
      "The silverware never came. The work, the presence and a long career on the pitch did.",
      "They never lifted a trophy, the fate of many good players born into the wrong clubs.",
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
      "No total, foram {apps} partidas oficiais, longevidade que poucos alcançam.",
      "Entrou em campo {apps} vezes ao longo da carreira.",
      "As {apps} partidas disputadas dizem muito sobre disciplina e resistência.",
      "Fechou a carreira com {apps} jogos, número que exige anos de cuidado com o corpo.",
    ],
    es: [
      "En total fueron {apps} partidos oficiales, longevidad que pocos alcanzan.",
      "Entró a la cancha {apps} veces a lo largo de la carrera.",
      "Los {apps} partidos disputados dicen mucho sobre disciplina y resistencia.",
      "Cerró la carrera con {apps} partidos, número que exige años de cuidado del cuerpo.",
    ],
    en: [
      "In all there were {apps} official appearances, longevity few ever reach.",
      "They walked onto the pitch {apps} times across the career.",
      "The {apps} games played say a great deal about discipline and durability.",
      "They closed the career on {apps} appearances, a number that demands years of looking after the body.",
    ],
  },
});

topic({
  id: "legacy_national_never",
  group: "caps",
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
  group: "caps",
  chapter: "legacy",
  priority: 82,
  when: (f) => f.capsBand === "regular" || f.capsBand === "mainstay" || f.capsBand === "icon",
  variants: {
    pt: [
      "Pela seleção de {nation}, foram {caps} jogos, presença constante por muitos anos.",
      "Acumulou {caps} partidas por {nation}, virando nome fixo nas convocações.",
      "Os {caps} jogos pela seleção mostram que o posto era realmente dele.",
      "Defendeu {nation} em {caps} oportunidades ao longo da carreira.",
    ],
    es: [
      "Por la selección de {nation} fueron {caps} partidos, presencia constante durante muchos años.",
      "Acumuló {caps} partidos con {nation}, volviéndose nombre fijo en las convocatorias.",
      "Los {caps} partidos por la selección muestran que el puesto era realmente suyo.",
      "Defendió a {nation} en {caps} oportunidades a lo largo de la carrera.",
    ],
    en: [
      "For {nation} there were {caps} caps, a constant presence over many years.",
      "They gathered {caps} appearances for {nation}, becoming a fixture in the squad.",
      "The {caps} international caps show the shirt really was theirs.",
      "They represented {nation} on {caps} occasions across the career.",
    ],
  },
});

topic({
  id: "legacy_national_fringe",
  group: "caps",
  chapter: "legacy",
  priority: 78,
  when: (f) => f.capsBand === "fringe",
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
  group: "verdict",
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
  group: "verdict",
  chapter: "legacy",
  priority: (f) => (f.totalTrophies >= 6 ? 62 : 90),
  when: (f) => f.peakOverall >= 75 && f.peakOverall < 85,
  variants: {
    pt: [
      "Não foi uma carreira de lenda, mas foi uma carreira de respeito, longa, séria e bem construída.",
      "Fica a imagem de um profissional confiável, que rendeu por muitos anos num bom nível.",
      "É a carreira que a maioria dos jogadores gostaria de ter e poucos conseguem: estável e digna.",
      "O saldo é claramente positivo: anos no alto nível e a confiança de quem trabalhou com ele.",
    ],
    es: [
      "No fue una carrera de leyenda, pero fue una carrera de respeto, larga, seria y bien construida.",
      "Queda la imagen de un profesional confiable, que rindió durante muchos años en buen nivel.",
      "Es la carrera que la mayoría de los jugadores querría tener y pocos consiguen: estable y digna.",
      "El saldo es claramente positivo: años en el alto nivel y la confianza de quienes trabajaron con él.",
    ],
    en: [
      "It wasn't a legendary career, but it was a respected one, long, serious and well built.",
      "What remains is the picture of a dependable professional who delivered at a good level for years.",
      "It's the career most players would want and few get: steady and dignified.",
      "The balance is clearly positive: years at a high level, and the trust of everyone who worked with them.",
    ],
  },
});

topic({
  id: "legacy_verdict_modest",
  group: "verdict",
  chapter: "legacy",
  priority: (f) => (f.totalTrophies >= 6 ? 60 : 88),
  // A modest career is not automatically a wasted one. This block leads with
  // "the talent asked for more", which is only fair to say when the rolled
  // ceiling really was well clear of what the player reached — a peak of 63
  // off a 66 ceiling squeezed out everything it had.
  when: (f) => f.modestCareer && f.unfulfilledPotential,
  variants: {
    pt: [
      "Ficou a sensação de potencial não completamente aproveitado, mas também a de quem nunca deixou de tentar.",
      "O talento talvez pedisse mais. Ainda assim, viver de futebol por tantos anos não é pouca coisa.",
      "É a história de milhares de jogadores: carreira honesta, sem holofotes, encerrada em silêncio.",
      "Não virou nome de manchete, mas foi profissional de verdade do começo ao fim.",
    ],
    es: [
      "Quedó la sensación de potencial no del todo aprovechado, pero también la de quien nunca dejó de intentarlo.",
      "El talento tal vez pedía más. Aun así, vivir del fútbol tantos años no es poca cosa.",
      "Es la historia de miles de jugadores: carrera honesta, sin focos, cerrada en silencio.",
      "No fue nombre de titular de diario, pero fue profesional de verdad de principio a fin.",
    ],
    en: [
      "There's a sense of potential not fully used but also of someone who never stopped trying.",
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

// ---------------------------------------------------------------------------
// Coverage lines
//
// Everything above describes a *moment*. These describe the shape of the
// career, and they exist because auditing 100 generated articles showed the
// old set could talk for fifteen sentences without ever saying where someone
// played, how many times they won the thing they kept winning, or that they
// went back to a club they had already left.
// ---------------------------------------------------------------------------

topic({
  id: "peak_intercontinental",
  chapter: "peak",
  // The annual title, worth saying and worth not overselling. A European
  // champion adds it to a list; anyone else beat Europe to get it, and the
  // line says so.
  priority: (f) => 88 + Math.min(6, f.intercontinentalCups * 2),
  when: (f) => f.intercontinentalCups > 0 && f.clubWorldCups === 0,
  variants: {
    pt: [
      "Ganhou a Copa Intercontinental, a noite em que os campeões de cada continente se enfrentam.",
      "Houve também o título intercontinental: um jogo só, contra o melhor do outro lado do mundo.",
      "A Intercontinental entrou na conta: noventa minutos para decidir quem mandava entre dois continentes.",
      "Levantou a Intercontinental, título curto de disputar e longo de lembrar."
    ],
    es: [
      "Ganó la Copa Intercontinental, la noche en que los campeones de cada continente se enfrentan.",
      "También llegó el título intercontinental, un solo partido, contra lo mejor del otro lado del mundo.",
      "La Intercontinental entró en la cuenta: noventa minutos para decidir quién mandaba entre dos continentes.",
      "Levantó la Intercontinental, título corto de jugar y largo de recordar."
    ],
    en: [
      "They won the Intercontinental Cup, the night the champions of each continent meet.",
      "The intercontinental title came too: one match, against the best of the other side of the world.",
      "The Intercontinental went into the count: ninety minutes to settle which continent was better.",
      "They lifted the Intercontinental, a short trophy to win and a long one to remember."
    ],
  },
});

topic({
  id: "peak_club_world_cup",
  chapter: "peak",
  // The most valuable club trophy in the game had no words at all: a career
  // could win it and the biography would never say so.
  priority: (f) => 99 + Math.min(6, f.clubWorldCups * 3),
  when: (f) => f.clubWorldCups > 0,
  variants: {
    pt: [
      "Foi campeão do mundo com o clube o título que coloca um time acima de todos os outros continentes.",
      "O Mundial de Clubes também foi conquistado, encerrando a discussão sobre o tamanho daquela equipe.",
      "Levantou o troféu de campeão mundial de clubes, o teto absoluto de uma carreira em clubes.",
      "Venceu o Mundial de Clubes: naquele ano, não havia time melhor no planeta.",
    ],
    es: [
      "Fue campeón del mundo con el club, el título que pone a un equipo por encima del resto de los continentes.",
      "El Mundial de Clubes también llegó, cerrando la discusión sobre el tamaño de ese equipo.",
      "Levantó el trofeo de campeón mundial de clubes, el techo absoluto de una carrera en clubes.",
      "Ganó el Mundial de Clubes: ese año no había equipo mejor en el planeta.",
    ],
    en: [
      "They were club world champions, the title that puts a side above every other continent.",
      "The Club World Cup came too, settling any argument about how good that team was.",
      "They lifted the club world championship, the absolute ceiling of a club career.",
      "They won the Club World Cup: that year there was no better team on the planet.",
    ],
  },
});

topic({
  id: "rise_suspension",
  chapter: "rise",
  // A ban costing whole seasons is one of the largest things that can happen
  // to a career, and there was no line for it in any language.
  priority: (f) => 96 + Math.min(6, f.suspendedSeasons * 2),
  when: (f) => f.suspendedSeasons > 0,
  variants: {
    // No adjective may follow {suspensionSpan}: the span is one season or
    // several, and Portuguese and Spanish would need to agree with it.
    pt: [
      "Houve uma suspensão que custou caro: {suspensionSpan} fora de campo, longe do jogo e da evolução.",
      "Um episódio disciplinar interrompeu tudo, {suspensionSpan} sem entrar em campo.",
      "A carreira parou por punição: {suspensionSpan} assistindo de fora.",
    ],
    es: [
      "Hubo una suspensión que costó caro: {suspensionSpan} fuera de la cancha, lejos del juego.",
      "Un episodio disciplinario lo interrumpió todo, {suspensionSpan} sin pisar el campo.",
      "La carrera se detuvo por sanción: {suspensionSpan} mirando desde afuera.",
    ],
    en: [
      "There was a ban that cost dearly: {suspensionSpan} out of the game entirely.",
      "A disciplinary episode stopped everything, {suspensionSpan} without kicking a ball.",
      "The career was halted by suspension: {suspensionSpan} spent watching from outside.",
    ],
  },
});

topic({
  id: "peak_ballon_dor_serial",
  chapter: "peak",
  // Three world-player awards is a different career from one, and the single
  // award line could not say so.
  priority: (f) => 102 + Math.min(8, f.ballonDors * 2),
  group: "ballon_dor",
  when: (f) => f.ballonDors >= 2 && !recordAlreadySaid(f, "ballon_dor"),
  variants: {
    pt: [
      "Foi eleito o melhor do mundo {ballonDors} vezes, companhia restrita a meia dúzia de nomes na história.",
      "{ballonDors} prêmios de melhor jogador do mundo: não houve debate durante anos.",
      "Levou {ballonDors} vezes o troféu de melhor do planeta, e ninguém achou estranho.",
    ],
    es: [
      "Fue elegido el mejor del mundo {ballonDors} veces, compañía reservada a media docena de nombres.",
      "{ballonDors} premios al mejor jugador del mundo: no hubo debate durante años.",
      "Se llevó {ballonDors} veces el trofeo al mejor del planeta, y a nadie le pareció raro.",
    ],
    en: [
      "They were voted the world's best {ballonDors} times, company only half a dozen names have kept.",
      "{ballonDors} world player of the year awards: there was no argument for years.",
      "They took the world's-best trophy {ballonDors} times, and nobody found it strange.",
    ],
  },
});

topic({
  id: "peak_golden_boot_serial",
  chapter: "peak",
  priority: (f) => 89 + Math.min(9, f.goldenBoots * 2),
  group: "golden_boot",
  when: (f) => f.goldenBoots >= 2 && !recordAlreadySaid(f, "golden_boots"),
  variants: {
    pt: [
      "Foi artilheiro {goldenBoots} vezes: o gol era a assinatura.",
      "{goldenBoots} prêmios de artilheiro dizem tudo sobre o que fazia na área.",
      "Terminou {goldenBoots} temporadas como maior goleador.",
    ],
    es: [
      "Fue goleador {goldenBoots} veces, el gol era la firma.",
      "{goldenBoots} premios de goleador dicen todo sobre lo que hacía en el área.",
      "Terminó {goldenBoots} temporadas como máximo anotador.",
    ],
    en: [
      "They finished top scorer {goldenBoots} times, goals were the signature.",
      "{goldenBoots} golden boots say everything about what they did in the box.",
      "They ended {goldenBoots} seasons as the division's leading scorer.",
    ],
  },
});

topic({
  id: "peak_best_season_quiet",
  chapter: "peak",
  priority: 95,
  group: "best_season",
  at: (f) => f.bestSeason?.age ?? null,
  // Defenders and holding midfielders never clear the goals-plus-assists bar
  // the other best-season lines use, so their defining year went unmentioned
  // entirely. Describe it by minutes and level instead.
  when: (f) =>
    f.bestSeason !== null &&
    !f.isGoalkeeper &&
    f.bestSeason.goals + f.bestSeason.assists < 12 &&
    f.bestSeason.appearances >= 25,
  variants: {
    pt: [
      "A temporada mais completa foi aos {bestAge} anos, no {bestClub}: {bestApps} jogos, praticamente sem descanso.",
      "Aos {bestAge} anos, pelo {bestClub}, jogou {bestApps} partidas, o ano em que foi indiscutível.",
      "O melhor ano veio aos {bestAge}, com {bestApps} jogos pelo {bestClub} e o nome sempre na escalação.",
      "Aos {bestAge} anos disputou {bestApps} partidas pelo {bestClub}, a temporada mais sólida de todas.",
    ],
    es: [
      "La temporada más completa fue a los {bestAge} años, en el {bestClub}: {bestApps} partidos, casi sin descanso.",
      "A los {bestAge} años, en el {bestClub}, jugó {bestApps} partidos, el año en que fue indiscutible.",
      "El mejor año llegó a los {bestAge}, con {bestApps} partidos en el {bestClub} y el nombre siempre en la alineación.",
      "A los {bestAge} años disputó {bestApps} partidos en el {bestClub}, la temporada más sólida de todas.",
    ],
    en: [
      "The most complete season came at {bestAge} with {bestClub}: {bestApps} games, barely a rest.",
      "At {bestAge}, for {bestClub}, they played {bestApps} matches, the year they were undroppable.",
      "The best year arrived at {bestAge}, {bestApps} games for {bestClub} and the name always on the teamsheet.",
      "At {bestAge} they played {bestApps} games for {bestClub}, the most solid season of the lot.",
    ],
  },
});

topic({
  id: "rise_itinerary",
  chapter: "rise",
  priority: (f) => 88 + Math.min(10, f.clubCount),
  group: "itinerary",
  when: (f) => f.itinerary.length >= 3 && !f.oneClubMan,
  variants: {
    pt: [
      "O mapa da carreira passou por {itinerary}.",
      "A estrada foi essa: {itinerary}.",
      "Entre idas e vindas, vestiu as camisas de {itinerary}.",
      "O caminho ligou {itinerary}, cada parada com o seu peso.",
    ],
    es: [
      "El mapa de la carrera pasó por {itinerary}.",
      "El camino fue ese: {itinerary}.",
      "Entre idas y vueltas, vistió las camisetas de {itinerary}.",
      "La ruta unió {itinerary}, cada parada con su peso.",
    ],
    en: [
      "The map of the career ran through {itinerary}.",
      "The road went like this: {itinerary}.",
      "Between moves, they wore the shirts of {itinerary}.",
      "The path linked {itinerary}, every stop with its own weight.",
    ],
  },
});

topic({
  id: "peak_key_spell",
  chapter: "peak",
  priority: (f) => 90 + Math.min(10, f.keySpell ? f.keySpell.seasons : 0),
  group: "key_spell",
  when: (f) =>
    f.keySpell !== null && f.keySpell.seasons >= 4 && f.keySpell.appearances >= 60 && !f.oneClubMan,
  at: (f) => f.keySpell?.from ?? null,
  variants: {
    pt: [
      "Foram {keySeasons} temporadas no {keyClub}, dos {keyFrom} aos {keyTo} anos: {keyApps} jogos com a camisa do clube.",
      "O {keyClub} ficou com o melhor pedaço: {keySeasons} temporadas e {keyApps} partidas, entre os {keyFrom} e os {keyTo}.",
      "Dos {keyFrom} aos {keyTo} anos o endereço foi o mesmo, {keyClub}, {keyApps} jogos depois.",
      "No {keyClub} foram {keySeasons} temporadas inteiras, {keyApps} jogos, a fase mais longa de todas.",
    ],
    es: [
      "Fueron {keySeasons} temporadas en el {keyClub}, de los {keyFrom} a los {keyTo} años: {keyApps} partidos con esa camiseta.",
      "El {keyClub} se quedó con el mejor tramo: {keySeasons} temporadas y {keyApps} partidos, entre los {keyFrom} y los {keyTo}.",
      "De los {keyFrom} a los {keyTo} años el domicilio fue el mismo, {keyClub}, {keyApps} partidos después.",
      "En el {keyClub} fueron {keySeasons} temporadas enteras, {keyApps} partidos, la etapa más larga de todas.",
    ],
    en: [
      "It was {keySeasons} seasons at {keyClub}, from {keyFrom} to {keyTo}: {keyApps} games in that shirt.",
      "{keyClub} got the best of it, {keySeasons} seasons and {keyApps} appearances, between {keyFrom} and {keyTo}.",
      "From {keyFrom} to {keyTo} the address never changed, {keyClub}, {keyApps} games later.",
      "At {keyClub} it ran to {keySeasons} full seasons and {keyApps} games, the longest stretch of the lot.",
    ],
  },
});

topic({
  id: "twilight_returned_to_club",
  chapter: "twilight",
  priority: (f) => 88 + Math.min(6, f.returns.length * 3),
  group: "return",
  at: (f) => f.returns[f.returns.length - 1]?.age ?? null,
  // Not when the return *is* the step up to a big club — `rise_joined_giant`
  // already describes that exact transfer, and printing both gave two
  // consecutive sentences about one move.
  when: (f) => {
    if (f.homecomingAge !== null || f.returns.length === 0) return false;
    const last = f.returns[f.returns.length - 1];
    return !(f.giantMove !== null && f.giantMove.name === last.name && f.giantMove.from === last.age);
  },
  variants: {
    pt: [
      "Aos {returnAge} anos assinou de novo com o {returnClub}, clube que já conhecia por dentro.",
      "Houve um reencontro: de volta ao {returnClub} aos {returnAge} anos, anos depois da primeira despedida.",
      "O {returnClub} apareceu duas vezes na história, a segunda aos {returnAge} anos.",
      "Aos {returnAge} refez o caminho de volta ao {returnClub}.",
    ],
    es: [
      "A los {returnAge} años firmó otra vez con el {returnClub}, un club que ya conocía por dentro.",
      "Hubo reencuentro: de vuelta al {returnClub} a los {returnAge} años, mucho después de la primera despedida.",
      "El {returnClub} apareció dos veces en la historia, la segunda a los {returnAge} años.",
      "A los {returnAge} rehízo el camino de vuelta al {returnClub}.",
    ],
    en: [
      "At {returnAge} they signed for {returnClub} again, a club they already knew from the inside.",
      "There was a reunion: back at {returnClub} at {returnAge}, years after the first goodbye.",
      "{returnClub} appears twice in the story, the second time at {returnAge}.",
      "At {returnAge} they retraced the road back to {returnClub}.",
    ],
  },
});

/**
 * Whether the record list already told the reader this number.
 *
 * The broken-records line prints things like "13 títulos do Brasileirão,
 * superando os 5 de Mayke", and the serial-winner lines that follow then said
 * "a conta fechou em 13 ligas conquistadas" two sentences later. Same fact,
 * twice, in the same paragraph. When the record covers it, the plainer line
 * stands down.
 */
function recordAlreadySaid(f: BioFacts, key: string): boolean {
  return f.brokenRecords.some((r) => r.key === key);
}

// -- Repeat winners ---------------------------------------------------------

topic({
  id: "peak_serial_league",
  chapter: "peak",
  priority: (f) => 94 + Math.min(12, f.topFlightTitles),
  when: (f) => f.topFlightTitles >= 3 && !recordAlreadySaid(f, "league_titles"),
  variants: {
    pt: [
      "Foram {topFlightTitles} títulos nacionais no total o campeonato virou hábito.",
      "Levantou a taça da liga {topFlightTitles} vezes, o suficiente para uma geração inteira associar o nome ao título.",
      "{topFlightTitles} campeonatos nacionais depois, ninguém mais discutia o lugar dele.",
      "A conta fechou em {topFlightTitles} ligas conquistadas.",
    ],
    es: [
      "Fueron {topFlightTitles} títulos de liga en total, el campeonato se volvió costumbre.",
      "Levantó la copa de liga {topFlightTitles} veces, suficiente para que una generación asocie el nombre al título.",
      "{topFlightTitles} campeonatos después, nadie discutía su lugar.",
      "La cuenta cerró en {topFlightTitles} ligas conquistadas.",
    ],
    en: [
      "It came to {topFlightTitles} league titles in all, winning the thing became a habit.",
      "They lifted the league {topFlightTitles} times, enough for a generation to tie the name to the trophy.",
      "{topFlightTitles} championships later, nobody argued about their place.",
      "The count closed at {topFlightTitles} leagues won.",
    ],
  },
});

topic({
  id: "peak_serial_continental",
  chapter: "peak",
  priority: (f) => 100 + Math.min(10, f.continentalPrimaryTitles * 2),
  group: "continental",
  when: (f) =>
    f.continentalPrimaryTitles >= 2 && !recordAlreadySaid(f, "continental_primary"),
  variants: {
    pt: [
      "Não foi uma vez só: {contPrimary} títulos continentais, o troféu mais difícil do futebol de clubes.",
      "Ganhou o continente {contPrimary} vezes, currículo que quase ninguém tem.",
      "{contPrimary} taças continentais entraram na prateleira ao longo da carreira.",
      "A maior competição de clubes foi vencida {contPrimary} vezes.",
    ],
    es: [
      "No fue una sola vez: {contPrimary} títulos continentales, el trofeo más difícil del fútbol de clubes.",
      "Ganó el continente {contPrimary} veces, un currículum que casi nadie tiene.",
      "{contPrimary} copas continentales entraron en la vitrina a lo largo de la carrera.",
      "La mayor competición de clubes fue ganada {contPrimary} veces.",
    ],
    en: [
      "It wasn't a one-off: {contPrimary} continental titles, the hardest trophy in club football.",
      "They won the continent {contPrimary} times, a record almost nobody has.",
      "{contPrimary} continental cups went into the cabinet across the career.",
      "The biggest club competition was won {contPrimary} times over.",
    ],
  },
});

topic({
  id: "peak_trophy_season",
  chapter: "peak",
  priority: (f) => 90 + Math.min(9, (f.bestTrophySeason ? f.bestTrophySeason.count : 0) * 2),
  at: (f) => f.bestTrophySeason?.age ?? null,
  when: (f) => (f.bestTrophySeason?.count ?? 0) >= 3,
  variants: {
    pt: [
      "Aos {bestTrophyAge} anos veio a temporada perfeita: {bestTrophyCount} títulos com o {bestTrophyClub}.",
      "Houve um ano em que ganhou tudo, {bestTrophyCount} taças aos {bestTrophyAge}, pelo {bestTrophyClub}.",
      "A temporada dos {bestTrophyAge} anos terminou com {bestTrophyCount} troféus no armário do {bestTrophyClub}.",
      "{bestTrophyCount} títulos numa única temporada, aos {bestTrophyAge}, no {bestTrophyClub}.",
    ],
    es: [
      "A los {bestTrophyAge} años llegó la temporada perfecta: {bestTrophyCount} títulos con el {bestTrophyClub}.",
      "Hubo un año en que ganó todo, {bestTrophyCount} copas a los {bestTrophyAge}, con el {bestTrophyClub}.",
      "La temporada de los {bestTrophyAge} terminó con {bestTrophyCount} trofeos en el {bestTrophyClub}.",
      "{bestTrophyCount} títulos en una sola temporada, a los {bestTrophyAge}, en el {bestTrophyClub}.",
    ],
    en: [
      "At {bestTrophyAge} came the perfect season: {bestTrophyCount} trophies with {bestTrophyClub}.",
      "There was a year when they won everything, {bestTrophyCount} cups at {bestTrophyAge} with {bestTrophyClub}.",
      "The season at {bestTrophyAge} ended with {bestTrophyCount} trophies in the {bestTrophyClub} cabinet.",
      "{bestTrophyCount} titles in a single season, at {bestTrophyAge}, with {bestTrophyClub}.",
    ],
  },
});

// -- Competitions the old library had no words for --------------------------

topic({
  id: "rise_second_tier_title",
  chapter: "rise",
  priority: (f) => 84 + Math.min(6, f.secondTierTitles * 3),
  group: "second_tier",
  at: (f) => f.firstSecondTierTitleAge,
  when: (f) => f.firstSecondTierTitleAge !== null,
  variants: {
    pt: [
      "Aos {secondTierAge} anos foi campeão da segunda divisão, título que vale um acesso e uma reconstrução.",
      "A segunda divisão foi vencida aos {secondTierAge}: menos glamour, mesma pressão.",
      "Houve um título de segunda divisão aos {secondTierAge} anos, daqueles que o clube nunca esquece.",
      "Aos {secondTierAge} levantou a taça do segundo escalão e devolveu o clube ao lugar de onde tinha caído.",
    ],
    es: [
      "A los {secondTierAge} años fue campeón de la segunda división, un título que vale un ascenso y una reconstrucción.",
      "La segunda división se ganó a los {secondTierAge}: menos glamour, la misma presión.",
      "Hubo un título de segunda a los {secondTierAge} años, de esos que el club no olvida.",
      "A los {secondTierAge} levantó la copa del segundo escalón y devolvió al club a donde había caído.",
    ],
    en: [
      "At {secondTierAge} they won the second division, a title worth a promotion and a rebuild.",
      "The second tier was won at {secondTierAge}: less glamour, the same pressure.",
      "There was a second-division title at {secondTierAge}, the kind a club never forgets.",
      "At {secondTierAge} they lifted the second-tier trophy and put the club back where it had fallen from.",
    ],
  },
});

topic({
  id: "peak_tertiary_continental",
  chapter: "peak",
  priority: (f) => 82 + Math.min(6, f.continentalTertiaryTitles * 3),
  group: "continental_minor",
  at: (f) => f.firstTertiaryAge,
  when: (f) => f.continentalTertiaryTitles > 0 && f.continentalPrimaryTitles === 0,
  variants: {
    pt: [
      "Aos {tertiaryAge} anos veio um título continental o primeiro degrau europeu, mas título internacional do mesmo jeito.",
      "Houve uma taça continental aos {tertiaryAge}, conquistada longe dos holofotes das grandes competições.",
      "A campanha continental dos {tertiaryAge} anos terminou com troféu.",
    ],
    es: [
      "A los {tertiaryAge} años llegó un título continental, el primer escalón europeo, pero título internacional igual.",
      "Hubo una copa continental a los {tertiaryAge}, lejos de los focos de las grandes competiciones.",
      "La campaña continental de los {tertiaryAge} años terminó con trofeo.",
    ],
    en: [
      "At {tertiaryAge} came a continental title, the lower European rung, but silverware abroad all the same.",
      "There was a continental cup at {tertiaryAge}, won away from the glare of the big competitions.",
      "The continental run at {tertiaryAge} ended with a trophy.",
    ],
  },
});

topic({
  id: "legacy_secondary_trophies",
  chapter: "legacy",
  priority: (f) => 80 + Math.min(14, (f.superCupTitles + f.leagueCupTitles) * 2),
  when: (f) => f.superCupTitles + f.leagueCupTitles >= 2,
  variants: {
    pt: [
      "Somando o resto, foram {secondaryTrophies}, taças que quase ninguém conta, mas que ele ganhou.",
      "O currículo ainda guarda {secondaryTrophies}.",
      "Havia sempre mais uma taça em jogo: {secondaryTrophies} completaram a coleção.",
    ],
    es: [
      "Sumando el resto, fueron {secondaryTrophies}, trofeos que casi nadie cuenta, pero que ganó.",
      "El currículum guarda además {secondaryTrophies}.",
      "Siempre había una copa más en juego: {secondaryTrophies} completaron la colección.",
    ],
    en: [
      "Adding the rest, that is {secondaryTrophies} nobody counts but they won them.",
      "The record also holds {secondaryTrophies}.",
      "There was always one more cup on offer: {secondaryTrophies} rounded out the collection.",
    ],
  },
});

// -- Trajectory -------------------------------------------------------------

topic({
  id: "peak_plateau",
  chapter: "peak",
  priority: 77,
  when: (f) => f.peakPlateauSeasons >= 6 && !f.modestCareer,
  variants: {
    pt: [
      "O auge não foi um ano: foram {peakPlateau} temporadas seguidas no mesmo patamar.",
      "Manteve o nível mais alto por {peakPlateau} temporadas, o que é mais raro que atingi-lo.",
      "Por {peakPlateau} temporadas o rendimento não oscilou, sempre no topo da própria curva.",
    ],
    es: [
      "El pico no fue un año: fueron {peakPlateau} temporadas seguidas en el mismo nivel.",
      "Sostuvo el nivel más alto durante {peakPlateau} temporadas, algo más raro que alcanzarlo.",
      "Durante {peakPlateau} temporadas el rendimiento no osciló, siempre en la cima de su propia curva.",
    ],
    en: [
      "The peak wasn't a year: it was {peakPlateau} straight seasons at the same level.",
      "They held the top of their game for {peakPlateau} seasons, which is rarer than reaching it.",
      "For {peakPlateau} seasons the level never wobbled, always at the top of their own curve.",
    ],
  },
});

topic({
  id: "twilight_steep_decline",
  chapter: "twilight",
  priority: 91,
  group: "decline",
  when: (f) => f.declineDrop >= 12,
  variants: {
    pt: [
      "A queda foi acentuada: {declineDrop} pontos de nível entre o auge e a última temporada.",
      "Do auge ao fim foram {declineDrop} pontos perdidos o corpo cobrou tudo de uma vez.",
      "O declínio não foi suave: {declineDrop} pontos abaixo do melhor momento na despedida.",
    ],
    es: [
      "La caída fue marcada: {declineDrop} puntos de nivel entre el pico y la última temporada.",
      "Del pico al final fueron {declineDrop} puntos perdidos, el cuerpo cobró todo junto.",
      "El declive no fue suave: {declineDrop} puntos por debajo de su mejor momento en la despedida.",
    ],
    en: [
      "The fall was steep: {declineDrop} rating points between the peak and the final season.",
      "From peak to finish it was {declineDrop} points gone, the body called it all in at once.",
      "The decline wasn't gentle: {declineDrop} points below their best by the farewell.",
    ],
  },
});

// -- Legacy -----------------------------------------------------------------

topic({
  id: "legacy_output",
  chapter: "legacy",
  priority: (f) => 78 + Math.min(12, Math.floor((f.totalGoals + f.totalAssists) / 40)),
  group: "output",
  when: (f) => !f.isGoalkeeper && f.totalGoals + f.totalAssists >= 80,
  variants: {
    pt: [
      "No fim, {goals} gols e {assists} assistências em {apps} jogos.",
      "A conta final: {apps} partidas, {goals} gols, {assists} assistências.",
      "Deixou {goals} gols e {assists} passes decisivos ao longo de {apps} jogos.",
    ],
    es: [
      "Al final, {goals} goles y {assists} asistencias en {apps} partidos.",
      "La cuenta final: {apps} partidos, {goals} goles, {assists} asistencias.",
      "Dejó {goals} goles y {assists} pases decisivos a lo largo de {apps} partidos.",
    ],
    en: [
      "In the end, {goals} goals and {assists} assists in {apps} games.",
      "The final tally: {apps} appearances, {goals} goals, {assists} assists.",
      "They left {goals} goals and {assists} assists across {apps} games.",
    ],
  },
});

topic({
  id: "legacy_output_gk",
  chapter: "legacy",
  priority: (f) => 78 + Math.min(12, Math.floor(f.totalCleanSheets / 40)),
  group: "output",
  when: (f) =>
    f.isGoalkeeper &&
    f.totalAppearances >= 100 &&
    !recordAlreadySaid(f, "clean_sheets"),
  variants: {
    pt: [
      "Foram {apps} jogos e {cleanSheets} deles sem sofrer gol.",
      "A conta final: {apps} partidas, {cleanSheets} com a meta intacta.",
      "{cleanSheets} jogos sem levar gol em {apps} partidas o número que define um goleiro.",
    ],
    es: [
      "Fueron {apps} partidos y {cleanSheets} de ellos sin recibir goles.",
      "La cuenta final: {apps} partidos, {cleanSheets} con la valla invicta.",
      "{cleanSheets} partidos sin goles en contra en {apps}, el número que define a un arquero.",
    ],
    en: [
      "It came to {apps} games, {cleanSheets} of them without conceding.",
      "The final tally: {apps} appearances, {cleanSheets} clean sheets.",
      "{cleanSheets} clean sheets in {apps} games, the number that defines a goalkeeper.",
    ],
  },
});

// -- The road not taken ------------------------------------------------------

/**
 * A stable coin flip for one career and one purpose.
 *
 * Some lines should not be automatic even when a career has earned them: a
 * biography that mentions every rejected offer starts to read like an audit.
 * Seeding off the career means the same save always tells the same story while
 * two saves with the same facts do not — which is the point of the whole
 * phrase layer.
 */
function seededChance(seed: string, salt: string, probability: number): boolean {
  let h = 2166136261;
  const input = `${seed}:${salt}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000 < probability;
}

topic({
  id: "road_not_taken",
  chapter: "peak",
  // Worth more the bigger the club that was turned away.
  priority: (f) => 82 + (f.roadNotTaken ? f.roadNotTaken.reputation * 3 : 0),
  group: "road_not_taken",
  at: (f) => f.roadNotTaken?.age ?? null,
  when: (f) => f.roadNotTaken !== null && seededChance(f.seed, "road-not-taken", 0.7),
  variants: {
    pt: [
      "Aos {turnedDownAge}, disse não ao {turnedDownClub} e seguiu no {tookInstead}.",
      "O {turnedDownClub} bateu à porta aos {turnedDownAge}; a resposta foi ficar no {tookInstead}.",
      "Recusou o {turnedDownClub} aos {turnedDownAge} para continuar no {tookInstead}.",
    ],
    es: [
      "A los {turnedDownAge} dijo no al {turnedDownClub} y siguió en el {tookInstead}.",
      "El {turnedDownClub} llamó a los {turnedDownAge}; la respuesta fue quedarse en el {tookInstead}.",
      "Rechazó al {turnedDownClub} a los {turnedDownAge} para continuar en el {tookInstead}.",
    ],
    en: [
      "At {turnedDownAge} they said no to {turnedDownClub} and stayed at {tookInstead}.",
      "{turnedDownClub} came calling at {turnedDownAge}; the answer was to stay at {tookInstead}.",
      "They turned {turnedDownClub} down at {turnedDownAge} to carry on at {tookInstead}.",
    ],
  },
});

topic({
  id: "legacy_what_if",
  chapter: "legacy",
  priority: 86,
  group: "what_if",
  // The musing only earns its place on top of the fact, and only sometimes —
  // a career that never wonders about itself reads more honest than one that
  // always does.
  when: (f) =>
    f.roadNotTaken !== null &&
    seededChance(f.seed, "road-not-taken", 0.7) &&
    seededChance(f.seed, "what-if", 0.55),
  variants: {
    pt: [
      "Ninguém nunca vai saber o que teria sido daquela carreira se a proposta do {turnedDownClub} tivesse sido aceita.",
      "A pergunta ficou: e se tivesse dito sim ao convite do {turnedDownClub}?",
      "Até hoje se discute o que aconteceria se aquela oferta do {turnedDownClub} tivesse sido aceita.",
    ],
    es: [
      "Nadie sabrá nunca qué habría sido de aquella carrera si hubiera aceptado la oferta del {turnedDownClub}.",
      "Quedó la pregunta: ¿y si le hubiera dicho que sí a la propuesta del {turnedDownClub}?",
      "Todavía se discute qué habría pasado si aquella oferta del {turnedDownClub} se hubiera aceptado.",
    ],
    en: [
      "Nobody will ever know what that career would have been had the offer from {turnedDownClub} been accepted.",
      "The question stayed: what if they had said yes to {turnedDownClub}'s approach?",
      "People still argue about what would have happened had that offer from {turnedDownClub} been taken.",
    ],
  },
});

export { TOPICS as BIO_TOPICS };
