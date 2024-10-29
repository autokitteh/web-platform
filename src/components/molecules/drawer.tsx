import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import { DrawerProps } from "@src/interfaces/components";
import { useDrawerStore } from "@src/store";
import { cn } from "@src/utilities";

export const Drawer = ({ children, className, name, variant }: DrawerProps) => {
	const isOpen = useDrawerStore((state) => state.drawers[name]);
	const onClose = useDrawerStore((state) => state.closeDrawer);

	const baseClass = cn(
		"bg-indigo-900 h-full border-l border-gray-950 w-full bg-white p-5 text-black shadow-lg",
		{
			"bg-gray-1100 text-white": variant === "dark",
		},
		className
	);

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<div className="fixed right-0 top-0 z-50 h-screen w-550">
						<motion.aside
							animate={{
								x: 0,
								transition: { duration: 0.25 },
							}}
							className={baseClass}
							exit={{
								x: 500,
								transition: { duration: 0.25 },
							}}
							initial={{ x: 500 }}
						>
							{children}
						</motion.aside>
					</div>
					<motion.div
						animate={{
							opacity: 1,
							transition: { delay: 0.1, duration: 0.25 },
						}}
						className="fixed left-0 top-0 z-40 flex size-full items-center justify-center backdrop-blur-sm"
						exit={{
							opacity: 0,
						}}
						initial={{ opacity: 0 }}
						onClick={() => onClose(name)}
					/>
				</>
			) : null}
		</AnimatePresence>
	);
};
