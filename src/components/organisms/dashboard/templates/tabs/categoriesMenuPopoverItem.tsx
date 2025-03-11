import React from "react";

import { cn } from "@src/utilities";

import { Checkbox } from "@components/atoms";

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
		"group flex cursor-pointer items-center justify-between rounded-lg transition whitespace-nowrap p-2 text-black hover:bg-gray-1050 hover:text-white mt-0.5 overflow-hidden",
		{
			"bg-gray-1050 text-white": isCurrentCategory,
		}
	);
	const labelCheckboxClass = cn("text-black group-hover:text-white", {
		"text-white": isCurrentCategory,
	});
	const checkboxClass = cn("fill-black group-hover:fill-gray-250", {
		"fill-gray-250": isCurrentCategory,
	});

	return (
		<div className={baseClass}>
			<Checkbox
				checkboxClassName={checkboxClass}
				checked={isCurrentCategory}
				isLoading={false}
				label={name}
				labelClassName={labelCheckboxClass}
			/>
			<span>{count}</span>
		</div>
	);
};
