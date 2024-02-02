import React from "react";
import { cn } from "@utils";
import { motion, AnimatePresence } from "framer-motion";

enum EDropdownMenuPlacement {
	default = "default",
	left = "left",
	right = "right",
}

type TDropdownMenuVariant = keyof typeof EDropdownMenuPlacement;

interface IDropdownMenu {
	placement?: TDropdownMenuVariant;
	isOpen: boolean;
	className?: string;
	children: React.ReactNode;
}

export const DropdownMenu = ({ isOpen, className, placement = "default", children }: IDropdownMenu) => {
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
		"absolute mt-2 p-2.5 bg-black rounded-lg border border-gray-500 shadow-xl z-50",
		{
			"left-1/2 !transform -translate-x-1/2": placement === EDropdownMenuPlacement.default,
			"right-0": placement === EDropdownMenuPlacement.left,
		},
		className
	);

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div animate="opened" className={menuStyle} exit="closed" initial="closed" variants={dropdownVariants}>
					{children}
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
