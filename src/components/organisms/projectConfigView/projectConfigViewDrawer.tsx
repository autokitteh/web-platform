import React, { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ProjectConfigView } from "./projectConfigView";
import { defaultProjectConfigWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useEventListener, useResize } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore, useCacheStore, useHasActiveDeployments } from "@src/store";

import { Drawer } from "@components/molecules";

export const ProjectConfigViewDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const {
		projectConfigWidth,
		setProjectConfigWidth,
		setIsProjectDrawerState,
		setExpandedProjectNavigation,
		isProjectDrawerState,
	} = useSharedBetweenProjectsStore();
	const currentDrawerState = projectId ? isProjectDrawerState[projectId] : undefined;
	const hasActiveDeployment = useHasActiveDeployments();
	const fetchTriggers = useCacheStore((state) => state.fetchTriggers);
	const fetchVariables = useCacheStore((state) => state.fetchVariables);
	const fetchConnections = useCacheStore((state) => state.fetchConnections);

	const open = () => {
		if (!projectId) return;
		openDrawer("projectConfig");
		setIsProjectDrawerState(projectId, "configuration");
		setExpandedProjectNavigation(projectId, true);
		fetchVariables(projectId);
		fetchConnections(projectId);
		fetchTriggers(projectId);
	};

	const close = () => {
		if (!projectId) return;
		setIsProjectDrawerState(projectId);
		setExpandedProjectNavigation(projectId, false);
		closeDrawer("projectConfig");
	};

	const currentProjectConfigWidth = projectConfigWidth[projectId!] || defaultProjectConfigWidth.initial;

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultProjectConfigWidth.min,
		max: defaultProjectConfigWidth.max,
		initial: currentProjectConfigWidth,
		value: currentProjectConfigWidth,
		id: "project-config-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setProjectConfigWidth(projectId, width);
			}
		},
		invertDirection: true,
	});

	useEffect(() => {
		if (!projectId) return;

		if (currentDrawerState !== "configuration") {
			close();
			return;
		}
		open();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, currentDrawerState]);

	useEventListener(EventListenerName.displayProjectConfigSidebar, () => {
		if (!projectId) return;
		open();
	});

	useEventListener(EventListenerName.hideProjectConfigSidebar, () => {
		if (!projectId) return;
		close();
	});

	const handleConfigViewClose = () => {
		if (!projectId) return;
		close();
	};

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}

	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-config"
			isScreenHeight={false}
			name="projectConfig"
			onCloseCallback={handleConfigViewClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<ProjectConfigView hasActiveDeployment={hasActiveDeployment} key={projectId} />
		</Drawer>
	);
};
