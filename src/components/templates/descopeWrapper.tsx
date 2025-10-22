import React from "react";

import { AuthProvider } from "@descope/react-sdk";
import { useSearchParams } from "react-router-dom";

import { descopeProjectId, isProduction } from "@constants";
import { useUserTracking } from "@hooks/useUserTracking";

import { DescopeMiddleware } from "@components/templates";

export const DescopeWrapper = ({ children }: { children: React.ReactNode }) => {
	const [searchParams] = useSearchParams();
	const userAgent = navigator.userAgent.toLowerCase();
	const hasHeadless = userAgent.includes("headless");
	const isE2eTest = searchParams.get("e2e") === "true" || hasHeadless;
	useUserTracking(isProduction, isE2eTest);

	return (
		<AuthProvider projectId={descopeProjectId}>
			<DescopeMiddleware>{children}</DescopeMiddleware>
		</AuthProvider>
	);
};
