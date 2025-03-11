import React from "react";

import { cn } from "@src/utilities";

export const CategoriesMenuPopoverItem = ({
	name,
	count,
	isCurrentCategory,
}: {
	count: number;
	isCurrentCategory: boolean;
	name: string;
}) => {
	const baseClass = cn(
		"flex cursor-pointer items-center justify-between rounded-lg transition whitespace-nowrap p-2 text-black hover:bg-gray-1050 hover:text-white mt-0.5",
		{
			"bg-gray-1050 text-white": isCurrentCategory,
		}
	);

	return (
		<div className={baseClass}>
			{name} <span>{count}</span>
		</div>
	);
};
