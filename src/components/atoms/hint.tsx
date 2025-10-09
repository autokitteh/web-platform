import React from "react";

import { cn } from "@utilities";

import { InfoIcon } from "@assets/image/icons";

interface HintProps {
	children: React.ReactNode;
	className?: string;
}

export const Hint: React.FC<HintProps> = ({ children, className }) => {
	return (
		<div className={cn("mt-1 flex items-start gap-1.5 text-xs text-gray-400", className)}>
			<InfoIcon className="mt-0.5 size-3 shrink-0 fill-gray-400" />
			<span>{children}</span>
		</div>
	);
};
