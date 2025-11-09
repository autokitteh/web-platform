import React, { useCallback, useEffect, useMemo } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath, useNavigateWithSettings } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const ProjectSettingsDrawer = () => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useSharedBetweenProjectsStore();
	const setProjectSettingsWidth = useSharedBetweenProjectsStore((state) => state.setProjectSettingsWidth);
	const projectSettingsWidth = useSharedBetweenProjectsStore((state) => state.projectSettingsWidth);
	const setDrawerJustOpened = useSharedBetweenProjectsStore((state) => state.setDrawerJustOpened);
	const navigateWithSettings = useNavigateWithSettings();

	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);

	const currentProjectSettingsWidth = useMemo(
		() => projectSettingsWidth[projectId!] || defaultProjectSettingsWidth.initial,
		[projectSettingsWidth, projectId]
	);

	const handleResizeChange = useCallback(
		(width: number) => {
			if (projectId) {
				setProjectSettingsWidth(projectId, width);
			}
		},
		[projectId, setProjectSettingsWidth]
	);

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectSettingsWidth.min,
		max: defaultProjectSettingsWidth.max,
		initial: currentProjectSettingsWidth,
		value: currentProjectSettingsWidth,
		id: "project-config-drawer-resize",
		onChange: handleResizeChange,
		invertDirection: true,
	});

	const handleClose = useCallback(() => {
		if (!projectId) return;
		navigate(basePath);
		closeDrawer(projectId, DrawerName.projectSettings);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, basePath]);

	const handleDisplaySidebar = useCallback(() => {
		if (!projectId) return;
		openDrawer(projectId!, DrawerName.projectSettings);
		if (location.pathname.includes("/settings")) {
			return;
		}
		navigateWithSettings("/settings");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEventListener(EventListenerName.displayProjectConfigSidebar, handleDisplaySidebar);
	useEventListener(EventListenerName.hideProjectConfigSidebar, handleClose);

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	useEffect(() => {
		if (projectId) {
			const timer = setTimeout(() => {
				setDrawerJustOpened(projectId, DrawerName.projectSettings, false);
			}, 500);
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-l-lg bg-gray-1100 pt-7"
			divId="project-sidebar-config"
			isForcedOpen={true}
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={handleClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<Outlet />
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
