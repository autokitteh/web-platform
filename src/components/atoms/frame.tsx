import React from "react";
import { IFrame } from "@interfaces";
import { cn } from "@utilities";

export const Frame = ({ className, children }: IFrame) => {
	const frameStyle = cn("px-8 py-10 rounded-2xl w-full bg-black relative", className);

	return <div className={frameStyle}>{children}</div>;
};
