import React, { useLayoutEffect, useRef, useState } from "react";

import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { ToasterTypes } from "@interfaces/components/toast.interface";
import { useToastStore } from "@store/useToastStore";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const Toast = () => {
	const { removeToast, toasts } = useToastStore();
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
		cn("fixed right-20 z-50 max-w-420 py-3 px-4 pl-6 border rounded-4xl transition-colors duration-200", {
			"bg-black": !isHovered,
			"bg-gray-800": isHovered,
			"border-error": toastType === "error",
			"border-green-accent": toastType === "success",
		});

	const titleStyle = (toastType: ToasterTypes) =>
		cn("font-semibold w-full", {
			"text-error": toastType === "error",
			"text-green-accent": toastType === "success",
		});

	const variants = {
		hidden: { opacity: 0, y: 50 },
		visible: { opacity: 1, y: 0 },
	};

	const renderToasts = () =>
		toasts.map(({ id, message, type }, index) => {
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
							<div>
								<p className={titleStyle(type)}>{title}</p>

								{message}
							</div>

							<IconButton
								className="bg-gray-600 group h-default-icon ml-auto p-0 w-default-icon"
								onClick={() => removeToast(id)}
							>
								<Close className="fill-white h-3 transition w-3" />
							</IconButton>
						</div>
					</motion.div>
				</AnimatePresence>
			);
		});

	return toasts.length ? renderToasts() : null;
};
