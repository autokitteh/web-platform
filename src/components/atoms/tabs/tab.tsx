import React, { useContext } from "react";

import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { TabProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Tab = ({ activeTab, ariaLabel, children, className, onClick, value }: TabProps) => {
	const { setActiveTab } = useContext(TabsContext);
	const tabStyle = cn(
		"border-b-2 cursor-pointer hover:font-bold border-transparent pb-1 tracking-tight uppercase",
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
