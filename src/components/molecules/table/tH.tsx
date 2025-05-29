import React, { useId, useCallback } from "react";

import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { FilterVariantColumnTable, ThTanstackProps } from "@interfaces/components";
import { SortDirectionVariant } from "@src/enums/components";
import { SortDirection as SortDirectionType } from "@src/types/components";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { FilterTableTanstack } from "@components/molecules/table";

export const ThTanstack = <TData,>({ header, className }: ThTanstackProps<TData>) => {
	const { t } = useTranslation("table", { keyPrefix: "tableActions" });
	const { filterVariant } = (header.column.columnDef.meta || {}) as FilterVariantColumnTable;
	const resizeId = useId();

	const isLastColumn = header.column.getIsLastColumn();
	const isRowSelection = header.column.id === "rowSelection";
	const enableResize = header.column.getCanResize();
	const canSort = header.column.getCanSort();
	const isSorted = header.column.getIsSorted() as boolean;
	const sortDirection = header.column.getIsSorted() as SortDirectionType;

	const handleSort = useCallback(() => {
		if (!canSort) return;
		header.column.toggleSorting(sortDirection === SortDirectionVariant.ASC);
	}, [canSort, header.column, sortDirection]);

	const thClassName = cn(
		"group relative cursor-pointer py-0.5 pr-4 font-normal first:rounded-tl-14 first:pl-4 last:rounded-tr-14",
		{ "align-top": filterVariant },
		className
	);

	return (
		<th className={thClassName} colSpan={header.colSpan} key={header.id} onClick={handleSort}>
			<div className="flex items-center">
				{flexRender(header.column.columnDef.header, header.getContext())}
				{canSort ? (
					<SortButton
						ariaLabel={`${t("sortBy")} ${header.column.columnDef.header}`}
						className="opacity-0 group-hover:opacity-100"
						isActive={isSorted}
						sortDirection={sortDirection}
					/>
				) : null}
			</div>
			{filterVariant ? <FilterTableTanstack column={header.column} /> : null}
			{!isLastColumn && !isRowSelection && enableResize ? (
				<button
					className="absolute right-0 top-0 h-full w-px cursor-ew-resize"
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
					type="button"
				>
					<ResizeButton
						className="absolute m-0 size-full p-0 hover:bg-gray-1050"
						direction="horizontal"
						resizeId={resizeId}
					/>
				</button>
			) : null}
		</th>
	);
};
