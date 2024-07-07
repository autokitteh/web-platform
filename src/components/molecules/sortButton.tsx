import React from "react";

import { SortDirectionVariant } from "@enums/components";
import { SortButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconButton } from "@components/atoms";

import { SmallArrowDown } from "@assets/image";

export const SortButton = ({ ariaLabel, className, isActive, sortDirection }: Partial<SortButtonProps>) => {
	const iconClass = isActive && sortDirection === SortDirectionVariant.DESC ? "rotate-180" : "";

	const buttonClass = cn("w-auto p-1 hover:bg-gray-700", className, { "bg-gray-700 opacity-100": isActive });

	return (
		<IconButton ariaLabel={ariaLabel} className={buttonClass}>
			<SmallArrowDown className={iconClass} />
		</IconButton>
	);
};
