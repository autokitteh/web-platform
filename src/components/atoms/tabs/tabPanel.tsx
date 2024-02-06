import React, { useContext, useMemo } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { ITab } from "@interfaces/components";
import { cn } from "@utilities";

export const TabPanel = ({ className, value, children }: ITab) => {
	const { activeTab } = useContext(TabsContext);
	const tabPanelStyle = useMemo(() => cn("h-full", className), [className]);

	if (value !== activeTab) return null;

	return <div className={tabPanelStyle}>{children}</div>;
};
