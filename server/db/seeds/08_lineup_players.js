/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("lineup_players").del();

  // Position mappings that match TacticalBoard.tsx exactly
  const formationPositions = {
    "4-3-3": ["GK", "LB", "CB1", "CB2", "RB", "CM1", "CM2", "CM3", "LW", "ST", "RW"],
    "4-4-2": ["GK", "LB", "CB1", "CB2", "RB", "LM", "CM1", "CM2", "RM", "ST1", "ST2"]
  };

  // Map our 7 players to specific positions for each formation
  const playerAssignments = {
    "4-3-3": [
      { player_id: 1, position: "ST" },     // Player 1 -> ST (Striker)
      { player_id: 2, position: "CM1" },    // Player 2 -> CM1 (Central Mid 1)
      { player_id: 3, position: "CM2" },    // Player 3 -> CM2 (Central Mid 2)
      { player_id: 4, position: "CB1" },    // Player 4 -> CB1 (Center Back 1)
      { player_id: 5, position: "RW" },     // Player 5 -> RW (Right Wing)
      { player_id: 6, position: "RB" },     // Player 6 -> RB (Right Back)
      { player_id: 7, position: "CM3" },    // Player 7 -> CM3 (Central Mid 3)
    ],
    "4-4-2": [
      { player_id: 1, position: "ST1" },    // Player 1 -> ST1 (Striker 1)
      { player_id: 2, position: "CM1" },    // Player 2 -> CM1 (Central Mid 1)
      { player_id: 3, position: "CM2" },    // Player 3 -> CM2 (Central Mid 2)
      { player_id: 4, position: "CB1" },    // Player 4 -> CB1 (Center Back 1)
      { player_id: 5, position: "RM" },     // Player 5 -> RM (Right Mid)
      { player_id: 6, position: "RB" },     // Player 6 -> RB (Right Back)
      { player_id: 7, position: "LM" },     // Player 7 -> LM (Left Mid)
    ]
  };

  const lineupPlayers = [];

  // Get all lineups to determine their formations
  const lineups = await knex("lineups").select("id", "formation").orderBy("id");

  for (const lineup of lineups) {
    const formation = lineup.formation;
    const assignments = playerAssignments[formation];
    
    if (assignments) {
      // Add our 7 players with formation-specific positions
      assignments.forEach(assignment => {
        lineupPlayers.push({
          lineup_id: lineup.id,
          player_id: assignment.player_id,
          position: assignment.position,
        });
      });
    } else {
      // Fallback for unsupported formations - use 4-3-3 assignments
      playerAssignments["4-3-3"].forEach(assignment => {
        lineupPlayers.push({
          lineup_id: lineup.id,
          player_id: assignment.player_id,
          position: assignment.position,
        });
      });
    }
  }

  await knex("lineup_players").insert(lineupPlayers);
};
