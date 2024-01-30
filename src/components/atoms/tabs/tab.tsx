import React, { useContext } from "react";
import { TabsContext } from "@components/atoms/tabs/tabsContext";
import { cn } from "@utils";

interface ITab {
	className?: string;
	value: string | number;
	children: React.ReactNode;
}

export const Tab = ({ className, value, children }: ITab) => {
	const { activeTab, setActiveTab } = useContext(TabsContext);

	const tabStyle = cn(
		"border-b-2 cursor-pointer hover:font-bold border-transparent pb-1.5 tracking-tight",
		{
			"border-white font-bold": activeTab === value,
		},
		className
	);

	const handleActive = () => setActiveTab(value);

	return (
		<div className={tabStyle} onClick={handleActive} onKeyDown={handleActive} role="button">
			{children}
		</div>
	);
};
