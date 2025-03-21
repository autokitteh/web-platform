import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { TourId } from "@src/enums";
import { useCacheStore, useManualRunStore, useProjectStore, useTourStore } from "@src/store";
import { calculatePathDepth, cn } from "@utilities";

import { IconSvg, PageTitle, Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { currentProjectId, initCache, projectValidationState } = useCacheStore();
	const { fetchManualRunConfiguration } = useManualRunStore();
	const { t } = useTranslation("global", { keyPrefix: "pageTitles" });
	const [pageTitle, setPageTitle] = useState<string>(t("base"));
	const { projectId } = useParams();
	const { getProject, setLatestOpened, projectsList } = useProjectStore();
	const { startTour, hasTourBeenCompleted } = useTourStore();

	useEffect(() => {
		if (projectsList.length === 1 && !hasTourBeenCompleted(TourId.onboarding)) {
			const timeoutId = setTimeout(() => {
				startTour(TourId.onboarding);
			}, 1000);

			return () => clearTimeout(timeoutId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

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

	return (
		<>
			<PageTitle title={pageTitle} />
			<SplitFrame>
				{displayTabs ? (
					<div className="flex h-full flex-col">
						<div className="sticky -top-8 z-10 -mt-5 bg-gray-1100 pb-0 pt-3">
							<div className="scrollbar flex shrink-0 select-none items-center overflow-x-auto overflow-y-hidden whitespace-nowrap pb-5 pt-1">
								{projectTabs.map((tabKey, index) => {
									const tabState =
										projectValidationState[tabKey.value as keyof typeof projectValidationState];
									const warning = tabState.level === "warning" ? tabState.message : "";
									const error = tabState.level === "error" ? tabState.message : "";
									const tabClass = cn("py-1 pr-1", { "ml-2": index !== 0 });

									return (
										<div className="flex items-center" key={tabKey.value}>
											{index > 0 ? <div className="mx-3 h-5 w-px bg-gray-700" /> : null}
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
									);
								})}
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
		</>
	);
};
