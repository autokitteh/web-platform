import React from "react";

import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

import { SubmenuProps } from "@interfaces/components";
import { cn } from "@utilities";

import { Button } from "@components/atoms";

export const Submenu = ({ submenuInfo }: SubmenuProps) => {
	const { projectId } = useParams();

	const submenuVariant = {
		hidden: { opacity: 0, x: -100 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, x: 0 },
	};

	return (
		<motion.div
			animate="visible"
			className="bg-gray-200 border-gray-300 border-l border-r h-screen mr-2.5 overflow-auto px-2 scrollbar w-auto z-1"
			exit="hidden"
			initial="hidden"
			style={{ paddingTop: submenuInfo.top }}
			variants={submenuVariant}
		>
			{submenuInfo.submenu?.map(({ href, id, name }) => (
				<Button
					className={cn("px-4 hover:bg-green-light text-fira-code text-gray-700 whitespace-nowrap", {
						"bg-gray-700 hover:bg-gray-700 text-white": id === projectId,
					})}
					href={href}
					key={id}
				>
					{name}
				</Button>
			))}
		</motion.div>
	);
};
