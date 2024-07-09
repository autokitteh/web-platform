import React from "react";

import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

import { ModalProps } from "@interfaces/components";
import { useModalStore } from "@store";
import { cn } from "@utilities";

import { IconButton } from "@components/atoms";

import { Close } from "@assets/image/icons";

const backdropVariants = {
	hidden: { opacity: 0, transition: { duration: 0.2 } },
	visible: { opacity: 1, transition: { duration: 0.2 } },
};

const modalVariants = {
	hidden: { opacity: 0, scale: 0.95, transition: { delay: 0.1, duration: 0.2 } },
	visible: { opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } },
};

export const Modal = ({ children, className, name }: ModalProps) => {
	const { isOpen, onClose } = useModalStore((state) => ({
		isOpen: state.modals[name],
		onClose: state.closeModal,
	}));
	const wrapperClass = cn("fixed left-0 top-0 z-40 flex h-full w-full items-center justify-center");
	const modalClasses = cn("w-500 rounded-2xl border border-gray-500 bg-white p-3.5 text-gray-800", className);
	const bgClass = cn("absolute left-0 top-0 -z-10 h-full w-full bg-gray-black/50");

	return createPortal(
		<AnimatePresence>
			{isOpen ? (
				<div className={wrapperClass}>
					<motion.div
						animate="visible"
						className={bgClass}
						exit="hidden"
						initial="hidden"
						onClick={() => onClose(name)}
						variants={backdropVariants}
					/>

					<motion.div
						animate="visible"
						className={modalClasses}
						exit="hidden"
						initial="hidden"
						variants={modalVariants}
					>
						<IconButton
							className="group ml-auto h-default-icon w-default-icon bg-gray-200 p-0"
							onClick={() => onClose(name)}
						>
							<Close className="h-3 w-3 fill-black transition group-hover:fill-white" />
						</IconButton>

						{children}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>,
		document.body
	);
};
