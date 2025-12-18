import React from "react";

import { descopeProjectId } from "@constants";
import { App } from "@src/app";

import { FullPageLoader, LoginError } from "@components/atoms";
import { DescopeWrapper } from "@components/templates";

export const AppContent = ({
	isLoading,
	isLoggedIn,
	loginError,
	onRetry,
}: {
	isLoading: boolean;
	isLoggedIn: boolean;
	loginError: string | null;
	onRetry: () => void;
}) => {
	if (descopeProjectId) {
		return (
			<DescopeWrapper>
				<App />
			</DescopeWrapper>
		);
	}

	if (isLoading) {
		return <FullPageLoader />;
	}

	if (loginError) {
		return <LoginError message={loginError} onRetry={onRetry} />;
	}

	if (isLoggedIn) {
		return <App />;
	}

	return null;
};
