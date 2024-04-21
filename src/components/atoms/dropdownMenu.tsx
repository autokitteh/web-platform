import React from "react";
import { DropdownMenuProps } from "@interfaces/components/dropdown";
import { cn } from "@utilities";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export const DropdownMenu = ({
	isOpen,
	className,
	children,
	style,
	container = document.body,
	onMouseEnter,
	onMouseLeave,
}: DropdownMenuProps) => {
	const dropdownVariants = {
		opened: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.3 },
		},
		closed: {
			opacity: 0,
			scale: 0.95,
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
					<div className="absolute w-full left-0 h-2 -top-2" />
					<div className="absolute w-full left-0 h-2 -bottom-2" />
					{children}
				</motion.div>
			) : null}
		</AnimatePresence>,
		container
	);
};
