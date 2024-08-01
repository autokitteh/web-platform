import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Project } from "@type/models";

import { useSort } from "@hooks";
import { useProjectStore } from "@store";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const ProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();

	const { items: sortedProjects, requestSort, sortConfig } = useSort<Project>(projectsList);

	return (
		<div className="relative mb-3 mt-7">
			<div className="text-2xl font-bold text-black">{t("title")}</div>

			{sortedProjects.length ? (
				<Table className="mt-2.5 max-h-96 rounded-t-20" variant="light">
					<THead>
						<Tr className="border-none pl-6">
							<Th className="group h-11 cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.projectName")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
									variant="light"
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjects.map(({ href, id, name }) => (
							<Tr className="group cursor-pointer border-none pl-6" key={id}>
								<Td className="group-hover:font-bold" onClick={() => navigate(href)}>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-center text-xl font-semibold text-black">{t("noProjects")}</div>
			)}
		</div>
	);
};
