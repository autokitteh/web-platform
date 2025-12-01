import React, { useEffect, useState } from "react";

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
	const { initCache } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { projectId } = useParams();
	const { getProject } = useProjectStore();
	const { codeFixData, onApprove, onReject } = useCodeFixStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const { isProjectFilesVisible, setIsProjectFilesVisible } = useSharedBetweenProjectsStore();

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

	const shouldShowProjectFiles = showFiles && !!isProjectFilesVisible[projectId!];

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
