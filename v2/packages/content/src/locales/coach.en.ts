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
export const coachEn: CoachMessages = {
  events: {
    unhappyStar: {
      title: "Unhappy starter",
      body: "{player} asked for a word. He says he is not happy and his head is no longer at the club.",
      options: {
        promise: { label: "Promise a starting spot", result: "He leaves the room relieved. Now the promise has to be kept." },
        raise: { label: "Offer a pay rise", result: "The rise settles him, and the bill arrives at the end of the month." },
        firm: {
          label: "Stand firm",
          success: "He gets the message and the squad likes your stance.",
          failure: "The talk turned sour. He asks to be put up for sale.",
        },
      },
    },
    wantsOut: {
      title: "Transfer request",
      body: "{player} has an offer from {buyer} ({price}) and wants to leave.",
      options: {
        sell: { label: "Allow the sale", result: "Deal done. The dressing room respects the decision." },
        refuse: {
          label: "Reject the offer",
          success: "He agrees to stay, reluctantly, but without a fuss.",
          failure: "He stays, but the mood in the dressing room turns heavy.",
        },
        promise: { label: "Promise minutes", result: "He agrees to stay if he plays. The promise goes on the list." },
      },
    },
    youthShines: {
      title: "Academy gem",
      body: "{player} is flying in training. The coaching staff think it is time to give him a chance.",
      options: {
        chance: { label: "Give him minutes", result: "The fans love seeing academy players. Now he expects to play." },
        praise: {
          label: "Praise him in public",
          success: "The youngster thrives on the confidence.",
          failure: "The pressure went to his head and his form dropped.",
        },
        patience: { label: "Ask for patience", result: "The starters approve; the youngster is upset." },
      },
    },
    injuryCrisis: {
      title: "Injury crisis",
      body: "{injured} players are with the medical staff. The sports scientist wants investment to speed up recoveries.",
      options: {
        medical: { label: "Invest in the medical staff ({cost})", result: "Recoveries get shorter." },
        rotate: { label: "Rotate the squad", result: "The bench players get a lift and the midfield trains to take the strain." },
      },
    },
    derbyWeek: {
      title: "Derby week",
      body: "The derby against {rival} is coming. The city talks of nothing else.",
      options: {
        fire: {
          label: "Fire up the team",
          success: "The attack comes out switched on and the fans join the fight.",
          failure: "Nerves on edge: the starters play worse.",
        },
        calm: { label: "Lower the temperature", result: "A week of focus and a well-drilled defence." },
      },
    },
    boardBonus: {
      title: "Upbeat board",
      body: "The board offers a {amount} boost for signings, if you accept the expectations that come with it.",
      options: {
        accept: { label: "Accept the funds", result: "Money in the transfer budget, and the board watching closely." },
        decline: { label: "Decline gracefully", result: "The board appreciates the prudence." },
      },
    },
    sponsor: {
      title: "Controversial sponsor",
      body: "A betting company offers {amount} to put its brand on the training kit. The fans turn up their noses.",
      options: {
        accept: { label: "Accept", result: "The money comes in; some of the fans complain." },
        refuse: { label: "Refuse", result: "The fans applaud the decision." },
      },
    },
    fanProtest: {
      title: "Fan protest",
      body: "Banners on the training ground gates. The fans demand an answer.",
      options: {
        meet: {
          label: "Meet the leaders",
          success: "The frank talk calms the stands.",
          failure: "The meeting leaked and turned into a shouting match.",
        },
        focus: { label: "Train behind closed doors", result: "The board backs you; the fans feel ignored." },
      },
    },
    pressLeak: {
      title: "The leak",
      body: "A dressing-room conversation ended up in the papers. Someone is talking too much.",
      options: {
        hunt: {
          label: "Hunt down the culprit",
          success: "The leak stops and the squad closes ranks.",
          failure: "The witch-hunt left everyone suspicious.",
        },
        unite: { label: "Close ranks, no hunt", result: "The squad likes it; the board wanted a tougher response." },
      },
    },
    veteranMentor: {
      title: "A veteran wants to help",
      body: "{player} offers to look after the academy youngsters, with extra sessions after hours.",
      options: {
        accept: { label: "Accept the help", result: "{player} becomes a mentor: the squad's youngsters develop a bit more." },
        focus: { label: "Ask him to focus on his game", result: "He goes back to thinking only about playing, and his form improves." },
      },
    },
    rivalInterest: {
      title: "Bid for a reserve",
      body: "{buyer} offer {price} for {player}, who has barely played.",
      options: {
        sell: { label: "Sell", result: "Money in the bank. The fans dislike strengthening other clubs." },
        keep: { label: "Keep him in the squad", result: "He feels valued, and you promise not to sell him before the end of the season." },
      },
    },
    raiseRequest: {
      title: "Pay rise request",
      body: "{player} is in great form and his agent asks for {raise} more per month.",
      options: {
        raise: { label: "Give him the rise", result: "He is happy; the wage bill grows." },
        refuse: {
          label: "Refuse",
          success: "He understands and stays focused.",
          failure: "He is hurt and his form may drop.",
        },
      },
    },
    trainingInjury: {
      title: "Training knock",
      body: "{player} felt a twinge in training. The doctor urges caution.",
      options: {
        rush: {
          label: "Rush his return",
          success: "Just a scare: a few days out.",
          failure: "Rushing made the injury worse: a month out.",
        },
        rest: { label: "Give it time", result: "Two and a half weeks on the sidelines, no risk." },
      },
    },
    austerity: {
      title: "In the red",
      body: "The club's cash is negative. The board wants spending cuts and suggests selling {player}, the top earner.",
      options: {
        list: { label: "Put him on the transfer list", result: "The board approves; he is not pleased to hear it." },
        cut: { label: "Cut the transfer budget", result: "Less money for signings, lighter books." },
      },
    },
    dressingRoomFight: {
      title: "Dressing-room row",
      body: "{player} had a heated row with the squad's youngsters after training.",
      options: {
        veteran: { label: "Back the veteran", result: "He feels supported; the youngsters are upset." },
        youth: { label: "Back the youngsters", result: "The youngsters get a lift and the promise of more games; the veteran withdraws." },
        fine: {
          label: "Fine both sides",
          success: "Rules are rules: the squad understands.",
          failure: "The fine went down badly and the squad split.",
        },
      },
    },
    pressure: {
      title: "Pressure for results",
      body: "The team is below expectations and the press is starting to talk about a change in the dugout.",
      options: {
        back: { label: "Defend the squad in public", result: "The squad sides with you; the fans wanted you to demand more." },
        demand: {
          label: "Demand more from the squad",
          success: "The telling-off worked: the team is performing again.",
          failure: "The public criticism weighed on them and the squad shut off.",
        },
      },
    },
    goodRun: {
      title: "Good run",
      body: "The team is above expectations and the board wants to seize the moment: {amount} more for signings, if you want it.",
      options: {
        celebrate: { label: "Celebrate with the squad", result: "A party in the dressing room and in the stands." },
        invest: { label: "Take the funds", result: "Money to strengthen the squad, and a satisfied board." },
      },
    },
    preseasonTour: {
      title: "Pre-season tour",
      body: "A summer tournament abroad pays {amount}, but tires the squad.",
      options: {
        tour: {
          label: "Go on tour",
          success: "Fee banked and nobody felt it.",
          failure: "Fee banked, but the starters came back tired.",
        },
        camp: { label: "Stay and train", result: "Pre-season at home, a sharp midfield." },
      },
    },
  },

  matchEvent: {
    title: "Match decision",
    context: "{competition} · {round}",
    minute: "{minute}'",
    venue: { home: "Home", away: "Away", neutral: "Neutral ground" },
    aggregate: "Aggregate {aggregate}",
    situations: {
      losing: { title: "Losing at {minute}'", body: "The score is against you. What changes?" },
      drawing: { title: "Level at {minute}'", body: "A tight game. Gamble or hold on?" },
      winning: { title: "Winning at {minute}'", body: "You have the lead. How do you close it out?" },
    },
    options: {
      allIn: { label: "All-out attack", hint: "More goals for and far more exposure.", goal: "Get at least a draw" },
      adjust: { label: "Adjust calmly", hint: "A bit more attack, with almost no extra risk.", goal: "Get at least a draw" },
      accept: { label: "Avoid a hammering", hint: "Shuts up shop to concede no more.", goal: "Keep the score from getting worse" },
      push: { label: "Go for it", hint: "More chance of winning, more chance of losing.", goal: "Win" },
      balance: { label: "Balance it", hint: "A small gain at both ends.", goal: "Don't lose" },
      hold: { label: "Hold on to the point", hint: "Fewer goals at both ends.", goal: "Don't lose" },
      close: { label: "Park the bus", hint: "A reinforced defence, almost no attack.", goal: "Keep the win" },
      keepGoing: { label: "Go for more goals", hint: "Kills the game or gives the opponent a chance.", goal: "Keep the win" },
      manage: { label: "Manage the game", hint: "Keep the ball and less running.", goal: "Keep the win" },
    },
    chance: "Chance of success: {chance}",
    goal: "Objective: {goal}",
    odds: "Win {win} · Draw {draw} · Loss {loss}",
    success: "It worked.",
    failure: "It didn't work.",
  },

  talks: {
    concerns: {
      minutes: "Says he deserves to play more and isn't getting a chance.",
      wantsOut: "Wants to leave. His head is already elsewhere.",
      promise: "Wants to know if the promise you made will be kept.",
      form: "Low on confidence, missing what he always used to get right.",
      role: "Doesn't understand why he spends so long on the bench.",
      homesick: "Misses home and his family, far from his country.",
      content: "He is fine. Thanks you for the chat and wants to keep it that way.",
    },
    immediate: "Just talking already left him a little better.",
    options: {
      promiseStarts: { label: "Promise a starting spot", good: "He leaves confident. The promise goes on the list." },
      patience: { label: "Ask for patience", good: "He agrees to wait his turn.", bad: "He did not accept the request." },
      honest: { label: "Be frank about his role", good: "The truth hurt, but he accepts the bench.", bad: "He did not like the frankness at all." },
      list: { label: "Put him on the transfer list", good: "He thanks you for listening and waits for offers." },
      convince: { label: "Try to convince him to stay", good: "He decides to stay and fight for his place.", bad: "No luck: he still wants to leave." },
      promiseMinutes: { label: "Promise minutes", good: "He agrees to wait if he plays. The promise goes on the list." },
      reassure: { label: "Assure him you will keep it", good: "He trusts your word." },
      release: { label: "Withdraw the promise", good: "He doesn't like it, but the promise no longer stands." },
      confidence: { label: "Give him confidence", good: "He believes again.", bad: "It didn't help: still no confidence." },
      rest: { label: "Rest him for a few days", good: "He gets a breather and comes back better." },
      explain: { label: "Explain his role", good: "He understands and accepts the bench.", bad: "He disagreed with the explanation." },
      family: { label: "Help bring his family over", good: "With his family close, he is smiling again." },
      praise: { label: "Praise him", good: "He leaves even more motivated." },
      challenge: { label: "Challenge him to do more", good: "The challenge fired him up.", bad: "He felt it was too much pressure." },
    },
  },

  meeting: {
    support: { label: "Back the squad", good: "The squad feels supported. Those who were upset improve more." },
    demand: { label: "Demand more from the squad", good: "The demands worked: the team is running again.", bad: "The demands went down badly and the mood soured." },
  },

  funds: {
    large: "The board releases {amount}.",
    small: "The board releases only {amount}.",
    refused: "The board won't release anything right now.",
    condition: "Condition: the season objective rises to {objective}.",
  },

  objectives: {
    title: { name: "Title challenge", target: "Finish in the top {target}" },
    top: { name: "Top half", target: "Finish in the top {target}" },
    mid: { name: "Mid-table", target: "Finish in the top {target}" },
    survive: { name: "Avoid the drop", target: "Finish no lower than position {target}" },
    promotion: { name: "Win promotion", target: "Finish in the top {target} and go up" },
    bottom: { name: "Do your best", target: "Finish no lower than position {target}" },
  },

  reasons: {
    resultsAbove: "Results above expectations",
    resultsBelow: "Results below expectations",
    derbyWins: "Derby wins",
    derbyLosses: "Derby defeats",
    titles: "Titles",
    promotion: "Promotion",
    relegation: "Relegation",
    promiseKept: "Promise kept",
    promiseBroken: "Promise broken",
    idolSold: "Sale of a fan favourite",
    idolSoldMoney: "Money from the fan favourite's sale",
    starSold: "Sale of a star",
    unhappySold: "Exit of an unhappy player",
    debtRelief: "Breathing room in the finances",
    seasonGood: "Season above expectations",
    seasonBad: "Season below expectations",
    event: "Event decision",
    talk: "Dressing-room talk",
  },

  bars: {
    board: { name: "Board", hint: "The board's confidence in your work. Below 27 at the review, you are sacked." },
    fans: { name: "Fans", hint: "Mood in the stands. Counts in the review and reacts to derbies, titles and sales." },
    squad: { name: "Squad", hint: "Average player satisfaction. Unhappy players perform worse." },
  },

  moments: {
    derbyWin: "Derby win against {opponent} ({score})",
    derbyLoss: "Derby defeat against {opponent} ({score})",
    bigWin: "Thrashing of {opponent} ({score})",
    bigLoss: "Thrashed by {opponent} ({score})",
    title: "Champion: {competition}",
    eliminated: "Knocked out: {competition} ({round})",
    promotion: "Promotion won",
    relegation: "Relegated",
    hatTrick: "Hat-trick for {player}",
    matchEventSuccess: "Spot-on in-match decision",
    matchEventFailure: "The in-match decision didn't work",
    debut: "Debut for {player}, from the academy",
    signing: "Signing of {player} ({fee})",
    sale: "Sale of {player} to {buyer} ({fee})",
  },

  evaluation: {
    reasons: {
      objective: "What counted: the league objective.",
      cups: "What counted: the cups and continental tournaments.",
      finances: "What counted: the club's finances.",
      promises: "What counted: the promises made to the squad.",
      fans: "What counted: the relationship with the fans.",
      history: "What counted: the record of previous seasons.",
    },
    tolerance: {
      trusted: "The board trusts your work.",
      patience: "The season was not good, but your track record earns you patience.",
      warned: "The board made it clear: the next one has to be better.",
      none: "Neutral review.",
    },
    dismissed: "Sacked. The board decided on a change in the dugout.",
    kept: "Kept on for next season.",
  },

  finance: {
    healthy: "Healthy",
    balanced: "Balanced",
    tight: "Tight",
  },

  achievements: {
    firstSeason: { name: "First clipboard", description: "Finish your first season as a coach." },
    fullCareer: { name: "Twenty-four years on the bench", description: "Complete all 24 seasons of the coaching career." },
    promotion: { name: "Promotion", description: "Take a club up to the top division." },
    twoPromotions: { name: "Promotion specialist", description: "Win two promotions in your career." },
    rescue: { name: "Firefighter", description: "Keep up a club whose objective was to avoid relegation." },
    firstTitle: { name: "First trophy", description: "Win your first title as a coach." },
    league: { name: "National champion", description: "Win a top-division league." },
    continental: { name: "King of the continent", description: "Win the top continental club competition." },
    clubWorldCup: { name: "World champion", description: "Win the Club World Cup." },
    underdogWorld: { name: "David and Goliath", description: "Win the Club World Cup with a club from outside Europe." },
    treble: { name: "Treble", description: "Win the league, the domestic cup and the top continental competition in the same season." },
    tenTitles: { name: "Full trophy cabinet", description: "Win 10 titles as a coach." },
    fromBottom: { name: "From the basement to the top", description: "Win promotion with a club and, later, win the top-division league with it." },
    loyal: { name: "True home", description: "Coach the same club for 10 seasons." },
    abroad: { name: "Passport stamped", description: "Coach a club in another country." },
    threeCountries: { name: "Citizen of the world", description: "Coach clubs in three different countries." },
    revelations: { name: "Star factory", description: "Promote 5 academy players who reach 30 games under you." },
    comeback: { name: "Back on top", description: "Get sacked and, later, win a title." },
    reputation: { name: "Clipboard legend", description: "Reach 90 reputation." },
  },
};
