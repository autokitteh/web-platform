import React from "react";

import { flexRender, Row } from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";

import { DashboardProjectWithStats } from "@type/models";
import { cn } from "@utilities";

interface ProjectsTableBodyProps {
	rows: Row<DashboardProjectWithStats>[];
	rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
	failedProjects: Set<string>;
	onRowClick: (projectId: string) => void;
}

export const ProjectsTableBody = ({ rows, rowVirtualizer, failedProjects, onRowClick }: ProjectsTableBodyProps) => {
	return (
		<div className="relative bg-gray-1100" role="rowgroup" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
						onClick={() => onRowClick(row.original.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								onRowClick(row.original.id);
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
	);
};
