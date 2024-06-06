import React from "react";
import { App } from "./app";
import { DescopeWrapper } from "@components/templates";
import { isAuthEnabled, descopeProjectId } from "@constants";

export const MainApp = () =>
	isAuthEnabled && descopeProjectId ? (
		<DescopeWrapper>
			<App />
		</DescopeWrapper>
	) : (
		<App />
	);
