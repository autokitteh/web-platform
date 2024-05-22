import React, { useMemo, useState, useCallback, Suspense } from "react";
import { Close } from "@assets/image/icons";
import { Tabs, Tab, TabList, TabPanel, IconButton, Toast } from "@components/atoms";
import { AppWrapper, MapMenuFrameLayout } from "@components/templates";
import { initialProjectTabs } from "@constants";
import { useProjectStore } from "@store";
import { useTranslation } from "react-i18next";

export const Project = () => {
	const { t } = useTranslation(["errors", "buttons"]);
	const { activeTab, setActiveTab } = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

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
					<Tab ariaLabel={title} className="text-xs 3xl:text-sm flex items-center" key={title} value={title}>
						{title}
					</Tab>
				))}
				<IconButton className="bg-black p-0 w-default-icon h-default-icon hover:bg-black group ml-auto ">
					<Close className="transition w-3 h-3 fill-gray-400 group-hover:fill-white" />
				</IconButton>
			</TabList>
		),
		[]
	);

	const tabPanels = useMemo(
		() =>
			initialProjectTabs.map(({ title, component: Component }) => (
				<TabPanel key={title} value={title}>
					<Suspense fallback={t("loading", { ns: "buttons" })}>
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
