import React from "react";

import { flexRender } from "@tanstack/react-table";

import { TableRowTanstackProps } from "@interfaces/components";
import { cn } from "@utilities";

export const TableRowTanstack = <TData,>({ row, className, onRowSelect }: TableRowTanstackProps<TData>) => {
	const trStyle = cn(
		"cursor-pointer border-y border-transparent hover:bg-gray-1300",
		{
			"bg-gray-1250/50 border-y border-gray-1250": row.getIsSelected(),
		},
		className
	);

	return (
		<tr className={trStyle} onClick={() => onRowSelect(row)}>
			{row.getVisibleCells().map((cell) => (
				<td
					className={cn("py-0.5 text-white first:pl-4 last:pr-4")}
					key={cell.id}
					style={{
						width: cell.column.getSize(),
					}}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>
			))}
		</tr>
	);
};
