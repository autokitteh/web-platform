import React, { useEffect, useState } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { useFileOperations } from "@src/hooks";
import { useProjectValidationStore } from "@src/store";
import { calculatePathDepth } from "@utilities";

import { IconSvg, Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();

	const [activeTab, setActiveTab] = useState(defaultProjectTab);
	const { projectId } = useParams();
	const { projectValidationState } = useProjectValidationStore();

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[2];
		setActiveTab(activeTabIndex);
	}, [location]);

	useEffect(() => {
		if (location?.pathname) {
			const isProjectsMainView = calculatePathDepth(location.pathname) < 4;
			setDisplayTabs(isProjectsMainView);
		}
	}, [location]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};
	const { fetchResources, openFileAsActive } = useFileOperations(projectId!);

	const { fileToOpen } = location.state || {};

	const openDefaultFile = async (filename: string) => {
		await fetchResources();
		openFileAsActive(filename);
		navigate(location.pathname, { replace: true });
	};

	useEffect(() => {
		if (fileToOpen) {
			openDefaultFile(fileToOpen);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location, navigate]);

	return (
		<SplitFrame>
			{displayTabs ? (
				<div className="flex h-full flex-1 flex-col">
					<div className="sticky -top-8 z-20 -mt-5 bg-gray-1100 pb-0 pt-3">
						<div
							className={
								"flex select-none items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 " +
								"scrollbar shrink-0 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2 pb-5"
							}
						>
							{projectTabs.map((tabKey) => {
								const tabState =
									projectValidationState[tabKey.value as keyof typeof projectValidationState];
								const warning = tabState.level === "warning" ? tabState.message : "";
								const error = tabState.level === "error" ? tabState.message : "";

								return (
									<Tab
										activeTab={activeTab}
										ariaLabel={tabState?.message || tabKey.label}
										key={tabKey.value}
										onClick={() => goTo(tabKey.value)}
										title={tabState?.message || tabKey.label}
										value={tabKey.value}
									>
										<div className="flex items-center">
											<div className="tracking-wide">{tabKey.label}</div>

											{error ? (
												<div className="mb-0.5 ml-1.5 size-3 rounded-full bg-error" />
											) : null}

											{warning ? (
												<div className="relative mb-1.5 ml-1.5 size-3 rounded-full">
													<IconSvg src={WarningTriangleIcon} />
												</div>
											) : null}
										</div>
									</Tab>
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
	);
};
