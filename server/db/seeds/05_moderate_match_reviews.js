/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("moderate_reviews").del();

  const feedbackOptions = [
    "Exceptional technical ability shown today, maintain this elite standard.",
    "Outstanding work rate and intelligent positioning throughout the match.",
    "Excellent performance, your decision-making under pressure was exemplary.",
    "Superb first touch and ball control, exactly what we expect at this level.", 
    "Dominant defensive display, kept their attackers quiet all game.",
    "Clinical finishing and movement, created several quality chances.",
    "Leadership and communication on the field was world-class today.",
    "Perfect tracking back and defensive transitions, textbook performance.",
    "Brilliant movement off the ball, always available for the pass.",
    "Elite-level passing range and vision, dictated the tempo perfectly.",
    "Outstanding pressing and ball recovery, set the tone defensively.",
    "Exceptional crossing and final ball delivery from wide areas.",
    "Composed on the ball under pressure, exactly what elite players do.",
    "Excellent reading of the game, anticipated danger situations perfectly.",
    "World-class technique in tight spaces, made difficult look easy."
  ];

  const reflectionOptions = [
    "I should track back more when we lose possession.",
    "Need to work on my crossing accuracy.",
    "My positioning was good but passing could be better.",
    "I felt confident with the ball today.",
    "Need to be more vocal with teammates.",
    "My fitness levels are improving each match.",
    "Should have taken that shot in the first half.",
    "Communication with defense was effective.",
    "Need to work on my weak foot.",
    "Happy with my performance but always room to improve.",
  ];

  const moderateReviews = [];

  // Get all matches to use their scorelines
  const matches = await knex("matches").select("*").orderBy("id");

  for (const match of matches) {
    const matchStats = generateMatchStats(match.team_score, match.opponent_score);
    
    for (let playerId = 1; playerId <= 7; playerId++) {
      const position = getPlayerPosition(playerId);
      const playerStats = matchStats.players[playerId - 1]; // Arrays are 0-indexed
      const feedback = feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      
      moderateReviews.push({
        match_id: match.id,
        player_id: playerId,
        minutes_played: playerStats.minutes_played,
        goals: playerStats.goals,
        assists: playerStats.assists,
        tackles: playerStats.tackles,
        interceptions: playerStats.interceptions,
        saves: playerStats.saves,
        chances_created: playerStats.chances_created,
        coach_rating: playerStats.coach_rating,
        feedback: feedback,
        reflection: null, // Keep null to simulate "locked until reflection submitted" UX
        ai_suggestions: generateMockAISuggestions(feedback, position, playerStats),
      });
    }
  }

  await knex("moderate_reviews").insert(moderateReviews);
};

function getPlayerPosition(playerId) {
  const positions = {
    1: "ST", 2: "CM", 3: "CM", 4: "CB", 5: "RW", 6: "RB", 7: "CM"
  };
  return positions[playerId];
}

function generateMatchStats(teamScore, opponentScore) {
  const players = [];
  const positions = ["ST", "CM", "CM", "CB", "RW", "RB", "CM"];
  
  // Determine match outcome for stat adjustments
  const isWin = teamScore > opponentScore;
  const isDraw = teamScore === opponentScore;
  const isLoss = teamScore < opponentScore;
  const goalDifference = teamScore - opponentScore;

  // Initialize all players with base stats for elite performance
  for (let i = 0; i < 7; i++) {
    players.push({
      position: positions[i],
      minutes_played: Math.floor(Math.random() * 16) + 75, // 75-90 minutes (elite players play more)
      goals: 0,
      assists: 0,
      tackles: 0,
      interceptions: 0,
      saves: 0,
      chances_created: 0,
      coach_rating: 75, // Base rating for elite team
    });
  }

  // Distribute goals realistically
  distributeGoals(players, teamScore);
  
  // Distribute assists (usually 1 per goal, sometimes none)
  distributeAssists(players, teamScore);
  
  // Generate chances created based on attacking players and match flow
  generateChancesCreated(players, teamScore, opponentScore);
  
  // Generate defensive stats based on match pressure
  generateDefensiveStats(players, teamScore, opponentScore);
  
  // Set coach ratings based on performance and result
  setCoachRatings(players, isWin, isDraw, goalDifference);

  return { players };
}

