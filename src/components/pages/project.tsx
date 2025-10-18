import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { defaultSplitFrameSize } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useFileStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useTourStore,
} from "@src/store";
import { calculatePathDepth, cn, UserTrackingUtils } from "@src/utilities";

import { IconButton, IconSvg, Tab } from "@components/atoms";
import { PopoverTrigger } from "@components/molecules";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { PopoverWrapper } from "@components/molecules/popover/index";
import { PopoverContent } from "@components/molecules/popover/popoverContent";
import { SplitFrame } from "@components/organisms";

import { ArrowLeft, ArrowRightCarouselIcon, WarningTriangleIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { initCache, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { openFiles } = useFileStore();
	const { t: tUI } = useTranslation("global", { keyPrefix: "ui.projectConfiguration" });
	const { projectId } = useParams();
	const { getProject, setLatestOpened } = useProjectStore();
	const { activeTour } = useTourStore();
	const { setExpandedProjectNavigation, expandedProjectNavigation, setEditorWidth } = useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);

	const [hasOpenFiles, setHasOpenFiles] = useState(false);
	useEffect(() => {
		const hasOpenFiles = !!Object.keys(openFiles);
		setHasOpenFiles(hasOpenFiles);
	}, [projectId, openFiles]);

	useEffect(() => {
		if (expandedProjectNavigation[projectId!] === undefined) {
			setExpandedProjectNavigation(projectId!, true);
		}
	}, [expandedProjectNavigation, projectId, setExpandedProjectNavigation]);

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

	useEventListener(EventListenerName.hideProjectConfigSidebar, () => {
		showProjectNavigation();
	});

	const activeTab = useMemo(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);

		return pathParts[2] || defaultProjectTab;
	}, [location.pathname]);

	const displayTabs = useMemo(
		() => calculatePathDepth(location.pathname) < 4 || location.pathname.includes("events"),
		[location.pathname]
	);

	const goTo = (path: string) => {
		setLatestOpened("tab", path, projectId!);
		navigate(path.toLowerCase());
	};

	const isNavigationCollapsed = expandedProjectNavigation[projectId!] === false;

	const hideProjectNavigation = () => {
		setExpandedProjectNavigation(projectId!, false);
		setEditorWidth(projectId!, { assets: 0 });
	};

	const showProjectNavigation = () => {
		setExpandedProjectNavigation(projectId!, true);
		setEditorWidth(projectId!, { assets: defaultSplitFrameSize.initial });
	};

	const isTourOnTabs =
		[TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(activeTour?.tourId || "") &&
		activeTour?.currentStepIndex === 0;
	const tabsWrapperClass = cn("sticky -top-8 -mt-5 bg-gray-1100 pb-0 pt-3", { "z-[60]": isTourOnTabs });

	return (
		<div className="flex h-full flex-1 overflow-hidden rounded-2xl" id="project-split-frame">
			<SplitFrame rightFrameClass="rounded-none">
				<LoadingOverlay isLoading={isConnectionLoadingFromChatbot} />
				<div className="h-full">
					<Outlet />
				</div>
			</SplitFrame>
		</div>
	);
};
