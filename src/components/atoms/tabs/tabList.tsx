import React from "react";
import { cn } from "@utils";

interface ITabList {
	className?: string;
	children: React.ReactNode;
}

export const TabList = ({ className, children }: ITabList) => {
	const tablistSlyle = cn("flex items-center gap-5 overflow-x-auto overflow-y-hidden whitespace-nowrap", className);

	return <div className={tablistSlyle}>{children}</div>;
};
