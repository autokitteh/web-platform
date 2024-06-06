import React, { useEffect } from "react";
import { DescopeWrapper } from "@components/templates";
import { descopeProjectId, isAuthEnabled } from "@constants";
import { router } from "@routing/routes";
import { useProjectStore } from "@store/useProjectStore";
import { RouterProvider } from "react-router-dom";

export const App: React.FC = () => {
	const { getProjectMenutItems } = useProjectStore();

	useEffect(() => {
		getProjectMenutItems();
	}, [getProjectMenutItems]);

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
