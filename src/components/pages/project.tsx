import React, { useEffect, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { triggerEvent, useEventListener } from "@src/hooks";
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

	useEffect(() => {
		triggerEvent(EventListenerName.displayProjectFilesSidebar);
	}, []);

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
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleShowProjectFiles = () => {
		if (projectId) {
			setIsProjectFilesVisible(projectId, true);
		}
	};

	// Check if project files should be visible (defaults to true if not set)
	const shouldShowProjectFiles = isProjectFilesVisible[projectId!] !== false;

	return (
		<>
			<Outlet />
			<div className="flex h-full flex-1 overflow-hidden rounded-2xl" id="project-split-frame">
				{!shouldShowProjectFiles ? (
					<Button
						ariaLabel="Show Project Files"
						className="absolute left-4 top-7 z-10 rounded-lg bg-gray-900 p-2 hover:bg-gray-800"
						onClick={handleShowProjectFiles}
					>
						<IconSvg className="fill-white" src={AssetsIcon} />
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
