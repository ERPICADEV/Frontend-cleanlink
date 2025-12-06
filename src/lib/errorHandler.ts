import { AxiosError } from "axios";

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
  error: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
    details?: string;
  };
}

/**
 * Enhanced error with backend error information
 */
export interface ApiError extends Error {
  response?: {
    data?: BackendErrorResponse;
    status?: number;
  };
  status?: number;
  code?: string;
  fields?: Record<string, string>;
}

/**
 * Handles API errors and returns user-friendly messages
 * 
 * @param error - The error object from axios/fetch
 * @param options - Configuration options
 * @returns User-friendly error message
 */
export function handleApiError(
  error: unknown,
  options: {
    logError?: boolean;
    defaultMessage?: string;
  } = {}
): string {
  const { logError = true, defaultMessage = "Something went wrong. Please try again." } = options;

  // Check if error has a response (from axios or apiClient interceptor)
  const errorWithResponse = error as any;
  const response = errorWithResponse?.response;
  
  // If error has a response, extract backend error data
  if (response) {
    const errorData = response.data;
    const backendError = errorData?.error;

    // Log error for debugging (silently)
    if (logError) {
      console.error("API Error:", {
        status: response.status,
        code: backendError?.code,
        message: backendError?.message,
        fields: backendError?.fields,
        details: backendError?.details,
      });
    }

    // Always prioritize the main error message over field-specific errors
    if (backendError?.message) {
      return backendError.message;
    }

    // Only use fields as a fallback if message doesn't exist
    if (backendError?.fields) {
      const fieldErrors = Object.values(backendError.fields);
      if (fieldErrors.length > 0) {
        // Return the first field error message as fallback
        return fieldErrors[0];
      }
    }

    // Handle specific status codes with friendly messages
    const status = response.status || errorWithResponse?.status;
    
    if (status === 400) {
      return "Invalid request. Please check your input and try again.";
    }
    
    if (status === 401) {
      return "Invalid email or password. Please try again.";
    }
    
    if (status === 403) {
      return "You don't have permission to perform this action.";
    }
    
    if (status === 404) {
      return "The requested resource was not found.";
    }
    
    if (status === 409) {
      return "This resource already exists. Please use a different value.";
    }
    
    if (status === 422) {
      return "Validation failed. Please check your input.";
    }
    
    if (status === 503) {
      return "Service temporarily unavailable. Please try again later.";
    }
    
    if (status >= 500) {
      return "Server error. Please try again later.";
    }
  }
  
  // Network errors (no response) or errors with messages from apiClient interceptor
  if (logError) {
    console.error("Network/Error:", {
      message: errorWithResponse?.message,
      code: errorWithResponse?.code,
      error: error,
    });
  }
  
  // Check if error message itself contains useful info (from apiClient interceptor)
  // The apiClient interceptor sets error.message to the backend error message
  if (errorWithResponse?.message) {
    // If it's a network error message, handle it
    if (errorWithResponse.message === "Network Error" || errorWithResponse.message.includes("Network Error")) {
      return "Network error. Please check your internet connection.";
    }
    
    if (errorWithResponse.code === "ECONNABORTED" || errorWithResponse.message.includes("timeout")) {
      return "Request timeout. Please check your connection and try again.";
    }
    
    // Otherwise, use the message (likely from apiClient interceptor)
    return errorWithResponse.message;
  }
  
  // Fallback for true network errors
  if (errorWithResponse?.code === "ECONNABORTED") {
    return "Request timeout. Please check your connection and try again.";
  }
  
  return "Unable to connect to the server. Please try again later.";

}

/**
 * Extracts validation field errors from API error response
 * 
 * @param error - The error object from axios/fetch
 * @returns Object with field names as keys and error messages as values
 */
export function getValidationErrors(
  error: unknown
): Record<string, string> {
  const errorWithResponse = error as any;
  const response = errorWithResponse?.response;
  const backendError = response?.data?.error;
  
  return backendError?.fields || {};
}

/**
 * Checks if error has validation fields
 * 
 * @param error - The error object from axios/fetch
 * @returns True if error contains validation fields
 */
export function hasValidationErrors(error: unknown): boolean {
  const errors = getValidationErrors(error);
  return Object.keys(errors).length > 0;
}

/**
 * Gets the error code from backend response
 * 
 * @param error - The error object from axios/fetch
 * @returns Error code or undefined
 */
export function getErrorCode(error: unknown): string | undefined {
  const errorWithResponse = error as any;
  const response = errorWithResponse?.response;
  return response?.data?.error?.code || errorWithResponse?.code;
}

