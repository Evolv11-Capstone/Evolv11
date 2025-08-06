/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("moderate_reviews").del();

  const feedbackOptions = [
    "Needs to improve passing under pressure.",
    "Great work rate but needs better positioning.",
    "Excellent performance, keep it up!",
    "Work on first touch and ball control.",
    "Strong defensive display today.",
    "Created good chances, finish needs work.",
    "Leadership on the field was outstanding.",
    "Needs to track back more consistently.",
    "Good movement off the ball.",
    "Decision making in final third needs improvement.",
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

  // Initialize all players with base stats
  for (let i = 0; i < 7; i++) {
    players.push({
      position: positions[i],
      minutes_played: Math.floor(Math.random() * 31) + 60, // 60-90 minutes
      goals: 0,
      assists: 0,
      tackles: 0,
      interceptions: 0,
      saves: 0,
      chances_created: 0,
      coach_rating: 60,
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
    // 70% chance for attackers, 25% for midfielders, 5% for defenders
    const random = Math.random();
    let scorerIndex;
    
    if (random < 0.70) {
      scorerIndex = attackingPositions[Math.floor(Math.random() * attackingPositions.length)];
    } else if (random < 0.95) {
      scorerIndex = midfielders[Math.floor(Math.random() * midfielders.length)];
    } else {
      scorerIndex = Math.floor(Math.random() * 7); // Any player
    }
    
    // Limit individual goals (max 3 per player)
    if (players[scorerIndex].goals < 3) {
      players[scorerIndex].goals++;
      goalsRemaining--;
    }
  }
}

function distributeAssists(players, teamScore) {
  const potentialAssists = Math.max(0, teamScore - Math.floor(Math.random() * 2)); // 0-2 fewer assists than goals
  
  for (let i = 0; i < potentialAssists; i++) {
    // Midfielders and wingers more likely to assist
    const random = Math.random();
    let assisterIndex;
    
    if (random < 0.60) {
      assisterIndex = [1, 2, 6][Math.floor(Math.random() * 3)]; // CMs
    } else if (random < 0.85) {
      assisterIndex = 4; // RW
    } else {
      assisterIndex = Math.floor(Math.random() * 7); // Any player
    }
    
    players[assisterIndex].assists++;
  }
}

function generateChancesCreated(players, teamScore, opponentScore) {
  const baseChances = Math.max(3, teamScore * 2 + Math.floor(Math.random() * 5));
  
  // Distribute chances among attacking players primarily
  for (let i = 0; i < baseChances; i++) {
    const random = Math.random();
    let creatorIndex;
    
    if (random < 0.35) {
      creatorIndex = 0; // ST
    } else if (random < 0.60) {
      creatorIndex = 4; // RW
    } else if (random < 0.90) {
      creatorIndex = [1, 2, 6][Math.floor(Math.random() * 3)]; // CMs
    } else {
      creatorIndex = Math.floor(Math.random() * 7); // Any player
    }
    
    players[creatorIndex].chances_created++;
  }
}

function generateDefensiveStats(players, teamScore, opponentScore) {
  // More defensive work when losing or in tight games
  const defensivePressure = opponentScore >= teamScore ? 1.5 : 1.0;
  
  const defensivePositions = [3, 5]; // CB, RB
  const midfielders = [1, 2, 6]; // CMs
  
  // Generate tackles
  defensivePositions.forEach(pos => {
    players[pos].tackles = Math.floor((Math.random() * 4 + 2) * defensivePressure); // 2-6 tackles
    players[pos].interceptions = Math.floor((Math.random() * 3 + 1) * defensivePressure); // 1-4 interceptions
  });
  
  // Midfielders get some defensive stats
  midfielders.forEach(pos => {
    players[pos].tackles = Math.floor((Math.random() * 3 + 1) * defensivePressure); // 1-4 tackles
    players[pos].interceptions = Math.floor((Math.random() * 2 + 1) * defensivePressure); // 1-3 interceptions
  });
}

function setCoachRatings(players, isWin, isDraw, goalDifference) {
  players.forEach((player, index) => {
    let baseRating = 70; // Neutral performance
    
    // Adjust based on result
    if (isWin) {
      baseRating += Math.min(15, goalDifference * 3); // Up to 85 for big wins
    } else if (isDraw) {
      baseRating += Math.floor(Math.random() * 10) - 5; // 65-75 for draws
    } else {
      baseRating -= Math.min(20, Math.abs(goalDifference) * 4); // Down to 50 for bad losses
    }
    
    // Individual performance bonuses
    if (player.goals > 0) baseRating += player.goals * 5; // +5 per goal
    if (player.assists > 0) baseRating += player.assists * 3; // +3 per assist
    if (player.tackles > 4) baseRating += 5; // Defensive work bonus
    
    // Add random variation
    baseRating += Math.floor(Math.random() * 10) - 5; // ±5 variation
    
    // Clamp between 60-100
    player.coach_rating = Math.max(60, Math.min(100, baseRating));
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
  // Position-specific suggestion templates
  const suggestionTemplates = {
    ST: {
      positive: [
        "Your attacking instincts and goal-scoring threat were evident today. Continue developing your clinical finishing.",
        "Strong performance in the final third. Your movement and positioning created good opportunities.",
        "Excellent work rate and attacking presence. Keep building on this foundation for consistent goal production."
      ],
      improvements: [
        "Practice shooting from different angles in training to improve finishing accuracy",
        "Work on quick first touches in tight spaces to create more shooting opportunities", 
        "Focus on timing your runs to stay onside while exploiting defensive gaps"
      ]
    },
    CM: {
      positive: [
        "Your midfield presence and work rate contributed well to the team's overall performance.",
        "Good energy and passing distribution from the center of the pitch. Your vision is developing well.",
        "Solid midfield performance with effective ball retention and forward passing."
      ],
      improvements: [
        "Practice quick passing under pressure to improve ball circulation speed",
        "Work on defensive positioning when transitioning from attack to defense",
        "Focus on scanning before receiving the ball to make quicker decisions"
      ]
    },
    CB: {
      positive: [
        "Your defensive solidity and leadership at the back provided good stability for the team.",
        "Strong defensive performance with good reading of the game and well-timed interventions.",
        "Excellent defensive display showing good communication and positional awareness."
      ],
      improvements: [
        "Practice long-range passing to improve distribution from the back",
        "Work on heading technique for both defensive and attacking set pieces",
        "Focus on staying compact with your defensive partner during transitions"
      ]
    },
    RW: {
      positive: [
        "Your pace and attacking threat down the right flank created problems for the opposition.",
        "Good wing play with effective dribbling and crossing. Your attacking contribution was valuable.",
        "Strong performance on the wing with good ball-carrying and creative play."
      ],
      improvements: [
        "Practice crossing with both feet to become less predictable in the final third",
        "Work on tracking back to support your fullback during defensive phases",
        "Focus on cutting inside with your stronger foot to create shooting opportunities"
      ]
    },
    RB: {
      positive: [
        "Solid defensive performance with good positioning and tackling. Your work rate was commendable.",
        "Strong defensive display with effective overlapping runs to support attack when possible.",
        "Good balance between defensive duties and attacking support. Your consistency was key."
      ],
      improvements: [
        "Practice crossing from wide positions to better support attacking play",
        "Work on communication with center-backs during defensive transitions",
        "Focus on timing your forward runs to avoid leaving defensive gaps"
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
