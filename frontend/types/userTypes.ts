// types/userTypes.ts

// Define the allowed roles for users
export type UserRole = 'coach' | 'player' | 'scout';

// Define the shape of user input data (used in registration forms, etc.)
export interface NewUserInput {
  name: string;
  age: string; // Stored as string to match DB schema
  nationality: string; // Country name
  email: string;
  password: string;
  role: UserRole;
}

// Define the shape of a full user object (e.g. returned from the database)
export interface User {
  id: number;
  name: string;
  age: string;
  nationality: string;
  email: string;
  role: UserRole;
  team_id?: number | null; // Optional, since players or coaches might not be in a team yet
  created_at?: string;
  updated_at?: string;
}

// Define a generic API response format (used across adapter functions)
export interface ApiResponse {
  success: boolean;
  message?: string;
}
