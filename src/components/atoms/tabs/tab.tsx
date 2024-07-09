import React, { useContext } from "react";

import { TabProps } from "@interfaces/components";
import { cn } from "@utilities";

import { TabsContext } from "@components/atoms/tabs/tabsContext";

export const Tab = ({ activeTab, ariaLabel, children, className, onClick, value }: TabProps) => {
	const { setActiveTab } = useContext(TabsContext);
	const tabStyle = cn(
		"cursor-pointer border-b-2 border-transparent pb-1 uppercase tracking-tight hover:font-bold",
		{
			"border-white font-bold": activeTab === value,
		},
		className
	);

	const handleActive = () => {
		setActiveTab(value);
		onClick && onClick();
	};

	return (
		<button aria-label={ariaLabel} className={tabStyle} onClick={handleActive} onKeyDown={handleActive} role="tab">
			{children}
		</button>
	);
};
