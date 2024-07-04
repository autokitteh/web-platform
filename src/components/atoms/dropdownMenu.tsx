import { DropdownMenuProps } from "@interfaces/components/dropdown";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { createPortal } from "react-dom";

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
					<div className="-top-2 absolute h-2 left-0 w-full" />

					<div className="-bottom-2 absolute h-2 left-0 w-full" />

					{children}
				</motion.div>
			) : null}
		</AnimatePresence>,
		container
	);
};
