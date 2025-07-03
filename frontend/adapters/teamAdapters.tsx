import { getPostOptions, basicFetchOptions, fetchHandler } from '../utils/fetchingUtils';

// Get base URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Fetch all teams
export const getAllTeams = async () => {
  const url = `${API_BASE_URL}/teams`;
  return await fetchHandler(url, basicFetchOptions);
};

// Create a new team (coach only)
export const createTeam = async (teamData: any) => {
  const url = `${API_BASE_URL}/teams`;
  const options = getPostOptions(teamData);
  return await fetchHandler(url, options);
};

// Request to join a team (player or coach)
export const requestTeamJoin = async (requestData: any) => {
  const url = `${API_BASE_URL}/teams/join-request`; // Ensure backend route matches this
  const options = getPostOptions(requestData);
  return await fetchHandler(url, options);
};
