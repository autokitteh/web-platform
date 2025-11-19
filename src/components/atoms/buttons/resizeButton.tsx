import React from "react";

import { ResizeButtonProps } from "@interfaces/components";
import { cn } from "@utilities";

export const ResizeButton = ({ className, direction, resizeId, id, dataTestId }: ResizeButtonProps) => {
	const isVertical = direction === "vertical";

	const buttonResizeClasses = cn(
		"relative z-20 mx-auto rounded-14 bg-gray-1000 p-0.5 transition hover:bg-black",
		{
			"top w-32 cursor-ns-resize": isVertical,
			"-mx-0.5 cursor-ew-resize h-20 top-1/2 -translate-y-1/2 right-1.5": !isVertical,
		},
		className
	);

	return <div className={buttonResizeClasses} data-resize-id={resizeId} data-testid={dataTestId} id={id} />;
};
