import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { UseProjectFilesVisibilityArgs, UseProjectFilesVisibilityReturn } from "@src/interfaces/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";

export const useProjectFilesVisibility = ({
	projectId,
}: UseProjectFilesVisibilityArgs): UseProjectFilesVisibilityReturn => {
	const location = useLocation();

	const isProjectFilesVisibleForProject = useSharedBetweenProjectsStore(
		useCallback((state) => (projectId ? state.isProjectFilesVisible[projectId] : undefined), [projectId])
	);
	const isFilesDrawerOpen = useSharedBetweenProjectsStore(
		useCallback((state) => (projectId ? state.drawers[projectId]?.[DrawerName.projectFiles] : false), [projectId])
	);
	const setIsProjectFilesVisible = useSharedBetweenProjectsStore((state) => state.setIsProjectFilesVisible);
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);

	const [showFiles, setShowFiles] = useState(false);

	useEffect(() => {
		if (!projectId) return;

		const projectFilesSidebarVisible = isProjectFilesVisibleForProject !== false;
		if (projectFilesSidebarVisible && isProjectFilesVisibleForProject === undefined) {
			setIsProjectFilesVisible(projectId, true);
		}
		setShowFiles(projectFilesSidebarVisible);
	}, [projectId, isProjectFilesVisibleForProject, setIsProjectFilesVisible]);

	const isExplorerPage = useMemo(() => location.pathname.includes("/explorer"), [location.pathname]);

	const handleShowProjectFiles = useCallback(() => {
		if (!projectId) return;

		if (isExplorerPage) {
			setIsProjectFilesVisible(projectId, true);
		} else {
			openDrawer(projectId, DrawerName.projectFiles);
		}
	}, [projectId, isExplorerPage, setIsProjectFilesVisible, openDrawer]);

	const shouldShowProjectFiles = showFiles && !!isProjectFilesVisibleForProject;
	const showFilesButton = isExplorerPage ? !shouldShowProjectFiles : !isFilesDrawerOpen;

	if (!projectId) {
		return {
			isExplorerPage: false,
			showFiles: false,
			shouldShowProjectFiles: false,
			showFilesButton: false,
			handleShowProjectFiles: () => {},
		};
	}

	return {
		isExplorerPage,
		showFiles,
		shouldShowProjectFiles,
		showFilesButton,
		handleShowProjectFiles,
	};
};
