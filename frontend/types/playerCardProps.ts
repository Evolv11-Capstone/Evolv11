export interface PlayerCardProps {
  imageUrl: string;
  name: string;
  nationality: string;
  position: string;
  overallRating: number;
  stats: {
    shooting: number;
    passing: number;
    dribbling: number;
    defense: number;
    physical: number;
    coachGrade?: number;
  };
  onPositionChange?: (newPosition: string) => void; // Moved here
}