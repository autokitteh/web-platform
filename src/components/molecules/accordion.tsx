import React, { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({ children, className, title }: { children: React.ReactNode; className?: string; title: string }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={className}>
			<Button
				className="group flex cursor-pointer items-center justify-between gap-2.5 p-0 text-base text-white hover:bg-transparent"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<PlusAccordionIcon className="fill-gray-300 transition group-hover:fill-green-accent" />
				) : (
					<MinusAccordionIcon className="fill-gray-300 transition group-hover:fill-green-accent" />
				)}

				{title}
			</Button>

			<motion.div animate={{ height: isOpen ? "auto" : 0 }} className="overflow-hidden" initial={false}>
				<div className="border-b border-gray-500 py-3.5 text-base">{children}</div>
			</motion.div>
		</div>
	);
};
