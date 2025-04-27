import React from "react";

import { AnimatePresence, motion } from "motion/react";

import { BadgeProps } from "@interfaces/components";
import { cn } from "@utilities";

export const Badge = ({
	anchorOrigin = { vertical: "top", horizontal: "right" },
	ariaLabel,
	children,
	className,
	content,
	isVisible = true,
	style,
	variant,
}: BadgeProps) => {
	const badgePositionClass = cn({
		"-top-1": anchorOrigin.vertical === "top",
		"bottom-0": anchorOrigin.vertical === "bottom",
		"right-0": anchorOrigin.horizontal === "right",
		"left-0": anchorOrigin.horizontal === "left",
	});

	const badgeClass = cn(
		"flex items-center justify-center rounded-full text-white",
		"size-3 bg-white p-0.5 before:size-full before:rounded-full before:bg-error",
		variant === "dot" ? "size-2.5" : "px-2 py-0.5 text-xs",
		className
	);

	return (
		<div className="relative inline-block" style={style}>
			{children}
			<AnimatePresence>
				{isVisible ? (
					<motion.span
						animate={{ opacity: 1, scale: 1 }}
						aria-label={ariaLabel}
						className={cn(badgeClass, badgePositionClass)}
						exit={{ opacity: 0, scale: 0.8 }}
						initial={{ opacity: 0, scale: 0.8 }}
						role="status"
						transition={{ duration: 0.2 }}
					>
						{variant === "dot" ? null : content}
					</motion.span>
				) : null}
			</AnimatePresence>
		</div>
	);
};
