// Test script to verify PlayerSnapshot functionality
const PlayerSnapshot = require('./models/PlayerSnapshot');
const knex = require('./db/knex');

async function testPlayerSnapshot() {
  try {
    console.log('🧪 Testing PlayerSnapshot functionality...');
    
    // Test with player ID 3 (the most recently created player)
    const playerId = 3;
    
    console.log(`Creating initial snapshot for player ${playerId}...`);
    const snapshot = await PlayerSnapshot.createInitialSnapshot(playerId);
    
    console.log('✅ Initial snapshot created successfully:', snapshot);
    
    // Get all snapshots for this player
    console.log(`Getting all snapshots for player ${playerId}...`);
    const allSnapshots = await PlayerSnapshot.getPlayerSnapshots(playerId);
    
    console.log('✅ Player snapshots:', allSnapshots);
    
  } catch (error) {
    console.error('❌ Error testing PlayerSnapshot:', error);
  } finally {
    // Close database connection
    await knex.destroy();
    process.exit(0);
  }
}

testPlayerSnapshot();
