import React from "react";
import { cn } from "@utils";

interface ITBody {
	className?: string;
	children: React.ReactNode;
}

export const TBody = ({ className, children }: ITBody) => {
	const bodyStyle = cn("border-t border-gray-600", className);

	return (
		<div className={bodyStyle} role="rowgroup">
			{children}
		</div>
	);
};
