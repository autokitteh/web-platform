import React from "react";

import { SmallArrowDown } from "@assets/image";
import { IconButton } from "@components/atoms";
import { SortDirectionVariant } from "@enums/components";
import { SortButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

export const SortButton = ({ ariaLabel, className, isActive, sortDirection }: Partial<SortButtonProps>) => {
	const iconClass = isActive && sortDirection === SortDirectionVariant.DESC ? "rotate-180" : "";

	const buttonClass = cn("w-auto p-1 hover:bg-gray-700", className, { "bg-gray-700 opacity-100": isActive });

	return (
		<IconButton ariaLabel={ariaLabel} className={buttonClass}>
			<SmallArrowDown className={iconClass} />
		</IconButton>
	);
};
