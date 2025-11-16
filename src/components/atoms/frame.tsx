import React, { forwardRef } from "react";

import { FrameProps } from "@interfaces/components";
import { cn } from "@utilities";

const Frame = forwardRef<HTMLDivElement, FrameProps>(({ children, className, divId }, ref) => {
	const frameStyle = cn(
		"scrollbar relative flex w-full flex-col overflow-y-auto rounded-2xl bg-black px-4 py-3 pl-8 sm:py-5 md:py-7",
		className
	);

	return (
		<div className={frameStyle} id={divId} ref={ref}>
			{children}
		</div>
	);
});

Frame.displayName = "Frame";
export { Frame };
