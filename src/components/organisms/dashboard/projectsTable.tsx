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

import { Button, IconButton, IconSvg, Loader, StatusBadge, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms/modals";

import { OrStartFromTemplateImage } from "@assets/image";
import { ArrowStartTemplateIcon, ExportIcon, PlusAccordionIcon, TrashIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);
	const [isLoading, setIsLoading] = useState(false);

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
		setIsLoading(true);
		for (const project of projectsList) {
			const { data: deployments } = await DeploymentsService.list(project.id);
			let projectStatus = DeploymentStateVariant.inactive;
			const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
			const stats = deployments?.reduce(
				(acc: { sessionCounts: Record<string, number>; totalDeployments: number }, deployment) => {
					if (deployment.state === DeploymentStateVariant.active) {
						projectStatus = DeploymentStateVariant.active;
					} else if (
						deployment.state === DeploymentStateVariant.draining &&
						projectStatus !== DeploymentStateVariant.active
					) {
						projectStatus = DeploymentStateVariant.draining;
					}

					acc.totalDeployments = (acc.totalDeployments || 0) + 1;

					if (deployment.sessionStats) {
						deployment.sessionStats.forEach((session) => {
							if (!session.state) return;
							acc.sessionCounts = {
								...acc.sessionCounts,
								[session.state]:
									session.state === SessionStateType.created
										? (acc.sessionCounts?.[SessionStateType.running] || 0) + session.count
										: (acc.sessionCounts?.[session.state] || 0) + session.count,
							};
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
				running: stats?.sessionCounts?.[SessionStateType.running] || 0,
				stopped: stats?.sessionCounts?.[SessionStateType.stopped] || 0,
				completed: stats?.sessionCounts?.[SessionStateType.completed] || 0,
				error: stats?.sessionCounts?.[SessionStateType.error] || 0,
				status: projectStatus,
				lastDeployed,
			};
		}
		setProjectsStats(Object.values(projectsStats));
		setIsLoading(false);
	};

	useEffect(() => {
		loadProjectsData(projectsList);
	}, [projectsList]);

	const countStyle = (state?: SessionStateType, className?: string) =>
		cn(
			"inline-block border-0 px-1 text-sm font-medium min-w-10 max-w-12 py-2 truncate sm:max-w-12 2xl:max-w-18 3xl:max-w-24",
			{
				"text-blue-500": state === SessionStateType.running,
				"text-yellow-500": state === SessionStateType.stopped,
				"text-green-800": state === SessionStateType.completed,
				"text-red": state === SessionStateType.error,
			},
			className
		);

	const handleProjectDelete = async () => {
		deleteProject(selectedProjectForDeletion!);
	};

	const displayDeleteModal = (id: string) => {
		setSelectedProjectForDeletion(id);
		openModal(ModalName.deleteProject);
	};

	return isLoading ? (
		<Loader isCenter />
	) : (
		<div className="z-10 h-2/3 select-none pt-10">
			{sortedProjectsStats.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20 shadow-2xl">
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
								<div className="w-full text-center">
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
							<Th className="group hidden h-11 w-2/6 font-normal sm:flex">
								{t("table.columns.sessions")}
							</Th>
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
							<Th className="group h-11 w-1/3 font-normal sm:w-1/6">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody className="mr-0">
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
								<Tr className="cursor-pointer pl-4" key={id}>
									<Td
										className="w-2/3 pr-4 hover:font-bold sm:w-1/5"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
										title={name}
									>
										<div className="truncate">{name}</div>
									</Td>
									<Td
										className="hidden w-1/6 sm:flex"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<div className="m-auto max-w-16 pr-4 md:max-w-28">
											<StatusBadge deploymentStatus={status} />
										</div>
									</Td>
									<Td
										className="hidden w-1/6 sm:flex"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
										title={`${totalDeployments} ${t("table.columns.deployments")}`}
									>
										<div className="w-full pr-6 text-center">{totalDeployments}</div>
									</Td>
									<Td
										className="-ml-1 hidden w-2/6 pr-2 sm:flex"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										<div
											aria-label={t("table.sessionTypes.running")}
											className={countStyle(SessionStateType.running)}
											title={`${running} ${t("table.sessionTypes.running")}`}
										>
											{running}
										</div>
										<div
											aria-label={t("table.sessionTypes.stopped")}
											className={countStyle(SessionStateType.stopped, "justify-center")}
											title={`${stopped} ${t("table.sessionTypes.stopped")}`}
										>
											{stopped}
										</div>
										<div
											aria-label={t("table.sessionTypes.completed")}
											className={countStyle(SessionStateType.completed)}
											title={`${completed} ${t("table.sessionTypes.completed")}`}
										>
											{completed}
										</div>
										<div
											aria-label={t("table.sessionTypes.error")}
											className={countStyle(SessionStateType.error)}
											title={`${error} ${t("table.sessionTypes.error")}`}
										>
											{error}
										</div>
									</Td>

									<Td
										className="hidden w-2/6 sm:flex"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
									>
										{lastDeployed
											? moment(lastDeployed).local().format(dateTimeFormat)
											: t("never")}
									</Td>

									<Td className="w-1/3 sm:w-1/6">
										<div className="flex">
											<IconButton className="group" onClick={() => downloadProjectExport(id)}>
												<IconSvg
													className="stroke-gray-750 transition group-hover:stroke-green-200 group-active:stroke-green-800"
													size="md"
													src={ExportIcon}
												/>
											</IconButton>
											<IconButton className="group" onClick={() => displayDeleteModal(id)}>
												<IconSvg
													className="stroke-gray-750 transition group-hover:stroke-green-200 group-active:stroke-green-800"
													size="md"
													src={TrashIcon}
												/>
											</IconButton>
										</div>
									</Td>
								</Tr>
							)
						)}
					</TBody>
				</Table>
			) : (
				<div>{t("table.noProjectsFound")}</div>
			)}

			<div className="mt-10 hidden flex-col items-center justify-center sm:flex">
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
