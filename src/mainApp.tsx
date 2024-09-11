import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId, isAuthEnabled } from "@constants";

import { DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	return isAuthEnabled && descopeProjectId ? (
		<DescopeWrapper>
			<App />
		</DescopeWrapper>
	) : (
		<App />
	);
};
