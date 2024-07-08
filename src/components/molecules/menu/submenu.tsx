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
			className="scrollbar z-1 mr-2.5 h-screen w-auto overflow-auto border-l border-r border-gray-300 bg-gray-200 px-2"
			exit="hidden"
			initial="hidden"
			style={{ paddingTop: submenuInfo.top }}
			variants={submenuVariant}
		>
			{submenuInfo.submenu?.map(({ href, id, name }) => (
				<Button
					className={cn("text-fira-code whitespace-nowrap px-4 text-gray-700 hover:bg-green-light", {
						"bg-gray-700 text-white hover:bg-gray-700": id === projectId,
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
