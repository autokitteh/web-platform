import React from "react";
import { SmallArrowDown } from "@assets/image";
import { IconButton } from "@components/atoms";
import { ESortDirection } from "@enums/components";
import { ISortButton } from "@interfaces/components";
import { cn } from "@utilities";

export const SortButton = ({ isActive, sortDirection, onClick }: ISortButton) => {
	const iconClass = isActive && sortDirection === ESortDirection.DESC ? "rotate-180" : "";

	const buttonClass = cn("w-auto p-1 hover:bg-gray-700", { "bg-gray-700": isActive });

	return (
		<IconButton className={buttonClass} onClick={onClick}>
			<SmallArrowDown className={iconClass} />
		</IconButton>
	);
};
