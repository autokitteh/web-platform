import { ServiceResponse } from "@src/types";

export const retryAsyncOperation = async <T>(
	operation: () => ServiceResponse<T>,
	maxAttempts: number = 3,
	delayMs: number = 3000
): Promise<T | undefined> => {
	let lastError: any;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			const { data, error } = await operation();
			if (error) {
				throw error;
			}
			return data;
		} catch (error) {
			lastError = error;
			if (attempt === maxAttempts) break;
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}

	throw lastError;
};
