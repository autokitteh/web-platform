import React from "react";
import { ITextArea } from "@interfaces/components";
import { cn } from "@utilities";

export const Textarea = ({ placeholder = "Enter text", className, error, disabled, ...rest }: Partial<ITextArea>) => {
	const baseStyle = cn(
		"text-base bg-black-900 border border-gray-500",
		"w-full pt-3.5 pb-2 pl-4 pr-1.5",
		"placeholder:font-light placeholder:text-white hover:placeholder:font-medium",
		"rounded-lg transition focus:border-white hover:border-white scrollbar",
		{ "border-error": error },
		{ "pointer-events-none select-none": disabled },
		{ "placeholder:text-gray-500": disabled },
		className
	);

	return <textarea className={baseStyle} disabled={disabled} placeholder={placeholder} {...rest} />;
};
