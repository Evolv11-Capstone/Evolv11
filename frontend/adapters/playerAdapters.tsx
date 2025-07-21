import { basicFetchOptions, fetchHandler, getPatchOptions } from '../utils/fetchingUtils';
import { TeamPlayer } from '../types/playerTypes';

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