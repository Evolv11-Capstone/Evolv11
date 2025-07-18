// Input structure for registering a new user
export type NewUserInput = {
  name: string;
  age: string;
  nationality: string;
  email: string;
  password: string;
  role: 'player' | 'coach'; // | 'scout'; // Uncomment if you add scout role
};

export type User = {
  id: number;
  name: string;
  age: string;
  email: string;
  nationality: string;
  role: 'player' | 'coach';
  teamIds: number[]; // or something like that
};

// Login form input structure
export type LoginInput = {
  email: string;
  password: string;
};


// Structure of a response from API
export type ApiResponse = {
  success?: boolean;
  message?: string;
  [key: string]: any;
};

// Input for updating user profile
export type UpdateUserInput = {
  name?: string;
  email?: string;
  age?: string;
  nationality?: string;
};
