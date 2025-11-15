import React, { useCallback, useEffect, useMemo } from "react";

import { Outlet, useParams } from "react-router-dom";

import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent, useResize } from "@src/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

export const ProjectSettingsDrawer = () => {
	const { projectId } = useParams();
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

	useEffect(() => {
		if (projectId) {
			fetchVariables(projectId);
			fetchConnections(projectId);
			fetchTriggers(projectId);
		}
	}, [projectId, fetchVariables, fetchConnections, fetchTriggers]);

	const className = cn("rounded-l-lg bg-gray-1100", "px-8 py-3 sm:py-5 md:py-7");

	return (
		<Drawer
			bgClickable
			bgTransparent
			className={className}
			divId="project-sidebar-config"
			isForcedOpen={true}
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={() => triggerEvent(EventListenerName.hideProjectConfigSidebar)}
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
