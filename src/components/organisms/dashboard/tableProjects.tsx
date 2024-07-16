import React from "react";

import { useTranslation } from "react-i18next";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const TableProjects = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });

	return (
		<div className="mt-7">
			<div className="text-2xl font-bold text-black">{t("title")}</div>

			<Table className="mt-2.5 rounded-t-20 border border-black-300">
				<THead className="bg-white">
					<Tr className="border-none pl-6 hover:bg-transparent">
						<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.projectName")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.lastVersion")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group relative h-11 max-w-24 cursor-pointer font-normal text-gray-dark">
							<span className="absolute left-0 top-1/2 h-[80%] -translate-y-1/2 border-r border-black-300" />

							{t("table.columns.running")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group h-11 max-w-28 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.completed")} <SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group relative h-11 max-w-24 cursor-pointer font-normal text-gray-dark">
							<span className="absolute right-2 top-1/2 h-[80%] -translate-y-1/2 border-r border-black-300" />

							{t("table.columns.errors")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.lastRun")} <SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>

						<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
							{t("table.columns.deploymentTime")}

							<SortButton className="opacity-0 group-hover:opacity-100" />
						</Th>
					</Tr>
				</THead>

				<TBody className="bg-gray-black-200">
					<Tr className="group cursor-pointer border-none pl-6 text-black-text hover:bg-transparent">
						<Td className="h-16">Github-Devops</Td>

						<Td className="h-16">V-02</Td>

						<Td className="relative h-16 max-w-24">
							<span className="absolute -left-3px top-1/2 h-[80%] w-1 -translate-y-1/2 border-r border-dashed border-black-300" />
							1
						</Td>

						<Td className="h-16 max-w-28">34</Td>

						<Td className="relative h-16 max-w-24">
							5
							<span className="absolute right-2 top-1/2 h-[80%] w-1 -translate-y-1/2 border-r border-dashed border-black-300" />
						</Td>

						<Td className="h-16">04.10.23 22:10</Td>

						<Td className="h-16">04.10.23 22:11</Td>
					</Tr>
				</TBody>
			</Table>
		</div>
	);
};
