type ErrorWithMessage = {
  message: string
  status?: number
}

export function getError(error: unknown): ErrorWithMessage {
  // Check if error is an object with a message property
  if (error instanceof Error) {
    return {
      message: error.message,
      status:
        'status' in error && typeof error.status === 'number'
          ? error.status
          : undefined,
    }
  }

  // Handle case where error is a string
  if (typeof error === 'string') {
    return { message: error }
  }

  // Fallback for unknown error types
  return {
    message: 'An unexpected error occurred',
  }
}
