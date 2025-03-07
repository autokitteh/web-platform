import React from "react";

import { SortDirectionVariant } from "@enums/components";
import { SortButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

import { IconButton } from "@components/atoms";
import { useTableVariant } from "@components/atoms/table";

import { SmallArrowDown } from "@assets/image";

export const SortButton = ({ ariaLabel, className, isActive, sortDirection }: Partial<SortButtonProps>) => {
	const { variant } = useTableVariant();

	const iconClass = cn("fill-gray", {
		"rotate-180": isActive && sortDirection === SortDirectionVariant.DESC,
		"fill-black": variant === "light",
	});

	const buttonClass = cn("ml-2 inline w-auto hover:bg-gray-1100", className, {
		"bg-gray-1100 opacity-100": isActive,
		"bg-gray-300 hover:bg-gray-450": variant === "light",
	});

	return (
		<IconButton ariaLabel={ariaLabel} className={buttonClass}>
			<SmallArrowDown className={iconClass} />
		</IconButton>
	);
};
