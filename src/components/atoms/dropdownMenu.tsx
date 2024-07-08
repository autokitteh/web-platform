import React from "react";

import { AnimatePresence, motion } from "framer-motion";
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
		"absolute mt-1 p-2.5 bg-black rounded-lg border border-gray-500 shadow-xl z-40",
		"left-1/2 !transform -translate-x-1/2",
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
