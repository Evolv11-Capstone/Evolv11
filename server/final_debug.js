// Final debug to find the issue
const knex = require('./db/knex');

async function finalDebug() {
  try {
    const playerId = 2;
    const futureMatchDate = new Date('2025-07-01');
    
    console.log('🔍 Final debug - checking exact query...');
    
    // Test the exact query from the function
    const result = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .where('player_snapshots.match_id', '!=', null)
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*', 'matches.match_date')
      .first();
    
    console.log('Query result:', result);
    
    // Check if it's the != null condition
    const withoutNullCheck = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*', 'matches.match_date')
      .first();
    
    console.log('Without null check:', withoutNullCheck);
    
    // Check the raw SQL
    const query = knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .where('player_snapshots.match_id', '!=', null)
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .orderBy('matches.match_date', 'desc')
      .select('player_snapshots.*', 'matches.match_date');
    
    console.log('Raw SQL:', query.toString());
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

finalDebug();
