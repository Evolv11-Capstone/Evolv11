// lineupAdapters.tsx
// ✅ Adapter functions to interact with backend endpoints related to lineups and lineup_players

import { getPostOptions, fetchHandler, getDeleteOptions } from '../utils/fetchingUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
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
  const response = await fetchHandler(
    `${API_BASE_URL}/lineups`,
    getPostOptions({ team_id, match_id, formation })
  );
  console.log('Created lineup response:', response);
  return response;
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
    `${API_BASE_URL}/lineups/players`,
    getPostOptions({ lineup_id, player_id, position })
  );
};

// Fetch full lineup and players by match ID
export const getFullLineupByMatch = async (matchId: number) => {
  return await fetchHandler(`${API_BASE_URL}/lineups/${matchId}/full`);
};

/**
 * Unassign a player from a lineup
 * @param lineup_id - ID of the lineup
 * @param player_id - ID of the player to remove from the lineup
 */
export const unassignPlayerFromLineup = async ({
  lineup_id,
  player_id,
  position
}: {
  lineup_id: number;
  player_id: number;
  position: string;
}) => {
  return await fetchHandler(
    `${API_BASE_URL}/lineups/players`,
    getDeleteOptions({ lineup_id, player_id, position })
  );
};