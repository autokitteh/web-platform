import React from "react";

import { AuthProvider } from "@descope/react-sdk";

import { descopeProjectId } from "@constants";

import { DesignForDesktopBanner } from "@components/atoms";
import { DescopeMiddleware } from "@components/templates";

export const DescopeWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthProvider projectId={descopeProjectId}>
			<DesignForDesktopBanner />
			<DescopeMiddleware>{children}</DescopeMiddleware>
		</AuthProvider>
	);
};
