import React from "react";
import { FrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Frame = ({ className, children }: FrameProps) => {
	const frameStyle = cn(
		"px-8 py-10 rounded-2xl w-full bg-black relative flex flex-col overflow-y-auto scrollbar",
		className
	);

	return <div className={frameStyle}>{children}</div>;
};
