import React, { useState, useEffect } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { ITabs } from "@interfaces/components";
import { cn } from "@utilities";

export const Tabs = ({ defaultValue = 0, className, children, onChange }: ITabs) => {
	const [activeTab, setActiveTab] = useState<number>(defaultValue);
	const tabsStyle = cn("flex flex-col flex-1 h-full", className);

	useEffect(() => onChange?.(activeTab), [activeTab]);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={tabsStyle}>{children}</div>
		</TabsContext.Provider>
	);
};
