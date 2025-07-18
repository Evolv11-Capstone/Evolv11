import {
  basicFetchOptions,
  getPostOptions,
  getPatchOptions,
  fetchHandler,
} from '../utils/fetchingUtils';

import {
  NewUserInput,
  ApiResponse,
  UpdateUserInput,
} from '../types/userTypes';

// Load base API URL from environment variables
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


/**
 * Fetches all users (authenticated route)
 * Backend route: GET /api/users
 */
export const getAllUsers = async () => {
  const url = `${API_BASE_URL}/users`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Fetch a single user by ID
 * Backend route: GET /api/users/:id
 */
export const getUserById = async (id: number) => {
  const url = `${API_BASE_URL}/users/${id}`;
  return await fetchHandler(url, basicFetchOptions);
};

/**
 * Update an existing user's info
 * Backend route: PATCH /api/users/:id
 */
export const updateUser = async (
  id: number,
  userData: UpdateUserInput
) => {
  const url = `${API_BASE_URL}/users/${id}`;
  const options = getPatchOptions(userData);
  return await fetchHandler(url, options);
};
