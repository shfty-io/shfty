import { NextResponse } from 'next/server';

// Error types
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal',
}

// Error response structure
export interface ErrorResponse {
  error: {
    type: ErrorType;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

// Error status code mapping
const errorStatusCodes: Record<ErrorType, number> = {
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.VALIDATION]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.EXTERNAL_SERVICE]: 502,
  [ErrorType.INTERNAL]: 500,
};

// Create a standardized error response
export function createErrorResponse(
  type: ErrorType,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const status = errorStatusCodes[type];
  
  // Log the error (in production, this could send to a monitoring service)
  console.error(`[${type}] ${message}`, { code, details });
  
  return NextResponse.json(
    {
      error: {
        type,
        message,
        code,
        details,
      },
    },
    { status }
  );
}

// Helper functions for common error types
export function createAuthenticationError(message = 'Authentication required') {
  return createErrorResponse(ErrorType.AUTHENTICATION, message);
}

export function createAuthorizationError(message = 'Permission denied') {
  return createErrorResponse(ErrorType.AUTHORIZATION, message);
}

export function createValidationError(message: string, details?: Record<string, unknown>) {
  return createErrorResponse(ErrorType.VALIDATION, message, undefined, details);
}

export function createNotFoundError(resource: string) {
  return createErrorResponse(ErrorType.NOT_FOUND, `${resource} not found`);
}

export function createConflictError(message: string) {
  return createErrorResponse(ErrorType.CONFLICT, message);
}

export function createExternalServiceError(service: string, message: string, details?: Record<string, unknown>) {
  return createErrorResponse(
    ErrorType.EXTERNAL_SERVICE,
    `Error from ${service}: ${message}`,
    undefined,
    details
  );
}

export function createInternalError(message = 'An unexpected error occurred') {
  return createErrorResponse(ErrorType.INTERNAL, message);
}

// Function to handle errors in API routes
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Error) {
    // Handle known error types
    if (error.name === 'StripeError') {
      return createExternalServiceError('Stripe', error.message);
    }
    
    // Handle other known errors here
    
    // Default to internal error
    return createInternalError(error.message);
  }
  
  // Handle unknown errors
  return createInternalError('An unknown error occurred');
} 