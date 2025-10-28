import React from "react";

import { AnimatePresence, motion } from "motion/react";
import { useParams } from "react-router-dom";

import { DrawerProps } from "@src/interfaces/components";
import { useSharedBetweenProjectsStore } from "@src/store";
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
	divId,
	isScreenHeight = true,
	position = "right",
}: DrawerProps) => {
	const { projectId } = useParams();
	const isOpen = useSharedBetweenProjectsStore(
		(state) => (projectId ? state.drawers[projectId]?.[name] : false) || isForcedOpen
	);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);

	const baseClass = cn(
		"size-full bg-white p-5 text-black shadow-lg",
		{
			"border-l border-gray-950": position === "right",
			"border-r border-gray-950": position === "left",
			"bg-gray-1100 text-white": variant === "dark",
		},
		className
	);

	const wrapperClass = cn(
		"fixed top-0 z-drawer h-full",
		{
			"right-0": position === "right",
			"left-0": position === "left",
			"w-550": !width,
			"h-full": isScreenHeight,
		},
		wrapperClassName
	);

	const wrapperStyle = width ? { width: `${width}vw` } : {};
	const animationDistance = width && typeof window !== "undefined" ? window.innerWidth * (width / 100) : 500;
	const animationX = position === "left" ? -animationDistance : animationDistance;

	const bgClass = cn("fixed left-0 top-0 z-overlay flex size-full items-center justify-center backdrop-blur-sm", {
		"backdrop-blur-none": bgTransparent,
	});

	return (
		<AnimatePresence>
			{isOpen ? (
				<>
					<div className={wrapperClass} id={divId} style={wrapperStyle}>
						<motion.aside
							animate={{
								x: 0,
								transition: { duration: 0.25 },
							}}
							className={baseClass}
							data-drawer-name={name}
							exit={{
								x: animationX,
								transition: { duration: 0.25 },
							}}
							initial={{ x: animationX }}
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
								if (projectId) {
									closeDrawer(projectId, name);
								}
								onCloseCallback?.();
							}}
						/>
					)}
				</>
			) : null}
		</AnimatePresence>
	);
};
