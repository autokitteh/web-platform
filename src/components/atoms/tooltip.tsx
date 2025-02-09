import React, { useState } from "react";

import { FloatingPortal, offset, useFloating, useHover, useInteractions, shift } from "@floating-ui/react";

import { TooltipProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

export const Tooltip = ({ content, children, variant = "default" }: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "top",
		middleware: [offset(8), shift()],
	});

	const hover = useHover(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

	if (!content)
		return (
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>
		);

	return (
		<>
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>
			{isOpen ? (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className={cn("z-50 rounded-md px-3 py-2 text-sm shadow-md", {
							"bg-gray-800 text-white": variant === "default",
							"bg-white text-error-200": variant === "error",
						})}
					>
						{content}
					</div>
				</FloatingPortal>
			) : null}
		</>
	);
};
