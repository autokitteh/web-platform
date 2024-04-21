import React, { useContext, useMemo } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { TabProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TabPanel = ({ className, value, children }: TabProps) => {
	const { activeTab } = useContext(TabsContext);
	const tabPanelStyle = useMemo(() => cn("flex-1", className), [className]);

	if (value !== activeTab) return null;

	return <div className={tabPanelStyle}>{children}</div>;
};
