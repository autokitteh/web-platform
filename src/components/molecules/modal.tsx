import React, { useEffect, useRef } from "react";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";

import { ModalProps } from "@interfaces/components";
import { cn } from "@utilities";

import { useModalStore } from "@store";

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

export const Modal = ({ children, className, hideCloseButton, name, wrapperClass, hideBg }: ModalProps) => {
	const { isOpen, onClose } = useModalStore((state) => ({
		isOpen: state.modals[name],
		onClose: state.closeModal,
	}));

	const modalRef = useRef<HTMLDivElement | null>(null);

	const wrapperClassName = cn("fixed left-0 top-0 z-50 flex size-full items-center justify-center", wrapperClass);
	const modalClasses = cn("w-500 rounded-2xl border border-gray-950 bg-white p-3.5 text-gray-1250", className);
	const bgClass = cn("absolute left-0 top-0 -z-10 size-full bg-black/70", { hidden: hideBg });

	useEffect(() => {
		if (isOpen && modalRef.current) {
			const buttons = modalRef.current.querySelectorAll("button");
			if (!buttons.length) return;
			(buttons[buttons.length - 1] as HTMLElement).focus();

			const focusableElements = modalRef.current.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			const firstElement = focusableElements[0];
			const lastElement = focusableElements[focusableElements.length - 1];

			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === "Tab") {
					if (event.shiftKey && document.activeElement === firstElement) {
						(lastElement as HTMLElement).focus();
						event.preventDefault();

						return;
					}
					if (!event.shiftKey && document.activeElement === lastElement) {
						(firstElement as HTMLElement).focus();
						event.preventDefault();

						return;
					}
				}

				if (event.key === "Escape" && isOpen) {
					event.preventDefault();
					onClose(name);
				}
			};

			document.addEventListener("keydown", handleKeyDown);

			return () => {
				document.removeEventListener("keydown", handleKeyDown);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	return createPortal(
		<AnimatePresence>
			{isOpen ? (
				<div className={wrapperClassName}>
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
						ref={modalRef}
						variants={modalVariants}
					>
						{hideCloseButton ? null : (
							<div className="relative w-full">
								<IconButton
									className="group absolute right-0 h-default-icon w-default-icon bg-gray-250 p-0"
									onClick={() => onClose(name)}
								>
									<Close className="size-3 fill-black transition group-hover:fill-white" />
								</IconButton>
							</div>
						)}

						{children}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>,
		document.body
	);
};
