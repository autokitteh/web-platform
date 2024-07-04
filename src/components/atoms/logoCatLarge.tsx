import { LogoCatImage } from "@assets/image";
import { LogoCatLargeProps } from "@interfaces/components";
import { cn } from "@utilities";
import React from "react";

export const LogoCatLarge = ({ className }: LogoCatLargeProps) => {
	const logoClass = cn(
		"absolute fill-white opacity-10 pointer-events-none",
		"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7",
		className
	);

	return <LogoCatImage className={logoClass} />;
};
