import React, { forwardRef } from "react";

import { AnimatePresence, motion } from "motion/react";

import { DropdownMenuProps } from "@interfaces/components/dropdown";
import { cn } from "@utilities";

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
	({ children, className, isOpen, onMouseEnter, onMouseLeave, style }, ref) => {
		const dropdownVariants = {
			closed: {
				opacity: 0,
				scale: 0.95,
				transition: { duration: 0.3 },
			},
			opened: {
				opacity: 1,
				scale: 1,
				transition: { duration: 0.3 },
			},
		};

		const menuStyle = cn(
			"fixed mt-1 rounded-lg border border-gray-950 bg-gray-1250 p-2.5 shadow-xl",
			"left-1/2 m-0 -translate-x-1/2 [&::backdrop]:bg-transparent",
			className
		);

		return (
			<div
				className={menuStyle}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
				popover="manual"
				ref={ref}
				style={style}
			>
				<AnimatePresence>
					{isOpen ? (
						<motion.div animate="opened" exit="closed" initial="closed" variants={dropdownVariants}>
							<div className="absolute -top-2 left-0 h-2 w-full" />

							<div className="absolute -bottom-2 left-0 h-2 w-full" />

							{children}
						</motion.div>
					) : null}
				</AnimatePresence>
			</div>
		);
	}
);

DropdownMenu.displayName = "DropdownMenu";
