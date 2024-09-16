import React, { useEffect, useState } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { useFileOperations } from "@src/hooks";
import { useProjectValidationStore } from "@src/store";
import { calculatePathDepth } from "@utilities";

import { Badge, Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";

export const Project = () => {
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();

	const [activeTab, setActiveTab] = useState(defaultProjectTab);
	const { projectId } = useParams();
	const { checkState, projectValidationState } = useProjectValidationStore();

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

	useEffect(() => {
		checkState(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

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
							{projectTabs.map((tabKey, index) => (
								<Tab
									activeTab={activeTab}
									ariaLabel={
										projectValidationState[tabKey.value as keyof typeof projectValidationState] ||
										tabKey.label
									}
									key={index}
									onClick={() => goTo(tabKey.value)}
									title={
										projectValidationState[tabKey.value as keyof typeof projectValidationState] ||
										tabKey.label
									}
									value={tabKey.value}
								>
									<div className="relative">
										{projectValidationState[tabKey.value as keyof typeof projectValidationState] ? (
											<div className="absolute right-0 top-0.5">
												<Badge> </Badge>
											</div>
										) : null}

										<div>{tabKey.label}</div>
									</div>
								</Tab>
							))}
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
