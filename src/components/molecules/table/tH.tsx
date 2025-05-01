import React, { useId } from "react";

import { flexRender } from "@tanstack/react-table";

import { FilterVariantColumnTable, ThTanstackProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { ResizeButton } from "@components/atoms";
import { FilterTableTanstack } from "@components/molecules/table";

export const ThTanstack = <TData,>({ header, className }: ThTanstackProps<TData>) => {
	const { filterVariant } = (header.column.columnDef.meta || {}) as FilterVariantColumnTable;
	const resizeId = useId();
	const isLastColumn = header.column.getIsLastColumn();
	const isRowSelection = header.column.id === "rowSelection";
	const enableResize = header.column.getCanResize();

	return (
		<th
			className={cn(
				"group relative py-0.5 pr-4 font-normal first:rounded-tl-14 first:pl-4 last:rounded-tr-14",
				{ "align-top": filterVariant },
				className
			)}
			colSpan={header.colSpan}
			key={header.id}
		>
			<div>
				{flexRender(header.column.columnDef.header, header.getContext())}
				{filterVariant ? <FilterTableTanstack column={header.column} /> : null}
			</div>
			{!isLastColumn && !isRowSelection && enableResize ? (
				<button
					className="absolute right-0 top-0 h-full w-0.5 cursor-ew-resize"
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
					type="button"
				>
					<ResizeButton
						className="absolute m-0 h-full w-0.5 p-0 hover:bg-gray-1050"
						direction="horizontal"
						resizeId={resizeId}
					/>
				</button>
			) : null}
		</th>
	);
};
