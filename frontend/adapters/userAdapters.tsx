import { getPostOptions, fetchHandler } from '../utils/fetchingUtils'; // Utility fetch config
import { NewUserInput, ApiResponse } from '../types/userTypes'; // Shared types

// API base URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * Sends a request to create a new user using provided form data.
 * @param userData - The form values filled in the CreateNewUser component
 * @returns A tuple containing either the response or an error
 */
export const createNewUser = async (
  userData: NewUserInput
): Promise<[ApiResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/users`; // Complete API route
  const options = getPostOptions(userData); // Prepare headers and body
  return (await fetchHandler(url, options)) as [ApiResponse | null, Error | null]; // Call the backend and return the result
};
