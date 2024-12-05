import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentsService } from "@services/deployments.service";
import { SessionStateType } from "@src/enums";
import { ModalName, SidebarHrefMenu } from "@src/enums/components";
import { cn } from "@src/utilities";
import { DashboardProjectWithStats, Project } from "@type/models";

import { useProjectCreationAndExport, useSort } from "@hooks";
import { useModalStore, useProjectStore } from "@store";

import { Button, IconButton, IconSvg, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";

import { OrStartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, DownloadIcon, PlusAccordionIcon, TrashIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);

	const {
		items: sortedProjectsStats,
		requestSort,
		sortConfig,
	} = useSort<DashboardProjectWithStats>(projectsStats, "name");

	const { openModal } = useModalStore();
	const { downloadProjectExport } = useProjectCreationAndExport();

	const loadProjectsData = async (projectsList: Project[]) => {
		const projectsStats = {} as Record<string, DashboardProjectWithStats>;
		for (const project of projectsList) {
			const { data: deployments } = await DeploymentsService.list(project.id);

			const stats = deployments?.reduce(
				(acc: { sessionCounts: Record<string, number>; totalDeployments: number }, deployment) => {
					acc.totalDeployments = (acc.totalDeployments || 0) + 1;

					if (deployment.sessionStats) {
						deployment.sessionStats.forEach((session) => {
							if (session.state) {
								acc.sessionCounts = {
									...acc.sessionCounts,
									[session.state]: (acc.sessionCounts?.[session.state] || 0) + session.count,
								};
							}
						});
					}

					return acc;
				},
				{ totalDeployments: 0, sessionCounts: {} }
			);

			projectsStats[project.id] = {
				id: project.id,
				name: project.name,
				totalDeployments: stats?.totalDeployments || 0,
				running: stats?.sessionCounts?.["running"] || 0,
				stopped: stats?.sessionCounts?.["stopeed"] || 0,
				completed: stats?.sessionCounts?.["completed"] || 0,
				error: stats?.sessionCounts?.["error"] || 0,
			};
		}

		setProjectsStats(Object.values(projectsStats));
	};

	useEffect(() => {
		loadProjectsData(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

	const countStyle = (state?: SessionStateType) =>
		cn("2xl:w-22 inline-block w-1/4 text-center border-0 p-0 text-sm font-medium", {
			"text-blue-500": state === SessionStateType.running,
			"text-yellow-500": state === SessionStateType.stopped,
			"text-green-800": state === SessionStateType.completed,
			"text-red": state === SessionStateType.error,
		});

	return (
		<div className="z-10 h-2/3 select-none pt-10">
			{sortedProjectsStats.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-4">
							<Th
								className="group h-11 w-1/5 cursor-pointer font-normal"
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
								className="group h-11 w-1/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("totalDeployments")}
							>
								{t("table.columns.totalDeployments")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"totalDeployments" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th
								className="group h-11 w-1/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("running")}
							>
								{t("table.columns.running")}

								<SortButton
									className="w-1/6 opacity-0 group-hover:opacity-100"
									isActive={"running" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th
								className="group h-11 w-1/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("stopped")}
							>
								{t("table.columns.stopped")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"stopped" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th
								className="group h-11 w-1/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("completed")}
							>
								{t("table.columns.completed")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"completed" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th
								className="group h-11 w-1/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("error")}
							>
								{t("table.columns.errored")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"error" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="group h-11 w-1/6 cursor-pointer justify-center font-normal">
								{t("table.columns.actions")}
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjectsStats.map(
							({ completed, error, id, name, running, stopped, totalDeployments }) => (
								<Tr className="group cursor-pointer pl-4" key={id}>
									<Td
										className="w-1/5 group-hover:font-bold"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{name}
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{totalDeployments}
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<span className={countStyle(SessionStateType.running)}>{running}</span>
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<span className={countStyle(SessionStateType.stopped)}>{stopped}</span>
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<span className={countStyle(SessionStateType.completed)}>{completed}</span>
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<span className={countStyle(SessionStateType.error)}>{error}</span>
									</Td>
									<Td
										className="w-1/6 group-hover:font-bold"
										innerDivClassName="justify-center"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<IconButton onClick={() => downloadProjectExport(id)}>
											<IconSvg
												className="fill-white transition hover:fill-green-200 active:fill-green-800"
												size="md"
												src={DownloadIcon}
											/>
										</IconButton>
										<IconButton onClick={() => downloadProjectExport(id)}>
											<IconSvg
												className="ml-4 stroke-white transition hover:stroke-green-200 active:stroke-green-800"
												size="md"
												src={TrashIcon}
											/>
										</IconButton>
									</Td>
								</Tr>
							)
						)}
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
