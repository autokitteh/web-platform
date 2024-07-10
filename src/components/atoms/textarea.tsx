import React, { forwardRef } from "react";

import { TextArea } from "@interfaces/components";
import { cn } from "@utilities";

export const Textarea = forwardRef<HTMLTextAreaElement, Partial<TextArea>>((props, ref) => {
	const { className, disabled, isError, placeholder = "Enter text", ...rest } = props;

	const baseStyle = cn(
		"border border-gray-500 bg-black text-base text-white",
		"w-full pb-2 pl-4 pr-1.5 pt-3.5",
		"placeholder:font-light placeholder:text-white hover:placeholder:font-medium",
		"scrollbar rounded-lg transition hover:border-white focus:border-white",
		{ "border-error": isError },
		{ "pointer-events-none select-none": disabled },
		{ "placeholder:text-gray-500": disabled },
		className
	);

	return <textarea className={baseStyle} disabled={disabled} placeholder={placeholder} ref={ref} {...rest} />;
});

Textarea.displayName = "Textarea";
