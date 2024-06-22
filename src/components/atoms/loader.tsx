import React from "react";
import { LoaderProps } from "@interfaces/components/loader.interface";
import { cn } from "@utilities";

export const Loader = ({ size = "md", firstColor = "dark-gray", secondColor = "gray" }: LoaderProps) => {
	const sizeClass = cn("loader-cycle-disks flex items-center", {
		"w-4 before:w-2 before:h-2 after:w-2 after:h-2": size === "sm",
		"w-8 before:w-4 before:h-4 after:w-4 after:h-4": size === "md",
		"w-6 before:w-6 before:h-6 after:w-6 after:h-6": size === "lg",
		"w-16 before:w-8 before:h-8 after:w-8 after:h-8": size === "xl",
	});

	const spinnerClass = cn(sizeClass, {
		"before:bg-gray-700": firstColor === "dark-gray",
		"before:bg-gray-500": firstColor === "gray",
		"after:bg-gray-700": secondColor === "dark-gray",
		"after:bg-gray-500": secondColor === "gray",
	});

	return <div className={spinnerClass} />;
};
