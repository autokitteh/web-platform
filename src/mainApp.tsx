import React, { useEffect, useLayoutEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { descopeProjectId } from "@constants";
import { VersionService } from "@services";
import { useDefaultUserLogin } from "@src/hooks";

import { useCacheStore, useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppContent, AppProvider, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { reset, login } = useOrganizationStore();
	const { isLoading, loginError, isLoggedIn, retry } = useDefaultUserLogin({
		login,
		enabled: !descopeProjectId,
	});

	useLayoutEffect(() => {
		if (!descopeProjectId) {
			reset();
		}
	}, [reset]);

	useEffect(() => {
		VersionService.initializeVersionTracking();
		useCacheStore.getState().fetchIntegrations(true);
	}, []);

	return (
		<BrowserRouter>
			<AppProvider>
				<DesignedForDesktopBanner />
				<WelcomeRedirect>
					<AppContent isLoading={isLoading} isLoggedIn={isLoggedIn} loginError={loginError} onRetry={retry} />
				</WelcomeRedirect>
			</AppProvider>
		</BrowserRouter>
	);
};
