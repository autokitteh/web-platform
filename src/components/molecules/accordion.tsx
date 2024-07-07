import React, { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({
	children,
	className,
	title,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={className}>
			<Button
				className="cursor-pointer flex gap-2.5 group hover:bg-transparent items-center justify-between p-0 text-base text-white"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<PlusAccordionIcon className="fill-gray-300 group-hover:fill-green-accent transition" />
				) : (
					<MinusAccordionIcon className="fill-gray-300 group-hover:fill-green-accent transition" />
				)}

				{title}
			</Button>

			<motion.div animate={{ height: isOpen ? "auto" : 0 }} className="overflow-hidden" initial={false}>
				<div className="border-b border-gray-500 py-3.5 text-base">{children}</div>
			</motion.div>
		</div>
	);
};
