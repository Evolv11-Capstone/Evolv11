// adapters/matchAdapters.tsx

import { basicFetchOptions, fetchHandler, getPostOptions } from '../utils/fetchingUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// Create a new match
export const createMatch = async (matchData: {
  team_id: number;
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

// Get all matches for a given team
export const getMatchesForTeam = async (teamId: number) => {
  const response = await fetchHandler(`${API_BASE_URL}/matches?team_id=${teamId}`, basicFetchOptions);
  return response;
};


// Fetch a single match by ID
export const getMatchById = async (matchId: number) => {
  return await fetchHandler(`${API_BASE_URL}/matches/${matchId}`, basicFetchOptions);
};