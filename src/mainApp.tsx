import React, { useEffect, useLayoutEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";

import { useCacheStore, useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { reset } = useOrganizationStore();

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
					{descopeProjectId ? (
						<DescopeWrapper>
							<App />
						</DescopeWrapper>
					) : (
						<App />
					)}
				</WelcomeRedirect>
			</AppProvider>
		</BrowserRouter>
	);
};
