import React, { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { AccordionProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({
	children,
	classChildren,
	classIcon,
	className,
	customCloseIcon,
	customOpenIcon,
	title,
}: AccordionProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const classDescription = cn("border-b border-gray-950 py-3", classChildren);
	const classSvgIcon = cn("w-3.5 fill-gray-500 transition group-hover:fill-green-800", classIcon);

	return (
		<div className={className}>
			<Button
				className="group flex w-full cursor-pointer gap-2.5 p-0 text-white hover:bg-transparent"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<IconSvg className={classSvgIcon} src={customOpenIcon || PlusAccordionIcon} />
				) : (
					<IconSvg className={classSvgIcon} src={customCloseIcon || MinusAccordionIcon} />
				)}

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
