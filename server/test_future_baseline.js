// Test script to verify snapshot-based baseline calculation for a future match
const knex = require('./db/knex');

async function testFutureMatchBaseline() {
  try {
    console.log('🧪 Testing baseline calculation for a future match...');
    
    const playerId = 2;
    
    // Simulate a future match date (after match 1)
    const futureMatchDate = new Date('2025-07-01'); // After June 22, 2025
    
    console.log('📅 Testing baseline for future match date:', futureMatchDate.toISOString());
    
    // Find the most recent snapshot BEFORE this future match date
    const previousSnapshot = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .where('player_snapshots.match_id', '!=', null)
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*', 'matches.match_date')
      .first();

    if (previousSnapshot) {
      console.log('✅ Found previous snapshot to use as baseline:', {
        match_id: previousSnapshot.match_id,
        match_date: previousSnapshot.match_date,
        shooting: previousSnapshot.shooting,
        passing: previousSnapshot.passing,
        defense: previousSnapshot.defense,
        overall_rating: previousSnapshot.overall_rating
      });
      
      console.log('🎯 This snapshot would be used as the baseline for growth calculation');
    } else {
      console.log('⚠️ No previous snapshots found for future match');
    }
    
    // Show all available snapshots for context
    const allSnapshots = await knex('player_snapshots')
      .leftJoin('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .select('player_snapshots.*', 'matches.match_date')
      .orderBy(['matches.match_date']);
    
    console.log('\n📸 All available snapshots for player', playerId, ':');
    allSnapshots.forEach((snapshot, index) => {
      const isBaseline = snapshot.match_id === previousSnapshot?.match_id;
      console.log(`  ${index + 1}. Match ID: ${snapshot.match_id || 'NULL (initial)'}, Date: ${snapshot.match_date || 'N/A'} ${isBaseline ? '⭐ BASELINE' : ''}`);
      console.log(`     Stats: shooting=${snapshot.shooting}, overall=${snapshot.overall_rating}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing future match baseline:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

testFutureMatchBaseline();
