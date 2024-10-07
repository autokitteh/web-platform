import React, { useContext } from "react";

import { TabProps } from "@interfaces/components";
import { cn } from "@utilities";

import { TabsContext } from "@components/atoms/tabs/tabsContext";

export const Tab = ({ activeTab, ariaLabel, children, className, onClick, title, value, variant }: TabProps) => {
	const { setActiveTab } = useContext(TabsContext);
	const tabStyle = cn(
		"cursor-pointer border-b-2 border-transparent pb-1 uppercase tracking-tight text-gray-500",
		{
			"border-white text-white": activeTab === value,
			"text-gray-1200": variant === "dark",
			"border-gray-1200": activeTab === value && variant === "dark",
		},
		className
	);

	const handleActive = () => {
		setActiveTab(value);
		if (onClick) {
			onClick();
		}
	};

	return (
		<div
			aria-label={ariaLabel}
			className={tabStyle}
			onClick={handleActive}
			onKeyDown={handleActive}
			role="tab"
			tabIndex={0}
			title={title}
		>
			{children}
		</div>
	);
};
