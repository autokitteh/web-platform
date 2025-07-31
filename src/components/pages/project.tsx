/* eslint-disable no-console */
import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { defaultSplitFrameSize } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { triggerEvent, useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useTourStore,
	useFileStore,
	useDrawerStore,
} from "@src/store";
import { calculatePathDepth, cn } from "@utilities";

import { IconButton, IconSvg, PageTitle, Tab } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { SplitFrame } from "@components/organisms";

import { ArrowLeft, Close, WarningTriangleIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { initCache, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { projectId } = useParams();
	const { getProject, setLatestOpened } = useProjectStore();
	const { activeTour } = useTourStore();
	const { setExpandedProjectNavigation, expandedProjectNavigation, splitScreenRatio, setEditorWidth } =
		useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);
	const { isDrawerOpen } = useDrawerStore();
	const [hasOpenFiles, setHasOpenFiles] = useState(false);

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

	const {
		currentProjectId,
		resources,
		loading: { code: isLoadingCode },
	} = useCacheStore();

	const { openFiles, openFileAsActive } = useFileStore();

	useEventListener(EventListenerName.openConnectionFromChatbot, openConnectionFromChatbot);

	useEffect(() => {
		const chatbotDisplayed = isDrawerOpen("chatbot");
		if (location.state?.revealStatusSidebar && !chatbotDisplayed) {
			triggerEvent(EventListenerName.displayProjectStatusSidebar);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { revealStatusSidebar: dontIncludeRevealSidebarInNewState, ...newState } = location.state || {};
			navigate(location.pathname, { state: newState });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state]);

	useEffect(() => {
		const fileToOpen = location.state?.fileToOpen;
		const fileToOpenIsOpened =
			openFiles[projectId!] && openFiles[projectId!].find((openFile) => openFile.name === fileToOpen);
		if (openFiles[projectId!]?.length > 0 && !hasOpenFiles) setHasOpenFiles(true);

		if (
			currentProjectId === projectId &&
			resources &&
			Object.values(resources).length > 0 &&
			!isLoadingCode &&
			fileToOpen &&
			!fileToOpenIsOpened
		) {
			openFileAsActive(fileToOpen);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { fileToOpen: dontIncludeFileToOpenInNewState, ...newState } = location.state || {};
			navigate(location.pathname, { state: newState });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.state, isLoadingCode, currentProjectId, projectId, resources]);

	const loadProject = async (projectId: string) => {
		await initCache(projectId, true);
		fetchManualRunConfiguration(projectId);
		const { data: project } = await getProject(projectId!);
		if (!project?.name) {
			setPageTitle(t("base"));

			return;
		}
		setPageTitle(t("template", { page: project!.name }));
	};

	useEffect(() => {
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEffect(() => {
		return () => setPageTitle(t("base"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEventListener(EventListenerName.hideProjectAiAssistantOrStatusSidebar, () => {
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

	const currentLeftWidth = splitScreenRatio[projectId!]?.assets || defaultSplitFrameSize.initial;
	const isNavigationCollapsed = expandedProjectNavigation[projectId!] === false;

	const hideProjectNavigation = () => {
		console.log("hideProjectNavigation called - before:", {
			currentLeftWidth,
			expandedState: expandedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
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
		<>
			{isNavigationCollapsed ? (
				<div className="relative" id="project-navigation-expand-button z-[99]">
					<div className="absolute left-4 top-4 z-[99]" id="expand-project-navigation">
						<IconButton
							ariaLabel="Expand navigation"
							className="z-[99] m-1 bg-gray-250 p-1.5 hover:bg-gray-1100"
							onClick={showProjectNavigation}
						>
							<ArrowLeft className="size-6 rotate-180 fill-black" />
						</IconButton>
					</div>
				</div>
			) : null}

			<PageTitle title={pageTitle} />

			<div className="flex h-full flex-1 overflow-hidden rounded-2xl" id="project-split-frame">
				<SplitFrame rightFrameClass="rounded-none">
					<LoadingOverlay isLoading={isConnectionLoadingFromChatbot} />
					{displayTabs ? (
						<div className="flex h-full flex-col">
							<div className={tabsWrapperClass}>
								<div className="scrollbar flex shrink-0 select-none items-center justify-between overflow-x-auto overflow-y-hidden whitespace-nowrap pb-5 pt-1">
									<div className="flex items-center">
										{projectTabs.map((tabKey, index) => {
											const tabState =
												projectValidationState[
													tabKey.value as keyof typeof projectValidationState
												];
											const warning = tabState.level === "warning" ? tabState.message : "";
											const error = tabState.level === "error" ? tabState.message : "";
											const tabClass = cn("py-1 pr-1", { "ml-2": index !== 0 });
											const tabWrapperClass = cn("flex items-center pr-2", {
												"pt-0.5": tabKey.value === "connections",
											});

											return (
												<div className="flex" key={tabKey.value}>
													{index > 0 ? <div className="mx-3 h-5 w-px bg-gray-700" /> : null}
													<div className={tabWrapperClass} id={tabKey.id}>
														<Tab
															activeTab={activeTab}
															ariaLabel={tabState?.message || tabKey.label}
															className={tabClass}
															onClick={() => goTo(tabKey.value)}
															title={tabState?.message || tabKey.label}
															value={tabKey.value}
														>
															<div className="flex items-center">
																<div className="tracking-wide">{tabKey.label}</div>
																{error ? (
																	<div className="mb-0.5 ml-2 size-3 rounded-full bg-error" />
																) : null}
																{warning ? (
																	<div className="relative mb-1.5 ml-2 size-3 rounded-full">
																		<IconSvg src={WarningTriangleIcon} />
																	</div>
																) : null}
															</div>
														</Tab>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>
							{!isNavigationCollapsed && hasOpenFiles ? (
								<IconButton
									ariaLabel="Collapse navigation"
									className="absolute right-2 top-5 z-10 m-1 p-1.5 pr-0 hover:bg-gray-1100"
									onClick={hideProjectNavigation}
								>
									<Close className="size-4 fill-white" />
								</IconButton>
							) : null}
							<div className="h-full">
								<Outlet />
							</div>
						</div>
					) : (
						<div className="h-full">
							<Outlet />
						</div>
					)}
				</SplitFrame>
			</div>
		</>
	);
};
