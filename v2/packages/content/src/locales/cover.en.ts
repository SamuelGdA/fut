import type { CoverMessages } from "./cover.pt";

/**
 * The season's front page (GDD 21.2), written in English rather than
 * translated. English needs no article before a club, so club names sit
 * wherever the sentence wants them; plurals still come from the *Text markers.
 */
export const coverEn: CoverMessages = {
  papers: [
    "The Back Page",
    "Matchday Post",
    "The Terrace",
    "Full Time Gazette",
    "The Sporting Wire",
    "Kick-Off Daily",
    "The Touchline",
    "Ninety Minutes",
  ],
  dateline: "{year} edition",
  angles: {
    perfect: {
      headlines: [
        "Treble: {surname} wins league, cup and continent",
        "{surname} wins everything he enters",
        "Everything there was to win",
        "League, cup and continent: {surname}'s perfect year",
        "Nothing left to enter",
        "A clean sweep: {count} trophies",
      ],
      support: [
        "League, domestic cup and the continent's top prize in the same season.",
        "A season for the frame.",
        "A club gets a season like this once a generation, if at all.",
        "It was {count} trophies, and the three that matter most were among them.",
      ],
    },
    worldChampion: {
      headlines: [
        "{surname} is a world champion",
        "World Cup: {surname} lifts the trophy",
        "The world belongs to {surname}",
        "World champion at {age}",
        "The star the shirt was missing",
      ],
      support: [
        "The {year} world title carries {surname}'s signature.",
        "Football's heaviest trophy comes home with him.",
        "At {age}, he joins football's shortest list: world champions.",
      ],
    },
    bestInWorld: {
      headlines: [
        "{surname} is the best in the world",
        "Ballon d'Or: {surname} reaches the top",
        "The Ballon d'Or is his",
        "The whole year belonged to him",
        "The biggest prize and little argument",
        "The year was his, and the trophy says so",
      ],
      support: [
        "The vote rewards the best season on the planet.",
        "No player anywhere did more than he did this year.",
        "Best in the world confirms what the whole year had already been saying.",
        "After a season like that, picking any other name would have been hard to justify.",
        "At {age}, he took the individual trophy every player wants.",
      ],
    },
    continentKing: {
      headlines: [
        "{competition}: {surname} is a champion",
        "{surname} conquers the continent",
        "King of the continent",
        "Continental cup: and he was there",
        "{competition}: job done",
        "The night {club} waited a lifetime for",
      ],
      support: [
        "The continent's most coveted cup changes hands.",
        "Final night, and the party ends with the cup in hand.",
        "A whole campaign to reach one night, and {club} came out of it with the cup.",
        "At {age}, his name joins the list of continental champions.",
        "A whole continent watched, and it was {club} who lifted the cup.",
      ],
    },
    collector: {
      headlines: [
        "{count} trophies: {surname} fills the cabinet",
        "{surname} collects titles in {year}",
        "{count} titles. One season.",
        "Collector: {count} titles in the year",
        "One more, and another: {count} in all",
        "{club}'s cabinet will not shut",
      ],
      support: [
        "Few players lift this many trophies in a single season.",
        "The trophy room is going to need more space.",
        "It was {count} titles in one season, and he was in all of them.",
        "They are not all worth the same, but there are {count} of them in the cabinet.",
        "{count} titles in one season: the kind of year a club tells its grandchildren about.",
      ],
    },
    nationGlory: {
      headlines: [
        "{competition}: {surname} wins it with his country",
        "The national team are champions, and {surname} shines",
        "Continental champion in the national shirt",
        "{surname} leads his country to the title",
        "A continental cup for {surname}'s country",
      ],
      support: [
        "A title in the national shirt crowns the year.",
        "The national team come home with the cup and with him front and centre.",
        "Winning for your country weighs differently: the whole nation celebrates.",
      ],
    },
    nationalChampion: {
      headlines: [
        "{league}: {surname} is a champion",
        "{surname} wins the league",
        "Champions! The league belongs to {club}",
        "The title comes home",
        "League winner at {age}",
        "{club} on top, and he was in the thick of it",
      ],
      support: [
        "{club} finish the league top of the table.",
        "The most consistent campaign in the country ends with the trophy.",
        "After a whole championship, {club} finished where they meant to: first.",
        "The league title arrived with {gamesText} of his behind it.",
      ],
    },
    honour: {
      headlines: [
        "{award} for {surname}",
        "{surname} collects a major award: {award}",
        "{award}: the prize has an owner",
        "Recognition arrives: {award}",
        "{award}, at last, in {surname}'s hands",
      ],
      support: [
        "The season's numbers speak for him.",
        "Recognition after a year well above the rest.",
        "Nobody in the league came close to what he did this season.",
      ],
    },
    bestOfCompetition: {
      headlines: [
        "{surname}, player of the tournament: {competition}",
        "Nobody played better: {surname} named the best",
        "Player of the tournament: {surname}",
        "The best player award has an owner: {surname}",
        "{competition}: {surname} was the best",
      ],
      support: [
        "Named the best player of the competition: {competition}.",
        "{gamesText} and {productionText} were enough to convince the voters.",
        "A season above everyone else earned the best player award: {competition}.",
      ],
    },
    scoringTitle: {
      headlines: [
        "{surname} is the top scorer: {competition}",
        "Nobody scored more than {surname}",
        "Golden boot secured: {surname}",
        "The competition's goalscorer: {surname}",
        "{competition}: the scoring title goes to {surname}",
      ],
      support: [
        "Nobody scored more in the competition: {competition}.",
        "{goalsText} in the season, and the scoring title came with them.",
        "An eye for goal to spare: top scorer, {competition}.",
      ],
    },
    relegated: {
      headlines: [
        "{club} are relegated",
        "Relegation: no escape for {club}",
        "The drop is confirmed. What now?",
        "Second tier: the bill arrives",
        "The year it all went wrong",
        "The year {club} want to forget",
      ],
      support: [
        "A season to forget, with the second tier on the horizon.",
        "Relegation leaves its mark on the squad and in the stands.",
        "The drop hurt, and the effort on the pitch was not enough to prevent it.",
        "{club} go down, and the year is remembered for the wrong reason.",
        "The season that promised so much became the hardest of his career.",
      ],
    },
    promoted: {
      headlines: [
        "{club} go up",
        "Promotion: {club} go up to the top flight",
        "Top flight, here we come",
        "Up they go!",
        "Job done: {club} go up",
        "Promotion, earned the hard way",
      ],
      support: [
        "Next season is in the top flight.",
        "The promotion party takes over the city.",
        "A whole season in the second tier ended the only way that mattered: going up.",
        "Promotion came the hard way, and {club} got where they wanted to be.",
      ],
    },
    almost: {
      headlines: [
        "{surname} makes the Ballon d'Or podium",
        "So close: {surname} finishes {rank} in the Ballon d'Or",
        "Among the three best in the world",
        "Ballon d'Or: {surname} comes {rank}",
        "{surname} knocks on the door of the world's top spot",
      ],
      support: [
        "The award got away, but the whole world saw.",
        "A top-three finish in the world is already a rare feat.",
        "The season put his name in the conversation about the best on the planet.",
      ],
    },
    debut: {
      headlines: [
        "{surname} makes his international debut",
        "First call-up: {surname} pulls on the national shirt",
        "The national team came calling",
        "Called up for the first time",
        "The shirt he dreamed about is his",
        "The national manager could not look away",
      ],
      support: [
        "At {age}, the debut every kid dreams of.",
        "Nobody forgets a first call-up.",
        "The call every player waits a lifetime for came at {age}.",
        "After {gamesText} this season, the national manager could not keep looking past him.",
      ],
    },
    cup: {
      headlines: [
        "{competition}: {surname} lifts the cup",
        "{surname} is a cup winner",
        "Round after round, and the cup",
        "The cup came",
        "Tie by tie, all the way",
        "Cup won, the party ran till morning",
      ],
      support: [
        "Knockout won, cup in hand.",
        "The cup ends with a party and a lap of honour.",
        "Knockout football is another game, and {club} held on to the last one.",
        "The cup came, and he was there for every round that mattered.",
      ],
    },
    superCup: {
      headlines: [
        "{competition}: {club} take the trophy",
        "One match, cup in hand",
        "Settled in ninety minutes, and {club} took it",
        "One game, one trophy",
        "One final, one cup: {competition}",
      ],
      support: [
        "One match settled it, and {club} took the cup.",
        "Not the biggest cup on the calendar, but a cup, and it is his.",
        "A one-off final: ninety minutes and done.",
      ],
    },
    trophy: {
      headlines: [
        "{competition}: another trophy for {surname}",
        "{surname} adds a title: {competition}",
        "{competition}: champions!",
        "Trophy in hand: {competition}",
        "{surname} ends the year with a title: {competition}",
      ],
      support: [
        "One more trophy on the season's tally.",
        "Another win for the collection.",
        "Not the continent's most famous cup, but it weighs on the shelf.",
      ],
    },
    record: {
      headlines: [
        "Record: {surname} passes {holder}",
        "{surname} makes history: {record}",
        "{value}: {surname} breaks a historic mark",
        "{holder}'s record falls",
        "Nobody had ever got there",
      ],
      support: [
        "{holder}'s mark was {mark}. Now it is his: {value}.",
        "{record}: real football's biggest mark has a new name.",
        "A number nobody had reached, not even {holder}.",
      ],
    },
    explosion: {
      headlines: [
        "{surname} explodes onto the scene",
        "{surname}'s breakthrough season",
        "Explosion: {ovr} OVR at {age}",
        "Where did this player come from?",
        "The leap nobody saw coming",
        "At {age}, a different level entirely",
      ],
      support: [
        "The progress showed in every game.",
        "The jump in form has the whole country talking.",
        "OVR {ovr} at {age}: the jump that changes both the price and the shape of a career.",
        "He started the year as a prospect and finished it undroppable.",
      ],
    },
    scorer: {
      headlines: [
        "{goalsText}: {surname} cannot stop scoring",
        "{surname} becomes a goal machine",
        "{goals} goals. That's it.",
        "The {goals}-goal season",
        "Opposing keepers didn't sleep this year",
        "The scoring never stopped",
      ],
      support: [
        "Few forwards hit the net this often in a year.",
        "Scoring became routine.",
        "{goals} goals in {gamesText}: the kind of season that changes what a player costs.",
        "Every defence in the league went through him, and the scoreboard told the story.",
      ],
    },
    playmaker: {
      headlines: [
        "{assists} assists: the brain of the side",
        "Everything goes through {surname}",
        "The supplier of the season",
        "{assists} passes that became goals",
        "The last pass was always his",
        "Play beside {surname} and you score more",
      ],
      support: [
        "It was not the goals he scored that decided things, it was the ones he gave.",
        "{assistsText}: when the team created anything, it nearly always came through him.",
        "He was not the scorer; he was the reason the scorer existed.",
      ],
    },
    wall: {
      headlines: [
        "{cleanSheetsText}: {surname} shuts the door",
        "{surname} becomes a brick wall",
        "{cleanSheets} clean sheets",
        "Get past him? Good luck.",
        "The year the goal stayed shut",
        "Keeping them out became routine",
      ],
      support: [
        "Few keepers go this long without fetching the ball from the net.",
        "The country's strikers spent the year trying, and failing.",
        "{cleanSheets} games without conceding: the season was built from the back.",
      ],
    },
    injured: {
      headlines: [
        "Injury rules {surname} out of much of the season",
        "{surname} spends the year in the treatment room",
        "A year lost in the treatment room",
        "More time on the table than the pitch",
        "The season the injury stole",
      ],
      support: [
        "The games he missed weighed on the year.",
        "Recovery becomes the priority for next season.",
        "More weeks in treatment than in training: a year the career will want to forget.",
        "The season existed on paper, but barely existed on the pitch.",
      ],
    },
    suspended: {
      headlines: [
        "{surname} spends the season suspended",
        "A ban keeps {surname} off the pitch",
        "A year in the stands",
        "A heavy ban: {surname} sidelined",
        "The ban that cost a season",
      ],
      support: [
        "A whole year without setting foot on the pitch.",
        "The return to the pitch becomes a countdown.",
        "The season went by, and he watched it from outside.",
      ],
    },
    prospect: {
      headlines: [
        "At {age}, {surname} is still an academy bet",
        "{surname} trains with the first team and waits his turn",
        "The prospect waits for a chance",
        "Patience: {surname} is still a kid",
        "The future is still on the bench",
      ],
      support: [
        "The first-team place has not come yet, and age is on his side.",
        "The first team is already watching him; only the chance is missing.",
        "For now, {gamesText} and a lot of training.",
      ],
    },
    forgotten: {
      headlines: [
        "{surname} drops out of the side",
        "Little room for {surname}: {gamesText} all year",
        "Forgotten on the bench",
        "Out of the picture",
        "The bench became a permanent address",
      ],
      support: [
        "Without minutes, the season passed him by.",
        "The bench became a permanent address.",
        "Whatever the reason, he fell out of the manager's plans.",
      ],
    },
    newAddress: {
      headlines: [
        "{club} unveil {surname}",
        "{surname} changes clubs and starts from scratch",
        "Arrived, played, and now?",
        "First season, first impressions",
        "A new life: {club}",
      ],
      support: [
        "A first season in the new shirt.",
        "New shirt, new crowd, everything to prove.",
        "New pitch, new dressing room, and a crowd still making up its mind.",
        "It took {gamesText} to learn the new place.",
      ],
    },
    lastDance: {
      headlines: [
        "At {age}, {surname} plays on",
        "{surname}'s last dance?",
        "The last dance",
        "How many years are left?",
        "Still out there at {age}",
      ],
      support: [
        "Age weighs, but the ball still finds him.",
        "Every game could be the last, and he plays like it is.",
        "The body charges more each year, but the appetite is still there.",
      ],
    },
    fading: {
      headlines: [
        "{surname} loses his edge",
        "Is {surname}'s peak behind him?",
        "Has the decline started?",
        "Not the player he was",
        "Time sends its bill",
        "The numbers fell, and everyone saw",
      ],
      support: [
        "The drop in form sets off the alarm.",
        "The numbers are falling, and age is starting to tell.",
        "The legs do not answer the way they did, and the club has started looking at younger men.",
        "For the first time, the question about the end was asked out loud.",
      ],
    },
    steady: {
      headlines: [
        "{surname} completes another season",
        "A working season for {surname}",
        "Another year of graft",
        "Neither hero nor villain",
        "No headlines, but plenty of minutes",
        "The year passed, life goes on",
      ],
      support: [
        "No big headline, but the career keeps moving.",
        "Another year of games and experience.",
        "{gamesText}, {productionText}, and the routine of a man doing the job without making headlines.",
        "No great drama this season, which, for a professional, is far from the worst outcome.",
      ],
    },
  },
};
