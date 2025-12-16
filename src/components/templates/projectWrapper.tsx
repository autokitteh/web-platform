import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { defaultProjectFilesWidth } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath } from "@src/utilities";

import { useProjectFilesVisibility, useResize } from "@hooks";

import { Frame, ResizeButton, ShowProjectFilesButton } from "@components/atoms";
import { ChatbotDrawer, EventsDrawer, ProjectConfigurationDrawer, ProjectFiles } from "@components/organisms";

export const ProjectWrapper = () => {
	const location = useLocation();
	const { openDrawer, closeDrawer, setSettingsPath, projectFilesWidth, setProjectFilesWidth } =
		useSharedBetweenProjectsStore();
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
	const { isExplorerPage, shouldShowProjectFiles } = useProjectFilesVisibility({ projectId: projectId! });

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
					<ShowProjectFilesButton />
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
