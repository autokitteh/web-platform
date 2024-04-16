import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { fetchMenuInterval, namespaces, tabsMainFrame } from "@constants";
import { LoggerService } from "@services";
import { useProjectStore } from "@store";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Project = () => {
	const { t } = useTranslation("errors");
	const { projectId } = useParams();
	const { activeTab, loadProject, setActiveTab, getProjectVariables, getProjectResources } = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	useEffect(() => {
		if (!projectId) return;

		const fetchProject = async () => {
			const { error } = await loadProject(projectId);
			if (error) {
				setToast({ isOpen: true, message: (error as Error).message });
				LoggerService.error(
					namespaces.projectUI,
					t("projectIdNotFoundExtended", { projectId: projectId, error: (error as Error).message })
				);
				return;
			}
		};

		fetchProject();

		const intervalMenu = setInterval(() => {
			getProjectVariables();
			getProjectResources();
		}, fetchMenuInterval);
		return () => clearInterval(intervalMenu);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={activeTab} key={activeTab} onChange={setActiveTab}>
					<TabList>
						{tabsMainFrame.map(({ title, count }) => (
							<Tab ariaLabel={title} className="text-xs 3xl:text-sm" key={title} value={title}>
								{`${title} (${count})`}
							</Tab>
						))}
						<IconButton className="bg-black p-0 w-default-icon h-default-icon hover:bg-black group ml-auto ">
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{tabsMainFrame.map(({ title, content }) => (
						<TabPanel key={title} value={title}>
							{content()}
						</TabPanel>
					))}
				</Tabs>
			</MapMenuFrameLayout>
			<Toast
				className="border-error"
				duration={10}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{t("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};
