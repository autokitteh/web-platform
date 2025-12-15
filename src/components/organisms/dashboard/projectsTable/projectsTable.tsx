/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useMemo, useRef, useState, KeyboardEvent, MouseEvent } from "react";

import { flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";

import { columns, getColumnWidthClass, getHeaderWidthClass } from "./columns";
import { ProjectsTableMeta } from "./types";
import { namespaces } from "@constants";
import { DeploymentStateVariant, ModalName, SessionStateType } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { DeploymentsService, LoggerService } from "@services";
import { DashboardProjectWithStats, Project } from "@type/models";
import { calculateDeploymentSessionsStats, cn } from "@utilities";
import { useNavigateWithSettings } from "@utilities/navigation";

import { useProjectActions } from "@hooks";
import { useModalStore, useProjectStore, useToastStore } from "@store";

import { IconButton } from "@components/atoms";
import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";

import { SmallArrowDown } from "@assets/image";

const rowHeight = 38;

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { t: tDeployments } = useTranslation("deployments");
	const { t: tProjects } = useTranslation("projects");
	const { projectsList } = useProjectStore();
	const [projectsStats, setProjectsStats] = useState<Record<string, DashboardProjectWithStats>>({});
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [failedProjects, setFailedProjects] = useState<Set<string>>(new Set());
	const addToast = useToastStore((state) => state.addToast);
	const abortControllerRef = useRef<AbortController | null>(null);
	const { closeModal, openModal } = useModalStore();
	const navigateWithSettings = useNavigateWithSettings();
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

	const projectsWithStats = useMemo(() => {
		return projectsList.map((project) => {
			const stats = projectsStats[project.id];

			return (
				stats || {
					id: project.id,
					name: project.name,
					totalDeployments: 0,
					running: 0,
					stopped: 0,
					completed: 0,
					error: 0,
					status: DeploymentStateVariant.inactive,
					lastDeployed: undefined,
					deploymentId: "",
				}
			);
		});
	}, [projectsList, projectsStats]);

	const { deleteProject, downloadProjectExport, isDeleting, deactivateDeployment } = useProjectActions();
	const [selectedProjectForDeletion, setSelectedProjectForDeletion] = useState<{
		activeDeploymentId?: string;
		projectId?: string;
	}>({
		projectId: undefined,
		activeDeploymentId: undefined,
	});

	const waitForNextFrame = useCallback(
		() =>
			new Promise<void>((resolve) => {
				requestAnimationFrame(() => {
					setTimeout(resolve, 50);
				});
			}),
		[]
	);

	const fetchProjectStats = async (
		project: Project
	): Promise<{
		error?: boolean;
		projectId: string;
		stats: DashboardProjectWithStats | null;
	}> => {
		try {
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

			return {
				projectId: project.id,
				stats: {
					id: project.id,
					name: project.name,
					totalDeployments,
					...sessionStats,
					status: projectStatus,
					lastDeployed,
					deploymentId,
				},
			};
		} catch {
			return {
				projectId: project.id,
				stats: null,
				error: true,
			};
		}
	};

	const loadProjectsData = useCallback(
		async (projects: Project[]) => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			abortControllerRef.current = new AbortController();
			const { signal } = abortControllerRef.current;

			if (!projects.length) {
				setProjectsStats({});
				setFailedProjects(new Set());
				setIsLoadingStats(false);

				return;
			}

			setIsLoadingStats(true);
			setProjectsStats({});
			setFailedProjects(new Set());

			const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));

			const batchSize = 5;
			const batches: Project[][] = [];
			for (let i = 0; i < sortedProjects.length; i += batchSize) {
				batches.push(sortedProjects.slice(i, i + batchSize));
			}

			let hasShownErrorToast = false;

			for (const batch of batches) {
				if (signal.aborted) return;

				const batchResults = await Promise.all(batch.map(fetchProjectStats));

				if (signal.aborted) return;

				const failedInBatch: string[] = [];

				setProjectsStats((prev) => {
					const updated = { ...prev };
					batchResults.forEach(({ projectId, stats, error }) => {
						if (stats && !error) {
							updated[projectId] = stats;
						} else if (error) {
							failedInBatch.push(projectId);
						}
					});

					return updated;
				});

				if (failedInBatch.length > 0) {
					setFailedProjects((prev) => {
						const updated = new Set(prev);
						failedInBatch.forEach((id) => updated.add(id));

						return updated;
					});

					if (!hasShownErrorToast) {
						hasShownErrorToast = true;
						addToast({
							message: t("errors.failedToLoadStats"),
							type: "error",
						});
					}
				}

				await waitForNextFrame();
			}

			if (!signal.aborted) {
				setIsLoadingStats(false);
			}
		},
		[addToast, t, waitForNextFrame]
	);

	const handelDeactivateDeployment = useCallback(
		async (deploymentId: string) => {
			const { error, deploymentById } = await deactivateDeployment(deploymentId);

			if (error) {
				addToast({
					message: tDeployments("deploymentDeactivatedFailed"),
					type: "error",
				});

				return;
			}

			setProjectsStats((prevStats) => {
				const updatedStats = { ...prevStats };
				for (const projectId in updatedStats) {
					if (updatedStats[projectId].deploymentId === deploymentId) {
						updatedStats[projectId] = {
							...updatedStats[projectId],
							status: deploymentById?.state || DeploymentStateVariant.unspecified,
						};
					}
				}

				return updatedStats;
			});

			addToast({
				message: tDeployments("history.actions.deploymentDeactivatedSuccessfully"),
				type: "success",
			});
			LoggerService.info(
				namespaces.ui.deployments,
				tDeployments("history.actions.deploymentDeactivatedSuccessfullyExtended", { deploymentId })
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	useEffect(() => {
		loadProjectsData(projectsList);

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadProjectsData, projectsList]);

	const handleProjectDelete = async () => {
		try {
			const { activeDeploymentId, projectId } = selectedProjectForDeletion;
			if (activeDeploymentId) {
				const { error: errorDeactivateProject } = await deactivateDeployment(activeDeploymentId);
				if (errorDeactivateProject) {
					addToast({
						message: tDeployments("deploymentDeactivatedFailed"),
						type: "error",
					});

					return;
				}
			}
			const { error: errorDeleteProject } = await deleteProject(projectId!);
			if (errorDeleteProject) {
				addToast({
					message: tProjects("errorDeletingProject"),
					type: "error",
				});

				return;
			}

			addToast({
				message: tProjects("deleteProjectSuccess"),
				type: "success",
			});
		} catch {
			addToast({
				message: t("errorDeletingProject"),
				type: "error",
			});
		} finally {
			closeModal(ModalName.deleteWithActiveDeploymentProject);
			closeModal(ModalName.deleteProject);
			setSelectedProjectForDeletion({ activeDeploymentId: undefined, projectId: undefined });
		}
	};

	const displayDeleteModal = (
		status: DeploymentStateVariant,
		deploymentId: string,
		projectId: string,
		name: string
	) => {
		if (status === DeploymentStateVariant.active) {
			setSelectedProjectForDeletion({ activeDeploymentId: deploymentId, projectId });
			openModal(ModalName.deleteWithActiveDeploymentProject);

			return;
		}
		if (status === DeploymentStateVariant.draining) {
			openModal(ModalName.deleteWithDrainingDeploymentProject);

			return;
		}

		setSelectedProjectForDeletion({ projectId });
		openModal(ModalName.deleteProject, name);
	};

	const handleOpenProjectFilteredSessions = (
		event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
		projectId: string,
		sessionState: keyof typeof SessionStateType
	) => {
		event.stopPropagation();
		navigateWithSettings(`/${SidebarHrefMenu.projects}/${projectId}/sessions`, {
			state: { sessionState },
		});
	};

	const tableMeta: ProjectsTableMeta = useMemo(
		() => ({
			isLoadingStats: (projectId: string) => Boolean(isLoadingStats && !(projectId in projectsStats)),
			hasLoadError: (projectId: string) => failedProjects.has(projectId),
			onDeactivate: handelDeactivateDeployment,
			onExport: downloadProjectExport,
			onDelete: displayDeleteModal,
			onSessionClick: handleOpenProjectFilteredSessions,
		}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[isLoadingStats, projectsStats, failedProjects]
	);

	const table = useReactTable({
		data: projectsWithStats,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		meta: tableMeta,
	});

	const { rows } = table.getRowModel();

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => tableContainerRef.current,
		estimateSize: () => rowHeight,
		overscan: 5,
	});

	const handleRowClick = (projectId: string) => {
		navigateWithSettings(`/${SidebarHrefMenu.projects}/${projectId}`);
	};

	return (
		<div className="z-10 h-[30vh] select-none pt-10">
			{rows.length ? (
				<div
					className="scrollbar-visible mt-2.5 h-auto max-h-full overflow-auto rounded-t-20"
					ref={tableContainerRef}
				>
					<div className="sticky top-0 z-10 bg-gray-1050" role="rowgroup">
						{table.getHeaderGroups().map((headerGroup) => (
							<div className="flex border-none pl-4" key={headerGroup.id} role="row">
								{headerGroup.headers.map((header) => {
									const isSortable = header.column.getCanSort();
									const isSorted = header.column.getIsSorted();

									return (
										<div
											className={cn(
												"group flex h-11 items-center font-normal text-gray-500",
												getHeaderWidthClass(header.column.id),
												isSortable && "cursor-pointer"
											)}
											key={header.id}
											onClick={isSortable ? header.column.getToggleSortingHandler() : undefined}
											role="columnheader"
										>
											{header.column.id === "totalDeployments" ? (
												<div className="w-full text-center">
													{t(`table.columns.${header.column.columnDef.header}`)}
													{isSortable ? (
														<IconButton
															className={cn(
																"ml-0 inline w-auto hover:bg-gray-1100",
																"opacity-0 group-hover:opacity-100",
																isSorted && "bg-gray-1100 opacity-100"
															)}
														>
															<SmallArrowDown
																className={cn("fill-gray", {
																	"rotate-180": isSorted === "desc",
																})}
															/>
														</IconButton>
													) : null}
												</div>
											) : (
												<>
													{header.column.id !== "actions" && header.column.id !== "sessions"
														? t(`table.columns.${header.column.columnDef.header}`)
														: null}
													{header.column.id === "sessions"
														? t(`table.columns.${header.column.columnDef.header}`)
														: null}
													{header.column.id === "actions"
														? t(`table.columns.${header.column.columnDef.header}`)
														: null}
													{isSortable ? (
														<IconButton
															className={cn(
																"ml-2 inline w-auto hover:bg-gray-1100",
																"opacity-0 group-hover:opacity-100",
																isSorted && "bg-gray-1100 opacity-100"
															)}
														>
															<SmallArrowDown
																className={cn("fill-gray", {
																	"rotate-180": isSorted === "desc",
																})}
															/>
														</IconButton>
													) : null}
												</>
											)}
										</div>
									);
								})}
							</div>
						))}
					</div>

					<div
						className="relative bg-gray-1100"
						role="rowgroup"
						style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
					>
						{rowVirtualizer.getVirtualItems().map((virtualRow) => {
							const row = rows[virtualRow.index];
							const hasError = failedProjects.has(row.original.id);

							return (
								<div
									className={cn(
										"absolute left-0 flex w-full cursor-pointer border-b-2 border-gray-1050 pl-4 transition hover:bg-black",
										hasError && "border-l-2 border-l-red-500/50 bg-red-950/20"
									)}
									data-testid={`project-row-${row.original.name}`}
									key={row.id}
									onClick={() => handleRowClick(row.original.id)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleRowClick(row.original.id);
										}
									}}
									role="row"
									style={{
										height: `${virtualRow.size}px`,
										transform: `translateY(${virtualRow.start}px)`,
									}}
									tabIndex={0}
								>
									{row.getVisibleCells().map((cell) => (
										<div
											className={cn(
												"flex h-9.5 items-center overflow-hidden",
												getColumnWidthClass(cell.column.id)
											)}
											key={cell.id}
											role="cell"
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</div>
									))}
								</div>
							);
						})}
					</div>
				</div>
			) : (
				<div>{t("table.noProjectsFound")}</div>
			)}

			<DeleteDrainingDeploymentProjectModal />
			<DeleteActiveDeploymentProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
