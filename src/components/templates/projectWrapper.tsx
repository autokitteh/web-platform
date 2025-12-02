import React from "react";

import { Outlet } from "react-router-dom";

import { defaultProjectFilesWidth } from "@src/constants";
import { useSharedBetweenProjectsStore } from "@src/store";

import { useProjectFilesVisibility, useResize } from "@hooks";

import { Frame, ResizeButton } from "@components/atoms";
import { ChatbotDrawer, EventsDrawer, FilesDrawer, ProjectFiles } from "@components/organisms";
import { FileEditorModal } from "@components/organisms/files/fileEditorModal";

export const ProjectWrapper = () => {
	const { projectFilesWidth, setProjectFilesWidth } = useSharedBetweenProjectsStore();
	const { projectId, isExplorerPage, shouldShowProjectFiles } = useProjectFilesVisibility();

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
			{isExplorerPage && shouldShowProjectFiles && leftSideWidth > 0 ? (
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
			) : null}

			<div className="flex-1 overflow-hidden">
				<Outlet />
			</div>

			<ChatbotDrawer />
			<EventsDrawer />
			<FilesDrawer />
			<FileEditorModal />
		</div>
	);
};
