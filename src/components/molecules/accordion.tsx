import React, { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

type AccordionProps = {
	children: React.ReactNode;
	className?: string;
	title: React.ReactNode;
};

export const Accordion: React.FC<AccordionProps> = ({ children, className, title }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={className}>
			<Button
				className="group flex w-full cursor-pointer gap-2.5 p-0 text-base text-white hover:bg-transparent"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<PlusAccordionIcon className="fill-gray-500 transition group-hover:fill-green-800" />
				) : (
					<MinusAccordionIcon className="fill-gray-500 transition group-hover:fill-green-800" />
				)}

				{title}
			</Button>

			<motion.div animate={{ height: isOpen ? "auto" : 0 }} className="overflow-hidden" initial={false}>
				<div className="border-b border-gray-950 py-3.5 text-base">{children}</div>
			</motion.div>
		</div>
	);
};
