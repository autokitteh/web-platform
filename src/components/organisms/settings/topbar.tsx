import React from "react";

import { cn } from "@utilities";

export const TitleTopbar = ({ title }: { title: string }) => {
	const styleInput = cn(
		"min-w-3 rounded bg-transparent p-0 text-xl font-bold leading-6 leading-tight outline outline-0"
	);

	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-1250 py-3 pl-7 pr-3.5">
			<div className="relative flex items-end gap-3 font-fira-code text-gray-500">
				<span className={styleInput}>{title}</span>
			</div>
		</div>
	);
};
