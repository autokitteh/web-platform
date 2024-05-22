import React, { useState, useLayoutEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { initialProjectTabs } from "@constants";
import { useProjectStore } from "@store";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Project = () => {
	const { t } = useTranslation("errors");
	const { projectId } = useParams();
	const { activeTab, loadProject, setActiveTab } = useProjectStore();
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

	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={activeTab} key={activeTab} onChange={setActiveTab}>
					<TabList>
						{initialProjectTabs.map(({ title }) => (
							<Tab ariaLabel={title} className="text-xs 3xl:text-sm flex items-center" key={title} value={title}>
								{title}
							</Tab>
						))}
						<IconButton className="bg-black p-0 w-default-icon h-default-icon hover:bg-black group ml-auto ">
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{initialProjectTabs.map(({ title, content }) => (
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
