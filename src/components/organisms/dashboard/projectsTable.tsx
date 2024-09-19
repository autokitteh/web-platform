import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { SidebarHrefMenu } from "@src/enums/components";
import { Project } from "@type/models";

import { useSort } from "@hooks";
import { useProjectStore, useToastStore } from "@store";

import { Button, IconSvg, Spinner, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { StartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, PlusAccordionIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { createProject, projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [creatingProject, setCreatingProject] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const { items: sortedProjects, requestSort, sortConfig } = useSort<Project>(projectsList, "name");

	const handleCreateProjectClick = async () => {
		setCreatingProject(true);
		const { data, error } = await createProject(true);
		setCreatingProject(false);
		if (error) {
			addToast({
				message: (error as Error).message,
				type: "error",
			});

			return;
		}

		navigate(`/${SidebarHrefMenu.projects}/${data?.projectId}`);
	};

	return (
		<div className="z-10 mt-10 h-full select-none">
			{sortedProjects.length ? (
				<Table className="mt-2.5 max-h-96 rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-6">
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
						{sortedProjects.map(({ href, id, name }) => (
							<Tr className="group cursor-pointer border-none pl-6" key={id}>
								<Td className="group-hover:font-bold" onClick={() => navigate(href)}>
									{name}
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : null}

			<div className="mt-5 flex flex-col items-center justify-center">
				<Button
					className="gap-2.5 whitespace-nowrap rounded-full border border-gray-750 py-2.5 pl-3 pr-4 font-averta text-base font-semibold"
					disabled={creatingProject}
					onClick={handleCreateProjectClick}
					variant="filled"
				>
					<IconSvg className="fill-white" size="lg" src={!creatingProject ? PlusAccordionIcon : Spinner} />

					{t("buttons.startNewProject")}
				</Button>

				<div className="relative ml-5 mt-4">
					<StartFromTemplateImage />

					<ArrowStartTemplateIcon className="absolute -top-4 left-52" />
				</div>
			</div>
		</div>
	);
};
