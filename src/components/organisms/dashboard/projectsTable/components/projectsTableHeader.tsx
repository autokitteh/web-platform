import React from "react";

import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Table } from "@tanstack/react-table";

import { DraggableColumnHeader } from "../draggableColumnHeader";
import { DashboardProjectWithStats } from "@type/models";

interface ProjectsTableHeaderProps {
	table: Table<DashboardProjectWithStats>;
	columnIds: string[];
	sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
	onDragEnd: (event: DragEndEvent) => void;
	t: (key: string) => string;
}

export const ProjectsTableHeader = ({ table, columnIds, sensors, onDragEnd, t }: ProjectsTableHeaderProps) => {
	return (
		<DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
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
		</DndContext>
	);
};
