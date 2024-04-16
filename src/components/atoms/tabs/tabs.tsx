import React, { useState, useEffect } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { ITabs } from "@interfaces/components";
import { cn } from "@utilities";

export const Tabs = ({ defaultValue, className, children, onChange }: ITabs) => {
	const [activeTab, setActiveTab] = useState(defaultValue);
	const tabsStyle = cn("flex flex-col flex-1 h-full", className);

	useEffect(() => {
		if (activeTab) onChange?.(activeTab);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeTab]);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={tabsStyle}>{children}</div>
		</TabsContext.Provider>
	);
};
