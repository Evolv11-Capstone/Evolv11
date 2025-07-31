// adapters/matchAdapters.tsx

import { basicFetchOptions, fetchHandler, getPostOptions, getPatchOptions, deleteOptions } from '../utils/fetchingUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Create a new match
export const createMatch = async (matchData: {
  team_id: number;
  season_id: number;
  opponent: string;
  team_score: number;
  opponent_score: number;
  match_date: string;
}) => {
  return await fetchHandler(
    `${API_BASE_URL}/matches`,
    getPostOptions(matchData)
  );
};

// Create a match without season (legacy support)
export const createMatchLegacy = async (matchData: {
  team_id: number;
  opponent: string;
  team_score: number;
  opponent_score: number;
  match_date: string;
}) => {
  return await fetchHandler(
    `${API_BASE_URL}/matches/legacy`,
    getPostOptions(matchData)
  );
};

// Get all matches for a given team
export const getMatchesForTeam = async (teamId: number) => {
  const response = await fetchHandler(`${API_BASE_URL}/matches?team_id=${teamId}`, basicFetchOptions);
  return response;
};

// Fetch a single match by ID
export const getMatchById = async (matchId: number) => {
  return await fetchHandler(`${API_BASE_URL}/matches/${matchId}`, basicFetchOptions);
};

// Update match details
export const updateMatch = async (matchId: number, matchData: {
  opponent: string;
  team_score: number;
  opponent_score: number;
  match_date: string;
}) => {
  return await fetchHandler(
    `${API_BASE_URL}/matches/${matchId}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    }
  );
};

// Delete a match and all related data
export const deleteMatch = async (matchId: number) => {
  return await fetchHandler(
    `${API_BASE_URL}/matches/${matchId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  );
};