function distributeGoals(players, teamScore) {
  const attackingPositions = [0, 4]; // ST and RW
  const midfielders = [1, 2, 6]; // CMs
  
  let goalsRemaining = teamScore;

  while (goalsRemaining > 0) {
    // 85% chance for attackers, 13% for midfielders, 2% for defenders
    const random = Math.random();
    let scorerIndex;
    
    if (random < 0.85) {
      scorerIndex = attackingPositions[Math.floor(Math.random() * attackingPositions.length)];
    } else if (random < 0.98) {
      scorerIndex = midfielders[Math.floor(Math.random() * midfielders.length)];
    } else {
      scorerIndex = Math.floor(Math.random() * 7); // Any player
    }

    // Elite team: allow up to 4 goals per player
    if (players[scorerIndex].goals < 4) {
      players[scorerIndex].goals++;
      goalsRemaining--;
    }
  }
}


function distributeAssists(players, teamScore) {
  // Elite teams often have more assists than goals due to intricate play
  const potentialAssists = Math.floor(teamScore * 1.25) + Math.floor(Math.random() * 2); 
  // Assists = 125% of goals on average + some randomness

  for (let i = 0; i < potentialAssists; i++) {
    // Elite midfielders and wingers dominate assists
    const random = Math.random();
    let assisterIndex;
    
    if (random < 0.65) {
      assisterIndex = [1, 2, 6][Math.floor(Math.random() * 3)]; // CMs
    } else if (random < 0.95) {
      assisterIndex = 4; // RW
    } else if (random < 1) {
      assisterIndex = 0; // ST
    }

    // Elite players can have multiple assists
    if (players[assisterIndex] && players[assisterIndex].assists < 5) {
      players[assisterIndex].assists++;
    }
  }
}


function generateChancesCreated(players, teamScore, opponentScore) {
  // Elite teams generate lots of chances; scale with intensity of match
  const matchIntensity = teamScore + opponentScore;
  const baseChances = Math.max(10, teamScore * 3 + Math.floor(Math.random() * 6) + matchIntensity); 
  // Typical: 12–18 chances

  for (let i = 0; i < baseChances; i++) {
    const random = Math.random();
    let creatorIndex;

    if (random < 0.35) {
      creatorIndex = [1, 2, 6][Math.floor(Math.random() * 3)]; // CMs
    } else if (random < 0.55) {
      creatorIndex = 4; // RW
    } else if (random < 0.70) {
      creatorIndex = 0; // ST
    } else if (random < 0.85) {
      creatorIndex = 5; // RB
    } else {
      creatorIndex = Math.floor(Math.random() * 7); // Wildcard
    }

    if (players[creatorIndex]) {
      players[creatorIndex].chances_created++;
    }
  }

  // Ensure minimum for key attackers
  const keyAttackers = [0, 4]; // ST and RW
  keyAttackers.forEach(index => {
    if (players[index].chances_created < 5) {
      players[index].chances_created = Math.floor(Math.random() * 3) + 5; // Guarantee 5–7
    }
  });

  // Ensure at least 1 CM hits decent creative numbers
  const randomCM = [1, 2, 6][Math.floor(Math.random() * 3)];
  if (players[randomCM].chances_created < 4) {
    players[randomCM].chances_created = Math.floor(Math.random() * 3) + 4; // 4–6
  }
}


