import React, { useMemo } from "react";

import { motion } from "framer-motion";

import { useProjectStore } from "@src/store";

import { Frame, Loader } from "@components/atoms";
import { DashboardProjectsTable, DashboardTopbar, DashboardWelcomeCards } from "@components/organisms";
import { ProjectTemplatesSection } from "@components/organisms/dashboard/templates";

import { CatDashboardImage } from "@assets/image";

export const Dashboard = () => {
	const { isLoadingProjectsList, projectsList } = useProjectStore();

	const hasProjects = !!projectsList.length;

	const dashboardContent = useMemo(() => {
		if (isLoadingProjectsList) {
			return <Loader isCenter size="lg" />;
		} else if (!hasProjects) {
			return <DashboardWelcomeCards />;
		} else {
			return <DashboardProjectsTable />;
		}
	}, [isLoadingProjectsList, hasProjects]);

	return (
		<div className="m-4 ml-0 flex w-full overflow-hidden rounded-2xl">
			<div className="relative w-2/3">
				<Frame className="flex h-full flex-col overflow-x-clip rounded-r-none bg-gray-1100">
					<DashboardTopbar />

					{dashboardContent}
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
