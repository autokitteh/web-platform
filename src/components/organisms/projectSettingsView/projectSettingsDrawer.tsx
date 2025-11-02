import React, { useCallback, useEffect, useMemo } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { ProjectSettingsDeleteView } from "./projectSettingsDeleteView";
import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";
import { AddFileModal } from "@components/organisms/files/addModal";

export const ProjectSettingsDrawer = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { projectId } = useParams();

	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const setProjectSettingsWidth = useSharedBetweenProjectsStore((state) => state.setProjectSettingsWidth);
	const projectSettingsWidth = useSharedBetweenProjectsStore((state) => state.projectSettingsWidth);

	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

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
		closeDrawer(projectId, DrawerName.projectSettings);
	}, [projectId, closeDrawer]);

	const handleDisplaySidebar = useCallback(() => {
		if (!projectId) return;
		openDrawer(projectId, DrawerName.projectSettings);
		navigate(`/projects/${projectId}/settings`);
	}, [projectId, openDrawer, navigate]);

	useEventListener(EventListenerName.displayProjectConfigSidebar, handleDisplaySidebar);
	useEventListener(EventListenerName.hideProjectConfigSidebar, handleClose);

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}

	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-l-lg bg-gray-1100 pt-4"
			divId="project-sidebar-config"
			isForcedOpen
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={handleClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<div id="xxx" />
			<Outlet />
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
			<ProjectSettingsDeleteView />
			<AddFileModal />
		</Drawer>
	);
};
