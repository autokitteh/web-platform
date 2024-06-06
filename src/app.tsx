import React from "react";
import { DescopeWrapper } from "@components/templates";
import { descopeProjectId, isAuthEnabled } from "@constants";
import { router } from "@routing/routes";
import { RouterProvider } from "react-router-dom";

export const App: React.FC = () => {
	return (
		<div>
			{isAuthEnabled && descopeProjectId ? (
				<DescopeWrapper>
					<RouterProvider router={router} />
				</DescopeWrapper>
			) : (
				<RouterProvider router={router} />
			)}
		</div>
	);
};
