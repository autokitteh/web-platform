import React, { useEffect } from "react";
import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { IToast } from "@interfaces/components";
import { cn } from "@utilities";
import { motion, AnimatePresence } from "framer-motion";

export const Toast = ({ duration = 5, className, isOpen, children, onClose }: IToast) => {
	const baseStyle = cn("fixed right-20 bottom-10 z-50 bg-black max-w-420 py-3 px-4 pl-6 border rounded-4xl", className);

	const variants = {
		visible: { filter: "blur(0px)", x: 0 },
		hidden: { filter: "blur(4px)", x: "100%" },
	};

	useEffect(() => {
		if (isOpen) {
			const timerId = setTimeout(onClose, duration * 1000);

			return () => clearTimeout(timerId);
		}
	}, [isOpen, duration, onClose]);

	return (
		<AnimatePresence>
			{isOpen ? (
				<motion.div
					animate="visible"
					className={baseStyle}
					exit="hidden"
					initial="hidden"
					transition={{ duration: 0.4 }}
					variants={variants}
				>
					<div className="flex justify-between items-center gap-2.5">
						<div>{children}</div>
						<IconButton className="bg-gray-600 p-0 w-6.5 h-6.5 group ml-auto" onClick={onClose}>
							<Close className="transition fill-white w-3 h-3" />
						</IconButton>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
