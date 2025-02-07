import React, { KeyboardEvent, MouseEvent, useCallback, useEffect, useState } from "react";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services";
import { DeploymentsService } from "@services/deployments.service";
import { dateTimeFormat, namespaces } from "@src/constants";
import { DeploymentStateVariant, SessionStateType } from "@src/enums";
import { ModalName, SidebarHrefMenu } from "@src/enums/components";
import { calculateDeploymentSessionsStats, cn, getSessionStateColor } from "@src/utilities";
import { DashboardProjectWithStats, Project } from "@type/models";

import { useProjectActions, useSort } from "@hooks";
import { useModalStore, useProjectStore, useToastStore } from "@store";

import { IconButton, IconSvg, Loader, StatusBadge, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteProjectModal } from "@components/organisms/modals";

import { ActionStoppedIcon, ExportIcon, TrashIcon } from "@assets/image/icons";

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { t: tDeployments } = useTranslation("deployments", { keyPrefix: "history" });
	const { projectsList } = useProjectStore();
	const navigate = useNavigate();
	const [projectsStats, setProjectsStats] = useState<DashboardProjectWithStats[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

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
			let deploymentId = "";
			const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
			const { sessionStats, totalDeployments } = calculateDeploymentSessionsStats(deployments || []);

			deployments?.forEach((deployment) => {
				if (deployment.state === DeploymentStateVariant.active) {
					projectStatus = DeploymentStateVariant.active;
					deploymentId = deployment.deploymentId;
				} else if (
					deployment.state === DeploymentStateVariant.draining &&
					projectStatus !== DeploymentStateVariant.active
				) {
					projectStatus = DeploymentStateVariant.draining;
				}
			});

			projectsStats[project.id] = {
				id: project.id,
				name: project.name,
				totalDeployments,
				...sessionStats,
				status: projectStatus,
				lastDeployed,
				deploymentId,
			};
		}
		setProjectsStats(Object.values(projectsStats));
		setIsLoading(false);
	};

	const deactivateDeployment = useCallback(
		async (deploymentId: string) => {
			const { error } = await DeploymentsService.deactivate(deploymentId);

			if (error) {
				addToast({
					message: (error as Error).message,
					type: "error",
				});

				return;
			}

			addToast({
				message: tDeployments("actions.deploymentDeactivatedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.ui.deployments,
				tDeployments("actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId })
			);

			await loadProjectsData(projectsList);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	useEffect(() => {
		loadProjectsData(projectsList);
	}, [projectsList]);

	const countStyle = (state?: SessionStateType, className?: string) =>
		cn(
			"border-0 text-sm font-medium max-w-12 py-2 px-2.5 sm:max-w-12 2xl:max-w-18 3xl:max-w-16",
			"hover:bg-gray-1100 rounded-3xl inline-flex min-w-12 h-7 items-center truncate",
			getSessionStateColor(state),
			className
		);

	const handleProjectDelete = async () => {
		deleteProject(selectedProjectForDeletion!);
	};

	const displayDeleteModal = (id: string) => {
		setSelectedProjectForDeletion(id);
		openModal(ModalName.deleteProject);
	};

	const handleOpenProjectFilteredSessions = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		id: string,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		const stateFilter = sessionState ? `?sessionState=${sessionState}` : "";
		navigate(`/${SidebarHrefMenu.projects}/${id}/sessions${stateFilter}`);
	};

	return isLoading ? (
		<Loader isCenter />
	) : (
		<div className="z-10 h-1/2 select-none pt-10 md:h-2/3 xl:h-3/4 3xl:h-4/5">
			{sortedProjectsStats.length ? (
				<Table className="mt-2.5 h-auto max-h-full rounded-t-20">
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
							<Th className="group h-11 w-1/3 justify-start font-normal sm:w-1/6">
								{t("table.columns.actions")}
							</Th>
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
								deploymentId,
							}) => (
								<Tr className="cursor-pointer pl-4 hover:bg-black" key={id}>
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
										<div className="max-w-16 pr-4 md:max-w-28">
											<StatusBadge deploymentStatus={status} />
										</div>
									</Td>
									<Td
										className="hidden w-1/6 sm:flex"
										onClick={() => navigate(`/${SidebarHrefMenu.projects}/${id}`)}
										title={`${totalDeployments} ${t("table.columns.totalDeployments")}`}
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
											onClick={(event) =>
												handleOpenProjectFilteredSessions(event, id, SessionStateType.running)
											}
											onKeyDown={(event) => {
												handleOpenProjectFilteredSessions(event, id, SessionStateType.running);
											}}
											role="button"
											tabIndex={0}
											title={`${running} ${t("table.sessionTypes.running")}`}
										>
											<div className="w-full truncate text-center">{running}</div>
										</div>
										<div
											aria-label={t("table.sessionTypes.stopped")}
											className={countStyle(SessionStateType.stopped)}
											onClick={(event) =>
												handleOpenProjectFilteredSessions(event, id, SessionStateType.stopped)
											}
											onKeyDown={(event) =>
												handleOpenProjectFilteredSessions(event, id, SessionStateType.stopped)
											}
											role="button"
											tabIndex={0}
											title={`${stopped} ${t("table.sessionTypes.stopped")}`}
										>
											<div className="w-full truncate text-center">{stopped}</div>
										</div>
										<div
											aria-label={t("table.sessionTypes.completed")}
											className={countStyle(SessionStateType.completed)}
											onClick={(event) => {
												handleOpenProjectFilteredSessions(
													event,
													id,
													SessionStateType.completed
												);
											}}
											onKeyDown={(event) => {
												handleOpenProjectFilteredSessions(
													event,
													id,
													SessionStateType.completed
												);
											}}
											role="button"
											tabIndex={0}
											title={`${completed} ${t("table.sessionTypes.completed")}`}
										>
											<div className="w-full truncate text-center">{completed}</div>
										</div>
										<div
											aria-label={t("table.sessionTypes.error")}
											className={countStyle(SessionStateType.error)}
											onClick={(event) => {
												handleOpenProjectFilteredSessions(event, id, SessionStateType.error);
											}}
											onKeyDown={(event) => {
												handleOpenProjectFilteredSessions(event, id, SessionStateType.error);
											}}
											role="button"
											tabIndex={0}
											title={`${error} ${t("table.sessionTypes.error")}`}
										>
											<div className="w-full truncate text-center"> {error}</div>
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
										<div className="flex justify-start">
											{status === DeploymentStateVariant.active ? (
												<IconButton
													className="size-8 p-1"
													disabled={status !== DeploymentStateVariant.active}
													onClick={() => deactivateDeployment(deploymentId)}
												>
													<ActionStoppedIcon className="size-4 transition hover:fill-white" />
												</IconButton>
											) : null}

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

			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
