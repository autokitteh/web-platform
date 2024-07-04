import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { ToasterTypes } from "@interfaces/components/toast.interface";
import { useToastStore } from "@store/useToastStore";
import { cn } from "@utilities";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const Toast = () => {
	const { removeToast, toasts } = useToastStore();
	const { t } = useTranslation("toasts");

	useEffect(() => {
		toasts.forEach((toast) => {
			setTimeout(() => removeToast(toast.id), 3000);
		});
	}, [toasts, removeToast]);

	const baseStyle = (toastType: ToasterTypes) =>
		cn("fixed right-20 bottom-10 z-50 bg-black max-w-420 py-3 px-4 pl-6 border rounded-4xl", {
			"border-error": toastType === "error",
			"border-green-accent": toastType === "success",
		});

	const titleStyle = (toastType: ToasterTypes) =>
		cn("font-semibold w-full", {
			"text-error": toastType === "error",
			"text-green-accent": toastType === "success",
		});

	const variants = {
		hidden: { filter: "blur(4px)", x: "100%" },
		visible: { filter: "blur(0px)", x: 0 },
	};

	const renderToasts = () =>
		toasts.map(({ id, message, type }) => {
			const title = t(`titles.${type}`);

			return (
				<AnimatePresence key={id}>
					<motion.div
						animate="visible"
						aria-label={title}
						className={baseStyle(type)}
						exit="hidden"
						initial="hidden"
						transition={{ duration: 0.4 }}
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
