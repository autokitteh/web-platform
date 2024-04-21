import React from "react";
import { TabListProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TabList = ({ className, children }: TabListProps) => {
	const tablistSlyle = cn(
		"flex items-center gap-1 xl:gap-2 2xl:gap-4 3xl:gap-5",
		"overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar",
		className
	);

	return <div className={tablistSlyle}>{children}</div>;
};
