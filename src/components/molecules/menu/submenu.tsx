import React from "react";
import { Button } from "@components/atoms";
import { ISubmenu } from "@interfaces/components";
import { cn } from "@utilities";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

export const Submenu = ({ submenuInfo }: ISubmenu) => {
	const { projectId } = useParams();

	const submenuVariant = {
		hidden: { opacity: 0, x: -100 },
		visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
	};

	return (
		<motion.div
			animate="visible"
			className="w-auto h-screen overflow-auto px-2 bg-gray-200 border-l border-r border-gray-300 mr-2.5 z-1 scrollbar"
			exit="hidden"
			initial="hidden"
			style={{ paddingTop: submenuInfo.top }}
			variants={submenuVariant}
		>
			{submenuInfo.submenu?.map(({ name, href, id }) => (
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
