import React from "react";

import { cn } from "@src/utilities";

export const Badge = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
	const badgeClass = cn("inline-flex items-center justify-center rounded-full bg-white", className);

	return <div className={badgeClass}>{children}</div>;
};
