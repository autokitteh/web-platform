import { Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";
import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { ProjectsService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { calculatePathDepth } from "@utilities";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

export const Project = () => {
	const { projectId } = useParams();
	const { getProjectResources } = useProjectStore();
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();
	const addToast = useToastStore((state) => state.addToast);

	const [activeTab, setActiveTab] = useState(defaultProjectTab);

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[2];
		setActiveTab(activeTabIndex);
	}, [location]);

	const fetchResources = async () => {
		try {
			const { data: resources, error } = await ProjectsService.getResources(projectId!);
			if (error) {
				throw error;
			}
			if (!resources) {
				return;
			}

			getProjectResources(resources);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		}
	};

	useEffect(() => {
		if (location?.pathname) {
			const isProjectsMainView = calculatePathDepth(location.pathname) < 4;
			setDisplayTabs(isProjectsMainView);
		}
	}, [location]);

	useEffect(() => {
		if (!projectId) {
			return;
		}
		fetchResources();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};

	return (
		<SplitFrame>
			{displayTabs ? (
				<div className="flex flex-1 flex-col h-full">
					<div
						className={
							"flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none" +
							"overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar"
						}
					>
						{projectTabs.map((singleTab) => (
							<Tab
								activeTab={activeTab}
								ariaLabel={singleTab.label}
								className="3xl:text-sm flex items-center text-xs"
								key={singleTab.value}
								onClick={() => goTo(singleTab.value)}
								value={singleTab.value}
							>
								{singleTab.label}
							</Tab>
						))}
					</div>

					<div className="h-full pt-2">
						<Outlet />
					</div>
				</div>
			) : (
				<Outlet />
			)}
		</SplitFrame>
	);
};
