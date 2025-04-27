import React, { useState } from "react";

import { FloatingPortal, offset, useFloating, useHover, useInteractions, shift } from "@floating-ui/react";

import { TooltipProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Tooltip = ({
	content,
	children,
	variant = "default",
	position = "top",
	hide,
	className,
}: TooltipProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: position,
		middleware: [offset(8), shift()],
	});

	const hover = useHover(context);
	const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

	if (!content || hide)
		return (
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>
		);

	const tooltipVariantStyle = {
		default: "bg-gray-850 text-white",
		error: "bg-white text-error-200",
	};

	return (
		<div className={className}>
			<div ref={refs.setReference} {...getReferenceProps()}>
				{children}
			</div>
			{isOpen ? (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className={cn("z-50 rounded-md px-3 py-2 text-sm shadow-md", tooltipVariantStyle[variant])}
					>
						{content}
					</div>
				</FloatingPortal>
			) : null}
		</div>
	);
};
