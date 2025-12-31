import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { getTestIdFromText } from "../../../e2e/utils/test.utils";
import { closeToastDuration } from "@src/constants";
import { ToasterTypes } from "@src/types/components";
import { cn } from "@src/utilities";

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
	const toastRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	const startTimer = useCallback((id: string) => {
		if (timerRefs.current[id]) {
			clearTimeout(timerRefs.current[id]);
		}
		timerRefs.current[id] = setTimeout(() => removeToast(id), closeToastDuration);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleMouseEnter = useCallback((id: string) => {
		setHoveredToasts((prev) => ({ ...prev, [id]: true }));
		if (timerRefs.current[id]) {
			clearTimeout(timerRefs.current[id]);
		}
	}, []);

	const handleMouseLeave = useCallback((id: string) => {
		setHoveredToasts((prev) => ({ ...prev, [id]: false }));
		startTimer(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useLayoutEffect(() => {
		const topToasts = toasts.filter((t) => t.position === "top-right");
		const bottomToasts = toasts.filter((t) => t.position === "default" || !t.position);

		const newPositions: { [key: string]: { bottom?: number; top?: number } } = {};

		let topOffset = topToasts[0]?.offset || 15;
		topToasts.forEach((toast) => {
			newPositions[toast.id] = { top: topOffset };
			const height = toastRefs.current[toast.id]?.offsetHeight || 80;
			topOffset += height + 10;
		});

		let bottomOffset = bottomToasts[0]?.offset || 26;
		bottomToasts.forEach((toast) => {
			newPositions[toast.id] = { bottom: bottomOffset };
			const height = toastRefs.current[toast.id]?.offsetHeight || 95;
			bottomOffset += height + 10;
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
			// eslint-disable-next-line react-hooks/exhaustive-deps
			const timers = { ...timerRefs.current };
			Object.values(timers).forEach(clearTimeout);
		};
	}, [toasts, hoveredToasts, startTimer]);

	const baseStyle = useCallback(
		(type: ToasterTypes, isHovered: boolean, className = "") =>
			cn(
				"fixed right-5 z-toast max-w-420 rounded-4xl border px-4 py-3 pl-6",
				{
					"bg-black": !isHovered,
					"bg-gray-1250": isHovered,
					"border-error": type === "error",
					"border-green-800": type === "success",
					"border-yellow-500": type === "warning",
				},
				className
			),
		[]
	);

	const titleStyle = useCallback(
		(type: ToasterTypes) =>
			cn("w-full font-semibold", {
				"text-error": type === "error",
				"text-green-800": type === "success",
				"text-yellow-500": type === "warning",
			}),
		[]
	);

	const showMoreButtonStyle = (toastType: ToasterTypes) =>
		cn("cursor-pointer gap-1.5 p-0 font-medium text-error underline", {
			"text-yellow-500": toastType === "warning",
		});

	const linkIconClass = (toastType: ToasterTypes) =>
		cn("size-3.5 fill-error duration-200", {
			"fill-yellow-500": toastType === "warning",
		});

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
				}) => {
					const title = t(`titles.${type}`);
					const ariaLabel = typeof message === "string" ? message : undefined;
					const closeButtonToastTestId =
						typeof message === "string" ? getTestIdFromText("toast-close-btn", message) : undefined;
					const toastTestId = typeof message === "string" ? getTestIdFromText("toast", message) : undefined;

					return (
						<motion.div
							animate={{ opacity: 1, x: 0 }}
							className={baseStyle(type, hoveredToasts[id], className)}
							data-testid={`toast-${type}`}
							exit={{ opacity: 0, x: 50 }}
							initial={{ opacity: 0, x: 50 }}
							key={id}
							onMouseEnter={() => handleMouseEnter(id)}
							onMouseLeave={() => handleMouseLeave(id)}
							ref={(el) => (toastRefs.current[id] = el)}
							style={{
								...positions[id],
								transition: "all 0.2s ease-out",
							}}
							transition={{ duration: 0.2 }}
						>
							<div
								aria-label={ariaLabel}
								className="flex gap-2.5"
								data-testid={toastTestId}
								role="alert"
								title={title}
							>
								<div className="text-white">
									{customTitle ? customTitle : <p className={titleStyle(type)}>{title}</p>}

									<button
										className={cn("w-full border-0 bg-transparent p-0 text-left text-white", {
											"cursor-pointer": closeOnClick,
										})}
										disabled={!closeOnClick}
										onClick={() => closeOnClick && removeToast(id)}
									>
										{message}
									</button>

									{(type === "error" || type === "warning") && !hideSystemLogLinkOnError ? (
										<Button
											className={showMoreButtonStyle(type)}
											onClick={() => {
												setSystemLogHeight(systemLogHeight > 0 ? systemLogHeight : 20);
											}}
										>
											{t("showMore")}
											<ExternalLinkIcon className={linkIconClass(type)} />
										</Button>
									) : null}
								</div>

								{!hiddenCloseButton ? (
									<IconButton
										ariaLabel={`Close "${title} ${message}" toast`}
										className="group ml-auto h-default-icon w-default-icon shrink-0 bg-gray-1050 p-0"
										data-testid={closeButtonToastTestId}
										onClick={() => removeToast(id)}
										title={`Close "${title} ${message}" toast`}
									>
										<Close className="size-3 fill-white transition" />
									</IconButton>
								) : null}
							</div>
						</motion.div>
					);
				}
			)}
		</AnimatePresence>
	);
};
