import React from "react";

export const TitleTopbar = ({ title }: { title: string }) => {
	return (
		<div className="flex items-center justify-between gap-5 rounded-b-xl bg-gray-1250 py-3 pl-7 pr-3.5">
			<div className="relative flex items-end gap-3 font-fira-code text-gray-500">
				<span className="min-w-3 rounded bg-transparent p-0 text-xl font-bold leading-tight outline outline-0">
					{title}
				</span>
			</div>
		</div>
	);
};
