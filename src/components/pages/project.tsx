/* eslint-disable no-console */
import React, { useEffect, useId, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { defaultSplitFrameSize, featureFlags } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener, useResize } from "@src/hooks";
import {
	useCacheStore,
	useDrawerStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useTourStore,
	useFileStore,
} from "@src/store";
import { calculatePathDepth, cn } from "@utilities";

import { IconButton, IconSvg, PageTitle, Tab, Frame, ResizeButton } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules/loadingOverlay";
import { SplitFrame } from "@components/organisms";
import { ChatbotIframe } from "@components/organisms/chatbotIframe";

import { ArrowLeft, Close, WarningTriangleIcon, CompressIcon, ExpandIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { initCache, projectValidationState } = useCacheStore();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const isChatbotOpen = useDrawerStore((state) => state.drawers[DrawerName.chatbot]);
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const { t: tChatbot } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { projectId } = useParams();
	const { getProject, setLatestOpened } = useProjectStore();
	const { activeTour } = useTourStore();
	const {
		setCollapsedProjectNavigation,
		collapsedProjectNavigation,
		splitScreenRatio,
		setEditorWidth,
		isChatbotFullScreen,
		setIsChatbotFullScreen,
	} = useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);
	const [chatbotConfigMode, setChatbotConfigMode] = useState(false);

	const chatbotResizeId = useId();
	const [chatbotResizeValue] = useResize({
		direction: "horizontal",
		initial: 60,
		min: 20,
		max: 80,
		id: chatbotResizeId,
	});

	const chatbotWidth = 100 - chatbotResizeValue;

	useEffect(() => {
		if (collapsedProjectNavigation[projectId!] === undefined) {
			setCollapsedProjectNavigation(projectId!, false);
		}
	}, [collapsedProjectNavigation, projectId, setCollapsedProjectNavigation]);

	const openConnectionFromChatbot = () => {
		setIsConnectionLoadingFromChatbot(true);
		setTimeout(() => {
			setIsConnectionLoadingFromChatbot(false);
		}, 1800);
	};

	useEventListener(EventListenerName.openConnectionFromChatbot, openConnectionFromChatbot);

	const fromChatbot = location.state?.fromChatbot;
	const fileToOpen = location.state?.fileToOpen;
	const { openFileAsActive } = useFileStore();

	const loadProject = async (projectId: string) => {
		await initCache(projectId, true);
		fetchManualRunConfiguration(projectId);
		const { data: project } = await getProject(projectId!);
		if (!project?.name) {
			setPageTitle(t("base"));

			return;
		}
		setPageTitle(t("template", { page: project!.name }));

		if (fromChatbot && projectId) {
			openDrawer(DrawerName.chatbot);
			setChatbotConfigMode(true);
			if (fileToOpen) openFileAsActive(fileToOpen);
		}
	};

	useEffect(() => {
		loadProject(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEffect(() => {
		return () => setPageTitle(t("base"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEventListener(EventListenerName.toggleProjectChatBot, () => {
		closeDrawer(DrawerName.chatbot);
	});

	useEventListener(EventListenerName.openAiChatbot, () => {
		setChatbotConfigMode(false);
		openDrawer(DrawerName.chatbot);
	});

	useEventListener(EventListenerName.openAiConfig, () => {
		setChatbotConfigMode(true);
		openDrawer(DrawerName.chatbot);
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
	const isNavigationCollapsed = collapsedProjectNavigation[projectId!] === true;

	const hideProjectNavigation = () => {
		console.log("hideProjectNavigation called - before:", {
			currentLeftWidth,
			collapsedState: collapsedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
		setCollapsedProjectNavigation(projectId!, true);
		setEditorWidth(projectId!, { assets: 0 });
	};

	const showProjectNavigation = () => {
		console.log("showProjectNavigation called - before:", {
			currentLeftWidth,
			collapsedState: collapsedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
		setCollapsedProjectNavigation(projectId!, false);
		setEditorWidth(projectId!, { assets: defaultSplitFrameSize.initial });
	};

	const toggleChatbotFullScreen = (isFullScreen: boolean) => {
		setIsChatbotFullScreen(projectId!, !isFullScreen);
	};

	const isTourOnTabs =
		[TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(activeTour?.tourId || "") &&
		activeTour?.currentStepIndex === 0;
	const tabsWrapperClass = cn("sticky -top-8 -mt-5 bg-gray-1100 pb-0 pt-3", { "z-[60]": isTourOnTabs });

	// If chatbot is in full screen mode, show only the chatbot
	if (featureFlags.displayChatbot && isChatbotOpen && isChatbotFullScreen[projectId!]) {
		return (
			<>
				<PageTitle title={pageTitle} />
				<div className="flex h-full flex-1 overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
					<Frame className="size-full rounded-none bg-gray-1100 p-10 text-white">
						<div className="flex h-full flex-col">
							<div className="mb-4 flex items-center justify-between">
								<h3 className="text-lg font-semibold">
									{chatbotConfigMode ? tChatbot("configTitle") : tChatbot("aiTitle")}
								</h3>
								<div className="mr-6 mt-1 flex items-center gap-2" id="chatbot-fullscreen-toggle">
									<IconButton
										ariaLabel="Exit full screen"
										className="hover:bg-gray-1000"
										// eslint-disable-next-line @typescript-eslint/no-unused-vars
										onClick={(_evt) => toggleChatbotFullScreen(isChatbotFullScreen[projectId!])}
									>
										<CompressIcon className="size-4 fill-white" />
									</IconButton>
								</div>
							</div>
							<ChatbotIframe
								className="size-full"
								configMode={chatbotConfigMode}
								projectId={projectId}
								title={tChatbot("title")}
							/>
						</div>
					</Frame>
				</div>
			</>
		);
	}

	return (
		<>
			{isNavigationCollapsed ? (
				<div className="relative" id="project-navigation-expand-button">
					<div className="absolute left-4 top-4 z-10" id="expand-project-navigation">
						<IconButton
							ariaLabel="Expand navigation"
							className="m-1 bg-gray-250 p-1.5 hover:bg-gray-1100"
							onClick={showProjectNavigation}
						>
							<ArrowLeft className="size-6 rotate-180 fill-black" />
						</IconButton>
					</div>
				</div>
			) : null}

			<PageTitle title={pageTitle} />

			<div className="flex h-full flex-1 overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
				{" "}
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
							{!isNavigationCollapsed ? (
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
							{" "}
							<Outlet />
						</div>
					)}
				</SplitFrame>
				{featureFlags.displayChatbot && isChatbotOpen ? (
					<>
						{!isChatbotFullScreen[projectId!] ? (
							<ResizeButton
								className="z-30 hover:bg-white"
								direction="horizontal"
								resizeId={chatbotResizeId}
							/>
						) : null}
						<div
							style={{
								width: isChatbotFullScreen[projectId!] ? "100%" : `${chatbotWidth}%`,
							}}
						>
							<Frame className="h-full rounded-none bg-gray-1100 p-10 text-white">
								<div className="flex h-full flex-col">
									<div className="mb-4 flex items-center justify-between">
										<h3 className="text-lg font-semibold">
											{chatbotConfigMode ? tChatbot("configTitle") : tChatbot("aiTitle")}
										</h3>
										<div
											className="mr-6 mt-1 flex items-center gap-2"
											id="chatbot-fullscreen-toggle"
										>
											<IconButton
												ariaLabel={
													isChatbotFullScreen[projectId!]
														? "Exit full screen"
														: "Enter full screen"
												}
												className="hover:bg-gray-1000"
												// eslint-disable-next-line @typescript-eslint/no-unused-vars
												onClick={(_evt) =>
													toggleChatbotFullScreen(isChatbotFullScreen[projectId!])
												}
											>
												{isChatbotFullScreen[projectId!] ? (
													<CompressIcon className="size-4 fill-white" />
												) : (
													<ExpandIcon className="size-4 fill-white" />
												)}
											</IconButton>
										</div>
									</div>
									<ChatbotIframe
										className="size-full"
										configMode={chatbotConfigMode}
										projectId={projectId}
										title={tChatbot("title")}
									/>
								</div>
							</Frame>
						</div>
					</>
				) : null}
			</div>
		</>
	);
};