function generateDefensiveStats(players, teamScore, opponentScore) {
  // Elite teams press high and defend as a unit
  const defensivePressure = opponentScore >= teamScore ? 2.2 : 1.7; // More intense defensive work
  
  const defensivePositions = [3, 5]; // CB, RB
  const midfielders = [1, 2, 6]; // CMs
  const attackers = [0, 4]; // ST, RW
  
  // Generate tackles and interceptions for defenders (elite defensive stats)
  defensivePositions.forEach(pos => {
    players[pos].tackles = Math.floor((Math.random() * 6 + 4) * defensivePressure); // 4-10 tackles
    players[pos].interceptions = Math.floor((Math.random() * 5 + 2) * defensivePressure); // 2-7 interceptions
    
    // Elite defenders contribute to attack occasionally
    if (Math.random() < 0.35) {
      players[pos].chances_created = Math.floor(Math.random() * 6) + 1; // 1-6 chances
    }
    if (Math.random() < 0.35) {
      players[pos].assists = 1; // Occasional assist from overlapping
    }
  });
  
  // Midfielders get substantial defensive stats (box-to-box elite players)
  midfielders.forEach(pos => {
    players[pos].tackles = Math.floor((Math.random() * 6 + 3) * defensivePressure); // 3-8 tackles
    players[pos].interceptions = Math.floor((Math.random() * 5 + 2) * defensivePressure); // 2-6 interceptions
    
    // Elite midfielders always create chances
    if (players[pos].chances_created < 2) {
      players[pos].chances_created = Math.floor(Math.random() * 4) + 2; // 2-5 chances
    }
  });
  
  // Attackers contribute to pressing (modern football)
  attackers.forEach(pos => {
    players[pos].tackles = Math.floor((Math.random() * 5 + 1) * defensivePressure); // 1-4 tackles
    players[pos].interceptions = Math.floor((Math.random() * 5 + 1) * defensivePressure); // 1-3 interceptions
  });
}

function setCoachRatings(players, isWin, isDraw, goalDifference) {
  players.forEach((player, index) => {
    let baseRating = 82; // Higher base for elite team (was 70)
    
    // Adjust based on result (elite teams expected to win)
    if (isWin) {
      baseRating += Math.min(10, goalDifference * 2); // Up to 92 for big wins
    } else if (isDraw) {
      baseRating += Math.floor(Math.random() * 8) - 4; // 78-86 for draws
    } else {
      baseRating -= Math.min(15, Math.abs(goalDifference) * 3); // Down to 67 for bad losses
    }
    
    // Individual performance bonuses (elite level expectations)
    if (player.goals > 0) baseRating += player.goals * 3; // +3 per goal (elite expect goals)
    if (player.assists > 0) baseRating += player.assists * 2; // +2 per assist
    if (player.chances_created > 3) baseRating += Math.min(5, player.chances_created - 3); // Bonus for creating
    if (player.tackles > 5) baseRating += 3; // Defensive work bonus
    if (player.interceptions > 3) baseRating += 2; // Interception bonus
    
    // Elite players get bonuses for well-rounded performances
    const statsCount = [player.goals, player.assists, player.chances_created, player.tackles, player.interceptions]
      .filter(stat => stat > 0).length;
    if (statsCount >= 3) baseRating += 3; // Well-rounded performance bonus
    
    // Minutes played factor (elite players expected to play full matches)
    if (player.minutes_played >= 85) baseRating += 2;
    else if (player.minutes_played < 80) baseRating -= 3;
    
    // Add smaller random variation for elite consistency
    baseRating += Math.floor(Math.random() * 6) - 3; // ±3 variation (was ±5)
    
    // Clamp between 75-95 for elite team
    player.coach_rating = Math.max(75, Math.min(95, baseRating));
  });
}

/**
 * Generate mock AI suggestions that match the real AI service format
 * @param {string} feedback - Coach feedback
 * @param {string} position - Player position  
 * @param {Object} playerStats - Player match stats
 * @returns {string} - Formatted AI suggestions
 */
