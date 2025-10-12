import React from "react";

import { AuthProvider } from "@descope/react-sdk";

import { descopeProjectId } from "@constants";
import { useUserTracking } from "@hooks/useUserTracking";

import { DescopeMiddleware } from "@components/templates";

export const DescopeWrapper = ({ children }: { children: React.ReactNode }) => {
	useUserTracking();

	return (
		<AuthProvider projectId={descopeProjectId}>
			<DescopeMiddleware>{children}</DescopeMiddleware>
		</AuthProvider>
	);
};
