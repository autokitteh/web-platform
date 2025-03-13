import React, { useCallback, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { AccordionProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({
	children,
	classChildren,
	classIcon,
	className,
	classNameButton,
	closeIcon,
	openIcon,
	title,
}: AccordionProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleAccordion = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
		event.preventDefault();
		setIsOpen((prev) => !prev);
	}, []);

	const classDescription = cn("border-b border-gray-950 py-3", classChildren);
	const classSvgIcon = cn("w-3.5 fill-gray-500 transition group-hover:fill-green-800", classIcon);

	const icon = isOpen ? (
		<IconSvg className={classSvgIcon} src={closeIcon || MinusAccordionIcon} />
	) : (
		<IconSvg className={classSvgIcon} src={openIcon || PlusAccordionIcon} />
	);

	const buttonClass = cn(
		"group flex w-full cursor-pointer gap-2.5 p-0 text-white hover:bg-transparent",
		classNameButton
	);

	return (
		<div className={className}>
			<Button className={buttonClass} onClick={toggleAccordion}>
				{icon}
				{title}
			</Button>
			<AnimatePresence>
				{isOpen ? (
					<motion.div
						animate={{ height: "auto" }}
						className="overflow-hidden"
						exit={{ height: 0 }}
						initial={{ height: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className={classDescription}>{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
};
