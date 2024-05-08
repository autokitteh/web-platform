import React, { useState, useLayoutEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { initialProjectTabs } from "@constants";
import { ProjectTabs } from "@enums/components";
import { useProjectStore } from "@store";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Project = () => {
	const { t } = useTranslation("errors");
	const { projectId } = useParams();
	const {
		activeTab,
		loadProject,
		setActiveTab,
		currentProject: { variables, resources, triggers },
	} = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	useLayoutEffect(() => {
		if (!projectId) return;

		const fetchProject = async () => {
			const { error } = await loadProject(projectId);
			if (error) {
				setToast({ isOpen: true, message: (error as Error).message });
				return;
			}
		};

		fetchProject();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const projectTabsWithCount = initialProjectTabs.map((tab) => {
		switch (tab.title) {
			case ProjectTabs.codeAndAssets:
				return { ...tab, count: Object.keys(resources)?.length };
			case ProjectTabs.connections:
				return { ...tab, count: 6 };
			case ProjectTabs.triggers:
				return { ...tab, count: triggers?.length };
			case ProjectTabs.variables:
				return { ...tab, count: variables?.length };
		}
	});

	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={activeTab} key={activeTab} onChange={setActiveTab}>
					<TabList>
						{projectTabsWithCount.map(({ title, count }) => (
							<Tab ariaLabel={`${title} (${count})`} className="text-xs 3xl:text-sm" key={title} value={title}>
								{`${title} (${count})`}
							</Tab>
						))}
						<IconButton className="bg-black p-0 w-default-icon h-default-icon hover:bg-black group ml-auto ">
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{projectTabsWithCount.map(({ title, content }) => (
						<TabPanel key={title} value={title}>
							{content()}
						</TabPanel>
					))}
				</Tabs>
			</MapMenuFrameLayout>
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};
