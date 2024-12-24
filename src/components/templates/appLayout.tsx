import React from "react";

import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { useWindowDimensions } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { ProjectConfigTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({ className, hideTopbar }: { className?: string; hideTopbar?: boolean }) => {
	const { isIOS, isMobile } = useWindowDimensions();
	const { projectsList } = useProjectStore();

	const hideSidebar = !projectsList.length && (isMobile || isIOS) && location.pathname === "/";

	return (
		<SystemLogLayout
			className={className}
			sidebar={hideSidebar ? null : <Sidebar />}
			topbar={hideTopbar ? null : <ProjectConfigTopbar />}
		>
			<Outlet />
		</SystemLogLayout>
	);
};
