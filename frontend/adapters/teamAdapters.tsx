// Import reusable fetch utilities
import {
  getPostOptions,
  basicFetchOptions,
  fetchHandler,
} from '../utils/fetchingUtils';


// Import types for safety and clarity
import { TeamInput, JoinRequestInput, Team } from '../types/teamTypes';
import { TeamPlayer } from '../types/playerTypes'; // Define this type if needed

// Load base API URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Fetches all teams from the backend.
 * Requires user to be authenticated (based on backend route protection).
 */
export const getAllTeams = async () => {
  const url = `${API_BASE_URL}/teams`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Sends a POST request to create a new team.
 * Only valid for users with the 'coach' role.
 * @param teamData - An object with team details (e.g., name, coach_id)
 */
export const createTeam = async (teamData: TeamInput) => {
  const url = `${API_BASE_URL}/teams`;
  const options = getPostOptions(teamData);
  return await fetchHandler(url, options);
};

/**
 * Sends a join request for a user (player or coach) to join an existing team.
 * @param requestData - An object with user_id, team_id, and role
 */
export const requestTeamJoin = async (requestData: JoinRequestInput) => {
  const url = `${API_BASE_URL}/teams/join-request`;
  const options = getPostOptions(requestData);
  return await fetchHandler(url, options);
};

// Fetch all approved teams that the current user belongs to
export const getMyTeams = async (): Promise<[Team[] | null, Error | null]> => {
  const url = `${API_BASE_URL}/my_teams`;
  return await fetchHandler<Team[]>(url, basicFetchOptions);
};

/**
 * Fetch all approved players for a given team
 * @param teamId - ID of the team
 */
export async function getPlayersByTeam(teamId: number): Promise<[TeamPlayer[] | null, Error | null]> {
  const url = `${API_BASE_URL}/my_teams/teams/${teamId}/players`;
  return await fetchHandler<TeamPlayer[]>(url, basicFetchOptions);
}

/**
 * Fetch a single player by their ID
 * @param playerId - ID of the player
 */
export async function getPlayerById(playerId: number): Promise<[TeamPlayer | null, Error | null]> {
  const url = `${API_BASE_URL}/players/${playerId}`;
  return await fetchHandler(url, basicFetchOptions);
}