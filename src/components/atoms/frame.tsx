import React from "react";
import { IFrame } from "@interfaces/components";
import { cn } from "@utilities";

export const Frame = ({ className, children }: IFrame) => {
	const frameStyle = cn("px-8 py-10 rounded-2xl w-full bg-black relative flex flex-col", className);

	return <div className={frameStyle}>{children}</div>;
};
