import React from "react";

import { useLocation, useParams } from "react-router-dom";

import { ProjectSettingsView } from "./projectSettingsView";
import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useDrawerStore, useHasActiveDeployments, useSharedBetweenProjectsStore } from "@src/store";

import { IconSvg, Button, ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

import { Close } from "@assets/image/icons";

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
			<div className="absolute right-4 top-4 z-10">
				<Button
					ariaLabel="Close Project Config"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="close-project-config-button"
					onClick={close}
				>
					<IconSvg className="fill-white" src={Close} />
				</Button>
			</div>
			<ProjectSettingsView hasActiveDeployment={hasActiveDeployment} key={projectId} />
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
