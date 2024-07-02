import React from "react";
import { FrameProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Frame = ({ className, children }: FrameProps) => {
	const frameStyle = cn("px-8 py-10 pt-9.5 rounded-2xl w-full bg-black relative flex flex-col", className);

	return <div className={frameStyle}>{children}</div>;
};
