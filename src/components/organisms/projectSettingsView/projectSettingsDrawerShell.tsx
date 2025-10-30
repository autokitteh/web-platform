import React, { useEffect } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectSettingsWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";

import { ResizeButton } from "@components/atoms";
import { Drawer } from "@components/molecules";

interface ProjectSettingsDrawerShellProps {
	children: React.ReactNode;
}

export const ProjectSettingsDrawerShell = ({ children }: ProjectSettingsDrawerShellProps) => {
	const location = useLocation();
	const navigate = useNavigate();
	const { projectId } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { setProjectSettingsWidth, projectSettingsWidth } = useSharedBetweenProjectsStore();
	const currentProjectSettingsWidth = projectSettingsWidth[projectId!] || defaultProjectSettingsWidth.initial;
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

	const handleClose = () => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.projectSettings);
		navigate(-1);
	};

	useEventListener(EventListenerName.displayProjectConfigSidebar, () => {
		if (!projectId) return;
		openDrawer(projectId, DrawerName.projectSettings);
		navigate(`/projects/${projectId}/settings`, {
			state: { backgroundLocation: location },
		});
	});

	useEventListener(EventListenerName.hideProjectConfigSidebar, () => handleClose());

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
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-config"
			isScreenHeight={false}
			name={DrawerName.projectSettings}
			onCloseCallback={handleClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			{children}
			<ResizeButton
				className="absolute left-0 right-auto top-1/2 z-[125] w-2 -translate-y-1/2 cursor-ew-resize px-1 hover:bg-white"
				direction="horizontal"
				id="project-config-drawer-resize-button"
				resizeId="project-config-drawer-resize"
			/>
		</Drawer>
	);
};
