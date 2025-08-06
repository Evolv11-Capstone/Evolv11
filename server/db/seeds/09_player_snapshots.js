/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("player_snapshots").del();

  const playerSnapshots = [];
  
  // Initialize each player with base stats of 50
  const playerStats = {};
  for (let playerId = 1; playerId <= 7; playerId++) {
    playerStats[playerId] = {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50,
      overall_rating: 50,
    };
  }

  // Process matches chronologically to build progressive growth
  const matches = await knex("matches").select("id").orderBy("id");
  
  for (const match of matches) {
    const matchId = match.id;
    
    // Get moderate reviews for this match
    const matchReviews = await knex("moderate_reviews")
      .where("match_id", matchId)
      .select("*");
    
    // Skip if no reviews found for this match
    if (matchReviews.length === 0) {
      console.log(`No reviews found for match ${matchId}, skipping...`);
      continue;
    }

    for (const review of matchReviews) {
      const playerId = review.player_id;
      const currentStats = playerStats[playerId];

      // Apply growth formulas based on match performance
      const newStats = calculateGrowth(currentStats, review);
      
      // Update the local tracking
      playerStats[playerId] = newStats;

      // Create snapshot for this match
      playerSnapshots.push({
        player_id: playerId,
        match_id: matchId,
        shooting: newStats.shooting,
        passing: newStats.passing,
        dribbling: newStats.dribbling,
        defense: newStats.defense,
        physical: newStats.physical,
        coach_grade: newStats.coach_grade,
        overall_rating: newStats.overall_rating,
        created_at: new Date().toISOString(),
      });
    }
  }

  await knex("player_snapshots").insert(playerSnapshots);

  // Update the players table with final stats
  for (let playerId = 1; playerId <= 7; playerId++) {
    const finalStats = playerStats[playerId];
    await knex("players")
      .where("id", playerId)
      .update({
        shooting: finalStats.shooting,
        passing: finalStats.passing,
        dribbling: finalStats.dribbling,
        defense: finalStats.defense,
        physical: finalStats.physical,
        coach_grade: finalStats.coach_grade,
        overall_rating: finalStats.overall_rating,
      });
  }
};

function calculateGrowth(currentStats, matchReview) {
  // Extract match performance data
  const { goals, assists, tackles, interceptions, chances_created, minutes_played, coach_rating } = matchReview;

  // Apply growth formulas
  let newShooting = currentStats.shooting + (goals * 1.5) + (chances_created * 0.5);
  let newPassing = currentStats.passing + (assists * 1.2) + (chances_created * 1.0);
  let newDefense = currentStats.defense + (tackles * 1.5) + (interceptions * 1.5);
  let newPhysical = currentStats.physical + (minutes_played / 10) * 0.5;
  
  // Dribbling grows based on overall performance and coach rating
  let newDribbling = currentStats.dribbling + (coach_rating - 60) * 0.1; // Base 60, grows with better ratings
  
  // Coach grade is influenced by the coach rating from the match
  let newCoachGrade = (currentStats.coach_grade + coach_rating) / 2;

  // Clamp all values between 0 and 100
  newShooting = Math.max(0, Math.min(100, Math.round(newShooting)));
  newPassing = Math.max(0, Math.min(100, Math.round(newPassing)));
  newDribbling = Math.max(0, Math.min(100, Math.round(newDribbling)));
  newDefense = Math.max(0, Math.min(100, Math.round(newDefense)));
  newPhysical = Math.max(0, Math.min(100, Math.round(newPhysical)));
  newCoachGrade = Math.max(0, Math.min(100, Math.round(newCoachGrade)));

  // Calculate overall rating as average of all attributes
  const newOverall = Math.round(
    (newShooting + newPassing + newDribbling + newDefense + newPhysical) / 5
  );

  return {
    shooting: newShooting,
    passing: newPassing,
    dribbling: newDribbling,
    defense: newDefense,
    physical: newPhysical,
    coach_grade: newCoachGrade,
    overall_rating: newOverall,
  };
}
