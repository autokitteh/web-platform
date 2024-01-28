import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@components/atoms";
import { ISubmenu } from "@components/molecules/menu";

export const Submenu = ({ submenuInfo }: ISubmenu) => {
	const submenuVariants = {
		hidden: { opacity: 0, x: -100 },
		visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: "easeOut" } },
	};

	return (
		<motion.div
			animate="visible"
			className="w-auto h-screen bg-gray-200 border-l border-r border-gray-300 mr-2.5 z-1"
			exit="hidden"
			initial="hidden"
			style={{ paddingTop: submenuInfo.top }}
			variants={submenuVariants}
		>
			{submenuInfo.submenu?.map(({ name, href, id }) => (
				<Link className="block px-3" key={id} to={href}>
					<Button className="px-4 hover:bg-green-light">{name}</Button>
				</Link>
			))}
		</motion.div>
	);
};
