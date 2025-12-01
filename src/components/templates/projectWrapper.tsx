import React, { useEffect, useState } from "react";

import { MdFolderOpen } from "react-icons/md";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { defaultProjectFilesWidth } from "@src/constants";
import { DrawerName } from "@src/enums/components";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";

import { useResize } from "@hooks";

import { Button, Frame, ResizeButton } from "@components/atoms";
import { ChatbotDrawer, EventsDrawer, FilesDrawer, ProjectFiles } from "@components/organisms";
import { FileEditorModal } from "@components/organisms/files/fileEditorModal";

export const ProjectWrapper = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { initCache } = useCacheStore();
	const {
		isProjectFilesVisible,
		setIsProjectFilesVisible,
		projectFilesWidth,
		setProjectFilesWidth,
		openDrawer,
		drawers,
	} = useSharedBetweenProjectsStore();

	const [showFiles, setShowFiles] = useState(false);
	const resizeId = `project-files-resize-${projectId}`;

	const isExplorerPage = location.pathname.includes("/explorer");
	const isFilesDrawerOpen = projectId ? drawers[projectId]?.[DrawerName.projectFiles] : false;

	const [leftSideWidth] = useResize({
		direction: "horizontal",
		...defaultProjectFilesWidth,
		initial: projectFilesWidth[projectId!] || defaultProjectFilesWidth.initial,
		value: projectFilesWidth[projectId!],
		id: resizeId,
		onChange: (width) => setProjectFilesWidth(projectId!, width),
	});

	useEffect(() => {
		if (!projectId) return;

		initCache(projectId, true);

		const projectFilesSidebarVisible = !!isProjectFilesVisible[projectId] || !(projectId in isProjectFilesVisible);
		if (projectFilesSidebarVisible) {
			setIsProjectFilesVisible(projectId, true);
		}
		setShowFiles(projectFilesSidebarVisible);
	}, [projectId, isProjectFilesVisible, setIsProjectFilesVisible, initCache]);

	const handleShowProjectFiles = () => {
		if (!projectId) return;

		if (isExplorerPage) {
			setIsProjectFilesVisible(projectId, true);
		} else {
			openDrawer(projectId, DrawerName.projectFiles);
		}
	};

	const shouldShowProjectFiles = showFiles && !!isProjectFilesVisible[projectId!];
	const showFilesButton = isExplorerPage ? !shouldShowProjectFiles : !isFilesDrawerOpen;

	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden">
			{showFilesButton ? (
				<Button
					ariaLabel="Show Project Files"
					className="absolute left-4 top-7 z-30 rounded-lg"
					data-testid="show-project-files-button-wrapper"
					id="show-project-files-button-wrapper"
					onClick={handleShowProjectFiles}
				>
					<MdFolderOpen className="size-5 fill-white" />
				</Button>
			) : null}

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
