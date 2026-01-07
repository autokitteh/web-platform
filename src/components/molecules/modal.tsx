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

export const Modal = ({
	"data-testid": dataTestId,
	children,
	className,
	hideCloseButton,
	closeButtonClass,
	name,
	focusTabIndexOnLoad,
	wrapperClass,
	hideOverlay,
	forceOpen,
	onCloseCallbackOverride,
	clickOverlayToClose,
	variant,
}: ModalProps) => {
	const { isOpen, onClose } = useModalStore((state) => {
		const onClose = state.closeModal;
		return {
			isOpen: forceOpen || state.modals[name],
			onClose: onCloseCallbackOverride ? () => onCloseCallbackOverride() : onClose,
		};
	});

	const modalRef = useRef<HTMLDivElement | null>(null);

	const wrapperClassName = cn("fixed left-0 top-0 z-modal flex size-full items-center justify-center", wrapperClass);
	const modalClasses = cn(
		"w-500 rounded-2xl border p-3.5",
		{
			"border-gray-950 bg-white text-gray-1250": variant !== "dark",
			"border-gray-700 bg-gray-950 text-white": variant === "dark",
		},
		className
	);
	const bgClass = cn("absolute left-0 top-0 z-modal-overlay size-full bg-black/70");
	const closeButtonClasseName = cn(
		"group ml-auto h-default-icon w-default-icon p-0",
		{
			"bg-gray-250": variant !== "dark",
			"bg-gray-800": variant === "dark",
		},
		closeButtonClass
	);
	useEffect(() => {
		if (isOpen && modalRef.current) {
			const buttons = modalRef.current.querySelectorAll("button");
			const focusTabIndex =
				focusTabIndexOnLoad && focusTabIndexOnLoad >= 0
					? focusTabIndexOnLoad
					: buttons.length >= 1
						? buttons.length - 1
						: undefined;
			if (focusTabIndex === undefined || focusTabIndex < 0) return;
			(buttons[focusTabIndex] as HTMLElement).focus();

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
				<>
					{hideOverlay ? null : (
						<motion.div
							animate="visible"
							className={bgClass}
							exit="hidden"
							initial="hidden"
							onClick={() => clickOverlayToClose !== false && onClose(name)}
							variants={backdropVariants}
						/>
					)}
					<div className={wrapperClassName} data-testid={dataTestId}>
						<motion.div
							animate="visible"
							className={modalClasses}
							exit="hidden"
							initial="hidden"
							ref={modalRef}
							variants={modalVariants}
						>
							{hideCloseButton ? null : (
								<IconButton className={closeButtonClasseName} onClick={() => onClose(name)}>
									<Close
										className={cn("size-3 transition", {
											"fill-black group-hover:fill-white": variant !== "dark",
											"fill-gray-400 group-hover:fill-white": variant === "dark",
										})}
									/>
								</IconButton>
							)}

							<span className="z-modal"> {children}</span>
						</motion.div>
					</div>
				</>
			) : null}
		</AnimatePresence>,
		document.body
	);
};
