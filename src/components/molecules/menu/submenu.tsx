import React from "react";

import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

import { useProjectStore } from "@src/store";
import { cn } from "@utilities";

import { Button } from "@components/atoms";

export const Submenu = () => {
	const submenuVariant = {
		hidden: { opacity: 0, x: -100 },
		visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" }, x: 0 },
	};

	const { projectsList } = useProjectStore();

	return (
		<motion.div
			animate="visible"
			className="scrollbar absolute left-full mr-2.5 h-screen w-auto overflow-auto border-x border-gray-500 bg-gray-250 px-2"
			exit="hidden"
			initial="hidden"
			style={{ paddingTop: 0 }}
			variants={submenuVariant}
		>
			{}
		</motion.div>
	);
};
