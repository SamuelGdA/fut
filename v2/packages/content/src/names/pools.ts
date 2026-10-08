import type { Confederation, CountryCode } from "@craque/world";

/**
 * Nomes da geração futura (D13): jogadores que ainda não existem ganham nomes
 * fictícios do jeito do país deles. Cada cultura tem uma lista de prenomes e
 * outra de sobrenomes comuns; o nome sai da combinação, sorteada pela semente
 * da carreira. Nenhuma lista tem apelido de craque nem sobrenome famoso no
 * futebol, e os nomes de jogadores reais conhecidos são recusados
 * (`FAMOUS_NAMES`).
 */

export interface NamePool {
  readonly first: readonly string[];
  readonly last: readonly string[];
}

export const NAME_POOLS = {
  lusophone: {
    first: [
      "João", "Gabriel", "Lucas", "Matheus", "Pedro", "Gustavo", "Felipe", "Caio", "Igor", "Leonardo",
      "Murilo", "Davi", "Enzo", "Kaique", "Luan", "Renan", "Henrique", "Arthur", "Vitor", "Samuel",
      "Otávio", "Rodrigo", "Eduardo", "Wesley",
    ],
    last: [
      "Santos", "Oliveira", "Souza", "Pereira", "Almeida", "Ferreira", "Ribeiro", "Carvalho", "Gomes", "Martins",
      "Rocha", "Barbosa", "Teixeira", "Moreira", "Cardoso", "Nogueira", "Araújo", "Batista", "Freitas", "Lopes",
      "Mendes", "Vieira", "Correia", "Campos",
    ],
  },
  spanish: {
    first: [
      "Pablo", "Álvaro", "Javier", "Adrián", "Hugo", "Daniel", "Iker", "Marcos", "Rubén", "Mario",
      "Alejandro", "Iván", "Jorge", "Víctor", "Óscar", "Unai", "Gonzalo", "Aitor", "Eric", "Martín",
    ],
    last: [
      "García", "López", "Sánchez", "Pérez", "Gómez", "Moreno", "Jiménez", "Ruiz", "Hernández", "Muñoz",
      "Romero", "Navarro", "Domínguez", "Vázquez", "Gil", "Serrano", "Molina", "Ortega", "Delgado", "Castro",
    ],
  },
  rioplatense: {
    first: [
      "Santiago", "Matías", "Facundo", "Tomás", "Joaquín", "Agustín", "Franco", "Ezequiel", "Valentín", "Bautista",
      "Thiago", "Ignacio", "Lucas", "Mateo", "Benjamín", "Felipe", "Bruno", "Maximiliano", "Nahuel", "Lisandro",
    ],
    last: [
      "Rodríguez", "Fernández", "López", "Gómez", "Díaz", "Pérez", "Sosa", "Benítez", "Acosta", "Herrera",
      "Aguirre", "Ríos", "Godoy", "Ledesma", "Ferreyra", "Vega", "Cabrera", "Ojeda", "Quiroga", "Villalba",
    ],
  },
  latam: {
    first: [
      "Santiago", "Sebastián", "Andrés", "Juan Pablo", "Daniel", "Carlos", "Miguel Ángel", "Jesús", "Emiliano", "Diego",
      "Alexis", "Brayan", "Kevin", "Jhon", "Esteban", "Camilo", "Héctor", "Raúl", "Iván", "Rodrigo",
    ],
    last: [
      "Hernández", "García", "Martínez", "Rodríguez", "Gómez", "Torres", "Ramírez", "Flores", "Rivera", "Castillo",
      "Morales", "Ortiz", "Vargas", "Mendoza", "Cruz", "Reyes", "Guerrero", "Salazar", "Ospina", "Valencia",
    ],
  },
  french: {
    first: [
      "Lucas", "Hugo", "Théo", "Nathan", "Mathis", "Enzo", "Louis", "Maxime", "Rayan", "Yanis",
      "Clément", "Adrien", "Julien", "Bastien", "Quentin", "Mathéo", "Noah", "Ilyes", "Wesley", "Kylian",
    ],
    last: [
      "Martin", "Bernard", "Dubois", "Durand", "Lefebvre", "Leroy", "Moreau", "Laurent", "Simon", "Michel",
      "Garnier", "Faure", "Rousseau", "Blanc", "Guerin", "Muller", "Henry", "Roussel", "Fontaine", "Chevalier",
    ],
  },
  english: {
    first: [
      "Jack", "Harry", "Oliver", "George", "Charlie", "Jacob", "Alfie", "Freddie", "Archie", "Joshua",
      "Ethan", "Callum", "Ryan", "Connor", "Lewis", "Reece", "Tyler", "Jordan", "Mason", "Luke",
    ],
    last: [
      "Smith", "Jones", "Taylor", "Brown", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson",
      "Evans", "Green", "Hall", "Wood", "Harris", "Clarke", "Turner", "Hill", "Cooper", "Ward",
    ],
  },
  american: {
    first: [
      "Tyler", "Brandon", "Cameron", "Jalen", "Caleb", "Logan", "Austin", "Dylan", "Cole", "Mason",
      "Isaiah", "Gavin", "Owen", "Carter", "Miles", "Marcus", "Nolan", "Chase", "Ezra", "Malik",
    ],
    last: [
      "Johnson", "Miller", "Davis", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
      "Moore", "Allen", "Young", "King", "Scott", "Baker", "Adams", "Nelson", "Carter", "Mitchell",
    ],
  },
  german: {
    first: [
      "Lukas", "Leon", "Finn", "Jonas", "Paul", "Felix", "Maximilian", "Elias", "Niklas", "Tim",
      "Jannik", "Moritz", "Tobias", "Florian", "Lennart", "Fabian", "Julian", "Malte", "Nico", "Jan",
    ],
    last: [
      "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch",
      "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hartmann",
    ],
  },
  italian: {
    first: [
      "Lorenzo", "Alessandro", "Matteo", "Francesco", "Leonardo", "Gabriele", "Riccardo", "Tommaso", "Edoardo", "Federico",
      "Andrea", "Marco", "Simone", "Davide", "Filippo", "Giacomo", "Pietro", "Nicolò", "Samuele", "Michele",
    ],
    last: [
      "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco",
      "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa", "Giordano", "Rizzo", "Lombardi", "Moretti",
    ],
  },
  dutch: {
    first: [
      "Daan", "Sem", "Lucas", "Milan", "Levi", "Luuk", "Thijs", "Jesse", "Bram", "Stijn",
      "Ruben", "Lars", "Joep", "Teun", "Niels", "Wout", "Sven", "Jens", "Koen", "Rick",
    ],
    last: [
      "de Jong", "Jansen", "de Vries", "van den Berg", "Bakker", "Visser", "Smit", "Meijer", "de Boer", "Mulder",
      "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker", "Brouwer", "de Wit", "Dijkstra", "Kok",
    ],
  },
  maghreb: {
    first: [
      "Youssef", "Mohamed", "Amine", "Ayoub", "Hamza", "Ilias", "Anas", "Bilal", "Zakaria", "Oussama",
      "Soufiane", "Mehdi", "Karim", "Adam", "Yassine", "Ismael", "Nabil", "Reda", "Walid", "Rayane",
    ],
    last: [
      "El Idrissi", "Benali", "El Amrani", "Bouzid", "Alaoui", "Tahiri", "Benjelloun", "El Fassi", "Chraibi", "Bennani",
      "Lahlou", "Mansouri", "Berrada", "Amrani", "Haddad", "Ouali", "Saidi", "Rahmani", "Bakkali", "Zerouali",
    ],
  },
  balkan: {
    first: [
      "Luka", "Ivan", "Marko", "Ante", "Josip", "Mateo", "Petar", "Filip", "Domagoj", "Toni",
      "Nikola", "Karlo", "Leon", "Dario", "Matej", "Borna", "Lovro", "Tin", "Bruno", "Mario",
    ],
    last: [
      "Horvat", "Kovačević", "Babić", "Marić", "Jurić", "Novak", "Kovačić", "Knežević", "Vuković", "Marković",
      "Petrović", "Matić", "Tomić", "Pavlović", "Božić", "Blažević", "Grgić", "Pavić", "Radić", "Šarić",
    ],
  },
  nordic: {
    first: [
      "Magnus", "Jonas", "Emil", "Mathias", "Kristian", "Sander", "Henrik", "Tobias", "Sindre", "Eirik",
      "Oskar", "Aksel", "Fredrik", "Martin", "Elias", "Jakob", "Vetle", "Isak", "Markus", "Andreas",
    ],
    last: [
      "Hansen", "Johansen", "Olsen", "Larsen", "Andersen", "Pedersen", "Nilsen", "Kristiansen", "Jensen", "Karlsen",
      "Johnsen", "Pettersen", "Eriksen", "Berg", "Haugen", "Hagen", "Bakken", "Lie", "Moen", "Strand",
    ],
  },
  westAfricaAnglophone: {
    first: [
      "Chinedu", "Emeka", "Tunde", "Samuel", "David", "Victor", "Kelechi", "Ifeanyi", "Oluwaseun", "Chukwuemeka",
      "Daniel", "Femi", "Kingsley", "Michael", "Joseph", "Uche", "Babajide", "Ikenna", "Godwin", "Peter",
    ],
    last: [
      "Okafor", "Adeyemi", "Okonkwo", "Balogun", "Eze", "Nwosu", "Ogunleye", "Chukwu", "Afolabi", "Ibrahim",
      "Okeke", "Adebayo", "Nnamdi", "Ogbonna", "Bello", "Oladipo", "Uzoma", "Akinola", "Obi", "Onyeka",
    ],
  },
  westAfricaFrancophone: {
    first: [
      "Moussa", "Ibrahima", "Cheikh", "Mamadou", "Abdoulaye", "Pape", "Ousmane", "Lamine", "Babacar", "Assane",
      "Modou", "Alioune", "Serigne", "Boubacar", "Amadou", "Saliou", "Malick", "Ismaïla", "Habib", "Bamba",
    ],
    last: [
      "Diop", "Ndiaye", "Fall", "Sow", "Diallo", "Sarr", "Gueye", "Ba", "Faye", "Cissé",
      "Thiam", "Niang", "Seck", "Mbaye", "Kane", "Dieng", "Sy", "Touré", "Camara", "Sall",
    ],
  },
  japanese: {
    first: [
      "Haruto", "Sota", "Yuto", "Riku", "Kaito", "Ren", "Daiki", "Shota", "Kenta", "Ryota",
      "Yuki", "Hiroto", "Sho", "Kota", "Takeru", "Yuma", "Kazuki", "Naoki", "Tsubasa", "Hayato",
    ],
    last: [
      "Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato",
      "Yamada", "Sasaki", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Mori", "Ikeda", "Hashimoto",
    ],
  },
  korean: {
    first: [
      "Min-jun", "Seo-jun", "Ji-ho", "Do-yun", "Ha-jun", "Jun-seo", "Woo-jin", "Hyun-woo", "Ji-hoon", "Sung-min",
      "Tae-yang", "Dong-hyun", "Jae-won", "Seung-ho", "Yeon-woo", "Kyung-min", "Jin-woo", "Sang-hoon", "Hee-chan", "Min-ho",
    ],
    last: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim", "Han", "Oh", "Seo", "Shin", "Kwon", "Hwang"],
  },
  turkish: {
    first: [
      "Emre", "Burak", "Mert", "Arda", "Kerem", "Yusuf", "Furkan", "Eren", "Barış", "Ozan",
      "Cenk", "Umut", "Berkay", "Doruk", "Efe", "Kaan", "Alper", "Onur", "Serkan", "Tolga",
    ],
    last: [
      "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan",
      "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek", "Polat",
    ],
  },
  eastern: {
    first: [
      "Jakub", "Kacper", "Szymon", "Michał", "Bartosz", "Mateusz", "Tomáš", "Ondřej", "Adam", "Filip",
      "Dominik", "Patrik", "Kamil", "Piotr", "Vojtěch", "Wiktor", "Marek", "Lukáš", "Oliwer", "Daniel",
    ],
    last: [
      "Nowak", "Kowalski", "Wiśniewski", "Wójcik", "Kamiński", "Zieliński", "Szymański", "Dvořák", "Novotný", "Svoboda",
      "Černý", "Procházka", "Kučera", "Veselý", "Mazur", "Krawczyk", "Pokorný", "Horák", "Jabłoński", "Wróbel",
    ],
  },
  gulf: {
    first: [
      "Abdullah", "Faisal", "Salem", "Saud", "Khalid", "Fahad", "Nasser", "Sultan", "Turki", "Majed",
      "Hassan", "Ali", "Omar", "Yasser", "Hamad", "Rashid", "Saleh", "Nawaf", "Mansour", "Ziyad",
    ],
    last: [
      "Al-Harbi", "Al-Otaibi", "Al-Qahtani", "Al-Ghamdi", "Al-Shehri", "Al-Zahrani", "Al-Mutairi", "Al-Dosari", "Al-Anazi", "Al-Shammari",
      "Al-Malki", "Al-Amri", "Al-Juhani", "Al-Hajri", "Al-Subaie", "Al-Rashidi", "Al-Saadi", "Al-Hamdan", "Al-Faraj", "Al-Khaldi",
    ],
  },
} as const satisfies Readonly<Record<string, NamePool>>;

