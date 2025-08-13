// Input structure for registering a new user
export type NewUserInput = {
  name: string;                          // Full name of the user
  birthday: string;                      // Date of birth in ISO format (e.g., "1999-05-15")
  nationality: string;                  // ISO country name or code
  email: string;                         // Login email
  password: string;                      // Password (to be hashed on backend)
  role: 'player' | 'coach';              // Role selection from dropdown
  height: string;                        // Height as string (e.g., "6'2\"" or "188 cm") - Required for players
  preferred_position: string;            // Preferred football position (e.g., "ST", "CM", "GK") - Required for players
  image_url?: string;                    // Optional profile image URL (only for players)
};

// Type representing a fully registered user (as returned by backend)
export type User = {
  id: number;                            // Database user ID
  name: string;
  birthday: string;                      // Date of birth in ISO format (e.g., "1999-05-15")
  email: string;
  nationality: string;
  role: 'player' | 'coach';
  height: string;                        // Height as string (e.g., "6'2\"" or "188 cm")
  preferred_position: string;            // Preferred football position
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
  birthday?: string;                     // Date of birth in ISO format
  nationality?: string;
  height?: string;                       // Optional update for height
  preferred_position?: string;           // Optional update for preferred position
  image_url?: string;                    // Optional update for profile image
};
