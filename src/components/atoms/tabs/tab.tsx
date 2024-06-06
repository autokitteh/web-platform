import React from "react";
import { TabProps } from "@interfaces/components";
import { cn } from "@utilities";
import { useLocation } from "react-router-dom";

export const Tab = ({ className, value, ariaLabel, children, onClick }: TabProps) => {
	const location = useLocation();

	const tabStyle = cn(
		"border-b-2 cursor-pointer hover:font-bold border-transparent pb-1 tracking-tight uppercase",
		{
			"border-white font-bold": location?.pathname?.indexOf(value.toLowerCase()) !== -1,
		},
		className
	);

	return (
		<button aria-label={ariaLabel} className={tabStyle} onClick={onClick} onKeyDown={onClick} role="tab">
			{children}
		</button>
	);
};
