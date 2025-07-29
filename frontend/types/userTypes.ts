// Input structure for registering a new user
export type NewUserInput = {
  name: string;                          // Full name of the user
  age: string;                           // Age as string (e.g., "25")
  nationality: string;                  // ISO country name or code
  email: string;                         // Login email
  password: string;                      // Password (to be hashed on backend)
  role: 'player' | 'coach';              // Role selection from dropdown
  image_url?: string;                    // Optional profile image URL (only for players)
};

// Type representing a fully registered user (as returned by backend)
export type User = {
  id: number;                            // Database user ID
  name: string;
  age: string;
  email: string;
  nationality: string;
  role: 'player' | 'coach';
  image_url?: string;                    // Profile image from S3 (nullable for coaches)
  teamIds: number[];
  created_at: string;                     // Account creation date
};

// Input shape for login form
export type LoginInput = {
  email: string;
  password: string;
};

// Shape of a typical API response from backend
export type ApiResponse = {
  success?: boolean;                     // Indicates success of the request
  message?: string;                      // Error or success message
  [key: string]: any;                    // Allows additional dynamic keys like user or token
};

// Optional input when updating user info
export type UpdateUserInput = {
  name?: string;
  email?: string;
  age?: string;
  nationality?: string;
  image_url?: string;                    // Optional update for profile image
};
