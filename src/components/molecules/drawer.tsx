import React from "react";

import { AnimatePresence, motion } from "motion/react";

import { DrawerProps } from "@src/interfaces/components";
import { useDrawerStore } from "@src/store";
import { cn } from "@src/utilities";

export const Drawer = ({
	children,
	className,
	isForcedOpen,
	name,
	onCloseCallback,
	variant,
	wrapperClassName,
	bgTransparent,
	bgClickable,
	width,
}: DrawerProps) => {
	const { isOpen, onClose } = useDrawerStore((state) => ({
		isOpen: state.drawers[name] || isForcedOpen,
		onClose: state.closeDrawer,
	}));

	const baseClass = cn(
		"size-full border-l border-gray-950 bg-white p-5 text-black shadow-lg",
		{
			"bg-gray-1100 text-white": variant === "dark",
		},
		className
	);

	const wrapperClass = cn(
		"fixed right-0 top-0 z-[120] h-screen",
		{
			"w-550": !width,
		},
		wrapperClassName
	);

	const wrapperStyle = width ? { width: `${width}px` } : {};

	const bgClass = cn("fixed left-0 top-0 z-40 flex size-full items-center justify-center backdrop-blur-sm", {
		"backdrop-blur-none": bgTransparent,
	});

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<div className={wrapperClass} style={wrapperStyle}>
						<motion.aside
							animate={{
								x: 0,
								transition: { duration: 0.25 },
							}}
							className={baseClass}
							exit={{
								x: width || 500,
								transition: { duration: 0.25 },
							}}
							initial={{ x: width || 500 }}
						>
							{children}
						</motion.aside>
					</div>
					{bgClickable ? null : (
						<motion.div
							animate={{
								opacity: 1,
								transition: { delay: 0.1, duration: 0.25 },
							}}
							className={bgClass}
							exit={{
								opacity: 0,
							}}
							initial={{ opacity: 0 }}
							onClick={() => {
								onClose(name);
								onCloseCallback?.();
							}}
						/>
					)}
				</>
			) : null}
		</AnimatePresence>
	);
};
