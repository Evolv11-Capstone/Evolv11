// frontend/adapters/authAdapters.tsx

import { getPostOptions, fetchHandler, basicFetchOptions, deleteOptions } from '../utils/fetchingUtils';
import { NewUserInput, ApiResponse } from '../types/userTypes';

// Base API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// Register a new user
export const registerUser = async (
  userData: NewUserInput
): Promise<[ApiResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/auth/register`;
  console.log('Registering user with data:', userData);
  const options = getPostOptions(userData);
  return await fetchHandler(url, options);
};

// Login a user
export const loginUser = async (
  credentials: { email: string; password: string }
): Promise<[ApiResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/auth/login`;
  const options = getPostOptions(credentials);
  return await fetchHandler(url, options);
};

// Get the currently authenticated user (session)
export const getSessionUser = async (): Promise<[ApiResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/auth/me`;
  return await fetchHandler(url, basicFetchOptions);
};



// Logout user
export const logoutUser = async (): Promise<[ApiResponse | null, Error | null]> => {
  const url = `${API_BASE_URL}/auth/logout`;
  return await fetchHandler(url, deleteOptions);
};
