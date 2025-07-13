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
	const { currentProjectId, initCache, projectValidationState } = useCacheStore();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const isChatbotOpen = useDrawerStore((state) => state.drawers[DrawerName.chatbot]);
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const { t: tChatbot } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { projectId } = useParams();
	const { getProject, setLatestOpened } = useProjectStore();
	const { activeTour } = useTourStore();
	const { setCollapsedProjectNavigation, collapsedProjectNavigation, splitScreenRatio, setEditorWidth } =
		useSharedBetweenProjectsStore();
	const [isConnectionLoadingFromChatbot, setIsConnectionLoadingFromChatbot] = useState(false);

	// Chatbot resize functionality
	const chatbotResizeId = useId();
	const [chatbotResizeValue] = useResize({
		direction: "horizontal",
		initial: 60, // 60% for main content (40% for chatbot)
		min: 20, // minimum 20% for main content (80% max for chatbot)
		max: 80, // maximum 80% for main content (20% min for chatbot)
		id: chatbotResizeId,
	});

	// Invert the resize value so dragging left increases chatbot width
	const chatbotWidth = 100 - chatbotResizeValue;

	// Chatbot full screen state
	const [isChatbotFullScreen, setIsChatbotFullScreen] = useState(false);

	// Main content collapse state (similar to isNavigationCollapsed)
	const [isMainContentCollapsed, setIsMainContentCollapsed] = useState(false);

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
	const [chatbotInitFlag, setChatbotInitFlag] = useState(false);

	const loadProject = async (projectId: string) => {
		if (currentProjectId === projectId) return;
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

	useEffect(() => {
		if (fromChatbot && projectId) {
			openDrawer(DrawerName.chatbot);
			setChatbotInitFlag(true);
			// Clear the location state to prevent reopening on refresh
			navigate(location.pathname, { replace: true, state: {} });
		}
	}, [fromChatbot, projectId, openDrawer, navigate, location.pathname]);

	useEventListener(EventListenerName.toggleProjectChatBot, () => {
		closeDrawer(DrawerName.chatbot);
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
	// Use collapsedProjectNavigation as the source of truth instead of width calculation
	const isNavigationCollapsed = collapsedProjectNavigation[projectId!] === true;

	const hideProjectNavigation = () => {
		// eslint-disable-next-line no-console
		console.log("hideProjectNavigation called - before:", {
			currentLeftWidth,
			collapsedState: collapsedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
		setCollapsedProjectNavigation(projectId!, true);
		setEditorWidth(projectId!, { assets: 0 });
	};

	const showProjectNavigation = () => {
		// eslint-disable-next-line no-console
		console.log("showProjectNavigation called - before:", {
			currentLeftWidth,
			collapsedState: collapsedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
		setCollapsedProjectNavigation(projectId!, false);
		setEditorWidth(projectId!, { assets: defaultSplitFrameSize.initial });
	};

	// Chatbot toggle functions
	const toggleChatbotFullScreen = () => {
		setIsChatbotFullScreen(!isChatbotFullScreen);
	};

	const toggleMainContentCollapse = () => {
		setIsMainContentCollapsed(!isMainContentCollapsed);
	};

	const isTourOnTabs =
		[TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(activeTour?.tourId || "") &&
		activeTour?.currentStepIndex === 0;
	const tabsWrapperClass = cn("sticky -top-8 -mt-5 bg-gray-1100 pb-0 pt-3", { "z-[60]": isTourOnTabs });

	return (
		<>
			{/* <LoadingOverlay isLoading={isConnectionLoadingFromChatbot} /> */}
			{isNavigationCollapsed ? (
				<div className="relative">
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
			{isMainContentCollapsed && featureFlags.displayChatbot && isChatbotOpen ? (
				<div className="relative">
					<div className="absolute left-4 top-16 z-10" id="expand-main-content">
						<IconButton
							ariaLabel="Expand main content"
							className="m-1 bg-gray-250 p-1.5 hover:bg-gray-1100"
							onClick={toggleMainContentCollapse}
						>
							<ArrowLeft className="size-6 rotate-180 fill-black" />
						</IconButton>
					</div>
				</div>
			) : null}
			<PageTitle title={pageTitle} />

			<div className="flex h-full flex-1 overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
				{" "}
				<div
					className="flex flex-1 overflow-hidden"
					style={{
						width:
							featureFlags.displayChatbot && isChatbotOpen
								? isChatbotFullScreen
									? "0%"
									: isMainContentCollapsed
										? "0%"
										: `${chatbotResizeValue}%`
								: "100%",
					}}
				>
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
														{index > 0 ? (
															<div className="mx-3 h-5 w-px bg-gray-700" />
														) : null}
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
									{!isChatbotFullScreen ? (
										<IconButton
											ariaLabel="Collapse main content"
											className="hover:bg-gray-1000"
											onClick={toggleMainContentCollapse}
										>
											<Close className="size-4 fill-white" />
										</IconButton>
									) : null}
									<Outlet />
								</div>
							</div>
						) : (
							<Outlet />
						)}
					</SplitFrame>
				</div>
				{featureFlags.displayChatbot && isChatbotOpen ? (
					<>
						{!isChatbotFullScreen && !isMainContentCollapsed ? (
							<ResizeButton
								className="z-30 hover:bg-white"
								direction="horizontal"
								resizeId={chatbotResizeId}
							/>
						) : null}
						<div
							style={{
								width: isChatbotFullScreen
									? "100%"
									: isMainContentCollapsed
										? "100%"
										: `${chatbotWidth}%`,
							}}
						>
							<Frame className="h-full rounded-none bg-gray-1100 p-10 text-white">
								<div className="flex h-full flex-col">
									<div className="mb-4 flex items-center justify-between">
										<h3 className="text-lg font-semibold">{tChatbot("title")}</h3>
										<div className="flex items-center gap-2" id="chatbot-fullscreen-toggle">
											<IconButton
												ariaLabel={
													isChatbotFullScreen ? "Exit full screen" : "Enter full screen"
												}
												className="hover:bg-gray-1000"
												onClick={toggleChatbotFullScreen}
											>
												{isChatbotFullScreen ? (
													<CompressIcon className="size-4 fill-white" />
												) : (
													<ExpandIcon className="size-4 fill-white" />
												)}
											</IconButton>
										</div>
									</div>
									<div className="flex-1">
										<ChatbotIframe
											className="size-full"
											onInit={chatbotInitFlag}
											projectId={projectId}
											title={tChatbot("title")}
										/>
									</div>
								</div>
							</Frame>
						</div>
					</>
				) : null}
			</div>
		</>
	);
};