export type NameCulture = keyof typeof NAME_POOLS;

/** País para cultura. A Bélgica divide em duas, como o país. */
export const COUNTRY_CULTURES: Readonly<Record<CountryCode, readonly NameCulture[]>> = {
  BRA: ["lusophone"],
  POR: ["lusophone"],
  ANG: ["lusophone"],
  MOZ: ["lusophone"],
  CPV: ["lusophone"],
  ESP: ["spanish"],
  ARG: ["rioplatense"],
  URU: ["rioplatense"],
  PAR: ["rioplatense"],
  CHI: ["latam"],
  COL: ["latam"],
  MEX: ["latam"],
  PER: ["latam"],
  ECU: ["latam"],
  BOL: ["latam"],
  VEN: ["latam"],
  CRC: ["latam"],
  HON: ["latam"],
  PAN: ["latam"],
  GUA: ["latam"],
  SLV: ["latam"],
  FRA: ["french"],
  BEL: ["french", "dutch"],
  SUI: ["german", "french"],
  ENG: ["english"],
  SCO: ["english"],
  WAL: ["english"],
  NIR: ["english"],
  IRL: ["english"],
  AUS: ["english"],
  NZL: ["english"],
  USA: ["american"],
  CAN: ["american", "french"],
  GER: ["german"],
  AUT: ["german"],
  ITA: ["italian"],
  NED: ["dutch"],
  MAR: ["maghreb"],
  ALG: ["maghreb"],
  TUN: ["maghreb"],
  EGY: ["gulf"],
  KSA: ["gulf"],
  QAT: ["gulf"],
  UAE: ["gulf"],
  CRO: ["balkan"],
  SRB: ["balkan"],
  BIH: ["balkan"],
  SVN: ["balkan"],
  MNE: ["balkan"],
  NOR: ["nordic"],
  SWE: ["nordic"],
  DEN: ["nordic"],
  ISL: ["nordic"],
  FIN: ["nordic"],
  NGA: ["westAfricaAnglophone"],
  GHA: ["westAfricaAnglophone"],
  SEN: ["westAfricaFrancophone"],
  MLI: ["westAfricaFrancophone"],
  CIV: ["westAfricaFrancophone"],
  GUI: ["westAfricaFrancophone"],
  CMR: ["westAfricaFrancophone"],
  BFA: ["westAfricaFrancophone"],
  JPN: ["japanese"],
  KOR: ["korean"],
  TUR: ["turkish"],
  POL: ["eastern"],
  CZE: ["eastern"],
  SVK: ["eastern"],
};

