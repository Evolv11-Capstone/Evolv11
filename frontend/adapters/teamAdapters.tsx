import {
  getPostOptions,
  basicFetchOptions,
  fetchHandler,
} from '../utils/fetchingUtils';

import { TeamInput, JoinRequestInput, Team } from '../types/teamTypes';
import { TeamPlayer } from '../types/playerTypes';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Fetch all teams (visible to authenticated user)
 */
export const getAllTeams = async (): Promise<[Team[] | null, Error | null]> => {
  const url = `${API_BASE_URL}/teams`;
  return await fetchHandler<Team[]>(url, basicFetchOptions);
};

/**
 * Create a new team (coach-only)
 */
export const createTeam = async (teamData: TeamInput): Promise<[Team | null, Error | null]> => {
  const url = `${API_BASE_URL}/teams`;
  const options = getPostOptions(teamData);
  return await fetchHandler<Team>(url, options);
};

/**
 * Request to join a team (coach or player)
 */
export const requestTeamJoin = async (
  requestData: JoinRequestInput
): Promise<[any | null, Error | null]> => {
  const url = `${API_BASE_URL}/teams/join-request`;
  const options = getPostOptions(requestData);
  return await fetchHandler<any>(url, options);
};

/**
 * Get teams that the current user is approved in
 */
export const getMyTeams = async (): Promise<[Team[] | null, Error | null]> => {
  const url = `${API_BASE_URL}/my_teams`;
  return await fetchHandler<Team[]>(url, basicFetchOptions);
};

/**
 * ✅ Get all approved players for a given team (FIFA card ready)
 */
export const getPlayersByTeam = async (
  teamId: number
): Promise<[TeamPlayer[] | null, Error | null]> => {
  const url = `${API_BASE_URL}/teams/${teamId}/players`; // ✅ new backend route
  return await fetchHandler<TeamPlayer[]>(url, basicFetchOptions);
};

/**
 * ✅ Get full player details by players.id
 */
export const getPlayerById = async (
  playerId: number
): Promise<[TeamPlayer | null, Error | null]> => {
  const url = `${API_BASE_URL}/players/${playerId}`;
  return await fetchHandler<TeamPlayer>(url, basicFetchOptions);
};

/**
 * Get a team by ID
 */
export const getTeamById = async (
  teamId: number
): Promise<[Team | null, Error | null]> => {
  const url = `${API_BASE_URL}/teams/${teamId}`;
  return await fetchHandler<Team>(url, basicFetchOptions);
};
