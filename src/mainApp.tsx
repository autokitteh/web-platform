import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId, isAuthEnabled } from "@constants";

import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	return (
		<div>
			{isAuthEnabled && descopeProjectId ? (
				<DescopeWrapper>
					<App />
				</DescopeWrapper>
			) : (
				<App />
			)}

			<Toast />
		</div>
	);
};
