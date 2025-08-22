/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("matches").del();

  // Get the actual season ID from the database
  const season = await knex("seasons").select("id").first();
  if (!season) {
    throw new Error("No season found. Please run the seasons seed first.");
  }
  const seasonId = season.id;

  const opponents = [
    "Arsenal", "Chelsea", "Manchester City", "Manchester United",
    "Tottenham", "Newcastle", "Aston Villa", "Brighton", "West Ham",
    "Wolves", "Fulham", "Crystal Palace", "Brentford", "Bournemouth",
    "Everton", "Nottingham Forest", "Burnley", "Luton Town", "Sheffield United"
  ];

  const matches = [];
  const startDate = new Date("2024-08-01");
  const endDate = new Date("2025-07-28");
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 1; i <= 55; i++) {
    const matchDay = Math.floor((i - 1) * (totalDays / 54)); // Spread 55 matches over the season
    const matchDate = new Date(startDate.getTime() + matchDay * 24 * 60 * 60 * 1000);
    const opponentIndex = Math.floor(Math.random() * opponents.length);
    
    // Generate realistic scoreline with 75% win rate
    const matchResult = generateMatchResult();
    
    matches.push({
      team_id: 1,
      season_id: seasonId, // Use the actual season ID from database
      opponent: opponents[opponentIndex],
      match_date: matchDate.toISOString().split('T')[0],
      team_score: matchResult.teamScore,
      opponent_score: matchResult.opponentScore,
    });
  }

  await knex("matches").insert(matches);
  
  // Reset the auto-increment sequence to prevent future conflicts
  await knex.raw(`SELECT setval('matches_id_seq', (SELECT MAX(id) FROM matches));`);
};

function generateMatchResult() {
  const random = Math.random();
  let teamScore, opponentScore;

  if (random <= 0.75) {
    // 75% chance of win
    teamScore = Math.floor(Math.random() * 4) + 3; // 3–6 goals
    opponentScore = Math.floor(Math.random() * 3); // 0–2 goals
  } else if (random <= 0.90) {
    // 15% chance of draw
    const score = Math.floor(Math.random() * 3) + 2; // 2–4 goals each
    teamScore = score;
    opponentScore = score;
  } else {
    // 10% chance of loss
    opponentScore = Math.floor(Math.random() * 4) + 3; // 3–6 goals
    teamScore = Math.floor(Math.random() * 3); // 0–2 goals
  }

  return { teamScore, opponentScore };
}
