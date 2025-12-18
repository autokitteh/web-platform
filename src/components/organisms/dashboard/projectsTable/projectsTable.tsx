/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useEffect, useMemo, useRef, useState, KeyboardEvent, MouseEvent } from "react";

import {
	DndContext,
	DragEndEvent,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import {
	ColumnOrderState,
	ColumnSizingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";

import { columns, fixedColumns } from "./columns";
import { ColumnVisibilityMenu } from "./columnVisibilityMenu";
import { DraggableColumnHeader } from "./draggableColumnHeader";
import { namespaces } from "@constants";
import { ActivityState } from "@constants/activities.constants";
import { DeploymentStateVariant, ModalName, SessionStateType } from "@enums";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectsTableMeta } from "@interfaces/components";
import { DeploymentsService, LoggerService } from "@services";
import { DashboardProjectWithStats, Project } from "@type/models";
import { ActiveDeploymentData } from "@type/stores";
import { calculateDeploymentSessionsStats, cn } from "@utilities";
import { useNavigateWithSettings } from "@utilities/navigation";

import { useProjectActions } from "@hooks";
import {
	useModalStore,
	useProjectStore,
	useToastStore,
	useTablePreferencesStore,
	useDashboardStatisticsStore,
} from "@store";

import {
	DeleteActiveDeploymentProjectModal,
	DeleteDrainingDeploymentProjectModal,
	DeleteProjectModal,
} from "@components/organisms/modals";

const rowHeight = 38;

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { t: tDeployments } = useTranslation("deployments");
	const { t: tProjects } = useTranslation("projects");
	const { projectsList } = useProjectStore();
	const {
		projectsTableColumns,
		setColumnWidth,
		setColumnOrder: persistColumnOrder,
		setColumnVisibility: persistColumnVisibility,
	} = useTablePreferencesStore();

	const {
		setStatistics,
		setActiveDeployments,
		setSessionStatusData,
		setIsLoading: setStatsLoading,
		refreshTrigger,
	} = useDashboardStatisticsStore();

	const [projectsStats, setProjectsStats] = useState<Record<string, DashboardProjectWithStats>>({});
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [failedProjects, setFailedProjects] = useState<Set<string>>(new Set());
	const addToast = useToastStore((state) => state.addToast);
	const abortControllerRef = useRef<AbortController | null>(null);
	const { closeModal, openModal } = useModalStore();
	const navigateWithSettings = useNavigateWithSettings();
	const tableContainerRef = useRef<HTMLDivElement>(null);

	const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

	const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
		Object.entries(projectsTableColumns)
			.sort(([, a], [, b]) => a.order - b.order)
			.map(([id]) => id)
	);

	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() =>
		Object.entries(projectsTableColumns).reduce((acc, [id, config]) => {
			acc[id] = config.width;

			return acc;
		}, {} as ColumnSizingState)
	);

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
		Object.entries(projectsTableColumns).reduce((acc, [id, config]) => {
			acc[id] = config.isVisible;

			return acc;
		}, {} as VisibilityState)
	);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			const oldIndex = columnOrder.indexOf(active.id as string);
			const newIndex = columnOrder.indexOf(over.id as string);
			const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
			setColumnOrder(newOrder);
			persistColumnOrder(newOrder);
		}
	};

	const handleColumnSizingChange = useCallback(
		(updater: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => {
			setColumnSizing((old) => {
				const newSizing = typeof updater === "function" ? updater(old) : updater;
				Object.entries(newSizing).forEach(([columnId, width]) => {
					if (typeof width === "number") {
						setColumnWidth(columnId, width);
					}
				});

				return newSizing;
			});
		},
		[setColumnWidth]
	);

	const handleVisibilityChange = useCallback(
		(updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
			setColumnVisibility((old) => {
				const newVisibility = typeof updater === "function" ? updater(old) : updater;
				Object.entries(newVisibility).forEach(([columnId, isVisible]) => {
					if (typeof isVisible === "boolean" && !fixedColumns.includes(columnId)) {
						persistColumnVisibility(columnId, isVisible);
					}
				});

				return newVisibility;
			});
		},
		[persistColumnVisibility]
	);

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
		activeDeploymentData?: ActiveDeploymentData;
	}> => {
		try {
			const { data: deployments } = await DeploymentsService.list(project.id);
			let projectStatus: DeploymentStateVariant = DeploymentStateVariant.inactive;
			let deploymentId = "";
			let activeDeploymentData: ActiveDeploymentData | undefined;
			const lastDeployed = deployments?.[deployments?.length - 1]?.createdAt;
			const { sessionStats, totalDeployments } = calculateDeploymentSessionsStats(deployments || []);

			for (const deployment of deployments || []) {
				if (deployment.state === DeploymentStateVariant.active) {
					projectStatus = DeploymentStateVariant.active;
					deploymentId = deployment.deploymentId;

					activeDeploymentData = {
						deploymentId: deployment.deploymentId,
						projectName: project.name,
						projectId: project.id,
						createdAt: deployment.createdAt,
					};
				} else if (
					deployment.state === DeploymentStateVariant.draining &&
					projectStatus !== DeploymentStateVariant.active
				) {
					projectStatus = DeploymentStateVariant.draining;
				}
			}

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
				activeDeploymentData,
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
				setStatsLoading(false);
				setStatistics({
					totalProjects: 0,
					activeProjects: 0,
					totalDeployments: 0,
					activeDeployments: 0,
					sessionsByStatus: { completed: 0, running: 0, error: 0, stopped: 0, created: 0 },
				});
				setActiveDeployments([]);
				setSessionStatusData([
					{ status: ActivityState.completed, count: 0 },
					{ status: ActivityState.running, count: 0 },
					{ status: ActivityState.error, count: 0 },
					{ status: ActivityState.stopped, count: 0 },
					{ status: ActivityState.created, count: 0 },
				]);

				return;
			}

			setIsLoadingStats(true);
			setStatsLoading(true);
			setProjectsStats({});
			setFailedProjects(new Set());

			const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));

			const batchSize = 5;
			const batches: Project[][] = [];
			for (let i = 0; i < sortedProjects.length; i += batchSize) {
				batches.push(sortedProjects.slice(i, i + batchSize));
			}

			let hasShownErrorToast = false;
			const allActiveDeployments: ActiveDeploymentData[] = [];
			let totalDeploymentsCount = 0;
			let activeDeploymentsCount = 0;
			let activeProjectsCount = 0;
			const aggregatedSessions = { completed: 0, running: 0, error: 0, stopped: 0, created: 0 };

			for (const batch of batches) {
				if (signal.aborted) return;

				const batchResults = await Promise.all(batch.map(fetchProjectStats));

				if (signal.aborted) return;

				const failedInBatch: string[] = [];

				setProjectsStats((prev) => {
					const updated = { ...prev };
					batchResults.forEach(({ projectId, stats, error, activeDeploymentData }) => {
						if (stats && !error) {
							updated[projectId] = stats;
							totalDeploymentsCount += stats.totalDeployments;
							aggregatedSessions.completed += stats.completed;
							aggregatedSessions.running += stats.running;
							aggregatedSessions.error += stats.error;
							aggregatedSessions.stopped += stats.stopped;

							if (stats.status === DeploymentStateVariant.active) {
								activeProjectsCount++;
								activeDeploymentsCount++;
								if (activeDeploymentData) {
									allActiveDeployments.push(activeDeploymentData);
								}
							}
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
				setStatsLoading(false);
				setStatistics({
					totalProjects: projects.length,
					activeProjects: activeProjectsCount,
					totalDeployments: totalDeploymentsCount,
					activeDeployments: activeDeploymentsCount,
					sessionsByStatus: aggregatedSessions,
				});
				setActiveDeployments(allActiveDeployments);
				setSessionStatusData([
					{ status: ActivityState.completed, count: aggregatedSessions.completed },
					{ status: ActivityState.running, count: aggregatedSessions.running },
					{ status: ActivityState.error, count: aggregatedSessions.error },
					{ status: ActivityState.stopped, count: aggregatedSessions.stopped },
					{ status: ActivityState.created, count: aggregatedSessions.created },
				]);
			}
		},
		[addToast, t, waitForNextFrame, setStatsLoading, setStatistics, setActiveDeployments, setSessionStatusData]
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
		[addToast, deactivateDeployment, tDeployments]
	);

	useEffect(() => {
		loadProjectsData(projectsList);

		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [loadProjectsData, projectsList, refreshTrigger]);

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

	const displayDeleteModal = useCallback(
		(status: DeploymentStateVariant, deploymentId: string, projectId: string, name: string) => {
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
		},
		[openModal]
	);

	const handleOpenProjectFilteredSessions = useCallback(
		(
			event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>,
			projectId: string,
			sessionState: keyof typeof SessionStateType
		) => {
			event.stopPropagation();
			navigateWithSettings(`/${SidebarHrefMenu.projects}/${projectId}/sessions`, {
				state: { sessionState },
			});
		},
		[navigateWithSettings]
	);

	const tableMeta: ProjectsTableMeta = useMemo(
		() => ({
			isLoadingStats: (projectId: string) => Boolean(isLoadingStats && !(projectId in projectsStats)),
			hasLoadError: (projectId: string) => failedProjects.has(projectId),
			onDeactivate: handelDeactivateDeployment,
			onExport: downloadProjectExport,
			onDelete: displayDeleteModal,
			onSessionClick: handleOpenProjectFilteredSessions,
		}),
		[
			isLoadingStats,
			projectsStats,
			failedProjects,
			handelDeactivateDeployment,
			downloadProjectExport,
			displayDeleteModal,
			handleOpenProjectFilteredSessions,
		]
	);

	const table = useReactTable({
		data: projectsWithStats,
		columns,
		state: {
			sorting,
			columnOrder,
			columnSizing,
			columnVisibility,
		},
		onSortingChange: setSorting,
		onColumnOrderChange: setColumnOrder,
		onColumnSizingChange: handleColumnSizingChange,
		onColumnVisibilityChange: handleVisibilityChange,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		columnResizeMode: "onChange",
		enableColumnResizing: true,
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

	const visibleColumns = table.getVisibleLeafColumns();
	const columnIds = visibleColumns.map((col) => col.id);

	return (
		<div className="z-10 h-[30vh] select-none">
			<div className="mb-2 flex justify-end">
				<ColumnVisibilityMenu table={table} />
			</div>

			{rows.length ? (
				<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
					<div
						className="scrollbar-visible h-auto max-h-full overflow-auto rounded-t-20"
						ref={tableContainerRef}
					>
						<div className="sticky top-0 z-10 bg-gray-1050" role="rowgroup">
							{table.getHeaderGroups().map((headerGroup) => (
								<div className="flex border-none pl-4" key={headerGroup.id} role="row">
									<SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
										{headerGroup.headers.map((header) => (
											<DraggableColumnHeader header={header} key={header.id} t={t} />
										))}
									</SortableContext>
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
												className="flex h-9.5 items-center overflow-hidden"
												key={cell.id}
												role="cell"
												style={{ width: cell.column.getSize() }}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</div>
										))}
									</div>
								);
							})}
						</div>
					</div>
				</DndContext>
			) : (
				<div>{t("table.noProjectsFound")}</div>
			)}

			<DeleteDrainingDeploymentProjectModal />
			<DeleteActiveDeploymentProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
			<DeleteProjectModal isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
