// Debug script to check date comparison
const knex = require('./db/knex');

async function debugDateComparison() {
  try {
    console.log('🔍 Debugging date comparison...');
    
    const playerId = 2;
    const futureMatchDate = new Date('2025-07-01');
    
    console.log('Future match date:', futureMatchDate.toISOString());
    
    // Check the actual match date from the database
    const match1 = await knex('matches').where({ id: 1 }).first();
    console.log('Match 1 date from DB:', match1.match_date);
    console.log('Match 1 date type:', typeof match1.match_date);
    
    // Direct comparison
    console.log('Is match date < future date?', new Date(match1.match_date) < futureMatchDate);
    
    // Test the query step by step
    console.log('\n🔍 Step-by-step query debug:');
    
    // Step 1: Get all snapshots with matches
    const allWithMatches = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .select('player_snapshots.match_id', 'matches.match_date')
      .orderBy('matches.match_date', 'desc');
    
    console.log('All snapshots with matches:', allWithMatches);
    
    // Step 2: Filter by date
    const beforeFutureDate = await knex('player_snapshots')
      .join('matches', 'player_snapshots.match_id', 'matches.id')
      .where('player_snapshots.player_id', playerId)
      .where('matches.match_date', '<', futureMatchDate.toISOString())
      .select('player_snapshots.match_id', 'matches.match_date')
      .orderBy('matches.match_date', 'desc');
    
    console.log('Snapshots before future date:', beforeFutureDate);
    
  } catch (error) {
    console.error('❌ Error debugging:', error);
  } finally {
    await knex.destroy();
    process.exit(0);
  }
}

debugDateComparison();
