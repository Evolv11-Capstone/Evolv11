// Represents input data when creating a new team
export type TeamInput = {
  name: string;
  coach_id: number;
};

// Represents input data for joining a team
export type JoinRequestInput = {
  user_id: number;
  team_id: number;
  role: 'player' | 'coach'; // or string if role isn't strictly typed
};

export interface Team {
  id: number;
  name: string;
  def_rating?: number;
  mid_rating?: number;
  att_rating?: number;
  team_rating?: number;
  created_at?: string;
  updated_at?: string;
}