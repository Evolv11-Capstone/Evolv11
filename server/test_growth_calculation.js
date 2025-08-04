// Test script to verify the growth calculation logic with snapshots
const knex = require('./db/knex');

async function testGrowthCalculation() {
  try {
    console.log('🧪 Testing growth calculation with snapshots...');
    
    // Get a player who has snapshots
    const player = await knex('players').where({ id: 2 }).first();
    if (!player) {
      console.log('❌ Player not found');
      return;
    }
    
    console.log('📋 Current player stats:', {
      shooting: player.shooting,
      passing: player.passing,
      dribbling: player.dribbling,
      defense: player.defense,
      physical: player.physical,
      coach_grade: player.coach_grade,
      overall_rating: player.overall_rating
    });
    
    // Get all snapshots for this player
    const snapshots = await knex('player_snapshots')
      .leftJoin('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', player.id)
      .select('player_snapshots.*', 'matches.match_date')
      .orderBy('matches.match_date', 'asc');
    
    console.log('📸 Player snapshots:');
    snapshots.forEach((snapshot, index) => {
      console.log(`  ${index + 1}. Match ID: ${snapshot.match_id || 'NULL (initial)'}, Date: ${snapshot.match_date || 'N/A'}`);
      console.log(`     Stats: shooting=${snapshot.shooting}, passing=${snapshot.passing}, defense=${snapshot.defense}, overall=${snapshot.overall_rating}`);
    });
    
    // Simulate getting baseline for match 1
    const match1 = await knex('matches').where({ id: 1 }).first();
    console.log('\n🎯 Testing baseline for match 1 (date:', match1?.match_date, ')');
    
    // Find most recent snapshot before match 1
    const baselineSnapshot = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', player.id)
      .where('player_snapshots.match_id', '!=', null)
      .where('matches.match_date', '<', match1.match_date)
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*')
      .first();
    
    if (baselineSnapshot) {
      console.log('✅ Found previous snapshot:', {
        match_id: baselineSnapshot.match_id,
        shooting: baselineSnapshot.shooting,
        passing: baselineSnapshot.passing,
        overall_rating: baselineSnapshot.overall_rating
      });
    } else {
      // Check for initial snapshot
      const initialSnapshot = await knex('player_snapshots')
        .where({ player_id: player.id, match_id: null })
        .first();
      
      if (initialSnapshot) {
        console.log('✅ Using initial snapshot (no previous matches):', {
          shooting: initialSnapshot.shooting,
          passing: initialSnapshot.passing,
          overall_rating: initialSnapshot.overall_rating
        });
      } else {
        console.log('⚠️ No snapshots found, would use default baseline (all 50s)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing growth calculation:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

testGrowthCalculation();
