import React, { forwardRef } from "react";
import { TextArea } from "@interfaces/components";
import { cn } from "@utilities";

export const Textarea = forwardRef<HTMLTextAreaElement, Partial<TextArea>>((props, ref) => {
	const { placeholder = "Enter text", className, isError, disabled, ...rest } = props;

	const baseStyle = cn(
		"text-base bg-black border border-gray-500",
		"w-full pt-3.5 pb-2 pl-4 pr-1.5",
		"placeholder:font-light placeholder:text-white hover:placeholder:font-medium",
		"rounded-lg transition focus:border-white hover:border-white scrollbar",
		{ "border-error": isError },
		{ "pointer-events-none select-none": disabled },
		{ "placeholder:text-gray-500": disabled },
		className
	);

	return <textarea className={baseStyle} disabled={disabled} placeholder={placeholder} ref={ref} {...rest} />;
});

Textarea.displayName = "Textarea";
