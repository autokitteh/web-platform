import React, { useState, useLayoutEffect, useRef } from "react";
import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { ToasterTypes } from "@interfaces/components/toast.interface";
import { useToastStore } from "@store/useToastStore";
import { cn } from "@utilities";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export const Toast = () => {
	const { toasts, removeToast } = useToastStore();
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
			"border-green-accent": toastType === "success",
			"border-error": toastType === "error",
			"bg-black": !isHovered,
			"bg-gray-800": isHovered,
		});

	const titleStyle = (toastType: ToasterTypes) =>
		cn("font-semibold w-full", {
			"text-green-accent": toastType === "success",
			"text-error": toastType === "error",
		});

	const variants = {
		visible: { opacity: 1, y: 0 },
		hidden: { opacity: 0, y: 50 },
	};

	const renderToasts = () =>
		toasts.map(({ message, id, type }, index) => {
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
						ref={(el) => (toastRefs.current[index] = el)}
						transition={{ duration: 0.3 }}
						variants={variants}
					>
						<div className="flex gap-2.5" role="alert" title={title}>
							<div>
								<p className={titleStyle(type)}>{title}</p>
								{message}
							</div>
							<IconButton
								className="p-0 ml-auto bg-gray-600 w-default-icon h-default-icon group"
								onClick={() => removeToast(id)}
							>
								<Close className="w-3 h-3 transition fill-white" />
							</IconButton>
						</div>
					</motion.div>
				</AnimatePresence>
			);
		});

	return toasts.length ? renderToasts() : null;
};
