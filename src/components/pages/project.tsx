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
import { ClarityUtils, calculatePathDepth, cn } from "@src/utilities";

import { IconButton, IconSvg, PageTitle, Tab } from "@components/atoms";
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
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const { t: tUI } = useTranslation("global", { keyPrefix: "ui.projectConfiguration" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
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
		if (!project?.name) {
			setPageTitle(t("base"));

			return;
		}
		if (project) {
			ClarityUtils.setProject(project.id, project);
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
		<>
			{isNavigationCollapsed ? (
				<div className="absolute left-1 top-1 z-navigation m-1">
					<PopoverWrapper animation="slideFromBottom" delay={500} interactionType="hover">
						<PopoverTrigger>
							<IconButton
								ariaLabel={tUI("display")}
								className="rounded-full border border-white p-1 hover:bg-gray-1250"
								onClick={showProjectNavigation}
							>
								<ArrowRightCarouselIcon className="size-3.5 fill-black stroke-black" />
							</IconButton>
						</PopoverTrigger>
						<PopoverContent className="rounded-lg border-0.5 border-white bg-black p-1 px-1.5">
							<div className="text-white">{tUI("display")}</div>
						</PopoverContent>
					</PopoverWrapper>
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
								<div className="absolute right-0 top-1 z-navigation m-1">
									<PopoverWrapper animation="slideFromBottom" delay={500} interactionType="hover">
										<PopoverTrigger>
											<IconButton
												ariaLabel={tUI("hide")}
												className="rounded-full border border-white p-1 hover:bg-gray-1250"
												onClick={hideProjectNavigation}
											>
												<ArrowLeft className="size-3.5 fill-black stroke-black" />
											</IconButton>
										</PopoverTrigger>
										<PopoverContent className="z-popover rounded-lg border-0.5 border-white bg-black p-1 px-1.5">
											<div className="text-white">{tUI("hide")}</div>
										</PopoverContent>
									</PopoverWrapper>
								</div>
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
