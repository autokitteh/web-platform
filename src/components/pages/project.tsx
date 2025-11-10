import React, { useCallback, useEffect, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useCacheStore, useManualRunStore, useProjectStore, useSharedBetweenProjectsStore } from "@src/store";
import { UserTrackingUtils, useNavigateWithSettings } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ProjectFiles, SplitFrame } from "@components/organisms";

import { AssetsIcon } from "@assets/image/icons";

export const Project = () => {
	const { initCache } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { projectId } = useParams();
	const { getProject } = useProjectStore();
	const { isProjectFilesVisible, setIsProjectFilesVisible, isDrawerOpen } = useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);
	const [showFiles, setShowFiles] = useState(false);
	const openConnectionFromChatbot = () => {
		setIsConnectionLoadingFromChatbot(true);
		setTimeout(() => {
			setIsConnectionLoadingFromChatbot(false);
		}, 1800);
	};

	const navigateWithSettings = useNavigateWithSettings();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);

	const handleDisplayProjectSettingsSidebar = useCallback(() => {
		if (!projectId) return;
		openDrawer(projectId!, DrawerName.projectSettings);
		if (location.pathname.includes("/settings")) {
			return;
		}
		navigateWithSettings("/settings");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, location.pathname]);

	useEventListener(EventListenerName.openConnectionFromChatbot, openConnectionFromChatbot);

	const loadProject = async (projectId: string) => {
		await initCache(projectId, true);
		fetchManualRunConfiguration(projectId);
		const { data: project } = await getProject(projectId!);
		if (project) {
			UserTrackingUtils.setProject(project.id, project);
		}
	};

	useEffect(() => {
		if (!projectId) return;
		loadProject(projectId!);
		const settingsDrawer = isDrawerOpen(projectId!, DrawerName.projectSettings);
		if (!!settingsDrawer || settingsDrawer === undefined) {
			handleDisplayProjectSettingsSidebar();
		}

		const projectFilesSidebarVisible = !!isProjectFilesVisible[projectId];
		if (projectFilesSidebarVisible || projectFilesSidebarVisible === undefined) {
			setShowFiles(true);
			setIsProjectFilesVisible(projectId, true);
		} else {
			setShowFiles(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isProjectFilesVisible, projectId]);

	const handleShowProjectFiles = () => {
		if (!projectId) return;
		setIsProjectFilesVisible(projectId, true);
	};

	return (
		<>
			<Outlet />
			<div className="flex h-full flex-1 overflow-hidden rounded-2xl" id="project-split-frame">
				{!showFiles ? (
					<Button
						ariaLabel="Show Project Files"
						className="absolute left-4 top-7 z-10 rounded-lg bg-gray-900 p-2 hover:bg-gray-800"
						onClick={handleShowProjectFiles}
					>
						<IconSvg className="fill-black stroke-gray-900" src={AssetsIcon} />
					</Button>
				) : null}
				<SplitFrame rightFrameClass="rounded-none">
					<>
						<LoadingOverlay isLoading={isConnectionLoadingFromChatbot} />
						<ProjectFiles />
					</>
				</SplitFrame>
			</div>
		</>
	);
};
