import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useProjectStore } from "@store";

import { TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const ProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();

	const itemData = useMemo(() => projectsList, [projectsList]);

	return (
		<div className="relative mb-3 mt-7">
			<div className="text-2xl font-bold text-black">{t("title")}</div>

			{projectsList.length ? (
				<Table className="mt-2.5 max-h-96 rounded-t-20 border border-black-300">
					<THead className="bg-white">
						<Tr className="border-none pl-6 hover:bg-transparent">
							<Th className="group h-11 cursor-pointer font-normal text-gray-dark">
								{t("table.columns.projectName")}

								<SortButton className="opacity-0 group-hover:opacity-100" />
							</Th>
						</Tr>
					</THead>

					<TBody className="bg-gray-black-200">
						{itemData.map(({ href, id, name }) => (
							<Tr
								className="group cursor-pointer border-none pl-6 text-black-text hover:bg-transparent"
								key={id}
							>
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
