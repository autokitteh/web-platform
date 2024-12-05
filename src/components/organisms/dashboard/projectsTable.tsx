import React, { useEffect, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DeploymentsService } from "@services/deployments.service";
import { dateTimeFormat } from "@src/constants";
import { DeploymentStateVariant, SessionStateType } from "@src/enums";
import { ModalName, SidebarHrefMenu } from "@src/enums/components";
import { cn } from "@src/utilities";
import { DashboardProjectWithStats, Project } from "@type/models";

import { useProjectActions, useSort } from "@hooks";
import { useModalStore, useProjectStore } from "@store";

import { Button, DeploymentStatusBadge, IconButton, IconSvg, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms/modals";

import { OrStartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, DownloadIcon, PlusAccordionIcon, TrashIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);

	const {
		items: sortedProjectsStats,
		requestSort,
		sortConfig,
	} = useSort<DashboardProjectWithStats>(projectsStats, "name");

	const { openModal } = useModalStore();
	const { deleteProject, downloadProjectExport, isDeleting } = useProjectActions();
	const [selectedProjectForDeletion, setSelectedProjectForDeletion] = useState<string>();

	const loadProjectsData = async (projectsList: Project[]) => {
		const projectsStats = {} as Record<string, DashboardProjectWithStats>;
		for (const project of projectsList) {
			const { data: deployments } = await DeploymentsService.list(project.id);
			let projectStatus = DeploymentStateVariant.inactive;
			const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
			const stats = deployments?.reduce(
				(acc: { sessionCounts: Record<string, number>; totalDeployments: number }, deployment) => {
					if (
						deployment.state === DeploymentStateVariant.draining ||
						deployment.state === DeploymentStateVariant.active
					) {
						projectStatus = deployment.state;
					}

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
				status: projectStatus,
				lastDeployed,
			};
		}

		setProjectsStats(Object.values(projectsStats));
	};

	useEffect(() => {
		loadProjectsData(projectsList);
	}, [projectsList]);

	const countStyle = (state?: SessionStateType) =>
		cn("inline-block border-0 p-0 text-sm font-medium", {
			"text-blue-500": state === SessionStateType.running,
			"text-yellow-500": state === SessionStateType.stopped,
			"text-green-800": state === SessionStateType.completed,
			"text-red": state === SessionStateType.error,
		});

	const handleProjectDelete = async () => {
		deleteProject(selectedProjectForDeletion!);
	};

	const displayDeleteModal = (id: string) => {
		setSelectedProjectForDeletion(id);
		openModal(ModalName.deleteProject);
	};

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
								{t("table.columns.status")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"totalDeployments" === sortConfig.key}
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
							<Th className="group ml-6 h-11 w-3/6 font-normal">{t("table.columns.sessions")}</Th>
							<Th
								className="group h-11 w-2/6 cursor-pointer justify-center font-normal"
								onClick={() => requestSort("lastDeployed")}
							>
								{t("table.columns.lastDeployed")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"lastDeployed" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="group h-11 w-1/6 justify-center font-normal">
								{t("table.columns.actions")}
							</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedProjectsStats.map(
							({
								completed,
								error,
								id,
								lastDeployed,
								name,
								running,
								status,
								stopped,
								totalDeployments,
							}) => (
								<Tr className="group cursor-pointer pl-4" key={id}>
									<Td
										className="w-1/5 group-hover:font-bold"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{name}
									</Td>
									<Td
										className="w-1/6"
										innerDivClassName="justify-center pr-7"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<DeploymentStatusBadge deploymentStatus={status} />
									</Td>
									<Td
										className="w-1/6"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{totalDeployments}
									</Td>
									<Td
										className="ml-8 flex w-3/6"
										innerDivClassName="gap-16"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<div className={countStyle(SessionStateType.running)}>{running}</div>
										<div className={countStyle(SessionStateType.stopped)}>{stopped}</div>
										<div className={countStyle(SessionStateType.completed)}>{completed}</div>
										<div className={countStyle(SessionStateType.error)}>{error}</div>
									</Td>

									<Td
										className="w-2/6"
										innerDivClassName="justify-center pr-8"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{lastDeployed
											? moment(lastDeployed).local().format(dateTimeFormat)
											: t("never")}
									</Td>

									<Td className="w-1/6" innerDivClassName="justify-center">
										<IconButton onClick={() => downloadProjectExport(id)}>
											<IconSvg
												className="fill-white transition hover:fill-green-200 active:fill-green-800"
												size="md"
												src={DownloadIcon}
											/>
										</IconButton>
										<IconButton onClick={() => displayDeleteModal(id)}>
											<IconSvg
												className="stroke-white transition hover:stroke-green-200 active:stroke-green-800"
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
			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
