import React from "react";

import { DescopeMiddleware } from "@components/templates";
import { descopeProjectId } from "@constants";
import { AuthProvider } from "@descope/react-sdk";

export const DescopeWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthProvider projectId={descopeProjectId}>
			<DescopeMiddleware>{children}</DescopeMiddleware>
		</AuthProvider>
	);
};
