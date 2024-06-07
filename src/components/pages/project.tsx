import React, { useEffect, useState } from "react";
import { Tab, TabList } from "@components/atoms";
import { SplitFrame } from "@components/organisms";
import { ProjectsService } from "@services";
import { useProjectStore } from "@store";
import { calculatePathDepth } from "@utilities";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

export const Project = () => {
	const { projectId } = useParams();
	const { resetResources, getProjectResources } = useProjectStore();
	const navigate = useNavigate();
	const [displayTabs, setDisplayTabs] = useState(false);
	const location = useLocation();

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

		resetResources();
		fetchResources();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};

	// const isProjectsMain = path;

	return (
		<SplitFrame>
			{displayTabs ? (
				<TabList>
					<Tab
						ariaLabel="Code & Assets"
						className="flex items-center text-xs 3xl:text-sm"
						onClick={() => goTo("code")}
						value="code"
					>
						Code & Assets
					</Tab>
					<Tab
						ariaLabel="Connections"
						className="flex items-center text-xs 3xl:text-sm"
						onClick={() => goTo("connections")}
						value="connections"
					>
						Connections
					</Tab>
					<Tab
						ariaLabel="Triggers"
						className="flex items-center text-xs 3xl:text-sm"
						onClick={() => goTo("triggers")}
						value="triggers"
					>
						Triggers
					</Tab>
					<Tab
						ariaLabel="Variables"
						className="flex items-center text-xs 3xl:text-sm"
						onClick={() => goTo("variables")}
						value="variables"
					>
						Variables
					</Tab>
				</TabList>
			) : null}
			<Outlet />
		</SplitFrame>
	);
};
