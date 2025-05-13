import React, { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { ToastType } from "@src/types/components";
import { cn } from "@utilities";

import { useLoggerStore, useToastStore } from "@store";

import { Button, IconButton } from "@components/atoms";

import { Close, ExternalLinkIcon } from "@assets/image/icons";

export const Toast = () => {
	const { removeToast, toasts } = useToastStore();
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();
	const { t } = useTranslation("toasts");
	const [positions, setPositions] = useState<{ [key: string]: { bottom?: number; top?: number } }>({});
	const [hoveredToasts, setHoveredToasts] = useState<{ [id: string]: boolean }>({});

	const timerRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

	const startTimer = useCallback(
		(id: string) => {
			if (timerRefs.current[id]) {
				clearTimeout(timerRefs.current[id]);
			}
			timerRefs.current[id] = setTimeout(() => removeToast(id), 3000);
		},
		[removeToast]
	);

	const handleMouseEnter = useCallback((id: string) => {
		setHoveredToasts((prev) => ({ ...prev, [id]: true }));
		if (timerRefs.current[id]) {
			clearTimeout(timerRefs.current[id]);
		}
	}, []);

	const handleMouseLeave = useCallback(
		(id: string) => {
			setHoveredToasts((prev) => ({ ...prev, [id]: false }));
			startTimer(id);
		},
		[startTimer]
	);

	useEffect(() => {
		const topToasts = toasts.filter((t) => t.position === "top-right");
		const bottomToasts = toasts.filter((t) => t.position !== "top-right");

		const newPositions: { [key: string]: { bottom?: number; top?: number } } = {};
		let topOffset = topToasts[0]?.offset || 80;
		let bottomOffset = bottomToasts[0]?.offset || 15;

		topToasts.forEach((toast) => {
			newPositions[toast.id] = { top: topOffset };
			topOffset += 80;
		});

		bottomToasts.forEach((toast) => {
			newPositions[toast.id] = { bottom: bottomOffset };
			bottomOffset += 95;
		});

		setPositions(newPositions);
	}, [toasts]);

	useEffect(() => {
		toasts.forEach((toast) => {
			if (!hoveredToasts[toast.id]) {
				startTimer(toast.id);
			}
		});

		return () => {
			const timers = { ...timerRefs.current };
			Object.values(timers).forEach(clearTimeout);
		};
	}, [toasts, hoveredToasts, startTimer]);

	const baseStyle = useCallback(
		(type: ToastType, isHovered: boolean, className = "") =>
			cn(
				"fixed right-5 z-50 max-w-420 rounded-4xl border px-4 py-3 pl-6",
				{
					"bg-black": !isHovered,
					"bg-gray-1250": isHovered,
					"border-error": type === "error",
					"border-green-800": type === "success",
				},
				className
			),
		[]
	);

	const titleStyle = useCallback(
		(type: ToastType) =>
			cn("w-full font-semibold", {
				"text-error": type === "error",
				"text-green-800": type === "success",
			}),
		[]
	);

	if (!toasts.length) return null;

	return (
		<AnimatePresence mode="sync">
			{toasts.map(
				({
					type,
					id,
					className,
					customTitle,
					closeOnClick,
					message,
					hideSystemLogLinkOnError,
					hiddenCloseButton,
				}) => (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className={baseStyle(type, hoveredToasts[id], className)}
						exit={{ opacity: 0, x: 50 }}
						initial={{ opacity: 0, x: 50 }}
						key={id}
						onMouseEnter={() => handleMouseEnter(id)}
						onMouseLeave={() => handleMouseLeave(id)}
						style={{
							...positions[id],
							transition: "all 0.2s ease-out",
						}}
						transition={{ duration: 0.2 }}
					>
						<div className="flex gap-2.5" role="alert" title={t(`titles.${type}`)}>
							<div className="text-white">
								{customTitle ? customTitle : <p className={titleStyle(type)}>{t(`titles.${type}`)}</p>}

								<button
									className={cn("w-full border-0 bg-transparent p-0 text-left text-white", {
										"cursor-pointer": closeOnClick,
									})}
									disabled={!closeOnClick}
									onClick={() => closeOnClick && removeToast(id)}
								>
									{message}
								</button>

								{type === "error" && !hideSystemLogLinkOnError ? (
									<Button
										className="cursor-pointer gap-1.5 p-0 font-medium text-error underline"
										onClick={() => {
											setSystemLogHeight(systemLogHeight > 0 ? systemLogHeight : 20);
										}}
									>
										{t("showMore")}
										<ExternalLinkIcon className="size-3.5 fill-error duration-200" />
									</Button>
								) : null}
							</div>

							{!hiddenCloseButton ? (
								<IconButton
									className="group ml-auto h-default-icon w-default-icon shrink-0 bg-gray-1050 p-0"
									onClick={() => removeToast(id)}
								>
									<Close className="size-3 fill-white transition" />
								</IconButton>
							) : null}
						</div>
					</motion.div>
				)
			)}
		</AnimatePresence>
	);
};
