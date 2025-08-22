export type Match = {
  id: number;
  team_id: number;
  season_id?: number; // Optional for backward compatibility
  opponent: string;
  match_date: string;
  team_score?: number;
  opponent_score?: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateMatchInput = {
  team_id: number;
  season_id: number;
  opponent: string;
  team_score?: number;
  opponent_score?: number;
  match_date: string; // YYYY-MM-DD format
};

export type CreateMatchLegacyInput = {
  team_id: number;
  opponent: string;
  team_score?: number;
  opponent_score?: number;
  match_date: string; // YYYY-MM-DD format
};