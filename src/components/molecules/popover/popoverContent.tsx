import * as React from "react";

import { PopoverContentBase } from "./popoverContentBase";
import { usePopoverContext } from "@contexts/usePopover";

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(function PopoverContent(
	{ style, ...props },
	propRef
) {
	const { context: floatingContext, ...context } = usePopoverContext();

	return (
		<PopoverContentBase
			context={context}
			floatingContext={floatingContext}
			style={style}
			{...props}
			ref={propRef}
		/>
	);
});
