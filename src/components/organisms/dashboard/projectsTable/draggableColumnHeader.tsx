import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Header } from "@tanstack/react-table";

import { DashboardProjectWithStats } from "@type/models";
import { cn } from "@utilities";

import { IconButton } from "@components/atoms";

import { SmallArrowDown } from "@assets/image";

interface DraggableColumnHeaderProps {
	header: Header<DashboardProjectWithStats, unknown>;
	t: (key: string) => string;
}

export const DraggableColumnHeader = ({ header, t }: DraggableColumnHeaderProps) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: header.column.id,
	});

	const isSortable = header.column.getCanSort();
	const isSorted = header.column.getIsSorted();
	const canResize = header.column.getCanResize();

	const style: React.CSSProperties = {
		transform: CSS.Translate.toString(transform),
		transition,
		width: header.getSize(),
		opacity: isDragging ? 0.8 : 1,
		position: "relative",
		zIndex: isDragging ? 1 : 0,
	};

	const handleSortClick = (e: React.MouseEvent | React.KeyboardEvent) => {
		if (isSortable) {
			header.column.getToggleSortingHandler()?.(e);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleSortClick(e);
		}
	};

	return (
		<div
			className={cn(
				"group flex h-11 select-none items-center font-normal text-gray-500",
				isSortable && "cursor-pointer",
				isDragging && "rounded bg-gray-900"
			)}
			ref={setNodeRef}
			role="columnheader"
			style={style}
		>
			<div
				{...attributes}
				{...listeners}
				className="flex flex-1 cursor-grab items-center active:cursor-grabbing"
				onClick={handleSortClick}
				onKeyDown={handleKeyDown}
				role="button"
				tabIndex={0}
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
						{header.column.id === "sessions" ? t(`table.columns.${header.column.columnDef.header}`) : null}
						{header.column.id === "actions" ? t(`table.columns.${header.column.columnDef.header}`) : null}
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

			{canResize ? (
				// eslint-disable-next-line jsx-a11y/no-static-element-interactions
				<div
					className={cn(
						"absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none",
						"bg-transparent transition-colors hover:bg-green-200",
						header.column.getIsResizing() && "bg-green-500"
					)}
					onDoubleClick={() => header.column.resetSize()}
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
				/>
			) : null}
		</div>
	);
};
