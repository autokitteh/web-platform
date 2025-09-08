import React from "react";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { DropdownMenuProps } from "@interfaces/components/dropdown";
import { cn } from "@utilities";

export const DropdownMenu = ({
	children,
	className,
	container = document.body,
	isOpen,
	onMouseEnter,
	onMouseLeave,
	style,
}: DropdownMenuProps) => {
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
		"absolute z-dropdown mt-1 rounded-lg border border-gray-950 bg-gray-1250 p-2.5 shadow-xl",
		"left-1/2 -translate-x-1/2 !transform",
		className
	);

	return createPortal(
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					animate="opened"
					className={menuStyle}
					exit="closed"
					initial="closed"
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					style={style}
					variants={dropdownVariants}
				>
					<div className="absolute -top-2 left-0 h-2 w-full" />

					<div className="absolute -bottom-2 left-0 h-2 w-full" />

					{children}
				</motion.div>
			) : null}
		</AnimatePresence>,
		container
	);
};
