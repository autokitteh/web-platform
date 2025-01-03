import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId, isAuthEnabled } from "@constants";

import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	return (
		<BrowserRouter>
			{isAuthEnabled && descopeProjectId ? (
				<DescopeWrapper>
					<App />
				</DescopeWrapper>
			) : (
				<App />
			)}
			<Toast />
		</BrowserRouter>
	);
};
