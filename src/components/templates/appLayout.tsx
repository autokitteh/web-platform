import React, { useCallback, useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { DrawerName } from "@src/enums/components";
import { EventListenerName } from "@src/enums/eventListenerNames.enum";
import { useEventListener, useWindowDimensions } from "@src/hooks";
import { useProjectStore, useSharedBetweenProjectsStore } from "@src/store";
import { useNavigateWithSettings } from "@src/utilities";

import { ProjectSettingsTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({
	className,
	hideTopbar,
	hideSystemLog,
}: {
	className?: string;
	hideSystemLog?: boolean;
	hideTopbar?: boolean;
}) => {
	const { projectId } = useParams();
	const location = useLocation();
	const { isIOS, isMobile } = useWindowDimensions();
	const { projectsList } = useProjectStore();
	const hideSidebar = !projectsList.length && (isMobile || isIOS) && location.pathname === "/";

	const navigateWithSettings = useNavigateWithSettings();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);

	const handleDisplayProjectSettingsSidebar = useCallback(() => {
		if (!projectId) return;
		openDrawer(projectId!, DrawerName.projectSettings);
		if (location.pathname.includes("/settings")) {
			return;
		}
		navigateWithSettings("settings");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, location.pathname]);
	useEventListener(EventListenerName.displayProjectConfigSidebar, handleDisplayProjectSettingsSidebar);

	useEffect(() => {
		if (!projectId) return;

		const isSettingsRoute = location.pathname.includes("/settings");
		const dontRevealConfigSidebar = location.state?.dontRevealConfigSidebar;

		if (isSettingsRoute && !dontRevealConfigSidebar) {
			openDrawer(projectId, DrawerName.projectSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, location.pathname, location.state]);

	return (
		<SystemLogLayout
			className={className}
			hideSystemLog={hideSystemLog}
			sidebar={hideSidebar ? null : <Sidebar />}
			topbar={hideTopbar ? null : <ProjectSettingsTopbar />}
		>
			<Outlet />
		</SystemLogLayout>
	);
};
