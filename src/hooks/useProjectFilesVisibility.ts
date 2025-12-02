import { useEffect, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { useCacheStore, useSharedBetweenProjectsStore } from "@src/store";

export const useProjectFilesVisibility = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { initCache } = useCacheStore();
	const { isProjectFilesVisible, setIsProjectFilesVisible, openDrawer, drawers } = useSharedBetweenProjectsStore();

	const [showFiles, setShowFiles] = useState(false);

	const isExplorerPage = location.pathname.includes("/explorer");
	const isFilesDrawerOpen = projectId ? drawers[projectId]?.[DrawerName.projectFiles] : false;

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

	return {
		projectId,
		isExplorerPage,
		showFiles,
		shouldShowProjectFiles,
		showFilesButton,
		handleShowProjectFiles,
	};
};
