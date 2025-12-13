import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { UseProjectFilesVisibilityArgs, UseProjectFilesVisibilityReturn } from "@src/interfaces/hooks";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";

export const useProjectFilesVisibility = ({
	projectId,
}: UseProjectFilesVisibilityArgs): UseProjectFilesVisibilityReturn => {
	const location = useLocation();
	const { initCache } = useCacheStore();
	const { isProjectFilesVisible, setIsProjectFilesVisible, openDrawer, drawers } = useSharedBetweenProjectsStore();

	const [showFiles, setShowFiles] = useState(false);

	useEffect(() => {
		if (!projectId) return;

		initCache(projectId, true);

		const projectFilesSidebarVisible = !!isProjectFilesVisible[projectId] || !(projectId in isProjectFilesVisible);
		if (projectFilesSidebarVisible) {
			setIsProjectFilesVisible(projectId, true);
		}
		setShowFiles(projectFilesSidebarVisible);
	}, [projectId, isProjectFilesVisible, setIsProjectFilesVisible, initCache]);

	if (!projectId)
		return {
			isExplorerPage: false,
			showFiles: false,
			shouldShowProjectFiles: false,
			showFilesButton: false,
			handleShowProjectFiles: () => {},
		};

	const isExplorerPage = location.pathname.includes("/explorer");
	const isFilesDrawerOpen = projectId ? drawers[projectId]?.[DrawerName.projectFiles] : false;

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

	return {
		isExplorerPage,
		showFiles,
		shouldShowProjectFiles,
		showFilesButton,
		handleShowProjectFiles,
	};
};
