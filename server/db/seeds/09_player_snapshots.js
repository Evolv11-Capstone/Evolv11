/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  console.log("🔄 Starting player snapshots seed...");
  
  // Import the same calculation function used in the controllers
  const { calculateAttributeUpdates } = require('../../controllers/ModerateReviewControllers');
  
  // Clear existing snapshots
  await knex("player_snapshots").del();

  const playerSnapshots = [];
  
  // Reset all players to base stats of 50 to ensure clean seeding
  console.log("🔄 Resetting all players to base stats (50)...");
  await knex("players")
    .update({
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50,
      overall_rating: 50,
    });
  
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
  // Include match_date for accurate timestamping
  const matches = await knex("matches")
    .select("id", "match_date")
    .orderBy("match_date", "asc");
  
  console.log(`📊 Processing ${matches.length} matches chronologically...`);
  
  for (const match of matches) {
    const matchId = match.id;
    const matchDate = match.match_date;
    
    // Get moderate reviews for this match
    const matchReviews = await knex("moderate_reviews")
      .where("match_id", matchId)
      .select("*");
    
    // Enhanced logging for missing reviews
    if (matchReviews.length === 0) {
      console.log(`⚠️  No reviews found for match ${matchId} (${matchDate}), skipping...`);
      continue;
    }

    console.log(`📈 Processing ${matchReviews.length} player reviews for match ${matchId} (${matchDate})`);

    for (const review of matchReviews) {
      const playerId = review.player_id;
      const currentStats = playerStats[playerId];

      // Validate that we have current stats for this player
      if (!currentStats) {
        console.error(`❌ No current stats found for player ${playerId} in match ${matchId}`);
        continue;
      }

      // Apply growth formulas based on match performance using the same logic as the controllers
      const matchStats = {
        goals: review.goals || 0,
        assists: review.assists || 0,
        saves: review.saves || 0,
        tackles: review.tackles || 0,
        interceptions: review.interceptions || 0,
        chances_created: review.chances_created || 0,
        minutes_played: review.minutes_played || 0,
        coach_rating: review.coach_rating || 50
      };
      
      const newStats = calculateAttributeUpdates(currentStats, matchStats);
      
      // Update the local tracking
      playerStats[playerId] = newStats;

      // Create snapshot for this match with accurate match date
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
        created_at: matchDate, // Use actual match date for chronological accuracy
      });

      console.log(`   📊 Player ${playerId}: Overall ${currentStats.overall_rating} → ${newStats.overall_rating}`);
    }
  }

  console.log(`📊 Inserting ${playerSnapshots.length} player snapshots...`);
  await knex("player_snapshots").insert(playerSnapshots);

  // Update the players table with final stats
  console.log("🔄 Updating players table with final stats...");
  for (let playerId = 1; playerId <= 7; playerId++) {
    const finalStats = playerStats[playerId];
    if (finalStats) {
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
      console.log(`   ✅ Player ${playerId}: Final overall rating ${finalStats.overall_rating}`);
    } else {
      console.log(`   ⚠️  No stats found for player ${playerId}, keeping base stats`);
    }
  }

  console.log("✅ Player snapshots seed completed successfully!");
};
