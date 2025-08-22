// adapters/teamRequestAdapters.tsx

import { ApiResponse } from '../types/userTypes'; // Reuse common API response type

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ------------------------------
// Player Team Request Adapters
// ------------------------------

export async function createPlayerTeamRequest(user_id: number, team_id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/player_team_requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id, team_id }),
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}

// Approve a player team request
export async function approvePlayerTeamRequest(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/player_team_requests/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include',
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}

// Rejects a player team request
// This is used by coaches to reject player requests
export async function rejectPlayerTeamRequest(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/player_team_requests/${id}/reject`, {
      method: 'PATCH',
      credentials: 'include',
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}

// Only returns player requests with status 'pending'
export async function listPlayerTeamRequests(): Promise<any[]> {
  try {
    const res = await fetch(`${BASE_URL}/player_team_requests`, {
      credentials: 'include',
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.filter((req: any) => req.status === 'pending'); // Filter pending only
  } catch (err) {
    return [];
  }
}

// ------------------------------
// Coach Team Request Adapters
// ------------------------------

// Creates a new coach team request
// This is used by coaches to request to join a team as a coach
export async function createCoachTeamRequest(user_id: number, team_id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/coach_team_requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id, team_id }),
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}

// Approve a coach team request
// This is used by coaches to approve other coach requests
export async function approveCoachTeamRequest(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/coach_team_requests/${id}/approve`, {
      method: 'PATCH',
      credentials: 'include',
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}

// Rejects a coach team request
// This is used by coaches to reject other coach requests
export async function rejectCoachTeamRequest(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${BASE_URL}/coach_team_requests/${id}/reject`, {
      method: 'PATCH',
      credentials: 'include',
    });

    const data = await res.json();
    return { success: res.ok, user: null, message: data.message || null };
  } catch (err) {
    return { success: false, user: null, message: 'Network error' };
  }
}


// Only returns coach requests with status 'pending'
export async function listCoachTeamRequests(): Promise<any[]> {
  try {
    const res = await fetch(`${BASE_URL}/coach_team_requests`, {
      credentials: 'include',
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.filter((req: any) => req.status === 'pending'); // Filter pending only
  } catch (err) {
    return [];
  }
}

// ------------------------------
// Utility: Fetch Requests Based on Role & Team
// ------------------------------

/**
 * Fetches the join requests for a given team and user role.
 * Used by Dashboard to display pending join requests.
 *
 * @param teamId - ID of the currently selected team
 * @param role - 'coach' or 'player'
 * @returns Tuple of [data, error]
 */
export async function fetchTeamRequests(
  teamId: number,
  role: 'coach' | 'player'
): Promise<[any[] | null, Error | null]> {
  try {
    let requests = [];

    if (role === 'coach') {
      requests = await listCoachTeamRequests(); // All coach requests
    } else if (role === 'player') {
      requests = await listPlayerTeamRequests(); // All player requests
    }

    // Filter by active team
    const filtered = requests.filter((req) => req.team_id === teamId);
    return [filtered, null];
  } catch (err) {
    return [null, err as Error];
  }
}
