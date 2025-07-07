import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { defaultSplitFrameSize, featureFlags } from "@src/constants";
import { EventListenerName, TourId } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import {
	useCacheStore,
	useDrawerStore,
	useManualRunStore,
	useProjectStore,
	useSharedBetweenProjectsStore,
	useTourStore,
} from "@src/store";
import { calculatePathDepth, cn } from "@utilities";

import { IconButton, IconSvg, PageTitle, Tab, Frame } from "@components/atoms";
import { SplitFrame } from "@components/organisms";
import { ChatbotIframe } from "@components/organisms/chatbotIframe";

import { ArrowLeft, WarningTriangleIcon } from "@assets/image/icons";

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

	useEffect(() => {
		if (collapsedProjectNavigation[projectId!] === undefined) {
			setCollapsedProjectNavigation(projectId!, false);
		}
	}, [collapsedProjectNavigation, projectId, setCollapsedProjectNavigation]);

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
		setCollapsedProjectNavigation(projectId!, true); // true = collapsed
		setEditorWidth(projectId!, { assets: 0 });
	};

	const showProjectNavigation = () => {
		// eslint-disable-next-line no-console
		console.log("showProjectNavigation called - before:", {
			currentLeftWidth,
			collapsedState: collapsedProjectNavigation[projectId!],
			splitScreenRatio: splitScreenRatio[projectId!],
		});
		setCollapsedProjectNavigation(projectId!, false); // false = expanded
		setEditorWidth(projectId!, { assets: defaultSplitFrameSize.initial });
	};

	const isTourOnTabs =
		[TourId.sendEmail.toString(), TourId.sendSlack.toString()].includes(activeTour?.tourId || "") &&
		activeTour?.currentStepIndex === 0;
	const tabsWrapperClass = cn("sticky -top-8 -mt-5 bg-gray-1100 pb-0 pt-3", { "z-[60]": isTourOnTabs });

	// eslint-disable-next-line no-console
	console.log("Project render:", {
		isNavigationCollapsed,
		currentLeftWidth,
		collapsedState: collapsedProjectNavigation[projectId!],
		splitScreenRatio: splitScreenRatio[projectId!],
	});

	return (
		<>
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
			<PageTitle title={pageTitle} />

			<div className="flex size-full overflow-hidden rounded-none md:mt-1.5 md:rounded-2xl">
				<SplitFrame rightFrameClass="rounded-none">
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
									{!isNavigationCollapsed ? (
										<IconButton
											ariaLabel="Collapse navigation"
											className="absolute -right-3 top-4 z-10 m-1 p-1.5 hover:bg-gray-1100"
											onClick={hideProjectNavigation}
										>
											<ArrowLeft className="size-4 fill-white" />
										</IconButton>
									) : null}
								</div>
							</div>
							<div className="h-full">
								<Outlet />
							</div>
						</div>
					) : (
						<Outlet />
					)}
				</SplitFrame>
				{featureFlags.displayChatbot && isChatbotOpen ? (
					<div className="w-1/2">
						<Frame className="mt-1.5 h-full rounded-none bg-gray-1100 p-10 text-white">
							<ChatbotIframe
								className="size-full"
								onInit={chatbotInitFlag}
								projectId={projectId}
								title={tChatbot("title")}
							/>
						</Frame>
					</div>
				) : null}
			</div>
		</>
	);
};
