import React, { useCallback, useEffect, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useCodeFixStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
} from "@src/store";
import { UserTrackingUtils, cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { CodeFixDiffEditorModal, EditorTabs, FilesDrawer } from "@components/organisms";

export const Project = () => {
	const initCache = useCacheStore((state) => state.initCache);
	const fetchManualRunConfiguration = useManualRunStore((state) => state.fetchManualRunConfiguration);
	const { projectId } = useParams();
	const getProject = useProjectStore((state) => state.getProject);
	const { codeFixData, onApprove, onReject } = useCodeFixStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);

	const openConnectionFromChatbot = useCallback(() => {
		setIsConnectionLoadingFromChatbot(true);
		setTimeout(() => {
			setIsConnectionLoadingFromChatbot(false);
		}, 1800);
	}, []);

	useEventListener(EventListenerName.openConnectionFromChatbot, openConnectionFromChatbot);

	useEffect(() => {
		if (!projectId) return;

		const loadProject = async () => {
			await initCache(projectId, true);
			fetchManualRunConfiguration(projectId);
			const { data: project } = await getProject(projectId);
			if (project) {
				UserTrackingUtils.setProject(project.id, project);
			}
		};

		loadProject();
	}, [projectId, initCache, fetchManualRunConfiguration, getProject]);

	const isProjectFilesVisibleForProject = useSharedBetweenProjectsStore(
		useCallback((state) => (projectId ? state.isProjectFilesVisible[projectId] : false), [projectId])
	);
	const setIsProjectFilesVisible = useSharedBetweenProjectsStore((state) => state.setIsProjectFilesVisible);

	const [showFiles, setShowFiles] = useState(false);

	useEffect(() => {
		if (!projectId) return;

		const projectFilesSidebarVisible = isProjectFilesVisibleForProject !== false;
		if (projectFilesSidebarVisible && isProjectFilesVisibleForProject === undefined) {
			setIsProjectFilesVisible(projectId, true);
		}
		setShowFiles(projectFilesSidebarVisible);
	}, [projectId, isProjectFilesVisibleForProject, setIsProjectFilesVisible]);

	const shouldShowProjectFiles = showFiles && isProjectFilesVisibleForProject;

	const wrapperClassName = cn("flex h-full flex-1 overflow-hidden rounded-2xl rounded-l-none", {
		"rounded-l-none": shouldShowProjectFiles,
	});

	const frameClassName = cn("size-full overflow-hidden rounded-2xl rounded-l-none pb-0", {
		"rounded-l-none": shouldShowProjectFiles,
	});

	return (
		<>
			<Outlet />
			<div className={wrapperClassName} id="project-split-frame">
				<LoadingOverlay isLoading={isConnectionLoadingFromChatbot} />
				<Frame className={frameClassName}>
					<EditorTabs />
				</Frame>
			</div>
			<FilesDrawer />
			<CodeFixDiffEditorModal
				{...codeFixData}
				onApprove={onApprove || (() => Promise.resolve())}
				onReject={onReject || (() => {})}
			/>
		</>
	);
};
