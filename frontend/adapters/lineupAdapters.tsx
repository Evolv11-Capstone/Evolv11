// lineupAdapters.tsx
// ✅ Adapter functions to interact with backend endpoints related to lineups and lineup_players

import { getPostOptions, fetchHandler } from '../utils/fetchingUtils';

// Create a new lineup (called when formation is selected)
export const createLineup = async ({
  team_id,
  match_id,
  formation,
}: {
  team_id: number;
  match_id: number;
  formation: string;
}) => {
  return await fetchHandler(
    '/api/lineups',
    getPostOptions({ team_id, match_id, formation })
  );
};

// Add a player to a specific lineup slot (position)
export const addPlayerToLineup = async ({
  lineup_id,
  player_id,
  position,
}: {
  lineup_id: number;
  player_id: number;
  position: string;
}) => {
  return await fetchHandler(
    '/api/lineup_players',
    getPostOptions({ lineup_id, player_id, position })
  );
};
