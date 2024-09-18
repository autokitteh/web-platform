import React from "react";

import { motion } from "framer-motion";

import { Frame } from "@components/atoms";
import { DashboardTopbar, WelcomeCards } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboardImage } from "@assets/image";

export const Dashboard = () => {
	return (
		<div className="m-4 ml-0 flex w-full overflow-hidden rounded-2xl">
			<div className="relative w-2/3">
				<Frame className="flex h-full flex-col overflow-x-clip rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					<WelcomeCards />
				</Frame>

				<motion.div
					animate={{ y: 0, x: 0 }}
					className="absolute -bottom-6 -right-5"
					initial={{ y: 150, x: 100 }}
					transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
				>
					<CatDashboardImage />
				</motion.div>
			</div>

			<ProjectTemplatesSection />
		</div>
	);
};
