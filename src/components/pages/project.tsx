import React, { useEffect, useState } from "react";
import { Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";
import { defaultProjectTab } from "@constants/project.constants";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { calculatePathDepth } from "@utilities";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

export const Project = () => {
	const { projectId } = useParams();
	const { getProjectResources } = useProjectStore();
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();

	const [activeTab, setActiveTab] = useState(defaultProjectTab);

	useEffect(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);
		const activeTabIndex = pathParts[2];
		setActiveTab(activeTabIndex);
	}, [location]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};

	const fetchResources = async () => {
		try {
			const { data: resources, error } = await ProjectsService.getResources(projectId!);
			if (error) throw error;
			if (!resources) return;

			getProjectResources(resources);
		} catch (err) {
			// setToast({ isOpen: true, message: (err as Error).message });
		}
	};

	useEffect(() => {
		if (location?.pathname) {
			const isProjectsMainView = calculatePathDepth(location.pathname) < 4;
			setDisplayTabs(isProjectsMainView);
		}
	}, [location]);

	useEffect(() => {
		if (!projectId) return;
		fetchResources();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	// const isProjectsMain = path;

	return (
		<SplitFrame>
			{displayTabs ? (
				<div className="flex flex-col flex-1 h-full">
					<div
						className={
							"flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5 select-none" +
							"overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar"
						}
					>
						<Tab
							activeTab={activeTab}
							ariaLabel="Code & Assets"
							className="flex items-center text-xs 3xl:text-sm"
							onClick={() => goTo("code")}
							value="code"
						>
							Code & Assets
						</Tab>
						<Tab
							activeTab={activeTab}
							ariaLabel="Connections"
							className="flex items-center text-xs 3xl:text-sm"
							onClick={() => goTo("connections")}
							value="connections"
						>
							Connections
						</Tab>
						<Tab
							activeTab={activeTab}
							ariaLabel="Triggers"
							className="flex items-center text-xs 3xl:text-sm"
							onClick={() => goTo("triggers")}
							value="triggers"
						>
							Triggers
						</Tab>
						<Tab
							activeTab={activeTab}
							ariaLabel="Variables"
							className="flex items-center text-xs 3xl:text-sm"
							onClick={() => goTo("variables")}
							value="variables"
						>
							Variables
						</Tab>
					</div>
					<Outlet />
				</div>
			) : (
				<Outlet />
			)}
		</SplitFrame>
	);
};
