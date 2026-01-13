import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Outlet, useParams, useLocation } from "react-router-dom";

import { tourStepsHTMLIds } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { useEventListener } from "@src/hooks";
import {
	useConnectionStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useTourStore,
} from "@src/store";
import { UserTrackingUtils, cn } from "@src/utilities";

import { Frame } from "@components/atoms";
import { EditorTabs } from "@components/organisms";

export const Project = () => {
	const fetchManualRunConfiguration = useManualRunStore((state) => state.fetchManualRunConfiguration);
	const { projectId } = useParams();
	const getProject = useProjectStore((state) => state.getProject);
	const { setIsLoadingFromChatbot } = useConnectionStore();
	const { pathname } = useLocation();

	const openConnectionFromChatbot = useCallback(() => {
		setIsLoadingFromChatbot(true);
		setTimeout(() => {
			setIsLoadingFromChatbot(false);
		}, 1800);
	}, [setIsLoadingFromChatbot]);

	useEventListener(EventListenerName.openConnectionFromChatbot, openConnectionFromChatbot);

	useEffect(() => {
		if (!projectId) return;

		const loadProject = async () => {
			fetchManualRunConfiguration(projectId);
			const { data: project } = await getProject(projectId);
			if (project) {
				UserTrackingUtils.setProject(project.id, project);
			}
		};

		loadProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

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

	const { isOnActiveTourPage } = useTourStore();
	const isOnboardingTourActive = useMemo(() => {
		if (!projectId) return false;
		const isOnboardingTour = isOnActiveTourPage(TourId.quickstart, projectId);
		const isProjectCodePage = pathname.includes(`/projects/${projectId}/explorer`);

		return isOnboardingTour && isProjectCodePage;
	}, [isOnActiveTourPage, pathname, projectId]);

	return (
		<>
			<Outlet />
			<div className={wrapperClassName} id="project-split-frame">
				{isOnboardingTourActive ? <div id={tourStepsHTMLIds.projectCode} /> : null}
				<Frame className={frameClassName}>
					<EditorTabs />
				</Frame>
			</div>
		</>
	);
};
