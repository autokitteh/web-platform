import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName, SidebarHrefMenu } from "@src/enums/components";
import { Project } from "@type/models";

import { useSort } from "@hooks";
import { useModalStore, useProjectStore } from "@store";

import { Button, IconSvg, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { OrStartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, PlusAccordionIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();

	const { items: sortedProjects, requestSort, sortConfig } = useSort<Project>(projectsList, "name");

	const { openModal } = useModalStore();

	return (
		<div className="z-10 h-2/3 select-none pt-10">
			{sortedProjects.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-4">
							<Th className="group h-11 cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.projectName")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjects.map(({ id, name }) => (
							<Tr className="group cursor-pointer pl-4" key={id}>
								<Td
									className="group-hover:font-bold"
									onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
								>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}

			<div className="mt-10 flex flex-col items-center justify-center">
				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					onClick={() => openModal(ModalName.newProject)}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={PlusAccordionIcon} />

					{t("buttons.startNewProject")}
				</Button>

				<div className="relative ml-5 mt-4">
					<OrStartFromTemplateImage />

					<ArrowStartTemplateIcon className="absolute -right-10 bottom-4" />
				</div>
			</div>
		</div>
	);
};
