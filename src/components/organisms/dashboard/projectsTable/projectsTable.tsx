import React, { useRef } from "react";

import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";

import { columns } from "./columns";
import { ColumnVisibilityMenu } from "./columnVisibilityMenu";
import { ProjectsTableBody, ProjectsTableHeader, ProjectsTableModals } from "./components";
import { useProjectsStats, useProjectsTableColumns, useProjectsTableActions } from "./hooks";

const rowHeight = 38;

export const DashboardProjectsTable = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const tableContainerRef = useRef<HTMLDivElement>(null);

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
	} = useProjectsTableColumns();

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
		<div className="z-10 h-[26vh] select-none">
			<div className="mb-2 flex justify-end">
				<ColumnVisibilityMenu table={table} />
			</div>

			{rows.length ? (
				<div className="scrollbar-visible h-auto max-h-full overflow-auto rounded-t-20" ref={tableContainerRef}>
					<ProjectsTableHeader
						columnIds={columnIds}
						onDragEnd={handleDragEnd}
						sensors={sensors}
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
