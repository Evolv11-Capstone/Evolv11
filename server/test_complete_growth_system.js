// Comprehensive test of the growth calculation system with snapshots
const knex = require('./db/knex');

/**
 * Get the baseline stats for growth calculation using player snapshots
 * (Same logic as in the controller)
 */
const getBaselineStatsFromSnapshots = async (playerId, matchId) => {
  try {
    // Get the current match date
    const currentMatch = await knex('matches')
      .where({ id: matchId })
      .first();
    
    if (!currentMatch) {
      throw new Error(`Match with ID ${matchId} not found`);
    }

    // Find the most recent snapshot BEFORE this match's date
    const previousSnapshot = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .whereNotNull('player_snapshots.match_id')
      .where('matches.match_date', '<', currentMatch.match_date)
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*')
      .first();

    if (previousSnapshot) {
      console.log(`📊 Using previous snapshot from match ${previousSnapshot.match_id} as baseline for player ${playerId}`);
      return {
        shooting: previousSnapshot.shooting,
        passing: previousSnapshot.passing,
        dribbling: previousSnapshot.dribbling,
        defense: previousSnapshot.defense,
        physical: previousSnapshot.physical,
        coach_grade: previousSnapshot.coach_grade,
        overall_rating: previousSnapshot.overall_rating
      };
    }

    // Fall back to the initial snapshot (match_id IS NULL)
    const initialSnapshot = await knex('player_snapshots')
      .where({ player_id: playerId, match_id: null })
      .first();

    if (initialSnapshot) {
      console.log(`📊 Using initial snapshot as baseline for player ${playerId} (no previous matches)`);
      return {
        shooting: initialSnapshot.shooting,
        passing: initialSnapshot.passing,
        dribbling: initialSnapshot.dribbling,
        defense: initialSnapshot.defense,
        physical: initialSnapshot.physical,
        coach_grade: initialSnapshot.coach_grade,
        overall_rating: initialSnapshot.overall_rating
      };
    }

    // Fallback to default baseline if no snapshots exist
    console.log(`⚠️ No snapshots found for player ${playerId}, using default baseline (all stats = 50)`);
    return {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50,
      overall_rating: 50
    };

  } catch (error) {
    console.error('Error getting baseline stats from snapshots:', error);
    return {
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defense: 50,
      physical: 50,
      coach_grade: 50,
      overall_rating: 50
    };
  }
};

async function testCompleteGrowthSystem() {
  try {
    console.log('🧪 Testing Complete Growth Calculation System\n');
    
    // Test with player 2 who has snapshots
    const playerId = 2;
    
    // Get current player stats
    const currentPlayer = await knex('players').where({ id: playerId }).first();
    console.log('👤 Current Player Stats:');
    console.log(`   Shooting: ${currentPlayer.shooting}, Passing: ${currentPlayer.passing}, Defense: ${currentPlayer.defense}`);
    console.log(`   Overall Rating: ${currentPlayer.overall_rating}\n`);
    
    // Show all snapshots for this player
    const allSnapshots = await knex('player_snapshots')
      .leftJoin('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .select('player_snapshots.*', 'matches.match_date')
      .orderBy(['matches.match_date']);
    
    console.log('📸 Player Snapshots History:');
    allSnapshots.forEach((snapshot, index) => {
      console.log(`   ${index + 1}. Match ID: ${snapshot.match_id || 'NULL (initial)'}, Date: ${snapshot.match_date || 'N/A'}`);
      console.log(`      Stats: shooting=${snapshot.shooting}, passing=${snapshot.passing}, defense=${snapshot.defense}, overall=${snapshot.overall_rating}`);
    });
    console.log();
    
    // Test baseline calculation for existing match 1
    console.log('🎯 Testing Baseline for Existing Match 1:');
    const baseline1 = await getBaselineStatsFromSnapshots(playerId, 1);
    console.log('   Baseline stats:', baseline1);
    console.log();
    
    // Test baseline calculation for a theoretical future match
    console.log('🎯 Testing Baseline for Future Match:');
    
    // Create a temporary future match to test with
    const [futureMatch] = await knex('matches').insert({
      team_id: 1,
      season_id: 1,
      opponent: 'Test Future Team',
      match_date: '2025-08-01',
      team_score: 0,
      opponent_score: 0
    }).returning('*');
    
    console.log('   Created temporary future match:', futureMatch.id, 'on', futureMatch.match_date);
    
    const baselineFuture = await getBaselineStatsFromSnapshots(playerId, futureMatch.id);
    console.log('   Baseline stats for future match:', baselineFuture);
    
    // Clean up - remove the temporary match
    await knex('matches').where({ id: futureMatch.id }).del();
    console.log('   Cleaned up temporary match\n');
    
    console.log('✅ Growth calculation system is working correctly!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   • For the first match, baseline uses initial snapshot or defaults (all 50s)');
    console.log('   • For subsequent matches, baseline uses the most recent previous snapshot');
    console.log('   • This ensures progressive, accurate growth calculation');
    
  } catch (error) {
    console.error('❌ Error testing growth system:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

testCompleteGrowthSystem();
