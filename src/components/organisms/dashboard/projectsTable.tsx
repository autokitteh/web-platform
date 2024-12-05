import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentSessionStats } from "../deployments";
import { DeploymentsService } from "@services/deployments.service";
import { SessionStateType } from "@src/enums";
import { ModalName, SidebarHrefMenu } from "@src/enums/components";
import { DashboardProjectWithStats, Project } from "@type/models";

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);

	const {
		items: sortedProjectsStats,
		requestSort,
		sortConfig,
	} = useSort<DashboardProjectWithStats>(projectsStats, "name");

	const { openModal } = useModalStore();

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

			const allStates = Object.values(SessionStateType);
			const completeSessionStats = allStates.map((state) => ({
				count: stats?.sessionCounts?.[state] || 0,
				state,
			}));
			const sessionsStatsByState: Record<string, number> = {} as Record<SessionStateType, number>;
			allStates.forEach((state) => {
				sessionsStatsByState[SessionStateType[state]] = stats?.sessionCounts?.[state] || 0;
			});

			projectsStats[project.id] = {
				id: project.id,
				name: project.name,
				totalDeployments: stats?.totalDeployments || 0,
				sessionsStats: completeSessionStats,
				running: sessionsStatsByState.running || 0,
				stopped: sessionsStatsByState.stopped || 0,
				completed: sessionsStatsByState.completed || 0,
				error: sessionsStatsByState.error || 0,
			};
		}

		setProjectsStats(Object.values(projectsStats));
	};

	useEffect(() => {
		console.log("projectsStats", sortedProjectsStats);
	}, [sortedProjectsStats]);

	useEffect(() => {
		loadProjectsData(projectsList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectsList]);

	return (
		<div className="z-10 h-2/3 select-none pt-10">
			{sortedProjectsStats.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20 shadow-2xl">
					<THead>
						<Tr className="border-none pl-4">
							<Th
								className="group h-11 w-1/6 cursor-pointer font-normal"
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
								className="group h-11 cursor-pointer font-normal"
								onClick={() => requestSort("running")}
							>
								{t("table.columns.running")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"running" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th
								className="group h-11 cursor-pointer font-normal"
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
								className="group h-11 cursor-pointer font-normal"
								onClick={() => requestSort("completed")}
							>
								{t("table.columns.completed")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"completed" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="group h-11 cursor-pointer font-normal" onClick={() => requestSort("error")}>
								{t("table.columns.errored")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"error" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjectsStats.map(({ id, name, sessionsStats }) => (
							<Tr className="group cursor-pointer pl-4" key={id}>
								<Td
									className="w-1/6 group-hover:font-bold"
									onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
								>
									{name}
								</Td>
								<Td
									className="w-1/2 group-hover:font-bold"
									onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
								>
									<DeploymentSessionStats className="w-1/6 pr-10" sessionStats={sessionsStats} />
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
