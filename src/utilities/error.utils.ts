/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error object (can be string, Error, or unknown)
 * @returns A string representation of the error message
 */
export const getErrorMessage = (error: unknown): string => {
	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		return error.message;
	}

	// Fallback for unknown error types
	return String(error);
};
