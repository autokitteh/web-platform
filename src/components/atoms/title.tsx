import React from "react";
import { cn } from "@utilities/cn.utils";

export const Title = ({ children, className }: { children: React.ReactNode; className: string }) => {
	const titleClass = cn("text-lg font-bold", className);
	return <div className={titleClass}>{children}</div>;
};
