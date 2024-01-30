import React from "react";
import { cn } from "@utils";

export enum EFrameColor {
	default = "default",
	darkGray = "darkGray",
}

interface IFrame {
	color?: keyof typeof EFrameColor;
	className?: string;
	children: React.ReactNode;
}

export const Frame = ({ color = "default", className, children }: IFrame) => {
	const frameStyle = cn(
		"px-8 py-10 rounded-2xl w-full bg-black relative",
		{
			"bg-gray-800": color === EFrameColor.darkGray,
		},
		className
	);

	return <div className={frameStyle}>{children}</div>;
};
