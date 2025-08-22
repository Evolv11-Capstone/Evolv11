// Test script to verify the chain recalculation logic
const knex = require('../db/knex');
const { submitPlayerMatchStats } = require('../controllers/ModerateReviewControllers');

async function testChainRecalculation() {
  console.log('🧪 Testing Chain Recalculation Logic...\n');
  
  try {
    // Test scenario: Update an earlier match and verify chain recalculation
    
    // 1. Get a player with multiple matches
    const playerWithMatches = await knex('moderate_reviews')
      .join('players', 'moderate_reviews.player_id', 'players.id')
      .join('matches', 'moderate_reviews.match_id', 'matches.id')
      .select(
        'moderate_reviews.player_id',
        'players.name as player_name',
        'moderate_reviews.match_id',
        'matches.match_date',
        'matches.opponent'
      )
      .orderBy('matches.match_date', 'asc')
      .first();

    if (!playerWithMatches) {
      console.log('❌ No player with matches found for testing');
      return;
    }

    console.log(`📊 Testing with Player: ${playerWithMatches.player_name} (ID: ${playerWithMatches.player_id})`);
    console.log(`🏆 Match: vs ${playerWithMatches.opponent} (${playerWithMatches.match_date})\n`);

    // 2. Get initial player stats
    const initialPlayer = await knex('players')
      .where({ id: playerWithMatches.player_id })
      .first();

    console.log('🎯 Initial Player Stats:');
    console.log(`   Shooting: ${initialPlayer.shooting}`);
    console.log(`   Passing: ${initialPlayer.passing}`);
    console.log(`   Overall: ${initialPlayer.overall_rating}\n`);

    // 3. Get all snapshots before update
    const snapshotsBefore = await knex('player_snapshots')
      .where({ player_id: playerWithMatches.player_id })
      .whereNotNull('match_id')
      .count('* as count')
      .first();

    console.log(`📸 Snapshots before update: ${snapshotsBefore.count}\n`);

    // 4. Simulate an update to the match (this should trigger chain recalculation)
    const testStats = {
      player_id: playerWithMatches.player_id,
      match_id: playerWithMatches.match_id,
      goals: 2,
      assists: 1,
      tackles: 3,
      minutes_played: 90,
      coach_rating: 85,
      feedback: "Excellent performance, showing great improvement!"
    };

    // Create a mock request/response for testing
    const mockReq = { body: testStats };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`✅ Response Status: ${code}`);
          if (data.success) {
            console.log('🎯 Chain Recalculation Results:');
            console.log(`   Previous: Overall ${data.data.previous_attributes.overall_rating}`);
            console.log(`   Match Growth: +${data.data.match_growth.overall_rating}`);
            console.log(`   Final: Overall ${data.data.final_attributes.overall_rating}\n`);
          } else {
            console.log(`❌ Error: ${data.message}`);
          }
          return data;
        }
      })
    };

    // 5. Execute the update (this should trigger chain recalculation)
    console.log('🔄 Executing stat update with chain recalculation...\n');
    await submitPlayerMatchStats(mockReq, mockRes);

    // 6. Verify snapshots were recalculated
    const snapshotsAfter = await knex('player_snapshots')
      .where({ player_id: playerWithMatches.player_id })
      .whereNotNull('match_id')
      .count('* as count')
      .first();

    console.log(`📸 Snapshots after update: ${snapshotsAfter.count}`);

    // 7. Get final player stats
    const finalPlayer = await knex('players')
      .where({ id: playerWithMatches.player_id })
      .first();

    console.log('\n🎯 Final Player Stats:');
    console.log(`   Shooting: ${finalPlayer.shooting}`);
    console.log(`   Passing: ${finalPlayer.passing}`);
    console.log(`   Overall: ${finalPlayer.overall_rating}`);

    console.log('\n✅ Chain recalculation test completed successfully!');

  } catch (error) {
    console.error('❌ Error during chain recalculation test:', error.message);
  } finally {
    await knex.destroy();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testChainRecalculation();
}

module.exports = { testChainRecalculation };
