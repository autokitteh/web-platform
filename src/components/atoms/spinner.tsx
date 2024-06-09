import React from "react";
import { SpinnerProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Spinner = ({ size = "xl" }: SpinnerProps) => {
	const spinnerClass = cn("loader-cycle-disks before:content-loader-cycle-disks after:content-loader-cycle-disks", {
		"before:w-2 before:h-2 after:w-2 after:h-2": size === "sm",
		"before:w-4 before:h-4 after:w-4 after:h-4": size === "md",
		"before:w-6 before:h-6 after:w-6 after:h-6": size === "lg",
		"before:w-8 before:h-8 after:w-8 after:h-8": size === "xl",
	});

	return <div className={spinnerClass} />;
};
