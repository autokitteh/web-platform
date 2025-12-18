import React, { useEffect, useLayoutEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";
import { useDefaultUserLogin } from "@src/hooks";

import { useCacheStore, useOrganizationStore } from "@store";

import { DesignedForDesktopBanner, Loader } from "@components/atoms";
import { AppProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

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

	const renderContent = () => {
		if (descopeProjectId) {
			return (
				<DescopeWrapper>
					<App />
				</DescopeWrapper>
			);
		}

		if (isLoading) {
			return (
				<div className="flex h-screen w-full items-center justify-center">
					<Loader size="xl" />
				</div>
			);
		}

		if (loginError) {
			return (
				<div className="flex h-screen w-full flex-col items-center justify-center gap-4">
					<p className="text-lg text-error">{loginError}</p>
					<button className="rounded bg-gray-750 px-4 py-2 text-white hover:bg-gray-700" onClick={retry}>
						Retry
					</button>
				</div>
			);
		}

		if (isLoggedIn) {
			return <App />;
		}

		return null;
	};

	return (
		<BrowserRouter>
			<AppProvider>
				<DesignedForDesktopBanner />
				<WelcomeRedirect>{renderContent()}</WelcomeRedirect>
			</AppProvider>
		</BrowserRouter>
	);
};
