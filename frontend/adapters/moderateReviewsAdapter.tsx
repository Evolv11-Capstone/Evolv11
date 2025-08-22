// adapters/moderateReviewsAdapter.tsx
import {
  getPostOptions,
  fetchHandler,
  basicFetchOptions,
} from '../utils/fetchingUtils';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type PlayerMatchStats = {
  goals: number;
  assists: number;
  saves: number;
  tackles: number;
  interceptions: number;
  chances_created: number;
  minutes_played: number;
  coach_rating: number;
  // Goalkeeper-specific stats
  successful_goalie_kicks?: number;
  failed_goalie_kicks?: number;
  successful_goalie_throws?: number;
  failed_goalie_throws?: number;
  feedback?: string;
  ai_suggestions?: string;
  reflection?: string;
  // AI Grade fields
  ai_rating?: number;
  ai_reasoning?: string;
};

export type PlayerStatsSubmission = PlayerMatchStats & {
  player_id: number;
  match_id: number;
  feedback?: string;
};

export type PlayerGrowthResponse = {
  success: boolean;
  data: {
    current_stats: {
      id: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
    };
    growth_history: Array<{
      id: number;
      player_id: number;
      match_id: number;
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
      match_date: string;
      opponent: string;
      created_at: string;
    }>;
    total_matches: number;
  };
};

export type PlayerGrowthData = {
  current_stats: {
    id: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
    coach_grade: number;
    overall_rating: number;
  };
  growth_history: Array<{
    id: number;
    player_id: number;
    match_id: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
    coach_grade: number;
    overall_rating: number;
    match_date: string;
    opponent: string;
    created_at: string;
  }>;
  total_matches: number;
};

export type StatsSubmissionResponse = {
  success: boolean;
  message: string;
  data: {
    review_id: number;
    player_id: number;
    match_id: number;
    previous_attributes: {
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
    };
    match_attributes: {
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
    };
    final_attributes: {
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
    };
    match_growth: {
      shooting: number;
      passing: number;
      dribbling: number;
      defense: number;
      physical: number;
      coach_grade: number;
      overall_rating: number;
    };
    feedback: string | null;
    ai_suggestions: string | null;
  };
};

/**
 * Submit or update player match stats
 * Creates moderate_review, updates player attributes, and creates snapshot
 */
export const submitPlayerMatchStats = async (
  statsData: PlayerStatsSubmission
): Promise<[StatsSubmissionResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/reviews/moderate`;
  const options = getPostOptions(statsData);
  return await fetchHandler<StatsSubmissionResponse>(url, options);
};

/**
 * Get player's growth history and current stats
 */
export const getPlayerGrowthHistory = async (
  playerId: number
): Promise<[PlayerGrowthResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/reviews/player/${playerId}/growth`;
  return await fetchHandler<PlayerGrowthResponse>(url, basicFetchOptions);
};

/**
 * Get existing match stats for a player
 */
export const getPlayerMatchStats = async (
  playerId: number,
  matchId: number
): Promise<[PlayerMatchStats | null, Error | null]> => {
  const url = `${API_BASE_URL}/reviews/player/${playerId}/match/${matchId}`;
  const [response, error] = await fetchHandler<{ success: boolean; data: PlayerMatchStats }>(url, basicFetchOptions);
  
  if (error) {
    return [null, error];
  }
  
  if (response?.success && response?.data) {
    return [response.data, null];
  }
  
  return [null, new Error('No stats found for this player and match')];
};

export type MatchReview = PlayerMatchStats & {
  id: number;
  player_id: number;
  match_id: number;
  player_name: string;
  player_image?: string;
  created_at: string;
  updated_at: string;
};

export const getMatchReviews = async (
  matchId: number
): Promise<[MatchReview[] | null, Error | null]> => {
  const url = `${API_BASE_URL}/reviews/match/${matchId}`;
  const [response, error] = await fetchHandler<{ success: boolean; data: MatchReview[]; count: number }>(url, basicFetchOptions);
  
  if (error) {
    return [null, error];
  }
  
  if (response?.success && response?.data) {
    return [response.data, null];
  }
  
  return [[], null];
};

/**
 * Update player's reflection for a specific match
 */
export const updatePlayerReflection = async (
  playerId: number,
  matchId: number,
  reflection: string
): Promise<[boolean, Error | null]> => {
  const url = `${API_BASE_URL}/reviews/player/${playerId}/match/${matchId}/reflection`;
  const body = { reflection };
  const options = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(body),
  };

  const [response, error] = await fetchHandler<{ success: boolean; message: string }>(url, options);
  
  if (error) {
    return [false, error];
  }
  
  if (response?.success) {
    return [true, null];
  }
  
  return [false, new Error(response?.message || 'Failed to update reflection')];
};
