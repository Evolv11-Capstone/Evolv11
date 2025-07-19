// types/playerTypes.ts

export interface TeamPlayer {
  id: number;                     // User/player ID
  name: string;                   // Full name
  age?: number;                   // Optional age
  nationality?: string;           // Optional nationality
  role: string;                   // 'player', 'coach', etc.
  team_id: number;                // Team association
  image_url?: string;             // ✅ Optional image URL (from S3)
  position?: string;             // Optional position for tactical display
  overall_rating?: number;       // Optional player stat
  shooting?: number;             // Optional attribute
  passing?: number;
  dribbling?: number;
  defense?: number;
  stamina?: number;
}