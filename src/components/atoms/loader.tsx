import React from "react";
import { LoaderProps } from "@interfaces/components/loader.interface";
import { cn } from "@utilities";

export const Loader = ({ size = "xl", firstColor = "black", secondColor = "gray" }: LoaderProps) => {
	const sizeClass = cn("loader-cycle-disks", {
		"before:w-2 before:h-2 after:w-2 after:h-2": size === "sm",
		"before:w-4 before:h-4 after:w-4 after:h-4": size === "md",
		"before:w-6 before:h-6 after:w-6 after:h-6": size === "lg",
		"before:w-8 before:h-8 after:w-8 after:h-8": size === "xl",
	});

	const spinnerClass = cn(sizeClass, {
		"before:bg-red": firstColor === "red",
		"before:bg-green-accent": firstColor === "green",
		"before:bg-gray-500": firstColor === "gray",
		"before:bg-black": firstColor === "black",
		"after:bg-red": secondColor === "red",
		"after:bg-green-accent": secondColor === "green",
		"after:bg-gray-500": secondColor === "gray",
		"after:bg-black": secondColor === "black",
	});

	return <div className={spinnerClass} />;
};