/** Para países fora da tabela: a cultura mais comum da confederação. */
export const CONFEDERATION_CULTURES: Readonly<Record<Confederation, readonly NameCulture[]>> = {
  UEFA: ["english", "german", "french", "eastern"],
  CONMEBOL: ["latam"],
  CONCACAF: ["latam", "american"],
  CAF: ["westAfricaAnglophone", "westAfricaFrancophone"],
  AFC: ["gulf", "japanese", "korean"],
  OFC: ["english"],
};

/**
 * Jogadores reais conhecidos que as listas formariam por acaso. Um nome gerado
 * nunca é um destes (nem um da elite real, conferido à parte). Só entra aqui o
 * que as listas conseguem formar: um teste confere.
 */
export const FAMOUS_NAMES: ReadonlySet<string> = new Set([
  "Gabriel Barbosa",
  "João Gomes",
  "Matheus Pereira",
  "Matheus Martins",
  "Pedro Gomes",
  "Pedro Rocha",
  "Igor Gomes",
  "Mario Gómez",
  "Jorge Molina",
  "Eric García",
  "Rubén García",
  "Víctor Ruiz",
  "Gonzalo Castro",
  "Alejandro Gómez",
  "Daniel Muñoz",
  "Ignacio Fernández",
  "Lucas Pérez",
  "Santiago Sosa",
  "Maximiliano Gómez",
  "Diego Valencia",
  "Diego Reyes",
  "Camilo Vargas",
  "Harry Wilson",
  "Callum Wilson",
  "Charlie Taylor",
  "Lewis Hall",
  "Jack Clarke",
  "Callum Robinson",
  "Archie Brown",
  "Tyler Adams",
  "Andrea Conti",
  "Marco Rossi",
  "Lorenzo Colombo",
  "Luuk de Jong",
  "Daan Bakker",
  "Mateo Kovačić",
  "Dario Šarić",
  "Mathias Jensen",
  "Moussa Sow",
  "Ismaïla Sarr",
  "Pape Gueye",
  "Pape Sarr",
  "Abdoulaye Diallo",
  "Lamine Camara",
  "Habib Diallo",
  "Bamba Dieng",
  "Ibrahima Diallo",
  "Mamadou Sarr",
  "Abdoulaye Seck",
  "Hee-chan Hwang",
  "Burak Yılmaz",
  "Barış Yılmaz",
  "Mert Çetin",
  "Abdullah Al-Hamdan",
  "Abdullah Al-Malki",
  "Nasser Al-Dosari",
  "Abdullah Al-Amri",
  "Jakub Kamiński",
  "Piotr Zieliński",
]);
