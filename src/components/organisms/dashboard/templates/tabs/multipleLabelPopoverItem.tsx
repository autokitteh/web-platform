import React from "react";

import { cn } from "@src/utilities";

import { Checkbox, IconSvg } from "@components/atoms";

export const MultipleLabelPopoverItem = ({
	name,
	count,
	isActiveItem,
	icon,
}: {
	count?: number;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	isActiveItem: boolean;
	name: string;
}) => {
	const baseClass = cn(
		"group flex items-center justify-between rounded-lg transition whitespace-nowrap p-2 text-black",
		"hover:bg-gray-1050 hover:text-white mt-0.5 overflow-hidden pointer-events-none select-none",
		{
			"bg-gray-1050 text-white": isActiveItem,
		}
	);
	const labelCheckboxClass = cn("text-black group-hover:text-white", {
		"text-white": isActiveItem,
	});
	const checkboxClass = cn("fill-black group-hover:fill-gray-250", {
		"fill-gray-250": isActiveItem,
	});

	return (
		<div className={baseClass}>
			<div className="flex items-center">
				{icon ? (
					<div className="mr-2 rounded-full bg-gray-400 p-1">
						<IconSvg src={icon} />
					</div>
				) : (
					<Checkbox
						checkboxClassName={checkboxClass}
						checked={isActiveItem}
						isLoading={false}
						label=" "
						labelClassName={labelCheckboxClass}
					/>
				)}
				{name}
			</div>
			<span>{count}</span>
		</div>
	);
};
