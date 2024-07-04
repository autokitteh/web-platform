import React, { useState } from "react";
import { PlusAccordionIcon, MinusAccordionIcon } from "@assets/image/icons";
import { Button } from "@components/atoms";
import { motion } from "framer-motion";

export const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			<Button
				className="flex items-center justify-between gap-2.5 group cursor-pointer p-0 hover:bg-transparent text-base text-white"
				onClick={() => setIsOpen(!isOpen)}
			>
				{!isOpen ? (
					<PlusAccordionIcon className="transition fill-gray-300 group-hover:fill-green-accent" />
				) : (
					<MinusAccordionIcon className="transition fill-gray-300 group-hover:fill-green-accent" />
				)}
				{title}
			</Button>
			<motion.div animate={{ height: isOpen ? "auto" : 0 }} className="overflow-hidden" initial={false}>
				<div className="py-3.5 text-base border-b border-gray-500">{children}</div>
			</motion.div>
		</div>
	);
};
