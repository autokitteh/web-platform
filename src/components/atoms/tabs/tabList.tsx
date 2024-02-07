import React from "react";
import { ITabList } from "@interfaces/components";
import { cn } from "@utilities";

export const TabList = ({ className, children }: ITabList) => {
	const tablistSlyle = cn(
		"flex items-center gap-5 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar",
		className
	);

	return <div className={tablistSlyle}>{children}</div>;
};
