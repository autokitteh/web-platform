import React, { useRef } from "react";

import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { FiDownload } from "react-icons/fi";

import { columns } from "./columns";
import { ColumnVisibilityMenu } from "./columnVisibilityMenu";
import { ProjectsTableBody, ProjectsTableHeader, ProjectsTableModals } from "./components";
import { useProjectsStats, useProjectsTableColumns, useProjectsTableActions } from "./hooks";
import { useProjectActions } from "@src/hooks";
import { useProjectStore } from "@src/store";

import { TableSkeleton, IconButton } from "@components/atoms";

import { PlusIcon } from "@assets/image/icons";

const rowHeight = 38;

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const { triggerFileInput } = useProjectActions();
	const { loadingImportFile } = useProjectStore();

	const { projectsStats, isLoadingStats, failedProjects, updateProjectStatus, projectsWithStats } =
		useProjectsStats();

	const {
		sorting,
		setSorting,
		columnOrder,
		setColumnOrder,
		columnSizing,
		columnVisibility,
		handleDragEnd,
		handleColumnSizingChange,
		handleVisibilityChange,
		sensors,
	} = useProjectsTableColumns({ containerRef: tableContainerRef });

	const { handleProjectDelete, handleRowClick, tableMeta, isDeleting } = useProjectsTableActions({
		projectsStats,
		isLoadingStats,
		failedProjects,
		updateProjectStatus,
	});

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

	const visibleColumns = table.getVisibleLeafColumns();
	const columnIds = visibleColumns.map((col) => col.id);

	return (
		<div className="z-10 flex h-full select-none flex-col overflow-hidden">
			<div className="sticky top-0 z-20 flex items-center justify-between bg-gray-1100 pb-2">
				<div className="flex flex-1 items-center gap-x-2">
					<h2 className="font-fira-sans text-xs font-medium uppercase tracking-widest text-gray-500">
						Projects
					</h2>
					<div className="h-px flex-1 bg-gradient-to-r from-gray-1050 to-transparent" />
				</div>
				<div className="flex items-center gap-x-0">
					<ColumnVisibilityMenu table={table} />
					<IconButton
						ariaLabel={t("buttons.import")}
						className="group mt-0.5 h-full rotate-180 gap-2 whitespace-nowrap hover:bg-gray-1050 active:bg-black"
						disabled={loadingImportFile}
						onClick={triggerFileInput}
						title={t("buttons.import")}
						variant="light"
					>
						<FiDownload className="size-4 transition group-hover:stroke-green-800" />
					</IconButton>
					<IconButton ariaLabel="Create new project" className="group" href="/welcome">
						<PlusIcon className="size-4 fill-white transition group-hover:fill-green-800" />
					</IconButton>
				</div>
			</div>

			{isLoadingStats && rows.length === 0 ? (
				<TableSkeleton rows={5} />
			) : rows.length ? (
				<div
					className="flex-1 overflow-auto rounded-t-20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
					data-testid="projects-table-scroll-container"
					ref={tableContainerRef}
				>
					<ProjectsTableHeader
						columnIds={columnIds}
						onDragEnd={handleDragEnd}
						sensors={sensors}
						stickyTop={0}
						t={t}
						table={table}
					/>
					<ProjectsTableBody
						failedProjects={failedProjects}
						onRowClick={handleRowClick}
						rowVirtualizer={rowVirtualizer}
						rows={rows}
					/>
				</div>
			) : (
				<div>{t("table.noProjectsFound")}</div>
			)}

			<ProjectsTableModals isDeleting={isDeleting} onDelete={handleProjectDelete} />
		</div>
	);
};
