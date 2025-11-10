import React, { useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { AccordionProps } from "@src/interfaces/components";
import { defaultSectionValidationState } from "@src/store/cache/useCacheStore";
import { cn } from "@src/utilities";

import { Button, IconSvg, FrontendProjectValidationIndicator } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({
	children,
	classChildren,
	classIcon,
	className,
	classNameButton,
	closeIcon,
	constantIcon,
	openIcon,
	title,
	hideDivider,
	id,
	frontendValidationStatus,
	isOpen: externalIsOpen,
	onToggle,
	disableAnimation = false,
	componentOnTheRight,
}: AccordionProps) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const [isUserInteraction, setIsUserInteraction] = useState(false);
	const initialOpenState = useRef<boolean | undefined>(undefined);

	const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

	useEffect(() => {
		if (initialOpenState.current === undefined) {
			initialOpenState.current = isOpen;
		}
	}, [isOpen]);

	const toggleAccordion = useCallback(
		(event: React.MouseEvent | React.KeyboardEvent) => {
			event.preventDefault();
			const newIsOpen = !isOpen;

			setIsUserInteraction(true);

			if (onToggle) {
				onToggle(newIsOpen);
			} else {
				setInternalIsOpen(newIsOpen);
			}

			setTimeout(() => setIsUserInteraction(false), 350);
		},
		[isOpen, onToggle]
	);

	const classDescription = cn(
		"border-b border-gray-950 py-3",
		{
			"border-0": hideDivider,
		},
		classChildren
	);
	const classSvgIcon = cn("w-3.5 fill-gray-500 transition group-hover:fill-green-800", classIcon);

	const icon = constantIcon ? (
		<IconSvg className={classSvgIcon} src={constantIcon} />
	) : isOpen ? (
		<IconSvg className={classSvgIcon} src={closeIcon || MinusAccordionIcon} />
	) : (
		<IconSvg className={classSvgIcon} src={openIcon || PlusAccordionIcon} />
	);

	const buttonClass = cn("group flex cursor-pointer items-center gap-2.5", classNameButton);

	const showValidationIndicator = frontendValidationStatus !== undefined;
	const indicatorProps = frontendValidationStatus ?? defaultSectionValidationState;

	return (
		<div className={className}>
			<Button
				className="mb-2 flex w-full items-center p-0 text-white hover:bg-transparent"
				id={id}
				onClick={toggleAccordion}
			>
				<div className={buttonClass}>
					{icon}
					{title}
					{showValidationIndicator ? (
						<div className="mt-0.5">
							<FrontendProjectValidationIndicator {...indicatorProps} />
						</div>
					) : null}
				</div>
				<div className="flex-1" />
				{componentOnTheRight}
			</Button>
			<AnimatePresence>
				{isOpen ? (
					<motion.div
						animate={{ height: "auto" }}
						className="overflow-hidden"
						exit={{ height: 0 }}
						initial={
							disableAnimation && !isUserInteraction && initialOpenState.current === true
								? { height: "auto" }
								: { height: 0 }
						}
						transition={{ duration: disableAnimation && !isUserInteraction ? 0 : 0.3 }}
					>
						<div className={classDescription}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
};
