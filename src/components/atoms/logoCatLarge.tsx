import React from "react";

import { LogoCatLargeProps } from "@interfaces/components";
import { cn } from "@utilities";

import { LogoCatImage } from "@assets/image";

export const LogoCatLarge = ({ className }: LogoCatLargeProps) => {
	const logoClass = cn(
		"pointer-events-none absolute fill-white opacity-10",
		"-bottom-10 right-2 max-w-72 2xl:bottom-7 2xl:right-7 2xl:max-w-80 3xl:max-w-420",
		className
	);

	return <LogoCatImage className={logoClass} />;
};