function generateMockAISuggestions(feedback, position, playerStats) {
  // Position-specific suggestion templates for elite players
  const suggestionTemplates = {
    ST: {
      positive: [
        "Your elite attacking instincts and clinical finishing were on full display. Your movement in the box created multiple scoring opportunities.",
        "Exceptional performance in the final third. Your positioning and timing of runs caused constant problems for their defense.",
        "World-class work rate and attacking presence. Your link-up play and hold-up work were exemplary for a player of your caliber."
      ],
      improvements: [
        "Continue perfecting your finishing from different angles to maintain your elite scoring rate",
        "Work on varying your movement patterns to become even more unpredictable in the box", 
        "Focus on developing different types of finishes for various goalscoring situations"
      ]
    },
    CM: {
      positive: [
        "Your midfield dominance and exceptional passing range controlled the tempo of the game perfectly.",
        "Outstanding energy and vision from the center of the pitch. Your ability to switch play and find space was elite-level.",
        "Brilliant midfield performance with perfect ball retention and progressive passing. Your press resistance was exceptional."
      ],
      improvements: [
        "Continue developing your long-range shooting to add another dimension to your game",
        "Work on timing late runs into the box to increase your goal threat from midfield",
        "Focus on perfecting your pressing triggers to win the ball back even higher up the pitch"
      ]
    },
    CB: {
      positive: [
        "Your defensive leadership and commanding presence organized the entire backline flawlessly.",
        "Elite-level defensive performance with perfect reading of the game and dominant aerial ability.",
        "Exceptional defensive display showing world-class communication and positional intelligence."
      ],
      improvements: [
        "Continue developing your progressive passing to help initiate attacks from deep positions",
        "Work on perfecting your timing when stepping out of defense to press high",
        "Focus on improving your distribution under pressure to maintain possession in tight situations"
      ]
    },
    RW: {
      positive: [
        "Your pace, skill, and attacking threat down the right flank terrorized their defense all game.",
        "Outstanding wing play with exceptional dribbling and precise crossing. Your end product was clinical.",
        "Brilliant performance on the wing with elite ball-carrying and consistent creative output."
      ],
      improvements: [
        "Continue perfecting your ability to cut inside and create shooting opportunities",
        "Work on developing more variety in your crossing to keep defenders guessing",
        "Focus on timing your defensive tracking to maintain the team's pressing structure"
      ]
    },
    RB: {
      positive: [
        "Perfect balance between defensive solidity and attacking threat. Your overlapping runs were timed excellently.",
        "Elite defensive performance with exceptional positioning and crucial attacking contributions.",
        "Outstanding consistency in both phases, exactly what we expect from a world-class fullback."
      ],
      improvements: [
        "Continue developing your crossing technique from different areas of the pitch",
        "Work on perfecting your communication with wingers during attacking transitions",
        "Focus on improving your recovery speed when caught high up the pitch"
      ]
    }
  };

  // Determine if feedback is positive or constructive
  const positiveKeywords = ["excellent", "great", "strong", "outstanding", "good"];
  const isPositive = positiveKeywords.some(keyword => 
    feedback.toLowerCase().includes(keyword)
  );

  const template = suggestionTemplates[position] || suggestionTemplates.CM;
  
  // Select appropriate response
  const constructiveFeedback = isPositive 
    ? template.positive[Math.floor(Math.random() * template.positive.length)]
    : `Your coach identified areas for development: "${feedback}". This feedback is valuable for your growth.`;

  // Add performance-based context
  let performanceContext = "";
  if (playerStats.goals > 0) {
    performanceContext += ` Your ${playerStats.goals} goal${playerStats.goals > 1 ? 's' : ''} today showed good finishing ability.`;
  }
  if (playerStats.assists > 0) {
    performanceContext += ` Your ${playerStats.assists} assist${playerStats.assists > 1 ? 's' : ''} demonstrated good vision and teamwork.`;
  }
  if (playerStats.tackles > 3) {
    performanceContext += ` Your ${playerStats.tackles} tackles showed strong defensive commitment.`;
  }

  // Get random improvement suggestions for this position
  const improvements = [...template.improvements]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return `${constructiveFeedback}${performanceContext}

- ${improvements[0]}
- ${improvements[1]}  
- ${improvements[2]}`;
}
