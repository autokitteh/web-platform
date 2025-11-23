import * as React from "react";

import { PopoverContentBase } from "./popoverContentBase";
import { usePopoverContext } from "@contexts/usePopover";
import { cn } from "@src/utilities/cn.utils";

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function PopoverContent(
	{ style, className, ...props },
	propRef
) {
	const { context: floatingContext, ...context } = usePopoverContext();
	const contentClass = cn(
		"fixed mt-1 rounded-lg border border-gray-950 bg-gray-1250 p-2.5 shadow-xl",
		"left-1/2 m-0 -translate-x-1/2 [&::backdrop]:bg-transparent",
		className
	);
	return (
		<PopoverContentBase
			className={contentClass}
			context={context}
			floatingContext={floatingContext}
			style={style}
			{...props}
			ref={propRef}
		/>
	);
});
