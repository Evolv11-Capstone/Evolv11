// Reusable fetch option for basic GET requests
export const basicFetchOptions: RequestInit = {
  method: 'GET',
  credentials: 'include', // Include cookies in request
};

// Reusable fetch option for DELETE requests
export function getDeleteOptions(body: any) {
  return {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include' as RequestCredentials,
    body: JSON.stringify(body),
  };
}

// Reusable fetch option for DELETE requests
export const deleteOptions: RequestInit = {
  method: 'DELETE',
  credentials: 'include',
};

// Generates options for a POST request with a JSON body
export const getPostOptions = (body: unknown): RequestInit => ({
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Generates options for a PATCH request with a JSON body
export const getPatchOptions = (body: unknown): RequestInit => ({
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/**
 * Generic fetch utility that returns a consistent tuple format: [data, error].
 * This avoids the need for try/catch in every component or adapter.
 *
 * @param url - The endpoint to fetch from.
 * @param options - Optional fetch options (method, headers, etc.)
 * @returns A promise that resolves to a tuple: [data | null, error | null]
 */
export const fetchHandler = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<[T | null, Error | null]> => {
  try {
    // Make the HTTP request
    const response = await fetch(url, options);

    // If the status is not OK (e.g. 400, 500), extract meaningful error message
    if (!response.ok) {
      let errorMessage = `Fetch failed with status - ${response.status}`;
      
      try {
        // Try to extract the error message from the response body
        const isJson = (response.headers.get('content-type') || '').includes('application/json');
        if (isJson) {
          const errorData = await response.json();
          // Check for various error message formats that the server might send
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } else {
          // If not JSON, try to get text response
          const errorText = await response.text();
          if (errorText.trim()) {
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        // If we can't parse the error response, use the generic message
        console.warn('Could not parse error response:', parseError);
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    // Determine whether to parse the response as JSON
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const responseData = await (isJson ? response.json() : response.text());

    // Return data and null error in a tuple
    return [responseData as T, null];
  } catch (error) {
    // On error, return null and the error object in a tuple
    return [null, error as Error];
  }
};
