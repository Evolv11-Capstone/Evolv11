// Season-related types for the frontend

export type Season = {
  id: number;
  team_id: number;
  name: string;
  start_date: string; // ISO date string (YYYY-MM-DD)
  end_date: string;   // ISO date string (YYYY-MM-DD)
  is_active: boolean;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

export type CreateSeasonInput = {
  team_id: number;
  name: string;
  start_date: string; // YYYY-MM-DD format
  end_date: string;   // YYYY-MM-DD format
};

export type UpdateSeasonStatusInput = {
  is_active: boolean;
};

export type SeasonApiResponse = {
  success: boolean;
  data?: Season | Season[];
  message?: string;
  error?: string;
  count?: number;
};
