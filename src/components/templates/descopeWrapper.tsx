import React from "react";

import { AuthProvider } from "@descope/react-sdk";

import { descopeProjectId } from "@constants";

import { DescopeMiddleware, UserTrackingProvider } from "@components/templates";

export const DescopeWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthProvider projectId={descopeProjectId}>
			<UserTrackingProvider>
				<DescopeMiddleware>{children}</DescopeMiddleware>
			</UserTrackingProvider>
		</AuthProvider>
	);
};
