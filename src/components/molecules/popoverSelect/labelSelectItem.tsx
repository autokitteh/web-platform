import React from "react";

import { cn } from "@src/utilities";

import { Checkbox, IconSvg } from "@components/atoms";

export const LabelSelectPopoverItem = ({
	name,
	count,
	isActiveItem,
	icon,
	showCheckbox = true,
}: {
	count?: number;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	isActiveItem: boolean;
	name: string;
	showCheckbox?: boolean;
}) => {
	const baseClass = cn(
		"group flex items-center justify-between whitespace-nowrap rounded-lg p-2 text-black transition",
		"pointer-events-none mt-0.5 select-none gap-2 overflow-hidden hover:bg-gray-1050 hover:text-white",
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
			<div className="flex items-center gap-1 truncate">
				{icon ? (
					<div className="mr-2 rounded-full bg-gray-400 p-1">
						<IconSvg src={icon} />
					</div>
				) : showCheckbox ? (
					<Checkbox
						checkboxClassName={checkboxClass}
						checked={isActiveItem}
						className="shrink-0 p-0"
						isLoading={false}
						label=" "
						labelClassName={labelCheckboxClass}
					/>
				) : null}
				{name}
			</div>
			<span className="shrink-0">{count}</span>
		</div>
	);
};
