import React from "react";

import { AnimatePresence, motion } from "framer-motion";

import { DrawerProps } from "@src/interfaces/components";
import { useDrawerStore } from "@src/store";
import { cn } from "@src/utilities";

export const Drawer = ({ children, name, variant }: DrawerProps) => {
	const { isOpen, onClose } = useDrawerStore((state) => ({
		isOpen: state.drawers[name],
		onClose: state.closeDrawer,
	}));

	const baseClass = cn("bg-indigo-900 h-full w-full rounded-l-lg bg-white p-5 text-black shadow-lg", {
		"bg-gray-1100 text-white": variant === "dark",
	});

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<div className="fixed right-0 top-0 z-50 h-screen w-500 py-2">
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
						className="bg-indigo-950/30 fixed left-0 top-0 z-40 flex h-full w-full items-center justify-center backdrop-blur-sm"
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
