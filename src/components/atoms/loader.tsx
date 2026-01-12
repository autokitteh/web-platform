import React from "react";

import { LoaderProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Loader = ({
	className,
	firstColor = "light-gray",
	isCenter = false,
	secondColor = "gray",
	size = "md",
}: LoaderProps) => {
	const sizeClass = cn("loader-cycle-disks flex h-auto items-center", {
		"w-3 before:h-3 before:w-3 after:h-3 after:w-3": size === "xs",
		"w-4 before:h-2 before:w-2 after:h-2 after:w-2": size === "sm",
		"w-6 before:h-4 before:w-4 after:h-4 after:w-4": size === "md",
		"w-7 before:h-6 before:w-6 after:h-6 after:w-6": size === "lg",
		"w-16 before:h-8 before:w-8 after:h-8 after:w-8": size === "xl",
		"w-32 before:h-16 before:w-16 after:h-16 after:w-16": size === "2xl",
	});

	const spinnerClass = cn(
		sizeClass,
		{
			"after:bg-gray-950": secondColor === "gray",
			"before:bg-gray-950": firstColor === "gray",
			"after:bg-gray-1100": secondColor === "dark-gray",
			"before:bg-gray-1100": firstColor === "dark-gray",
			"after:bg-gray-300": secondColor === "light-gray",
			"before:bg-gray-500": firstColor === "light-gray",
		},
		{
			"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2": isCenter,
		},
		className
	);

	return <div className={spinnerClass} data-testid="loader" />;
};
