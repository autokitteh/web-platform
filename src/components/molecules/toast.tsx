import React, { useEffect } from "react";
import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { ToasterTypes } from "@interfaces/components/toast.interface";
import { useToastStore } from "@store/useToastStore";
import { cn } from "@utilities";
import { motion, AnimatePresence } from "framer-motion";

export const Toast = () => {
	const { toasts, removeToast } = useToastStore();

	useEffect(() => {
		toasts.forEach((toast) => {
			setTimeout(() => removeToast(toast.id), 3000);
		});
	}, [toasts, removeToast]);

	const baseStyle = (toastType: ToasterTypes) =>
		cn("fixed right-20 bottom-10 z-[51] bg-black max-w-420 py-3 px-4 pl-6 border rounded-4xl", {
			"border-green-accent": toastType === "success",
			"border-error": toastType === "error",
		});

	const titleStyle = (toastType: ToasterTypes) =>
		cn("font-semibold w-full", {
			"text-green-accent": toastType === "success",
			"text-error": toastType === "error",
		});

	const variants = {
		visible: { filter: "blur(0px)", x: 0 },
		hidden: { filter: "blur(4px)", x: "100%" },
	};

	return (
		<>
			{toasts.map(({ title, message, id, type }, index) => (
				<AnimatePresence key={index}>
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
								className="bg-gray-600 p-0 w-default-icon h-default-icon group ml-auto"
								onClick={() => removeToast(id)}
							>
								<Close className="transition fill-white w-3 h-3" />
							</IconButton>
						</div>
					</motion.div>
				</AnimatePresence>
			))}
		</>
	);
};
