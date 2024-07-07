import React from "react";

import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";
import { descopeProjectId, isAuthEnabled } from "@constants";

import { App } from "./app";

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
