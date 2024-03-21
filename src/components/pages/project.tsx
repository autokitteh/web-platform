import React, { useState, useEffect } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { tabsMainFrame } from "@constants";
import { useProjectStore } from "@store";
import { useParams } from "react-router-dom";

export const Project = () => {
	const { projectId } = useParams();
	const { activeTab, loadProject, setActiveTab } = useProjectStore();
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
				return;
			}
		};

		fetchProject();
	}, [projectId]);

	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={activeTab} onChange={setActiveTab}>
					<TabList>
						{tabsMainFrame.map(({ id, title, count }) => (
							<Tab className="text-xs 3xl:text-sm" key={id} value={id}>
								{`${title} (${count})`}
							</Tab>
						))}
						<IconButton className="bg-black p-0 w-6.5 h-6.5 hover:bg-black group ml-auto ">
							<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
						</IconButton>
					</TabList>
					{tabsMainFrame.map(({ id, content }) => (
						<TabPanel key={id} value={id}>
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
				<h5 className="font-semibold">Error</h5>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};
