import {
  basicFetchOptions,
  getPostOptions,
  getPatchOptions,
  fetchHandler,
} from '../utils/fetchingUtils';

// Load base API URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type Season = {
  id: number;
  team_id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateSeasonInput = {
  team_id: number;
  name: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
};

/**
 * Get all seasons for a specific team
 * Backend route: GET /api/seasons/team/:teamId
 */
export const getTeamSeasons = async (teamId: number) => {
  const url = `${API_BASE_URL}/seasons/team/${teamId}`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Create a new season
 * Backend route: POST /api/seasons
 */
export const createSeason = async (seasonData: CreateSeasonInput) => {
  const url = `${API_BASE_URL}/seasons`;
  const options = getPostOptions(seasonData);
  return await fetchHandler(url, options);
};

/**
 * Get season by ID
 * Backend route: GET /api/seasons/:id
 */
export const getSeasonById = async (seasonId: number) => {
  const url = `${API_BASE_URL}/seasons/${seasonId}`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Update season active status
 * Backend route: PATCH /api/seasons/:id/status
 */
export const updateSeasonStatus = async (seasonId: number, isActive: boolean) => {
  const url = `${API_BASE_URL}/seasons/${seasonId}/status`;
  const options = getPatchOptions({ is_active: isActive });
  return await fetchHandler(url, options);
};

/**
 * Delete a season
 * Backend route: DELETE /api/seasons/:id
 */
export const deleteSeason = async (seasonId: number) => {
  const url = `${API_BASE_URL}/seasons/${seasonId}`;
  const options = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
  };
  return await fetchHandler(url, options);
};
