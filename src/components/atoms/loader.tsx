import { LoaderProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const Loader = ({
	firstColor = "dark-gray",
	isCenter = false,
	secondColor = "gray",
	size = "md",
}: LoaderProps) => {
	const sizeClass = cn("loader-cycle-disks flex items-center", {
		"w-16 before:w-8 before:h-8 after:w-8 after:h-8": size === "xl",
		"w-32 before:w-16 before:h-16 after:w-16 after:h-16": size === "2xl",
		"w-4 before:w-2 before:h-2 after:w-2 after:h-2": size === "sm",
		"w-6 before:w-6 before:h-6 after:w-6 after:h-6": size === "lg",
		"w-8 before:w-4 before:h-4 after:w-4 after:h-4": size === "md",
	});

	const spinnerClass = cn(
		sizeClass,
		{
			"after:bg-gray-500": secondColor === "gray",
			"after:bg-gray-700": secondColor === "dark-gray",
			"before:bg-gray-500": firstColor === "gray",
			"before:bg-gray-700": firstColor === "dark-gray",
		},
		{
			"absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2": isCenter,
		}
	);

	return <div className={spinnerClass} />;
};
