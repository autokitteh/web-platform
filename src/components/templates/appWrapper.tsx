import React, { PropsWithChildren } from "react";
import { Topbar, TopbarDeployments, Sidebar } from "@components/organisms";
import { useParams, useLocation } from "react-router-dom";

export const AppWrapper = ({ children }: PropsWithChildren) => {
	const { projectId } = useParams();
	const location = useLocation();
	const isDeploymentPage = location.pathname.startsWith(`/projects/${projectId}/deployments`);

	return (
		<div className="w-screen h-screen pr-5">
			<div className="flex h-full">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-auto pl-7 -ml-7 transition">
					{!isDeploymentPage ? <Topbar /> : <TopbarDeployments />}
					<div className="py-2.5 flex-1">{children}</div>
				</div>
			</div>
		</div>
	);
};
