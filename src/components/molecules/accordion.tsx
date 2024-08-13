import React, { useState } from "react";

import { motion } from "framer-motion";

import { Button, IconSvg } from "@components/atoms";

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
				className="group flex w-full cursor-pointer gap-2.5 p-0 text-white hover:bg-transparent"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<IconSvg
						className="w-3.5 fill-gray-500 transition group-hover:fill-green-800"
						src={PlusAccordionIcon}
					/>
				) : (
					<IconSvg
						className="w-3.5 fill-gray-500 transition group-hover:fill-green-800"
						src={MinusAccordionIcon}
					/>
				)}

				{title}
			</Button>

			<motion.div animate={{ height: isOpen ? "auto" : 0 }} className="overflow-hidden" initial={false}>
				{isOpen ? <div className="border-b border-gray-950 py-3">{children}</div> : null}
			</motion.div>
		</div>
	);
};
