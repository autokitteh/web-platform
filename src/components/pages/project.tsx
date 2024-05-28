import React, { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { initialProjectTabs } from "@constants";
import { useProjectStore } from "@store";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const Project = () => {
	const { projectId } = useParams();
	const { t } = useTranslation(["errors", "buttons"]);
	const { activeTab, setActiveTab, resetEditorOpenedFiles } = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	useEffect(() => {
		if (!projectId) return;

		resetEditorOpenedFiles();
	}, [projectId]);

	const handleTabChange = useCallback(
		(value: string) => {
			setActiveTab(value);
		},
		[setActiveTab]
	);

	const handleToastClose = useCallback(() => {
		setToast((prev) => ({ ...prev, isOpen: false }));
	}, []);

	const tabList = useMemo(
		() => (
			<TabList>
				{initialProjectTabs.map(({ title }) => (
					<Tab ariaLabel={title} className="flex items-center text-xs 3xl:text-sm" key={title} value={title}>
						{title}
					</Tab>
				))}
				<IconButton className="p-0 ml-auto bg-black w-default-icon h-default-icon hover:bg-black group ">
					<Close className="w-3 h-3 transition fill-gray-400 group-hover:fill-white" />
				</IconButton>
			</TabList>
		),
		[]
	);

	const tabPanels = useMemo(
		() =>
			initialProjectTabs.map(({ title, component: Component }) => (
				<TabPanel key={title} value={title}>
					<Suspense>
						<Component />
					</Suspense>
				</TabPanel>
			)),
		[]
	);

	return (
		<AppWrapper>
			<MapMenuFrameLayout>
				<Tabs defaultValue={activeTab} key={activeTab} onChange={handleTabChange}>
					{tabList}
					{tabPanels}
				</Tabs>
			</MapMenuFrameLayout>
			<Toast duration={5} isOpen={toast.isOpen} onClose={handleToastClose} title={t("error")} type="error">
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};
