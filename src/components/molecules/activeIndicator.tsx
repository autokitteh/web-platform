import React from "react";

import { ActiveIndicatorProps } from "@interfaces/components";

export const ActiveIndicator: React.FC<ActiveIndicatorProps> = ({ indicatorText, className = "" }) => {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="size-2 animate-pulse rounded-full bg-green-500" />
			<span className="text-sm font-medium text-green-400">{indicatorText}</span>
		</div>
	);
};
