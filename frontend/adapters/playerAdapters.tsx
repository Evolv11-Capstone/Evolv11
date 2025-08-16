import { basicFetchOptions, fetchHandler, getPatchOptions } from '../utils/fetchingUtils';
import { TeamPlayer } from '../types/playerTypes';
import { getPlayersByTeam } from './teamAdapters';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const fetchPlayerById = async (playerId: number): Promise<TeamPlayer> => {
  const [data, error] = await fetchHandler(`${API_BASE_URL}/players/full-fifa-card/${playerId}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (error) {
    throw error;
  }
  return data as TeamPlayer;
};

// Fetch moderate stats summary for a player
export const getPlayerModerateSummary = async (
  playerId: number
): Promise<[any | null, Error | null]> => {
  const url = `${API_BASE_URL}/players/${playerId}/moderate-summary`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Update a player's position (coach only)
 * @param playerId - the player's ID
 * @param newPosition - the new position to set
 */
// playerAdapters.tsx
export const updatePlayerPosition = async (
  playerId: number,
  newPosition: string
): Promise<[string | null, Error | null]> => {
  const url = `${API_BASE_URL}/players/${playerId}/position`;
  const body = { position: newPosition };
  const [data, error] = await fetchHandler<{ position: string }>(url, getPatchOptions(body));

  if (error) return [null, error];
  return [data?.position ?? null, null]; // <== log `data` here
};

/**
 * Get player information by user ID and team ID
 * This resolves the user_id to the actual player_id in the players table
 */
export const getPlayerByUserAndTeam = async (
  userId: number,
  teamId: number
): Promise<[TeamPlayer | null, Error | null]> => {
  try {
    const [players, error] = await getPlayersByTeam(teamId);

    if (error) {
      return [null, error];
    }
    
    if (!players || players.length === 0) {
      return [null, new Error('No players found for this team')];
    }

    console.log('Looking for user_id:', userId, 'in players:', players.map(p => ({ id: p.id, user_id: p.user_id, name: p.name })));
    
    // Find the player that matches the user_id
    const player = players.find(p => p.user_id === userId);
    
    if (!player) {
      return [null, new Error(`Player not found for user ${userId} in team ${teamId}. Available players: ${players.map(p => `${p.name}(user_id: ${p.user_id})`).join(', ')}`)];
    }
    
    console.log('Found player:', { id: player.id, user_id: player.user_id, name: player.name, position: player.position });
    return [player, null];
  } catch (err: any) {
    console.error('Error in getPlayerByUserAndTeam:', err);
    return [null, err];
  }
};