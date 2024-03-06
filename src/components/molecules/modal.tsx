import React from "react";
import { Close } from "@assets/image/icons";
import { IconButton } from "@components/atoms";
import { IModal } from "@interfaces/components";
import { cn } from "@utilities";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

const backdropVariants = {
	hidden: { opacity: 0, transition: { duration: 0.2 } },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalVariants = {
	hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.2, delay: 0.1 } },
	visible: { opacity: 1, scale: 1, transition: { duration: 0.2, delay: 0.1 } },
};

export const Modal = ({ className, isOpen, children, onClose }: IModal) => {
	const wrapperClass = cn("fixed w-full h-full top-0 left-0 flex items-center justify-center z-50");

	const modalClasses = cn("rounded-2xl bg-white border border-gray-500 p-3.5 text-gray-800 w-500", className);

	const bgClass = cn("absolute w-full h-full top-0 left-0 bg-gray-black/50 -z-10");

	return createPortal(
		<AnimatePresence>
			{isOpen ? (
				<div className={wrapperClass}>
					<motion.div
						animate="visible"
						className={bgClass}
						exit="hidden"
						initial="hidden"
						onClick={onClose}
						variants={backdropVariants}
					/>
					<motion.div
						animate="visible"
						className={modalClasses}
						exit="hidden"
						initial="hidden"
						variants={modalVariants}
					>
						<IconButton className="bg-gray-200 p-0 w-6.5 h-6.5 group ml-auto" onClick={onClose}>
							<Close className="transition fill-black w-3 h-3 group-hover:fill-white" />
						</IconButton>
						{children}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>,
		document.body
	);
};
