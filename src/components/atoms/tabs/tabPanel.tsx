import React, { useContext } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { cn } from "@utils";

interface ITabPanel {
	className?: string;
	value: string | number;
	children: React.ReactNode | (() => JSX.Element);
}

export const TabPanel = ({ className, value, children }: ITabPanel) => {
	const { activeTab } = useContext(TabsContext);
	const tabPanelStyle = cn("h-full", className);

	if (value !== activeTab) return null;

	const content = typeof children === "function" ? React.createElement(children) : children;

	return <div className={tabPanelStyle}>{content}</div>;
};
