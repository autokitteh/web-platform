import React, { useState, useEffect } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { ITabs } from "@interfaces/components";
import { TabValueType } from "@type/components";
import { cn } from "@utilities";

export const Tabs = ({ value = "", className, children, onChange }: ITabs) => {
	const [activeTab, setActiveTab] = useState<TabValueType>(value);
	const tabsStyle = cn("flex flex-col flex-1 h-full", className);

	useEffect(() => onChange?.(activeTab), [activeTab]);

	useEffect(() => setActiveTab(value), [value]);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={tabsStyle}>{children}</div>
		</TabsContext.Provider>
	);
};
