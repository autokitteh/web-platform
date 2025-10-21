export const rateLimitTimeouts = {
	modalDetectionMs: 500,
	modalVerificationMs: 2000,
	pollingTimeoutMs: 5000,
	pollingIntervalMs: 500,
} as const;

export const rateLimitConfig = {
	maxRetries: 3,
	defaultResetWaitMinutes: 0.1,
} as const;
