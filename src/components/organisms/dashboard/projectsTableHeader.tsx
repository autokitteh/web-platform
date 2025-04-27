import React from "react";

import { useTranslation } from "react-i18next";

import { SortConfig } from "@type";
import { DashboardProjectWithStats } from "@type/models";

import { Th, THead, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const DashboardProjectsTableHeader = ({
	requestSort,
	sortConfig,
}: {
	requestSort: (key: keyof DashboardProjectWithStats) => void;
	sortConfig: SortConfig<DashboardProjectWithStats>;
}) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });

	return (
		<THead className="mr-0">
			<Tr className="border-none pl-4">
				<Th
					className="group h-11 w-2/3 cursor-pointer font-normal sm:w-1/5"
					onClick={() => requestSort("name")}
				>
					{t("table.columns.projectName")}

					<SortButton
						className="opacity-0 group-hover:opacity-100"
						isActive={"name" === sortConfig.key}
						sortDirection={sortConfig.direction}
					/>
				</Th>
				<Th
					className="group hidden h-11 w-1/6 cursor-pointer font-normal sm:flex"
					onClick={() => requestSort("status")}
				>
					<div className="w-full">
						{t("table.columns.status")}

						<SortButton
							className="opacity-0 group-hover:opacity-100"
							isActive={"status" === sortConfig.key}
							sortDirection={sortConfig.direction}
						/>
					</div>
				</Th>
				<Th
					className="group hidden h-11 w-1/6 cursor-pointer font-normal sm:flex"
					onClick={() => requestSort("totalDeployments")}
				>
					<div className="w-full text-center">
						{t("table.columns.totalDeployments")}

						<SortButton
							className="ml-0 opacity-0 group-hover:opacity-100"
							isActive={"totalDeployments" === sortConfig.key}
							sortDirection={sortConfig.direction}
						/>
					</div>
				</Th>
				<Th className="group hidden h-11 w-2/6 font-normal sm:flex">{t("table.columns.sessions")}</Th>
				<Th
					className="group hidden h-11 w-2/6 cursor-pointer font-normal sm:flex"
					onClick={() => requestSort("lastDeployed")}
				>
					{t("table.columns.lastDeployed")}

					<SortButton
						className="opacity-0 group-hover:opacity-100"
						isActive={"lastDeployed" === sortConfig.key}
						sortDirection={sortConfig.direction}
					/>
				</Th>
				<Th className="group h-11 w-1/3 justify-end pr-4 font-normal sm:w-1/6">{t("table.columns.actions")}</Th>
			</Tr>
		</THead>
	);
};
