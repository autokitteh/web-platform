import React, { useState } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { cn } from "@utils";

interface ITabs {
	defaultValue?: string | number;
	className?: string;
	children: React.ReactNode;
}

export const Tabs = ({ defaultValue, className, children }: ITabs) => {
	const [activeTab, setActiveTab] = useState<string | number>(defaultValue || 0);
	const tabsStyle = cn("h-full", className);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={tabsStyle}>{children}</div>
		</TabsContext.Provider>
	);
};
