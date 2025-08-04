// Test the corrected query
const knex = require('./db/knex');

async function testCorrectedQuery() {
  try {
    const playerId = 2;
    const futureMatchDate = new Date('2025-07-01');
    
    console.log('🔧 Testing corrected query with whereNotNull...');
    
    const result = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .whereNotNull('player_snapshots.match_id')
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*', 'matches.match_date')
      .first();
    
    console.log('✅ Corrected query result:', result);
    
    if (result) {
      console.log('🎯 This snapshot would be used as baseline for future matches');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

testCorrectedQuery();
