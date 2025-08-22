/**
 * Utility functions for date calculations
 */

/**
 * Calculates age in years from a birthdate string
 * @param birthday - ISO date string (e.g., "1999-05-15")
 * @returns Age in years as a number
 */
export const calculateAge = (birthday: string): number => {
  if (!birthday) return 0;
  
  const birthDate = new Date(birthday);
  const today = new Date();
  
  // Check if the date is valid
  if (isNaN(birthDate.getTime())) {
    return 0;
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age); // Ensure no negative ages
};

/**
 * Formats a date string for display
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "May 15, 1999")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Validates if a date string represents a valid birthdate
 * @param birthday - ISO date string
 * @returns true if valid birthdate, false otherwise
 */
export const isValidBirthdate = (birthday: string): boolean => {
  if (!birthday) return false;
  
  const birthDate = new Date(birthday);
  const today = new Date();
  
  // Check if the date is valid and not in the future
  return !isNaN(birthDate.getTime()) && birthDate <= today;
};
