import React from "react";
import { App } from "./app";
import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";
import { isAuthEnabled, descopeProjectId } from "@constants";

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
