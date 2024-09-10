import React, { forwardRef } from "react";

import { FrameProps } from "@interfaces/components";
import { cn } from "@utilities";

const Frame = forwardRef<HTMLDivElement, FrameProps>(({ children, className }, ref) => {
	const frameStyle = cn(
		"scrollbar relative flex w-full flex-col overflow-y-auto rounded-2xl bg-black px-8 py-10 pt-5",
		className
	);

	return (
		<div className={frameStyle} ref={ref}>
			{children}
		</div>
	);
});

Frame.displayName = "Frame";
export { Frame };
