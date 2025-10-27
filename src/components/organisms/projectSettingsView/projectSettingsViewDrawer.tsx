import React from "react";

import { useLocation, useParams } from "react-router-dom";

import { ProjectSettingsView } from "./projectSettingsView";
import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useDrawerStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const ProjectSettingsViewDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setProjectSettingsWidth, projectSettingsWidth } = useSharedBetweenProjectsStore();
	const currentProjectSettingsWidth = projectSettingsWidth[projectId!] || defaultProjectSettingsWidth.initial;
	const hasActiveDeployment = useHasActiveDeployments();
	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectSettingsWidth.min,
		max: defaultProjectSettingsWidth.max,
		initial: currentProjectSettingsWidth,
		value: currentProjectSettingsWidth,
		id: "project-config-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setProjectSettingsWidth(projectId, width);
			}
		},
		invertDirection: true,
	});

	const open = () => {
		if (!projectId) return;
		openDrawer(DrawerName.projectSettings);
		fetchVariables(projectId);
		fetchConnections(projectId);
		fetchTriggers(projectId);
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(DrawerName.projectSettings);
	};

	useEventListener(EventListenerName.displayProjectSettingsSidebar, () => open());

	useEventListener(EventListenerName.hideProjectSettingsSidebar, () => close());

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}

	return (
		<Drawer
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-config"
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={close}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<ProjectSettingsView hasActiveDeployment={hasActiveDeployment} key={projectId} onClose={close} />
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
