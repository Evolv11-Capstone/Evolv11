export interface TeamPlayer {
  id: number;                     // Player ID (players.id)
  user_id?: number;               // Optional for clarity
  name: string;
  nationality?: string;
  role: string;
  team_id: number;
  image_url?: string;
  position?: string;
  overall_rating?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defense?: number;
  physical?: number;              // ✅ Replaces stamina
  coach_grade?: number;
  created_at?: string;
}

export interface ModerateStats {
  goals: number;
  assists: number;
  saves: number;
  tackles: number;
  interceptions: number;
  chances_created: number;
  minutes_played: number;
  coach_rating: number;
}

export interface UpdatePositionPayload {
  position: string;
}