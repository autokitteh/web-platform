import React from "react";
import { App } from "./app";
import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";
import { isAuthEnabled, descopeProjectId } from "@constants";
import { useToastStore } from "@store/useToastStore";

export const MainApp = () => {
	const addToast = useToastStore((state) => state.addToast);
	addToast({ id: Date.now().toString(), message: "Hello World!", type: "success" });
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
