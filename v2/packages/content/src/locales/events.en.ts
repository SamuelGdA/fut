import type { EventsMessages } from "./events.pt";

/** The career event texts in English. */
export const eventsEn: EventsMessages = {
  extraTraining: {
    title: "Extra training",
    body: "The fitness coach suggests a programme of your own: gym before sunrise and finishing drills after team training.",
    options: {
      push: {
        label: "Take it on",
        success: "Your body responded. You start the season stronger than ever.",
        failure: "Too much, too soon. Fatigue keeps you out of a few games.",
      },
      routine: { label: "Keep the routine", result: "You follow the club plan, no shortcuts." },
    },
  },
  personalCoach: {
    title: "Personal coach",
    body: "A coach known for polishing young talent offers one-on-one work, paid out of your own pocket.",
    options: {
      hire: {
        label: "Hire him",
        success: "The double sessions show on the pitch. You improve and add new touches to your game.",
        failure: "The club's coach won't accept outside training and drops you to the bench. The money and the time are gone.",
      },
      decline: { label: "Decline", result: "You trust the club's work." },
    },
  },
  supplement: {
    title: "The supplement",
    body: "Someone in the dressing room offers an imported supplement. It promises half the recovery time, and he swears it is allowed.",
    options: {
      take: {
        label: "Take it",
        success: "No test picked anything up, and the faster recovery takes you up a level.",
        failure: "The doping test came back positive. A season-long ban and your name in every paper.",
      },
      refuse: { label: "Refuse", result: "You say no. Months later, two teammates fail doping tests." },
    },
  },
  loadManagement: {
    title: "Load management",
    body: "The medical staff see signs of wear and suggest resting you for some games.",
    options: {
      rest: { label: "Accept the rotation", result: "Fewer games, less risk. Your body thanks you, and your development slows a little." },
      playAll: { label: "Play every game", result: "You play them all. More goals and more chances, with your body on the edge." },
    },
  },
  newRole: {
    title: "A new role",
    body: "The coach sees you thriving as a {position} and promises a starting spot if you make the switch.",
    options: {
      accept: { label: "Make the switch", result: "New position, guaranteed place. The rest is up to you." },
      refuse: { label: "Keep your position", result: "You stay in your original position, but lose ground with the coach." },
    },
  },
  rivalSigned: {
    title: "Competition for places",
    body: "The club signed a big name for your position. The press is already talking about a new starter.",
    options: {
      fight: {
        label: "Fight for your place",
        success: "You keep your spot, and the fans love the answer on the pitch.",
        failure: "The new arrival wins the battle. You start the season on the bench.",
      },
      leave: { label: "Take another offer", result: "You ask to leave. {target} sign you." },
    },
  },
  captaincy: {
    title: "The armband",
    body: "The captain is leaving, and the coach wants you to wear the armband.",
    options: {
      accept: { label: "Accept", result: "Captain. The fans applaud, and the demands grow too." },
      decline: { label: "Decline", result: "You would rather lead without the armband." },
    },
  },
  seasonPriority: {
    title: "Season priority",
    body: "The squad cannot handle everything. The coach asks what comes first.",
    options: {
      league: { label: "The league", result: "Full strength in the league. Continental play takes a back seat." },
      continent: { label: "Continental glory", result: "All in on the continental tournament. A rotated side in the league." },
    },
  },
  rivalCalls: {
    title: "The rivals call",
    body: "{rivalClub}, the fiercest rivals, want you. The offer is good, but the fans would never forgive it.",
    options: {
      sign: { label: "Sign for the rivals", result: "You cross the divide. {target} celebrate; your old fans do not." },
      stay: { label: "Stay", result: "You turn the rivals down, and the fans sing your name." },
    },
  },
  financialCrisis: {
    title: "Financial crisis",
    body: "The club is behind on wages and needs to sell. There is an offer on the table.",
    options: {
      accept: { label: "Accept the sale", result: "{target} pay up front, and you change clubs." },
      stay: {
        label: "Stay and help",
        result: "You stay and give up part of your wages. The team gets weaker, but the fans never forget it.",
      },
    },
  },
  numberTen: {
    title: "The number 10",
    body: "The 10 shirt is free, and the board offers it to you.",
    options: {
      wear: { label: "Wear the 10", result: "The 10 is yours. With it come the spotlight and the pressure." },
      keep: { label: "Keep your number", result: "You prefer the number you already have." },
    },
  },
  homesick: {
    title: "Homesick",
    body: "Three years away from home are taking their toll. A club from your country wants you back.",
    options: {
      goHome: { label: "Go home", result: "{target} bring you home. It is good to be near family." },
      stay: { label: "Tough it out", result: "You stay, but your head is not always in the game." },
    },
  },
  tattoo: {
    title: "The tattoo",
    body: "A famous tattoo artist offers a huge back piece, days before the season starts.",
    options: {
      doIt: {
        label: "Get it",
        success: "The tattoo goes viral, and the fans love it.",
        failure: "It got infected. You miss half the season recovering.",
      },
      skip: { label: "Save it for the holidays", result: "It can wait." },
    },
  },
  taxes: {
    title: "Tax trouble",
    body: "The tax office finds errors in your returns from recent years, and the papers already know.",
    options: {
      settle: { label: "Settle", result: "You pay and close the case, but your image takes a hit." },
      fight: {
        label: "Fight it in court",
        success: "Cleared. You come out stronger.",
        failure: "Convicted. Half a season out and your image in tatters.",
      },
    },
  },
  passport: {
    title: "Grandfather's passport",
    body: "Your grandfather was born abroad, and that country's national team wants you: {country}.",
    options: {
      switch: { label: "Accept the call-up", result: "New passport, new national team: {country}." },
      keep: { label: "Stay with your country", result: "You keep the shirt of the country where you were born." },
    },
  },
  residencePassport: {
    title: "A new national team",
    body: "After five seasons in the country, {country} wants to call you up. Accepting changes your nationality in the game.",
    options: {
      switch: { label: "Accept the new nationality", result: "You now represent {country}." },
      keep: { label: "Keep my nationality", result: "You keep your nationality and wait for your national team." },
    },
  },
  diploma: {
    title: "The diploma",
    body: "Your family insists: finish school before thinking only about football.",
    options: {
      study: { label: "Finish school", result: "Diploma in hand. Less training cuts growth by 10% and injury risk by 30% for this period." },
      football: { label: "Football only", result: "You train harder: 10% more growth, but 30% more injury risk for this period." },
    },
  },
  dressingRoomRift: {
    title: "Dressing room rift",
    body: "The squad has split into two camps, and both want you on their side.",
    options: {
      takeSide: {
        label: "Pick a side",
        success: "You picked the winning side. You gain minutes and the fans' respect.",
        failure: "Your camp lost the power struggle. You pay for it in minutes.",
      },
      neutral: { label: "Stay neutral", result: "You stay out of it. Nobody thanks you, nobody blames you." },
    },
  },
  comeback: {
    title: "The idol returns",
    body: "{target} want you back, where your story is already written.",
    options: {
      return: { label: "Go back", result: "The idol returns. A packed stadium and a guaranteed place." },
      stay: { label: "Stay where you are", result: "You thank them for the love and carry on." },
    },
  },
  clubOrCountry: {
    title: "Club or country",
    body: "The national team tournament clashes with the club's run-in. Both want you fully fit.",
    options: {
      tournament: {
        label: "Go with your country",
        success: "You play the tournament and come back fit.",
        failure: "You play the tournament, but come back hurt and miss club games.",
      },
      club: { label: "Stay with the club", result: "You give up the tournament. The club's fans appreciate it." },
    },
  },
  painBeforeFinal: {
    title: "Pain before the final",
    body: "A thigh problem flares up in the week of the final. The doctors say the risk is yours to take.",
    options: {
      sacrifice: {
        label: "Play through the pain",
        success: "You play on the edge and decide it. A trophy and your name in history.",
        failure: "The thigh gave way. Final lost and weeks on the sidelines.",
      },
      rest: { label: "Protect your body", result: "You watch from the bench. Without you, the team loses the final." },
    },
  },
  muscleInjury: {
    title: "Muscle injury",
    body: "A thigh injury at the end of pre-season. The club wants speed; the doctors want patience.",
    options: {
      rushBack: {
        label: "Rush back",
        success: "You came back quickly and missed very little.",
        failure: "You came back too soon and the injury opened up again. More time out, and your body felt it.",
      },
      fullRecovery: { label: "Take your time", result: "Full recovery. You miss more games, but come back whole." },
    },
  },
  decisivePenalty: {
    title: "The decisive penalty",
    body: "A final, a shootout, the last kick. The coach looks at you.",
    options: {
      take: {
        label: "Take it",
        success: "Goal. You win the trophy.",
        failure: "Saved. The cup goes to the other side, and the fans will not forget.",
      },
      leave: {
        label: "Leave it to someone else",
        success: "Someone else steps up and scores. The title belongs to the team, and you celebrate with them.",
        failure: "Someone else steps up and the keeper saves it. The cup slips away, but nobody points at you.",
      },
    },
  },
  newCoach: {
    title: "A new coach",
    body: "A coach with his own ideas has arrived. Nobody's place is safe.",
    options: {
      impress: {
        label: "Win him over",
        success: "You convince the new coach and earn more minutes.",
        failure: "He has other plans. You lose your place in the team.",
      },
      leave: { label: "Find another club", result: "{target} sign you before the new coach's first game." },
    },
  },
  derby: {
    title: "Derby week",
    body: "Derby against {rivalClub}. The press wants a bold quote.",
    options: {
      provoke: {
        label: "Wind them up",
        success: "You talked the talk and decided the game. A hero to the fans.",
        failure: "You talked the talk and vanished on the pitch. The fans do not forgive.",
      },
      fairPlay: { label: "Show respect", result: "You talk about respect, and the fans approve of the tone." },
    },
  },
  idolFarewell: {
    title: "An idol's farewell",
    body: "The club's greatest idol is retiring and picks you to receive the tribute at his farewell game.",
    options: {
      honor: { label: "Accept the tribute", result: "You take on the idol's symbolic place. The fans embrace you, and the demands grow." },
      discreet: { label: "Keep a low profile", result: "You thank him and leave the stage to him." },
    },
  },
  agentUltimatum: {
    title: "The agent's ultimatum",
    body: "Your agent has an offer from a bigger club and threatens to walk away if you do not force the move.",
    options: {
      force: {
        label: "Force the move",
        result: "You force it through and leave. {target} gain a signing; your old fans, a grudge.",
      },
      stay: { label: "Stay", result: "You stay and win the fans over, but your agent leaves. Only the next decision has offers from weaker clubs, if a transfer comes up; then the market returns to normal." },
    },
  },
  academyJewel: {
    title: "The academy gem",
    body: "A kid from the academy plays in your position and asks to train alongside you.",
    options: {
      mentor: { label: "Take him under your wing", result: "You teach him everything you know. The fans love it, and your own training time shrinks." },
      compete: { label: "Fight for the spot", success: "You win the competition and gain playing time.", failure: "The youngster wins the competition. You lose playing time." },
    },
  },
  bootDeal: {
    title: "Boot deal",
    body: "A sportswear brand wants you as the face of its main campaign, with bright boots and a TV advert.",
    options: {
      flashy: { label: "Front the campaign", result: "You become the face of the campaign. More fame, more pressure." },
      discreet: { label: "Stay low-key", result: "You prefer black boots and few interviews." },
    },
  },
  podcast: {
    title: "The podcast",
    body: "The country's most popular podcast invites you for an unfiltered interview.",
    options: {
      speak: {
        label: "Say it all",
        success: "You were honest in just the right measure. The interview goes viral in your favour.",
        failure: "One line out of context becomes a scandal. The fans are not impressed.",
      },
      decline: { label: "Decline", result: "You would rather do your talking on the pitch." },
    },
  },
  newAgent: {
    title: "A new agent",
    body: "A heavyweight agent promises to open doors all over the world.",
    options: {
      change: {
        label: "Switch agents",
        success: "His contacts heat up the market. More clubs ask about you.",
        failure: "Big promises, little to show. The market cools.",
      },
      keep: { label: "Keep your agent", result: "You stay with the person who has been there from the start." },
    },
  },
  packedStadium: {
    title: "A packed stadium",
    body: "A full house and a worldwide broadcast. It is the chance to shine.",
    options: {
      showboat: {
        label: "Play to the crowd",
        success: "Solid performances earn you more playing time and appreciation.",
        failure: "You take too many risks and lose playing time.",
      },
      focused: { label: "Keep it simple", result: "You keep it simple and do your job." },
    },
  },
  redCard: {
    title: "Sent off",
    body: "A straight red for a hard tackle. The disciplinary panel will decide the ban.",
    options: {
      appeal: {
        label: "Appeal",
        success: "Ban reduced. You miss only one game.",
        failure: "The appeal annoyed the panel, and the ban was extended.",
      },
      accept: { label: "Accept the ban", result: "You serve the standard ban and move on." },
    },
  },
  boos: {
    title: "Boos",
    body: "The fans boo your every touch. The atmosphere has turned sour.",
    options: {
      fight: {
        label: "Win them back",
        result: "You face down the boos. The start is hard, but the fans see the effort.",
      },
      leave: { label: "Ask to leave", result: "{target} offer a fresh start, and you take it." },
    },
  },
  rowCoach: {
    title: "Row with the coach",
    body: "A shouting match with the coach has leaked to the press.",
    options: {
      standGround: {
        label: "Stand your ground",
        success: "The dressing room backs you. So do the fans.",
        failure: "The coach wins the power struggle. You are dropped to the bench.",
      },
      apologize: { label: "Apologise", result: "You apologise in public. Your image takes a small hit." },
    },
  },
  rowBoard: {
    title: "Row with the board",
    body: "You criticised the board in public, and the president demands a retraction.",
    options: {
      standGround: {
        label: "Do not back down",
        success: "The fans back you, and the board backs down.",
        failure: "The board does not forgive. You are sold, and the club shuts its doors to you for good.",
      },
      apologize: { label: "Retract", result: "You back down. Your image takes a small hit." },
    },
  },
  rowFans: {
    title: "Row with the fans",
    body: "A group of ultras surrounds you outside the training ground. Tempers are running high.",
    options: {
      provoke: {
        label: "Face them",
        success: "You stand up to them and win the respect of the stands.",
        failure: "The fans declare war. You are driven out of the club, never to return.",
      },
      apologize: { label: "Apologise", result: "You calm things down, and the relationship improves a little." },
    },
  },
  prestigeShirt: {
    title: "A shirt with history",
    body: "A historic number for your position has become free at the club.",
    options: {
      number: { label: "Wear the {number}", result: "The {number} is yours. A heavy number, with the pressure to match." },
      keep: { label: "Keep your number", result: "You stick with your usual number." },
    },
  },
  homage: {
    title: "A tribute",
    body: "The club wants to immortalise your story and lets you choose your shirt number.",
    options: {
      number: { label: "Wear the {number}", result: "The {number} now tells your story at the club." },
    },
  },
  seriousInjury: {
    title: "Serious injury",
    body: "A ruptured ligament. There are two roads to recovery.",
    options: {
      aggressive: { label: "Surgery and a quick return", result: "You come back sooner, but the knee is never quite the same." },
      conservative: {
        label: "Conservative treatment",
        result: "A long recovery. You miss a big part of the season, but you protect your body.",
      },
    },
  },
};
