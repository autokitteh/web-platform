import React, { useCallback, useEffect, useMemo } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { defaultProjectFilesWidth } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath } from "@src/utilities";

import { useResize } from "@hooks";

import { Frame, IconButton, ResizeButton } from "@components/atoms";
import { ChatbotDrawer, EventsDrawer, ProjectConfigurationDrawer, ProjectFiles } from "@components/organisms";

import { ArrowRightIcon } from "@assets/image/icons";

export const ProjectWrapper = () => {
	const location = useLocation();
	const {
		openDrawer,
		closeDrawer,
		setSettingsPath,
		projectFilesWidth,
		setProjectFilesWidth,
		setIsProjectFilesVisible,
	} = useSharedBetweenProjectsStore();
	const { projectId } = useParams<{ projectId: string }>();
	const { settingsPath } = extractSettingsPath(location.pathname);
	const isSettingsOpen = Boolean(settingsPath && projectId);

	useEffect(() => {
		if (isSettingsOpen && projectId) {
			openDrawer(projectId, DrawerName.settings);
		} else if (projectId) {
			closeDrawer(projectId, DrawerName.settings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSettingsOpen, projectId]);

	useEffect(() => {
		if (projectId && settingsPath) {
			setSettingsPath(projectId, settingsPath);
		}
	}, [projectId, settingsPath, setSettingsPath]);

	const isExplorerPage = useMemo(() => {
		return location.pathname.includes("/explorer");
	}, [location.pathname]);

	const isProjectFilesVisibleForProject = useSharedBetweenProjectsStore(
		useCallback((state) => (projectId ? state.isProjectFilesVisible[projectId] : false), [projectId])
	);

	const shouldShowProjectFiles = isProjectFilesVisibleForProject !== false;

	const handleShowProjectFiles = useCallback(() => {
		if (projectId) {
			setIsProjectFilesVisible(projectId, true);
		}
	}, [projectId, setIsProjectFilesVisible]);

	const resizeId = `project-files-resize-${projectId}`;

	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultProjectFilesWidth,
		initial: projectFilesWidth[projectId!] || defaultProjectFilesWidth.initial,
		value: projectFilesWidth[projectId!],
		id: resizeId,
		onChange: (width) => setProjectFilesWidth(projectId!, width),
	});

	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden rounded-l-2xl">
			{isExplorerPage ? (
				shouldShowProjectFiles && leftSideWidth > 0 ? (
					<>
						<div style={{ width: `${leftSideWidth}%`, minWidth: 0 }}>
							<Frame className="h-full flex-auto rounded-r-none border-r border-gray-1050 bg-gray-1100">
								<ProjectFiles />
							</Frame>
						</div>
						<ResizeButton
							className="hover:bg-white"
							dataTestId="project-files-resize-button"
							direction="horizontal"
							id="project-files-resize-button"
							resizeId={resizeId}
						/>
					</>
				) : (
					<IconButton
						ariaLabel="Show project files"
						className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-l-none rounded-r-lg border border-l-0 border-gray-750 bg-gray-1100 p-1.5 hover:bg-gray-950"
						onClick={handleShowProjectFiles}
					>
						<ArrowRightIcon className="size-3.5 fill-white" />
					</IconButton>
				)
			) : null}

			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>
			{isSettingsOpen ? <ProjectConfigurationDrawer /> : null}
			<ChatbotDrawer />
			<EventsDrawer />
		</div>
	);
};
