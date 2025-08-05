import React, { useLayoutEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { ToasterTypes } from "@interfaces/components/toast.interface";
import { cn } from "@utilities";

import { useLoggerStore, useToastStore } from "@store";

import { Button, IconButton } from "@components/atoms";

import { Close, ExternalLinkIcon } from "@assets/image/icons";

export const Toast = () => {
	const { removeToast, toasts } = useToastStore();
	const { setSystemLogHeight, systemLogHeight } = useLoggerStore();
	const { t } = useTranslation("toasts");
	const toastRefs = useRef<(HTMLDivElement | null)[]>([]);
	const timerRefs = useRef<{ [id: string]: NodeJS.Timeout }>({});
	const [hoveredToasts, setHoveredToasts] = useState<{ [id: string]: boolean }>({});

	const updateToastPositions = () => {
		let currentBottom = 26;
		toastRefs.current.forEach((ref) => {
			if (ref) {
				ref.style.bottom = `${currentBottom}px`;
				currentBottom += ref.offsetHeight + 8;
			}
		});
	};

	const startTimer = (id: string) => {
		if (timerRefs.current[id]) {
			clearTimeout(timerRefs.current[id]);
		}
		timerRefs.current[id] = setTimeout(() => removeToast(id), 3000);
	};

	const pauseTimer = (id: string) => {
		if (timerRefs.current[id]) {
			clearTimeout(timerRefs.current[id]);
		}
	};

	const handleMouseEnter = (id: string) => {
		setHoveredToasts((prev) => ({ ...prev, [id]: true }));
		pauseTimer(id);
	};

	const handleMouseLeave = (id: string) => {
		setHoveredToasts((prev) => ({ ...prev, [id]: false }));
		startTimer(id);
	};

	useLayoutEffect(() => {
		toasts.forEach((toast) => {
			if (!hoveredToasts[toast.id]) {
				startTimer(toast.id);
			}
		});

		updateToastPositions();

		const currentTimerRefs = timerRefs.current;

		return () => {
			Object.values(currentTimerRefs).forEach(clearTimeout);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toasts]);

	const baseStyle = (toastType: ToasterTypes, isHovered: boolean) =>
		cn("fixed right-20 z-toast max-w-420 rounded-4xl border px-4 py-3 pl-6 transition-colors duration-200", {
			"bg-black": !isHovered,
			"bg-gray-1250": isHovered,
			"border-error": toastType === "error",
			"border-green-800": toastType === "success",
		});

	const titleStyle = (toastType: ToasterTypes) =>
		cn("w-full font-semibold", {
			"text-error": toastType === "error",
			"text-green-800": toastType === "success",
		});

	const variants = {
		hidden: { opacity: 0, y: 50 },
		visible: { opacity: 1, y: 0 },
	};

	const renderToasts = () =>
		toasts.map(({ id, message, type, hideSystemLogLinkOnError }, index) => {
			const title = t(`titles.${type}`);

			return (
				<AnimatePresence key={id}>
					<motion.div
						animate="visible"
						className={baseStyle(type, hoveredToasts[id])}
						exit="hidden"
						initial="hidden"
						key={id}
						onMouseEnter={() => handleMouseEnter(id)}
						onMouseLeave={() => handleMouseLeave(id)}
						ref={(element) => {
							toastRefs.current[index] = element;
						}}
						transition={{ duration: 0.3 }}
						variants={variants}
					>
						<div className="flex gap-2.5" role="alert" title={title}>
							<div className="text-white">
								<p className={titleStyle(type)}>{title}</p>

								{message}

								{type === "error" && !hideSystemLogLinkOnError ? (
									<Button
										className="cursor-pointer gap-1.5 p-0 font-medium text-error underline"
										onClick={() => setSystemLogHeight(systemLogHeight > 0 ? systemLogHeight : 20)}
									>
										{t("showMore")}
										<ExternalLinkIcon className="size-3.5 fill-error duration-200" />
									</Button>
								) : null}
							</div>

							<IconButton
								className="group ml-auto h-default-icon w-default-icon bg-gray-1050 p-0"
								onClick={() => removeToast(id)}
							>
								<Close className="size-3 fill-white transition" />
							</IconButton>
						</div>
					</motion.div>
				</AnimatePresence>
			);
		});

	return toasts.length ? renderToasts() : null;
};
