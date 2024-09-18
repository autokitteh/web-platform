import React from "react";

import { motion } from "framer-motion";

import { Frame } from "@components/atoms";
import { DashboardTopbar, ProjectsTable } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboard } from "@assets/image";

export const Dashboard = () => {
	return (
		<div className="m-4 ml-0 w-full overflow-hidden rounded-2xl">
			<div className="flex h-full">
				<Frame className="relative flex w-2/3 flex-col overflow-hidden rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					<ProjectsTable />

					<motion.div
						animate={{ y: 0, x: 0 }}
						className="absolute -bottom-6 -right-5"
						initial={{ y: 150, x: 100 }}
						transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
					>
						<CatDashboard />
					</motion.div>
				</Frame>

				<ProjectTemplatesSection />
			</div>
		</div>
	);
};
