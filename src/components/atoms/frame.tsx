import React from "react";

import { FrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Frame = ({ children, className, id }: FrameProps) => {
	const frameStyle = cn(
		"scrollbar relative flex w-full flex-col overflow-y-auto rounded-2xl bg-black px-8 py-10 pt-5",
		className
	);

	return (
		<div className={frameStyle} id={id}>
			{children}
		</div>
	);
};
