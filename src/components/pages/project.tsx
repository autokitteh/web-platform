import React, { useEffect, useState } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { calculatePathDepth } from "@utilities";

import { Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";

export const Project = () => {
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();

	const [activeTab, setActiveTab] = useState(defaultProjectTab);

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

	return (
		<SplitFrame>
			{displayTabs ? (
				<div className="flex h-full flex-1 flex-col">
					<div className="sticky -top-8 z-20 -mt-5 bg-gray-1100 pb-0 pt-3">
						<div
							className={
								"flex select-none items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 " +
								"scrollbar shrink-0 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2"
							}
						>
							{projectTabs.map((singleTab) => (
								<Tab
									activeTab={activeTab}
									ariaLabel={singleTab.label}
									className="text-md flex items-center"
									key={singleTab.value}
									onClick={() => goTo(singleTab.value)}
									value={singleTab.value}
								>
									{singleTab.label}
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
