import React, { useEffect, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useCacheStore, useManualRunStore, useProjectStore, useSharedBetweenProjectsStore } from "@src/store";
import { UserTrackingUtils } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { ProjectFiles, SplitFrame } from "@components/organisms";

import { AssetsIcon } from "@assets/image/icons";

export const Project = () => {
	const { initCache } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { projectId } = useParams();
	const { getProject } = useProjectStore();
	const { isProjectFilesVisible, setIsProjectFilesVisible } = useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);
	const [showFiles, setShowFiles] = useState(false);
	const openConnectionFromChatbot = () => {
		setIsConnectionLoadingFromChatbot(true);
		setTimeout(() => {
			setIsConnectionLoadingFromChatbot(false);
		}, 1800);
	};

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

		const projectFilesSidebarVisible = !!isProjectFilesVisible[projectId] || !(projectId in isProjectFilesVisible);
		if (projectFilesSidebarVisible) {
			setIsProjectFilesVisible(projectId, true);
		}
		setShowFiles(projectFilesSidebarVisible);
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
						className="absolute left-2 top-14 z-20 rounded-lg bg-gray-900 p-2 hover:bg-gray-800 lg:left-4 lg:top-7"
						data-testid="show-project-files-button"
						id="show-project-files-button"
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
