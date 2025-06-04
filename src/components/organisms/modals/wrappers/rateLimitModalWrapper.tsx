import React from "react";

import { useRateLimitHandler } from "@src/hooks";

import { RateLimitModal } from "@components/organisms/modals/rateLimitModal";

/**
 * Wrapper component for RateLimitModal that provides the necessary props
 * This component integrates the modal with the rate limit handler
 */
export const RateLimitModalWrapper: React.FC = () => {
	const { isRetrying, onRetryClick } = useRateLimitHandler();

	return <RateLimitModal isRetrying={isRetrying} onRetryClick={onRetryClick} />;
};
