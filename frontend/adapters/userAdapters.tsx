

import { getPostOptions, fetchHandler } from '../utils/fetchingUtils';

// Define the TypeScript type for the new user
export type NewUserPayload = {
  name: string;
  age: string;
  nationality: string;
  email: string;
  password: string;
  role: string;
};

// Function to send a POST request to create a new user
export const createNewUser = async (userData: NewUserPayload) => {
  const url = `/api/users`; // Ensure this env var is set correctly

  const options = getPostOptions(userData); // Generates correct fetch options using helper
  const [data, error] = await fetchHandler(url, options); // Uses generic fetch handler

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return data;
};
