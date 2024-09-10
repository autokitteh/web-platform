import React, { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { Button, IconSvg } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

type AccordionProps = {
	children: React.ReactNode;
	className?: string;
	title: React.ReactNode;
};

export const Accordion = ({ children, className, title }: AccordionProps) => {
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

			<AnimatePresence>
				{isOpen ? (
					<motion.div
						animate={{ height: "auto" }}
						className="overflow-hidden"
						exit={{ height: 0 }}
						initial={{ height: 0 }}
						transition={{ duration: 0.3 }}
					>
						<div className="border-b border-gray-950 py-3">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
};
